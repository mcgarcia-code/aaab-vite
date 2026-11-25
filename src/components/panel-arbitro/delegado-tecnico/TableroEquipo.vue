<template>
  <div class="bg-white p-2 p-md-4 rounded-4 border shadow-sm h-100 d-flex flex-column text-center">
    <div class="mb-2">
      <select
        v-model="club"
        :aria-label="equipo === 'local' ? 'Club local' : 'Club visitante'"
        class="form-select form-select-sm fw-bold text-center border-0 bg-light shadow-sm text-uppercase selector-club"
      >
        <option value="" disabled>{{ equipo === 'local' ? 'SELECCIONAR LOCAL' : 'SELECCIONAR VISITA' }}</option>
        <option v-for="c in clubes" :key="c.club_id" :value="c.club_id">
          {{ c.club_nombre }}
        </option>
      </select>
    </div>

    <div class="score-display text-dark">{{ goles }}</div>

    <!-- Jugadores descalificados -->
    <div v-if="descalificados.length > 0" class="mb-2 d-flex flex-wrap gap-1 justify-content-center">
      <span
        v-for="p in descalificados"
        :key="p.playerNumber"
        class="badge text-white px-2 py-1"
        :class="p.reason === 'blue_card' ? 'descalificado-azul' : 'descalificado-roja'"
        :title="`#${p.playerNumber} descalificado (${p.reason === 'blue_card' ? 'Azul' : 'Roja'})`"
      >
        🚫 #{{ p.playerNumber }}
      </span>
    </div>

    <div class="d-flex justify-content-center align-items-center gap-2 mb-3 min-h-24">
      <span v-if="jugadoresMenos > 0" class="estado-pill estado-rojo">⚠️ -{{ jugadoresMenos }}</span>
      <div class="d-flex gap-1" :title="`${timeoutsUsados} de 3 TTO usados`">
        <span v-for="n in 3" :key="n" class="dot" :class="{ 'used': timeoutsUsados >= n }"></span>
      </div>
    </div>

    <div class="d-flex flex-column gap-2 flex-grow-1 justify-content-end">
      <div class="d-flex gap-1 w-100">
        <button type="button" class="btn btn-action bg-orange text-white w-50" :disabled="goles === 0 || finalizado" @click="emit('restar')">
          <span class="fs-5 lh-1">➖</span><span class="d-none d-md-inline fw-bold text-uppercase ms-1 small">Restar</span>
        </button>
        <button type="button" class="btn btn-action bg-success text-white w-50" :disabled="finalizado" @click="emit('gol')">
          <span class="fs-5 lh-1">⚽</span><span class="d-none d-md-inline fw-bold text-uppercase ms-1 small">Gol</span>
        </button>
      </div>
      <button
        v-for="s in SANCIONES"
        :key="s.tipo"
        type="button"
        class="btn btn-action w-100"
        :class="s.clase"
        :disabled="finalizado"
        @click="emit('sancion', s.tipo)"
      >
        <span class="fs-5 lh-1">{{ s.icono }}</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">{{ s.etiqueta }}</span>
      </button>
      <button type="button" class="btn btn-action btn-tto text-white w-100" :disabled="!puedeTto || finalizado" @click="emit('tto')">
        <span class="fs-5 lh-1">🟩</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">TTO</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Tablero de un equipo (local o visita): club, goles, descalificados, jugadores de menos,
// TTO usados y botones de gol / sanciones / TTO. Las acciones las resuelve usePlanillaDelegado.
const props = defineProps({
  equipo: { type: String, required: true, validator: v => ['local', 'visitor'].includes(v) },
  clubId: { type: [String, Number], default: '' },
  clubes: { type: Array, default: () => [] },
  goles: { type: Number, default: 0 },
  descalificados: { type: Array, default: () => [] },
  jugadoresMenos: { type: Number, default: 0 },
  timeoutsUsados: { type: Number, default: 0 },
  puedeTto: { type: Boolean, default: false },
  finalizado: { type: Boolean, default: false }
})

const emit = defineEmits(['update:clubId', 'gol', 'restar', 'sancion', 'tto'])

const club = computed({
  get: () => props.clubId,
  set: (valor) => emit('update:clubId', valor)
})

const SANCIONES = [
  { tipo: 'yellow_card', etiqueta: 'Amarilla', icono: '🟨', clase: 'bg-yellow text-dark' },
  { tipo: '2_min', etiqueta: '2 Minutos', icono: '✌️', clase: 'bg-orange text-white' },
  { tipo: 'red_card', etiqueta: 'Roja', icono: '🟥', clase: 'bg-danger text-white' },
  { tipo: 'blue_card', etiqueta: 'Azul', icono: '🟦', clase: 'bg-secondary text-white' }
]
</script>

<style scoped>
.selector-club { font-size: 1rem; color: var(--o-texto, #212529); }

.score-display {
  font-size: clamp(3rem, 10vw, 4rem);
  font-weight: 900;
  margin-bottom: 5px;
  line-height: 1;
}

.descalificado-azul { background: #1d4ed8; }
.descalificado-roja { background: #991b1b; }

.min-h-24 { min-height: 24px; }
.dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #94a3b8; background: transparent; }
.dot.used { background: #16a34a; border-color: #15803d; }

/* Botones de acción del equipo */
.btn-action {
  border: none;
  border-radius: 8px;
  padding: 10px 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.1s, filter 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.btn-action:active { transform: scale(0.98); }
.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }

/* Colores específicos para tarjetas y acciones */
.bg-orange { background-color: #f97316 !important; }
.bg-yellow { background-color: #facc15 !important; }

.btn-tto { background: #16a34a; border: 2px dashed #14532d; }
.btn-tto:disabled { background: var(--o-chip, #e2e8f0); color: var(--o-texto-suave, #94a3b8) !important; border-color: var(--o-borde, #cbd5e1); cursor: not-allowed; }
</style>
