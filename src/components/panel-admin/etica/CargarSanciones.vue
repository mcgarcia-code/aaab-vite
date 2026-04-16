<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white" style="border-radius: 12px; overflow: hidden;">
        
        <div class="header-section border-bottom" style="margin-bottom: 0; box-shadow: none; border-radius: 0; padding: 20px;">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2" style="font-size: 1.25rem;">
              <span class="material-icons">gavel</span> Cargar Sanción
            </h4>
            <span class="counter mt-1 d-block text-muted">El estado inicial será <strong>EN PROCESO</strong></span>
          </div>

          <div class="header-actions">
            <router-link to="/panel-admin/tribunal/sanciones" class="text-decoration-none">
              <button class="btn-action btn-clear bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center gap-2" title="Volver al Listado" style="background-color: #ffffff !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
                <span class="material-icons" style="font-size: 22px; color: #64748b;">list</span>
                <span class="btn-text desktop-only fw-bold text-secondary" style="font-size: 0.8rem;">Ver Listado</span>
              </button>
            </router-link>
          </div>
        </div>

        <div class="card-body p-3 p-md-4" style="background-color: #f8fafc;">
          <div class="row g-4">

            <div class="col-12 col-lg-8">
              <div class="menu-card-static border-0 shadow-sm">
                <form @submit.prevent="guardarSancion">
                  <div class="row g-3">

                    <div class="col-12">
                      <label class="fw-bold text-dark small mb-1">Árbitro Involucrado *</label>
                      <select v-model="nuevaSancion.id_arbitro" class="form-select custom-input" required :disabled="cargando">
                        <option value="" disabled>Seleccione un árbitro...</option>
                        <option v-for="a in arbitros" :key="a.id" :value="a.id">
                          {{ a.apellido }}, {{ a.nombre }}
                        </option>
                      </select>
                    </div>

                    <div class="col-12">
                      <label class="fw-bold text-dark small mb-1">Artículo (Reglamento) *</label>
                      <input type="text" v-model="nuevaSancion.articulo" placeholder="Ej: Art. 42 inc B" class="form-control custom-input" required :disabled="cargando">
                    </div>

                    <div class="col-12">
                      <label class="fw-bold text-dark small mb-1">Motivo / Descripción de los hechos *</label>
                      <textarea v-model="nuevaSancion.motivo" rows="5" class="form-control custom-input" placeholder="Detalle los motivos por los cuales se inicia este proceso..." required :disabled="cargando"></textarea>
                    </div>

                    <div class="col-12 mt-4 pt-3 border-top">
                      <button type="submit" :disabled="cargando" class="btn-send shadow-sm">
                        <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                        {{ cargando ? 'INICIANDO PROCESO...' : 'REGISTRAR SANCIÓN' }}
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            </div>

            <div class="col-12 col-lg-4">
              <div class="side-card border-0 h-100 shadow-sm">

                <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <span class="material-icons">history</span> Últimos Registros
                </h6>

                <div v-if="cargandoHistorial" class="text-center text-muted my-4">
                  <div class="spinner-border spinner-border-sm mb-2 text-danger"></div><br>
                  <span class="small">Cargando...</span>
                </div>

                <div v-else-if="ultimasSanciones.length === 0" class="text-muted text-center my-4 small">
                  Sin registros recientes
                </div>

                <div v-else>
                  <div v-for="s in ultimasSanciones" :key="s.id" class="mb-3 border-bottom pb-3">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                      <strong class="text-dark small">{{ s.arbitro || s.arbitro_nombre || s.id_arbitro }}</strong>
                      <span :class="obtenerClaseEstado(s.estado_dinamico)">
                        {{ obtenerTextoEstado(s.estado_dinamico) }}
                      </span>
                    </div>
                    <div class="small text-muted mt-1" style="line-height: 1.3;">
                      <strong class="text-dark">Art. {{ s.articulo }}</strong> - {{ s.motivo }}
                    </div>
                    <div class="small mt-1" :class="obtenerClaseTextoSancion(s.estado_dinamico)">
                      {{ obtenerTextoSancion(s) }}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div> </div> </div>
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
/* ESTILOS WRAPPER ESTÁNDAR */
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto !important; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 120px; box-sizing: border-box; }
.admin-panel { width: 100%; max-width: 100%; padding: 20px; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }

/* CABECERA ORIGINAL */
.header-section { 
  background: white; 
  padding: 15px 25px; 
  border-radius: 8px; 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 15px; 
  border-left: 5px solid #ef4444; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
  align-items: center; 
}

.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #64748b; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.85rem; transition: opacity 0.2s; }
.btn-clear { background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; }

/* GRILLA DIVIDIDA - Sombras intensificadas para resaltar sobre fondo #f8fafc */
.menu-card-static { background: #ffffff; border-radius: 12px; padding: 30px; border-top: 4px solid #dc2626; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); }
.side-card { background: #ffffff; border-radius: 12px; padding: 25px; border-top: 4px solid #64748b; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); }

.custom-input { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 0.95rem; background-color: #f8fafc; transition: all 0.3s ease; resize: vertical; }
.custom-input:focus { background-color: #fff; border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15); outline: none; }
.custom-input:disabled { background-color: #f1f5f9; color: #94a3b8; cursor: not-allowed; }

.btn-send { width: 100%; background-color: #dc2626; color: white; border: none; border-radius: 8px; padding: 14px; font-weight: bold; font-size: 1rem; letter-spacing: 0.5px; transition: all 0.2s; cursor: pointer; }
.btn-send:hover:not(:disabled) { background-color: #b91c1c; }
.btn-send:disabled { background-color: #fca5a5; cursor: not-allowed; }

/* BADGES ESTÉTICA OFICIAL */
.text-en-proceso { color: #d97706 !important; }
.text-anulada { color: #0f172a !important; }

.badge-status { padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 700; display: inline-block; text-align: center; letter-spacing: 0.5px;}
.badge-status.aprobada { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.badge-status.rechazada { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.badge-status.pendiente { background: #fef9c3; color: #a16207; border: 1px solid #fef08a; } 
.badge-status.anulada { background: #0f172a; color: #ffffff; border: 1px solid #0f172a; }

/* PAGINACIÓN (por si lo necesitamos en un futuro) */
.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 12px; }
.btn-paginacion { border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: white; font-size: 0.85rem; font-weight: 600; }

/* RESPONSIVE CORRECTO (BOTÓN EN LA MISMA LÍNEA) */
@media (max-width: 991px) {
  .menu-card-static, .side-card { padding: 20px; }
}

@media (max-width: 600px) {
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto;
  margin-left: 50%;
  transform: translateX(-50%);
      /* Top en 0, pero conservando los 15px laterales originales para celulares */
  padding: 0 15px 20px 15px !important; 
  box-sizing: border-box !important;
}
    
.admin-panel { 
      padding: 0 !important; 
      border-radius: 0; 
      box-sizing: border-box !important;
}
  
  /* ESTA ES LA CLAVE: flex-direction row obliga a mantenerse en la misma línea */
  .header-section { padding: 15px; flex-direction: row; align-items: center; justify-content: space-between; }
  .header-info h4 { font-size: 1.25rem !important; }
  .header-info span { font-size: 0.85rem !important; }
  
  /* El botón se achica y esconde el texto */
  .header-actions { width: auto; display: flex; flex-direction: row; gap: 8px; }
  .btn-action { flex: none; width: 42px; height: 42px; padding: 0; justify-content: center; }
  .btn-action span.material-icons { margin: 0; }
  .btn-text { display: none !important; }
}

.animate__animated { animation-duration: 0.5s; }
</style>