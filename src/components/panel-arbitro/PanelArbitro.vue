<template>
  <div class="panel-layout">
    <nav class="navbar navbar-dark bg-dark px-3 shadow-sm mb-4">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <span class="navbar-brand fw-bold">Panel Árbitro AAAB</span>
        <button @click="cerrarSesion" class="btn btn-outline-danger btn-sm px-3">Cerrar Sesión</button>
      </div>
    </nav>
    
    <div class="container-fluid px-4 py-2">
      <div class="mx-auto"> <div class="user-header d-flex align-items-center mb-4 p-3 rounded-4 shadow">
          <img :src="urlFoto" @error="(e) => e.target.src = 'https://via.placeholder.com/150'" 
               class="perfil-img me-3 shadow-sm">
          <div class="overflow-hidden">
            <h2 class="text-white fw-bold m-0 text-capitalize text-truncate">
              Hola, {{ arbitro.nombre }}
            </h2>
            <span class="badge bg-danger mt-1">ID Árbitro: {{ arbitro.id }}</span>
          </div>
        </div>

        <div v-if="route.name !== 'PanelInicio'" class="mb-4">
          <button @click="handleVolver" class="btn-volver">
            <i class="bi bi-arrow-left me-2"></i> 
            {{ esRutaProfunda ? 'Volver atrás' : 'Volver al Menú' }}
          </button>
        </div>

        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth } from '@/api/auth'; 
import { useHead } from '@vueuse/head';

const route = useRoute();
const router = useRouter();

// Datos del Árbitro
const arbitro = ref(auth.getUser() || {});
const urlFoto = `https://arbitroshandball.com.ar/resources/carnet-arbitros/${arbitro.value.dni}.webp`;

// Lógica de navegación inteligente (Rutas hijas vs Rutas principales)
const esRutaProfunda = computed(() => {
  // Cuenta los segmentos de la URL. Si hay más de 2 (ej: /panel-arbitro/indumentaria/nuevo), es profunda.
  const segmentos = route.path.split('/').filter(p => p !== '');
  return segmentos.length > 2;
});

const handleVolver = () => {
  if (esRutaProfunda.value) {
    router.back(); // Si está dentro de una sección, vuelve un paso atrás
  } else {
    router.push('/panel-arbitro'); // Si es sección principal, vuelve al dashboard
  }
};

const cerrarSesion = () => {
  auth.logout();
};

onMounted(() => {
  if (auth.isLoggedIn()) {
    auth.startInactivityTimer();
  }
});

// SEO y Redes Sociales
useHead({
  title: 'Panel de Árbitro | AAAB',
  meta: [
    { name: 'description', content: 'Panel de control oficial para árbitros de la AAAB.' },
    { property: 'og:title', content: 'Panel de Árbitro | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' }
  ],
})
</script>

<style scoped>
.panel-layout { 
  min-height: 100vh; 
  background-color: #0f172a; /* Azul oscuro original */
  padding-bottom: 40px;
}

.max-800 { 
  max-width: 900px; 
  margin: 0 auto; 
}

.user-header {
  background: rgba(255, 255, 255, 0.05); /* Fondo sutil traslúcido */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.perfil-img { 
  width: 70px; 
  height: 70px; 
  border-radius: 50%; 
  object-fit: cover; 
  border: 2px solid #dc2626; 
}

.navbar {
  border-bottom: 2px solid #dc2626;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 20px;
  border-radius: 50px;
  transition: 0.3s;
  /* Agregamos esto para que el <button> se vea como el <a> */
  border: none; 
  cursor: pointer;
  font-size: 1rem; /* Ajusta según necesites */
}

.btn-volver:hover {
  background: #dc2626;
}

/* Responsive para el header */
@media (max-width: 576px) {
  .perfil-img { width: 60px; height: 60px; }
  h2 { font-size: 1.25rem; }
}
</style>