<template>
  <div>
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
      <p class="small text-muted m-0">
        <i class="bi bi-info-circle" aria-hidden="true"></i>
        Las colecciones oficiales agrupan clips de un canal (por ejemplo, "Criterios 2026 · Juego pasivo").
        Las ve todo el que entra a ese canal, en el orden que elijas.
      </p>
      <button type="button" class="btn btn-danger rounded-pill fw-bold flex-shrink-0" @click="abrir(null)">
        <i class="bi bi-plus-lg" aria-hidden="true"></i> Nueva colección
      </button>
    </div>

    <EstadoVacio v-if="!coleccionesAdmin.length" icono="bi-bookmark-star" titulo="Todavía no hay colecciones"
                 mensaje="Creá la primera con “Nueva colección”." />
    <ul v-else class="list-unstyled m-0 d-flex flex-column gap-2">
      <li v-for="c in coleccionesAdmin" :key="c.id" class="fila">
        <div class="flex-grow-1 min-w-0">
          <div class="fw-bold text-truncate">{{ c.nombre }}</div>
          <div class="small text-muted">
            <i :class="['bi', c.idGrupo === null ? 'bi-globe2' : 'bi-people-fill']" aria-hidden="true"></i> {{ c.nombreCanal }}
            · {{ c.idsClips.length }} {{ c.idsClips.length === 1 ? 'clip' : 'clips' }}
          </div>
          <div v-if="c.descripcion" class="small text-muted text-truncate">{{ c.descripcion }}</div>
        </div>
        <div class="d-flex gap-1">
          <button type="button" class="btn btn-sm btn-light border fw-bold" @click="abrir(c)">
            <i class="bi bi-pencil-square" aria-hidden="true"></i> Editar
          </button>
          <button type="button" class="btn btn-sm btn-light border text-danger" :aria-label="`Borrar ${c.nombre}`" @click="confirmarBorrar(c)">
            <i class="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </div>
      </li>
    </ul>

    <!-- ============ NUEVA / EDITAR ============ -->
    <ModalBase :show="mostrar" :titulo="form.id ? 'Editar colección' : 'Nueva colección'" icono="bi-bookmark-star"
               color-icono="bg-danger-subtle text-danger" max-width="820px" :hay-cambios="hayCambios" @close="mostrar = false">
      <form id="form-coleccion" novalidate @submit.prevent="guardar">
        <div class="row g-2">
          <div class="col-12 col-md-7">
            <label for="col-nombre" class="form-label small fw-bold">Nombre *</label>
            <input id="col-nombre" v-model="form.nombre" type="text" maxlength="80" class="form-control"
                   :class="{ 'is-invalid': intento && !form.nombre.trim() }" placeholder="Ej: Criterios 2026 · Juego pasivo">
            <div class="invalid-feedback">La colección necesita un nombre.</div>
          </div>
          <div class="col-12 col-md-5">
            <label for="col-canal" class="form-label small fw-bold">Canal *</label>
            <select id="col-canal" v-model="form.canal" class="form-select">
              <option v-for="c in opcionesCanal" :key="c.clave" :value="c.clave">{{ c.nombre }}</option>
            </select>
          </div>
          <div class="col-12">
            <label for="col-desc" class="form-label small fw-bold">Descripción</label>
            <input id="col-desc" v-model="form.descripcion" type="text" maxlength="200" class="form-control" placeholder="Para qué sirve esta colección">
          </div>
        </div>

        <!-- Clips elegidos, en orden -->
        <h3 class="subtitulo mt-3">Clips de la colección ({{ form.idsClips.length }})</h3>
        <p v-if="intento && !form.idsClips.length" class="small text-danger mb-2" role="alert">Agregá al menos un clip.</p>
        <p v-else-if="!form.idsClips.length" class="small text-muted mb-2">Agregalos desde la lista de abajo.</p>
        <ol v-else class="list-unstyled m-0 d-flex flex-column gap-1 mb-2">
          <li v-for="(id, i) in form.idsClips" :key="id" class="elegido">
            <span class="numero">{{ i + 1 }}</span>
            <span class="flex-grow-1 min-w-0 text-truncate small fw-semibold">{{ tituloDe(id) }}</span>
            <button type="button" class="btn btn-sm btn-light border" :disabled="i === 0" :aria-label="`Subir ${tituloDe(id)}`" @click="mover(i, -1)">
              <i class="bi bi-arrow-up" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn-sm btn-light border" :disabled="i === form.idsClips.length - 1" :aria-label="`Bajar ${tituloDe(id)}`" @click="mover(i, 1)">
              <i class="bi bi-arrow-down" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn-sm btn-light border text-danger" :aria-label="`Quitar ${tituloDe(id)}`" @click="quitar(id)">
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </li>
        </ol>

        <!-- Clips disponibles: autorizados en el canal elegido -->
        <h3 class="subtitulo mt-3">Agregar clips autorizados en {{ nombreCanalElegido }}</h3>
        <input v-model="busqueda" type="search" class="form-control form-control-sm mb-2" aria-label="Buscar clips para agregar" placeholder="Buscar por título, situación o partido">
        <p v-if="!disponibles.length" class="small text-muted m-0">No hay más clips autorizados en este canal.</p>
        <ul v-else class="list-unstyled m-0 disponibles">
          <li v-for="c in disponibles" :key="c.id" class="disponible">
            <span class="flex-grow-1 min-w-0">
              <span class="d-block small fw-semibold text-truncate">{{ c.titulo }}</span>
              <span class="d-block small text-muted text-truncate">{{ c.etiqueta }} · {{ c.partido || 'Video externo' }} · {{ fechaArg(c.fecha) }}</span>
            </span>
            <button type="button" class="btn btn-sm btn-dark fw-bold flex-shrink-0" @click="form.idsClips = [...form.idsClips, c.id]">
              <i class="bi bi-plus-lg" aria-hidden="true"></i> Agregar
            </button>
          </li>
        </ul>
      </form>

      <template #footer>
        <div class="d-flex gap-2 justify-content-end w-100">
          <button type="button" class="btn btn-light border rounded-pill px-4 fw-bold" @click="mostrar = false">Cancelar</button>
          <button type="submit" form="form-coleccion" class="btn btn-danger rounded-pill px-4 fw-bold" :disabled="guardando">
            <span v-if="guardando" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Guardar
          </button>
        </div>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, watch } from 'vue'
