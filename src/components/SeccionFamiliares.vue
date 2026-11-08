<template>
  <div class="seccion-familiares">
    <div class="row g-3">
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-tiene`" class="form-label small fw-bold" :class="claseEtiqueta">¿Tenés familiares que jueguen en algún club? *</label>
        <select
          v-if="editable"
          :id="`${prefijo}-tiene`"
          :value="tiene"
          @change="cambiarTiene($event.target.value)"
          class="form-select"
          :class="{ 'form-select-sm': chico }"
        >
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select>
        <div v-else class="p-2 bg-light rounded fw-bold text-dark text-uppercase">{{ tiene === 'si' ? 'Sí' : 'No' }}</div>
      </div>
    </div>

    <template v-if="tiene === 'si'">
      <!-- SOLO LECTURA -->
      <div v-if="!editable" class="mt-3 d-flex flex-column gap-2">
        <div v-for="(f, i) in familiares" :key="i" class="p-2 bg-light rounded small text-dark">
          <strong>{{ nombreClub(f.idClub) || f.club || '-' }}</strong>
          <span class="text-muted"> · {{ f.parentesco }}</span>
          <div>{{ (f.categorias || []).join('; ') }}</div>
        </div>
        <div v-if="!familiares.length" class="small text-muted fst-italic">Sin familiares cargados</div>
      </div>

      <!-- EDICIÓN -->
      <template v-else>
        <div v-if="cargando" class="small text-muted mt-3">
          <span class="spinner-border spinner-border-sm me-1"></span> Cargando clubes...
        </div>

        <template v-else>
          <div
            v-for="(f, i) in familiares"
            :key="i"
            class="tarjeta-familiar border rounded-3 p-3 mt-3"
            :class="{ 'border-danger': mostrarErrores && errorFila(f) }"
          >
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="small fw-bold text-danger text-uppercase">Familiar {{ i + 1 }}</span>
              <button
                v-if="familiares.length > 1"
                type="button"
                class="btn btn-sm btn-outline-danger py-0 px-2"
                @click="quitarFila(i)"
                :aria-label="`Quitar familiar ${i + 1}`"
              >
                <i class="bi bi-trash3"></i> Quitar
              </button>
            </div>

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label :for="`${prefijo}-club-${i}`" class="form-label small fw-bold" :class="claseEtiqueta">Club *</label>
                <select
                  :id="`${prefijo}-club-${i}`"
                  :value="f.idClub"
                  @change="actualizarFila(i, { idClub: $event.target.value, club: nombreClub($event.target.value), categorias: [] })"
                  class="form-select"
                  :class="{ 'form-select-sm': chico }"
                >
                  <option value="" disabled>Seleccionar club...</option>
                  <option v-for="c in clubes" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                </select>
              </div>
              <div class="col-12 col-md-6">
                <label :for="`${prefijo}-parentesco-${i}`" class="form-label small fw-bold" :class="claseEtiqueta">Parentesco *</label>
                <input
                  :id="`${prefijo}-parentesco-${i}`"
                  :value="f.parentesco"
                  @input="actualizarFila(i, { parentesco: $event.target.value })"
                  type="text"
                  maxlength="100"
                  :list="`${prefijo}-parentescos`"
                  placeholder="Ej: Hijo, hermana, sobrino"
                  class="form-control"
                  :class="{ 'form-control-sm': chico }"
                >
              </div>
              <div class="col-12">
                <span class="form-label small fw-bold d-block" :class="claseEtiqueta">Categorías * <span class="fw-normal text-muted">(una o más)</span></span>
                <div v-if="!f.idClub" class="small text-muted fst-italic p-2 bg-light rounded border">Elegí primero el club</div>
                <div v-else class="lista-categorias border rounded p-2">
                  <div v-for="grupo in categoriasPorRama(f.idClub)" :key="grupo.etiqueta" class="mb-2">
                    <div class="text-muted text-uppercase fw-bold mb-1" style="font-size: 0.68rem;">{{ grupo.etiqueta }}</div>
                    <div class="row row-cols-2 row-cols-md-3 g-1">
                      <div v-for="c in grupo.categorias" :key="c" class="col">
                        <div class="form-check mb-0">
                          <input
                            :id="`${prefijo}-cat-${i}-${grupo.etiqueta}-${c}`"
                            class="form-check-input"
                            type="checkbox"
                            :checked="f.categorias.includes(c)"
                            @change="alternarCategoria(i, c, $event.target.checked)"
                          >
                          <label class="form-check-label small" :for="`${prefijo}-cat-${i}-${grupo.etiqueta}-${c}`">{{ c }}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="mostrarErrores && errorFila(f)" class="text-danger small mt-2">{{ errorFila(f) }}</div>
          </div>

          <button
            v-if="familiares.length < MAX_FAMILIARES"
            type="button"
            class="btn btn-outline-secondary btn-sm fw-bold mt-3"
            @click="agregarFila"
          >
            <i class="bi bi-plus-circle me-1"></i> Agregar otro club
          </button>
        </template>
      </template>
    </template>

    <datalist :id="`${prefijo}-parentescos`">
      <option v-for="p in PARENTESCOS" :key="p" :value="p"></option>
    </datalist>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { obtenerDatosClubes, RAMAS_HANDBALL } from '@/composables/useOpcionesHandball'
import { MAX_FAMILIARES, filaFamiliarVacia, errorFilaFamiliar } from '@/composables/useFamiliares'

const props = defineProps({
  tiene: { type: String, default: 'no' },
  familiares: { type: Array, default: () => [] },
  editable: { type: Boolean, default: true },
  mostrarErrores: { type: Boolean, default: false },
  prefijo: { type: String, default: 'fam' },
  claseEtiqueta: { type: String, default: 'text-dark' },
  chico: { type: Boolean, default: false },
})

const emit = defineEmits(['update:tiene', 'update:familiares', 'error'])

const PARENTESCOS = ['Hijo', 'Hija', 'Hermano', 'Hermana', 'Padre', 'Madre', 'Sobrino', 'Sobrina', 'Primo', 'Prima', 'Pareja']

const clubes = ref([])
const categorias = ref([])
const cargando = ref(false)

const cargar = async () => {
  if (clubes.value.length || cargando.value) return
  cargando.value = true
  try {
    const datos = await obtenerDatosClubes()
    clubes.value = datos.clubesFamiliares ?? []
    categorias.value = datos.categoriasFamiliares ?? []
  } catch (e) {
    console.error('SeccionFamiliares:', e)
    emit('error', 'No se pudieron cargar los clubes para familiares.')
  } finally {
    cargando.value = false
  }
}

watch(() => props.editable && props.tiene === 'si', (necesita) => { if (necesita) cargar() }, { immediate: true })

const nombreClub = (idClub) => clubes.value.find(c => c.id === idClub)?.nombre ?? ''

const categoriasPorRama = (idClub) => {
  const grupos = {}
  for (const c of categorias.value.filter(c => c.idClub === idClub)) {
    const etiqueta = RAMAS_HANDBALL[c.rama] || 'Otras'
    if (!grupos[etiqueta]) grupos[etiqueta] = { etiqueta, categorias: [] }
    if (!grupos[etiqueta].categorias.includes(c.nombre)) grupos[etiqueta].categorias.push(c.nombre)
  }
  return Object.values(grupos)
}

const errorFila = (f) => errorFilaFamiliar(f)

// ─── Cambios: siempre se emite una lista nueva (no se mutan las props) ──
const emitirFilas = (filas) => emit('update:familiares', filas)

const cambiarTiene = (valor) => {
  emit('update:tiene', valor)
  if (valor === 'si' && !props.familiares.length) emitirFilas([filaFamiliarVacia()])
  if (valor !== 'si') emitirFilas([])
}

const actualizarFila = (i, cambios) =>
  emitirFilas(props.familiares.map((f, j) => (j === i ? { ...f, ...cambios } : f)))

const alternarCategoria = (i, categoria, marcada) => {
  const actuales = props.familiares[i].categorias || []
  const nuevas = marcada ? [...new Set([...actuales, categoria])] : actuales.filter(c => c !== categoria)
  actualizarFila(i, { categorias: nuevas })
}

const agregarFila = () => emitirFilas([...props.familiares, filaFamiliarVacia()])
const quitarFila = (i) => emitirFilas(props.familiares.filter((_, j) => j !== i))
</script>

<style scoped>
.tarjeta-familiar {
  background-color: #fcfcfd;
}
.lista-categorias {
  max-height: 240px;
  overflow-y: auto;
  background-color: #fff;
}
</style>
