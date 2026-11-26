import { api } from '@/api/api'

// Seguimiento paso a paso (backend: seguimiento_examenes.php). Las listas salen de las tablas de seguimiento:
// tipo 'reunion': exámenes de árbitros de un evento (reunión, asamblea o recuperatorio), examenes_online_seguimiento → permiso seguimiento_examenes
// tipo 'curso': exámenes online de los aspirantes del curso, examenes_online_seguimiento → permiso curso
// tipo 'practica': práctica del catálogo de los aspirantes, catalogo_practicas_seguimiento → permiso curso

const ENTIDAD = 'seguimiento_examenes'

export { CATEGORIAS_EVENTO } from '@/utils/eventos'

export const ESTADOS_INTENTO = {
  en_curso: { etiqueta: 'En curso', clase: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' },
  finalizado: { etiqueta: 'Finalizado', clase: 'bg-success-subtle text-success-emphasis border border-success-subtle' },
  abandonado: { etiqueta: 'Abandonada', clase: 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle' },
  sin_intento: { etiqueta: 'Sin intento', clase: 'bg-light text-muted border' }
}

export const EVENTOS_SEGUIMIENTO = {
  iniciar: { etiqueta: 'Abrió el examen', icono: 'bi-box-arrow-in-right', clase: 'text-primary' },
  guardar: { etiqueta: 'Cambió de pregunta', icono: 'bi-arrow-left-right', clase: 'text-secondary' },
  finalizar: { etiqueta: 'Finalizó', icono: 'bi-flag-fill', clase: 'text-success' }
}

// "Android · Chrome", "iPhone · Safari", "Windows · Edge"… a partir del user agent del navegador
export const resumirDispositivo = (agente = '') => {
  const a = String(agente || '')
  if (!a) return 'Sin datos'
  const sistema = /iPhone/i.test(a) ? 'iPhone'
    : /iPad/i.test(a) ? 'iPad'
      : /Android/i.test(a) ? 'Android'
        : /Windows/i.test(a) ? 'Windows'
          : /Mac OS X|Macintosh/i.test(a) ? 'Mac'
            : /Linux/i.test(a) ? 'Linux' : 'Otro'
  const navegador = /Edg\//i.test(a) ? 'Edge'
    : /OPR\/|Opera/i.test(a) ? 'Opera'
      : /SamsungBrowser/i.test(a) ? 'Samsung'
        : /Firefox|FxiOS/i.test(a) ? 'Firefox'
          : /Chrome|CriOS/i.test(a) ? 'Chrome'
            : /Safari/i.test(a) ? 'Safari' : 'Otro'
  return `${sistema} · ${navegador}`
}

// 125 → "2 min 05 s"
export const formatoDuracion = (segundos) => {
  if (segundos === null || segundos === undefined) return '—'
  const s = Math.max(0, Math.round(Number(segundos)))
  const min = Math.floor(s / 60)
  return min ? `${min} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`
}

// "2026-11-26 10:05:03.120" → "10:05:03"
export const horaDe = (fecha) => String(fecha || '').slice(11, 19)

// Segundos entre dos fechas del backend ("YYYY-MM-DD HH:MM:SS")
export const segundosEntre = (desde, hasta) => {
  if (!desde || !hasta) return null
  const a = new Date(String(desde).replace(' ', 'T'))
  const b = new Date(String(hasta).replace(' ', 'T'))
  return Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) ? null : Math.round((b - a) / 1000)
}

// Avisos de un intento a partir del resumen de su seguimiento
export const alertasIntento = (seguimiento = {}) => {
  const alertas = []
  if (seguimiento.sesiones > 1) alertas.push({ texto: `${seguimiento.sesiones} sesiones`, clase: 'bg-warning-subtle text-warning-emphasis', ayuda: 'Lo retomó o lo tuvo abierto en más de un lugar' })
  if (seguimiento.dispositivos > 1) alertas.push({ texto: `${seguimiento.dispositivos} dispositivos`, clase: 'bg-danger-subtle text-danger-emphasis', ayuda: 'Se usó más de un dispositivo o navegador' })
  if (seguimiento.ips > 1) alertas.push({ texto: `${seguimiento.ips} IP`, clase: 'bg-info-subtle text-info-emphasis', ayuda: 'Hubo más de una conexión (por ejemplo, wifi y datos)' })
  return alertas
}

const conRespuesta = (res, mensaje) => {
  if (!res?.ok) throw new Error(res?.message || mensaje)
  return res.payload
}

export function useSeguimientoExamenes() {
  const cargarIntentosReunion = async (anio) =>
    conRespuesta(await api.get({ entity: ENTIDAD, action: 'intentosExamenesReunion', payload: { anio } }), 'No se pudieron cargar los exámenes') || []

  const cargarIntentosCurso = async (anio) =>
    conRespuesta(await api.get({ entity: ENTIDAD, action: 'intentosExamenesCurso', payload: { anio } }), 'No se pudieron cargar los exámenes') || []

  const cargarPracticasCurso = async (anio) =>
    conRespuesta(await api.get({ entity: ENTIDAD, action: 'practicasSeguimientoCurso', payload: { anio } }), 'No se pudieron cargar las prácticas') || []

  // { estado, calificacion, aprobado, tiempoVisibleSeg, pasos: [...], revision: [...], puntaje, posible }
  const obtenerDetalle = async ({ tipo, idExamen, idPersona }) =>
    conRespuesta(await api.get({ entity: ENTIDAD, action: 'detalleSeguimientoExamen', payload: { tipo, idExamen, idPersona } }), 'No se pudo cargar el seguimiento')

  return { cargarIntentosReunion, cargarIntentosCurso, cargarPracticasCurso, obtenerDetalle }
}
