<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 mb-4 w-100 mx-auto" style="border-radius: 12px; overflow: hidden;">

      <!-- ENCABEZADO -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom border-2 border-danger gap-3">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-clipboard-check me-1"></i> Mis Observaciones
          </h4>
          <p class="text-muted small m-0 mt-1">Observaciones de tus partidos aprobadas por la comisión</p>
        </div>

        <div class="d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
          <div class="d-flex align-items-center gap-1">
            <label class="text-muted small text-nowrap mb-0">Año:</label>
            <select v-model="filtroAnio" class="form-select form-select-sm shadow-none" style="min-width: 110px;">
              <option value="">Todos</option>
              <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
            </select>
          </div>
          <button @click="obtenerObservaciones" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Actualizar">
            <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
            <span v-else class="material-icons" style="font-size: 20px;">refresh</span>
            <span class="d-none d-md-inline fw-bold text-dark" style="font-size: 0.8rem;">Actualizar</span>
          </button>
        </div>
      </div>

      <div class="card-body bg-white p-0">

        <!-- SPINNER -->
        <div v-if="cargando" class="text-center p-5 bg-white">
          <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
          <p class="text-muted mt-3 fw-bold">Cargando observaciones...</p>
        </div>

        <template v-else>
          <!-- AVISO -->
          <div class="px-3 px-md-4 pt-3">
            <p class="text-muted small mb-0">
              <i class="bi bi-info-circle me-1"></i>
              Solo se muestran observaciones aprobadas. Podés ver el detalle de cada ítem evaluado.
            </p>
          </div>

          <!-- SIN DATOS -->
          <div v-if="observacionesFiltradas.length === 0" class="text-center p-5 bg-white">
            <span class="material-icons d-block fs-1 mb-2 text-muted opacity-50">assignment_turned_in</span>
            <p class="m-0 fw-bold text-muted">No tenés observaciones aprobadas en el período seleccionado.</p>
          </div>

          <!-- TARJETAS -->
          <div v-else class="p-3 p-md-4">
            <div class="row g-3">
              <div v-for="obs in observacionesFiltradas" :key="obs.id" class="col-12 col-md-6 col-xl-4">
                <div class="card h-100 shadow-sm border-light-subtle">
                  <div class="card-body p-3 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2 border-bottom pb-2">
                      <div>
                        <div class="text-dark fw-bold small mb-1">
                          <i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatearFecha(obs.fecha_partido) }}
                        </div>
                        <div class="text-muted small text-truncate" style="max-width: 220px;">{{ obs.competencia || 'Observación' }}</div>
                      </div>
                      <span class="badge bg-secondary">{{ obs.categoria_edad || '-' }}</span>
                    </div>

                    <div class="text-dark small mb-2 flex-grow-1">
                      <div class="fw-bold">{{ obs.equipo_local }} vs {{ obs.equipo_visitante }}</div>
                      <div class="text-muted mt-1"><i class="bi bi-person-badge me-1"></i>Observador: {{ obs.observador }}</div>
                    </div>

                    <button class="btn btn-sm btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-1"
                            @click="verDetalle(obs)" :disabled="cargandoDetalleId === obs.id">
                      <span v-if="cargandoDetalleId === obs.id" class="spinner-border spinner-border-sm"></span>
                      <span v-else class="material-icons" style="font-size: 16px;">visibility</span>
                      Ver detalle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ==========================================
         MODAL: DETALLE (sin nota / puntaje)
         ========================================== -->
    <ModalBase :show="mostrarDetalle" @close="cerrarDetalle" titulo="Detalle de la Observación" icono="visibility" colorIcono="bg-danger text-white" maxWidth="760px">
      <div v-if="detalle" class="text-start">
        <div class="bg-light p-3 rounded border mb-3 border-secondary-subtle">
          <p class="m-0 small text-dark"><strong class="text-muted">Fecha:</strong> {{ formatearFecha(detalle.fecha_partido) }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Competencia:</strong> {{ detalle.competencia || '-' }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Partido:</strong> {{ detalle.equipo_local }} vs {{ detalle.equipo_visitante }} <span v-if="detalle.categoria_edad" class="badge bg-secondary ms-1">{{ detalle.categoria_edad }}</span></p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Observador:</strong> {{ detalle.observador }}</p>
        </div>

        <!-- Ítems evaluados: SIN puntaje/nota -->
        <div class="border rounded overflow-hidden">
          <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.78rem;">
            <thead class="table-light">
              <tr>
                <th class="py-2 ps-3 text-uppercase text-muted">Categoría / Ítem</th>
                <th class="py-2 text-center text-uppercase text-muted" style="width: 170px;">Valoración</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="it in (detalle.items || [])" :key="'it-' + it.id">
                <tr v-if="it.tipo === 'categoria'" class="table-light">
                  <td class="fw-bold text-dark ps-3" colspan="2">{{ it.categoria }}</td>
                </tr>
                <tr v-else>
                  <td class="text-dark ps-4">{{ it.item }}</td>
                  <td class="text-center text-muted">{{ it.valoracion || '-' }}</td>
                </tr>
              </template>
              <tr v-if="!detalle.items || detalle.items.length === 0">
                <td colspan="2" class="text-center py-3 text-muted">Sin ítems cargados.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Comentarios por categoría (si los hay) -->
        <div v-if="comentariosCategoria.length" class="mt-3">
          <h6 class="fw-bold text-dark small text-uppercase mb-2">Comentarios</h6>
          <div v-for="(c, idx) in comentariosCategoria" :key="'com-' + idx" class="mb-2">
            <div class="fw-bold small text-dark">{{ c.categoria }}</div>
            <div class="small text-muted">{{ c.comentario }}</div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-4">
        <span class="spinner-border text-danger"></span>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

const toast = inject('toast', (msg) => alert(msg.mensaje || msg))

useHead({
  title: 'Mis Observaciones | AAAB',
  meta: [{ name: 'description', content: 'Observaciones aprobadas de tus partidos.' }]
})

const observaciones = ref([])
const cargando = ref(false)
const filtroAnio = ref('')

const formatearFecha = (fechaIso) => {
  if (!fechaIso) return 'S/F'
  const [anio, mes, dia] = String(fechaIso).split(' ')[0].split('-')
  if (!anio || !mes || !dia) return fechaIso
  return `${dia}/${mes}/${anio}`
}

const aniosDisponibles = computed(() => {
  const set = new Set()
  observaciones.value.forEach(o => {
    const anio = (o.fecha_partido || '').substring(0, 4)
    if (anio) set.add(anio)
  })
  return [...set].sort((a, b) => b.localeCompare(a))
})

const observacionesFiltradas = computed(() =>
  filtroAnio.value
    ? observaciones.value.filter(o => (o.fecha_partido || '').substring(0, 4) === filtroAnio.value)
    : observaciones.value
)

// -------------------- DETALLE --------------------
const mostrarDetalle = ref(false)
const detalle = ref(null)
const cargandoDetalleId = ref(null)

const comentariosCategoria = computed(() => {
  if (!detalle.value || !Array.isArray(detalle.value.items)) return []
  return detalle.value.items
    .filter(it => it.tipo === 'categoria' && it.comentario)
    .map(it => ({ categoria: it.categoria, comentario: it.comentario }))
})

const verDetalle = async (obs) => {
  cargandoDetalleId.value = obs.id
  detalle.value = null
  try {
    const res = await api.get({ entity: 'observaciones', action: 'obtenerEvaluacion', payload: { id: obs.id } })
    if ((res.ok || res.success) && res.payload) {
      // Resguardo: el árbitro nunca ve el puntaje, aunque el backend ya lo recorta.
      const limpio = { ...obs, ...res.payload }
      if (Array.isArray(limpio.items)) {
        limpio.items = limpio.items.map(it => {
          const copia = { ...it }
          delete copia.puntaje
          return copia
        })
      }
      delete limpio.puntaje_final
      delete limpio.promedio_categorias
      detalle.value = limpio
      mostrarDetalle.value = true
    } else {
      toast({ titulo: 'Error', mensaje: 'No se pudo cargar el detalle.', tipo: 'danger' })
    }
  } catch (e) {
    console.error('verDetalle:', e)
    toast({ titulo: 'Error', mensaje: 'Fallo al cargar el detalle.', tipo: 'danger' })
  } finally {
    cargandoDetalleId.value = null
  }
}

const cerrarDetalle = () => {
  mostrarDetalle.value = false
  detalle.value = null
}

// -------------------- CARGA --------------------
const obtenerObservaciones = async () => {
  cargando.value = true
  try {
    const idArbitro = auth.user?.id ?? auth.usuario?.id ?? null
    const res = await api.get({
      entity: 'observaciones',
      action: 'obtenerRendimientoArbitro',
      payload: idArbitro ? { idArbitro } : {}
    })
    observaciones.value = ((res.ok || res.success) && Array.isArray(res.payload)) ? res.payload : []
  } catch (error) {
    console.error('Error al obtener observaciones:', error)
    observaciones.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(obtenerObservaciones)
</script>

<style scoped>
.animate__animated { animation-duration: 0.5s; }
</style>
