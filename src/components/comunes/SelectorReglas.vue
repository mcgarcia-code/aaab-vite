<template>
  <div>
    <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
      <span class="form-label small fw-bold text-dark mb-0">
        {{ titulo }}<span v-if="requerido" class="text-danger"> *</span>
      </span>
      <div class="form-check form-switch m-0">
        <input :id="idTodas" class="form-check-input shadow-none" type="checkbox" role="switch"
               :checked="todasElegidas" :disabled="!reglas.length" @change="alternarTodas">
        <label class="form-check-label small fw-bold text-muted" :for="idTodas">{{ t.todas }}</label>
      </div>
    </div>

    <div v-if="reglas.length" class="grilla-reglas" :class="{ 'grilla-invalida': invalido }" role="group" :aria-label="titulo">
      <button v-for="r in reglas" :key="r.codigo" type="button"
              class="btn btn-regla fw-bold"
              :class="modelValue.includes(r.codigo) ? 'btn-danger' : 'btn-light border'"
              :aria-pressed="modelValue.includes(r.codigo)"
              :title="t.preguntasEnRegla(r.cantidad)"
              @click="alternar(r.codigo)">
        <span class="d-block lh-1">{{ r.codigo }}</span>
        <span class="cantidad-regla d-block lh-1 mt-1">{{ r.cantidad }}</span>
      </button>
    </div>
    <p v-else class="text-muted small mb-0">{{ t.sinReglas }}</p>

    <small v-if="reglas.length" class="d-block mt-2" :class="invalido ? 'text-danger fw-semibold' : 'text-muted'">
      {{ invalido && !modelValue.length ? t.elegiUna : t.disponibles(disponibles) }}
    </small>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Selector de reglas del reglamento (1 a 18) con la cantidad de preguntas de cada una.
// Lo usan la práctica del catálogo, el catálogo público y la programación de exámenes
// (reuniones de coordinadores y clases del curso). v-model: lista de códigos elegidos.
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  reglas: { type: Array, default: () => [] },          // [{ codigo, cantidad }]
  titulo: { type: String, default: 'Reglas' },
  requerido: { type: Boolean, default: false },
  invalido: { type: Boolean, default: false },
  idioma: { type: String, default: 'es' },
  id: { type: String, default: 'reglas' }              // prefijo del id del switch "Todas" (si hay dos en la misma pantalla)
})
const emit = defineEmits(['update:modelValue'])

const TEXTOS = {
  es: {
    todas: 'Todas',
    sinReglas: 'No hay preguntas cargadas.',
    elegiUna: 'Elegí al menos una regla.',
    preguntasEnRegla: (n) => `${n} ${n === 1 ? 'pregunta' : 'preguntas'}`,
    disponibles: (n) => `${n} ${n === 1 ? 'pregunta disponible' : 'preguntas disponibles'} en las reglas elegidas.`
  },
  en: {
    todas: 'All',
    sinReglas: 'There are no questions.',
    elegiUna: 'Select at least one rule.',
    preguntasEnRegla: (n) => `${n} ${n === 1 ? 'question' : 'questions'}`,
    disponibles: (n) => `${n} ${n === 1 ? 'question' : 'questions'} in the selected rules.`
  }
}
const t = computed(() => TEXTOS[props.idioma] || TEXTOS.es)

const idTodas = computed(() => `${props.id}-todas`)

const todasElegidas = computed(() => props.reglas.length > 0 && props.reglas.every(r => props.modelValue.includes(r.codigo)))

const disponibles = computed(() => props.reglas
  .filter(r => props.modelValue.includes(r.codigo))
  .reduce((suma, r) => suma + Number(r.cantidad || 0), 0))

const alternar = (codigo) => {
  const lista = props.modelValue.includes(codigo)
    ? props.modelValue.filter(c => c !== codigo)
    : [...props.modelValue, codigo]
  emit('update:modelValue', lista.sort((a, b) => a - b))
}

const alternarTodas = () => emit('update:modelValue', todasElegidas.value ? [] : props.reglas.map(r => r.codigo))
</script>

<style scoped>
/* Botones grandes para tocar en el celular: 6 por fila, 9 desde tablet */
.grilla-reglas {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  border-radius: 10px;
}
@media (min-width: 576px) {
  .grilla-reglas { grid-template-columns: repeat(9, 1fr); }
}
.grilla-invalida {
  outline: 1px solid var(--o-rojo, #dc2626);
  outline-offset: 4px;
}
.btn-regla {
  height: 50px;
  padding: 0;
  border-radius: 8px;
}
.cantidad-regla {
  font-size: 0.65rem;
  font-weight: 500;
  opacity: 0.75;
}
</style>
