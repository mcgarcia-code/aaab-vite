<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="full-screen-wrapper">
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
          <button @click="guardarTodo" class="btn-action btn-blue" :disabled="cargando">
            <span v-if="!cargando" class="material-icons">save</span>
            <span v-else class="spinner-border spinner-border-sm me-1"></span>
            <b>Guardar</b>
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
              <th class="col-xs-compact">Rol</th>
              <th class="col-xs-compact">Apto Med.</th>
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
              <td class="col-xs-compact">
                <select v-model="filtros.rol" class="filter-input">
                  <option value="">Todos</option>
                  <option :value="0">Ninguno</option>
                  <option :value="1">Árbitro</option>
                  <option :value="2">Observador</option>
                  <option :value="4">Coordinador</option>
                </select>
              </td>
              <td class="col-xs-compact"><input v-model="filtros.apto_medico" class="filter-input text-center" placeholder="SI/NO"></td> 
              <td class="col-xs-compact"><input v-model="filtros.grupo" class="filter-input text-center"></td>
              <td class="col-xs-compact"><input v-model="filtros.subgrupo" class="filter-input text-center"></td>
              <td class="col-dni-compact"><input v-model="filtros.dni" class="filter-input text-center"></td>
              <td><input v-model="filtros.email" class="filter-input"></td>
              <td><input v-model="filtros.direccion" class="filter-input"></td>
              <td><selProvincia v-model="filtros.provincia" :provincias="provincias" class="filter-input" /></td>
              <td><selLocalidad v-model="filtros.localidad" :localidades="localidadesFiltradas" class="filter-input" /></td>
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
            <tr v-for="a in arbitrosPaginados" :key="a.id || a.tempId" :class="{ 'fila-inactiva': a.es_activo == 0 }">
              <td class="sticky-col col-id">{{ a.id || 'NUEVO' }}</td>
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
              <td class="col-xs-compact">
                <select v-model="a.rol" class="small-select select-compact fw-bold">
                  <option :value="1">Árbitro</option>
                  <option :value="2">Observador</option>
                  <option :value="4">Coordinador</option>
                  <option :value="0">Ninguno</option>
                </select>
              </td>
              <td :class="[{ 'inactivo': !a.apto_medico }, 'text-center']">
                <input type="checkbox" v-model="a.apto_medico" @change="actualizarAptoFisico(a)">
              </td>
              <td class="col-xs-compact"><input v-model="a.grupo" class="edit-input text-center"></td>
              <td class="col-xs-compact"><input v-model="a.subgrupo" class="edit-input text-center"></td>
              <td class="col-dni-compact"><input v-model="a.dni" class="edit-input text-center"></td>
              <td><input v-model="a.email" class="edit-input"></td>
              <td><input v-model="a.direccion" class="edit-input"></td>
              
              <!-- Provincia Editable -->
              <td>
                <selProvincia v-model="a.provincia" :provincias="provincias" class="small-select" />
              </td>

              <!-- Localidad Editable -->
              <td>
                <selLocalidad 
                  v-model="a.localidad" 
                  :localidades="localidades.filter(l => l.provincia_id == a.provincia)" 
                  class="small-select" 
                />
              </td>

              <td><input v-model="a.zona" class="edit-input"></td>
              <td><input v-model="a.celular" class="edit-input"></td>
              <td>
                <div class="date-custom-wrapper" :data-date="a.fecha_nacimiento ? mostrarFechaArg(a.fecha_nacimiento) : ''">
                  <input type="date" v-model="a.fecha_nacimiento" class="edit-input input-fecha-nativa">
                </div>
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

      <div class="paginacion">
        <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
        <span class="paginacion-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas">Siguiente</button>
      </div>
    </div>

    <!-- MODAL EXCEL -->
    <div v-if="mostrarModalExcel" class="modal-overlay-exito animate__animated animate__fadeIn">
      <div class="modal-content-exito animate__animated animate__zoomIn" style="max-width: 750px;">
        <div class="icon-circle-exito bg-success-light">
          <span class="material-icons">description</span>
        </div>
        <h4 class="fw-bold mt-3">Exportar Listado</h4>
        <p class="text-muted small mb-3">Marcá las columnas que querés incluir en el Excel</p>
        <div class="row g-2 text-start my-3" style="max-height: 250px; overflow-y: auto; background: #f8fafc; padding: 15px; border-radius: 20px;">
          <div v-for="col in columnasExcel" :key="col.id" class="col-6">
            <div class="d-flex align-items-center gap-2 p-1">
              <input type="checkbox" v-model="col.visible" :id="'col-'+col.id" style="width:18px; height:18px; cursor:pointer;">
              <label :for="'col-'+col.id" class="mb-0 small cursor-pointer" style="color: #1e293b;">{{ col.label }}</label>
            </div>
          </div>
        </div>
        <div class="d-flex gap-2 justify-content-center mt-4">
          <button @click="mostrarModalExcel = false" class="btn btn-light rounded-pill px-4 fw-bold">CANCELAR</button>
          <button @click="ejecutarDescargaExcel" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm">DESCARGAR</button>
        </div>
      </div>
    </div>

    <!-- MODAL ALTA -->
    <div v-if="mostrarModalAlta" class="modal-overlay-exito animate__animated animate__fadeIn">
      <div class="modal-content-exito animate__animated animate__zoomIn" style="max-width: 850px; width: 95%;">
        <div class="icon-circle-exito bg-success-light">
          <span class="material-icons">person_add</span>
        </div>
        <h4 class="fw-bold mt-3">Registrar Nuevo Árbitro</h4>
        <div class="row g-3 text-start mt-3" style="max-height: 60vh; overflow-y: auto; padding: 15px;">
          <div class="col-md-4"><label class="small fw-bold">Apellido *</label><input v-model="nuevoA.apellido" class="filter-input"></div>
          <div class="col-md-4"><label class="small fw-bold">Nombre *</label><input v-model="nuevoA.nombre" class="filter-input"></div>
          <div class="col-md-4"><label class="small fw-bold">DNI</label><input v-model="nuevoA.dni" class="filter-input"></div>
          <div class="col-md-6"><label class="small fw-bold">Email (Usuario) *</label><input v-model="nuevoA.email" class="filter-input"></div>
          <div class="col-md-6"><label class="small fw-bold">Password *</label><input v-model="nuevoA.password" type="text" class="filter-input"></div>
          <div class="col-md-4">
            <label class="small fw-bold">Rol</label>
            <select v-model="nuevoA.rol" class="filter-input">
              <option :value="1">Árbitro</option>
              <option :value="2">Observador</option>
              <option :value="4">Coordinador</option>
            </select>
          </div>
          <div class="col-md-4"><label class="small fw-bold">Provincia</label><selProvincia v-model="nuevoA.provincia" :provincias="provincias" class="filter-input" /></div>
          <div class="col-md-4"><label class="small fw-bold">Localidad</label><selLocalidad v-model="nuevoA.localidad" :localidades="localidades.filter(l => l.provincia_id == nuevoA.provincia)" class="filter-input" /></div>
        </div>
        <div class="d-flex gap-2 justify-content-center mt-4">
          <button @click="mostrarModalAlta = false" class="btn btn-light rounded-pill px-4 fw-bold">CANCELAR</button>
          <button @click="confirmarAlta" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" :disabled="cargando">CREAR ÁRBITRO</button>
        </div>
      </div>
    </div>

  </div>
