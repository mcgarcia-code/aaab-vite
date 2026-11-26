<template>
  <div class="login-container d-flex align-items-center justify-content-center px-3">
    <div class="card shadow-lg p-4 p-md-5 login-card animate__animated animate__zoomIn border-0 rounded-4 bg-white">

      <div class="text-center mb-4">
        <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img mb-3">
        <h4 class="fw-bold text-danger mb-1">Portal del Árbitro</h4>
        <p class="text-muted small mb-0">Ingresá con tu email de registro</p>
      </div>

      <div v-if="avisoSesion && !errorMsg" class="alert alert-warning small p-3 text-center border-0 rounded-3 fw-bold" role="status">
        <i class="bi bi-clock-history me-2"></i>{{ avisoSesion }}
      </div>

      <div v-if="errorMsg" role="alert" class="alert alert-danger small p-3 text-center border-0 rounded-3 shadow-sm fw-bold">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMsg }}
      </div>

      <form @submit.prevent="iniciarSesion">
        <div class="mb-3">
          <label class="form-label small fw-bold text-dark">Email o usuario del curso</label>
          <input aria-label="Email o usuario del curso" v-model="email" type="email" class="form-control form-control-lg custom-input shadow-none fs-6" placeholder="ejemplo@mail.com o usuario@cursoaaab.com.ar" required :disabled="cargando">
        </div>

        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label class="form-label small fw-bold text-dark mb-0">Contraseña</label>
            </div>
          <div class="position-relative">
            <input id="login-password" aria-label="Contraseña" v-model="password" :type="verPassword ? 'text' : 'password'" autocomplete="current-password"
                   class="form-control form-control-lg custom-input shadow-none fs-6 input-con-ojo" placeholder="••••••••" required :disabled="cargando">
            <button type="button" class="btn-ver-password" :disabled="cargando"
                    :title="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    :aria-pressed="verPassword" aria-controls="login-password"
                    @click="verPassword = !verPassword">
              <i class="bi" :class="verPassword ? 'bi-eye-slash' : 'bi-eye'" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <button :disabled="cargando" type="submit" class="btn btn-danger w-100 fw-bold py-3 mt-2 rounded-pill shadow-sm btn-login">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'INGRESANDO...' : 'ENTRAR AL PORTAL' }}
        </button>

        <div class="text-center mt-3">
          <router-link to="/olvide-password" class="text-danger small fw-bold text-decoration-none support-link">
            ¿Olvidó su contraseña?
          </router-link>
        </div>
      </form>

      <div class="text-center mt-4 pt-4 border-top border-light-subtle">
        <p class="text-muted fw-bold mb-1 texto-075">ASOCIACIÓN ARGENTINA DE ÁRBITROS DE BALONMANO</p>
        <p class="text-muted mb-0 texto-075" style="line-height: 1.4;">
          Si tenés algún problema técnico comunicate con <br>
          <a href="mailto:soporte@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none support-link">soporte@arbitroshandball.com.ar</a>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/api/auth'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Iniciar Sesión | AAAB',
  meta: [
    { name: 'description', content: 'Inicia sesión en tu cuenta de árbitro para acceder a tu panel de control.' },
    { property: 'og:title', content: 'Iniciar Sesión | AAAB' },
    { property: 'og:description', content: 'Inicia sesión en tu cuenta de árbitro para acceder a tu panel de control.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const router = useRouter()
const email = ref('')
const password = ref('')
const verPassword = ref(false)   // ojo del campo contraseña: mostrar / ocultar lo escrito
const errorMsg = ref('')
const cargando = ref(false)

// Si se llegó al login porque la sesión se cerró sola, se avisa el motivo una vez
const MENSAJES_SESION = {
  inactividad: 'Tu sesión se cerró por inactividad. Volvé a ingresar.',
  vencida: 'Tu sesión venció. Volvé a ingresar.'
}
const avisoSesion = ref(MENSAJES_SESION[auth.tomarAvisoSesion()] || '')

const iniciarSesion = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = "Completá todos los campos"
    return
  }

  cargando.value = true
  errorMsg.value = ''

  try {
    const res = await api.post({
      entity: 'login_arbitro',
      action: 'login',
      payload: {
        email: email.value.trim(),
        password: password.value
      }
    })

    if (res.ok && res.payload.success) {
      const userData = {
        arbitro: res.payload.arbitro,
        token: res.payload.token
      }
      auth.setUser(userData)

      if (res.payload.admin) {
        router.push('/panel-admin')
      } else if (res.payload.curso) {
        router.push('/panel-curso')
      } else {
        router.push('/panel-arbitro')
      }

    } else {
      errorMsg.value = res.payload?.message || res.message || "Credenciales incorrectas"
    }
  } catch (err) {
    console.error("Error en login:", err)
    errorMsg.value = "Error de conexión con el servidor"
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
/* ====================================================
   FONDO INSTITUCIONAL
   ==================================================== */
.login-container {
  min-height: 100vh;
  /* Mantenemos tu gradiente que es el tono azulado exacto del panel (#0f172a) */
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

/* ====================================================
   TARJETA Y LOGO
   ==================================================== */
.login-card {
  width: 100%;
  max-width: 420px;
}

.logo-img {
  max-width: 90px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

/* ====================================================
   INPUTS PERSONALIZADOS
   ==================================================== */
.custom-input {
  background-color: var(--o-superficie, #f8fafc);
  border: 1px solid var(--o-borde, #e2e8f0);
  transition: all 0.3s ease;
}

.custom-input:focus {
  background-color: var(--o-tarjeta, #ffffff);
  border-color: #dc2626; /* Borde rojo al enfocar */
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15) !important; /* Resplandor rojo suave */
}

/* Ojo para ver la contraseña: dentro del campo, a la derecha (el campo deja lugar con padding) */
.input-con-ojo {
  padding-right: 3rem;
}

.btn-ver-password {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--o-texto-medio, #64748b);
  font-size: 1.15rem;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.btn-ver-password:hover:not(:disabled),
.btn-ver-password:focus-visible {
  color: #dc2626;
  background-color: var(--o-rojo-fondo, #fff5f5);
  outline: none;
}

/* ====================================================
   EFECTOS HOVER (BOTÓN Y LINKS)
   ==================================================== */
.btn-login {
  transition: all 0.3s ease;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(220, 38, 38, 0.3) !important;
  background-color: #b91c1c !important; /* Rojo un poco más oscuro */
}

.support-link {
  transition: color 0.2s ease;
}

.support-link:hover {
  color: var(--o-rojo-texto, #b02a37) !important;
  text-decoration: underline !important;
}

</style>
