<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { api } from '@/api/api'

const props = defineProps({
  idEvento: { type: [Number, String], required: true },
  titulo: { type: String, default: 'Examen Asamblea General' }
})
const emit = defineEmits(['terminar', 'salir'])

// fase: 'cargando' | 'examen' | 'enviando' | 'resultado' | 'error'
const fase = ref('cargando')
const mensajeError = ref('')

const preguntas = ref([])
const opciones = ref({})       // { pid: [{id, texto}] }
const seleccion = ref({})      // { pid: [rid, ...] }
const indice = ref(0)
const limiteSeg = ref(0)
const restante = ref(0)
let timer = null

const resultado = ref(null)    // { calificacion, aprobado, puntaje, posible, revision }

const total = computed(() => preguntas.value.length)
const preguntaActual = computed(() => preguntas.value[indice.value] || null)
const opcionesActuales = computed(() => {
  const p = preguntaActual.value
  return p ? (opciones.value[p.id] || []) : []
})

function estaElegida(pid, rid) {
  return (seleccion.value[pid] || []).includes(rid)
}

function toggleOpcion(pid, rid) {
  const arr = seleccion.value[pid] ? [...seleccion.value[pid]] : []
  const i = arr.indexOf(rid)
  if (i === -1) arr.push(rid)
  else arr.splice(i, 1)
  seleccion.value = { ...seleccion.value, [pid]: arr }
}

async function guardarAvance() {
  try {
    await api.post({
      entity: 'examen_online',
      action: 'guardarAvance',
      payload: { idEvento: props.idEvento, indice: indice.value, seleccion: seleccion.value }
    })
  } catch{ /* silencioso: es respaldo */ }
}

async function anterior() {
  if (indice.value > 0) { indice.value--; await guardarAvance() }
}
async function siguiente() {
  if (indice.value < total.value - 1) { indice.value++; await guardarAvance() }
}

async function iniciar() {
  fase.value = 'cargando'
  try {
    const res = await api.post({
      entity: 'examen_online',
      action: 'iniciarOReanudar',
      payload: { idEvento: props.idEvento }
    })
    const data = res?.payload ?? res
    preguntas.value = data.preguntas || []
    opciones.value = data.opciones || {}
    seleccion.value = data.seleccion || {}
    indice.value = data.indice || 0
    limiteSeg.value = data.limite_seg || 0
    restante.value = data.restante || 0
    fase.value = 'examen'
    if (limiteSeg.value > 0) arrancarReloj()
  } catch (e) {
    mensajeError.value = e?.message || 'No se pudo iniciar el examen'
    fase.value = 'error'
  }
}

async function finalizar() {
  detenerReloj()
  fase.value = 'enviando'
  try {
    const res = await api.post({
      entity: 'examen_online',
      action: 'finalizarExamen',
      payload: { idEvento: props.idEvento, seleccion: seleccion.value }
    })
    resultado.value = res?.payload ?? res
    fase.value = 'resultado'
    emit('terminar')
  } catch (e) {
    mensajeError.value = e?.message || 'No se pudo finalizar el examen'
    fase.value = 'error'
  }
}

function arrancarReloj() {
  detenerReloj()
  timer = setInterval(() => {
    restante.value--
    if (restante.value <= 0) { restante.value = 0; finalizar() }
  }, 1000)
}
function detenerReloj() { if (timer) { clearInterval(timer); timer = null } }

