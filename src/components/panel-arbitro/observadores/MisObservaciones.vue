<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 mb-4 w-100 mx-auto" style="border-radius: 12px; overflow: hidden;">

      <!-- ENCABEZADO -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom border-2 border-danger gap-3">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-journal-check me-1"></i> Mis Observaciones Realizadas
          </h4>
          <p class="text-muted small m-0 mt-1">Historial de evaluaciones de desempeño arbitral</p>
        </div>

        <div class="d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
          <button @click="obtenerObservaciones" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Actualizar">
            <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
            <span v-else class="material-icons" style="font-size: 20px;">refresh</span>
            <span class="d-none d-md-inline fw-bold text-dark" style="font-size: 0.8rem;">Actualizar</span>
          </button>

          <button @click="limpiarFiltros" :disabled="!busqueda" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Limpiar filtros">
            <span class="material-icons" style="font-size: 20px;">filter_alt_off</span>
            <span class="d-none d-md-inline fw-bold text-dark" style="font-size: 0.8rem;">Limpiar</span>
          </button>

          <RouterLink to="/panel-arbitro/observaciones/carga" class="text-decoration-none">
            <button class="btn btn-danger shadow-sm py-2 d-flex align-items-center gap-2" title="Nueva Evaluación">
              <span class="material-icons" style="font-size: 20px;">add</span>
              <span class="d-none d-md-inline fw-bold" style="font-size: 0.8rem;">Nueva Evaluación</span>
            </button>
          </RouterLink>
        </div>
      </div>

      <div class="card-body bg-white p-0">

        <!-- SPINNER DE CARGA -->
        <div v-if="cargando" class="text-center p-5 bg-white">
          <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
          <p class="text-muted mt-3 fw-bold">Cargando observaciones...</p>
        </div>

        <template v-else>
          <!-- FILTRO DE BÚSQUEDA -->
          <div class="p-3 p-md-4 border-bottom bg-light">
            <div class="input-group shadow-sm rounded-pill overflow-hidden border border-secondary-subtle bg-white">
              <span class="input-group-text bg-white border-0 text-muted ps-3"><i class="bi bi-search"></i></span>
              <input
                v-model="busqueda"
                type="text"
                class="form-control border-0 py-2 shadow-none"
                placeholder="Buscar por árbitro, categoría o partido..."
              >
            </div>
          </div>

          <!-- TABLA (Escritorio) -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.8rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 text-uppercase text-muted ps-3" style="width: 110px;">Fecha</th>
                  <th class="py-3 text-uppercase text-muted">Árbitro Evaluado</th>
                  <th class="py-3 text-uppercase text-muted">Categoría / Partido</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="width: 90px;">Puntaje</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="width: 140px;">Estado</th>
                  <th class="py-3 text-center text-uppercase text-muted pe-3" style="width: 200px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="obs in observacionesPaginadas" :key="obs.id">
                  <td class="fw-bold text-muted ps-3">{{ formatearFecha(obs.fecha_partido) }}</td>
                  <td class="fw-bold text-uppercase text-dark">
                    <div>{{ obs.arb1 }}</div>
                    <div v-if="obs.arb2 && obs.ref2_id">{{ obs.arb2 }}</div>
                  </td>
                  <td class="text-dark">
                    <div class="fw-bold">{{ obs.categoria || obs.categoria_edad || '-' }}</div>
                    <div class="text-muted">{{ obs.equipo_local }} vs {{ obs.equipo_visitante }}</div>
                  </td>
                  <td class="text-center fw-bold text-danger">{{ obs.puntaje_final ?? '-' }}</td>
                  <td class="text-center">
                    <span :class="badgeEstado(obs.estado)">
                      {{ etiquetaEstado(obs.estado) }}
                    </span>
                  </td>
                  <td class="text-center pe-3">
                    <div class="d-flex justify-content-center gap-1">
                      <!-- Ver detalle: siempre disponible -->
                      <button class="btn btn-sm btn-light border shadow-sm rounded-pill px-2 d-flex align-items-center gap-1 text-secondary" @click="verDetalle(obs)" :disabled="cargandoDetalleId === obs.id" title="Ver detalle">
                        <span v-if="cargandoDetalleId === obs.id" class="spinner-border spinner-border-sm"></span>
                        <span v-else class="material-icons" style="font-size: 16px;">visibility</span>
                      </button>
                      <!-- Anular: sólo si está pendiente -->
                      <button v-if="esPendiente(obs)" class="btn btn-sm btn-outline-danger shadow-sm rounded-pill px-2 d-flex align-items-center gap-1" @click="pedirAnular(obs)" title="Anular observación">
                        <span class="material-icons" style="font-size: 16px;">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="observacionesPaginadas.length === 0">
                  <td colspan="6" class="py-5 text-center text-muted border-0 bg-white">
                    <span class="material-icons d-block fs-1 mb-2">search_off</span>
                    <p class="m-0 fw-bold">No has cargado observaciones.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS (Celular) -->
          <div class="d-md-none p-3 bg-light">
            <div v-for="obs in observacionesPaginadas" :key="'mob-' + obs.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="fw-bold text-uppercase text-dark" style="font-size: 1rem; line-height: 1.2;">
                    <div>{{ obs.arb1 }}</div>
                    <div v-if="obs.arb2 && obs.ref2_id">{{ obs.arb2 }}</div>
                  </div>
                  <span :class="badgeEstado(obs.estado)">
                    {{ etiquetaEstado(obs.estado) }}
                  </span>
                </div>
                <div class="text-muted fw-bold mb-2" style="font-size: 0.8rem;">
                  {{ formatearFecha(obs.fecha_partido) }} <span class="mx-1">•</span> {{ obs.categoria || obs.categoria_edad || '-' }}
                </div>
                <div class="text-dark small mb-2">{{ obs.equipo_local }} vs {{ obs.equipo_visitante }}</div>
                <div class="d-flex justify-content-between align-items-center border-top pt-2">
                  <span class="fw-bold text-danger small">Puntaje: {{ obs.puntaje_final ?? '-' }}</span>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-light border rounded-pill px-3 fw-bold d-flex align-items-center gap-1 text-secondary" @click="verDetalle(obs)" :disabled="cargandoDetalleId === obs.id">
                      <span v-if="cargandoDetalleId === obs.id" class="spinner-border spinner-border-sm"></span>
                      <span v-else class="material-icons" style="font-size: 16px;">visibility</span>
                    </button>
                    <button v-if="esPendiente(obs)" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold d-flex align-items-center gap-1" @click="pedirAnular(obs)">
                      <span class="material-icons" style="font-size: 16px;">block</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="observacionesPaginadas.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border">
              <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
              <p class="text-muted m-0 fw-bold">No has cargado observaciones.</p>
            </div>
          </div>

          <!-- PAGINACIÓN -->
          <div class="d-flex justify-content-center align-items-center gap-3 my-4" v-if="totalPaginas > 1">
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

    <!-- ==========================================
         MODAL: VER DETALLE DE LA OBSERVACIÓN
         ========================================== -->
    <ModalBase :show="mostrarDetalle" @close="cerrarDetalle" titulo="Detalle de la Observación" icono="visibility" colorIcono="bg-secondary text-white" maxWidth="800px">
      <div v-if="detalle" class="text-start">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <p class="m-0 fw-bold small text-dark">Observación #{{ detalle.id }}</p>
            <p class="m-0 text-muted small">{{ formatearFecha(detalle.fecha_partido) }} — {{ detalle.competencia }}</p>
          </div>
          <span class="align-self-center" :class="badgeEstado(detalle.estado)">
            {{ etiquetaEstado(detalle.estado) }}
          </span>
        </div>

        <div class="bg-light p-3 rounded border mb-3 border-secondary-subtle">
          <p class="m-0 small text-dark"><strong class="text-muted">Árbitros:</strong> {{ nombresArbitros(detalle) }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Observador:</strong> {{ detalle.observador }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Categoría:</strong> {{ categoriaObs(detalle) }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Partido:</strong> {{ detalle.equipo_local }} vs {{ detalle.equipo_visitante }}</p>
          <p class="m-0 small text-dark mt-1" v-if="detalle.numero_partido"><strong class="text-muted">Nº Partido:</strong> {{ detalle.numero_partido }}</p>
          <p class="m-0 small text-dark mt-1" v-if="detalle.puntaje_final != null"><strong class="text-muted">Puntaje final:</strong> <span class="fw-bold text-danger">{{ detalle.puntaje_final }}</span></p>
        </div>

        <div v-if="(detalle.estado === 'anulada' || detalle.estado === 'rechazada') && detalle.comentario_estado" class="alert alert-danger py-2 px-3 small mb-3">
          <i class="bi bi-info-circle me-1"></i><strong>{{ detalle.estado === 'anulada' ? 'Motivo de anulación' : 'Motivo de rechazo' }}:</strong> {{ detalle.comentario_estado }}
        </div>

        <!-- Tabs: Score sheet (puntajes) / Comment sheet (comentarios) -->
        <ul class="nav nav-tabs mb-0" role="tablist">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tabDetalle === 'puntajes' }" type="button" @click="tabDetalle = 'puntajes'">
              <i class="bi bi-list-ol me-1"></i> Puntajes
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tabDetalle === 'comentarios' }" type="button" @click="tabDetalle = 'comentarios'">
              <i class="bi bi-chat-left-text me-1"></i> Comentarios
            </button>
          </li>
        </ul>

        <!-- TAB PUNTAJES (Score sheet) -->
        <div v-show="tabDetalle === 'puntajes'" class="border border-top-0 rounded-bottom overflow-hidden">
          <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.78rem;">
            <thead class="table-light">
              <tr>
                <th class="py-2 ps-3 text-uppercase text-muted">Categoría / Ítem</th>
                <th class="py-2 text-center text-uppercase text-muted" style="width: 150px;">Valoración</th>
                <th class="py-2 text-center text-uppercase text-muted" style="width: 90px;">Puntaje</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="it in (detalle.items || [])" :key="'it-' + it.id">
                <tr v-if="it.tipo === 'categoria'" class="table-light">
                  <td class="fw-bold text-dark ps-3">{{ it.categoria }}</td>
                  <td></td>
                  <td class="text-center fw-bold text-danger">{{ it.puntaje ?? '-' }}</td>
                </tr>
                <tr v-else>
                  <td class="text-dark ps-4">{{ it.item }}</td>
                  <td class="text-center text-muted">{{ it.valoracion || '-' }}</td>
                  <td class="text-center">{{ it.puntaje ?? '-' }}</td>
                </tr>
              </template>
              <tr v-if="!detalle.items || detalle.items.length === 0">
                <td colspan="3" class="text-center py-3 text-muted">Sin ítems cargados.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TAB COMENTARIOS (Comment sheet) -->
        <div v-show="tabDetalle === 'comentarios'" class="border border-top-0 rounded-bottom p-3">
          <div v-if="comentariosPorCategoria.length">
            <div v-for="(c, idx) in comentariosPorCategoria" :key="'com-' + idx" class="mb-3">
              <div class="fw-bold small text-dark">{{ c.categoria }}</div>
              <div class="small text-muted" style="white-space: pre-line;">{{ c.comentario }}</div>
            </div>
          </div>

          <div v-if="detalle.prioridad_mejora_1 || detalle.prioridad_mejora_2 || detalle.prioridad_mejora_resto" class="mt-2 pt-2 border-top">
            <div class="fw-bold small text-dark mb-1">Prioridades de mejora</div>
            <div v-if="detalle.prioridad_mejora_1" class="small text-muted mb-1"><strong>1.</strong> {{ detalle.prioridad_mejora_1 }}</div>
            <div v-if="detalle.prioridad_mejora_2" class="small text-muted mb-1"><strong>2.</strong> {{ detalle.prioridad_mejora_2 }}</div>
            <div v-if="detalle.prioridad_mejora_resto" class="small text-muted mb-1" style="white-space: pre-line;">{{ detalle.prioridad_mejora_resto }}</div>
          </div>

          <div v-if="detalle.influencia_resultado_comentarios" class="mt-2 pt-2 border-top">
            <div class="fw-bold small text-dark mb-1">Influencia en el resultado</div>
            <div class="small text-muted" style="white-space: pre-line;">{{ detalle.influencia_resultado_comentarios }}</div>
          </div>

          <div v-if="!tieneComentarios" class="text-center py-3 text-muted small">
            Esta observación no tiene comentarios cargados.
          </div>
        </div>

        <!-- Acciones (dentro del cuerpo para que se vean también en mobile) -->
        <div class="d-flex flex-column flex-sm-row gap-2 mt-4">
          <button @click="descargarExcel(detalle)" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm order-1 order-sm-2 flex-sm-grow-1 d-flex align-items-center justify-content-center gap-2" :disabled="descargandoId === detalle.id">
            <span v-if="descargandoId === detalle.id" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-file-earmark-excel"></i>
            DESCARGAR EXCEL
          </button>
          <button @click="cerrarDetalle" class="btn btn-light border rounded-pill px-4 fw-bold order-2 order-sm-1 flex-sm-grow-1">CERRAR</button>
        </div>
      </div>
      <div v-else class="text-center py-4">
        <span class="spinner-border text-danger"></span>
      </div>
    </ModalBase>

    <!-- ==========================================
         MODAL: CONFIRMAR ANULACIÓN
         ========================================== -->
    <ModalBase :show="mostrarConfirmAnular" @close="cerrarAnular" titulo="Anular Observación" icono="block" colorIcono="bg-danger text-white" maxWidth="480px">
      <div class="text-center">
        <p class="text-dark mb-1">¿Seguro que querés anular esta observación?</p>
        <p class="text-muted small mb-0" v-if="obsAAnular">
          #{{ obsAAnular.id }} — {{ obsAAnular.equipo_local }} vs {{ obsAAnular.equipo_visitante }}
        </p>
        <div class="alert alert-warning py-2 px-3 mt-3 mb-0 small">
          <i class="bi bi-exclamation-triangle me-1"></i>
          Una vez anulada no se puede revertir. Sólo se pueden anular observaciones en estado pendiente.
        </div>
      </div>
      <template #footer>
        <button @click="cerrarAnular" class="btn btn-light rounded-pill px-4 fw-bold flex-grow-1">CANCELAR</button>
        <button @click="confirmarAnular" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1" :disabled="anulando">
          <span v-if="anulando" class="spinner-border spinner-border-sm me-1"></span> ANULAR
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

const toast = inject('toast', ({ mensaje }) => alert(mensaje))

useHead({
  title: 'Mis Observaciones Realizadas | AAAB',
  meta: [
    { name: 'description', content: 'Verifica las evaluaciones de desempeño arbitral que has realizado.' }
  ]
})

const busqueda = ref('')
const observaciones = ref([])
const cargando = ref(false)
const paginaActual = ref(1)
const registrosPorPagina = 10

const normalizar = (texto) =>
  texto ? texto.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : ''

const formatearFecha = (fechaIso) => {
  if (!fechaIso) return 'S/F'
  const [anio, mes, dia] = fechaIso.split(' ')[0].split('-')
  if (!anio || !mes || !dia) return fechaIso
  return `${dia}/${mes}/${anio}`
}

// Árbitros observados: prioriza los nombres reales (arb1/arb2); cae al texto del Excel si no hay ids.
const nombresArbitros = (o) => {
  const partes = [o.arb1, o.arb2].filter(n => n && n.trim() && n !== ', ')
  if (partes.length) return partes.join(' - ')
  return o.arbitros || '-'
}

// Categoría del partido con fallback a la categoría de edad del Excel.
const categoriaObs = (o) => o.categoria || o.categoria_edad || '-'

const etiquetaEstado = (estado) => {
  const e = (estado || 'pendiente').toLowerCase()
  if (e === 'aprobada') return 'APROBADA'
  if (e === 'rechazada') return 'RECHAZADA'
  if (e === 'anulada') return 'ANULADA'
  return 'PENDIENTE'
}

const badgeEstado = (estado) => {
  const e = (estado || 'pendiente').toLowerCase()
  if (e === 'aprobada') return 'estado-pill estado-aprobada'
  if (e === 'rechazada') return 'estado-pill estado-rechazada'
  if (e === 'anulada') return 'estado-pill estado-anulada'
  return 'estado-pill estado-pendiente'
}

const esPendiente = (obs) => (obs.estado || 'pendiente').toLowerCase() === 'pendiente'

const observacionesFiltradas = computed(() => {
  const q = normalizar(busqueda.value)
  if (!q) return observaciones.value
  return observaciones.value.filter((obs) => {
    const texto = `${obs.arb1 || ''} ${obs.arb2 || ''} ${obs.categoria || ''} ${obs.categoria_edad || ''} ${obs.equipo_local || ''} ${obs.equipo_visitante || ''}`
    return normalizar(texto).includes(q)
  })
})

const totalPaginas = computed(() => Math.ceil(observacionesFiltradas.value.length / registrosPorPagina) || 1)

const observacionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return observacionesFiltradas.value.slice(inicio, inicio + registrosPorPagina)
})

