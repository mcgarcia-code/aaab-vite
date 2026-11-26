<template>
  <Teleport to="body">
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
              <i class="bi bi-bullseye text-danger me-2"></i>Puntaje: {{ resultado.puntaje }} / {{ resultado.posible }}
            </span>
            <span class="badge bg-light text-dark border fs-6 py-2 px-3 w-100 w-sm-auto">
              <i class="bi bi-percent text-danger me-2"></i>Nota: {{ Number(resultado.calificacion).toFixed(2) }}%
            </span>
          </div>
          <div class="alert alert-success py-2 px-3 small d-inline-block text-start text-sm-center">
            <i class="bi bi-check-circle-fill me-1"></i>Tu nota quedó registrada en la planilla general.
          </div>
        </div>

        <RevisionPractica :revision="resultado.revision" />

        <div class="text-center mt-4">
          <button class="btn btn-outline-danger rounded-pill px-4 px-md-5 py-2 fw-bold w-100 w-sm-auto" @click="emit('salir')">
            Volver a mi panel
          </button>
        </div>
      </div>

      <!-- Examen en curso -->
      <div v-else-if="fase === 'examen'" class="quiz-wrap">
        <div class="text-center mb-4 border-bottom pb-3">
          <h5 class="fw-bold text-muted mb-1 text-uppercase fs-6 fs-md-5 espaciado-1">
            Pregunta <span class="text-danger fs-4 fs-md-3">{{ indice + 1 }}</span> de {{ total }}
          </h5>
          <small class="text-secondary d-block px-2">{{ props.titulo }}</small>

          <div v-if="limiteSeg > 0" class="fw-bold mt-2 fs-5 fs-md-4" :class="restante <= 60 ? 'text-danger' : 'text-muted'">
            <i class="bi bi-clock-history me-1"></i>{{ relojTexto }}
          </div>
        </div>

        <PreguntaCuestionario
          :texto="preguntaActual?.texto"
          :opciones="opcionesActuales"
          :elegidas="seleccion[preguntaActual?.id] || []"
          ofuscado
          ayuda="Puede haber más de una respuesta correcta. Para cambiar una respuesta, destildá la anterior."
          @alternar="toggleOpcion(preguntaActual.id, $event)"
        />

        <NavegacionCuestionario
          :preguntas="preguntas"
          :indice="indice"
          :seleccion="seleccion"
          @ir="irAPregunta"
          @finalizar="pedirConfirmacionFinalizar"
        />

      </div>

    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'
import { useGuardadoEnCola } from '@/composables/useGuardadoEnCola'
import { useTiempoVisible } from '@/composables/useTiempoVisible'
import RevisionPractica from '@/components/comunes/practica-catalogo/RevisionPractica.vue'
import PreguntaCuestionario from '@/components/comunes/cuestionario/PreguntaCuestionario.vue'
import NavegacionCuestionario from '@/components/comunes/cuestionario/NavegacionCuestionario.vue'

// Examen online a pantalla completa, común al panel árbitro (examen de reunión / asamblea)
// y al panel curso. Cada panel le indica su backend:
// - entity + acciones { iniciar, guardar, finalizar }: archivo PHP y funciones del examen
// - identificador: lo que identifica el examen en cada pedido (ej. { idEvento: 12 } o { idExamen: 3 })
const props = defineProps({
  entity: { type: String, required: true },
  acciones: { type: Object, required: true },
  identificador: { type: Object, required: true },
  titulo: { type: String, default: 'Examen online' },
  tituloPagina: { type: String, default: 'Examen Online | AAAB' },
  descripcionPagina: { type: String, default: 'Examen online de la AAAB.' }
})

useHead({
  title: props.tituloPagina,
  meta: [{ name: 'description', content: props.descripcionPagina }]
})

const notificar = inject('notificar')
const emit = defineEmits(['terminar', 'salir'])

// fase: 'cargando' | 'examen' | 'enviando' | 'resultado' | 'error'
const fase = ref('cargando')
const mensajeError = ref('')

const preguntas = ref([])
const opciones = ref({})
const seleccion = ref({})
const indice = ref(0)
const limiteSeg = ref(0)
const restante = ref(0)
let timer = null

