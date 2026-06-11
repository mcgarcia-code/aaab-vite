<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- ── HEADER ── -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-clipboard2-check-fill me-1"></i> Resumen General
            </h4>
            <span class="text-muted small d-block mt-1">Exámenes y Reuniones — Mi grupo · {{ totalFiltrados }} árbitros</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <div class="form-check form-switch d-flex align-items-center gap-2 m-0 border rounded px-3 py-2 shadow-sm bg-white">
              <input class="form-check-input" type="checkbox" id="toggleSoloActivos" v-model="soloActivos" role="switch" :disabled="cargandoInicial">
              <label class="form-check-label small fw-bold text-dark m-0" for="toggleSoloActivos">Solo activos</label>
            </div>
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
          </div>
        </div>

        <!-- ── FILTROS MOBILE ── -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Árbitros</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>
          <div class="row g-2">
            <div class="col-6"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido..."></div>
            <div class="col-6"><input v-model="filtros.nombre"   class="form-control form-control-sm shadow-none" placeholder="Nombre..."></div>
            <div class="col-6">
              <select v-model="filtros.grupo" class="form-select form-select-sm shadow-none">
                <option value="">Todos los grupos</option>
                <option v-for="g in GRUPOS" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="filtros.subgrupo" class="form-select form-select-sm shadow-none">
                <option value="">Todos los subgrupos</option>
                <option v-for="sg in SUBGRUPOS" :key="sg" :value="sg">{{ sg }}</option>
              </select>
            </div>
            <div class="col-12 mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <!-- ── BODY ── -->
        <div class="card-body p-0 p-md-3 bg-white">

          <!-- Tabla desktop -->
          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
            <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted col-fija col-id" style="width: 50px;">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones" style="width: 90px;">Acciones</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
                  <th class="py-3 text-center text-uppercase text-muted">Grupo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Subgrupo</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="min-width: 210px;">Última Actividad</th>
                </tr>
                <tr class="bg-light">
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id">
                    <button @click="cargarTodo" class="btn btn-sm btn-light border rounded text-secondary shadow-sm px-2 py-1">
                      <i class="bi bi-arrow-clockwise"></i>
                    </button>
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-acciones"></td>
                  <td class="p-2 border-bottom border-2 col-fija col-apellido">
                    <input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Filtrar..">
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-nombre">
                    <input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Filtrar..">
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.grupo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option>
                      <option v-for="g in GRUPOS" :key="g" :value="g">{{ g }}</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.subgrupo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option>
                      <option v-for="sg in SUBGRUPOS" :key="sg" :value="sg">{{ sg }}</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2 text-center text-muted fst-italic small">—</td>
                </tr>
              </thead>
              <tbody>
                <tr v-if="cargandoInicial">
                  <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-danger spinner-border-sm"></div>
                    <span class="ms-2 fw-bold text-muted">Cargando datos...</span>
                  </td>
                </tr>
                <tr v-else-if="!arbitrosPaginados.length">
                  <td colspan="7" class="text-center py-4 text-muted">
                    <span class="material-icons opacity-50 d-block mb-2" style="font-size: 32px;">search_off</span>
                    <span class="fw-bold">No se encontraron árbitros.</span>
                  </td>
                </tr>
                <tr v-else v-for="a in arbitrosPaginados" :key="a.id" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">
                  <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ a.id }}</td>
                  <td class="text-center col-fija col-acciones">
                    <button @click="verDetalleArbitro(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver historial">
                      <span class="material-icons" style="font-size:16px;">manage_search</span>
                    </button>
                  </td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
                  <td class="text-center text-dark">{{ a.grupo || '-' }}</td>
                  <td class="text-center text-dark">{{ a.subgrupo || '-' }}</td>
                  <td class="text-center">
                    <template v-if="ultimaActividad[a.id]">
                      <div class="d-flex align-items-center justify-content-center gap-1 flex-wrap">
                        <span class="badge bg-light text-muted border font-monospace" style="font-size: 0.65rem;">
                          {{ añoDeFecha(ultimaActividad[a.id].fecha) }}
                        </span>
                        <span class="badge text-uppercase" :class="badgeTipo(ultimaActividad[a.id].tipo)" style="font-size: 0.65rem;">
                          {{ ultimaActividad[a.id].tipo }}
                        </span>
                        <span class="text-muted fst-italic text-truncate d-none d-lg-inline" style="max-width: 85px; font-size: 0.7rem;">
                          {{ ultimaActividad[a.id].titulo }}
                        </span>
                      </div>
                    </template>
                    <span v-else class="text-muted">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cards mobile -->
          <div class="d-md-none p-3 bg-light">
            <div v-if="cargandoInicial" class="text-center p-4 bg-white rounded-3 shadow-sm border">
              <div class="spinner-border text-danger spinner-border-sm"></div>
              <p class="m-0 mt-2 small fw-bold text-muted">Cargando datos...</p>
            </div>
            <template v-else>
              <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card shadow-sm mb-3 border-light-subtle rounded-3" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">
                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">{{ a.apellido }}, {{ a.nombre }}</div>
                  <div class="d-flex align-items-center gap-2">
                    <div class="small text-muted fw-bold font-monospace">#{{ a.id }}</div>
                    <button @click="verDetalleArbitro(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning">
                      <span class="material-icons" style="font-size:14px;">manage_search</span>
                    </button>
                  </div>
                </div>
                <div class="card-body pt-0 px-3 pb-3">
                  <div class="text-muted small mb-2 border-bottom border-secondary-subtle pb-2">
                    <strong>Grupo:</strong> {{ a.grupo || '-' }}<template v-if="a.subgrupo"> / {{ a.subgrupo }}</template>
                  </div>
                  <div v-if="ultimaActividad[a.id]" class="mb-2 d-flex align-items-center gap-1 flex-wrap">
                    <span class="small text-muted fw-bold">Última:</span>
                    <span class="badge bg-light text-muted border font-monospace" style="font-size: 0.65rem;">{{ añoDeFecha(ultimaActividad[a.id].fecha) }}</span>
                    <span class="badge text-uppercase" :class="badgeTipo(ultimaActividad[a.id].tipo)" style="font-size: 0.65rem;">{{ ultimaActividad[a.id].tipo }}</span>
                    <span class="text-muted small fst-italic text-truncate" style="max-width: 120px;">{{ ultimaActividad[a.id].titulo }}</span>
                  </div>
                </div>
              </div>
              <div v-if="!arbitrosPaginados.length" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
                <p class="text-muted m-0 fw-bold">No se encontraron árbitros.</p>
              </div>
            </template>
          </div>

          <!-- Paginación -->
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

    <!-- ── MODAL HISTORIAL ── -->
    <ModalBase :show="mostrarModalDetalle" @close="mostrarModalDetalle = false" icono="person_search" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="900px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">{{ arbitroSeleccionado.apellido }}, {{ arbitroSeleccionado.nombre }}</span>
          <div class="text-muted small mt-1">Historial completo — exámenes y reuniones</div>
        </div>
      </template>

      <div v-if="cargandoDetalle" class="text-center py-5">
        <div class="spinner-border text-danger"></div>
        <div class="mt-2 fw-bold text-muted small">Cargando historial...</div>
      </div>

      <div v-else-if="!eventosDelArbitroDetalle.length" class="text-center py-5 text-muted bg-white rounded shadow-sm border border-light-subtle">
        <span class="material-icons d-block mb-2" style="font-size: 48px; color: #cbd5e1;">history_toggle_off</span>
        <p class="mb-0 fw-bold">No hay actividad registrada para este árbitro.</p>
      </div>

      <div v-else>
        <!-- Año + Excel -->
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2" v-if="añosDetalleArbitro.length">
            <label class="small fw-bold text-dark text-uppercase m-0">Año:</label>
            <select v-model="filtroAñoDetalle" class="form-select form-select-sm shadow-sm border-secondary-subtle" style="min-width: 140px;">
              <option value="">Todos los años</option>
              <option v-for="año in añosDetalleArbitro" :key="año" :value="año">{{ año }}</option>
            </select>
          </div>
          <button @click="exportarExcelDetalle" class="btn btn-success btn-sm d-flex align-items-center gap-1">
            <i class="bi bi-file-earmark-excel me-1"></i> Excel
          </button>
        </div>

        <!-- Stats -->
        <div class="row g-2 mb-4">
          <div class="col-6 col-md-2">
            <div class="card border-0 shadow-sm h-100 bg-success">
              <div class="card-body p-2 text-center text-white">
                <i class="bi bi-check-circle-fill" style="font-size: 1.1rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ statsDetalle.aprobados }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.6rem;">Aprob.</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-2">
            <div class="card border-0 shadow-sm h-100 bg-danger">
              <div class="card-body p-2 text-center text-white">
                <i class="bi bi-x-circle-fill" style="font-size: 1.1rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ statsDetalle.desaprobados }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.6rem;">Desap.</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-2">
            <div class="card border-0 shadow-sm h-100 bg-secondary">
              <div class="card-body p-2 text-center text-white">
                <i class="bi bi-person-dash-fill" style="font-size: 1.1rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ statsDetalle.ausentesExamen }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.6rem;">Aus. Exam.</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-2">
            <div class="card border-0 shadow-sm h-100 bg-info">
              <div class="card-body p-2 text-center text-white">
                <i class="bi bi-dash-circle-fill" style="font-size: 1.1rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ statsDetalle.noLoHizo }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.6rem;">No hizo</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-2">
            <div class="card border-0 shadow-sm h-100 bg-primary">
              <div class="card-body p-2 text-center text-white">
                <i class="bi bi-person-check-fill" style="font-size: 1.1rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ statsDetalle.presentesReunion }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.6rem;">Pres. Reun.</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-2">
            <div class="card border-0 shadow-sm h-100 bg-secondary">
              <div class="card-body p-2 text-center text-white">
                <i class="bi bi-person-x-fill" style="font-size: 1.1rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ statsDetalle.ausentesReunion }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.6rem;">Aus. Reun.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista cronológica -->
        <div class="d-flex flex-column gap-2 pb-2">
          <div v-for="ev in eventosFiltradosDetalle" :key="ev.key" class="card border border-light-subtle shadow-sm">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span class="text-dark fw-bold small">
                    <i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatFecha(ev.fecha) }}
                  </span>
                  <span class="badge text-uppercase" :class="badgeTipo(ev.tipo)" style="font-size: 0.7rem;">{{ ev.tipo }}</span>
                  <span v-if="ev.titulo" class="text-muted small fst-italic">{{ ev.titulo }}</span>
                </div>
                <div>
                  <span
                    v-if="ev.fuente === 'reunion'"
                    class="badge px-2 py-1"
                    :class="ev.asistencia === 'presente' ? 'bg-success' : ev.asistencia === 'ausente' ? 'bg-secondary' : 'bg-light text-muted border'"
                  >
                    {{ ev.asistencia === 'presente' ? 'PRESENTE' : ev.asistencia === 'ausente' ? 'AUSENTE' : 'SIN INFO' }}
                  </span>
                  <DetallesExamen v-else :detalles="ev.detalles" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch, defineComponent, h } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'
