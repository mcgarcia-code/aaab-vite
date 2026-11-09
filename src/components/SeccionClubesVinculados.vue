<template>
  <div class="seccion-clubes-vinculados">
    <p class="small text-muted mb-3">
      <i class="bi bi-info-circle me-1"></i>Si sos ex-jugador/a o te identificás con algún club, por favor declaralo.
    </p>

    <div class="row g-3">
      <!-- Ex-jugador -->
      <div class="col-12 col-md-4">
        <label :for="`${prefijo}-ex`" class="form-label small fw-bold" :class="claseEtiqueta">¿Sos ex-jugador/a? *</label>
        <select v-if="editable" :id="`${prefijo}-ex`" :value="modelValue.exJugador" class="form-select" :class="{ 'form-select-sm': chico }" @change="actualizar({ exJugador: $event.target.value, idClubExJugador: '' })">
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select>
        <div v-else class="p-2 bg-light rounded fw-bold text-dark text-uppercase">{{ modelValue.exJugador === 'si' ? 'Sí' : 'No' }}</div>
      </div>
      <div v-if="modelValue.exJugador === 'si'" class="col-12 col-md-8">
        <label :for="`${prefijo}-ex-club`" class="form-label small fw-bold" :class="claseEtiqueta">Último club donde jugaste *</label>
        <BuscadorClub
          v-if="editable"
          :id="`${prefijo}-ex-club`"
          :model-value="modelValue.idClubExJugador"
          :opciones="clubes"
          :cargando="cargando"
          :chico="chico"
          :invalido="mostrarErrores && !modelValue.idClubExJugador"
          @update:model-value="id => actualizar({ idClubExJugador: id })"
        />
        <div v-else class="p-2 bg-light rounded fw-bold text-dark">{{ nombreClub(modelValue.idClubExJugador) || '-' }}</div>
        <div class="form-text">Se toma el último club donde fuiste jugador/a.</div>
      </div>

      <!-- Se identifica con algún club -->
      <div class="col-12 col-md-4">
        <label :for="`${prefijo}-identifica`" class="form-label small fw-bold" :class="claseEtiqueta">¿Te identificás con algún club? *</label>
        <select v-if="editable" :id="`${prefijo}-identifica`" :value="modelValue.identificaClub" class="form-select" :class="{ 'form-select-sm': chico }" @change="actualizar({ identificaClub: $event.target.value, idsClubesIdentifica: [] })">
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select>
        <div v-else class="p-2 bg-light rounded fw-bold text-dark text-uppercase">{{ modelValue.identificaClub === 'si' ? 'Sí' : 'No' }}</div>
      </div>
      <div v-if="modelValue.identificaClub === 'si'" class="col-12 col-md-8">
        <label :for="`${prefijo}-identifica-clubes`" class="form-label small fw-bold" :class="claseEtiqueta">Clubes con los que te identificás *</label>
        <BuscadorClub
          v-if="editable"
          :id="`${prefijo}-identifica-clubes`"
          :model-value="modelValue.idsClubesIdentifica"
          :opciones="clubes"
          :cargando="cargando"
          :chico="chico"
          :invalido="mostrarErrores && !modelValue.idsClubesIdentifica.length"
          multiple
          @update:model-value="ids => actualizar({ idsClubesIdentifica: ids })"
        />
        <div v-else class="p-2 bg-light rounded fw-bold text-dark">{{ modelValue.idsClubesIdentifica.map(nombreClub).join(' · ') || '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BuscadorClub from '@/components/BuscadorClub.vue'
import { obtenerDatosClubes } from '@/composables/useOpcionesHandball'

// v-model: { exJugador, idClubExJugador, identificaClub, idsClubesIdentifica }
const props = defineProps({
  modelValue: { type: Object, required: true },
  editable: { type: Boolean, default: true },
  mostrarErrores: { type: Boolean, default: false },
  prefijo: { type: String, default: 'vinculos' },
  chico: { type: Boolean, default: false },
  claseEtiqueta: { type: String, default: 'text-dark' },
})

const emit = defineEmits(['update:modelValue', 'error'])

const clubes = ref([])
const cargando = ref(true)

const actualizar = (cambios) => emit('update:modelValue', { ...props.modelValue, ...cambios })
const nombreClub = (id) => clubes.value.find(c => String(c.id) === String(id))?.nombre || ''

onMounted(async () => {
  try {
    const datos = await obtenerDatosClubes()
    // Todos los clubes con equipos (no solo los de categorías de juego)
    clubes.value = datos.clubesFamiliares ?? datos.clubes ?? []
  } catch (e) {
    console.error('SeccionClubesVinculados:', e)
    emit('error', 'No se pudieron cargar los clubes.')
  } finally {
    cargando.value = false
  }
})
</script>
