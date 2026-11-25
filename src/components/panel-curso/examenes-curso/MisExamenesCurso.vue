<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <ExamenOnlineRunner
      v-if="examenEnCurso"
      entity="examen_online_curso_arbitro"
      :acciones="{ iniciar: 'iniciarExamenCurso', guardar: 'guardarAvanceExamenCurso', finalizar: 'finalizarExamenCurso' }"
      :identificador="{ idExamen: examenEnCurso.id }"
      :titulo="examenEnCurso.titulo || 'Examen del Curso de Árbitros'"
      titulo-pagina="Examen Online | Curso AAAB"
      descripcion-pagina="Examen online del curso de árbitros de la AAAB."
      @terminar="recargar"
      @salir="examenEnCurso = null"
    />

    <template v-else>
      <!-- RECUPERATORIO DE PARCIALITOS -->
      <div v-for="r in recuperatoriosParcialitos" v-show="!cursoCerrado" :key="'rp-' + r.id" class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100 card-recuperatorio radio-15">
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

      <div v-if="pendientes.length && !cursoCerrado" class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100 radio-15">
        <div class="card-header bg-white py-3 border-bottom">
          <h2 class="subtitulo-tarjeta"><i class="bi bi-laptop"></i> Exámenes para rendir</h2>
          <p class="seccion-descripcion">Exámenes online de las clases a las que asististe</p>
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

      <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100 radio-15">
        <div class="card-header bg-white py-3 border-bottom">
          <p class="seccion-descripcion">Notas de los exámenes del curso</p>
        </div>

        <EstadoCargando v-if="cargando" texto="Cargando tus exámenes" />
        <EstadoVacio v-else-if="!examenes.length" icono="bi-clipboard" titulo="Todavía no tenés exámenes cargados" />
        <div v-else class="card-body p-3 p-md-4">
          <PestanasSeccion v-model="pestana" :pestanas="pestanasConCantidad" class="mb-3" />

          <div v-if="porTipo[pestana].length" class="d-flex flex-wrap gap-1 mb-3 small">
            <span class="estado-pill estado-verde">{{ resumenPestana.aprobados }} aprobados</span>
            <span class="estado-pill estado-rojo">{{ resumenPestana.desaprobados }} desaprobados</span>
            <span v-if="resumenPestana.pendientes" class="estado-pill estado-ambar">{{ resumenPestana.pendientes }} pendientes</span>
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
                    <div class="small text-muted">{{ fechaLargaClase(e.fecha) }}</div>
                  </div>
                  <div class="text-end flex-shrink-0">
                    <div class="nota" :class="claseNota(e)">{{ textoNota(e) }}</div>
                    <div v-if="e.tipo === 'teorico' && !e.online" class="small text-muted">de {{ formatoNota(e.notaMaxima) }}</div>
                    <div v-else-if="e.tipo === 'fisico'" class="small text-muted">nivel</div>
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-1 mt-2">
                  <span class="badge" :class="esRecuperatorio(e) ? 'bg-warning text-dark' : e.esFinal ? (e.tipo === 'fisico' ? 'bg-secondary' : 'bg-danger') : 'bg-light text-dark border'">
                    <i v-if="esRecuperatorio(e)" class="bi bi-arrow-repeat me-1"></i>{{ etiquetaExamen(e) }}
                  </span>
                  <span v-if="e.online" class="badge bg-light text-dark border"><i class="bi bi-laptop me-1"></i>Online</span>
                  <span v-if="e.ausente" class="estado-pill estado-naranja">Ausente</span>
                  <span v-else-if="estaAprobado(e) !== null" class="estado-pill" :class="estaAprobado(e) ? 'estado-aprobado' : 'estado-rojo'">
                    {{ estaAprobado(e) ? 'Aprobado' : 'Desaprobado' }}
                  </span>
                  <span v-else class="estado-pill estado-pendiente">Nota pendiente</span>
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
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import { ref, computed, onMounted, inject } from 'vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import { useHead } from '@unhead/vue'
import { api } from '@/api/api'
import ExamenOnlineRunner from '@/components/comunes/examenes/ExamenOnlineRunner.vue'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'
import { formatoNota, claseNota, estaAprobado } from '@/composables/useExamenesCurso'
import { usePerfilCurso } from '@/composables/usePerfilCurso'

useHead({ title: 'Mis Exámenes | Curso AAAB' })

const toast = inject('toast')

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

// Perfil compartido del panel: con el curso cerrado (aprobado, desaprobado o baja) ya no se rinden exámenes.
// El resultado final del curso se muestra en Mi Rendimiento.
const { perfil, asegurar: asegurarPerfil } = usePerfilCurso()
const cursoCerrado = computed(() => ['aprobado', 'desaprobado', 'baja'].includes(perfil.value?.estado))

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
  const [res, resOnline] = await Promise.all([
    api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMisExamenesCurso', payload: {} }),
    api.get({ entity: 'examen_online_curso_arbitro', action: 'misExamenesOnlineCurso', payload: {} }),
    asegurarPerfil().catch(() => null),
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

// Pestañas con la cantidad de exámenes de cada tipo
const pestanasConCantidad = computed(() => TIPOS.map(tipo => ({ clave: tipo, etiqueta: ETIQUETAS_TIPO[tipo], icono: ICONOS_TIPO[tipo], cantidad: porTipo.value[tipo].length })))
</script>

<style scoped>
.examen-card {
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 12px;
  padding: 14px;
  background: var(--o-tarjeta, #fff);
}
.nota { font-size: 1.5rem; font-weight: 800; line-height: 1; }
.comentario { white-space: pre-wrap; background: var(--o-superficie, #f8fafc); border-radius: 8px; padding: 8px 10px; }
.min-w-0 { min-width: 0; }
.examen-card.recuperatorio { background: var(--o-ambar-fondo, #fffbeb); border-color: var(--o-ambar-borde, #fde68a); }
.card-recuperatorio .card-header { background: var(--o-ambar-fondo, #fffbeb); }
.adeudado { border: 1px solid var(--o-ambar-borde, #fde68a); background: var(--o-ambar-fondo, #fffbeb); border-radius: 12px; padding: 8px 12px; }
</style>
