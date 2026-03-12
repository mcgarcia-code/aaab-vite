<template>
  <div class="row g-4">
    <div v-for="link in links" :key="link.to" class="col-md-4">
      <RouterLink :to="link.to" class="text-decoration-none">
        <div class="card h-100 border-0 shadow-sm text-center p-4 hover-effect">
          <i :class="link.icon" class="fs-1 text-primary mb-2"></i>
          <h5 class="fw-bold text-dark">{{ link.title }}</h5>
          <p class="text-muted small">{{ link.desc }}</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
const links = [
  { to: '/admin/secretaria', title: 'Secretaría', icon: 'bi bi-people', desc: 'Gestionar legajos de árbitros' },
  { to: '/admin/tribunal', title: 'Tribunal', icon: 'bi bi-gavel', desc: 'Cargar sanciones' },
  { to: '/admin/tesoreria', title: 'Tesorería', icon: 'bi bi-cash', desc: 'Módulo contable' }
];
</script>

<style scoped>
.hover-effect { transition: 0.3s; }
.hover-effect:hover { transform: translateY(-5px); background-color: #f1f8ff; }
</style>