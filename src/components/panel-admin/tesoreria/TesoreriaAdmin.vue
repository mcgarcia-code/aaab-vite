
<template>
  <div class="container py-4 animate__animated animate__fadeIn">
    
    <div class="text-center mb-5">
      <i class="bi bi-cash-stack text-danger main-icon"></i>
      <h2 class="fw-bold text-white mt-2">Tesorería</h2>
      <p class="small text-white opacity-75 m-0">Gestión contable y control de recursos</p>
    </div>

    <div class="row g-4 justify-content-center">
      <div v-for="item in opcionesTesoreria" :key="item.title" class="col-12 col-sm-6">
        <RouterLink :to="item.to" class="text-decoration-none h-100 d-block">
          <div class="menu-card shadow-lg">
            <div class="icon-circle">
              <i :class="[item.icon, 'text-danger']"></i>
            </div>
            <h4 class="mt-3 fw-bold text-dark">{{ item.title }}</h4>
            <p class="small text-muted m-0 px-2">{{ item.desc }}</p>
          </div>
        </RouterLink>
      </div>
    </div>

  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head'

// Título y descripción específicos para la página de Tesorería AAAB
useHead({
  title: 'Tesorería | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Administra y controla los aspectos internos de la asociación desde un panel centralizado.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Tesorería | AAAB',
    },
    {
      property: 'og:description',
      content: 'Administra y controla los aspectos internos de la asociación desde un panel centralizado.',
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

const opcionesTesoreria = [
  { 
    to: '/panel-admin/tesoreria/datos-personales', 
    title: 'Datos Personales', 
    icon: 'bi bi-person-lines-fill', 
    desc: 'Información personal de los miembros.' 
  },
  { 
    to: '/panel-admin/tesoreria/aportes', 
    title: 'Aportes', 
    icon: 'bi bi-cash-coin', 
    desc: 'Registrar pagos de cuotas y aportes mensuales.' 
  },
  { 
    to: '/panel-admin/tesoreria/indumentaria', 
    title: 'Indumentaria', 
    icon: 'bi bi-bag-check', 
    desc: 'Control de inventario, talles y pedidos.' 
  },

];
</script>


<style scoped>
/* Quitamos los estilos de full-screen y mantenemos la estética de las cards */
.main-icon {
  font-size: 3.2rem;
  filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.3));
}

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
  cursor: pointer;
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
  font-size: 2.8rem;
}

/* Efecto Hover idéntico al InicioPanel */
.menu-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.3) !important;
  border-bottom: 6px solid #dc2626;
}

.menu-card:hover .icon-circle {
  background: #dc2626;
}

.menu-card:hover i {
  color: white !important;
  transform: scale(1.1);
}

.text-danger { color: #dc2626 !important; }

@media (max-width: 576px) {
  .menu-card { padding: 30px 15px; }
  .icon-circle { width: 70px; height: 70px; }
  .menu-card i { font-size: 2rem; }
  .main-icon { font-size: 2.5rem; }
}
</style>