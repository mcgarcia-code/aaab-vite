<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/api'
import ExamenAsambleaRunner from './ExamenAsambleaRunner.vue'

// Estado de la habilitación actual:
// 'cargando' | 'sin-permiso' | 'habilitado' | 'finalizado' | 'rindiendo'
const estado = ref('cargando')
const evento = ref(null)

// Historial de exámenes finalizados
const historial = ref([])
const cargandoHistorial = ref(true)

// Descargas de PDF (una por id_evento en curso)
const descargando = ref({})   // { [idEvento]: true }
const errorPdf = ref('')

async function cargarHabilitacion() {
  try {
    const res = await api.get({ entity: 'examenes_habilitaciones', action: 'miExamenHabilitado' })
    const data = res?.payload ?? res
    if (data && data.id_evento) {
      evento.value = data
      estado.value = data.ya_finalizado ? 'finalizado' : 'habilitado'
    } else {
      estado.value = 'sin-permiso'
    }
  } catch {
    estado.value = 'sin-permiso'
  }
}

async function cargarHistorial() {
  cargandoHistorial.value = true
  try {
    const res = await api.get({ entity: 'examen_online', action: 'misExamenesOnline' })
    historial.value = res?.payload ?? res ?? []
  } catch {
    historial.value = []
  } finally {
    cargandoHistorial.value = false
  }
}

async function recargar() {
  await Promise.all([cargarHabilitacion(), cargarHistorial()])
}

function comenzar() { estado.value = 'rindiendo' }

// El examen terminó, pero seguimos mostrando el resultado DENTRO del runner.
// No recargamos ni cambiamos de estado acá: si lo hiciéramos, el v-if="estado === 'rindiendo'"
// dejaría de cumplirse y el runner se desmontaría, ocultando la pantalla de resultado.
function alTerminar() { /* intencionalmente vacío */ }

// Recién al salir (botón "Volver a mi panel") recargamos y volvemos al panel con el historial actualizado.
function volverAlPanel() {
  estado.value = 'cargando'
  recargar()
}

async function descargarPdf(idEvento) {
  descargando.value = { ...descargando.value, [idEvento]: true }
  errorPdf.value = ''
  try {
    await api.getFile({
      entity: 'examen_online',
      action: 'descargarPdfExamen',
      payload: { idEvento }
    }, 'examen_asamblea.pdf')
  } catch (e) {
    errorPdf.value = e?.message || 'No se pudo descargar el PDF'
  } finally {
    const copia = { ...descargando.value }
    delete copia[idEvento]
    descargando.value = copia
  }
}

