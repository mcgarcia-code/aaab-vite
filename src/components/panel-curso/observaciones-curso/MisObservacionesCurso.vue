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
              <div class="fw-bold text-dark">{{ o.encuentro }}</div>
              <div class="small text-muted">
                {{ fechaLargaClase(o.fecha_partido) }}<template v-if="o.categoria"> · {{ o.categoria }}</template>
              </div>
              <div v-if="o.observador" class="small text-muted">Observador/a: {{ o.observador }}</div>
            </div>
            <div class="d-flex align-items-center gap-2 flex-shrink-0">
              <i class="bi" :class="abierta === o.id ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div v-show="abierta === o.id" class="obs-detalle">
            <template v-for="c in CAMPOS_OBSERVACION_CURSO" :key="c.clave">
              <div v-if="o[c.columna]" class="mb-3">
                <div class="detalle-titulo" :class="c.clave === 'aspectosAMejorar' ? 'text-danger' : 'text-dark'"><i :class="['bi', c.icono, 'me-1']"></i> {{ c.etiqueta }}</div>
                <div class="detalle-texto">{{ o[c.columna] }}</div>
              </div>
            </template>
            <div v-if="!CAMPOS_OBSERVACION_CURSO.some(c => o[c.columna])" class="small text-muted fst-italic">Sin comentarios.</div>
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
import { CAMPOS_OBSERVACION_CURSO } from '@/composables/useObservacionesCurso'

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
.obs-detalle { border-top: 1px solid #f1f5f9; padding: 14px; }
.detalle-titulo { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
.detalle-texto { white-space: pre-wrap; font-size: 0.9rem; color: #1e293b; }
.min-w-0 { min-width: 0; }
</style>