import * as XLSX from 'xlsx'

useHead({
  title: 'Resumen | Coordinador',
  meta: [{ name: 'description', content: 'Resumen de rendimiento del grupo coordinado.' }],
})

// ══ CONSTANTES ══════════════════════════════════════════
const GRUPOS         = ['LH', 'Pre Liga', 'SR', '1', '2', '3', '4']
const SUBGRUPOS      = ['A', 'B', 'C']
const MOBILE_BREAKPOINT = 768

const TIPO_BADGE_MAP = {
  asamblea:      'bg-dark text-white',
  recuperatorio: 'bg-warning text-dark',
  reunion:       'bg-primary text-white',
}

const ESTADO_MAP = {
  'aprobado':    { dot: 'bg-success',   txt: 'text-success'   },
  'desaprobado': { dot: 'bg-danger',    txt: 'text-danger'    },
  'no lo hizo':  { dot: 'bg-info',      txt: 'text-info'      },
  'ausente':     { dot: 'bg-secondary', txt: 'text-secondary' },
}

// ══ HELPERS ══════════════════════════════════════════════
const badgeTipo        = (t) => TIPO_BADGE_MAP[t]  ?? 'bg-dark text-white'
const claseDot         = (e) => ESTADO_MAP[e]?.dot ?? 'bg-dark'
const claseTextoEstado = (e) => ESTADO_MAP[e]?.txt ?? 'text-dark'
const textoEstado      = (e) => ({ aprobado: 'APROBADO', desaprobado: 'DESAPROBADO', 'no lo hizo': 'NO LO HIZO', ausente: 'AUSENTE' })[e] ?? 'OTRO'

