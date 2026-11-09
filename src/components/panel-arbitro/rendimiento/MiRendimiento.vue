<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">

      <!-- ── Header ── -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-graph-up-arrow me-1"></i> Mi Rendimiento
          </h4>
          <span class="text-muted small d-block mt-1">Asistencia a reuniones y exámenes</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <label for="rendimiento-anio" class="small fw-bold text-muted text-uppercase m-0 text-nowrap">Año:</label>
          <select id="rendimiento-anio" v-model="filtroAño" class="form-select form-select-sm shadow-none w-auto fw-bold text-uppercase text-dark" :disabled="cargando">
            <option value="">TODOS</option>
            <option v-for="a in añosDisponibles" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
      </div>

      <!-- ── Loading ── -->
      <div v-if="cargando" class="card-body text-center py-5">
        <span class="spinner-border text-danger"></span>
        <p class="text-muted mt-3 mb-0 fw-bold">Cargando tu rendimiento...</p>
      </div>

      <!-- ── Sin usuario ── -->
      <div v-else-if="!datosArbitro.id" class="card-body text-center py-5 text-muted">
        <span class="material-icons d-block mb-2 opacity-50" style="font-size: 48px;">person_off</span>
        <p class="fw-bold m-0">No se pudo identificar al árbitro.</p>
      </div>

      <div v-else class="card-body p-3 p-md-4">
        <!-- RESUMEN -->
        <div class="row g-2 g-md-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="resumen-card bg-success text-white">
              <i class="bi bi-person-check-fill"></i>
              <div class="valor">{{ statsGlobales.presentesReunion }}</div>
              <div class="etiqueta">Presentes</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="resumen-card bg-secondary text-white">
              <i class="bi bi-person-dash-fill"></i>
              <div class="valor">{{ statsGlobales.ausentesReunion }}</div>
              <div class="etiqueta">Ausentes</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="resumen-card bg-dark text-white">
              <i class="bi bi-people-fill"></i>
              <div class="valor">{{ totalReuniones ? `${porcentajeAsistencia}%` : '-' }}</div>
              <div class="etiqueta">Asistencia a reuniones</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="resumen-card bg-danger text-white">
              <i class="bi bi-journal-check"></i>
              <div class="valor">{{ totalEvaluaciones ? `${porcentajeExamenes}%` : '-' }}</div>
              <div class="etiqueta">Evaluaciones aprobadas</div>
            </div>
          </div>
        </div>

        <div class="accordion" id="acordeonRendimientoArbitro">
          <!-- ASISTENCIA A REUNIONES -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button type="button" class="accordion-button fw-bold" :class="{ collapsed: !abiertas.reuniones }" :aria-expanded="abiertas.reuniones" aria-controls="seccion-reuniones" @click="abiertas.reuniones = !abiertas.reuniones">
                <i class="bi bi-calendar-check me-2"></i>
                <span class="me-2">Asistencia a reuniones</span>
                <span class="badge bg-success me-1">{{ statsGlobales.presentesReunion }} P</span>
                <span class="badge bg-secondary">{{ statsGlobales.ausentesReunion }} A</span>
              </button>
            </h2>
            <div v-show="abiertas.reuniones" id="seccion-reuniones" class="accordion-collapse">
              <div class="accordion-body p-2 p-md-3">
                <div v-if="!reunionesFiltradas.length" class="text-muted small fst-italic">Sin reuniones registradas en el período seleccionado.</div>
                <div v-else class="d-flex flex-column gap-2">
                  <div v-for="r in reunionesFiltradas" :key="r.id_evento" class="fila-item d-flex justify-content-between align-items-center gap-2">
                    <div class="min-w-0">
                      <div class="fw-bold text-dark small text-break">{{ r.titulo || 'Reunión General' }}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">{{ fechaGuiones(r.fecha_reunion) }}</div>
                    </div>
                    <span class="badge flex-shrink-0" :class="claseAsistencia(r.asistencia)">{{ textoAsistencia(r.asistencia) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- EXÁMENES -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button type="button" class="accordion-button fw-bold" :class="{ collapsed: !abiertas.examenes }" :aria-expanded="abiertas.examenes" aria-controls="seccion-examenes" @click="abiertas.examenes = !abiertas.examenes">
                <i class="bi bi-journal-text me-2"></i>
                <span class="me-2">Exámenes</span>
                <span class="badge bg-light text-dark border">{{ examenesFiltrados.length }}</span>
              </button>
            </h2>
            <div v-show="abiertas.examenes" id="seccion-examenes" class="accordion-collapse">
              <div class="accordion-body p-2 p-md-3">
                <div v-if="!examenesFiltrados.length" class="text-muted small fst-italic">Sin exámenes registrados en el período seleccionado.</div>
                <div v-else class="d-flex flex-column gap-2">
                  <div v-for="ex in examenesFiltrados" :key="ex.id_evento" class="fila-item">
                    <div class="d-flex justify-content-between align-items-start gap-2">
                      <div class="min-w-0">
                        <div class="fw-bold text-dark small text-break">{{ ex.titulo || 'Evaluación General' }}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">{{ fechaGuiones(ex.fecha_examen) }}</div>
                      </div>
                      <span class="badge flex-shrink-0" :class="badgeTipo(ex.tipo)">{{ ex.tipo === 'recuperatorio' ? 'Recuperatorio' : 'Asamblea General' }}</span>
                    </div>
                    <div class="row g-2 mt-1">
                      <div v-for="tipo in ['teorico', 'fisico']" :key="tipo" class="col-6">
                        <div class="resultado d-flex justify-content-between align-items-center gap-1">
                          <span class="small fw-bold text-muted text-uppercase">{{ tipo === 'teorico' ? 'Teórico' : 'Físico' }}</span>
                          <span v-if="getDetalle(ex, tipo)" class="nota text-end" :class="claseTextoExamen(getDetalle(ex, tipo), tipo)">
                            {{ textoResultado(getDetalle(ex, tipo), tipo) }}
                          </span>
                          <span v-else class="small text-muted">—</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Aviso de soporte ── -->
        <div class="alert alert-warning border-warning-subtle text-dark d-flex align-items-start gap-2 mt-3 mb-0 rounded-3 small">
          <i class="bi bi-info-circle-fill text-dark mt-1 flex-shrink-0"></i>
          <span>
            Si alguna evaluación o asistencia no figura correctamente, comunicate con tu <strong>coordinador de grupo</strong> para que la revise.
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { anioActual, conAnioActual } from '@/utils/anios'
import { ref, reactive, onMounted, computed } from 'vue'
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

// dd/mm/aaaa → dd-mm-aaaa
const fechaGuiones = (f) => formatFecha(f).replace(/\//g, '-')

const textoAsistencia = (a) => {
  const estado = normalizarAsistencia(a)
  return estado === 'presente' ? 'Presente' : estado === 'ausente' ? 'Ausente' : 'Sin registro'
}
const claseAsistencia = (a) => {
  const estado = normalizarAsistencia(a)
  return estado === 'presente' ? 'bg-success' : estado === 'ausente' ? 'bg-secondary' : 'bg-light text-muted border'
}

// Resultado de cada parte: estado + nota (teórico) o nivel (físico)
const textoResultado = (detalle, tipo) => {
  const estado = formatEstadoExamen(detalle, tipo)
  const valor = getNota(detalle)
  if (!valor) return estado
  return tipo === 'fisico' ? `${estado} · Nivel ${valor}` : `${estado} · ${valor}`
}
const claseTextoExamen = (detalle, tipo) => {
  const est = estadoEfectivo(detalle, tipo)
  if (est === 'aprobado') return 'text-success'
  if (est === 'desaprobado') return 'text-danger'
  if (est === 'no lo hizo') return 'text-info'
  return 'text-secondary'
}

const normalizarAsistencia = (valor) => {
  if (valor === null || valor === undefined) return ''
  const texto = String(valor).trim().toLowerCase()
  if (texto === 'presente') return 'presente'
  if (texto === 'ausente')  return 'ausente'
  return ''
}

// ═══════════ ESTADO ═══════════
const datosArbitro = ref({ id: null, nombre: '', apellido: '' })
const reuniones    = ref([])
const examenes     = ref([])
const cargando     = ref(true)
const filtroAño    = ref(anioActual())
const abiertas     = reactive({ reuniones: false, examenes: false })

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
    // Hay filas viejas con tipo 'ausente': la Planilla General tampoco las muestra
    if (!['teorico', 'fisico'].includes(String(row.tipo ?? '').trim().toLowerCase())) return
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

// Suma a las notas las asambleas ya realizadas del grupo del árbitro, aunque
// estén vacías. Los recuperatorios solo aparecen si tienen nota o ausencia.
// Una ausencia general se ve como AUSENTE en los tipos sin evaluación propia.
const completarExamenes = (lista, eventos, ausencias, idGrupo) => {
  const porEvento = new Map(lista.map(ex => [String(ex.id_evento), ex]))
  eventos.forEach(ev => {
    const clave = String(ev.id)
    const ausente = ausencias.has(clave)
    const ts = parseFecha(ev.fecha_formato)
    const aplica = Number(ev.todos_grupos) === 1 ||
      String(ev.id_grupos ?? '').split(',').map(s => s.trim()).includes(String(idGrupo))
    if (!porEvento.has(clave)) {
      if (!ausente && (ev.categoria === 'recuperatorio' || !aplica || ts > Date.now())) return
      porEvento.set(clave, {
        id:           ev.id,
        id_evento:    ev.id,
        tipo:         ev.categoria,
        fecha_examen: ev.fecha_formato,
        titulo:       ev.titulo ?? '',
        _ts:          ts,
        detalles:     [],
      })
    }
    if (ausente) {
      const examen = porEvento.get(clave)
      for (const tipo of ['teorico', 'fisico']) {
        if (!getDetalle(examen, tipo)) examen.detalles.push({ tipo, calificacion: '', estado: 'ausente' })
      }
    }
  })
  return [...porEvento.values()]
}

// ═══════════ CARGA ═══════════
const cargarEventosExamen = async () => {
  const [res, resAusencias] = await Promise.all([
    api.get({ entity: 'eventos', action: 'obtenerEventosParaExamen' }),
    api.get({ entity: 'reuniones', action: 'obtenerMisAusenciasExamen' }),
  ])
  if (!(res.ok || res.success) || !Array.isArray(res.payload)) return
  const eventos = res.payload.filter(ev => TIPOS_EXAMEN.includes(ev.categoria))
  const ausencias = new Set(
    (resAusencias.ok || resAusencias.success) && Array.isArray(resAusencias.payload)
      ? resAusencias.payload.map(String)
      : []
  )
  examenes.value = sortPorFecha(completarExamenes(examenes.value, eventos, ausencias, auth.getUser()?.id_grupo))
}

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
    await cargarEventosExamen()
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
  return conAnioActual(set)
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
    for (const det of ex.detalles) {
      const est = estadoEfectivo(det, det.tipo)
      if      (est === 'aprobado')    r.aprobadosExamen++
      else if (est === 'desaprobado') r.desaprobadosExamen++
      else if (est === 'no lo hizo')  r.noHizoExamen++
      else if (est === 'ausente')     r.ausentesExamen++
    }
  }
  return r
})

