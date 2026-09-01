<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="panel-personal animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- ── Header ── -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-graph-up-arrow me-1"></i> Mi Rendimiento
            </h4>
            <span class="text-muted small d-block mt-1">
              {{ datosArbitro.apellido }}, {{ datosArbitro.nombre }} — Reuniones y Exámenes
            </span>
          </div>
          <div class="d-flex align-items-center gap-2 mt-2 mt-md-0 w-100 w-md-auto">
            <label class="small fw-bold text-dark text-uppercase m-0 text-nowrap">Año:</label>
            <select
              v-model="filtroAño"
              class="form-select shadow-sm border-secondary-subtle fw-semibold flex-grow-1"
              style="min-width: 0;"
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
        <div v-else class="card-body p-0 bg-white">

          <!-- ══ SECCIÓN MOTIVACIONAL Y ESTADÍSTICAS ══ -->
          <div class="p-3 p-md-4 bg-light border-bottom">
            <h5 class="fw-bold text-dark mb-1">{{ fraseMotivadora }}</h5>
            <p class="text-muted small mb-4">El entrenamiento invisible se nota en la cancha. Acá está el resumen de tu preparación.</p>

            <div class="row g-4">
              <!-- Progreso Asistencia -->
              <div class="col-12 col-md-6">
                <div class="d-flex justify-content-between align-items-end mb-1">
                  <span class="fw-bold text-primary small text-uppercase"><i class="bi bi-people-fill me-1"></i> Asistencia a Reuniones</span>
                  <span class="fw-bold fs-5 text-primary">{{ porcentajeAsistencia }}%</span>
                </div>
                <div class="progress shadow-sm" style="height: 12px; border-radius: 12px; background-color: #e2e8f0;">
                  <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated" role="progressbar"
                       :style="{ width: porcentajeAsistencia + '%' }"></div>
                </div>
                <div class="d-flex justify-content-between mt-2 small fw-bold text-muted">
                  <span><span class="text-success">{{ statsGlobales.presentesReunion }}</span> Presentes</span>
                  <span><span class="text-danger">{{ statsGlobales.ausentesReunion }}</span> Ausentes</span>
                </div>
              </div>

              <!-- Progreso Exámenes -->
              <div class="col-12 col-md-6">
                <div class="d-flex justify-content-between align-items-end mb-1">
                  <span class="fw-bold text-danger small text-uppercase"><i class="bi bi-clipboard2-check-fill me-1"></i> Evaluaciones Aprobadas</span>
                  <span class="fw-bold fs-5 text-danger">{{ porcentajeExamenes }}%</span>
                </div>
                <div class="progress shadow-sm" style="height: 12px; border-radius: 12px; background-color: #e2e8f0;">
                  <div class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar"
                       :style="{ width: porcentajeExamenes + '%' }"></div>
                </div>
                <!-- Desglose de exámenes en 4 estados -->
                <div class="row row-cols-2 row-cols-sm-4 mt-2 small fw-bold text-muted g-2 text-center text-sm-start">
                  <div class="col">
                    <span class="text-success d-block d-sm-inline">{{ statsGlobales.aprobadosExamen }}</span> Aprobados
                  </div>
                  <div class="col">
                    <span class="text-danger d-block d-sm-inline">{{ statsGlobales.desaprobadosExamen }}</span> Desaprobados
                  </div>
                  <div class="col">
                    <span class="text-secondary d-block d-sm-inline">{{ statsGlobales.ausentesExamen }}</span> Ausentes
                  </div>
                  <div class="col">
                    <span class="text-info d-block d-sm-inline">{{ statsGlobales.noHizoExamen }}</span> No lo hizo
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-3 p-md-4">

            <!-- ══ TARJETAS DE EXÁMENES ══ -->
            <div class="mb-5">
              <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
                <i class="bi bi-clipboard2-check-fill text-danger me-2 fs-5"></i>
                <h6 class="fw-bold m-0 text-dark text-uppercase">Historial de Exámenes</h6>
                <span class="badge bg-danger rounded-pill px-2 ms-auto">{{ examenesFiltrados.length }}</span>
              </div>

              <div v-if="!examenesFiltrados.length" class="text-center py-4 bg-light rounded border border-light-subtle">
                <p class="text-muted m-0 fw-bold small">Sin exámenes registrados en el período seleccionado.</p>
              </div>

              <div v-else class="row g-3">
                <div v-for="ex in examenesFiltrados" :key="ex.id" class="col-12 col-xl-6">
                  <div class="card h-100 shadow-sm border-light-subtle">
                    <div class="card-body p-3">
                      <!-- Cabecera de la tarjeta del examen -->
                      <div class="d-flex justify-content-between align-items-start mb-3 border-bottom pb-2 gap-2">
                        <div class="flex-grow-1" style="min-width: 0;">
                          <div class="text-dark fw-bold small mb-1">
                            <i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatFecha(ex.fecha_examen) }}
                          </div>
                          <div class="text-muted small text-truncate">
                            {{ ex.titulo || 'Evaluación General' }}
                          </div>
                        </div>
                        <span class="badge flex-shrink-0" :class="badgeTipo(ex.tipo)">{{ ex.tipo.toUpperCase() }}</span>
                      </div>

                      <!-- Si faltó a todo el evento -->
                      <div v-if="esAusenteTotal(ex)" class="text-center p-3 bg-secondary bg-opacity-10 rounded">
                        <span class="badge bg-secondary px-3 py-2">AUSENTE A LA JORNADA</span>
                      </div>

                      <!-- Detalle Teórico / Físico -->
                      <div v-else class="row g-2">
                        <!-- Teórico -->
                        <div class="col-6">
                          <div class="p-2 h-100 rounded text-center border" :class="fondoTarjetaExamen(getDetalle(ex, 'teorico'), 'teorico')">
                            <span class="d-block small fw-bold text-uppercase text-muted mb-1">Teórico</span>
                            <div v-if="getDetalle(ex, 'teorico')">
                              <span class="badge w-100 py-2" :class="claseBadgeExamen(getDetalle(ex, 'teorico'), 'teorico')">
                                {{ formatEstadoExamen(getDetalle(ex, 'teorico'), 'teorico') }}
                              </span>
                              <div v-if="getNota(getDetalle(ex, 'teorico'))" class="small fw-bold mt-1 text-dark">
                                Nota: {{ getNota(getDetalle(ex, 'teorico')) }}
                              </div>
                            </div>
                            <span v-else class="text-muted small">—</span>
                          </div>
                        </div>

                        <!-- Físico -->
                        <div class="col-6">
                          <div class="p-2 h-100 rounded text-center border" :class="fondoTarjetaExamen(getDetalle(ex, 'fisico'), 'fisico')">
                            <span class="d-block small fw-bold text-uppercase text-muted mb-1">Físico</span>
                            <div v-if="getDetalle(ex, 'fisico')">
                              <span class="badge w-100 py-2" :class="claseBadgeExamen(getDetalle(ex, 'fisico'), 'fisico')">
                                {{ formatEstadoExamen(getDetalle(ex, 'fisico'), 'fisico') }}
                              </span>
                            </div>
                            <span v-else class="text-muted small">—</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ══ TARJETAS DE REUNIONES ══ -->
            <div>
              <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-primary">
                <i class="bi bi-people-fill text-primary me-2 fs-5"></i>
                <h6 class="fw-bold m-0 text-dark text-uppercase">Historial de Reuniones</h6>
                <span class="badge bg-primary rounded-pill px-2 ms-auto">{{ reunionesFiltradas.length }}</span>
              </div>

              <div v-if="!reunionesFiltradas.length" class="text-center py-4 bg-light rounded border border-light-subtle">
                <p class="text-muted m-0 fw-bold small">Sin reuniones registradas en el período seleccionado.</p>
              </div>

              <div v-else class="row g-2">
                <div v-for="r in reunionesFiltradas" :key="r.id_evento" class="col-12 col-md-6 col-lg-4">
                  <div class="card shadow-sm h-100 bg-white"
                       :class="r.asistencia === 'presente' ? 'border-success border-start border-4' : (r.asistencia === 'ausente' ? 'border-danger border-start border-4' : 'border-light-subtle')">
                    <div class="card-body p-3 d-flex justify-content-between align-items-center gap-2">
                      <div class="flex-grow-1" style="min-width: 0;">
                        <div class="text-dark fw-bold small mb-1">
                          <i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatFecha(r.fecha_reunion) }}
                        </div>
                        <div class="text-muted small text-truncate">
                          {{ r.titulo || 'Reunión General' }}
                        </div>
                      </div>
                      <AsistenciaBadge :asistencia="r.asistencia" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- ── Alerta de soporte ── -->
          <div class="alert alert-warning border-warning-subtle text-dark d-flex align-items-start gap-2 m-3 m-md-4 rounded-3" style="font-size: 0.85rem;">
            <i class="bi bi-info-circle-fill text-dark mt-1 flex-shrink-0"></i>
            <span>
              <strong>¿Detectaste algún dato erróneo?</strong>
              Si alguna evaluación o asistencia no figura correctamente, por favor comunicate con tu <strong>coordinador de grupo</strong> para que pueda revisarlo.
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
import { auth } from '../../../api/auth'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Mi Rendimiento | AAAB',
  meta: [{ name: 'description', content: 'Historial personal de reuniones y exámenes.' }],
})

