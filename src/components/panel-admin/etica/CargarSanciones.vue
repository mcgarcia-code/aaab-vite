<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="header-section shadow-sm mb-4">
        <div class="header-info">
          <h2 class="title d-flex align-items-center gap-2">
            <span class="material-icons text-danger">gavel</span> Cargar Sanción
          </h2>
          <span class="counter">Tribunal de Ética - El estado inicial será <strong>EN PROCESO</strong></span>
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

        <div class="col-12 col-lg-8">
          <div class="menu-card-static shadow-sm border">
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
          <div class="side-card shadow-sm border h-100">

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
                  <span class="badge" :class="s.estado_dinamico === 1 ? 'bg-danger' : 'bg-secondary'">
                    {{ s.estado_dinamico === 1 ? 'VIGENTE' : 'CERRADA' }}
                  </span>
                </div>
                <div class="small text-muted" style="line-height: 1.3;">
                  <strong>Art. {{ s.articulo }}</strong> - {{ s.motivo }}
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

// Inyectamos el notificador (Si falla el inject, hace un console error)
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
    
    // Asumimos que si no es explícitamente ok=false, funcionó
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
.full-screen-wrapper { 
  position: relative; 
  width: 99vw; 
  min-height: 100vh; 
  height: auto !important; 
  margin-left: 50%; 
  transform: translateX(-50%); 
  padding: 20px; 
  padding-bottom: 120px; 
}
.admin-panel { 
  width: 100%; 
  max-width: 100%; 
  padding: 20px; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif; 
  color: #000; 
  background-color: #0f172a; 
  min-height: 100vh; 
  border-radius: 12px;
}
.header-section { 
  background: white; 
  padding: 15px 25px; 
  border-radius: 8px; 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 15px; 
  border-left: 5px solid #ef4444; 
  align-items: center; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
}
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #64748b; }

.header-actions { display: flex; gap: 8px; }
.btn-action { 
  border: none; 
  padding: 8px 12px; 
  border-radius: 4px; 
  font-weight: bold; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 5px; 
  font-size: 0.75rem; 
  transition: opacity 0.2s; 
}
.btn-clear { background: #e2e8f0; color: #000; }

/* GRILLA DIVIDIDA */
.menu-card-static {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  border-top: 4px solid #dc2626;
}

.side-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 25px;
  border-top: 4px solid #64748b;
}

.custom-input {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.95rem;
  background-color: #f8fafc;
  transition: all 0.3s ease;
  resize: vertical;
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

/* RESPONSIVE */
@media (max-width: 991px) {
  .menu-card-static, .side-card { padding: 20px; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; border-radius: 0; }
  .header-section { padding: 15px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .full-screen-wrapper { padding: 0; width: 100vw; }
  .btn-action .btn-text { display: none; } /* Oculta texto del botón volver en móviles */
}

.animate__animated {
  animation-duration: 0.5s;
}
</style>