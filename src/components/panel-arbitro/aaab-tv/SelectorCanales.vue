<template>
  <fieldset>
    <legend class="form-label small fw-bold mb-1">¿Dónde se publica? *</legend>
    <p class="small text-muted mb-2">
      Podés elegir más de un canal.
      {{ publicaAutorizado ? 'Lo que publicás vos sale autorizado en todos.' : 'El coordinador general autoriza cada canal por separado.' }}
    </p>
    <div class="row g-2" :class="{ 'border border-danger rounded-3 p-1 mx-0': invalido }">
      <div v-for="c in opcionesCanal" :key="c.clave" class="col-12 col-sm-6 col-lg-4">
      <label class="card shadow-sm rounded-3 py-2 px-3 h-100 d-flex flex-row align-items-center gap-2 small fw-semibold cursor-pointer mb-0"
             :class="modelValue.includes(c.clave) ? 'border-danger bg-danger-subtle' : 'border-light-subtle'">
        <input type="checkbox" class="form-check-input mt-0" :value="c.clave" :checked="modelValue.includes(c.clave)" @change="alternar(c.clave)">
        <i :class="['bi', c.idGrupo === null ? 'bi-globe2' : 'bi-people-fill']" aria-hidden="true"></i>
        <span>{{ c.nombre }}</span>
      </label>
      </div>
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

const { gruposPublicacion, cargarGruposPublicacion, publicaAutorizado } = useAaabTv()

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

