<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';

const arbitros = ref([]);
const API_URL = 'https://arbitroshandball.com.ar/api/acciones.php'; 
const filtros = reactive({}); 

const limpiarFiltros = () => {
  Object.keys(filtros).forEach(key => filtros[key] = '');
};

const mostrarFechaArg = (fecha) => {
  if (!fecha) return '';
  const partes = fecha.split('-');
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const normalizarTexto = (valor) => {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const exportarExcel = () => {
  const datosParaExcel = arbitrosFiltrados.value.map(a => ({
    ...a,
    fecha_nacimiento: mostrarFechaArg(a.fecha_nacimiento),
    es_activo: a.es_activo == 1 ? 'SI' : 'NO'
  }));
  const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Arbitros");
  XLSX.writeFile(workbook, "Lista_Arbitros_AAAB.xlsx");
};

const cargarDatos = async () => {
  try {
    const res = await axios.get(API_URL);
    arbitros.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) { console.error("Error:", err); }
};

const crearNuevo = () => {
  arbitros.value.unshift({
    apellido: '', nombre: '', grupo: '', subgrupo: '', dni: '', email: '', 
    direccion: '', provincia: '', localidad: '', zona: '', celular: '',
    fecha_nacimiento: '', observaciones: '', es_activo: 1 
  });
};

const guardarTodo = async () => {
  try {
    const datosParaEnviar = arbitros.value.filter(a => a.apellido || a.nombre);
    await axios.post(API_URL, { masivo: true, datos: datosParaEnviar });
    alert("Los cambios fueron cargados exitosamente");
    cargarDatos();
  } catch{ alert("Error al guardar"); }
};

const arbitrosFiltrados = computed(() => {
  return arbitros.value.filter(a => {
    return Object.keys(filtros).every(key => {
      if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') return true;

      // Lógica especial para el filtro de Activo (SI/NO)
      if (key === 'es_activo') {
        const busqueda = filtros[key].toLowerCase();
        const valorReal = String(a[key]); // '1' o '0'
        
        if (busqueda === 'si') return valorReal === '1';
        if (busqueda === 'no') return valorReal === '0';
        // Permite también filtrar por 1 o 0 directamente
        return valorReal.includes(busqueda);
      }

      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]));
    });
  });
});

