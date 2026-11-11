<template>
  <!-- Planilla de asistencia del curso: alumnos x clases dictadas (solapa de Clases y Asistencia) -->
  <div>
    <div v-if="cargandoPlanilla || cargandoClases" class="text-center p-5">
      <span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando planilla...</p>
    </div>
    <template v-else>
      <div class="d-flex flex-wrap gap-3 align-items-center px-3 py-2 border-bottom bg-light small">
        <div class="busqueda-wrap">
          <input v-model="filtroAlumno" class="form-control form-control-sm shadow-none" placeholder="BUSCAR ALUMNO..." aria-label="Buscar alumno">
          <button v-if="filtroAlumno" class="btn-limpiar-busqueda" @click="filtroAlumno = ''" title="Limpiar búsqueda" type="button">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <button
          type="button"
          @click="descargarExcelAsistencia"
          class="btn btn-success btn-sm fw-bold d-flex align-items-center gap-1"
          :disabled="!alumnosPlanilla.length || !clasesPlanilla.length || generandoExcel"
        >
          <span v-if="generandoExcel" class="spinner-border spinner-border-sm"></span>
          <i v-else class="bi bi-file-earmark-excel-fill"></i> Descargar Excel
        </button>
        <span class="text-muted text-nowrap">{{ alumnosPlanilla.length }} alumnos · {{ clasesPlanilla.length }} clases dictadas</span>
        <span class="ms-auto d-flex flex-wrap gap-3">
          <span><span class="cuadrito cuadrito-verde"></span> Presente (P)</span>
          <span><span class="cuadrito cuadrito-roja"></span> Ausente (A)</span>
          <span><span class="cuadrito"></span> Sin marcar</span>
          <span><span class="cuadrito cuadrito-na"></span> No le corresponde</span>
        </span>
      </div>
      <div v-if="!clasesPlanilla.length" class="text-center py-5 text-muted fw-bold">Todavía no hay clases dictadas en {{ anio }}.</div>
      <div v-else-if="!alumnosPlanilla.length" class="text-center py-5 text-muted fw-bold">No hay alumnos regulares para mostrar.</div>
      <template v-else>
        <div class="d-none d-lg-block tabla-scroll">
          <table class="tabla-excel">
            <thead>
              <tr>
                <th class="col-alumno esquina">ALUMNO</th>
                <th class="th-curso">CURSO</th>
                <th v-for="c in clasesPlanilla" :key="'th-' + c.id" class="th-clase" :title="`${c.titulo} · ${etiquetaCurso(c.curso)} · tocá para cargar la asistencia`" role="button" @click="emit('abrir-asistencia', c)">
                  <div class="fw-bold">{{ fechaDMA(c.fecha) }}</div>
                  <div class="fecha-evento texto-recortado">{{ c.titulo }}</div>
                </th>
                <th class="th-total">PRESENTES</th>
                <th class="th-total" :title="`Presente sobre las clases ya dictadas (mínimo ${ASISTENCIA_MINIMA}%)`">% ASIST.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in alumnosPlanilla" :key="'pa-' + a.id">
                <td class="col-alumno celda-nombre text-uppercase">{{ a.apellido }}, {{ a.nombre }}</td>
                <td class="celda"><span class="badge" :class="MODALIDADES_CURSO[a.modalidadCurso]?.clase">{{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}</span></td>
                <td v-for="c in clasesPlanilla" :key="'pa-' + a.id + '-' + c.id" class="celda" :class="claseCeldaAsistencia(c, a)" :title="tituloCeldaAsistencia(c, a)">{{ textoCeldaAsistencia(c, a) }}</td>
                <td class="celda celda-total">{{ resumenAlumno(a).presentes }} / {{ resumenAlumno(a).total }}</td>
                <td class="celda" :class="clasePorcentaje(resumenAlumno(a).porcentaje)">{{ resumenAlumno(a).porcentaje === null ? '—' : resumenAlumno(a).porcentaje + '%' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-lg-none d-flex flex-column gap-3 p-3">
          <div v-for="a in alumnosPlanilla" :key="'pam-' + a.id" class="card border-light-subtle shadow-sm rounded-3">
            <div class="card-body p-3 small">
              <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div class="fw-bold text-dark text-uppercase min-w-0">{{ a.apellido }}, {{ a.nombre }}</div>
                <span class="chip-nota flex-shrink-0" :class="clasePorcentaje(resumenAlumno(a).porcentaje)">
                  {{ resumenAlumno(a).presentes }} / {{ resumenAlumno(a).total }} · {{ resumenAlumno(a).porcentaje === null ? '—' : resumenAlumno(a).porcentaje + '%' }}
                </span>
              </div>
              <div v-for="c in clasesPlanilla.filter(c => correspondeClase(c, a))" :key="'pame-' + a.id + '-' + c.id" class="fila-planilla d-flex justify-content-between align-items-center gap-2">
                <div class="min-w-0">
                  <div class="text-dark fw-semibold">{{ fechaDMA(c.fecha) }}</div>
                  <div class="text-muted text-break" style="font-size: 0.68rem;">{{ c.titulo }}</div>
                </div>
                <span class="chip-nota flex-shrink-0" :class="claseCeldaAsistencia(c, a)">{{ textoCeldaAsistencia(c, a) || 'Sin marcar' }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { api } from '@/api/api'
import { fechaDMA } from '@/utils/fechas'
import { normalizarTexto } from '@/utils/texto'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { hoyIso } from '@/composables/useCronogramaCurso'
import { porcentajeAsistencia, colorAsistencia, ASISTENCIA_MINIMA } from '@/composables/useAsistenciaCurso'
import { crearPlanillaExcel, pintarCeldaExcel, pintarCabeceraExcel, anchosColumnasExcel, descargarLibroExcel } from '@/composables/useExcelPlanilla'

const props = defineProps({
  // Clases del año ya filtradas por curso (las de la vista de Clases)
  clases: { type: Array, default: () => [] },
  cargandoClases: { type: Boolean, default: false },
  // Curso elegido en el encabezado ('' = todos)
  filtroCurso: { type: String, default: '' },
  anio: { type: Number, required: true },
})
// Tocar el encabezado de una clase abre la ventana de asistencia de la vista
const emit = defineEmits(['abrir-asistencia'])

const notificar = inject('notificar', (m) => alert(m.mensaje || m))

const etiquetaCurso = (curso) => (curso === 'ambos' ? 'Ambos cursos' : MODALIDADES_CURSO[curso]?.etiqueta || curso)

const planilla = ref({ alumnos: [], asistencias: [] })
const cargandoPlanilla = ref(false)
const filtroAlumno = ref('')

const cargarPlanilla = async () => {
  cargandoPlanilla.value = true
  try {
    const res = await api.get({ entity: 'cronograma_curso_arbitro', action: 'obtenerPlanillaAsistenciaCurso', payload: { anio: props.anio } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar la planilla de asistencia')
    planilla.value = res.payload || { alumnos: [], asistencias: [] }
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargandoPlanilla.value = false
  }
}

watch(() => props.anio, cargarPlanilla)
onMounted(cargarPlanilla)
defineExpose({ recargar: cargarPlanilla })

// Columnas: clases ya dictadas (hasta hoy inclusive), de la más vieja a la más nueva
const clasesPlanilla = computed(() =>
  props.clases.filter(c => c.fecha <= hoyIso()).sort((x, y) => x.fecha.localeCompare(y.fecha) || x.id - y.id)
)

const alumnosPlanilla = computed(() => {
  const texto = normalizarTexto(filtroAlumno.value)
  return planilla.value.alumnos.filter(a =>
    (!props.filtroCurso || a.modalidadCurso === props.filtroCurso) &&
    (!texto || normalizarTexto(`${a.apellido} ${a.nombre}`).includes(texto))
  )
})

const indiceAsistencia = computed(() => {
  const mapa = {}
  for (const x of planilla.value.asistencias) mapa[`${x.idClase}-${x.idAlumno}`] = x.presente
  return mapa
})

const correspondeClase = (c, a) => c.curso === 'ambos' || c.curso === a.modalidadCurso
// true = presente, false = ausente, undefined = sin marcar
const asistenciaDe = (c, a) => indiceAsistencia.value[`${c.id}-${a.id}`]

const textoCeldaAsistencia = (c, a) => {
  if (!correspondeClase(c, a)) return ''
  const p = asistenciaDe(c, a)
  return p === true ? 'P' : p === false ? 'A' : ''
}
const claseCeldaAsistencia = (c, a) => {
  if (!correspondeClase(c, a)) return 'celda-na'
  const p = asistenciaDe(c, a)
  return p === true ? 'celda-verde' : p === false ? 'celda-roja' : ''
}
const tituloCeldaAsistencia = (c, a) => {
  if (!correspondeClase(c, a)) return 'No le corresponde'
  const p = asistenciaDe(c, a)
  return `${fechaDMA(c.fecha)} · ${p === true ? 'Presente' : p === false ? 'Ausente' : 'Sin marcar'}`
}

// Presentes sobre todas las clases dictadas que le corresponden (regla común en useAsistenciaCurso)
const resumenAlumno = (a) => porcentajeAsistencia(
  clasesPlanilla.value
    .filter(c => correspondeClase(c, a))
    .map(c => ({ fecha: c.fecha, asistencia: asistenciaDe(c, a) === true ? 'presente' : asistenciaDe(c, a) === false ? 'ausente' : null })),
  'clases'
)
const clasePorcentaje = (p) => (colorAsistencia(p) ? `celda-${colorAsistencia(p)}` : '')

// ─── Excel de la planilla de asistencia ──
const generandoExcel = ref(false)

const descargarExcelAsistencia = async () => {
  generandoExcel.value = true
  try {
    const { libro, hoja } = await crearPlanillaExcel(`Asistencia ${props.anio}`)
    const clases = clasesPlanilla.value

    hoja.addRow(['ALUMNO', 'CURSO', ...clases.map(c => `${fechaDMA(c.fecha)}\n${c.titulo}`), 'PRESENTES', '% ASIST.'])
    alumnosPlanilla.value.forEach(a => {
      const r = resumenAlumno(a)
      hoja.addRow([
        `${a.apellido}, ${a.nombre}`.toUpperCase(),
        MODALIDADES_CURSO[a.modalidadCurso]?.corta || '',
        ...clases.map(c => textoCeldaAsistencia(c, a)),
        `${r.presentes} / ${r.total}`,
        r.porcentaje === null ? '—' : `${r.porcentaje}%`,
      ])
    })

    pintarCabeceraExcel(hoja)
    alumnosPlanilla.value.forEach((a, i) => {
      const fila = hoja.getRow(i + 2)
      pintarCeldaExcel(fila.getCell(1), '', { izquierda: true, negrita: true })
      pintarCeldaExcel(fila.getCell(2), '')
      clases.forEach((c, j) => pintarCeldaExcel(fila.getCell(j + 3), claseCeldaAsistencia(c, a), { negrita: true }))
      pintarCeldaExcel(fila.getCell(clases.length + 3), '', { negrita: true })
      pintarCeldaExcel(fila.getCell(clases.length + 4), colorAsistencia(resumenAlumno(a).porcentaje), { negrita: true })
    })
    anchosColumnasExcel(hoja, [30, 10, ...clases.map(() => 14), 12, 10])

    await descargarLibroExcel(libro, `asistencia_curso_${props.anio}.xlsx`)
  } catch (err) {
    console.error('descargarExcelAsistencia:', err)
    notificar({ titulo: 'Error', mensaje: 'No se pudo generar el Excel.', tipo: 'danger' })
  } finally {
    generandoExcel.value = false
  }
}
</script>

<style scoped src="@/assets/css/planilla-curso.css"></style>
<style scoped>
.th-clase { min-width: 90px; cursor: pointer; }
.th-clase:hover { background-color: #e2e6ea !important; }
.texto-recortado { max-width: 120px; overflow: hidden; text-overflow: ellipsis; margin: 0 auto; }
.chip-nota { border: 1px solid #e9ecef; }
.min-w-0 { min-width: 0; }
</style>
