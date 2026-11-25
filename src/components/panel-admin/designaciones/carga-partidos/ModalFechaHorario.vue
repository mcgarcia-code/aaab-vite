<template>
  <ModalBase
    :show="show"
    titulo="Editar fecha y horario"
    icono="event"
    colorIcono="bg-danger text-white"
    maxWidth="420px"
    @close="emit('close')"
  >
    <p class="text-muted small mb-3" v-if="partido">
      {{ partido.local || '?' }} vs {{ partido.visitante || '?' }}
    </p>

    <div class="mb-3">
      <label class="form-label small fw-bold">Fecha</label>
      <input
        aria-label="Fecha"
        :value="fecha"
        type="date"
        class="form-control shadow-none border-secondary-subtle"
        @input="emit('update:fecha', $event.target.value)"
      >
    </div>

    <div class="mb-2">
      <label class="form-label small fw-bold">Horario</label>
      <input
        aria-label="Horario"
        :value="horario"
        type="time"
        class="form-control shadow-none border-secondary-subtle"
        @input="emit('update:horario', $event.target.value)"
      >
    </div>

    <template #footer>
      <button
        type="button"
        @click="emit('close')"
        class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
        :disabled="guardando"
      >
        Cancelar
      </button>
      <button
        type="button"
        @click="emit('confirmar')"
        class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100"
        :disabled="guardando || !fecha || !horario"
      >
        <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
        {{ guardando ? 'Guardando...' : 'Guardar' }}
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import ModalBase from '@/components/ModalBase.vue'

// Editar fecha y horario de un partido (solo admin).
// v-model:fecha (AAAA-MM-DD) y v-model:horario (HH:MM)
defineProps({
  show: { type: Boolean, default: false },
  partido: { type: Object, default: null },
  fecha: { type: String, default: '' },
  horario: { type: String, default: '' },
  guardando: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirmar', 'update:fecha', 'update:horario'])
</script>
