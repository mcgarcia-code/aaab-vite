<template>
  <ModalBase
    :show="show"
    :titulo="titulo"
    icono="sports"
    colorIcono="bg-danger text-white"
    maxWidth="500px"
    :zIndex="zIndex"
    @close="emit('close')"
  >
    <input
      v-model="texto"
      aria-label="Buscar por apellido o nombre"
      type="text"
      class="form-control shadow-none border-secondary-subtle mb-3"
      placeholder="BUSCAR POR APELLIDO O NOMBRE..."
    >

    <div class="lista-arbitros border rounded">
      <button type="button" @click="emit('asignar', null)" class="opcion-arbitro text-danger fw-bold">
        — Sin asignar —
      </button>

      <button
        v-if="permiteSinArbitro"
        type="button"
        @click="emit('sin-arbitro')"
        class="opcion-arbitro text-secondary fw-bold d-flex align-items-center gap-2"
      >
        <i class="bi bi-person-x texto-16px"></i>
        {{ textoSinArbitro }}
      </button>

      <button
        v-if="texto.trim() && arbitros.length === 0"
        type="button"
        @click="emit('externo', texto)"
        class="opcion-arbitro text-danger fw-bold d-flex align-items-center gap-2"
      >
        <i class="bi bi-person-plus texto-16px"></i>
        Usar "{{ texto.trim().toUpperCase() }}" (árbitro externo)
      </button>

      <button
        v-for="a in arbitros"
        :key="a.id"
        type="button"
        @click="emit('asignar', a)"
        class="opcion-arbitro"
      >
        {{ a.apellido }}, {{ a.nombre }}
      </button>

      <button
        v-if="texto.trim() && arbitros.length > 0"
        type="button"
        @click="emit('externo', texto)"
        class="opcion-arbitro text-danger d-flex align-items-center gap-2 border-top"
      >
        <i class="bi bi-person-plus texto-16px"></i>
        Usar "{{ texto.trim().toUpperCase() }}" como árbitro externo
      </button>
    </div>

    <p class="text-muted small mt-2 mb-0">
      <i class="bi bi-info-circle me-1"></i>
      Si el árbitro no está en el padrón (ej: viene del interior), escribí su nombre y usá la opción en rojo. Queda designado pero no le aparece en su panel.
    </p>
  </ModalBase>
</template>

<script setup>
import { computed } from 'vue'
import ModalBase from '@/components/ModalBase.vue'

// Elegir árbitro (o persona de mesa / observador) para un partido.
//  - v-model:busqueda: texto del buscador (el filtrado lo hace CargaPartidos)
//  - arbitros: lista ya filtrada
//  - asignar: árbitro elegido (null = sin asignar) · sin-arbitro: "Sin Árbitro" · externo: nombre escrito a mano
const props = defineProps({
  show: { type: Boolean, default: false },
  titulo: { type: String, default: '' },
  zIndex: { type: [Number, String], default: undefined },
  busqueda: { type: String, default: '' },
  arbitros: { type: Array, default: () => [] },
  permiteSinArbitro: { type: Boolean, default: false },
  textoSinArbitro: { type: String, default: 'Sin Árbitro' }
})

const emit = defineEmits(['close', 'asignar', 'sin-arbitro', 'externo', 'update:busqueda'])

const texto = computed({
  get: () => props.busqueda,
  set: (valor) => emit('update:busqueda', valor)
})
</script>

<style scoped>
.lista-arbitros {
  max-height: 50vh;
  overflow-y: auto;
}

.opcion-arbitro {
  display: block;
  width: 100%;
  text-align: left;
  background: var(--o-tarjeta, #fff);
  border: none;
  border-bottom: 1px solid var(--o-borde, #f1f3f5);
  padding: 8px 12px;
  font-size: 0.85rem;
  color: var(--o-texto, #212529);
  cursor: pointer;
}

.opcion-arbitro:hover {
  background: var(--o-rojo-fondo, #fef2f2);
}
</style>
