<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-graph-up-arrow me-1"></i> Mi Rendimiento
          </h4>
          <span class="text-muted small d-block mt-1">Asistencia a clases<template v-if="datos.modalidad === 'anual'">, encuentros de mini</template> y notas de exámenes · Curso {{ datos.anio }}</span>
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

        <div class="accordion" id="acordeonRendimiento">
          <!-- ASISTENCIA -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button type="button" class="accordion-button fw-bold" :class="{ collapsed: !abiertas.clases }" :aria-expanded="abiertas.clases" aria-controls="seccion-clases" @click="abiertas.clases = !abiertas.clases">
                <i class="bi bi-calendar-check me-2"></i>
                <span class="me-2">Asistencia a clases</span>
                <span class="badge bg-success me-1">{{ resumen.presentes }} P</span>
                <span class="badge bg-secondary">{{ resumen.ausentes }} A</span>
              </button>
            </h2>
            <div v-show="abiertas.clases" id="seccion-clases" class="accordion-collapse">
              <div class="accordion-body p-2 p-md-3">
                <div v-if="!datos.clases.length" class="text-muted small fst-italic">Todavía no hubo clases.</div>
                <div v-else class="d-flex flex-column gap-2">
                  <div v-for="c in datos.clases" :key="c.id" class="fila-item d-flex justify-content-between align-items-center gap-2">
                    <div class="min-w-0">
                      <div class="fw-bold text-dark small text-break">{{ c.titulo }}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">{{ fechaLargaClase(c.fecha) }}</div>
                    </div>
                    <span class="badge flex-shrink-0" :class="claseAsistencia(c.asistencia)">{{ textoAsistencia(c.asistencia) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ENCUENTROS DE MINI (solo curso anual) -->
          <div v-if="datos.modalidad === 'anual'" class="accordion-item">
            <h2 class="accordion-header">
              <button type="button" class="accordion-button fw-bold" :class="{ collapsed: !abiertas.mini }" :aria-expanded="abiertas.mini" aria-controls="seccion-mini" @click="abiertas.mini = !abiertas.mini">
                <i class="bi bi-people me-2"></i>
                <span class="me-2">Encuentros de mini</span>
                <span class="badge bg-success me-1">{{ resumenMini.presentes }} P</span>
                <span class="badge bg-secondary">{{ resumenMini.ausentes }} A</span>
              </button>
            </h2>
            <div v-show="abiertas.mini" id="seccion-mini" class="accordion-collapse">
              <div class="accordion-body p-2 p-md-3">
                <div v-if="!datos.mini?.length" class="text-muted small fst-italic">Todavía no fuiste convocado/a a encuentros de mini.</div>
                <div v-else class="d-flex flex-column gap-2">
                  <div v-for="m in datos.mini" :key="'mini-' + m.id" class="fila-item d-flex justify-content-between align-items-center gap-2">
                    <div class="min-w-0">
                      <div class="fw-bold text-dark small text-break">{{ m.titulo }}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">
                        {{ fechaLargaClase(m.fecha) }}<template v-if="m.hora"> · {{ m.hora }} hs</template><template v-if="m.lugar"> · {{ m.lugar }}</template>
                      </div>
                    </div>
                    <span class="badge flex-shrink-0" :class="claseAsistencia(m.asistencia)">{{ textoAsistencia(m.asistencia) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- EXÁMENES -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button type="button" class="accordion-button fw-bold" :class="{ collapsed: !abiertas.examenes }" :aria-expanded="abiertas.examenes" aria-controls="seccion-examenes" @click="abiertas.examenes = !abiertas.examenes">
                <i class="bi bi-journal-text me-2"></i>
                <span class="me-2">Exámenes</span>
                <span class="badge bg-light text-dark border">{{ datos.examenes.length }}</span>
              </button>
            </h2>
            <div v-show="abiertas.examenes" id="seccion-examenes" class="accordion-collapse">
              <div class="accordion-body p-2 p-md-3">
                <div v-if="!datos.examenes.length" class="text-muted small fst-italic">Todavía no tenés notas cargadas.</div>
                <div v-else class="d-flex flex-column gap-2">
                  <div v-for="e in datos.examenes" :key="e.id" class="fila-item d-flex justify-content-between align-items-center gap-2">
                    <div class="min-w-0">
                      <div class="fw-bold text-dark small text-break">{{ e.titulo }}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">
                        {{ fechaLargaClase(e.fecha) }}<template v-if="e.clase"> · {{ e.clase }}</template>
                      </div>
                    </div>
                    <span class="nota flex-shrink-0 text-end" :class="claseNota(e)">
                      {{ textoNotaExamen(e) }}
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
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'
import { formatoNota, claseNota, textoNotaExamen } from '@/composables/useExamenesCurso'

useHead({ title: 'Mi Rendimiento | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const datos = ref({ anio: new Date().getFullYear(), modalidad: '', clases: [], mini: [], examenes: [] })
const cargando = ref(true)

// Secciones del acordeón: arrancan contraídas y se despliegan al tocarlas
const abiertas = reactive({ clases: false, mini: false, examenes: false })

const resumenMini = computed(() => ({
  presentes: (datos.value.mini || []).filter(m => m.asistencia === 'presente').length,
  ausentes: (datos.value.mini || []).filter(m => m.asistencia === 'ausente').length,
}))

const resumen = computed(() => {
  const presentes = datos.value.clases.filter(c => c.asistencia === 'presente').length
  const ausentes = datos.value.clases.filter(c => c.asistencia === 'ausente').length
  const registradas = presentes + ausentes
  const conNota = datos.value.examenes.filter(e => e.nota !== null && (e.tipo || 'teorico') === 'teorico')
  const promedio = conNota.length
    ? `${formatoNota(Math.round(conNota.reduce((s, e) => s + (e.nota / (e.notaMaxima || 100)) * 100, 0) / conNota.length))}%`
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
.accordion-item { border-radius: 10px !important; overflow: hidden; margin-bottom: 8px; border: 1px solid #e2e8f0; }
.accordion-button { font-size: 0.9rem; color: #0f172a; background: #fff; box-shadow: none; flex-wrap: wrap; row-gap: 4px; }
.accordion-button:not(.collapsed) { color: #dc2626; background: #fef2f2; }
.accordion-button:focus { box-shadow: 0 0 0 0.2rem rgba(220, 38, 38, 0.2); }
.fila-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
}
.min-w-0 { min-width: 0; }
.nota { font-weight: 800; font-size: 0.9rem; }
</style>
