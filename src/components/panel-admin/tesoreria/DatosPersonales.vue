<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">
      
      <!-- HEADER ORIGINAL -->
      <div class="header-section shadow-sm">
        <div class="header-info">
          <h2 class="title">Visualización de Registros</h2>
          <span class="counter">Total: {{ totalFiltrados }} registros</span>
        </div>

        <div class="header-actions">
          <button @click="limpiarFiltros" class="btn-action btn-clear">
            <span class="material-icons">filter_alt_off</span> Filtros
          </button>
          <button @click="exportarExcel" class="btn-action btn-export">
            <span class="material-icons">download</span> Excel
          </button>
        </div> 
      </div>

      <!-- TABLA DE SOLO LECTURA -->
      <div class="table-container shadow">
        <table>
          <thead>
            <tr class="main-header">
              <th class="sticky-col col-id">ID</th>
              <th class="sticky-col col-apellido">Apellido</th>
              <th class="sticky-col col-nombre">Nombre</th>
              <th class="col-ultra-compact">Activo</th>
              <th class="col-ultra-compact">Grupo</th>
              <th class="col-ultra-compact">Subg.</th>
              <th>F. Nacimiento</th>
              <th>Celular</th>
              <th class="col-dni-compact">DNI</th>
              <th>Email</th>
            </tr>
            <tr class="filter-row">
              <td class="sticky-col col-id"></td>
              <td class="sticky-col col-apellido"><input v-model="filtros.apellido" class="filter-input" placeholder="Filtrar.."></td>
              <td class="sticky-col col-nombre"><input v-model="filtros.nombre" class="filter-input" placeholder="Filtrar.."></td>
              <td class="col-ultra-compact"><input v-model="filtros.es_activo" class="filter-input text-center" placeholder="SI/NO"></td>
              <td class="col-ultra-compact"><input v-model="filtros.grupo" class="filter-input text-center"></td>
              <td class="col-ultra-compact"><input v-model="filtros.subgrupo" class="filter-input text-center"></td>
              <td><input v-model="filtros.fecha_nacimiento" class="filter-input"></td>
              <td><input v-model="filtros.celular" class="filter-input"></td>
              <td class="col-dni-compact"><input v-model="filtros.dni" class="filter-input text-center"></td>
              <td><input v-model="filtros.email" class="filter-input"></td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in datosPaginados" :key="a.id" :class="{ 'fila-inactiva': a.es_activo == 0 }">
              <td class="sticky-col col-id">{{ a.id }}</td>
              <td class="sticky-col col-apellido">{{ a.apellido }}</td>
              <td class="sticky-col col-nombre">{{ a.nombre }}</td>
              <td class="col-ultra-compact">
                <div class="status-wrapper">
                  <span :class="['status-dot', a.es_activo == 1 ? 'dot-active' : 'dot-inactive']"></span>
                  <span class="read-only-text">{{ a.es_activo == 1 ? 'SI' : 'NO' }}</span>
                </div>
              </td>
              <td class="col-ultra-compact read-only-text text-center">{{ a.grupo }}</td>
              <td class="col-ultra-compact read-only-text text-center">{{ a.subgrupo }}</td>
              <td class="read-only-text">{{ mostrarFechaArg(a.fecha_nacimiento) }}</td>
              <td class="read-only-text">{{ a.celular }}</td>
              <td class="col-dni-compact read-only-text text-center">{{ a.dni }}</td>
              <td class="read-only-text">{{ a.email }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINACION -->
      <div class="paginacion">
        <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
        <span class="read-only-text paginacion-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas">Siguiente</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { api } from '@/api/api' 
import * as XLSX from 'xlsx'

const listaCompleta = ref([]);
const filtros = reactive({
  apellido: '', nombre: '', es_activo: '', grupo: '', subgrupo: '', fecha_nacimiento: '', celular: '', dni: '', email: ''
});
const paginaActual = ref(1);
const registrosPorPagina = 10;

const cargarDatos = async () => {
  try {
    const { payload } = await api.get({ entity: 'arbitros', action: 'getArbitros' });
    if (payload) {
      // Ordenamos el payload alfabéticamente por Apellido y luego Nombre
      listaCompleta.value = payload.sort((a, b) => {
        // Armamos el string "Apellido Nombre" para comparar
        const nombreA = `${a.apellido || ''} ${a.nombre || ''}`.trim().toLowerCase();
        const nombreB = `${b.apellido || ''} ${b.nombre || ''}`.trim().toLowerCase();
        
        // localeCompare ordena perfectamente incluyendo tildes y eñes
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
/* Contenedor principal ajustado para evitar overflow en móviles */
.full-screen-wrapper {
  position: relative;
  width: 100%; /* Cambiado de 99vw a 100% para mejor control responsive */
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

/* Solo aplicar el truco de centrado absoluto en pantallas grandes si es necesario por tu layout global */
@media (min-width: 1200px) {
  .full-screen-wrapper {
    width: 99vw;
    margin-left: 50%;
    transform: translateX(-50%);
  }
}

.admin-panel { 
  width: 100%;
  padding: 20px; 
  background-color: #0f172a; 
  min-height: calc(100vh - 40px); /* Ajustado para considerar el padding */
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  border-radius: 8px; /* Pequeño detalle estético opcional */
  box-sizing: border-box;
}

.header-section { 
  background: white; padding: 15px; border-radius: 8px; display: flex; 
  justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #ef4444; 
  align-items: center; 
}

.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #64748b; display: block; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-export { background: #10b981; color: white; }

.table-container { 
  width: 100%; overflow: auto; max-height: 75vh; /* Ajustado ligeramente para móviles */
  background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
}

table { width: 100%; min-width: max-content; border-collapse: collapse; }

thead tr.main-header th { 
  position: sticky; top: 0; z-index: 100; 
  background: #f8fafc; border-bottom: 2px solid #e2e8f0; 
  font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800;
  padding: 12px 10px;
}

thead tr.filter-row td { 
  position: sticky; top: 41px; z-index: 90; 
  background: #f1f5f9 !important; border-bottom: 2px solid #cbd5e1; 
}

thead tr.filter-row td.sticky-col {
  z-index: 95 !important;
  background: #f1f5f9 !important;
}

.sticky-col { 
  position: sticky !important; z-index: 60 !important; 
  background: white !important; 
  box-shadow: inset -1px 0 0 #e2e8f0; 
}

/* Configuraciones de columnas */
.col-id { left: 0; width: 50px; text-align: center; }
.col-apellido { left: 50px; width: 140px; }
.col-nombre { left: 190px; width: 140px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }

.col-ultra-compact { 
  width: 65px !important; 
  min-width: 65px !important; 
  text-align: center !important;
}

.col-dni-compact { width: 90px; text-align: center; }

.read-only-text {
  padding: 10px 5px;
  font-size: 0.85rem;
  color: #1e293b;
}

.filter-input { font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; box-sizing: border-box;}

.fila-inactiva td, .fila-inactiva .sticky-col { background-color: #f37d7d !important; color: #000; }

.status-wrapper { display: flex; align-items: center; gap: 5px; justify-content: center; height: 100%; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-active { background: #10b981; }
.dot-inactive { background: #ef4444; }

.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 15px; flex-wrap: wrap;}
.btn-paginacion { border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }
.paginacion-texto { color: white; font-size: 0.85rem; }

/* =========================================
   MEDIA QUERIES PARA RESPONSIVE DESIGN
   ========================================= */

@media (max-width: 768px) {
  /* Ajustes del contenedor general */
  .full-screen-wrapper {
    padding: 10px;
  }
  .admin-panel {
    padding: 10px;
  }

  /* Ajustes del Header para apilar elementos */
  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  .btn-action {
    flex: 1;
    justify-content: center;
  }

  /* Ajustes de Paginación para móviles */
  .paginacion {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  /* En pantallas muy chicas, liberamos las columnas fijas porque roban demasiado espacio visible */
  .sticky-col {
    position: static !important;
    box-shadow: none !important;
  }
  .col-nombre {
    box-shadow: none !important;
  }
  thead tr.main-header th.sticky-col,
  thead tr.filter-row td.sticky-col {
    z-index: 10 !important; /* Reseteamos z-index */
  }
  /* Solo mantenemos fijo el thead general hacia arriba */
  thead tr.main-header th {
    z-index: 20 !important;
  }
  thead tr.filter-row td {
    z-index: 15 !important;
  }
}
</style>