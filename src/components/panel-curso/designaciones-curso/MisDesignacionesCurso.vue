<template>
  <div class="container-fluid px-2 px-md-3 py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">

      <!-- ================= HEADER ================= -->
      <div class="card-header bg-white p-0 border-bottom">
        <div class="mx-3 my-3 border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-calendar-week me-1"></i> Mis Designaciones
          </h4>
          <span class="text-muted small d-block mt-1">Encuentros de mini a los que fuiste convocado/a, próximos y anteriores</span>
        </div>
      </div>

      <!-- ================= BODY ================= -->
      <div class="card-body p-2 p-sm-3 p-md-4">

        <div v-if="cargando" class="text-center py-5">
          <span class="spinner-border text-danger"></span>
          <p class="text-muted mt-3 m-0 fw-bold small">Cargando tus designaciones...</p>
        </div>

        <div v-else-if="modalidad && modalidad !== 'anual'" class="text-center py-5 text-muted bg-light rounded-3">
          <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">info</span>
          <p class="m-0 fw-bold">Los encuentros de mini son solo para el curso anual.</p>
        </div>

        <template v-else>

          <!-- TABS: cada botón ocupa 50% en móvil, auto en desktop -->
          <ul class="nav nav-pills gap-2 mb-4 flex-nowrap">
            <li class="nav-item flex-fill flex-sm-grow-0">
              <button
                type="button"
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
                type="button"
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
              <p class="small m-0 mt-1">Cuando te convoquen a un encuentro de mini va a aparecer acá.</p>
            </div>

            <div v-else v-for="dia in diasProximas" :key="'prox-' + dia.fecha" class="mb-4">
              <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <span class="badge bg-danger rounded-pill px-3 py-2 shadow-sm text-wrap text-start">
                  <i class="bi bi-calendar-day me-1"></i> {{ etiquetaDia(dia.fecha) }}
                </span>
                <span class="text-muted small fw-bold">{{ dia.encuentros.length }} {{ dia.encuentros.length === 1 ? 'encuentro' : 'encuentros' }}</span>
              </div>

              <div class="timeline">
                <div v-for="e in dia.encuentros" :key="e.id" class="timeline-item">
                  <div class="timeline-hora">
                    <span class="hora-burbuja">{{ formatearHora(e.hora) }}</span>
                  </div>
                  <div class="timeline-card shadow-sm">
                    <div class="d-flex justify-content-between align-items-start flex-wrap gap-1 mb-1">
                      <span class="fw-bold text-dark text-uppercase text-break">{{ e.titulo }}</span>
                      <span class="badge bg-danger-subtle text-danger border border-danger-subtle" style="font-size: 0.65rem;">Encuentro de mini</span>
                    </div>
                    <div class="small text-muted d-flex align-items-center flex-wrap gap-1">
                      <span class="material-icons flex-shrink-0" style="font-size: 15px;">schedule</span>
                      <span class="fw-bold text-dark">{{ formatearHora(e.hora) }} hs</span>
                    </div>
                    <div v-if="e.comentarios" class="mt-2 pt-2 border-top small d-flex align-items-start gap-1 text-dark">
                      <span class="material-icons text-danger flex-shrink-0" style="font-size: 15px;">chat</span>
                      <span class="text-break comentarios"><strong>Comentarios:</strong> {{ e.comentarios }}</span>
                    </div>
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
                <label for="desig-curso-anio" class="small fw-bold text-muted text-uppercase mb-0">Filtrar por año:</label>
                <select id="desig-curso-anio" v-model="anioSeleccionado" class="form-select form-select-sm shadow-none w-auto fw-bold text-uppercase text-dark">
                  <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
                </select>
              </div>

              <div v-for="mes in mesesAnteriores" :key="mes.clave" class="card border shadow-sm mb-3 rounded-3 overflow-hidden">
                <button
                  type="button"
                  @click="toggleMes(mes.clave)"
                  class="acordeon-mes d-flex justify-content-between align-items-center w-100 px-3 py-2 gap-2"
                  :aria-expanded="mesesAbiertos.includes(mes.clave)"
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
                      type="button"
                      @click="toggleDia(mes.clave, dia.fecha)"
                      class="acordeon-mes d-flex justify-content-between align-items-center w-100 px-2 px-sm-3 py-2 gap-2"
                      :aria-expanded="diaAbierto(mes.clave, dia.fecha)"
                    >
                      <span class="d-flex align-items-center gap-2 flex-wrap min-w-0">
                        <span class="badge bg-dark rounded-pill px-3 py-2 text-wrap text-start">
                          <i class="bi bi-calendar-day me-1"></i> {{ etiquetaDia(dia.fecha) }}
                        </span>
                      </span>
                      <span class="d-flex align-items-center gap-2 flex-shrink-0">
                        <span class="badge bg-secondary rounded-pill">{{ dia.encuentros.length }}</span>
                        <i class="bi text-muted" :class="diaAbierto(mes.clave, dia.fecha) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                      </span>
                    </button>

                    <div v-show="diaAbierto(mes.clave, dia.fecha)" class="p-2 p-sm-3 border-top bg-white">
                      <div class="timeline">
                        <div v-for="e in dia.encuentros" :key="e.id" class="timeline-item">
                          <div class="timeline-hora">
                            <span class="hora-burbuja">{{ formatearHora(e.hora) }}</span>
                          </div>
                          <div class="timeline-card shadow-sm">
                            <div class="d-flex justify-content-between align-items-start flex-wrap gap-1 mb-1">
                              <span class="fw-bold text-dark text-uppercase text-break">{{ e.titulo }}</span>
                              <span class="badge" :class="claseAsistencia(e.asistencia)" style="font-size: 0.65rem;">{{ textoAsistencia(e.asistencia) }}</span>
                            </div>
                            <div class="small text-muted d-flex align-items-center flex-wrap gap-1">
                              <span class="material-icons flex-shrink-0" style="font-size: 15px;">schedule</span>
                              <span class="fw-bold text-dark">{{ formatearHora(e.hora) }} hs</span>
                            </div>
                            <div v-if="e.comentarios" class="mt-2 pt-2 border-top small d-flex align-items-start gap-1 text-dark">
                              <span class="material-icons text-secondary flex-shrink-0" style="font-size: 15px;">chat</span>
                              <span class="text-break comentarios"><strong>Comentarios:</strong> {{ e.comentarios }}</span>
                            </div>
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
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { anioActual } from '@/utils/anios'