// ═══════════ CONSTANTES ═══════════
const TIPOS_EXAMEN = ['asamblea', 'recuperatorio']

const MAPA_ESTADOS_NUMERICOS = { '1': 'aprobado', '2': 'desaprobado', '3': 'no lo hizo', '5': 'ausente' }

const TIPO_BADGE_MAP = {
  asamblea:      'bg-dark text-white',
  recuperatorio: 'bg-warning text-dark',
}

// ═══════════ HELPERS ═══════════
const normalizarEstado = (e) => {
  const s = String(e ?? '').trim().toLowerCase()
  return MAPA_ESTADOS_NUMERICOS[s] ?? s
}

const formatFecha = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''
const parseFecha = (f) => {
  const [d, m, y] = (f?.split(' ')[0] ?? '').split('/')
  return new Date(`${y}-${m}-${d}`).getTime() || 0
}
const sortPorFecha = (lista) => [...lista].sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0))

const badgeTipo = (t) => TIPO_BADGE_MAP[t] ?? 'bg-dark text-white'

// Extraer el detalle específico (teórico o físico) de un examen
const getDetalle = (ex, tipo) => {
  return ex.detalles.find(d => d.tipo.toLowerCase() === tipo.toLowerCase()) || null
}

const esAusenteTotal = (examen) => {
  return examen.detalles.length === 1 &&
         (examen.detalles[0].estado === 'ausente' || examen.detalles[0].tipo === 'ausente')
}

