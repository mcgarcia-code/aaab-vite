<script setup>
import { ref, onMounted } from 'vue';
import { auth } from '@/api/auth';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head'

// Título y descripción específicos para la página de Solicitar Licencia AAAB
useHead({
  title: 'Solicitar Licencia | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Solicita tu licencia para ausentarte de tus compromisos arbitrales.',
    },
  ],
})

const arbitro = ref(auth.getUser() || {});
const fechaSeleccionada = ref('');
const mensaje = ref({ texto: '', tipo: '' });
const cargando = ref(false);
const licencias = ref([]);
const fechaMinima = new Date().toISOString().split("T")[0];

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const soloFecha = fechaStr.split(' ')[0];
  const partes = soloFecha.split('-');
  if (partes.length !== 3) return fechaStr;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

// --- PETICIONES API (ADAPTADAS A API.PHP) ---

const obtenerLicencias = async () => {
  if (!arbitro.value.id) return;
  try {
    // Para GET, api.php suele requerir el payload como string JSON en la URL
    const res = await api.get({
      entity: 'licencias',
      action: 'obtenerHistorial',
      payload: JSON.stringify({ id_arbitro: arbitro.value.id })
    });
    
    // api.php devuelve el resultado de la función en .payload
    licencias.value = res.payload || [];
  } catch (err) {
    console.error("Error al cargar historial:", err);
  }
};

const solicitarLicencia = async () => {
  if (!fechaSeleccionada.value) return;

  const enTermino = (() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaPedido = new Date(fechaSeleccionada.value);
    fechaPedido.setHours(0, 0, 0, 0);
    const diffDias = Math.ceil((fechaPedido - hoy) / (1000 * 60 * 60 * 24));
    return diffDias >= 9;
  })();

  const estadoFinal = enTermino ? 'aprobada' : 'rechazada';
  cargando.value = true;
  mensaje.value = { texto: '', tipo: '' };

  try {
    // Enviamos el objeto con entity, action y payload
    const res = await api.post({
      entity: 'licencias',
      action: 'guardarLicencia',
      payload: {
        id_arbitro: arbitro.value.id,
        nombre_arbitro: arbitro.value.nombre,
        apellido_arbitro: arbitro.value.apellido,
        fecha_licencia: fechaSeleccionada.value,
        estado: estadoFinal
      }
    });

    // Validamos 'res.ok' (de api.php) y 'res.payload.success' (de nuestra función)
    if (res.ok && res.payload.success) {
      mensaje.value = { 
        texto: enTermino 
          ? "Licencia aceptada correctamente." 
          : "Licencia rechazada por estar fuera de término (mínimo 9 días).", 
        tipo: enTermino ? 'success' : 'danger' 
      };
      fechaSeleccionada.value = '';
      await obtenerLicencias();
    } else {
      mensaje.value = { 
        texto: res.payload?.message || "Error al procesar la solicitud.", 
        tipo: 'danger' 
      };
    }
  } catch (err) {
    console.error("Error:", err);
    mensaje.value = { texto: "Error de conexión con el servidor.", tipo: 'danger' };
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  if (arbitro.value.id) obtenerLicencias();
});
</script>

