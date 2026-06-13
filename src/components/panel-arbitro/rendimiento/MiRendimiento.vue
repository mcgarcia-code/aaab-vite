<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="panel-personal animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- ── Header ── -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-graph-up-arrow me-1"></i> Mi Rendimiento
            </h4>
            <span class="text-muted small d-block mt-1">
              {{ datosArbitro.apellido }}, {{ datosArbitro.nombre }} — Reuniones y Exámenes
            </span>
          </div>
          <div class="d-flex align-items-center gap-2 mt-2 mt-md-0">
            <label class="small fw-bold text-dark text-uppercase m-0 text-nowrap">Año:</label>
            <select
              v-model="filtroAño"
              class="form-select shadow-sm border-secondary-subtle fw-semibold"
              style="min-width: 160px;"
              :disabled="cargando"
            >
              <option value="">Todos los años</option>
              <option v-for="a in añosDisponibles" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
        </div>

        <!-- ── Loading ── -->
        <div v-if="cargando" class="text-center py-5">
          <div class="spinner-border spinner-border-sm text-danger"></div>
          <p class="mt-2 fw-bold text-muted small mb-0">Cargando tu historial...</p>
        </div>

        <!-- ── Sin usuario ── -->
        <div v-else-if="!datosArbitro.id" class="text-center py-5 text-muted">
          <span class="material-icons d-block mb-2" style="font-size: 48px; color: #cbd5e1;">person_off</span>
          <p class="fw-bold m-0">No se pudo identificar al árbitro.</p>
        </div>

        <!-- ── Contenido principal ── -->
        <div v-else class="card-body p-3 bg-white">

          <!-- Stats globales -->
          <div class="row g-2 mb-4">
            <div class="col-6 col-md-2">
              <div class="card border-0 shadow-sm h-100 bg-success">
                <div class="card-body p-2 text-center text-white">
                  <i class="bi bi-check-circle-fill" style="font-size: 1.2rem;"></i>
                  <div class="fw-bold fs-5 mt-1 lh-1">{{ statsGlobales.aprobadosExamen }}</div>
                  <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">Aprob.</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-2">
              <div class="card border-0 shadow-sm h-100 bg-danger">
                <div class="card-body p-2 text-center text-white">
                  <i class="bi bi-x-circle-fill" style="font-size: 1.2rem;"></i>
                  <div class="fw-bold fs-5 mt-1 lh-1">{{ statsGlobales.desaprobadosExamen }}</div>
                  <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">Desap.</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-2">
              <div class="card border-0 shadow-sm h-100 bg-secondary">
                <div class="card-body p-2 text-center text-white">
                  <i class="bi bi-person-dash-fill" style="font-size: 1.2rem;"></i>
                  <div class="fw-bold fs-5 mt-1 lh-1">{{ statsGlobales.ausentesExamen }}</div>
                  <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">Aus. Exam.</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-2">
              <div class="card border-0 shadow-sm h-100 bg-info">
                <div class="card-body p-2 text-center text-white">
                  <i class="bi bi-dash-circle-fill" style="font-size: 1.2rem;"></i>
                  <div class="fw-bold fs-5 mt-1 lh-1">{{ statsGlobales.noHizoExamen }}</div>
                  <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">No hizo</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-2">
              <div class="card border-0 shadow-sm h-100 bg-primary">
                <div class="card-body p-2 text-center text-white">
                  <i class="bi bi-person-check-fill" style="font-size: 1.2rem;"></i>
                  <div class="fw-bold fs-5 mt-1 lh-1">{{ statsGlobales.presentesReunion }}</div>
                  <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">Pres. Reun.</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-2">
              <div class="card border-0 shadow-sm h-100 bg-secondary">
                <div class="card-body p-2 text-center text-white">
                  <i class="bi bi-person-x-fill" style="font-size: 1.2rem;"></i>
                  <div class="fw-bold fs-5 mt-1 lh-1">{{ statsGlobales.ausentesReunion }}</div>
                  <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">Aus. Reun.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ REUNIONES ══ -->
          <div class="mb-5">
            <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-primary">
              <i class="bi bi-people-fill text-primary me-2 fs-5"></i>
              <h6 class="fw-bold m-0 text-dark text-uppercase">Reuniones</h6>
              <span class="badge bg-primary rounded-pill px-2 ms-2">{{ reunionesFiltradas.length }}</span>
            </div>

            <div v-if="!reunionesFiltradas.length" class="text-center py-4 bg-light rounded border border-light-subtle">
              <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">history_toggle_off</span>
              <p class="text-muted m-0 fw-bold small">Sin reuniones registradas en el período seleccionado.</p>
            </div>

            <div v-else class="row g-2">
              <div v-for="r in reunionesFiltradas" :key="r.id_evento" class="col-12 col-md-6 col-lg-4">
                <div class="card border border-light-subtle shadow-sm h-100 bg-white">
                  <div class="card-body p-3 d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div class="text-dark fw-bold small mb-1">
                        <i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatFecha(r.fecha_reunion) }}
                      </div>
                      <div v-if="r.titulo" class="text-muted small fst-italic">{{ r.titulo }}</div>
                    </div>
                    <AsistenciaBadge :asistencia="r.asistencia" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ EXÁMENES ══ -->
          <div>
            <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
              <i class="bi bi-clipboard2-check-fill text-danger me-2 fs-5"></i>
              <h6 class="fw-bold m-0 text-dark text-uppercase">Exámenes</h6>
              <span class="badge bg-danger rounded-pill px-2 ms-2">{{ examenesFiltrados.length }}</span>
            </div>

            <div v-if="!examenesFiltrados.length" class="text-center py-4 bg-light rounded border border-light-subtle">
              <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">assignment</span>
              <p class="text-muted m-0 fw-bold small">Sin exámenes registrados en el período seleccionado.</p>
            </div>

            <template v-else>
              <div v-for="tipo in tiposExamenPresentes" :key="tipo" class="mb-4">
                <div class="d-flex align-items-center justify-content-between mb-2 bg-white p-2 ps-3 rounded shadow-sm border border-light-subtle">
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge text-uppercase px-2 py-1" :class="badgeTipo(tipo)">{{ tipo }}</span>
                    <span class="small text-muted fw-bold">
                      {{ examenesPorTipo[tipo].length }}
                      {{ examenesPorTipo[tipo].length === 1 ? 'registro' : 'registros' }}
                    </span>
                  </div>
                  <span class="d-none d-md-inline small text-muted fst-italic">
                    Último: {{ formatFecha(examenesPorTipo[tipo][0].fecha_examen) }}
                  </span>
                </div>

                <div class="row g-2">
                  <div v-for="ex in examenesPorTipo[tipo]" :key="ex.id" class="col-12 col-md-6">
                    <div class="card border border-light-subtle shadow-sm h-100 bg-white">
                      <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-center mb-2 border-bottom border-secondary-subtle pb-1">
                          <div class="text-dark fw-bold small">
                            <i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatFecha(ex.fecha_examen) }}
                          </div>
                          <span v-if="ex.titulo" class="text-muted small fst-italic text-truncate ms-2" style="max-width: 160px;">
                            {{ ex.titulo }}
                          </span>
                        </div>
                        <DetallesExamen :detalles="ex.detalles" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- ── Alerta datos erróneos ── -->
          <div class="alert alert-warning border-warning-subtle text-dark d-flex align-items-start gap-2 mt-4 mb-0"
              style="font-size: 0.85rem;">
            <i class="bi bi-info-circle-fill text-dark mt-1 flex-shrink-0"></i>
            <span>
              <strong>¿Detectaste algún dato erróneo?</strong>
              Si alguno de tus exámenes o reuniones no figura correctamente, por favor comunicate con tu
              <strong>coordinador de grupo</strong> para que pueda revisarlo y corregirlo.
            </span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineComponent, h } from 'vue'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Mi Rendimiento | AAAB',
  meta: [{ name: 'description', content: 'Historial personal de reuniones y exámenes.' }],
})