// Nota numérica (acepta "80", "80%", "72,5") — igual que la planilla admin
const notaNumerica = (detalle) => {
  if (!detalle) return null
  const num = parseFloat(String(detalle.calificacion ?? '').replace('%', '').replace(',', '.').trim())
  return Number.isNaN(num) ? null : num
}

// Estado efectivo del teórico según el umbral 75 (≥75 aprobado, ≤74 desaprobado),
// igual que en la Planilla General. El físico y los estados especiales
// (ausente / no lo hizo) usan el estado tal cual viene.
const estadoEfectivo = (detalle, tipo) => {
  if (!detalle) return ''
  if (tipo === 'teorico' && detalle.estado !== 'no lo hizo' && detalle.estado !== 'ausente') {
    const num = notaNumerica(detalle)
    if (num !== null) return num >= 75 ? 'aprobado' : 'desaprobado'
  }
  return detalle.estado
}

// Lógica para las tarjetas de Exámenes
const formatEstadoExamen = (detalle, tipo) => {
  const est = estadoEfectivo(detalle, tipo)
  if (!est) return ''
  if (est === 'aprobado') return 'APROBADO'
  if (est === 'desaprobado') return 'DESAPROBADO'
  if (est === 'no lo hizo') return 'No lo hizo'
  if (est === 'ausente') return 'AUSENTE'
  return est.toUpperCase()
}

const getNota = (detalle) => {
  if (!detalle || !detalle.calificacion || detalle.estado === 'no lo hizo' || detalle.estado === 'ausente') return null
  return detalle.calificacion
}

