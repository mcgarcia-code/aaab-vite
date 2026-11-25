<template>
  <ModalBase
    :show="show"
    titulo="Configuración del Partido"
    icono="settings"
    colorIcono="bg-secondary text-white"
    :hay-cambios="hayCambios"
    @close="emit('close')"
  >
    <div class="p-3">
      <div class="mb-4">
        <label class="fw-bold small text-muted d-block mb-2">⏱ DURACIÓN DE CADA TIEMPO (minutos)</label>
        <input
          v-model="tiempo"
          aria-label="Duración de cada tiempo (minutos)"
          type="number"
          class="form-control form-control-lg text-center fw-bold"
          min="1"
          max="60"
        />
        <div class="form-text">Actualmente: {{ actualTiempo }} min — IHF estándar: 30 min</div>
      </div>
      <div class="mb-4">
        <label class="fw-bold small text-muted d-block mb-2">⚡ DURACIÓN DE CADA PRÓRROGA (minutos)</label>
        <input
          v-model="prorroga"
          aria-label="Duración de cada prórroga (minutos)"
          type="number"
          class="form-control form-control-lg text-center fw-bold"
          min="1"
          max="15"
        />
        <div class="form-text">Actualmente: {{ actualProrroga }} min — IHF estándar: 5 min</div>
      </div>
      <div class="mb-4">
        <label class="fw-bold small text-muted d-block mb-2">🔄 RONDAS DE PRÓRROGA</label>
        <div class="d-flex flex-column gap-2">
          <div
            v-for="op in OPCIONES_RONDAS"
            :key="op.valor"
            class="form-check p-3 rounded-3 border cursor-pointer"
            :class="rondas === op.valor ? 'bg-secondary-subtle border-secondary' : 'bg-light'"
            @click="emit('update:rondas', op.valor)"
          >
            <input :id="'ot' + op.valor" class="form-check-input" type="radio" :checked="rondas === op.valor" :value="op.valor" @change="emit('update:rondas', op.valor)">
            <label class="form-check-label fw-bold cursor-pointer" :for="'ot' + op.valor">
              {{ op.titulo }}
              <span class="d-block text-muted fw-normal small">{{ op.detalle }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="alert alert-warning small mb-0">
        <i class="bi bi-exclamation-triangle-fill me-1"></i>
        Los cambios se aplican inmediatamente. La configuración se preserva al reiniciar el partido.
      </div>
    </div>
    <template #footer="{ cerrar }">
      <button type="button" class="btn btn-light border rounded-pill fw-bold px-4" @click="cerrar">CANCELAR</button>
      <button type="button" class="btn btn-danger rounded-pill fw-bold px-4 shadow-sm" @click="emit('guardar')">GUARDAR</button>
    </template>
  </ModalBase>
</template>

<script setup>
import { computed } from 'vue'
import ModalBase from '@/components/ModalBase.vue'

// Duración de los tiempos y de la prórroga, y rondas de prórroga (Fe.Me.Bal o internacional).
// v-model:minutos-tiempo, v-model:minutos-prorroga y v-model:rondas
const props = defineProps({
  show: { type: Boolean, default: false },
  hayCambios: { type: Boolean, default: false },
  minutosTiempo: { type: [Number, String], default: 30 },
  minutosProrroga: { type: [Number, String], default: 5 },
  rondas: { type: Number, default: 1 },
  actualTiempo: { type: Number, default: 30 },
  actualProrroga: { type: Number, default: 5 }
})

const emit = defineEmits(['close', 'guardar', 'update:minutosTiempo', 'update:minutosProrroga', 'update:rondas'])

const tiempo = computed({ get: () => props.minutosTiempo, set: (v) => emit('update:minutosTiempo', v) })
const prorroga = computed({ get: () => props.minutosProrroga, set: (v) => emit('update:minutosProrroga', v) })

const OPCIONES_RONDAS = [
  { valor: 1, titulo: '1 ronda', detalle: "Fe.Me.Bal— 5'+5' (un solo período doble)" },
  { valor: 2, titulo: '2 rondas', detalle: "Internacional — 5'+5', luego 5'+5' si sigue empatado" }
]
</script>