<template>
  <div class="animate__animated animate__fadeIn container py-2 px-0 px-md-2">
    
    <div class="card shadow p-3 p-md-4 border-0 mb-4 mx-auto" style="max-width: 800px;">
      <h4 class="text-danger fw-bold mb-2">Solicitar Nueva Licencia</h4>
      <p class="text-muted x-small-mobile mb-3">
        Las licencias deben solicitarse con un mínimo de <strong>10 días</strong> de antelación para aprobación automática. Las mismas son por día completo, no hay licencias parciales.
      </p>

      <div v-if="mensaje.texto" :class="`alert alert-${mensaje.tipo} small py-2 shadow-sm border-0`" role="alert">
        {{ mensaje.texto }}
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold small text-dark">Fecha de la Licencia</label>
        <input 
          type="date" 
          :min="fechaMinima" 
          v-model="fechaSeleccionada" 
          class="form-control form-control-lg custom-input-date shadow-none"
          onkeydown="return false"
        >
      </div>

      <button 
        @click="solicitarLicencia" 
        :disabled="!fechaSeleccionada || cargando" 
        class="btn btn-primary w-100 fw-bold py-3 py-md-2 shadow-sm"
      >
        <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
        {{ cargando ? 'PROCESANDO...' : 'ENVIAR SOLICITUD' }}
      </button>
    </div>

    <div class="historial-seccion mx-auto" style="max-width: 800px;">
      <h6 class="text-white mb-3 small fw-bold text-uppercase px-2" style="letter-spacing: 1px;">Mi Historial de Licencias</h6>
      
      <div class="card card-historial shadow border-0 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr class="text-uppercase">
                <th class="ps-3">Fecha</th>
                <th class="d-none d-md-table-cell">Solicitada</th>
                <th class="text-center pe-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lic, index) in licencias" :key="index">
                <td class="ps-3 align-middle fw-bold text-dark">
                  <div class="d-flex flex-column">
                    <span>{{ formatearFecha(lic.fecha_licencia) }}</span>
                    <span class="d-md-none text-muted" style="font-size: 0.65rem;">Solic: {{ formatearFecha(lic.fecha_solicitud) }}</span>
                  </div>
                </td>
                <td class="align-middle text-muted small d-none d-md-table-cell">
                    {{ formatearFecha(lic.fecha_solicitud) }}
                </td>
                <td class="text-center align-middle pe-3">
                  <span :class="lic.estado === 'aprobada' ? 'badge bg-success' : 'badge bg-danger'" class="status-badge">
                    {{ lic.estado.toUpperCase() }}
                  </span>
                </td>
              </tr>
              <tr v-if="licencias.length === 0">
                <td colspan="3" class="text-center text-muted py-5 small">
                  No tenés licencias registradas.
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
.card-historial { border-radius: 12px; }

.btn-primary { 
  background-color: #dc2626 !important; 
  border: none; 
}
.btn-primary:hover:not(:disabled) { 
  background-color: #b91c1c !important; 
}

/* ESTILOS PARA EL INPUT DE FECHA */
.custom-input-date {
  color: #000000 !important;
  background-color: #ffffff !important;
  border: 1px solid #ced4da !important;
  font-size: 1rem;
}

/* Ocultar placeholder nativo cuando está vacío */
input[type="date"]:in-range::-webkit-datetime-edit-year-field,
input[type="date"]:in-range::-webkit-datetime-edit-month-field,
input[type="date"]:in-range::-webkit-datetime-edit-day-field,
input[type="date"]:in-range::-webkit-datetime-edit-text {
  color: transparent;
}

input[type="date"]:focus::-webkit-datetime-edit-year-field,
input[type="date"]:focus::-webkit-datetime-edit-month-field,
input[type="date"]:focus::-webkit-datetime-edit-day-field,
input[type="date"]:focus::-webkit-datetime-edit-text,
input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-year-field,
input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-month-field,
input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-day-field,
input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-text {
  color: #000 !important;
}

/* TABLA RESPONSIVE */
.table thead th {
  background-color: #f8fafc;
  color: #64748b;
  font-size: 0.65rem;
  padding: 15px 10px;
  border-bottom: 1px solid #e2e8f0;
}

.table td {
  padding: 15px 10px;
  border-bottom: 1px solid #f1f5f9;
}

.status-badge {
  padding: 6px 10px;
  font-size: 0.6rem;
  font-weight: 800;
  border-radius: 6px;
  display: inline-block;
  min-width: 80px;
}

.bg-success { background-color: #10b981 !important; }
.bg-danger { background-color: #ef4444 !important; }

@media (max-width: 768px) {
    .x-small-mobile { font-size: 0.8rem; }
    .status-badge { min-width: 70px; padding: 5px 8px; }
    h4 { font-size: 1.25rem; }
}

@media (max-width: 576px) {
    /* En pantallas muy pequeñas, reducimos el padding lateral del container 
       que pusiste como px-0 para ganar cada pixel disponible */
    .container {
        padding-left: 5px !important;
        padding-right: 5px !important;
    }

    /* Reducimos el padding de las celdas de la tabla para que el 
       badge de estado no quede pegado al borde */
    .table td, .table th {
        padding: 10px 5px !important;
    }
    
    .status-badge {
        font-size: 0.55rem; /* Un pelín más chico para evitar que se rompa en dos líneas */
    }
}
</style>