// Tiempo con el examen a la vista en esta sesión (Page Visibility API)
const tiempoVisible = useTiempoVisible()
const iniciarTrackingVisibilidad = tiempoVisible.iniciar
const detenerTrackingVisibilidad = tiempoVisible.detener

const resultado = ref(null)    // { calificacion, aprobado, puntaje, posible, revision }

const total = computed(() => preguntas.value.length)
const preguntaActual = computed(() => preguntas.value[indice.value] || null)
const opcionesActuales = computed(() => {
  const p = preguntaActual.value
  return p ? (opciones.value[p.id] || []) : []
})
function toggleOpcion(pid, rid) {
  const arr = seleccion.value[pid] ? [...seleccion.value[pid]] : []
  const i = arr.indexOf(rid)
  if (i === -1) arr.push(rid)
  else arr.splice(i, 1)
  seleccion.value = { ...seleccion.value, [pid]: arr }
}

async function irAPregunta(i) {
  if (i === indice.value || i < 0 || i >= total.value) return
  indice.value = i
  await guardarAvance()
}

// Identifica esta apertura del examen en el seguimiento del backend (examenes_online_seguimiento):
// si en el historial cambia, el examen se retomó o estaba abierto en otro dispositivo o pestaña
const sesion = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

// Estado que se manda al guardar y al finalizar
const estadoActual = () => ({
  ...props.identificador,
  indice: indice.value,
  seleccion: seleccion.value,
  tiempoVisibleSeg: tiempoVisible.segundos(),
  sesion
})

// Va en cola (de a un envío): si el usuario navega rápido o tiene mala conexión,
// un guardado viejo no puede llegar último y pisar la selección más reciente
const { guardar: encolarGuardado } = useGuardadoEnCola(() => api.post({
  entity: props.entity,
  action: props.acciones.guardar,
  payload: estadoActual()
}))

async function guardarAvance() {
  let res
  try {
    res = await encolarGuardado()
  } catch { return }
  // Si el examen ya se finalizó, un guardado que llega tarde no debe tapar el resultado
  if (res?.ok === false && fase.value === 'examen') {
    detenerReloj()
    detenerTrackingVisibilidad()
    mensajeError.value = res.message || 'No podés continuar con este examen'
    fase.value = 'error'
  }
}


async function iniciar() {
  fase.value = 'cargando'
  try {
    const res = await api.post({
      entity: props.entity,
      action: props.acciones.iniciar,
      payload: { ...props.identificador, sesion }
    })
    if (res?.ok === false) throw new Error(res.message || 'No se pudo iniciar el examen')
    const data = res?.payload ?? res
    preguntas.value = data.preguntas || []
    opciones.value = data.opciones || {}
    seleccion.value = data.seleccion || {}
    indice.value = data.indice || 0
    limiteSeg.value = data.limite_seg || 0
    restante.value = data.restante || 0
    fase.value = 'examen'
    iniciarTrackingVisibilidad()
    if (limiteSeg.value > 0) arrancarReloj()
  } catch (e) {
    mensajeError.value = e?.message || 'No se pudo iniciar el examen'
    fase.value = 'error'
  }
}

function pedirConfirmacionFinalizar() {
  notificar({
    titulo: '¿Finalizar examen?',
    mensaje: 'Una vez que finalices no vas a poder modificar tus respuestas. ¿Querés continuar?',
    tipo: 'danger',
    alConfirmar: finalizar
  })
}

async function finalizar() {
  detenerReloj()
  detenerTrackingVisibilidad()
  fase.value = 'enviando'
  try {
    const res = await api.post({
      entity: props.entity,
      action: props.acciones.finalizar,
      payload: estadoActual()
    })
    if (res?.ok === false) throw new Error(res.message || 'No se pudo finalizar el examen')
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


onMounted(() => {
  document.body.style.overflow = 'hidden'
  iniciar()
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  detenerReloj()
  detenerTrackingVisibilidad()
})
</script>

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
  border-radius: 16px;
  max-width: 760px;
}

</style>
