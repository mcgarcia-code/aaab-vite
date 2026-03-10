<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';

const arbitros = ref([]);
const API_URL = 'https://arbitroshandball.com.ar/api/acciones.php'; 
const filtros = reactive({}); 

// --- LÓGICA DE FECHAS (Visualización y Edición) ---
const mostrarFechaArg = (fecha) => {
  if (!fecha) return '';
  // Si la fecha viene de la DB como 1984-07-05, la mostramos como 05/07/1984
  const partes = fecha.split('-');
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};


const procesarEntradaFecha = (valor, arbitro) => {
  // Solo procesamos si el usuario terminó de escribir (10 caracteres: DD/MM/AAAA)
  if (valor.length === 10) {
    const partes = valor.split('/');
    if (partes.length === 3) {
      const [d, m, y] = partes;
      // Guardamos el formato ISO que el hosting necesita (YYYY-MM-DD)
      arbitro.fecha_nacimiento = `${y}-${m}-${d}`;
    }
  }
};

const exportarExcel = () => {
  // Mapeamos los datos para que el Excel salga con la fecha en formato Argentino
  const datosParaExcel = arbitrosFiltrados.value.map(a => ({
    ...a,
    fecha_nacimiento: mostrarFechaArg(a.fecha_nacimiento)
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
    fecha_nacimiento: '', observaciones: ''
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
      return String(a[key] || "").toLowerCase().includes(filtros[key].toLowerCase());
    });
  });
});

const totalFiltrados = computed(() => arbitrosFiltrados.value.length);