const totalFiltrados = computed(() => arbitrosFiltrados.value.length);
onMounted(cargarDatos);
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="admin-panel animate__animated animate__fadeIn">
    
    <div class="header-section shadow-sm">
      <div class="header-info">
        <h2 class="title">Gestión de Árbitros</h2>
        <span class="counter">Total: {{ totalFiltrados }} árbitros</span>
      </div>

      <div class="header-actions">
        <button @click="limpiarFiltros" class="btn-action btn-clear">
          <span class="material-icons">filter_alt_off</span> Filtros
        </button>
        <button @click="guardarTodo" class="btn-action btn-blue">
          <span class="material-icons">save</span> Guardar
        </button>
        <button @click="crearNuevo" class="btn-action btn-clear-checks">
          <span class="material-icons">person_add</span> Nuevo
        </button>
        <button @click="exportarExcel" class="btn-action btn-export">
          <span class="material-icons">download</span> Excel
        </button>
      </div>
    </div>

    <div class="table-container shadow">
      <table>
        <thead>
          <tr class="main-header">
            <th class="sticky-col col-id">ID</th>
            <th class="sticky-col col-apellido">Apellido</th>
            <th class="sticky-col col-nombre">Nombre</th>
            <th class="col-xs-compact">Activo</th> 
            <th class="col-xs-compact">Grupo</th>
            <th class="col-xs-compact">Subg.</th>
            <th class="col-dni-compact">DNI</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Provincia</th>
            <th>Localidad</th>
            <th>Zona</th>
            <th>Celular</th>
            <th>F. Nacimiento</th>
            <th>Tel. Contacto</th>
            <th>Parentesco</th>
            <th>Movilidad</th>
            <th class="col-dni-compact">Sáb. Disp</th>
            <th>Sáb. Desde</th>
            <th>Sáb. Hasta</th>
            <th class="col-dni-compact">Dom. Disp</th>
            <th>Dom. Desde</th>
            <th>Dom. Hasta</th>
            <th class="col-dni-compact">Juega</th>
            <th>Club</th>
            <th>Cat. Juega</th>
            <th>Observaciones</th>
          </tr>
          <tr class="filter-row">
            <td class="sticky-col col-id"></td>
            <td class="sticky-col col-apellido"><input v-model="filtros.apellido" class="filter-input" placeholder="Filtrar.."></td>
            <td class="sticky-col col-nombre"><input v-model="filtros.nombre" class="filter-input" placeholder="Filtrar.."></td>
            <td class="col-xs-compact"><input v-model="filtros.es_activo" class="filter-input text-center" placeholder="SI/NO"></td>
            <td class="col-xs-compact"><input v-model="filtros.grupo" class="filter-input text-center"></td>
            <td class="col-xs-compact"><input v-model="filtros.subgrupo" class="filter-input text-center"></td>
            <td class="col-dni-compact"><input v-model="filtros.dni" class="filter-input text-center"></td>
            <td><input v-model="filtros.email" class="filter-input"></td>
            <td><input v-model="filtros.direccion" class="filter-input"></td>
            <td><input v-model="filtros.provincia" class="filter-input"></td>
            <td><input v-model="filtros.localidad" class="filter-input"></td>
            <td><input v-model="filtros.zona" class="filter-input"></td>
            <td><input v-model="filtros.celular" class="filter-input"></td>
            <td><input v-model="filtros.fecha_nacimiento" class="filter-input"></td>
            <td><input v-model="filtros.telefonocontacto" class="filter-input"></td>
            <td><input v-model="filtros.parentescocontacto" class="filter-input"></td>
            <td><input v-model="filtros.movilidad" class="filter-input"></td>
            <td class="col-dni-compact"><input v-model="filtros.disponibilidad_sabado" class="filter-input"></td>
            <td><input v-model="filtros.disponibilidad_sabado_desde" class="filter-input"></td>
            <td><input v-model="filtros.disponibilidad_sabado_hasta" class="filter-input"></td>
            <td class="col-dni-compact"><input v-model="filtros.disponibilidad_domingo" class="filter-input"></td>
            <td><input v-model="filtros.disponibilidad_domingo_desde" class="filter-input"></td>
            <td><input v-model="filtros.disponibilidad_domingo_hasta" class="filter-input"></td>
            <td class="col-dni-compact"><input v-model="filtros.juega_handball" class="filter-input"></td>
            <td><input v-model="filtros.donde_juega" class="filter-input"></td>
            <td><input v-model="filtros.categoria_handball" class="filter-input"></td>
            <td><input v-model="filtros.observaciones" class="filter-input"></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in arbitrosFiltrados" :key="a.id || Math.random()" :class="{ 'fila-inactiva': a.es_activo == 0 }">
            <td class="sticky-col col-id">{{ a.id || '-' }}</td>
            <td class="sticky-col col-apellido"><input v-model="a.apellido" class="edit-input"></td>
            <td class="sticky-col col-nombre"><input v-model="a.nombre" class="edit-input"></td>
            
            <td class="col-xs-compact">
              <div class="status-wrapper">
                <span :class="['status-dot', a.es_activo == 1 ? 'dot-active' : 'dot-inactive']"></span>
                <select v-model="a.es_activo" class="small-select select-compact">
                  <option :value="1">SI</option>
                  <option :value="0">NO</option>
                </select>
              </div>
            </td>

            <td class="col-xs-compact"><input v-model="a.grupo" class="edit-input text-center"></td>
            <td class="col-xs-compact"><input v-model="a.subgrupo" class="edit-input text-center"></td>
            <td class="col-dni-compact"><input v-model="a.dni" class="edit-input text-center"></td>
            <td><input v-model="a.email" class="edit-input"></td>
            <td><input v-model="a.direccion" class="edit-input"></td>
            <td><input v-model="a.provincia" class="edit-input" readonly></td>
            <td><input v-model="a.localidad" class="edit-input" readonly></td>
            <td><input v-model="a.zona" class="edit-input" readonly></td>
            <td><input v-model="a.celular" class="edit-input"></td>
            <td>
              <input type="date" v-model="a.fecha_nacimiento" class="edit-input">
            </td>
            <td><input v-model="a.telefonocontacto" class="edit-input"></td>
            <td><input v-model="a.parentescocontacto" class="edit-input"></td>
            <td><input v-model="a.movilidad" class="edit-input"></td>
            <td><input v-model="a.disponibilidad_sabado" class="edit-input"></td>
            <td><input type="time" v-model="a.disponibilidad_sabado_desde" class="edit-input"></td>
            <td><input type="time" v-model="a.disponibilidad_sabado_hasta" class="edit-input"></td>
            <td><input v-model="a.disponibilidad_domingo" class="edit-input"></td>
            <td><input type="time" v-model="a.disponibilidad_domingo_desde" class="edit-input"></td>
            <td><input type="time" v-model="a.disponibilidad_domingo_hasta" class="edit-input"></td>
            <td><input v-model="a.juega_handball" class="edit-input"></td>
            <td><input v-model="a.donde_juega" class="edit-input"></td>
            <td><input v-model="a.categoria_handball" class="edit-input"></td>
            <td><textarea v-model="a.observaciones" class="edit-textarea"></textarea></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* ESTILO UNIFICADO Y RESPONSIVE */
