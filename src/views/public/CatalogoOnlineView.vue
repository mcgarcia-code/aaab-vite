<template>
  <!-- Cuestionario en curso: pantalla completa (mismo componente que la práctica del panel) -->
  <PracticaCatalogoRunner
    v-if="runnerAbierto && cuestionario"
    :key="cuestionario.clave"
    :practica="cuestionario"
    :idioma="cuestionario.idioma"
    :subtitulo="textosIdioma(cuestionario.idioma).titulo"
    :guardar="guardarAvance"
    :finalizar="corregir"
    @finalizada="alFinalizar"
    @salir="runnerAbierto = false"
    @otra="empezarOtra"
  >
    <template #acciones-resultado>
      <button type="button" class="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold" :disabled="descargandoPdf" @click="descargarPdf">
        <span v-if="descargandoPdf" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        <i v-else class="bi bi-file-earmark-pdf-fill me-2"></i>{{ textosIdioma(cuestionario.idioma).descargarPdf }}
      </button>
    </template>
  </PracticaCatalogoRunner>

  <div class="fondo-catalogo py-4 py-md-5 px-3 animate__animated animate__fadeIn">
    <div class="tarjeta-catalogo mx-auto bg-white shadow-lg p-3 p-sm-4 p-md-5">

      <div class="text-center mb-4">
        <i class="bi bi-ui-checks-grid text-danger display-5 d-block mb-2" aria-hidden="true"></i>
        <h1 class="fw-bold text-dark fs-3 mb-1">{{ t.titulo }}</h1>
        <p class="text-muted small mb-0">{{ t.descripcion }}</p>
      </div>

      <!-- Cuestionario sin terminar (guardado en este navegador) -->
      <div v-if="cuestionario && !runnerAbierto" class="aviso-en-curso rounded-3 border p-3 mb-4">
        <div class="fw-bold text-dark mb-1"><i class="bi bi-hourglass-split text-warning me-1"></i>{{ t.sinTerminar }}</div>
        <small class="text-muted d-block mb-2">{{ t.respondiste(respondidasGuardadas, cuestionario.preguntas.length) }}</small>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-danger btn-sm rounded-pill fw-bold flex-fill" @click="runnerAbierto = true">
            <i class="bi bi-play-fill me-1"></i>{{ t.continuar }}
          </button>
          <button type="button" class="btn btn-light border btn-sm rounded-pill fw-bold flex-fill" @click="descartar">
            {{ t.descartar }}
          </button>
        </div>
      </div>

      <form novalidate @submit.prevent="comenzar">
        <div class="row g-3 mb-3">
          <div class="col-6">
            <label for="catalogo-idioma" class="form-label small fw-bold text-dark">{{ t.idioma }}</label>
            <select id="catalogo-idioma" v-model="formulario.idioma" class="form-select shadow-none">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div class="col-6">
            <label for="catalogo-cantidad" class="form-label small fw-bold text-dark">{{ t.cantidad }}</label>
            <select id="catalogo-cantidad" v-model="formulario.cantidad" class="form-select shadow-none">
              <option v-for="c in CANTIDADES" :key="c" :value="c">{{ c === 'todas' ? t.todas : c }}</option>
            </select>
          </div>
        </div>

        <div class="mb-3">
          <div v-if="cargandoReglas" class="text-center py-3">
            <span class="spinner-border spinner-border-sm text-danger" aria-hidden="true"></span>
          </div>
          <div v-else-if="errorReglas" class="alert alert-warning py-2 px-3 small fw-semibold d-flex align-items-center gap-2 mb-0">
            <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <span class="flex-grow-1">{{ errorReglas }}</span>
            <button type="button" class="btn btn-sm btn-light border rounded-pill fw-bold" @click="cargarReglas">{{ t.reintentar }}</button>
          </div>
          <SelectorReglas v-else v-model="formulario.reglas" :reglas="reglas" :titulo="t.reglas" :idioma="formulario.idioma" id="catalogo-reglas" />
        </div>

        <div v-if="errorFormulario" class="alert alert-danger py-2 px-3 small fw-bold d-flex align-items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>{{ errorFormulario }}
        </div>

        <button type="submit" class="btn btn-danger btn-lg rounded-pill fw-bold w-100 py-2" :disabled="iniciando || cargandoReglas">
          <span v-if="iniciando" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          <i v-else class="bi bi-play-circle-fill me-2"></i>{{ cuestionario ? t.empezarNuevo : t.comenzar }}
        </button>
        <p v-if="cuestionario" class="small text-muted text-center mt-2 mb-0">{{ t.avisoNuevo }}</p>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@unhead/vue'
import { api } from '@/api/api'
import PracticaCatalogoRunner from '@/components/comunes/practica-catalogo/PracticaCatalogoRunner.vue'
import SelectorReglas from '@/components/comunes/SelectorReglas.vue'