// ═══════════ CONSTANTES ═══════════
const TIPOS_EXAMEN = ['asamblea', 'recuperatorio']

const ESTADO_MAP = {
  'aprobado':    { texto: 'APROBADO',    dot: 'bg-success',   txt: 'text-success'   },
  'desaprobado': { texto: 'DESAPROBADO', dot: 'bg-danger',    txt: 'text-danger'    },
  'no lo hizo':  { texto: 'NO LO HIZO',  dot: 'bg-info',      txt: 'text-info'      },
  'ausente':     { texto: 'AUSENTE',     dot: 'bg-secondary', txt: 'text-secondary' },
}

const TIPO_BADGE_MAP = {
  asamblea:      'bg-dark text-white',
  recuperatorio: 'bg-warning text-dark',
}

// ═══════════ HELPERS ═══════════
const textoEstado      = (e) => ESTADO_MAP[e]?.texto ?? 'OTRO'
const claseDot         = (e) => ESTADO_MAP[e]?.dot   ?? 'bg-dark'
const claseTextoEstado = (e) => ESTADO_MAP[e]?.txt   ?? 'text-dark'
const badgeTipo        = (t) => TIPO_BADGE_MAP[t]    ?? 'bg-dark text-white'
const formatFecha      = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha       = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''
const parseFecha       = (f) => {
  const [d, m, y] = (f?.split(' ')[0] ?? '').split('/')
  return new Date(`${y}-${m}-${d}`).getTime() || 0
}
const sortPorFecha = (lista) => [...lista].sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0))

