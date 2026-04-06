<template>
  <div class="panel-layout">
    <nav class="navbar navbar-dark bg-dark px-3 shadow-sm mb-4">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <span class="navbar-brand fw-bold">Panel Árbitro AAAB</span>
        <button @click="cerrarSesion" class="btn btn-outline-danger btn-sm px-3">Cerrar Sesión</button>
      </div>
    </nav>
    
    <div class="container-fluid px-4 py-2">
      <div class="mx-auto"> 
        <div class="user-header d-flex align-items-center mb-4 p-3 rounded-4 shadow">
          <img :src="urlFoto" @error="(e) => e.target.src = 'https://via.placeholder.com/150'" 
               class="perfil-img me-3 shadow-sm">
          
          <!-- Quitamos el overflow-hidden de este div -->
          <div>
            <!-- Quitamos text-truncate, usamos nombreFormateado y agregamos la clase saludo-texto -->
            <h2 class="text-white fw-bold m-0 saludo-texto">
              Hola, {{ nombreFormateado }} 👋
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

// Computada para formatear el nombre correctamente (De "MARIANA CELESTE" a "Mariana Celeste")
const nombreFormateado = computed(() => {
  const nombre = arbitro.value.nombre || '';
  return nombre.toLowerCase().replace(/\b\w/g, letra => letra.toUpperCase());
});

// Lógica de navegación inteligente
const esRutaProfunda = computed(() => {
  const segmentos = route.path.split('/').filter(p => p !== '');
  return segmentos.length > 2;
});

const handleVolver = () => {
  if (esRutaProfunda.value) {
    router.back();
  } else {
    router.push('/panel-arbitro');
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
  background-color: #0f172a; 
  padding-bottom: 40px;
}

.max-800 { 
  max-width: 900px; 
  margin: 0 auto; 
}

.user-header {
  background: rgba(255, 255, 255, 0.05); 
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
  border: none; 
  cursor: pointer;
  font-size: 1rem; 
}

.btn-volver:hover {
  background: #dc2626;
}

/* Control de altura de línea para que se vea bien si envuelve */
.saludo-texto {
  line-height: 1.2;
}

/* Responsive para el header */
@media (max-width: 576px) {
  .perfil-img { width: 60px; height: 60px; }
  /* Achicamos la fuente ligeramente en celular para dar más espacio */
  .saludo-texto { font-size: 1.15rem; margin-bottom: 3px !important; }
}
</style>