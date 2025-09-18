<!-- eslint-disable no-unused-vars -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Modal } from 'bootstrap' // Importa el Modal específico de Bootstrap
import logo from '@/assets/logo.png'
import { api } from '../api/api';
import store from '../stores/auth'
// Referencias para el navbar y el menú
const navbarToggler = ref(null)
const navbarNav = ref(null)

// Referencias para el formulario de login
const loginModal = ref(null)
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const user = ref(null) // Almacena datos del usuario autenticado
const isAuthenticated = ref(false)
// Instancia del modal
const modalInstance = ref(null)

// Método para ocultar el navbar en móvil
const hideNavBar = () => {
  if (navbarNav.value && navbarNav.value.classList.contains('show')) {
    navbarNav.value.classList.remove('show')
  }
}

// Nueva variable para controlar visibilidad del botón
const showLoginButton = ref(false)

// Método para alternar la visibilidad del botón
const toggleLoginButton = () => {
  showLoginButton.value = !showLoginButton.value
  console.log('Botón de login visible:', showLoginButton.value)
}

// Exponer la función para la consola (solo para depuración)
onMounted(() => {
  window.toggleLoginButton = toggleLoginButton
  window.showLoginButton = showLoginButton // Exponer la ref para modificar directamente
})
// Método para mostrar el modal de login
const showLoginModal = () => {
  if (loginModal.value && !modalInstance.value) {
    modalInstance.value = new Modal(loginModal.value, {
      backdrop: true, // Asegura que el backdrop esté habilitado
      keyboard: true, // Permite cerrar con Esc
      focus: true // Asegura que el foco esté en el modal
    })
  }
  if (modalInstance.value) {
    modalInstance.value.show()
    // Forzar el foco en el primer input
    setTimeout(() => {
      const input = loginModal.value?.querySelector('input#username')
      if (input) input.focus()
    }, 100)
  }
}
// Método para manejar el login
const handleLogin = async () => {
    try {
      let d = {
        entity:"login",
        data:{
          username: username.value,
          password: password.value,
        },
      }
      const data = await api.post('', d);
      if (data.user) {
        store.commit('setAuth', { user: data.user });
        isAuthenticated.value = true;
                  // Limpiar formulario y cerrar modal
        username.value = ''
        password.value = ''
        errorMessage.value = ''

        // Cierra el modal usando la instancia modular
        if (modalInstance.value) {
          modalInstance.value.hide()
        }
      }
    } catch (error) {
    errorMessage.value = 'Error de conexión. Intenta de nuevo.'
  }
};

// Método para cerrar sesión
const logout = () => {
  store.dispatch('logout')
  window.location.reload()
}

// Depuración de clics y aseguramiento de interactividad
onMounted(() => {
  setTimeout(() => {
    if (loginModal.value) {
      // Inicializar modal
      modalInstance.value = new Modal(loginModal.value, {
        backdrop: true,
        keyboard: true,
        focus: true
      })
      // Listener para depurar clics
      loginModal.value.addEventListener('click', (e) => {
        console.log('Clic en el modal:', e.target)
      })
      // Forzar interactividad
      loginModal.value.style.pointerEvents = 'auto'
      loginModal.value.querySelector('.modal-dialog').style.pointerEvents = 'auto'
    }
  }, 100)
})

// Limpiar listeners al desmontar
onUnmounted(() => {
  if (modalInstance.value) {
    modalInstance.value.dispose()
  }
})
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
          <!-- Enlace al perfil si está autenticado -->
          <li v-if="user" class="nav-item">
            <RouterLink class="nav-link" to="/arbitro">{{ user.name }}</RouterLink>
          </li>
        </ul>

        <!-- Botón de login/logout -->
        <div class="ms-3" v-if="showLoginButton">
          <button
            v-if="!isAuthenticated"
            class="btn btn-outline-primary"
            type="button"
            @click="showLoginModal"
          >
            Iniciar Sesión
          </button>
          <button
            v-else
            class="btn btn-outline-danger"
            @click="logout"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </header>
  <!-- Modal de login -->
  <div
      ref="loginModal"
      class="modal fade"
      id="loginModal"
      tabindex="-1"
      aria-labelledby="loginModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="loginModalLabel">Iniciar Sesión</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Usuario</label>
                <input
                  v-model="username"
                  type="text"
                  class="form-control"
                  id="username"
                  required
                  autocomplete="username"
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input
                  v-model="password"
                  type="password"
                  class="form-control"
                  id="password"
                  required
                  autocomplete="current-password"
                />
              </div>
              <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>
              <button type="submit" class="btn btn-primary w-100">
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
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
    padding-top: 1rem; /* Espacio extra en móvil */
  }
}

/* Estilos para asegurar que el modal sea interactivo */
.modal {
  z-index: 10000 !important; /* Muy alto para evitar conflictos */
  pointer-events: none; /* Evita clics en el fondo del modal */
}

.modal.show {
  display: block;
}

.modal-dialog {
  z-index: 10001 !important; /* Por encima del backdrop */
  pointer-events: auto !important; /* Habilita clics */
}

.modal-content {
  z-index: 10002 !important; /* Por encima de todo */
  pointer-events: auto !important; /* Habilita clics */
}

.modal-backdrop {
  z-index: 9999 !important; /* Justo debajo del modal */
}

.form-control,
.btn {
  z-index: 10003 !important; /* Asegura que los inputs y botones sean clicables */
  pointer-events: auto !important;
}
</style>
