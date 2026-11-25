<template>
  <div class="estado-vacio">
    <span class="estado-icono">
      <i :class="['bi', icono]"></i>
    </span>
    <p class="estado-titulo">{{ titulo }}</p>
    <p v-if="mensaje" class="estado-mensaje">{{ mensaje }}</p>
    <slot />
  </div>
</template>

<script setup>
// Estado "sin datos" común a todas las secciones del panel
defineProps({
  icono: { type: String, default: 'bi-inbox' },
  titulo: { type: String, required: true },
  mensaje: { type: String, default: '' }
})
</script>

<style scoped>
.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 32px 16px;
}

.estado-icono {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--o-chip, #f1f5f9);
  color: var(--o-texto-medio, #475569);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.estado-titulo {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--o-texto, #0f172a);
}

.estado-mensaje {
  margin: 0;
  font-size: 0.85rem;
  color: var(--o-texto-medio, #475569);
  max-width: 360px;
}
</style>
