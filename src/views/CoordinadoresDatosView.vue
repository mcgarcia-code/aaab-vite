<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useHead } from '@vueuse/head'

// Título y descripción específicos para la página de coordinadores AAAB
useHead({
  title: 'Coordinadores: Base de datos | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Base de datos para los coordinadores AAAB.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Coordinadores: Base de datos | AAAB',
    },
    {
      property: 'og:description',
      content: 'Base de datos para los coordinadores AAAB.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png', // Asegúrate que esta URL sea real
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
})

// --- CONFIGURACIÓN DE APIS ---
const API_URL = 'https://arbitroshandball.com.ar/api/acciones.php'; 

const arbitros = ref([]);
const mostrarFiltrosMobile = ref(false);

const filtros = reactive({
  apellido: '', nombre: '', licencia: '', es_activo: '', 
  apto_medico: '', // Agregado filtro apto_medico
  grupo: '', subgrupo: '', zona: '', movilidad: '', 
  juega_handball: '', donde_juega: '', categoria_handball: '', observaciones: ''
});

// --- LÓGICA DE CARGA ---
const cargarDatos = async () => {
  try {
    const res = await axios.get(API_URL);
    arbitros.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) { 
    console.error("Error al cargar datos:", err); 
  }
};

// --- LÓGICA DE COLORES ---
const obtenerClaseFila = (a) => {
  const tieneAprobada = Number(a.tiene_aprobada) > 0;
  const tieneRechazada = Number(a.tiene_rechazada) > 0;
  const esInactivo = a.es_activo == 0;

  if (esInactivo || tieneAprobada) return 'fila-roja';
  if (tieneRechazada) return 'fila-amarilla';
  return '';
};

const limpiarFiltros = () => Object.keys(filtros).forEach(k => filtros[k] = '');

const mostrarFechaArg = (fecha) => {
  if (!fecha) return '';
  const partes = fecha.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

const abrirWhatsApp = (numero) => {
  if (!numero) return;
  const limpio = String(numero).replace(/\D/g, '');
  const prefijo = limpio.startsWith('54') ? limpio : `54${limpio}`;
  window.open(`https://wa.me/${prefijo}`, '_blank');
};

const obtenerTextoLicencia = (a) => {
  let textos = [];
  const formatearVariasFechas = (cadenaFechas) => {
    if (!cadenaFechas) return '';
    return cadenaFechas.split(',').map(f => mostrarFechaArg(f.trim())).join(', ');
  };
  if (Number(a.tiene_aprobada) > 0 && a.fecha_licencia_aprobada) {
    textos.push(`APR: ${formatearVariasFechas(a.fecha_licencia_aprobada)}`);
  }
  if (Number(a.tiene_rechazada) > 0 && a.fecha_licencia_rechazada) {
    textos.push(`REC: ${formatearVariasFechas(a.fecha_licencia_rechazada)}`);
  }
  return textos.length > 0 ? textos.join(' | ') : '-';
};

const normalizarTexto = (valor) => {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const arbitrosFiltrados = computed(() => {
  return arbitros.value.filter(a => {
    const cumpleTexto = Object.keys(filtros).every(key => {
      if (!filtros[key] || key === 'licencia') return true;
      
      // Lógica específica para filtros SI/NO (numéricos o booleanos)
      if (key === 'es_activo' || key === 'apto_medico') {
         return String(a[key]) === filtros[key];
      }
      
      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]));
    });
    
    let cumpleLicencia = true;
    if (filtros.licencia === 'aprobada') cumpleLicencia = Number(a.tiene_aprobada) > 0;
    else if (filtros.licencia === 'rechazada') cumpleLicencia = Number(a.tiene_rechazada) > 0;
    else if (filtros.licencia === 'sin_licencia') cumpleLicencia = Number(a.tiene_aprobada) === 0 && Number(a.tiene_rechazada) === 0;

    return cumpleTexto && cumpleLicencia;
  });
});

const exportarExcel = () => {
  const datos = arbitrosFiltrados.value.map(a => ({
    APELLIDO: a.apellido, NOMBRE: a.nombre, EDAD: a.edad,
    CELULAR: a.celular,
    LICENCIA: obtenerTextoLicencia(a),
    ACTIVO: a.es_activo == 1 ? 'SI' : 'NO',
    APTO_MEDICO: a.apto_medico == 1 ? 'SI' : 'NO',
    GRUPO: a.grupo, SUBGRUPO: a.subgrupo,
    ZONA: a.zona, MOVILIDAD: a.movilidad,
    JUEGA: a.juega_handball, CLUB: a.donde_juega, OBS: a.observaciones
  }));
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Arbitros");
  XLSX.writeFile(wb, "Lista_Arbitros.xlsx");
};

