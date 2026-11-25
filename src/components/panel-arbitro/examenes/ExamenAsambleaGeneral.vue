<template>
  <!-- Modo examen a pantalla completa -->
  <ExamenOnlineRunner
    v-if="estado === 'rindiendo' && evento?.id_evento"
    entity="examen_online"
    :acciones="{ iniciar: 'iniciarOReanudar', guardar: 'guardarAvance', finalizar: 'finalizarExamen' }"
    :identificador="{ idEvento: evento.id_evento }"
    :titulo="evento.titulo || 'Examen Asamblea General - Reunión Mensual'"
    titulo-pagina="Examen Online | AAAB"
    descripcion-pagina="Examen online para los árbitros de la AAAB."
    @terminar="alTerminar"
    @salir="volverAlPanel"
  />

  <!-- Estructura alineada a "Mis Designaciones" -->
  <div v-else class="container-fluid py-2 py-md-0 px-2 px-md-3 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100 radio-15">

      <!-- Card Header -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center border-bottom gap-3">
        <p class="seccion-descripcion w-100 w-md-auto">Rendí los teóricos online</p>

        <div v-if="estado === 'habilitado' && evento" class="d-flex flex-wrap gap-2 justify-content-center justify-content-md-end w-100 w-md-auto">
          <span class="badge bg-danger px-3 py-2 shadow-sm d-inline-flex align-items-center gap-2">
            <i class="bi bi-calendar-event-fill"></i> {{ evento.fecha }}
          </span>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body p-3 p-md-4">

        <!-- Estado: Cargando -->
        <EstadoCargando v-if="estado === 'cargando'" texto="Verificando tu habilitación" />

        <!-- Estado: Habilitado para rendir -->
        <div v-else-if="estado === 'habilitado'" class="mb-4">
          <div class="card border border-danger-subtle bg-danger-subtle shadow-sm rounded-4 overflow-hidden">
             <div class="card-body p-3 p-md-4 text-center">
                <i class="bi bi-question-circle text-danger mb-2 d-block" style="font-size: 45px;"></i>
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
          <i class="bi bi-check-circle opacity-50 d-block mb-2 text-success texto-40px"></i>
          <p class="m-0 fw-bold">Ya rendiste el examen habilitado.</p>
          <p class="small m-0 mt-1">Podés ver el resultado en tu historial más abajo.</p>
        </div>

        <div v-else-if="estado === 'ausente'" class="text-center py-4 px-3 text-muted bg-light rounded-3 mb-4">
          <i class="bi bi-calendar-x opacity-50 d-block mb-2 text-danger texto-40px"></i>
          <p class="m-0 fw-bold">Figurás como ausente en la reunión, no podés realizar este examen.</p>
          <p v-if="evento?.titulo" class="small m-0 mt-1">{{ evento.titulo }}<span v-if="evento.fecha"> · {{ evento.fecha }}</span></p>
        </div>

        <!-- Estado: Sin permiso -->
        <div v-else class="text-center py-4 px-3 text-muted bg-light rounded-3 mb-4">
          <i class="bi bi-lock opacity-50 d-block mb-2 texto-40px"></i>
          <p class="m-0 fw-bold">Aún no tenés permiso para realizar un examen nuevo.</p>
        </div>

        <!-- Separador -->
        <hr class="my-4 text-muted opacity-25">

        <!-- Sección Historial -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
          <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2 fs-6 fs-md-5">
            <i class="bi bi-clock-history text-secondary"></i> Mis Exámenes Rendidos
          </h5>
          <div class="d-flex align-items-center gap-2">
            <label for="mis-examenes-anio" class="small fw-bold text-muted text-uppercase mb-0">Año:</label>
            <select id="mis-examenes-anio" v-model="anioSeleccionado" class="form-select form-select-sm shadow-none w-auto fw-bold text-uppercase text-dark">
              <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
        </div>

        <!-- Pestañas por tipo de examen -->
        <PestanasSeccion v-model="pestana" :pestanas="pestanasConCantidad" class="mb-3" />

        <div v-if="!cargandoHistorial && porTipo[pestana].length" class="d-flex flex-wrap gap-1 mb-3 small">
          <span class="estado-pill estado-verde">{{ porTipo[pestana].filter(x => x.aprobado).length }} aprobados</span>
          <span class="estado-pill estado-rojo">{{ porTipo[pestana].filter(x => !x.aprobado).length }} desaprobados</span>
        </div>

        <div v-if="cargandoHistorial" class="text-center py-4">
          <span class="spinner-border spinner-border-sm text-secondary"></span>
          <p class="text-muted mt-2 m-0 fw-bold small">Cargando historial...</p>
        </div>

        <div v-else-if="!porTipo[pestana].length" class="text-center py-5 px-3 text-muted bg-light rounded-3">
          <i class="bi bi-clock-history opacity-50 d-block mb-2 texto-40px"></i>
          <p class="m-0 fw-bold">No rendiste exámenes de {{ TIPOS.find(t => t.clave === pestana).etiqueta.toLowerCase() }} en {{ anioSeleccionado }}.</p>
        </div>

        <!-- Lista de historial apilada -->
        <div v-else class="d-flex flex-column gap-3">
          <div v-for="ex in porTipo[pestana]" :key="ex.id_evento"
               class="historial-card shadow-sm d-flex flex-row justify-content-between align-items-center gap-2 p-3 w-100"
               :style="{ borderLeftColor: ex.aprobado ? '#198754' : '#dc2626' }">

            <div class="flex-grow-1 min-w-0">
              <!-- Fecha posicionada dentro de la Card -->
              <div class="text-secondary small fw-medium mb-1 d-flex align-items-center gap-1">
                <i class="bi bi-calendar-event"></i> {{ fechaDMA(ex.fecha) }}
              </div>

              <!-- Título del examen -->
              <span class="fw-bold text-dark d-block mb-2 text-wrap text-md-truncate lh-sm">{{ ex.titulo }}</span>

              <!-- Badges y Calificación -->
              <div class="small d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-1 gap-sm-2 mt-1">
                <span class="estado-pill" :class="ex.aprobado ? 'estado-aprobado' : 'estado-rojo'">
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
<script setup>
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import { ref, computed, watch, onMounted } from 'vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import { anioActual, conAnioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'
import { api, listaDe } from '@/api/api'
import ExamenOnlineRunner from '@/components/comunes/examenes/ExamenOnlineRunner.vue'

