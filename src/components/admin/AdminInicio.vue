<template>
  <div class="container py-5 animate__animated animate__fadeIn">
    <div class="row g-4 justify-content-center">
      <div v-for="link in links" :key="link.to" class="col-12 col-sm-6 col-lg-4">
        <RouterLink :to="link.to" class="text-decoration-none h-100 d-block">
          <div class="menu-card shadow-sm">
            <div class="icon-circle">
              <i :class="[link.icon, 'text-danger']"></i>
            </div>
            <h5 class="mt-3 fw-bold text-dark">{{ link.title }}</h5>
            <p class="small text-muted m-0 px-2">{{ link.desc }}</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';

const links = [
  { 
    to: '/admin/secretaria', 
    title: 'Secretaría', 
    icon: 'bi bi-people', 
    desc: 'Gestionar legajos y datos de los árbitros' 
  },
  { 
    to: '/admin/tribunal', 
    title: 'Tribunal de Ética', 
    icon: 'bi bi-shield-exclamation', 
    desc: 'Cargar sanciones, artículos y resoluciones' 
  },
  { 
    to: '/admin/tesoreria', 
    title: 'Tesorería', 
    icon: 'bi bi-cash-stack', 
    desc: 'Módulo contable, pagos y cuotas' 
  }
];
</script>

<style scoped>
.menu-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #f1f5f9;
}

.icon-circle {
  width: 80px;
  height: 80px;
  background: #fff5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.menu-card i {
  font-size: 2.5rem;
}

/* Efecto Hover */
.menu-card:hover {
  transform: translateY(-10px);
  background-color: #ffffff;
  box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
  border-bottom: 5px solid #dc2626;
}

.menu-card:hover .icon-circle {
  background: #dc2626;
}

.menu-card:hover i {
  color: white !important;
  transform: scale(1.1);
}

.text-danger { 
  color: #dc2626 !important; 
}

/* Ajustes para pantallas pequeñas (Celulares) */
@media (max-width: 576px) {
  .menu-card {
    padding: 30px 15px;
  }
  .icon-circle {
    width: 60px;
    height: 60px;
  }
  .menu-card i {
    font-size: 1.8rem;
  }
}
</style>