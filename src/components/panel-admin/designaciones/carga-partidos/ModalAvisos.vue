<template>
  <ModalBase
    :show="show"
    :titulo="titulo"
    icono="warning"
    colorIcono="bg-warning text-dark"
    maxWidth="480px"
    :zIndex="zIndex"
    @close="emit('close')"
  >
    <p class="text-muted small mb-3">{{ pregunta }}</p>
    <div class="alert alert-warning small py-2 px-3 d-flex align-items-start gap-2 mb-0">
      <i class="bi bi-exclamation-triangle-fill mt-1"></i>
      <span class="texto-preformateado">{{ texto }}</span>
    </div>

    <template #footer>
      <template v-if="conConfirmacion">
        <button type="button" @click="emit('close')" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0">
          No, quitar
        </button>
        <button type="button" @click="emit('confirmar')" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100">
          Sí, designar
        </button>
      </template>
      <button v-else type="button" @click="emit('close')" class="btn btn-light rounded-pill px-4 fw-bold border w-100">
        Cerrar
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import ModalBase from '@/components/ModalBase.vue'

// Avisos de un partido o de una designación.
//  - Sin conConfirmacion: solo muestra los avisos y se cierra.
//  - Con conConfirmacion: pregunta si se designa igual ("Sí, designar" emite confirmar; cerrar = no designar).
defineProps({
  show: { type: Boolean, default: false },
  titulo: { type: String, default: '⚠ Avisos de este partido' },
  pregunta: { type: String, default: 'Este partido tiene los siguientes avisos:' },
  texto: { type: String, default: '' },
  conConfirmacion: { type: Boolean, default: false },
  zIndex: { type: Number, default: undefined }
})

const emit = defineEmits(['close', 'confirmar'])
</script>
