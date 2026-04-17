<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 mb-4 w-100 mx-auto" style="border-radius: 12px; overflow: hidden;">

      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-journal-check me-1"></i> Mis Observaciones Realizadas
          </h4>
          <p class="text-muted small m-0 mt-1">Historial de evaluaciones de desempeño arbitral</p>
        </div>

        <div class="d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
          <button @click="obtenerObservaciones" class="btn-clear bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center gap-2" title="Actualizar" style="background-color: #f8fafc !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
            <span class="material-icons" style="font-size: 22px; color: #64748b;">refresh</span>
            <span class="desktop-only fw-bold text-secondary" style="font-size: 0.8rem;">Actualizar</span>
          </button>

          <RouterLink to="/panel-arbitro/observaciones/carga" class="text-decoration-none">
            <button class="rounded shadow-sm border-0 p-2 d-flex align-items-center justify-content-center gap-2 text-white" title="Nueva Evaluación" style="background-color: #3b82f6;">
              <span class="material-icons" style="font-size: 20px;">add</span>
              <span class="desktop-only fw-bold text-white" style="font-size: 0.8rem;">Nueva Evaluación</span>
            </button>
          </RouterLink>
        </div>
      </div>

      <div class="card-body bg-white p-3 p-md-4">

        <div class="mb-4">
          <div class="input-group shadow-sm rounded-pill overflow-hidden border border-secondary-subtle">
            <span class="input-group-text bg-light border-0 text-muted ps-4"><i class="bi bi-search"></i></span>
            <input
              v-model="busqueda"
              type="text"
              class="form-control border-0 py-2 py-md-3 bg-light shadow-none input-filtro-custom"
              placeholder="Buscar por árbitro o categoría..."
            >
          </div>
        </div>

        <div class="table-container shadow-sm desktop-only border" style="border-radius: 8px;">
          <table>
            <thead>
              <tr class="main-header">
                <th class="ps-4">Fecha</th>
                <th>Árbitro Evaluado</th>
                <th>Categoría / Partido</th>
                <th class="text-center">Puntaje</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="obs in observacionesPaginadas" :key="obs.id" class="row-hover">
                <td class="ps-4 cell-ro text-muted fw-bold">{{ obs.fecha }}</td>
                <td class="cell-ro fw-bold text-dark">{{ obs.arbitro_nombre }}</td>
                <td class="cell-ro">{{ obs.categoria }}</td>
                <td class="text-center cell-ro fw-bold text-danger">{{ obs.puntaje }}</td>
                <td class="text-center cell-ro">
                  <button class="btn btn-sm btn-light border shadow-sm rounded-pill px-3">Ver Detalle</button>
                </td>
              </tr>
              <tr v-if="observacionesPaginadas.length === 0">
                <td colspan="5" class="text-center py-5 text-muted bg-light fst-italic">
                  No has cargado observaciones recientemente.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-only">
          <div v-for="obs in observacionesPaginadas" :key="'mob-'+obs.id" class="card-licencia shadow-sm border">
            <div class="card-header border-bottom-0 pb-0 bg-transparent px-0 pt-1">
              <div class="card-name text-uppercase">
                <strong>{{ obs.arbitro_nombre }}</strong>
              </div>
            </div>

            <div class="card-body pt-2 px-0 pb-1">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="text-xs text-muted fw-bold">
                  {{ obs.fecha }} <span class="mx-1">•</span> {{ obs.categoria }}
                </div>
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1 fw-bold" style="font-size: 0.7rem;">
                  Puntaje: {{ obs.puntaje }}
                </span>
              </div>
              <button class="btn btn-dark btn-sm w-100 rounded-pill mt-2 fw-bold shadow-sm">VER DETALLE COMPLETO</button>
            </div>
          </div>

          <div v-if="observacionesPaginadas.length === 0" class="text-center p-4 bg-light rounded border mt-2">
            <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
            <p class="text-muted mt-2 mb-0 fw-bold">Sin observaciones cargadas.</p>
          </div>
        </div>

        <div class="d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPaginas > 1">
          <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
            <i class="bi bi-chevron-left"></i> Ant
          </button>
          <span class="fw-bold text-dark small">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>
          <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
            Sig <i class="bi bi-chevron-right"></i>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Mis Observaciones Realizadas | AAAB',
  meta: [
    { name: 'description', content: 'Verifica y gestiona las evaluaciones de desempeño arbitral que has realizado.' },
    { property: 'og:title', content: 'Mis Observaciones Realizadas | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const busqueda = ref('');
const observaciones = ref([]);
const paginaActual = ref(1);
const registrosPorPagina = 10;

const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

const observacionesFiltradas = computed(() => {
  return observaciones.value.filter(o => {
    const texto = `${o.arbitro_nombre} ${o.categoria}`.toLowerCase();
    return normalizar(texto).includes(normalizar(busqueda.value));
  });
});

const totalPaginas = computed(() => Math.ceil(observacionesFiltradas.value.length / registrosPorPagina) || 1);
const observacionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return observacionesFiltradas.value.slice(inicio, inicio + registrosPorPagina);
});

watch(busqueda, () => { paginaActual.value = 1 });

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  if (window.innerWidth <= 768) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const obtenerObservaciones = async () => {
  // Aquí iría tu lógica de API para cargar las observaciones reales
  // Por ahora se mantiene el array vacío o con la lógica de carga necesaria
};

onMounted(obtenerObservaciones);
</script>

<style scoped>
/* ====================================================
   1. BOTONES E INPUTS
   ==================================================== */
.btn-clear {
  border: none;
  cursor: pointer;
}

.btn-clear:hover {
  background-color: #e2e8f0 !important;
}

.input-filtro-custom {
  font-size: 1rem !important;
  height: auto !important;
}

.input-filtro-custom:focus {
  outline: none;
}

/* ====================================================
   2. TABLA Y CELDAS DESKTOP
   ==================================================== */
.table-container {
  width: 100%;
  overflow: auto;
  max-height: 85vh;
  background: white;
}

table {
  width: 100%;
  min-width: max-content;
  border-collapse: separate !important;
  border-spacing: 0;
  font-size: 0.85rem;
}

thead tr.main-header th {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #f8fafc !important;
  padding: 12px 10px;
  border-bottom: 2px solid #e2e8f0;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  font-size: 0.75rem;
  color: #000;
  text-transform: uppercase;
  font-weight: 800;
  margin: 0;
  text-align: left;
}

.cell-ro {
  padding: 14px 10px;
  font-size: 0.85rem;
  color: #000;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.row-hover:hover {
  background-color: #f1f5f9;
  transition: background 0.2s ease;
}

/* ====================================================
   3. VISIBILIDAD RESPONSIVE
   ==================================================== */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }

  .card-licencia {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .card-name {
    font-size: 1.05rem;
    color: #0f172a;
  }
}

.animate__animated { animation-duration: 0.5s; }
</style>