const totalReuniones = computed(() => statsGlobales.value.presentesReunion + statsGlobales.value.ausentesReunion)
const totalEvaluaciones = computed(() => statsGlobales.value.aprobadosExamen + statsGlobales.value.desaprobadosExamen)

const porcentajeAsistencia = computed(() => {
  const totales = statsGlobales.value.presentesReunion + statsGlobales.value.ausentesReunion
  return totales === 0 ? 0 : Math.round((statsGlobales.value.presentesReunion / totales) * 100)
})

const porcentajeExamenes = computed(() => {
  const totales = statsGlobales.value.aprobadosExamen + statsGlobales.value.desaprobadosExamen
  return totales === 0 ? 0 : Math.round((statsGlobales.value.aprobadosExamen / totales) * 100)
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
.animate__animated { animation-duration: 0.4s; }
.resumen-card {
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  height: 100%;
}
.resumen-card i { font-size: 1.2rem; }
.resumen-card .valor { font-size: 1.4rem; font-weight: 800; line-height: 1.1; margin-top: 4px; }
.resumen-card .etiqueta { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; opacity: 0.85; }
.accordion-item { border-radius: 10px !important; overflow: hidden; margin-bottom: 8px; border: 1px solid #e2e8f0; }
.accordion-button { font-size: 0.9rem; color: #0f172a; background: #fff; box-shadow: none; flex-wrap: wrap; row-gap: 4px; }
.accordion-button:not(.collapsed) { color: #dc2626; background: #fef2f2; }
.accordion-button:focus { box-shadow: 0 0 0 0.2rem rgba(220, 38, 38, 0.2); }
.fila-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
}
.resultado { background: #f8fafc; border-radius: 8px; padding: 6px 8px; flex-wrap: wrap; }
.min-w-0 { min-width: 0; }
.nota { font-weight: 800; font-size: 0.8rem; }
</style>
