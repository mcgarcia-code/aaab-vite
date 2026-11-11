<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 mb-4 w-100 mx-auto" style="border-radius: 12px; overflow: hidden;">

      <!-- ENCABEZADO -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom border-2 border-danger gap-3">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-clipboard-check me-1"></i> Mis Observaciones
          </h4>
          <span class="text-muted small d-block mt-1">Encuentros en los que fuiste observado/a, con la observación aprobada</span>
        </div>

        <div class="d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
          <div class="d-flex align-items-center gap-1">
            <label for="obs-curso-anio" class="text-muted small text-nowrap mb-0">Año:</label>
            <select id="obs-curso-anio" v-model="filtroAnio" class="form-select form-select-sm shadow-none text-uppercase text-dark" style="min-width: 110px;">
              <option value="">TODOS</option>
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
              Solo se muestran las observaciones aprobadas por la coordinación del curso. Podés ver los comentarios del observador.
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
                    <div class="d-flex justify-content-between align-items-start mb-2 border-bottom pb-2 gap-2">
                      <div class="min-w-0">
                        <div class="text-dark fw-bold small mb-1">
                          <i class="bi bi-calendar3 me-1 text-muted"></i>{{ fechaDMA(obs.fecha_partido) }}
                        </div>
                        <div class="text-muted small text-truncate">{{ esAmistoso(obs) ? 'Partido amistoso' : 'Encuentro de mini' }}</div>
                      </div>
                      <span class="badge flex-shrink-0" :class="esAmistoso(obs) ? 'bg-primary' : 'bg-dark'">
                        <i :class="['bi', esAmistoso(obs) ? 'bi-flag' : 'bi-people', 'me-1']"></i>{{ esAmistoso(obs) ? 'Amistoso' : 'Mini' }}
                      </span>
                    </div>

                    <div class="text-dark small mb-2 flex-grow-1">
                      <div class="fw-bold text-break">{{ obs.encuentro }}</div>
                      <div v-if="esAmistoso(obs)" class="text-muted mt-1"><i class="bi bi-tag me-1"></i>Categoría: {{ obs.categoria || '-' }}</div>
                      <div class="text-muted mt-1"><i class="bi bi-person-badge me-1"></i>{{ etiquetaObservador(obs) }}: {{ obs.observador || '-' }}</div>
                    </div>

                    <button class="btn btn-sm btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-1" @click="detalle = obs">
                      <span class="material-icons" style="font-size: 16px;">visibility</span>
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

    <!-- MODAL: DETALLE -->
    <ModalBase :show="!!detalle" @close="detalle = null" titulo="Detalle de la Observación" icono="visibility" colorIcono="bg-secondary text-white" maxWidth="760px">
      <div v-if="detalle" class="text-start">
        <!-- Datos básicos -->
        <div class="bg-light p-3 rounded border mb-3 border-secondary-subtle">
          <p class="m-0 small text-dark"><strong class="text-muted">Tipo:</strong> {{ esAmistoso(detalle) ? 'Partido amistoso' : 'Encuentro de mini' }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Día:</strong> {{ fechaDMA(detalle.fecha_partido) }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">{{ esAmistoso(detalle) ? 'Partido' : 'Encuentro' }}:</strong> {{ detalle.encuentro }}</p>
          <p v-if="esAmistoso(detalle)" class="m-0 small text-dark mt-1"><strong class="text-muted">Categoría:</strong> {{ detalle.categoria || '-' }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">{{ etiquetaObservador(detalle) }}:</strong> {{ detalle.observador || '-' }}</p>
        </div>

        <!-- Comentarios del observador -->
        <div class="border rounded p-3">
          <h6 class="fw-bold text-dark small text-uppercase mb-3 d-flex align-items-center gap-1">
            <i class="bi bi-chat-left-text"></i> Comentarios del observador
          </h6>

          <template v-for="c in CAMPOS_OBSERVACION_CURSO" :key="c.clave">
            <div v-if="detalle[c.columna]" class="mb-3">
              <div class="fw-bold small" :class="c.clave === 'aspectosAMejorar' ? 'text-danger' : 'text-dark'">{{ c.etiqueta }}</div>
              <div class="small text-muted" style="white-space: pre-line;">{{ detalle[c.columna] }}</div>
            </div>
          </template>

          <div v-if="!CAMPOS_OBSERVACION_CURSO.some(c => detalle[c.columna])" class="text-center py-3 text-muted small">
            El observador no dejó comentarios en esta observación.
          </div>
        </div>

        <!-- Acciones (mobile-first) -->
        <div class="d-flex mt-4">
          <button @click="detalle = null" class="btn btn-light border rounded-pill px-4 fw-bold w-100">CERRAR</button>
        </div>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import { CAMPOS_OBSERVACION_CURSO } from '@/composables/useObservacionesCurso'
import { anioActual, conAnioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'

useHead({ title: 'Mis Observaciones | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const observaciones = ref([])
const cargando = ref(false)
const filtroAnio = ref(anioActual())
const detalle = ref(null)

// Tipo de observación: en mini el observador es el profesor a cargo; en amistosos, el árbitro que observó
const esAmistoso = (o) => o.tipo === 'amistoso'
const etiquetaObservador = (o) => (esAmistoso(o) ? 'Observador' : 'Profesor a cargo')

const aniosDisponibles = computed(() => {
  const anios = new Set()
  observaciones.value.forEach(o => {
    const anio = String(o.fecha_partido || '').substring(0, 4)
    if (anio) anios.add(anio)
  })
  return conAnioActual(anios)
})

const observacionesFiltradas = computed(() =>
  observaciones.value.filter(o => !filtroAnio.value || String(o.fecha_partido || '').startsWith(String(filtroAnio.value)))
)

const obtenerObservaciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMisObservacionesCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar tus observaciones')
    observaciones.value = res.payload || []
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

onMounted(obtenerObservaciones)
</script>

<style scoped>
.min-w-0 { min-width: 0; }
</style>
