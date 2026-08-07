<template>
  <div class="container-fluid px-2 px-md-3 py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">

      <!-- ================= HEADER ================= -->
      <div class="card-header bg-white p-0 border-bottom">
        <div class="px-3 py-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-calendar-week"></i> Mis Designaciones
          </h4>
          <p class="text-muted small m-0 mt-1">Tus partidos designados, próximos y anteriores</p>
        </div>

        <div
          v-if="infoTorneo && vistaActiva === 'proximas'"
          class="d-flex flex-wrap align-items-center gap-2 px-3 py-2 bg-danger bg-opacity-10 border-top"
        >
          <span class="d-inline-flex align-items-center gap-2 text-danger fw-bold small min-w-0">
            <i class="bi bi-trophy-fill flex-shrink-0"></i>
            <span class="text-break">{{ infoTorneo.torneo }}</span>
          </span>
          <span class="d-inline-flex align-items-center gap-1 text-muted small ms-md-auto">
            <i class="bi bi-calendar-event flex-shrink-0"></i>
            {{ infoTorneo.fecha_torneo }}
          </span>
        </div>
      </div>

      <!-- ================= BODY ================= -->
      <div class="card-body p-2 p-sm-3 p-md-4">

        <div v-if="cargando" class="text-center py-5">
          <span class="spinner-border text-danger"></span>
          <p class="text-muted mt-3 m-0 fw-bold small">Cargando tus designaciones...</p>
        </div>

        <template v-else>

          <!-- TABS: cada botón ocupa 50% en móvil, auto en desktop -->
          <ul class="nav nav-pills gap-2 mb-4 flex-nowrap">
            <li class="nav-item flex-fill flex-sm-grow-0">
              <button
                @click="vistaActiva = 'proximas'"
                class="nav-link w-100 py-2 px-2 px-sm-4 fw-bold small shadow-sm d-flex align-items-center justify-content-center gap-2"
                :class="vistaActiva === 'proximas' ? 'active bg-danger text-white' : 'bg-light border text-dark'"
              >
                <i class="bi bi-calendar-plus"></i>
                <span>Próximas</span>
                <span class="badge rounded-pill" :class="vistaActiva === 'proximas' ? 'bg-white text-danger' : 'bg-secondary'">{{ proximas.length }}</span>
              </button>
            </li>
            <li class="nav-item flex-fill flex-sm-grow-0">
              <button
                @click="vistaActiva = 'anteriores'"
                class="nav-link w-100 py-2 px-2 px-sm-4 fw-bold small shadow-sm d-flex align-items-center justify-content-center gap-2"
                :class="vistaActiva === 'anteriores' ? 'active bg-dark text-white' : 'bg-light border text-dark'"
              >
                <i class="bi bi-clock-history"></i>
                <span>Anteriores</span>
                <span class="badge rounded-pill" :class="vistaActiva === 'anteriores' ? 'bg-white text-dark' : 'bg-secondary'">{{ anteriores.length }}</span>
              </button>
            </li>
          </ul>

          <!-- ================= PROXIMAS ================= -->
          <div v-if="vistaActiva === 'proximas'">
            <div v-if="proximas.length === 0" class="text-center py-5 text-muted bg-light rounded-3">
              <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">event_busy</span>
              <p class="m-0 fw-bold">No tenés designaciones próximas.</p>
              <p class="small m-0 mt-1">Cuando la asociación publique las designaciones del fin de semana, vas a ver tus partidos acá.</p>
            </div>

            <div v-else v-for="dia in diasProximas" :key="'prox-' + dia.fecha" class="mb-4">
              <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <span class="badge bg-danger rounded-pill px-3 py-2 shadow-sm text-wrap text-start">
                  <i class="bi bi-calendar-day me-1"></i> {{ etiquetaDia(dia.fecha) }}
                </span>
                <span class="text-muted small fw-bold">{{ dia.partidos.length }} {{ dia.partidos.length === 1 ? 'partido' : 'partidos' }}</span>
              </div>

              <div class="timeline">
                <div v-for="p in dia.partidos" :key="p.id" class="timeline-item">
                  <div class="timeline-hora">
                    <span class="hora-burbuja">{{ formatearHora(p.horario) }}</span>
                  </div>
                  <div class="timeline-card shadow-sm">
                    <div class="d-flex justify-content-between align-items-start flex-wrap gap-1 mb-1">
                      <span class="fw-bold text-dark text-uppercase text-break">{{ p.local }} <span class="text-muted fw-normal">vs</span> {{ p.visitante }}</span>
                      <span class="badge bg-danger-subtle text-danger border border-danger-subtle flex-shrink-0" style="font-size: 0.65rem;">{{ p.categoria_division }}</span>
                    </div>
                    <div class="small text-muted d-flex align-items-center flex-wrap gap-1 mb-2">
                      <span class="material-icons flex-shrink-0" style="font-size: 15px;">stadium</span>
                      <span class="fw-bold text-dark text-break">{{ p.cancha }}</span>
                      <a
                        v-if="linkMapaCancha(p)"
                        :href="linkMapaCancha(p)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link-mapa-cancha"
                        title="Ver ubicación en Google Maps"
                      ><i class="bi bi-geo-alt-fill"></i> Ver Mapa</a>
                    </div>
                    <div v-if="p.funcion == 'arbitro'" class="small d-flex align-items-start gap-1 text-dark">
                      <span class="material-icons text-danger flex-shrink-0" style="font-size: 15px;">groups</span>
                      <span class="text-break"><strong>Pareja:</strong> {{ obtenerPareja(p) }}</span>
                    </div>
                    <template v-if="p.funcion == 'delegado'">
                      <div class="small d-flex align-items-start gap-1 text-dark mb-1">
                        <span class="material-icons text-danger flex-shrink-0" style="font-size: 15px;">person</span>
                        <span class="text-break"><strong>Función:</strong> Delegado Técnico</span>
                      </div>
                      <div class="small d-flex align-items-start gap-1 text-dark">
                        <span class="material-icons text-danger flex-shrink-0" style="font-size: 15px;">groups</span>
                        <span class="text-break"><strong>Arbitros:</strong> {{ p.arbitro_1 }} - {{ p.arbitro_2 }}</span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= ANTERIORES ================= -->
          <div v-else class="anteriores">
            <div v-if="anteriores.length === 0" class="text-center py-5 text-muted bg-light rounded-3">
              <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">history_toggle_off</span>
              <p class="m-0 fw-bold">Todavía no tenés designaciones anteriores.</p>
            </div>

            <template v-else>

              <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <span class="small fw-bold text-muted text-uppercase">Filtrar por año:</span>
                <select v-model="anioSeleccionado" class="form-select form-select-sm shadow-none w-auto fw-bold">
                  <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
                </select>
              </div>

              <div
                v-for="mes in mesesAnteriores"
                :key="mes.clave"
                class="card border shadow-sm mb-3 rounded-3 overflow-hidden"
              >
                <button
                  @click="toggleMes(mes.clave)"
                  class="acordeon-mes d-flex justify-content-between align-items-center w-100 px-3 py-2 gap-2"
                >
                  <span class="fw-bold text-dark d-flex align-items-center gap-2 text-truncate">
                    <i class="bi text-secondary flex-shrink-0" :class="mesesAbiertos.includes(mes.clave) ? 'bi-folder2-open' : 'bi-folder2'"></i>
                    <span class="text-truncate">{{ mes.etiqueta }}</span>
                  </span>
                  <span class="d-flex align-items-center gap-2 flex-shrink-0">
                    <span class="badge bg-secondary rounded-pill">{{ mes.cantidad }}</span>
                    <i class="bi text-muted" :class="mesesAbiertos.includes(mes.clave) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                  </span>
                </button>

                <div v-show="mesesAbiertos.includes(mes.clave)" class="p-2 p-sm-3 bg-light border-top">
                  <div v-for="dia in mes.dias" :key="'ant-' + dia.fecha" class="card border shadow-sm mb-2 rounded-3 overflow-hidden">

                    <button
                      @click="toggleDia(mes.clave, dia.fecha)"
                      class="acordeon-mes d-flex justify-content-between align-items-center w-100 px-2 px-sm-3 py-2 gap-2"
                    >
                      <span class="d-flex align-items-center gap-2 flex-wrap min-w-0">
                        <span class="badge bg-dark rounded-pill px-3 py-2 text-wrap text-start">
                          <i class="bi bi-calendar-day me-1"></i> {{ etiquetaDia(dia.fecha) }}
                        </span>
                        <span v-if="dia.partidos[0] && dia.partidos[0].torneo" class="badge bg-secondary-subtle text-secondary border rounded-pill px-2 py-1 d-none d-md-inline text-truncate">
                          <i class="bi bi-trophy me-1"></i> {{ dia.partidos[0].torneo }}
                        </span>
                      </span>
                      <span class="d-flex align-items-center gap-2 flex-shrink-0">
                        <span class="badge bg-secondary rounded-pill">{{ dia.partidos.length }}</span>
                        <i class="bi text-muted" :class="diaAbierto(mes.clave, dia.fecha) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                      </span>
                    </button>

                    <div v-show="diaAbierto(mes.clave, dia.fecha)" class="p-2 p-sm-3 border-top bg-white">
                      <div class="timeline">
                        <div v-for="p in dia.partidos" :key="p.id" class="timeline-item">
                          <div class="timeline-hora">
                            <span class="hora-burbuja">{{ formatearHora(p.horario) }}</span>
                          </div>
                          <div class="timeline-card shadow-sm">
                            <div class="d-flex justify-content-between align-items-start flex-wrap gap-1 mb-1">
                              <span class="fw-bold text-dark text-uppercase text-break">{{ p.local }} <span class="text-muted fw-normal">vs</span> {{ p.visitante }}</span>
                              <span class="badge bg-secondary-subtle text-secondary border flex-shrink-0" style="font-size: 0.65rem;">{{ p.categoria_division }}</span>
                            </div>
                            <div class="small text-muted d-flex align-items-center flex-wrap gap-1 mb-2">
                              <span class="material-icons flex-shrink-0" style="font-size: 15px;">stadium</span>
                              <span class="fw-bold text-dark text-break">{{ p.cancha }}</span>
                              <a
                                v-if="linkMapaCancha(p)"
                                :href="linkMapaCancha(p)"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="link-mapa-cancha"
                                title="Ver ubicación en Google Maps"
                              ><i class="bi bi-geo-alt-fill"></i> Ver Mapa</a>
                            </div>
                            <div v-if="p.funcion=='arbitro'" class="small d-flex align-items-start gap-1 text-dark">
                              <span class="material-icons text-secondary flex-shrink-0" style="font-size: 15px;">groups</span>
                              <span class="text-break"><strong>Pareja:</strong> {{ obtenerPareja(p) }}</span>
                            </div>
                            <template v-if="p.funcion=='delegado'">
                              <div class="small d-flex align-items-start gap-1 text-dark mb-1">
                                <span class="material-icons text-secondary flex-shrink-0" style="font-size: 15px;">person</span>
                                <span class="text-break"><strong>Función:</strong> Delegado Técnico</span>
                              </div>
                              <div class="small d-flex align-items-start gap-1 text-dark">
                                <span class="material-icons text-secondary flex-shrink-0" style="font-size: 15px;">groups</span>
                                <span class="text-break"><strong>Arbitros:</strong> {{ p.arbitro_1 }} - {{ p.arbitro_2 }}</span>
                              </div>
                            </template>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </template>
          </div>

        </template>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Mis Designaciones | AAAB',
  meta: [
    { name: 'description', content: 'Consultá los partidos que te fueron designados.' },
    { property: 'og:title', content: 'Mis Designaciones | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' }
  ],
})

