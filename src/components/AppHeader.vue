<template>
  <header class="navbar navbar-expand-xl navbar-light bg-white shadow-sm sticky-top">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/">
        <img :src="logo" alt="AAAB Logo" style="height: 80px" />
      </RouterLink>

      <button
        class="navbar-toggler border-0 shadow-none"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div ref="navbarNav" class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-end align-items-xl-center py-3 py-xl-0" @click="hideNavBar">
          <li class="nav-item"><RouterLink class="nav-link fw-semibold px-xl-3 text-nowrap" to="/">Inicio</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link fw-semibold px-xl-3 text-nowrap" to="/descargas">Descargas</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link fw-semibold px-xl-3 text-nowrap" to="/escuela-arbitros">Escuela de Árbitros</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link fw-semibold px-xl-3 text-nowrap" to="/designaciones">Designaciones</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link fw-semibold px-xl-3 text-nowrap" to="/tribunal-de-etica">Tribunal de Ética</RouterLink></li>
          <li class="nav-item">
            <a class="nav-link fw-semibold px-xl-3 text-nowrap" href="https://arbitroshandball.com.ar/catalogo/" target="_blank" rel="noopener noreferrer">Catálogo Online</a>
          </li>
          <li class="nav-item"><RouterLink class="nav-link fw-semibold px-xl-3 pe-xl-4 text-nowrap" to="/preguntas-frecuentes">Preguntas Frecuentes</RouterLink></li>

          <!-- Usamos mt-3 mt-xl-0 para darle aire arriba en celular, pero dejamos que tenga su ancho natural -->
          <li class="nav-item mt-3 mt-xl-0">
            <RouterLink v-if="!logueado" to="/login-arbitro" class="btn btn-login-nav">
              INICIAR SESIÓN
            </RouterLink>
            <RouterLink v-else :to="rutaPanel" class="btn btn-login-nav">
              MI PANEL
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import logo from '@/assets/fotos/logo.png'
import { auth } from '@/api/auth'

const navbarNav = ref(null)
const logueado = ref(auth.isLoggedIn())

// Propiedad computada para determinar a qué panel ir
const rutaPanel = computed(() => {
  const user = auth.getUser();
  return user?.rol === 'admin' ? '/panel-admin' : '/panel-arbitro';
})

const actualizarEstado = () => {
  logueado.value = auth.isLoggedIn()
}

onMounted(() => {
  window.addEventListener('storage', actualizarEstado)
})

onUnmounted(() => {
  window.removeEventListener('storage', actualizarEstado)
})

const hideNavBar = () => {
  if (navbarNav.value && navbarNav.value.classList.contains('show')) {
    navbarNav.value.classList.remove('show')
  }
}
</script>

<style scoped>
.nav-link {
  transition: color 0.2s ease-in-out;
}

.nav-link:hover, .nav-link.router-link-exact-active {
  color: #dc2626 !important;
}

.btn-login-nav {
  background-color: #dc2626 !important;
  color: #ffffff !important;
  font-weight: bold;
  padding: 8px 24px;
  border-radius: 6px;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.btn-login-nav:hover {
  background-color: #b91c1c !important;
  color: #ffffff !important;
}

</style>
