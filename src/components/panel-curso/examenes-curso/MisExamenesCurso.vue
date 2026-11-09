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
      <div v-if="mensajeEstado" class="mensaje-estado shadow mb-4 text-center" :class="mensajeEstado.clase" role="status">
        <i :class="['bi', mensajeEstado.icono, 'icono-estado']"></i>
        <h3 class="fw-bold mb-1 fs-4">{{ mensajeEstado.titulo }}</h3>
        <p class="mb-0 small">{{ mensajeEstado.texto }}</p>
      </div>

      <div v-if="pendientes.length && !cursoCerrado" class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
        <div class="card-header bg-white py-3 border-bottom">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-laptop me-1"></i> Exámenes para rendir
            </h4>
            <span class="text-muted small d-block mt-1">Exámenes online de las clases a las que asististe</span>
          </div>
        </div>
        <div class="card-body p-3 p-md-4 d-flex flex-column gap-2">
          <div v-for="x in pendientes" :key="'on-' + x.id" class="examen-card d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div class="min-w-0">
              <div class="fw-bold text-dark">{{ x.titulo }}</div>
              <div class="small text-muted">{{ fechaLargaClase(x.fecha) }} · {{ x.cantidadPreguntas }} preguntas · {{ x.tiempoLimiteMin }} min</div>
            </div>
            <span v-if="!x.presente" class="badge bg-light text-muted border align-self-start align-self-md-center">Solo para presentes en la clase</span>
            <button v-else type="button" class="btn btn-sm btn-danger fw-bold flex-shrink-0" @click="examenEnCurso = x">
              <i class="bi bi-play-fill me-1"></i> {{ x.estado === 'en_curso' ? 'Continuar' : 'Rendir' }}
            </button>
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
          <ul class="nav nav-pills nav-fill gap-1 mb-3 pestanas" role="tablist">
            <li v-for="tipo in TIPOS" :key="tipo" class="nav-item" role="presentation">
              <button type="button" class="nav-link fw-bold w-100" :class="{ active: pestana === tipo }" role="tab" :aria-selected="pestana === tipo" @click="pestana = tipo">
                <i :class="['bi', ICONOS_TIPO[tipo], 'd-none d-sm-inline me-1']"></i>{{ ETIQUETAS_TIPO[tipo] }}
                <span class="badge rounded-pill ms-1" :class="pestana === tipo ? 'bg-white text-danger' : 'bg-secondary'">{{ porTipo[tipo].length }}</span>
              </button>
            </li>
          </ul>

          <div v-if="porTipo[pestana].length" class="d-flex flex-wrap gap-1 mb-3 small">
            <span class="badge bg-success">{{ resumenPestana.aprobados }} aprobados</span>
            <span class="badge bg-danger">{{ resumenPestana.desaprobados }} desaprobados</span>
            <span v-if="resumenPestana.pendientes" class="badge bg-light text-muted border">{{ resumenPestana.pendientes }} pendientes</span>
          </div>

          <div v-if="!porTipo[pestana].length" class="text-center py-4 text-muted">
            <i :class="['bi', ICONOS_TIPO[pestana], 'fs-1 d-block mb-2 opacity-50']"></i>
            <span class="fw-bold small">{{ VACIO_TIPO[pestana] }}</span>
          </div>
          <div v-else class="row g-3">
            <div v-for="e in porTipo[pestana]" :key="e.id" class="col-12 col-md-6">
              <div class="examen-card h-100 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div class="min-w-0">
                    <div class="fw-bold text-dark">{{ e.titulo }}</div>
                    <div class="small text-muted">{{ fechaLargaClase(e.fecha) }}<template v-if="e.clase"> · {{ e.clase }}</template></div>
                  </div>
                  <div class="text-end flex-shrink-0">
                    <div class="nota" :class="claseNota(e)">{{ textoNota(e) }}</div>
                    <div v-if="e.tipo === 'teorico' && !e.online" class="small text-muted">de {{ formatoNota(e.notaMaxima) }}</div>
                    <div v-else-if="e.tipo === 'fisico'" class="small text-muted">nivel</div>
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-1 mt-2">
                  <span v-if="(e.tipo || 'teorico') === 'teorico'" class="badge" :class="e.esFinal ? 'bg-danger' : 'bg-light text-dark border'">{{ e.esFinal ? 'Teórico final' : 'Parcialito' }}</span>
                  <span v-if="e.online" class="badge bg-light text-dark border"><i class="bi bi-laptop me-1"></i>Online</span>
                  <span v-if="e.ausente" class="badge bg-secondary">Ausente</span>
                  <span v-else-if="estaAprobado(e) !== null" class="badge" :class="estaAprobado(e) ? 'bg-success' : 'bg-danger'">
                    {{ estaAprobado(e) ? 'Aprobado' : 'Desaprobado' }}
                  </span>
                  <span v-else class="badge bg-light text-muted border">Nota pendiente</span>
                </div>
                <div v-if="e.comentarios && e.comentarios !== 'Rendido online'" class="small text-dark mt-2 comentario">{{ e.comentarios }}</div>
                <button v-if="e.rendidoOnline" type="button" class="btn btn-sm btn-outline-danger fw-bold mt-3 align-self-start" :disabled="descargando === e.id" @click="descargarPdf(e)">
                  <span v-if="descargando === e.id" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-file-earmark-pdf me-1"></i> Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ExamenCursoRunner from '@/components/panel-curso/examenes-curso/ExamenCursoRunner.vue'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'
