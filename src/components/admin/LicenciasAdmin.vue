<template>
  <div class="admin-panel animate__animated animate__fadeIn">
    
    <div v-if="mensaje.texto" :class="['alert', `alert-${mensaje.tipo}`]" class="mb-3">
       {{ mensaje.texto }}
    </div>

    <div class="header-card shadow-sm">
      <div class="header-info">
        <h2 class="header-title">Gestión de Licencias</h2>
        <span class="header-subtitle">Total: {{ licenciasFiltradas.length }} registros</span>
      </div>
      
      <div class="header-actions">
        <button @click="limpiarFiltros" class="btn-custom btn-filter">
          <span class="material-icons">filter_alt_off</span> <span>Limpiar</span>
        </button>
        <button @click="guardarCambios" class="btn-custom btn-save">
          <span class="material-icons">save</span> <span>Guardar</span>
        </button>
        <button @click="nuevaLicencia" class="btn-custom btn-new">
          <span class="material-icons">add_circle</span> <span>Nuevo</span>
        </button>
      </div>
    </div>

    <div class="table-container shadow-sm">
      <div v-if="cargando" class="text-center p-5">Cargando...</div>
      
      <table v-else class="custom-table">
        <thead>
          <tr>
            <th style="width: 80px;">ID</th>
            <th>APELLIDO</th>
            <th>NOMBRE</th>
            <th class="text-center">ESTADO</th>
            <th>FECHA LICENCIA</th>
            <th class="text-center">ACCIONES</th>
          </tr>
          <tr class="filter-row">
            <td></td>
            <td><input v-model="filtros.apellido" placeholder="Filtrar.." class="filter-input"></td>
            <td><input v-model="filtros.nombre" placeholder="Filtrar.." class="filter-input"></td>
            <td>
              <select v-model="filtros.estado" class="filter-input">
                <option value="">TODOS</option>
                <option value="aprobada">APROBADA</option>
                <option value="rechazada">RECHAZADA</option>
                <option value="pendiente">PENDIENTE</option>
              </select>
            </td>
            <td></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lic in licenciasFiltradas" :key="lic.id">
            <td class="text-muted">#{{ lic.id }}</td>
            <td class="fw-bold">{{ lic.apellido }}</td>
            <td class="fw-bold">{{ lic.nombre }}</td>
            <td class="text-center">
              <select v-model="lic.estado" :class="['status-select', lic.estado]">
                <option value="pendiente">PENDIENTE</option>
                <option value="aprobada">APROBADA</option>
                <option value="rechazada">RECHAZADA</option>
              </select>
            </td>
            <td>
              <input type="date" v-model="lic.fecha_licencia" class="date-input">
            </td>
            <td class="text-center">
              <button @click="eliminarLicencia(lic.id)" class="btn-delete">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Administración de Licencias | AAAB',
  meta: [{ name: 'description', content: 'Panel de control para gestionar licencias de árbitros.' }],
})

// --- ESTADO ---
const licencias = ref([]);
const cargando = ref(false);
const mensaje = ref({ texto: '', tipo: '' });

const filtros = ref({
  nombre: '',
  apellido: '',
  estado: ''
});

// --- FUNCIÓN DE NORMALIZACIÓN ---
// Convierte "Árbitro" en "arbitro"
const normalizar = (texto) => {
  if (!texto) return '';
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Elimina tildes y diéresis
};

// --- PROPIEDADES COMPUTADAS (FILTRADO MEJORADO) ---
const licenciasFiltradas = computed(() => {
  return licencias.value.filter(lic => {
    // Normalizamos tanto el valor de la tabla como el valor escrito en el buscador
    const nombreLic = normalizar(lic.nombre);
    const nombreFiltro = normalizar(filtros.value.nombre);
    
    const apellidoLic = normalizar(lic.apellido);
    const apellidoFiltro = normalizar(filtros.value.apellido);

    const matchNombre = nombreLic.includes(nombreFiltro);
    const matchApellido = apellidoLic.includes(apellidoFiltro);
    const matchEstado = filtros.value.estado === '' || lic.estado === filtros.value.estado;

    return matchNombre && matchApellido && matchEstado;
  });
});

// --- RESTO DE TUS MÉTODOS ---
const obtenerTodasLasLicencias = async () => {
  cargando.value = true;
  try {
    const res = await api.get({
      entity: 'licencias',
      action: 'nosequeponer', // Recuerda cambiar esto por tu acción real
      payload: {} 
    });
    licencias.value = res.payload || [];
  } catch (err) {
    console.error("Error al cargar licencias:", err);
    mensaje.value = { texto: "Error al conectar con la base de datos.", tipo: 'danger' };
  } finally {
    cargando.value = false;
  }
};

const guardarCambios = async () => {
  mensaje.value = { texto: "Los cambios se guardaron correctamente", tipo: 'success' };
  console.log("Datos a enviar:", licencias.value);
};

