<template>
  <ModalBase
    :show="show"
    titulo="Asignar cancha"
    icono="stadium"
    colorIcono="bg-danger text-white"
    maxWidth="480px"
    @close="emit('close')"
  >
    <p class="text-muted small mb-3" v-if="partido">
      {{ partido.local || '?' }} vs {{ partido.visitante || '?' }}
    </p>

    <div class="mb-2">
      <label class="form-label small fw-bold">Cancha</label>
      <select v-model="seleccion" aria-label="Cancha" class="form-select shadow-none border-secondary-subtle">
        <option value="" disabled>Seleccione una cancha</option>
        <option v-for="cj in camposJuego" :key="cj.cj_id" :value="cj.cj_id">
          {{ cj.cj_nombre }} — {{ cj.club_nombre }}
        </option>
      </select>
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
        :disabled="guardando || !modelValue"
      >
        <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
        {{ guardando ? 'Guardando...' : 'Guardar' }}
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import { computed } from 'vue'
import ModalBase from '@/components/ModalBase.vue'

// Elegir la cancha de un partido que llegó sin cancha desde el Excel.
// v-model: cj_id de la cancha elegida
const props = defineProps({
  show: { type: Boolean, default: false },
  partido: { type: Object, default: null },
  camposJuego: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: '' },
  guardando: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirmar', 'update:modelValue'])

// v-model del select hacia afuera: conserva el tipo del cj_id (número)
const seleccion = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor)
})
</script>
