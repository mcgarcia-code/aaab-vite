<template>
  <div class="row g-3 g-md-4 animate__animated animate__fadeIn">
    
<div class="col-12 col-sm-6 col-md-4" v-for="item in menuItems" :key="item.title">
  <a v-if="item.href" :href="item.href" target="_blank" rel="noopener noreferrer" class="text-decoration-none h-100 d-block">
    <div class="menu-card shadow-sm">
      <div class="icon-circle">
        <i :class="[item.icon, 'text-danger']"></i>
      </div>
      <h5 class="mt-3 fw-bold text-dark">{{ item.title }}</h5>
      <p class="small text-muted m-0">{{ item.desc }}</p>
    </div>
  </a>

  <RouterLink v-else :to="item.to" class="text-decoration-none h-100 d-block">
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

<script setup>
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head'

// Título y descripción específicos para la página de panel de inicio de árbitros AAAB
useHead({
  title: 'Panel de Inicio | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Sección de inicio para árbitros, con acceso a datos personales, disponibilidad, licencias y más.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Panel de Inicio | AAAB',
    },
    {
      property: 'og:description',
      content: 'Sección de inicio para árbitros, con acceso a datos personales, disponibilidad, licencias y más.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png', // Asegúrate que esta URL sea real
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
})

// Unificamos la lógica de los links: todos son rutas directas ahora
const menuItems = [
  { to: '/panel-arbitro/datos', title: 'Datos Personales', icon: 'bi bi-person-lines-fill', desc: 'Ver legajo y seguridad.' },
  { to: '/panel-arbitro/disponibilidad', title: 'Disponibilidad', icon: 'bi bi-clock-history', desc: 'Modificá tus horarios.' },
  { to: '/panel-arbitro/licencia', title: 'Solicitar Licencia', icon: 'bi bi-calendar-check', desc: 'Inasistencias con antelación.' },
  { to: '/panel-arbitro/credencial', title: 'Credencial Digital', icon: 'bi bi-person-badge', desc: 'Carnet oficial 2026.' },
  { to: '/panel-arbitro/sanciones', title: 'Tribunal de Ética', icon: 'bi bi-shield-exclamation', desc: 'Consultá tus sanciones.' },
  { to: '/panel-arbitro/rendimiento', title: 'Mi Rendimiento', icon: 'bi bi-graph-up-arrow', desc: 'Estadísticas y partidos.' },
  { to: '/panel-arbitro/indumentaria', title: 'Indumentaria', icon: 'bi bi-bag-fill', desc: 'Realizá pedidos de indumentaria.' },
  { to: '/panel-arbitro/aportes', title: 'Mis Aportes', icon: 'bi bi-cash-coin', desc: 'Consultá el estado de tus aportes.' },
  { href: 'https://www.arbitroshandball.com.ar', title: 'Ref-Flix', icon: 'bi bi-cast', desc: 'Plataforma de videos' },
];
</script>

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