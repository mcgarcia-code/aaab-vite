<template>
  <div class="login-container d-flex align-items-center justify-content-center">
    <div class="card shadow-lg p-4 login-card animate__animated animate__zoomIn">
      <div class="text-center mb-4">
        <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img mb-2">
        <h4 class="fw-bold text-primary">Portal del Árbitro</h4>
        <p class="text-muted small">Ingresá con tu email de registro</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger small p-2 text-center border-0">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="iniciarSesion">
        <div class="mb-3">
          <label class="form-label small fw-bold">Email</label>
          <input v-model="email" type="email" class="form-control" placeholder="ejemplo@mail.com" required>
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label class="form-label small fw-bold mb-0">Contraseña</label>

          <!--
          <router-link to="/olvide-password" class="small text-decoration-none" style="color: #64748b; font-weight: 600;">
            ¿Olvidaste tu clave?
          </router-link>
          -->

          </div>
          <input v-model="password" type="password" class="form-control" placeholder="••••••••" required>
        </div>

        <button :disabled="cargando" type="submit" class="btn btn-primary w-100 fw-bold py-2 mt-2">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'INGRESANDO...' : 'ENTRAR' }}
        </button>
      </form>

      <div class="text-center mt-4 border-top pt-3">
        <p class="text-muted x-small mb-0">Asociación Argentina de Árbitros de Balonmano</p>
        <p class="support-text mt-2">
          Si tenés algún problema técnico comunicate con
          <a href="mailto:soporte@arbitroshandball.com.ar">soporte@arbitroshandball.com.ar</a>
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
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 15px;
  border: none;
}

.text-primary { color: #dc3545 !important; }
.logo-img { max-width: 100px; }
.x-small { font-size: 0.75rem; }

.support-text {
  font-size: 0.7rem;
  color: #64748b;
  line-height: 1.3;
}
.support-text a {
  color: #dc3545;
  text-decoration: none;
  font-weight: bold;
}
.support-text a:hover {
  text-decoration: underline;
}

.btn-primary {
  background-color: #dc3545 !important;
  border: none;
  font-weight: bold;
}

.btn-primary:hover:not(:disabled) {
  background-color: #a71d2a !important;
}

.form-control:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}
</style>