import ModalBase from '@/components/ModalBase.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import { useAaabTv, claveCanal, idGrupoDeClave } from '@/composables/useAaabTv'
import { NOMBRE_CANAL_PUBLICO } from '@/api/aaabTvClips'
import { normalizarTexto } from '@/utils/texto'
import { fechaArg } from '@/utils/fechas'

// Colecciones oficiales de AAAB TV: las arma el coordinador general para un canal.
// Solo admite clips autorizados en ese canal (si después se desautoriza uno, el portal lo oculta).
const toast = inject('toast')
const notificar = inject('notificar')
const {
  clipsModeracion, coleccionesAdmin, cargarColeccionesAdmin, guardarColeccion, borrarColeccion,
  gruposPublicacion, cargarGruposPublicacion
} = useAaabTv()

onMounted(() => {
  cargarColeccionesAdmin()
  if (!gruposPublicacion.value.length) cargarGruposPublicacion()
})

const opcionesCanal = computed(() => [
  { clave: claveCanal(null), nombre: NOMBRE_CANAL_PUBLICO },
  ...gruposPublicacion.value.map(g => ({ clave: claveCanal(g.idGrupo), nombre: g.nombre }))
])

const formVacio = () => ({ id: null, nombre: '', descripcion: '', canal: 'publico', idsClips: [] })
const form = reactive(formVacio())
let original = ''
const mostrar = ref(false)
const intento = ref(false)
const guardando = ref(false)
const busqueda = ref('')

const nombreCanalElegido = computed(() => opcionesCanal.value.find(c => c.clave === form.canal)?.nombre || '')
const autorizadoEn = (clip, canal) => clip.destinos.some(d => claveCanal(d.idGrupo) === canal && d.estado === 'autorizado')
const tituloDe = (id) => clipsModeracion.value.find(c => String(c.id) === String(id))?.titulo || 'Clip que ya no existe'

const disponibles = computed(() => {
  const q = normalizarTexto(busqueda.value)
  return clipsModeracion.value
    .filter(c => autorizadoEn(c, form.canal) && !form.idsClips.some(id => String(id) === String(c.id)))
    .filter(c => !q || normalizarTexto(`${c.titulo} ${c.etiqueta} ${c.partido}`).includes(q))
    .slice(0, 50)
})

// Al cambiar de canal, se sacan los clips que no están autorizados en el nuevo
watch(() => form.canal, (canal) => {
  form.idsClips = form.idsClips.filter(id => {
    const clip = clipsModeracion.value.find(c => String(c.id) === String(id))
    return clip && autorizadoEn(clip, canal)
  })
})

const hayCambios = computed(() => mostrar.value && JSON.stringify(form) !== original)

const abrir = (coleccion) => {
  Object.assign(form, coleccion
    ? { id: coleccion.id, nombre: coleccion.nombre, descripcion: coleccion.descripcion || '', canal: claveCanal(coleccion.idGrupo), idsClips: [...coleccion.idsClips] }
    : formVacio())
  original = JSON.stringify(form)
  intento.value = false
  busqueda.value = ''
  mostrar.value = true
}

const mover = (i, delta) => {
  const lista = [...form.idsClips]
  const [id] = lista.splice(i, 1)
  lista.splice(i + delta, 0, id)
  form.idsClips = lista
}
const quitar = (id) => { form.idsClips = form.idsClips.filter(x => x !== id) }

const guardar = async () => {
  intento.value = true
  if (!form.nombre.trim() || !form.idsClips.length || guardando.value) return
  guardando.value = true
  try {
    const res = await guardarColeccion({
      id: form.id, nombre: form.nombre, descripcion: form.descripcion, idGrupo: idGrupoDeClave(form.canal), idsClips: form.idsClips
    })
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo guardar', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    toast({ tipo: 'success', titulo: 'Colección guardada', mensaje: `"${form.nombre.trim()}" ya se ve en ${nombreCanalElegido.value}.` })
    mostrar.value = false
  } finally {
    guardando.value = false
  }
}

const confirmarBorrar = (coleccion) => {
  notificar({
    tipo: 'danger',
    titulo: 'Borrar colección',
    mensaje: `Se borra "${coleccion.nombre}". Los clips siguen en AAAB TV.`,
    alConfirmar: async () => {
      const res = await borrarColeccion(coleccion.id)
      if (!res?.ok) toast({ tipo: 'danger', titulo: 'No se pudo borrar', mensaje: res?.message || 'Intentá de nuevo.' })
    }
  })
}
</script>

<style scoped>
.fila, .elegido, .disponible {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 12px;
}
.elegido, .disponible { padding: 6px 10px; border-radius: 10px; }
.subtitulo { font-size: 0.85rem; font-weight: 800; color: var(--o-texto, #0f172a); margin-bottom: 6px; }
.numero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--o-chip, #e2e8f0);
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
}
.disponibles { display: flex; flex-direction: column; gap: 4px; max-height: 280px; overflow-y: auto; }
</style>
