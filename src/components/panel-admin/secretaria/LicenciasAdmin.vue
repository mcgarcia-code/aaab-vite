<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white" style="border-radius: 12px; overflow: hidden;">
        
        <div class="header-section border-bottom" style="margin-bottom: 0; box-shadow: none; border-radius: 0; padding: 20px;">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2" style="font-size: 1.25rem;">
              <i class="bi bi-calendar-event me-1"></i> Gestión de Licencias
            </h4>
            <span class="counter mt-1 d-block">Total: {{ licenciasFiltradas.length }} licencias</span>
          </div>

          <div class="header-actions">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex" title="Mostrar Filtros">
              <span class="material-icons">filter_alt</span> <span class="btn-text">Filtros</span>
            </button>

            <button @click="limpiarFiltros" class="btn-action btn-clear" title="Limpiar Filtros">
              <span class="material-icons">filter_alt_off</span> <span class="btn-text">Limpiar</span>
            </button>

            <button @click="abrirModalNuevo" class="btn-action btn-clear-checks" title="Nueva Licencia">
              <span class="material-icons">person_add</span> <span class="btn-text">Nuevo</span>
            </button>

            <button @click="exportarExcel" class="btn-action btn-export" title="Exportar a Excel">
              <span class="material-icons">download</span> <span class="btn-text">Excel</span>
            </button>
          </div>
        </div>

        <div class="card-body p-3 p-md-4">
          
          <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster shadow-sm">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="small fw-bold text-muted text-uppercase">Filtrar Licencias</span>
              <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1" style="line-height: 1; background: transparent;">
                <span class="material-icons" style="font-size: 20px;">close</span>
              </button>
            </div>

            <div class="filter-grid-mobile">
              <input v-model="filtros.apellido" placeholder="Apellido...">
              <input v-model="filtros.nombre" placeholder="Nombre...">

              <select v-model="filtros.estado" class="full-width">
                <option value="">Estado (Todos)</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>

              <input type="text" v-model="filtros.fecha_solicitud" placeholder="F. Solicitud (DD/MM/AAAA)">
              <input type="text" v-model="filtros.fecha" placeholder="F. Ausencia (DD/MM/AAAA)">
            </div>

            <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded fw-bold border-0">Aplicar Filtros</button>
          </div>

          <div class="table-container shadow desktop-only">
            <table>
              <thead>
                <tr class="main-header">
                  <th class="sticky-col col-id">ID</th>
                  <th class="sticky-col col-acciones text-center">Acciones</th>
                  <th class="sticky-col col-apellido">Apellido</th>
                  <th class="sticky-col col-nombre">Nombre</th>
                  <th class="text-center" style="min-width: 120px;">Estado</th>
                  <th class="text-center">Motivo</th>
                  <th class="text-center">F. Solicitud</th>
                  <th class="text-center">F. Licencia</th>
                </tr>
                <tr class="filter-row">
                  <td class="sticky-col col-id">
                    <button @click="obtenerLicencias" class="btn-refresh w-100" title="Recargar"><span class="material-icons" style="font-size: 16px;">refresh</span></button>
                  </td>
                  <td class="sticky-col col-acciones"></td>
                  <td class="sticky-col col-apellido"><input v-model="filtros.apellido" class="filter-input" placeholder="Filtrar.."></td>
                  <td class="sticky-col col-nombre"><input v-model="filtros.nombre" class="filter-input" placeholder="Filtrar.."></td>
                  <td>
                    <select v-model="filtros.estado" class="filter-input text-center">
                      <option value="">TODOS</option>
                      <option value="pendiente">PENDIENTE</option>
                      <option value="aprobada">APROBADA</option>
                      <option value="rechazada">RECHAZADA</option>
                    </select>
                  </td>
                  <td></td>
                  <td><input v-model="filtros.fecha_solicitud" class="filter-input text-center" placeholder="DD/MM/AAAA"></td>
                  <td><input v-model="filtros.fecha" class="filter-input text-center" placeholder="DD/MM/AAAA"></td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lic in licenciasPaginadas" :key="lic.id">
                  <td class="sticky-col col-id cell-ro text-center text-muted fw-bold">{{ lic.id }}</td>
                  <td class="sticky-col col-acciones cell-ro text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="editarLicencia(lic)" class="btn-editar" title="Editar Licencia">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="verHistorialLicencia(lic)" class="btn-historial" title="Ver Historial">
                        <span class="material-icons" style="font-size:16px;">manage_search</span>
                      </button>
                      <button @click="eliminarLicencia(lic.id)" class="btn-eliminar" title="Eliminar">
                        <span class="material-icons" style="font-size:16px;">delete</span>
                      </button>
                    </div>
                  </td>
                  <td class="sticky-col col-apellido cell-ro fw-bold">{{ lic.apellido }}</td>
                  <td class="sticky-col col-nombre cell-ro fw-bold">{{ lic.nombre }}</td>
                  <td class="text-center cell-ro">
                    <span :class="['badge-status', lic.estado]">{{ lic.estado.toUpperCase() }}</span>
                  </td>
                  <td class="text-center cell-ro text-muted small">
                    {{ lic.motivo === 'lesion_enfermedad' ? 'Lesión/Enf.' : 'Particular' }}
                  </td>
                  <td class="text-center cell-ro">{{ formatearFechaVista(lic.fecha_solicitud) }}</td>
                  <td class="text-center cell-ro fw-bold text-primary">{{ formatearFechaVista(lic.fecha_licencia) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only">
            <div v-for="lic in licenciasPaginadas" :key="'mob-'+lic.id" class="card-licencia">
              <div class="card-header">
                <div class="card-name">
                  <strong>{{ lic.apellido }}, {{ lic.nombre }}</strong>
                </div>
                <div class="text-xs" style="color: #64748b;">ID: {{ lic.id }}</div>
              </div>

              <div class="card-body">
                <div class="card-row">
                  <span><strong>Estado:</strong> <span :class="['badge-status-sm', lic.estado]">{{ lic.estado.toUpperCase() }}</span></span>
                </div>

                <div class="card-info">
                  <p><strong>Motivo:</strong> {{ lic.motivo === 'lesion_enfermedad' ? 'Lesión / Enfermedad' : 'Particular' }}</p>
                  <p><strong>F. Solicitud:</strong> {{ formatearFechaVista(lic.fecha_solicitud) }}</p>
                  <p><strong>F. Licencia:</strong> <span class="text-primary fw-bold">{{ formatearFechaVista(lic.fecha_licencia) }}</span></p>
                </div>

                <div class="d-flex gap-2 mt-3">
                  <button @click="editarLicencia(lic)" class="btn-editar-mobile flex-grow-1">
                    <span class="material-icons" style="font-size: 18px;">edit</span> Editar
                  </button>
                  <button @click="verHistorialLicencia(lic)" class="btn-historial-mobile">
                    <span class="material-icons" style="font-size: 18px;">manage_search</span>
                  </button>
                  <button @click="eliminarLicencia(lic.id)" class="btn-eliminar-mobile">
                    <span class="material-icons" style="font-size: 18px;">delete</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="licenciasPaginadas.length === 0" class="text-center p-4 bg-light rounded shadow-sm border mt-2">
              <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
              <p class="text-muted mt-2 mb-0">No se encontraron licencias.</p>
            </div>
          </div>

          <div class="d-flex justify-content-end mt-4 w-100" v-if="licenciasFiltradas.length > 0">
            <div class="paginacion m-0" v-if="totalPaginas > 1">
              <button class="btn-paginacion" @click="cambiarPagina(-1)" :disabled="paginaActual === 1">Anterior</button>
              <span class="paginacion-texto text-dark">Página {{ paginaActual }} de {{ totalPaginas }}</span>
              <button class="btn-paginacion" @click="cambiarPagina(1)" :disabled="paginaActual === totalPaginas">Siguiente</button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <Teleport to="body">
    <div v-if="mostrarModal" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 10001;">
      <div class="modal-content-exito animate__animated animate__zoomIn" style="max-width: 600px; width: 95%;">

        <div class="icon-circle-exito" :class="modoModal === 'editar' ? 'bg-info-light' : 'bg-success-light'">
          <span class="material-icons">{{ modoModal === 'editar' ? 'edit' : 'calendar_today' }}</span>
        </div>
        <h4 class="fw-bold mt-3">
          {{ modoModal === 'editar' ? 'Editar Licencia' : 'Registrar Licencia' }}
        </h4>
        <p v-if="modoModal === 'editar'" class="text-muted small mb-3">ID #{{ formModal.id }} — {{ formModal.apellido }}, {{ formModal.nombre }}</p>

        <div class="row g-3 text-start mt-2">

          <div class="col-12" v-if="modoModal === 'nuevo'">
            <label class="small fw-bold">Seleccionar Árbitro *</label>
            <select v-model="formModal.id_arbitro" class="form-select border-primary-subtle shadow-none">
              <option value="" disabled>Elegir árbitro...</option>
              <option v-for="arb in arbitrosLista" :key="arb.id" :value="arb.id">
                {{ arb.apellido }}, {{ arb.nombre }}
              </option>
            </select>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold">Motivo</label>
            <select v-model="formModal.motivo" class="form-select shadow-none">
              <option value="particular">Particular</option>
              <option value="lesion_enfermedad">Lesión / Enfermedad</option>
            </select>
          </div>
          
          <div class="col-12 col-md-6">
            <label class="small fw-bold">Estado</label>
            <select v-model="formModal.estado" class="form-select shadow-none">
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>

          <div class="col-6">
            <label class="small fw-bold">Fecha Solicitud *</label>
            <input v-model="formModal.fecha_solicitud" type="date" class="form-control shadow-none">
          </div>

          <div class="col-6">
            <label class="small fw-bold">Fecha Ausencia *</label>
            <input v-model="formModal.fecha_licencia" type="date" class="form-control shadow-none border-danger-subtle">
          </div>

        </div>

        <div class="d-flex gap-2 justify-content-center mt-4">
          <button @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold">CANCELAR</button>
          <button @click="modoModal === 'editar' ? confirmarEdicion() : confirmarAlta()" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" :disabled="cargando || !formModal.fecha_licencia">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
            {{ modoModal === 'editar' ? 'GUARDAR CAMBIOS' : 'CREAR LICENCIA' }}
          </button>
        </div>

      </div>
    </div>
    </Teleport>

    <Teleport to="body">
    <div v-if="mostrarModalHistorial" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 10002;">
      <div class="modal-content-exito animate__animated animate__zoomIn" style="max-width: 600px; width: 95%; text-align: left;">
        <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
          <h5 class="fw-bold m-0 d-flex align-items-center gap-2">
            <span class="material-icons text-warning">manage_search</span>
            Historial de {{ licenciaSeleccionada?.apellido }}, {{ licenciaSeleccionada?.nombre }}
            <span v-if="!cargandoHistorial" class="badge bg-dark rounded-pill fs-6 ms-2" title="Total de licencias pedidas">{{ historialLicencia.length }}</span>
          </h5>
          <button @click="mostrarModalHistorial = false" class="btn btn-light rounded-circle" style="width: 35px; height: 35px; padding: 0;">
            <span class="material-icons" style="font-size: 18px; line-height: 1;">close</span>
          </button>
        </div>

        <div style="max-height: 60vh; overflow-y: auto; padding-right: 5px;">
          <div v-if="cargandoHistorial" class="text-center py-4">
            <span class="spinner-border text-warning"></span>
          </div>

          <div v-else-if="historialLicencia.length === 0" class="text-center py-4 text-muted">
            <span class="material-icons d-block fs-1 mb-2">history_toggle_off</span>
            No hay registros en el historial para esta licencia.
          </div>

          <div v-else class="table-responsive">
            <table class="table table-sm table-hover align-middle" style="font-size: 0.85rem;">
              <thead class="table-light">
                <tr>
                  <th>F. Solicitud</th>
                  <th>F. Ausencia</th>
                  <th>Motivo</th>
                  <th class="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in historialLicencia" :key="h.id">
                  <td class="text-nowrap text-muted fw-bold">{{ formatearFechaVista(h.fecha_solicitud) }}</td>
                  <td class="text-nowrap text-primary fw-bold">{{ formatearFechaVista(h.fecha_licencia) }}</td>
                  <td class="text-muted">{{ h.motivo === 'lesion_enfermedad' ? 'Lesión/Enf.' : 'Particular' }}</td>
                  <td class="text-center">
                    <span :class="['badge-status-sm', h.estado]">{{ h.estado.toUpperCase() }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Gestión de Licencias | AAAB',
  meta: [{ name: 'description', content: 'Gestión de licencias solicitadas por los árbitros.' }],
})

const notificar = inject('notificar')

const licencias = ref([])
const arbitrosLista = ref([])
const cargando = ref(false)

const filtros = reactive({
  apellido: '', nombre: '', estado: '', fecha: '', fecha_solicitud: ''
})

const mostrarFiltrosMobile = ref(false)

const paginaActual = ref(1)
const registrosPorPagina = 10

const mostrarModal = ref(false)
const modoModal = ref('nuevo')
// MODIFICADO: Agregué motivo al estado inicial del formModal
const formModal = ref({ id: null, id_arbitro: '', fecha_solicitud: '', fecha_licencia: '', estado: 'aprobada', apellido: '', nombre: '', motivo: 'particular' })

const mostrarModalHistorial = ref(false)
const cargandoHistorial = ref(false)
const licenciaSeleccionada = ref(null)
const historialLicencia = ref([])

const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
const formatearFechaVista = (f) => f ? f.split(' ')[0].split('-').reverse().join('/') : '';

const licenciasFiltradas = computed(() => {
  return licencias.value.filter(l => {
    const matchApe = normalizar(l.apellido).includes(normalizar(filtros.apellido));
    const matchNom = normalizar(l.nombre).includes(normalizar(filtros.nombre));
    const matchEst = filtros.estado === '' || l.estado === filtros.estado;
    const matchFec = formatearFechaVista(l.fecha_licencia).includes(filtros.fecha);
    const matchFecSol = formatearFechaVista(l.fecha_solicitud).includes(filtros.fecha_solicitud);
    return matchApe && matchNom && matchEst && matchFec && matchFecSol;
  });
});

const totalPaginas = computed(() => Math.ceil(licenciasFiltradas.value.length / registrosPorPagina) || 1);
const licenciasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return licenciasFiltradas.value.slice(inicio, inicio + registrosPorPagina);
});

