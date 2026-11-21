<template>
  <!-- Solo en celular y app: en escritorio la lista de avisos scrollea por dentro -->
  <button v-if="cantidad > LIMITE_AVISOS" type="button" class="btn-ver-todos d-lg-none" :aria-expanded="expandido" @click="emit('alternar')">
    {{ expandido ? 'Ver menos' : `Ver todos (${cantidad})` }}
    <i class="bi" :class="expandido ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
  </button>
</template>

<script setup>
// Avisos del Inicio: en celular se muestran los primeros LIMITE_AVISOS (regla .lista-recortada de panel.css)
// y este botón despliega el resto, para que la lista no tenga scroll propio que atrape el dedo
const LIMITE_AVISOS = 5

defineProps({
  cantidad: { type: Number, default: 0 },
  expandido: { type: Boolean, default: false }
})
const emit = defineEmits(['alternar'])
</script>

<style scoped>
.btn-ver-todos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 44px;
  margin-top: 6px;
  border: 0;
  border-radius: 10px;
  background: var(--o-chip, #f1f5f9);
  color: var(--o-texto-medio, #475569);
  font-size: 0.85rem;
  font-weight: 700;
}
.btn-ver-todos:hover { color: var(--o-texto, #0f172a); }
</style>
