<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import logo from '@/assets/fotos/logo.png'

// Referencias para el navbar (cerrar menú en móvil)
const navbarNav = ref(null)

// Detectamos si el árbitro está logueado para cambiar el texto del botón
const estaLogueado = computed(() => {
  return !!localStorage.getItem('user_aaab')
})

const hideNavBar = () => {
  if (navbarNav.value && navbarNav.value.classList.contains('show')) {
    navbarNav.value.classList.remove('show')
  }
}
</script>

<template>
  <header class="navbar navbar-expand-xl navbar-light bg-white shadow-sm sticky-top">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/">
        <img :src="logo" alt="AAAB Logo" style="height: 80px" />
      </RouterLink>

      <button
        class="navbar-toggler"
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
        <ul class="navbar-nav ms-auto" @click="hideNavBar">
          <li class="nav-item"><RouterLink class="nav-link" to="/">Inicio</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/descargas">Descargas</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/escuela-arbitros">Escuela de Árbitros</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/designaciones">Designaciones</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/tribunal-de-etica">Tribunal de Ética</RouterLink></li>
          <li class="nav-item">
            <a class="nav-link" href="https://arbitroshandball.com.ar/catalogo/" target="_blank" rel="noopener noreferrer">Catálogo Online</a>
          </li>
          <li class="nav-item"><RouterLink class="nav-link" to="/preguntas-frecuentes">Preguntas Frecuentes</RouterLink></li>
          
          <li class="nav-item">
            <RouterLink v-if="!estaLogueado" to="/login-arbitro" class="btn btn-login-nav ms-lg-3">
              INICIAR SESIÓN
            </RouterLink>
            <RouterLink v-else to="/panel-arbitro" class="btn btn-login-nav ms-lg-3">
              MI PANEL
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-link:hover, .nav-link.router-link-exact-active {
  color: #dc2626 !important;
}

.btn-login-nav {
  background-color: #dc2626 !important;
  color: #ffffff !important;
  font-weight: bold;
  padding: 8px 20px;
  border-radius: 6px;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.3s ease;
}

.btn-login-nav:hover {
  background-color: #b91c1c !important;
}

@media (max-width: 1199.98px) {
  .navbar-collapse .navbar-nav {
    align-items: flex-end;
    padding: 1rem 0;
  }
  .btn-login-nav {
    width: 100%;
    text-align: center;
    margin-top: 10px;
  }
}
</style>