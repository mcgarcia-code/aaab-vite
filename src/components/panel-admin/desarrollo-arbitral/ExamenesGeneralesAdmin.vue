<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-clipboard2-check-fill me-1"></i> Gestión de Exámenes
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ totalFiltrados }} exámenes</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="crearNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_circle</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo Examen</span>
            </button>

            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Exámenes</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-6">
              <input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido...">
            </div>
            <div class="col-6">
              <input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Nombre...">
            </div>
            <div class="col-6">
              <select v-model="filtros.tipo" class="form-select form-select-sm shadow-none">
                <option value="">Tipo (Todos)</option>
                <option v-for="t in tiposExamen" :key="t" :value="t">{{ t.toUpperCase() }}</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="filtros.subtipo" class="form-select form-select-sm shadow-none">
                <option value="">Subtipo (Todos)</option>
                <option v-for="s in subtiposExamen" :key="s" :value="s">{{ s.toUpperCase() }}</option>
              </select>
            </div>
            <div class="col-12">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none">
                <option value="">Estado (Todos)</option>
                <option :value="1">Aprobado</option>
                <option :value="0">Desaprobado</option>
                <option :value="2">Ausente</option>
                <option :value="3">No lo hizo</option>
              </select>
            </div>
            <div class="col-12 mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
            <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted col-fija col-id">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones">Acciones</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
                  <th class="py-3 text-uppercase text-muted">Fecha</th>
                  <th class="py-3 text-center text-uppercase text-muted">Tipo</th>
                  <th class="py-3 text-uppercase text-muted">Evaluaciones Rendidas</th>
                </tr>
                <tr class="bg-light">
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id">
                    <button @click="cargarDatos" class="btn btn-sm btn-light border rounded text-secondary shadow-sm px-2 py-1"><i class="bi bi-arrow-clockwise"></i></button>
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-acciones"></td>
                  <td class="p-2 border-bottom border-2 col-fija col-apellido"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Filtrar.."></td>
                  <td class="p-2 border-bottom border-2 col-fija col-nombre"><input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Filtrar.."></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.fecha_examen" class="form-control form-control-sm shadow-none" placeholder="dd/mm/aaaa"></td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.tipo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option>
                      <option v-for="t in tiposExamen" :key="t" :value="t">{{ t.toUpperCase() }}</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2 d-flex gap-2">
                    <select v-model="filtros.subtipo" class="form-select form-select-sm shadow-none" style="width: 120px;">
                      <option value="">Subtipo</option>
                      <option v-for="s in subtiposExamen" :key="s" :value="s">{{ s.toUpperCase() }}</option>
                    </select>
                    <select v-model="filtros.estado" class="form-select form-select-sm shadow-none" style="width: 120px;">
                      <option value="">Estado</option>
                      <option :value="1">Aprobado</option>
                      <option :value="0">Desaprobado</option>
                      <option :value="2">Ausente</option>
                      <option :value="3">No lo hizo</option>
                    </select>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in examenesPaginados" :key="e.id">
                  <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ e.id }}</td>
                  <td class="text-center col-fija col-acciones">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="editarExamen(e)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar examen">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="verHistorialArbitro(e.id_arbitro, e.apellido, e.nombre)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Historial del árbitro">
                        <span class="material-icons" style="font-size:16px;">manage_search</span>
                      </button>
                    </div>
                  </td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ e.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ e.nombre }}</td>
                  <td class="text-dark">{{ formatearFechaVisual(e.fecha_examen) }}</td>
                  <td class="text-center text-dark text-uppercase">{{ e.tipo }}</td>
                  <td>
                    <div v-if="e.detalles && e.detalles.length === 1 && e.detalles[0].estado == 2">
                      <span class="badge bg-secondary text-white shadow-sm px-2 py-1">AUSENTE</span>
                    </div>
                    <div v-else class="d-flex flex-wrap gap-1">
                      <span v-for="det in e.detalles" :key="det.id" class="badge border bg-light text-dark shadow-sm px-2 py-1 d-flex align-items-center gap-1">
                        <span class="fw-bold text-uppercase">{{ det.subtipo }}</span>
                        <span class="status-dot ms-1" :class="claseDot(det.estado)"></span>
                        <span v-if="det.calificacion && det.estado != 3" class="text-muted ms-1">({{ det.calificacion }})</span>
                      </span>
                    </div>
                  </td>
                </tr>
                <tr v-if="examenesPaginados.length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    <span class="material-icons opacity-50 d-block mb-2" style="font-size: 32px;">search_off</span>
                    <span class="fw-bold">No se encontraron exámenes.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-md-none p-3 bg-light">
            <div v-for="e in examenesPaginados" :key="'mob-'+e.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">

              <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                <div class="text-dark fw-bold text-uppercase d-flex align-items-center gap-2" style="font-size: 1.05rem;">
                  {{ e.apellido }}, {{ e.nombre }}
                </div>
                <div class="small text-muted fw-bold font-monospace">#{{ e.id }}</div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="d-flex justify-content-between text-dark mb-2 border-bottom border-secondary-subtle pb-2">
                  <span class="small"><strong>Tipo:</strong> <span class="text-uppercase">{{ e.tipo }}</span></span>
                  <span class="small"><strong>Fecha:</strong> {{ formatearFechaVisual(e.fecha_examen) }}</span>
                </div>

                <div class="bg-light p-2 rounded border small mb-3 border-light-subtle">
                  <p class="m-0 fw-bold text-uppercase text-muted mb-1" style="font-size: 0.7rem;">Evaluaciones</p>

                  <div v-if="e.detalles && e.detalles.length === 1 && e.detalles[0].estado == 2" class="py-1">
                     <span class="badge bg-secondary text-white w-100 p-2">AUSENTE AL EXAMEN</span>
                  </div>
                  <div v-else v-for="det in e.detalles" :key="'mob-det-'+det.id" class="d-flex justify-content-between align-items-center border-bottom border-light pb-1 mb-1">
                    <span class="text-dark text-uppercase fw-bold d-flex align-items-center gap-1">
                      <span class="status-dot" :class="claseDot(det.estado)"></span> {{ det.subtipo }}
                    </span>
                    <div>
                      <span v-if="det.calificacion && det.estado != 3" class="me-2 text-dark">{{ det.calificacion }}</span>
                      <span class="badge" :class="claseEstado(det.estado)">{{ textoEstado(det.estado) }}</span>
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button @click="editarExamen(e)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                    <span class="material-icons" style="font-size: 16px;">edit</span> EDITAR
                  </button>
                  <button @click="verHistorialArbitro(e.id_arbitro, e.apellido, e.nombre)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center">
                    <span class="material-icons" style="font-size: 18px;">manage_search</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="examenesPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
              <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
              <p class="text-muted m-0 fw-bold">No se encontraron registros.</p>
            </div>
          </div>

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

    <ModalBase :show="mostrarModal" @close="cerrarModal" :icono="modoModal === 'editar' ? 'edit' : 'add_circle'" :colorIcono="modoModal === 'editar' ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'" maxWidth="750px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">{{ modoModal === 'editar' ? 'Editar Examen' : 'Registrar Nuevo Examen' }}</span>
          <div v-if="modoModal === 'editar'" class="text-muted small">ID #{{ formModal.id }} — {{ formModal.apellido }}, {{ formModal.nombre }}</div>
        </div>
      </template>

      <form id="formExamen" @submit.prevent="modoModal === 'editar' ? confirmarEdicion() : confirmarAlta()" class="text-start">
        <div class="row g-3 pb-3">

          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-0">Datos del examen</div>

          <div class="col-md-12">
            <label class="small fw-bold text-dark mb-1">Árbitro *</label>
            <select v-model="formModal.id_arbitro" class="form-select shadow-none border-secondary-subtle" required :disabled="modoModal === 'editar'">
              <option value="">Seleccionar árbitro...</option>
              <option v-for="a in arbitrosOrdenados" :key="a.id" :value="a.id">
                {{ a.apellido }}, {{ a.nombre }}
              </option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="small fw-bold text-dark mb-1">Fecha del examen *</label>
            <input type="date" v-model="formModal.fecha_examen" class="form-control shadow-none border-secondary-subtle" required>
          </div>

          <div class="col-md-4">
            <label class="small fw-bold text-dark mb-1">Tipo de Examen *</label>
            <select v-model="formModal.tipo" class="form-select shadow-none border-secondary-subtle" required>
              <option value="">Seleccionar...</option>
              <option v-for="t in tiposExamen" :key="t" :value="t">{{ t.toUpperCase() }}</option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="small fw-bold text-dark mb-1">Asistencia *</label>
            <select v-model="formModal.asistencia" class="form-select shadow-none border-secondary-subtle" required>
              <option value="presente">Presente</option>
              <option value="ausente">Ausente</option>
            </select>
          </div>

          <div v-if="formModal.asistencia === 'presente'" class="col-12 mt-4 animate__animated animate__fadeIn">
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom border-2 pb-1">
              <span class="small fw-bold text-muted text-uppercase">Evaluaciones Detalladas</span>
              <button type="button" @click="agregarDetalle" class="btn btn-sm btn-danger py-0 d-flex align-items-center gap-1">
                <span class="material-icons" style="font-size: 16px;">add</span> Agregar Subtipo
              </button>
            </div>

            <div v-for="(detalle, index) in formModal.detalles" :key="index" class="row g-2 mb-2 align-items-end bg-light p-2 rounded border border-light-subtle">
              <div class="col-md-4">
                <label class="small fw-bold text-dark mb-1">Subtipo *</label>
                <select v-model="detalle.subtipo" class="form-select form-select-sm shadow-none border-secondary-subtle" required>
                  <option value="">Seleccionar...</option>
                  <option v-for="s in subtiposExamen" :key="s" :value="s">{{ s.toUpperCase() }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="small fw-bold text-dark mb-1">Estado *</label>
                <select v-model="detalle.estado" class="form-select form-select-sm shadow-none border-secondary-subtle" required>
                  <option :value="1">Aprobado</option>
                  <option :value="0">Desaprobado</option>
                  <option :value="3">No lo hizo</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="small fw-bold text-dark mb-1">Calificación</label>
                <input v-model="detalle.calificacion" maxlength="10" :disabled="detalle.estado == 3" class="form-control form-control-sm shadow-none border-secondary-subtle" placeholder="Ej: 8, 9.5, APTO">
              </div>
              <div class="col-md-1 text-end">
                <button v-if="formModal.detalles.length > 1" type="button" @click="quitarDetalle(index)" class="btn btn-sm btn-danger shadow-sm px-2 w-100" title="Eliminar fila">
                  <span class="material-icons" style="font-size: 16px;">delete</span>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="col-12 mt-3 animate__animated animate__fadeIn">
            <div class="alert alert-secondary border-secondary-subtle text-center small fw-bold mb-0">
              <i class="bi bi-info-circle me-1"></i> Al marcar "Ausente", no se requerirán evaluaciones y se guardará la ausencia de forma general.
            </div>
          </div>

        </div>
      </form>

      <template #footer>
        <button @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0">CANCELAR</button>
        <button type="submit" form="formExamen" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
          {{ modoModal === 'editar' ? 'GUARDAR CAMBIOS' : 'CREAR EXAMEN' }}
        </button>
      </template>
    </ModalBase>

    <ModalBase :show="mostrarModalHistorial" @close="mostrarModalHistorial = false" icono="history" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="800px">
  <template #header>
    <div class="d-flex flex-column align-items-center text-center w-100">
      <span class="fw-bold fs-5">Historial de Exámenes</span>
      <div class="text-muted small mt-1">{{ arbitroSeleccionado.apellido }}, {{ arbitroSeleccionado.nombre }}</div>
    </div>

  </template>

  <div class="table-responsive bg-white rounded shadow-sm border border-light-subtle mt-3" v-if="historialFiltrado.length > 0">
    <table class="table table-sm table-hover align-middle m-0" style="font-size: 0.8rem;">
      <thead class="table-light">
        <tr>
          <th class="py-2 ps-3 fw-bold text-uppercase text-muted">Fecha</th>
          <th class="py-2 fw-bold text-uppercase text-muted">Tipo</th>
          <th class="py-2 fw-bold text-uppercase text-muted">Evaluaciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="h in historialFiltrado" :key="h.id">
          <td class="text-dark fw-bold ps-3 py-2">{{ h.fecha_examen }}</td>
          <td class="text-uppercase text-muted py-2">{{ h.tipo }}</td>
          <td class="py-2">
            <div v-if="h.detalles && h.detalles.length === 1 && h.detalles[0].estado == 2">
                <span class="badge bg-secondary text-white">AUSENTE</span>
            </div>
            <div v-else class="d-flex flex-wrap gap-1">
              <span v-for="det in h.detalles" :key="det.id" class="badge border bg-light text-dark px-2 py-1">
                {{ det.subtipo.toUpperCase() }} -
                <span :class="claseTextoEstado(det.estado)">{{ textoEstado(det.estado) }}</span>
                <span v-if="det.calificacion && det.estado != 3" class="text-muted ms-1">({{ det.calificacion }})</span>
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-else class="text-center py-4 bg-light rounded border border-light-subtle">
    <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 32px;">history_toggle_off</span>
    <p class="mb-0 fw-bold text-muted small">No hay exámenes previos registrados para este árbitro.</p>
  </div>
</ModalBase>

    <ModalBase :show="mostrarModalExcel" @close="mostrarModalExcel = false" icono="description" colorIcono="bg-success-subtle text-success" maxWidth="750px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Exportar Listado</span>
          <div class="text-muted small mt-1">Marcá las columnas que querés incluir en el Excel</div>
        </div>
      </template>
      <div class="row g-2 text-start my-2 mx-auto shadow-sm p-3 rounded-3 bg-light border border-light-subtle" style="max-height: 250px; overflow-y: auto;">
        <div v-for="col in columnasExcel" :key="col.id" class="col-12 col-sm-6">
          <div class="form-check form-switch bg-white border p-2 rounded shadow-sm m-0">
            <input class="form-check-input ms-1 shadow-none" type="checkbox" role="switch" v-model="col.visible" :id="'col-'+col.id" style="cursor:pointer;">
            <label class="form-check-label ms-2 small fw-bold text-dark cursor-pointer" :for="'col-'+col.id">{{ col.label }}</label>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="mostrarModalExcel = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button @click="ejecutarDescargaExcel" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100">DESCARGAR EXCEL</button>
      </template>
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
  title: 'Exámenes | AAAB',
  meta: [{ name: 'description', content: 'Gestión de exámenes de los árbitros de la AAAB.' }],
})

