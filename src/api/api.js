// src/api/api.js
const BASE_URL = 'https://arbitroshandball.com.ar/api/api.php'

function obtenerHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  }
  const token = sessionStorage.getItem('token_aaab')
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

async function request(metodo, datos = {}, tipoPost = 'json') {
  console.log(datos)
  const config = metodo === 'POST'
    ? (tipoPost === 'archivo' ? obtenerConfigArchivo(datos) : obtenerConfigJson(datos))
    : {
        method: metodo,
        headers: obtenerHeaders(),
      }

  if (metodo === 'GET') {
    datos.payload = JSON.stringify(datos.payload) ?? {}
    const query = new URLSearchParams(datos).toString()
    const url = query ? `${BASE_URL}?${query}` : BASE_URL
    const respuesta = await fetch(url, config)
    return respuesta.json()
  }

  const respuesta = await fetch(BASE_URL, config)
  return respuesta.json()
}

// Descarga un archivo (PDF, Excel, etc.) devuelto por el backend y dispara
// la descarga en el navegador. El backend responde el archivo directamente,
// o un JSON de error (exitScript) si algo falló: lo distinguimos por el
// content-type para no terminar bajando un archivo roto.
async function descargarArchivo(datos = {}, nombreArchivo = 'archivo') {
  const respuesta = await fetch(BASE_URL, obtenerConfigJson(datos))

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

export const api = {
  get: (params = {}) => request('GET', params),
  post: (data = {}) => request('POST', data, 'json'),
  postFile: (data = {}) => request('POST', data, 'archivo'),
  getFile: (data = {}, nombreArchivo) => descargarArchivo(data, nombreArchivo),
}
