<template>
  <!-- Barra de navegación fija abajo (celular y tablet), común a todos los paneles -->
  <nav class="barra-inferior d-lg-none" aria-label="Navegación principal">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="barra-item"
      v-bind="item.exacta ? { exactActiveClass: 'activo' } : { activeClass: 'activo' }"
      :aria-label="item.badge ? `${item.label}, ${item.badge} pendientes` : item.label"
    >
      <span class="position-relative">
        <i :class="['bi', estaActivo(item) && item.iconoActivo ? item.iconoActivo : item.icono]"></i>
        <span v-if="item.badge" class="barra-badge">{{ item.badge }}</span>
      </span>
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

// items: [{ to, label, icono, iconoActivo?, badge?, exacta? }]
// exacta: solo se marca activa en esa ruta exacta (ej. Inicio)
defineProps({
  items: { type: Array, required: true }
})

const route = useRoute()

const estaActivo = (item) => (item.exacta ? route.path === item.to : route.path.startsWith(item.to))
</script>

<style scoped>
.barra-inferior {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1030;
  display: flex;
  padding: 0 6px env(safe-area-inset-bottom);
  background: var(--t-barra-fondo);
  border-top: 1px solid var(--t-barra-borde);
}

.barra-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 64px;
  color: var(--t-barra-texto-suave);
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
}
.barra-item .bi { font-size: 1.3rem; line-height: 1; }
.barra-item:focus-visible { outline: 2px solid var(--t-barra-texto-suave); outline-offset: -4px; border-radius: 12px; }

/* Pestaña actual: texto blanco e ícono rojo */
.barra-item.activo { color: var(--t-barra-texto); }
.barra-item.activo .bi { color: var(--t-barra-acento); }

.barra-badge {
  position: absolute;
  top: -6px;
  left: 12px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #dc2626;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
