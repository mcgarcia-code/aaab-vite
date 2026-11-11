<template>
  <!-- Planilla de notas del curso: alumnos x exámenes (solapa Planilla de Exámenes del Curso) -->
  <div>
    <div v-if="cargandoPlanilla" class="text-center p-5"><span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando planilla...</p></div>
    <template v-else>
              <!-- Barra de herramientas: búsqueda + descargar + leyenda, igual que la Planilla General -->
              <div class="d-flex flex-wrap gap-3 align-items-center px-3 py-2 border-bottom bg-light small">
                <div class="busqueda-wrap">
                  <input v-model="filtroAlumno" class="form-control form-control-sm shadow-none" placeholder="BUSCAR ALUMNO..." aria-label="Buscar alumno">
                  <button v-if="filtroAlumno" class="btn-limpiar-busqueda" @click="filtroAlumno = ''" title="Limpiar búsqueda" type="button">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
                <button
                  type="button"
                  @click="descargarExcelPlanilla"
                  class="btn btn-success btn-sm fw-bold d-flex align-items-center gap-1"
                  :disabled="!alumnosPlanilla.length || generandoExcel"
                >
                  <span v-if="generandoExcel" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-file-earmark-excel-fill"></i> Descargar Excel
                </button>
                <span class="text-muted text-nowrap">{{ alumnosPlanilla.length }} alumnos · {{ columnasPlanilla.length }} exámenes</span>
                <button
                  v-if="totalInconsistencias || soloInconsistencias"
                  type="button"
                  class="btn btn-sm fw-bold d-flex align-items-center gap-1"
                  :class="soloInconsistencias ? 'btn-warning' : 'btn-outline-warning text-dark'"
                  title="Nota del examen que no coincide con la asistencia de la clase"
                  @click="soloInconsistencias = !soloInconsistencias"
                >
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  {{ totalInconsistencias }} inconsistencia{{ totalInconsistencias === 1 ? '' : 's' }}
                  <span v-if="soloInconsistencias">· ver todos</span>
                </button>
                <span class="ms-auto d-flex flex-wrap gap-3">
                  <span><span class="cuadrito cuadrito-verde"></span> Aprobado</span>
                  <span><span class="cuadrito cuadrito-roja"></span> Desaprobado</span>
                  <span><span class="cuadrito cuadrito-gris"></span> Ausente (AUS)</span>
                  <span><span class="cuadrito cuadrito-na"></span> No le corresponde</span>
                  <span><i class="bi bi-exclamation-triangle-fill text-warning"></i> No coincide con la asistencia</span>
                </span>
              </div>
              <div v-if="!alumnosPlanilla.length" class="text-center py-5 text-muted fw-bold">No hay alumnos regulares para mostrar.</div>
              <template v-else>
                <div class="d-none d-lg-block tabla-scroll">
                  <table class="tabla-excel">
                    <thead>
                      <tr>
                        <th class="col-alumno esquina">ALUMNO</th>
                        <th class="th-curso">CURSO</th>
                        <th v-for="e in columnasPlanilla" :key="'th-' + e.id" class="th-evento" :title="e.clase ? e.titulo + ' · ' + e.clase : e.titulo">
                          <div class="fw-bold text-uppercase texto-recortado">{{ e.titulo }}</div>
                          <div class="fecha-evento">
                            {{ etiquetaColumna(e) }} · {{ fechaDMA(e.fecha) }}
                            <i v-if="!e.idClase" class="bi bi-link-45deg text-danger" title="Sin clase asociada: la asistencia no se sincroniza con este examen"></i>
                          </div>
                        </th>
                        <th class="th-total">APROBADOS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="a in alumnosPlanilla" :key="'pl-' + a.id">
                        <td class="col-alumno celda-nombre text-uppercase">{{ a.apellido }}, {{ a.nombre }}</td>
                        <td class="celda"><span class="badge" :class="MODALIDADES_CURSO[a.modalidadCurso]?.clase">{{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}</span></td>
                        <td v-for="e in columnasPlanilla" :key="'c-' + a.id + '-' + e.id" class="celda" :class="[claseCeldaPlanilla(e, a), { 'celda-inconsistente': inconsistencia(e, a) }]" :title="!correspondeExamen(e, a) ? 'No le corresponde' : inconsistencia(e, a) || undefined">
                          <i v-if="inconsistencia(e, a)" class="bi bi-exclamation-triangle-fill text-warning me-1"></i>
                          <template v-if="correspondeExamen(e, a) && celda(e, a)">
                            <template v-if="celda(e, a).ausente">AUS</template>
                            <template v-else-if="celda(e, a).nota !== null">{{ textoCelda(e, a) }}</template>
                            <button v-if="celda(e, a).rendidoOnline" type="button" class="btn btn-link btn-sm p-0 ms-1 text-danger align-baseline" :disabled="descargandoPlanilla === a.id + '-' + e.id" title="Descargar PDF" :aria-label="'PDF de ' + a.apellido" @click="descargarPdfPlanilla(e, a)">
                              <i class="bi bi-file-earmark-pdf"></i>
                            </button>
                          </template>
                        </td>
                        <td class="celda celda-total">{{ aprobadosAlumno(a) }} / {{ totalAlumno(a) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
  
                <div class="d-lg-none d-flex flex-column gap-3 p-3">
                  <div v-for="a in alumnosPlanilla" :key="'plm-' + a.id" class="card border-light-subtle shadow-sm rounded-3">
                    <div class="card-body p-3 small">
                      <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div class="min-w-0">
                          <div class="fw-bold text-dark text-uppercase">{{ a.apellido }}, {{ a.nombre }}</div>
                        </div>
                        <span class="badge bg-dark flex-shrink-0">{{ aprobadosAlumno(a) }} / {{ totalAlumno(a) }} aprob.</span>
                      </div>
                      <div v-for="e in columnasPlanilla.filter(e => correspondeExamen(e, a))" :key="'plme-' + a.id + '-' + e.id" class="fila-planilla d-flex justify-content-between align-items-center gap-2">
                        <div class="min-w-0">
                          <div class="text-dark text-break">{{ e.titulo }}</div>
                          <div class="text-muted" style="font-size: 0.68rem;">{{ etiquetaColumna(e) }} · {{ fechaDMA(e.fecha) }}</div>
                          <div v-if="inconsistencia(e, a)" class="text-warning-emphasis fw-semibold" style="font-size: 0.68rem;">
                            <i class="bi bi-exclamation-triangle-fill text-warning"></i> {{ inconsistencia(e, a) }}
                          </div>
                        </div>
                        <div class="flex-shrink-0 text-end">
                          <template v-if="celda(e, a)">
                            <span v-if="celda(e, a).ausente" class="chip-nota celda-gris">AUS</span>
                            <span v-else-if="celda(e, a).nota !== null" class="chip-nota" :class="aprobadoCelda(e, a) ? 'celda-verde' : 'celda-roja'">{{ textoCelda(e, a) }}</span>
                            <button v-if="celda(e, a).rendidoOnline" type="button" class="btn btn-link btn-sm p-0 ms-1 text-danger" :aria-label="'PDF de ' + a.apellido" @click="descargarPdfPlanilla(e, a)"><i class="bi bi-file-earmark-pdf"></i></button>
                          </template>
                          <span v-else class="text-muted">—</span>
                        </div>
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
import { formatoNota } from '@/composables/useExamenesCurso'
import { crearPlanillaExcel, pintarCeldaExcel, pintarCabeceraExcel, anchosColumnasExcel, descargarLibroExcel } from '@/composables/useExcelPlanilla'

const props = defineProps({
  // Todos los exámenes del año (los recuperatorios de parcialitos cargados a mano miran todos)
  examenes: { type: Array, default: () => [] },
  // Curso elegido en el encabezado de Exámenes ('' = todos)
  filtroCurso: { type: String, default: '' },
  anio: { type: Number, required: true },
})

const notificar = inject('notificar', (m) => alert(m.mensaje || m))

const examenesFiltrados = computed(() =>
  props.filtroCurso ? props.examenes.filter(e => e.curso === props.filtroCurso || e.curso === 'ambos') : props.examenes
)

const ETIQUETA_TIPO = { teorico: 'Teórico', practico: 'Práctico', fisico: 'Físico' }
const etiquetaColumna = (e) => {
  const base = e.tipo === 'teorico'
    ? (e.esFinal ? 'Final' : 'Parcialito')
    : e.tipo === 'fisico' ? (e.esFinal ? 'Físico final' : 'Simulacro') : ETIQUETA_TIPO[e.tipo]
  if (e.esRecuperatorioParcialitos) return 'Recup. parcialitos'
  return e.idExamenOriginal ? `Recup. ${base.toLowerCase()}` : base
}

// ─── Carga ────────────────────────────────────────────────────────
const cargandoPlanilla = ref(false)

const cargarPlanilla = async () => {
  cargandoPlanilla.value = true
  try {
    const res = await api.get({ entity: 'examenes_curso_arbitro', action: 'obtenerPlanillaNotasCurso', payload: { anio: props.anio } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar la planilla de notas')
    planilla.value = res.payload || { alumnos: [], notas: [], recuperados: [] }
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargandoPlanilla.value = false
  }
}

watch(() => props.anio, cargarPlanilla)
onMounted(cargarPlanilla)
defineExpose({ recargar: cargarPlanilla })

// ─── Planilla de notas (alumnos x exámenes) ──────────────────────
const planilla = ref({ alumnos: [], notas: [], recuperados: [] })
const filtroAlumno = ref('')
const descargandoPlanilla = ref(null)

const columnasPlanilla = computed(() =>
  [...examenesFiltrados.value].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)) || a.id - b.id)
)

const alumnosFiltrados = computed(() => {
  const texto = normalizarTexto(filtroAlumno.value)
  return planilla.value.alumnos.filter(a =>
    (!props.filtroCurso || a.modalidadCurso === props.filtroCurso) &&
    (!texto || normalizarTexto(`${a.apellido} ${a.nombre}`).includes(texto))
  )
})

const alumnosPlanilla = computed(() =>
  soloInconsistencias.value
    ? alumnosFiltrados.value.filter(a => columnasPlanilla.value.some(e => inconsistencia(e, a)))
    : alumnosFiltrados.value
)

// ─── Inconsistencias entre la nota del examen y la asistencia de su clase ──
const soloInconsistencias = ref(false)

const indiceAsistenciaClase = computed(() => {
  const mapa = {}
  for (const x of planilla.value.asistenciaClases || []) mapa[`${x.idClase}-${x.idAlumno}`] = x.presente
  return mapa
})

// Rindió (con nota) otro examen de la misma clase: estuvo en la clase aunque haya faltado a este examen
const rindioOtroDeLaClase = (e, a) =>
  props.examenes.some(x => x.idClase === e.idClase && x.id !== e.id && celda(x, a) && !celda(x, a).ausente && celda(x, a).nota !== null)

const inconsistencia = (e, a) => {
  if (!e.idClase || !correspondeExamen(e, a)) return null
  const n = celda(e, a)
  if (!n) return null
  const presente = indiceAsistenciaClase.value[`${e.idClase}-${a.id}`]
  if (n.ausente && presente === true && !rindioOtroDeLaClase(e, a)) return 'AUS en el examen pero presente en la clase'
  if (!n.ausente && n.nota !== null && presente === false) return 'Tiene nota pero figura ausente en la clase'
  return null
}

const totalInconsistencias = computed(() =>
  alumnosFiltrados.value.reduce((t, a) => t + columnasPlanilla.value.filter(e => inconsistencia(e, a)).length, 0)
)

const indiceNotas = computed(() => {
  const mapa = {}
  planilla.value.notas.forEach(n => { mapa[`${n.idExamen}-${n.idAlumno}`] = n })
  return mapa
})

const celda = (e, a) => indiceNotas.value[`${e.id}-${a.id}`] || null
const correspondeExamen = (e, a) => {
  if (e.curso !== 'ambos' && e.curso !== a.modalidadCurso) return false
  if (e.esRecuperatorioParcialitos) return Boolean(celda(e, a))
  if (!e.idExamenOriginal) return true
  const original = celda({ id: e.idExamenOriginal }, a)
  return Boolean(original && (original.aprobado === false || original.ausente))
}

const aprobadoCelda = (e, a) => {
  const n = celda(e, a)
  if (!n || n.ausente || n.nota === null) return false
  if (n.aprobado !== null && n.aprobado !== undefined) return n.aprobado
  return (n.nota / (e.notaMaxima || 100)) * 100 >= e.porcentajeAprobacion
}

const textoCelda = (e, a) => {
  const n = celda(e, a)
  if (e.tipo === 'practico') return n.nota >= 1 ? 'APROB.' : 'DESAP.'
  return e.online ? `${formatoNota(n.nota / (e.notaMaxima || 100) * 100)}%` : formatoNota(n.nota)
}

// Cuentan los exámenes originales (sin recuperatorios ni simulacros). Si aprobó el recuperatorio, el original cuenta como aprobado.
const cuentaParaAprobados = (e) => !e.idExamenOriginal && !e.esRecuperatorioParcialitos && !(e.tipo === 'fisico' && !e.esFinal)
const examenesQueCuentan = (a) => columnasPlanilla.value.filter(e => cuentaParaAprobados(e) && correspondeExamen(e, a))
// Recuperatorios de parcialitos que el aspirante rindió online: tienen el detalle de qué parcialitos recupera
const recuperatoriosConDetalle = computed(() =>
  new Set((planilla.value.recuperados || []).map(x => `${x.idExamen}-${x.idAlumno}`))
)

const aproboConRecuperatorio = (e, a) => {
  const porRecuperatorio = examenesFiltrados.value.some(r => r.idExamenOriginal === e.id && aprobadoCelda(r, a))
  if (porRecuperatorio) return true
  // Rendido online: se sabe exactamente qué parcialitos recuperó
  const porParcialitos = (planilla.value.recuperados || [])
    .some(x => x.idAlumno === a.id && x.idParcialito === e.id && aprobadoCelda({ id: x.idExamen }, a))
  if (porParcialitos) return true
  // Nota cargada a mano (sin detalle): un recuperatorio de parcialitos aprobado recupera los parcialitos
  // desaprobados o ausentes anteriores a esa fecha. Es la misma regla que usa el backend.
  if (e.tipo !== 'teorico' || e.esFinal || e.idExamenOriginal || e.esRecuperatorioParcialitos || !celda(e, a)) return false
  return props.examenes.some(r =>
    r.esRecuperatorioParcialitos &&
    String(r.fecha) >= String(e.fecha) &&
    !recuperatoriosConDetalle.value.has(`${r.id}-${a.id}`) &&
    aprobadoCelda(r, a)
  )
}
const aprobadosAlumno = (a) => examenesQueCuentan(a).filter(e => aprobadoCelda(e, a) || aproboConRecuperatorio(e, a)).length
const totalAlumno = (a) => examenesQueCuentan(a).length

// ─── Excel de la planilla (mismos colores que la Planilla General) ──
const generandoExcel = ref(false)

const claseCeldaPlanilla = (e, a) => {
  if (!correspondeExamen(e, a)) return 'celda-na'
  const { color } = celdaExcel(e, a)
  return color ? `celda-${color}` : ''
}

// Texto y color de una celda del Excel, con la misma lógica que la vista
const celdaExcel = (e, a) => {
  if (!correspondeExamen(e, a)) return { texto: '', color: 'gris' }
  const n = celda(e, a)
  if (!n) return { texto: '', color: '' }
  if (n.ausente) return { texto: 'AUS', color: 'gris' }
  if (n.nota === null) return { texto: '', color: '' }
  const texto = e.tipo === 'practico' ? (n.nota >= 1 ? 'APROBADO' : 'DESAPROBADO') : textoCelda(e, a)
  return { texto, color: aprobadoCelda(e, a) ? 'verde' : 'roja' }
}

const descargarExcelPlanilla = async () => {
  generandoExcel.value = true
  try {
    const { libro, hoja } = await crearPlanillaExcel(`Planilla ${props.anio}`)
    const columnas = columnasPlanilla.value

    hoja.addRow([
      'ALUMNO',
      'CURSO',
      ...columnas.map(e => `${e.titulo}\n${etiquetaColumna(e)} · ${fechaDMA(e.fecha)}`),
      'APROBADOS'
    ])
    alumnosPlanilla.value.forEach(a => {
      hoja.addRow([
        `${a.apellido}, ${a.nombre}`.toUpperCase(),
        MODALIDADES_CURSO[a.modalidadCurso]?.corta || '',
        ...columnas.map(e => celdaExcel(e, a).texto),
        `${aprobadosAlumno(a)} / ${totalAlumno(a)}`
      ])
    })

    pintarCabeceraExcel(hoja)
    alumnosPlanilla.value.forEach((a, i) => {
      const fila = hoja.getRow(i + 2)
      pintarCeldaExcel(fila.getCell(1), '', { izquierda: true, negrita: true })
      pintarCeldaExcel(fila.getCell(2), '')
      columnas.forEach((e, j) => pintarCeldaExcel(fila.getCell(j + 3), celdaExcel(e, a).color, { negrita: true }))
      pintarCeldaExcel(fila.getCell(columnas.length + 3), '', { negrita: true })
    })
    anchosColumnasExcel(hoja, [30, 10, ...columnas.map(() => 16), 12])

    await descargarLibroExcel(libro, `planilla_examenes_curso_${props.anio}.xlsx`)
  } catch (err) {
    console.error('descargarExcelPlanilla:', err)
    notificar({ titulo: 'Error', mensaje: 'No se pudo generar el Excel.', tipo: 'danger' })
  } finally {
    generandoExcel.value = false
  }
}

const descargarPdfPlanilla = async (e, a) => {
  descargandoPlanilla.value = `${a.id}-${e.id}`
  try {
    await api.getFile({
      entity: 'examen_online_curso_arbitro',
      action: 'descargarPdfExamenCurso',
      payload: { idExamen: e.id, idAlumno: a.id },
    }, `examen_curso_${a.apellido}_${a.nombre}.pdf`)
  } catch (err) {
    notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
  } finally {
    descargandoPlanilla.value = null
  }
}
</script>

<style scoped src="@/assets/css/planilla-curso.css"></style>
<style scoped>
.th-evento { min-width: 140px; }
.texto-recortado { max-width: 180px; overflow: hidden; text-overflow: ellipsis; margin: 0 auto; }
.celda-inconsistente { box-shadow: inset 0 0 0 2px #ffc107; }
.min-w-0 { min-width: 0; }
</style>
