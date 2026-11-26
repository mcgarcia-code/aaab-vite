<template>
  <ModalBase
    :show="show"
    :titulo="tituloModal"
    :icono="pregunta ? 'bi-pencil-square' : 'bi-plus-circle'"
    max-width="960px"
    :hay-cambios="hayCambios"
    @close="cerrar"
  >
    <EstadoCargando v-if="cargando" texto="Cargando la pregunta" />

    <div v-else-if="errorCarga" class="text-center py-4">
      <i class="bi bi-exclamation-triangle-fill fs-1 text-warning d-block mb-2"></i>
      <p class="fw-bold text-dark mb-3">{{ errorCarga }}</p>
      <button type="button" class="btn btn-danger rounded-pill px-4 fw-bold" @click="cargar">
        <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
      </button>
    </div>

    <template v-else>
      <!-- ============ PREGUNTA ============ -->
      <form class="mb-4" novalidate @submit.prevent="guardarDatosPregunta">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
          <h6 class="fw-bold text-dark m-0 me-auto">Pregunta</h6>
          <span v-if="pregunta?.excluidaExamenes" class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis" title="Está en la lista de preguntas que no se toman en los exámenes online">
            <i class="bi bi-slash-circle me-1"></i>Excluida de exámenes
          </span>
        </div>

        <div class="row g-3">
          <div class="col-6 col-md-3">
            <label for="catalogo-regla" class="form-label small fw-bold text-dark">Regla</label>
            <input id="catalogo-regla" v-model.trim="formPregunta.codigo" class="form-control shadow-none" maxlength="10" placeholder="Ej: 8" inputmode="text">
          </div>
          <div class="col-6 col-md-3">
            <label for="catalogo-numero" class="form-label small fw-bold text-dark">N° de pregunta</label>
            <input id="catalogo-numero" v-model.trim="formPregunta.subcodigo" class="form-control shadow-none" inputmode="numeric" placeholder="Automático">
          </div>
          <div class="col-12 col-md-6 d-flex align-items-end">
            <small class="text-muted">Si dejás el número vacío se asigna el siguiente de la regla.</small>
          </div>

          <div class="col-12 col-md-6">
            <label for="catalogo-texto" class="form-label small fw-bold text-dark">Texto en español <span class="text-danger">*</span></label>
            <textarea id="catalogo-texto" v-model="formPregunta.texto" class="form-control shadow-none" rows="5" maxlength="5000"></textarea>
          </div>
          <div class="col-12 col-md-6">
            <label for="catalogo-texto-en" class="form-label small fw-bold text-dark">Texto en inglés</label>
            <textarea id="catalogo-texto-en" v-model="formPregunta.textoEn" class="form-control shadow-none" rows="5" maxlength="5000"></textarea>
          </div>
        </div>

        <p v-if="errorPregunta" class="text-danger small fw-bold mt-2 mb-0"><i class="bi bi-exclamation-circle me-1"></i>{{ errorPregunta }}</p>

        <div class="d-flex justify-content-end mt-3">
          <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold w-100 w-sm-auto" :disabled="guardandoPregunta || (pregunta && !preguntaModificada)">
            <span v-if="guardandoPregunta" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            <i v-else class="bi bi-save me-2"></i>{{ pregunta ? 'Guardar pregunta' : 'Crear pregunta' }}
          </button>
        </div>
      </form>

      <!-- ============ RESPUESTAS ============ -->
      <section class="border-top pt-3">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
          <h6 class="fw-bold text-dark m-0 me-auto">Respuestas <span v-if="pregunta" class="text-muted fw-normal">({{ pregunta.respuestas.length }})</span></h6>
          <small v-if="pregunta" class="text-muted">Puede haber más de una correcta.</small>
        </div>

        <p v-if="!pregunta" class="text-muted small mb-0">
          <i class="bi bi-info-circle me-1"></i>Creá la pregunta para poder cargarle las respuestas.
        </p>

        <template v-else>
          <div v-if="!cantidadCorrectas" class="alert alert-warning py-2 px-3 small fw-semibold">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ AVISO_SIN_CORRECTA }}
          </div>

          <div class="d-flex flex-column gap-2 mb-3">
            <div v-for="r in pregunta.respuestas" :key="r.id" class="respuesta-item rounded-3 border p-2 p-md-3" :class="{ correcta: r.esCorrecta }">
              <!-- Edición en línea -->
              <form v-if="editando?.id === r.id" novalidate @submit.prevent="guardarEdicion">
                <div class="row g-2">
                  <div class="col-12 col-md-6">
                    <label :for="'resp-es-' + r.id" class="form-label small fw-bold text-dark mb-1">Español <span class="text-danger">*</span></label>
                    <textarea :id="'resp-es-' + r.id" v-model="editando.texto" class="form-control form-control-sm shadow-none" rows="2" maxlength="2000"></textarea>
                  </div>
                  <div class="col-12 col-md-6">
                    <label :for="'resp-en-' + r.id" class="form-label small fw-bold text-dark mb-1">Inglés</label>
                    <textarea :id="'resp-en-' + r.id" v-model="editando.textoEn" class="form-control form-control-sm shadow-none" rows="2" maxlength="2000"></textarea>
                  </div>
                </div>
                <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-2 mt-2">
                  <div class="form-check form-switch m-0 me-sm-auto">
                    <input :id="'resp-ok-' + r.id" v-model="editando.esCorrecta" class="form-check-input shadow-none" type="checkbox" role="switch">
                    <label :for="'resp-ok-' + r.id" class="form-check-label small fw-bold text-dark">Correcta</label>
                  </div>
                  <button type="button" class="btn btn-light border btn-sm rounded-pill px-3 fw-bold" :disabled="guardandoRespuesta" @click="editando = null">Cancelar</button>
                  <button type="submit" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold" :disabled="guardandoRespuesta">
                    <span v-if="guardandoRespuesta" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Guardar
                  </button>
                </div>
              </form>

              <!-- Vista -->
              <div v-else class="d-flex align-items-start gap-2">
                <span class="fw-bold text-danger mt-1 flex-shrink-0">{{ r.opcion }})</span>
                <div class="flex-grow-1 min-w-0 small">
                  <div class="text-dark text-break">{{ r.texto }}</div>
                  <div class="text-break mt-1" :class="r.textoEn ? 'text-muted fst-italic' : 'text-warning-emphasis'">
                    <span class="badge bg-light text-dark border me-1">EN</span>{{ r.textoEn || 'Sin traducción' }}
                  </div>
                </div>
                <div class="d-flex flex-column flex-sm-row align-items-end align-items-sm-center gap-1 flex-shrink-0">
                  <button type="button" class="btn btn-sm rounded-pill fw-bold text-nowrap" :class="r.esCorrecta ? 'btn-success' : 'btn-light border'"
                          :disabled="guardandoRespuesta" :title="r.esCorrecta ? 'Marcar como incorrecta' : 'Marcar como correcta'" @click="alternarCorrecta(r)">
                    <i class="bi me-1" :class="r.esCorrecta ? 'bi-check-circle-fill' : 'bi-circle'"></i>{{ r.esCorrecta ? 'Correcta' : 'Incorrecta' }}
                  </button>
                  <div class="d-flex gap-1">
                    <button type="button" class="btn btn-sm btn-light border" title="Editar respuesta" aria-label="Editar respuesta" :disabled="guardandoRespuesta" @click="empezarEdicion(r)">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-light border text-danger" title="Borrar respuesta" aria-label="Borrar respuesta" :disabled="guardandoRespuesta" @click="confirmarBorrarRespuesta(r)">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p v-if="!pregunta.respuestas.length" class="text-muted small text-center py-2 mb-0">Todavía no tiene respuestas.</p>
          </div>

          <!-- Nueva respuesta -->
          <form class="nueva-respuesta rounded-3 border p-2 p-md-3" novalidate @submit.prevent="agregarRespuesta">
            <div class="small fw-bold text-dark mb-2"><i class="bi bi-plus-circle text-danger me-1"></i>Agregar respuesta</div>
            <div class="row g-2">
              <div class="col-12 col-md-6">
                <label for="nueva-resp-es" class="form-label small fw-bold text-dark mb-1">Español <span class="text-danger">*</span></label>
                <textarea id="nueva-resp-es" v-model="nueva.texto" class="form-control form-control-sm shadow-none" rows="2" maxlength="2000"></textarea>
              </div>
              <div class="col-12 col-md-6">
                <label for="nueva-resp-en" class="form-label small fw-bold text-dark mb-1">Inglés</label>
                <textarea id="nueva-resp-en" v-model="nueva.textoEn" class="form-control form-control-sm shadow-none" rows="2" maxlength="2000"></textarea>
              </div>
            </div>
            <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-2 mt-2">
              <div class="form-check form-switch m-0 me-sm-auto">
                <input id="nueva-resp-ok" v-model="nueva.esCorrecta" class="form-check-input shadow-none" type="checkbox" role="switch">
                <label for="nueva-resp-ok" class="form-check-label small fw-bold text-dark">Es correcta</label>
              </div>
              <button type="submit" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold" :disabled="guardandoRespuesta">
                <span v-if="guardandoRespuesta" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                <i v-else class="bi bi-plus-lg me-1"></i>Agregar
              </button>
            </div>
          </form>

          <p v-if="errorRespuesta" class="text-danger small fw-bold mt-2 mb-0"><i class="bi bi-exclamation-circle me-1"></i>{{ errorRespuesta }}</p>
        </template>
      </section>
    </template>

    <template #footer="{ cerrar: cerrarModal }">
      <button type="button" class="btn btn-light border rounded-pill px-4 fw-bold" @click="cerrarModal">Cerrar</button>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref, reactive, computed, watch, inject } from 'vue'
