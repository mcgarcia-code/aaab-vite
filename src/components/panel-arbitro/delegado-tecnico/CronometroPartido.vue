<template>
  <div
    class="bg-dark text-white p-3 p-md-4 rounded-4 shadow-sm text-center mb-3 mb-md-4 border"
    :class="enProrroga ? 'border-warning' : 'border-secondary'"
  >
    <!-- Período actual -->
    <div
      class="text-uppercase fw-bold small mb-2 d-flex align-items-center justify-content-center gap-2 espaciado-1"
      :class="enProrroga ? 'text-warning' : 'text-white'"
    >
      {{ textoPeriodo }}
      <span v-if="enProrroga" class="estado-pill estado-ambar">PRÓRROGA</span>
    </div>

    <!-- Reloj clickeable -->
    <div
      class="time-display cursor-pointer"
      :class="{ 'text-danger': !corriendo }"
      title="Ajustar cronómetro"
      @click="emit('ajustar')"
    >
      {{ tiempo }}
    </div>

    <div class="d-flex flex-column gap-2 mt-2">
      <button
        type="button"
        class="btn btn-danger rounded-pill w-100 py-2 py-md-3 fw-bold fs-5 shadow-sm"
        :disabled="state.activeTTO !== null || finalizado || state.breakActive"
        @click="emit('iniciar-pausar')"
      >
        {{ corriendo ? '⏸ PAUSAR' : '▶ INICIAR' }}
      </button>
      <div class="row g-2">
        <div class="col-6 col-md-4">
          <button type="button" class="btn btn-secondary w-100 fw-bold small py-2" :disabled="state.breakActive" @click="emit('cambiar-sentido')">
            ⏱ {{ state.isCountdown ? 'Regresivo' : 'Progresivo' }}
          </button>
        </div>
        <div class="col-6 col-md-8 d-flex gap-2">
          <button
            type="button"
            class="btn btn-secondary w-100 fw-bold small py-2"
            :disabled="corriendo || state.period === 1 || finalizado"
            @click="emit('anterior')"
          >
            ⏮ Volver
          </button>
          <button
            type="button"
            class="btn btn-secondary w-100 fw-bold small py-2"
            :disabled="corriendo || finalizado || state.breakActive"
            @click="emit('siguiente')"
          >
            ⏭ Sig.
          </button>
        </div>
      </div>
    </div>

    <!-- TTO activo -->
    <div v-if="state.activeTTO" class="bg-success text-white mt-3 p-2 rounded-3 fw-bold border border-success d-flex justify-content-between align-items-center">
      <div>
        <span class="me-1">🟩</span> TTO ({{ state.activeTTO.team === 'local' ? 'L' : 'V' }}):
        <strong>{{ state.activeTTO.timeRemaining }}s</strong>
      </div>
      <button type="button" class="btn btn-danger btn-sm fw-bold px-3 py-1 rounded-pill" @click="emit('cortar-tto')">❌ Cortar</button>
    </div>

    <!-- Descanso activo (entre tiempos de prórroga) -->
    <div
      v-if="state.breakActive"
      class="descanso mt-3 p-3 rounded-3 fw-bold text-center text-white"
      :class="state.breakType === 'ot_half' ? 'descanso-tiempos' : 'descanso-prorrogas'"
    >
      <div class="text-uppercase small mb-1 espaciado-1 opacity-75">
        {{ state.breakType === 'ot_half' ? '⏸ Descanso entre tiempos' : '⏸ Descanso entre prórrogas' }}
      </div>
      <div class="display-6 fw-bold font-monospace">
        {{ formatPenaltyTime(state.breakTimeRemaining) }}
      </div>
      <div class="small mt-1 opacity-75">
        {{ state.breakType === 'ot_half' ? '1 minuto reglamentario' : '5 minutos reglamentarios' }}
      </div>
      <button type="button" class="btn btn-outline-light btn-sm rounded-pill fw-bold mt-2 px-4" @click="emit('saltar-descanso')">
        ⏩ Saltar descanso
      </button>
    </div>

    <!-- Exclusiones activas -->
    <div v-if="state.activePenalties.length > 0" class="mt-3 pt-3 border-top border-secondary">
      <h4 class="text-uppercase text-muted small fw-bold mb-2 espaciado-1">
        Exclusiones Activas
        <span class="text-muted fw-light ms-1 texto-065">(toca para editar)</span>
      </h4>
      <div class="d-flex flex-wrap gap-2 justify-content-center">
        <button
          v-for="penalty in state.activePenalties"
          :key="penalty.id"
          type="button"
          class="penalty-box"
          :class="penalty.team"
          title="Toca para corregir el tiempo"
          @click="emit('editar-exclusion', penalty)"
        >
          <span class="penalty-team">{{ penalty.team === 'local' ? 'L' : 'V' }}</span>
          <span class="penalty-player">#{{ penalty.playerNumber }}</span>
          <span class="penalty-time">{{ formatPenaltyTime(penalty.timeRemaining) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatPenaltyTime } from '@/components/panel-arbitro/delegado-tecnico/ayudasPlanilla'

// Cronómetro del partido: reloj, período, TTO, descanso de prórroga y exclusiones activas.
// Las acciones las resuelve usePlanillaDelegado (vía DelegadosTecnicos).
const props = defineProps({
  state: { type: Object, required: true },
  corriendo: { type: Boolean, default: false },
  tiempo: { type: String, default: '00:00' },
  textoPeriodo: { type: String, default: '' }
})

const emit = defineEmits(['ajustar', 'iniciar-pausar', 'cambiar-sentido', 'anterior', 'siguiente', 'cortar-tto', 'saltar-descanso', 'editar-exclusion'])

const enProrroga = computed(() => props.state.period >= 3)
const finalizado = computed(() => props.state.matchStatus === 'finished')
</script>

<style scoped>
.time-display {
  font-size: clamp(3.5rem, 12vw, 5rem);
  font-weight: 900;
  font-family: 'Courier New', monospace;
  line-height: 1;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

/* Descanso entre tiempos (1 min) y entre prórrogas (5 min) */
.descanso-tiempos { background: #0dcaf0; border: 1px solid #0dcaf0; }
.descanso-prorrogas { background: #6f42c1; border: 1px solid #6f42c1; }

/* Exclusiones activas */
.penalty-box { background: #1e293b; padding: 4px 10px; border-radius: 8px; font-family: monospace; font-size: 0.9rem; display: flex; gap: 8px; border: 1px solid #475569; font-weight: bold; cursor: pointer; }
.penalty-box.local { border-color: #dc2626; color: #fca5a5; }
.penalty-box.visitor { border-color: #3b82f6; color: #bfdbfe; }
</style>