</template>


<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api' 
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'
import selLocalidad from '@/components/select/selLocalidad.vue'
import selProvincia from '@/components/select/selProvincia.vue'

useHead({
  title: 'Legajos | AAAB',
  meta: [
    { name: 'description', content: 'Gestión de árbitros registrados en la AAAB.' }
  ],
});

const notificar = inject('notificar');

const arbitros = ref([]);
const arbitrosOriginales = ref([]); 
const filtros = reactive({
  rol: '' 
}); 
const cargando = ref(false);
const provincias = ref([])
const localidades = ref([])
const paginaActual = ref(1)
const registrosPorPagina = 10;

const obtenerNombreRol = (bitRol) => {
  const roles = {
    0: 'Ninguno',
    1: 'Árbitro',
    2: 'Observador',
    4: 'Coordinador'
  };
  return roles[bitRol] || 'Desconocido';
};

const limpiarFiltros = () => {
  Object.keys(filtros).forEach(key => filtros[key] = '');
};

const mostrarFechaArg = (fecha) => {
  if (!fecha) return '';
  const partes = fecha.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

const normalizarTexto = (valor) => {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const exportarExcel = () => {
  mostrarModalExcel.value = true;
};

const mostrarModalExcel = ref(false);
const columnasExcel = ref([
  { id: 'apellido', label: 'Apellido', visible: true },
  { id: 'nombre', label: 'Nombre', visible: true },
  { id: 'dni', label: 'DNI', visible: true },
  { id: 'rol', label: 'Rol', visible: true }, 
  { id: 'grupo', label: 'Grupo', visible: true },
  { id: 'subgrupo', label: 'Subgrupo', visible: true },
  { id: 'es_activo', label: 'Estado', visible: false },
  { id: 'apto_medico', label: 'Apto Médico', visible: false },
  { id: 'email', label: 'Email', visible: false },
  { id: 'direccion', label: 'Dirección', visible: false },
  { id: 'nombre_provincia', label: 'Provincia', visible: false },
  { id: 'nombre_localidad', label: 'Localidad', visible: false },
  { id: 'zona', label: 'Zona', visible: false },
  { id: 'celular', label: 'Celular', visible: false },
  { id: 'fecha_nacimiento', label: 'F. Nacimiento', visible: false },
  { id: 'telefonocontacto', label: 'Tel. Contacto', visible: false },
  { id: 'parentescocontacto', label: 'Parentesco', visible: false },
  { id: 'movilidad', label: 'Movilidad', visible: false },
  { id: 'disponibilidad_sabado', label: 'Sáb. Disp.', visible: false },
  { id: 'disponibilidad_sabado_desde', label: 'Sáb. Desde', visible: false },
  { id: 'disponibilidad_sabado_hasta', label: 'Sáb. Hasta.', visible: false },
  { id: 'disponibilidad_domingo', label: 'Dom. Disp.', visible: false },
  { id: 'disponibilidad_domingo_desde', label: 'Dom. Desde', visible: false },
  { id: 'disponibilidad_domingo_hasta', label: 'Dom. Hasta', visible: false },
  { id: 'juega_handball', label: 'Juega', visible: false },
  { id: 'donde_juega', label: 'Club', visible: false },
  { id: 'categoria_handball', label: 'Cat. Juega', visible: false },
  { id: 'observaciones', label: 'Observaciones', visible: false },
]);

const mostrarModalAlta = ref(false);
const nuevoA = ref({
  apellido: '', nombre: '', dni: '', email: '', password: '', 
  rol: 1, provincia: '', localidad: '', grupo: '', subgrupo: '', celular: '', es_activo: 1
});


const ejecutarDescargaExcel = () => {
  const columnasSeleccionadas = columnasExcel.value.filter(c => c.visible);
  
  const datosParaExcel = arbitrosFiltrados.value.map(a => {
    let fila = {};
    columnasSeleccionadas.forEach(col => {
      let valor = a[col.id];

      if (col.id === 'rol') {
        valor = obtenerNombreRol(a.rol);
      } else if (col.id === 'es_activo') {
        valor = (valor == 1 ? 'SI' : 'NO');
      } else if (col.id === 'apto_medico') {
        valor = (valor ? 'SI' : 'NO');
      } else if (col.id === 'fecha_nacimiento') {
        valor = mostrarFechaArg(valor);
      }
      
      fila[col.label] = valor || '';
    });
    return fila;
  });

  const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Arbitros");
  XLSX.writeFile(workbook, "Reporte_AAAB.xlsx");
  
  mostrarModalExcel.value = false;
};

const cargarDatos = async () => {
  try {
    const { payload } = await api.get({ entity: 'arbitros', action: 'getArbitros' });
    if (payload) {
      arbitros.value = payload.map(a => ({
        ...a,
        apto_medico: a.apto_medico == 1,
        rol: a.rol !== null ? parseInt(a.rol) : 0 
      }));
      arbitrosOriginales.value = JSON.parse(JSON.stringify(arbitros.value));
    }
  } catch (err) { 
    console.error("Error al cargar:", err); 
  }
};

const obtenerProvinciasLocalidades = async () => {
  const { payload } = await api.get({
    entity: 'localidades',
    action: 'obtenerProvinciasLocalidades'
  })
  provincias.value = payload.provincias;
  localidades.value = payload.localidades;
}

const crearNuevo = () => {
  // Limpiamos el objeto y abrimos el modal en lugar de insertarlo directo en la tabla
  nuevoA.value = {
    apellido: '', nombre: '', dni: '', email: '', password: '', 
    rol: 1, provincia: '', localidad: '', grupo: '', subgrupo: '', celular: '', es_activo: 1
  };
  mostrarModalAlta.value = true;
};

const confirmarAlta = async () => {
  if (!nuevoA.value.apellido || !nuevoA.value.nombre || !nuevoA.value.email || !nuevoA.value.password) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Apellido, Nombre, Email y Password son requeridos.', tipo: 'danger' });
    return;
  }
  
  cargando.value = true;
  try {
    const res = await api.post({ 
      entity: 'arbitros',
      action: 'guardarDatosArbitros', 
      payload: { listaArbitros: [nuevoA.value] } // Enviamos el nuevo como una lista de 1
    });

    if (res.ok || res.success) {
      notificar({ titulo: 'Éxito', mensaje: 'Árbitro creado correctamente.', tipo: 'success' });
      mostrarModalAlta.value = false;
      await cargarDatos(); // Recargamos la tabla
    }
  } catch{
    notificar({ titulo: 'Error', mensaje: 'No se pudo crear el árbitro.', tipo: 'danger' });
  } finally {
    cargando.value = false;
  }
};

const actualizarAptoFisico = async (arbitro) => {
  try {
    const response = await api.post({
      entity: 'datos_personales',
      action: 'actualizarAptoFisico',
      payload: {
        id_arbitro: arbitro.id,
        apto_medico: arbitro.apto_medico
      }
    });
    console.log("Respuesta actualización apto:", response);
  } catch (err) {
    alert("Error al actualizar apto médico");
    console.error(err);
    arbitro.apto_medico = !arbitro.apto_medico;
  }
};

const guardarTodo = async () => {
  const modificados = arbitros.value.filter(actual => {
    if (!actual.id) return (actual.apellido || actual.nombre); 
    const original = arbitrosOriginales.value.find(o => o.id === actual.id);
    if (!original) return true;
    return JSON.stringify(actual) !== JSON.stringify(original);
  });

  if (modificados.length === 0) {
    notificar({ titulo: 'Sin cambios', mensaje: 'No detectamos modificaciones nuevas.', tipo: 'success' });
    return;
  }

  try {
    cargando.value = true;
    const datosParaEnviar = modificados.map(a => {
      const clon = { ...a };
      
      // Convertimos campos vacíos a null
      ['disponibilidad_sabado_desde', 'disponibilidad_sabado_hasta', 'disponibilidad_domingo_desde', 'disponibilidad_domingo_hasta', 'fecha_nacimiento'].forEach(campo => {
        if (clon[campo] === "" || clon[campo] === undefined) clon[campo] = null;
      });

      clon.apto_medico = clon.apto_medico ? 1 : 0;
      clon.rol = parseInt(clon.rol); // Aseguramos que el rol viaje como entero
      
      return clon;
    });

    const res = await api.post({ 
      entity: 'arbitros',
      action: 'guardarDatosArbitros', 
      payload: { listaArbitros: datosParaEnviar }
    });

    if (res.ok || res.success) {
      notificar({ 
        titulo: '¡Guardado!', 
        mensaje: `Se procesaron ${modificados.length} registros exitosamente.` 
      });
      await cargarDatos(); 
    } else {
      notificar({ titulo: 'Error', mensaje: res.message || 'Error al guardar.', tipo: 'danger' });
    }
  } catch { 
    notificar({ titulo: 'Error Fatal', mensaje: 'Error al conectar con el servidor.', tipo: 'danger' });
  } finally {
    cargando.value = false;
  }
};

const localidadesFiltradas = computed(() => {
  if (!filtros.provincia) return localidades.value;
  return localidades.value.filter(localidad => String(localidad.provincia_id) === String(filtros.provincia));
});

const arbitrosFiltrados = computed(() => {
  return arbitros.value.filter(a => {
    return Object.keys(filtros).every(key => {
      if (!filtros[key]) return true;

      if (key === 'rol') {
          return a.rol == filtros.rol;
      }

      const busqueda = String(filtros[key]).toLowerCase();
      if (key === 'es_activo') return (busqueda === 'si' ? a.es_activo == 1 : a.es_activo == 0);
      if (key === 'apto_medico') return (busqueda === 'si' ? a.apto_medico : !a.apto_medico);
      
      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]));
    });
  });
});

