<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';

const arbitros = ref([]);
const API_URL = 'https://arbitroshandball.com.ar/api/acciones.php'; 
const filtros = reactive({}); 

// --- LÓGICA DE FECHAS ---
const mostrarFechaArg = (fecha) => {
  if (!fecha) return '';
  const partes = fecha.split('-');
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const procesarEntradaFecha = (valor, arbitro) => {
  if (valor.length === 10) {
    const partes = valor.split('/');
    if (partes.length === 3) {
      const [d, m, y] = partes;
      arbitro.fecha_nacimiento = `${y}-${m}-${d}`;
    }
  }
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
  } catch (err) { 
    console.error("Error al cargar datos:", err); 
  }
};

const crearNuevo = () => {
  arbitros.value.unshift({
    apellido: '', nombre: '', grupo: '', subgrupo: '', dni: '', email: '', 
    direccion: '', provincia: '', localidad: '', zona: '', celular: '',
    fecha_nacimiento: '', observaciones: '',
    es_activo: 1 
  });
};

const guardarTodo = async () => {
  try {
    const datosParaEnviar = arbitros.value.filter(a => a.apellido || a.nombre);
    await axios.post(API_URL, { masivo: true, datos: datosParaEnviar });
    alert("Los cambios fueron cargados exitosamente");
    cargarDatos();
  } catch (err) {
    console.error("Fallo en el guardado masivo único:", err);
    alert("Error al realizar el guardado masivo.");
  }
};

const eliminar = async (id) => {
  if (!confirm("¿Eliminar este árbitro?")) return;
  try {
    await axios.delete(`${API_URL}?id=${id}`);
    arbitros.value = arbitros.value.filter(a => a.id !== id);
  } catch (err) { 
    console.error("Error al intentar eliminar:", err);
    alert("Error al eliminar"); 
  }
};

const arbitrosFiltrados = computed(() => {
  return arbitros.value.filter(a => {
    return Object.keys(filtros).every(key => {
      if (!filtros[key]) return true;
      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]));
    });
  });
});

const totalFiltrados = computed(() => arbitrosFiltrados.value.length);

const obtenerTooltip = (a) => {
  let mensajes = [];

  if (a.tiene_aprobada > 0) {
    mensajes.push(`LICENCIA APROBADA PARA EL: ${mostrarFechaArg(a.fecha_licencia_aprobada)}`);
  }

  if (a.tiene_rechazada > 0) {
    mensajes.push(`LICENCIA RECHAZADA PARA EL: ${mostrarFechaArg(a.fecha_licencia_rechazada)}`);
  }

  if (a.es_activo == 0) {
    mensajes.push("ÁRBITRO INACTIVO");
  }

  return mensajes.join('\n'); // El \n crea el salto de línea en el tooltip
};

onMounted(cargarDatos);
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="admin-panel animate__animated animate__fadeIn">
    <div class="header-section shadow-sm">
      <div class="title-wrapper">
        <h2 class="title">Gestión de Árbitros</h2>
        <div class="counter-badge">
          TOTAL: {{ totalFiltrados }} <small>Árbitros</small>
        </div>
      </div>

      <div class="header-actions">
        <button @click="guardarTodo" class="btn-action btn-save">
          <span class="material-icons">save</span> Guardar
        </button>
        <button @click="crearNuevo" class="btn-action btn-new">
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
          <tr>
            <th class="sticky-col col-acciones">Acciones</th>
            <th class="sticky-col col-id">ID</th>
            <th class="col-xs-compact">Activo</th> 
            <th class="sticky-col col-apellido">Apellido</th>
            <th class="sticky-col col-nombre">Nombre</th>
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
            <th class="col-dni-compact" >Sáb. Disp</th>
            <th>Sáb. Desde</th>
            <th>Sáb. Hasta</th>
            <th class="col-dni-compact" >Dom. Disp</th>
            <th>Dom. Desde</th>
            <th>Dom. Hasta</th>
            <th class="col-dni-compact" >Juega</th>
            <th>Club</th>
            <th>Cat. Juega</th>
            <th>Observaciones</th>
          </tr>
          <tr class="filter-row">
            <td class="sticky-col col-acciones"></td>
            <td class="sticky-col col-id"></td>
            <td class="col-xs-compact"><input v-model="filtros.es_activo" class="filter-input text-center" placeholder="1/0"></td>
            <td class="sticky-col col-apellido"><input v-model="filtros.apellido" class="filter-input" placeholder="Filtrar.."></td>
            <td class="sticky-col col-nombre"><input v-model="filtros.nombre" class="filter-input" placeholder="Filtrar.."></td>
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
        <tr 
  v-for="a in arbitrosFiltrados" 
  :key="a.id || Math.random()"
  :class="{ 
    'fila-licencia-aprobada': a.tiene_aprobada > 0,
    'fila-licencia-rechazada': a.tiene_aprobada == 0 && a.tiene_rechazada > 0,
    'fila-inactiva': a.es_activo == 0
  }"
  :title="obtenerTooltip(a)"