const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']

const arbitro = ref(auth.getUser() || {})
const partidos = ref([])
const cargando = ref(false)
const vistaActiva = ref('proximas')

const anioSeleccionado = ref('')
const mesesAbiertos = ref([])
const diasAbiertos = ref([])

const cargarMisDesignaciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerDesignacionesArbitro'
    })
    if ((res.ok || res.success) && res.payload) {
      partidos.value = res.payload

      // Si no hay próximas pero sí historial, arrancamos en Anteriores
      if (proximas.value.length === 0 && anteriores.value.length > 0) {
        vistaActiva.value = 'anteriores'
      }
    }
  } catch (err) {
    console.error('Error al cargar mis designaciones:', err)
  } finally {
    cargando.value = false
  }
}

/* ====================================================
   FECHAS
   ==================================================== */
const parsearFecha = (fecha) => {
  if (!fecha) return 0
  const texto = String(fecha).trim().slice(0, 10)

  let m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()

  m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    const anio = m[3].length === 2 ? '20' + m[3] : m[3]
    return new Date(Number(anio), Number(m[2]) - 1, Number(m[1])).getTime()
  }

  return 0
}

const linkMapaCancha = (p) => {
  const direccion = [p.cj_domicilio, p.cj_localidad].filter(Boolean).join(', ').trim()
  return direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}` : null
}

const etiquetaDia = (fecha) => {
  const timestamp = parsearFecha(fecha)
  if (!timestamp) return fecha || 'Sin fecha'
  const d = new Date(timestamp)
  const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dias[d.getDay()]} ${dd}/${mm}/${d.getFullYear()}`
}