const totalPaginas = computed(() => {
  const total = Math.ceil(arbitrosFiltrados.value.length / registrosPorPagina);
  return total || 1;
});

const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  return arbitrosFiltrados.value.slice(inicio, fin);
});

watch([() => filtros.provincia, localidadesFiltradas], () => {
  if (!filtros.localidad) return;
  const localidadExiste = localidadesFiltradas.value.some(localidad => String(localidad.id) === String(filtros.localidad));
  if (!localidadExiste) {
    filtros.localidad = '';
  }
});

watch(filtros, () => {
  paginaActual.value = 1;
}, { deep: true });

watch(totalPaginas, (nuevoTotal) => {
  if (paginaActual.value > nuevoTotal) {
    paginaActual.value = nuevoTotal;
  }
});

const totalFiltrados = computed(() => arbitrosFiltrados.value.length);

onMounted(() => {
  cargarDatos();
  obtenerProvinciasLocalidades();
})
</script>

<style scoped>
/* CONFIGURACIÓN CORREGIDA PARA PANTALLA COMPLETA REAL */
.full-screen-wrapper {
  position: relative;
  /* Esto rompe el límite del padre sin usar cálculos de margen que fallan */
  width: 99vw;
  height: 100vh;
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
}

.admin-panel { 
  width: 100%;
  max-width: 100%; 
  padding: 20px; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;  
  background-color: #0f172a; 
  min-height: 100vh;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
}

