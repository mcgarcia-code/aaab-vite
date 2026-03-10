<script setup>
/* eslint-disable vue/multi-word-component-names */
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Traemos el usuario del localStorage para tener el ID y Nombre
const arbitro = ref(JSON.parse(localStorage.getItem('user_aaab') || '{}'));

const fechaSeleccionada = ref('');
const mensaje = ref({ texto: '', tipo: '' });
const cargando = ref(false);
const licencias = ref([]);

// Bloqueo de fechas pasadas en el calendario
const fechaMinima = new Date().toISOString().split("T")[0];

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const soloFecha = fechaStr.split(' ')[0];
  const [year, month, day] = soloFecha.split('-');
  return `${day}-${month}-${year}`;
};

const obtenerLicencias = async () => {
  try {
    const res = await axios.get(`https://arbitroshandball.com.ar/api/mis_licencias.php?id_arbitro=${arbitro.value.id}`);
    licencias.value = res.data;
  } catch {
    console.error("Error al cargar historial");
  }
};

onMounted(() => {
  if (arbitro.value.id) {
    obtenerLicencias();
  }
});

const validarFecha = () => {
  if (!fechaSeleccionada.value) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaPedido = new Date(fechaSeleccionada.value);
  fechaPedido.setHours(0, 0, 0, 0);
  const diffTiempo = fechaPedido - hoy;
  const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
  return diffDias >= 9;
};

const solicitarLicencia = async () => {
  const enTermino = validarFecha();
  const estadoFinal = enTermino ? 'aprobada' : 'rechazada';
  cargando.value = true;
  mensaje.value = { texto: '', tipo: '' };

  try {
    const res = await axios.post('https://arbitroshandball.com.ar/api/guardar_licencia.php', {
      id_arbitro: arbitro.value.id,
      nombre_arbitro: arbitro.value.nombre,
      apellido_arbitro: arbitro.value.apellido,
      fecha_licencia: fechaSeleccionada.value,
      estado: estadoFinal
    });

    if (res.data.success) {
      mensaje.value = { 
        texto: enTermino ? "Licencia aceptada correctamente." : "Licencia rechazada por estar fuera de término (mínimo 9 días).", 
        tipo: enTermino ? 'success' : 'danger' 
      };
      fechaSeleccionada.value = '';
      await obtenerLicencias();
    } else {
      mensaje.value = { texto: res.data.message, tipo: 'danger' };
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
    <div class="card shadow p-4 border-0 mb-4">
      <h4 class="text-danger fw-bold mb-3">Solicitar Nueva Licencia</h4>
      <p class="text-muted small mb-3">
        Recordá que las licencias deben solicitarse con un mínimo de <strong>9 días</strong> de antelación para ser aprobadas automáticamente.
      </p>

      <div v-if="mensaje.texto" :class="`alert alert-${mensaje.tipo} small py-2 shadow-sm`" role="alert">
        {{ mensaje.texto }}
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold small text-dark">Fecha de la Licencia</label>
        <input 
          type="date" 
          :min="fechaMinima" 
          v-model="fechaSeleccionada" 
          class="form-control form-control-lg custom-input-date"
          onkeydown="return false"
        >
      </div>

      <button 
        @click="solicitarLicencia" 
        :disabled="!fechaSeleccionada || cargando" 
        class="btn btn-primary w-100 fw-bold py-2 shadow-sm"
      >
        <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
        {{ cargando ? 'PROCESANDO...' : 'ENVIAR SOLICITUD' }}
      </button>
    </div>

    <div class="historial-seccion">
      <h4 class="text-white mb-3 small fw-bold text-uppercase">Mi Historial de Licencias</h4>
      <div class="card card-historial shadow border-0 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Fecha Licencia</th>
                <th>Solicitada el</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lic, index) in licencias" :key="index">
                <td class="align-middle fw-bold">{{ formatearFecha(lic.fecha_licencia) }}</td>
                <td class="align-middle text-muted small">{{ formatearFecha(lic.fecha_solicitud) }}</td>
                <td class="text-center align-middle">
                  <span :class="lic.estado === 'aprobada' ? 'badge bg-success' : 'badge bg-danger'">
                    {{ lic.estado.toUpperCase() }}
                  </span>
                </td>
              </tr>
              <tr v-if="licencias.length === 0">
                <td colspan="3" class="text-center text-muted py-4 small">
                  No tenés licencias registradas hasta el momento.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { border-radius: 15px; background: #ffffff; }
.card-historial { background: #ffffff !important; }

.btn-primary { 
  background-color: #dc2626 !important; 
  border: none; 
  transition: all 0.3s ease;
}
.btn-primary:hover:not(:disabled) { 
  background-color: #b91c1c !important; 
  transform: translateY(-1px);
}

/* ESTILOS PARA QUE EL INPUT APAREZCA VACÍO */
.custom-input-date {
  color: #000000 !important;
  background-color: #ffffff !important;
  border: 1px solid #ced4da !important;
}

/* Truco para ocultar el dd/mm/aaaa cuando no hay valor */
input[type="date"]:in-range::-webkit-datetime-edit-year-field,
input[type="date"]:in-range::-webkit-datetime-edit-month-field,
input[type="date"]:in-range::-webkit-datetime-edit-day-field,
input[type="date"]:in-range::-webkit-datetime-edit-text {
  color: transparent;
}

/* Mostramos el texto cuando el input tiene foco o ya tiene un valor */
input[type="date"]:focus::-webkit-datetime-edit-year-field,
input[type="date"]:focus::-webkit-datetime-edit-month-field,
input[type="date"]:focus::-webkit-datetime-edit-day-field,
input[type="date"]:focus::-webkit-datetime-edit-text,
input[type="date"]:not([value=""])::-webkit-datetime-edit-year-field,
input[type="date"]:not([value=""])::-webkit-datetime-edit-month-field,
input[type="date"]:not([value=""])::-webkit-datetime-edit-day-field,
input[type="date"]:not([value=""])::-webkit-datetime-edit-text {
  color: #000 !important;
}

.table thead th {
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.7rem;
  text-transform: uppercase;
  padding: 12px 10px;
  border-bottom: none;
}

.table td {
  font-size: 0.85rem;
  padding: 12px 10px;
  border-bottom: 1px solid #f1f5f9;
}

.badge {
  padding: 6px 10px;
  font-size: 0.65rem;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.bg-success { background-color: #10b981 !important; }
.bg-danger { background-color: #ef4444 !important; }

.animate__animated {
  animation-duration: 0.5s;
}
</style>