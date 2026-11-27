import { api, listaDe } from '@/api/api'

// =====================================================================
// AAAB TV · "Mis eventos": sesiones de análisis guardadas para retomarlas después
// (ej. marcar en vivo hoy desde el celular y mañana cargar el video en la computadora).
//
// Dos formas con las mismas funciones; la pantalla no sabe cuál usa:
// - Con servidor (VITE_AAAB_TV_SERVIDOR=true en .env): backend aaab_tv.php. Los eventos son del
//   usuario logueado y se ven desde cualquier dispositivo.
// - Sin servidor (maqueta): se guardan en este navegador.
//
// Contrato con el backend (entity 'aaab_tv'; el dueño sale del token, nunca del payload):
//   GET  listarEventos   {}                 → [{ id, partido, fecha, modo, cantidadTags, tagsSinSincronizar, guardadoEl }]
//   GET  obtenerEvento   { id }             → evento completo (abajo)
//   POST guardarEvento   { evento }         → evento guardado (alta o modificación por id: upsert)
//   POST borrarEvento    { id }             → true
// Evento completo:
//   { id: string (lo genera el front, UUID), partido: string, fecha: 'aaaa-mm-dd', modo: 'vivo' (siempre en vivo; los eventos viejos pueden traer 'video'),
//     tags: [{ id, idBoton, nombre, color, origen: 'video'|'vivo', segundoReloj: number|null,
//              segundo: number|null, titulo, descripcion, seleccionado, publicado }],
//     reloj: { acumulado: number },          // segundos del en vivo al guardar
//     sincronizacion: number|null,           // segundo del video en el que arrancó el en vivo
//     guardadoEl: ISO 8601 (lo pone el servidor) }
// =====================================================================

export const AAAB_TV_CON_SERVIDOR = import.meta.env.VITE_AAAB_TV_SERVIDOR === 'true'

const ENTIDAD = 'aaab_tv'

// Resumen para la lista (sin los tags, que pueden ser muchos)
export const resumirEvento = (ev) => ({
  id: ev.id,
  partido: ev.partido,
  fecha: ev.fecha,
  modo: ev.modo,
  cantidadTags: ev.tags.length,
  tagsSinSincronizar: ev.tags.filter(t => t.segundo === null).length,
  guardadoEl: ev.guardadoEl
})

// ─── Con servidor ─────────────────────────────────────────────
const conServidor = {
  listar: async () => {
    const res = await api.get({ entity: ENTIDAD, action: 'listarEventos' })
    return res?.ok ? { ok: true, payload: listaDe(res) } : res
  },
  obtener: (id) => api.get({ entity: ENTIDAD, action: 'obtenerEvento', payload: { id } }),
  guardar: (evento) => api.post({ entity: ENTIDAD, action: 'guardarEvento', payload: { evento } }),
  borrar: (id) => api.post({ entity: ENTIDAD, action: 'borrarEvento', payload: { id } })
}

// ─── Sin servidor (este navegador) ────────────────────────────
const enNavegador = (clave) => {
  const leer = () => {
    try { return JSON.parse(localStorage.getItem(clave()) || '[]') } catch { return [] }
  }
  const escribir = (lista) => {
    try {
      localStorage.setItem(clave(), JSON.stringify(lista))
      return true
    } catch {
      return false
    }
  }
  const noEncontrado = { ok: false, payload: null, message: 'El evento ya no existe.' }
  return {
    listar: async () => ({ ok: true, payload: leer().map(resumirEvento) }),
    obtener: async (id) => {
      const evento = leer().find(e => e.id === id)
      return evento ? { ok: true, payload: evento } : noEncontrado
    },
    guardar: async (evento) => {
      const guardado = { ...evento, guardadoEl: new Date().toISOString() }
      const lista = [guardado, ...leer().filter(e => e.id !== evento.id)]
      return escribir(lista)
        ? { ok: true, payload: guardado }
        : { ok: false, payload: null, message: 'No hay espacio para guardar en este navegador.' }
    },
    borrar: async (id) => {
      escribir(leer().filter(e => e.id !== id))
      return { ok: true, payload: true }
    }
  }
}

// claveNavegador: función que devuelve la clave de localStorage del usuario logueado
export const crearRepositorioEventos = (claveNavegador) =>
  AAAB_TV_CON_SERVIDOR ? conServidor : enNavegador(claveNavegador)