import ModalBase from '@/components/ModalBase.vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import { useCatalogoAdmin, codigoCompleto, AVISO_SIN_CORRECTA } from '@/composables/useCatalogoAdmin'

const props = defineProps({
  show: { type: Boolean, default: false },
  idPregunta: { type: Number, default: null },   // null = pregunta nueva
  reglaInicial: { type: String, default: '' }    // regla sugerida para una pregunta nueva
})
// cambio: se guardó o borró algo (la lista de atrás se tiene que recargar al cerrar)
const emit = defineEmits(['close', 'cambio'])

const notificar = inject('notificar')
const { obtenerPregunta, guardarPregunta, guardarRespuesta, borrarRespuesta } = useCatalogoAdmin()

const pregunta = ref(null)           // la pregunta guardada (con respuestas) o null si es nueva
const cargando = ref(false)
const errorCarga = ref('')

const formPregunta = reactive({ codigo: '', subcodigo: '', texto: '', textoEn: '' })
const guardandoPregunta = ref(false)
const errorPregunta = ref('')

const editando = ref(null)           // copia de la respuesta que se edita en línea
const nueva = reactive({ texto: '', textoEn: '', esCorrecta: false })
const guardandoRespuesta = ref(false)
const errorRespuesta = ref('')

const tituloModal = computed(() => pregunta.value ? `Pregunta ${codigoCompleto(pregunta.value)}` : 'Nueva pregunta')
const cantidadCorrectas = computed(() => (pregunta.value?.respuestas || []).filter(r => r.esCorrecta).length)