.header-section { 
  background: white; 
  padding: 15px; 
  border-radius: 8px; 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 15px; 
  border-left: 5px solid #ef4444; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
  align-items: center; 
}

.title { font-size: 1.1rem; font-weight: bold; margin: 0; }
.counter { font-size: 0.85rem; color: #000000; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }
.btn-clear-checks { background: #fee2e2; color: #ef4444; } 
.btn-export { background: #10b981; color: white; }

.paginacion {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.btn-paginacion {
  border: none;
  background: #f8fafc;
  color: #0f172a;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.paginacion-texto {
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}

.table-container { 
  width: 100%;
  overflow: auto; 
  max-height: 85vh; 
  background: white; 
  border-radius: 8px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.2); /* Añadimos sombra para que resalte sobre el fondo oscuro */
}

table { 
  width: 100%;
  min-width: max-content; 
  border-collapse: collapse !important; /* <--- CAMBIO CRÍTICO */
  border-spacing: 0; 
  font-size: 0.85rem; 
}
thead tr.main-header th { 
  position: sticky; 
  top: 0; 
  z-index: 50; /* Bajamos de 1000 a 50 */
  background: #f8fafc; 
  border-bottom: 2px solid #e2e8f0; 
}

thead tr.filter-row td { 
  position: sticky;
  top: 36px; 
  z-index: 40; /* Bajamos a 40 para que sea menor al z-index de .sticky-col (60) */
  background: #f1F5F9 !important; 
  border-bottom: 2px solid #cbd5e1; 
  
}

/* Localiza y reemplaza esta regla */
.sticky-col { 
  position: sticky !important; 
  z-index: 60 !important; 
  background: white !important; 
  box-shadow: inset -1px 0 0 #e2e8f0; 
  background-clip: padding-box; 
}
thead th.sticky-col { 
  z-index: 100 !important; /* El nivel más alto de la tabla */
  background-color: #f1F5F9 !important; 
}

/* Celdas de filtros fijas (ID, Apellido, Nombre) */
thead td.sticky-col { 
  z-index: 95 !important; /* Un escalón abajo del título, pero arriba del resto */
  background-color: #f8fafc !important; 
}

.col-id { left: 0; width: 50px; text-align: center; }
.col-apellido { left: 50px; width: 140px; }
.col-nombre { left: 190px; width: 140px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }

th { font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000000; text-transform: uppercase; font-weight: 800; }
.filter-input { font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; }
.fila-inactiva td, .fila-inactiva .sticky-col { background-color: #f37d7d !important; font-weight: bold; color: #000; }

.edit-input { width: 100%; padding: 4px; border: 1px solid transparent; background: transparent; font-size: 0.85rem; }
.edit-input:focus { background: white; border-color: #3b82f6; outline: none; }
.edit-textarea { width: 250px; height: 30px; border: 1px solid transparent; background: transparent; font-size: 0.85rem; font-family: inherit; resize: none; padding: 4px; transition: all 0.2s; }
.edit-textarea:focus { height: 80px; background: white; border-color: #3b82f6; outline: none; }

.status-wrapper { display: flex; align-items: center; gap: 5px; justify-content: center; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-active { background: #10b981; }
.dot-inactive { background: #ef4444; }
.select-compact {
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: 0.8rem;
  width: 100%;
  padding: 2px;
}

.select-compact:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

/* Color específico para destacar el rol según el valor (Opcional) */
select.select-compact {
  color: #1e293b;
  text-align-last: center; /* Centra el texto en Chrome */
}

.col-xs-compact { width: 70px; text-align: center; }
.inactivo { background-color: #fee2e2 !important; }
.col-dni-compact { width: 90px; text-align: center; }

.date-custom-wrapper { position: relative; display: flex; align-items: center; width: 110px; }
.date-custom-wrapper::before { content: attr(data-date); position: absolute; left: 4px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.85rem; }
.input-fecha-nativa { color: transparent !important; cursor: pointer; }
.input-fecha-nativa::-webkit-calendar-picker-indicator { position: absolute; right: 0; cursor: pointer; }


.modal-overlay-exito {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content-exito {
  background: white;
  border-radius: 30px;
  padding: 40px;
  width: 90%;
  max-width: 750px;
  text-align: center;
}

.icon-circle-exito {
  width: 80px; height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.small-select {
  width: 100%;
  font-size: 0.8rem;
  padding: 2px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
}

.small-select:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.bg-success-light { background: #dcfce7; color: #166534; }

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
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
}

</style>