const notificar = inject('notificar', (msg) => alert(msg.mensaje || msg))

const examenes = ref([])
const arbitros = ref([])

const tiposExamen = ['reunion', 'asamblea', 'curso', 'recuperatorio', 'otro']
const subtiposExamen = ['yoyo', 'teorico', 'mini', 'practica', 'otro']

const filtros = reactive({
  apellido: '',
  nombre: '',
  fecha_examen: '',
  tipo: '',
  subtipo: '',
  estado: ''
})

const cargando = ref(false)
const paginaActual = ref(1)
const registrosPorPagina = 10

const mostrarModal = ref(false)
const modoModal = ref('nuevo')
const mostrarFiltrosMobile = ref(false)

const mostrarModalHistorial = ref(false)
const arbitroSeleccionado = ref({ id: null, apellido: '', nombre: '' })

const formModalVacio = () => ({
  id: null,
  id_arbitro: '',
  fecha_examen: '',
  tipo: '',
  asistencia: 'presente',
  detalles: [
    { subtipo: '', calificacion: '', estado: 1 }
  ]
})

const formModal = ref(formModalVacio())

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, 50)
}

const crearNuevo = () => {
  formModal.value = formModalVacio()
  modoModal.value = 'nuevo'
  mostrarModal.value = true
}

