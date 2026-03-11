<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const arbitro = ref(JSON.parse(localStorage.getItem('user_aaab') || '{}'));
const solicitudManual = ref('');
const historial = ref([]);
const cargando = ref(false);
const mensaje = ref({ texto: '', tipo: '' });

// 1. VARIABLE PARA LOS CHECKBOXES (Esencial para que se marquen)
const movilidadSeleccionada = ref([]);

const edicionAbierta = ref(arbitro.value.permitir_edicion == 1);

const obtenerHistorial = async () => {
  try {
    const res = await axios.get(`https://arbitroshandball.com.ar/api/obtener_historial.php?id_arbitro=${arbitro.value.id}`);
    historial.value = res.data;
  } catch {
    console.error("Error al cargar el historial");
  }
};

onMounted(() => {
  obtenerHistorial();
  // 2. CARGAR MOVILIDAD AL INICIAR
  if (arbitro.value.movilidad) {
    movilidadSeleccionada.value = arbitro.value.movilidad.split(',');
  }
});

// 3. ACTUALIZAR STRING DE MOVILIDAD AL MARCAR CHECKS
watch(movilidadSeleccionada, (nuevo) => {
  arbitro.value.movilidad = nuevo.join(',');
});

// 4. LIMPIAR HORARIOS SI NO ES "OTROS" (Para que no queden datos viejos en la DB)
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

const guardarCambiosDirectos = async () => {
  cargando.value = true;
  try {
    const res = await axios.post('https://arbitroshandball.com.ar/api/actualizar_perfil.php', arbitro.value);
    if (res.data.success) {
      mensaje.value = { texto: "Disponibilidad actualizada correctamente.", tipo: 'success' };
      localStorage.setItem('user_aaab', JSON.stringify(arbitro.value));
    } else {
      mensaje.value = { texto: res.data.message, tipo: 'danger' };
    }
  } catch {
    mensaje.value = { texto: "Error de conexión.", tipo: 'danger' };
  } finally {
    cargando.value = false;
  }
};

