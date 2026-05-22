<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- Header -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-graph-up-arrow me-1"></i> Mi Rendimiento
            </h4>
            <span class="text-muted small d-block mt-1">
              <template v-if="datosArbitro.apellido">
                {{ datosArbitro.apellido }}, {{ datosArbitro.nombre }} —
              </template>
              {{ examenesFiltrados.length }} {{ examenesFiltrados.length === 1 ? 'examen' : 'exámenes' }}
              <template v-if="filtroAño"> en {{ filtroAño }}</template>
            </span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <!-- Filtro por año -->
            <div v-if="añosDisponibles.length" class="d-flex align-items-center gap-2">
              <label class="small fw-bold text-dark text-uppercase m-0 d-none d-md-inline">Año:</label>
              <select v-model="filtroAño" class="form-select form-select-sm shadow-sm border-secondary-subtle" style="min-width: 140px;">
                <option value="">Todos los años</option>
                <option v-for="año in añosDisponibles" :key="año" :value="año">{{ año }}</option>
              </select>
            </div>
            <button @click="cargarDatos" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
          </div>
        </div>

        <div class="card-body p-3 p-md-4 bg-light">

          <!-- Loading -->
          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="text-muted small mt-2 mb-0 fw-bold">Cargando tus exámenes...</p>
          </div>

          <!-- Sin sesión -->
          <div v-else-if="!idArbitroActivo" class="text-center py-5 bg-white rounded shadow-sm border border-light-subtle">
            <span class="material-icons d-block mb-2 text-danger" style="font-size: 56px;">lock</span>
            <h5 class="text-dark fw-bold mb-1">No se pudo identificar tu sesión</h5>
            <p class="text-muted small m-0">Volvé a iniciar sesión para ver tus exámenes.</p>
          </div>

          <template v-else>

            <!-- Resumen general -->
            <div class="row g-2 g-md-3 mb-3">
              <div v-for="stat in statsResumen" :key="stat.key" class="col-6 col-md">
                <div class="card border-0 shadow-sm h-100" :class="stat.bgClass">
                  <div class="card-body p-3 text-center text-white">
                    <i class="bi" :class="stat.icon" style="font-size: 1.4rem;"></i>
                    <div class="fw-bold fs-4 mt-1 lh-1">{{ stat.value }}</div>
                    <div class="small text-uppercase fw-bold opacity-75 mt-1">{{ stat.label }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Aviso: contacto con coordinador -->
            <div class="alert alert-warning border-warning-subtle d-flex align-items-start gap-2 mb-4 shadow-sm py-2 px-3">
              <i class="bi bi-info-circle-fill fs-5 text-warning-emphasis flex-shrink-0 mt-1"></i>
              <div class="small text-dark">
                <strong>¿Detectaste algún dato erróneo?</strong>
                Si alguno de tus exámenes no figura correctamente, por favor comunicate con tu
                <strong>coordinador de grupo</strong> para que pueda revisarlo y corregirlo.
              </div>
            </div>

            <!-- Sin exámenes -->
            <div v-if="!examenesFiltrados.length" class="text-center py-5 bg-white rounded shadow-sm border border-light-subtle">
              <span class="material-icons d-block mb-2" style="font-size: 64px; color: #cbd5e1;">assignment</span>
              <h5 class="text-muted fw-bold mb-1">
                <template v-if="filtroAño">No hay exámenes registrados en {{ filtroAño }}</template>
                <template v-else>Todavía no tenés exámenes cargados</template>
              </h5>
              <p class="text-muted small m-0">
                <template v-if="filtroAño">Probá seleccionando otro año o quitando el filtro.</template>
                <template v-else>Cuando se registre un examen vas a ver el detalle acá.</template>
              </p>
            </div>

            <template v-else>

              <!-- ============= SECCIÓN EVENTOS POR TIPO ============= -->
              <div class="mb-5">
                <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
                  <span class="material-icons text-danger me-2">event_note</span>
                  <h5 class="fw-bold m-0 text-dark text-uppercase">Mis Eventos</h5>
                </div>

                <div v-for="tipo in tiposConExamenes" :key="tipo" class="mb-4">
                  <!-- Cabecera del tipo -->
                  <div class="d-flex align-items-center justify-content-between mb-2 bg-white p-2 ps-3 rounded shadow-sm border border-light-subtle">
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge text-uppercase fs-6 px-3 py-2" :class="badgeTipo(tipo)">{{ tipo }}</span>
                      <span class="small text-muted fw-bold">
                        {{ examenesPorTipo[tipo].length }} {{ examenesPorTipo[tipo].length === 1 ? 'registro' : 'registros' }}
                      </span>
                    </div>
                    <span class="d-none d-md-inline small text-muted fst-italic">
                      Último: {{ formatFecha(examenesPorTipo[tipo][0].fecha_examen) }}
                    </span>
                  </div>

                  <!-- Cards del tipo (ya vienen ordenadas desc por fecha) -->
                  <div class="row g-2">
                    <div v-for="ex in examenesPorTipo[tipo]" :key="ex.id" class="col-12 col-md-6 col-lg-4">
                      <div class="card border border-light-subtle shadow-sm h-100 bg-white">
                        <div class="card-body p-3">
                          <div class="d-flex justify-content-between align-items-start mb-2 border-bottom border-secondary-subtle pb-2">
                            <div class="text-dark fw-bold">
                              <i class="bi bi-calendar3 me-1 text-muted"></i>
                              {{ formatFecha(ex.fecha_examen) }}
                            </div>
                            <span class="badge bg-dark font-monospace small">#{{ ex.id }}</span>
                          </div>
                          <DetallesExamen :detalles="ex.detalles" mobile />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ============= SECCIÓN RENDIMIENTO POR EVALUACIÓN ============= -->
              <div v-if="subtiposConDatos.length" class="mb-4">
                <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
                  <span class="material-icons text-danger me-2">trending_up</span>
                  <h5 class="fw-bold m-0 text-dark text-uppercase">Mi Rendimiento por Evaluación</h5>
                </div>

                <div class="row g-3">
                  <div v-for="sub in subtiposConDatos" :key="sub" class="col-12 col-md-6">
                    <div class="card border border-light-subtle shadow-sm h-100 bg-white">
                      <div class="card-header bg-light d-flex justify-content-between align-items-center border-bottom border-light-subtle">
                        <h6 class="fw-bold text-uppercase m-0 text-dark d-flex align-items-center gap-2">
                          <i class="bi bi-bar-chart-line text-danger"></i>
                          {{ sub }}
                        </h6>
                        <span class="badge bg-dark rounded-pill px-3">{{ evaluacionesPorSubtipo[sub].length }}</span>
                      </div>
                      <div class="card-body p-3">

                        <!-- Mini-resumen del subtipo -->
                        <div class="d-flex gap-1 mb-3 flex-wrap">
                          <span
                            v-for="stat in resumenSubtipo(sub)"
                            v-show="stat.value > 0"
                            :key="stat.key"
                            class="badge text-white px-2 py-1 small"
                            :class="stat.bgClass"
                            :title="stat.label"
                          >
                            <i class="bi" :class="stat.icon"></i>
                            {{ stat.value }} {{ stat.labelShort }}
                          </span>
                        </div>

                        <!-- Timeline cronológico (desc) -->
                        <div class="timeline-evaluaciones">
                          <div
                            v-for="(item, idx) in evaluacionesPorSubtipo[sub]"
                            :key="idx"
                            class="d-flex align-items-center py-2 border-bottom border-secondary-subtle small"
                          >
                            <span class="status-dot me-2 flex-shrink-0" :class="claseDot(item.estado)"></span>
                            <span class="text-dark fw-bold me-2 flex-shrink-0 font-monospace" style="min-width: 80px;">
                              {{ formatFecha(item.fecha_examen) }}
                            </span>
                            <span class="badge bg-light text-dark border me-2 text-uppercase small flex-shrink-0 d-none d-sm-inline">
                              {{ item.tipo }}
                            </span>
                            <span class="fw-bold flex-grow-1 text-end text-sm-start" :class="claseTextoEstado(item.estado)">
                              {{ textoEstado(item.estado) }}
                            </span>
                            <span v-if="item.calificacion && item.estado != 3" class="text-muted ms-2 fw-bold">
                              ({{ item.calificacion }})
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </template>

          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject, defineComponent, h } from 'vue'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Mis Exámenes | AAAB',
  meta: [{ name: 'description', content: 'Consultá tu historial de exámenes en la AAAB.' }],
})

