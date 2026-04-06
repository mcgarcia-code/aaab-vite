<template>
  <div class="panel-layout">
    <nav class="navbar navbar-dark bg-dark px-3 shadow-sm mb-4">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <span class="navbar-brand fw-bold">Panel Gestión AAAB</span>
        <button @click="cerrarSesion" class="btn btn-outline-danger btn-sm px-3">Cerrar Sesión</button>
      </div>
    </nav>
    
    <div class="container-fluid px-4 py-2">
      <div class="mx-auto">
        <div class="user-header d-flex align-items-center mb-4 p-3 rounded-4 shadow">
          <div class="icon-admin-circle me-3">
             <i class="bi bi-person-workspace text-white"></i>
          </div>
          <div class="overflow-hidden">
            <h2 class="text-white fw-bold m-0 text-capitalize text-truncate">
              Hola, {{ admin.nombre || 'Administrador' }}👋
            </h2>
            <span class="badge bg-danger mt-1">Nivel: {{ admin.rol }}</span>
          </div>
        </div>

        <div v-if="route.name !== 'AdminInicio'" class="mb-4">
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
import { RouterView, useRoute, useRouter } from 'vue-router'; // Importamos useRouter
import { auth } from '@/api/auth';
import { useHead } from '@vueuse/head';

const route = useRoute();
const router = useRouter(); // Instanciamos el router

// 1. Detectar si estamos en un "hijo del hijo"
// Si la URL tiene más de 2 segmentos (ej: /panel-admin/usuarios/editar), es profunda.
const esRutaProfunda = computed(() => {
  const segmentos = route.path.split('/').filter(p => p !== '');
  return segmentos.length > 2;
});

// 2. Función lógica del botón
const handleVolver = () => {
  if (esRutaProfunda.value) {
    router.back(); // Si es hijo de una card, simplemente vuelve atrás
  } else {
    router.push('/panel-admin'); // Si es una sección principal, vuelve al inicio
  }
};

const admin = ref(auth.getUser() || {});

const cerrarSesion = () => {
  auth.logout();
};

onMounted(() => {
  if (auth.isLoggedIn()) {
    admin.value = auth.getUser();
  }
});

// Configuración de Head (se mantiene igual)
useHead({
  title: 'Panel de Gestión  | AAAB',
  meta: [
    { name: 'description', content: 'Sección de administración para el panel de inicio de árbitros AAAB.' },
    { property: 'og:title', content: 'Panel de Gestión | AAAB' },
    { property: 'og:description', content: 'Sección de administración para el panel de inicio de árbitros AAAB.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})
</script>

<style scoped>
.panel-layout { 
  min-height: 100vh; 
  background-color: #0f172a; 
  padding-bottom: 40px;
}


.user-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.icon-admin-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dc2626;
  font-size: 2rem;
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
  color: white;
  /* Opcional: un pequeño levantamiento para que se sienta más interactivo */
  transform: translateY(-1px);
}

/* --- RESPONSIVE --- */
@media (max-width: 576px) {
  .icon-admin-circle { width: 60px; height: 60px; font-size: 1.5rem; }
  h2 { font-size: 1.25rem; }
}
</style>