<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <span class="material-icons">gavel</span> Cargar Sanción
            </h4>
            <span class="text-muted small d-block mt-1">El estado inicial será <strong class="text-dark">EN PROCESO</strong></span>
          </div>

          <div class="d-flex align-items-center">
            <router-link to="/panel-admin/tribunal/sanciones" class="text-decoration-none">
              <button class="btn btn-light border shadow-sm py-2 px-3 d-flex align-items-center gap-2">
                <span class="material-icons text-dark fs-5">list</span>
                <span class="fw-bold text-dark d-none d-md-inline small">Ver Listado</span>
              </button>
            </router-link>
          </div>
        </div>

        <div class="card-body p-3 p-md-4 bg-light">
          <div class="row g-4">

            <!-- FORMULARIO PRINCIPAL -->
            <div class="col-12 col-lg-8">
              <div class="card border-0 shadow-sm rounded-4 h-100" style="border-top: 4px solid #dc2626 !important;">
                <div class="card-body p-4">
                  <form @submit.prevent="guardarSancion">
                    <div class="row g-3">

                      <div class="col-12">
                        <label class="fw-bold text-dark small mb-1">Árbitro Involucrado *</label>
                        <select v-model="nuevaSancion.id_arbitro" class="form-select shadow-none border-secondary-subtle bg-light py-2" required :disabled="cargando">
                          <option value="" disabled>Seleccione un árbitro...</option>
                          <option v-for="a in arbitros" :key="a.id" :value="a.id">
                            {{ a.apellido }}, {{ a.nombre }}
                          </option>
                        </select>
                      </div>

                      <div class="col-12">
                        <label class="fw-bold text-dark small mb-1">Artículo (Reglamento) *</label>
                        <input type="text" v-model="nuevaSancion.articulo" placeholder="Ej: Art. 42 inc B" class="form-control shadow-none border-secondary-subtle bg-light py-2" required :disabled="cargando">
                      </div>

                      <div class="col-12">
                        <label class="fw-bold text-dark small mb-1">Motivo / Descripción de los hechos *</label>
                        <textarea v-model="nuevaSancion.motivo" rows="5" class="form-control shadow-none border-secondary-subtle bg-light py-2" placeholder="Detalle los motivos por los cuales se inicia este proceso..." required :disabled="cargando"></textarea>
                      </div>

                      <div class="col-12 mt-4 pt-3 border-top border-light-subtle">
                        <button type="submit" :disabled="cargando" class="btn btn-danger w-100 fw-bold py-3 shadow-sm rounded-3">
                          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                          {{ cargando ? 'INICIANDO PROCESO...' : 'REGISTRAR SANCIÓN' }}
                        </button>
                      </div>

                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- BARRA LATERAL (HISTORIAL) -->
            <div class="col-12 col-lg-4">
              <div class="card border-0 shadow-sm rounded-4 h-100" style="border-top: 4px solid #64748b !important;">
                <div class="card-body p-4">
                  <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    <span class="material-icons">history</span> Últimos Registros
                  </h6>

                  <div v-if="cargandoHistorial" class="text-center text-muted my-5">
                    <div class="spinner-border text-danger mb-2"></div>
                    <p class="small m-0 fw-bold">Cargando...</p>
                  </div>

                  <div v-else-if="ultimasSanciones.length === 0" class="text-muted text-center my-5">
                    <span class="material-icons fs-1 opacity-50 d-block mb-2">history_toggle_off</span>
                    <span class="small fw-bold">Sin registros recientes</span>
                  </div>

                  <div v-else class="d-flex flex-column gap-3">
                    <div v-for="s in ultimasSanciones" :key="s.id" class="border-bottom pb-3">
                      <div class="d-flex justify-content-between align-items-start mb-1">
                        <strong class="text-dark small text-uppercase">{{ s.arbitro || s.arbitro_nombre || s.id_arbitro }}</strong>
                        <span :class="['badge-status-sm', obtenerClaseEstado(s.estado_dinamico)]">
                          {{ obtenerTextoEstado(s.estado_dinamico) }}
                        </span>
                      </div>
                      <div class="small text-muted mt-2 lh-sm border-start border-3 ps-2">
                        <strong class="text-dark">Art. {{ s.articulo }}</strong> - {{ s.motivo }}
                      </div>
                      <div class="small mt-2 fw-bold" :class="obtenerClaseTextoSancion(s.estado_dinamico)">
                        {{ obtenerTextoSancion(s) }}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
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
  title: 'Cargar Sanción | AAAB'
});

const notificar = inject('notificar', (opts) => {
    console.error("No se encontró el notificador global", opts);
    alert(opts.mensaje);
});

const arbitros  = ref([]);
const ultimasSanciones = ref([]);
const cargando  = ref(false);
const cargandoHistorial = ref(true);

const sancionVacia = () => ({
  id_arbitro: '',
  articulo: '',
  motivo: ''
});

