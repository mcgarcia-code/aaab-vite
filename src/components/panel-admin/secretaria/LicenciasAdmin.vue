<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-calendar-event me-1"></i> Gestión de Licencias
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ licenciasFiltradas.length }} licencias</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Recargar (Movido acá) -->
            <button @click="obtenerLicencias" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <!-- Botón Filtros (Solo Móvil) -->
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="abrirModalNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">person_add</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo</span>
            </button>

            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Licencias</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-6 col-md-2">
              <input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Nombre...">
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none font-monospace">
                <option value="">ESTADO (TODOS)</option>
                <option value="pendiente">PENDIENTE</option>
                <option value="aprobada">APROBADA</option>
                <option value="rechazada">RECHAZADA</option>
              </select>
            </div>
            <div class="col-6 col-md-3">
              <input type="text" v-model="filtros.fecha_solicitud" class="form-control form-control-sm shadow-none text-md-center" placeholder="F. Solicitud (DD/MM/AAAA)">
            </div>
            <div class="col-6 col-md-3">
              <input type="text" v-model="filtros.fecha" class="form-control form-control-sm shadow-none text-md-center" placeholder="F. Ausencia (DD/MM/AAAA)">
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- TABLA (Solo Escritorio) -->
          <div class="d-none d-md-block table-responsive border rounded shadow-sm">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted" style="font-size: 0.75rem; width: 1px;">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Acciones</th>
                  <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Árbitro</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Estado</th>
                  <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Motivo</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">F. Solicitud</th>
                  <th class="py-3 text-center pe-3 text-uppercase text-muted" style="font-size: 0.75rem;">F. Ausencia</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lic in licenciasPaginadas" :key="lic.id">
                  <td class="ps-3 text-muted fw-bold font-monospace">{{ lic.id }}</td>
                  <td class="text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="editarLicencia(lic)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar Licencia">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="verHistorialLicencia(lic)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver Historial">
                        <span class="material-icons" style="font-size:16px;">manage_search</span>
                      </button>
                      <button @click="eliminarLicencia(lic.id)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Eliminar">
                        <span class="material-icons" style="font-size:16px;">delete</span>
                      </button>
                    </div>
                  </td>
                  <td class="fw-bold text-uppercase text-dark">{{ lic.apellido }}, {{ lic.nombre }}</td>
                  <td class="text-center">
                    <span :class="['badge-status-sm', lic.estado]">{{ lic.estado.toUpperCase() }}</span>
                  </td>
                  <td class="text-muted small">{{ lic.motivo === 'lesion_enfermedad' ? 'Lesión/Enf.' : 'Particular' }}</td>
                  <td class="text-center text-muted fw-bold">{{ formatearFechaVista(lic.fecha_solicitud) }}</td>
                  <td class="text-center pe-3 text-primary fw-bold">{{ formatearFechaVista(lic.fecha_licencia) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS (Solo Celular) -->
          <div class="d-md-none p-3 bg-light">
            <div v-for="lic in licenciasPaginadas" :key="'mob-'+lic.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">

              <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="text-uppercase text-dark fw-bold" style="font-size: 1.05rem;">
                  {{ lic.apellido }}, {{ lic.nombre }}
                </div>
                <div class="small text-muted fw-bold font-monospace">#{{ lic.id }}</div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="fw-bold text-primary fs-5">{{ formatearFechaVista(lic.fecha_licencia) }}</span>
                  <span :class="['badge-status-sm', lic.estado]" style="font-size: 0.7rem; padding: 3px 10px;">{{ lic.estado.toUpperCase() }}</span>
                </div>

                <div class="bg-light p-2 rounded border small mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Motivo:</span>
                    <span class="fw-bold text-dark">{{ lic.motivo === 'lesion_enfermedad' ? 'Lesión/Enf.' : 'Particular' }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Solicitada:</span>
                    <span class="fw-bold text-dark">{{ formatearFechaVista(lic.fecha_solicitud) }}</span>
                  </div>
                </div>

                <!-- Botones Acciones -->
                <div class="d-flex gap-2">
                  <button @click="editarLicencia(lic)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                    <span class="material-icons" style="font-size: 16px;">edit</span> EDITAR
                  </button>
                  <button @click="verHistorialLicencia(lic)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center">
                    <span class="material-icons" style="font-size: 18px;">manage_search</span>
                  </button>
                  <button @click="eliminarLicencia(lic.id)" class="btn btn-sm btn-outline-danger shadow-sm px-3 d-flex justify-content-center align-items-center">
                    <span class="material-icons" style="font-size: 18px;">delete</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- EMPTY STATE -->
          <div v-if="licenciasPaginadas.length === 0" class="text-center p-4 p-md-5 bg-white rounded shadow-sm border m-3">
            <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 48px;">search_off</span>
            <p class="text-muted m-0 fw-bold">No se encontraron licencias.</p>
          </div>

          <!-- PAGINACIÓN -->
          <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- ==============================================
         MODALES
         ============================================== -->

    <!-- Modal Formulario -->
    <ModalBase
      :show="mostrarModal"
      @close="cerrarModal"
      :icono="modoModal === 'editar' ? 'edit' : 'calendar_today'"
      :colorIcono="modoModal === 'editar' ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'"
      maxWidth="600px"
    >
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">{{ modoModal === 'editar' ? 'Editar Licencia' : 'Registrar Licencia' }}</span>
          <div v-if="modoModal === 'editar'" class="text-muted small" style="font-size: 0.85rem;">
            ID #{{ formModal.id }} — {{ formModal.apellido }}, {{ formModal.nombre }}
          </div>
        </div>
      </template>

      <form id="formLicencia" @submit.prevent="modoModal === 'editar' ? confirmarEdicion() : confirmarAlta()" class="text-start mt-2">
        <div class="row g-3">
          <div class="col-12" v-if="modoModal === 'nuevo'">
            <label class="small fw-bold text-dark mb-1">Seleccionar Árbitro *</label>
            <select v-model="formModal.id_arbitro" class="form-select border-secondary-subtle shadow-none" required>
              <option value="" disabled>Elegir árbitro...</option>
              <option v-for="arb in arbitrosLista" :key="arb.id" :value="arb.id">
                {{ arb.apellido }}, {{ arb.nombre }}
              </option>
            </select>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Motivo</label>
            <select v-model="formModal.motivo" class="form-select shadow-none border-secondary-subtle">
              <option value="particular">Particular</option>
              <option value="lesion_enfermedad">Lesión / Enfermedad</option>
            </select>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Estado</label>
            <select v-model="formModal.estado" class="form-select shadow-none border-secondary-subtle">
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Fecha Solicitud *</label>
            <input v-model="formModal.fecha_solicitud" type="date" class="form-control shadow-none border-secondary-subtle" required>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Fecha Ausencia *</label>
            <input v-model="formModal.fecha_licencia" type="date" class="form-control shadow-none border-secondary-subtle" required>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formLicencia" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
          {{ modoModal === 'editar' ? 'GUARDAR CAMBIOS' : 'CREAR LICENCIA' }}
        </button>
      </template>
    </ModalBase>

    <!-- Modal Historial -->
    <ModalBase
      :show="mostrarModalHistorial"
      @close="mostrarModalHistorial = false"
      icono="manage_search"
      colorIcono="bg-warning-subtle text-warning-emphasis"
      maxWidth="700px"
    >
      <template #header>
        <div class="text-center">
          <div class="fw-bold fs-5">Historial de {{ licenciaSeleccionada?.apellido }}, {{ licenciaSeleccionada?.nombre }}</div>
          <span v-if="!cargandoHistorial" class="badge bg-dark rounded-pill fs-6" title="Total de licencias pedidas">{{ historialLicencia.length }}</span>
        </div>
      </template>

      <div v-if="cargandoHistorial" class="text-center py-5">
        <span class="spinner-border text-warning"></span>
      </div>

      <div v-else-if="historialLicencia.length === 0" class="text-center py-4 text-muted bg-light border rounded">
        No hay registros en el historial.
      </div>

      <div v-else>
        <!-- Tabla Historial (Escritorio) -->
        <div class="table-responsive d-none d-md-block bg-white rounded shadow-sm border border-light-subtle">
          <table class="table table-sm table-hover align-middle m-0" style="font-size: 0.85rem; table-layout: fixed; width: 100%;">
            <thead class="table-light">
              <tr>
                <th class="py-2 ps-3 fw-bold text-uppercase text-muted" style="width: 130px; font-size: 0.75rem;">F. Solicitud</th>
                <th class="py-2 fw-bold text-uppercase text-muted" style="width: 130px; font-size: 0.75rem;">F. Ausencia</th>
                <th class="py-2 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">Motivo</th>
                <th class="text-center py-2 pe-3 fw-bold text-uppercase text-muted" style="width: 120px; font-size: 0.75rem;">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historialLicencia" :key="h.id">
                <td class="text-nowrap text-muted fw-bold py-3 ps-3">{{ formatearFechaVista(h.fecha_solicitud) }}</td>
                <td class="text-nowrap text-primary fw-bold py-3">{{ formatearFechaVista(h.fecha_licencia) }}</td>
                <td class="text-muted py-3" style="white-space: normal; word-wrap: break-word;">
                  {{ h.motivo === 'lesion_enfermedad' ? 'Lesión/Enf.' : 'Particular' }}
                </td>
                <td class="text-center py-3 pe-3">
                  <span :class="['badge-status-sm', h.estado]">{{ h.estado.toUpperCase() }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tarjetas Historial (Móvil) -->
        <div class="d-md-none d-flex flex-column gap-2">
          <div v-for="h in historialLicencia" :key="'mob-hist-'+h.id" class="border border-light-subtle rounded-3 p-3 shadow-sm bg-light">
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
              <span class="fw-bold text-primary fs-5">{{ formatearFechaVista(h.fecha_licencia) }}</span>
              <span :class="['badge-status-sm', h.estado]">{{ h.estado.toUpperCase() }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center text-muted small mt-2">
              <span><strong>Solicitada:</strong> {{ formatearFechaVista(h.fecha_solicitud) }}</span>
              <span>{{ h.motivo === 'lesion_enfermedad' ? 'Lesión/Enf.' : 'Particular' }}</span>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

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
   ESTILOS GENERALES
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  margin-left: 50%;
  transform: translateX(-50%);
  padding-bottom: 120px;
}

.admin-panel {
  width: 100%;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

/* ====================================================
   BADGES DE ESTADOS CUSTOMIZADOS
   ==================================================== */
.badge-status-sm {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
}
.aprobada { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.pendiente { background: #fef3c7; color: #d97706; border: 1px solid #fde047; }
.rechazada { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

/* ====================================================
   UTILIDADES
   ==================================================== */
.animate__animated { animation-duration: 0.5s; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

/* Cero media queries necesarias para la estructura. Bootstrap hace todo el trabajo. */
</style>