const normalizarTexto = (v) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const formatFecha     = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha      = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''
const parseFecha      = (f) => {
  const [d, m, y] = (f?.split(' ')[0] ?? '').split('/')
  return new Date(`${y}-${m}-${d}`).getTime() || 0
}
const normalizarAsistencia = (v) => {
  if (!v) return ''
  const t = String(v).trim().toLowerCase()
  return t === 'presente' ? 'presente' : t === 'ausente' ? 'ausente' : ''
}
const hoy = () => new Date().toISOString().slice(0, 10)

// ══ COMPONENTE INTERNO ════════════════════════════════════
const DetallesExamen = defineComponent({
  props: { detalles: Array },
  setup(props) {
    return () => {
      const dets = props.detalles || []
      if (dets.length === 1 && (dets[0].estado === 'ausente' || dets[0].tipo === 'ausente'))
        return h('span', { class: 'badge bg-secondary text-white px-2 py-1' }, 'AUSENTE')
      return h('div', { class: 'd-flex flex-wrap gap-1' }, dets.map(det =>
        h('span', { key: det.id, class: 'badge border bg-light text-dark px-2 py-1 d-flex align-items-center gap-1' }, [
          h('span', { class: 'fw-bold text-uppercase' }, det.tipo),
          h('span', { class: `status-dot ms-1 ${claseDot(det.estado)}` }),
          h('span', { class: `fw-bold ms-1 ${claseTextoEstado(det.estado)}` }, textoEstado(det.estado)),
          (det.calificacion && det.estado !== 'no lo hizo' && det.estado !== 'ausente')
            ? h('span', { class: 'text-muted ms-1' }, `(${det.calificacion})`)
            : null,
        ])
      ))
    }
  },
})

