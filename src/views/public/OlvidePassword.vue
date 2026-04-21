<template>
  <div class="login-container d-flex align-items-center justify-content-center">
    <div class="card shadow-lg p-4 login-card animate__animated animate__zoomIn">
      <div class="text-center mb-4">
        <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img mb-2">
        <h4 class="fw-bold text-primary">Recuperar Clave</h4>
        <p class="text-muted small">Ingresá tu email y te enviaremos un enlace</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger small p-2 text-center border-0">
        {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="alert alert-success small p-2 text-center border-0">
        {{ successMsg }}
      </div>

      <form v-if="!successMsg" @submit.prevent="solicitarRecuperacion">
        <div class="mb-3">
          <label class="form-label small fw-bold">Email registrado</label>
          <input v-model="email" type="email" class="form-control" placeholder="ejemplo@mail.com" required>
        </div>

        <button :disabled="cargando" type="submit" class="btn btn-primary w-100 fw-bold py-2 mt-2">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'ENVIANDO...' : 'ENVIAR ENLACE' }}
        </button>
      </form>

      <div class="text-center mt-4 border-top pt-3">
        <router-link to="/login-arbitro" class="text-decoration-none small fw-bold" style="color: #64748b;">
          Volver al inicio de sesión
        </router-link>
        <p class="support-text mt-3 mb-0">
          Si tenés algún problema técnico comunicate con
          <a href="mailto:soporte@arbitroshandball.com.ar">soporte@arbitroshandball.com.ar</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Recuperar Contraseña | AAAB',
  meta: [
    { name: 'description', content: 'Recupera el acceso a tu cuenta de árbitro de la AAAB.' },
    { property: 'og:title', content: 'Recuperar Contraseña | AAAB' }
  ]
});

const email = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const cargando = ref(false);

const solicitarRecuperacion = async () => {
  if (!email.value) {
    errorMsg.value = "Por favor, ingresá tu email";
    return;
  }

  cargando.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const res = await api.post({
      entity: 'login_arbitro',
      action: 'solicitarRecuperacion',
      payload: { email: email.value.trim() }
    });

    if (res.ok && res.payload.success) {
      successMsg.value = "Si el email está registrado, recibirás un correo en breve con las instrucciones.";
      email.value = '';
    } else {
      errorMsg.value = res.payload?.message || "Ocurrió un error al procesar la solicitud.";
    }
  } catch (err) {
    console.error("Error al solicitar recuperación:", err);
    errorMsg.value = "Error de conexión con el servidor.";
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
/* Exactamente los mismos estilos para mantener la coherencia */
.login-container { min-height: 100vh; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 20px; }
.login-card { width: 100%; max-width: 400px; border-radius: 15px; border: none; }
.text-primary { color: #dc3545 !important; }
.logo-img { max-width: 100px; }
.support-text { font-size: 0.7rem; color: #64748b; line-height: 1.3; }
.support-text a { color: #dc3545; text-decoration: none; font-weight: bold; }
.support-text a:hover { text-decoration: underline; }
.btn-primary { background-color: #dc3545 !important; border: none; font-weight: bold; }
.btn-primary:hover:not(:disabled) { background-color: #a71d2a !important; }
.form-control:focus { border-color: #dc3545; box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25); }
</style>
