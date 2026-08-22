<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3 position-relative">
            <!-- Dot rojo (esquina, tipo la captura) -->
            <span v-if="pendientes > 0" class="dot-notif"></span>

            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4 flex-wrap">
              <i class="bi bi-x-octagon-fill me-1"></i>
              <span>Designaciones Rechazadas</span>
              <span v-if="pendientes > 0" class="badge-nuevos rounded-pill">
                {{ pendientes }} {{ pendientes === 1 ? 'NUEVO' : 'NUEVOS' }}
              </span>
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ rechazosFiltrados.length }} rechazos</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="obtenerRechazos" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- FILTROS -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Rechazos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-6 col-md-3">
              <input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido...">
            </div>
            <div class="col-6 col-md-3">
              <input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Nombre...">
            </div>
            <div class="col-6 col-md-3">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none">
                <option value="">ESTADO (TODOS)</option>
                <option value="creado">CREADO</option>
                <option value="justificado">JUSTIFICADO</option>
                <option value="injustificado">INJUSTIFICADO</option>
                <option value="borrado">BORRADO</option>
              </select>
            </div>
            <div class="col-6 col-md-3">
              <select v-model="filtros.motivo" class="form-select form-select-sm shadow-none">
                <option value="">MOTIVO (TODOS)</option>
                <option v-for="op in opcionesMotivo" :key="op.valor" :value="op.valor">{{ op.etiqueta }}</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando designaciones rechazadas...</p>
          </div>

          <template v-else>
          <!-- TABLA (Escritorio) -->
          <div class="d-none d-md-block table-responsive border rounded shadow-sm">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted" style="font-size: 0.75rem; width: 1px;">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Acciones</th>
                  <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Árbitro</th>
                  <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Partido</th>
                  <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Motivo</th>
                  <th class="py-3 text-center pe-3 text-uppercase text-muted" style="font-size: 0.75rem;">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rechazosPaginados" :key="r.id">
                  <td class="ps-3 text-muted fw-bold font-monospace">{{ r.id }}</td>
                  <td class="text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="editarRechazo(r)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar / Resolver">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="verHistorialRechazo(r)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver Historial">
                        <span class="material-icons" style="font-size:16px;">manage_search</span>
                      </button>
                      <button @click="borrarRechazo(r)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Borrar">
                        <span class="material-icons" style="font-size:16px;">delete</span>
                      </button>
                    </div>
                  </td>
                  <td class="fw-bold text-uppercase text-dark">{{ r.apellido }}, {{ r.nombre }}</td>
                  <td class="text-muted small">
                    <div class="fw-bold text-dark">{{ r.local }} vs {{ r.visitante }}</div>
                    <div>{{ r.categoria_division }} · {{ formatearFechaVista(r.fecha) }}</div>
                  </td>
                  <td class="text-muted small">{{ etiquetaMotivo(r.motivo) }}</td>
                  <td class="text-center pe-3">
                    <span :class="['badge-status-sm', r.estado]">{{ r.estado.toUpperCase() }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS (Celular) -->
          <div class="d-md-none p-3 bg-light">
            <div v-for="r in rechazosPaginados" :key="'mob-'+r.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
              <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="text-uppercase text-dark fw-bold" style="font-size: 1.05rem;">
                  {{ r.apellido }}, {{ r.nombre }}
                </div>
                <div class="small text-muted fw-bold font-monospace">#{{ r.id }}</div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold text-dark">{{ r.local }} vs {{ r.visitante }}</span>
                  <span :class="['badge-status-sm', r.estado]" style="font-size: 0.7rem; padding: 3px 10px;">{{ r.estado.toUpperCase() }}</span>
                </div>

                <div class="bg-light p-2 rounded border small mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Categoría:</span>
                    <span class="fw-bold text-dark">{{ r.categoria_division }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Fecha:</span>
                    <span class="fw-bold text-dark">{{ formatearFechaVista(r.fecha) }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Motivo:</span>
                    <span class="fw-bold text-dark text-end ms-2">{{ etiquetaMotivo(r.motivo) }}</span>
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button @click="editarRechazo(r)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                    <span class="material-icons" style="font-size: 16px;">edit</span> RESOLVER
                  </button>
                  <button @click="verHistorialRechazo(r)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center">
                    <span class="material-icons" style="font-size: 18px;">manage_search</span>
                  </button>
                  <button @click="borrarRechazo(r)" class="btn btn-sm btn-outline-danger shadow-sm px-3 d-flex justify-content-center align-items-center">
                    <span class="material-icons" style="font-size: 18px;">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- EMPTY STATE -->
          <div v-if="rechazosPaginados.length === 0" class="text-center p-4 p-md-5 bg-white rounded shadow-sm border m-3">
            <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 48px;">check_circle</span>
            <p class="text-muted m-0 fw-bold">No hay designaciones rechazadas.</p>
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
          </template>

        </div>
      </div>
    </div>

    <!-- ==============================================
         MODAL EDITAR / RESOLVER RECHAZO
         ============================================== -->
    <ModalBase
      :show="mostrarModal"
      @close="cerrarModal"
      icono="gavel"
      colorIcono="bg-danger-subtle text-danger"
      maxWidth="600px"
    >
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Resolver Rechazo</span>
          <div v-if="rechazoSeleccionado" class="text-muted small" style="font-size: 0.85rem;">
            #{{ rechazoSeleccionado.id }} — {{ rechazoSeleccionado.apellido }}, {{ rechazoSeleccionado.nombre }}
          </div>
        </div>
      </template>

      <div v-if="rechazoSeleccionado" class="text-start mt-2">
        <div class="bg-light border rounded p-3 mb-3 small">
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">Partido:</span>
            <span class="fw-bold text-dark text-end ms-2">{{ rechazoSeleccionado.local }} vs {{ rechazoSeleccionado.visitante }}</span>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">Categoría:</span>
            <span class="fw-bold text-dark">{{ rechazoSeleccionado.categoria_division }}</span>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">Fecha:</span>
            <span class="fw-bold text-dark">{{ formatearFechaVista(rechazoSeleccionado.fecha) }}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span class="text-muted">Motivo declarado:</span>
            <span class="fw-bold text-dark text-end ms-2">{{ etiquetaMotivo(rechazoSeleccionado.motivo) }}</span>
          </div>
        </div>

        <label class="small fw-bold text-dark mb-1">Estado del rechazo</label>
        <select v-model="estadoEdicion" class="form-select shadow-none border-secondary-subtle">
          <option value="creado">Creado</option>
          <option value="justificado">Justificado</option>
          <option value="injustificado">Injustificado</option>
          <option value="borrado">Borrado</option>
        </select>

        <!-- Aviso según estado -->
        <div v-if="estadoEdicion === 'injustificado'" class="alert alert-danger small py-2 px-3 d-flex align-items-start gap-2 mt-3 mb-0">
          <i class="bi bi-exclamation-octagon-fill mt-1"></i>
          <span>Al marcar como <strong>injustificado</strong>, el árbitro será enviado al <strong>Tribunal de Ética</strong>.</span>
        </div>
        <div v-else-if="estadoEdicion === 'justificado'" class="alert alert-success small py-2 px-3 d-flex align-items-start gap-2 mt-3 mb-0">
          <i class="bi bi-check-circle-fill mt-1"></i>
          <span>Al marcar como <strong>justificado</strong>, el árbitro <strong>NO será enviado</strong> al Tribunal de Ética.</span>
        </div>
      </div>

      <template #footer>
        <button type="button" @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0" :disabled="guardando">CANCELAR</button>
        <button type="button" @click="confirmarEdicion" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando">
          <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR CAMBIOS
        </button>
      </template>
    </ModalBase>

    <!-- ==============================================
         MODAL HISTORIAL DE RECHAZOS DEL ARBITRO
         ============================================== -->
    <ModalBase
      :show="mostrarModalHistorial"
      @close="mostrarModalHistorial = false"
      icono="manage_search"
      colorIcono="bg-warning-subtle text-warning-emphasis"
      maxWidth="750px"
    >
      <template #header>
        <div class="text-center">
          <div class="fw-bold fs-5">Historial de {{ arbitroHistorial?.apellido }}, {{ arbitroHistorial?.nombre }}</div>
          <span v-if="!cargandoHistorial" class="badge bg-dark rounded-pill fs-6" title="Total de rechazos">{{ historial.length }}</span>
        </div>
      </template>

      <div v-if="cargandoHistorial" class="text-center py-5">
        <span class="spinner-border text-warning"></span>
      </div>

      <div v-else-if="historial.length === 0" class="text-center py-4 text-muted bg-light border rounded">
        Este árbitro no tiene otros rechazos registrados.
      </div>

      <div v-else>
        <!-- Tabla Historial (Escritorio) -->
        <div class="table-responsive d-none d-md-block bg-white rounded shadow-sm border border-light-subtle">
          <table class="table table-sm table-hover align-middle m-0" style="font-size: 0.85rem;">
            <thead class="table-light">
              <tr>
                <th class="py-2 ps-3 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">Partido</th>
                <th class="py-2 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">Fecha</th>
                <th class="py-2 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">Motivo</th>
                <th class="text-center py-2 pe-3 fw-bold text-uppercase text-muted" style="width: 150px; font-size: 0.75rem;">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historial" :key="h.id">
                <td class="py-3 ps-3">
                  <div class="fw-bold text-dark">{{ h.local }} vs {{ h.visitante }}</div>
                  <div class="text-muted small">{{ h.categoria_division }}</div>
                </td>
                <td class="text-nowrap text-primary fw-bold py-3">{{ formatearFechaVista(h.fecha) }}</td>
                <td class="text-muted py-3" style="white-space: normal; word-wrap: break-word;">{{ etiquetaMotivo(h.motivo) }}</td>
                <td class="text-center py-3 pe-3">
                  <span :class="['badge-status-sm', h.estado]">{{ h.estado.toUpperCase() }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tarjetas Historial (Móvil) -->
        <div class="d-md-none d-flex flex-column gap-2">
          <div v-for="h in historial" :key="'mob-hist-'+h.id" class="border border-light-subtle rounded-3 p-3 shadow-sm bg-light">
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
              <span class="fw-bold text-dark">{{ h.local }} vs {{ h.visitante }}</span>
              <span :class="['badge-status-sm', h.estado]">{{ h.estado.toUpperCase() }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center text-muted small mt-1">
              <span><strong>Fecha:</strong> {{ formatearFechaVista(h.fecha) }}</span>
            </div>
            <div class="text-muted small mt-1"><strong>Motivo:</strong> {{ etiquetaMotivo(h.motivo) }}</div>
          </div>
        </div>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api'
import ExcelJS from 'exceljs'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Designaciones Rechazadas | AAAB',
  meta: [{ name: 'description', content: 'Gestión de designaciones rechazadas por los árbitros.' }],
})

const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

// Mismos motivos que ve el árbitro al rechazar
const opcionesMotivo = [
  { valor: 'no_llego', etiqueta: 'No llego a jugar' },
  { valor: 'club_vinculo', etiqueta: 'No puedo pitar ese club (jugué ahí o vínculo personal)' },
  { valor: 'club_otra', etiqueta: 'No puedo pitar ese club (problema de otra índole)' },
  { valor: 'licencia', etiqueta: 'Tengo licencia aprobada' },
  { valor: 'fuera_horario', etiqueta: 'Estoy designado fuera de mi disponibilidad horaria' },
  { valor: 'otro', etiqueta: 'Otro (motivo libre)' }
]

// El motivo puede venir como clave conocida o como texto libre (opción "otro")
const etiquetaMotivo = (valor) => {
  const op = opcionesMotivo.find(o => o.valor === valor)
  return op ? op.etiqueta : (valor || '—')
}

const rechazos = ref([])
const cargando = ref(false)

const filtros = reactive({ apellido: '', nombre: '', estado: '', motivo: '' })
const mostrarFiltrosMobile = ref(false)

const paginaActual = ref(1)
const registrosPorPagina = 10

const normalizar = (t) => t ? t.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : ''
const formatearFechaVista = (f) => f ? String(f).split(' ')[0].split('-').reverse().join('/') : ''

const rechazosFiltrados = computed(() => {
  return rechazos.value.filter(r => {
    const matchApe = normalizar(r.apellido).includes(normalizar(filtros.apellido))
    const matchNom = normalizar(r.nombre).includes(normalizar(filtros.nombre))
    const matchEst = filtros.estado === '' || r.estado === filtros.estado
    const matchMot = filtros.motivo === '' || r.motivo === filtros.motivo
    return matchApe && matchNom && matchEst && matchMot
  })
})

// Sin resolver: alimentan el badge de notificación con dot
const pendientes = computed(() => rechazos.value.filter(r => r.estado === 'creado').length)

const totalPaginas = computed(() => Math.ceil(rechazosFiltrados.value.length / registrosPorPagina) || 1)
const rechazosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return rechazosFiltrados.value.slice(inicio, inicio + registrosPorPagina)
})

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (nuevo) => { if (paginaActual.value > nuevo) paginaActual.value = nuevo })

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  setTimeout(() => {
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 50)
}