// Catálogo de preguntas público (sin login), backend: catalogo_publico.php.
// Usa el mismo runner, resumen y revisión que la práctica del panel, pero no guarda nada en el servidor:
// el cuestionario en curso queda en este navegador (sessionStorage) para no perderlo si se recarga la página.

useHead({
  title: 'Catálogo de Preguntas | AAAB',
  meta: [{ name: 'description', content: 'Practicá con el catálogo de preguntas de las reglas de handball de la AAAB, en español o inglés.' }],
  link: [{ rel: 'canonical', href: 'https://arbitroshandball.com.ar/catalogo' }]
})

const notificar = inject('notificar')

const ENTIDAD = 'catalogo_publico'
const CANTIDADES = [5, 10, 20, 30, 'todas']
const CLAVE_GUARDADO = 'aaab_catalogo_publico'

// ============ TEXTOS ============
const TEXTOS = {
  es: {
    titulo: 'Catálogo de Preguntas',
    descripcion: 'Practicá con las preguntas de las reglas de juego. Al terminar ves la corrección de cada una.',
    idioma: 'Idioma',
    cantidad: 'Cantidad de preguntas',
    reglas: 'Reglas a incluir',
    todas: 'Todas',
    comenzar: 'Comenzar',
    empezarNuevo: 'Empezar uno nuevo',
    avisoNuevo: 'Si empezás uno nuevo, el que está sin terminar se descarta.',
    sinTerminar: 'Tenés un cuestionario sin terminar',
    respondiste: (r, total) => `Respondiste ${r} de ${total} preguntas.`,
    continuar: 'Continuar',
    descartar: 'Descartar',
    reintentar: 'Reintentar',
    errorReglas: 'No se pudieron cargar las reglas.',
    elegiRegla: 'Elegí al menos una regla.',
    sinPreguntas: 'No hay preguntas en las reglas elegidas.',
    errorArmar: 'No se pudo armar el cuestionario.',
    errorCorregir: 'No se pudieron corregir tus respuestas.',
    descargarPdf: 'Descargar resultados en PDF',
    errorPdf: 'No se pudo descargar el PDF.',
    archivoPdf: 'catalogo_resultado.pdf'
  },
  en: {
    titulo: 'Catalogue of Rules Questions',
    descripcion: 'Practice with questions about the rules of the game. When you finish you will see the correction of each one.',
    idioma: 'Language',
    cantidad: 'Number of questions',
    reglas: 'Rules to include',
    todas: 'All',
    comenzar: 'Begin',
    empezarNuevo: 'Start a new one',
    avisoNuevo: 'If you start a new one, the unfinished one is discarded.',
    sinTerminar: 'You have an unfinished questionnaire',
    respondiste: (r, total) => `You answered ${r} out of ${total} questions.`,
    continuar: 'Continue',
    descartar: 'Discard',
    reintentar: 'Try again',
    errorReglas: 'The rules could not be loaded.',
    elegiRegla: 'Select at least one rule.',
    sinPreguntas: 'There are no questions in the selected rules.',
    errorArmar: 'The questionnaire could not be created.',
    errorCorregir: 'Your answers could not be checked.',
    descargarPdf: 'Download results in PDF',
    errorPdf: 'The PDF could not be downloaded.',
    archivoPdf: 'catalogue_results.pdf'
  }
}
const textosIdioma = (idioma) => TEXTOS[idioma] || TEXTOS.es

const formulario = reactive({ idioma: 'es', cantidad: 10, reglas: [] })
const t = computed(() => textosIdioma(formulario.idioma))

// ============ REGLAS ============
const reglas = ref([])               // [{ codigo, cantidad }]
const cargandoReglas = ref(false)
const errorReglas = ref('')

const cargarReglas = async () => {
  cargandoReglas.value = true
  errorReglas.value = ''
  const res = await api.get({ entity: ENTIDAD, action: 'reglasCatalogoPublico' })
  if (res?.ok) reglas.value = res.payload || []
  else errorReglas.value = res?.message || t.value.errorReglas
  cargandoReglas.value = false
}

// Al llegar las reglas arrancan todas elegidas, como en el catálogo viejo
watch(reglas, (lista) => {
  if (!formulario.reglas.length) formulario.reglas = lista.map(r => r.codigo)
})

const preguntasDisponibles = computed(() => reglas.value
  .filter(r => formulario.reglas.includes(r.codigo))
  .reduce((suma, r) => suma + r.cantidad, 0))

const errorFormulario = ref('')

// Al cambiar las reglas se borra el aviso de error del formulario
watch(() => formulario.reglas, () => { errorFormulario.value = '' })

// ============ CUESTIONARIO EN ESTE NAVEGADOR ============
// cuestionario: { clave, idioma, preguntas, opciones, seleccion, indice }
const cuestionario = ref(null)
const runnerAbierto = ref(false)

