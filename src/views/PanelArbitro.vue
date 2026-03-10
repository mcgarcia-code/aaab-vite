<template>
  <div class="panel-container p-3">
    <div class="container max-800">
      
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center">
          <img :src="urlFoto" @error="(e) => e.target.src = 'https://via.placeholder.com/150'" 
               class="perfil-img me-3 shadow-sm">
          <div>
            <h2 class="text-white fw-bold m-0 text-capitalize">Hola, {{ arbitro.nombre }}</h2>
            <span class="badge bg-danger mt-1">ID: {{ arbitro.id }}</span>
          </div>
        </div>
        <button @click="cerrarSesion" class="btn btn-outline-light btn-sm px-3">Salir</button>
      </div>

      <div v-if="$route.name !== 'PanelInicio'" class="mb-3">
        <RouterLink to="/panel-arbitro" class="btn btn-link text-white p-0 text-decoration-none">
          <i class="bi bi-arrow-left"></i> Volver al Menú
        </RouterLink>
      </div>

      <RouterView />

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const arbitro = ref(JSON.parse(localStorage.getItem('user_aaab') || '{}'));
const urlFoto = `https://arbitroshandball.com.ar/assets/carnet-arbitros/${arbitro.value.dni}.webp`;

const cerrarSesion = () => {
  localStorage.removeItem('user_aaab');
  window.dispatchEvent(new Event('storage'));
  router.push('/login-arbitro');
};
</script>

<style scoped>
/* Solo estilos del Layout */
.panel-container { min-height: 100vh; background-color: #0f172a; padding-top: 20px !important; }
.max-800 { max-width: 800px; margin: 0 auto; }
.perfil-img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #dc2626; background: #fff; }
</style>