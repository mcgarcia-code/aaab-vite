// Porcentaje de asistencia del curso de árbitros: una sola regla para todas las vistas
// (Alumnos Regulares, Planilla de asistencia y Mi Rendimiento del aspirante).
import { hoyIso } from '@/composables/useCronogramaCurso'

// Asistencia mínima para clases y para encuentros de mini
export const ASISTENCIA_MINIMA = 70

const marcado = (r) => r.asistencia === 'presente' || r.asistencia === 'ausente'

// registros: [{ fecha: 'AAAA-MM-DD', asistencia: 'presente' | 'ausente' | null }]
// - clases: presentes sobre todas las clases ya dictadas (hasta hoy). Una clase dictada sin marcar cuenta como no asistida.
// - mini: presentes sobre los encuentros convocados que ya tienen presente o ausente. Los que no están marcados no cuentan.
export const porcentajeAsistencia = (registros = [], tipo = 'clases') => {
  const base = tipo === 'mini'
    ? registros.filter(marcado)
    : registros.filter(r => String(r.fecha) <= hoyIso())
  const presentes = base.filter(r => r.asistencia === 'presente').length
  const total = base.length
  const porcentaje = total ? Math.round(presentes / total * 100) : null
  return { presentes, total, porcentaje, cumple: porcentaje !== null && porcentaje >= ASISTENCIA_MINIMA }
}

// Color de la celda de un porcentaje: verde si llega al mínimo, rojo si no, sin color si todavía no hay datos
export const colorAsistencia = (porcentaje) => {
  if (porcentaje === null || porcentaje === undefined) return ''
  return porcentaje >= ASISTENCIA_MINIMA ? 'verde' : 'roja'
}
