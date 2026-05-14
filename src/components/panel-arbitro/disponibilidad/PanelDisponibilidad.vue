<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-clock me-2"></i> Disponibilidad Horaria
          </h4>
          <p class="text-muted small m-0 mt-1">Gestioná tus horarios y actividad deportiva.</p>
        </div>

        <div class="d-flex flex-wrap gap-2 justify-content-md-end">
          <span v-if="edicionAbierta" class="badge bg-success px-3 py-2 shadow-sm d-inline-block text-center w-auto">
            <i class="bi bi-pencil-square me-1"></i> Edición Abierta
          </span>
          <span v-else class="badge bg-secondary px-3 py-2 shadow-sm d-inline-block text-center w-auto">
            <i class="bi bi-lock-fill me-1"></i> Edición Cerrada
          </span>
        </div>
      </div>

      <div class="card-body p-3 p-md-4">
        <h6 class="text-danger fw-bold text-uppercase mb-3 small" style="letter-spacing: 1px;">Movilidad</h6>
        <div class="row mb-4 border-bottom pb-3">
          <div class="col-12 d-flex flex-wrap gap-3 gap-md-4">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="auto" v-model="movilidadSeleccionada" :disabled="!edicionAbierta">
              <label class="form-check-label">Auto</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="moto" v-model="movilidadSeleccionada" :disabled="!edicionAbierta">
              <label class="form-check-label">Moto</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="transporte publico" v-model="movilidadSeleccionada" :disabled="!edicionAbierta">
              <label class="form-check-label">Transporte Público</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="bici" v-model="movilidadSeleccionada" :disabled="!edicionAbierta">
              <label class="form-check-label">Bici</label>
            </div>
          </div>
        </div>

        <h6 class="text-danger fw-bold text-uppercase mb-3 small" style="letter-spacing: 1px;">Sábados</h6>
        <div class="row g-3 mb-4 border-bottom pb-4">
          <div class="col-12 col-md-4">
            <label class="form-label small fw-bold text-muted">Disponibilidad</label>
            <select v-if="edicionAbierta" v-model="arbitro.disponibilidad_sabado" class="form-select form-select-sm">
              <option value="NO">NO</option>
              <option value="FT">FT (Full Time)</option>
              <option value="OTROS">OTROS</option>
            </select>
            <div v-else class="p-2 bg-light rounded fw-bold text-dark">{{ arbitro.disponibilidad_sabado }}</div>
          </div>
          <div v-if="arbitro.disponibilidad_sabado === 'OTROS'" class="col-6 col-md-4">
            <label class="form-label small fw-bold text-muted">Desde</label>
            <input v-if="edicionAbierta" v-model="arbitro.disponibilidad_sabado_desde" type="time" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold text-dark">{{ arbitro.disponibilidad_sabado_desde || '--:--' }}</div>
          </div>
          <div v-if="arbitro.disponibilidad_sabado === 'OTROS'" class="col-6 col-md-4">
            <label class="form-label small fw-bold text-muted">Hasta</label>
            <input v-if="edicionAbierta" v-model="arbitro.disponibilidad_sabado_hasta" type="time" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold text-dark">{{ arbitro.disponibilidad_sabado_hasta || '--:--' }}</div>
          </div>
        </div>

        <h6 class="text-danger fw-bold text-uppercase mb-3 small" style="letter-spacing: 1px;">Domingos</h6>
        <div class="row g-3 mb-4 border-bottom pb-4">
          <div class="col-12 col-md-4">
            <label class="form-label small fw-bold text-muted">Disponibilidad</label>
            <select v-if="edicionAbierta" v-model="arbitro.disponibilidad_domingo" class="form-select form-select-sm">
              <option value="NO">NO</option>
              <option value="FT">FT (Full Time)</option>
              <option value="OTROS">OTROS</option>
            </select>
            <div v-else class="p-2 bg-light rounded fw-bold text-dark">{{ arbitro.disponibilidad_domingo }}</div>
          </div>
          <div v-if="arbitro.disponibilidad_domingo === 'OTROS'" class="col-6 col-md-4">
            <label class="form-label small fw-bold text-muted">Desde</label>
            <input v-if="edicionAbierta" v-model="arbitro.disponibilidad_domingo_desde" type="time" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold text-dark">{{ arbitro.disponibilidad_domingo_desde || '--:--' }}</div>
          </div>
          <div v-if="arbitro.disponibilidad_domingo === 'OTROS'" class="col-6 col-md-4">
            <label class="form-label small fw-bold text-muted">Hasta</label>
            <input v-if="edicionAbierta" v-model="arbitro.disponibilidad_domingo_hasta" type="time" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold text-dark">{{ arbitro.disponibilidad_domingo_hasta || '--:--' }}</div>
          </div>
        </div>

        <h6 class="text-danger fw-bold text-uppercase mb-3 small" style="letter-spacing: 1px;">Actividad Deportiva</h6>
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-4">
            <label class="form-label small fw-bold text-muted">¿Juega al Handball?</label>
            <select v-if="edicionAbierta" v-model="arbitro.juega_handball" class="form-select form-select-sm">
              <option value="no">NO</option>
              <option value="si">SI</option>
            </select>
            <div v-else class="p-2 bg-light rounded fw-bold text-uppercase text-dark">{{ arbitro.juega_handball }}</div>
          </div>
          <div v-if="arbitro.juega_handball === 'si'" class="col-12 col-md-4">
            <label class="form-label small fw-bold text-muted">Club</label>
            <input v-if="edicionAbierta" v-model="arbitro.donde_juega" type="text" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold text-dark">{{ arbitro.donde_juega || '-' }}</div>
          </div>
          <div v-if="arbitro.juega_handball === 'si'" class="col-12 col-md-4">
            <label class="form-label small fw-bold text-muted">Categoría</label>
            <input v-if="edicionAbierta" v-model="arbitro.categoria_handball" type="text" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold text-dark">{{ arbitro.categoria_handball || '-' }}</div>
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold text-muted">Observaciones Generales</label>
            <textarea v-if="edicionAbierta" v-model="arbitro.observaciones" class="form-control form-control-sm" rows="2"></textarea>
            <div v-else class="p-2 bg-light rounded small text-dark">{{ arbitro.observaciones || 'Sin observaciones' }}</div>
          </div>
        </div>

        <button v-if="edicionAbierta" @click="guardarCambios" class="btn btn-success w-100 fw-bold shadow-sm py-3 py-md-2" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          ACTUALIZAR DISPONIBILIDAD
        </button>
      </div>
    </div>

    <!-- Sección de Historial y Cambios Manuales -->
    <div class="manual-section p-0 mx-auto mt-4 mb-5 w-100" style="background: transparent; box-shadow: none;">
        <div class="text-center text-white-50 mb-3 small">
            <i class="bi bi-shield-lock-fill me-1"></i>
            Todas las modificaciones quedan registradas en el sistema.
        </div>

        <div class="card border-0 shadow-sm overflow-hidden mb-4" style="border-radius: 12px;">
            <div class="card-header bg-white border-bottom py-3 ps-3">
                <h6 class="m-0 fw-bold text-dark small text-uppercase">Historial de Solicitudes</h6>
            </div>

            <div class="card-body p-0 bg-white">
                <!-- LISTA UNIFICADA (Reemplaza la tabla rígida) -->
                <div v-if="historialRectificaciones.length > 0" class="d-flex flex-column">
                    <!-- Encabezado de Columnas (Solo Escritorio) -->
                    <div class="row g-0 d-none d-md-flex bg-light border-bottom p-2 fw-bold text-uppercase text-muted" style="font-size: 0.70rem;">
                        <div class="col-md-2 ps-3">Fecha</div>
                        <div class="col-md-7">Mensaje</div>
                        <div class="col-md-3 text-center pe-3">Estado</div>
                    </div>

                    <!-- Filas de Datos -->
                    <div v-for="(h, i) in historialRectificaciones" :key="i" class="row g-0 align-items-center p-3 p-md-2 border-bottom bg-white item-historial">

                        <!-- HEADER MOBILE: Fecha y Estado -->
                        <div class="col-12 d-md-none mb-2 pb-2 border-bottom d-flex justify-content-between align-items-center">
                            <span class="small fw-bold text-dark">{{ h.fecha }}</span>
                            <span :class="['badge', h.estado === 'aprobado' ? 'bg-success' : (h.estado === 'rechazado' ? 'bg-danger' : 'bg-warning text-dark')]" style="font-size: 0.65rem;">
                                {{ h.estado ? h.estado.toUpperCase() : 'ENVIADO' }}
                            </span>
                        </div>

                        <!-- COL 1: FECHA (Escritorio) -->
                        <div class="col-md-2 d-none d-md-block ps-3 small fw-bold text-dark">
                            {{ h.fecha }}
                        </div>

                        <!-- COL 2: MENSAJE (Ambos) -->
                        <div class="col-12 col-md-7 small text-dark lh-sm">
                            {{ h.mensaje }}
                        </div>

                        <!-- COL 3: ESTADO (Escritorio) -->
                        <div class="col-md-3 d-none d-md-flex justify-content-center pe-3">
                            <span :class="['badge', h.estado === 'aprobado' ? 'bg-success' : (h.estado === 'rechazado' ? 'bg-danger' : 'bg-warning text-dark')]" style="font-size: 0.65rem; letter-spacing: 0.5px;">
                                {{ h.estado ? h.estado.toUpperCase() : 'ENVIADO' }}
                            </span>
                        </div>

                    </div>
                </div>

                <div v-else class="text-center py-5 text-muted small bg-light">
                    <span class="material-icons opacity-50 d-block mb-2" style="font-size: 32px;">history_toggle_off</span>
                    Sin solicitudes previas de disponibilidad.
                </div>
            </div>
        </div>

        <div v-if="!edicionAbierta" class="mt-4">
            <div class="alert alert-info border-0 shadow-sm mb-3 d-flex align-items-center p-3" style="background-color: #e0f7fa; color: #006064; border-radius: 10px;">
                <i class="bi bi-info-circle-fill me-3 fs-5 d-none d-md-block"></i>
                <div class="small">
                    Informar cambios urgentes a <strong>secretaría y designaciones</strong>.
                </div>
            </div>

            <div class="p-3 p-md-4 rounded-4 shadow-lg" style="background: #0c1624; border: 1px dashed rgba(255,255,255,0.2);">
                <h6 class="text-white fw-bold small mb-2 text-uppercase">Informar cambio urgente</h6>
                <textarea v-model="solicitudCambio" class="form-control mb-3 custom-textarea p-3" rows="3" placeholder="Detallá aquí tu cambio de horarios..."></textarea>
                <button @click="enviarSolicitudRectificacion" class="btn btn-danger w-100 fw-bold py-3 py-md-2 shadow" :disabled="cargando || !solicitudCambio">
                    ENVIAR SOLICITUD FORMAL
                </button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue';
