<template>
  <!-- Usamos px-3 px-md-4 para el padding responsivo que tenías en .full-screen-wrapper -->
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div>
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-people-fill me-1"></i> Datos Personales
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ totalFiltrados }} registros</span>
          </div>

          <!-- Botones de Acción -->
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón de filtros (Solo visible en celular) -->
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

        <!-- Panel de Filtros Único (Colapsable en celular, siempre visible en PC) -->
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

          <!-- ESTADO SIN RESULTADOS -->
          <div v-if="datosPaginados.length === 0" class="text-center p-5 bg-light m-3 rounded border">
            <span class="material-icons text-muted opacity-50" style="font-size: 40px;">search_off</span>
            <p class="text-muted mt-2 mb-0 fw-bold">No se encontraron registros.</p>
          </div>

          <!-- LISTA UNIFICADA -->
          <div v-else class="border-top border-md-0 shadow-none shadow-md-sm rounded-0 rounded-md overflow-hidden">

            <!-- Encabezado de Columnas (Solo Escritorio) -->
            <div class="row g-0 d-none d-md-flex bg-light border-bottom p-2 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">
              <div class="col-md-1 ps-2 ">ID</div>
              <div class="col-md-2">Apellido y Nombre</div>
              <div class="col-md-1 text-center">Activo</div>
              <div class="col-md-1 text-center">Grupo</div>
              <div class="col-md-2 text-center">F. Nac</div>
              <div class="col-md-2 text-center">Celular</div>
              <div class="col-md-1 text-center">DNI</div>
              <div class="col-md-2">Email</div>
            </div>

            <!-- Filas de Datos -->
            <div class="d-flex flex-column">
              <div v-for="a in datosPaginados" :key="a.id" class="row g-0 align-items-center p-3 p-md-2 border-bottom item-row" :class="{ 'bg-danger-subtle': a.es_activo == 0, 'bg-white': a.es_activo != 0 }">

                <!-- HEADER MOBILE: Nombre, ID y Estado (Se oculta en escritorio) -->
                <div class="col-12 d-md-none d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom" :class="{'border-danger': a.es_activo == 0}">
                  <div class="d-flex align-items-center gap-2">
                    <span class="status-dot" :class="a.es_activo == 1 ? 'bg-success' : 'bg-danger'" style="width: 10px; height: 10px; border-radius: 50%;"></span>
                    <strong class="text-dark fs-6">{{ a.apellido }}, {{ a.nombre }}</strong>
                  </div>
                  <span class="text-muted small">ID: {{ a.id }}</span>
                </div>

                <!-- INFO MOBILE: Resto de datos (Se oculta en escritorio) -->
                <div class="col-12 d-md-none small text-dark d-flex flex-column gap-1">
                  <div class="d-flex justify-content-between">
                    <span><strong>DNI:</strong> {{ a.dni || '-' }}</span>
                    <span><strong>Grupo:</strong> {{ a.grupo || '-' }}<template v-if="a.subgrupo">/{{ a.subgrupo }}</template></span>
                  </div>
                  <div v-if="a.fecha_nacimiento"><strong>F. Nacimiento:</strong> {{ mostrarFechaArg(a.fecha_nacimiento) }}</div>
                  <div v-if="a.celular"><strong>Celular:</strong> {{ a.celular }}</div>
                  <div v-if="a.email"><strong>Email:</strong> {{ a.email }}</div>
                </div>

                <!-- COL 1: ID (Escritorio) -->
                <div class="col-md-1 d-none d-md-block ps-2 small fw-bold" :class="a.es_activo == 0 ? 'text-danger' : 'text-muted'">
                  {{ a.id }}
                </div>

                <!-- COL 2: NOMBRE (Escritorio) -->
                <div class="col-md-2 d-none d-md-block text-dark small fw-bold text-truncate pe-2">
                  {{ a.apellido }}, {{ a.nombre }}
                </div>

                <!-- COL 3: ESTADO (Escritorio) -->
                <div class="col-md-1 d-none d-md-flex justify-content-center">
                  <div class="d-flex align-items-center gap-1">
                    <span class="status-dot" :class="a.es_activo == 1 ? 'bg-success' : 'bg-danger'" style="width: 8px; height: 8px; border-radius: 50%;"></span>
                    <span class="small" :class="a.es_activo == 0 ? 'text-danger fw-bold' : 'text-dark'">{{ a.es_activo == 1 ? 'SI' : 'NO' }}</span>
                  </div>
                </div>

                <!-- COL 4: GRUPO (Escritorio) -->
                <div class="col-md-1 d-none d-md-block text-center small text-dark">
                  {{ a.grupo }}<span v-if="a.subgrupo" class="text-muted">/{{ a.subgrupo }}</span>
                </div>

                <!-- COL 5: F NACIMIENTO (Escritorio) -->
                <div class="col-md-2 d-none d-md-block text-center small text-dark">
                  {{ mostrarFechaArg(a.fecha_nacimiento) }}
                </div>

                <!-- COL 6: CELULAR (Escritorio) -->
                <div class="col-md-2 d-none d-md-block text-center small text-dark">
                  {{ a.celular || '-' }}
                </div>

                <!-- COL 7: DNI (Escritorio) -->
                <div class="col-md-1 d-none d-md-block text-center small fw-bold text-dark">
                  {{ a.dni }}
                </div>

                <!-- COL 8: EMAIL (Escritorio) -->
                <div class="col-md-2 d-none d-md-block small text-dark text-truncate pe-2">
                  {{ a.email || '-' }}
                </div>

              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3 mb-md-0" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
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
   ESTILOS BASE (DISEÑO PARA CELULARES - MOBILE FIRST)
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  padding-bottom: 120px;
}

.admin-panel {
  width: 100%;
  background-color: #0f172a;
  min-height: calc(100vh - 40px);
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
}

/* Efecto hover general de las filas */
.item-row {
  transition: background-color 0.2s ease;
}

/* Si la fila es blanca, se pone gris claro. Si es roja claro (inactivo), se oscurece un poco. */
.item-row.bg-white:hover {
  background-color: #f8fafc !important;
}
.item-row.bg-danger-subtle:hover {
  background-color: #fca5a5 !important;
}

.animate__animated { animation-duration: 0.5s; }

</style>
