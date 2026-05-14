<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="row g-4">
      <!-- COLUMNA IZQUIERDA: FORMULARIO -->
      <div class="col-12 col-lg-4">
        <div class="card shadow p-3 p-md-4 border-0 h-100" style="border-radius: 15px;">
          <h4 class="text-danger fw-bold mb-3 d-flex align-items-center">
            <i class="bi bi-calendar me-2"></i> Solicitar Licencia
          </h4>
          <p class="text-muted small mb-4">
            Las licencias particulares deben solicitarse con un mínimo de <strong>10 días</strong> de antelación. Las mismas son por día completo, no hay licencias parciales.
          </p>

          <div class="mb-3">
            <label class="form-label fw-bold small text-dark">Motivo de la Licencia</label>
            <select v-model="motivoSeleccionado" class="form-select form-select-lg shadow-none fs-6" :disabled="cargando">
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

      <!-- COLUMNA DERECHA: HISTORIAL -->
      <div class="col-12 col-lg-8">
        <div class="card shadow border-0 overflow-hidden h-100 d-flex flex-column" style="border-radius: 15px;">
          <div class="card-header bg-white py-3 border-bottom flex-shrink-0">
            <h6 class="m-0 fw-bold text-dark small text-uppercase" style="letter-spacing: 1px;">Mi Historial de Licencias</h6>
          </div>

          <div class="card-body p-0 bg-white flex-grow-1">

            <div v-if="licencias.length === 0" class="text-center text-muted p-5">
              <span class="material-icons opacity-50 mb-2" style="font-size: 40px;">calendar_today</span>
              <p class="m-0 small fw-bold">No tenés licencias registradas.</p>
            </div>

            <!-- LISTA RESPONSIVA (Reemplaza a la etiqueta table) -->
            <div v-else class="h-100 d-flex flex-column">

              <!-- Encabezado Escritorio -->
              <div class="row g-0 d-none d-md-flex bg-light border-bottom p-2 text-uppercase text-muted fw-bold" style="font-size: 0.70rem;">
                <div class="col-md-3 ps-3">Fecha</div>
                <div class="col-md-2">Solicitada</div>
                <div class="col-md-3">Motivo</div>
                <div class="col-md-2 text-center">Estado</div>
                <div class="col-md-2 text-center pe-3">Acción</div>
              </div>

              <!-- Filas de Datos -->
              <div class="overflow-auto" style="max-height: 60vh;">
                <div v-for="(lic, index) in licenciasPaginadas" :key="index" class="row g-0 align-items-center p-3 p-md-2 border-bottom bg-white item-licencia">

                  <!-- HEADER MOBILE: Datos (Se oculta en PC) -->
                  <div class="col-12 d-md-none mb-3 border-bottom pb-2">
                    <div class="fw-bold text-dark fs-6">{{ formatearFecha(lic.fecha_licencia) }}</div>
                    <div class="text-muted mt-1" style="font-size: 0.8rem;">
                      <i class="bi bi-clock me-1"></i> Solicitada: {{ formatearFecha(lic.fecha_solicitud) }}
                    </div>
                    <div class="text-muted" style="font-size: 0.8rem;">
                      <i class="bi bi-tag me-1"></i> Motivo: {{ lic.motivo === 'lesion_enfermedad' ? 'Lesión/Enf.' : 'Particular' }}
                    </div>
                  </div>

                  <!-- COLUMNAS ESCRITORIO -->
                  <div class="col-md-3 d-none d-md-block fw-bold text-dark ps-3" style="font-size: 0.85rem;">
                    {{ formatearFecha(lic.fecha_licencia) }}
                  </div>
                  <div class="col-md-2 d-none d-md-block text-muted small">
                    {{ formatearFecha(lic.fecha_solicitud) }}
                  </div>
                  <div class="col-md-3 d-none d-md-block text-muted small text-truncate pe-2">
                    {{ lic.motivo === 'lesion_enfermedad' ? 'Lesión/Enfermedad' : 'Particular' }}
                  </div>

                  <!-- ESTADO Y ACCIÓN (Ambos, en celular se parten mitad y mitad) -->
                  <div class="col-6 col-md-2 text-start text-md-center pe-2 pe-md-0">
                    <span class="badge w-90 py-2 py-md-1 shadow-sm" style="font-size: 0.7rem; letter-spacing: 0.5px;"
                          :class="{'bg-success': lic.estado === 'aprobada', 'bg-danger': lic.estado === 'rechazada' || lic.estado === 'borrada' || lic.estado === 'anulada', 'bg-warning text-dark': lic.estado === 'pendiente'}">
                      {{ lic.estado.toUpperCase() }}
                    </span>
                  </div>
                  <div class="col-6 col-md-2 text-start text-md-center pe-2 pe-md-0">
                    <button
                      v-if="(lic.estado === 'pendiente' || lic.estado === 'aprobada') && esFechaFutura(lic.fecha_licencia)"
                      @click="anularLicencia(lic)"
                      class="btn btn-sm btn-anular w-90 py-2 py-md-1 shadow-sm" style="font-size: 0.7rem; letter-spacing: 0.5px;"
                      :disabled="cargando"
                    >
                      <i class="bi bi-x-circle"></i> Anular
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>

          <!-- Paginación -->
          <div class="d-flex justify-content-center align-items-center gap-3 py-4 bg-white border-top" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
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
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

