<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-mortarboard-fill me-1"></i> Observaciones del Curso
          </h4>
          <span class="text-muted small d-block mt-1">Observaciones que hiciste a aspirantes del curso de árbitros en {{ anio }}</span>
        </div>
        <div class="d-flex flex-wrap gap-2 align-items-center">
          <select v-model="anio" class="form-select form-select-sm shadow-sm fw-semibold text-uppercase text-dark" style="width: 100px;" aria-label="Año">
            <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
          </select>
          <button @click="abrirNueva" class="btn btn-danger btn-sm fw-bold shadow-sm">
            <i class="bi bi-plus-lg me-1"></i> Nueva observación
          </button>
        </div>
      </div>

      <div v-if="cargando" class="card-body text-center py-5"><span class="spinner-border text-danger"></span></div>
      <div v-else-if="!observaciones.length" class="card-body text-center py-5 text-muted">
        <i class="bi bi-clipboard-x fs-1 d-block mb-2 opacity-50"></i>
        <span class="fw-bold">Todavía no cargaste observaciones este año.</span>
      </div>
      <div v-else class="card-body p-3 p-md-4 d-flex flex-column gap-3">
        <div v-for="o in observaciones" :key="o.id" class="obs-card p-3">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
            <div class="min-w-0">
              <div class="fw-bold text-dark text-uppercase">{{ o.apellido }}, {{ o.nombre }}</div>
              <div class="small text-muted">
                {{ fechaDMA(o.fecha_partido) }} · {{ o.encuentro }}<template v-if="o.categoria"> · {{ o.categoria }}</template>
              </div>
              <div class="d-flex flex-wrap gap-1 mt-1">
                <span class="badge" :class="MODALIDADES_CURSO[o.modalidad_curso]?.clase">{{ MODALIDADES_CURSO[o.modalidad_curso]?.etiqueta }}</span>
                <span class="badge" :class="estadoDe(o).clase"><i :class="['bi', estadoDe(o).icono, 'me-1']"></i>{{ estadoDe(o).etiqueta }}</span>
              </div>
            </div>
            <div v-if="esPendiente(o)" class="d-flex gap-1">
              <button @click="abrirEditar(o)" class="btn btn-sm btn-outline-primary fw-bold" aria-label="Editar"><i class="bi bi-pencil"></i></button>
              <button @click="confirmarEliminar(o)" class="btn btn-sm btn-outline-danger fw-bold" aria-label="Borrar"><i class="bi bi-trash3"></i></button>
            </div>
            <span v-else class="small text-muted fst-italic"><i class="bi bi-lock me-1"></i>Ya revisada</span>
          </div>
          <div v-if="o.estado_revision === 'rechazada' && o.motivo_revision" class="alert alert-danger small py-2 mt-2 mb-0">
            <strong>Motivo del rechazo:</strong> {{ o.motivo_revision }}
          </div>
          <div class="row g-2 mt-2">
            <template v-for="c in CAMPOS_OBSERVACION_CURSO" :key="c.clave">
              <div v-if="o[c.columna]" class="col-12 col-md-6">
                <div class="detalle-titulo"><i :class="['bi', c.icono, 'me-1']"></i>{{ c.etiqueta }}</div>
                <div class="detalle-texto">{{ o[c.columna] }}</div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <ModalObservacionCurso v-model:show="mostrarModal" :observacion="seleccionada" es-observador @guardado="alGuardar" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalObservacionCurso from '@/components/ModalObservacionCurso.vue'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { CAMPOS_OBSERVACION_CURSO, ESTADOS_REVISION_OBSERVACION } from '@/composables/useObservacionesCurso'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'

useHead({ title: 'Observaciones del Curso | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual().map(Number))
const observaciones = ref([])
const cargando = ref(false)
const mostrarModal = ref(false)

// Solo se pueden editar o borrar mientras están pendientes de revisión
const estadoDe = (o) => ESTADOS_REVISION_OBSERVACION[o.estado_revision] || ESTADOS_REVISION_OBSERVACION.pendiente
const esPendiente = (o) => (o.estado_revision || 'pendiente') === 'pendiente'
const seleccionada = ref(null)

const cargar = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'observaciones_curso_arbitro', action: 'obtenerMisObservacionesRealizadasCurso', payload: { anio: anio.value } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar tus observaciones')
    observaciones.value = res.payload || []
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

watch(anio, cargar)

const abrirNueva = () => {
  seleccionada.value = null
  mostrarModal.value = true
}

const abrirEditar = (o) => {
  seleccionada.value = o
  mostrarModal.value = true
}

const alGuardar = async (f) => {
  const anioObs = Number(String(f.fechaPartido).substring(0, 4))
  if (anioObs !== anio.value) anio.value = anioObs
  else await cargar()
}

const confirmarEliminar = (o) => {
  notificar({
    titulo: '¿Borrar observación?',
    mensaje: `${o.apellido}, ${o.nombre} · ${o.encuentro} (${fechaDMA(o.fecha_partido)}).`,
    tipo: 'danger',
    alConfirmar: async () => {
      try {
        const res = await api.post({ entity: 'observaciones_curso_arbitro', action: 'eliminarObservacionCurso', payload: { id: o.id } })
        if (!res?.ok) throw new Error(res?.message || 'No se pudo borrar la observación')
        toast({ titulo: 'Borrada', mensaje: 'La observación se borró.', tipo: 'success' })
        await cargar()
      } catch (e) {
        toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
      }
    },
  })
}

onMounted(cargar)
</script>

<style scoped>
.obs-card { border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; }
.detalle-titulo { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: #dc3545; margin-bottom: 2px; }
.detalle-texto { white-space: pre-wrap; font-size: 0.88rem; color: #1e293b; }
.min-w-0 { min-width: 0; }
</style>