const formatearHora = (horario) => {
  if (!horario) return '--:--'
  return String(horario).slice(0, 5)
}

const fechaLimpia = (fecha) => {
  const f = String(fecha || '').trim().slice(0, 10)
  return (!f || f.startsWith('0000')) ? '' : f
}

const hoy = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/* ====================================================
   PROXIMAS / ANTERIORES
   ==================================================== */
const proximas = computed(() => {
  return partidos.value.filter(p => {
    const t = parsearFecha(fechaLimpia(p.fecha))
    return !t || t >= hoy()
  })
})

const anteriores = computed(() => {
  return partidos.value.filter(p => {
    const t = parsearFecha(fechaLimpia(p.fecha))
    return t && t < hoy()
  })
})

const agruparPorDia = (lista, orden) => {
  const mapa = {}
  lista.forEach(p => {
    const f = fechaLimpia(p.fecha) || 'Sin fecha'
    if (!mapa[f]) mapa[f] = []
    mapa[f].push(p)
  })

  return Object.keys(mapa)
    .sort((a, b) => orden === 'desc' ? parsearFecha(b) - parsearFecha(a) : parsearFecha(a) - parsearFecha(b))
    .map(fecha => ({
      fecha,
      partidos: mapa[fecha].sort((a, b) => String(a.horario || '').localeCompare(String(b.horario || '')))
    }))
}

