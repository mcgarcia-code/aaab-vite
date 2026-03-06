<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';

const arbitros = ref([]);
const API_URL = 'https://arbitroshandball.com.ar/api/acciones.php'; 
const filtros = reactive({}); 

const cargarDatos = async () => {
  try {
    const res = await axios.get(API_URL);
    arbitros.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) { 
    // Usamos 'err' para que ESLint no proteste y para ver el error real en consola
    console.error("Error al cargar datos:", err); 
  }
};

const crearNuevo = () => {
  arbitros.value.unshift({
    apellido: '', nombre: '', grupo: '', subgrupo: '', dni: '', email: '', 
    direccion: '', provincia: '', localidad: '', zona: '', celular: '',
    observaciones: ''
  });
};

const guardarTodo = async () => {
  try {
    // Filtramos para enviar solo los registros que tienen datos
    const datosParaEnviar = arbitros.value.filter(a => a.apellido || a.nombre);
    
    // Enviamos TODO el array en una sola petición POST
    await axios.post(API_URL, { masivo: true, datos: datosParaEnviar });
    
    alert("Los cambios fueron cargados exitosamente");
    cargarDatos();
  } catch (err) {
    // Aquí usamos 'err' para que ESLint no proteste
    console.error("Fallo en el guardado masivo único:", err);
    alert("Error al realizar el guardado masivo. Revisa la consola.");
  }
};

const eliminar = async (id) => {
  if (!confirm("¿Eliminar este árbitro?")) return;
  try {
    await axios.delete(`${API_URL}?id=${id}`);
    arbitros.value = arbitros.value.filter(a => a.id !== id);
  } catch (err) { 
    // Usamos 'err' aquí también
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

onMounted(cargarDatos);
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="admin-panel">
    <div class="header-section">
      <h2 class="title">Gestión de Base de Datos - Árbitros</h2>
      
      <div class="header-actions">
        <button @click="guardarTodo" class="btn-save-all">
          <span class="material-icons">save</span> Guardar Cambios
        </button>
        <button @click="crearNuevo" class="btn-new">
          <span class="material-icons">person_add</span> Agregar Nuevo Árbitro
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
            <td><input v-model="filtros.email" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.direccion" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.provincia" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.localidad" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.zona" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.celular" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.fecha_nacimiento" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.telefonocontacto" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.parentescocontacto" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.movilidad" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.disponibilidad_sabado" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.disponibilidad_sabado_desde" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.disponibilidad_sabado_hasta" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.disponibilidad_domingo" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.disponibilidad_domingo_desde" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.disponibilidad_domingo_hasta" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.juega_handball" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.donde_juega" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.categoria_handball" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.observaciones" placeholder="Filtrar.."></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in arbitrosFiltrados" :key="a.id || Math.random()">
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
            <td><input type="date" v-model="a.fecha_nacimiento"></td>
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

td { padding: 3px 5px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-size: 11px; }
input { width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 2px; font-size: 11px; height: 26px; }
textarea { width: 150px; height: 26px; resize: none; border: 1px solid #ddd; font-size: 11px; }

.btn-delete { background: #94a3b8; color: white; border: none; padding: 4px; border-radius: 3px; cursor: pointer; display: flex; }
.btn-delete:hover { background: #dc3545; }
.new-tag { color: #27ae60; font-weight: bold; font-size: 9px; }
</style>