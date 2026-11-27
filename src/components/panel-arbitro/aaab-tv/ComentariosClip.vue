<template>
  <section class="border-top pt-3 mt-3" aria-labelledby="titulo-comentarios">
    <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-2 border-danger">
      <h6 id="titulo-comentarios" class="fw-bold m-0 text-dark text-uppercase d-flex align-items-center gap-2">
        <i class="bi bi-chat-left-text text-danger fs-5" aria-hidden="true"></i> Comentarios
      </h6>
      <span v-if="comentarios.length" class="badge rounded-pill bg-dark">{{ comentarios.length }}</span>
    </div>

    <div v-if="cargando" class="small text-muted py-2">
      <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Cargando comentarios...
    </div>
    <p v-else-if="error" class="small text-danger mb-2" role="alert">{{ error }}</p>
    <p v-else-if="!comentarios.length" class="small text-muted mb-2">Todavía no hay comentarios.</p>

    <ul v-else class="list-unstyled m-0 d-flex flex-column gap-2">
      <!-- Cada comentario con sus respuestas debajo (un solo nivel) -->
      <li v-for="c in principales" :key="c.id" class="d-flex flex-column gap-2">
        <div class="card card-body shadow-sm border-light-subtle rounded-3 py-2 px-3" :class="{ 'border-start border-danger border-4': c.esCoordinacion }">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <strong class="small text-dark">{{ c.autor || 'Usuario' }}</strong>
            <span v-if="c.esCoordinacion" class="estado-pill estado-rojo">Coordinación</span>
            <!-- Comentario sobre un momento del clip: lleva el video ahí -->
            <button v-if="tieneMomento(c)" type="button" class="btn btn-sm btn-outline-info rounded-pill py-0 px-2 fw-bold texto-075"
                    :aria-label="`Ir al ${formatearTiempo(c.segundo)} del clip`" @click="emit('ir-a', c.segundo)">
              <i class="bi bi-play-fill" aria-hidden="true"></i> {{ formatearTiempo(c.segundo) }}
            </button>
            <span class="texto-075 text-muted">{{ fechaHora(c.creadoEl) }}</span>
            <button v-if="puedeBorrar(c)" type="button" class="btn btn-link btn-sm text-danger p-0 ms-auto"
                    :disabled="borrandoId === c.id" :aria-label="`Borrar el comentario de ${c.autor || 'usuario'}`" @click="borrar(c)">
              <i class="bi bi-trash3" aria-hidden="true"></i>
            </button>
          </div>
          <p class="small text-dark texto-pre-line mt-1 mb-0">{{ c.texto }}</p>
          <button v-if="puedeComentar && respondiendoA !== c.id" type="button" class="btn btn-link btn-sm p-0 mt-1 fw-bold text-secondary text-decoration-none texto-075 align-self-start"
                  @click="abrirRespuesta(c)">
            <i class="bi bi-reply" aria-hidden="true"></i> Responder
          </button>
        </div>

        <ul v-if="respuestasDe(c.id).length || respondiendoA === c.id" class="list-unstyled m-0 ms-3 ps-2 border-start border-2 d-flex flex-column gap-2">
          <li v-for="r in respuestasDe(c.id)" :key="r.id" class="card card-body shadow-sm border-light-subtle rounded-3 py-2 px-3" :class="{ 'border-start border-danger border-4': r.esCoordinacion }">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <strong class="small text-dark">{{ r.autor || 'Usuario' }}</strong>
              <span v-if="r.esCoordinacion" class="estado-pill estado-rojo">Coordinación</span>
              <span class="texto-075 text-muted">{{ fechaHora(r.creadoEl) }}</span>
              <button v-if="puedeBorrar(r)" type="button" class="btn btn-link btn-sm text-danger p-0 ms-auto"
                      :disabled="borrandoId === r.id" :aria-label="`Borrar la respuesta de ${r.autor || 'usuario'}`" @click="borrar(r)">
                <i class="bi bi-trash3" aria-hidden="true"></i>
              </button>
            </div>
            <p class="small text-dark texto-pre-line mt-1 mb-0">{{ r.texto }}</p>
          </li>
          <!-- Responder a este comentario -->
          <li v-if="respondiendoA === c.id">
            <form novalidate @submit.prevent="enviarRespuesta(c)">
              <label :for="`respuesta-${c.id}`" class="visually-hidden">Responder a {{ c.autor || 'este comentario' }}</label>
              <textarea :id="`respuesta-${c.id}`" v-model="textoRespuesta" rows="2" maxlength="1000" class="form-control form-control-sm"
                        :class="{ 'is-invalid': intentoRespuesta && !textoRespuesta.trim() }" :placeholder="`Responder a ${c.autor || 'este comentario'}`"></textarea>
              <div class="invalid-feedback">Escribí la respuesta.</div>
              <div class="d-flex justify-content-end gap-2 mt-1">
                <button type="button" class="btn btn-sm btn-light border" @click="respondiendoA = null">Cancelar</button>
                <button type="submit" class="btn btn-sm btn-dark fw-bold" :disabled="enviando">
                  <span v-if="enviando" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Responder
                </button>
              </div>
            </form>
          </li>
        </ul>
      </li>
    </ul>

    <p v-if="!puedeComentar" class="small text-muted mt-2 mb-0">
      <i class="bi bi-lock" aria-hidden="true"></i> Comentan observadores, coordinadores y la coordinación general.
    </p>
    <form v-else class="mt-2" novalidate @submit.prevent="enviar">
      <label :for="`comentario-${idClip}`" class="visually-hidden">Escribir un comentario</label>
      <textarea :id="`comentario-${idClip}`" v-model="texto" rows="2" maxlength="1000" class="form-control form-control-sm"
                :class="{ 'is-invalid': intento && !texto.trim() }" placeholder="Escribí un comentario"></textarea>
      <div class="invalid-feedback">Escribí algo para comentar.</div>
      <div class="d-flex flex-wrap align-items-center justify-content-end gap-2 mt-2">
        <div v-if="posicionActual !== null" class="form-check m-0 me-auto">
          <input :id="`comentario-momento-${idClip}`" v-model="enEsteMomento" type="checkbox" class="form-check-input">
          <label :for="`comentario-momento-${idClip}`" class="form-check-label small">
            Sobre el momento {{ formatearTiempo(posicionActual) }} del clip
          </label>
        </div>
        <button type="submit" class="btn btn-sm btn-dark rounded-pill fw-bold px-3" :disabled="enviando">
          <span v-if="enviando" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
          Comentar
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useAaabTv, formatearTiempo } from '@/composables/useAaabTv'
import { esUsuarioActual, esRolPublicador } from '@/api/aaabTvClips'