const normalizarAsistencia = (valor) => {
  if (valor === null || valor === undefined) return ''
  const texto = String(valor).trim().toLowerCase()
  if (texto === 'presente') return 'presente'
  if (texto === 'ausente')  return 'ausente'
  return ''
}

// ═══════════ COMPONENTES INTERNOS ═══════════
const AsistenciaBadge = defineComponent({
  props: { asistencia: String },
  setup(props) {
    return () => {
      const estado = normalizarAsistencia(props.asistencia)
      return h('span', {
        class: estado === 'presente'
          ? 'badge bg-success text-white px-2 py-1'
          : estado === 'ausente'
            ? 'badge bg-secondary text-white px-2 py-1'
            : 'badge bg-light text-muted border px-2 py-1',
      }, estado === 'presente' ? 'PRESENTE' : estado === 'ausente' ? 'AUSENTE' : 'SIN INFO')
    }
  },
})

const DetallesExamen = defineComponent({
  props: { detalles: Array },
  setup(props) {
    return () => {
      const dets = props.detalles || []
      if (!dets.length)
        return h('span', { class: 'text-muted small' }, '—')
      if (dets.length === 1 && (dets[0].estado === 'ausente' || dets[0].tipo === 'ausente'))
        return h('span', { class: 'badge bg-secondary text-white px-2 py-1' }, 'AUSENTE')
      return h('div', { class: 'd-flex flex-wrap gap-1' }, dets.map(det =>
        h('span', {
          key: det.id || det.tipo,
          class: 'badge border bg-light text-dark px-2 py-1 d-flex align-items-center gap-1',
        }, [
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

// ═══════════ ESTADO ═══════════
const datosArbitro = ref({ id: null, nombre: '', apellido: '' })
const reuniones     = ref([])
const examenes      = ref([])
const cargando      = ref(true)
const filtroAño     = ref('')

// ═══════════ MAPPERS ═══════════
const mapearFilasReuniones = (filas) => {
  const map = {}
  filas.forEach(row => {
    if (row.tipo !== 'reunion') return
    const key = row.id_evento
    if (!map[key]) {
      map[key] = {
        id:            row.id,
        id_evento:     row.id_evento,
        id_arbitro:    row.id_arbitro,
        asistencia:    row.asistencia,
        fecha_reunion: row.fecha_examen,
        titulo:        row.titulo ?? '',
        _ts:           parseFecha(row.fecha_examen),
      }
    }
  })
  return Object.values(map)
}

const mapearFilasExamenes = (filas) => {
  const map = {}
  filas.forEach(row => {
    const key = `${row.id_evento}_${row.id_arbitro}`
    if (!map[key]) {
      map[key] = {
        id:           row.id,
        id_evento:    row.id_evento,
        id_arbitro:   row.id_arbitro,
        tipo:         row.categoria,
        fecha_examen: row.fecha_examen,
        titulo:       row.titulo ?? '',
        _ts:          parseFecha(row.fecha_examen),
        detalles:     [],
      }
    }
    map[key].detalles.push({
      id:           row.id,
      tipo:         row.tipo,
      calificacion: row.calificacion,
      estado:       row.estado,
    })
  })
  return Object.values(map)
}

// ═══════════ CARGA ═══════════
const cargarDatos = async () => {
  const idArbitro = datosArbitro.value.id
  if (!idArbitro) return
  cargando.value = true
  try {
    const [resReuniones, resExamenes] = await Promise.all([
      api.get({ entity: 'reuniones', action: 'obtenerAsistenciasArbitro', payload: { idArbitro } }),
      api.get({ entity: 'examenes',  action: 'obtenerExamenesArbitro',    payload: { idArbitro } }),
    ])
    if ((resReuniones.ok || resReuniones.success) && resReuniones.payload)
      reuniones.value = sortPorFecha(mapearFilasReuniones(resReuniones.payload))
    if ((resExamenes.ok || resExamenes.success) && resExamenes.payload)
      examenes.value = sortPorFecha(mapearFilasExamenes(resExamenes.payload))
  } catch (e) {
    console.error('cargarDatos:', e)
  } finally {
    cargando.value = false
  }
}

// ═══════════ COMPUTEDS ═══════════
const añosDisponibles = computed(() => {
  const set = new Set()
  for (const r of reuniones.value) {
    const a = añoDeFecha(r.fecha_reunion)
    if (a) set.add(a)
  }
  for (const ex of examenes.value) {
    const a = añoDeFecha(ex.fecha_examen)
    if (a) set.add(a)
  }
  return [...set].sort((a, b) => Number(b) - Number(a))
})

const reunionesFiltradas = computed(() =>
  filtroAño.value
    ? reuniones.value.filter(r => añoDeFecha(r.fecha_reunion) === filtroAño.value)
    : reuniones.value
)

const examenesFiltrados = computed(() => {
  const lista = filtroAño.value
    ? examenes.value.filter(ex => añoDeFecha(ex.fecha_examen) === filtroAño.value)
    : examenes.value
  return lista.filter(ex => TIPOS_EXAMEN.includes(ex.tipo))
})

const examenesPorTipo = computed(() => {
  const map = {}
  for (const ex of examenesFiltrados.value) {
    ;(map[ex.tipo] ??= []).push(ex)
  }
  return map
})

const tiposExamenPresentes = computed(() =>
  TIPOS_EXAMEN.filter(t => examenesPorTipo.value[t]?.length)
)

const statsGlobales = computed(() => {
  const r = {
    aprobadosExamen:    0,
    desaprobadosExamen: 0,
    ausentesExamen:     0,
    noHizoExamen:       0,
    presentesReunion:   0,
    ausentesReunion:    0,
  }
  for (const reunion of reunionesFiltradas.value) {
    const estado = normalizarAsistencia(reunion.asistencia)
    if      (estado === 'presente') r.presentesReunion++
    else if (estado === 'ausente')  r.ausentesReunion++
  }
  for (const ex of examenesFiltrados.value) {
    const esAusenteTotal = ex.detalles.length === 1 &&
      (ex.detalles[0].estado === 'ausente' || ex.detalles[0].tipo === 'ausente')
    if (esAusenteTotal) {
      r.ausentesExamen++
    } else {
      for (const det of ex.detalles) {
        if      (det.estado === 'aprobado')    r.aprobadosExamen++
        else if (det.estado === 'desaprobado') r.desaprobadosExamen++
        else if (det.estado === 'no lo hizo')  r.noHizoExamen++
      }
    }
  }
  return r
})

// ═══════════ INIT ═══════════
onMounted(async () => {
  const user = auth.getUser()
  if (user?.id) {
    datosArbitro.value = {
      id:       user.id,
      nombre:   user.nombre   ?? '',
      apellido: user.apellido ?? '',
    }
    await cargarDatos()
  } else {
    cargando.value = false
  }
})
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.panel-personal { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.4s; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
</style>