watch(filtros, () => { paginaActual.value = 1 }, { deep: true });
watch(totalPaginas, (nuevo) => { if(paginaActual.value > nuevo) paginaActual.value = nuevo });

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

const obtenerLicencias = async () => {
  cargando.value = true;
  const res = await api.get({
    entity: 'licencias',
    action: 'obtenerTodasLasLicencias'
  });
  if (res.ok) licencias.value = res.payload;
  cargando.value = false;
};

const obtenerArbitros = async () => {
  const res = await api.get({
    entity: 'arbitros',
    action: 'getArbitros'
  });
  if (res.ok && Array.isArray(res.payload)) {
    arbitrosLista.value = res.payload.sort((a, b) => (a.apellido || '').localeCompare(b.apellido || ''));
  }
};

const abrirModalNuevo = () => {
  const hoy = new Date().toISOString().split('T')[0];
  // MODIFICADO: Reiniciar motivo a particular por defecto
  formModal.value = { id: null, id_arbitro: '', fecha_solicitud: hoy, fecha_licencia: '', estado: 'aprobada', apellido: '', nombre: '', motivo: 'particular' };
  modoModal.value = 'nuevo';
  mostrarModal.value = true;
};

const editarLicencia = (lic) => {
  // MODIFICADO: Asegurarse de que el motivo se cargue al editar
  formModal.value = { ...lic, motivo: lic.motivo || 'particular' }
  modoModal.value = 'editar'
  mostrarModal.value = true
};