const enviarSolicitudManual = async () => {
  if (!solicitudManual.value.trim()) return;
  cargando.value = true;
  try {
    const res = await axios.post('https://arbitroshandball.com.ar/api/solicitar_disponibilidad.php', {
      id_arbitro: arbitro.value.id,
      nombre: arbitro.value.nombre,
      apellido: arbitro.value.apellido,
      grupo: arbitro.value.grupo,
      mensaje: "SOLICITUD DISPONIBILIDAD: " + solicitudManual.value
    });
    if (res.data.success) {
      mensaje.value = { texto: "Solicitud enviada con éxito.", tipo: 'success' };
      solicitudManual.value = '';
      obtenerHistorial();
    }
  } catch {
    mensaje.value = { texto: "Error al enviar solicitud.", tipo: 'danger' };
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="animate__animated animate__fadeIn container py-4 page-bg">
    
    <div class="card shadow border-0 mb-4" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
        <div>
          <h4 class="text-danger fw-bold m-0">Disponibilidad Horaria</h4>
          <p class="text-muted small m-0">Gestioná tus horarios y actividad deportiva.</p>
        </div>
        <span :class="edicionAbierta ? 'badge bg-success' : 'badge bg-secondary'" class="px-3 py-2 shadow-sm">
          {{ edicionAbierta ? 'Edición Abierta' : 'Edición Cerrada' }}
        </span>
      </div>
      
      <div class="card-body p-4">
        <div v-if="mensaje.texto" :class="`alert alert-${mensaje.tipo} mb-4 shadow-sm border-0`" role="alert">
          {{ mensaje.texto }}
        </div>

        <h6 class="text-danger fw-bold text-uppercase mb-3 small" style="letter-spacing: 1px;">Movilidad</h6>
        <div class="row mb-4 border-bottom pb-3">
          <div class="col-12 d-flex gap-4">
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
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted">Disponibilidad</label>
            <select v-if="edicionAbierta" v-model="arbitro.disponibilidad_sabado" class="form-select form-select-sm">
              <option value="NO">NO</option>
              <option value="FT">FT (Full Time)</option>
              <option value="OTROS">OTROS</option>
            </select>
            <div v-else class="p-2 bg-light rounded fw-bold">{{ arbitro.disponibilidad_sabado }}</div>
          </div>
          <div v-if="arbitro.disponibilidad_sabado === 'OTROS'" class="col-md-4">
            <label class="form-label small fw-bold text-muted">Desde</label>
            <input v-if="edicionAbierta" v-model="arbitro.disponibilidad_sabado_desde" type="time" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold">{{ arbitro.disponibilidad_sabado_desde || '--:--' }}</div>
          </div>
          <div v-if="arbitro.disponibilidad_sabado === 'OTROS'" class="col-md-4">
            <label class="form-label small fw-bold text-muted">Hasta</label>
            <input v-if="edicionAbierta" v-model="arbitro.disponibilidad_sabado_hasta" type="time" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold">{{ arbitro.disponibilidad_sabado_hasta || '--:--' }}</div>
          </div>
        </div>

        <h6 class="text-danger fw-bold text-uppercase mb-3 small" style="letter-spacing: 1px;">Domingos</h6>
        <div class="row g-3 mb-4 border-bottom pb-4">
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted">Disponibilidad</label>
            <select v-if="edicionAbierta" v-model="arbitro.disponibilidad_domingo" class="form-select form-select-sm">
              <option value="NO">NO</option>
              <option value="FT">FT (Full Time)</option>
              <option value="OTROS">OTROS</option>
            </select>
            <div v-else class="p-2 bg-light rounded fw-bold">{{ arbitro.disponibilidad_domingo }}</div>
          </div>
          <div v-if="arbitro.disponibilidad_domingo === 'OTROS'" class="col-md-4">
            <label class="form-label small fw-bold text-muted">Desde</label>
            <input v-if="edicionAbierta" v-model="arbitro.disponibilidad_domingo_desde" type="time" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold">{{ arbitro.disponibilidad_domingo_desde || '--:--' }}</div>
          </div>
          <div v-if="arbitro.disponibilidad_domingo === 'OTROS'" class="col-md-4">
            <label class="form-label small fw-bold text-muted">Hasta</label>
            <input v-if="edicionAbierta" v-model="arbitro.disponibilidad_domingo_hasta" type="time" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold">{{ arbitro.disponibilidad_domingo_hasta || '--:--' }}</div>
          </div>
        </div>

        <h6 class="text-danger fw-bold text-uppercase mb-3 small" style="letter-spacing: 1px;">Actividad Deportiva</h6>
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted">¿Juega al Handball?</label>
            <select v-if="edicionAbierta" v-model="arbitro.juega_handball" class="form-select form-select-sm">
              <option value="no">NO</option>
              <option value="si">SI</option>
            </select>
            <div v-else class="p-2 bg-light rounded fw-bold text-uppercase">{{ arbitro.juega_handball }}</div>
          </div>
          <div v-if="arbitro.juega_handball === 'si'" class="col-md-4">
            <label class="form-label small fw-bold text-muted">Club</label>
            <input v-if="edicionAbierta" v-model="arbitro.donde_juega" type="text" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold">{{ arbitro.donde_juega || '-' }}</div>
          </div>
          <div v-if="arbitro.juega_handball === 'si'" class="col-md-4">
            <label class="form-label small fw-bold text-muted">Categoría</label>
            <input v-if="edicionAbierta" v-model="arbitro.categoria_handball" type="text" class="form-control form-control-sm">
            <div v-else class="p-2 bg-light rounded fw-bold">{{ arbitro.categoria_handball || '-' }}</div>
          </div>
          <div class="col-md-12">
            <label class="form-label small fw-bold text-muted">Observaciones Generales</label>
            <textarea v-if="edicionAbierta" v-model="arbitro.observaciones" class="form-control form-control-sm" rows="2"></textarea>
            <div v-else class="p-2 bg-light rounded small text-dark">{{ arbitro.observaciones || 'Sin observaciones' }}</div>
          </div>
        </div>

        <button v-if="edicionAbierta" @click="guardarCambiosDirectos" class="btn btn-success w-100 fw-bold shadow-sm py-2" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          ACTUALIZAR DISPONIBILIDAD EN LEGAJO
        </button>
      </div>
    </div>
    <div class="manual-section p-4 rounded-4 shadow-lg mb-5">
        <div class="text-center text-white-50 mb-4 small">
            <i class="bi bi-shield-lock-fill me-1"></i>
            Para evitar abusos, todas las solicitudes quedan registradas en tu historial de legajo.
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
                                <th class="ps-3" style="width: 130px;">Fecha</th>
                                <th>Mensaje / Motivo</th>
                                <th class="text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(h, i) in historial" :key="i">
                                <td class="ps-3 small fw-bold">{{ h.fecha }}</td>
                                <td class="small text-dark">{{ h.mensaje_corto || h.mensaje }}</td>
                                <td class="text-center">
                                    <span class="badge bg-secondary x-small">ENVIADO</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center py-5">
                    <div class="mb-3">
                        <i class="bi bi-folder2-open fs-1 text-muted opacity-50"></i>
                    </div>
                    <p class="text-muted small px-3">No registras solicitudes previas en tu historial de legajo.</p>
                </div>
            </div>
        </div>
        <div v-if="!edicionAbierta" class="mt-4">
            <div class="alert alert-info border-0 shadow-sm mb-3 d-flex align-items-center" style="background-color: #e0f7fa; color: #006064; border-radius: 10px;">
                <i class="bi bi-info-circle-fill me-3 fs-5"></i>
                <div class="small">
                    Esta solicitud será enviada a <strong>secretaría y designaciones</strong>. Incluiremos automáticamente tu nombre ({{ arbitro.nombre }} {{ arbitro.apellido }}), ID, Grupo ({{ arbitro.grupo }}) y Subgrupo ({{ arbitro.subgrupo || '-' }}) para agilizar el trámite.
                </div>
            </div>
            <div class="p-4 rounded-4" style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2);">
                <h6 class="text-white fw-bold small mb-2 text-uppercase">Informar cambio urgente</h6>
                <textarea v-model="solicitudManual" class="form-control mb-3 text-white border-secondary" rows="3" placeholder="Detallá aquí tu cambio de disponibilidad..."></textarea>
                <button @click="enviarSolicitudManual" class="btn btn-danger w-100 fw-bold py-2 shadow" :disabled="cargando || !solicitudManual">
                    ENVIAR SOLICITUD FORMAL
                </button>
            </div>
        </div>
    </div>
  </div>
</template>