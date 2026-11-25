<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <!-- HEADER -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion d-flex align-items-center flex-wrap gap-2">
            <span>Rechazos de los árbitros · Total: {{ rechazosFiltrados.length }} rechazos</span>
            <span v-if="pendientes > 0" class="badge-nuevos rounded-pill">
              {{ pendientes }} {{ pendientes === 1 ? 'NUEVO' : 'NUEVOS' }}
            </span>
          </p>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="obtenerRechazos" />

            <BotonHerramienta tipo="filtros" class="d-md-none" :solo-icono-en-celular="false" @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" />

            <BotonHerramienta tipo="limpiar" @click="limpiarFiltros" />

            <BotonHerramienta tipo="excel" @click="exportarExcel" />
          </div>
        </div>

        <!-- FILTROS -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Rechazos</span>
            <button type="button" aria-label="Cerrar filtros" title="Cerrar filtros" @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-6 col-md-3">
              <input aria-label="Árbitro (apellido o nombre)" v-model="filtros.arbitro" class="form-control form-control-sm shadow-none" placeholder="ÁRBITRO (APELLIDO O NOMBRE)...">
            </div>
            <div class="col-6 col-md-2">
              <select aria-label="Filtrar por año" v-model="filtros.anio" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">AÑO</option>
                <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select aria-label="Filtrar por estado" v-model="filtros.estado" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">ESTADO</option>
                <option value="creado">CREADO</option>
                <option value="justificado">JUSTIFICADO</option>
                <option value="injustificado">INJUSTIFICADO</option>
                <option value="borrado">BORRADO</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select aria-label="Filtrar por función" v-model="filtros.funcion" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">FUNCIÓN</option>
                <option value="arbitro">ÁRBITRO</option>
                <option value="delegado">DELEGADO TÉCNICO</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-danger rounded-pill w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <EstadoCargando v-if="cargando" texto="Cargando designaciones rechazadas" />

          <template v-else>
          <!-- TABLA (Escritorio) -->
          <div class="d-none d-md-block table-responsive border rounded shadow-sm">
            <table class="table table-hover align-middle mb-0 texto-075">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted texto-075" style="width: 1px;">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted texto-075">Acciones</th>
                  <th class="py-3 text-uppercase text-muted texto-075">Árbitro</th>
                  <th class="py-3 text-uppercase text-muted texto-075">Partido</th>
                  <th class="py-3 text-uppercase text-muted texto-075">Función</th>
                  <th class="py-3 text-uppercase text-muted texto-075">Motivo</th>
                  <th class="py-3 text-center pe-3 text-uppercase text-muted texto-075">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rechazosPaginados" :key="r.id">
                  <td class="ps-3 text-muted fw-bold font-monospace">{{ r.id }}</td>
                  <td class="text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="editarRechazo(r)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" title="Editar / Resolver">
                        <i class="bi bi-pencil texto-16px"></i>
                      </button>
                      <button @click="verHistorialRechazo(r)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver Historial">
                        <i class="bi bi-search texto-16px"></i>
                      </button>
                      <button @click="borrarRechazo(r)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Borrar">
                        <i class="bi bi-trash texto-16px"></i>
                      </button>
                    </div>
                  </td>
                  <td class="fw-bold text-uppercase text-dark">{{ r.apellido }}, {{ r.nombre }}</td>
                  <td class="text-muted small">
                    <div class="fw-bold text-dark">{{ r.local }} vs {{ r.visitante }}</div>
                    <div>{{ r.categoria_division }} · {{ formatearFechaVista(r.fecha) }}</div>
                  </td>
                  <td>
                    <span class="badge-funcion" :class="r.funcion === 'delegado' ? 'func-delegado' : 'func-arbitro'">
                      {{ etiquetaFuncion(r.funcion) }}
                    </span>
                  </td>
                  <td class="text-muted small">{{ etiquetaMotivo(r.motivo) }}</td>
                  <td class="text-center pe-3">
                    <span :class="['estado-pill', claseEstadoRechazo(r.estado)]">{{ r.estado.toUpperCase() }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS (Celular) -->
          <div class="d-md-none p-3 bg-light">
            <div v-for="r in rechazosPaginados" :key="'mob-'+r.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
              <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="text-uppercase text-dark fw-bold texto-105">
                  {{ r.apellido }}, {{ r.nombre }}
                </div>
                <div class="small text-muted fw-bold font-monospace">#{{ r.id }}</div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold text-dark">{{ r.local }} vs {{ r.visitante }}</span>
                  <span class="texto-07" :class="['estado-pill', claseEstadoRechazo(r.estado)]">{{ r.estado.toUpperCase() }}</span>
                </div>

                <div class="bg-light p-2 rounded border small mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Categoría:</span>
                    <span class="fw-bold text-dark">{{ r.categoria_division }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Función:</span>
                    <span class="fw-bold text-dark">{{ etiquetaFuncion(r.funcion) }}</span>
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
                  <button @click="editarRechazo(r)" class="btn btn-sm btn-outline-secondary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                    <i class="bi bi-pencil texto-16px"></i> RESOLVER
                  </button>
                  <button type="button" aria-label="Ver historial del rechazo" title="Ver historial del rechazo" @click="verHistorialRechazo(r)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center">
                    <i class="bi bi-search texto-18px"></i>
                  </button>
                  <button type="button" aria-label="Eliminar rechazo" title="Eliminar rechazo" @click="borrarRechazo(r)" class="btn btn-sm btn-outline-danger shadow-sm px-3 d-flex justify-content-center align-items-center">
                    <i class="bi bi-trash texto-18px"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- EMPTY STATE -->
          <EstadoVacio v-if="rechazosPaginados.length === 0" icono="bi-check-circle" titulo="No hay designaciones rechazadas" />

          <!-- PAGINACIÓN -->
          <BarraPaginacion v-model="paginaActual" :total="totalPaginas" class="mt-4 mb-3" />
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
          <div v-if="rechazoSeleccionado" class="text-muted small texto-085">
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
            <span class="text-muted">Función:</span>
            <span class="fw-bold text-dark">{{ etiquetaFuncion(rechazoSeleccionado.funcion) }}</span>
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
        <select aria-label="Estado del rechazo" v-model="estadoEdicion" class="form-select shadow-none border-secondary-subtle">
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
        <button type="button" @click="confirmarEdicion" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando">
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
          <table class="table table-sm table-hover align-middle m-0 texto-085">
            <thead class="table-light">
              <tr>
                <th class="py-2 ps-3 fw-bold text-uppercase text-muted texto-075">Partido</th>
                <th class="py-2 fw-bold text-uppercase text-muted texto-075">Función</th>
                <th class="py-2 fw-bold text-uppercase text-muted texto-075">Fecha</th>
                <th class="py-2 fw-bold text-uppercase text-muted texto-075">Motivo</th>
                <th class="text-center py-2 pe-3 fw-bold text-uppercase text-muted texto-075" style="width: 150px;">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historial" :key="h.id">
                <td class="py-3 ps-3">
                  <div class="fw-bold text-dark">{{ h.local }} vs {{ h.visitante }}</div>
                  <div class="text-muted small">{{ h.categoria_division }}</div>
                </td>
                <td class="py-3">
                  <span class="badge-funcion" :class="h.funcion === 'delegado' ? 'func-delegado' : 'func-arbitro'">
                    {{ etiquetaFuncion(h.funcion) }}
                  </span>
                </td>
                <td class="text-nowrap text-danger fw-bold py-3">{{ formatearFechaVista(h.fecha) }}</td>
                <td class="text-muted py-3 text-wrap" style="word-wrap: break-word;">{{ etiquetaMotivo(h.motivo) }}</td>
                <td class="text-center py-3 pe-3">
                  <span :class="['estado-pill', claseEstadoRechazo(h.estado)]">{{ h.estado.toUpperCase() }}</span>
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
              <span :class="['estado-pill', claseEstadoRechazo(h.estado)]">{{ h.estado.toUpperCase() }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center text-muted small mt-1">
              <span><strong>Fecha:</strong> {{ formatearFechaVista(h.fecha) }}</span>
              <span><strong>Función:</strong> {{ etiquetaFuncion(h.funcion) }}</span>
            </div>
            <div class="text-muted small mt-1"><strong>Motivo:</strong> {{ etiquetaMotivo(h.motivo) }}</div>
          </div>
        </div>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { anioActual, conAnioActual } from '@/utils/anios'
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { normalizarTexto } from '@/utils/texto'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import { usePaginacion } from '@/composables/usePaginacion'
import { cargarExcelJS } from '@/utils/librerias'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Designaciones Rechazadas | AAAB',
  meta: [{ name: 'description', content: 'Gestión de designaciones rechazadas por los árbitros.' }],
})

const notificar = inject('notificar')
const toast = inject('toast')

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

// Función del rechazo: 'arbitro' | 'delegado'
const etiquetaFuncion = (valor) => (valor === 'delegado' ? 'DELEGADO TÉCNICO' : 'ÁRBITRO')

const rechazos = ref([])
const cargando = ref(false)

const filtros = reactive({ arbitro: '', estado: '', funcion: '', anio: anioActual() })
const mostrarFiltrosMobile = ref(false)

const paginaActual = ref(1)
const registrosPorPagina = 10

const formatearFechaVista = (f) => f ? String(f).split(' ')[0].split('-').reverse().join('/') : ''

// Extrae el año (AAAA) de la fecha del partido, en formato 'AAAA-MM-DD ...'. '' si no hay.
const anioDeFecha = (f) => {
  if (!f) return ''
  const t = String(f).trim().slice(0, 10)
  return /^\d{4}-/.test(t) ? t.slice(0, 4) : ''
}

// Años presentes en los rechazos (según la fecha del partido), ordenados descendente.
const aniosDisponibles = computed(() => {
  const set = new Set()
  rechazos.value.forEach(r => {
    const a = anioDeFecha(r.fecha)
    if (a) set.add(a)
  })
  return conAnioActual(set)
})

const rechazosFiltrados = computed(() => {
  return rechazos.value.filter(r => {
    const nombreCompleto = `${r.apellido || ''} ${r.nombre || ''}`
    const matchArb = normalizarTexto(nombreCompleto).includes(normalizarTexto(filtros.arbitro))
    const matchEst = filtros.estado === '' || r.estado === filtros.estado
    const matchFun = filtros.funcion === '' || r.funcion === filtros.funcion
    const matchAnio = filtros.anio === '' || anioDeFecha(r.fecha) === filtros.anio
    return matchArb && matchEst && matchFun && matchAnio
  })
})

// Color del estado del rechazo: creado = sin resolver (ámbar)
const claseEstadoRechazo = (estado) => (estado === 'creado' ? 'estado-pendiente' : 'estado-' + estado)

// Sin resolver: alimentan el badge de notificación con dot
const pendientes = computed(() => rechazos.value.filter(r => r.estado === 'creado').length)

const { totalPaginas, paginados: rechazosPaginados } = usePaginacion(rechazosFiltrados, registrosPorPagina, paginaActual)

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })


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
    'Función': etiquetaFuncion(r.funcion),
    'Fecha': formatearFechaVista(r.fecha),
    'Motivo': etiquetaMotivo(r.motivo),
    'Estado': (r.estado || '').toUpperCase()
  }))

  const wb = new (await cargarExcelJS()).Workbook()
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
  filtros.arbitro = ''; filtros.estado = ''; filtros.funcion = ''; filtros.anio = anioActual()
}

onMounted(obtenerRechazos)
</script>

<style scoped>

/* ====================================================
   BADGE "NUEVOS" + DOT (estilo tarjeta de pedidos)
   ==================================================== */
.badge-nuevos {
  background: #dc2626;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  text-transform: uppercase;
  line-height: 1;
}

@keyframes pulso {
  0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
}

/* ====================================================
   BADGE DE FUNCIÓN (árbitro / delegado técnico)
   ==================================================== */
.badge-funcion {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
}
.func-arbitro { background: var(--o-chip, #f1f5f9); color: var(--o-texto-medio, #334155); border: 1px solid var(--o-borde, #cbd5e1); }
.func-delegado { background: var(--o-violeta-fondo, #f3e8ff); color: var(--o-violeta-texto, #7e22ce); border: 1px solid var(--o-violeta-borde, #e9d5ff); }

</style>