const totalPaginas = computed(() => Math.ceil(licencias.value.length / registrosPorPagina) || 1);

const licenciasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return licencias.value.slice(inicio, inicio + registrosPorPagina);
});

// Formateadores de fecha
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

  cargando.value = true;

  try {
    const res = await api.post({
      entity: 'licencias',
      action: 'crearLicencia',
      payload: {
        fecha_licencia: fechaSeleccionada.value,
        motivo: motivoSeleccionado.value
      }
    });

    if (res && res.ok && res.payload && res.payload.estado) {
      const estadoServidor = res.payload.estado;


      let tituloNotificacion = '';
      let mensajeNotificacion = '';
      let tipoNotificacion = '';

      if (estadoServidor === 'aprobada') {
        tituloNotificacion = '¡Licencia Aprobada!';
        mensajeNotificacion = 'Tu solicitud ha sido procesada y aprobada correctamente.';
        tipoNotificacion = 'success';
      } else if (estadoServidor === 'rechazada') {
        tituloNotificacion = 'Licencia rechazada';
        mensajeNotificacion = 'Tu solicitud ha sido rechazada.';
        tipoNotificacion = 'danger';
      } else if (estadoServidor === 'pendiente') {
        tituloNotificacion = 'Licencia Pendiente';
        mensajeNotificacion = 'Recordá enviar el certificado médico dentro de las 72 hs.';
        tipoNotificacion = 'warning';
      }

      // Disparamos la notificación con los textos exactos
      notificar({
        titulo: tituloNotificacion,
        mensaje: mensajeNotificacion,
        tipo: tipoNotificacion
      });

      // Limpiamos el formulario y recargamos la tabla
      fechaSeleccionada.value = '';
      motivoSeleccionado.value = 'particular';
      await obtenerLicencias();

    } else {
      notificar({
        titulo: 'Error',
        mensaje: res?.message || "No se pudo procesar la solicitud.",
        tipo: 'danger'
      });
    }
  } catch (error) {
    console.error("Detalle del error JS:", error);
    notificar({
      titulo: 'Error de Red',
      mensaje: 'No se pudo conectar con el servidor o hubo un error de procesamiento.',
      tipo: 'danger'
    });
  } finally {
    cargando.value = false;
  }
};

const esFechaFutura = (fechaStr) => {
  if (!fechaStr) return false;
  const fechaLicencia = parseFecha(fechaStr);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fechaLicencia >= hoy;
};

const anularLicencia = (lic) => {
  if (!lic.puede_anular) {
    notificar({
      titulo: 'No se puede anular',
      mensaje: 'Faltan menos de 6 días para la fecha. Por favor, enviá un e-mail a licencias@arbitroshandball.com.ar',
      tipo: 'danger'
    });
    return;
  }

  notificar({
    titulo: '¿Anular Licencia?',
    mensaje: 'Esta acción es irreversible. El registro será borrado permanentemente.',
    tipo: 'danger',
    alConfirmar: async () => {
      cargando.value = true;
      try {
        const res = await api.post({
          entity: 'licencias',
          action: 'actualizarLicencia',
          payload: {
            id: lic.id,
            estado: 'anulada'
          }
        });

        if (res.ok && res.payload.success) {
          notificar({
            titulo: 'Licencia Anulada',
            mensaje: 'La licencia fue anulada correctamente.',
            tipo: 'success'
          });
          await obtenerLicencias();
        } else {
          notificar({
            titulo: 'Error',
            mensaje: res?.message || "No se pudo anular la licencia.",
            tipo: 'danger'
          });
        }
      } catch(err){
        console.error("Detalle del error anular:", err);
        notificar({
          titulo: 'Error de Red',
          mensaje: 'No se pudo conectar con el servidor.',
          tipo: 'danger'
        });
      } finally {
        cargando.value = false;
      }
    }
  });
};

onMounted(() => {
  obtenerLicencias();
});
</script>

<style scoped>
/* ====================================================
   COMPONENTES Y BOTONES
   ==================================================== */
.btn-primary {
  background-color: #dc2626 !important;
  border: none;
}
.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c !important;
}

/* Efectos de la lista */
.item-licencia {
  transition: background-color 0.2s ease;
}
.item-licencia:hover {
  background-color: #f8fafc !important;
}

/* Botón Anular con color personalizado y animación */
.btn-anular {
  background-color: #ef4444;
  color: #ffffff;
  font-size: 0.65rem;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;
}
.btn-anular:hover:not(:disabled) {
  background-color: #b91c1c;
  color: #ffffff;
}
.btn-anular:disabled {
  background-color: #fca5a5;
  color: #fef2f2;
  cursor: not-allowed;
}

/* ====================================================
   HACKS VISUALES PARA INPUT DATE (Nativo)
   ==================================================== */
.custom-input-date {
  color: #000000 !important;
  background-color: #ffffff !important;
  border: 1px solid #ced4da !important;
  font-size: 1rem;
}

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

.animate__animated { animation-duration: 0.5s; }
</style>
