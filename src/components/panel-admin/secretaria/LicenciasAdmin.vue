<template>
  <div class="admin-panel animate__animated animate__fadeIn">
    
    <div class="header-card shadow-sm">
      <div class="header-info text-start">
        <h2 class="header-title">Gestión de Licencias</h2>
        <span class="header-subtitle">Total: {{ licenciasFiltradas.length }} licencias</span>
      </div>
      
      <div class="header-actions">
        <button @click="limpiarFiltros" class="btn-action btn-light-gray">
          <span class="material-icons">filter_alt_off</span> <b>Filtros</b>
        </button>
        <button @click="guardarTodo" class="btn-action btn-blue" :disabled="cargando">
          <span v-if="!cargando" class="material-icons">save</span>
          <span v-else class="spinner-border spinner-border-sm me-1"></span>
          <b>Guardar</b>
        </button>
        <button @click="abrirModalNuevo" class="btn-action btn-pink">
          <span class="material-icons">person_add</span> <b>Nuevo</b>
        </button>
        <button @click="exportarExcel" class="btn-action btn-green">
          <span class="material-icons">download</span> <b>Excel</b>
        </button>
      </div>
    </div>

    <div class="table-container shadow-sm mt-3">
      <table class="custom-table w-100">
        <thead>
          <tr class="header-row">
            <th style="width: 70px;" class="text-center">ID</th>
            <th>APELLIDO</th>
            <th>NOMBRE</th>
            <th class="text-center">ESTADO</th>
            <th class="text-center">FECHA LICENCIA</th>
            <th class="text-center">ACCIONES</th>
          </tr>
          <tr class="filter-row">
            <td class="text-center">
               <button @click="obtenerLicencias" class="btn-refresh"><span class="material-icons">refresh</span></button>
            </td>
            <td><input v-model="filtros.apellido" class="filter-input text-start" placeholder="Filtrar.."></td>
            <td><input v-model="filtros.nombre" class="filter-input text-start" placeholder="Filtrar.."></td>
            <td class="px-2">
              <select v-model="filtros.estado" class="filter-input text-center">
                <option value="">TODOS</option>
                <option value="pendiente">PENDIENTE</option>
                <option value="aprobada">APROBADA</option>
                <option value="rechazada">RECHAZADA</option>
              </select>
            </td>
            <td><input v-model="filtros.fecha" class="filter-input text-center" placeholder="DD/MM/YYYY"></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lic in licenciasFiltradas" :key="lic.id">
            <td class="text-center text-muted small">#{{ lic.id }}</td>
            <td class="fw-bold">{{ lic.apellido }}</td>
            <td class="fw-bold">{{ lic.nombre }}</td>
            <td class="text-center">
              <select v-model="lic.estado" :class="['status-select', lic.estado]">
                <option value="pendiente">PENDIENTE</option>
                <option value="aprobada">APROBADA</option>
                <option value="rechazada">RECHAZADA</option>
              </select>
            </td>
            <td class="text-center">
              <input type="date" v-model="lic.fecha_licencia" class="date-input">
            </td>
            <td class="text-center">
              <div class="action-buttons-group">
                <button @click="eliminarLicencia(lic.id)" class="btn-action-icon btn-delete-row" title="Eliminar">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mostrarModalNuevo" class="modal-overlay" @click.self="mostrarModalNuevo = false">
      <div class="modal-content-custom animate__animated animate__zoomIn">
        <h4 class="fw-bold mb-4">Registrar Licencia</h4>
        <div class="mb-3 text-start">
          <label class="small fw-bold">Seleccionar Árbitro</label>
          <select v-model="nuevo.id_arbitro" class="form-select border-danger-subtle shadow-none">
            <option value="" disabled>Elegir árbitro...</option>
            <option v-for="arb in arbitrosLista" :key="arb.id" :value="arb.id">
              {{ arb.apellido }}, {{ arb.nombre }}
            </option>
          </select>
        </div>
        <div class="mb-3 text-start">
          <label class="small fw-bold">Fecha de Licencia</label>
          <input v-model="nuevo.fecha_licencia" type="date" class="form-control shadow-none">
        </div>
        <div class="d-flex gap-2 mt-4">
          <button @click="mostrarModalNuevo = false" class="btn btn-light w-100 rounded-pill">Cerrar</button>
          <button @click="crearLicenciaAction" class="btn btn-danger w-100 rounded-pill fw-bold" :disabled="!nuevo.id_arbitro || !nuevo.fecha_licencia">CREAR</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import { api } from '@/api/api';