import { auth } from '@/api/auth';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head'

useHead({
  title: 'Disponibilidad Horaria | AAAB',
  meta: [
    { name: 'description', content: 'Gestioná tu disponibilidad horaria, movilidad y actividad deportiva.' }
  ],
})

// Inyección del notificador global
const notificar = inject('notificar');
const arbitro = ref(auth.getUser() || {});
const solicitudCambio = ref('');
const historialRectificaciones = ref([]);
const cargando = ref(false);
const movilidadSeleccionada = ref([]);
const edicionAbierta = ref(arbitro.value.permitir_edicion == 1);

const obtenerHistorialRectificaciones = async () => {
    try {
        const res = await api.get({
            entity: 'datos_personales',
            action: 'obtenerHistorial',
            payload: { tipo: "disponibilidad" }
        });

        historialRectificaciones.value = res.payload || [];
    } catch (error) {
        console.error("Error al cargar el historial de rectificaciones", error);
    }
};

onMounted(() => {
  obtenerHistorialRectificaciones();
  if (arbitro.value.movilidad) {
    movilidadSeleccionada.value = arbitro.value.movilidad.split(',');
  }
});

watch(movilidadSeleccionada, (nuevo) => {
  arbitro.value.movilidad = nuevo.join(',');
});

watch(() => arbitro.value.disponibilidad_sabado, (val) => {
  if (val !== 'OTROS') {
    arbitro.value.disponibilidad_sabado_desde = null;
    arbitro.value.disponibilidad_sabado_hasta = null;
  }
});

