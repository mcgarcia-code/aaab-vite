<template>
  <div class="container-fluid py-4 animate__animated animate__fadeIn">

    <div class="text-center mb-4">
      <i class="bi bi-list-check text-danger main-icon"></i>
      <h2 class="fw-bold text-white mt-2">Historial de Sanciones</h2>
      <p class="small text-white m-0">Gestión completa de sanciones disciplinarias</p>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-lg-11">

        <!-- Barra de acciones -->
        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <input
            v-model="filtro"
            class="form-control buscador"
            placeholder="🔍 Buscar por árbitro, motivo o artículo..."
          >
          <router-link
            to="/panel-admin/tribunal/cargar-sancion"
            class="btn btn-danger rounded-pill px-4 fw-bold text-nowrap"
          >
            <i class="bi bi-plus-circle me-1"></i> Nueva sanción
          </router-link>
        </div>

        <!-- Tabla -->
        <div class="menu-card-static shadow-lg p-0 overflow-hidden">

          <!-- Estado de carga / sin datos -->
          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="mt-3 text-muted small">Cargando sanciones...</p>
          </div>

          <div v-else-if="sancionesFiltradas.length === 0" class="text-center py-5">
            <i class="bi bi-inbox text-secondary display-3"></i>
            <p class="mt-3 text-muted">No se encontraron sanciones.</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="thead-rojo">
                <tr>
                  <th class="ps-4">#</th>
                  <th>Árbitro</th>
                  <th>Motivo</th>
                  <th>Artículo</th>
                  <th>Sanción</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th class="text-center">Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sancionesFiltradas" :key="s.id">
                  <td class="ps-4 text-muted small">{{ s.id }}</td>
                  <td class="fw-bold">{{ s.apellido }}, {{ s.nombre }}</td>
                  <td class="text-muted small" style="max-width:220px;">{{ s.motivo }}</td>
                  <td><span class="badge bg-secondary rounded-pill">{{ s.articulo || '—' }}</span></td>
                  <td class="fw-bold text-danger">{{ s.sancion }}</td>
                  <td class="small">{{ formatFecha(s.desde) }}</td>
                  <td class="small">
                    <span v-if="s.es_indefinido == 1" class="badge bg-dark rounded-pill">Indefinida</span>
                    <span v-else>{{ formatFecha(s.hasta) }}</span>
                  </td>
                  <td class="text-center">
                    <span :class="['badge rounded-pill', s.activo == 1 ? 'bg-danger' : 'bg-success']">
                      {{ s.activo == 1 ? 'Vigente' : 'Cumplida' }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button
                      class="btn btn-sm btn-outline-danger rounded-pill"
                      title="Eliminar sanción"
                      @click="confirmarEliminar(s)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer con total -->
          <div v-if="!cargando && sancionesFiltradas.length > 0" class="px-4 py-2 bg-light border-top small text-muted">
            Mostrando <strong>{{ sancionesFiltradas.length }}</strong> de <strong>{{ sanciones.length }}</strong> registros
          </div>
        </div>

      </div>
    </div>

    <!-- Modal confirmación eliminar -->
    <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
      <div class="modal-box shadow-lg">
        <i class="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
        <h5 class="fw-bold mt-3">¿Eliminar sanción?</h5>
        <p class="text-muted small">
          Se eliminará la sanción de <strong>{{ sancionAEliminar?.apellido }} {{ sancionAEliminar?.nombre }}</strong>.
          Esta acción no se puede deshacer.
        </p>
        <div class="d-flex gap-2 justify-content-center mt-3">
          <button class="btn btn-outline-secondary rounded-pill px-4" @click="modalEliminar = false">Cancelar</button>
          <button class="btn btn-danger rounded-pill px-4" :disabled="eliminando" @click="eliminarSancion">
            {{ eliminando ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Listado de Sanciones | AAAB',
  meta: [
    { name: 'description', content: 'Gestión completa de sanciones del Tribunal de Ética.' },
    { property: 'og:title', content: 'Listado de Sanciones | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' },
  ],
});

const sanciones       = ref([]);
const cargando        = ref(false);
const filtro          = ref('');
const modalEliminar   = ref(false);
const sancionAEliminar = ref(null);
const eliminando      = ref(false);

/* ── Helpers ── */
const formatFecha = (fecha) => {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
};

const sancionesFiltradas = computed(() => {
  const q = filtro.value.toLowerCase().trim();
  if (!q) return sanciones.value;
  return sanciones.value.filter(s =>
    `${s.apellido} ${s.nombre} ${s.motivo} ${s.articulo}`.toLowerCase().includes(q)
  );
});

/* ── Cargar sanciones ── */
const cargarSanciones = async () => {
  cargando.value = true;
  try {
    const data = await api.get({ entity: 'sanciones', action: 'listar' });
    sanciones.value = Array.isArray(data) ? data : (data.payload ?? []);
  } catch (err) {
    console.error('Error cargando sanciones:', err);
  } finally {
    cargando.value = false;
  }
};

/* ── Eliminar ── */
const confirmarEliminar = (s) => {
  sancionAEliminar.value = s;
  modalEliminar.value = true;
};

const eliminarSancion = async () => {
  eliminando.value = true;
  try {
    await api.post({
      entity:  'sanciones',
      action:  'eliminar',
      payload: { id: sancionAEliminar.value.id },
    });
    sanciones.value = sanciones.value.filter(s => s.id !== sancionAEliminar.value.id);
    modalEliminar.value = false;
  } catch (err) {
    console.error('Error eliminando sanción:', err);
  } finally {
    eliminando.value = false;
  }
};

onMounted(cargarSanciones);
</script>

<style scoped>
.main-icon { font-size: 3rem; filter: drop-shadow(0 0 8px rgba(220,38,38,0.3)); }
.text-danger { color: #dc2626 !important; }

.buscador {
  max-width: 420px;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
  padding: 10px 18px;
  font-size: 0.9rem;
}
.buscador:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
  outline: none;
}

.menu-card-static {
  background: #ffffff;
  border-radius: 20px;
  border-bottom: 6px solid #dc2626;
}

.thead-rojo th {
  background-color: #1e293b;
  color: #f8fafc;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 14px 12px;
  border: none;
}

.table tbody td { font-size: 0.85rem; padding: 14px 12px; border-color: #f1f5f9; }
.table tbody tr:hover { background-color: #fff5f5; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1050;
}
.modal-box {
  background: #fff;
  border-radius: 20px;
  padding: 36px;
  max-width: 420px;
  width: 90%;
  text-align: center;
}
</style>