const nuevaSancion = ref(sancionVacia());

// LÓGICA VISUAL
const obtenerTextoEstado = (estado_dinamico) => {
  if (estado_dinamico == 1) return 'VIGENTE';
  if (estado_dinamico == 2) return 'CUMPLIDA';
  if (estado_dinamico == 3) return 'EN PROCESO';
  if (estado_dinamico == 4) return 'ANULADA';
  return 'DESCONOCIDO';
};

const obtenerClaseEstado = (estado_dinamico) => {
  if (estado_dinamico == 1) return 'badge-status rechazada';
  if (estado_dinamico == 2) return 'badge-status aprobada';
  if (estado_dinamico == 3) return 'badge-status pendiente text-dark';
  if (estado_dinamico == 4) return 'badge-status anulada';
  return 'badge-status';
};

const obtenerTextoSancion = (s) => {
  if (s.estado_dinamico == 4) return 'Anulada';
  if (s.estado_dinamico == 3) return 'En proceso';
  return s.sancion || 'En proceso';
};

const obtenerClaseTextoSancion = (estado_dinamico) => {
  if (estado_dinamico == 4) return 'text-anulada fw-bold';
  if (estado_dinamico == 3) return 'text-en-proceso fw-bold';
  return 'text-danger fw-bold';
};

const cargarArbitros = async () => {
  try {
    const data = await api.get({ entity: 'arbitros', action: 'getArbitros' });
    let lista = Array.isArray(data) ? data : (data.payload ?? []);

    lista.sort((a, b) => {
      const nombreA = `${a.apellido} ${a.nombre}`.toUpperCase();
      const nombreB = `${b.apellido} ${b.nombre}`.toUpperCase();
      return nombreA.localeCompare(nombreB);
    });

    arbitros.value = lista;
  } catch (err) {
    console.error('Error cargando árbitros:', err);
  }
};

const cargarUltimasSanciones = async () => {
  cargandoHistorial.value = true;
  try {
    const data = await api.get({ entity: 'sanciones', action: 'obtenerSanciones' });
    let lista = Array.isArray(data) ? data : (data.payload ?? []);

    // ORDENAR DE MÁS RECIENTE A MÁS ANTIGUA (MAYOR ID PRIMERO)
    lista.sort((a, b) => b.id - a.id);

    ultimasSanciones.value = lista.slice(0, 5);
  } catch (err) {
    console.error('Error cargando historial:', err);
  } finally {
    cargandoHistorial.value = false;
  }
};

const guardarSancion = async () => {
  if (!nuevaSancion.value.id_arbitro || !nuevaSancion.value.articulo.trim() || !nuevaSancion.value.motivo.trim()) {
    notificar({ titulo: 'Datos incompletos', mensaje: 'Por favor completá todos los campos obligatorios.', tipo: 'warning' });
    return;
  }

  cargando.value = true;

  try {
    const res = await api.post({
      entity:  'sanciones',
      action:  'crearSancion',
      payload: nuevaSancion.value,
    });

    if (res?.ok !== false) {
      notificar({ titulo: '¡Proceso Iniciado!', mensaje: 'La sanción se registró y se notificó al árbitro.', tipo: 'success' });
      nuevaSancion.value = sancionVacia();
      await cargarUltimasSanciones();
    } else {
      notificar({ titulo: 'Error al registrar', mensaje: res?.message || 'Hubo un problema en el servidor al intentar guardar.', tipo: 'danger' });
    }
  } catch (error) {
    console.error("Error en guardarSancion:", error);
    notificar({ titulo: 'Error de Conexión', mensaje: 'No se pudo contactar con el servidor. Revisá tu conexión.', tipo: 'danger' });
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarArbitros();
  cargarUltimasSanciones();
});
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  margin-left: 50%;
  transform: translateX(-50%);
  padding-bottom: 120px;
}

.admin-panel {
  width: 100%;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

/* ====================================================
   UTILIDADES PARA INPUTS
   ==================================================== */
.form-control:focus, .form-select:focus {
  background-color: #fff !important;
  border-color: #dc2626 !important;
}

/* ====================================================
   ESTADOS DE SANCIONES (Badges y Textos)
   ==================================================== */
.text-en-proceso { color: #d97706 !important; }
.text-anulada { color: #0f172a !important; }

.badge-status-sm {
  border-radius: 20px;
  font-weight: 700;
  display: inline-block;
  text-align: center;
  padding: 3px 8px;
  font-size: 0.65rem;
  border: 1px solid;
}

.vigente { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
.cumplida { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
.en-proceso { background: #fef9c3; color: #a16207; border-color: #fef08a; }
.anulada { background: #0f172a; color: #ffffff; border-color: #0f172a; }

.animate__animated { animation-duration: 0.5s; }

/* Cero media queries. Totalmente manejado por las grillas col-12 col-lg-8/4 de Bootstrap */
</style>