watch(() => arbitro.value.disponibilidad_domingo, (val) => {
  if (val !== 'OTROS') {
    arbitro.value.disponibilidad_domingo_desde = null;
    arbitro.value.disponibilidad_domingo_hasta = null;
  }
});

watch(() => arbitro.value.juega_handball, (nuevoValor) => {
  if (nuevoValor === 'no') {
    arbitro.value.donde_juega = null;
    arbitro.value.categoria_handball = null;
  }
});

const guardarCambios = async () => {
    cargando.value = true;
    try {
        const res = await api.post({
            entity: 'datos_personales',
            action: 'actualizarDatos',
            payload: {
                arbitro: arbitro.value
            }
        })
        if (res.success) {
            notificar({
              titulo: '¡Perfil Actualizado!',
              mensaje: 'Tus datos se guardaron correctamente en el legajo.',
              tipo: 'success'
            });
            auth.setUser(arbitro.value);
        } else {
            notificar({
              titulo: 'Error',
              mensaje: res.data.message || 'No se pudieron actualizar los datos.',
              tipo: 'danger'
            });
        }
    } catch {
        notificar({
          titulo: 'Error de Conexión',
          mensaje: 'No pudimos conectar con el servidor para guardar los cambios.',
          tipo: 'danger'
        });
    } finally {
        cargando.value = false;
    }
};

