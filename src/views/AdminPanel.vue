<template>
  <div class="panel-layout">
    <nav class="navbar navbar-dark bg-dark px-3 shadow-sm mb-4">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <span class="navbar-brand fw-bold">Panel Gestión AAAB</span>
        <button @click="cerrarSesion" class="btn btn-outline-danger btn-sm px-3">Cerrar Sesión</button>
      </div>
    </nav>
    
    <div class="container py-2">
      <div class="max-800">
        <div class="user-header d-flex align-items-center mb-4 p-3 rounded-4 shadow">
          <div class="icon-admin-circle me-3">
             <i class="bi bi-person-workspace text-white"></i>
          </div>
          <div class="overflow-hidden">
            <h2 class="text-white fw-bold m-0 text-capitalize text-truncate">
              Hola, {{ admin.nombre || 'Administrador' }}
            </h2>
            <span class="badge bg-danger mt-1">Nivel: {{ admin.rol }}</span>
          </div>
        </div>

        <div v-if="route.name !== 'AdminInicio'" class="mb-4">
          <RouterLink to="/admin" class="btn-volver">
            <i class="bi bi-arrow-left me-2"></i> Volver al Menú Principal
          </RouterLink>
        </div>

        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterView, RouterLink, useRoute } from 'vue-router';
import { auth } from '@/api/auth'; // Importamos tu servicio de autenticación
import { useHead } from '@vueuse/head'

// Título y descripción específicos para la página de panel de inicio de árbitros AAAB
useHead({
  title: 'Panel de Gestión  | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Sección de administración para el panel de inicio de árbitros AAAB.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Panel de Gestión | AAAB',
    },
    {
      property: 'og:description',
      content: 'Sección de administración para el panel de inicio de árbitros AAAB.',
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

const route = useRoute();

// Creamos una referencia reactiva para el administrador
// Obtenemos los datos (id, usuario, nombre, rol) desde el auth
const admin = ref(auth.getUser() || {});

const cerrarSesion = () => {
  auth.logout();
  console.log("Cerrando sesión admin...");
};

onMounted(() => {
  // Al montar, nos aseguramos de que los datos estén actualizados
  if (auth.isLoggedIn()) {
    admin.value = auth.getUser();
  }
});
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
  background: rgba(255,255,255,0.1);
  padding: 8px 20px;
  border-radius: 50px;
  transition: 0.3s;
}

.btn-volver:hover {
  background: #dc2626;
  color: white;
}

/* --- RESPONSIVE --- */
@media (max-width: 576px) {
  .icon-admin-circle { width: 60px; height: 60px; font-size: 1.5rem; }
  h2 { font-size: 1.25rem; }
  .max-800 { padding: 0 10px; }
}
</style>