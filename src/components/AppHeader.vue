<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
// 1. Se importa el logo para que Vite lo procese
import logo from '@/assets/logo.png'

// 2. Se crean las referencias para acceder al botón y al menú desde el script
const navbarToggler = ref(null)
const navbarNav = ref(null)

// 3. Se crea el método hideNavBar() que pediste
const hideNavBar = () => {
  // Se verifica si el menú está desplegado
  if (navbarNav.value && navbarNav.value.classList.contains('show')) {
    // Si lo está, se simula un clic en el botón para cerrarlo
    navbarToggler.value.click()
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
        ref="navbarToggler"
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
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Inicio</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/descargas">Descargas</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/cursos">Curso de Árbitros</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/designaciones">Designaciones</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/tribunal-de-etica">Tribunal de Ética</RouterLink>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              href="https://arbitroshandball.com.ar/catalogo/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Catálogo Online
            </a>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Código CSS limpio y sin caracteres invisibles */
.navbar-brand img {
  margin-right: 15px;
}

.nav-link {
  transition: color 0.2s ease-in-out;
}

.nav-link:hover {
  color: #dc3545 !important; /* Rojo fuerte */
}

.nav-link.router-link-exact-active {
  color: #dc3545 !important; /* Rojo fuerte */
  font-weight: bold;
}

@media (max-width: 1199.98px) {
  .navbar-collapse .navbar-nav {
    align-items: flex-end;
    padding-top: 1rem; /* Un poco de espacio extra en móvil */
  }
}
</style>
