<script setup>
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head'

// Título y descripción específicos para la página de Gestion AAAB
useHead({
  title: 'Panel de Gestión| AAAB',
  meta: [
    {
      name: 'description',
      content: 'Administra y controla los aspectos internos de la asociación desde un panel centralizado.',
    },
  ],
})


const menuItems = [
  { 
    to: '/admin/secretaria', 
    title: 'Secretaría', 
    icon: 'bi bi-people', 
    desc: 'Gestionar legajos y datos de los árbitros.' 
  },
  { 
    to: '/admin/tribunal', 
    title: 'Tribunal de Ética', 
    icon: 'bi bi-shield-exclamation', 
    desc: 'Cargar sanciones, artículos y resoluciones.' 
  },
  { 
    to: '/admin/tesoreria', 
    title: 'Tesorería', 
    icon: 'bi bi-cash-stack', 
    desc: 'Módulo contable, pagos y stock de ropa' 
  }
];
</script>

<template>
  <div class="row g-3 g-md-4 animate__animated animate__fadeIn">
    
    <div class="col-12 col-sm-6 col-md-4" v-for="item in menuItems" :key="item.title">
      <RouterLink :to="item.to" class="text-decoration-none h-100 d-block">
        <div class="menu-card shadow-sm">
          <div class="icon-circle">
            <i :class="[item.icon, 'text-danger']"></i>
          </div>
          <h5 class="mt-3 fw-bold text-dark">{{ item.title }}</h5>
          <p class="small text-muted m-0">{{ item.desc }}</p>
        </div>
      </RouterLink>
    </div>

  </div>
</template>

<style scoped>
.menu-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 35px 15px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #f1f5f9;
  cursor: pointer;
}

.icon-circle {
  width: 75px;
  height: 75px;
  background: #fff5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  transition: all 0.3s ease;
}

.menu-card i { font-size: 2.2rem; }

/* Efecto Hover */
.menu-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.2) !important;
  border-bottom: 5px solid #dc2626;
}

.menu-card:hover .icon-circle { background: #dc2626; }
.menu-card:hover i { color: white !important; transform: scale(1.1); }

/* --- RESPONSIVE --- */
@media (max-width: 576px) {
  .menu-card { padding: 25px 10px; }
  .icon-circle { width: 60px; height: 60px; }
  .menu-card i { font-size: 1.8rem; }
  .menu-card h5 { font-size: 1.1rem; }
}

@media (min-width: 577px) and (max-width: 992px) {
  .menu-card { padding: 30px 15px; }
}
</style>