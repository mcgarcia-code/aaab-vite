<template>
  <div class="bg-white border rounded-4 shadow-sm p-3 p-md-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
      <h3 class="m-0 fs-5 fw-bold text-dark">Eventos</h3>
      <span class="estado-pill" :class="pendientes > 0 ? 'estado-ambar' : 'estado-verde'">
        {{ pendientes > 0 ? '☁️ Sincronizando...' : '✅ Sincronizado' }}
      </span>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-12 col-md-9">
        <select v-model="filtroLocal" aria-label="Filtrar eventos del partido" class="form-select bg-light shadow-none">
          <option value="all">Todos los eventos</option>
          <option value="goals">Goles</option>
          <option value="sanctions">Sanciones</option>
        </select>
      </div>
      <div class="col-12 col-md-3">
        <button type="button" class="btn btn-secondary w-100 fw-bold d-flex align-items-center justify-content-center gap-2" @click="emit('descargar')">
          <i class="bi bi-download"></i> Txt
        </button>
      </div>
    </div>

    <div class="border rounded bg-light overflow-hidden overflow-y-auto lista-eventos">
      <ul class="list-group list-group-flush mb-0">
        <li
          v-for="event in eventos"
          :key="event.id"
          class="list-group-item bg-transparent d-flex justify-content-between align-items-center py-2 px-3"
        >
          <div class="small">
            <span class="text-muted fw-bold font-monospace me-2">[{{ event.match_time }}]</span>
            <strong class="text-dark">{{ letraEquipo(event.team) }}</strong>
            <span v-if="event.player_number && event.type !== 'goal_removed' && event.type !== 'tiempo_ajustado'" class="text-dark"> (#{{ event.player_number }})</span><span class="text-dark">:</span>
            <span class="text-secondary ms-1">{{ formatEventType(event.type) }}</span>
            <span v-if="event.type === 'tiempo_ajustado'" class="text-muted small ms-1">- {{ event.player_number }}</span>
            <span v-if="!event.synced" class="estado-pill estado-pendiente ms-2">Pendiente</span>
          </div>
          <button
            v-if="event.team !== 'sistema'"
            type="button"
            class="btn btn-sm btn-light border text-danger p-1 lh-1"
            title="Eliminar"
            aria-label="Eliminar evento"
            @click="emit('eliminar', event)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </li>
        <li v-if="eventos.length === 0" class="list-group-item bg-transparent text-center text-muted py-4 small">
          Sin registros en la bitácora.
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatEventType, letraEquipo } from '@/components/panel-arbitro/delegado-tecnico/ayudasPlanilla'

// Bitácora del partido: filtro, estado de sincronización, descarga en .txt y borrado de eventos.
// v-model:filtro → 'all' | 'goals' | 'sanctions'
const props = defineProps({
  eventos: { type: Array, default: () => [] },
  filtro: { type: String, default: 'all' },
  pendientes: { type: Number, default: 0 }
})

const emit = defineEmits(['update:filtro', 'descargar', 'eliminar'])

const filtroLocal = computed({
  get: () => props.filtro,
  set: (valor) => emit('update:filtro', valor)
})
</script>

<style scoped>
.lista-eventos { max-height: 250px; }
</style>
