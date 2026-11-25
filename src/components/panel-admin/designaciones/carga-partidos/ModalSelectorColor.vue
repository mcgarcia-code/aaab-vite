<template>
  <ModalBase
    :show="show"
    :titulo="titulo"
    icono="label"
    colorIcono="bg-danger text-white"
    maxWidth="420px"
    @close="emit('close')"
  >
    <div class="lista-colores">
      <button type="button" @click="emit('elegir', '')" class="opcion-color">
        <span class="muestra-color muestra-none"></span>
        Sin marca
      </button>
      <button
        v-for="op in opciones"
        :key="op.valor"
        type="button"
        @click="emit('elegir', op.valor)"
        class="opcion-color"
      >
        <span class="muestra-color" :class="'estado-' + op.valor"></span>
        {{ op.etiqueta }}
      </button>
    </div>
  </ModalBase>
</template>

<script setup>
import ModalBase from '@/components/ModalBase.vue'

// Marca de color de un árbitro en un partido (observaciones, reemplazar, cambiar, confirmado, posible).
// elegir: valor de la marca ('' = sin marca)
defineProps({
  show: { type: Boolean, default: false },
  titulo: { type: String, default: '' },
  opciones: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'elegir'])
</script>

<style scoped src="@/components/panel-admin/designaciones/carga-partidos/carga-partidos-compartido.css"></style>
<style scoped>
.lista-colores {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.opcion-color {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  background: var(--o-tarjeta, #fff);
  border: 1px solid var(--o-borde, #f1f3f5);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.85rem;
  color: var(--o-texto, #212529);
  cursor: pointer;
}

.opcion-color:hover {
  background: var(--o-superficie, #f8f9fa);
}

.muestra-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.muestra-none {
  background: repeating-linear-gradient(45deg, var(--o-chip, #f1f3f5), var(--o-chip, #f1f3f5) 4px, var(--o-tarjeta, #fff) 4px, var(--o-tarjeta, #fff) 8px);
}
</style>
