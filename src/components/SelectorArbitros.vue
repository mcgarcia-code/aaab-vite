<template>
  <div>
    <!-- Elegidos -->
    <div v-if="seleccionados.length" class="d-flex flex-wrap gap-1 mb-2">
      <span v-for="a in seleccionados" :key="'sel-' + a.id" class="badge bg-dark d-inline-flex align-items-center gap-1 py-2 px-2 text-wrap text-start">
        <i class="bi bi-person-fill"></i> {{ a.nombre }}
        <button type="button" class="btn-close btn-close-white ms-1" style="font-size: 0.55rem;" :aria-label="'Quitar a ' + a.nombre" @click="quitar(a.id)"></button>
      </span>
    </div>

    <!-- Búsqueda -->
    <div class="input-group input-group-sm">
      <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
      <input
        :id="id"
        v-model="busqueda"
        type="text"
        class="form-control shadow-none"
        :placeholder="cargando ? 'Cargando árbitros...' : 'Escribí el apellido o nombre...'"
        :disabled="cargando"
        autocomplete="off"
      >
    </div>

    <div v-if="busqueda.trim().length >= 2" class="lista-resultados border rounded-3 mt-1 bg-white">
      <div v-if="!resultados.length" class="small text-muted fst-italic p-2">No hay árbitros con ese nombre.</div>
      <div v-for="a in resultados" :key="'res-' + a.id" class="form-check m-0 px-2 py-1 resultado">
        <input :id="id + '-arb-' + a.id" class="form-check-input ms-0 me-2" type="checkbox" :checked="estaElegido(a.id)" @change="alternar(a)">
        <label class="form-check-label small text-uppercase" :for="id + '-arb-' + a.id">
          {{ a.apellido }}, {{ a.nombre }} <span v-if="a.grupo" class="text-muted text-lowercase">· {{ a.grupo }}</span>
        </label>
      </div>
    </div>
    <div v-else class="form-text">Escribí al menos 2 letras para buscar.</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/api'

defineProps({
  id: { type: String, default: 'selector-arbitros' },
})

// [{ id, nombre }]
const seleccionados = defineModel({ type: Array, default: () => [] })

const arbitros = ref([])
const cargando = ref(false)
const busqueda = ref('')

const normalizar = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const resultados = computed(() => {
  const texto = normalizar(busqueda.value.trim())
  if (texto.length < 2) return []
  return arbitros.value
    .filter(a => normalizar(`${a.apellido} ${a.nombre} ${a.nombre} ${a.apellido}`).includes(texto))
    .slice(0, 15)
})

const estaElegido = (id) => seleccionados.value.some(a => a.id === id)
const quitar = (id) => { seleccionados.value = seleccionados.value.filter(a => a.id !== id) }
const alternar = (a) => {
  if (estaElegido(a.id)) quitar(a.id)
  else seleccionados.value = [...seleccionados.value, { id: a.id, nombre: `${a.apellido}, ${a.nombre}` }]
}

onMounted(async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'arbitros', action: 'getArbitrosBasico', payload: { soloActivos: false } })
    arbitros.value = (res?.payload || [])
      .map(a => ({ ...a, id: Number(a.id) }))
      .sort((x, y) => `${x.apellido} ${x.nombre}`.localeCompare(`${y.apellido} ${y.nombre}`))
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.lista-resultados { max-height: 220px; overflow-y: auto; }
.resultado:hover { background: #f8fafc; }
</style>
