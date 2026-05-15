<template>
  <div class="dark-background-section py-5 animate__animated animate__fadeIn">
    <div class="container my-5">

      <div class="text-center mb-5">
        <i class="bi bi-shield-exclamation display-3 text-danger mb-3 d-inline-block"></i>
        <h1 class="fw-bold text-white display-5">Listado Oficial de Sanciones</h1>
        <p class="lead text-white-50">Historial completo de sanciones disciplinarias vigentes.</p>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-10">

          <div class="mb-4">
            <input
              v-model="filtro"
              class="form-control form-control-lg buscador-publico shadow-lg"
              placeholder="🔍 Buscar por árbitro o motivo..."
            >
          </div>

          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-danger"></div>
            <p class="text-white mt-3 fw-bold">Cargando sanciones...</p>
          </div>

          <div v-else-if="sancionesFiltradas.length === 0" class="text-center py-5 bg-dark bg-opacity-25 rounded-4 border border-secondary border-opacity-25 shadow-sm">
            <i class="bi bi-shield-check display-1 text-success opacity-75"></i>
            <p class="text-white mt-3 fw-bold fs-5">No hay sanciones registradas.</p>
          </div>

          <div v-else>

            <div class="table-responsive shadow-lg rounded-4 bg-white d-none d-md-block border-0 overflow-hidden">
              <table class="table table-hover align-middle mb-0 text-nowrap">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-4 text-uppercase text-muted small fw-bold border-bottom-0">Árbitro</th>
                    <th class="py-3 text-uppercase text-muted small fw-bold border-bottom-0">Motivo</th>
                    <th class="py-3 text-center text-uppercase text-muted small fw-bold border-bottom-0">Artículo</th>
                    <th class="py-3 text-uppercase text-muted small fw-bold border-bottom-0">Sanción</th>
                    <th class="py-3 text-center text-uppercase text-muted small fw-bold border-bottom-0">Desde</th>
                    <th class="py-3 text-center text-uppercase text-muted small fw-bold border-bottom-0">Hasta</th>
                    <th class="py-3 pe-4 text-center text-uppercase text-muted small fw-bold border-bottom-0">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in sancionesPaginadas" :key="s.id">
                    <td class="ps-4 fw-bold text-dark text-uppercase">{{ s.arbitro || s.apellido + ', ' + s.nombre }}</td>
                    <td class="text-muted small text-wrap lh-sm" style="max-width: 250px;">{{ s.motivo }}</td>
                    <td class="text-center fw-bold text-dark">Art. {{ s.articulo || '—' }}</td>
                    <td class="fw-bold" :class="s.estado_dinamico == 3 ? 'text-muted' : 'text-danger'">
                      {{ s.sancion || 'Sin sanción' }}
                    </td>
                    <td class="text-center small text-dark">{{ s.desde_formateada || '-' }}</td>
                    <td class="text-center small">
                      <span v-if="s.es_indefinido == 1" class="badge bg-dark rounded-pill">Indefinida</span>
                      <span v-else class="text-dark">{{ s.hasta_formateada || '-' }}</span>
                    </td>
                    <td class="pe-4 text-center">
                      <span v-if="s.estado_dinamico == 1" class="badge bg-danger rounded-pill px-3 py-2 shadow-sm">Vigente</span>
                      <span v-else-if="s.estado_dinamico == 3" class="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm">En proceso</span>
                      <span v-else class="badge bg-secondary rounded-pill px-3 py-2 shadow-sm">Cumplida</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-md-none d-flex flex-column gap-3">
              <div
                v-for="s in sancionesPaginadas"
                :key="'mob-'+s.id"
                class="card border-0 bg-white shadow-sm rounded-4 border-start border-4 overflow-hidden"
                :class="s.estado_dinamico == 1 ? 'border-danger' : (s.estado_dinamico == 3 ? 'border-warning' : 'border-secondary')"
              >
                <div class="card-body p-3">
                  <div class="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom border-light-subtle">
                    <div>
                      <strong class="d-block text-dark text-uppercase fs-6">{{ s.arbitro || s.apellido + ', ' + s.nombre }}</strong>
                      <span class="text-muted small fw-bold" v-if="s.articulo">Art. {{ s.articulo }}</span>
                    </div>
                    <div>
                      <span v-if="s.estado_dinamico == 1" class="badge bg-danger shadow-sm">Vigente</span>
                      <span v-else-if="s.estado_dinamico == 3" class="badge bg-warning text-dark shadow-sm">En proceso</span>
                      <span v-else class="badge bg-secondary shadow-sm">Cumplida</span>
                    </div>
                  </div>

                  <p class="mb-3 text-muted small lh-sm"><strong>Motivo:</strong> {{ s.motivo }}</p>

                  <div class="bg-light rounded-3 p-2 mb-3 border border-light-subtle">
                    <p class="mb-0 small">
                      <strong>Sanción: </strong>
                      <span :class="s.estado_dinamico == 3 ? 'text-muted fw-bold' : 'text-danger fw-bold'">{{ s.sancion || 'Sin sanción' }}</span>
                    </p>
                  </div>

                  <div class="d-flex justify-content-between pt-2 border-top border-light-subtle">
                    <div class="small">
                      <span class="text-muted">Desde: </span> <strong class="text-dark">{{ s.desde_formateada || '-' }}</strong>
                    </div>
                    <div class="small text-end">
                      <span class="text-muted">Hasta: </span>
                      <strong v-if="s.es_indefinido == 1" class="text-danger">Indefinida</strong>
                      <strong v-else class="text-dark">{{ s.hasta_formateada || '-' }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-center align-items-center gap-3 mt-5" v-if="totalPaginas > 1">
              <button class="btn btn-light rounded-pill px-4 fw-bold shadow-sm" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
                <i class="bi bi-chevron-left"></i> Ant
              </button>
              <span class="fw-bold text-white small px-3 py-1 bg-dark bg-opacity-50 rounded-pill">
                Página {{ paginaActual }} de {{ totalPaginas }}
              </span>
              <button class="btn btn-light rounded-pill px-4 fw-bold shadow-sm" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
                Sig <i class="bi bi-chevron-right"></i>
              </button>
            </div>

          </div>

          <div class="alert bg-dark bg-opacity-50 border border-secondary border-opacity-25 text-white-50 small text-center mt-5 rounded-4 shadow-sm">
            <i class="bi bi-info-circle-fill text-white opacity-75 me-2"></i>
            Las resoluciones son de cumplimiento obligatorio según el reglamento vigente de la AAAB.
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { api } from '@/api/api'


const sanciones = ref([])
const cargando = ref(false)
const filtro = ref('')

// Configuración de Paginación Dinámica
const paginaActual = ref(1)
const registrosPorPagina = ref(10)

const fetchSanciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'sanciones',
      action: 'obtenerSanciones'
    })
    sanciones.value = res.payload ?? []
  } catch (err) {
    console.error(err)
  } finally {
    cargando.value = false;
  }
}