import { formatoNota, claseNota, estaAprobado } from '@/composables/useExamenesCurso'

useHead({ title: 'Mis Exámenes | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const examenes = ref([])
const online = ref([])
const cargando = ref(true)
const examenEnCurso = ref(null)
const descargando = ref(null)

const TIPOS = ['teorico', 'practico', 'fisico']
const ETIQUETAS_TIPO = { teorico: 'Teórico', practico: 'Práctico', fisico: 'Físico' }
const ICONOS_TIPO = { teorico: 'bi-journal-text', practico: 'bi-flag', fisico: 'bi-stopwatch' }
const VACIO_TIPO = {
  teorico: 'Todavía no hay exámenes teóricos.',
  practico: 'Todavía no tenés prácticos evaluados.',
  fisico: 'Todavía no tenés exámenes físicos evaluados.',
}

const pestana = ref('teorico')

// Práctico y físico se cargan por aspirante: se muestran solo los que ya tienen resultado
const porTipo = computed(() => Object.fromEntries(TIPOS.map(tipo => [
  tipo,
  examenes.value.filter(e => (e.tipo || 'teorico') === tipo && (tipo === 'teorico' || e.nota !== null || e.ausente)),
])))

const resumenPestana = computed(() => {
  const lista = porTipo.value[pestana.value]
  return {
    aprobados: lista.filter(e => !e.ausente && estaAprobado(e) === true).length,
    desaprobados: lista.filter(e => e.ausente || estaAprobado(e) === false).length,
    pendientes: lista.filter(e => !e.ausente && estaAprobado(e) === null).length,
  }
})

const estado = ref('')

const MENSAJES_ESTADO = {
  aprobado: {
    titulo: '¡Felicitaciones! Aprobaste el curso de árbitro',
    texto: 'Completaste el curso. Desde el inicio de tu panel podés registrarte como árbitro de la AAAB.',
    icono: 'bi-trophy-fill',
    clase: 'estado-aprobado',
  },
  desaprobado: {
    titulo: 'Lamentablemente el curso está desaprobado',
    texto: 'Podés consultar tus resultados abajo. Para volver a anotarte, comunicate con la coordinación del curso.',
    icono: 'bi-emoji-frown-fill',
    clase: 'estado-desaprobado',
  },
  baja: {
    titulo: 'Fuiste dado/a de baja del curso',
    texto: 'Si creés que es un error, comunicate con la coordinación del curso.',
    icono: 'bi-person-x-fill',
    clase: 'estado-baja',
  },
}

const mensajeEstado = computed(() => MENSAJES_ESTADO[estado.value] || null)
const cursoCerrado = computed(() => Boolean(mensajeEstado.value))

const pendientes = computed(() => online.value.filter(x => x.estado !== 'finalizado'))

// En los exámenes online la nota es el porcentaje obtenido
const textoNota = (e) => {
  if (e.nota === null) return '—'
  if (e.tipo === 'practico') return e.nota >= 1 ? 'Aprob.' : 'Desap.'
  return e.online ? `${formatoNota(e.nota / (e.notaMaxima || 100) * 100)}%` : formatoNota(e.nota)
}

const cargarTodo = async () => {
  const [res, resOnline, resPerfil] = await Promise.all([
    api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMisExamenesCurso', payload: {} }),
    api.get({ entity: 'examen_online_curso_arbitro', action: 'misExamenesOnlineCurso', payload: {} }),
    api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMiPerfilCurso', payload: {} }),
  ])
  estado.value = resPerfil?.ok ? resPerfil.payload?.estado || '' : ''
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

const descargarPdf = async (e) => {
  descargando.value = e.id
  try {
    await api.getFile({ entity: 'examen_online_curso_arbitro', action: 'descargarPdfExamenCurso', payload: { idExamen: e.id } }, `examen_${e.titulo}.pdf`)
  } catch (err) {
    toast({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
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
.mensaje-estado { border-radius: 15px; padding: 24px 16px; color: #fff; }
.mensaje-estado .icono-estado { font-size: 2.6rem; display: block; margin-bottom: 6px; }
.estado-aprobado { background: linear-gradient(135deg, #15803d, #22c55e); }
.estado-desaprobado { background: linear-gradient(135deg, #991b1b, #dc2626); }
.estado-baja { background: linear-gradient(135deg, #334155, #64748b); }
.pestanas .nav-link { color: #475569; background: #f1f5f9; font-size: 0.85rem; padding: 0.5rem 0.25rem; }
.pestanas .nav-link.active { background: #dc3545; color: #fff; }
</style>
