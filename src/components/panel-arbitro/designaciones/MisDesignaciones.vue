<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-calendar-week me-2"></i> Mis Designaciones
          </h4>
          <p class="text-muted small m-0 mt-1">Estos son los partidos que te fueron designados</p>
        </div>

        <div v-if="infoTorneo" class="d-flex flex-wrap gap-2 justify-content-md-end">
          <span class="badge bg-dark px-3 py-2 shadow-sm d-inline-flex align-items-center gap-2">
            <i class="bi bi-trophy-fill"></i> {{ infoTorneo.torneo }}
          </span>
          <span class="badge bg-danger px-3 py-2 shadow-sm d-inline-flex align-items-center gap-2">
            <i class="bi bi-calendar-event-fill"></i> {{ infoTorneo.fecha_torneo }}
          </span>
        </div>
      </div>

      <div class="card-body p-3 p-md-4">

        <div v-if="cargando" class="text-center py-5">
          <span class="spinner-border text-danger"></span>
          <p class="text-muted mt-3 m-0 fw-bold small">Cargando tus designaciones...</p>
        </div>

        <div v-else-if="partidos.length === 0" class="text-center py-5 text-muted bg-light rounded-3">
          <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">event_busy</span>
          <p class="m-0 fw-bold">Todavía no tenés designaciones publicadas.</p>
          <p class="small m-0 mt-1">Cuando la asociación publique las designaciones del fin de semana, vas a ver tus partidos acá.</p>
        </div>

        <div v-else>
          <div v-for="dia in partidosPorDia" :key="dia.fecha" class="mb-4">

            <div class="d-flex align-items-center gap-2 mb-3">
              <span class="badge bg-dark fs-6 rounded-pill px-3 py-2 shadow-sm">
                <i class="bi bi-calendar-day me-1"></i> {{ etiquetaDia(dia.fecha) }}
              </span>
              <span class="text-muted small fw-bold">{{ dia.partidos.length }} {{ dia.partidos.length === 1 ? 'partido' : 'partidos' }}</span>
            </div>

            <div class="row g-3">
              <div v-for="p in dia.partidos" :key="p.id" class="col-12 col-md-6 col-xl-4">
                <div class="card h-100 shadow-sm border-0 border-start border-danger border-4 rounded-3 partido-card">
                  <div class="card-body p-3">

                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-2 fw-bold">
                        <i class="bi bi-clock me-1"></i> {{ p.horario || '-' }}
                      </span>
                      <span class="small text-muted fw-bold text-uppercase">{{ p.categoria_division }}</span>
                    </div>

                    <div class="text-dark fw-bold fs-6 mb-1 text-uppercase">
                      {{ p.local }} <span class="text-muted fw-normal">vs</span> {{ p.visitante }}
                    </div>

                    <div class="small text-muted mb-3 d-flex align-items-center gap-1">
                      <span class="material-icons" style="font-size: 15px;">stadium</span>
                      <span class="fw-bold text-dark">{{ p.cancha }}</span>
                    </div>

                    <div class="bg-light rounded p-2 small d-flex align-items-center gap-2">
                      <span class="material-icons text-danger" style="font-size: 16px;">groups</span>
                      <span class="text-dark">
                        <strong>Pareja:</strong> {{ obtenerPareja(p) }}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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

const arbitro = ref(auth.getUser() || {})
const partidos = ref([])
const cargando = ref(false)

const cargarMisDesignaciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerMisDesignaciones'
    })
    if ((res.ok || res.success) && res.payload) partidos.value = res.payload
  } catch (err) {
    console.error('Error al cargar mis designaciones:', err)
  } finally {
    cargando.value = false
  }
}

const infoTorneo = computed(() => {
  if (partidos.value.length === 0) return null
  const primero = partidos.value[0]
  if (!primero.torneo && !primero.fecha_torneo) return null
  return { torneo: primero.torneo, fecha_torneo: primero.fecha_torneo }
})

const parsearFecha = (fecha) => {
  if (!fecha) return 0
  const texto = String(fecha).trim()

  let m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    const anio = m[3].length === 2 ? '20' + m[3] : m[3]
    return new Date(Number(anio), Number(m[2]) - 1, Number(m[1])).getTime()
  }

  m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()

  return 0
}

const etiquetaDia = (fecha) => {
  const timestamp = parsearFecha(fecha)
  if (!timestamp) return fecha
  const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
  return `${dias[new Date(timestamp).getDay()]} ${fecha}`
}

const partidosPorDia = computed(() => {
  const mapa = {}
  partidos.value.forEach(p => {
    const f = String(p.fecha || '').trim() || 'Sin fecha'
    if (!mapa[f]) mapa[f] = []
    mapa[f].push(p)
  })

  return Object.keys(mapa)
    .sort((a, b) => parsearFecha(a) - parsearFecha(b))
    .map(fecha => ({
      fecha,
      partidos: mapa[fecha].sort((a, b) => String(a.horario || '').localeCompare(String(b.horario || '')))
    }))
})

const obtenerPareja = (p) => {
  const miId = String(arbitro.value.id)
  if (String(p.id_arb1) === miId) return p.arbitro_2 || 'Sin pareja asignada'
  if (String(p.id_arb2) === miId) return p.arbitro_1 || 'Sin pareja asignada'
  return p.arbitro_2 || p.arbitro_1 || '-'
}

onMounted(cargarMisDesignaciones)
</script>

<style scoped>
.partido-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.partido-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
}

.animate__animated { animation-duration: 0.5s; }
</style>
