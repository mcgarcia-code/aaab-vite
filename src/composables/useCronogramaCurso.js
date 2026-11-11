import { ref, computed } from 'vue'
import { api } from '@/api/api'
import { fechaDMA } from '@/utils/fechas'

// Cronograma anual del curso (tabla cronograma_curso_arbitro).
// Lo usan CronogramaCursoAdmin.vue (carga) y CronogramaCurso.vue (alumnos).

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const hoyIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const fechaLargaClase = (fecha) => {
  const d = new Date(`${fecha}T00:00:00`)
  if (isNaN(d)) return fecha
  return `${DIAS[d.getDay()]} ${fechaDMA(fecha)}`
}

export const horarioClase = (c) => {
  if (c.hora_inicio && c.hora_fin) return `${c.hora_inicio} a ${c.hora_fin} hs`
  if (c.hora_inicio) return `${c.hora_inicio} hs`
  return ''
}

export const esClasePasada = (c) => c.fecha < hoyIso()

export function useCronogramaCurso() {
  const clases = ref([])
  const cargando = ref(false)
  const error = ref('')
  // Filtro por curso (solo lo usa el admin): '', 'anual' o 'intensivo'
  const filtroCurso = ref('')
  const clasesVisibles = computed(() =>
    filtroCurso.value ? clases.value.filter(c => c.curso === filtroCurso.value || c.curso === 'ambos') : clases.value
  )

  const cargar = async (anio) => {
    cargando.value = true
    error.value = ''
    try {
      const res = await api.get({ entity: 'cronograma_curso_arbitro', action: 'obtenerCronogramaCurso', payload: { anio } })
      if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar el cronograma')
      clases.value = res.payload || []
    } catch (e) {
      console.error('cronograma:', e)
      error.value = e.message
    } finally {
      cargando.value = false
    }
  }

  // [{ mes: 'Marzo', clases: [...] }, ...] en orden cronológico
  const clasesPorMes = computed(() => {
    const grupos = []
    for (const c of clasesVisibles.value) {
      const mes = MESES[Number(c.fecha.substring(5, 7)) - 1]
      const ultimo = grupos[grupos.length - 1]
      if (ultimo && ultimo.mes === mes) ultimo.clases.push(c)
      else grupos.push({ mes, clases: [c] })
    }
    return grupos
  })

  const proximaClase = computed(() => clasesVisibles.value.find(c => !esClasePasada(c)) || null)

  return { clases, clasesVisibles, filtroCurso, cargando, error, cargar, clasesPorMes, proximaClase }
}