useHead({ title: 'Mis Designaciones | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const encuentros = ref([])
const modalidad = ref('')
const cargando = ref(true)
const vistaActiva = ref('proximas')
const mesesAbiertos = ref([])
const diasAbiertos = ref([])

const hoy = new Date().toLocaleDateString('sv-SE')
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']

const etiquetaDia = (fecha) => {
  const [a, m, d] = String(fecha).split('-').map(Number)
  if (!a || !m || !d) return fecha || 'Sin fecha'
  const dia = new Date(a, m - 1, d)
  return `${DIAS[dia.getDay()]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${a}`
}
const formatearHora = (hora) => (hora ? String(hora).slice(0, 5) : '--:--')

const textoAsistencia = (a) => (a === 'presente' ? 'PRESENTE' : a === 'ausente' ? 'AUSENTE' : 'SIN REGISTRO')
const claseAsistencia = (a) => (a === 'presente' ? 'bg-success' : a === 'ausente' ? 'bg-secondary' : 'bg-light text-muted border')

const proximas = computed(() => encuentros.value.filter(e => e.fecha >= hoy))
const anteriores = computed(() => encuentros.value.filter(e => e.fecha < hoy))

const agruparPorDia = (lista, orden) => {
  const mapa = {}
  lista.forEach(e => {
    if (!mapa[e.fecha]) mapa[e.fecha] = []
    mapa[e.fecha].push(e)
  })
  return Object.keys(mapa)
    .sort((a, b) => (orden === 'desc' ? b.localeCompare(a) : a.localeCompare(b)))
    .map(fecha => ({
      fecha,
      encuentros: mapa[fecha].sort((a, b) => String(a.hora || '').localeCompare(String(b.hora || ''))),
    }))
}

const diasProximas = computed(() => agruparPorDia(proximas.value, 'asc'))

// Años con encuentros anteriores (el más reciente primero)
const aniosDisponibles = computed(() => [...new Set(anteriores.value.map(e => e.fecha.slice(0, 4)))].sort((a, b) => b.localeCompare(a)))
const anioSeleccionado = ref(anioActual())

watch(aniosDisponibles, (anios) => {
  if (!anios.includes(anioSeleccionado.value)) anioSeleccionado.value = anios.length ? anios[0] : ''
}, { immediate: true })

const mesesAnteriores = computed(() => {
  const mapa = {}
  anteriores.value.forEach(e => {
    if (e.fecha.slice(0, 4) !== anioSeleccionado.value) return
    const clave = e.fecha.slice(0, 7)
    if (!mapa[clave]) mapa[clave] = []
    mapa[clave].push(e)
  })
  return Object.keys(mapa)
    .sort((a, b) => b.localeCompare(a))
    .map(clave => ({
      clave,
      etiqueta: `${MESES[Number(clave.slice(5, 7)) - 1]} ${clave.slice(0, 4)}`,
      cantidad: mapa[clave].length,
      dias: agruparPorDia(mapa[clave], 'desc'),
    }))
})

// Al cambiar de año, todo arranca colapsado
watch(anioSeleccionado, () => {
  mesesAbiertos.value = []
  diasAbiertos.value = []
})

const toggleMes = (clave) => {
  const i = mesesAbiertos.value.indexOf(clave)
  if (i === -1) mesesAbiertos.value.push(clave)
  else mesesAbiertos.value.splice(i, 1)
}

const claveDia = (mesClave, fecha) => `${mesClave}|${fecha}`
const diaAbierto = (mesClave, fecha) => diasAbiertos.value.includes(claveDia(mesClave, fecha))
const toggleDia = (mesClave, fecha) => {
  const clave = claveDia(mesClave, fecha)
  const i = diasAbiertos.value.indexOf(clave)
  if (i === -1) diasAbiertos.value.push(clave)
  else diasAbiertos.value.splice(i, 1)
}

onMounted(async () => {
  try {
    const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMisDesignacionesCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar tus designaciones')
    modalidad.value = res.payload?.modalidad || ''
    encuentros.value = res.payload?.encuentros || []
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
/* Mismo diseño que Mis Designaciones del panel de árbitros */
.min-w-0 { min-width: 0; }

.timeline { position: relative; }
.timeline-item { display: flex; gap: 10px; position: relative; padding-bottom: 16px; }
.timeline-item::before { content: ''; position: absolute; left: 28px; top: 34px; bottom: 0; width: 2px; background: #e5e7eb; }
.timeline-item:last-child::before { display: none; }
.timeline-hora { width: 56px; flex-shrink: 0; position: relative; z-index: 1; }
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
.timeline-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important; }

.anteriores .hora-burbuja { background: #6b7280; box-shadow: 0 2px 6px rgba(107, 114, 128, 0.3); }
.anteriores .timeline-card { border-left-color: #9ca3af; background: #fff; }

.acordeon-mes { background: #fff; border: none; cursor: pointer; transition: background-color 0.15s ease; }
.acordeon-mes:hover { background: #f8fafc; }

.comentarios { white-space: pre-wrap; }

@media (min-width: 576px) {
  .timeline-hora { width: 70px; }
  .timeline-item { gap: 14px; }
  .timeline-item::before { left: 34px; }
  .timeline-card { padding: 10px 14px; }
  .hora-burbuja { font-size: 0.8rem; }
}
</style>
