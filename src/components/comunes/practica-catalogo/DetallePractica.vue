<template>
  <div class="practica-overlay px-2 py-3 px-md-4 py-md-5">
    <div class="practica-box mx-auto bg-white w-100 shadow p-3 p-md-4 p-lg-5 animate__animated animate__fadeIn">

      <div class="d-flex align-items-center justify-content-between gap-2 mb-4 border-bottom pb-3">
        <div class="min-w-0">
          <h5 class="fw-bold text-dark mb-1 fs-6 fs-md-5">Práctica del {{ fechaHoraDMA(detalle?.finalizado_en) || '…' }}</h5>
          <small v-if="detalle" class="text-secondary d-block">{{ textoReglas(detalle.reglas) }} · {{ detalle.idioma === 'en' ? 'Inglés' : 'Español' }}</small>
        </div>
        <button type="button" class="btn btn-outline-secondary btn-sm rounded-pill fw-bold flex-shrink-0" @click="emit('cerrar')">
          <i class="bi bi-x-lg me-1"></i>Cerrar
        </button>
      </div>

      <EstadoCargando v-if="cargando" texto="Cargando la práctica" />

      <div v-else-if="error" class="text-center py-5 px-2">
        <i class="bi bi-exclamation-triangle-fill fs-1 text-warning mb-3 d-block"></i>
        <p class="fw-bold text-dark mb-4">{{ error }}</p>
        <button class="btn btn-danger rounded-pill px-4 fw-bold" @click="cargar">
          <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
        </button>
      </div>

      <template v-else>
        <ResumenResultado :resultado="detalle" class="mb-4" />
        <RevisionPractica :revision="detalle.revision" />
        <div class="text-center mt-4">
          <button class="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold w-100 w-sm-auto" @click="emit('cerrar')">
            Volver
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { fechaHoraDMA } from '@/utils/fechas'
import { usePracticaCatalogo } from '@/composables/usePracticaCatalogo'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import RevisionPractica from './RevisionPractica.vue'
import ResumenResultado from './ResumenResultado.vue'

const props = defineProps({
  idPractica: { type: Number, required: true },
  // Texto de las reglas (lo arma la pantalla principal, que sabe cuántas reglas hay)
  textoReglas: { type: Function, required: true }
})
const emit = defineEmits(['cerrar'])

const { obtenerDetalle } = usePracticaCatalogo()

const detalle = ref(null)
const cargando = ref(true)
const error = ref('')

const cargar = async () => {
  cargando.value = true
  error.value = ''
  try {
    detalle.value = await obtenerDetalle(props.idPractica)
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  document.body.classList.add('overflow-hidden')
  cargar()
})
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
</style>
