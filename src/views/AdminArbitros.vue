<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';

const arbitros = ref([]);
const API_URL = 'https://arbitroshandball.com.ar/api/acciones.php'; 

// Objeto para filtros dinámicos (se inicializa vacío para ser flexible)
const filtros = reactive({}); 

const cargarDatos = async () => {
  try {
    const res = await axios.get(API_URL);
    arbitros.value = res.data;
  } catch (err) { 
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

const guardar = async (arbitro) => {
  try {
    const res = await axios.post(API_URL, arbitro);
    if (!arbitro.id) arbitro.id = res.data.id;
    alert("¡Guardado con éxito!");
  } catch (err) { 
    console.error(err);
    alert("Error al guardar"); 
  }
};

const eliminar = async (id) => {
  if (!confirm("¿Eliminar este árbitro?")) return;
  try {
    await axios.delete(`${API_URL}?id=${id}`);
    arbitros.value = arbitros.value.filter(a => a.id !== id);
  } catch (err) { 
    console.error(err);
    alert("Error al eliminar"); 
  }
};

// Motor de filtrado para las 27 columnas
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
        <button @click="cargarDatos" class="btn-refresh">
          <span class="material-icons">refresh</span> Recargar
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
            <th>Grupo</th><th>Subgrupo</th><th>DNI</th><th>Email</th>
            <th>Dirección</th><th>Provincia</th><th>Localidad</th><th>Zona</th>
            <th>Celular</th><th>F. Nacimiento</th><th>Tel. Contacto</th><th>Parentesco</th>
            <th>Movilidad</th><th>Sáb. Disp</th><th>Sáb. Desde</th><th>Sáb. Hasta</th>
            <th>Dom. Disp</th><th>Dom. Desde</th><th>Dom. Hasta</th><th>Juega</th>
            <th>Club</th><th>Cat. Juega</th><th>Observaciones</th>
          </tr>
          <tr class="filter-row">
            <td class="sticky-col col-acciones"></td>
            <td class="sticky-col col-id"></td>
            <td class="sticky-col col-apellido"><input v-model="filtros.apellido" placeholder="Filtrar.."></td>
            <td class="sticky-col col-nombre"><input v-model="filtros.nombre" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.grupo" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.subgrupo" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.dni" placeholder="Filtrar.."></td>
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
              <button @click="guardar(a)" class="btn-table btn-save" title="Guardar">
                <span class="material-icons">save</span>
              </button>
              <button @click="eliminar(a.id)" class="btn-table btn-delete" v-if="a.id" title="Eliminar">
                <span class="material-icons">delete</span>
              </button>
            </td>
            <td class="sticky-col col-id">{{ a.id || 'NUEVO' }}</td>
            <td class="sticky-col col-apellido"><input v-model="a.apellido"></td>
            <td class="sticky-col col-nombre"><input v-model="a.nombre"></td>
            
            <td><input v-model="a.grupo" class="small-input"></td>
            <td><input v-model="a.subgrupo" class="small-input"></td>
            <td><input v-model="a.dni"></td>
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

/* HEADER Y BOTONES DERECHA */
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.header-actions { display: flex; gap: 10px; }

/* Nuevo árbitro: Rojo, cambia a Gris al pasar el mouse */
.btn-new { 
  background-color: #dc3545; color: white; border: none; padding: 8px 15px; 
  border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: bold;
  font-size: 12px; transition: background 0.3s;
}
.btn-new:hover { background-color: #6c757d !important; }

/* Recargar: Blanco, cambia a Rojo al pasar el mouse */
.btn-refresh { 
  background: white; border: 1px solid #ccc; padding: 8px 12px; 
  border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px;
  font-size: 12px; transition: background 0.3s, color 0.3s;
}
.btn-refresh:hover { background-color: #dc3545 !important; color: white !important; border-color: #dc3545; }

/* TABLA Y COLUMNAS FIJAS */
.table-container { overflow: auto; max-height: 80vh; border: 1px solid #ddd; }
table { width: max-content; border-collapse: separate; border-spacing: 0; }

.sticky-col { 
  position: sticky !important; z-index: 10; background: white !important; 
  border-right: 1px solid #ddd !important; box-sizing: border-box;
}

/* MATEMÁTICA DE BLOQUEO */
.col-acciones { left: 0; width: 90px; }
.col-id { left: 90px; width: 50px; }
.col-apellido { left: 140px; width: 150px; }
.col-nombre { left: 290px; width: 150px; box-shadow: 3px 0 5px -2px rgba(0,0,0,0.1); }

/* ENCABEZADOS */
th { 
  background: #2c3e50; color: white; padding: 8px 10px; 
  position: sticky; top: 0; z-index: 20; font-size: 11px; text-transform: uppercase;
}
th.sticky-col { z-index: 30; background: #2c3e50 !important; }

/* FILA DE FILTROS */
.filter-row td { top: 33px; position: sticky; z-index: 25; background: #f9f9f9 !important; padding: 4px; }
.filter-row input { 
  font-size: 10px; height: 24px; background-color: #ffffff; border: 1px solid #3b82f6; padding: 2px 5px;
}

/* BOTONES TABLA */
.cell-actions { display: flex; gap: 5px; justify-content: center; align-items: center; border-bottom: none; height: 35px; }
.btn-table { border: none; padding: 4px; border-radius: 3px; cursor: pointer; color: white; display: flex; transition: background 0.3s; }
.btn-table .material-icons { font-size: 16px; }

.btn-save { background: #3b82f6; }
.btn-save:hover { background: #dc3545 !important; }

.btn-delete { background: #94a3b8; }
.btn-delete:hover { background: #dc3545 !important; }

/* CONTENIDO DE CELDAS E INPUTS */
td { padding: 4px 6px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; font-size: 11px; }

input { 
  width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 3px; 
  box-sizing: border-box; font-size: 11px; height: 28px;
}

textarea { 
  width: 180px; height: 28px; resize: none; border: 1px solid #ddd; font-size: 11px; padding: 4px;
}

.small-input { width: 45px; text-align: center; }
</style>