const relojTexto = computed(() => {
  const m = String(Math.floor(restante.value / 60)).padStart(2, '0')
  const s = String(restante.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

function letra(i) { return String.fromCharCode(97 + i) }

onMounted(iniciar)
onBeforeUnmount(detenerReloj)
</script>

<template>
  <!-- Utilizamos clases responsivas para los paddings desde Bootstrap -->
  <div class="examen-overlay px-2 py-3 px-md-4 py-md-5">

    <div class="examen-box mx-auto bg-white w-100 shadow p-3 p-md-4 p-lg-5 animate__animated animate__fadeIn">

      <!-- Cargando -->
      <div v-if="fase === 'cargando'" class="text-center py-5 my-md-5">
        <div class="spinner-border text-danger mb-3" role="status"></div>
        <p class="fw-bold text-muted mb-0 fs-5">Preparando tu examen...</p>
      </div>

      <!-- Error (recuperable: botón reintentar) -->
      <div v-else-if="fase === 'error'" class="text-center py-5 my-md-5 px-2">
        <i class="bi bi-exclamation-triangle-fill fs-1 text-warning mb-3"></i>
        <p class="fw-bold text-dark mb-1 fs-4">Ocurrió un problema</p>
        <p class="text-muted small mb-4">{{ mensajeError }}</p>
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-2 gap-md-3">
          <button class="btn btn-danger rounded-pill px-4 fw-bold w-100 w-sm-auto" @click="iniciar">
            <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
          </button>
          <button class="btn btn-outline-secondary rounded-pill px-4 w-100 w-sm-auto" @click="emit('salir')">
            Salir
          </button>
        </div>
      </div>

      <!-- Enviando -->
      <div v-else-if="fase === 'enviando'" class="text-center py-5 my-md-5">
        <div class="spinner-border text-danger mb-3" role="status"></div>
        <p class="fw-bold text-muted mb-0 fs-5">Calculando tu resultado...</p>
      </div>

      <!-- Resultado -->
      <div v-else-if="fase === 'resultado'" class="resultado-wrap">
        <div class="text-center mb-4">
          <h2 class="fw-bold mb-3 fs-2 fs-md-1" :class="resultado.aprobado ? 'text-success' : 'text-danger'">
            <i class="bi me-1 me-md-2" :class="resultado.aprobado ? 'bi-trophy-fill' : 'bi-exclamation-triangle-fill'"></i>
            {{ resultado.aprobado ? 'Aprobado' : 'Desaprobado' }}
          </h2>
          <div class="d-flex flex-column flex-sm-row justify-content-center gap-2 gap-sm-3 mb-3">
            <span class="badge bg-light text-dark border fs-6 py-2 px-3 w-100 w-sm-auto">
              <i class="bi bi-bullseye text-primary me-2"></i>Puntaje: {{ resultado.puntaje }} / {{ resultado.posible }}
            </span>
            <span class="badge bg-light text-dark border fs-6 py-2 px-3 w-100 w-sm-auto">
              <i class="bi bi-percent text-info me-2"></i>Nota: {{ Number(resultado.calificacion).toFixed(2) }}%
            </span>
          </div>
          <div class="alert alert-success py-2 px-3 small d-inline-block text-start text-sm-center">
            <i class="bi bi-check-circle-fill me-1"></i>Tu nota quedó registrada en la planilla general.
          </div>
        </div>

        <h5 class="fw-bold text-dark border-bottom pb-2 mb-3 fs-5">Revisión detallada</h5>

        <div v-for="(r, idx) in resultado.revision" :key="idx" class="card border-0 bg-light shadow-sm rounded-4 mb-3">
          <div class="card-body p-3 p-md-4">
            <h6 class="fw-bold text-dark mb-3 fs-6 lh-base"><span class="text-danger">{{ idx + 1 }}.</span> {{ r.texto }}</h6>
            <div class="d-flex flex-column gap-2">
              <div v-for="(o, j) in r.opciones" :key="j"
                   class="list-group-item rounded-3 border d-flex align-items-start px-3 py-2"
                   :class="[
                     o.elegida && o.es_correcta ? 'list-group-item-success border-success text-success fw-bold' : '',
                     !o.elegida && o.es_correcta ? 'list-group-item-warning border-warning text-dark' : '',
                     o.elegida && !o.es_correcta ? 'list-group-item-danger border-danger text-danger fw-bold' : '',
                     !o.elegida && !o.es_correcta ? 'bg-white text-muted' : ''
                   ]">
                <i class="bi me-2 mt-1 flex-shrink-0"
                   :class="[
                     o.elegida && o.es_correcta ? 'bi-check-circle-fill' : '',
                     !o.elegida && o.es_correcta ? 'bi-exclamation-circle-fill text-warning' : '',
                     o.elegida && !o.es_correcta ? 'bi-x-circle-fill' : '',
                     !o.elegida && !o.es_correcta ? 'bi-circle opacity-25' : ''
                   ]"></i>
                <span class="small text-break lh-sm mt-1">{{ o.texto }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-4">
          <button class="btn btn-outline-danger rounded-pill px-4 px-md-5 py-2 fw-bold w-100 w-sm-auto" @click="emit('salir')">
            Volver a mi panel
          </button>
        </div>
      </div>

      <!-- Examen en curso -->
      <div v-else-if="fase === 'examen'" class="quiz-wrap">
        <div class="text-center mb-4 border-bottom pb-3">
          <h5 class="fw-bold text-muted mb-1 text-uppercase fs-6 fs-md-5" style="letter-spacing:1px;">
            Pregunta <span class="text-danger fs-4 fs-md-3">{{ indice + 1 }}</span> de {{ total }}
          </h5>
          <small class="text-secondary d-block px-2">{{ props.titulo }}</small>

          <div v-if="limiteSeg > 0" class="fw-bold mt-2 fs-5 fs-md-4" :class="restante <= 60 ? 'text-danger' : 'text-muted'">
            <i class="bi bi-clock-history me-1"></i>{{ relojTexto }}
          </div>
        </div>

        <p class="fw-bold mb-4 fs-6 fs-md-5 lh-base px-1">{{ preguntaActual?.texto }}</p>

        <div class="list-group mb-4 gap-2">
          <label v-for="(o, i) in opcionesActuales" :key="o.id"
                 class="list-group-item d-flex gap-2 gap-md-3 align-items-start p-2 p-md-3 opcion-item shadow-sm border">
            <input class="form-check-input flex-shrink-0 fs-5 mt-1" type="checkbox"
                   :checked="estaElegida(preguntaActual.id, o.id)"
                   @change="toggleOpcion(preguntaActual.id, o.id)">
            <span class="text-danger fw-bold mt-1">{{ letra(i) }})</span>
            <!-- text-break y mt-1 para que el texto multilínea quede alineado con el input -->
            <span class="text-dark lh-sm mt-1 text-break">{{ o.texto }}</span>
          </label>
        </div>

        <!-- Botones de navegación (Apilados invertidos en móvil, distribuidos en escritorio) -->
        <div class="d-flex flex-column-reverse flex-sm-row justify-content-between align-items-stretch align-items-sm-center border-top pt-3 gap-2">

          <!-- Contenedor izquierdo: Botón "Anterior" o espacio vacío -->
          <div class="w-100 w-sm-auto">
            <button v-if="indice > 0" class="btn btn-outline-secondary rounded-pill px-3 px-md-4 fw-bold w-100 py-2 py-sm-1" @click="anterior">
              <i class="bi bi-arrow-left me-1 me-md-2"></i>Anterior
            </button>
          </div>

          <!-- Contenedor derecho: Botón "Siguiente" o "Finalizar" -->
          <div class="w-100 w-sm-auto">
            <button v-if="indice < total - 1" class="btn btn-danger rounded-pill px-3 px-md-4 py-2 fw-bold w-100" @click="siguiente">
              Siguiente<i class="bi bi-arrow-right ms-1 ms-md-2"></i>
            </button>
            <button v-else class="btn btn-danger rounded-pill px-3 px-md-4 py-2 fw-bold w-100 shadow" @click="finalizar">
              <i class="bi bi-check-circle-fill me-1 me-md-2"></i>Finalizar
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.examen-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: #0f172a;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.examen-box {
  border-radius: 1rem;
  max-width: 760px;
}

.opcion-item {
  cursor: pointer;
  border-radius: .6rem !important;
  transition: background .12s ease;
}

.opcion-item:hover {
  background: #fff5f5;
}
</style>