const leerGuardado = () => {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE_GUARDADO) || 'null')
    return guardado?.preguntas?.length ? guardado : null
  } catch {
    return null
  }
}

const escribirGuardado = (valor) => {
  try {
    if (valor) sessionStorage.setItem(CLAVE_GUARDADO, JSON.stringify(valor))
    else sessionStorage.removeItem(CLAVE_GUARDADO)
  } catch { /* sin almacenamiento (modo privado): el cuestionario sigue igual, solo no sobrevive a una recarga */ }
}

const respondidasGuardadas = computed(() =>
  Object.values(cuestionario.value?.seleccion || {}).filter(elegidas => elegidas?.length).length)

const iniciando = ref(false)

const comenzar = async () => {
  errorFormulario.value = ''
  if (!formulario.reglas.length) {
    errorFormulario.value = t.value.elegiRegla
    return
  }
  if (!preguntasDisponibles.value) {
    errorFormulario.value = t.value.sinPreguntas
    return
  }
  iniciando.value = true
  try {
    const res = await api.post({
      entity: ENTIDAD,
      action: 'armarCuestionarioPublico',
      payload: { idioma: formulario.idioma, cantidad: formulario.cantidad, reglas: formulario.reglas }
    })
    if (!res?.ok) throw new Error(res?.message || t.value.errorArmar)
    cuestionario.value = {
      clave: Date.now(),
      idioma: res.payload.idioma,
      preguntas: res.payload.preguntas || [],
      opciones: res.payload.opciones || {},
      seleccion: {},
      indice: 0
    }
    escribirGuardado(cuestionario.value)
    runnerAbierto.value = true
  } catch (e) {
    errorFormulario.value = e.message
  } finally {
    iniciando.value = false
  }
}

const descartar = () => {
  cuestionario.value = null
  escribirGuardado(null)
}

// El runner llama a guardar al cambiar de pregunta y al salir: solo se guarda en el navegador
const guardarAvance = ({ indice, seleccion }) => {
  if (cuestionario.value) {
    cuestionario.value = { ...cuestionario.value, indice, seleccion }
    escribirGuardado(cuestionario.value)
  }
  return Promise.resolve({ ok: true })
}

// Lo mismo que se manda a corregir y al PDF: ids de las preguntas en orden, lo elegido
// y el orden en que se mostraron las opciones (para que la revisión y el PDF las muestren igual)
const pedidoCorreccion = (seleccion) => ({
  idioma: cuestionario.value.idioma,
  preguntas: cuestionario.value.preguntas.map(p => p.id),
  seleccion,
  orden: Object.fromEntries(Object.entries(cuestionario.value.opciones).map(([id, ops]) => [id, ops.map(o => o.id)]))
})

const corregir = async ({ seleccion }) => {
  const res = await api.post({ entity: ENTIDAD, action: 'corregirCuestionarioPublico', payload: pedidoCorreccion(seleccion) })
  if (!res?.ok) throw new Error(res?.message || textosIdioma(cuestionario.value.idioma).errorCorregir)
  cuestionario.value = { ...cuestionario.value, seleccion }
  return res.payload
}

// Ya corregido: no se ofrece "Continuar", pero el cuestionario queda en memoria para el PDF
const alFinalizar = () => escribirGuardado(null)

const empezarOtra = () => {
  runnerAbierto.value = false
  cuestionario.value = null
  window.scrollTo({ top: 0 })
}

// Al salir de la pantalla de resultado ("Volver") también se descarta el cuestionario corregido
watch(runnerAbierto, (abierto) => {
  if (!abierto && cuestionario.value && !leerGuardado()) cuestionario.value = null
})

// ============ PDF ============
const descargandoPdf = ref(false)

const descargarPdf = async () => {
  const textos = textosIdioma(cuestionario.value.idioma)
  descargandoPdf.value = true
  try {
    await api.getFile({
      entity: ENTIDAD,
      action: 'pdfCuestionarioPublico',
      payload: pedidoCorreccion(cuestionario.value.seleccion)
    }, textos.archivoPdf)
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message || textos.errorPdf, tipo: 'danger' })
  } finally {
    descargandoPdf.value = false
  }
}

onMounted(() => {
  cuestionario.value = leerGuardado()
  if (cuestionario.value) formulario.idioma = cuestionario.value.idioma
  cargarReglas()
})
</script>

<style scoped>
.fondo-catalogo {
  background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('../../assets/fotos/descargas-background.webp');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
}

.tarjeta-catalogo {
  max-width: 640px;
  border-radius: 16px;
}

.aviso-en-curso {
  background: var(--o-ambar-fondo, #fffbeb);
  border-color: var(--o-ambar-borde, #fcd34d) !important;
}
</style>
