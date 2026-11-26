<template>
  <div>
    <!-- Filtro: todas / solo las erradas -->
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom pb-2 mb-3">
      <h5 class="fw-bold text-dark m-0 fs-6 fs-md-5">{{ t.revisionDetallada }}</h5>
      <div class="btn-group btn-group-sm" role="group" aria-label="Filtrar preguntas">
        <button type="button" class="btn fw-bold" :class="soloErradas ? 'btn-outline-danger' : 'btn-danger'" @click="soloErradas = false">
          {{ t.todas }} ({{ revision.length }})
        </button>
        <button type="button" class="btn fw-bold" :class="soloErradas ? 'btn-danger' : 'btn-outline-danger'" @click="soloErradas = true">
          {{ t.erradas }} ({{ cantidadErradas }})
        </button>
      </div>
    </div>

    <p v-if="!visibles.length" class="text-center text-muted fw-bold py-4 m-0">
      <i class="bi bi-emoji-smile d-block fs-2 mb-2 text-success"></i>{{ t.ningunaErrada }}
    </p>

    <div v-for="r in visibles" :key="r.clave" class="card border-0 bg-light shadow-sm rounded-4 mb-3 tarjeta-revision" :class="r.correcta ? 'borde-bien' : 'borde-mal'">
      <div class="card-body p-3 p-md-4">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-2 small">
          <span class="badge rounded-pill" :class="r.correcta ? 'bg-success' : 'bg-danger'">
            <i class="bi me-1" :class="r.correcta ? 'bi-check-lg' : 'bi-x-lg'"></i>{{ r.correcta ? t.correcta : (r.respondida ? t.incorrecta : t.sinResponder) }}
          </span>
          <span v-if="r.codigo" class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">{{ textoNumeroPregunta(r, t.regla) }}</span>
        </div>
        <h6 class="fw-bold text-dark mb-3 fs-6 lh-base text-break"><span class="text-danger">{{ r.numero }}.</span> {{ r.texto }}</h6>
        <div class="d-flex flex-column gap-2">
          <div v-for="(o, j) in r.opciones" :key="j"
               class="list-group-item rounded-3 border d-flex align-items-start px-3 py-2"
               :class="claseOpcion(o)">
            <i class="bi me-2 mt-1 flex-shrink-0" :class="iconoOpcion(o)"></i>
            <span class="small text-break lh-sm mt-1">{{ o.texto }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex flex-wrap gap-3 small text-muted mt-2">
      <span><i class="bi bi-check-circle-fill text-success me-1"></i>{{ t.elegidaCorrecta }}</span>
      <span><i class="bi bi-x-circle-fill text-danger me-1"></i>{{ t.elegidaIncorrecta }}</span>
      <span><i class="bi bi-exclamation-circle-fill text-warning me-1"></i>{{ t.correctaNoElegida }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { textoNumeroPregunta } from '@/utils/cuestionarios'
import { useTextosCatalogo } from '@/composables/textosCatalogo'

// Revisión de la práctica, el catálogo público y los exámenes online (asamblea y curso)
const props = defineProps({
  // [{ id, codigo, subcodigo, texto, correcta, respondida, opciones: [{ texto, es_correcta, elegida }] }]
  // id, codigo, correcta y respondida son opcionales: si no vienen, se calculan con las opciones
  revision: { type: Array, default: () => [] },
  idioma: { type: String, default: 'es' }
})

const t = useTextosCatalogo(() => props.idioma)

const soloErradas = ref(false)

// Correcta: marcó exactamente las opciones correctas
const calcularCorrecta = (opciones = []) => opciones.every(o => !!o.elegida === !!Number(o.es_correcta))

const numeradas = computed(() => props.revision.map((r, i) => ({
  ...r,
  numero: i + 1,
  clave: r.id ?? i,
  correcta: r.correcta ?? calcularCorrecta(r.opciones),
  respondida: r.respondida ?? (r.opciones || []).some(o => o.elegida)
})))
const cantidadErradas = computed(() => numeradas.value.filter(r => !r.correcta).length)
const visibles = computed(() => soloErradas.value ? numeradas.value.filter(r => !r.correcta) : numeradas.value)

const claseOpcion = (o) => {
  const correcta = !!Number(o.es_correcta)
  if (o.elegida && correcta) return 'list-group-item-success border-success text-success fw-bold'
  if (!o.elegida && correcta) return 'list-group-item-warning border-warning text-dark'
  if (o.elegida && !correcta) return 'list-group-item-danger border-danger text-danger fw-bold'
  return 'bg-white text-muted'
}

const iconoOpcion = (o) => {
  const correcta = !!Number(o.es_correcta)
  if (o.elegida && correcta) return 'bi-check-circle-fill'
  if (!o.elegida && correcta) return 'bi-exclamation-circle-fill text-warning'
  if (o.elegida && !correcta) return 'bi-x-circle-fill'
  return 'bi-circle opacity-25'
}
</script>

<style scoped>
.tarjeta-revision { border-left: 4px solid transparent !important; }
.borde-bien { border-left-color: var(--o-verde, #198754) !important; }
.borde-mal { border-left-color: var(--o-rojo, #dc2626) !important; }
</style>
