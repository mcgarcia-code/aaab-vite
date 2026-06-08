<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-clipboard-data-fill me-1"></i> Resumen de Rendimiento
            </h4>
            <span class="text-muted small d-block mt-1">Panel Administrativo — {{ totalFiltrados }} árbitros</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
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

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Árbitros</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>
          <div class="row g-2">
            <div class="col-6"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido..."></div>
            <div class="col-6"><input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Nombre..."></div>
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

        <div class="card-body p-0 p-md-3 bg-white">
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
                  <th class="py-3 text-center text-uppercase text-muted">Total Registros</th>
                  <th class="py-3 text-center text-uppercase text-muted">Última Actividad</th>
                </tr>
                <tr class="bg-light">
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id">
                    <button @click="cargarTodo" class="btn btn-sm btn-light border rounded text-secondary shadow-sm px-2 py-1">
                      <i class="bi bi-arrow-clockwise"></i>
                    </button>
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-acciones"></td>
                  <td class="p-2 border-bottom border-2 col-fija col-apellido"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Filtrar.."></td>
                  <td class="p-2 border-bottom border-2 col-fija col-nombre"><input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Filtrar.."></td>
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
                  <td class="p-2 border-bottom border-2" colspan="2"></td>
                </tr>
              </thead>
              <tbody>
                <tr v-if="cargandoInicial">
                  <td colspan="8" class="text-center py-5">
                    <div class="spinner-border text-danger spinner-border-sm"></div>
                    <span class="ms-2 fw-bold text-muted">Cargando datos...</span>
                  </td>
                </tr>
                <tr v-else-if="!arbitrosPaginados.length">
                  <td colspan="8" class="text-center py-4 text-muted">
                    <span class="material-icons opacity-50 d-block mb-2" style="font-size: 32px;">search_off</span>
                    <span class="fw-bold">No se encontraron árbitros.</span>
                  </td>
                </tr>
                <tr v-else v-for="a in arbitrosPaginados" :key="a.id" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">
                  <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ a.id }}</td>
                  <td class="text-center col-fija col-acciones">
                    <button @click="verDetalle(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning">
                      <span class="material-icons" style="font-size:16px;">manage_search</span>
                    </button>
                  </td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
                  <td class="text-center text-dark">{{ a.grupo || '-' }}</td>
                  <td class="text-center text-dark">{{ a.subgrupo || '-' }}</td>
                  <td class="text-center">
                    <span class="badge bg-dark rounded-pill px-3 py-1">{{ metricasArbitros[a.id]?.total || 0 }}</span>
                  </td>
                  <td class="text-center">
                    <div v-if="metricasArbitros[a.id]?.ultimo">
                      <span class="fw-bold text-dark">{{ formatFecha(metricasArbitros[a.id].ultimo.fecha_examen) }}</span>
                      <span class="badge ms-2 text-uppercase" :class="colorBadgeTipo(metricasArbitros[a.id].ultimo.tipo)">
                        {{ metricasArbitros[a.id].ultimo.tipo }}
                      </span>
                    </div>
                    <span v-else class="text-muted fst-italic small">Sin actividad</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-md-none p-3 bg-light">
            <div v-if="cargandoInicial" class="text-center p-4 bg-white rounded-3 shadow-sm border">
              <div class="spinner-border text-danger spinner-border-sm"></div>
              <p class="m-0 mt-2 small fw-bold text-muted">Cargando datos...</p>
            </div>
            <template v-else>
              <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card shadow-sm mb-3 border-light-subtle rounded-3" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">
                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">{{ a.apellido }}, {{ a.nombre }}</div>
                  <div class="small text-muted fw-bold font-monospace">#{{ a.id }}</div>
                </div>
                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex justify-content-between text-dark mb-2 border-bottom border-secondary-subtle pb-2">
                    <span class="small">
                      <strong>Grupo:</strong> {{ a.grupo || '-' }}
                      <template v-if="a.subgrupo"> (Sub: {{ a.subgrupo }})</template>
                    </span>
                    <span class="small"><strong>Registros:</strong> {{ metricasArbitros[a.id]?.total || 0 }}</span>
                  </div>

                  <div class="bg-light p-2 rounded border border-light-subtle mb-3">
                    <span class="small text-muted fw-bold d-block mb-1 text-center">Última Actividad</span>
                    <div v-if="metricasArbitros[a.id]?.ultimo" class="d-flex justify-content-center align-items-center">
                      <span class="fw-bold text-dark small"><i class="bi bi-calendar3 me-1"></i>{{ formatFecha(metricasArbitros[a.id].ultimo.fecha_examen) }}</span>
                      <span class="badge ms-2 text-uppercase" :class="colorBadgeTipo(metricasArbitros[a.id].ultimo.tipo)" style="font-size: 0.65rem;">
                        {{ metricasArbitros[a.id].ultimo.tipo }}
                      </span>
                    </div>
                    <div v-else class="text-center"><span class="text-muted fst-italic small">Sin actividad registrada</span></div>
                  </div>

                  <button @click="verDetalle(a)" class="btn btn-sm w-100 btn-outline-warning shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                    <span class="material-icons" style="font-size: 18px;">manage_search</span> VER HISTORIAL
                  </button>
                </div>
              </div>
              <div v-if="!arbitrosPaginados.length" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
                <p class="text-muted m-0 fw-bold">No se encontraron árbitros.</p>
              </div>
            </template>
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

    <ModalBase :show="mostrarModalDetalle" @close="mostrarModalDetalle = false" icono="history" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="800px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">Historial de {{ arbitroSeleccionado.apellido }}, {{ arbitroSeleccionado.nombre }}</span>
          <div class="text-muted small mt-1">Reuniones, Asambleas y Recuperatorios</div>
        </div>
      </template>

      <div v-if="!eventosDelArbitroDetalle.length" class="text-center py-5 text-muted bg-white rounded shadow-sm border border-light-subtle">
        <span class="material-icons d-block mb-2" style="font-size: 48px; color: #cbd5e1;">history_toggle_off</span>
        <p class="mb-0 fw-bold">No hay eventos registrados para este árbitro.</p>
      </div>

      <div v-else>
        <div class="d-flex flex-column gap-2">
          <div v-for="ev in eventosDelArbitroDetalle" :key="ev.id" class="card border border-light-subtle shadow-sm bg-white">
            <div class="card-body p-2 px-3">
              <div class="d-flex justify-content-between align-items-start mb-1 border-bottom border-secondary-subtle pb-1">
                <div>
                  <span class="badge font-monospace me-2" style="background-color: #cbd5e1; color: #334155;">#{{ ev.id }}</span>
                  <span class="text-dark fw-bold small"><i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatFecha(ev.fecha_examen) }}</span>
                </div>
                <span class="badge text-uppercase" :class="colorBadgeTipo(ev.tipo)">{{ ev.tipo }}</span>
              </div>
              <div class="d-flex flex-wrap gap-1 mt-2">
                <span v-for="(det, i) in ev.detalles" :key="i" class="badge border bg-light text-dark px-2 py-1 d-flex align-items-center gap-1">
                  <span class="fw-bold text-uppercase">{{ det.subtipo }}</span>
                  <span class="status-dot ms-1" :class="claseDot(det.estado)"></span>
                  <span class="fw-bold ms-1" :class="claseTextoEstado(det.estado)">{{ textoEstado(det.estado) }}</span>
                  <span v-if="det.calificacion && det.estado != 3 && det.estado != 2" class="text-muted ms-1">({{ det.calificacion }})</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive} from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Resumen Árbitros | AAAB',
  meta: [{ name: 'description', content: 'Resumen dinámico del rendimiento y asistencia de árbitros AAAB.' }],
})