// ============== USUARIO ==============
const usuarioActivo = auth.getUser()
const idArbitroActivo = usuarioActivo?.id ?? null

// ============== CONSTANTES =============
const SUBTIPOS_EVALUABLES = ['yoyo', 'teorico', 'mini', 'practica', 'otro']

const ESTADO_MAP = {
  0: { texto: 'DESAPROBADO', dot: 'bg-danger',    txt: 'text-danger' },
  1: { texto: 'APROBADO',    dot: 'bg-success',   txt: 'text-success' },
  2: { texto: 'AUSENTE',     dot: 'bg-secondary', txt: 'text-secondary' },
  3: { texto: 'NO LO HIZO',  dot: 'bg-info',      txt: 'text-info' },
  4: { texto: 'PRESENTE',    dot: 'bg-primary',   txt: 'text-primary' },
}

const TIPO_BADGE_MAP = {
  asamblea:      'bg-dark text-white',
  reunion:       'bg-dark text-white',
  curso:         'bg-success text-white',
  recuperatorio: 'bg-warning text-dark',
  otro:          'bg-secondary text-white',
}

const STATS_CONFIG = [
  { key: 'aprobados',    estado: 1, label: 'Aprobados',    labelShort: 'aprob.',  bgClass: 'bg-success',   icon: 'bi-check-circle-fill' },
  { key: 'presentes',    estado: 4, label: 'Presentes',    labelShort: 'pres.',   bgClass: 'bg-primary',   icon: 'bi-person-check-fill' },
  { key: 'desaprobados', estado: 0, label: 'Desaprobados', labelShort: 'desap.',  bgClass: 'bg-danger',    icon: 'bi-x-circle-fill' },
  { key: 'ausentes',     estado: 2, label: 'Ausentes',     labelShort: 'aus.',    bgClass: 'bg-secondary', icon: 'bi-person-dash-fill' },
  { key: 'nohizo',       estado: 3, label: 'No lo hizo',   labelShort: 'no hizo', bgClass: 'bg-info',      icon: 'bi-dash-circle-fill' },
]

