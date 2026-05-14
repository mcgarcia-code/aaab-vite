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
          <button @click="obtenerObservaciones" class="btn-clear bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center gap-2" title="Actualizar" style="background-color: #e2e8f0 !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
            <span class="material-icons" style="font-size: 22px; color: #000;">refresh</span>
            <!-- Usamos d-none d-md-inline en lugar de clases custom -->
            <span class="d-none d-md-inline fw-bold text-dark" style="font-size: 0.8rem;">Actualizar</span>
          </button>

          <RouterLink to="/panel-arbitro/observaciones/carga" class="text-decoration-none">
            <button class="rounded shadow-sm border-0 p-2 d-flex align-items-center justify-content-center gap-2 text-white" title="Nueva Evaluación" style="background-color: #3b82f6;">
              <span class="material-icons" style="font-size: 20px;">add</span>
              <!-- Usamos d-none d-md-inline en lugar de clases custom -->
              <span class="d-none d-md-inline fw-bold text-white" style="font-size: 0.8rem;">Nueva Evaluación</span>
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

        <!-- LISTA UNIFICADA (Reemplaza a la tabla y a las tarjetas mobile) -->
        <div class="border shadow-sm rounded overflow-hidden">

          <!-- Encabezado de Columnas (Solo visible en Escritorio) -->
          <div class="row g-0 d-none d-md-flex bg-light border-bottom p-2 fw-bold text-uppercase" style="font-size: 0.75rem; color: #0f172a;">
            <div class="col-md-2 ps-3">Fecha</div>
            <div class="col-md-3">Árbitro Evaluado</div>
            <div class="col-md-3">Categoría / Partido</div>
            <div class="col-md-2 text-center">Puntaje</div>
            <div class="col-md-2 text-center">Acciones</div>
          </div>

          <div v-if="observacionesPaginadas.length === 0" class="text-center p-5 bg-light">
            <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
            <p class="text-muted mt-2 mb-0 fw-bold">No has cargado observaciones recientemente.</p>
          </div>

          <!-- Filas de Datos Responsivas -->
          <div class="d-flex flex-column">
            <div v-for="obs in observacionesPaginadas" :key="obs.id" class="row g-0 align-items-center p-3 p-md-2 border-bottom bg-white item-observacion">

              <!-- INFO MOBILE: Header y Subtítulo (Se oculta en escritorio) -->
              <div class="col-12 d-md-none mb-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <div class="fw-bold text-uppercase text-dark" style="font-size: 1.05rem;">
                    <div>{{ obs.arb1_apellido }}, {{ obs.arb1_nombre }}</div>
                    <div v-if="obs.arb2_apellido || obs.arb2_nombre">
                      {{ obs.arb2_apellido }}, {{ obs.arb2_nombre }}
                    </div>
                  </div>
                  <span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1 fw-bold" style="font-size: 0.7rem;">
                    Pt: {{ obs.puntaje_final }}
                  </span>
                </div>
                <div class="text-muted fw-bold" style="font-size: 0.8rem;">
                  {{ obs.fecha_partido }} <span class="mx-1">•</span> {{ obs.categoria }} {{ obs.division }} - {{ obs.genero }}
                </div>
              </div>

              <!-- COL 1: FECHA (Escritorio) -->
              <div class="col-md-2 d-none d-md-block fw-bold text-muted ps-3" style="font-size: 0.85rem;">
                {{ obs.fecha_partido }}
              </div>

              <!-- COL 2: ÁRBITRO (Escritorio) -->
              <div class="col-md-3 d-none d-md-block fw-bold text-dark text-uppercase" style="font-size: 0.85rem;">
                <div>{{ obs.arb1_apellido }}, {{ obs.arb1_nombre }}</div>
                <div v-if="obs.arb2_apellido || obs.arb2_nombre">
                  {{ obs.arb2_apellido }}, {{ obs.arb2_nombre }}
                </div>
              </div>

              <!-- COL 3: CATEGORÍA (Escritorio) -->
              <div class="col-md-3 d-none d-md-block" style="font-size: 0.85rem;">
                {{ obs.categoria }} {{ obs.division }} - {{ obs.genero }}
              </div>

              <!-- COL 4: PUNTAJE (Escritorio) -->
              <div class="col-md-2 d-none d-md-block text-center fw-bold text-danger">
                {{ obs.puntaje_final }}
              </div>

              <!-- COL 5: ACCIONES (Ambos) -->
              <div class="col-12 col-md-2 text-center mt-2 mt-md-0">
                <!-- Botón ancho para celular -->
                <button class="btn btn-dark btn-sm w-100 rounded-pill fw-bold shadow-sm d-md-none">VER DETALLE COMPLETO</button>
                <!-- Botón chico para escritorio -->
                <button class="btn btn-sm btn-light border shadow-sm rounded-pill px-3 d-none d-md-inline-block">Ver Detalle</button>
              </div>

            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div class="d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPaginas > 1">
          <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
            <i class="bi bi-chevron-left"></i> Ant
          </button>
          <span class="fw-bold text-dark small">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>
          <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
            Sig <i class="bi bi-chevron-right"></i>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
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
  const r = await api.get({
    entity: 'observaciones',
    action: 'obtenerObservacionesRealizadas',
  })
  observaciones.value = r.payload
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
  background-color: #cbd5e1 !important;
}

.input-filtro-custom {
  font-size: 1rem !important;
  height: auto !important;
}

.input-filtro-custom:focus {
  outline: none;
}

/* ====================================================
   2. ESTILOS DE LA LISTA
   ==================================================== */
.item-observacion {
  transition: background-color 0.2s ease;
}

.item-observacion:hover {
  background-color: #f8fafc !important;
}

.animate__animated { animation-duration: 0.5s; }


</style>