const cerrarModal = () => {
  mostrarModal.value = false;
};

const confirmarAlta = async () => {
  cargando.value = true;
  const res = await api.post({
    entity: 'licencias',
    action: 'crearLicencia',
    payload: { ...formModal.value, es_admin: true }
  });
  cargando.value = false;

  if (res.ok) {
    mostrarModal.value = false;
    obtenerLicencias();
    notificar({ titulo: 'Éxito', mensaje: 'Licencia registrada correctamente.', tipo: 'success' });
  } else {
    notificar({ titulo: 'Error', mensaje: 'No se pudo registrar la licencia.', tipo: 'danger' });
  }
};

const confirmarEdicion = async () => {
  cargando.value = true;
  const res = await api.post({
    entity: 'licencias',
    action: 'actualizarLicencia',
    // Ojo: Según el backend PHP actual, actualizarLicencia no guarda cambios de "motivo", 
    // pero lo enviamos por si a futuro ajustás la query SQL del UPDATE.
    payload: {
      id: formModal.value.id,
      estado: formModal.value.estado,
      fecha_licencia: formModal.value.fecha_licencia,
      fecha_solicitud: formModal.value.fecha_solicitud,
      motivo: formModal.value.motivo
    }
  });
  cargando.value = false;

  if (res.ok) {
    mostrarModal.value = false;
    obtenerLicencias();
    notificar({ titulo: 'Guardado', mensaje: 'Licencia actualizada correctamente.', tipo: 'success' });
  } else {
    notificar({ titulo: 'Error', mensaje: 'No se pudieron guardar los cambios.', tipo: 'danger' });
  }
};