import * as XLSX from 'xlsx';
import { useHead } from '@vueuse/head'

useHead({
  title: 'Licencias | AAAB',
  meta: [
    { name: 'description', content: 'Administra y controla las licencias de los árbitros.' },
    { property: 'og:title', content: 'Licencias | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' }
  ],
})

const notificar = inject('notificar');

const licencias = ref([]);
const licenciasOriginales = ref([]);
const arbitrosLista = ref([]);
const cargando = ref(false);
const mostrarModalNuevo = ref(false);
const nuevo = ref({ id_arbitro: '', fecha_licencia: '', estado: 'aprobada' });
const filtros = ref({ nombre: '', apellido: '', estado: '', fecha: '' });

const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

const licenciasFiltradas = computed(() => {
  return licencias.value.filter(l => {
    const matchApe = normalizar(l.apellido).includes(normalizar(filtros.value.apellido));
    const matchNom = normalizar(l.nombre).includes(normalizar(filtros.value.nombre));
    const matchEst = filtros.value.estado === '' || l.estado === filtros.value.estado;
    const matchFec = formatearFechaVista(l.fecha_licencia).includes(filtros.value.fecha);
    return matchApe && matchNom && matchEst && matchFec;
  });
});

const obtenerLicencias = async () => {
  cargando.value = true;
  const res = await api.get({ entity: 'licencias', action: 'obtenerTodasLasLicencias' });
  if (res.ok) {
    licencias.value = res.payload;
    licenciasOriginales.value = JSON.parse(JSON.stringify(res.payload));
  }
  cargando.value = false;
};

const obtenerArbitros = async () => {
  const res = await api.get({ entity: 'usuarios', action: 'obtenerUsuarios' }); 
  if (res.ok && Array.isArray(res.payload)) {
    arbitrosLista.value = res.payload.sort((a, b) => (a.apellido || '').localeCompare(b.apellido || ''));
  }
};

const guardarTodo = async () => {
  const modificadas = licencias.value.filter(lic => {
    const original = licenciasOriginales.value.find(o => o.id === lic.id);
    return original.estado !== lic.estado || original.fecha_licencia !== lic.fecha_licencia;
  });

  if (modificadas.length === 0) {
    notificar({ titulo: 'Sin cambios', mensaje: 'No detectamos modificaciones para guardar.', tipo: 'success' });
    return;
  }

  cargando.value = true;
  let errores = 0;

  for (const lic of modificadas) {
    const res = await api.post({
      entity: 'licencias',
      action: 'actualizarLicencia',
      payload: { id: lic.id, estado: lic.estado, fecha_licencia: lic.fecha_licencia }
    });
    if (!res.ok) errores++;
  }
  
  cargando.value = false;

  if (errores === 0) {
    licenciasOriginales.value = JSON.parse(JSON.stringify(licencias.value));
    notificar({ titulo: '¡Cambios Guardados!', mensaje: `Se actualizaron ${modificadas.length} registros con éxito.` });
  } else {
    notificar({ titulo: 'Error', mensaje: 'Hubo un problema al procesar los cambios.', tipo: 'danger' });
  }
};

const crearLicenciaAction = async () => {
  if(!nuevo.value.id_arbitro || !nuevo.value.fecha_licencia) return;
  const res = await api.post({ 
    entity: 'licencias', 
    action: 'crearLicencia', 
    payload: { ...nuevo.value, es_admin: true } 
  });
  if(res.ok) {
    mostrarModalNuevo.value = false;
    await obtenerLicencias();
    notificar({ titulo: '¡Licencia Creada!', mensaje: 'El registro se guardó correctamente en la base de datos.' });
    nuevo.value = { id_arbitro: '', fecha_licencia: '', estado: 'aprobada' };
  }
};

const eliminarLicencia = (id) => {
  notificar({
    titulo: '¿Eliminar Licencia?',
    mensaje: 'Esta acción es irreversible. El registro será borrado permanentemente.',
    tipo: 'danger',
    alConfirmar: async () => {
      const res = await api.post({ entity: 'licencias', action: 'eliminarLicencia', payload: { id } });
      if(res.ok) {
        licencias.value = licencias.value.filter(l => l.id !== id);
        notificar({ titulo: 'Registro Eliminado', mensaje: 'La licencia ha sido removida del sistema.', tipo: 'success' });
      }
    }
  });
};

