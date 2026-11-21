import { ref } from 'vue'
import { api } from '@/api/api'

// Práctica del catálogo de preguntas desde el panel del árbitro y el del curso (backend: catalogo_practica.php).
// Cada práctica queda guardada a nombre de quien inició sesión: árbitro (id_arbitro) o alumno del curso (id_alumno_curso), los dos salen del token.

// Misma nota de aprobación que los exámenes online (solo para pintar verde / rojo)
export const UMBRAL_APROBADO = 75
export const CANTIDADES_PREGUNTAS = [5, 10, 20, 30, 'todas']

// "Regla 17.1": regla (codigo) y número de pregunta dentro de la regla (subcodigo),
// para que se pueda ubicar la pregunta en el catálogo. Sin subcodigo queda "Regla 17"
export const textoNumeroPregunta = (pregunta) => {
  if (!pregunta) return ''
  const { codigo, subcodigo } = pregunta
  return subcodigo !== null && subcodigo !== undefined && subcodigo !== ''
    ? `Regla ${codigo}.${subcodigo}`
    : `Regla ${codigo}`
}

export function usePracticaCatalogo() {
  const reglas = ref([])            // [{ codigo, cantidad }]
  const enCurso = ref(null)         // práctica sin terminar o null
  const practicas = ref([])         // finalizadas, de la más nueva a la más vieja
  const estadisticas = ref({ meses: [], falladas: [] })

  const cargandoInicio = ref(true)
  const cargandoEstadisticas = ref(false)

  const cargarReglas = async () => {
    // Las reglas casi nunca cambian: se reusan entre visitas a la sección
    const res = await api.getCacheado({ entity: 'catalogo_practica', action: 'reglasCatalogo' }, { ttl: 30 * 60 * 1000 })
    if (res?.ok) reglas.value = res.payload || []
  }

  const cargarEnCurso = async () => {
    const res = await api.get({ entity: 'catalogo_practica', action: 'practicaEnCurso' })
    enCurso.value = res?.ok && res.payload?.id ? res.payload : null
  }

  const cargarPracticas = async () => {
    const res = await api.get({ entity: 'catalogo_practica', action: 'misPracticas' })
    if (res?.ok) practicas.value = res.payload || []
  }

  const cargarEstadisticas = async (anio) => {
    cargandoEstadisticas.value = true
    try {
      const res = await api.get({ entity: 'catalogo_practica', action: 'estadisticasPracticas', payload: { anio } })
      if (res?.ok) estadisticas.value = { meses: res.payload?.meses || [], falladas: res.payload?.falladas || [] }
    } finally {
      cargandoEstadisticas.value = false
    }
  }

  const cargarTodo = async (anio) => {
    cargandoInicio.value = true
    try {
      await Promise.all([cargarReglas(), cargarEnCurso(), cargarPracticas(), cargarEstadisticas(anio)])
    } finally {
      cargandoInicio.value = false
    }
  }

  // Devuelve la práctica nueva o lanza el mensaje del backend
  const iniciarPractica = async ({ idioma, cantidad, reglas: reglasElegidas }) => {
    const res = await api.post({
      entity: 'catalogo_practica',
      action: 'iniciarPractica',
      payload: { idioma, cantidad, reglas: reglasElegidas }
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo armar la práctica')
    return res.payload
  }

  const abandonarPractica = async (idPractica) => {
    const res = await api.post({ entity: 'catalogo_practica', action: 'abandonarPractica', payload: { idPractica } })
    if (res?.ok) enCurso.value = null
    return !!res?.ok
  }

  const obtenerDetalle = async (idPractica) => {
    const res = await api.get({ entity: 'catalogo_practica', action: 'detallePractica', payload: { idPractica } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar la práctica')
    return res.payload
  }

  return {
    reglas,
    enCurso,
    practicas,
    estadisticas,
    cargandoInicio,
    cargandoEstadisticas,
    cargarTodo,
    cargarEnCurso,
    cargarPracticas,
    cargarEstadisticas,
    iniciarPractica,
    abandonarPractica,
    obtenerDetalle
  }
}
