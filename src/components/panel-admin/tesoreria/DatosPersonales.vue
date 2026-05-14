<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-people-fill me-1"></i> Datos Personales
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ totalFiltrados }} registros</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Registros</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-6 col-md-2">
              <input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Nombre...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.dni" class="form-control form-control-sm shadow-none" placeholder="DNI...">
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.es_activo" class="form-select form-select-sm shadow-none">
                <option value="">Estado (Todos)</option>
                <option value="si">Activo</option>
                <option value="no">Inactivo</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.grupo" class="form-control form-control-sm shadow-none" placeholder="Grupo...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.celular" class="form-control form-control-sm shadow-none" placeholder="Celular...">
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <div v-if="datosPaginados.length === 0" class="text-center p-4 p-md-5 bg-light m-3 rounded shadow-sm border border-light-subtle">
            <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 48px;">search_off</span>
            <p class="text-muted m-0 fw-bold">No se encontraron registros.</p>
          </div>

          <div v-else class="border shadow-sm rounded-3 overflow-hidden border-light-subtle bg-white">
            <div class="row g-0 d-none d-md-flex bg-light border-bottom border-light-subtle p-2 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">
              <div class="col-md-1 ps-2">ID</div>
              <div class="col-md-2">Apellido y Nombre</div>
              <div class="col-md-1 text-center">Activo</div>
              <div class="col-md-1 text-center">Grupo</div>
              <div class="col-md-2 text-center">F. Nac</div>
              <div class="col-md-2 text-center">Celular</div>
              <div class="col-md-1 text-center">DNI</div>
              <div class="col-md-2 pe-2 text-end">Email</div>
            </div>

            <div class="d-flex flex-column">
              <div v-for="a in datosPaginados" :key="a.id" class="row g-0 align-items-center p-3 p-md-2 border-bottom border-light-subtle item-row" :class="{ 'bg-danger-subtle': a.es_activo == 0, 'bg-white': a.es_activo != 0 }">

                <div class="col-12 d-md-none d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom" :class="a.es_activo == 0 ? 'border-danger' : 'border-secondary-subtle'">
                  <div class="d-flex align-items-center gap-2">
                    <span class="status-dot" :class="a.es_activo == 1 ? 'bg-success' : 'bg-danger'" style="width: 10px; height: 10px; border-radius: 50%;"></span>
                    <strong class="text-dark fs-6 text-uppercase">{{ a.apellido }}, {{ a.nombre }}</strong>
                  </div>
                  <span class="text-muted small fw-bold font-monospace">#{{ a.id }}</span>
                </div>

                <div class="col-12 d-md-none small text-dark d-flex flex-column gap-2 bg-light p-2 rounded border border-light-subtle" :class="{'bg-transparent border-0': a.es_activo == 0}">
                  <div class="d-flex justify-content-between border-bottom pb-1" :class="{'border-danger-subtle': a.es_activo == 0, 'border-secondary-subtle': a.es_activo != 0}">
                    <span><strong>DNI:</strong> <span class="font-monospace">{{ a.dni || '-' }}</span></span>
                    <span><strong>Grupo:</strong> {{ a.grupo || '-' }}<template v-if="a.subgrupo">/{{ a.subgrupo }}</template></span>
                  </div>
                  <div v-if="a.fecha_nacimiento"><strong>F. Nac:</strong> {{ mostrarFechaArg(a.fecha_nacimiento) }}</div>
                  <div v-if="a.celular"><strong>Celular:</strong> {{ a.celular }}</div>
                  <div class="text-truncate" v-if="a.email"><strong>Email:</strong> {{ a.email }}</div>
                </div>

                <div class="col-md-1 d-none d-md-block ps-2 small font-monospace fw-bold" :class="a.es_activo == 0 ? 'text-danger' : 'text-muted'">
                  {{ a.id }}
                </div>

                <div class="col-md-2 d-none d-md-block text-dark small fw-bold text-uppercase text-truncate pe-2" :title="a.apellido + ', ' + a.nombre">
                  {{ a.apellido }}, {{ a.nombre }}
                </div>

                <div class="col-md-1 d-none d-md-flex justify-content-center">
                  <div class="d-flex align-items-center gap-1">
                    <span class="status-dot" :class="a.es_activo == 1 ? 'bg-success' : 'bg-danger'" style="width: 8px; height: 8px; border-radius: 50%;"></span>
                    <span class="small fw-bold" :class="a.es_activo == 0 ? 'text-danger' : 'text-dark'">{{ a.es_activo == 1 ? 'SI' : 'NO' }}</span>
                  </div>
                </div>

                <div class="col-md-1 d-none d-md-block text-center small fw-bold text-dark">
                  {{ a.grupo }}<span v-if="a.subgrupo" class="text-muted fw-normal">/{{ a.subgrupo }}</span>
                </div>

                <div class="col-md-2 d-none d-md-block text-center small text-dark">
                  {{ mostrarFechaArg(a.fecha_nacimiento) || '-' }}
                </div>

                <div class="col-md-2 d-none d-md-block text-center small text-dark">
                  {{ a.celular || '-' }}
                </div>

                <div class="col-md-1 d-none d-md-block text-center small fw-bold text-dark font-monospace">
                  {{ a.dni || '-' }}
                </div>

                <div class="col-md-2 d-none d-md-block small text-dark text-truncate pe-2 text-end" :title="a.email">
                  {{ a.email || '-' }}
                </div>

              </div>
            </div>
          </div>

          <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3 mb-md-0" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border border-light-subtle" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border border-light-subtle" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Datos Personales | AAAB',
  meta: [
    { name: 'description', content: 'Consulta de datos personales de árbitros.' },
    { property: 'og:title', content: 'Datos Personales | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const listaCompleta = ref([]);
const mostrarFiltrosMobile = ref(false);
const filtros = reactive({
  apellido: '', nombre: '', es_activo: '', grupo: '', subgrupo: '', fecha_nacimiento: '', celular: '', dni: '', email: ''
});
const paginaActual = ref(1);
const registrosPorPagina = 10;

const cargarDatos = async () => {
  try {
    const { payload } = await api.get({ entity: 'arbitros', action: 'getArbitros' });
    if (payload) {
      listaCompleta.value = payload.sort((a, b) => {
        const nombreA = `${a.apellido || ''} ${a.nombre || ''}`.trim().toLowerCase();
        const nombreB = `${b.apellido || ''} ${b.nombre || ''}`.trim().toLowerCase();
        return nombreA.localeCompare(nombreB, 'es');
      });
    }
  } catch (err) {
    console.error("Error cargando datos:", err);
  }
};

const normalizarTexto = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const mostrarFechaArg = (fecha) => {
  if (!fecha) return '';
  const partes = fecha.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

const datosFiltrados = computed(() => {
  return listaCompleta.value.filter(a => {
    return Object.keys(filtros).every(key => {
      if (!filtros[key]) return true;
      const busqueda = filtros[key].toLowerCase();
      if (key === 'es_activo') return (busqueda === 'si' ? a.es_activo == 1 : a.es_activo == 0);
      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]));
    });
  });
});