// ══ STATE ════════════════════════════════════════════════
const arbitros            = ref([])
const ultimaActividad     = ref({})
const examenesDetalleRaw  = ref([])
const reunionesDetalleRaw = ref([])

const soloActivos          = ref(false)
const cargandoInicial      = ref(true)
const cargandoDetalle      = ref(false)
const paginaActual         = ref(1)
const registrosPorPagina   = 10
const mostrarFiltrosMobile = ref(false)
const mostrarModalDetalle  = ref(false)
const arbitroSeleccionado  = ref({ id: null, apellido: '', nombre: '' })
const filtroAñoDetalle     = ref('')

const filtros = reactive({ apellido: '', nombre: '', grupo: '', subgrupo: '' })

// ══ COMPUTEDS: tabla ════════════════════════════════════
const arbitrosFiltrados = computed(() => {
  const { apellido, nombre, grupo, subgrupo } = filtros
  return arbitros.value.filter(a => {
    if (apellido && !normalizarTexto(a.apellido).includes(normalizarTexto(apellido))) return false
    if (nombre   && !normalizarTexto(a.nombre).includes(normalizarTexto(nombre)))     return false
    if (grupo    && String(a.grupo) !== String(grupo))                                 return false
    if (subgrupo && String(a.subgrupo) !== String(subgrupo))                           return false
    return true
  })
})

const arbitrosOrdenados = computed(() =>
  [...arbitrosFiltrados.value].sort((a, b) =>
    normalizarTexto(a.apellido).localeCompare(normalizarTexto(b.apellido), 'es')
  )
)

const totalFiltrados    = computed(() => arbitrosOrdenados.value.length)
const totalPaginas      = computed(() => Math.ceil(arbitrosOrdenados.value.length / registrosPorPagina) || 1)
const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return arbitrosOrdenados.value.slice(inicio, inicio + registrosPorPagina)
})