const exportarExcel = () => {
  const data = licenciasFiltradas.value.map(l => ({
    'ID': l.id, 'Apellido': l.apellido, 'Nombre': l.nombre, 'Estado': l.estado.toUpperCase(), 'Fecha': formatearFechaVista(l.fecha_licencia)
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Licencias");
  XLSX.writeFile(wb, "Licencias_AAAB.xlsx");
};

const formatearFechaVista = (f) => f ? f.split(' ')[0].split('-').reverse().join('/') : '';
const limpiarFiltros = () => filtros.value = { nombre: '', apellido: '', estado: '', fecha: '' };
const abrirModalNuevo = () => mostrarModalNuevo.value = true;

onMounted(() => {
  obtenerLicencias();
  obtenerArbitros();
});
</script>

<style scoped>
.admin-panel { 
  width: 100%;
  max-width: 100%; 
  padding: 20px; 
  background-color: #0f172a; 
  min-height: 100vh;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
}

.header-card { 
  background: white; 
  border-radius: 8px; 
  padding: 12px 20px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border-left: 5px solid #ef4444; 
}

.header-title { font-size: 1.1rem; font-weight: bold; margin: 0; }
.header-subtitle { font-size: 0.85rem; color: #475569; }

.header-actions { display: flex; gap: 8px; }

.btn-action { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  padding: 8px 15px; 
  border-radius: 6px; 
  border: none; 
  font-size: 0.8rem; 
  cursor: pointer; 
}

.btn-light-gray { background: #f1f5f9; color: #475569; }
.btn-blue { background: #3b82f6; color: white; }
.btn-pink { background: #fee2e2; color: #ef4444; }
.btn-green { background: #10b981; color: white; }

/* MODIFICACIÓN CLAVE PARA EL SCROLL INMOVILIZADO */
.table-container { 
  background: white; 
  border-radius: 4px; 
  overflow-y: auto; /* Scroll vertical */
  max-height: calc(100vh - 150px); /* Altura dinámica para que el scroll funcione dentro del panel */
  margin-top: 15px; 
}

.custom-table { 
  width: 100%; 
  border-collapse: separate; /* Necesario para que el sticky funcione bien con los bordes */
  border-spacing: 0;
}

/* Header inmovilizado */
.custom-table thead th { 
  position: sticky;
  top: 0; /* Primera fila arriba de todo */
  z-index: 10;
  background: #f8fafc; 
  padding: 12px; 
  font-size: 0.75rem; 
  font-weight: 900; 
  border-bottom: 2px solid #e2e8f0; 
  text-transform: uppercase;
  color: #000;
}

/* Fila de filtros inmovilizada */
.custom-table thead .filter-row td {
  position: sticky;
  top: 41px; /* Se posiciona justo debajo de los títulos (ajustar según altura de th) */
  z-index: 9;
  background: #f1f5f9;
  border-bottom: 1px solid #cbd5e1;
  padding: 8px;
}

.filter-input { 
  width: 100%; 
  padding: 4px 8px; 
  border: 1px solid #cbd5e1; 
  border-radius: 4px; 
  font-size: 0.75rem; 
}

.status-select { 
  padding: 4px 10px; 
  border-radius: 20px; 
  border: none; 
  font-size: 0.7rem; 
  font-weight: 700; 
}

.status-select.aprobada { background: #dcfce7; color: #15803d; }
.status-select.pendiente { background: #fef9c3; color: #a16207; }
.status-select.rechazada { background: #fee2e2; color: #b91c1c; }

.date-input { 
  border: 1px solid #e2e8f0; 
  border-radius: 4px; 
  padding: 2px 5px; 
  font-size: 0.8rem; 
}

.action-buttons-group { display: flex; justify-content: center; gap: 5px; }

.btn-action-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: 0.2s;
}

.btn-delete-row { color: #ef4444; }
.btn-delete-row:hover { background: #fee2e2; }

.btn-refresh { 
  background: none; 
  border: none; 
  color: #64748b; 
  cursor: pointer; 
}

.modal-overlay { 
  position: fixed; 
  top:0; left:0; width:100%; height:100%; 
  background: rgba(0,0,0,0.5); 
  display: flex; align-items: center; justify-content: center; 
  z-index: 5000; 
}

.modal-content-custom { 
  background: white; padding: 25px; border-radius: 12px; 
  width: 320px; text-align: center; 
}

@media (max-width: 768px) {
  .header-card { flex-direction: column; align-items: flex-start; gap: 10px; }
  .header-actions { width: 100%; overflow-x: auto; }
  .btn-action b { display: none; } 
  .custom-table { min-width: 600px; }
}
</style>