// Función para ajustar registros según tamaño de pantalla
const chequearResolucion = () => {
  const esMobile = window.innerWidth <= 768;
  const nuevaCantidad = esMobile ? 10 : 10;

  // Solo reseteamos la página si la cantidad realmente cambió para evitar parpadeos
  if (registrosPorPagina.value !== nuevaCantidad) {
    registrosPorPagina.value = nuevaCantidad;
    paginaActual.value = 1;
  }
}

const sancionesFiltradas = computed(() => {
    let res = sanciones.value;

    // 1. Filtrado por texto
    if (filtro.value) {
        const textoBusqueda = filtro.value.toLowerCase();
        res = res.filter(s =>
          (s.arbitro || '').toLowerCase().includes(textoBusqueda) ||
          (s.motivo || '').toLowerCase().includes(textoBusqueda)
        );
    }

    // 2. Ordenamiento: Vigentes (1) y En Proceso (3) arriba. Cumplidas (2) abajo.
    return res.sort((a, b) => {
        const pesoA = (a.estado_dinamico == 1 || a.estado_dinamico == 3) ? 0 : 1;
        const pesoB = (b.estado_dinamico == 1 || b.estado_dinamico == 3) ? 0 : 1;
        return pesoA - pesoB;
    });
});

// Paginación Calculada (Usando .value en registrosPorPagina)
const totalPaginas = computed(() => Math.ceil(sancionesFiltradas.value.length / registrosPorPagina.value) || 1);

const sancionesPaginadas = computed(() => {
    const inicio = (paginaActual.value - 1) * registrosPorPagina.value;
    return sancionesFiltradas.value.slice(inicio, inicio + registrosPorPagina.value);
});

// Cambio de página con scroll hacia arriba en móviles
const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
}

// Reiniciar a la página 1 si el usuario escribe en el buscador
watch(filtro, () => {
    paginaActual.value = 1;
});

onMounted(() => {
  fetchSanciones();
  chequearResolucion();
  window.addEventListener('resize', chequearResolucion);
});

onUnmounted(() => {
  window.removeEventListener('resize', chequearResolucion);
});
</script>

<style scoped>
/* ====================================================
   FONDO GENERAL Y SECCIÓN
   ==================================================== */
.dark-background-section {
  /* Fondo institucional oscuro azulado */
  background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('../../assets/fotos/sanciones-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* ====================================================
   BUSCADOR PERSONALIZADO TIPO CRISTAL (GLASSMORPHISM)
   ==================================================== */
.buscador-publico {
  border-radius: 50px;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.buscador-publico::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.buscador-publico:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ef4444; /* Borde rojo al enfocar */
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.25);
  color: #ffffff;
  outline: none;
}

/* Animación de entrada general */
.animate__animated {
  animation-duration: 0.8s;
}

/* Cero media queries. Todo el layout funciona con las utilidades de Bootstrap */
</style>