const diasProximas = computed(() => agruparPorDia(proximas.value, 'asc'))

const infoTorneo = computed(() => {
  if (proximas.value.length === 0) return null
  const primero = proximas.value[0]
  if (!primero.torneo && !primero.fecha_torneo) return null
  return { torneo: primero.torneo, fecha_torneo: primero.fecha_torneo }
})

/* ====================================================
   ANTERIORES: FILTRO POR AÑO + MESES COLAPSABLES
   ==================================================== */
const aniosDisponibles = computed(() => {
  const anios = new Set()
  anteriores.value.forEach(p => {
    const f = fechaLimpia(p.fecha)
    if (f) anios.add(f.slice(0, 4))
  })
  return [...anios].sort((a, b) => b.localeCompare(a))
})

watch(aniosDisponibles, (anios) => {
  if (!anios.includes(anioSeleccionado.value)) {
    anioSeleccionado.value = anios.length > 0 ? anios[0] : ''
  }
}, { immediate: true })

const mesesAnteriores = computed(() => {
  const mapa = {}
  anteriores.value.forEach(p => {
    const f = fechaLimpia(p.fecha)
    if (!f || f.slice(0, 4) !== anioSeleccionado.value) return
    const clave = f.slice(0, 7) // YYYY-MM
    if (!mapa[clave]) mapa[clave] = []
    mapa[clave].push(p)
  })

  return Object.keys(mapa)
    .sort((a, b) => b.localeCompare(a))
    .map(clave => ({
      clave,
      etiqueta: `${MESES[Number(clave.slice(5, 7)) - 1]} ${clave.slice(0, 4)}`,
      cantidad: mapa[clave].length,
      dias: agruparPorDia(mapa[clave], 'desc')
    }))
})