const fondoTarjetaExamen = (detalle, tipo) => {
  const est = estadoEfectivo(detalle, tipo)
  if (est === 'aprobado') return 'bg-success bg-opacity-10 border-success-subtle'
  if (est === 'desaprobado') return 'bg-danger bg-opacity-10 border-danger-subtle'
  if (est === 'ausente') return 'bg-secondary bg-opacity-10 border-secondary-subtle'
  if (est === 'no lo hizo') return 'bg-info bg-opacity-10 border-info-subtle'
  return 'bg-light border-light-subtle'
}

const claseBadgeExamen = (detalle, tipo) => {
  const est = estadoEfectivo(detalle, tipo)
  if (est === 'aprobado') return 'bg-success'
  if (est === 'desaprobado') return 'bg-danger'
  if (est === 'no lo hizo') return 'bg-info text-dark' // Celeste para el SAF
  return 'bg-secondary'
}

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
            ? 'badge bg-danger text-white px-2 py-1'
            : 'badge bg-light text-muted border px-2 py-1',
      }, estado === 'presente' ? 'PRESENTE' : estado === 'ausente' ? 'AUSENTE' : 'SIN INFO')
    }
  },
})

// ═══════════ ESTADO ═══════════
const datosArbitro = ref({ id: null, nombre: '', apellido: '' })
const reuniones    = ref([])
const examenes     = ref([])
const cargando     = ref(true)
const filtroAño    = ref('')

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
      // Aplicamos el normalizador acá para asegurar que un '3' se convierta en 'no lo hizo'
      estado:       normalizarEstado(row.estado),
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

const statsGlobales = computed(() => {
  const r = { aprobadosExamen: 0, desaprobadosExamen: 0, ausentesExamen: 0, noHizoExamen: 0, presentesReunion: 0, ausentesReunion: 0 }

  // Reuniones
  for (const reunion of reunionesFiltradas.value) {
    const estado = normalizarAsistencia(reunion.asistencia)
    if      (estado === 'presente') r.presentesReunion++
    else if (estado === 'ausente')  r.ausentesReunion++
  }

  // Exámenes (el teórico respeta el umbral 75, igual que el badge)
  for (const ex of examenesFiltrados.value) {
    if (esAusenteTotal(ex)) {
      r.ausentesExamen++
    } else {
      for (const det of ex.detalles) {
        const est = estadoEfectivo(det, det.tipo)
        if      (est === 'aprobado')    r.aprobadosExamen++
        else if (est === 'desaprobado') r.desaprobadosExamen++
        else if (est === 'no lo hizo')  r.noHizoExamen++
        else if (est === 'ausente')     r.ausentesExamen++
      }
    }
  }
  return r
})

const porcentajeAsistencia = computed(() => {
  const totales = statsGlobales.value.presentesReunion + statsGlobales.value.ausentesReunion
  return totales === 0 ? 0 : Math.round((statsGlobales.value.presentesReunion / totales) * 100)
})

const porcentajeExamenes = computed(() => {
  const totales = statsGlobales.value.aprobadosExamen + statsGlobales.value.desaprobadosExamen
  return totales === 0 ? 0 : Math.round((statsGlobales.value.aprobadosExamen / totales) * 100)
})

// Frases motivadoras exclusivas de Handball
const fraseMotivadora = computed(() => {
  if (reunionesFiltradas.value.length === 0 && examenesFiltrados.value.length === 0)
    return 'Todo listo para dar el saque de centro.'

  const promedio = (porcentajeAsistencia.value + porcentajeExamenes.value) / 2
  const nombre = datosArbitro.value.nombre

  if (promedio >= 90)
    return `¡Qué nivel, ${nombre}! Tu compromiso con el arbitraje está rindiendo sus frutos.`

  if (promedio >= 75)
    return `¡Vas por excelente camino, ${nombre}! Un último empujón de constancia y estás en tu mejor versión.`

  if (promedio >= 50)
    return `¡A no bajar los brazos, ${nombre}! Estás en carrera, seguí preparándote y hacé la diferencia.`

  return `¡${nombre}, toca hacer autocrítica y volver más fuerte! El arbitraje no perdona la falta de preparación.`
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
.full-screen-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  padding-bottom: 120px;
}
.panel-personal {
  width: 100%;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}
.animate__animated {
  animation-duration: 0.4s;
}
.w-fit-content {
  width: fit-content;
}
@media (min-width: 768px) {
  .w-md-auto {
    width: auto !important;
  }
}
</style>
