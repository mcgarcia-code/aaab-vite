<template>
  <div class="animate__animated animate__fadeIn">
    
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center">
            <i class="bi bi-clock me-2"></i> Disponibilidad Horaria
          </h4>
          <p class="text-muted small m-0 mt-1">Gestioná tus horarios y actividad deportiva.</p>
        </div>
        
        <div class="d-flex flex-wrap gap-2 justify-content-md-end">
          <span v-if="edicionAbierta" class="badge bg-success px-3 py-2 shadow-sm w-fit-mobile">
            <i class="bi bi-pencil-square me-1"></i> Edición Abierta
          </span>
          <span v-else class="badge bg-secondary px-3 py-2 shadow-sm w-fit-mobile">
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

        <button v-if="edicionAbierta" @click="guardarCambios" class="btn btn-success w-100 fw-bold shadow-sm py-2" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          ACTUALIZAR DISPONIBILIDAD
        </button>
      </div>
    </div>

    <div class="manual-section p-0 mx-auto mt-4 mb-5 w-100" style="background: transparent; box-shadow: none;">
        <div class="text-center text-white-50 mb-3 small">
            <i class="bi bi-shield-lock-fill me-1"></i>
            Todas las modificaciones quedan registradas en el sistema.
        </div>
        
        <div class="card border-0 shadow-sm overflow-hidden mb-4" style="border-radius: 12px;">
            <div class="card-header bg-white border-bottom py-2 ps-3">
                <h6 class="m-0 fw-bold text-dark small">Historial de Solicitudes</h6>
            </div>
            <div class="card-body p-0 bg-white">
                <div v-if="historialRectificaciones.length > 0" class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr class="x-small text-uppercase text-muted">
                                <th class="ps-3" style="width: 110px;">Fecha</th>
                                <th>Mensaje</th>
                                <th class="text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(h, i) in historialRectificaciones" :key="i">
                                <td class="ps-3 small fw-bold text-dark">{{ h.fecha }}</td>
                                <td class="small text-dark">{{ h.mensaje }}</td>
                                <td class="text-center">
                                    <span :class="['badge x-small', h.estado === 'aprobado' ? 'bg-success' : (h.estado === 'rechazado' ? 'bg-danger' : 'bg-warning text-dark')]">
                                      {{ h.estado ? h.estado.toUpperCase() : 'ENVIADO' }}
                                    </span>
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
   1. ESTRUCTURA BASE MAESTRA
   ==================================================== */
.full-screen-wrapper {
    position: relative; width: 99vw; min-height: 100vh; height: auto;
    margin-left: 50%; transform: translateX(-50%);
    padding: 20px; padding-bottom: 80px;
}

.admin-panel { 
    width: 100%; max-width: 100%; padding: 20px; 
    font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
    color: #000; background-color: #0f172a; 
    min-height: 100vh; height: 100%; border-radius: 12px;
}

/* Cabecera Estándar (Por si el componente la usa) */
.header-section { 
    background: white; padding: 15px 25px; border-radius: 8px; 
    display: flex; justify-content: space-between; margin-bottom: 15px; 
    border-left: 5px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
    align-items: center; 
}
.header-info { display: flex; flex-direction: column; }
.header-actions { display: flex; gap: 8px; }
.btn-action { 
    border: none; padding: 8px 12px; border-radius: 4px; 
    font-weight: bold; cursor: pointer; display: flex; 
    align-items: center; justify-content: center; gap: 5px; 
    font-size: 0.75rem; transition: opacity 0.2s; 
}
.btn-text { display: inline; }

/* ====================================================
   2. COMPONENTES ESPECÍFICOS DE ESTA VISTA
   ==================================================== */

   
.form-control-sm, .form-select-sm { border-radius: 8px; padding: 0.5rem; }
.x-small { font-size: 0.65rem; font-weight: 800; }
.manual-section { background-color: #0c1624; border-radius: 1rem; }
.btn-danger { background-color: #dc2626 !important; border: none; }
.text-white-50 { color: rgba(255, 255, 255, 0.5) !important; }
.custom-textarea {
    background-color: #ffffff !important; color: #000000 !important;
    border: none; border-radius: 8px;
}
.custom-textarea::placeholder { color: #6c757d; }



/* ====================================================
   3. 📱 RESPONSIVE DESIGN (Tiered Layout)
   ==================================================== */
.desktop-only { display: block; }
.mobile-only { display: none; }

/* --- Laptops y Tablets Grandes (Hasta 1024px) --- */
@media (max-width: 1024px) {
    .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
    .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}

/* --- Tablets y Móviles (Hasta 768px) --- */
@media (max-width: 768px) {
    .desktop-only { display: none !important; }
    .mobile-only { display: block !important; }

    .w-fit-mobile { width: fit-content; }
    .x-small-mobile { font-size: 0.75rem; }
    .info-mobile { padding: 0.75rem; }
}

/* --- Smartphones (Hasta 600px) --- */
@media (max-width: 600px) {
    /* AIRE LATERAL DE 10px */
    .full-screen-wrapper { 
        padding: 0 10px !important; 
        width: 100% !important; 
        margin: 0 !important; 
        transform: none !important; 
        left: 0 !important;
    }
    
    .admin-panel { padding: 15px 0 !important; border-radius: 0; }

    /* CABECERA ESTÁNDAR MÓVIL: Título Izquierda, Botones Centro */
    .header-section { 
        padding: 15px !important; flex-direction: column; 
        align-items: flex-start; text-align: left; gap: 15px; 
    }
    .header-info { width: 100%; display: flex; flex-direction: column; align-items: flex-start; }
    .header-info h4, h4 { font-size: 1.2rem !important; margin: 0; text-align: left; }
    
    .header-actions { 
        width: 100%; display: flex; flex-direction: row; 
        flex-wrap: wrap; justify-content: center; gap: 8px; 
    }
    .btn-action { flex: none; width: 42px; height: 42px; padding: 0; justify-content: center; }
    .btn-text { display: none !important; }

    /* AJUSTES ESPECÍFICOS DEL COMPONENTE */
    .manual-section { margin: 0 !important; width: 100% !important; }
    
    input[type="time"] { padding-left: 5px; padding-right: 5px; font-size: 0.85rem; }
    .card-body { padding: 1rem !important; }
    .form-check { margin-right: 5px; }
}
</style>