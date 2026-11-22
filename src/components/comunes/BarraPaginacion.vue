<template>
  <!-- Paginación común de las listas: "Ant · Página X de Y · Sig". Solo aparece si hay más de una página.
       Los márgenes los pone cada pantalla con class (ej. class="mt-4 mb-3") -->
  <nav v-if="total > 1" class="d-flex justify-content-center align-items-center gap-3" aria-label="Paginación">
    <button type="button" class="btn btn-light rounded-pill fw-bold shadow-sm border" :class="sobreFondoOscuro ? 'px-4 border-0' : 'px-3'" :disabled="modelValue <= 1" aria-label="Página anterior" @click="cambiar(-1)">
      <i class="bi bi-chevron-left"></i> Ant
    </button>
    <span class="fw-bold small" :class="sobreFondoOscuro ? 'text-white px-3 py-1 bg-dark bg-opacity-50 rounded-pill' : 'text-dark'" aria-live="polite">
      Página {{ modelValue }} de {{ total }}
    </span>
    <button type="button" class="btn btn-light rounded-pill fw-bold shadow-sm border" :class="sobreFondoOscuro ? 'px-4 border-0' : 'px-3'" :disabled="modelValue >= total" aria-label="Página siguiente" @click="cambiar(1)">
      Sig <i class="bi bi-chevron-right"></i>
    </button>
  </nav>
</template>

<script setup>
// v-model: página actual (empieza en 1). total: cantidad de páginas (ver usePaginacion).
// subir: en celular, al cambiar de página vuelve al principio de la pantalla (la lista quedó arriba).
// Emite "cambio" con la página nueva, para las pantallas que hacen algo propio (ej. ir a una tarjeta).
const props = defineProps({
  modelValue: { type: Number, required: true },
  total: { type: Number, required: true },
  subir: { type: Boolean, default: true },
  sobreFondoOscuro: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'cambio'])

const ANCHO_CELULAR = 768

const cambiar = (delta) => {
  const nueva = props.modelValue + delta
  if (nueva < 1 || nueva > props.total) return
  emit('update:modelValue', nueva)
  emit('cambio', nueva)
  // Se espera un instante para que la lista nueva ya esté dibujada antes de subir
  if (props.subir && window.innerWidth <= ANCHO_CELULAR) {
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }
}
</script>
