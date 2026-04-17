<template>
  <div class="animate__animated animate__fadeIn">
    
    <div class="row g-4">
      <div class="col-12 col-lg-4">
        <div class="card shadow p-3 p-md-4 border-0 h-100" style="border-radius: 15px;">
          <h4 class="text-danger fw-bold mb-3 d-flex align-items-center">
            <i class="bi bi-calendar me-2"></i> Solicitar Licencia
          </h4>
          <p class="text-muted x-small-mobile mb-4">
            Las licencias particulares deben solicitarse con un mínimo de <strong>10 días</strong> de antelación. Las mismas son por día completo, no hay licencias parciales.
          </p>

          <div class="mb-3">
            <label class="form-label fw-bold small text-dark">Motivo de la Licencia</label>
            <select v-model="motivoSeleccionado" class="form-select form-select-lg shadow-none" :disabled="cargando">
              <option value="particular">Particular</option>
              <option value="lesion_enfermedad">Lesión / Enfermedad</option>
            </select>
          </div>

          <div v-if="motivoSeleccionado === 'lesion_enfermedad'" class="alert alert-warning small py-2 px-3 mb-3 border-0" style="border-radius: 8px;">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>
            Tu licencia quedará <strong>Pendiente</strong>. Tenés 72 hs para enviar el certificado médico a <strong>licencias@arbitroshandball.com.ar</strong>, sino será rechazada y enviada al Tribunal de Ética. Avisá a tu coordinador.
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold small text-dark">Fecha de la Licencia</label>
            <input 
              type="date" 
              :min="fechaMinimaDinamica" 
              v-model="fechaSeleccionada" 
              class="form-control form-control-lg custom-input-date shadow-none"
              onkeydown="return false"
              :disabled="cargando"
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
        <div class="card shadow border-0 overflow-hidden h-100 d-flex flex-column" style="border-radius: 15px;">
          <div class="card-header bg-white py-3 border-bottom flex-shrink-0">
            <h6 class="m-0 fw-bold text-dark small text-uppercase" style="letter-spacing: 1px;">Mi Historial de Licencias</h6>
          </div>
          
          <div class="card-body p-0 bg-white flex-grow-1">
            <div class="table-responsive h-100">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr class="text-uppercase text-muted" style="font-size: 0.75rem;">
                    <th class="ps-3 py-3">Fecha</th>
                    <th class="d-none d-md-table-cell py-3">Solicitada</th>
                    <th class="d-none d-md-table-cell py-3">Motivo</th>
                    <th class="text-center pe-3 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(lic, index) in licenciasPaginadas" :key="index">
                    <td class="ps-3 align-middle fw-bold text-dark">
                      <div class="d-flex flex-column">
                        <span>{{ formatearFecha(lic.fecha_licencia) }}</span>
                        <span class="d-md-none text-muted" style="font-size: 0.65rem;">
                          Solic: {{ formatearFecha(lic.fecha_solicitud) }}
                        </span>
                        <span class="d-md-none text-muted fw-normal" style="font-size: 0.65rem;">
                          Motivo: {{ lic.motivo === 'lesion_enfermedad' ? 'Lesión/Enf.' : 'Particular' }}
                        </span>
                      </div>
                    </td>
                    <td class="align-middle text-muted small d-none d-md-table-cell">
                        {{ formatearFecha(lic.fecha_solicitud) }}
                    </td>
                    <td class="align-middle text-muted small d-none d-md-table-cell">
                        {{ lic.motivo === 'lesion_enfermedad' ? 'Lesión/Enfermedad' : 'Particular' }}
                    </td>
                    <td class="text-center align-middle pe-3">
                      <span :class="{'badge': true, 'bg-success': lic.estado === 'aprobada', 'bg-danger': lic.estado === 'rechazada' || lic.estado === 'borrada', 'bg-warning text-dark': lic.estado === 'pendiente'}" class="status-badge">
                        {{ lic.estado.toUpperCase() }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="licencias.length === 0">
                    <td colspan="4" class="text-center text-muted py-5 small">
                      No tenés licencias registradas.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-4" v-if="totalPaginas > 1">
            <button
              class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
              @click="cambiarPagina(-1)"
              :disabled="paginaActual <= 1"
            >
              <i class="bi bi-chevron-left"></i> Ant
            </button>

            <span class="fw-bold text-dark small">
              Página {{ paginaActual }} de {{ totalPaginas }}
            </span>

            <button
              class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
              @click="cambiarPagina(1)"
              :disabled="paginaActual >= totalPaginas"
            >
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>

        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue';
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
const motivoSeleccionado = ref('particular');
const cargando = ref(false);
const licencias = ref([]);

// Variables de Paginación
const paginaActual = ref(1);
const registrosPorPagina = 4;

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    // Detectamos si es pantalla móvil
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

// Cálculos para Paginación
const totalPaginas = computed(() => Math.ceil(licencias.value.length / registrosPorPagina) || 1);

const licenciasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return licencias.value.slice(inicio, inicio + registrosPorPagina);
});

