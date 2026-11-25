<template>
  <div>
    <label class="form-label small fw-bold text-muted mb-1">{{ etiqueta }}</label>
    <div class="fw-bold text-dark small text-break">{{ valor }}</div>
  </div>
</template>

<script setup>
// Un dato del detalle de un informe: etiqueta chica y valor en negrita
defineProps({
  etiqueta: { type: String, default: '' },
  valor: { type: [String, Number], default: '' }
})
</script>