// ══ COMPUTEDS: modal ════════════════════════════════════
const mapearFilasExamenes = (filas) => {
  const map = {}
  filas.forEach(row => {
    const key = `${row.id_evento}_${row.id_arbitro}`
    if (!map[key]) {
      map[key] = {
        id_evento:    row.id_evento,
        id_arbitro:   row.id_arbitro,
        tipo:         row.categoria,
        fecha_examen: row.fecha_examen,
        titulo:       row.titulo || '',
        _ts:          parseFecha(row.fecha_examen),
        detalles:     [],
      }
    }
    map[key].detalles.push({ id: row.id, tipo: row.tipo, calificacion: row.calificacion, estado: row.estado })
  })
  return Object.values(map)
}

const eventosDelArbitroDetalle = computed(() => {
  const todos = []
  for (const ex of mapearFilasExamenes(examenesDetalleRaw.value)) {
    todos.push({
      key:      `exam_${ex.id_evento}_${ex.id_arbitro}`,
      fecha:    ex.fecha_examen,
      _ts:      ex._ts || 0,
      tipo:     ex.tipo,
      titulo:   ex.titulo,
      fuente:   'examen',
      detalles: ex.detalles,
    })
  }
  const mapaReun = {}
  for (const row of reunionesDetalleRaw.value) {
    if (row.tipo !== 'reunion') continue
    const key = String(row.id_evento)
    if (!mapaReun[key]) {
      mapaReun[key] = {
        key:        `reunion_${row.id_evento}`,
        fecha:      row.fecha_examen,
        _ts:        parseFecha(row.fecha_examen),
        tipo:       'reunion',
        titulo:     row.titulo || '',
        fuente:     'reunion',
        asistencia: normalizarAsistencia(row.asistencia),
      }
    }
  }
  todos.push(...Object.values(mapaReun))
  return todos.sort((a, b) => (b._ts || 0) - (a._ts || 0))
})

const añosDetalleArbitro = computed(() => {
  const set = new Set()
  for (const ev of eventosDelArbitroDetalle.value) {
    const año = añoDeFecha(ev.fecha)
    if (año) set.add(año)
  }
  return [...set].sort((a, b) => Number(b) - Number(a))
})

const eventosFiltradosDetalle = computed(() =>
  !filtroAñoDetalle.value
    ? eventosDelArbitroDetalle.value
    : eventosDelArbitroDetalle.value.filter(ev => añoDeFecha(ev.fecha) === filtroAñoDetalle.value)
)

// ← statsDetalle con la lógica correcta (nivel evento para ausentesExamen)
const statsDetalle = computed(() => {
  const r = { aprobados: 0, desaprobados: 0, ausentesExamen: 0, noLoHizo: 0, presentesReunion: 0, ausentesReunion: 0 }
  for (const ev of eventosFiltradosDetalle.value) {
    if (ev.fuente === 'reunion') {
      if      (ev.asistencia === 'presente') r.presentesReunion++
      else if (ev.asistencia === 'ausente')  r.ausentesReunion++
    } else {
      const esAusenteTotal = ev.detalles.length === 1 &&
        (ev.detalles[0].estado === 'ausente' || ev.detalles[0].tipo === 'ausente')
      if (esAusenteTotal) {
        r.ausentesExamen++
      } else {
        for (const det of (ev.detalles || [])) {
          if      (det.estado === 'aprobado')    r.aprobados++
          else if (det.estado === 'desaprobado') r.desaprobados++
          else if (det.estado === 'no lo hizo')  r.noLoHizo++
        }
      }
    }
  }
  return r
})