watch(busqueda, () => { paginaActual.value = 1 })

const limpiarFiltros = () => {
  busqueda.value = ''
  paginaActual.value = 1
}

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' })
}

// -------------------- DESCARGA EXCEL --------------------
const descargandoId = ref(null)

const descargarExcel = async (obs) => {
  descargandoId.value = obs.id
  try {
    await api.getFile(
      { entity: 'observaciones', action: 'descargarEvaluacionExcel', payload: { id: obs.id } },
      `observacion_${obs.id}.xlsx`
    )
  } catch (error) {
    toast({ titulo: 'Error', mensaje: error.message || 'No se pudo descargar el Excel.', tipo: 'danger' })
  } finally {
    descargandoId.value = null
  }
}

// -------------------- VER DETALLE --------------------
const mostrarDetalle = ref(false)
const detalle = ref(null)
const cargandoDetalleId = ref(null)
const tabDetalle = ref('puntajes')

// Comentarios por categoría (Comment sheet): ítems tipo categoría con comentario.
const comentariosPorCategoria = computed(() => {
  if (!detalle.value || !Array.isArray(detalle.value.items)) return []
  return detalle.value.items
    .filter(it => it.tipo === 'categoria' && it.comentario)
    .map(it => ({ categoria: it.categoria, comentario: it.comentario }))
})

