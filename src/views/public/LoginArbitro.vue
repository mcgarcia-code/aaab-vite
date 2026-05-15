<template>
  <div class="login-container d-flex align-items-center justify-content-center px-3">
    <div class="card shadow-lg p-4 p-md-5 login-card animate__animated animate__zoomIn border-0 rounded-4 bg-white">

      <div class="text-center mb-4">
        <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img mb-3">
        <h4 class="fw-bold text-danger mb-1">Portal del Árbitro</h4>
        <p class="text-muted small mb-0">Ingresá con tu email de registro</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger small p-3 text-center border-0 rounded-3 shadow-sm fw-bold">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMsg }}
      </div>

      <form @submit.prevent="iniciarSesion">
        <div class="mb-3">
          <label class="form-label small fw-bold text-dark">Email</label>
          <input v-model="email" type="email" class="form-control form-control-lg custom-input shadow-none fs-6" placeholder="ejemplo@mail.com" required :disabled="cargando">
        </div>

        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label class="form-label small fw-bold text-dark mb-0">Contraseña</label>
            </div>
          <input v-model="password" type="password" class="form-control form-control-lg custom-input shadow-none fs-6" placeholder="••••••••" required :disabled="cargando">
        </div>

        <button :disabled="cargando" type="submit" class="btn btn-danger w-100 fw-bold py-3 mt-2 rounded-3 shadow-sm btn-login">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'INGRESANDO...' : 'ENTRAR AL PORTAL' }}
        </button>
      </form>

      <div class="text-center mt-4 pt-4 border-top border-light-subtle">
        <p class="text-muted fw-bold mb-1" style="font-size: 0.75rem;">ASOCIACIÓN ARGENTINA DE ÁRBITROS DE BALONMANO</p>
        <p class="text-muted mb-0" style="font-size: 0.75rem; line-height: 1.4;">
          Si tenés algún problema técnico comunicate con <br>
          <a href="mailto:soporte@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none support-link">soporte@arbitroshandball.com.ar</a>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/api/auth';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Iniciar Sesión | AAAB',
  meta: [
    { name: 'description', content: 'Inicia sesión en tu cuenta de árbitro para acceder a tu panel de control.' },
    { property: 'og:title', content: 'Iniciar Sesión | AAAB' },
    { property: 'og:description', content: 'Inicia sesión en tu cuenta de árbitro para acceder a tu panel de control.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const cargando = ref(false);

const iniciarSesion = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = "Completá todos los campos";
    return;
  }

  cargando.value = true;
  errorMsg.value = '';

  try {
    const res = await api.post({
      entity: 'login_arbitro',
      action: 'login',
      payload: {
        email: email.value.trim(),
        password: password.value
      }
    });

    if (res.ok && res.payload.success) {
      const userData = {
        arbitro: res.payload.arbitro,
        token: res.payload.token
      }
      auth.setUser(userData);

      if (res.payload.admin) {
        router.push('/panel-admin');
      } else {
        router.push('/panel-arbitro');
      }

    } else {
      errorMsg.value = res.payload?.message || res.message || "Credenciales incorrectas";
    }
  } catch (err) {
    console.error("Error en login:", err);
    errorMsg.value = "Error de conexión con el servidor";
  } finally {
    cargando.value = false;
  }
};
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
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.custom-input:focus {
  background-color: #ffffff;
  border-color: #ef4444; /* Borde rojo al enfocar */
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15) !important; /* Resplandor rojo suave */
}

/* ====================================================
   EFECTOS HOVER (BOTÓN Y LINKS)
   ==================================================== */
.btn-login {
  transition: all 0.3s ease;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(220, 53, 69, 0.3) !important;
  background-color: #b91c1c !important; /* Rojo un poco más oscuro */
}

.support-link {
  transition: color 0.2s ease;
}

.support-link:hover {
  color: #b02a37 !important;
  text-decoration: underline !important;
}

/* Animación de entrada */
.animate__animated {
  animation-duration: 0.6s;
}
</style>