// ============== HELPERS ==============
const textoEstado      = (e) => ESTADO_MAP[e]?.texto ?? 'OTRO'
const claseDot         = (e) => ESTADO_MAP[e]?.dot   ?? 'bg-dark'
const claseTextoEstado = (e) => ESTADO_MAP[e]?.txt   ?? 'text-dark'
const badgeTipo        = (t) => TIPO_BADGE_MAP[t]    ?? 'bg-dark text-white'

const formatFecha = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha  = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''
const parseFecha  = (f) => {
  const [d, m, y] = (f?.split(' ')[0] ?? '').split('/')
  return new Date(`${y}-${m}-${d}`).getTime() || 0
}
const sortPorFecha = (lista) =>
  [...lista].sort((a, b) => parseFecha(b.fecha_examen) - parseFecha(a.fecha_examen))

// ============== COMPONENTE INTERNO ==============
const DetallesExamen = defineComponent({
  props: { detalles: Array, mobile: Boolean },
  setup(props) {
    return () => {
      const dets = props.detalles || []
      if (dets.length === 1 && dets[0].estado == 2)
        return h('span', { class: 'badge bg-secondary text-white px-3 py-2 shadow-sm' }, 'AUSENTE')
      if (dets.length === 1 && dets[0].estado == 4)
        return h('span', { class: 'badge bg-primary text-white px-3 py-2 shadow-sm' }, 'PRESENTE')

      return h('div', { class: 'd-flex flex-wrap gap-1' }, dets.map(det =>
        h('span', {
          key: det.id,
          class: props.mobile
            ? 'badge border bg-white text-dark px-2 py-1 d-block mb-1 w-100 text-start'
            : 'badge border bg-light text-dark px-2 py-1 d-flex align-items-center gap-1',
        }, [
          h('span', { class: 'fw-bold text-uppercase' }, det.subtipo),
          props.mobile ? null : h('span', { class: `status-dot ms-1 ${claseDot(det.estado)}` }),
          h('span', { class: `fw-bold ms-1 ${claseTextoEstado(det.estado)}` }, textoEstado(det.estado)),
          (det.calificacion && det.estado != 3 && det.estado != 2 && det.estado != 4)
            ? h('span', { class: 'text-muted ms-1' }, `(${det.calificacion})`)
            : null,
        ])
      ))
    }
  },
})

// ============== STATE ==============
const notificar = inject('notificar', (msg) => alert(msg.mensaje || msg))
const misExamenes = ref([])
const datosArbitro = ref({
  apellido: usuarioActivo?.apellido || '',
  nombre:   usuarioActivo?.nombre   || '',
})
const cargando = ref(false)
const filtroAño = ref('')

