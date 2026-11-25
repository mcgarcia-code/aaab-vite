<template>
  <!-- Apariencia: claro, oscuro o automático (sigue al dispositivo) -->
  <div v-if="temaDisponible" :class="['selector-tema', { compacto }]">
    <p v-if="!compacto" class="selector-titulo">Apariencia</p>
    <div class="selector-opciones" role="group" aria-label="Apariencia">
      <button
        v-for="op in OPCIONES"
        :key="op.valor"
        type="button"
        :class="['selector-opcion', { elegida: modo === op.valor }]"
        :aria-pressed="modo === op.valor"
        :title="op.etiqueta"
        @click="elegirModo(op.valor)"
      >
        <i :class="['bi', op.icono]" aria-hidden="true"></i>
        <span>{{ op.etiqueta }}</span>
      </button>
    </div>
    <p v-if="!compacto" class="selector-ayuda">{{ ayuda }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTema } from '@/composables/useTema'

// compacto: versión del menú lateral de escritorio (sin título ni ayuda)
defineProps({
  compacto: { type: Boolean, default: false }
})

const { modo, temaEfectivo, temaDisponible, elegirModo } = useTema()

const OPCIONES = [
  { valor: 'claro', etiqueta: 'Claro', icono: 'bi-sun' },
  { valor: 'oscuro', etiqueta: 'Oscuro', icono: 'bi-moon' },
  { valor: 'auto', etiqueta: 'Automático', icono: 'bi-phone' }
]

const ayuda = computed(() => {
  if (modo.value === 'claro') return 'La app se ve siempre clara.'
  if (modo.value === 'oscuro') return 'La app se ve siempre oscura.'
  return `Sigue la configuración de tu dispositivo (ahora: ${temaEfectivo.value}).`
})
</script>

<style scoped>
.selector-tema {
  background: var(--t-tarjeta);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selector-titulo {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--t-texto-medio);
}

.selector-opciones {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: var(--t-chip);
}

.selector-opcion {
  min-height: 56px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--t-texto-medio);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  transition: background-color 0.15s, color 0.15s;
}
.selector-opcion .bi { font-size: 1.1rem; }
.selector-opcion:hover { color: var(--t-texto); }
.selector-opcion.elegida {
  background: var(--t-tarjeta);
  color: var(--t-icono-texto);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.15);
}
.selector-opcion:focus-visible { outline: 2px solid var(--t-icono-texto); outline-offset: 1px; }

.selector-ayuda {
  margin: 0;
  font-size: 0.8rem;
  color: var(--t-texto-medio);
}

/* ── Menú lateral de escritorio: tres íconos en fila, sobre la barra ── */
.selector-tema.compacto {
  background: transparent;
  padding: 0;
}
.compacto .selector-opciones { background: var(--t-barra-elevado); }
.compacto .selector-opcion {
  min-height: 36px;
  color: var(--t-barra-texto-suave);
}
.compacto .selector-opcion span { display: none; }
.compacto .selector-opcion:hover { color: var(--t-barra-texto); }
.compacto .selector-opcion.elegida {
  background: var(--t-barra-fondo);
  color: var(--t-barra-acento);
}
</style>
