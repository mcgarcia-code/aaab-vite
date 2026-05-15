<template>
  <div class="login-container d-flex align-items-center justify-content-center px-3">
    <div class="card shadow-lg p-4 p-md-5 login-card animate__animated animate__zoomIn border-0 rounded-4 bg-white">

      <div class="text-center mb-4">
        <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img mb-3">
        <h4 class="fw-bold text-danger mb-1">Recuperar Clave</h4>
        <p class="text-muted small mb-0">Ingresá tu DNI y te enviaremos un enlace a tu correo registrado</p>
      </div>

      <form @submit.prevent="solicitarRecuperacion">
        <div class="mb-4">
          <label class="form-label small fw-bold text-dark">DNI registrado</label>
          <input v-model="dni" type="text" class="form-control form-control-lg custom-input shadow-none fs-6" placeholder="Sin puntos, ej: 30123456" required :disabled="cargando">
        </div>

        <button :disabled="cargando" type="submit" class="btn btn-danger w-100 fw-bold py-3 mt-2 rounded-3 shadow-sm btn-login">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'ENVIANDO...' : 'ENVIAR ENLACE' }}
        </button>
      </form>

      <div class="text-center mt-4 border-top border-light-subtle pt-4">
        <router-link to="/login-arbitro" class="text-muted text-decoration-none fw-bold back-link d-inline-flex align-items-center justify-content-center gap-1 mb-3" style="font-size: 0.85rem;">
          <i class="bi bi-arrow-left-short fs-5"></i> Volver al inicio de sesión
        </router-link>

        <p class="text-muted mb-0" style="font-size: 0.75rem; line-height: 1.4;">
          Si tenés algún problema técnico comunicate con <br>
          <a href="mailto:soporte@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none support-link">soporte@arbitroshandball.com.ar</a>
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
/* ====================================================
   FONDO INSTITUCIONAL (Igual al Login)
   ==================================================== */
.login-container {
  min-height: 100vh;
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
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15) !important;
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
  background-color: #b91c1c !important;
}

.support-link, .back-link {
  transition: color 0.2s ease;
}

.support-link:hover, .back-link:hover {
  color: #b02a37 !important;
}

.back-link:hover {
  text-decoration: underline !important;
}

/* Animación de entrada */
.animate__animated {
  animation-duration: 0.6s;
}
</style>