>
            <td class="sticky-col col-acciones cell-actions">
              <button @click="eliminar(a.id)" class="btn-table btn-delete" v-if="a.id" title="Eliminar">
                <span class="material-icons">delete</span>
              </button>
              <span v-else class="new-tag">NUEVO</span>
            </td>
            <td class="sticky-col col-id">{{ a.id || '-' }}</td>
            
            <td class="col-xs-compact">
  <div class="status-wrapper">
    <span :class="['status-dot', a.es_activo == 1 ? 'dot-active' : 'dot-inactive']"></span>
    <select v-model="a.es_activo" class="small-select select-compact">
      <option :value="1">SI</option>
      <option :value="0">NO</option>
    </select>
  </div>
</td>

            <td class="sticky-col col-apellido"><input v-model="a.apellido" class="edit-input"></td>
            <td class="sticky-col col-nombre"><input v-model="a.nombre" class="edit-input"></td>
            <td class="col-xs-compact"><input v-model="a.grupo" class="edit-input text-center"></td>
            <td class="col-xs-compact"><input v-model="a.subgrupo" class="edit-input text-center"></td>
            <td class="col-dni-compact"><input v-model="a.dni" class="edit-input text-center"></td>
            <td><input v-model="a.email" class="edit-input"></td>
            <td><input v-model="a.direccion" class="edit-input"></td>
            <td><input v-model="a.provincia" class="edit-input" readonly title="Se edita desde el Legajo"></td>
            <td><input v-model="a.localidad" class="edit-input" readonly title="Se edita desde el Legajo"></td>
            <td><input v-model="a.zona" class="edit-input" readonly title="Se edita desde el Legajo"></td>
            <td><input v-model="a.celular" class="edit-input"></td>
            <td>
              <input 
                type="text" 
                :value="mostrarFechaArg(a.fecha_nacimiento)" 
                @input="e => procesarEntradaFecha(e.target.value, a)"
                placeholder="DD/MM/AAAA"
                class="edit-input input-fecha-directo"
                maxlength="10"
              >
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
/* --- BASE Y CONTENEDOR PRINCIPAL --- */
.admin-panel { 
  padding: 25px; 
  background: #f8fafc; 
  font-family: 'Segoe UI', Roboto, sans-serif; 
  min-height: 100vh; 
}

.material-icons { font-size: 18px; }

/* --- CABECERA (HEADER) --- */
.header-section { 
  background: #ffffff; 
  padding: 15px 25px; 
  border-radius: 12px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 25px; 
  border: 1px solid #e2e8f0;
}