const obtenerRechazos = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerDesignacionesRechazadas'
    })
    if ((res.ok || res.success) && Array.isArray(res.payload)) {
      rechazos.value = res.payload
    }
  } catch (err) {
    console.error('Error al obtener rechazos:', err)
  } finally {
    cargando.value = false
  }
}

/* ====================================================
   MODAL EDITAR / RESOLVER
   ==================================================== */
const mostrarModal = ref(false)
const rechazoSeleccionado = ref(null)
const estadoEdicion = ref('creado')
const guardando = ref(false)

const editarRechazo = (r) => {
  rechazoSeleccionado.value = r
  estadoEdicion.value = r.estado || 'creado'
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  rechazoSeleccionado.value = null
}

const confirmarEdicion = async () => {
  if (!rechazoSeleccionado.value) return
  guardando.value = true
  try {
    const res = await api.post({
      entity: 'designaciones',
      action: 'actualizarEstadoRechazo',
      payload: {
        id: rechazoSeleccionado.value.id,
        estado: estadoEdicion.value
      }
    })

    if (res.ok || res.success) {
      // Reflejar el cambio en la lista
      const item = rechazos.value.find(r => r.id === rechazoSeleccionado.value.id)
      if (item) item.estado = estadoEdicion.value
      cerrarModal()
      toast({ titulo: 'Guardado', mensaje: 'El estado del rechazo se actualizó correctamente.', tipo: 'success' })
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al actualizar rechazo:', err)
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudieron guardar los cambios.', tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}

/* ====================================================
   BORRAR RECHAZO (borrado lógico → estado = 'borrado')
   El rechazo sigue apareciendo en la lista con ese estado.
   ==================================================== */
const borrarRechazo = (r) => {
  notificar({
    titulo: '¿Borrar rechazo?',
    mensaje: `Se marcará como borrado el rechazo de ${r.apellido}, ${r.nombre} (${r.local} vs ${r.visitante}).`,
    tipo: 'danger',
    alConfirmar: async () => {
      try {
        const res = await api.post({
          entity: 'designaciones',
          action: 'actualizarEstadoRechazo',
          payload: { id: r.id, estado: 'borrado' }
        })

        if (res.ok || res.success) {
          const item = rechazos.value.find(x => x.id === r.id)
          if (item) item.estado = 'borrado'
          toast({ titulo: 'Borrado', mensaje: 'El rechazo fue marcado como borrado.', tipo: 'success' })
        } else {
          throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
        }
      } catch (err) {
        console.error('Error al borrar rechazo:', err)
        toast({ titulo: 'Error', mensaje: err.message || 'No se pudo borrar el rechazo.', tipo: 'danger' })
      }
    }
  })
}

/* ====================================================
   MODAL HISTORIAL (todos los rechazos del árbitro)
   Solo lectura: el estado se resuelve desde el botón Editar.
   ==================================================== */
const mostrarModalHistorial = ref(false)
const cargandoHistorial = ref(false)
const arbitroHistorial = ref(null)
const historial = ref([])

const verHistorialRechazo = async (r) => {
  arbitroHistorial.value = r
  mostrarModalHistorial.value = true
  cargandoHistorial.value = true
  historial.value = []
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerHistorialRechazos',
      payload: { idArbitro: r.id_arbitro }
    })
    if ((res.ok || res.success) && Array.isArray(res.payload)) {
      historial.value = res.payload
    }
  } catch (err) {
    console.error('Error al cargar historial de rechazos:', err)
  } finally {
    cargandoHistorial.value = false
  }
}

