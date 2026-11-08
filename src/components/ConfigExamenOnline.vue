<template>
  <div>
    <div v-if="cargando" class="text-center py-3"><span class="spinner-border spinner-border-sm text-dark"></span></div>
    <div v-else class="row g-3">
      <div class="col-6">
        <label :for="prefijo + '-cantidad'" class="form-label small fw-bold text-dark">Cantidad de preguntas *</label>
        <input :id="prefijo + '-cantidad'" v-model.number="config.cantidadPreguntas" type="number" min="1" max="100" class="form-control" :class="{ 'is-invalid': intento && errorCantidad }">
        <div class="invalid-feedback">{{ errorCantidad }}</div>
      </div>
      <div class="col-6">
        <label :for="prefijo + '-tiempo'" class="form-label small fw-bold text-dark">Tiempo (minutos) *</label>
        <input :id="prefijo + '-tiempo'" v-model.number="config.tiempoLimiteMin" type="number" min="1" max="180" class="form-control" :class="{ 'is-invalid': intento && errorTiempo }">
        <div class="invalid-feedback">{{ errorTiempo }}</div>
      </div>
      <div class="col-12">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-1 mb-2">
          <span class="form-label small fw-bold text-dark m-0">Reglas * <span class="text-muted fw-normal">({{ preguntasDisponibles }} preguntas disponibles)</span></span>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-link btn-sm p-0 fw-bold" @click="config.reglas = reglasDisponibles.map(r => r.codigo)">Todas</button>
            <button type="button" class="btn btn-link btn-sm p-0 fw-bold text-secondary" @click="config.reglas = []">Ninguna</button>
          </div>
        </div>
        <div class="row g-2 border rounded-3 p-2 m-0" :class="{ 'border-danger': intento && !config.reglas.length }">
          <div v-for="r in reglasDisponibles" :key="r.codigo" class="col-6 col-sm-4 col-md-3">
            <div class="form-check m-0">
              <input :id="prefijo + '-regla-' + r.codigo" v-model="config.reglas" class="form-check-input" type="checkbox" :value="r.codigo">
              <label class="form-check-label small fw-bold" :for="prefijo + '-regla-' + r.codigo">Regla {{ r.codigo }} <span class="text-muted fw-normal">({{ r.cantidad }})</span></label>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12">
        <div class="form-check form-switch">
          <input :id="prefijo + '-habilitado'" v-model="config.habilitado" class="form-check-input" type="checkbox" role="switch">
          <label class="form-check-label fw-bold small" :for="prefijo + '-habilitado'">Habilitado para rendir</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/api'

defineProps({
  prefijo: { type: String, default: 'cfg' },
  intento: { type: Boolean, default: false },
})

// { cantidadPreguntas, tiempoLimiteMin, reglas: number[], habilitado }
const config = defineModel({ type: Object, required: true })

const reglasDisponibles = ref([])
const cargando = ref(false)

const preguntasDisponibles = computed(() =>
  reglasDisponibles.value.filter(r => config.value.reglas.includes(r.codigo)).reduce((t, r) => t + r.cantidad, 0)
)
const errorCantidad = computed(() => {
  const n = Number(config.value.cantidadPreguntas)
  if (!Number.isInteger(n) || n < 1 || n > 100) return 'Entre 1 y 100.'
  if (config.value.reglas.length && n > preguntasDisponibles.value) return `Hay solo ${preguntasDisponibles.value} preguntas.`
  return ''
})
const errorTiempo = computed(() => {
  const n = Number(config.value.tiempoLimiteMin)
  return Number.isInteger(n) && n >= 1 && n <= 180 ? '' : 'Entre 1 y 180.'
})

const validar = () => (errorCantidad.value || errorTiempo.value || (!config.value.reglas.length ? 'Elegí al menos una regla.' : ''))

onMounted(async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'examenes_habilitaciones', action: 'obtenerReglasExamen', payload: {} })
    if (res?.ok) {
      reglasDisponibles.value = (res.payload?.reglas || []).map(r => ({ codigo: Number(r.codigo), cantidad: Number(r.cantidad) }))
      const codigos = reglasDisponibles.value.map(r => r.codigo)
      if (!config.value.reglas.length) config.value.reglas = (res.payload?.defecto?.reglas || []).map(Number).filter(c => codigos.includes(c))
    }
  } finally {
    cargando.value = false
  }
})

defineExpose({ validar })
</script>
