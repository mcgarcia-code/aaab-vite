<template>
  <fieldset>
    <legend class="form-label small fw-bold mb-1">¿Dónde se publica? *</legend>
    <p class="small text-muted mb-2">Podés elegir más de un canal. El coordinador general autoriza cada canal por separado.</p>
    <div class="canales" :class="{ 'con-error': invalido }">
      <label v-for="c in opcionesCanal" :key="c.clave" class="opcion-canal" :class="{ elegida: modelValue.includes(c.clave) }">
        <input type="checkbox" class="form-check-input mt-0" :value="c.clave" :checked="modelValue.includes(c.clave)" @change="alternar(c.clave)">
        <i :class="['bi', c.idGrupo === null ? 'bi-globe2' : 'bi-people-fill']" aria-hidden="true"></i>
        <span>{{ c.nombre }}</span>
      </label>
    </div>
    <p v-if="invalido" class="small text-danger mt-1 mb-0" role="alert">Elegí al menos un canal.</p>
    <p v-if="errorGrupos" class="small text-muted mt-1 mb-0">{{ errorGrupos }}</p>
  </fieldset>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAaabTv, claveCanal } from '@/composables/useAaabTv'
import { NOMBRE_CANAL_PUBLICO } from '@/api/aaabTvClips'

// Elección de canales para publicar: el público y/o los de los grupos de la asociación.
// v-model: claves de canal elegidas ('publico', 'g-<idGrupo>'); idGrupoDeClave las pasa a idGrupo
const props = defineProps({
  modelValue: { type: Array, required: true },
  invalido: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const { gruposPublicacion, cargarGruposPublicacion } = useAaabTv()

const errorGrupos = ref('')
const opcionesCanal = computed(() => [
  { clave: claveCanal(null), idGrupo: null, nombre: NOMBRE_CANAL_PUBLICO },
  ...gruposPublicacion.value.map(g => ({ clave: claveCanal(g.idGrupo), idGrupo: g.idGrupo, nombre: g.nombre }))
])

const alternar = (clave) => {
  emit('update:modelValue', props.modelValue.includes(clave)
    ? props.modelValue.filter(c => c !== clave)
    : [...props.modelValue, clave])
}

onMounted(async () => {
  if (gruposPublicacion.value.length) return
  const res = await cargarGruposPublicacion()
  errorGrupos.value = res?.ok ? '' : 'No se pudieron cargar los grupos: por ahora solo se puede publicar en el canal público.'
})
</script>

<style scoped>
.canales {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 6px;
  padding: 2px;
  border-radius: 12px;
}
.canales.con-error { outline: 1px solid #dc3545; }
.opcion-canal {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
.opcion-canal.elegida { border-color: #dc2626; background: var(--o-rojo-fondo, #fef2f2); }
.opcion-canal:focus-within { outline: 2px solid var(--o-texto, #0f172a); outline-offset: 2px; }
</style>
