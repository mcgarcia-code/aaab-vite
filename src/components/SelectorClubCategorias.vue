<template>
  <div class="row g-3">
    <div class="col-12 col-md-5">
      <label :for="`${prefijo}-club`" class="form-label small fw-bold" :class="claseEtiqueta">Club *</label>
      <BuscadorClub
        :id="`${prefijo}-club`"
        :model-value="idClub"
        :opciones="clubes"
        :cargando="cargando"
        :chico="chico"
        :invalido="invalido"
        @update:model-value="cambiarClub"
      />
    </div>
    <div class="col-12 col-md-7">
      <span class="form-label small fw-bold d-block" :class="claseEtiqueta">Categorías * <span class="fw-normal text-muted">(una o más)</span></span>
      <div v-if="!idClub" class="small text-muted fst-italic p-2 bg-light rounded border">Elegí primero el club</div>
      <div v-else-if="!grupos.length" class="small text-muted fst-italic p-2 bg-light rounded border">El club no tiene categorías disponibles</div>
      <div v-else class="lista-categorias border rounded p-2" :class="{ 'border-danger': invalido && !categorias.length }">
        <div v-for="(grupo, g) in grupos" :key="grupo.etiqueta" class="mb-2">
          <div class="text-muted text-uppercase fw-bold mb-1" style="font-size: 0.68rem;">{{ grupo.etiqueta }}</div>
          <div class="row row-cols-1 row-cols-sm-2 g-1">
            <div v-for="(c, k) in grupo.categorias" :key="c" class="col">
              <div class="form-check mb-0">
                <input
                  :id="`${prefijo}-cat-${g}-${k}`"
                  class="form-check-input"
                  type="checkbox"
                  :checked="categorias.includes(c)"
                  @change="alternar(c, $event.target.checked)"
                >
                <label class="form-check-label small" :for="`${prefijo}-cat-${g}-${k}`">{{ c }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { obtenerDatosClubes, ramasSegunGenero, RAMAS_HANDBALL } from '@/composables/useOpcionesHandball'
import BuscadorClub from '@/components/BuscadorClub.vue'

// Club + categorías de un club (los equipos activos en equipos_larry).
// modo 'juego': solo Juveniles/Junior/Mayores y la rama del género declarado.
// modo 'todas': todas las categorías y ramas del club (por ejemplo, para un DT).
// v-model:idClub = club_id   ·   v-model:categorias = nombres de categorías
const props = defineProps({
  idClub: { type: String, default: '' },
  categorias: { type: Array, default: () => [] },
  modo: { type: String, default: 'juego' },
  genero: { type: String, default: '' },
  prefijo: { type: String, default: 'club' },
  chico: { type: Boolean, default: false },
  invalido: { type: Boolean, default: false },
  claseEtiqueta: { type: String, default: 'text-dark' },
})

const emit = defineEmits(['update:idClub', 'update:categorias', 'error'])

const datos = ref({})
const cargando = ref(true)

onMounted(async () => {
  try {
    datos.value = await obtenerDatosClubes()
  } catch (e) {
    console.error('SelectorClubCategorias:', e)
    emit('error', 'No se pudieron cargar los clubes y categorías.')
  } finally {
    cargando.value = false
  }
})

const esJuego = computed(() => props.modo === 'juego')
const clubes = computed(() => (esJuego.value ? datos.value.clubes : datos.value.clubesFamiliares) ?? [])
const todasLasCategorias = computed(() => (esJuego.value ? datos.value.categorias : datos.value.categoriasFamiliares) ?? [])

const grupos = computed(() => {
  const ramas = esJuego.value ? ramasSegunGenero(props.genero) : ['M', 'F']
  const porRama = {}
  for (const c of todasLasCategorias.value) {
    if (c.idClub !== props.idClub || !ramas.includes(c.rama)) continue
    const etiqueta = RAMAS_HANDBALL[c.rama] || 'Otras'
    if (!porRama[etiqueta]) porRama[etiqueta] = { etiqueta, categorias: [] }
    if (!porRama[etiqueta].categorias.includes(c.nombre)) porRama[etiqueta].categorias.push(c.nombre)
  }
  const lista = Object.values(porRama)
  const disponibles = lista.flatMap(g => g.categorias)
  const viejas = props.categorias.filter(c => !disponibles.includes(c))
  if (viejas.length) lista.unshift({ etiqueta: 'Cargadas anteriormente', categorias: viejas })
  return lista
})

const cambiarClub = (id) => {
  emit('update:idClub', id)
  emit('update:categorias', [])
}

const alternar = (categoria, marcada) => {
  const nuevas = marcada
    ? [...new Set([...props.categorias, categoria])]
    : props.categorias.filter(c => c !== categoria)
  emit('update:categorias', nuevas)
}
</script>

<style scoped>
.lista-categorias {
  max-height: 240px;
  overflow-y: auto;
  background-color: #fff;
}
</style>
