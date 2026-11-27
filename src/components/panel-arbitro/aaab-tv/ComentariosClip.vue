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
          <span class="fecha">{{ fechaHora(c.creadoEl) }}</span>
          <button v-if="puedeBorrar(c)" type="button" class="btn btn-link btn-sm text-danger p-0 ms-auto"
                  :disabled="borrandoId === c.id" :aria-label="`Borrar el comentario de ${c.autor || 'usuario'}`" @click="borrar(c)">
            <i class="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </div>
        <p class="texto texto-pre-line">{{ c.texto }}</p>
      </li>
    </ul>

    <form class="mt-2" novalidate @submit.prevent="enviar">
      <label :for="`comentario-${idClip}`" class="visually-hidden">Escribir un comentario</label>
      <textarea :id="`comentario-${idClip}`" v-model="texto" rows="2" maxlength="1000" class="form-control form-control-sm"
                :class="{ 'is-invalid': intento && !texto.trim() }" placeholder="Escribí un comentario"></textarea>
      <div class="invalid-feedback">Escribí algo para comentar.</div>
      <div class="d-flex justify-content-end mt-2">
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
import { auth } from '@/api/auth'
import { useAaabTv } from '@/composables/useAaabTv'

// Comentarios de un clip. Los ve y escribe todo el que ve el clip; el coordinador general
// (moderar = true) además puede borrar cualquiera. Cada uno puede borrar los suyos.
const props = defineProps({
  idClip: { type: [String, Number], required: true },
  moderar: { type: Boolean, default: false }
})

const toast = inject('toast')
const { listarComentarios, agregarComentario, borrarComentario } = useAaabTv()
const usuario = auth.getUser() || {}

const comentarios = ref([])
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

const puedeBorrar = (c) => props.moderar || (c.idAutor !== null && String(c.idAutor) === String(usuario.id))

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
    const res = await agregarComentario(props.idClip, texto.value)
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo comentar', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    comentarios.value = [...comentarios.value, res.payload]
    texto.value = ''
    intento.value = false
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
</style>