const tieneComentarios = computed(() => {
  if (!detalle.value) return false
  return comentariosPorCategoria.value.length > 0
    || !!detalle.value.prioridad_mejora_1
    || !!detalle.value.prioridad_mejora_2
    || !!detalle.value.prioridad_mejora_resto
    || !!detalle.value.influencia_resultado_comentarios
})

const verDetalle = async (obs) => {
  cargandoDetalleId.value = obs.id
  detalle.value = null
  tabDetalle.value = 'puntajes'
  try {
    const res = await api.get({ entity: 'observaciones', action: 'obtenerEvaluacion', payload: { id: obs.id } })
    if (res && res.ok && res.payload) {
      // Fusionamos con lo que ya teníamos en la fila por si el detalle no trae algún campo de display
      detalle.value = { ...obs, ...res.payload }
      mostrarDetalle.value = true
    } else {
      toast({ titulo: 'Error', mensaje: 'No se pudo cargar el detalle.', tipo: 'danger' })
    }
  } catch (error) {
    toast({ titulo: 'Error', mensaje: error.message || 'Fallo al cargar el detalle.', tipo: 'danger' })
  } finally {
    cargandoDetalleId.value = null
  }
}

const cerrarDetalle = () => { mostrarDetalle.value = false; detalle.value = null }

