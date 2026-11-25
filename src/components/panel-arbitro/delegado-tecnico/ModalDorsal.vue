<template>
  <ModalBase
    :show="show"
    titulo="Ingresar Sanción"
    icono="sports"
    colorIcono="bg-dark text-white"
    @close="emit('close')"
  >
    <div class="text-center">
      <p class="mb-3 text-muted small">Ingrese el número del jugador (o letra A–E para oficiales).</p>
      <div class="shirt-wrapper">
        <svg viewBox="0 0 24 24" class="shirt-svg" :class="equipo === 'local' ? 'camiseta-local' : 'camiseta-visita'">
          <path d="M21.99 7.99l-3.99-3.98c-.54-.54-1.42-.64-2.08-.22L12 6.51 8.08 3.79c-.66-.42-1.54-.32-2.08.22L2.01 7.99c-.42.42-.42 1.11 0 1.54l1.49 1.49c.42.42 1.11.42 1.54 0l1.48-1.48v8.46c0 .55.45 1 1 1h8.96c.55 0 1-.45 1-1v-8.46l1.48 1.48c.42.42 1.11.42 1.54 0l1.49-1.49c.43-.43.43-1.12.01-1.54z"/>
        </svg>
        <input
          v-model="dorsal"
          aria-label="Nº"
          type="text"
          class="dorsal-input"
          placeholder="Nº"
          autofocus
          @keyup.enter="emit('confirmar')"
        >
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-light border rounded-pill fw-bold px-4" @click="emit('close')">CANCELAR</button>
      <button type="button" class="btn btn-danger rounded-pill fw-bold px-4 shadow-sm" @click="emit('confirmar')">CONFIRMAR</button>
    </template>
  </ModalBase>
</template>

<script setup>
import { computed } from 'vue'
import ModalBase from '@/components/ModalBase.vue'

// Dorsal del jugador (número) u oficial (A–E) para una sanción. v-model: el dorsal escrito.
const props = defineProps({
  show: { type: Boolean, default: false },
  equipo: { type: String, default: 'local' },
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['close', 'confirmar', 'update:modelValue'])

const dorsal = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor)
})
</script>

<style scoped>
.shirt-wrapper { position: relative; width: 140px; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
.shirt-svg { width: 100%; height: auto; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.1)); }
.camiseta-local { fill: #dc2626; }
.camiseta-visita { fill: #2563eb; }
.dorsal-input { position: absolute; width: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-size: 1.5rem; font-weight: 900; background: transparent; border: none; border-bottom: 2px dashed rgba(255,255,255,0.5); color: white; outline: none; text-transform: uppercase; }
.dorsal-input::placeholder { color: rgba(255,255,255,0.4); }
</style>