// ============== CONSTANTES ==============
const GRUPOS = ['LH', 'Pre Liga', 'SR', '1', '2', '3', '4']
const SUBGRUPOS = ['A', 'B', 'C']
const MOBILE_BREAKPOINT = 768

const ESTADO_MAP = {
  0: { texto: 'DESAPROBADO', dot: 'bg-danger',    txt: 'text-danger'    },
  1: { texto: 'APROBADO',    dot: 'bg-success',   txt: 'text-success'   },
  2: { texto: 'AUSENTE',     dot: 'bg-secondary', txt: 'text-secondary' },
  3: { texto: 'NO LO HIZO',  dot: 'bg-info',      txt: 'text-info'      },
  4: { texto: 'PRESENTE',    dot: 'bg-primary',   txt: 'text-primary'   },
}

// ============== STATE ==============
const arbitros = ref([])
const dataGlobal = ref([])

const cargandoInicial = ref(true)
const paginaActual = ref(1)
const registrosPorPagina = 10
const mostrarFiltrosMobile = ref(false)
const mostrarModalDetalle = ref(false)
const arbitroSeleccionado = ref({ id: null, apellido: '', nombre: '' })

const filtros = reactive({ apellido: '', nombre: '', grupo: '', subgrupo: '' })

const mostrarModalExcel = ref(false)
const columnasExcel = ref([
  { id: 'id', label: 'ID Árbitro', visible: true },
  { id: 'apellido', label: 'Apellido', visible: true },
  { id: 'nombre', label: 'Nombre', visible: true },
  { id: 'grupo', label: 'Grupo', visible: true },
  { id: 'subgrupo', label: 'Subgrupo', visible: true },
  { id: 'reuniones', label: 'Reuniones (Pres.)', visible: true },
  { id: 'asambleas', label: 'Asambleas', visible: true },
  { id: 'recuperatorios', label: 'Recuperatorios', visible: true },
  { id: 'total', label: 'Total Registros', visible: false },
  { id: 'fecha_ultima_actividad', label: 'Fecha Últ. Act.', visible: false },
  { id: 'tipo_ultima_actividad', label: 'Tipo Últ. Act.', visible: false },
])

