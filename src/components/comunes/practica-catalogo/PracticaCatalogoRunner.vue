<template>
  <div class="practica-overlay px-2 py-3 px-md-4 py-md-5">
    <div class="practica-box mx-auto bg-white w-100 shadow p-3 p-md-4 p-lg-5 animate__animated animate__fadeIn">

      <!-- Enviando -->
      <div v-if="fase === 'enviando'" class="text-center py-5 my-md-5">
        <div class="spinner-border text-danger mb-3" role="status"></div>
        <p class="fw-bold text-muted mb-0 fs-5">{{ t.corrigiendo }}</p>
      </div>

      <!-- Error al finalizar (se puede reintentar: la selección sigue en pantalla) -->
      <div v-else-if="fase === 'error'" class="text-center py-5 my-md-5 px-2">
        <i class="bi bi-exclamation-triangle-fill fs-1 text-warning mb-3"></i>
        <p class="fw-bold text-dark mb-1 fs-4">{{ t.ocurrioProblema }}</p>
        <p class="text-muted small mb-4">{{ mensajeError }}</p>
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
          <button class="btn btn-danger rounded-pill px-4 fw-bold" @click="finalizar">
            <i class="bi bi-arrow-clockwise me-2"></i>{{ t.reintentar }}
          </button>
          <button class="btn btn-outline-secondary rounded-pill px-4" @click="fase = 'practica'">
            {{ t.volverPreguntas }}
          </button>
        </div>
      </div>

      <!-- Resultado -->
      <div v-else-if="fase === 'resultado'">
        <ResumenResultado :resultado="resultado" :idioma="idioma" class="mb-4" />
        <!-- Acciones extra de quien usa el runner (ej. el PDF del catálogo público) -->
        <div v-if="$slots['acciones-resultado']" class="d-flex flex-column flex-sm-row justify-content-center gap-2 mb-4">
          <slot name="acciones-resultado" :resultado="resultado"></slot>
        </div>
        <RevisionPractica :revision="resultado.revision" :idioma="idioma" />
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-4">
          <button class="btn btn-danger rounded-pill px-4 py-2 fw-bold" @click="emit('otra')">
            <i class="bi bi-arrow-repeat me-2"></i>{{ t.practicarDeNuevo }}
          </button>
          <button class="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold" @click="emit('salir')">
            {{ t.volver }}
          </button>
        </div>
      </div>

      <!-- Práctica en curso -->
      <div v-else class="quiz-wrap">
        <div class="d-flex align-items-start justify-content-between gap-2 mb-3 border-bottom pb-3">
          <div class="min-w-0">
            <h5 class="fw-bold text-muted mb-1 text-uppercase fs-6 espaciado-1">
              {{ t.pregunta }} <span class="text-danger fs-4">{{ indice + 1 }}</span> {{ t.de }} {{ total }}
            </h5>
            <small class="text-secondary d-block">{{ subtitulo }}</small>
          </div>
          <button type="button" class="btn btn-outline-secondary btn-sm rounded-pill fw-bold flex-shrink-0" @click="salirGuardando">
            <i class="bi bi-pause-fill me-1"></i>{{ t.salir }}
          </button>
        </div>

        <div class="progress mb-4" role="progressbar" :aria-valuenow="respondidas" aria-valuemin="0" :aria-valuemax="total" style="height: 6px;">
          <div class="progress-bar bg-danger" :style="{ width: `${(respondidas / total) * 100}%` }"></div>
        </div>

        <PreguntaCuestionario
          :texto="preguntaActual?.texto"
          :opciones="opcionesActuales"
          :elegidas="seleccion[preguntaActual?.id] || []"
          :ayuda="t.masDeUna"
          @alternar="alternarOpcion(preguntaActual.id, $event)"
        />

        <NavegacionCuestionario
          :preguntas="preguntas"
          :indice="indice"
          :seleccion="seleccion"
          :idioma="idioma"
          @ir="irAPregunta"
          @finalizar="pedirConfirmacionFinalizar"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { api } from '@/api/api'
import { useGuardadoEnCola } from '@/composables/useGuardadoEnCola'
import { useTextosCatalogo } from '@/composables/textosCatalogo'
import RevisionPractica from '@/components/comunes/practica-catalogo/RevisionPractica.vue'
import ResumenResultado from '@/components/comunes/practica-catalogo/ResumenResultado.vue'
import PreguntaCuestionario from '@/components/comunes/cuestionario/PreguntaCuestionario.vue'
import NavegacionCuestionario from '@/components/comunes/cuestionario/NavegacionCuestionario.vue'

const notificar = inject('notificar')

