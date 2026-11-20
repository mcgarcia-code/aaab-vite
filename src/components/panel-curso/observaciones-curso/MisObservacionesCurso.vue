<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 mb-4 w-100 mx-auto radio-12 overflow-hidden">

      <!-- ENCABEZADO -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom border-2 border-danger gap-3">
        <p class="seccion-descripcion">De encuentros de mini y amistosos</p>

        <div class="d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
          <div class="d-flex align-items-center gap-1">
            <label for="obs-curso-anio" class="text-muted small text-nowrap mb-0">Año:</label>
            <select id="obs-curso-anio" v-model="filtroAnio" class="form-select form-select-sm shadow-none text-uppercase text-dark" style="min-width: 110px;">
              <option value="">TODOS</option>
              <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
            </select>
          </div>
          <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="obtenerObservaciones" />
        </div>
      </div>

      <div class="card-body bg-white p-0">

        <!-- SPINNER -->
        <EstadoCargando v-if="cargando" texto="Cargando observaciones" />

        <template v-else>
          <!-- AVISO -->
          <div class="px-3 px-md-4 pt-3">
            <p class="text-muted small mb-0">
              <i class="bi bi-info-circle me-1"></i>
              Solo se muestran las observaciones aprobadas por la coordinación del curso. Podés ver los comentarios del observador.
            </p>
          </div>

          <!-- SIN DATOS -->
          <EstadoVacio v-if="observacionesFiltradas.length === 0" icono="bi-clipboard-check" titulo="No tenés observaciones aprobadas en el período seleccionado" />

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
                      <span class="badge flex-shrink-0" :class="esAmistoso(obs) ? 'bg-secondary' : 'bg-dark'">
                        <i :class="['bi', esAmistoso(obs) ? 'bi-flag' : 'bi-people', 'me-1']"></i>{{ esAmistoso(obs) ? 'Amistoso' : 'Mini' }}
                      </span>
                    </div>

                    <div class="text-dark small mb-2 flex-grow-1">
                      <div class="fw-bold text-break">{{ obs.encuentro }}</div>
                      <div v-if="esAmistoso(obs)" class="text-muted mt-1"><i class="bi bi-tag me-1"></i>Categoría: {{ obs.categoria || '-' }}</div>
                      <div class="text-muted mt-1"><i class="bi bi-person-badge me-1"></i>{{ etiquetaObservador(obs) }}: {{ obs.observador || '-' }}</div>
                    </div>

                    <button class="btn btn-sm btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-1" @click="detalle = obs">
                      <i class="bi bi-eye texto-16px"></i>
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
              <div class="small text-muted texto-pre-line">{{ detalle[c.columna] }}</div>
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
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import { ref, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import { CAMPOS_OBSERVACION_CURSO } from '@/composables/useObservacionesCurso'
import { anioActual, conAnioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'

useHead({ title: 'Mis Observaciones | Curso AAAB' })

const toast = inject('toast')

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
