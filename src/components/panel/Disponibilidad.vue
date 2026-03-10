<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Traemos los datos del árbitro del localStorage
const arbitro = ref(JSON.parse(localStorage.getItem('user_aaab') || '{}'));

const solicitud = ref('');
const historial = ref([]); // Estado para el historial
const cargando = ref(false);
const mensaje = ref({ texto: '', tipo: '' });

// Función para obtener el historial guardado en la base de datos
const obtenerHistorial = async () => {
  try {
    const res = await axios.get(`https://arbitroshandball.com.ar/api/obtener_historial.php?id_arbitro=${arbitro.value.id}`);
    historial.value = res.data;
  } catch {
    console.error("Error al cargar el historial de legajo");
  }
};

onMounted(() => {
  obtenerHistorial();
});

const enviarSolicitud = async () => {
  if (!solicitud.value.trim()) {
    mensaje.value = { texto: "Por favor, detallá los cambios que necesitás.", tipo: 'danger' };
    return;
  }

  cargando.value = true;
  mensaje.value = { texto: '', tipo: '' };

  try {
    // Enviamos la solicitud al PHP que procesará el email e insertará en DB
    const res = await axios.post('https://arbitroshandball.com.ar/api/solicitar_disponibilidad.php', {
      id_arbitro: arbitro.value.id,
      nombre: arbitro.value.nombre,
      apellido: arbitro.value.apellido,
      dni: arbitro.value.dni,
      grupo: arbitro.value.grupo,
      subgrupo: arbitro.value.subgrupo,
      mensaje: solicitud.value
    });

    if (res.data.success) {
      mensaje.value = { 
        texto: "Tu solicitud ha sido enviada a secretaría correctamente.", 
        tipo: 'success' 
      };
      solicitud.value = ''; // Limpiamos el campo
      obtenerHistorial(); // Actualizamos la tabla automáticamente
    } else {
      mensaje.value = { texto: res.data.message || "Error al enviar.", tipo: 'danger' };
    }
  } catch {
    mensaje.value = { texto: "Error de conexión con el servidor.", tipo: 'danger' };
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="animate__animated animate__fadeIn">
    <div class="card shadow border-0">
      <div class="card-header bg-white py-3">
        <h4 class="text-danger fw-bold m-0">Cambio de Disponibilidad Horaria</h4>
        <p class="text-muted small m-0">Solicitud formal de modificación de horarios.</p>
      </div>
      
      <div class="card-body">
        <div class="alert alert-info small mb-4">
          <i class="bi bi-info-circle-fill me-2"></i>
          Esta solicitud será enviada a <strong>secretaría y designaciones</strong>. 
          Incluiremos automáticamente tu nombre ({{ arbitro.nombre }} {{ arbitro.apellido }}), 
          ID, Grupo ({{ arbitro.grupo }}) y Subgrupo ({{ arbitro.subgrupo || '-' }}) para agilizar el trámite.
        </div>

        <div v-if="mensaje.texto" :class="`alert alert-${mensaje.tipo} small py-2 mb-3`" role="alert">
          {{ mensaje.texto }}
        </div>

        <div class="mb-3">
          <label class="form-label fw-bold small text-dark">Detalle del cambio solicitado</label>
          <textarea 
            v-model="solicitud" 
            class="form-control" 
            rows="6" 
            placeholder="Ejemplo: A partir del próximo mes no podré dirigir los días Sábados por la tarde debido a cambios en mi horario laboral..."
          ></textarea>
          <div class="form-text x-small mt-2 text-muted">
            Sé lo más específico posible con los días y rangos horarios.
          </div>
        </div>

        <button 
          @click="enviarSolicitud" 
          :disabled="cargando || !solicitud" 
          class="btn btn-primary w-100 fw-bold py-2 shadow-sm"
        >
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'ENVIANDO...' : 'ENVIAR SOLICITUD A SECRETARÍA' }}
        </button>
      </div>
    </div>

    <div class="mt-4 text-center">
      <p class="text-white-50">
        <i class="bi bi-shield-lock"></i> 
        Para evitar abusos, todas las solicitudes quedan registradas en tu historial de legajo.
      </p>
    </div>

    <div class="card shadow border-0 overflow-hidden mt-3">
      <div class="card-header bg-light py-2">
        <h6 class="m-0 fw-bold text-dark small">Historial de Solicitudes</h6>
      </div>
      <div class="card-body p-0">
        <div v-if="historial.length > 0" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr class="x-small text-uppercase text-muted">
                <th class="ps-3" style="width: 150px;">Fecha</th>
                <th>Mensaje / Motivo</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in historial" :key="index">
                <td class="ps-3 small fw-bold">{{ item.fecha }}</td>
                <td class="small text-dark text-truncate" style="max-width: 300px;">{{ item.mensaje_corto }}</td>
                <td class="text-center">
                  <span class="badge bg-secondary x-small">ENVIADO</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="text-center py-4 bg-white">
          <i class="bi bi-folder2-open text-muted fs-2"></i>
          <p class="text-muted small mt-2 mb-0 px-3">No registras solicitudes previas en tu historial de legajo.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { border-radius: 15px; }
.card-header { border-top-left-radius: 15px !important; border-top-right-radius: 15px !important; }

.btn-primary { 
  background-color: #dc2626 !important; 
  border: none; 
}

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c !important;
}

.form-control:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 0.25rem rgba(220, 38, 38, 0.1);
}

.x-small { font-size: 0.75rem; }

/* Estilos extra para la tabla */
.table thead th { border-bottom: none; }
.text-white-50 { color: rgba(255, 255, 255, 0.5) !important; }
</style>