const props = defineProps({
  // Práctica devuelta por iniciarPractica / practicaEnCurso: { id, preguntas, opciones, seleccion, indice }
  practica: { type: Object, required: true },
  idioma: { type: String, default: 'es' },
  subtitulo: { type: String, default: 'Práctica del catálogo' },
  // Por defecto guarda y corrige en el backend del panel (catalogo_practica).
  // El catálogo público pasa las suyas: guardar({ indice, seleccion }) y
  // finalizar({ indice, seleccion }) → resultado { calificacion, puntaje, posible, correctas, total, revision }
  guardar: { type: Function, default: null },
  finalizar: { type: Function, default: null }
})
const emit = defineEmits(['salir', 'otra', 'finalizada'])

const t = useTextosCatalogo(() => props.idioma)

// fase: 'practica' | 'enviando' | 'resultado' | 'error'
const fase = ref('practica')
const mensajeError = ref('')
const resultado = ref(null)

const preguntas = ref(props.practica.preguntas || [])
const opciones = ref(props.practica.opciones || {})
const seleccion = ref({ ...(props.practica.seleccion || {}) })
const indice = ref(Math.min(props.practica.indice || 0, Math.max(0, preguntas.value.length - 1)))

const total = computed(() => preguntas.value.length)
const preguntaActual = computed(() => preguntas.value[indice.value] || null)
const opcionesActuales = computed(() => preguntaActual.value ? (opciones.value[preguntaActual.value.id] || []) : [])
const respondidas = computed(() => preguntas.value.filter(p => preguntaRespondida(p.id)).length)

const preguntaRespondida = (idPregunta) => (seleccion.value[idPregunta] || []).length > 0

const alternarOpcion = (idPregunta, idOpcion) => {
  const elegidas = [...(seleccion.value[idPregunta] || [])]
  const posicion = elegidas.indexOf(idOpcion)
  if (posicion === -1) elegidas.push(idOpcion)
  else elegidas.splice(posicion, 1)
  seleccion.value = { ...seleccion.value, [idPregunta]: elegidas }
}

// Identifica esta apertura de la práctica en el seguimiento del backend (catalogo_practicas_seguimiento):
// si en el historial cambia, la práctica se retomó o estaba abierta en otro dispositivo o pestaña
const sesion = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

const estadoActual = () => ({ indice: indice.value, seleccion: seleccion.value })

const guardarEnPanel = () => api.post({
  entity: 'catalogo_practica',
  action: 'guardarAvancePractica',
  payload: { idPractica: props.practica.id, ...estadoActual(), sesion }
})

const finalizarEnPanel = async () => {
  const res = await api.post({
    entity: 'catalogo_practica',
    action: 'finalizarPractica',
    payload: { idPractica: props.practica.id, ...estadoActual(), sesion }
  })
  if (res?.ok === false) throw new Error(res.message || t.value.errorFinalizar)
  return res.payload
}

// El avance se guarda al cambiar de pregunta: si se cierra la app, se retoma donde estaba.
// Si falla (sin conexión) no se corta la práctica: se reintenta en el próximo cambio.
// Va en cola (de a un envío) para que un guardado viejo no pise al más reciente
const { guardar: guardarAvance } = useGuardadoEnCola(() => (props.guardar ? props.guardar(estadoActual()) : guardarEnPanel()))

const irAPregunta = (i) => {
  if (i < 0 || i >= total.value || i === indice.value) return
  indice.value = i
  document.querySelector('.practica-overlay')?.scrollTo({ top: 0 })
  guardarAvance()
}

const salirGuardando = async () => {
  await guardarAvance()
  emit('salir')
}

const pedirConfirmacionFinalizar = () => {
  const sinResponder = total.value - respondidas.value
  notificar({
    titulo: t.value.confirmarTitulo,
    mensaje: sinResponder > 0 ? t.value.confirmarSinResponder(sinResponder) : t.value.confirmarListo,
    tipo: 'danger',
    alConfirmar: finalizar,
    textoConfirmar: t.value.botonFinalizar,
    textoCancelar: t.value.botonCancelar
  })
}

const finalizar = async () => {
  fase.value = 'enviando'
  try {
    resultado.value = props.finalizar ? await props.finalizar(estadoActual()) : await finalizarEnPanel()
    fase.value = 'resultado'
    emit('finalizada')
    document.querySelector('.practica-overlay')?.scrollTo({ top: 0 })
  } catch (e) {
    mensajeError.value = e?.message || t.value.errorFinalizar
    fase.value = 'error'
  }
}

// Con la práctica abierta no se desliza la página de fondo
onMounted(() => document.body.classList.add('overflow-hidden'))
onBeforeUnmount(() => document.body.classList.remove('overflow-hidden'))
</script>

<style scoped>
.practica-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: #0f172a;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: calc(1rem + env(safe-area-inset-top)) !important;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom)) !important;
}

.practica-box {
  border-radius: 16px;
  max-width: 760px;
}

.min-w-0 { min-width: 0; }
.espaciado-1 { letter-spacing: 1px; }

</style>