function formatoFecha(f) {
  if (!f) return ''
  const d = new Date(f)
  if (isNaN(d)) return f
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(recargar)
</script>

<template>
  <!-- Modo examen a pantalla completa -->
  <ExamenAsambleaRunner
    v-if="estado === 'rindiendo'"
    :id-evento="evento.id_evento"
    :titulo="evento.titulo"
    @terminar="alTerminar"
    @salir="volverAlPanel"
  />

  <!-- Estructura alineada a "Mis Designaciones" -->
  <div v-else class="container-fluid py-2 py-md-0 px-2 px-md-3 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">

      <!-- Card Header -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center border-bottom gap-3 text-center text-md-start">
        <div class="w-100 w-md-auto">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center justify-content-center justify-content-md-start gap-2 fs-5 fs-md-4">
            <i class="bi bi-journal-check me-1 me-md-2"></i> Examen Asamblea General
          </h4>
          <p class="text-muted small m-0 mt-1">Consultá tus habilitaciones y exámenes teóricos</p>
        </div>

        <div v-if="estado === 'habilitado' && evento" class="d-flex flex-wrap gap-2 justify-content-center justify-content-md-end w-100 w-md-auto">
          <span class="badge bg-danger px-3 py-2 shadow-sm d-inline-flex align-items-center gap-2">
            <i class="bi bi-calendar-event-fill"></i> {{ formatoFecha(evento.fecha) }}
          </span>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body p-3 p-md-4">

        <!-- Estado: Cargando -->
        <div v-if="estado === 'cargando'" class="text-center py-5">
          <span class="spinner-border text-danger"></span>
          <p class="text-muted mt-3 m-0 fw-bold small">Verificando tu habilitación...</p>
        </div>

        <!-- Estado: Habilitado para rendir -->
        <div v-else-if="estado === 'habilitado'" class="mb-4">
          <div class="card border border-danger-subtle bg-danger-subtle shadow-sm rounded-4 overflow-hidden">
             <div class="card-body p-3 p-md-4 text-center">
                <span class="material-icons text-danger mb-2 d-block" style="font-size: 45px;">quiz</span>
                <h5 class="fw-bold text-dark mb-1 fs-5 fs-md-4">¡Tenés un examen habilitado!</h5>
                <p class="text-dark mb-4 fs-6">{{ evento.titulo }}</p>

                <button class="btn btn-danger btn-lg rounded-pill fw-bold px-4 px-md-5 py-2 shadow-sm w-100 w-md-auto" @click="comenzar">
                  <i class="bi bi-play-circle-fill me-2"></i> Comenzar Examen
                </button>
                <p class="text-muted small mt-4 m-0 px-2 fw-semibold">
                  <i class="bi bi-info-circle me-1 d-block d-md-inline mb-1 mb-md-0"></i> Tu nota se guarda automáticamente. Si la página te da un error, actualizá y vas a volver al mismo lugar.
                </p>
             </div>
          </div>
        </div>

        <!-- Estado: Ya finalizado -->
        <div v-else-if="estado === 'finalizado'" class="text-center py-4 px-3 text-muted bg-light rounded-3 mb-4">
          <span class="material-icons opacity-50 d-block mb-2 text-success" style="font-size: 40px;">check_circle</span>
          <p class="m-0 fw-bold">Ya rendiste el examen habilitado.</p>
          <p class="small m-0 mt-1">Podés ver el resultado en tu historial más abajo.</p>
        </div>

        <!-- Estado: Sin permiso -->
        <div v-else class="text-center py-4 px-3 text-muted bg-light rounded-3 mb-4">
          <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">lock</span>
          <p class="m-0 fw-bold">Aún no tenés permiso para realizar un examen nuevo.</p>
        </div>

        <!-- Separador -->
        <hr class="my-4 text-muted opacity-25">

        <!-- Sección Historial -->
        <h5 class="fw-bold text-dark mb-3 mb-md-4 d-flex align-items-center justify-content-center justify-content-md-start gap-2 fs-6 fs-md-5 text-center text-md-start">
          <i class="bi bi-clock-history text-secondary"></i> Mis Exámenes Rendidos
        </h5>

        <div v-if="cargandoHistorial" class="text-center py-4">
          <span class="spinner-border spinner-border-sm text-secondary"></span>
          <p class="text-muted mt-2 m-0 fw-bold small">Cargando historial...</p>
        </div>

        <div v-else-if="!historial.length" class="text-center py-5 px-3 text-muted bg-light rounded-3">
          <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">history_toggle_off</span>
          <p class="m-0 fw-bold">Todavía no rendiste ningún examen.</p>
        </div>

        <!-- Lista de historial apilada -->
        <div v-else class="d-flex flex-column gap-3">
          <div v-for="ex in historial" :key="ex.id_evento"
               class="historial-card shadow-sm d-flex flex-row justify-content-between align-items-center gap-2 p-3 w-100"
               :style="{ borderLeftColor: ex.aprobado ? '#198754' : '#dc3545' }">

            <div class="flex-grow-1 min-w-0">
              <!-- Fecha posicionada dentro de la Card -->
              <div class="text-secondary small fw-medium mb-1 d-flex align-items-center gap-1">
                <i class="bi bi-calendar-event"></i> {{ formatoFecha(ex.fecha) }}
              </div>

              <!-- Título del examen -->
              <span class="fw-bold text-dark d-block mb-2 text-wrap text-md-truncate lh-sm">{{ ex.titulo }}</span>

              <!-- Badges y Calificación -->
              <div class="small d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-1 gap-sm-2 mt-1">
                <span class="badge rounded-pill border" :class="ex.aprobado ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'">
                  {{ ex.aprobado ? 'Aprobado' : 'Desaprobado' }}
                </span>
                <span class="fw-bold mt-1 mt-sm-0" :class="ex.aprobado ? 'text-success' : 'text-danger'">
                  Calificación: {{ ex.calificacion.toFixed(2) }}%
                </span>
              </div>
            </div>

            <!-- Botón de descarga PDF -->
            <div class="flex-shrink-0 ms-1 ms-sm-2">
              <button class="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 42px; height: 42px;"
                      :disabled="descargando[ex.id_evento]"
                      :aria-label="`Descargar PDF de ${ex.titulo}`"
                      @click="descargarPdf(ex.id_evento)">
                <span v-if="descargando[ex.id_evento]" class="spinner-border spinner-border-sm text-secondary"></span>
                <i v-else class="bi bi-file-earmark-pdf-fill fs-5" :class="ex.aprobado ? 'text-success' : 'text-danger'"></i>
              </button>
            </div>

          </div>
        </div>

        <div v-if="errorPdf" class="alert alert-danger mt-3 py-2 px-3 small rounded-3 border-danger-subtle d-flex align-items-center gap-2 fw-bold text-break">
          <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i> {{ errorPdf }}
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ====================================================
   VISTA HISTORIAL (Cards apiladas)
   ==================================================== */
.historial-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #6b7280; /* El color se sobreescribe inline con :style */
  border-radius: 10px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.historial-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
}

.min-w-0 {
  min-width: 0;
}

.animate__animated {
  animation-duration: 0.5s;
}
</style>
