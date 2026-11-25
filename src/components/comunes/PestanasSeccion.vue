<template>
  <ul class="nav pestanas-seccion" :class="{ llenar }" role="tablist">
    <li v-for="p in pestanas" :key="p.clave" class="nav-item" role="presentation">
      <button
        type="button"
        class="nav-link"
        :class="{ active: modelValue === p.clave }"
        role="tab"
        :aria-selected="modelValue === p.clave"
        @click="emit('update:modelValue', p.clave)"
      >
        <i v-if="p.icono" :class="['bi', p.icono]" aria-hidden="true"></i>
        <span>{{ p.etiqueta }}</span>
        <span v-if="p.cantidad !== undefined && p.cantidad !== null" class="pestana-cantidad">{{ p.cantidad }}</span>
      </button>
    </li>
  </ul>
</template>

<script setup>
// Pestañas de las secciones, iguales en todo el sitio.
// Uso: <PestanasSeccion v-model="pestana" :pestanas="[{ clave, etiqueta, icono?, cantidad? }]" />
//  - icono: clase de Bootstrap Icons (bi-…)
//  - cantidad: número que se muestra en una pastilla (null o sin definir: no se muestra)
//  - llenar: en celular las pestañas ocupan todo el ancho, repartido en partes iguales
// El margen se pone desde afuera (class="mb-3"), como cualquier otro bloque.
defineProps({
  modelValue: { type: [String, Number], default: null },
  pestanas: { type: Array, required: true },
  llenar: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.pestanas-seccion {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: thin;
  padding-bottom: 2px;
}

.pestanas-seccion .nav-item { flex-shrink: 0; }

.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 0.45rem 1rem;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 50rem;
  background: var(--o-chip, #f1f5f9);
  color: var(--o-texto-medio, #475569);
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
  transition: background-color 0.15s, color 0.15s;
}

.nav-link:hover:not(.active) {
  background: var(--o-superficie, #e2e8f0);
  color: var(--o-texto, #0f172a);
}

.nav-link.active {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
}

.pestana-cantidad {
  min-width: 1.5em;
  padding: 0.1em 0.5em;
  border-radius: 50rem;
  background: rgba(15, 23, 42, 0.08);
  font-size: 0.7rem;
  line-height: 1.4;
  text-align: center;
}

:root[data-tema="oscuro"] .pestana-cantidad { background: rgba(255, 255, 255, 0.12); }

.nav-link.active .pestana-cantidad { background: rgba(255, 255, 255, 0.25); }

/* En celular, las pestañas reparten el ancho */
@media (max-width: 575.98px) {
  .llenar .nav-item { flex: 1 1 0; }
}
</style>