// ══ CARGAS ═══════════════════════════════════════════════
// ← ÚNICO CAMBIO vs. admin: obtenerArbitrosFiltradosPorGrupo
const cargarArbitros = async () => {
  try {
    const res = await api.get({
      entity: 'arbitros',
      action: 'obtenerArbitrosFiltradosPorGrupo',
      payload: { soloActivos: soloActivos.value }
    })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (err) { console.error(err) }
}

const cargarUltimaActividad = async () => {
  try {
    const res = await api.get({ entity: 'arbitros', action: 'obtenerUltimaActividad' })
    if ((res.ok || res.success) && res.payload) {
      const mapa = {}
      res.payload.forEach(row => {
        mapa[row.id_arbitro] = { fecha: row.fecha, tipo: row.tipo, titulo: row.titulo || '' }
      })
      ultimaActividad.value = mapa
    }
  } catch (err) { console.error(err) }
}

const cargarTodo = async () => {
  cargandoInicial.value = true
  await Promise.all([cargarArbitros(), cargarUltimaActividad()])
  cargandoInicial.value = false
}

// ══ MODAL ════════════════════════════════════════════════
const verDetalleArbitro = async (a) => {
  arbitroSeleccionado.value = { id: a.id, apellido: a.apellido, nombre: a.nombre }
  filtroAñoDetalle.value    = ''
  mostrarModalDetalle.value = true
  examenesDetalleRaw.value  = []
  reunionesDetalleRaw.value = []
  cargandoDetalle.value     = true
  try {
    const [resEx, resRe] = await Promise.all([
      api.get({ entity: 'examenes',  action: 'obtenerExamenesArbitro',    payload: { idArbitro: a.id } }),
      api.get({ entity: 'reuniones', action: 'obtenerAsistenciasArbitro', payload: { idArbitro: a.id } }),
    ])
    if ((resEx.ok || resEx.success) && resEx.payload) examenesDetalleRaw.value  = resEx.payload
    if ((resRe.ok || resRe.success) && resRe.payload) reunionesDetalleRaw.value = resRe.payload
  } catch (err) { console.error('Error cargando detalle:', err) }
  finally { cargandoDetalle.value = false }
}

// ══ EXCEL ════════════════════════════════════════════════
const exportarExcelDetalle = () => {
  const { apellido, nombre } = arbitroSeleccionado.value
  const filas = eventosFiltradosDetalle.value.map(ev => {
    let resultado = ''
    if (ev.fuente === 'reunion') {
      resultado = ev.asistencia === 'presente' ? 'PRESENTE'
                : ev.asistencia === 'ausente'  ? 'AUSENTE'
                : 'SIN INFO'
    } else {
      resultado = (ev.detalles || []).map(d => {
        const est = d.estado === 'ausente' || d.tipo === 'ausente'
          ? 'AUSENTE'
          : d.estado.toUpperCase()
        const cal = d.calificacion && d.estado !== 'no lo hizo' && d.estado !== 'ausente'
          ? ` (${d.calificacion})`
          : ''
        return `${d.tipo.toUpperCase()}: ${est}${cal}`
      }).join(' | ')
    }
    return {
      Fecha:     formatFecha(ev.fecha),
      Año:       añoDeFecha(ev.fecha),
      Tipo:      ev.tipo,
      Título:    ev.titulo,
      Resultado: resultado,
    }
  })
  const ws = XLSX.utils.json_to_sheet(filas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Historial')
  XLSX.writeFile(wb, `historial_${apellido}_${nombre}_${hoy()}.xlsx`)
}

// ══ MISC ═════════════════════════════════════════════════
const limpiarFiltros = () => Object.keys(filtros).forEach(k => (filtros[k] = ''))
const cambiarPagina  = (delta) => {
  paginaActual.value += delta
  if (window.innerWidth <= MOBILE_BREAKPOINT)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
}

watch(filtros,      () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (n) => { if (paginaActual.value > n) paginaActual.value = n })

watch(soloActivos, async () => {
  cargandoInicial.value = true
  await cargarArbitros()
  cargandoInicial.value = false
})

onMounted(cargarTodo)
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.4s; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.tabla-container { overflow-x: auto; }
.tabla-fija { border-collapse: separate; border-spacing: 0; }
.tabla-fija th, .tabla-fija td { border-left: none !important; border-right: none !important; }
.col-fija { position: sticky; background-color: inherit; z-index: 10; }
.tabla-fija thead .col-fija { background-color: #f8f9fa; z-index: 12; }
.tabla-fija tbody .col-fija { background-color: #ffffff; }
.tabla-fija tbody tr.bg-danger-subtle .col-fija { background-color: #f8d7da; }
.col-id       { left: 0;     min-width: 60px;  }
.col-acciones { left: 60px;  min-width: 60px;  }
.col-apellido { left: 120px; min-width: 150px; }
.col-nombre   { left: 270px; min-width: 150px; }
.col-nombre::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to right, rgba(0,0,0,0.1), transparent); }
</style>
