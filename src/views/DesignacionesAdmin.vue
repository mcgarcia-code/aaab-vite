<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';

const arbitros = ref([]);
const API_URL = 'https://arbitroshandball.com.ar/api/acciones.php'; 

const filtros = reactive({
  apellido: '', nombre: '', licencia: '', es_activo: '', grupo: '', subgrupo: '', 
  zona: '', movilidad: '', disponibilidad_sabado: '', disponibilidad_domingo: '',
  juega_handball: '', donde_juega: '', categoria_handball: '', observaciones: ''
});

const designadosSabado = ref(new Set());
const designadosDomingo = ref(new Set());

const limpiarFiltros = () => Object.keys(filtros).forEach(k => filtros[k] = '');
const limpiarChecks = () => {
  if (confirm("¿Limpiar tildes de designación?")) {
    designadosSabado.value.clear();
    designadosDomingo.value.clear();
  }
};

const toggleDesignacion = (id, dia) => {
  const set = dia === 'S' ? designadosSabado.value : designadosDomingo.value;
  set.has(id) ? set.delete(id) : set.add(id);
};

const cargarDatos = async () => {
  try {
    const res = await axios.get(API_URL);
    arbitros.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) { console.error("Error:", err); }
};

const mostrarFechaArg = (fecha) => {
  if (!fecha) return '';
  const partes = fecha.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

const obtenerTextoLicencia = (a) => {
  let textos = [];
  if (a.tiene_aprobada > 0 && a.fecha_licencia_aprobada) textos.push(`APR: ${mostrarFechaArg(a.fecha_licencia_aprobada)}`);
  if (a.tiene_rechazada > 0 && a.fecha_licencia_rechazada) textos.push(`REC: ${mostrarFechaArg(a.fecha_licencia_rechazada)}`);
  return textos.length > 0 ? textos.join(' | ') : '-';
};

const arbitrosFiltrados = computed(() => {
  return arbitros.value.filter(a => {
    const cumpleTexto = Object.keys(filtros).every(key => {
      if (!filtros[key] || key === 'licencia') return true;
      return String(a[key] || "").toLowerCase().includes(filtros[key].toLowerCase());
    });
    let cumpleLicencia = true;
    if (filtros.licencia === 'aprobada') cumpleLicencia = a.tiene_aprobada > 0;
    if (filtros.licencia === 'rechazada') cumpleLicencia = a.tiene_rechazada > 0;
    return cumpleTexto && cumpleLicencia;
  });
});

const exportarExcel = () => {
  const datos = arbitrosFiltrados.value.map(a => ({
    APELLIDO: a.apellido, NOMBRE: a.nombre,
    SAB_DESIGNADO: designadosSabado.value.has(a.id) ? 'SI' : 'NO',
    DOM_DESIGNADO: designadosDomingo.value.has(a.id) ? 'SI' : 'NO',
    LICENCIA: obtenerTextoLicencia(a),
    ACTIVO: a.es_activo == 1 ? 'SI' : 'NO',
    ZONA: a.zona, MOVILIDAD: a.movilidad,
    SAB_DISP: a.disponibilidad_sabado, SAB_HORA: `${a.disponibilidad_sabado_desde} a ${a.disponibilidad_sabado_hasta}`,
    DOM_DISP: a.disponibilidad_domingo, DOM_HORA: `${a.disponibilidad_domingo_desde} a ${a.disponibilidad_domingo_hasta}`,
    JUEGA: a.juega_handball, CLUB: a.donde_juega, OBS: a.observaciones
  }));
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Designaciones");
  XLSX.writeFile(wb, "Planilla_Designaciones_AAAB.xlsx");
};

onMounted(cargarDatos);
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <div class="admin-panel">
    <div class="header-section">
      <div>
        <h2 class="title">Control de Designaciones</h2>
        <span class="counter">Total: {{ arbitrosFiltrados.length }} árbitros</span>
      </div>
      <div class="header-actions">
        <button @click="limpiarFiltros" class="btn-action btn-clear">Limpiar Filtros</button>
        <button @click="limpiarChecks" class="btn-action btn-clear-checks">Limpiar Tildes</button>
        <button @click="exportarExcel" class="btn-action btn-export">Exportar Excel</button>
      </div>
    </div>

    <div class="table-container shadow">
      <table>
        <thead>
          <tr>
            <th class="sticky-col col-name" style="left: 0; z-index: 40;">Apellido</th>
            <th class="sticky-col col-name" style="left: 140px; z-index: 40;">Nombre</th>
            <th class="sticky-col col-check" style="left: 280px; z-index: 40;">SÁB</th>
            <th class="sticky-col col-check" style="left: 330px; z-index: 40;">DOM</th>
            <th class="sticky-col col-lic" style="left: 380px; z-index: 40;">Licencia</th>
            
            <th class="col-shrink">Activo</th>
            <th class="col-shrink">Grupo</th>
            <th class="col-shrink">Sub</th>
            <th>Zona</th>
            <th>Móvil</th>
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
            <td class="sticky-col" style="left:280px; z-index: 35;"></td>
            <td class="sticky-col" style="left:330px; z-index: 35;"></td>
            <td class="sticky-col" style="left:380px; z-index: 35;">
              <select v-model="filtros.licencia" class="filter-input">
                <option value="">Todas</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </td>
            <td class="bg-filter"><input v-model="filtros.es_activo" class="filter-input text-center"></td>
            <td class="bg-filter"><input v-model="filtros.grupo" class="filter-input text-center"></td>
            <td class="bg-filter"><input v-model="filtros.subgrupo" class="filter-input text-center"></td>
            <td class="bg-filter"><input v-model="filtros.zona" class="filter-input"></td>
            <td class="bg-filter"><input v-model="filtros.movilidad" class="filter-input"></td>
            <td class="bg-filter"><input v-model="filtros.disponibilidad_sabado" class="filter-input text-center"></td>
            <td class="bg-filter"></td><td class="bg-filter"></td>
            <td class="bg-filter"><input v-model="filtros.disponibilidad_domingo" class="filter-input text-center"></td>
            <td class="bg-filter"></td><td class="bg-filter"></td>
            <td class="bg-filter"><input v-model="filtros.juega_handball" class="filter-input text-center"></td>
            <td class="bg-filter"><input v-model="filtros.donde_juega" class="filter-input"></td>
            <td class="bg-filter"><input v-model="filtros.categoria_handball" class="filter-input"></td>
            <td class="bg-filter"><input v-model="filtros.observaciones" class="filter-input"></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in arbitrosFiltrados" :key="a.id" 
              :class="{
                'fila-lic-ok': a.tiene_aprobada > 0, 
                'fila-lic-x': a.tiene_aprobada == 0 && a.tiene_rechazada > 0, 
                'fila-ina': a.es_activo == 0, 
                'fila-des': designadosSabado.has(a.id) || designadosDomingo.has(a.id)
              }">
            <td class="sticky-col font-bold" style="left: 0;">{{ a.apellido }}</td>
            <td class="sticky-col font-bold" style="left: 140px;">{{ a.nombre }}</td>
            <td class="sticky-col text-center" style="left: 280px;">
              <input type="checkbox" :checked="designadosSabado.has(a.id)" @change="toggleDesignacion(a.id, 'S')" class="check">
            </td>
            <td class="sticky-col text-center" style="left: 330px;">
              <input type="checkbox" :checked="designadosDomingo.has(a.id)" @change="toggleDesignacion(a.id, 'D')" class="check">
            </td>
            <td class="sticky-col text-center text-xs" style="left: 380px;">
              {{ obtenerTextoLicencia(a) }}
            </td>

            <td class="text-center">
              <span :class="['dot', a.es_activo == 1 ? 'dot-green' : 'dot-red']"></span>
            </td>
            <td class="text-center">{{ a.grupo }}</td>
            <td class="text-center">{{ a.subgrupo }}</td>
            <td>{{ a.zona }}</td>
            <td>{{ a.movilidad }}</td>
            <td class="text-center">{{ a.disponibilidad_sabado }}</td>
            <td>{{ a.disponibilidad_sabado_desde }}</td>
            <td>{{ a.disponibilidad_sabado_hasta }}</td>
            <td class="text-center">{{ a.disponibilidad_domingo }}</td>
            <td>{{ a.disponibilidad_domingo_desde }}</td>
            <td>{{ a.disponibilidad_domingo_hasta }}</td>
            <td class="text-center">{{ a.juega_handball }}</td>
            <td>{{ a.donde_juega }}</td>
            <td>{{ a.categoria_handball }}</td>
            <td class="col-obs-container">
              <div class="obs-wrapper" tabindex="0">
                {{ a.observaciones || '-' }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-panel { padding: 15px; background: #f8fafc; font-family: sans-serif; color: #000; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #ef4444; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.8rem; color: #475569; }
.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.75rem; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-clear-checks { background: #fee2e2; color: #991b1b; }
.btn-export { background: #10b981; color: white; }

.table-container { overflow: auto; max-height: 80vh; background: white; border: 1px solid #e2e8f0; }
table { width: max-content; border-collapse: separate; border-spacing: 0; font-size: 0.8rem; color: #000; }

/* Sticky Cabecera */
th { background: #f1f5f9 !important; padding: 8px; position: sticky; top: 0; z-index: 30; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; }
.filter-row td { position: sticky; top: 33px; z-index: 25; background: #f1f5f9 !important; padding: 4px; border-bottom: 2px solid #cbd5e1; }
.bg-filter { background: #f1f5f9 !important; }

/* Sticky Columnas Laterales */
.sticky-col { position: sticky; z-index: 10; background-color: #ffffff !important; border-right: 1px solid #e2e8f0; }
.filter-row .sticky-col { background-color: #f1f5f9 !important; }
th.sticky-col { z-index: 50 !important; }

td { padding: 8px; border-bottom: 1px solid #f1f5f9; color: #000; }

/* Columnas Compactas */
.col-shrink { width: 1%; white-space: nowrap; padding: 0 15px !important; }

/* Estilos de activo/inactivo */
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-green { background-color: #22c55e; }
.dot-red { background-color: #ef4444; }

.filter-input { width: 100%; padding: 2px; border: 1px solid #cbd5e1; font-size: 0.7rem; }
.check { transform: scale(1.1); cursor: pointer; }

/* LÓGICA DE OBSERVACIONES EXPANDIBLES */
.col-obs-container { width: 150px; position: relative; }
.obs-wrapper {
  width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  background: transparent;
}
.obs-wrapper:focus {
  position: absolute;
  width: 300px;
  white-space: normal;
  background: #fff;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 1px solid #3b82f6;
  padding: 10px;
  left: -150px; /* Se despliega hacia la izquierda para no salirse de la pantalla */
  top: 0;
}

/* Clases de fila */
.fila-des { background-color: #f0fdf4 !important; }
.fila-des .sticky-col { background-color: #f0fdf4 !important; }
.fila-lic-ok td, .fila-lic-ok .sticky-col { background-color: #fca5a5 !important; }
.fila-lic-x td, .fila-lic-x .sticky-col { background-color: #fde68a !important; }
.fila-ina td, .fila-ina .sticky-col { background-color: #f1f5f9 !important; color: #64748b !important; }

.font-bold { font-weight: bold; }
.text-center { text-align: center; }
.text-xs { font-size: 0.7rem; }
</style>