const eliminarLicencia = async (id) => {
  if (!confirm('¿Estás seguro de eliminar esta licencia?')) return;
  
  try {
    const res = await api.post({
      entity: 'licencias',
      action: 'nosequeponer',
      payload: { id }
    });
    if (res.ok) {
      licencias.value = licencias.value.filter(l => l.id !== id);
    }
  } catch (err) {
    console.error("Error al eliminar:", err);
  }
};

const limpiarFiltros = () => {
  filtros.value = { nombre: '', apellido: '', estado: '' };
};

const nuevaLicencia = () => {
  alert("aun no implementado");
};

onMounted(obtenerTodasLasLicencias);
</script>


<style scoped>
.admin-panel {
  padding: 20px;
  background-color: #0f172a; /* Fondo oscuro como el de tu imagen */
  min-height: 100vh;
}

/* --- CABECERA ESTILO GESTIÓN --- */
.header-card {
  background: white;
  border-radius: 12px;
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-left: 5px solid #ef4444; /* Línea roja lateral */
}

.header-title {font-family: sans-serif; font-size: 1.1rem; font-weight: bold; margin: 0; }

.header-subtitle {
  color: #475569;
  font-size: 0.9rem;
}

/* --- BOTONES --- */
.header-actions {
  display: flex;
  gap: 10px;
}

.btn-custom {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  transition: 0.2s;
  cursor: pointer;
}
.alert {
  padding: 10px;
  border-radius: 8px;
  color: white;
  background: #ef4444; /* por defecto danger */
}
.alert-success { background: #22c55e; }

.btn-delete {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
}

.date-input {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 4px;
}

.btn-filter { background: #e2e8f0; color: #1e293b; }
.btn-save { background: #3b82f6; color: white; }
.btn-new { background: #fee2e2; color: #ef4444; }

/* --- TABLA --- */
.table-container {
  background: white;
  border-radius: 12px;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  background: #f8fafc;
  padding: 12px 15px;
  font-size: 0.75rem;
  color: #475569;
  text-transform: uppercase;
  border-bottom: 2px solid #e2e8f0;
}

.custom-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

/* Inputs de Filtro */
.filter-input {
  width: 100%;
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.8rem;
}

/* Select de Estado */
.status-select {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  border: 1px solid transparent;
}
.status-select.aprobada { background: #dcfce7; color: #166534; }
.status-select.rechazada { background: #fee2e2; color: #991b1b; }
.status-select.pendiente { background: #fef9c3; color: #854d0e; }

/* --- RESPONSIVE --- */
@media (max-width: 768px) {
  .header-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    overflow-x: auto;
  }
  
  .btn-custom span:not(.material-icons) {
    display: none; /* En móviles ocultamos el texto y dejamos iconos */
  }
}
/* --- ESTILOS EXISTENTES --- */
.btn-icon { font-size: 18px; vertical-align: middle; }
.header-admin { border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
.badge { font-weight: 600; letter-spacing: 0.5px; }

/* --- NUEVOS ESTILOS RESPONSIVE --- */

/* 1. Contenedor de tabla con scroll suave en tablets */
.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Mejora el scroll en iPhone/iPad */
  background: white;
  border-radius: 8px;
}

th { font-family: 'poppins', sans-serif; font-size: 0.7rem; color: #475569; text-transform: uppercase; font-weight: 800; }

/* 2. Ajustes para Pantallas Medianas (Tablets) */
@media (max-width: 992px) {
  .header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  /* Reducimos el tamaño de fuente para que entre más info */
  table {
    font-size: 0.85rem;
  }
}

/* 3. Ajustes Críticos para Móviles (Smartphones) */
@media (max-width: 768px) {
  /* Ocultamos la tabla compleja en móviles muy chicos si prefieres usar el diseño de Cards */
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }

  /* Panel de filtros responsive */
  .mobile-filter-panel {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
  }

  .filter-grid-mobile {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Dos columnas de inputs */
    gap: 10px;
  }

  .mobile-select-group {
    display: flex;
    flex-direction: column;
    grid-column: span 2; /* Los select ocupan todo el ancho */
  }

  input, select {
    width: 100%;
    height: 45px; /* Más fáciles de tocar con el dedo */
    font-size: 16px !important; /* Evita que iOS haga zoom automático al enfocar */
  }

  /* Botones de acción en móvil */
  .btn-action {
    padding: 10px;
    flex: 1;
    justify-content: center;
  }

  .btn-text {
    display: none; /* Ocultamos texto, dejamos solo iconos para ahorrar espacio */
  }
}

/* 4. Estilos de las "Cards" de Árbitros (El diseño que ya tenías al final del template) */
.card-arbitro {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  border-left: 5px solid #ccc;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.fila-roja { border-left-color: #dc3545 !important; background-color: #fff5f5; }
.fila-amarilla { border-left-color: #ffc107 !important; background-color: #fffdf2; }
.fila-des { border-left-color: #0d6efd !important; background-color: #f0f7ff; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.card-body p {
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: #444;
}

.btn-wa-mobile {
  width: 100%;
  background: #25D366;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>