// -------------------- ANULAR --------------------
const mostrarConfirmAnular = ref(false)
const obsAAnular = ref(null)
const anulando = ref(false)

const pedirAnular = (obs) => {
  if (!esPendiente(obs)) {
    toast({ titulo: 'No permitido', mensaje: 'Sólo se pueden anular observaciones pendientes.', tipo: 'warning' })
    return
  }
  obsAAnular.value = obs
  mostrarConfirmAnular.value = true
}

const cerrarAnular = () => { mostrarConfirmAnular.value = false; obsAAnular.value = null }

const confirmarAnular = async () => {
  if (!obsAAnular.value) return
  anulando.value = true
  try {
    const res = await api.post({ entity: 'observaciones', action: 'anularEvaluacion', payload: { id: obsAAnular.value.id } })
    if (res && res.ok) {
      toast({ titulo: 'Observación anulada', mensaje: 'La observación fue anulada correctamente.', tipo: 'success' })
      // Actualizamos el estado en memoria sin recargar todo
      const idx = observaciones.value.findIndex(o => o.id === obsAAnular.value.id)
      if (idx !== -1) observaciones.value[idx].estado = 'anulada'
      cerrarAnular()
    } else {
      toast({ titulo: 'No se pudo anular', mensaje: res?.message || 'La observación no pudo anularse.', tipo: 'danger' })
    }
  } catch (error) {
    toast({ titulo: 'Error', mensaje: error.message || 'Fallo de conexión al anular.', tipo: 'danger' })
  } finally {
    anulando.value = false
  }
}