.title-wrapper { display: flex; align-items: center; gap: 15px; }
.title { font-size: 1.4rem; font-weight: 700; color: #1e293b; margin: 0; }

.counter-badge { 
  background: #1e293b; 
  color: #ffffff; 
  padding: 6px 14px; 
  border-radius: 20px; 
  font-weight: 700; 
  border: none; 
  font-size: 0.9rem; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-actions { display: flex; gap: 12px; }

/* --- BOTONES DE ACCIÓN --- */
.btn-action { 
  border: none; 
  padding: 10px 18px; 
  border-radius: 8px; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-weight: 700; 
  font-size: 0.8rem;
  transition: all 0.2s ease; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.btn-action:hover { transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.btn-save { background-color: #3b82f6; color: white; }
.btn-new { background-color: #ef4444; color: white; }
.btn-export { background-color: #10b981; color: white; }

/* --- TABLA Y CONTENEDOR --- */
.table-container { 
  overflow: auto; 
  max-height: 70vh; 
  background: white; 
  border-radius: 12px; 
  border: 1px solid #e2e8f0; 
}

table { width: max-content; border-collapse: separate; border-spacing: 0; }

/* Columnas fijas (Sticky) con sombra mejorada */
.sticky-col { 
  position: sticky !important; 
  z-index: 10; 
  background: white !important; 
  border-right: 1px solid #e2e8f0 !important;
}

.col-acciones { left: 0; width: 60px; text-align: center; }
.col-id { left: 60px; width: 40px; text-align: center; }
.col-apellido { left: 100px; width: 140px; }
.col-nombre { left: 240px; width: 140px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.15); }

/* Encabezados */
th { 
  background: #f8fafc; 
  color: #475569; 
  padding: 14px 10px; 
  position: sticky; 
  top: 0; 
  z-index: 20; 
  font-size: 0.7rem; 
  text-transform: uppercase; 
  font-weight: 800; 
  border-bottom: 2px solid #e2e8f0; 
}

th.sticky-col { z-index: 30; background: #f8fafc !important; }

/* Fila de Filtros */
.filter-row td { 
  top: 48px; 
  position: sticky; 
  z-index: 25; 
  background: #f8fafc !important; 
  padding: 8px 5px; 
  border-bottom: 2px solid #cbd5e1;
}

.filter-input { 
  font-size: 0.75rem; 
  height: 30px; 
  border: 1px solid #cbd5e1; 
  border-radius: 6px; 
  padding: 4px 8px; 
  width: 100%; 
  transition: all 0.2s; 
  background-color: #ffffff;
}

.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* --- CELDAS Y DATOS --- */
td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

/* Filas alternas para mejor lectura */
tbody tr:nth-child(even):not(.fila-licencia-aprobada):not(.fila-licencia-rechazada):not(.fila-inactiva) {
  background-color: #fafafa;
}

tbody tr:nth-child(even):not(.fila-licencia-aprobada):not(.fila-licencia-rechazada):not(.fila-inactiva) .sticky-col {
  background-color: #fafafa !important;
}

.edit-input, .small-select { 
  width: 100%; 
  padding: 6px 8px; 
  border: 1px solid transparent; 
  border-radius: 6px; 
  font-size: 0.8rem; 
  background: transparent; 
  color: #334155; 
  transition: all 0.2s; 
}

.edit-input:focus { 
  background: white; 
  border-color: #3b82f6; 
  outline: none; 
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
}

.edit-textarea { 
  width: 300px; 
  height: 32px; 
  border: 1px solid transparent; 
  border-radius: 6px; 
  font-size: 0.75rem; 
  padding: 6px; 
  resize: none; 
  background: transparent; 
  transition: all 0.2s;
}

.edit-textarea:focus { height: 100px; width: 350px; background: white; border-color: #3b82f6; outline: none; }

/* --- ESTADOS Y BADGES --- */
.btn-delete { background: #fee2e2; color: #ef4444; border: none; padding: 6px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
.btn-delete:hover { background: #fecaca; }

.new-tag { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 0.65rem; }

/* Hovers y Estados de Licencia */
/* Ajuste: Solo aplica el hover gris a filas que NO tengan estados especiales */
tbody tr:not(.fila-licencia-aprobada):not(.fila-licencia-rechazada):not(.fila-inactiva):hover td, 
tbody tr:not(.fila-licencia-aprobada):not(.fila-licencia-rechazada):not(.fila-inactiva):hover .sticky-col { 
  background-color: #f1f5f9 !important; 
}

/* --- ESTADOS ESPECIALES (FONDO SÓLIDO Y NEGRITA) --- */

/* 1. Licencia Aprobada e Inactivos (ROJO SÓLIDO) */
.fila-licencia-aprobada td, 
.fila-licencia-aprobada .sticky-col,
.fila-inactiva td, 
.fila-inactiva .sticky-col { 
  background-color: #f37d7d !important; /* Color sólido sin transparencia */
  font-weight: bold !important;
  color: #000 !important;
}

/* 2. Licencia Rechazada (AMARILLO SÓLIDO) */
.fila-licencia-rechazada td, 
.fila-licencia-rechazada .sticky-col { 
  background-color: #e6d84a !important; /* Color sólido sin transparencia */
  font-weight: bold !important;
  color: #000 !important;
}

/* Forzar que los inputs hereden el fondo sólido en estos estados */
.fila-licencia-aprobada .edit-input, 
.fila-licencia-rechazada .edit-input, 
.fila-inactiva .edit-input {
  background-color: transparent !important;
  font-weight: bold !important;
  color: #000 !important;
}


/* --- CLASES DE UTILIDAD --- */
.col-xs-compact { width: 50px; min-width: 50px; text-align: center; }
.col-dni-compact { width: 95px; min-width: 95px; text-align: center; }
.text-center { text-align: center; }

/* --- RESPONSIVE DESIGN --- */
@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: space-between; }
  .btn-action { flex: 1; justify-content: center; }
}

@media (max-width: 768px) {
  .admin-panel { padding: 15px; }
  .header-actions { flex-wrap: wrap; }
  .btn-action { min-width: 45%; }
  .title { font-size: 1.2rem; }
  .table-container { max-height: 60vh; }
}

/* Contenedor para alinear círculo y select */
.status-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

/* Estilo base del círculo */
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

/* Colores dinámicos */
.dot-active {
  background-color: #10b981; 
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.dot-inactive {
  background-color: #ef4444; 
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

/* Ajuste opcional para el select dentro del wrapper */
.select-compact {
  border: none !important;
  font-weight: bold;
  width: auto !important;
  cursor: pointer;
}
</style>
