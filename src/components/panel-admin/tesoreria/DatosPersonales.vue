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
            <!-- Botón Recargar -->
            <button @click="cargarDatos" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

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

          <!-- SPINNER DE CARGA -->
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando registros...</p>
          </div>

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
              <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted col-fija col-id">ID</th>
                    <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
                    <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
                    <th class="py-3 text-center text-uppercase text-muted">Activo</th>
                    <th class="py-3 text-center text-uppercase text-muted">Grupo</th>
                    <th class="py-3 text-center text-uppercase text-muted">Subg.</th>
                    <th class="py-3 text-center text-uppercase text-muted">F. Nacimiento</th>
                    <th class="py-3 text-center text-uppercase text-muted">DNI</th>
                    <th class="py-3 text-center text-uppercase text-muted">Celular</th>
                    <th class="py-3 text-uppercase text-muted">Email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="a in datosPaginados" :key="a.id" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">
                    <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ a.id }}</td>
                    <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
                    <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
                    <td class="text-center">
                      <div class="d-flex align-items-center justify-content-center gap-1">
                        <span class="status-dot" :class="a.es_activo == 1 ? 'bg-success' : 'bg-danger'"></span>
                        <span class="small text-dark fw-bold">{{ a.es_activo == 1 ? 'SI' : 'NO' }}</span>
                      </div>
                    </td>
                    <td class="text-center text-dark">{{ a.grupo }}</td>
                    <td class="text-center text-dark">{{ a.subgrupo }}</td>
                    <td class="text-center text-dark">{{ mostrarFechaArg(a.fecha_nacimiento) || '-' }}</td>
                    <td class="text-center text-dark">{{ a.dni || '-' }}</td>
                    <td class="text-center text-dark">{{ a.celular || '-' }}</td>
                    <td class="text-dark">{{ a.email || '-' }}</td>
                  </tr>
                  <tr v-if="datosPaginados.length === 0">
                    <td colspan="10" class="py-5 text-center text-muted border-0 bg-white">
                      <span class="material-icons d-block fs-1 mb-2">search_off</span>
                      <p class="m-0 fw-bold">No se encontraron registros.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS (Solo Celular) -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="a in datosPaginados" :key="'mob-'+a.id" class="card shadow-sm mb-3 border-light-subtle rounded-3" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">

                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase d-flex align-items-center gap-2" style="font-size: 1.05rem;">
                    <span class="status-dot" :class="a.es_activo == 1 ? 'bg-success' : 'bg-danger'"></span>
                    {{ a.apellido }}, {{ a.nombre }}
                  </div>
                  <div class="small text-muted fw-bold font-monospace">#{{ a.id }}</div>
                </div>

                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex justify-content-between text-dark mb-2 border-bottom border-secondary-subtle pb-2">
                    <span class="small"><strong>Grupo:</strong> {{ a.grupo || '-' }}<template v-if="a.subgrupo">/{{ a.subgrupo }}</template></span>
                    <span class="small"><strong>DNI:</strong> {{ a.dni || '-' }}</span>
                  </div>

                  <div class="bg-light p-2 rounded border small border-light-subtle" :class="{'bg-transparent border-0': a.es_activo == 0}">
                    <p v-if="a.fecha_nacimiento" class="m-0 text-dark"><strong>F. Nac:</strong> {{ mostrarFechaArg(a.fecha_nacimiento) }}</p>
                    <p v-if="a.celular" class="m-0 text-dark mt-1"><strong>Celular:</strong> {{ a.celular }}</p>
                    <p v-if="a.email" class="m-0 text-dark mt-1 text-truncate"><strong>Email:</strong> {{ a.email }}</p>
                  </div>
                </div>
              </div>

              <div v-if="datosPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
                <p class="text-muted m-0 fw-bold">No se encontraron registros.</p>
              </div>
            </div>

            <!-- PAGINACIÓN -->
            <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3 mb-md-0" v-if="totalPaginas > 1">
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border border-light-subtle" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
                <i class="bi bi-chevron-left"></i> Ant
              </button>
              <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border border-light-subtle" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
                Sig <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { api } from '@/api/api'
import ExcelJS from 'exceljs'
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
const cargando = ref(false);
const mostrarFiltrosMobile = ref(false);
const filtros = reactive({
  apellido: '', nombre: '', es_activo: '', grupo: '', subgrupo: '', fecha_nacimiento: '', celular: '', dni: '', email: ''
});
const paginaActual = ref(1);
const registrosPorPagina = 10;

const cargarDatos = async () => {
  cargando.value = true;
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
  } finally {
    cargando.value = false;
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

const exportarExcel = async () => {
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

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Datos');

  const claves = Object.keys(datosExcel[0] || {});
  ws.columns = claves.map(clave => ({ header: clave, key: clave, width: 18 }));
  datosExcel.forEach(fila => ws.addRow(fila));
  if (claves.length) ws.getRow(1).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Reporte_Consulta.xlsx';
  link.click();
  URL.revokeObjectURL(url);
};

watch(filtros, () => { paginaActual.value = 1; }, { deep: true });
onMounted(cargarDatos);
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
   PUNTOS DE ESTADO (Activo/Inactivo)
   ==================================================== */
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

/* ====================================================
   UTILIDADES
   ==================================================== */
.btn-danger-subtle {
  background: #fee2e2;
  color: #dc3545;
  border: 1px solid transparent;
}
.btn-danger-subtle:hover {
  background: #fecaca;
}

.animate__animated {
  animation-duration: 0.5s;
}

/* ====================================================
   TABLA CON COLUMNAS FIJAS
   ==================================================== */
.tabla-container {
  overflow-x: auto;
}

.tabla-fija {
  border-collapse: separate;
  border-spacing: 0;
}

/* Eliminar bordes verticales de las celdas */
.tabla-fija th,
.tabla-fija td {
  border-left: none !important;
  border-right: none !important;
}

/* Columnas fijas con position: sticky base (para los datos) */
.col-fija {
  position: sticky;
  background-color: inherit;
  z-index: 10;
}

/* Fondo para thead y Z-INDEX ALTO para que tape los datos al scrollear hacia abajo */
.tabla-fija thead .col-fija {
  background-color: #f8f9fa;
  z-index: 12;
}

/* Fondo para tbody */
.tabla-fija tbody .col-fija {
  background-color: #ffffff;
}

/* Fondo especial para filas con bg-danger-subtle */
.tabla-fija tbody tr.bg-danger-subtle .col-fija {
  background-color: #f8d7da;
}

/* Posiciones de las columnas fijas */
.col-id {
  left: 0;
  min-width: 60px;
}

.col-apellido {
  left: 60px;
  min-width: 150px;
}

.col-nombre {
  left: 210px;
  min-width: 150px;
}

/* Sombra sutil en el borde derecho de la última columna fija */
.col-nombre::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);
}
</style>