// ============== COMPUTEDS ==============

// Años disponibles (con datos), ordenados desc — solo se calculan una vez sobre todos los exámenes
const añosDisponibles = computed(() => {
  const set = new Set()
  for (const ex of misExamenes.value) {
    const año = añoDeFecha(ex.fecha_examen)
    if (año) set.add(año)
  }
  return [...set].sort((a, b) => Number(b) - Number(a))
})

// Aplicamos filtro de año (si existe)
const examenesFiltrados = computed(() => {
  if (!filtroAño.value) return misExamenes.value
  return misExamenes.value.filter(ex => añoDeFecha(ex.fecha_examen) === filtroAño.value)
})

// Ordenados por fecha desc
const examenesOrdenados = computed(() => sortPorFecha(examenesFiltrados.value))

// Resumen general (respeta el filtro de año)
const resumenGeneral = computed(() => {
  const r = { aprobados: 0, desaprobados: 0, ausentes: 0, nohizo: 0, presentes: 0 }
  for (const ex of examenesFiltrados.value)
    for (const det of (ex.detalles || []))
      if      (det.estado == 1) r.aprobados++
      else if (det.estado == 0) r.desaprobados++
      else if (det.estado == 2) r.ausentes++
      else if (det.estado == 3) r.nohizo++
      else if (det.estado == 4) r.presentes++
  return r
})

const statsResumen = computed(() =>
  STATS_CONFIG.map(s => ({ ...s, value: resumenGeneral.value[s.key] }))
)

// Agrupado por tipo — examenesOrdenados ya está sorted desc, así que la primera entrada
// de cada tipo es la más reciente
const examenesPorTipo = computed(() => {
  const map = {}
  for (const ex of examenesOrdenados.value) {
    (map[ex.tipo] ??= []).push(ex)
  }
  return map
})

// Tipos ordenados por la fecha más reciente que tienen
const tiposConExamenes = computed(() => {
  const conDatos = Object.keys(examenesPorTipo.value)
  return conDatos.sort((a, b) => {
    const fA = parseFecha(examenesPorTipo.value[a][0].fecha_examen)
    const fB = parseFecha(examenesPorTipo.value[b][0].fecha_examen)
    return fB - fA
  })
})

// Subtipos evaluables (excluye los detalles sintéticos de ausencia / reunión)
const evaluacionesPorSubtipo = computed(() => {
  const map = {}
  for (const ex of examenesOrdenados.value) {
    for (const det of (ex.detalles || [])) {
      if (det.estado == 2 || det.estado == 4) continue
      if (!SUBTIPOS_EVALUABLES.includes(det.subtipo)) continue
      ;(map[det.subtipo] ??= []).push({
        ...det,
        fecha_examen: ex.fecha_examen,
        tipo: ex.tipo,
      })
    }
  }
  return map
})

const subtiposConDatos = computed(() =>
  SUBTIPOS_EVALUABLES.filter(s => evaluacionesPorSubtipo.value[s]?.length)
)

const resumenSubtipo = (sub) => {
  const lista = evaluacionesPorSubtipo.value[sub] || []
  const r = { aprobados: 0, desaprobados: 0, nohizo: 0 }
  for (const d of lista)
    if      (d.estado == 1) r.aprobados++
    else if (d.estado == 0) r.desaprobados++
    else if (d.estado == 3) r.nohizo++
  return STATS_CONFIG
    .filter(s => ['aprobados', 'desaprobados', 'nohizo'].includes(s.key))
    .map(s => ({ ...s, value: r[s.key] }))
}

// ============== CARGA ==============
const cargarDatos = async () => {
  if (!idArbitroActivo) {
    notificar({ titulo: 'Error', mensaje: 'No se pudo identificar al árbitro.', tipo: 'danger' })
    return
  }
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'examenes',
      action: 'obtenerExamenes',
      payload: { id_arbitro: idArbitroActivo },
    })
    if ((res.ok || res.success) && res.payload) {
      misExamenes.value = res.payload
      if (res.payload.length && !datosArbitro.value.apellido) {
        datosArbitro.value = {
          apellido: res.payload[0].apellido || '',
          nombre:   res.payload[0].nombre   || '',
        }
      }
    }
  } catch (err) {
    console.error('Error al cargar mis exámenes:', err)
    notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar los exámenes.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
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
.animate__animated { animation-duration: 0.4s; }
.timeline-evaluaciones > div:last-child { border-bottom: none !important; }
</style>