const eliminarLicencia = (id) => {
  notificar({
    titulo: '¿Eliminar Licencia?',
    mensaje: 'Esta acción es irreversible. El registro será borrado permanentemente.',
    tipo: 'danger',
    alConfirmar: async () => {
      const res = await api.post({
        entity: 'licencias',
        action: 'eliminarLicencia',
        payload: { id }
      });
      if(res.ok) {
        licencias.value = licencias.value.filter(l => l.id !== id);
        notificar({ titulo: 'Eliminado', mensaje: 'La licencia ha sido removida.', tipo: 'success' });
      }
    }
  });
};

const verHistorialLicencia = async (lic) => {
  licenciaSeleccionada.value = lic;
  mostrarModalHistorial.value = true;
  cargandoHistorial.value = true;
  historialLicencia.value = [];

  try {
    const res = await await api.get({
      entity: 'licencias',
      action: 'obtenerHistorial',
      payload: { id_arbitro: lic.id_arbitro }
    });
    if (res.payload) {
      historialLicencia.value = res.payload;
    }
  } catch (error) {
    console.error("Error al cargar historial", error);
  } finally {
    cargandoHistorial.value = false;
  }
};

const exportarExcel = () => {
  const data = licenciasFiltradas.value.map(l => ({
    'ID': l.id,
    'Apellido': l.apellido,
    'Nombre': l.nombre,
    'Estado': l.estado.toUpperCase(),
    // NUEVO: Agregado al Excel
    'Motivo': l.motivo === 'lesion_enfermedad' ? 'Lesión/Enfermedad' : 'Particular',
    'Fecha Solicitud': formatearFechaVista(l.fecha_solicitud),
    'Fecha Licencia': formatearFechaVista(l.fecha_licencia)
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Licencias");
  XLSX.writeFile(wb, "Licencias_AAAB.xlsx");
};

const limpiarFiltros = () => {
  filtros.nombre = ''; filtros.apellido = ''; filtros.estado = ''; filtros.fecha = ''; filtros.fecha_solicitud = '';
};

onMounted(() => {
  obtenerLicencias();
  obtenerArbitros();
});
</script>

<style scoped>
/* ====================================================
   1. BASE Y ESTRUCTURA GENERAL
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 120px; 
}

.admin-panel {
  width: 100%;
  max-width: 100%;
  padding: 20px;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;
  background-color: #0f172a;
  min-height: 100vh;
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

/* ====================================================
   2. COMPONENTES (BOTONES Y BADGES)
   ==================================================== */
.header-actions { display: flex; gap: 8px; }

.btn-action { 
  border: none; padding: 8px 12px; border-radius: 4px; 
  font-weight: bold; cursor: pointer; display: flex; 
  align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; 
}

.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }
.btn-clear-checks { background: #fee2e2; color: #ef4444; }
.btn-export { background: #10b981; color: white; }
.btn-refresh { background: none; border: none; color: #64748b; cursor: pointer; }

.btn-editar, .btn-historial, .btn-eliminar {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 6px; padding: 4px; cursor: pointer; transition: 0.2s; border: none;
}
.btn-editar { background: #eff6ff; color: #1d4ed8; }
.btn-editar:hover { background: #dbeafe; }
.btn-historial { background: #fef3c7; color: #d97706; }
.btn-historial:hover { background: #fde047; }
.btn-eliminar { background: #fee2e2; color: #dc2626; }
.btn-eliminar:hover { background: #fecaca; }

/* Estados y Badges */
.badge-status {
  padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;
}
.badge-status.aprobada { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }

/* MODIFICADO: Color de Pendiente cambiado a un amarillo fuerte (estilo warning) */
.badge-status.pendiente { background: #ffc107; color: #212529; border: 1px solid #e0a800; }
.badge-status.rechazada { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

.badge-status-sm {
  padding: 2px 8px; border-radius: 12px; font-size: 0.65rem; font-weight: 700;
}
.badge-status-sm.aprobada { background: #dcfce7; color: #15803d; }

/* MODIFICADO: Color de Pendiente para versión small móvil */
.badge-status-sm.pendiente { background: #ffc107; color: #212529; }
.badge-status-sm.rechazada { background: #fee2e2; color: #b91c1c; }

/* Paginación */
.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; }
.btn-paginacion { 
  border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; 
  border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: background 0.2s; 
}
.btn-paginacion:hover:not(:disabled) { background: #e2e8f0; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: #000; font-size: 0.85rem; font-weight: 600; }

/* ====================================================
   3. TABLA (STICKY Y CELDAS)
   ==================================================== */
.table-container {
  width: 100%; overflow: auto; max-height: 85vh;
  background: white; border-radius: 8px; border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

table {
  width: 100%; min-width: max-content;
  border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem;
}

thead tr.main-header th {
  position: sticky; top: 0; z-index: 50; background: #f8fafc !important;
  padding: 12px 8px; border-bottom: 1px solid #cbd5e1; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0;
}

thead tr.filter-row td {
  position: sticky; top: 35px; z-index: 40; background: #f1f5f9 !important;
  padding: 6px 8px 12px 8px; border-bottom: 4px solid #e2e8f0; margin: 0;
}

.sticky-col {
  position: sticky !important; z-index: 60 !important;
  background: white !important; border-right: 1px solid #e2e8f0;
}
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #f8fafc !important; }
thead tr.filter-row td.sticky-col { z-index: 95 !important; background-color: #f1f5f9 !important; }

.col-id { left: 0; width: 50px; text-align: center; }
.col-acciones { left: 50px; width: 110px; }
.col-apellido { left: 160px; width: 140px; }
.col-nombre { left: 300px; width: 140px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }

.cell-ro {
  padding: 10px 8px; font-size: 0.85rem; color: #000;
  white-space: nowrap; border-bottom: 1px solid #f1f5f9;
}

.filter-input { 
  font-size: 16px; height: 32px; border: 1px solid #cbd5e1; 
  border-radius: 4px; padding: 2px 8px; width: 100%; outline: none;
}

@media (min-width: 769px) { .filter-input { font-size: 0.75rem; height: 28px; } }

/* ====================================================
   4. MODALES
   ==================================================== */
.modal-overlay-exito { 
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
  background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); 
  display: flex; align-items: center; justify-content: center; z-index: 10000; 
}
.modal-content-exito { 
  background: white; border-radius: 30px; padding: 40px; 
  width: 90%; max-width: 750px; text-align: center; color: #000; 
}
.icon-circle-exito { 
  width: 80px; height: 80px; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; margin: 0 auto; 
}
.bg-success-light { background: #dcfce7; color: #166534; }
.bg-info-light { background: #e0f2fe; color: #0369a1; }

/* ====================================================
   5. 📱 RESPONSIVE DESIGN (TIERED LAYOUT)
   ==================================================== */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }
.btn-text { display: inline; }

/* Tablet y Laptops (Hasta 1024px) */
@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}

/* Tablets y Móviles (Hasta 768px) */
@media (max-width: 768px) {
  .full-screen-wrapper { padding: 10px; }
  .admin-panel { padding: 10px; }
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }

  /* Estilos de las tarjetas móviles */
  .card-licencia {
    background: white; border-radius: 8px; padding: 15px; 
    margin-bottom: 12px; border: 1px solid #e2e8f0; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .card-header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px;
  }
  .card-name { font-size: 1.05rem; color: #0f172a; }
  .card-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 8px; }
  .card-info p { font-size: 0.85rem; color: #475569; margin: 4px 0; }

  /* Filtros Móviles */
  .mobile-filter-panel {
    background: white; padding: 15px 20px; border-radius: 8px;
    border: 1px solid #e2e8f0; margin-bottom: 15px;
  }
  .filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .filter-grid-mobile input, .filter-grid-mobile select {
    padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 16px; 
    width: 100%; outline: none; background: #f8fafc;
  }
  .filter-grid-mobile select.full-width { grid-column: span 2; }

  /* Botones en Cards */
  .btn-editar-mobile { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; }
  .btn-historial-mobile { background: #fef3c7; border: 1px solid #fde047; color: #d97706; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; }
  .btn-eliminar-mobile { background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; }
}

/* Smartphones (Hasta 600px) */
@media (max-width: 600px) {
  /* AIRE A LOS COSTADOS: Importante para que no se pegue al margen */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto;
  margin-left: 50%;
  transform: translateX(-50%);
      /* Top en 0, pero conservando los 15px laterales originales para celulares */
  padding: 0 15px 20px 15px !important; 
  box-sizing: border-box !important;
}
    
.admin-panel { 
      padding: 0 !important; 
      border-radius: 0; 
      box-sizing: border-box !important;
}

  /* CABECERA: Título Izquierda, Botones Centro */
  .header-section { 
    padding: 15px !important; 
    flex-direction: column; 
    align-items: flex-start; /* Respetamos el borde rojo a la izquierda */
    text-align: left; 
    gap: 15px; 
  }

  .header-info { width: 100%; display: flex; flex-direction: column; align-items: flex-start; }
  .title { font-size: 1.25rem !important; margin: 0; text-align: left; }
  .counter { font-size: 0.85rem !important; }

  /* Botones de acción centrados horizontalmente debajo */
  .header-actions {
    width: 100%; 
    display: flex; 
    flex-direction: row; 
    flex-wrap: wrap; 
    justify-content: center; 
    gap: 8px;
  }
  .btn-action {
    flex: none; width: 42px; height: 42px; padding: 0; justify-content: center;
  }
  .btn-text { display: none !important; }
  .mobile-only-flex { display: flex !important; }

    /* AJUSTE DE PADDING EN MODALES MÓVILES (Agregar/Editar Eventos) */
  .modal-content-exito {
    padding: 30px 20px !important; /* Libera los costados pero mantiene aire arriba y abajo */
    max-height: 90vh; /* Evita que el modal sea más alto que la pantalla */
    overflow-y: auto; /* Scroll interno si el formulario de evento es largo */
  }

  /* Liberar columnas fijas para evitar rotura de tabla */
  .sticky-col { position: static !important; box-shadow: none !important; }
  .col-nombre { box-shadow: none !important; }
}
</style>