.admin-panel { padding: 15px; background: #f8fafc; font-family: sans-serif; color: #000; min-height: 100vh; }

.header-section { 
  background: white; padding: 15px; border-radius: 8px; display: flex; 
  justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #ef4444; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); align-items: center;
}

.title { font-size: 1.1rem; font-weight: bold; margin: 0; }
.counter { font-size: 0.85rem; color: #475569; }

.header-actions { display: flex; gap: 8px; }

.btn-action { 
  border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; 
  display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s;
}

.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }
.btn-clear-checks { background: #fee2e2; color: #991b1b; } 
.btn-export { background: #10b981; color: white; }

/* TABLE CONTAINER Y SCROLL */
.table-container { 
  overflow: auto; max-height: 75vh; background: white; border-radius: 8px; border: 1px solid #e2e8f0; 
}

table { width: max-content; border-collapse: separate; border-spacing: 0; font-size: 0.85rem; }

/* STICKY HEADERS SUPERIORES */
thead tr.main-header th { 
  position: sticky; top: 0; z-index: 1000; background: #f8fafc; border-bottom: 2px solid #e2e8f0; 
}
thead tr.filter-row td { 
  position: sticky; top: 38px; z-index: 950; background: #f8fafc !important; border-bottom: 2px solid #cbd5e1;
}

/* STICKY COLUMNAS LATERALES */
.sticky-col { position: sticky !important; z-index: 10; background: white !important; border-right: 1px solid #e2e8f0 !important; }
.col-id { left: 0; width: 50px; text-align: center; }
.col-apellido { left: 50px; width: 140px; }
.col-nombre { left: 190px; width: 140px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }

thead th.sticky-col { z-index: 1100 !important; }
thead td.sticky-col { z-index: 1050 !important; }

th { padding: 10px; color: #475569; text-transform: uppercase; font-weight: 800; font-size: 0.7rem; }

.filter-input { font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; }

/* FILA INACTIVA */
.fila-inactiva td, .fila-inactiva .sticky-col { background-color: #f37d7d !important; font-weight: bold; color: #000; }

.edit-input { width: 100%; padding: 4px; border: 1px solid transparent; background: transparent; font-size: 0.85rem; }
.edit-input:focus { background: white; border-color: #3b82f6; outline: none; }

.edit-textarea { 
  width: 250px; height: 30px; border: 1px solid transparent; background: transparent; 
  font-size: 0.85rem; font-family: inherit; resize: none; padding: 4px; transition: all 0.2s;
}
.edit-textarea:focus { height: 80px; background: white; border-color: #3b82f6; outline: none; }

.status-wrapper { display: flex; align-items: center; gap: 5px; justify-content: center; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-active { background: #10b981; }
.dot-inactive { background: #ef4444; }
.select-compact { border: none; font-weight: bold; background: transparent; cursor: pointer; font-size: 0.8rem; }

.col-xs-compact { width: 70px; text-align: center; }
.col-dni-compact { width: 90px; text-align: center; }

/* MEDIA QUERIES PARA RESPONSIVE */
@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: space-between; flex-wrap: wrap; }
  .btn-action { flex: 1; justify-content: center; min-width: 45%; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; }
  .header-section { padding: 10px; }
  .title { font-size: 1rem; }
  .btn-action { font-size: 0.7rem; padding: 6px 8px; }
}
</style>
