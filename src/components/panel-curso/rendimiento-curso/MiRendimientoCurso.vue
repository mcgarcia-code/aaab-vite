<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-graph-up-arrow me-1"></i> Mi Rendimiento
          </h4>
          <span class="text-muted small d-block mt-1">Estado del curso, asistencia<template v-if="esAnual"> a clases y a mini</template> y promedio de exámenes · Curso {{ datos.anio }}</span>
        </div>
      </div>

      <div v-if="cargando" class="card-body text-center py-5">
        <span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando tu rendimiento...</p>
      </div>

      <div v-else class="card-body p-3 p-md-4">
        <!-- ESTADO FINAL DEL CURSO (único lugar donde se muestra el resultado) -->
        <div class="estado-final rounded-3 p-3 mb-4" :class="ESTADO_FINAL[resultado.estado].clase">
          <div class="d-flex align-items-center gap-3">
            <i class="bi fs-2 flex-shrink-0" :class="ESTADO_FINAL[resultado.estado].icono"></i>
            <div class="min-w-0">
              <div class="etiqueta-estado">Estado final del curso</div>
              <div class="fw-bold fs-5">{{ ESTADO_FINAL[resultado.estado].etiqueta }}</div>
              <div v-if="resultado.fecha" class="small opacity-75">{{ fechaLargaClase(resultado.fecha) }}</div>
              <div class="small mt-1">{{ ESTADO_FINAL[resultado.estado].texto }}</div>
            </div>
          </div>
          <div v-if="resultado.observacion" class="observacion-final mt-3">
            <div class="etiqueta-estado mb-1">Observación</div>
            <div class="texto-multilinea">{{ resultado.observacion }}</div>
          </div>
          <RouterLink v-if="resultado.estado === 'aprobado'" to="/panel-curso" class="btn btn-success btn-sm fw-bold mt-3">
            <i class="bi bi-patch-check-fill me-1"></i> Ir al inicio para registrarme como árbitro
          </RouterLink>
        </div>

        <!-- RESUMEN -->
        <div class="row g-2 g-md-3 mb-4">
          <div class="col-6" :class="esAnual ? 'col-md' : 'col-md-3'">
            <div class="resumen-card bg-success text-white">
              <i class="bi bi-person-check-fill"></i>
              <div class="valor">{{ asistenciaClases.presentes }}</div>
              <div class="etiqueta">Presentes</div>
            </div>
          </div>
          <div class="col-6" :class="esAnual ? 'col-md' : 'col-md-3'">
            <div class="resumen-card bg-secondary text-white">
              <i class="bi bi-person-dash-fill"></i>
              <div class="valor">{{ ausentesClases }}</div>
              <div class="etiqueta">Ausentes</div>
            </div>
          </div>
          <div class="col-6" :class="esAnual ? 'col-md' : 'col-md-3'">
            <div class="resumen-card bg-dark text-white">
              <i class="bi bi-people-fill"></i>
              <div class="valor">{{ textoPorcentaje(asistenciaClases.porcentaje) }}</div>
              <div class="etiqueta">Asistencia a clases</div>
              <div class="detalle">{{ asistenciaClases.presentes }} de {{ asistenciaClases.total }} · mínimo {{ ASISTENCIA_MINIMA }}%</div>
            </div>
          </div>
          <div v-if="esAnual" class="col-6 col-md">
            <RouterLink to="/panel-curso/designaciones-curso" class="resumen-card bg-primary text-white d-block text-decoration-none">
              <i class="bi bi-people-fill"></i>
              <div class="valor">{{ textoPorcentaje(asistenciaMini.porcentaje) }}</div>
              <div class="etiqueta">Asistencia a mini</div>
              <div class="detalle">{{ asistenciaMini.presentes }} de {{ asistenciaMini.total }} · ver encuentros <i class="bi bi-chevron-right"></i></div>
            </RouterLink>
          </div>
          <div :class="esAnual ? 'col-12 col-md' : 'col-6 col-md-3'">
            <RouterLink to="/panel-curso/examenes-curso" class="resumen-card bg-danger text-white d-block text-decoration-none">
              <i class="bi bi-journal-check"></i>
              <div class="valor">{{ promedio ?? '-' }}</div>
              <div class="etiqueta">Promedio exámenes</div>
              <div class="detalle">ver mis exámenes <i class="bi bi-chevron-right"></i></div>
            </RouterLink>
          </div>
        </div>

        <!-- ASISTENCIA A CLASES (el detalle de exámenes está en Mis Exámenes y el de mini en Mis Designaciones) -->
        <div class="accordion" id="acordeonRendimiento">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button type="button" class="accordion-button fw-bold" :class="{ collapsed: !clasesAbiertas }" :aria-expanded="clasesAbiertas" aria-controls="seccion-clases" @click="clasesAbiertas = !clasesAbiertas">
                <i class="bi bi-calendar-check me-2"></i>
                <span class="me-2">Asistencia a clases</span>
                <span class="badge bg-success me-1">{{ asistenciaClases.presentes }} P</span>
                <span class="badge bg-secondary">{{ ausentesClases }} A</span>
              </button>
            </h2>
            <div v-show="clasesAbiertas" id="seccion-clases" class="accordion-collapse">
              <div class="accordion-body p-2 p-md-3">
                <div v-if="!datos.clases.length" class="text-muted small fst-italic">Todavía no hubo clases.</div>
                <div v-else class="d-flex flex-column gap-2">
                  <div v-for="c in datos.clases" :key="c.id" class="fila-item d-flex justify-content-between align-items-center gap-2">
                    <div class="min-w-0">
                      <div class="fw-bold text-dark small text-break">{{ c.titulo }}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">{{ fechaLargaClase(c.fecha) }}</div>
                    </div>
                    <span class="badge flex-shrink-0" :class="claseAsistencia(c.asistencia)">{{ textoAsistencia(c.asistencia) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'
import { formatoNota } from '@/composables/useExamenesCurso'
import { porcentajeAsistencia, ASISTENCIA_MINIMA } from '@/composables/useAsistenciaCurso'

useHead({ title: 'Mi Rendimiento | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const datos = ref({ anio: new Date().getFullYear(), modalidad: '', clases: [], mini: [], examenes: [] })
const cargando = ref(true)
const clasesAbiertas = ref(false)

const esAnual = computed(() => datos.value.modalidad === 'anual')

// Estado final del curso (lo carga la Escuela desde Alumnos Regulares)
const ESTADO_FINAL = {
  aprobado: {
    etiqueta: '¡Aprobaste el curso!',
    texto: 'Felicitaciones. Desde el inicio de tu panel podés registrarte como árbitro de la AAAB.',
    icono: 'bi-trophy-fill',
    clase: 'estado-aprobado',
  },
  desaprobado: {
    etiqueta: 'Desaprobado',
    texto: 'Para volver a anotarte, comunicate con la coordinación del curso.',
    icono: 'bi-x-octagon-fill',
    clase: 'estado-desaprobado',
  },
  pendiente: {
    etiqueta: 'Pendiente',
    texto: 'Todavía no se cargó la nota final del curso.',
    icono: 'bi-hourglass-split',
    clase: 'estado-pendiente',
  },
}
const resultado = computed(() => {
  const r = datos.value.resultado
  return r && ESTADO_FINAL[r.estado] ? r : { estado: 'pendiente', observacion: null, fecha: null }
})

// Regla común de asistencia: clases sobre las dictadas, mini sobre los encuentros con presente o ausente cargado
const asistenciaClases = computed(() => porcentajeAsistencia(datos.value.clases, 'clases'))
const asistenciaMini = computed(() => porcentajeAsistencia(datos.value.mini || [], 'mini'))
const ausentesClases = computed(() => datos.value.clases.filter(c => c.asistencia === 'ausente').length)
const textoPorcentaje = (p) => (p === null ? '-' : `${p}%`)

// Promedio de los teóricos con nota (el detalle está en Mis Exámenes)
const promedio = computed(() => {
  const conNota = datos.value.examenes.filter(e => e.nota !== null && (e.tipo || 'teorico') === 'teorico')
  if (!conNota.length) return null
  return `${formatoNota(Math.round(conNota.reduce((s, e) => s + (e.nota / (e.notaMaxima || 100)) * 100, 0) / conNota.length))}%`
})

const textoAsistencia = (a) => (a === 'presente' ? 'Presente' : a === 'ausente' ? 'Ausente' : 'Sin registro')
const claseAsistencia = (a) => (a === 'presente' ? 'bg-success' : a === 'ausente' ? 'bg-secondary' : 'bg-light text-muted border')

onMounted(async () => {
  try {
    const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMiRendimientoCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar tu rendimiento')
    datos.value = res.payload
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.resumen-card {
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  height: 100%;
}
a.resumen-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
a.resumen-card:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(15, 23, 42, 0.2); }
.resumen-card i { font-size: 1.2rem; }
.resumen-card .valor { font-size: 1.4rem; font-weight: 800; line-height: 1.1; margin-top: 4px; }
.resumen-card .etiqueta { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; opacity: 0.85; }
.resumen-card .detalle { font-size: 0.68rem; opacity: 0.8; margin-top: 2px; }
.resumen-card .detalle i { font-size: 0.65rem; }
.accordion-item { border-radius: 10px !important; overflow: hidden; margin-bottom: 8px; border: 1px solid #e2e8f0; }
.accordion-button { font-size: 0.9rem; color: #0f172a; background: #fff; box-shadow: none; flex-wrap: wrap; row-gap: 4px; }
.accordion-button:not(.collapsed) { color: #dc2626; background: #fef2f2; }
.accordion-button:focus { box-shadow: 0 0 0 0.2rem rgba(220, 38, 38, 0.2); }
.fila-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
}
.min-w-0 { min-width: 0; }
.estado-final { border: 1px solid; }
.estado-aprobado { background: #d1e7dd; border-color: #a3cfbb; color: #0f5132; }
.estado-desaprobado { background: #f8d7da; border-color: #f1aeb5; color: #842029; }
.estado-pendiente { background: #f8f9fa; border-color: #dee2e6; color: #495057; }
.etiqueta-estado { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; opacity: 0.8; }
.observacion-final { background: rgba(255, 255, 255, 0.6); border-radius: 8px; padding: 8px 12px; color: #212529; font-size: 0.9rem; }
.texto-multilinea { white-space: pre-wrap; word-break: break-word; }
</style>
