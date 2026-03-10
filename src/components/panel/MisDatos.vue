<script setup>
import { ref } from 'vue';
import axios from 'axios';

const arbitro = ref(JSON.parse(localStorage.getItem('user_aaab') || '{}'));

const passNueva = ref('');
const passConfirmar = ref('');
const solicitudCambio = ref(''); // Para el nuevo cuadro de cambios sensibles
const mensaje = ref({ texto: '', tipo: '' });
const cargando = ref(false);

const actualizarPassword = async () => {
  if (passNueva.value.length < 6) {
    mensaje.value = { texto: "La contraseña debe tener al menos 6 caracteres.", tipo: 'danger' };
    return;
  }
  if (passNueva.value !== passConfirmar.value) {
    mensaje.value = { texto: "Las contraseñas no coinciden.", tipo: 'danger' };
    return;
  }

  cargando.value = true;
  try {
    const res = await axios.post('https://arbitroshandball.com.ar/api/actualizar_password.php', {
      id_arbitro: arbitro.value.id,
      password: passNueva.value
    });
    if (res.data.success) {
      mensaje.value = { texto: "Contraseña actualizada correctamente.", tipo: 'success' };
      passNueva.value = ''; passConfirmar.value = '';
    } else {
      mensaje.value = { texto: res.data.message, tipo: 'danger' };
    }
  } catch {
    mensaje.value = { texto: "Error al conectar con el servidor.", tipo: 'danger' };
  } finally {
    cargando.value = false;
  }
};

const enviarSolicitudRectificacion = async () => {
  if (!solicitudCambio.value.trim()) return;
  cargando.value = true;
  try {
    // Usamos el mismo PHP de disponibilidad o uno similar
    const res = await axios.post('https://arbitroshandball.com.ar/api/solicitar_disponibilidad.php', {
      id_arbitro: arbitro.value.id,
      nombre: arbitro.value.nombre,
      apellido: arbitro.value.apellido,
      grupo: arbitro.value.grupo,
      mensaje: "SOLICITUD RECTIFICACIÓN DATOS: " + solicitudCambio.value
    });
    if (res.data.success) {
      mensaje.value = { texto: "Solicitud de rectificación enviada.", tipo: 'success' };
      solicitudCambio.value = '';
    }
  } catch {
    mensaje.value = { texto: "Error al enviar solicitud.", tipo: 'danger' };
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="animate__animated animate__fadeIn">
    
    <div class="card shadow border-0 mb-4">
      <div class="card-header bg-white py-3">
        <h4 class="text-danger fw-bold m-0">Legajo Personal</h4>
      </div>
      <div class="card-body">
        
        <div v-if="mensaje.texto" :class="`alert alert-${mensaje.tipo} small py-2 mb-4`" role="alert">
          {{ mensaje.texto }}
        </div>

        <h6 class="fw-bold text-dark border-bottom pb-2 mb-3">Información Personal</h6>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <label class="text-muted x-small d-block text-uppercase">Nombre y Apellido</label>
            <span class="fw-bold text-dark">{{ arbitro.nombre }} {{ arbitro.apellido }}</span>
          </div>
          <div class="col-md-6">
            <label class="text-muted x-small d-block text-uppercase">DNI</label>
            <span class="fw-bold text-dark">{{ arbitro.dni }}</span>
          </div>
          <div class="col-md-6">
            <label class="text-muted x-small d-block text-uppercase">Email</label>
            <span class="fw-bold text-dark">{{ arbitro.email }}</span>
          </div>
          <div class="col-md-6">
            <label class="text-muted x-small d-block text-uppercase">Celular</label>
            <span class="fw-bold text-dark">{{ arbitro.celular || 'No registrado' }}</span>
          </div>
          <div class="col-12">
            <label class="text-muted x-small d-block text-uppercase">Dirección</label>
            <span class="fw-bold text-dark">{{ arbitro.direccion || 'No registrada' }}</span>
          </div>
        </div>

        <h6 class="fw-bold text-dark border-bottom pb-2 mb-3">Datos Arbitrales</h6>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <label class="text-muted x-small d-block text-uppercase">Grupo / Subgrupo</label>
            <span class="badge bg-dark">{{ arbitro.grupo }} {{ arbitro.subgrupo ? '- ' + arbitro.subgrupo : '' }}</span>
          </div>
          
          <div v-if="arbitro.juega_handball === 'Si'" class="col-12 mt-3 p-3 bg-light rounded border">
            <h6 class="fw-bold mb-2 small text-danger text-uppercase">Actividad como Jugador/a</h6>
            <div class="row">
              <div class="col-md-6">
                <label class="text-muted x-small d-block">CLUB</label>
                <span class="fw-bold text-dark">{{ arbitro.donde_juega }}</span>
              </div>
              <div class="col-md-6">
                <label class="text-muted x-small d-block">CATEGORÍA</label>
                <span class="fw-bold text-dark">{{ arbitro.categoria_handball }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rectificacion-box p-3 rounded mt-4">
          <h6 class="fw-bold text-dark mb-2 small">Solicitar Rectificación de Datos</h6>
          <p class="x-small text-muted mb-3">Para modificar DNI, Nombre, Grupo o datos de actividad, solicitalo aquí detallando el motivo.</p>
          <textarea v-model="solicitudCambio" class="form-control form-control-sm mb-2" rows="3" placeholder="Detallá qué dato querés corregir y por qué..."></textarea>
          <button @click="enviarSolicitudRectificacion" :disabled="!solicitudCambio" class="btn btn-outline-danger btn-sm w-100 fw-bold">ENVIAR SOLICITUD DE CAMBIO</button>
        </div>

      </div>
    </div>

    <div class="card shadow border-0">
      <div class="card-header bg-white py-3">
        <h5 class="fw-bold m-0 text-dark">Seguridad</h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label small fw-bold">Nueva Contraseña</label>
            <input type="password" v-model="passNueva" class="form-control form-control-sm">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold">Confirmar</label>
            <input type="password" v-model="passConfirmar" class="form-control form-control-sm">
          </div>
          <div class="col-12">
            <button @click="actualizarPassword" :disabled="cargando" class="btn btn-dark btn-sm px-4">ACTUALIZAR CLAVE</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.card { border-radius: 15px; }
.x-small { font-size: 0.65rem; letter-spacing: 0.5px; }
.rectificacion-box { background-color: #fffbeb; border: 1px solid #fef3c7; }
.text-danger { color: #dc2626 !important; }
.form-control:focus { border-color: #dc2626; box-shadow: 0 0 0 0.25rem rgba(220, 38, 38, 0.1); }
</style>