const enviarSolicitudRectificacion = async () => {
    if (!solicitudCambio.value.trim()) return;
    cargando.value = true;
    try {
        const res = await api.post({
            entity: 'datos_personales',
            action: 'rectificarDatos',
            payload: {
                tipo: "disponibilidad",
                mensaje: "RECTIFICACIÓN: " + solicitudCambio.value
            }
        });

        if (res.ok || res.success) {
            notificar({
                titulo: 'Solicitud Enviada',
                mensaje: 'Tu pedido de rectificación fue enviado a la asociación.',
                tipo: 'success'
            });
            solicitudCambio.value = '';
            await obtenerHistorialRectificaciones();
        } else {
            throw new Error();
        }
    } catch {
        notificar({
            titulo: 'Error',
            mensaje: 'No se pudo enviar la solicitud.',
            tipo: 'danger'
        });
    } finally {
        cargando.value = false;
    }
};
</script>

<style scoped>
/* ====================================================
   COMPONENTES Y UTILIDADES
   ==================================================== */
.form-control-sm, .form-select-sm {
  border-radius: 8px;
  padding: 0.5rem;
}

.btn-danger {
  background-color: #dc2626 !important;
  border: none;
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.5) !important;
}

.custom-textarea {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: none;
  border-radius: 8px;
}

.custom-textarea::placeholder {
  color: #6c757d;
}

/* ====================================================
   EFECTO HOVER PARA LA LISTA DE HISTORIAL
   ==================================================== */
.item-historial {
  transition: background-color 0.2s ease;
}

.item-historial:hover {
  background-color: #f8fafc !important;
}

.animate__animated { animation-duration: 0.5s; }

</style>
