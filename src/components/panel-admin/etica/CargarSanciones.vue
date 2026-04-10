<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <!-- CABECERA -->
      <div class="header-section shadow-sm mb-4">
        <div class="header-info">
          <h2 class="title d-flex align-items-center gap-2">
            <span class="material-icons text-danger">gavel</span> Cargar Sanción
          </h2>
          <span class="counter">Tribunal de Ética - Registro disciplinario</span>
        </div>

        <div class="header-actions">
          <router-link to="/panel-admin/tribunal" class="text-decoration-none">
            <button class="btn-action btn-clear" title="Volver al Listado">
              <span class="material-icons">list</span>
              <span class="btn-text">Ver Listado</span>
            </button>
          </router-link>
        </div>
      </div>

      <div class="row g-4">

        <!-- FORMULARIO -->
        <div class="col-12 col-lg-8">
          <div class="menu-card-static shadow-sm border">
            <div class="row g-3">

              <div class="col-12">
                <label class="fw-bold text-dark small mb-1">Árbitro Involucrado</label>
                <select v-model="nuevaSancion.id_arbitro" class="form-select custom-input">
                  <option value="">Seleccione un árbitro...</option>
                  <option v-for="a in arbitros" :key="a.id" :value="a.id">
                    {{ a.apellido }}, {{ a.nombre }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="fw-bold text-dark small mb-1">Artículo (Reglamento)</label>
                <input v-model="nuevaSancion.articulo" placeholder="Ej: Art. 42 inc B" class="form-control custom-input">
              </div>

              <div class="col-md-6">
                <label class="fw-bold text-dark small mb-1">Sanción Aplicada</label>
                <input v-model="nuevaSancion.sancion" placeholder="Ej: 2 fechas" class="form-control custom-input">
              </div>

              <div class="col-12">
                <label class="fw-bold text-dark small mb-1">Motivo</label>
                <textarea v-model="nuevaSancion.motivo" rows="3" class="form-control custom-input"></textarea>
              </div>

              <div class="col-md-6">
                <label class="fw-bold text-dark small mb-1">Fecha Inicio</label>
                <input type="date" v-model="nuevaSancion.desde" class="form-control custom-input">
              </div>

              <div class="col-md-6">
                <label class="fw-bold text-dark small mb-1 d-flex justify-content-between">
                  <span>Fecha Fin</span>

                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="nuevaSancion.es_indefinido"
                      :true-value="1"
                      :false-value="0"
                      @change="() => { if (nuevaSancion.es_indefinido == 1) nuevaSancion.hasta = '' }"
                    >
                    <label class="form-check-label small">Indefinido</label>
                  </div>
                </label>

                <input
                  type="date"
                  v-model="nuevaSancion.hasta"
                  class="form-control custom-input"
                  :disabled="nuevaSancion.es_indefinido == 1"
                >
              </div>

              <!-- MENSAJE -->
              <div class="col-12 mt-4 pt-3 border-top">

                <!-- 🔧 CORRECCIÓN ACÁ -->
                <div
                  v-if="mensaje.texto"
                  :class="[
                    'alert d-flex align-items-center',
                    mensaje.tipo === 'success'
                      ? 'alert-success'
                      : (mensaje.tipo === 'warning'
                        ? 'alert-warning'
                        : 'alert-danger')
                  ]"
                >
                  <span class="material-icons me-2">
                    {{ mensaje.tipo === 'success' ? 'check_circle' : (mensaje.tipo === 'warning' ? 'warning' : 'error') }}
                  </span>
                  {{ mensaje.texto }}
                </div>

                <button @click="guardarSancion" :disabled="cargando" class="btn-send shadow-sm">
                  <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                  {{ cargando ? 'GUARDANDO...' : 'REGISTRAR SANCIÓN' }}
                </button>

              </div>

            </div>
          </div>
        </div>

        <!-- HISTORIAL -->
        <div class="col-12 col-lg-4">
          <div class="side-card shadow-sm border h-100">

            <h6 class="fw-bold text-dark mb-3">
              <span class="material-icons">history</span> Últimos Registros
            </h6>

            <div v-if="cargandoHistorial" class="text-center text-muted">
              Cargando...
            </div>

            <div v-else-if="ultimasSanciones.length === 0" class="text-muted text-center">
              Sin registros
            </div>

            <div v-else>
              <div v-for="s in ultimasSanciones" :key="s.id" class="mb-2 border-bottom pb-2">

                <div class="d-flex justify-content-between">
                  <strong>{{ s.arbitro || s.arbitro_nombre || s.id_arbitro }}</strong>
                  <span class="badge bg-danger">{{ s.sancion }}</span>
                </div>

                <div class="small text-muted">
                  Art. {{ s.articulo }} - {{ s.motivo }}
                </div>

                <div class="small text-muted d-flex justify-content-between">
                  <span>D: {{ s.desde }}</span>
                  <span v-if="s.es_indefinido == 1">Indefinido</span>
                  <span v-else>H: {{ s.hasta }}</span>
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

