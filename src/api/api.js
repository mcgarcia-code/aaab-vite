// src/api/api.js
import { auth } from '@/api/auth'
export const BASE_URL = import.meta.env.VITE_BASE_URL

function obtenerHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  }
  const token = auth.getToken()
  if (!token) {
    return headers
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

function esFormData(valor) {
  return typeof FormData !== 'undefined' && valor instanceof FormData
}

function obtenerConfigJson(datos = {}) {
  return {
    method: 'POST',
    headers: obtenerHeaders(),
    body: JSON.stringify(datos),
  }
}

function obtenerConfigArchivo(datos = {}) {
  if (!esFormData(datos.payload)) {
    throw new Error('api.postFile() requiere un payload de tipo FormData')
  }

  const headers = obtenerHeaders()
  delete headers['Content-Type']

  const formData = datos.payload
  formData.set('entity', datos.entity ?? '')
  formData.set('action', datos.action ?? '')

  return {
    method: 'POST',
    headers,
    body: formData,
  }
}

// Sesión vencida o token inválido: si había sesión iniciada, se cierra y se vuelve al login.
// (Si no había sesión, por ejemplo un login fallido, no se hace nada)
function manejarSesionVencida() {
  if (!auth.getToken()) return
  sessionStorage.setItem('aviso_sesion', 'vencida')
  auth.logout()
}

// Siempre devuelve un objeto { ok, payload, message }: nunca lanza por errores de red o del servidor,
// así cada pantalla puede chequear res.ok sin un try/catch obligatorio
async function request(metodo, datos = {}, tipoPost = 'json') {
  try {
    const config = metodo === 'POST'
      ? (tipoPost === 'archivo' ? obtenerConfigArchivo(datos) : obtenerConfigJson(datos))
      : {
          method: metodo,
          headers: obtenerHeaders(),
        }

    let url = BASE_URL
    if (metodo === 'GET') {
      // Se arma un objeto nuevo: no se modifica el que pasó la pantalla
      const parametros = { ...datos, payload: JSON.stringify(datos.payload ?? {}) }
      url = `${BASE_URL}?${new URLSearchParams(parametros).toString()}`
    }

    const respuesta = await fetch(url, config)

    if (respuesta.status === 401 && auth.getToken()) {
      manejarSesionVencida()
      return { ok: false, payload: null, message: 'Tu sesión venció. Volvé a ingresar.' }
    }

    let cuerpo = null
    try {
      cuerpo = await respuesta.json()
    } catch {
      return { ok: false, payload: null, message: 'El servidor respondió algo inesperado. Intentá de nuevo.' }
    }

    if (!respuesta.ok && cuerpo && typeof cuerpo === 'object') {
      return { ...cuerpo, ok: false, message: cuerpo.message || 'No se pudo completar la operación.' }
    }
    return cuerpo
  } catch (error) {
    if (error instanceof Error && error.message.includes('requiere un payload')) throw error
    console.error('Error de red:', error)
    return { ok: false, payload: null, message: 'No hay conexión con el servidor. Revisá tu internet e intentá de nuevo.' }
  }
}

// Descarga un archivo (PDF, Excel, etc.) devuelto por el backend y dispara
// la descarga en el navegador. El backend responde el archivo directamente,
// o un JSON de error (exitScript) si algo falló: lo distinguimos por el
// content-type para no terminar bajando un archivo roto.
async function descargarArchivo(datos = {}, nombreArchivo = 'archivo') {
  const respuesta = await fetch(BASE_URL, obtenerConfigJson(datos))

  if (respuesta.status === 401) {
    manejarSesionVencida()
    throw new Error('Tu sesión venció. Volvé a ingresar.')
  }

  const tipo = respuesta.headers.get('content-type') || ''
  if (!respuesta.ok || tipo.includes('application/json')) {
    let mensaje = 'No se pudo descargar el archivo'
    try {
      const error = await respuesta.json()
      mensaje = error.message || mensaje
    } catch { /* noop */ }
    throw new Error(mensaje)
  }

  const blob = await respuesta.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

// ─── Caché de catálogos ───────────────────────────────────────────────
// Para datos que muchas pantallas piden igual y cambian poco (grupos, torneos, provincias, lista de árbitros).
// - Pedidos iguales en simultáneo comparten la misma llamada.
// - Solo se guardan respuestas ok, durante `ttl` milisegundos.
// - Cualquier POST a la misma entidad (ej. editar un grupo) borra lo guardado de esa entidad.
// - Cada pantalla recibe una copia: si ordena o modifica la lista, no afecta a las demás.
const cache = new Map()
const TTL_POR_DEFECTO = 5 * 60 * 1000

function getCacheado(datos = {}, { ttl = TTL_POR_DEFECTO } = {}) {
  const clave = `${datos.entity}/${datos.action}/${JSON.stringify(datos.payload ?? {})}`
  const guardado = cache.get(clave)
  if (guardado && guardado.vence > Date.now()) {
    return guardado.promesa.then(res => structuredClone(res))
  }
  const promesa = request('GET', datos).then(res => {
    if (!res?.ok) cache.delete(clave)
    return res
  })
  cache.set(clave, { promesa, vence: Date.now() + ttl, entity: datos.entity })
  return promesa.then(res => structuredClone(res))
}

// Entidades que al guardarse cambian datos que se leen desde otra (editar un legajo cambia la lista de árbitros)
const AFECTA_TAMBIEN = { datos_personales: ['arbitros'], registro: ['arbitros'] }

function invalidarCache(entity) {
  const afectadas = entity ? [entity, ...(AFECTA_TAMBIEN[entity] || [])] : null
  for (const [clave, valor] of cache) {
    if (!afectadas || afectadas.includes(valor.entity)) cache.delete(clave)
  }
}

function postInvalidando(datos, tipo) {
  invalidarCache(datos.entity)
  return request('POST', datos, tipo)
}

// Lista que vino en la respuesta, o [] si el pedido falló o el payload no es una lista.
// Evita guardar el objeto de error ({ ok: false, payload: null }) como si fuera la lista
export const listaDe = (res) => (res?.ok !== false && Array.isArray(res?.payload) ? res.payload : [])

export const api = {
  get: (params = {}) => request('GET', params),
  getCacheado,
  invalidarCache,
  post: (data = {}) => postInvalidando(data, 'json'),
  postFile: (data = {}) => postInvalidando(data, 'archivo'),
  getFile: (data = {}, nombreArchivo) => descargarArchivo(data, nombreArchivo),
}
