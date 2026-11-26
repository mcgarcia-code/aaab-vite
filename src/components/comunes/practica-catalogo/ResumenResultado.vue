<template>
  <div class="text-center">
    <div class="nota-circulo mx-auto mb-3" :class="aprobado ? 'nota-bien' : 'nota-mal'">
      <span class="nota-valor">{{ Math.round(resultado.calificacion) }}%</span>
    </div>
    <h2 class="fw-bold fs-4 mb-3" :class="aprobado ? 'text-success' : 'text-danger'">
      <i class="bi me-1" :class="aprobado ? 'bi-trophy-fill' : 'bi-journal-bookmark-fill'"></i>
      {{ aprobado ? t.muyBien : t.aSeguir }}
    </h2>
    <div class="row g-2 justify-content-center">
      <div class="col-6 col-sm-4">
        <div class="dato-resumen rounded-3 border py-2 px-1">
          <span class="d-block fw-bold fs-5 text-dark">{{ resultado.correctas }} / {{ resultado.total }}</span>
          <small class="text-muted">{{ t.preguntasCorrectas }}</small>
        </div>
      </div>
      <div class="col-6 col-sm-4">
        <div class="dato-resumen rounded-3 border py-2 px-1">
          <span class="d-block fw-bold fs-5 text-dark">{{ resultado.puntaje }} / {{ resultado.posible }}</span>
          <small class="text-muted">{{ t.puntaje }}</small>
        </div>
      </div>
    </div>
    <p class="small text-muted mt-3 mb-0">
      <i class="bi bi-info-circle me-1"></i>{{ t.comoSeCorrige }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { UMBRAL_APROBADO } from '@/composables/usePracticaCatalogo'
import { useTextosCatalogo } from '@/composables/textosCatalogo'

const props = defineProps({
  // { calificacion, correctas, total, puntaje, posible }
  resultado: { type: Object, required: true },
  idioma: { type: String, default: 'es' }
})

const t = useTextosCatalogo(() => props.idioma)

const aprobado = computed(() => Number(props.resultado.calificacion) >= UMBRAL_APROBADO)
</script>

<style scoped>
.nota-circulo {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 8px solid;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nota-bien { border-color: var(--o-verde, #198754); color: var(--o-verde, #198754); }
.nota-mal { border-color: var(--o-rojo, #dc2626); color: var(--o-rojo, #dc2626); }
.nota-valor { font-size: 1.75rem; font-weight: 800; }
.dato-resumen { background: var(--o-chip, #f8fafc); }
</style>
