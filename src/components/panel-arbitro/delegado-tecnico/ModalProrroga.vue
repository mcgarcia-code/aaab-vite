<template>
  <ModalBase
    :show="show"
    :titulo="titulo"
    icono="sports_score"
    colorIcono="bg-success text-white"
    @close="emit('close')"
  >
    <div class="text-center p-4">
      <div class="display-3 fw-bold mb-3">{{ golesLocal }} — {{ golesVisita }}</div>
      <p class="text-muted fs-6 mb-3">El partido terminó empatado. ¿Cómo desean continuar?</p>
      <div class="alert alert-info small text-start mb-0">
        <i class="bi bi-info-circle-fill me-1"></i>
        <strong>Prórroga:</strong> {{ minutosProrroga }} min + 1 min descanso + {{ minutosProrroga }} min.
        <span v-if="rondas === 2"> Si persiste el empate, hay una 2° ronda con 5 min de descanso previo.</span>
        <span v-else> Si persiste el empate, se define por <strong>lanzamiento de 7 metros</strong>.</span>
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-danger rounded-pill fw-bold px-4" @click="emit('finalizar')">🏁 Finalizar Partido</button>
      <button type="button" class="btn btn-danger rounded-pill fw-bold px-4 shadow-sm" @click="emit('prorroga')">⚡ Ir a Prórroga</button>
    </template>
  </ModalBase>
</template>

<script setup>
import ModalBase from '@/components/ModalBase.vue'

// Empate al final del 2° tiempo o de una prórroga: finalizar o seguir con prórroga
defineProps({
  show: { type: Boolean, default: false },
  titulo: { type: String, default: '' },
  golesLocal: { type: Number, default: 0 },
  golesVisita: { type: Number, default: 0 },
  minutosProrroga: { type: Number, default: 5 },
  rondas: { type: Number, default: 1 }
})

const emit = defineEmits(['close', 'finalizar', 'prorroga'])
</script>
