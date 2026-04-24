<template>
  <div class="login-container d-flex align-items-center justify-content-center">
    <div class="card shadow-lg p-4 login-card animate__animated animate__zoomIn">
      <div class="text-center mb-4">
        <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img mb-2">
        <h4 class="fw-bold text-primary">Nueva Contraseña</h4>
        <p class="text-muted small">Creá una nueva clave para tu cuenta</p>
      </div>

      <form @submit.prevent="guardarNuevaPassword">
        <div class="mb-3">
          <label class="form-label small fw-bold">Nueva Contraseña</label>
          <input v-model="password" type="password" class="form-control" placeholder="••••••••" required minlength="6">
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold">Repetir Contraseña</label>
          <input v-model="confirmPassword" type="password" class="form-control" placeholder="••••••••" required minlength="6">
        </div>

        <button :disabled="cargando" type="submit" class="btn btn-primary w-100 fw-bold py-2 mt-2">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA' }}
        </button>
      </form>

      <div class="text-center mt-4 border-top pt-3">
        <p class="support-text mt-2 mb-0">
          Si tenés algún problema técnico comunicate con
          <a href="mailto:soporte@arbitroshandball.com.ar">soporte@arbitroshandball.com.ar</a>
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
