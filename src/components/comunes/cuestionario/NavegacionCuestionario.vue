<template>
  <div>
    <!-- Anterior / Siguiente / Finalizar (apilados invertidos en el celular, a los costados desde tablet) -->
    <div class="d-flex flex-column-reverse flex-sm-row justify-content-between align-items-stretch align-items-sm-center border-top pt-3 gap-2">
      <div class="w-100 w-sm-auto">
        <button v-if="indice > 0" type="button" class="btn btn-outline-secondary rounded-pill px-4 fw-bold w-100 py-2" @click="emit('ir', indice - 1)">
          <i class="bi bi-arrow-left me-2"></i>{{ t.anterior }}
        </button>
      </div>
      <div class="w-100 w-sm-auto">
        <button v-if="indice < preguntas.length - 1" type="button" class="btn btn-danger rounded-pill px-4 py-2 fw-bold w-100" @click="emit('ir', indice + 1)">
          {{ t.siguiente }}<i class="bi bi-arrow-right ms-2"></i>
        </button>
        <button v-else type="button" class="btn btn-danger rounded-pill px-4 py-2 fw-bold w-100 shadow" @click="emit('finalizar')">
          <i class="bi bi-check-circle-fill me-2"></i>{{ t.finalizar }}
        </button>
      </div>
    </div>

    <!-- Navegación rápida -->
    <div class="border-top pt-3 mt-3">
      <small class="text-muted d-block mb-2 fw-bold text-center text-sm-start">
        {{ t.navegacionRapida }} <span class="fw-normal">{{ t.navegacionAyuda }}</span>
      </small>
      <div class="d-flex flex-wrap gap-2 justify-content-center justify-content-sm-start">
        <button v-for="(p, i) in preguntas" :key="p.id" type="button"
                class="btn btn-sm nav-pregunta fw-bold"
                :class="i === indice ? 'btn-danger' : (respondida(p.id) ? 'btn-success' : 'btn-light border')"
                :aria-current="i === indice ? 'step' : undefined"
                @click="emit('ir', i)">
          {{ i + 1 }}
        </button>
      </div>
      <div class="d-flex flex-wrap gap-3 mt-2 justify-content-center justify-content-sm-start small text-muted">
        <span><i class="bi bi-square-fill text-danger me-1"></i>{{ t.actual }}</span>
        <span><i class="bi bi-square-fill text-success me-1"></i>{{ t.respondidaLeyenda }}</span>
        <span><i class="bi bi-square text-secondary me-1"></i>{{ t.sinResponder }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTextosCatalogo } from '@/composables/textosCatalogo'

// Botones Anterior / Siguiente / Finalizar y navegación rápida por número de pregunta.
// Común al examen online, la práctica del catálogo y el catálogo público.
// ir(i): ir a la pregunta i. finalizar: tocaron Finalizar en la última (cada runner pide confirmación)
const props = defineProps({
  preguntas: { type: Array, default: () => [] },     // [{ id }]
  indice: { type: Number, default: 0 },
  seleccion: { type: Object, default: () => ({}) },  // { idPregunta: [idsOpcion] }
  idioma: { type: String, default: 'es' }
})
const emit = defineEmits(['ir', 'finalizar'])

const t = useTextosCatalogo(() => props.idioma)

const respondida = (idPregunta) => (props.seleccion[idPregunta] || []).length > 0
</script>

<style scoped>
.nav-pregunta {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
