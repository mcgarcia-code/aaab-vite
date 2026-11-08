<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-eye me-1"></i> Mis Observaciones
          </h4>
          <span class="text-muted small d-block mt-1">Observaciones de los partidos que dirigiste durante el curso</span>
        </div>
      </div>

      <div v-if="cargando" class="card-body text-center py-5">
        <span class="spinner-border text-danger"></span>
      </div>
      <div v-else-if="!observaciones.length" class="card-body text-center py-5 text-muted">
        <span class="material-icons d-block fs-1 mb-2 opacity-50">visibility_off</span>
        <span class="fw-bold">Todavía no tenés observaciones cargadas.</span>
      </div>
      <div v-else class="card-body p-3 p-md-4 d-flex flex-column gap-3">
        <div v-for="o in observaciones" :key="o.id" class="obs-card">
          <button type="button" class="obs-encabezado" @click="abierta = abierta === o.id ? null : o.id" :aria-expanded="abierta === o.id">
            <div class="min-w-0 text-start">
              <div class="fw-bold text-dark">{{ o.local }} vs {{ o.visitante }}</div>
              <div class="small text-muted">
                {{ fechaLargaClase(o.fecha_partido) }}<template v-if="o.categoria"> · {{ o.categoria }}</template>
              </div>
              <div v-if="o.observador" class="small text-muted">Observador/a: {{ o.observador }}</div>
            </div>
            <div class="d-flex align-items-center gap-2 flex-shrink-0">
              <span v-if="o.calificacion !== null" class="calificacion">{{ formatoNota(o.calificacion) }}</span>
              <i class="bi" :class="abierta === o.id ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div v-show="abierta === o.id" class="obs-detalle">
            <div v-if="o.fortalezas" class="mb-3">
              <div class="detalle-titulo text-success"><i class="bi bi-hand-thumbs-up me-1"></i> Fortalezas</div>
              <div class="detalle-texto">{{ o.fortalezas }}</div>
            </div>
            <div v-if="o.aspectos_a_mejorar" class="mb-3">
              <div class="detalle-titulo text-danger"><i class="bi bi-arrow-up-circle me-1"></i> Aspectos a mejorar</div>
              <div class="detalle-texto">{{ o.aspectos_a_mejorar }}</div>
            </div>
            <div v-if="o.comentarios">
              <div class="detalle-titulo text-dark"><i class="bi bi-chat-left-text me-1"></i> Comentarios</div>
              <div class="detalle-texto">{{ o.comentarios }}</div>
            </div>
            <div v-if="!o.fortalezas && !o.aspectos_a_mejorar && !o.comentarios" class="small text-muted fst-italic">Sin comentarios.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'
import { formatoNota } from '@/composables/useExamenesCurso'

useHead({ title: 'Mis Observaciones | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const observaciones = ref([])
const cargando = ref(true)
const abierta = ref(null)

onMounted(async () => {
  try {
    const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMisObservacionesCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar tus observaciones')
    observaciones.value = res.payload || []
    if (observaciones.value.length) abierta.value = observaciones.value[0].id
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.obs-card { border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; overflow: hidden; }
.obs-encabezado {
  width: 100%;
  background: none;
  border: 0;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.obs-encabezado:hover { background: #f8fafc; }
.calificacion {
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 800;
  border-radius: 8px;
  padding: 4px 10px;
}
.obs-detalle { border-top: 1px solid #f1f5f9; padding: 14px; }
.detalle-titulo { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
.detalle-texto { white-space: pre-wrap; font-size: 0.9rem; color: #1e293b; }
.min-w-0 { min-width: 0; }
</style>
