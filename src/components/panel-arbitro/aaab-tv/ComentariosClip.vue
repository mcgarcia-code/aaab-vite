<template>
  <section class="comentarios" aria-labelledby="titulo-comentarios">
    <h3 id="titulo-comentarios" class="titulo">
      <i class="bi bi-chat-left-text" aria-hidden="true"></i> Comentarios
      <span v-if="comentarios.length" class="badge rounded-pill cantidad">{{ comentarios.length }}</span>
    </h3>

    <div v-if="cargando" class="small text-muted py-2">
      <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Cargando comentarios...
    </div>
    <p v-else-if="error" class="small text-danger mb-2" role="alert">{{ error }}</p>
    <p v-else-if="!comentarios.length" class="small text-muted mb-2">Todavía no hay comentarios.</p>

    <ul v-else class="list-unstyled m-0 lista">
      <li v-for="c in comentarios" :key="c.id" class="comentario" :class="{ coordinacion: c.esCoordinacion }">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <strong class="autor">{{ c.autor || 'Usuario' }}</strong>
          <span v-if="c.esCoordinacion" class="badge-coordinacion">Coordinación</span>
          <!-- Comentario sobre un momento del clip: lleva el video ahí -->
          <button v-if="tieneMomento(c)" type="button" class="btn btn-sm momento-comentario"
                  :aria-label="`Ir al ${formatearTiempo(c.segundo)} del clip`" @click="emit('ir-a', c.segundo)">
            <i class="bi bi-play-fill" aria-hidden="true"></i> {{ formatearTiempo(c.segundo) }}
          </button>
          <span class="fecha">{{ fechaHora(c.creadoEl) }}</span>
          <button v-if="puedeBorrar(c)" type="button" class="btn btn-link btn-sm text-danger p-0 ms-auto"
                  :disabled="borrandoId === c.id" :aria-label="`Borrar el comentario de ${c.autor || 'usuario'}`" @click="borrar(c)">
            <i class="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </div>
        <p class="texto texto-pre-line">{{ c.texto }}</p>
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
import { ref, watch, inject } from 'vue'
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
    comentarios.value = comentarios.value.filter(x => x.id !== c.id)
  } finally {
    borrandoId.value = null
  }
}

watch(() => props.idClip, () => {
  texto.value = ''
  intento.value = false
  enEsteMomento.value = false
  cargar()
}, { immediate: true })
</script>

<style scoped>
.comentarios {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--o-borde, #e2e8f0);
}
.titulo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--o-texto, #0f172a);
  margin-bottom: 8px;
}
.cantidad { background: var(--o-chip, #e2e8f0); color: var(--o-texto, #0f172a); }
.lista { display: flex; flex-direction: column; gap: 8px; }
.comentario {
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--o-fondo-suave, #f8fafc);
  border: 1px solid var(--o-borde, #e2e8f0);
}
.comentario.coordinacion { border-left: 4px solid #dc2626; }
.autor { font-size: 0.8rem; color: var(--o-texto, #0f172a); }
.fecha { font-size: 0.75rem; color: var(--o-texto-suave, #64748b); }
.badge-coordinacion {
  padding: 1px 8px;
  border-radius: 50rem;
  background: #dc2626;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
}
.texto { font-size: 0.85rem; color: var(--o-texto, #0f172a); margin: 4px 0 0; }
.momento-comentario {
  padding: 0 8px;
  border-radius: 50rem;
  border: 1px solid #0891b2;
  color: #0e7490;
  font-size: 0.72rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.6;
}
</style>