// ============== HELPERS ==============
const normalizarTexto = (v) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const formatFecha    = (f) => f?.split(' ')[0] ?? ''
const parseFecha     = (f) => {
  const [d, m, y] = (f?.split(' ')[0] ?? '').split('/')
  return new Date(`${y}-${m}-${d}`).getTime() || 0
}

const colorBadgeTipo = (tipo) => {
  if (tipo === 'reunion') return 'bg-primary'
  if (tipo === 'asamblea') return 'bg-dark'
  if (tipo === 'recuperatorio') return 'bg-warning text-dark'
  return 'bg-secondary'
}

const textoEstado      = (e) => ESTADO_MAP[e]?.texto ?? 'OTRO'
const claseDot         = (e) => ESTADO_MAP[e]?.dot   ?? 'bg-dark'
const claseTextoEstado = (e) => ESTADO_MAP[e]?.txt   ?? 'text-dark'

// ============== COMPUTEDS & METRICS ==============
const metricasArbitros = computed(() => {
  const metricas = {}
  dataGlobal.value.forEach(ex => {
    if (!metricas[ex.id_arbitro]) {
      metricas[ex.id_arbitro] = {
        total: 0,
        ultimo: null,
        reuniones: 0,
        asambleas: 0,
        recuperatorios: 0
      }
    }
    const m = metricas[ex.id_arbitro]

    m.total++

    if (ex.tipo === 'reunion') {
      const presente = (ex.detalles || []).some(d => d.estado == 4)
      if (presente) m.reuniones++
    } else if (ex.tipo === 'asamblea') {
      m.asambleas++
    } else if (ex.tipo === 'recuperatorio') {
      m.recuperatorios++
    }

    if (!m.ultimo || (ex._ts > m.ultimo._ts)) {
      m.ultimo = ex
    }
  })
  return metricas
})

const arbitrosFiltrados = computed(() => {
  const { apellido, nombre, grupo, subgrupo } = filtros
  return arbitros.value.filter(a => {
    if (apellido && !normalizarTexto(a.apellido).includes(normalizarTexto(apellido))) return false
    if (nombre && !normalizarTexto(a.nombre).includes(normalizarTexto(nombre))) return false
    if (grupo && String(a.grupo) !== String(grupo)) return false
    if (subgrupo && String(a.subgrupo) !== String(subgrupo)) return false
    return true
  })
})

const arbitrosOrdenados = computed(() => {
  return [...arbitrosFiltrados.value].sort((a, b) => String(normalizarTexto(a.apellido)).localeCompare(String(normalizarTexto(b.apellido)), 'es'))
})

const totalPaginas = computed(() => Math.ceil(arbitrosOrdenados.value.length / registrosPorPagina) || 1)
const totalFiltrados = computed(() => arbitrosOrdenados.value.length)
const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return arbitrosOrdenados.value.slice(inicio, inicio + registrosPorPagina)
})

