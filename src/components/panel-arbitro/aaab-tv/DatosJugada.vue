<template>
  <div class="datos-jugada">
    <button type="button" class="btn btn-link btn-sm p-0 fw-bold text-decoration-none" :aria-expanded="abierto" @click="abierto = !abierto">
      <i :class="['bi', abierto ? 'bi-chevron-down' : 'bi-chevron-right']" aria-hidden="true"></i>
      Datos de la jugada <span class="fw-normal text-muted">(opcional)</span>
      <span v-if="!abierto && resumen" class="fw-normal text-muted"> · {{ resumen }}</span>
    </button>
    <div v-if="abierto" class="row g-2 mt-1">
      <div class="col-6 col-md-3">
        <label :for="`${id}-zona`" class="form-label small fw-bold mb-1">Zona</label>
        <select :id="`${id}-zona`" :value="modelo.zona" class="form-select form-select-sm" @change="cambiar('zona', $event.target.value)">
          <option value="">—</option>
          <option v-for="(nombre, clave) in ZONAS_CANCHA" :key="clave" :value="clave">{{ nombre }}</option>
        </select>
      </div>
      <div class="col-6 col-md-3">
        <label :for="`${id}-equipo`" class="form-label small fw-bold mb-1">Equipo</label>
        <select :id="`${id}-equipo`" :value="modelo.equipo" class="form-select form-select-sm" @change="cambiar('equipo', $event.target.value)">
          <option value="">—</option>
          <option v-for="(nombre, clave) in EQUIPOS" :key="clave" :value="clave">{{ nombre }}</option>
        </select>
      </div>
      <div class="col-6 col-md-3">
        <label :for="`${id}-sancion`" class="form-label small fw-bold mb-1">Sanción aplicada</label>
        <select :id="`${id}-sancion`" :value="modelo.sancion" class="form-select form-select-sm" @change="cambiar('sancion', $event.target.value)">
          <option value="">—</option>
          <option v-for="(nombre, clave) in SANCIONES" :key="clave" :value="clave">{{ nombre }}</option>
        </select>
      </div>
      <div class="col-6 col-md-3">
        <label :for="`${id}-correcta`" class="form-label small fw-bold mb-1">Correspondía</label>
        <select :id="`${id}-correcta`" :value="modelo.sancionCorrecta" class="form-select form-select-sm" @change="cambiar('sancionCorrecta', $event.target.value)">
          <option value="">— (la misma)</option>
          <option v-for="(nombre, clave) in SANCIONES" :key="clave" :value="clave">{{ nombre }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ZONAS_CANCHA, EQUIPOS, SANCIONES, JUGADA_VACIA, resumenJugada } from '@/composables/useAaabTv'

// Datos de la jugada de un clip: zona de la cancha, equipo, sanción aplicada y la que correspondía.
// Todos opcionales; plegado por defecto (se abre solo si ya tiene algo cargado).
// v-model: { zona, equipo, sancion, sancionCorrecta } o null
defineProps({
  id: { type: String, required: true }
})
const jugada = defineModel({ type: Object, default: null })

const modelo = computed(() => jugada.value || JUGADA_VACIA())
const resumen = computed(() => resumenJugada(jugada.value))
const abierto = ref(!!resumen.value)

const cambiar = (campo, valor) => {
  jugada.value = { ...modelo.value, [campo]: valor || null }
}
</script>

<style scoped>
.datos-jugada { margin-top: 8px; }
</style>