const editarExamen = (examen) => {
  const esAusente = examen.detalles?.length === 1 && examen.detalles[0].estado == 2;

  formModal.value = {
    id: examen.id,
    id_arbitro: examen.id_arbitro,
    apellido: examen.apellido,
    nombre: examen.nombre,
    fecha_examen: convertirAFechaInput(examen.fecha_examen),
    tipo: examen.tipo,
    asistencia: esAusente ? 'ausente' : 'presente',
    detalles: esAusente
      ? [{ subtipo: '', calificacion: '', estado: 1 }]
      : JSON.parse(JSON.stringify(examen.detalles))
  }
  modoModal.value = 'editar'
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const agregarDetalle = () => {
  formModal.value.detalles.push({ subtipo: '', calificacion: '', estado: 1 })
}

const quitarDetalle = (index) => {
  formModal.value.detalles.splice(index, 1)
}

const verHistorialArbitro = (idArbitro, apellido, nombre) => {
  arbitroSeleccionado.value = { id: idArbitro, apellido, nombre }
  mostrarModalHistorial.value = true
}

const historialFiltrado = computed(() => {
  if (!arbitroSeleccionado.value.id) return []
  return examenes.value.filter(e => e.id_arbitro === arbitroSeleccionado.value.id)
})

const convertirAFechaInput = (fechaStr) => {
  if (!fechaStr) return ''
  const partes = fechaStr.split('/')
  if (partes.length < 3) return ''
  const [dia, mes, anio] = partes
  return `${anio}-${mes}-${dia}`
}

const convertirAFechaMysql = (fechaInput) => {
  if (!fechaInput) return null
  return `${fechaInput} 00:00:00`
}

const formatearFechaVisual = (fechaStr) => {
  if (!fechaStr) return ''
  return fechaStr.split(' ')[0]
}

const validarFormulario = () => {
  if (!formModal.value.id_arbitro) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Debés seleccionar un árbitro.', tipo: 'danger' })
    return false
  }
  if (!formModal.value.fecha_examen) {
    notificar({ titulo: 'Faltan datos', mensaje: 'La fecha del examen es requerida.', tipo: 'danger' })
    return false
  }
  if (!formModal.value.tipo) {
    notificar({ titulo: 'Faltan datos', mensaje: 'El tipo de examen es requerido.', tipo: 'danger' })
    return false
  }

  if (formModal.value.asistencia === 'presente') {
    if (formModal.value.detalles.length === 0) {
      notificar({ titulo: 'Faltan datos', mensaje: 'Debés cargar al menos una evaluación detallada.', tipo: 'danger' })
      return false
    }

    for (const det of formModal.value.detalles) {
      if (!det.subtipo) {
        notificar({ titulo: 'Faltan datos', mensaje: 'Asegurate de seleccionar el subtipo en todas las filas.', tipo: 'danger' })
        return false
      }
    }
  }

  return true
}

