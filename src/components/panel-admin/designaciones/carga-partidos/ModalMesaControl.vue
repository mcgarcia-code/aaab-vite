<template>
  <ModalBase
    :show="show"
    titulo="Mesa de control"
    icono="table_restaurant"
    colorIcono="bg-danger text-white"
    maxWidth="480px"
    :zIndex="1055"
    @close="emit('close')"
  >
    <p class="text-muted small mb-3">
      <i class="bi bi-info-circle me-1"></i>
      Asigná planillero y/o cronometrista solo si este partido se juega con mesa de control. Ambos son opcionales.
    </p>

    <div class="mb-3">
      <label class="form-label small fw-bold text-muted">Planillero</label>
      <button type="button" @click="emit('elegir', 'planillero')" class="celda-arbitro-mobile w-100 text-start" :class="{ 'vacio': !partido?.planillero }">
        {{ partido?.planillero || '— Asignar planillero —' }}
      </button>
    </div>

    <div class="mb-2">
      <label class="form-label small fw-bold text-muted">Cronometrista</label>
      <button type="button" @click="emit('elegir', 'cronometrista')" class="celda-arbitro-mobile w-100 text-start" :class="{ 'vacio': !partido?.cronometrista }">
        {{ partido?.cronometrista || '— Asignar cronometrista —' }}
      </button>
    </div>

    <template #footer>
      <button type="button" @click="emit('close')" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0">
        Cancelar
      </button>
      <button type="button" @click="emit('close')" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100">
        Confirmar
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import ModalBase from '@/components/ModalBase.vue'

// Planillero y cronometrista de un partido. elegir: 'planillero' | 'cronometrista'
// (abre el selector de árbitros; el cambio se guarda solo, como el resto de la grilla)
defineProps({
  show: { type: Boolean, default: false },
  partido: { type: Object, default: null }
})

const emit = defineEmits(['close', 'elegir'])
</script>

<style scoped src="@/components/panel-admin/designaciones/carga-partidos/carga-partidos-compartido.css"></style>
