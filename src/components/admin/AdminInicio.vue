<template>
  <div class="row g-3 animate__animated animate__fadeIn">
    <div v-for="link in links" :key="link.to" class="col-12 col-md-4">
      <RouterLink :to="link.to" class="text-decoration-none">
        <div class="menu-card shadow">
          <i :class="[link.icon, 'text-danger']"></i>
          <h5 class="mt-2 fw-bold text-dark">{{ link.title }}</h5>
          <p class="small text-muted m-0">{{ link.desc }}</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';

const links = [
  { to: '/admin/secretaria', title: 'Secretaría', icon: 'bi bi-people', desc: 'Gestionar legajos de árbitros' },
  { to: '/admin/tribunal', title: 'Tribunal', icon: 'bi bi-gavel', desc: 'Cargar sanciones y artículos' },
  { to: '/admin/tesoreria', title: 'Tesorería', icon: 'bi bi-cash', desc: 'Módulo contable y pagos' }
];
</script>

<style scoped>
.menu-card {
  background: #ffffff;
  border-radius: 15px;
  padding: 25px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-bottom: 4px solid transparent;
}

.menu-card h5 {
  font-size: 1.1rem;
}

/* Iconos */
.menu-card i {
  transition: transform 0.3s ease;
  font-size: 2.2rem; 
}

@media (min-width: 768px) {
  .menu-card {
    padding: 35px 20px;
  }
  .menu-card h5 {
    font-size: 1.2rem;
  }
  .menu-card i {
    font-size: 2.8rem; 
  }
}

/* Efecto Hover idéntico al panel de árbitros */
.menu-card:hover {
  transform: translateY(-5px);
  background-color: #f8fafc;
  border-bottom: 4px solid #dc2626; /* Rojo institucional */
}

.menu-card:hover i {
  transform: scale(1.1);
}

.text-danger { 
  color: #dc2626 !important; 
}

.row.g-3 {
  padding: 10px;
}
</style>