const notificar = inject('notificar', (opts) => alert(opts.mensaje));

const arbitros  = ref([]);
const ultimasSanciones = ref([]);
const cargando  = ref(false);
const cargandoHistorial = ref(true);
const mensaje   = ref({ texto: '', tipo: '' }); // Agregado para usarlo si no queres usar notificar en el html

const sancionVacia = () => ({
  id_arbitro:   '',
  articulo:     '',
  sancion:      '',
  motivo:       '',
  desde:        '',
  hasta:        '',
  es_indefinido: 0,
});

const nuevaSancion = ref(sancionVacia());

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
    // Action corregido
    const data = await api.get({ entity: 'sanciones', action: 'obtenerSanciones' });
    let lista = Array.isArray(data) ? data : (data.payload ?? []);
    ultimasSanciones.value = lista.slice(0, 5);
  } catch (err) {
    console.error('Error cargando historial:', err);
  } finally {
    cargandoHistorial.value = false;
  }
};

const guardarSancion = async () => {
  if (!nuevaSancion.value.id_arbitro || !nuevaSancion.value.desde) {
    notificar({ titulo: 'Datos incompletos', mensaje: 'Seleccioná un árbitro y la fecha de inicio.', tipo: 'danger' });
    return;
  }
  if (!nuevaSancion.value.motivo.trim()) {
    notificar({ titulo: 'Falta Motivo', mensaje: 'El motivo es obligatorio.', tipo: 'danger' });
    return;
  }

  cargando.value = true;
  try {
    // Action corregido
    const res = await api.post({
      entity:  'sanciones',
      action:  'crearSancion', 
      payload: nuevaSancion.value,
    });
    
    if (res.ok !== false) {
      notificar({ titulo: 'Éxito', mensaje: 'Sanción registrada y notificada correctamente.', tipo: 'success' });
      nuevaSancion.value = sancionVacia();
      await cargarUltimasSanciones();
    } else {
      notificar({ titulo: 'Error', mensaje: 'Hubo un problema al registrar la sanción.', tipo: 'danger' });
    }
  } catch {
    notificar({ titulo: 'Error de conexión', mensaje: 'Error al conectar con el servidor.', tipo: 'danger' });
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
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto !important; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 120px; }
.admin-panel { width: 100%; max-width: 100%; padding: 20px; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; background-color: #0f172a; min-height: 100vh; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #ef4444; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #000; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }

/* GRILLA DIVIDIDA */
.menu-card-static {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  border-top: 4px solid #dc2626;
}

.side-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  border-top: 4px solid #64748b;
}

.custom-input {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.95rem;
  background-color: #f8fafc;
  transition: all 0.3s ease;
}
.custom-input:focus {
  background-color: #fff;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
  outline: none;
}
.custom-input:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.btn-send {
  width: 100%;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 0.5px;
  transition: all 0.2s;
  cursor: pointer;
}
.btn-send:hover:not(:disabled) { background-color: #b91c1c; }
.btn-send:disabled { background-color: #fca5a5; cursor: not-allowed; }

@media (max-width: 991px) {
  .menu-card-static, .side-card { padding: 20px; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; }
  .header-section { padding: 10px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
}
</style>