onMounted(cargarDatos);
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <div class="admin-panel">
    
    <div class="header-section">
      <div class="header-title-box">
        <h2 class="title">Coordinadores: Base de datos</h2>
        <span class="counter">Total: {{ arbitrosFiltrados.length }} árbitros</span>
      </div>
      
      <div class="header-actions">
        <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-filter-mobile mobile-only">
          <span class="material-icons">filter_alt</span>
        </button>

        <button @click="limpiarFiltros" class="btn-action btn-clear">
          <span class="material-icons">filter_alt_off</span> 
          <span class="btn-text">Filtros</span>
        </button>

        <button @click="exportarExcel" class="btn-action btn-export">
          <span class="material-icons">download</span> 
          <span class="btn-text">Excel</span>
        </button>
      </div>
    </div>

    <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only">
      <div class="filter-grid-mobile">
        <input v-model="filtros.apellido" placeholder="Apellido..">
        <input v-model="filtros.nombre" placeholder="Nombre..">
        
        <div class="mobile-select-group">
          <label>Estado Activo:</label>
          <select v-model="filtros.es_activo">
            <option value="">Todos los estados</option>
            <option value="1">Solo Activos</option>
            <option value="0">Solo Inactivos</option>
          </select>
        </div>

        <div class="mobile-select-group">
          <label>Apto Médico:</label>
          <select v-model="filtros.apto_medico">
            <option value="">Todos</option>
            <option value="1">Solo Aptos</option>
            <option value="0">No Aptos</option>
          </select>
        </div>

        <div class="mobile-select-group">
          <label>Licencia:</label>
          <select v-model="filtros.licencia">
            <option value="">Todos los Árbitros</option>
            <option value="sin_licencia">Sin Licencia</option>
            <option value="aprobada">Licencias Aprobadas</option>
            <option value="rechazada">Licencias Rechazadas</option>
          </select>
        </div>

        <div class="filter-row-mobile">
          <input v-model="filtros.grupo" placeholder="Grupo">
          <input v-model="filtros.subgrupo" placeholder="Sub-grupo">
        </div>
        <input v-model="filtros.zona" placeholder="Zona..">
      </div>
      <button @click="mostrarFiltrosMobile = false" class="btn-close-filters">Ver Resultados</button>
    </div>

    <div class="table-container shadow desktop-only">
      <table>
        <thead>
          <tr>
            <th class="sticky-col" style="left: 0; z-index: 40; width: 140px;">Apellido</th>
            <th class="sticky-col" style="left: 140px; z-index: 40; width: 140px;">Nombre</th>
            <th class="col-shrink">Edad</th>
            <th class="sticky-col sticky-col-final" style="left: 280px; z-index: 40; min-width: 160px;">Licencia</th>
            <th class="col-shrink">WhatsApp</th>
            <th class="col-shrink">Activo</th>
            <th class="col-shrink">Apto Med.</th>
            <th class="col-shrink">Grupo</th>
            <th class="col-shrink">Sub</th>
            <th>Zona</th>
            <th>Movilidad</th>
            <th class="col-shrink">Sáb Disp</th>
            <th>Desde</th>
            <th>Hasta</th>
            <th class="col-shrink">Dom Disp</th>
            <th>Desde</th>
            <th>Hasta</th>
            <th class="col-shrink">Juega</th>
            <th>Club</th>
            <th>Cat</th>
            <th>Observaciones</th>
          </tr>
          <tr class="filter-row">
            <td class="sticky-col" style="left:0; z-index: 35;"><input v-model="filtros.apellido" class="filter-input"></td>
            <td class="sticky-col" style="left:140px; z-index: 35;"><input v-model="filtros.nombre" class="filter-input"></td>
            <td></td>
            <td class="sticky-col sticky-col-final" style="left:280px; z-index: 35;">
              <select v-model="filtros.licencia" class="filter-input">
                <option value="">Todas</option>
                <option value="sin_licencia">Sin Licencia</option>
                <option value="aprobada">Licencia Aprobadas</option>
                <option value="rechazada">Licencia Rechazadas</option>
              </select>
            </td>
            <td></td> 
            <td>
              <select v-model="filtros.es_activo" class="filter-input">
                <option value="">Todos</option>
                <option value="1">SÍ</option>
                <option value="0">NO</option>
              </select>
            </td>
            <td>
              <select v-model="filtros.apto_medico" class="filter-input">
                <option value="">Todos</option>
                <option value="1">SÍ</option>
                <option value="0">NO</option>
              </select>
            </td>
            <td><input v-model="filtros.grupo" class="filter-input-min"></td>
            <td><input v-model="filtros.subgrupo" class="filter-input-min"></td>
            <td><input v-model="filtros.zona" class="filter-input"></td>
            <td><input v-model="filtros.movilidad" class="filter-input"></td>
            <td><input v-model="filtros.disponibilidad_sabado" class="filter-input-min"></td>
            <td></td><td></td>
            <td><input v-model="filtros.disponibilidad_domingo" class="filter-input-min"></td>
            <td></td><td></td>
            <td><input v-model="filtros.juega_handball" class="filter-input-min"></td>
            <td><input v-model="filtros.donde_juega" class="filter-input"></td>
            <td><input v-model="filtros.categoria_handball" class="filter-input"></td>
            <td><input v-model="filtros.observaciones" class="filter-input"></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in arbitrosFiltrados" :key="a.id" :class="obtenerClaseFila(a)">
            <td class="sticky-col font-bold" style="left: 0;">{{ a.apellido }}</td>
            <td class="sticky-col font-bold" style="left: 140px;">{{ a.nombre }}</td>
            <td class="text-center">{{ a.edad }}</td>
            <td class="sticky-col text-center text-xs sticky-col-final" style="left: 280px;">{{ obtenerTextoLicencia(a) }}</td>
            <td class="text-center">
              <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa"><span class="material-icons">chat</span></button>
            </td>
            <td class="text-center"><span :class="['dot', a.es_activo == 1 ? 'dot-green' : 'dot-red']"></span></td>
            <td class="text-center"><span :class="['dot', a.apto_medico == 1 ? 'dot-green' : 'dot-red']"></span></td>
            <td class="text-center">{{ a.grupo }}</td>
            <td class="text-center">{{ a.subgrupo }}</td>
            <td>{{ a.zona }}</td>
            <td>{{ a.movilidad }}</td>
            <td class="text-center">{{ a.disponibilidad_sabado }}</td>
            <td class="text-xs">{{ a.disponibilidad_sabado_desde }}</td>
            <td class="text-xs">{{ a.disponibilidad_sabado_hasta }}</td>
            <td class="text-center">{{ a.disponibilidad_domingo }}</td>
            <td class="text-xs">{{ a.disponibilidad_domingo_desde }}</td>
            <td class="text-xs">{{ a.disponibilidad_domingo_hasta }}</td>
            <td class="text-center">{{ a.juega_handball }}</td>
            <td>{{ a.donde_juega }}</td>
            <td>{{ a.categoria_handball }}</td>
            <td class="col-obs-container"><div class="obs-wrapper" tabindex="0">{{ a.observaciones || '-' }}</div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-only">
      <div v-for="a in arbitrosFiltrados" :key="'mob-'+a.id" class="card-arbitro" :class="obtenerClaseFila(a)">
        <div class="card-header">
          <div class="card-name">
            <span :class="['dot-sm', a.es_activo == 1 ? 'dot-green' : 'dot-red']"></span> 
            <strong>{{ a.apellido }}, {{ a.nombre }} ({{ a.edad }} años)</strong>
          </div>
          <div class="card-lic text-xs">{{ obtenerTextoLicencia(a) }}</div>
        </div>
        <div class="card-body">
          <div class="card-row">
            <span><strong>Gr:</strong> {{ a.grupo }}-{{ a.subgrupo }}</span>
            <span><strong>Apto Médico:</strong> <span :class="a.apto_medico == 1 ? 'text-green' : 'text-red'">{{ a.apto_medico == 1 ? 'SÍ' : 'NO' }}</span></span>
          </div>
          <div class="card-row">
            <span><strong>Zona:</strong> {{ a.zona }}</span>
          </div>
          <div class="card-info">
            <p><strong>Juega:</strong> {{ a.juega_handball }} <span v-if="a.juega_handball === 'SI'">en {{ a.donde_juega }}</span></p>
            <p><strong>Sáb:</strong> {{ a.disponibilidad_sabado }} ({{ a.disponibilidad_sabado_desde }}-{{ a.disponibilidad_sabado_hasta }})</p>
            <p><strong>Dom:</strong> {{ a.disponibilidad_domingo }} ({{ a.disponibilidad_domingo_desde }}-{{ a.disponibilidad_domingo_hasta }})</p>
            <p v-if="a.observaciones"><strong>Obs:</strong> {{ a.observaciones }}</p>
          </div>
          <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa-mobile">
            <span class="material-icons">chat</span> Contactar WhatsApp
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-panel { padding: 15px; background: #f8fafc; font-family: sans-serif; color: #000; min-height: 100vh; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-left: 5px solid #ef4444; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; }
.counter { font-size: 0.85rem; color: #475569; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.75rem; transition: background 0.2s; }
.btn-clear { background: #e2e8f0; color: #1e293b; }
.btn-export { background: #10b981; color: white; }
.btn-filter-mobile { background: #3b82f6; color: white; }

.btn-action .material-icons { font-size: 18px; line-height: 1; }
.btn-text { line-height: 1; }

.table-container { overflow: auto; max-height: 80vh; background: white; border: 1px solid #e2e8f0; border-radius: 4px; width: 100%; }
table { width: max-content; border-collapse: separate; border-spacing: 0; font-size: 0.8rem; }
th { background: #f1f5f9 !important; padding: 10px; position: sticky; top: 0; z-index: 30; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; }
.filter-row td { position: sticky; top: 33px; z-index: 25; background: #f1f5f9 !important; padding: 4px; border-bottom: 2px solid #cbd5e1; }

.sticky-col { position: sticky; z-index: 10; background-color: white !important; border-right: 1px solid #e2e8f0; padding-left: 12px; }
th.sticky-col { z-index: 50 !important; background-color: #f1f5f9 !important; }
.filter-row .sticky-col { background-color: #f1f5f9 !important; }
.sticky-col-final { border-right: 3px solid #cbd5e1 !important; }

.font-bold { font-weight: bold; }
.col-shrink { width: 1px !important; white-space: nowrap !important; padding: 8px 10px !important; text-align: center; }
.filter-input { width: 100%; padding: 4px; border: 1px solid #cbd5e1; font-size: 0.7rem; border-radius: 2px; background: white; }
.filter-input-min { width: 35px; text-align: center; border: 1px solid #cbd5e1; font-size: 0.7rem; border-radius: 2px; }

.btn-wa { background: #25d366; color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-green { background-color: #22c55e; }
.dot-red { background-color: #ef4444; }
.text-green { color: #22c55e; font-weight: bold; }
.text-red { color: #ef4444; font-weight: bold; }

.fila-roja, .fila-roja .sticky-col { background-color: #fca5a5 !important; }
.fila-amarilla, .fila-amarilla .sticky-col { background-color: #fef08a !important; }

.col-obs-container { width: 150px; position: relative; }
.obs-wrapper { width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; padding: 4px; border-radius: 4px; }
.obs-wrapper:focus { position: absolute; width: 300px; white-space: normal; background: #fff; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #3b82f6; padding: 10px; right: 0; top: 0; }

.mobile-only { display: none !important; }
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .header-actions .btn-text { display: none !important; }
  .btn-action { padding: 8px 10px; gap: 0; }

  .mobile-filter-panel { background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
  .filter-grid-mobile { display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px; }
  .filter-grid-mobile input, .filter-grid-mobile select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; background-color: #f8fafc; }
  
  .mobile-select-group { display: flex; flex-direction: column; gap: 4px; }
  .mobile-select-group label { font-size: 0.75rem; color: #475569; font-weight: bold; }
  
  .filter-row-mobile { display: flex; gap: 10px; }
  .filter-row-mobile input { flex: 1; }

  .btn-close-filters { width: 100%; background: #1e293b; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; cursor: pointer; }

  .card-arbitro { background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; }
  .card-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 10px; }
  .card-name { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; }
  .card-row { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px; color: #475569; }
  .btn-wa-mobile { width: 100%; margin-top: 10px; background: #25d366; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; }
}

@media (min-width: 768px) {
  .header-actions .btn-text { display: inline; }
}
</style>