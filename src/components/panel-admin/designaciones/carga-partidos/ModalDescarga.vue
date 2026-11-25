<template>
  <ModalBase
    :show="show"
    :titulo="'Descargar ' + (formato === 'excel' ? 'Excel' : 'PDF')"
    icono="download"
    colorIcono="bg-dark text-white"
    maxWidth="420px"
    @close="emit('close')"
  >
    <label class="form-label small fw-bold">Estados a incluir</label>
    <div class="d-flex flex-column gap-1 border rounded p-2">
      <label v-for="e in opciones" :key="e.valor" class="d-flex align-items-center gap-2 small mb-0 cursor-pointer">
        <input
          type="checkbox"
          class="form-check-input m-0 flex-shrink-0"
          :checked="estados.includes(e.valor)"
          @change="emit('toggle-estado', e.valor)"
        >
        <span>{{ e.etiqueta }}</span>
      </label>
    </div>

    <div v-if="estados.length === 0" class="alert alert-danger small py-2 px-3 mt-3 mb-0 d-flex align-items-center gap-2">
      <i class="bi bi-exclamation-circle-fill"></i>
      <span>Tildá al menos un estado para descargar.</span>
    </div>

    <template #footer>
      <button
        type="button"
        @click="emit('close')"
        class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
        :disabled="descargando"
      >
        Cancelar
      </button>
      <button
        type="button"
        @click="emit('confirmar')"
        class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100"
        :disabled="descargando || estados.length === 0"
      >
        <span v-if="descargando" class="spinner-border spinner-border-sm me-2"></span>
        {{ descargando ? 'Descargando...' : 'Descargar' }}
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import ModalBase from '@/components/ModalBase.vue'

// Elegir qué estados de partido entran en la descarga PDF / Excel
defineProps({
  show: { type: Boolean, default: false },
  formato: { type: String, default: 'pdf' },
  opciones: { type: Array, default: () => [] },
  estados: { type: Array, default: () => [] },
  descargando: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'toggle-estado', 'confirmar'])
</script>
