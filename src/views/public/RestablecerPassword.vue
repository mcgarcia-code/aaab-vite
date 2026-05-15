<template>
  <div class="login-container d-flex align-items-center justify-content-center px-3">
    <div class="card shadow-lg p-4 p-md-5 login-card animate__animated animate__zoomIn border-0 rounded-4 bg-white">

      <div class="text-center mb-4">
        <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img mb-3">
        <h4 class="fw-bold text-danger mb-1">Nueva Contraseña</h4>
        <p class="text-muted small mb-0">Creá una nueva clave para tu cuenta</p>
      </div>

      <form @submit.prevent="guardarNuevaPassword">
        <div class="mb-3">
          <label class="form-label small fw-bold text-dark">Nueva Contraseña</label>
          <input v-model="password" type="password" class="form-control form-control-lg custom-input shadow-none fs-6" placeholder="••••••••" required minlength="6" :disabled="cargando">
        </div>

        <div class="mb-4">
          <label class="form-label small fw-bold text-dark">Repetir Contraseña</label>
          <input v-model="confirmPassword" type="password" class="form-control form-control-lg custom-input shadow-none fs-6" placeholder="••••••••" required minlength="6" :disabled="cargando">
        </div>

        <button :disabled="cargando" type="submit" class="btn btn-danger w-100 fw-bold py-3 mt-2 rounded-3 shadow-sm btn-login">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA' }}
        </button>
      </form>

      <div class="text-center mt-4 border-top border-light-subtle pt-4">
        <p class="text-muted mb-0" style="font-size: 0.75rem; line-height: 1.4;">
          Si tenés algún problema técnico comunicate con <br>
          <a href="mailto:soporte@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none support-link">soporte@arbitroshandball.com.ar</a>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Crear Nueva Contraseña | AAAB'
});

const router = useRouter();
const route = useRoute();

const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const cargando = ref(false);

const notificar = inject('notificar');

onMounted(() => {
  token.value = route.query.token || '';
  if (!token.value) {
    notificar({
      titulo: 'Enlace inválido',
      mensaje: 'Faltan credenciales de seguridad en la URL.',
      tipo: 'danger'
    });
  }
});

const guardarNuevaPassword = async () => {
  if (!token.value) {
    notificar({
      titulo: 'Atención',
      mensaje: 'No se detectó un token de seguridad válido.',
      tipo: 'danger'
    });
    return;
  }

  if (password.value !== confirmPassword.value) {
    notificar({
      titulo: 'Error',
      mensaje: 'Las contraseñas no coinciden.',
      tipo: 'danger'
    });
    return;
  }

  if (password.value.length < 6) {
    notificar({
      titulo: 'Contraseña muy corta',
      mensaje: 'La contraseña debe tener al menos 6 caracteres.',
      tipo: 'danger'
    });
    return;
  }

  cargando.value = true;

  try {
    const res = await api.post({
      entity: 'login_arbitro',
      action: 'resetearPassword',
      payload: {
        token: token.value,
        password: password.value
      }
    });

    if (res.ok && res.payload.success) {
      notificar({
        titulo: '¡Contraseña Actualizada!',
        mensaje: 'Tu clave se cambió con éxito. Ya podés ingresar con tu nueva contraseña.',
        tipo: 'success'
      });

      router.push('/login-arbitro');

    } else {
      notificar({
        titulo: 'Error',
        mensaje: res.payload?.message || "El enlace expiró o es inválido.",
        tipo: 'danger'
      });
    }
  } catch (err) {
    console.error("Error al restablecer:", err);
    notificar({
      titulo: 'Error de conexión',
      mensaje: 'No se pudo conectar con el servidor.',
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
