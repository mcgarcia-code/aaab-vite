<template>
  <div class="animate__animated animate__fadeIn container py-4 page-bg">
    
    <div class="card shadow border-0 mb-4 mx-auto" style="border-radius: 15px; max-width: 1000px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
        <div>
          <h4 class="text-danger fw-bold m-0">Disponibilidad Horaria</h4>
          <p class="text-muted small m-0">Gestioná tus horarios y actividad deportiva.</p>
        </div>
        <span :class="edicionAbierta ? 'badge bg-success' : 'badge bg-secondary'" class="px-3 py-2 shadow-sm w-fit-mobile">
          {{ edicionAbierta ? 'Edición Abierta' : 'Edición Cerrada' }}
        </span>
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

        <button v-if="edicionAbierta" @click="guardarCambios" class="btn btn-success w-100 fw-bold shadow-sm py-2" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          ACTUALIZAR DISPONIBILIDAD
        </button>
      </div>
    </div>

    <div class="manual-section p-0 mx-auto mt-4 mb-5" style="max-width: 1000px; background: transparent; box-shadow: none;">
        <div class="text-center text-white-50 mb-3 small">
            <i class="bi bi-shield-lock-fill me-1"></i>
            Todas las modificaciones quedan registradas en el sistema.
        </div>
        
        <div class="card border-0 shadow-sm overflow-hidden mb-4" style="border-radius: 12px;">
            <div class="card-header bg-white border-bottom py-2 ps-3">
                <h6 class="m-0 fw-bold text-dark small">Historial de Solicitudes</h6>
            </div>
            <div class="card-body p-0 bg-white">
                <div v-if="historial.length > 0" class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr class="x-small text-uppercase text-muted">
                                <th class="ps-3" style="width: 110px;">Fecha</th>
                                <th>Mensaje</th>
                                <th class="text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(h, i) in historial" :key="i">
                                <td class="ps-3 small fw-bold text-dark">{{ h.fecha }}</td>
                                <td class="small text-dark">{{ h.mensaje }}</td>
                                <td class="text-center">
                                    <span class="badge bg-secondary x-small">ENVIADO</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center py-4 text-muted small">
                    Sin solicitudes previas de disponibilidad.
                </div>
            </div>
        </div>

        <div v-if="!edicionAbierta" class="mt-4">
            <div class="alert alert-info border-0 shadow-sm mb-3 d-flex align-items-center info-mobile" style="background-color: #e0f7fa; color: #006064; border-radius: 10px;">
                <i class="bi bi-info-circle-fill me-3 fs-5 d-none d-md-block"></i>
                <div class="x-small-mobile">
                    Informar cambios urgentes a <strong>secretaría y designaciones</strong>.
                </div>
            </div>

            <div class="p-3 p-md-4 rounded-4 shadow-lg" style="background: #0c1624; border: 1px dashed rgba(255,255,255,0.2);">
                <h6 class="text-white fw-bold small mb-2 text-uppercase">Informar cambio urgente</h6>
                <textarea v-model="solicitudCambio" class="form-control mb-3 custom-textarea" rows="3" placeholder="Detallá aquí tu cambio de horarios..."></textarea>
                <button @click="enviarSolicitudRectificacion" class="btn btn-danger w-100 fw-bold py-2 shadow" :disabled="cargando || !solicitudCambio">
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
            entity: 'arbitros',
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
            entity: 'arbitros',
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
/* (Se mantienen tus mismos estilos) */
.form-control-sm, .form-select-sm { border-radius: 8px; padding: 0.5rem; }
.manual-section { background-color: #0c1624; border-radius: 1rem; }
.btn-danger { background-color: #dc2626 !important; border: none; }
.text-white-50 { color: rgba(255, 255, 255, 0.5) !important; }

.custom-textarea {
    background-color: #ffffff !important;
    color: #000000 !important;
    border: none;
    border-radius: 8px;
}
.custom-textarea::placeholder { color: #6c757d; }

@media (max-width: 768px) {
    .w-fit-mobile { width: fit-content; }
    .x-small-mobile { font-size: 0.75rem; }
    .info-mobile { padding: 0.75rem; }
}

@media (max-width: 576px) {
    /* Reduce un poco el tamaño de los inputs de tiempo para que quepan bien */
    input[type="time"] {
        padding-left: 5px;
        padding-right: 5px;
        font-size: 0.85rem;
    }

    /* Ajusta el padding de la card para ganar espacio */
    .card-body {
        padding: 1rem !important;
    }

    /* Asegura que los checkboxes no queden pegados al borde */
    .form-check {
        margin-right: 5px;
    }
    
    /* Evita que el título de la página sea demasiado grande */
    h4 {
        font-size: 1.2rem;
    }
}

/* Mejora la visualización del estado ENVIADO */
.x-small {
    font-size: 0.65rem;
    font-weight: 800;
}
</style>