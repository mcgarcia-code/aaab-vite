<template>
  <div class="login-container d-flex align-items-center justify-content-center">
    <div class="card shadow-lg p-4 login-card animate__animated animate__zoomIn">
      <div class="text-center mb-4">
        <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img mb-2">
        <h4 class="fw-bold text-primary">Nueva Contraseña</h4>
        <p class="text-muted small">Creá una nueva clave para tu cuenta</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger small p-2 text-center border-0">
        {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="alert alert-success small p-2 text-center border-0">
        {{ successMsg }}
      </div>

      <form v-if="!successMsg" @submit.prevent="guardarNuevaPassword">
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

      <div v-if="successMsg" class="mt-3">
        <button @click="router.push('/login-arbitro')" class="btn btn-primary w-100 fw-bold py-2">
          IR A INICIAR SESIÓN
        </button>
      </div>

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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Crear Nueva Contraseña | AAAB'
});

const router = useRouter();
const route = useRoute(); // Para capturar el ?token= de la URL

const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const cargando = ref(false);

// Capturamos el token apenas se monta el componente
onMounted(() => {
  token.value = route.query.token || '';
  if (!token.value) {
    errorMsg.value = "Enlace inválido. Faltan credenciales de seguridad.";
  }
});

const guardarNuevaPassword = async () => {
  if (!token.value) {
    errorMsg.value = "No se detectó un token de seguridad válido.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = "Las contraseñas no coinciden.";
    return;
  }

  if (password.value.length < 6) {
    errorMsg.value = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  cargando.value = true;
  errorMsg.value = '';

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
      successMsg.value = "¡Tu contraseña fue actualizada correctamente!";
      password.value = '';
      confirmPassword.value = '';
    } else {
      errorMsg.value = res.payload?.message || "El enlace expiró o es inválido.";
    }
  } catch (err) {
    console.error("Error al restablecer:", err);
    errorMsg.value = "Error de conexión con el servidor.";
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
/* Los mismos estilos compartidos */
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