// Estado de la habilitación actual:
// 'cargando' | 'sin-permiso' | 'habilitado' | 'finalizado' | 'rindiendo'
const estado = ref('cargando')
const evento = ref(null)

// Historial de exámenes finalizados
const historial = ref([])
const cargandoHistorial = ref(true)

// Historial separado por tipo de evento y filtrado por año (arranca en el año en curso)
const TIPOS = [
  { clave: 'asamblea', etiqueta: 'Asamblea General', icono: 'bi-people-fill' },
  { clave: 'recuperatorio', etiqueta: 'Recuperatorio', icono: 'bi-arrow-repeat' },
  { clave: 'reunion', etiqueta: 'Reunión', icono: 'bi-chat-square-text' },
]
const pestana = ref('asamblea')
const anioSeleccionado = ref(anioActual())
const anioDe = (ex) => String(ex.fecha || '').substring(0, 4)
const aniosDisponibles = computed(() => conAnioActual(historial.value.map(anioDe).filter(Boolean)))
const porTipo = computed(() => Object.fromEntries(TIPOS.map(t => [
  t.clave,
  historial.value.filter(ex => anioDe(ex) === String(anioSeleccionado.value) && (ex.categoria || 'asamblea') === t.clave),
])))

// Al cambiar el año, se abre la primera pestaña que tenga exámenes
watch([anioSeleccionado, historial], () => {
  if (porTipo.value[pestana.value].length) return
  const conDatos = TIPOS.find(t => porTipo.value[t.clave].length)
  if (conDatos) pestana.value = conDatos.clave
})

// Descargas de PDF (una por id_evento en curso)
const descargando = ref({})   // { [idEvento]: true }
const errorPdf = ref('')

async function cargarHabilitacion() {
  try {
    const res = await api.get({ entity: 'examenes_habilitaciones', action: 'miExamenHabilitado' })
    if (res?.ok === false) throw new Error(res.message)
    const data = res?.payload ?? null
    if (data?.ausente) {
      evento.value = data
      estado.value = 'ausente'
    } else if (data?.id_evento) {
      evento.value = data
      estado.value = data.ya_finalizado ? 'finalizado' : 'habilitado'
    } else {
      evento.value = null
      estado.value = 'sin-permiso'
    }
  } catch {
    evento.value = null
    estado.value = 'sin-permiso'
  }
}

async function cargarHistorial() {
  cargandoHistorial.value = true
  try {
    const res = await api.get({ entity: 'examen_online', action: 'misExamenesOnline' })
    historial.value = listaDe(res)
  } catch {
    historial.value = []
  } finally {
    cargandoHistorial.value = false
  }
}

async function recargar() {
  await Promise.all([cargarHabilitacion(), cargarHistorial()])
}

async function comenzar() {
  if (estado.value !== 'habilitado') return
  estado.value = 'cargando'
  await cargarHabilitacion()
  if (estado.value === 'habilitado' && evento.value?.id_evento) estado.value = 'rindiendo'
}

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

onMounted(recargar)

// Pestañas con la cantidad de exámenes de cada tipo
const pestanasConCantidad = computed(() => TIPOS.map(t => ({ ...t, cantidad: porTipo.value[t.clave].length })))
</script>
<style scoped>
/* ====================================================
   VISTA HISTORIAL (Cards apiladas)
   ==================================================== */

.historial-card {
  background: var(--o-tarjeta, #fff);
  border: 1px solid var(--o-borde, #e5e7eb);
  border-left: 4px solid #6b7280; /* El color se sobreescribe inline con :style */
  border-radius: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.historial-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
}

.min-w-0 {
  min-width: 0;
}

</style>