/* ====================================================
   EXPORTAR EXCEL
   ==================================================== */
const exportarExcel = async () => {
  const data = rechazosFiltrados.value.map(r => ({
    'ID': r.id,
    'Apellido': r.apellido,
    'Nombre': r.nombre,
    'Local': r.local,
    'Visitante': r.visitante,
    'Categoría': r.categoria_division,
    'Fecha': formatearFechaVista(r.fecha),
    'Motivo': etiquetaMotivo(r.motivo),
    'Estado': (r.estado || '').toUpperCase()
  }))

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Rechazos')

  const claves = Object.keys(data[0] || {})
  ws.columns = claves.map(clave => ({ header: clave, key: clave, width: 20 }))
  data.forEach(fila => ws.addRow(fila))
  if (claves.length) ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Designaciones_Rechazadas_AAAB.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}

const limpiarFiltros = () => {
  filtros.apellido = ''; filtros.nombre = ''; filtros.estado = ''; filtros.motivo = ''
}

onMounted(obtenerRechazos)
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

.animate__animated { animation-duration: 0.5s; }

/* ====================================================
   BADGE "NUEVOS" + DOT (estilo tarjeta de pedidos)
   ==================================================== */
.badge-nuevos {
  background: #dc3545;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  text-transform: uppercase;
  line-height: 1;
}

.dot-notif {
  position: absolute;
  top: -4px;
  left: -6px;
  width: 12px;
  height: 12px;
  background: #dc3545;
  border: 2px solid #fff;
  border-radius: 50%;
  animation: pulso 1.5s infinite;
}

@keyframes pulso {
  0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(220, 53, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
}

/* ====================================================
   BADGES DE ESTADO
   ==================================================== */
.badge-status-sm {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
}
.justificado { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.creado { background: #fef3c7; color: #d97706; border: 1px solid #fde047; }
.injustificado { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.borrado { background: #e5e7eb; color: #4b5563; border: 1px solid #d1d5db; }
</style>
