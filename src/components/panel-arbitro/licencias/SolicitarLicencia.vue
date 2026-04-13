<template>
  <div class="animate__animated animate__fadeIn container-fluid py-4">
    
    <div class="row g-4">
      <div class="col-12 col-lg-4">
        <div class="card shadow p-3 p-md-4 border-0 h-100" style="border-radius: 15px;">
          <h4 class="text-danger fw-bold mb-3 d-flex align-items-center">
            <i class="bi bi-calendar me-2"></i> Solicitar Licencia
          </h4>
          <p class="text-muted x-small-mobile mb-4">
            Las licencias deben solicitarse con un mínimo de <strong>10 días</strong> de antelación para aprobación automática. Las mismas son por día completo, no hay licencias parciales.
          </p>

          <div class="mb-4">
            <label class="form-label fw-bold small text-dark">Fecha de la Licencia</label>
            <input 
              type="date" 
              :min="fechaMinima" 
              v-model="fechaSeleccionada" 
              class="form-control form-control-lg custom-input-date shadow-none"
              onkeydown="return false"
            >
          </div>

          <div class="mt-auto">
            <button 
              @click="solicitarLicencia" 
              :disabled="!fechaSeleccionada || cargando" 
              class="btn btn-primary w-100 fw-bold py-3 py-md-2 shadow-sm"
            >
              <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
              {{ cargando ? 'PROCESANDO...' : 'ENVIAR SOLICITUD' }}
            </button>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-8">
        <div class="card shadow border-0 overflow-hidden h-100" style="border-radius: 15px;">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="m-0 fw-bold text-dark small text-uppercase" style="letter-spacing: 1px;">Mi Historial de Licencias</h6>
          </div>
          
          <div class="card-body p-0 bg-white">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr class="text-uppercase text-muted" style="font-size: 0.75rem;">
                    <th class="ps-3 py-3">Fecha</th>
                    <th class="d-none d-md-table-cell py-3">Solicitada</th>
                    <th class="text-center pe-3 py-3">Estado</th>
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
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Solicitar Licencia | AAAB',
  meta: [
    { name: 'description', content: 'Solicita tu licencia para ausentarte de tus compromisos arbitrales.' }
  ],
});

// Inyección del notificador global
const notificar = inject('notificar');
const fechaSeleccionada = ref('');
const cargando = ref(false);
const licencias = ref([]);
const fechaMinima = new Date().toISOString().split("T")[0];

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const soloFecha = fechaStr.split(' ')[0];
  const partes = soloFecha.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fechaStr;
};

const obtenerLicencias = async () => {
  try {
    const res = await api.get({
      entity: 'licencias',
      action: 'obtenerHistorial',
    });
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
    return diffDias >= 7; // Lógica de 7 días para aprobación
  })();

  const estadoFinal = enTermino ? 'aprobada' : 'rechazada';
  cargando.value = true;

  try {
    const res = await api.post({
      entity: 'licencias',
      action: 'crearLicencia',
      payload: {
        fecha_licencia: fechaSeleccionada.value,
        estado: estadoFinal
      }
    });

    if (res.ok && res.payload.success) {
      if (enTermino) {
        notificar({
          titulo: '¡Licencia Aceptada!',
          mensaje: 'La licencia se ha registrado correctamente.',
          tipo: 'success'
        });
      } else {
        notificar({
          titulo: 'Solicitud Rechazada',
          mensaje: 'La licencia fue rechazada automáticamente por estar fuera de término (mínimo 10 días).',
          tipo: 'danger'
        });
      }
      fechaSeleccionada.value = '';
      await obtenerLicencias();
    } else {
      notificar({
        titulo: 'Error',
        mensaje: res.payload?.message || "No se pudo procesar la solicitud.",
        tipo: 'danger'
      });
    }
  } catch {
    notificar({
      titulo: 'Error de Red',
      mensaje: 'No se pudo conectar con el servidor.',
      tipo: 'danger'
    });
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  obtenerLicencias();
});
</script>

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
    .container-fluid {
        padding-left: 10px !important;
        padding-right: 10px !important;
    }

    /* Reducimos el padding de las celdas de la tabla para que el 
       badge de estado no quede pegado al borde */
    .table td, .table th {
        padding: 10px 5px !important;
    }
    
    .status-badge {
        font-size: 0.55rem;
    }
}
</style>