const eventosDelArbitroDetalle = computed(() => {
  if (!arbitroSeleccionado.value.id) return []
  const eventos = dataGlobal.value.filter(ex => ex.id_arbitro === arbitroSeleccionado.value.id)
  return eventos.sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0))
})

// ============== EXPORTAR EXCEL ==============
const exportarExcel = () => { mostrarModalExcel.value = true }

const ejecutarDescargaExcel = () => {
  const cols = columnasExcel.value.filter(c => c.visible)

  const datos = arbitrosOrdenados.value.map(a => {
    const fila = {}
    const m = metricasArbitros.value[a.id]

    cols.forEach(col => {
      let valor = ''
      if (col.id === 'reuniones') valor = m?.reuniones || 0
      else if (col.id === 'asambleas') valor = m?.asambleas || 0
      else if (col.id === 'recuperatorios') valor = m?.recuperatorios || 0
      else if (col.id === 'total') valor = m?.total || 0
      else if (col.id === 'fecha_ultima_actividad') valor = m?.ultimo ? formatFecha(m.ultimo.fecha_examen) : 'Sin actividad'
      else if (col.id === 'tipo_ultima_actividad') valor = m?.ultimo ? m.ultimo.tipo.toUpperCase() : '-'
      else valor = a[col.id]

      fila[col.label] = valor || ''
    })
    return fila
  })

  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Resumen')
  XLSX.writeFile(wb, 'Resumen_Rendimiento_AAAB.xlsx')
  mostrarModalExcel.value = false
}

// ============== CARGAS Y MÉTODOS ==============
const verDetalle = (a) => {
  arbitroSeleccionado.value = { id: a.id, apellido: a.apellido, nombre: a.nombre }
  mostrarModalDetalle.value = true
}

const cargarDatosBase = async () => {
  try {
    const res = await api.get({ entity: 'examenes', action: 'obtenerExamenes', payload: {} })
    if ((res.ok || res.success) && res.payload) {
      const map = {}
      res.payload.forEach(row => {
        const key = row.id
        if (!map[key]) {
          map[key] = {
            id: row.id,
            id_arbitro: row.id_arbitro,
            tipo: row.tipo,
            fecha_examen: row.fecha_examen,
            _ts: parseFecha(row.fecha_examen),
            detalles: []
          }
        }
        if (row.id_detalle) {
          map[key].detalles.push({
            subtipo: row.subtipo,
            estado: row.estado,
            calificacion: row.calificacion
          })
        }
      })
      dataGlobal.value = Object.values(map)
    }
  } catch (err) { console.error(err) }
}

const cargarArbitros = async () => {
  try {
    const res = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (err) { console.error(err) }
}

const cargarTodo = async () => {
  cargandoInicial.value = true
  await Promise.all([cargarArbitros(), cargarDatosBase()])
  cargandoInicial.value = false
}

const limpiarFiltros = () => { filtros.apellido = ''; filtros.nombre = ''; filtros.grupo = ''; filtros.subgrupo = '' }
const cambiarPagina = (delta) => {
  paginaActual.value += delta
  if (window.innerWidth <= MOBILE_BREAKPOINT) setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
}

onMounted(cargarTodo)
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.animate__animated { animation-duration: 0.4s; }
.tabla-container { overflow-x: auto; }
.tabla-fija { border-collapse: separate; border-spacing: 0; }
.tabla-fija th, .tabla-fija td { border-left: none !important; border-right: none !important; }
.col-fija { position: sticky; background-color: inherit; z-index: 10; }
.tabla-fija thead .col-fija { background-color: #f8f9fa; z-index: 12; }
.tabla-fija tbody .col-fija { background-color: #ffffff; }
.tabla-fija tbody tr.bg-danger-subtle .col-fija { background-color: #f8d7da; }
.col-id       { left: 0;     min-width: 60px;  }
.col-acciones { left: 60px;  min-width: 70px;  }
.col-apellido { left: 130px; min-width: 150px; }
.col-nombre   { left: 280px; min-width: 150px; }
.col-nombre::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to right, rgba(0,0,0,0.1), transparent); }
</style>