// Lógica de fechas dinámicas
const fechaHoyStr = new Date().toISOString().split("T")[0];
const fechaMinima7Dias = computed(() => {
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 7);
  return hoy.toISOString().split("T")[0];
});

const fechaMinimaDinamica = computed(() => {
  return motivoSeleccionado.value === 'particular' ? fechaMinima7Dias.value : fechaHoyStr;
});

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const soloFecha = fechaStr.split(' ')[0];
  const partes = soloFecha.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fechaStr;
};

const parseFecha = (fechaStr) => {
  const [dia, mes, anio] = fechaStr.split('/');
  return new Date(`20${anio}-${mes}-${dia}`);
};

const obtenerLicencias = async () => {
  try {
    const res = await api.get({
      entity: 'licencias',
      action: 'obtenerHistorial',
    });
    licencias.value = (res.payload || []).sort((a, b) => {
      return parseFecha(b.fecha_licencia) - parseFecha(a.fecha_licencia);
    });
    paginaActual.value = 1;
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
    return diffDias >= 7; 
  })();

  let estadoFinal = '';
  if (motivoSeleccionado.value === 'lesion_enfermedad') {
    estadoFinal = 'pendiente';
  } else {
    estadoFinal = enTermino ? 'aprobada' : 'rechazada';
  }

  cargando.value = true;

  try {
    const res = await api.post({
      entity: 'licencias',
      action: 'crearLicencia',
      payload: {
        fecha_licencia: fechaSeleccionada.value,
        estado: estadoFinal,
        motivo: motivoSeleccionado.value 
      }
    });

    if (res.ok && res.payload.success) {
      notificar({
        titulo: motivoSeleccionado.value === 'lesion_enfermedad' ? 'Licencia Pendiente' : (enTermino ? '¡Licencia Aceptada!' : 'Solicitud Rechazada'),
        mensaje: res.payload.message || 'Procesado correctamente.',
        tipo: motivoSeleccionado.value === 'lesion_enfermedad' ? 'warning' : (enTermino ? 'success' : 'danger')
      });
      
      // Reseteo del formulario
      fechaSeleccionada.value = '';
      motivoSeleccionado.value = 'particular';
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
/* ====================================================
   COMPONENTES Y BOTONES
   ==================================================== */
.card { border-radius: 15px; background: #ffffff; }

.btn-primary { 
  background-color: #dc2626 !important; 
  border: none; 
}
.btn-primary:hover:not(:disabled) { 
  background-color: #b91c1c !important; 
}

/* AJUSTES DE TAMAÑO PARA SELECTS */
select.form-select, 
select.form-select-lg {
  font-size: 0.9rem !important; 
  padding: 0.45rem 2rem 0.45rem 0.75rem !important; 
  height: auto !important; 
  min-height: 40px !important; 
  border-radius: 6px !important; 
  line-height: 1.5; 
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

/* ====================================================
   📱 RESPONSIVE DESIGN
   ==================================================== */
.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  
  .x-small-mobile { font-size: 0.8rem; }
  .status-badge { min-width: 70px; padding: 5px 8px; }
  h4 { font-size: 1.25rem; }
}

@media (max-width: 600px) {
  .table td, .table th {
    padding: 10px 5px !important;
  }
  .status-badge {
    font-size: 0.55rem;
  }
}
</style>