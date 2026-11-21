<template>
  <div class="practica-overlay px-2 py-3 px-md-4 py-md-5">
    <div class="practica-box mx-auto bg-white w-100 shadow p-3 p-md-4 p-lg-5 animate__animated animate__fadeIn">

      <!-- Enviando -->
      <div v-if="fase === 'enviando'" class="text-center py-5 my-md-5">
        <div class="spinner-border text-danger mb-3" role="status"></div>
        <p class="fw-bold text-muted mb-0 fs-5">Corrigiendo tu práctica...</p>
      </div>

      <!-- Error al finalizar (se puede reintentar: la selección sigue en pantalla) -->
      <div v-else-if="fase === 'error'" class="text-center py-5 my-md-5 px-2">
        <i class="bi bi-exclamation-triangle-fill fs-1 text-warning mb-3"></i>
        <p class="fw-bold text-dark mb-1 fs-4">Ocurrió un problema</p>
        <p class="text-muted small mb-4">{{ mensajeError }}</p>
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
          <button class="btn btn-danger rounded-pill px-4 fw-bold" @click="finalizar">
            <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
          </button>
          <button class="btn btn-outline-secondary rounded-pill px-4" @click="fase = 'practica'">
            Volver a las preguntas
          </button>
        </div>
      </div>

      <!-- Resultado -->
      <div v-else-if="fase === 'resultado'">
        <ResumenResultado :resultado="resultado" class="mb-4" />
        <RevisionPractica :revision="resultado.revision" />
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-4">
          <button class="btn btn-danger rounded-pill px-4 py-2 fw-bold" @click="emit('otra')">
            <i class="bi bi-arrow-repeat me-2"></i>Practicar de nuevo
          </button>
          <button class="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold" @click="emit('salir')">
            Volver
          </button>
        </div>
      </div>

      <!-- Práctica en curso -->
      <div v-else class="quiz-wrap">
        <div class="d-flex align-items-start justify-content-between gap-2 mb-3 border-bottom pb-3">
          <div class="min-w-0">
            <h5 class="fw-bold text-muted mb-1 text-uppercase fs-6 espaciado-1">
              Pregunta <span class="text-danger fs-4">{{ indice + 1 }}</span> de {{ total }}
            </h5>
            <small class="text-secondary d-block">
              Práctica del catálogo
            </small>
          </div>
          <button type="button" class="btn btn-outline-secondary btn-sm rounded-pill fw-bold flex-shrink-0" @click="salirGuardando">
            <i class="bi bi-pause-fill me-1"></i>Salir
          </button>
        </div>

        <div class="progress mb-4" role="progressbar" :aria-valuenow="respondidas" aria-valuemin="0" :aria-valuemax="total" style="height: 6px;">
          <div class="progress-bar bg-danger" :style="{ width: `${(respondidas / total) * 100}%` }"></div>
        </div>

        <p class="fw-bold mb-4 fs-6 fs-md-5 lh-base px-1 text-break">{{ preguntaActual?.texto }}</p>

        <div class="list-group mb-4 gap-2">
          <label v-for="(o, i) in opcionesActuales" :key="o.id"
                 class="list-group-item d-flex gap-2 gap-md-3 align-items-start p-2 p-md-3 opcion-item shadow-sm border"
                 :class="{ elegida: estaElegida(preguntaActual.id, o.id) }">
            <input class="form-check-input flex-shrink-0 fs-5 mt-1" type="checkbox"
                   :checked="estaElegida(preguntaActual.id, o.id)"
                   @change="alternarOpcion(preguntaActual.id, o.id)">
            <span class="text-danger fw-bold mt-1">{{ letra(i) }})</span>
            <span class="text-dark lh-sm mt-1 text-break">{{ o.texto }}</span>
          </label>
        </div>

        <div class="d-flex flex-column-reverse flex-sm-row justify-content-between align-items-stretch align-items-sm-center border-top pt-3 gap-2">
          <div class="w-100 w-sm-auto">
            <button v-if="indice > 0" class="btn btn-outline-secondary rounded-pill px-4 fw-bold w-100 py-2" @click="irAPregunta(indice - 1)">
              <i class="bi bi-arrow-left me-2"></i>Anterior
            </button>
          </div>
          <div class="w-100 w-sm-auto">
            <button v-if="indice < total - 1" class="btn btn-danger rounded-pill px-4 py-2 fw-bold w-100" @click="irAPregunta(indice + 1)">
              Siguiente<i class="bi bi-arrow-right ms-2"></i>
            </button>
            <button v-else class="btn btn-danger rounded-pill px-4 py-2 fw-bold w-100 shadow" @click="pedirConfirmacionFinalizar">
              <i class="bi bi-check-circle-fill me-2"></i>Finalizar
            </button>
          </div>
        </div>

        <!-- Navegación rápida -->
        <div class="border-top pt-3 mt-3">
          <small class="text-muted d-block mb-2 fw-bold text-center text-sm-start">
            Navegación rápida <span class="fw-normal">— tocá un número para ir a esa pregunta</span>
          </small>
          <div class="d-flex flex-wrap gap-2 justify-content-center justify-content-sm-start">
            <button v-for="(p, i) in preguntas" :key="p.id" type="button"
                    class="btn btn-sm nav-pregunta fw-bold"
                    :class="i === indice ? 'btn-danger' : (preguntaRespondida(p.id) ? 'btn-success' : 'btn-light border')"
                    @click="irAPregunta(i)">
              {{ i + 1 }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { api } from '@/api/api'
import RevisionPractica from './RevisionPractica.vue'
import ResumenResultado from './ResumenResultado.vue'

const notificar = inject('notificar')

const props = defineProps({
  // Práctica devuelta por iniciarPractica / practicaEnCurso: { id, preguntas, opciones, seleccion, indice }
  practica: { type: Object, required: true }
})
const emit = defineEmits(['salir', 'otra', 'finalizada'])

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

const letra = (i) => String.fromCharCode(97 + i)
const estaElegida = (idPregunta, idOpcion) => (seleccion.value[idPregunta] || []).includes(idOpcion)
const preguntaRespondida = (idPregunta) => (seleccion.value[idPregunta] || []).length > 0

const alternarOpcion = (idPregunta, idOpcion) => {
  const elegidas = [...(seleccion.value[idPregunta] || [])]
  const posicion = elegidas.indexOf(idOpcion)
  if (posicion === -1) elegidas.push(idOpcion)
  else elegidas.splice(posicion, 1)
  seleccion.value = { ...seleccion.value, [idPregunta]: elegidas }
}

// El avance se guarda al cambiar de pregunta: si se cierra la app, se retoma donde estaba.
// Si falla (sin conexión) no se corta la práctica: se reintenta en el próximo cambio
const guardarAvance = () => api.post({
  entity: 'catalogo_practica',
  action: 'guardarAvancePractica',
  payload: { idPractica: props.practica.id, indice: indice.value, seleccion: seleccion.value }
})

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
    titulo: '¿Finalizar práctica?',
    mensaje: sinResponder > 0
      ? `Te ${sinResponder === 1 ? 'queda 1 pregunta' : `quedan ${sinResponder} preguntas`} sin responder: cuentan como erradas. ¿Querés finalizar igual?`
      : 'Vas a ver la corrección de cada pregunta. ¿Querés finalizar?',
    tipo: 'danger',
    alConfirmar: finalizar
  })
}

