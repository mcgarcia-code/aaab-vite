<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <ExamenCursoRunner
      v-if="examenEnCurso"
      :id-examen="examenEnCurso.id"
      :titulo="examenEnCurso.titulo"
      @terminar="recargar"
      @salir="examenEnCurso = null"
    />

    <template v-else>
    <div v-if="online.length" class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-laptop me-1"></i> Exámenes online
          </h4>
          <span class="text-muted small d-block mt-1">Exámenes de las clases a las que asististe</span>
        </div>
      </div>
      <div class="card-body p-3 p-md-4 d-flex flex-column gap-2">
        <div v-for="x in online" :key="'on-' + x.id" class="examen-card d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div class="min-w-0">
            <div class="fw-bold text-dark">{{ x.titulo }}</div>
            <div class="small text-muted">{{ fechaLargaClase(x.fecha) }} · {{ x.cantidadPreguntas }} preguntas · {{ x.tiempoLimiteMin }} min</div>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center flex-shrink-0">
            <template v-if="x.estado === 'finalizado'">
              <span class="badge" :class="x.aprobado ? 'bg-success' : 'bg-danger'">{{ x.aprobado ? 'Aprobado' : 'Desaprobado' }} · {{ formatoNota(x.calificacion) }}%</span>
              <button type="button" class="btn btn-sm btn-outline-danger fw-bold" :disabled="descargando === x.id" @click="descargarPdf(x)">
                <span v-if="descargando === x.id" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-file-earmark-pdf me-1"></i> PDF
              </button>
            </template>
            <span v-else-if="!x.presente" class="badge bg-light text-muted border">Solo para presentes en la clase</span>
            <button v-else type="button" class="btn btn-sm btn-danger fw-bold" @click="examenEnCurso = x">
              <i class="bi bi-play-fill me-1"></i> {{ x.estado === 'en_curso' ? 'Continuar' : 'Rendir' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-journal-text me-1"></i> Mis Exámenes
          </h4>
          <span class="text-muted small d-block mt-1">Notas de los exámenes del curso</span>
        </div>
      </div>

      <div v-if="cargando" class="card-body text-center py-5">
        <span class="spinner-border text-danger"></span>
      </div>
      <div v-else-if="!examenes.length" class="card-body text-center py-5 text-muted">
        <span class="material-icons d-block fs-1 mb-2 opacity-50">assignment</span>
        <span class="fw-bold">Todavía no tenés exámenes cargados.</span>
      </div>
      <div v-else class="card-body p-3 p-md-4">
        <div class="row g-3">
          <div v-for="e in examenes" :key="e.id" class="col-12 col-md-6">
            <div class="examen-card h-100">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div class="min-w-0">
                  <div class="fw-bold text-dark">{{ e.titulo }}</div>
                  <div class="small text-muted">{{ fechaLargaClase(e.fecha) }}<template v-if="e.clase"> · {{ e.clase }}</template></div>
                </div>
                <div class="text-end flex-shrink-0">
                  <div class="nota" :class="claseNota(e)">{{ e.nota !== null ? formatoNota(e.nota) : '—' }}</div>
                  <div class="small text-muted">de {{ formatoNota(e.notaMaxima) }} · aprueba con {{ formatoNota(e.porcentajeAprobacion) }}%</div>
                </div>
              </div>
              <span class="badge bg-light text-dark border mt-2 me-1">{{ e.tipo === 'practico' ? 'Práctico' : 'Teórico' }}</span>
              <span v-if="e.ausente" class="badge bg-secondary mt-2">Ausente</span>
              <span v-else-if="estaAprobado(e) !== null" class="badge mt-2" :class="estaAprobado(e) ? 'bg-success' : 'bg-danger'">
                {{ estaAprobado(e) ? 'Aprobado' : 'Desaprobado' }}
              </span>
              <span v-else class="badge bg-light text-muted border mt-2">Nota pendiente</span>
              <div v-if="e.comentarios" class="small text-dark mt-2 comentario">{{ e.comentarios }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'
import { formatoNota, claseNota, estaAprobado } from '@/composables/useExamenesCurso'
import ExamenCursoRunner from '@/components/panel-curso/examenes-curso/ExamenCursoRunner.vue'

useHead({ title: 'Mis Exámenes | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const examenes = ref([])
const cargando = ref(true)

const online = ref([])
const examenEnCurso = ref(null)
const descargando = ref(null)

const cargarTodo = async () => {
  const [res, resOnline] = await Promise.all([
    api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMisExamenesCurso', payload: {} }),
    api.get({ entity: 'examen_online_curso_arbitro', action: 'misExamenesOnlineCurso', payload: {} }),
  ])
  if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar tus exámenes')
  examenes.value = res.payload || []
  online.value = resOnline?.ok ? resOnline.payload || [] : []
}

const recargar = async () => {
  try {
    await cargarTodo()
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  }
}

const descargarPdf = async (x) => {
  descargando.value = x.id
  try {
    await api.getFile({ entity: 'examen_online_curso_arbitro', action: 'descargarPdfExamenCurso', payload: { idExamen: x.id } }, 'examen_curso.pdf')
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    descargando.value = null
  }
}

onMounted(async () => {
  try {
    await cargarTodo()
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.examen-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  background: #fff;
}
.nota { font-size: 1.6rem; font-weight: 800; line-height: 1; }
.comentario { white-space: pre-wrap; background: #f8fafc; border-radius: 8px; padding: 8px 10px; }
.min-w-0 { min-width: 0; }
</style>