const valoresPregunta = (p) => ({
  codigo: String(p?.codigo ?? ''),
  subcodigo: p?.subcodigo !== null && p?.subcodigo !== undefined ? String(p.subcodigo) : '',
  texto: p?.texto || '',
  textoEn: p?.textoEn || ''
})

const preguntaModificada = computed(() => {
  const original = valoresPregunta(pregunta.value)
  return Object.keys(original).some(clave => String(formPregunta[clave] ?? '').trim() !== original[clave].trim())
})

const hayCambios = computed(() =>
  (pregunta.value ? preguntaModificada.value : !!(formPregunta.texto.trim() || formPregunta.textoEn.trim())) ||
  !!(nueva.texto.trim() || nueva.textoEn.trim()) ||
  !!editando.value
)

const mostrarPregunta = (datos) => {
  pregunta.value = datos
  Object.assign(formPregunta, valoresPregunta(datos))
}

const limpiar = () => {
  pregunta.value = null
  errorCarga.value = ''
  errorPregunta.value = ''
  errorRespuesta.value = ''
  editando.value = null
  Object.assign(formPregunta, { codigo: props.reglaInicial || '', subcodigo: '', texto: '', textoEn: '' })
  Object.assign(nueva, { texto: '', textoEn: '', esCorrecta: false })
}