// Comentarios de un clip. Los lee todo el que ve el clip; los escriben solo observadores,
// coordinadores, el coordinador general y el admin (los mismos que publican). El coordinador
// general (moderar = true) además puede borrar cualquiera. Cada uno puede borrar los suyos.
// Un comentario puede referirse a un momento del clip (segundo): posicionActual es dónde está
// el reproductor; "ir-a" pide llevar el video a un momento; "cambiaron" avisa la lista (para las
// marcas en la barra del reproductor).
const props = defineProps({
  idClip: { type: [String, Number], required: true },
  moderar: { type: Boolean, default: false },
  posicionActual: { type: Number, default: null }
})
const emit = defineEmits(['ir-a', 'cambiaron'])

const toast = inject('toast')
const { listarComentarios, agregarComentario, borrarComentario } = useAaabTv()

const comentarios = ref([])
// Cada cambio de la lista se avisa (el reproductor muestra una marca por comentario con momento)
watch(comentarios, (lista) => emit('cambiaron', lista))
const enEsteMomento = ref(false)
const tieneMomento = (c) => c.segundo !== null && c.segundo !== undefined

// Hilos: los comentarios sin idPadre, cada uno con sus respuestas en orden
const principales = computed(() => comentarios.value.filter(c => !c.idPadre))
const respuestasDe = (id) => comentarios.value.filter(c => c.idPadre !== null && c.idPadre !== undefined && String(c.idPadre) === String(id))

const respondiendoA = ref(null)
const textoRespuesta = ref('')
const intentoRespuesta = ref(false)

const abrirRespuesta = (comentario) => {
  respondiendoA.value = comentario.id
  textoRespuesta.value = ''
  intentoRespuesta.value = false
}

const enviarRespuesta = async (comentario) => {
  intentoRespuesta.value = true
  if (!textoRespuesta.value.trim() || enviando.value) return
  enviando.value = true
  try {
    const res = await agregarComentario(props.idClip, textoRespuesta.value, null, comentario.id)
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo responder', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    comentarios.value = [...comentarios.value, res.payload]
    respondiendoA.value = null
  } finally {
    enviando.value = false
  }
}
const cargando = ref(false)
const error = ref('')
const texto = ref('')
const intento = ref(false)
const enviando = ref(false)
const borrandoId = ref(null)

const fechaHora = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

const puedeComentar = esRolPublicador()
// Autor = mismo id y mismo tipo de usuario (un árbitro y una autoridad pueden compartir id)
const puedeBorrar = (c) => props.moderar || esUsuarioActual(c.idAutor, c.tipoAutor)

const cargar = async () => {
  cargando.value = true
  error.value = ''
  try {
    const res = await listarComentarios(props.idClip)
    if (res?.ok) comentarios.value = res.payload
    else error.value = res?.message || 'No se pudieron cargar los comentarios.'
  } finally {
    cargando.value = false
  }
}

const enviar = async () => {
  intento.value = true
  if (!texto.value.trim() || enviando.value) return
  enviando.value = true
  try {
    const segundo = enEsteMomento.value && props.posicionActual !== null
      ? Math.round(props.posicionActual * 10) / 10
      : null
    const res = await agregarComentario(props.idClip, texto.value, segundo)
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo comentar', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    comentarios.value = [...comentarios.value, res.payload]
    texto.value = ''
    intento.value = false
    enEsteMomento.value = false
  } finally {
    enviando.value = false
  }
}

const borrar = async (c) => {
  borrandoId.value = c.id
  try {
    const res = await borrarComentario(c.id)
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo borrar', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    // Se van también sus respuestas
    comentarios.value = comentarios.value.filter(x => x.id !== c.id && String(x.idPadre) !== String(c.id))
  } finally {
    borrandoId.value = null
  }
}

watch(() => props.idClip, () => {
  texto.value = ''
  intento.value = false
  enEsteMomento.value = false
  respondiendoA.value = null
  cargar()
}, { immediate: true })
</script>

