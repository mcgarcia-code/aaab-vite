<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const arbitro = ref(JSON.parse(localStorage.getItem('user_aaab') || '{}'));
const fechaSeleccionada = ref('');
const mensaje = ref({ texto: '', tipo: '' });
const cargando = ref(false);
const licencias = ref([]);

// Bloqueo de fechas pasadas
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
  } catch (err) {
    console.error("Error al cargar historial", err);
  }
};

onMounted(() => {
  obtenerLicencias();
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
        texto: enTermino ? "Licencia aceptada." : "Licencia rechazada, fuera de término.", 
        tipo: enTermino ? 'success' : 'danger' 
      };
      fechaSeleccionada.value = '';
      await obtenerLicencias();
    } else {
      mensaje.value = { texto: res.data.message, tipo: 'danger' };
    }
  } catch (err) {
    console.error(err);
    mensaje.value = { texto: "Error de conexión.", tipo: 'danger' };
  } finally {
    cargando.value = false;
  }
};

const cerrarSesion = () => {
  localStorage.removeItem('user_aaab');
  // NOTIFICAMOS al Header que la sesión se cerró
  window.dispatchEvent(new Event('storage')); 
  router.push('/login-arbitro');
};
</script>

<template>
  <div class="panel-container p-3">
    <div class="container max-600">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="text-white fw-bold m-0">Hola, {{ arbitro.nombre }}</h2>
        <button @click="cerrarSesion" class="btn btn-outline-light btn-sm px-3">Salir</button>
      </div>

      <div class="card shadow p-4 border-0 mb-4">
        <h4 class="mb-2">Solicitar Licencia</h4>
        <p class="text-muted small mb-3">Mínimo 9 días de antelación.</p>

        <div v-if="mensaje.texto" :class="`alert alert-${mensaje.tipo} small py-2`" role="alert">
          {{ mensaje.texto }}
        </div>

        <div class="mb-3">
          <label class="form-label fw-bold small text-dark">Fecha de la Licencia</label>
          <input 
            type="date" 
            :min="fechaMinima" 
            v-model="fechaSeleccionada" 
            class="form-control form-control-lg custom-input-date"
            lang="es-ES"
          >
        </div>

        <button @click="solicitarLicencia" :disabled="!fechaSeleccionada || cargando" class="btn btn-primary w-100 fw-bold py-2">
          {{ cargando ? 'PROCESANDO...' : 'ENVIAR SOLICITUD' }}
        </button>
      </div>

      <div class="historial-seccion">
        <h4 class="titulo-historial mb-2 small fw-bold">Mi Historial de Licencias</h4>
        <div class="card card-historial shadow border-0 overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="fw-bold">Fecha</th>
                  <th class="fw-bold">Solicitada</th>
                  <th class="fw-bold text-center">Estado</th>
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
                  <td colspan="3" class="text-center text-muted py-4 small">No tenés licencias registradas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-container {
  min-height: 100vh;
  background-color: #0f172a;
  padding-top: 20px !important;
}

.max-600 { 
  max-width: 600px; 
  margin: 0 auto;
}

h2.text-white {
  color: #ffffff !important;
  font-weight: 700;
  font-size: 1.5rem;
}

.card { 
  background: #f8fafc; 
  border-radius: 15px; 
}

.card-historial {
  background: #ffffff !important;
}

.card h4 {
  color: #dc2626 !important;
  font-weight: bold;
}

.titulo-historial {
  color: #ffffff !important;
}

.btn-primary { 
  background-color: #dc2626 !important; 
  border: none; 
  font-weight: bold;
}

.btn-primary:hover { 
  background-color: #b91c1c !important; 
}

.btn-outline-light:hover {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
  color: #ffffff !important;
}

.custom-input-date {
    color: #000000 !important;
    background-color: #ffffff !important;
    border: 1px solid #ced4da !important;
}

.form-control:focus {
  border-color: #f87171;
  box-shadow: 0 0 0 0.25rem rgba(220, 38, 38, 0.25);
}

.table thead th {
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.7rem;
  text-transform: uppercase;
  padding: 10px;
}

.table td {
  font-size: 0.85rem;
  padding: 10px;
}

.badge {
  padding: 5px 10px;
  font-size: 0.65rem;
  border-radius: 4px;
}

.bg-success { background-color: #10b981 !important; }
.bg-danger { background-color: #ef4444 !important; }
</style>