const finalizar = async () => {
  fase.value = 'enviando'
  try {
    const res = await api.post({
      entity: 'catalogo_practica',
      action: 'finalizarPractica',
      payload: { idPractica: props.practica.id, seleccion: seleccion.value }
    })
    if (res?.ok === false) throw new Error(res.message || 'No se pudo finalizar la práctica')
    resultado.value = res.payload
    fase.value = 'resultado'
    emit('finalizada')
    document.querySelector('.practica-overlay')?.scrollTo({ top: 0 })
  } catch (e) {
    mensajeError.value = e?.message || 'No se pudo finalizar la práctica'
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
  border-radius: 1rem;
  max-width: 760px;
}

.min-w-0 { min-width: 0; }
.espaciado-1 { letter-spacing: 1px; }

.opcion-item {
  cursor: pointer;
  border-radius: .6rem !important;
  transition: background .12s ease;
}
/* Hover solo con mouse: en el celular el hover queda "pegado" en la última opción tocada */
@media (hover: hover) {
  .opcion-item:hover { background: var(--o-rojo-fondo, #fff5f5); }
}

/* Cada opción elegida: casillero completo en rojo + checkbox rojo (todas las que se marquen) */
.opcion-item.elegida {
  background: var(--o-rojo-fondo, #fff5f5);
  border-color: var(--o-rojo, #dc3545) !important;
  box-shadow: 0 0 0 1px var(--o-rojo, #dc3545) !important;
}
.opcion-item.elegida .text-dark { color: var(--o-rojo-texto, #b91c1c) !important; font-weight: 600; }
.opcion-item .form-check-input:checked {
  background-color: #dc3545;
  border-color: #dc3545;
}
.opcion-item .form-check-input:focus { box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25); border-color: #dc3545; }

.nav-pregunta {
  width: 42px;
  height: 42px;
  border-radius: .6rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
