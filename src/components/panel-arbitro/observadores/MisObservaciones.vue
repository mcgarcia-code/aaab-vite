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

          <RouterLink to="/panel-arbitro/observaciones/carga" class="text-decoration-none">
            <button class="btn btn-primary shadow-sm py-2 d-flex align-items-center gap-2" title="Nueva Evaluación">
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
                  <th class="py-3 text-center text-uppercase text-muted pe-3" style="width: 120px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="obs in observacionesPaginadas" :key="obs.id">
                  <td class="fw-bold text-muted ps-3">{{ obs.fecha_partido_fmt }}</td>
                  <td class="fw-bold text-uppercase text-dark">
                    <div>{{ obs.arb1 }}</div>
                    <div v-if="obs.arb2_apellido">{{ obs.arb2 }}</div>
                  </td>
                  <td class="text-dark">
                    <div class="fw-bold">{{ obs.categoria || obs.categoria_edad || '-' }}</div>
                    <div class="text-muted">{{ obs.equipo_local }} vs {{ obs.equipo_visitante }}</div>
                  </td>
                  <td class="text-center fw-bold text-danger">{{ obs.puntaje_final ?? '-' }}</td>
                  <td class="text-center">
                    <span class="badge rounded-pill px-3 py-2" :class="badgeEstado(obs.estado)">
                      {{ etiquetaEstado(obs.estado) }}
                    </span>
                    <div v-if="obs.estado === 'anulada' && obs.comentario_estado" class="text-danger small mt-1" style="font-size: 0.7rem;">
                      <i class="bi bi-info-circle"></i> {{ obs.comentario_estado }}
                    </div>
                  </td>
                  <td class="text-center pe-3">
                    <button class="btn btn-sm btn-light border shadow-sm rounded-pill px-3 d-flex align-items-center gap-1 mx-auto" @click="descargarExcel(obs)" :disabled="descargandoId === obs.id">
                      <span v-if="descargandoId === obs.id" class="spinner-border spinner-border-sm"></span>
                      <span v-else class="material-icons" style="font-size: 16px;">download</span>
                      Excel
                    </button>
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
                    <div v-if="obs.arb2_apellido">{{ obs.arb2 }}</div>
                  </div>
                  <span class="badge rounded-pill px-2 py-1" :class="badgeEstado(obs.estado)">
                    {{ etiquetaEstado(obs.estado) }}
                  </span>
                </div>
                <div class="text-muted fw-bold mb-2" style="font-size: 0.8rem;">
                  {{ obs.fecha_partido_fmt }} <span class="mx-1">•</span> {{ obs.categoria || obs.categoria_edad || '-' }}
                </div>
                <div class="text-dark small mb-2">{{ obs.equipo_local }} vs {{ obs.equipo_visitante }}</div>
                <div v-if="obs.estado === 'anulada' && obs.comentario_estado" class="alert alert-danger py-1 px-2 small mb-2 mt-1">
                  <i class="bi bi-info-circle me-1"></i>{{ obs.comentario_estado }}
                </div>
                <div class="d-flex justify-content-between align-items-center border-top pt-2">
                  <span class="fw-bold text-danger small">Puntaje: {{ obs.puntaje_final ?? '-' }}</span>
                  <button class="btn btn-sm btn-dark rounded-pill px-3 fw-bold d-flex align-items-center gap-1" @click="descargarExcel(obs)" :disabled="descargandoId === obs.id">
                    <span v-if="descargandoId === obs.id" class="spinner-border spinner-border-sm"></span>
                    <span v-else class="material-icons" style="font-size: 16px;">download</span>
                    Excel
                  </button>
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'

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

const etiquetaEstado = (estado) => {
  const e = (estado || 'pendiente').toLowerCase()
  if (e === 'aprobada') return 'Aprobada'
  if (e === 'anulada') return 'Anulada'
  return 'Pendiente'
}

const badgeEstado = (estado) => {
  const e = (estado || 'pendiente').toLowerCase()
  if (e === 'aprobada') return 'bg-success-subtle text-success border border-success-subtle'
  if (e === 'anulada') return 'bg-danger-subtle text-danger border border-danger-subtle'
  return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
}

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

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' })
}

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
</style>
