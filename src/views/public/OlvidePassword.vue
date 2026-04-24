<template>
  <div class="login-container d-flex align-items-center justify-content-center">
    <div class="card shadow-lg p-4 login-card animate__animated animate__zoomIn">
      <div class="text-center mb-4">
        <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img mb-2">
        <h4 class="fw-bold text-primary">Recuperar Clave</h4>
        <p class="text-muted small">Ingresá tu DNI y te enviaremos un enlace a tu correo registrado</p>
      </div>

      <form @submit.prevent="solicitarRecuperacion">
        <div class="mb-3">
          <label class="form-label small fw-bold">DNI registrado</label>
          <input v-model="dni" type="text" class="form-control" placeholder="Sin puntos, ej: 30123456" required>
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
import { ref, inject } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Recuperar Contraseña | AAAB'
});

const dni = ref('');
const cargando = ref(false);

const notificar = inject('notificar');

const solicitarRecuperacion = async () => {
  if (!dni.value) {
    notificar({
      titulo: 'Atención',
      mensaje: 'Por favor, ingresá tu DNI.',
      tipo: 'danger'
    });
    return;
  }

  cargando.value = true;

  try {
    const res = await api.post({
      entity: 'login_arbitro',
      action: 'solicitarRecuperacion',
      payload: { dni: dni.value.trim() }
    });

    if (res.ok && res.payload.success) {
      notificar({
        titulo: '¡Correo enviado!',
        mensaje: 'Si el DNI está registrado, recibirás un correo con las instrucciones.',
        tipo: 'success'
      });
      dni.value = '';
    } else {
      notificar({
        titulo: 'Error',
        mensaje: res.payload?.message || "Ocurrió un error al procesar la solicitud.",
        tipo: 'danger'
      });
    }
  } catch (err) {
    console.error("Error al solicitar recuperación:", err);
    notificar({
      titulo: 'Error de conexión',
      mensaje: "No se pudo conectar con el servidor.",
      tipo: 'danger'
    });
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
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
