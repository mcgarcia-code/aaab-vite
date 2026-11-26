<template>
  <!-- Práctica en curso: pantalla completa -->
  <PracticaCatalogoRunner
    v-if="practicaActiva"
    :key="practicaActiva.id"
    :practica="practicaActiva"
    @finalizada="alFinalizar"
    @salir="salirDePractica"
    @otra="otraPractica"
  />

  <!-- Revisión de una práctica guardada -->
  <DetallePractica
    v-else-if="idDetalle"
    :id-practica="idDetalle"
    :texto-reglas="textoReglas"
    @cerrar="idDetalle = null"
  />

  <div v-else class="container-fluid py-2 py-md-0 px-2 px-md-3 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100 radio-15">

      <div class="card-header bg-white py-3 border-bottom">
        <p class="seccion-descripcion">Practicá con las preguntas del catálogo: cada práctica queda guardada para que la revises.</p>
      </div>

      <div class="card-body p-3 p-md-4">
        <EstadoCargando v-if="cargandoInicio" texto="Cargando tus prácticas" />

        <template v-else>
          <!-- ============ RESUMEN DEL MES ============ -->
          <div class="row g-2 mb-3">
            <div class="col-6">
              <div class="dato-mes rounded-4 border p-3 h-100">
                <small class="text-muted fw-bold d-block text-uppercase etiqueta-dato">Prácticas en {{ MESES[mesActual - 1].toLowerCase() }}</small>
                <span class="fw-bold fs-3 text-dark">{{ resumenMesActual.cantidad }}</span>
              </div>
            </div>
            <div class="col-6">
              <div class="dato-mes rounded-4 border p-3 h-100">
                <small class="text-muted fw-bold d-block text-uppercase etiqueta-dato">Promedio de {{ MESES[mesActual - 1].toLowerCase() }}</small>
                <span class="fw-bold fs-3" :class="resumenMesActual.cantidad ? claseNota(resumenMesActual.promedio) : 'text-muted'">
                  {{ resumenMesActual.cantidad ? `${formatoNota(resumenMesActual.promedio)}%` : '—' }}
                </span>
              </div>
            </div>
          </div>

          <!-- ============ PESTAÑAS ============ -->
          <PestanasSeccion v-model="pestana" :pestanas="PESTANAS" class="mb-3" />

          <!-- ============ PRACTICAR ============ -->
          <div v-if="pestana === 'practicar'">
            <div v-if="enCurso" class="card border border-warning-subtle bg-warning-subtle rounded-4 mb-3">
              <div class="card-body p-3 d-flex flex-column flex-sm-row align-items-sm-center gap-2 gap-sm-3">
                <div class="flex-grow-1">
                  <p class="fw-bold text-dark m-0"><i class="bi bi-hourglass-split me-1"></i>Tenés una práctica sin terminar</p>
                  <small class="text-muted">{{ enCurso.preguntas.length }} preguntas · respondiste {{ respondidasEnCurso }}</small>
                </div>
                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-pill fw-bold flex-fill" :disabled="descartando" @click="descartarEnCurso">
                    Descartar
                  </button>
                  <button type="button" class="btn btn-danger btn-sm rounded-pill fw-bold flex-fill" @click="practicaActiva = enCurso">
                    <i class="bi bi-play-fill me-1"></i>Continuar
                  </button>
                </div>
              </div>
            </div>

            <form @submit.prevent="comenzar" novalidate>
              <div class="row g-3 mb-3">
                <div class="col-6">
                  <label for="practica-idioma" class="form-label small fw-bold text-dark">Idioma</label>
                  <select id="practica-idioma" v-model="formulario.idioma" class="form-select shadow-none">
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                  </select>
                </div>
                <div class="col-6">
                  <label for="practica-cantidad" class="form-label small fw-bold text-dark">Preguntas</label>
                  <select id="practica-cantidad" v-model="formulario.cantidad" class="form-select shadow-none">
                    <option v-for="c in CANTIDADES_PREGUNTAS" :key="c" :value="c">{{ c === 'todas' ? 'Todas' : c }}</option>
                  </select>
                </div>
              </div>

              <SelectorReglas v-model="formulario.reglas" :reglas="reglas" titulo="Reglas a incluir" id="practica-reglas" class="mb-3" />

              <div v-if="errorFormulario" class="alert alert-danger py-2 px-3 small fw-bold d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>{{ errorFormulario }}
              </div>

              <button type="submit" class="btn btn-danger btn-lg rounded-pill fw-bold w-100 py-2" :disabled="iniciando">
                <span v-if="iniciando" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-play-circle-fill me-2"></i>{{ enCurso ? 'Empezar una nueva' : 'Comenzar' }}
              </button>
              <p v-if="enCurso" class="small text-muted text-center mt-2 mb-0">Si empezás una nueva, la que está sin terminar se descarta.</p>
            </form>
          </div>

          <!-- ============ MIS PRÁCTICAS ============ -->
          <div v-else-if="pestana === 'historial'">
            <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
              <h6 class="fw-bold text-dark m-0">Resumen mensual</h6>
              <div class="d-flex align-items-center gap-2">
                <label for="practica-anio" class="small fw-bold text-muted text-uppercase mb-0">Año:</label>
                <select id="practica-anio" v-model="anioSeleccionado" class="form-select form-select-sm shadow-none w-auto fw-bold">
                  <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
                </select>
              </div>
            </div>

            <div v-if="cargandoEstadisticas" class="text-center py-3">
              <span class="spinner-border spinner-border-sm text-secondary"></span>
            </div>

            <template v-else>
              <!-- Totales del año -->
              <div class="row g-2 mb-3 text-center">
                <div class="col-4">
                  <div class="dato-mes rounded-3 border py-2 px-1 h-100">
                    <span class="d-block fw-bold fs-5 text-dark">{{ resumenAnio.total }}</span>
                    <small class="text-muted etiqueta-dato">Prácticas</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="dato-mes rounded-3 border py-2 px-1 h-100">
                    <span class="d-block fw-bold fs-5 text-dark">{{ formatoNota(resumenAnio.porMes) }}</span>
                    <small class="text-muted etiqueta-dato">Por mes</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="dato-mes rounded-3 border py-2 px-1 h-100">
                    <span class="d-block fw-bold fs-5" :class="resumenAnio.total ? claseNota(resumenAnio.promedio) : 'text-muted'">
                      {{ resumenAnio.total ? `${formatoNota(resumenAnio.promedio)}%` : '—' }}
                    </span>
                    <small class="text-muted etiqueta-dato">Promedio</small>
                  </div>
                </div>
              </div>

              <!-- Meses con prácticas: tocar uno filtra la lista -->
              <div v-if="estadisticas.meses.length" class="d-flex flex-column gap-2 mb-4">
                <button v-for="m in estadisticas.meses" :key="m.mes" type="button"
                        class="fila-mes rounded-3 border px-3 py-2 text-start"
                        :class="{ activa: mesFiltro === m.mes }"
                        @click="mesFiltro = mesFiltro === m.mes ? null : m.mes">
                  <div class="d-flex justify-content-between align-items-center gap-2 mb-1">
                    <span class="fw-bold text-dark">{{ MESES[m.mes - 1] }}</span>
                    <span class="small text-muted">
                      {{ m.cantidad }} {{ m.cantidad === 1 ? 'práctica' : 'prácticas' }} ·
                      <strong :class="claseNota(m.promedio)">{{ formatoNota(m.promedio) }}%</strong>
                    </span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar" :class="m.promedio >= UMBRAL_APROBADO ? 'bg-success' : 'bg-danger'" :style="{ width: `${m.promedio}%` }"></div>
                  </div>
                </button>
              </div>
            </template>

            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold text-dark m-0">
                {{ mesFiltro ? `Prácticas de ${MESES[mesFiltro - 1].toLowerCase()}` : 'Todas las prácticas' }}
              </h6>
              <button v-if="mesFiltro" type="button" class="btn btn-link btn-sm text-decoration-none fw-bold p-0" @click="mesFiltro = null">
                Ver todo el año
              </button>
            </div>

            <div v-if="!practicasFiltradas.length" class="text-center py-5 px-3 text-muted bg-light rounded-3">
              <i class="bi bi-journal-x opacity-50 d-block mb-2 fs-1"></i>
              <p class="m-0 fw-bold">No hiciste prácticas en {{ mesFiltro ? MESES[mesFiltro - 1].toLowerCase() + ' de ' : '' }}{{ anioSeleccionado }}.</p>
            </div>

            <div v-else class="d-flex flex-column gap-2">
              <button v-for="p in practicasFiltradas" :key="p.id" type="button"
                      class="historial-card shadow-sm d-flex align-items-center gap-2 p-3 w-100 text-start"
                      :class="p.calificacion >= UMBRAL_APROBADO ? 'borde-bien' : 'borde-mal'"
                      @click="idDetalle = p.id">
                <div class="flex-grow-1 min-w-0">
                  <div class="text-secondary small fw-medium mb-1">
                    <i class="bi bi-calendar-event me-1"></i>{{ fechaHoraDMA(p.finalizado_en) }}
                  </div>
                  <span class="fw-bold text-dark d-block text-truncate">{{ textoReglas(p.reglas) }}</span>
                  <small class="text-muted">{{ p.correctas }} de {{ p.cantidad }} correctas<span v-if="p.idioma === 'en'"> · Inglés</span></small>
                </div>
                <span class="fw-bold fs-5 flex-shrink-0" :class="claseNota(p.calificacion)">{{ formatoNota(p.calificacion) }}%</span>
                <i class="bi bi-chevron-right text-muted flex-shrink-0"></i>
              </button>
            </div>
          </div>

          <!-- ============ MÁS FALLADAS ============ -->
          <div v-else-if="pestana === 'falladas'">
            <p class="small text-muted mb-3">Las preguntas en las que más te equivocaste en todas tus prácticas. Repasalas antes de la próxima.</p>

            <div v-if="!estadisticas.falladas.length" class="text-center py-5 px-3 text-muted bg-light rounded-3">
              <i class="bi bi-emoji-smile opacity-50 d-block mb-2 fs-1"></i>
              <p class="m-0 fw-bold">Todavía no hay preguntas erradas.</p>
              <p class="small m-0 mt-1">Cuando termines prácticas, acá vas a ver las que más te cuestan.</p>
            </div>

            <div v-else class="d-flex flex-column gap-2">
              <div v-for="(f, i) in estadisticas.falladas" :key="f.id" class="historial-card borde-mal shadow-sm p-3">
                <div class="d-flex flex-wrap align-items-center gap-2 mb-2 small">
                  <span class="badge rounded-pill bg-danger">#{{ i + 1 }}</span>
                  <span class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">{{ textoNumeroPregunta(f) }}</span>
                  <span class="text-danger fw-bold ms-auto">
                    <i class="bi bi-x-circle me-1"></i>{{ f.errores }} de {{ f.respondidas }} {{ f.respondidas === 1 ? 'vez' : 'veces' }}
                  </span>
                </div>
                <p class="fw-semibold text-dark mb-2 text-break lh-base">{{ f.texto }}</p>
                <button type="button" class="btn btn-link btn-sm text-decoration-none fw-bold p-0" @click="alternarRespuesta(f.id)">
                  <i class="bi me-1" :class="respuestasAbiertas.includes(f.id) ? 'bi-eye-slash' : 'bi-eye'"></i>
                  {{ respuestasAbiertas.includes(f.id) ? 'Ocultar respuesta' : 'Ver respuesta correcta' }}
                </button>
                <ul v-if="respuestasAbiertas.includes(f.id)" class="list-unstyled d-flex flex-column gap-2 mt-2 mb-0">
                  <li v-for="(c, j) in f.correctas" :key="j" class="list-group-item list-group-item-success border border-success rounded-3 px-3 py-2 small d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill mt-1 flex-shrink-0"></i><span class="text-break">{{ c }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import { useHead } from '@unhead/vue'
import { anioActual, conAnioActual } from '@/utils/anios'
import { fechaHoraDMA, MESES } from '@/utils/fechas'
import { usePracticaCatalogo, CANTIDADES_PREGUNTAS } from '@/composables/usePracticaCatalogo'
import { UMBRAL_APROBADO, textoNumeroPregunta } from '@/utils/cuestionarios'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import SelectorReglas from '@/components/comunes/SelectorReglas.vue'
import PracticaCatalogoRunner from '@/components/comunes/practica-catalogo/PracticaCatalogoRunner.vue'
import DetallePractica from '@/components/comunes/practica-catalogo/DetallePractica.vue'

useHead({ title: 'Practicar catálogo | AAAB' })

const {
  reglas, enCurso, practicas, estadisticas, cargandoInicio, cargandoEstadisticas,
  cargarTodo, cargarEnCurso, cargarPracticas, cargarEstadisticas, iniciarPractica, abandonarPractica
} = usePracticaCatalogo()

const PESTANAS = [
  { clave: 'practicar', etiqueta: 'Practicar', icono: 'bi-play-circle' },
  { clave: 'historial', etiqueta: 'Mis prácticas', icono: 'bi-clock-history' },
  { clave: 'falladas', etiqueta: 'Más falladas', icono: 'bi-x-octagon' }
]
const pestana = ref('practicar')

const practicaActiva = ref(null)
const idDetalle = ref(null)

// ============ FORMATOS ============
const formatoNota = (valor) => Number(valor || 0).toLocaleString('es-AR', { maximumFractionDigits: 1 })
const claseNota = (valor) => Number(valor) >= UMBRAL_APROBADO ? 'text-success' : 'text-danger'

const textoReglas = (lista = []) => {
  if (reglas.value.length && lista.length >= reglas.value.length) return 'Todas las reglas'
  return lista.length === 1 ? `Regla ${lista[0]}` : `Reglas ${lista.join(', ')}`
}

// ============ RESUMEN DEL MES Y DEL AÑO ============
const mesActual = new Date().getMonth() + 1
const anioSeleccionado = ref(anioActual())
const mesFiltro = ref(null)

const anioDe = (p) => String(p.finalizado_en || '').substring(0, 4)
const mesDe = (p) => Number(String(p.finalizado_en || '').substring(5, 7))

const aniosDisponibles = computed(() => conAnioActual(practicas.value.map(anioDe).filter(Boolean)))

// El mes en curso se calcula sobre la lista completa: no depende del año elegido en el historial
const resumenMesActual = computed(() => {
  const delMes = practicas.value.filter(p => anioDe(p) === anioActual() && mesDe(p) === mesActual)
  const promedio = delMes.length ? delMes.reduce((suma, p) => suma + p.calificacion, 0) / delMes.length : 0
  return { cantidad: delMes.length, promedio }
})

// Prácticas por mes: desde el primer mes con prácticas hasta diciembre (o hasta el mes en curso si es este año)
const resumenAnio = computed(() => {
  const meses = estadisticas.value.meses
  const total = meses.reduce((suma, m) => suma + m.cantidad, 0)
  if (!total) return { total: 0, porMes: 0, promedio: 0 }
  const primerMes = meses[0].mes
  const ultimoMes = anioSeleccionado.value === anioActual() ? mesActual : 12
  const mesesContados = Math.max(1, ultimoMes - primerMes + 1)
  const promedio = meses.reduce((suma, m) => suma + m.promedio * m.cantidad, 0) / total
  return { total, porMes: total / mesesContados, promedio }
})

const practicasFiltradas = computed(() => practicas.value.filter(p =>
  anioDe(p) === anioSeleccionado.value && (!mesFiltro.value || mesDe(p) === mesFiltro.value)
))

watch(anioSeleccionado, (anio) => {
  mesFiltro.value = null
  cargarEstadisticas(anio)
})

// ============ FORMULARIO ============
const formulario = reactive({ idioma: 'es', cantidad: 10, reglas: [] })
const errorFormulario = ref('')
const iniciando = ref(false)
const descartando = ref(false)

const preguntasDisponibles = computed(() => reglas.value
  .filter(r => formulario.reglas.includes(r.codigo))
  .reduce((suma, r) => suma + r.cantidad, 0))

const respondidasEnCurso = computed(() => {
  const seleccion = enCurso.value?.seleccion || {}
  return Object.values(seleccion).filter(elegidas => elegidas?.length).length
})

// Al cambiar las reglas se borra el aviso de error del formulario
watch(() => formulario.reglas, () => { errorFormulario.value = '' })

// Al llegar las reglas arrancan todas elegidas, como en el catálogo
watch(reglas, (lista) => {
  if (!formulario.reglas.length) formulario.reglas = lista.map(r => r.codigo)
}, { immediate: true })

const comenzar = async () => {
  errorFormulario.value = ''
  if (!formulario.reglas.length) {
    errorFormulario.value = 'Elegí al menos una regla.'
    return
  }
  if (!CANTIDADES_PREGUNTAS.includes(formulario.cantidad)) {
    errorFormulario.value = 'Elegí la cantidad de preguntas.'
    return
  }
  if (!preguntasDisponibles.value) {
    errorFormulario.value = 'No hay preguntas en las reglas elegidas.'
    return
  }
  iniciando.value = true
  try {
    practicaActiva.value = await iniciarPractica({ ...formulario })
    enCurso.value = practicaActiva.value
  } catch (e) {
    errorFormulario.value = e.message
  } finally {
    iniciando.value = false
  }
}

const descartarEnCurso = async () => {
  if (!enCurso.value) return
  descartando.value = true
  await abandonarPractica(enCurso.value.id)
  descartando.value = false
}

// ============ SALIDA DEL RUNNER ============
const alFinalizar = () => {
  enCurso.value = null
  cargarPracticas()
  cargarEstadisticas(anioSeleccionado.value)
}

const salirDePractica = async () => {
  practicaActiva.value = null
  // Si salió sin terminar, se trae el avance guardado para el botón "Continuar"
  await cargarEnCurso()
}

const otraPractica = () => {
  practicaActiva.value = null
  pestana.value = 'practicar'
}

// ============ MÁS FALLADAS ============
const respuestasAbiertas = ref([])
const alternarRespuesta = (id) => {
  respuestasAbiertas.value = respuestasAbiertas.value.includes(id)
    ? respuestasAbiertas.value.filter(x => x !== id)
    : [...respuestasAbiertas.value, id]
}

onMounted(() => cargarTodo(anioSeleccionado.value))
</script>

<style scoped>

.dato-mes { background: var(--o-chip, #f8fafc); }
.etiqueta-dato { font-size: 0.7rem; letter-spacing: 0.3px; }

.fila-mes {
  background: var(--o-tarjeta, #fff);
  transition: border-color 0.15s ease;
}
.fila-mes:hover { border-color: var(--o-borde-fuerte, #94a3b8) !important; }
.fila-mes.activa { border-color: #dc2626 !important; box-shadow: 0 0 0 1px #dc2626; }

.historial-card {
  background: var(--o-tarjeta, #fff);
  border: 1px solid var(--o-borde, #e5e7eb);
  border-left: 4px solid #6b7280;
  border-radius: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
button.historial-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
}
.borde-bien { border-left-color: #198754; }
.borde-mal { border-left-color: #dc2626; }

.min-w-0 { min-width: 0; }
</style>