// -------------------- CARGA --------------------
const obtenerObservaciones = async () => {
  cargando.value = true
  try {
    const resultado = await api.get({ entity: 'observaciones', action: 'obtenerEvaluaciones' })
    observaciones.value = Array.isArray(resultado.payload) ? resultado.payload : []
  } catch (error) {
    console.error('Error al obtener observaciones:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(obtenerObservaciones)
</script>

<style scoped>
.animate__animated { animation-duration: 0.5s; }

/* ====================================================
   PÍLDORAS DE ESTADO (mismo estilo que Solicitudes Institucionales)
   ==================================================== */
.estado-pill {
  border-radius: 999px;
  padding: 0.35em 0.85em;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
  display: inline-block;
  white-space: nowrap;
}

/* PENDIENTE — amarillo */
.estado-pendiente {
  background-color: #fdf3d3;
  color: #a6841f;
  border-color: #f2e2a5;
}

/* APROBADA — verde */
.estado-aprobada {
  background-color: #e3f5e6;
  color: #2f8a45;
  border-color: #bfe6c8;
}

/* RECHAZADA — rojo/rosa */
.estado-rechazada {
  background-color: #fde7ea;
  color: #c0304a;
  border-color: #f5c2cb;
}

/* ANULADA — gris azulado */
.estado-anulada {
  background-color: #eef1f5;
  color: #5b6b7f;
  border-color: #d4dbe4;
}

</style>
