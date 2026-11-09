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

      <!-- RECUPERATORIO DE PARCIALITOS -->
      <div v-for="r in recuperatoriosParcialitos" v-show="!cursoCerrado" :key="'rp-' + r.id" class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100 card-recuperatorio" style="border-radius: 15px;">
        <div class="card-header py-3 border-bottom">
          <div class="border-start border-warning border-5 ps-3">
            <h4 class="fw-bold m-0 d-flex align-items-center gap-2 fs-5 text-warning-emphasis">
              <i class="bi bi-arrow-repeat me-1"></i> Recuperatorio de parcialitos
            </h4>
            <span class="text-muted small d-block mt-1">{{ fechaLargaClase(r.fecha) }} · {{ r.cantidadPreguntas }} preguntas · {{ r.tiempoLimiteMin }} min</span>
          </div>
        </div>
        <div class="card-body p-3 p-md-4">
          <p class="small text-dark mb-2">Tenés que recuperar:</p>
          <ul class="list-unstyled d-flex flex-column gap-2 mb-3">
            <li v-for="p in r.parcialitos" :key="'adeuda-' + p.id" class="adeudado fw-bold text-dark small text-break">
              <i class="bi bi-journal-x text-danger me-1"></i>{{ p.titulo }}
            </li>
          </ul>
          <button type="button" class="btn btn-warning fw-bold w-100 w-sm-auto" @click="examenEnCurso = r">
            <i class="bi bi-play-fill me-1"></i> {{ r.estado === 'en_curso' ? 'Continuar recuperatorio' : 'Rendir recuperatorio' }}
          </button>
        </div>
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
          <span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando tus exámenes...</p>
        </div>
        <div v-else-if="!examenes.length" class="card-body text-center py-5 text-muted">
          <span class="material-icons d-block fs-1 mb-2 opacity-50">assignment</span>
          <span class="fw-bold">Todavía no tenés exámenes cargados.</span>
        </div>
        <div v-else class="card-body p-3 p-md-4">
          <ul class="nav nav-pills flex-nowrap overflow-auto gap-1 mb-3 pb-1 pestanas" role="tablist">
            <li v-for="tipo in TIPOS" :key="tipo" class="nav-item flex-shrink-0" role="presentation">
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
              <div class="examen-card h-100 d-flex flex-column" :class="{ recuperatorio: esRecuperatorio(e) }">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div class="min-w-0">
                    <div class="fw-bold text-dark text-break">{{ e.titulo }}</div>
                    <div class="small text-muted">{{ fechaLargaClase(e.fecha) }}<template v-if="e.clase"> · {{ e.clase }}</template></div>
                  </div>
                  <div class="text-end flex-shrink-0">
                    <div class="nota" :class="claseNota(e)">{{ textoNota(e) }}</div>
                    <div v-if="e.tipo === 'teorico' && !e.online" class="small text-muted">de {{ formatoNota(e.notaMaxima) }}</div>
                    <div v-else-if="e.tipo === 'fisico'" class="small text-muted">nivel</div>
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-1 mt-2">
                  <span class="badge" :class="esRecuperatorio(e) ? 'bg-warning text-dark' : e.esFinal ? (e.tipo === 'fisico' ? 'bg-primary' : 'bg-danger') : 'bg-light text-dark border'">
                    <i v-if="esRecuperatorio(e)" class="bi bi-arrow-repeat me-1"></i>{{ etiquetaExamen(e) }}
                  </span>
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

// Mismas pestañas que Exámenes del admin: parcialitos (con sus recuperatorios), teórico final (con sus recuperatorios), prácticos y físicos
const TIPOS = ['parcialito', 'final', 'practico', 'fisico']
const ETIQUETAS_TIPO = { parcialito: 'Parcialitos', final: 'Teórico final', practico: 'Prácticos', fisico: 'Físicos' }
const ICONOS_TIPO = { parcialito: 'bi-journal-text', final: 'bi-mortarboard', practico: 'bi-flag', fisico: 'bi-stopwatch' }
const VACIO_TIPO = {
  parcialito: 'Todavía no hay parcialitos.',
  final: 'Todavía no hay teórico final.',
  practico: 'Todavía no tenés prácticos evaluados.',
  fisico: 'Todavía no tenés exámenes físicos evaluados.',
}

const pestanaDe = (e) => {
  const tipo = e.tipo || 'teorico'
  if (tipo === 'teorico') return e.esFinal ? 'final' : 'parcialito'
  return tipo
}

// Cada recuperatorio va justo después de su examen original
const ordenarConRecuperatorios = (lista) => {
  const originales = lista.filter(e => !e.idExamenOriginal)
  const resultado = []
  originales.forEach(o => {
    resultado.push(o)
    lista.filter(r => r.idExamenOriginal === o.id).forEach(r => resultado.push(r))
  })
  lista.filter(r => r.idExamenOriginal && !originales.some(o => o.id === r.idExamenOriginal)).forEach(r => resultado.push(r))
  return resultado
}

const pestana = ref('parcialito')
// Práctico y físico se cargan por aspirante: se muestran solo los que ya tienen resultado
const porTipo = computed(() => Object.fromEntries(TIPOS.map(tipo => [
  tipo,
  ordenarConRecuperatorios(examenes.value.filter(e =>
    pestanaDe(e) === tipo && (['parcialito', 'final'].includes(tipo) || e.nota !== null || e.ausente)
  )),
])))

const esRecuperatorio = (e) => Boolean(e.idExamenOriginal) || e.esRecuperatorioParcialitos
const etiquetaExamen = (e) => {
  if (e.esRecuperatorioParcialitos) return 'Recuperatorio de parcialitos'
  if (e.tipo === 'fisico') return e.idExamenOriginal ? 'Recuperatorio físico final' : (e.esFinal ? 'Físico final' : 'Simulacro')
  if ((e.tipo || 'teorico') === 'teorico') return e.idExamenOriginal ? 'Recuperatorio teórico final' : (e.esFinal ? 'Teórico final' : 'Parcialito')
  return e.idExamenOriginal ? 'Recuperatorio' : 'Práctico'
}

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

const pendientes = computed(() => online.value.filter(x => x.estado !== 'finalizado' && !x.esRecuperatorioParcialitos))
// Solo para quienes estuvieron presentes en la clase del recuperatorio
const recuperatoriosParcialitos = computed(() => online.value.filter(x => x.esRecuperatorioParcialitos && x.presente && x.estado !== 'finalizado'))

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
.examen-card.recuperatorio { background: #fffbeb; border-color: #fde68a; }
.card-recuperatorio .card-header { background: #fffbeb; }
.adeudado { border: 1px solid #fde68a; background: #fffbeb; border-radius: 10px; padding: 8px 12px; }
.mensaje-estado { border-radius: 15px; padding: 24px 16px; color: #fff; }
.mensaje-estado .icono-estado { font-size: 2.6rem; display: block; margin-bottom: 6px; }
.estado-aprobado { background: linear-gradient(135deg, #15803d, #22c55e); }
.estado-desaprobado { background: linear-gradient(135deg, #991b1b, #dc2626); }
.estado-baja { background: linear-gradient(135deg, #334155, #64748b); }
.pestanas .nav-link { color: #475569; background: #f1f5f9; font-size: 0.85rem; padding: 0.5rem 0.75rem; white-space: nowrap; }
.pestanas .nav-link.active { background: #dc3545; color: #fff; }
</style>