const cargar = async () => {
  if (!props.idPregunta) return
  cargando.value = true
  errorCarga.value = ''
  try {
    mostrarPregunta(await obtenerPregunta(props.idPregunta))
  } catch (e) {
    errorCarga.value = e.message
  } finally {
    cargando.value = false
  }
}

watch(() => props.show, (abierto) => {
  if (!abierto) return
  limpiar()
  cargar()
}, { immediate: true })

const cerrar = () => emit('close')

// ============ PREGUNTA ============
const validarPregunta = () => {
  if (!formPregunta.codigo) return 'Indicá la regla.'
  if (!/^[A-Za-z0-9]{1,10}$/.test(formPregunta.codigo)) return 'La regla solo puede tener letras y números.'
  if (formPregunta.subcodigo && !/^[1-9]\d*$/.test(formPregunta.subcodigo)) return 'El número de pregunta tiene que ser un entero mayor a 0.'
  if (!formPregunta.texto.trim()) return 'Escribí el texto de la pregunta en español.'
  return ''
}

const guardarDatosPregunta = async () => {
  errorPregunta.value = validarPregunta()
  if (errorPregunta.value) return
  guardandoPregunta.value = true
  try {
    mostrarPregunta(await guardarPregunta({ id: pregunta.value?.id, ...formPregunta }))
    emit('cambio')
  } catch (e) {
    errorPregunta.value = e.message
  } finally {
    guardandoPregunta.value = false
  }
}

// ============ RESPUESTAS ============
const enviarRespuesta = async (datos) => {
  errorRespuesta.value = ''
  guardandoRespuesta.value = true
  try {
    mostrarPreguntaSinPisarFormulario(await guardarRespuesta({ idPregunta: pregunta.value.id, ...datos }))
    emit('cambio')
    return true
  } catch (e) {
    errorRespuesta.value = e.message
    return false
  } finally {
    guardandoRespuesta.value = false
  }
}

// Al guardar una respuesta se actualiza la lista sin perder lo que se esté escribiendo en la pregunta
const mostrarPreguntaSinPisarFormulario = (datos) => {
  pregunta.value = datos
}

const agregarRespuesta = async () => {
  if (!nueva.texto.trim()) {
    errorRespuesta.value = 'Escribí el texto de la respuesta en español.'
    return
  }
  if (await enviarRespuesta({ ...nueva })) Object.assign(nueva, { texto: '', textoEn: '', esCorrecta: false })
}

const empezarEdicion = (respuesta) => {
  errorRespuesta.value = ''
  editando.value = { ...respuesta }
}

const guardarEdicion = async () => {
  if (!editando.value.texto.trim()) {
    errorRespuesta.value = 'Escribí el texto de la respuesta en español.'
    return
  }
  if (await enviarRespuesta({ ...editando.value })) editando.value = null
}

const alternarCorrecta = (respuesta) => enviarRespuesta({ ...respuesta, esCorrecta: !respuesta.esCorrecta })

const confirmarBorrarRespuesta = (respuesta) => {
  notificar({
    titulo: '¿Borrar la respuesta?',
    mensaje: `Se borra la opción ${respuesta.opcion}) de esta pregunta. Los exámenes y prácticas ya rendidos no cambian.`,
    tipo: 'danger',
    alConfirmar: async () => {
      errorRespuesta.value = ''
      guardandoRespuesta.value = true
      try {
        mostrarPreguntaSinPisarFormulario(await borrarRespuesta(respuesta.id))
        if (editando.value?.id === respuesta.id) editando.value = null
        emit('cambio')
      } catch (e) {
        errorRespuesta.value = e.message
      } finally {
        guardandoRespuesta.value = false
      }
    }
  })
}
</script>

<style scoped>
.min-w-0 { min-width: 0; }
.respuesta-item { background: var(--o-chip, #f8fafc); }
.respuesta-item.correcta {
  background: var(--o-verde-fondo, #f0fdf4);
  border-color: var(--o-verde-borde, #86efac) !important;
}
.nueva-respuesta { border-style: dashed !important; }
</style>
