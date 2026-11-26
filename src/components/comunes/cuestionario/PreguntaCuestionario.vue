<template>
  <div>
    <!-- Enunciado. En los exámenes el backend reemplaza los espacios por '@': cada '@' se dibuja
         como un espacio invisible (mismo ancho, opacity 0), así al copiar el texto arrastra los '@' -->
    <p v-if="ofuscado" class="fw-bold mb-3 fs-6 fs-md-5 lh-base px-1 text-break"><template v-for="(seg, i) in segmentos" :key="i">{{ seg }}<template v-if="i < segmentos.length - 1"><span class="espacio-oculto">@</span><wbr></template></template></p>
    <p v-else class="fw-bold mb-3 fs-6 fs-md-5 lh-base px-1 text-break">{{ texto }}</p>

    <p v-if="ayuda" class="small text-muted mb-2 px-1"><i class="bi bi-info-circle me-1"></i>{{ ayuda }}</p>

    <div class="list-group mb-4 gap-2">
      <label v-for="(o, i) in opciones" :key="o.id"
             class="list-group-item d-flex gap-2 gap-md-3 align-items-start p-2 p-md-3 opcion-item shadow-sm border"
             :class="{ elegida: elegidas.includes(o.id) }">
        <input class="form-check-input flex-shrink-0 fs-5 mt-1" type="checkbox"
               :checked="elegidas.includes(o.id)"
               @change="emit('alternar', o.id)">
        <span class="text-danger fw-bold mt-1">{{ letra(i) }})</span>
        <!-- text-break y mt-1 para que el texto multilínea quede alineado con el checkbox -->
        <span class="text-dark lh-sm mt-1 text-break">{{ o.texto }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Una pregunta con sus opciones (checkbox: puede haber más de una correcta).
// Común al examen online (asamblea y curso), la práctica del catálogo y el catálogo público.
const props = defineProps({
  texto: { type: String, default: '' },
  opciones: { type: Array, default: () => [] },     // [{ id, texto }]
  elegidas: { type: Array, default: () => [] },     // ids de las opciones marcadas
  ofuscado: { type: Boolean, default: false },      // el texto viene con '@' en lugar de espacios
  ayuda: { type: String, default: '' }              // aviso debajo del enunciado
})
const emit = defineEmits(['alternar'])

const segmentos = computed(() => (props.texto || '').split('@'))
const letra = (i) => String.fromCharCode(97 + i)
</script>

<style scoped>
.opcion-item {
  cursor: pointer;
  border-radius: 8px !important;
  transition: background .12s ease;
}
/* Hover solo con mouse: en el celular el hover queda "pegado" en la última opción tocada */
@media (hover: hover) {
  .opcion-item:hover { background: var(--o-rojo-fondo, #fff5f5); }
}

/* Cada opción elegida: casillero completo en rojo + checkbox rojo, para que se vea si quedó más de una marcada */
.opcion-item.elegida {
  background: var(--o-rojo-fondo, #fff5f5);
  border-color: var(--o-rojo, #dc2626) !important;
  box-shadow: 0 0 0 1px var(--o-rojo, #dc2626) !important;
}
.opcion-item.elegida .text-dark { color: var(--o-rojo-texto, #b91c1c) !important; font-weight: 600; }
.opcion-item .form-check-input:checked {
  background-color: #dc2626;
  border-color: #dc2626;
}
.opcion-item .form-check-input:focus { box-shadow: 0 0 0 0.2rem rgba(220, 38, 38, 0.25); border-color: #dc2626; }

.espacio-oculto {
  display: inline-block;
  width: 0.27em;
  overflow: hidden;
  opacity: 0;
  vertical-align: bottom;
}
</style>