// Al cambiar de año, todo arranca colapsado
watch(anioSeleccionado, () => {
  mesesAbiertos.value = []
  diasAbiertos.value = []
})

const toggleMes = (clave) => {
  const idx = mesesAbiertos.value.indexOf(clave)
  if (idx === -1) mesesAbiertos.value.push(clave)
  else mesesAbiertos.value.splice(idx, 1)
}

const claveDia = (mesClave, fecha) => `${mesClave}|${fecha}`

const diaAbierto = (mesClave, fecha) => diasAbiertos.value.includes(claveDia(mesClave, fecha))

const toggleDia = (mesClave, fecha) => {
  const clave = claveDia(mesClave, fecha)
  const idx = diasAbiertos.value.indexOf(clave)
  if (idx === -1) diasAbiertos.value.push(clave)
  else diasAbiertos.value.splice(idx, 1)
}

const obtenerPareja = (p) => {
  console.log(p)
  const miId = String(arbitro.value.id)
  if (String(p.id_arb1) === miId) return p.arbitro_2 || 'Sin pareja asignada'
  if (String(p.id_arb2) === miId) return p.arbitro_1 || 'Sin pareja asignada'
  return p.arbitro_2 || p.arbitro_1 || '-'
}

onMounted(cargarMisDesignaciones)
</script>

<style scoped>
/* Evita cualquier scroll horizontal por hijos anchos */
.container-fluid {
  overflow-x: hidden;
}

/* Utilidad: permite que un flex-item encoja bajo su contenido (Bootstrap no la trae) */
.min-w-0 {
  min-width: 0;
}

/* ====================================================
   VISTA TIMELINE
   ==================================================== */
.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 10px;
  position: relative;
  padding-bottom: 16px;
}

/* Línea vertical que conecta los partidos del día */
.timeline-item::before {
  content: '';
  position: absolute;
  left: 28px;
  top: 34px;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item:last-child::before {
  display: none;
}

/* Hora: más angosta en móvil, 70px desde tablet */
.timeline-hora {
  width: 56px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.hora-burbuja {
  display: block;
  background: #dc2626;
  color: #fff;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.75rem;
  text-align: center;
  padding: 5px 0;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
}

/* min-width:0 permite que la card encoja y el texto haga wrap */
.timeline-card {
  flex: 1 1 auto;
  min-width: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #dc2626;
  border-radius: 10px;
  padding: 10px 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
}

.link-mapa-cancha {
  font-size: 0.7rem;
  font-weight: 700;
  color: #dc2626;
  text-decoration: none;
  white-space: nowrap;
  margin-left: 2px;
}

.link-mapa-cancha:hover {
  text-decoration: underline;
  color: #dc2626;
}

/* Variante apagada para las designaciones anteriores */
.anteriores .hora-burbuja {
  background: #6b7280;
  box-shadow: 0 2px 6px rgba(107, 114, 128, 0.3);
}

.anteriores .timeline-card {
  border-left-color: #9ca3af;
  background: #fff;
}

/* ====================================================
   ACORDEON DE MESES (ANTERIORES)
   ==================================================== */
.acordeon-mes {
  background: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.acordeon-mes:hover {
  background: #f8fafc;
}

.animate__animated { animation-duration: 0.5s; }

/* Desde tablet, la hora vuelve a 70px y el timeline respira más */
@media (min-width: 576px) {
  .timeline-hora { width: 70px; }
  .timeline-item { gap: 14px; }
  .timeline-item::before { left: 34px; }
  .timeline-card { padding: 10px 14px; }
  .hora-burbuja { font-size: 0.8rem; }
}
</style>
