<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

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
    const res = await axios.post('https://arbitroshandball.com.ar/api/login_arbitro.php', {
      email: email.value,
      password: password.value
    });

    if (res.data.success) {
      // Guardamos los datos del árbitro
      localStorage.setItem('user_aaab', JSON.stringify(res.data.arbitro));
      
      // DISPARAMOS UN EVENTO para que el Header se actualice al instante
      window.dispatchEvent(new Event('storage'));

      // Redirigimos al panel
      router.push('/panel-arbitro');
    } else {
      errorMsg.value = res.data.message || "Error al ingresar";
    }
  } catch (err) {
    // Agregamos el error a la consola para que puedas verlo en F12 si falla algo más
    console.error("Error en login:", err);
    errorMsg.value = "Error de conexión con el servidor";
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="login-container d-flex align-items-center justify-content-center">
    <div class="card shadow-lg p-4 login-card">
      <div class="text-center mb-4">
        <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img mb-2">
        <h4 class="fw-bold text-primary">Portal del Árbitro</h4>
        <p class="text-muted small">Ingresá con tu email de registro</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger small p-2 text-center">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="iniciarSesion">
        <div class="mb-3">
          <label class="form-label small fw-bold">Email</label>
          <input v-model="email" type="email" class="form-control" placeholder="ejemplo@mail.com" required>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold">Contraseña</label>
          <input v-model="password" type="password" class="form-control" placeholder="••••••••" required>
        </div>

        <button :disabled="cargando" type="submit" class="btn btn-primary w-100 fw-bold">
          {{ cargando ? 'Ingresando...' : 'ENTRAR' }}
        </button>
      </form>

      <div class="text-center mt-4 border-top pt-3">
        <p class="text-muted x-small">Asociación Argentina de Árbitros de Balonmano</p>
      </div>
    </div>
  </div>
</template>

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

.text-primary {
  color: #dc3545 !important;
}

.logo-img {
  max-width: 100px;
}

.x-small {
  font-size: 0.75rem;
}

.btn-primary {
  background-color: #dc3545 !important; 
  border: none;
  padding: 10px;
  font-weight: bold;
}

.btn-primary:hover {
  background-color: #a71d2a !important; 
}

.form-control:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}
</style>