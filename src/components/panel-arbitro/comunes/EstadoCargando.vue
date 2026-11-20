<template>
  <!-- Mismo formato de carga que panel-admin: spinner rojo + "Cargando..." -->
  <div class="text-center p-5" role="status">
    <span class="spinner-border text-danger" aria-hidden="true"></span>
    <p class="text-muted mt-3 mb-0 fw-bold">{{ texto }}...</p>
  </div>
</template>

<script setup>
// Estado de carga común a todos los paneles.
// texto: qué se está cargando, sin los puntos suspensivos (ej. "Cargando contactos")
defineProps({
  texto: { type: String, default: 'Cargando' }
})
</script>
