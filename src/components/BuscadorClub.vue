<template>
  <div class="buscador-club">
    <!-- Elegidos -->
    <div v-if="elegidos.length" class="d-flex flex-wrap gap-1 mb-1">
      <span v-for="o in elegidos" :key="'sel-' + o.valor" class="badge bg-dark d-inline-flex align-items-center gap-1 py-2 px-2 text-wrap text-start">
        <i class="bi bi-shield-fill"></i> {{ o.etiqueta }}
        <button v-if="!deshabilitado" type="button" class="btn-close btn-close-white ms-1" style="font-size: 0.55rem;" :aria-label="'Quitar ' + o.etiqueta" @click="quitar(o.valor)"></button>
      </span>
    </div>

    <!-- Búsqueda -->
    <template v-if="!deshabilitado && (multiple || !elegidos.length || cambiando)">
      <div class="input-group" :class="{ 'input-group-sm': chico }">
        <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
        <input
          :id="id"
          v-model="busqueda"
          type="text"
          class="form-control shadow-none"
          :class="{ 'is-invalid': invalido && !elegidos.length }"
          :placeholder="cargando ? 'Cargando clubes...' : placeholder"
          :disabled="cargando"
          autocomplete="off"
        >
      </div>
      <div v-if="busqueda.trim().length >= 1" class="lista-resultados border rounded-3 mt-1 bg-white">
        <div v-if="!resultados.length" class="small text-muted fst-italic p-2">No hay clubes con ese nombre.</div>
        <div v-for="o in resultados" :key="'res-' + o.valor" class="form-check m-0 px-2 py-1 resultado">
          <input :id="`${id}-op-${o.valor}`" class="form-check-input ms-0 me-2" type="checkbox" :checked="estaElegido(o.valor)" @change="alternar(o)">
          <label class="form-check-label small" :for="`${id}-op-${o.valor}`">{{ o.etiqueta }}</label>
        </div>
      </div>
      <div v-else-if="!elegidos.length" class="form-text mt-1">Escribí el nombre del club y tildalo.</div>
    </template>
    <button v-else-if="!deshabilitado && !multiple" type="button" class="btn btn-link btn-sm p-0 fw-bold" @click="cambiando = true">Cambiar club</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Buscador de clubes: se escribe el nombre y se tilda el club.
// opciones: lista de nombres (['Club A', ...]) o de objetos ({ id, nombre }).
// v-model: el valor elegido (id o nombre) o, con "multiple", la lista de valores.
const props = defineProps({
  modelValue: { type: [String, Number, Array], default: '' },
  opciones: { type: Array, default: () => [] },
  multiple: { type: Boolean, default: false },
  id: { type: String, default: 'buscador-club' },
  placeholder: { type: String, default: 'Escribí el nombre del club...' },
  chico: { type: Boolean, default: false },
  invalido: { type: Boolean, default: false },
  cargando: { type: Boolean, default: false },
  deshabilitado: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'elegir'])

const busqueda = ref('')
const cambiando = ref(false)

const normalizar = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const lista = computed(() => props.opciones.map(o => (typeof o === 'object' && o !== null
  ? { valor: String(o.id ?? o.valor ?? ''), etiqueta: String(o.nombre ?? o.etiqueta ?? '') }
  : { valor: String(o), etiqueta: String(o) })))

const valores = computed(() => {
  if (props.multiple) return (props.modelValue || []).map(String)
  return props.modelValue === '' || props.modelValue === null || props.modelValue === undefined ? [] : [String(props.modelValue)]
})

// Los elegidos que no están en la lista (por ejemplo, un club que ya no tiene equipos) se muestran igual
const elegidos = computed(() => valores.value.map(v => lista.value.find(o => o.valor === v) || { valor: v, etiqueta: v }))

const resultados = computed(() => {
  const texto = normalizar(busqueda.value.trim())
  if (!texto) return []
  return lista.value.filter(o => normalizar(o.etiqueta).includes(texto)).slice(0, 15)
})

const estaElegido = (valor) => valores.value.includes(valor)

const alternar = (o) => {
  if (props.multiple) {
    const nuevos = estaElegido(o.valor) ? valores.value.filter(v => v !== o.valor) : [...valores.value, o.valor]
    emit('update:modelValue', nuevos)
    emit('elegir', nuevos.map(v => lista.value.find(x => x.valor === v) || { valor: v, etiqueta: v }))
    return
  }
  const nuevo = estaElegido(o.valor) ? '' : o.valor
  emit('update:modelValue', nuevo)
  emit('elegir', nuevo ? o : null)
  busqueda.value = ''
  cambiando.value = false
}

const quitar = (valor) => {
  if (props.multiple) {
    const nuevos = valores.value.filter(v => v !== valor)
    emit('update:modelValue', nuevos)
    emit('elegir', nuevos.map(v => lista.value.find(x => x.valor === v) || { valor: v, etiqueta: v }))
    return
  }
  emit('update:modelValue', '')
  emit('elegir', null)
}
</script>

<style scoped>
.lista-resultados { max-height: 220px; overflow-y: auto; }
.resultado:hover { background: #f8fafc; }
</style>