onMounted(cargarDatos);
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="admin-panel">
    <div class="header-section">
      <h2 class="title">Gestión de Base de Datos - Árbitros</h2>

      <div class="counter-badge">
        Total Árbitros: <strong>{{ totalFiltrados }}</strong>
      </div>

      <div class="header-actions">
        <button @click="guardarTodo" class="btn-save-all">
          <span class="material-icons">save</span> Guardar Cambios
        </button>
        <button @click="crearNuevo" class="btn-new">
          <span class="material-icons">person_add</span> Agregar Nuevo Árbitro
        </button>
        <button @click="exportarExcel" class="btn-export">
          <span class="material-icons">download</span> Exportar Excel
        </button>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="sticky-col col-acciones">Acciones</th>
            <th class="sticky-col col-id">ID</th>
            <th class="sticky-col col-apellido">Apellido</th>
            <th class="sticky-col col-nombre">Nombre</th>
            <th class="col-xs">Grupo</th>
            <th class="col-xs">Subg.</th>
            <th class="col-dni">DNI</th>
            <th>Email</th><th>Dirección</th><th>Provincia</th><th>Localidad</th><th>Zona</th>
            <th>Celular</th><th>F. Nacimiento</th><th>Tel. Contacto</th><th>Parentesco</th>
            <th>Movilidad</th><th>Sáb. Disp</th><th>Sáb. Desde</th><th>Sáb. Hasta</th>
            <th>Dom. Disp</th><th>Dom. Desde</th><th>Dom. Hasta</th><th>Juega</th>
            <th>Club</th><th>Cat. Juega</th><th>Observaciones</th>
          </tr>
          <tr class="filter-row">
            <td class="sticky-col col-acciones"></td>
            <td class="sticky-col col-id"></td>
            <td class="sticky-col col-apellido"><input v-model="filtros.apellido" placeholder=".."></td>
            <td class="sticky-col col-nombre"><input v-model="filtros.nombre" placeholder=".."></td>
            <td class="col-xs"><input v-model="filtros.grupo"></td>
            <td class="col-xs"><input v-model="filtros.subgrupo"></td>
            <td class="col-dni"><input v-model="filtros.dni"></td>
            <td><input v-model="filtros.email" placeholder=".."></td>
            <td><input v-model="filtros.direccion" placeholder=".."></td>
            <td><input v-model="filtros.provincia" placeholder=".."></td>
            <td><input v-model="filtros.localidad" placeholder=".."></td>
            <td><input v-model="filtros.zona" placeholder=".."></td>
            <td><input v-model="filtros.celular" placeholder=".."></td>
            <td><input v-model="filtros.fecha_nacimiento" placeholder=".."></td>
            <td><input v-model="filtros.telefonocontacto" placeholder=".."></td>
            <td><input v-model="filtros.parentescocontacto" placeholder=".."></td>
            <td><input v-model="filtros.movilidad" placeholder=".."></td>
            <td><input v-model="filtros.disponibilidad_sabado" placeholder=".."></td>
            <td><input v-model="filtros.disponibilidad_sabado_desde" placeholder=".."></td>
            <td><input v-model="filtros.disponibilidad_sabado_hasta" placeholder=".."></td>
            <td><input v-model="filtros.disponibilidad_domingo" placeholder=".."></td>
            <td><input v-model="filtros.disponibilidad_domingo_desde" placeholder=".."></td>
            <td><input v-model="filtros.disponibilidad_domingo_hasta" placeholder=".."></td>
            <td><input v-model="filtros.juega_handball" placeholder=".."></td>
            <td><input v-model="filtros.donde_juega" placeholder=".."></td>
            <td><input v-model="filtros.categoria_handball" placeholder=".."></td>
            <td><input v-model="filtros.observaciones" placeholder=".."></td>
          </tr>
        </thead>
        <tbody>
         <tr 
            v-for="a in arbitrosFiltrados" 
            :key="a.id || Math.random()"
            :class="{ 
            'fila-licencia-aprobada': a.tiene_aprobada > 0,
            'fila-licencia-rechazada': a.tiene_aprobada == 0 && a.tiene_rechazada > 0 
            }"
          >
    <td class="sticky-col col-acciones cell-actions">
      <button @click="eliminar(a.id)" class="btn-table btn-delete" v-if="a.id" title="Eliminar">
        <span class="material-icons">delete</span>
      </button>
      <span v-else class="new-tag">NUEVO</span>
    </td>
            <td class="sticky-col col-id">{{ a.id || '-' }}</td>
            <td class="sticky-col col-apellido"><input v-model="a.apellido"></td>
            <td class="sticky-col col-nombre"><input v-model="a.nombre"></td>
            <td class="col-xs"><input v-model="a.grupo" class="small-input"></td>
            <td class="col-xs"><input v-model="a.subgrupo" class="small-input"></td>
            <td class="col-dni"><input v-model="a.dni"></td>
            <td><input v-model="a.email"></td>
            <td><input v-model="a.direccion"></td>
            <td><input v-model="a.provincia"></td>
            <td><input v-model="a.localidad"></td>
            <td><input v-model="a.zona"></td>
            <td><input v-model="a.celular"></td>
            <td>
              <input 
                type="text" 
                :value="mostrarFechaArg(a.fecha_nacimiento)" 
                @input="e => procesarEntradaFecha(e.target.value, a)"
                placeholder="DD/MM/AAAA"
                class="input-fecha-directo"
                maxlength="10"
              >
            </td>
            <td><input v-model="a.telefonocontacto"></td>
            <td><input v-model="a.parentescocontacto"></td>
            <td><input v-model="a.movilidad"></td>
            <td><input v-model="a.disponibilidad_sabado"></td>
            <td><input type="time" v-model="a.disponibilidad_sabado_desde"></td>
            <td><input type="time" v-model="a.disponibilidad_sabado_hasta"></td>
            <td><input v-model="a.disponibilidad_domingo"></td>
            <td><input type="time" v-model="a.disponibilidad_domingo_desde"></td>
            <td><input type="time" v-model="a.disponibilidad_domingo_hasta"></td>
            <td><input v-model="a.juega_handball"></td>
            <td><input v-model="a.donde_juega"></td>
            <td><input v-model="a.categoria_handball"></td>
            <td><textarea v-model="a.observaciones"></textarea></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-panel { padding: 15px; background: #fff; font-family: sans-serif; }
.material-icons { font-size: 18px; }

.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.header-actions { display: flex; gap: 10px; }

.btn-new, .btn-save-all { 
  background-color: #dc3545; color: white; border: none; padding: 8px 15px; 
  border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: bold; font-size: 11px;
}
.btn-save-all { background-color: #3b82f6; transition: background 0.3s; }
.btn-save-all:hover { background-color: #2c3e50; }
.btn-new:hover { background-color: #2c3e50; }

.table-container { 
  overflow: auto; 
  max-height: 75vh; 
  border: 1px solid #ddd; 
  width: 100%;
}

table { width: max-content; border-collapse: separate; border-spacing: 0; }

.sticky-col { position: sticky !important; z-index: 10; background: white !important; border-right: 1px solid #ddd !important; }
.col-acciones { left: 0; width: 80px; }
.col-id { left: 80px; width: 45px; }
.col-apellido { left: 125px; width: 140px; }
.col-nombre { left: 265px; width: 140px; box-shadow: 3px 0 5px -2px rgba(0,0,0,0.1); }

.col-xs { width: 45px; min-width: 45px; }
.col-dni { width: 85px; min-width: 85px; }

th { background: #2c3e50; color: white; padding: 8px; position: sticky; top: 0; z-index: 20; font-size: 10px; text-transform: uppercase; }
th.sticky-col { z-index: 30; background: #2c3e50 !important; }

.filter-row td { top: 31px; position: sticky; z-index: 25; background: #f9f9f9 !important; padding: 3px; }
.filter-row input { font-size: 10px; height: 22px; border: 1px solid #3b82f6; }

td { 
  padding: 3px 5px; 
  border-bottom: 1px solid #eee; 
  border-right: 1px solid #eee; 
  font-size: 11px;
  vertical-align: top;
}

input { width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 2px; font-size: 11px; height: 26px; }

.input-fecha-directo {
  width: 100px;
  text-align: center;
  border: 1px solid #ddd; /* Ahora es gris como los demás */
  font-weight: normal;    /* Le quité el negrita para que sea idéntico */
  color: inherit;
  background: white;
}

textarea { 
  width: 500px; 
  min-height: 40px; 
  height: auto; 
  resize: vertical; 
  border: 1px solid #ddd; 
  font-size: 11px;
  padding: 4px;
  display: block;
}

textarea:focus { 
  width: 350px; 
  height: 120px; 
  border-color: #3b82f6; 
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
  overflow-y: auto; 
  outline: none; 
  position: relative;
  z-index: 100; 
}

.btn-delete { background: #94a3b8; color: white; border: none; padding: 4px; border-radius: 3px; cursor: pointer; display: flex; }
.btn-delete:hover { background: #dc3545; }
.new-tag { color: #27ae60; font-weight: bold; font-size: 9px; }

/* Filas Intercaladas */
tbody tr:nth-child(odd) td {
  background-color: #e2e8f0; 
  border-bottom: 1px solid #cbd5e1;
}
tbody tr:nth-child(odd) .sticky-col {
  background-color: #e2e8f0 !important;
  border-right: 1px solid #cbd5e1 !important;
}
tbody tr:nth-child(even) td,
tbody tr:nth-child(even) .sticky-col {
  background-color: #ffffff !important;
}

/* Hover Effect */
tbody tr:hover td, 
tbody tr:hover .sticky-col {
  background-color: #5a8fe5 !important; 
  color: white;
}
tbody tr:hover input {
  background-color: white !important;
  color: #000;
}

.counter-badge {
  background: #f1f5f9;
  padding: 8px 15px;
  border-radius: 4px;
  color: #2c3e50;
  font-weight: bold;
  border: 1px solid #cbd5e1;
}

.btn-export {
  background-color: #27ae60; 
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  font-size: 11px;
}

/* --- ESTILOS PARA LICENCIAS --- */

/* 1. ROJO: Licencia Aprobada (No disponible para dirigir) */
.fila-licencia-aprobada td, 
.fila-licencia-aprobada .sticky-col {
  background-color: #fee2e2 !important; 
  border-bottom: 1px solid #ef4444 !important;
}
.fila-licencia-aprobada input, 
.fila-licencia-aprobada textarea {
  background-color: #fff1f1 !important;
  color: #991b1b !important;
  font-weight: bold;
}
.fila-licencia-aprobada:hover td {
  background-color: #fecaca !important;
}

/* 2. AMARILLO: Licencia Rechazada (Disponible, pero avisó tarde) */
.fila-licencia-rechazada td, 
.fila-licencia-rechazada .sticky-col {
  background-color: #fef9c3 !important; /* Amarillo suave */
  border-bottom: 1px solid #eab308 !important;
}
.fila-licencia-rechazada input, 
.fila-licencia-rechazada textarea {
  background-color: #fefce8 !important;
  color: #854d0e !important;
  font-weight: bold;
}
.fila-licencia-rechazada:hover td {
  background-color: #fef08a !important;
}
</style>