const prepararPayload = () => {
  let detallesLimpios = [];

  if (formModal.value.asistencia === 'ausente') {
    detallesLimpios = [{ subtipo: 'ausente', calificacion: '', estado: 2 }];
  } else {
    detallesLimpios = formModal.value.detalles.map(d => ({
      subtipo: String(d.subtipo).trim(),
      // Si el estado es "No lo hizo" (3), limpiamos la nota
      calificacion: d.estado == 3 ? '' : String(d.calificacion || '').trim(),
      estado: Number(d.estado)
    }))
  }

  return JSON.parse(JSON.stringify({
    id: formModal.value.id,
    id_arbitro: formModal.value.id_arbitro,
    fecha_examen: convertirAFechaMysql(formModal.value.fecha_examen),
    tipo: String(formModal.value.tipo).trim(),
    detalles: detallesLimpios
  }))
}

const confirmarAlta = async () => {
  if (!validarFormulario()) return
  cargando.value = true
  try {
    const res = await api.post({
      entity: 'examenes',
      action: 'guardarExamen',
      payload: prepararPayload(),
    })
    if (res.ok || res.success) {
      notificar({ titulo: 'Éxito', mensaje: 'Examen creado correctamente.', tipo: 'success' })
      cerrarModal()
      await cargarDatos()
    } else {
      notificar({ titulo: 'Error', mensaje: res.message || 'No se pudo crear el examen.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión al crear el examen.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const confirmarEdicion = async () => {
  if (!validarFormulario()) return
  cargando.value = true
  try {
    const res = await api.post({
      entity: 'examenes',
      action: 'editarExamen',
      payload: prepararPayload(),
    })
    if (res.ok || res.success) {
      notificar({ titulo: '¡Guardado!', mensaje: 'Examen actualizado correctamente.', tipo: 'success' })
      cerrarModal()
      await cargarDatos()
    } else {
      notificar({ titulo: 'Error', mensaje: res.message || 'Error al guardar.', tipo: 'danger' })
    }
  } catch{
    notificar({ titulo: 'Error Fatal', mensaje: 'Error de conexión con el servidor.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const textoEstado = (estado) => {
  if (estado == 1) return 'APROBADO'
  if (estado == 0) return 'DESAPROBADO'
  if (estado == 2) return 'AUSENTE'
  if (estado == 3) return 'NO LO HIZO'
  return 'OTRO'
}

const claseEstado = (estado) => {
  if (estado == 1) return 'bg-success text-white'
  if (estado == 0) return 'bg-danger text-white'
  if (estado == 2) return 'bg-secondary text-white'
  if (estado == 3) return 'bg-info text-white'
  return 'bg-dark text-white'
}

const claseDot = (estado) => {
  if (estado == 1) return 'bg-success'
  if (estado == 0) return 'bg-danger'
  if (estado == 2) return 'bg-secondary'
  if (estado == 3) return 'bg-info'
  return 'bg-dark'
}

const claseTextoEstado = (estado) => {
  if (estado == 1) return 'text-success'
  if (estado == 0) return 'text-danger'
  if (estado == 2) return 'text-secondary'
  if (estado == 3) return 'text-info'
  return 'text-dark'
}

const limpiarFiltros = () => { Object.keys(filtros).forEach(key => (filtros[key] = '')) }

const normalizarTexto = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const exportarExcel = () => { mostrarModalExcel.value = true }
const mostrarModalExcel = ref(false)

const columnasExcel = ref([
  { id: 'id', label: 'ID Examen', visible: true },
  { id: 'apellido', label: 'Apellido', visible: true },
  { id: 'nombre', label: 'Nombre', visible: true },
  { id: 'fecha_examen', label: 'Fecha Examen', visible: true },
  { id: 'tipo', label: 'Tipo', visible: true },
  { id: 'detalles', label: 'Evaluaciones Rendidas', visible: true }
])

const ejecutarDescargaExcel = () => {
  const cols = columnasExcel.value.filter(c => c.visible)
  const datos = examenesFiltrados.value.map(e => {
    const fila = {}
    cols.forEach(col => {
      let valor = e[col.id]
      if (col.id === 'fecha_examen') valor = formatearFechaVisual(e.fecha_examen)
      if (col.id === 'detalles') {
        const esAusente = e.detalles?.length === 1 && e.detalles[0].estado == 2;
        if (esAusente) {
          valor = 'AUSENTE AL EXAMEN';
        } else {
          valor = (e.detalles || []).map(det => `${det.subtipo.toUpperCase()}: ${textoEstado(det.estado)} ${det.calificacion && det.estado != 3 ? '('+det.calificacion+')' : ''}`).join(' | ')
        }
      }
      fila[col.label] = valor || ''
    })
    return fila
  })
  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Examenes')
  XLSX.writeFile(wb, 'Reporte_Examenes_AAAB.xlsx')
  mostrarModalExcel.value = false
}

const cargarDatos = async () => {
  try {
    const res = await api.get({ entity: 'examenes', action: 'obtenerExamenes', payload: {} })
    if (res.ok && res.payload) {
      examenes.value = res.payload
    }
  } catch (err) {
    console.error('Error al cargar exámenes:', err)
  }
}

const cargarArbitros = async () => {
  try {
    const res = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    if (res.ok && res.payload) {
      arbitros.value = res.payload
    }
  } catch (err) {
    console.error('Error al cargar árbitros:', err)
  }
}

const arbitrosOrdenados = computed(() => {
  return [...arbitros.value].sort((a, b) => {
    const cmp = String(a.apellido || '').localeCompare(String(b.apellido || ''), 'es')
    if (cmp !== 0) return cmp
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es')
  })
})

const examenesFiltrados = computed(() => {
  return examenes.value.filter(e => {
    if (filtros.apellido && !normalizarTexto(e.apellido).includes(normalizarTexto(filtros.apellido))) return false
    if (filtros.nombre && !normalizarTexto(e.nombre).includes(normalizarTexto(filtros.nombre))) return false
    if (filtros.tipo && e.tipo !== filtros.tipo) return false
    if (filtros.fecha_examen && !normalizarTexto(e.fecha_examen).includes(normalizarTexto(filtros.fecha_examen))) return false

    if (filtros.subtipo) {
      const tieneSubtipo = e.detalles?.some(det => det.subtipo === filtros.subtipo)
      if (!tieneSubtipo) return false
    }
    if (filtros.estado !== '') {
      const tieneEstado = e.detalles?.some(det => String(det.estado) === String(filtros.estado))
      if (!tieneEstado) return false
    }

    return true
  })
})

const totalPaginas = computed(() => Math.ceil(examenesFiltrados.value.length / registrosPorPagina) || 1)

const examenesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return examenesFiltrados.value.slice(inicio, inicio + registrosPorPagina)
})

const totalFiltrados = computed(() => examenesFiltrados.value.length)

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (nuevoTotal) => { if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal })

onMounted(() => {
  cargarDatos()
  cargarArbitros()
})
</script>

<style scoped>
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

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.btn-danger-subtle {
  background: #fee2e2;
  color: #dc3545;
  border: 1px solid transparent;
}
.btn-danger-subtle:hover {
  background: #fecaca;
}

.animate__animated {
  animation-duration: 0.5s;
}

.tabla-container {
  overflow-x: auto;
}

.tabla-fija {
  border-collapse: separate;
  border-spacing: 0;
}

.tabla-fija th,
.tabla-fija td {
  border-left: none !important;
  border-right: none !important;
}

.col-fija {
  position: sticky;
  background-color: inherit;
  z-index: 10;
}

.tabla-fija thead .col-fija {
  background-color: #f8f9fa;
  z-index: 12;
}

.tabla-fija tbody .col-fija {
  background-color: #ffffff;
}

.col-id { left: 0; min-width: 60px; }
.col-acciones { left: 60px; min-width: 80px; }
.col-apellido { left: 140px; min-width: 150px; }
.col-nombre { left: 290px; min-width: 150px; }
.col-nombre::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 1px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);
}
</style>