const totalFiltrados = computed(() => datosFiltrados.value.length);
const totalPaginas = computed(() => Math.ceil(totalFiltrados.value / registrosPorPagina) || 1);
const datosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return datosFiltrados.value.slice(inicio, inicio + registrosPorPagina);
});

// NUEVA FUNCIÓN: Cambiar página y scrollear arriba SOLO EN MOBILE
const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

const limpiarFiltros = () => Object.keys(filtros).forEach(key => filtros[key] = '');

const exportarExcel = () => {
  const datosExcel = datosFiltrados.value.map(a => ({
    'ID': a.id,
    'APELLIDO': a.apellido,
    'NOMBRE': a.nombre,
    'ACTIVO': a.es_activo == 1 ? 'SI' : 'NO',
    'GRUPO': a.grupo,
    'SUB GRUPO': a.subgrupo,
    'FECHA NACIMIENTO': mostrarFechaArg(a.fecha_nacimiento),
    'CELULAR': a.celular,
    'DNI': a.dni,
    'EMAIL': a.email
  }));
  const ws = XLSX.utils.json_to_sheet(datosExcel);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, "Reporte_Consulta.xlsx");
};

watch(filtros, () => { paginaActual.value = 1; }, { deep: true });
onMounted(cargarDatos);
</script>

<style scoped>
/* ====================================================
   ESTILOS BASE
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
   EFECTOS HOVER DE FILAS
   ==================================================== */
.item-row {
  transition: background-color 0.2s ease;
}

.item-row.bg-white:hover {
  background-color: #f8fafc !important; /* Gris muy clarito para activos */
}

.item-row.bg-danger-subtle:hover {
  background-color: #fca5a5 !important; /* Rojo un poco más oscuro para inactivos */
}

/* Utilidades generales */
.status-dot {
  display: inline-block;
  flex-shrink: 0;
}

.animate__animated { animation-duration: 0.5s; }

</style>
