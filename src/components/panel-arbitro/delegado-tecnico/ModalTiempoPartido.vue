<template>
  <ModalBase
    :show="show"
    :titulo="titulo"
    icono="timer"
    :colorIcono="colorIcono"
    @close="emit('close')"
  >
    <div class="text-center p-3">
      <p v-if="etiqueta" class="fw-bold text-dark mb-1">{{ etiqueta }}</p>
      <p class="small text-muted mb-4">{{ descripcion }}</p>
      <div class="d-flex justify-content-center align-items-center gap-3">
        <div class="text-center">
          <label class="small fw-bold text-muted d-block mb-1">MINUTOS</label>
          <input
            v-model="minutos"
            aria-label="Minutos"
            type="number"
            class="form-control form-control-lg text-center fw-bold shadow-none border-secondary input-tiempo"
            min="0"
            :max="maxMinutos"
          >
        </div>
        <div class="display-6 fw-bold mt-3 text-muted">:</div>
        <div class="text-center">
          <label class="small fw-bold text-muted d-block mb-1">SEGUNDOS</label>
          <input
            v-model="segundos"
            aria-label="Segundos"
            type="number"
            class="form-control form-control-lg text-center fw-bold shadow-none border-secondary input-tiempo"
            min="0"
            max="59"
          >
        </div>
      </div>
      <div v-if="ayuda" class="mt-3 text-muted small">
        <i class="bi bi-info-circle me-1"></i>
        {{ ayuda }}
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-light border rounded-pill fw-bold px-4" @click="emit('close')">CANCELAR</button>
      <button type="button" class="btn btn-danger rounded-pill fw-bold px-4 shadow-sm" @click="emit('guardar')">{{ textoGuardar }}</button>
    </template>
  </ModalBase>
</template>

<script setup>
import { computed } from 'vue'
import ModalBase from '@/components/ModalBase.vue'

// Minutos y segundos editables: se usa para ajustar el cronómetro y para corregir una exclusión.
// v-model:mm y v-model:ss
const props = defineProps({
  show: { type: Boolean, default: false },
  titulo: { type: String, default: 'Ajustar Tiempo' },
  colorIcono: { type: String, default: 'bg-danger text-white' },
  etiqueta: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  ayuda: { type: String, default: '' },
  maxMinutos: { type: [Number, String], default: undefined },
  textoGuardar: { type: String, default: 'GUARDAR' },
  mm: { type: [Number, String], default: 0 },
  ss: { type: [Number, String], default: 0 }
})

const emit = defineEmits(['close', 'guardar', 'update:mm', 'update:ss'])

const minutos = computed({ get: () => props.mm, set: (v) => emit('update:mm', v) })
const segundos = computed({ get: () => props.ss, set: (v) => emit('update:ss', v) })
</script>

<style scoped>
.input-tiempo { font-size: 2rem; width: 90px; }
</style>
