<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">
      
      <div class="card shadow border-0 w-100 mx-auto bg-white" style="border-radius: 12px; overflow: hidden;">
        
        <div class="header-section border-bottom" style="margin-bottom: 0; box-shadow: none; border-radius: 0; padding: 20px;">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2" style="font-size: 1.25rem;">
              <i class="bi bi-people-fill me-1"></i>Datos Personales
            </h4>
            <span class="counter mt-1 d-block">Total: {{ totalFiltrados }} registros</span>
          </div>

          <div class="header-actions">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex" title="Mostrar Filtros">
              <span class="material-icons">filter_alt</span> <span class="btn-text">Filtros</span>
            </button>

            <button @click="limpiarFiltros" class="btn-action btn-clear">
              <span class="material-icons">filter_alt_off</span> <span class="btn-text">Limpiar</span>
            </button>
            <button @click="exportarExcel" class="btn-action btn-export">
              <span class="material-icons">download</span> <span class="btn-text">Excel</span>
            </button>
          </div> 
        </div>

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster" style="border-radius: 0; border-left: 0; border-right: 0; margin-bottom: 0; background-color: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-muted text-uppercase" style="letter-spacing: 0.5px;">FILTRAR REGISTROS</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1" style="line-height: 1; background: transparent;">
              <span class="material-icons" style="font-size: 20px;">close</span>
            </button>
          </div>

          <div class="filter-grid-mobile">
            <input v-model="filtros.apellido" class="filter-input-mobile" placeholder="Apellido...">
            <input v-model="filtros.nombre" class="filter-input-mobile" placeholder="Nombre...">
            <input v-model="filtros.dni" class="filter-input-mobile" placeholder="DNI...">
            <input v-model="filtros.celular" class="filter-input-mobile" placeholder="Celular...">
            
            <select v-model="filtros.es_activo" class="filter-input-mobile">
              <option value="">Estado (Todos)</option>
              <option value="si">Activo</option>
              <option value="no">Inactivo</option>
            </select>
            <input v-model="filtros.grupo" class="filter-input-mobile" placeholder="Grupo...">
          </div>

          <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded fw-bold border-0 shadow-sm" style="font-size: 0.95rem;">
            Aplicar Filtros
          </button>
        </div>

        <div class="card-body p-3 p-md-4">
          <div class="table-container shadow desktop-only">
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
                <tr v-if="datosPaginados.length === 0">
                  <td colspan="10" class="text-center py-5 text-muted bg-light italic">
                    No se encontraron registros.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only mt-3">
            <div v-for="a in datosPaginados" :key="'mob-'+a.id" class="card-arbitro" :class="{ 'fila-inactiva': a.es_activo == 0 }">
              <div class="card-header">
                <div class="card-name">
                  <span :class="['status-dot', a.es_activo == 1 ? 'dot-active' : 'dot-inactive']" style="margin-right: 5px;"></span>
                  <strong>{{ a.apellido }}, {{ a.nombre }}</strong>
                </div>
                <div class="text-xs" style="color: #64748b;">ID: {{ a.id }}</div>
              </div>
              
              <div class="card-body">
                <div class="card-row">
                  <span><strong>DNI:</strong> {{ a.dni || '-' }}</span>
                  <span><strong>Grupo:</strong> {{ a.grupo || '-' }}<template v-if="a.subgrupo">/{{ a.subgrupo }}</template></span>
                </div>
                
                <div class="card-info">
                  <p v-if="a.fecha_nacimiento"><strong>F. Nacimiento:</strong> {{ mostrarFechaArg(a.fecha_nacimiento) }}</p>
                  <p v-if="a.celular"><strong>Celular:</strong> {{ a.celular }}</p>
                  <p v-if="a.email"><strong>Email:</strong> {{ a.email }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="datosPaginados.length === 0" class="text-center p-4 bg-white rounded shadow-sm">
              <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
              <p class="text-muted mt-2 mb-0">No se encontraron registros.</p>
            </div>
          </div>

          <div class="paginacion" v-if="totalPaginas > 1">
            <button class="btn-paginacion shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual === 1">Anterior</button>
            <span class="paginacion-texto text-dark fw-bold">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn-paginacion shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual === totalPaginas || totalPaginas === 0">Siguiente</button>
          </div>

        </div> </div> </div>
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
/* Contenedor principal ajustado para evitar overflow en móviles */
.full-screen-wrapper {
  position: relative;
  width: 100%; 
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

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
  min-height: calc(100vh - 40px); 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  border-radius: 8px; 
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
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-export { background: #10b981; color: white; }
.btn-blue { background: #3b82f6; color: white; }
.btn-text { display: inline; }

/* PAGINACIÓN CON TUS ESTILOS EXACTOS */
.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 12px; }
.btn-paginacion { border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-paginacion:hover:not(:disabled) { background: #e2e8f0; }
.paginacion-texto { color: #000; font-size: 0.85rem; font-weight: 600; }

.table-container { 
  width: 100%; overflow: auto; max-height: 75vh; 
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

/* ====================================================
   📱 RESPONSIVE DESIGN UNIFICADO (Tiered Layout)
   ==================================================== */

/* --- Estilos base para visibilidad --- */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }

/* --- 1. LAPTOPS Y TABLETS GRANDES (Hasta 1024px) --- */
@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
  .btn-action { flex: 1; justify-content: center; min-width: 0; white-space: nowrap; }
}

/* --- 2. TABLETS Y MÓVILES (Hasta 768px) --- */
@media (max-width: 768px) {
  .full-screen-wrapper { padding: 10px; }
  .admin-panel { padding: 10px; }

  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .mobile-only-flex { display: flex !important; }
  
  .paginacion { justify-content: center; margin-top: 20px; }

  /* PANEL DE FILTROS MÓVIL */
  .mobile-filter-panel { 
    background: white; 
    padding: 15px 20px; 
    border-radius: 8px; 
    border: 1px solid #e2e8f0; 
    margin-bottom: 15px;
  }
  .filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .filter-input-mobile {
    padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; 
    font-size: 16px; width: 100%; outline: none; background: #f8fafc; color: #334155;
  }

  /* ESTILOS DE LAS CARDS DE ÁRBITROS (Detallado) */
  .card-arbitro { 
    background: white; 
    border-radius: 8px; 
    padding: 15px; 
    margin-bottom: 12px; 
    border: 1px solid #e2e8f0; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
  }
  .card-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-start; 
    border-bottom: 1px solid #f1f5f9; 
    padding-bottom: 10px; 
    margin-bottom: 10px; 
  }
  .card-name { font-size: 1.05rem; color: #0f172a; }
  .card-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #475569; margin-bottom: 8px; }
  .card-info p { font-size: 0.9rem; color: #475569; margin: 4px 0; }
  
  /* Estados de Fila en Cards */
  .card-arbitro.fila-roja { background-color: #fca5a5 !important; border-color: #ef4444; }
  .card-arbitro.fila-amarilla { background-color: #fef08a !important; border-color: #facc15; }
  .card-arbitro.fila-des { background-color: #93e2ab !important; border-color: #22c55e; }
  .card-arbitro.fila-inactiva { background-color: #ef4444 !important; border-color: #dc2626; }
  
  /* Reset de texto para cards coloreadas */
  .card-arbitro.fila-roja .card-name, .card-arbitro.fila-roja .card-row, 
  .card-arbitro.fila-roja .card-info p, .card-arbitro.fila-inactiva .card-name { 
    color: #000 !important; 
  }
}

/* --- 3. SMARTPHONES (Hasta 600px) --- */
@media (max-width: 600px) {
  /* Corrección de márgenes: Damos 12px de "aire" a los costados */
  .full-screen-wrapper { 
    padding: 0 12px !important; 
    width: 100% !important; 
    margin: 0 !important; 
    transform: none !important; 
    left: 0 !important;
  }
  .admin-panel { border-radius: 0; padding: 15px 0 !important; }

  /* CABECERA: Título a la izquierda, Botones centro */
  .header-section { 
    padding: 15px !important; 
    flex-direction: column; 
    align-items: flex-start; /* Título siempre a la izquierda */
    text-align: left; 
    gap: 15px; 
  }

  .header-info { width: 100%; display: flex; flex-direction: column; align-items: flex-start; }
  
  /* Fuentes solicitadas */
  .header-info h4, h2 { font-size: 1.25rem !important; margin: 0; text-align: left; }
  .header-info span.counter { font-size: 0.85rem !important; }

  /* BOTONES DE ACCIÓN: Centrados abajo */
  .header-actions { 
    width: 100%; 
    display: flex; 
    flex-direction: row; 
    flex-wrap: wrap; 
    justify-content: center; /* Centramos los botones */
    gap: 10px; 
  }

  .btn-action { 
    flex: none; 
    width: 42px; 
    height: 42px; 
    padding: 0; 
    justify-content: center; 
  }

  .btn-text { display: none !important; }

  /* Liberar tablas para evitar desbordes */
  .sticky-col { position: static !important; box-shadow: none !important; }
  .col-nombre { box-shadow: none !important; }
  
  /* Ajuste de filtros para ocupar el ancho total en móvil */
  .filter-grid-mobile { grid-template-columns: 1fr; }
}

.animate__animated { animation-duration: 0.5s; }

</style>