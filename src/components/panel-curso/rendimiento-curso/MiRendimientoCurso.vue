<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-graph-up-arrow me-1"></i> Mi Rendimiento
          </h4>
          <span class="text-muted small d-block mt-1">Asistencia a clases y notas de exámenes · Curso {{ datos.anio }}</span>
        </div>
      </div>

      <div v-if="cargando" class="card-body text-center py-5">
        <span class="spinner-border text-danger"></span>
      </div>

      <div v-else class="card-body p-3 p-md-4">
        <!-- RESUMEN -->
        <div class="row g-2 g-md-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="resumen-card bg-success text-white">
              <i class="bi bi-person-check-fill"></i>
              <div class="valor">{{ resumen.presentes }}</div>
              <div class="etiqueta">Presentes</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="resumen-card bg-secondary text-white">
              <i class="bi bi-person-dash-fill"></i>
              <div class="valor">{{ resumen.ausentes }}</div>
              <div class="etiqueta">Ausentes</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="resumen-card bg-dark text-white">
              <i class="bi bi-percent"></i>
              <div class="valor">{{ resumen.porcentaje !== null ? `${resumen.porcentaje}%` : '-' }}</div>
              <div class="etiqueta">Asistencia</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="resumen-card bg-danger text-white">
              <i class="bi bi-journal-check"></i>
              <div class="valor">{{ resumen.promedio !== null ? resumen.promedio : '-' }}</div>
              <div class="etiqueta">Promedio exámenes</div>
            </div>
          </div>
        </div>

        <!-- ASISTENCIA -->
        <h6 class="titulo-seccion"><i class="bi bi-calendar-check me-1"></i> Asistencia a clases</h6>
        <div v-if="!datos.clases.length" class="text-muted small fst-italic mb-4">Todavía no hubo clases.</div>
        <div v-else class="d-flex flex-column gap-2 mb-4">
          <div v-for="c in datos.clases" :key="c.id" class="fila-item d-flex justify-content-between align-items-center gap-2">
            <div class="min-w-0">
              <div class="fw-bold text-dark small text-truncate">{{ c.titulo }}</div>
              <div class="text-muted" style="font-size: 0.75rem;">{{ fechaLargaClase(c.fecha) }}</div>
            </div>
            <span class="badge flex-shrink-0" :class="claseAsistencia(c.asistencia)">{{ textoAsistencia(c.asistencia) }}</span>
          </div>
        </div>

        <!-- EXÁMENES -->
        <h6 class="titulo-seccion"><i class="bi bi-journal-text me-1"></i> Exámenes</h6>
        <div v-if="!datos.examenes.length" class="text-muted small fst-italic">Todavía no tenés notas cargadas.</div>
        <div v-else class="d-flex flex-column gap-2">
          <div v-for="e in datos.examenes" :key="e.id" class="fila-item d-flex justify-content-between align-items-center gap-2">
            <div class="min-w-0">
              <div class="fw-bold text-dark small text-truncate">{{ e.titulo }}</div>
              <div class="text-muted" style="font-size: 0.75rem;">
                {{ fechaLargaClase(e.fecha) }}<template v-if="e.clase"> · {{ e.clase }}</template>
              </div>
            </div>
            <span class="nota flex-shrink-0" :class="claseNota(e)">
              {{ e.nota !== null ? `${formatoNota(e.nota)} / ${formatoNota(e.notaMaxima)}` : 'Pendiente' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'
import { formatoNota, claseNota } from '@/composables/useExamenesCurso'

useHead({ title: 'Mi Rendimiento | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const datos = ref({ anio: new Date().getFullYear(), clases: [], examenes: [] })
const cargando = ref(true)

const resumen = computed(() => {
  const presentes = datos.value.clases.filter(c => c.asistencia === 'presente').length
  const ausentes = datos.value.clases.filter(c => c.asistencia === 'ausente').length
  const registradas = presentes + ausentes
  const conNota = datos.value.examenes.filter(e => e.nota !== null)
  const promedio = conNota.length
    ? formatoNota(conNota.reduce((s, e) => s + (e.nota / (e.notaMaxima || 10)) * 10, 0) / conNota.length)
    : null
  return {
    presentes,
    ausentes,
    porcentaje: registradas ? Math.round((presentes / registradas) * 100) : null,
    promedio,
  }
})

const textoAsistencia = (a) => (a === 'presente' ? 'Presente' : a === 'ausente' ? 'Ausente' : 'Sin registro')
const claseAsistencia = (a) => (a === 'presente' ? 'bg-success' : a === 'ausente' ? 'bg-secondary' : 'bg-light text-muted border')

onMounted(async () => {
  try {
    const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMiRendimientoCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar tu rendimiento')
    datos.value = res.payload
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.resumen-card {
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  height: 100%;
}
.resumen-card i { font-size: 1.2rem; }
.resumen-card .valor { font-size: 1.4rem; font-weight: 800; line-height: 1.1; margin-top: 4px; }
.resumen-card .etiqueta { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; opacity: 0.85; }
.titulo-seccion {
  color: #dc3545;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.fila-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
}
.min-w-0 { min-width: 0; }
.nota { font-weight: 800; font-size: 0.9rem; }
</style>
