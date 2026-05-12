<template>
  <div class="panel-card delegados-sheet">
    <div class="header-controls">
      <h2>Planilla Digital</h2>
      <button class="btn-danger small-btn" @click="resetMatch">🔄 Reiniciar</button>
    </div>

    <div class="scoreboard-grid">
      <!-- CRONÓMETRO PRINCIPAL (Arriba en mobile) -->
      <div class="timer-column">
        <div class="period-indicator">{{ currentPeriodText }}</div>
        <div class="time-display" :class="{ 'time-paused': !isRunning }">
          {{ formattedTime }}
        </div>
        <div class="timer-controls">
          <button class="btn-primary" @click="toggleTimer">
            {{ isRunning ? '⏸ Pausar' : '▶ Iniciar' }}
          </button>
          <div class="timer-sub-controls">
            <button class="btn-secondary small-btn" @click="toggleDirection">
              ⏱ {{ state.isCountdown ? 'Regresivo' : 'Progresivo' }}
            </button>
            <button class="btn-secondary small-btn" @click="nextPeriod" :disabled="isRunning">
              ⏭ Siguiente
            </button>
          </div>
        </div>

        <!-- CRONÓMETROS DE EXCLUSIÓN (2 Minutos) -->
        <div class="penalties-container" v-if="state.activePenalties.length > 0">
          <h4>Exclusiones Activas</h4>
          <div class="penalty-timers">
            <div
              v-for="penalty in state.activePenalties"
              :key="penalty.id"
              class="penalty-box"
              :class="penalty.team"
            >
              <span class="penalty-team">{{ penalty.team === 'local' ? 'L' : 'V' }}</span>
              <span class="penalty-player">#{{ penalty.playerNumber }}</span>
              <span class="penalty-time">{{ formatPenaltyTime(penalty.timeRemaining) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTROLES DE EQUIPOS -->
      <div class="teams-container">
        <!-- EQUIPO LOCAL -->
        <div class="team-column local">
          <h3>Local</h3>
          <div class="score-display">{{ state.score.local }}</div>
          <div class="action-buttons">
            <div class="goal-controls">
              <button class="btn-goal" @click="registerEvent('local', 'goal')">+1 Gol</button>
              <button class="btn-minus" @click="removeGoal('local')">-1</button>
            </div>
            <button class="btn-yellow" @click="registerEvent('local', 'yellow_card')">Amarilla</button>
            <button class="btn-2min" @click="registerEvent('local', '2_min')">2 Minutos</button>
            <button class="btn-red" @click="registerEvent('local', 'red_card')">Roja</button>
            <button class="btn-blue" @click="registerEvent('local', 'blue_card')">Azul</button>
          </div>
        </div>

        <!-- EQUIPO VISITANTE -->
        <div class="team-column visitor">
          <h3>Visitante</h3>
          <div class="score-display">{{ state.score.visitor }}</div>
          <div class="action-buttons">
            <div class="goal-controls">
              <button class="btn-goal" @click="registerEvent('visitor', 'goal')">+1 Gol</button>
              <button class="btn-minus" @click="removeGoal('visitor')">-1</button>
            </div>
            <button class="btn-yellow" @click="registerEvent('visitor', 'yellow_card')">Amarilla</button>
            <button class="btn-2min" @click="registerEvent('visitor', '2_min')">2 Minutos</button>
            <button class="btn-red" @click="registerEvent('visitor', 'red_card')">Roja</button>
            <button class="btn-blue" @click="registerEvent('visitor', 'blue_card')">Azul</button>
          </div>
        </div>
      </div>
    </div>

    <!-- REGISTRO, FILTRO Y DESCARGA -->
    <div class="event-log-section">
      <div class="log-header">
        <h3>Bitácora de Eventos</h3>
        <button class="btn-sync" @click="syncWithBackend" :disabled="!state.unsyncedEvents.length">
          ☁️ Sincronizar ({{ state.unsyncedEvents.length }})
        </button>
      </div>

      <div class="filter-controls">
        <select v-model="logFilter">
          <option value="all">Todos los eventos</option>
          <option value="goals">Solo Goles</option>
          <option value="sanctions">Solo Sanciones</option>
        </select>
        <button class="btn-download" @click="downloadLog">📥 Descargar Txt</button>
      </div>

      <div class="log-list">
        <ul>
          <li v-for="(event, index) in filteredLog" :key="index">
            <span class="log-time">[{{ event.match_time }}]</span>
            <strong>{{ event.team === 'local' ? 'Local' : 'Visitante' }}</strong>
            <span v-if="event.player_number && event.type !== 'goal_removed'"> (#{{ event.player_number }})</span>:
            {{ formatEventType(event.type) }}
            <span v-if="!event.synced" class="pending-badge">Pendiente</span>
          </li>
          <li v-if="filteredLog.length === 0" class="empty-log">No hay eventos para mostrar.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';

const STORAGE_KEY = 'aaab_delegado_match_state';
const HALF_DURATION_SEC = 30 * 60; // 30 minutos

const state = reactive({
  matchId: 1,
  score: { local: 0, visitor: 0 },
  timeInSeconds: 0,
  period: 1,
  isCountdown: false,
  eventLog: [],
  unsyncedEvents: [],
  activePenalties: [] // Array para los cronómetros de 2 minutos
});

const isRunning = ref(false);
const logFilter = ref('all');
let timerInterval = null;

// --- COMPUTADOS ---
const formattedTime = computed(() => {
  let displaySeconds = state.timeInSeconds;
  if (state.isCountdown) {
    displaySeconds = HALF_DURATION_SEC - state.timeInSeconds;
    if (displaySeconds < 0) displaySeconds = 0;
  }
  const minutes = Math.floor(displaySeconds / 60).toString().padStart(2, '0');
  const seconds = (displaySeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
});

const currentPeriodText = computed(() => state.period === 1 ? '1° Tiempo' : '2° Tiempo');

const filteredLog = computed(() => {
  const reversed = [...state.eventLog].reverse();
  if (logFilter.value === 'goals') {
    return reversed.filter(e => e.type === 'goal' || e.type === 'goal_removed');
  }
  if (logFilter.value === 'sanctions') {
    return reversed.filter(e => ['yellow_card', '2_min', 'red_card', 'blue_card'].includes(e.type));
  }
  return reversed;
});

// --- PERSISTENCIA ---
const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) Object.assign(state, JSON.parse(saved));
};

watch(state, (newState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}, { deep: true });

const resetMatch = () => {
  if (confirm("¿Reiniciar partido? Se borrarán datos no sincronizados.")) {
    if (isRunning.value) toggleTimer();
    Object.assign(state, {
      score: { local: 0, visitor: 0 }, timeInSeconds: 0, period: 1,
      isCountdown: false, eventLog: [], unsyncedEvents: [], activePenalties: []
    });
    localStorage.removeItem(STORAGE_KEY);
  }
};

// --- LÓGICA DEL CRONÓMETRO Y PENALIDADES ---
const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval);
  } else {
    timerInterval = setInterval(() => {
      if (state.timeInSeconds < HALF_DURATION_SEC) {
        state.timeInSeconds++;

        // Bajar el tiempo de las penalidades activas
        state.activePenalties.forEach(penalty => {
          if (penalty.timeRemaining > 0) penalty.timeRemaining--;
        });
        // Limpiar las penalidades que llegaron a 0
        state.activePenalties = state.activePenalties.filter(p => p.timeRemaining > 0);

      } else {
        clearInterval(timerInterval);
        isRunning.value = false;
        alert("¡Fin del tiempo reglamentario!");
      }
    }, 1000);
  }
  isRunning.value = !isRunning.value;
};

const toggleDirection = () => state.isCountdown = !state.isCountdown;

const nextPeriod = () => {
  if (state.period === 1) {
    state.period = 2;
    state.timeInSeconds = 0;
  }
};

const formatPenaltyTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// --- REGISTRO DE EVENTOS ---
const registerEvent = (team, type) => {
  let playerNumber = null;

  // Solo pedimos dorsal si es una sanción
  if (type !== 'goal') {
    playerNumber = prompt(`Ingrese el dorsal del jugador a sancionar (${team === 'local' ? 'Local' : 'Visitante'}):`);
    if (!playerNumber) return; // Si cancela el prompt, no hacemos nada

    // Si es exclusión o descalificación, agregamos 2 minutos (120 seg) al reloj de penalidades
    if (['2_min', 'red_card', 'blue_card'].includes(type)) {
      state.activePenalties.push({
        id: Date.now(),
        team,
        playerNumber,
        timeRemaining: 120
      });
    }
  } else {
    state.score[team]++;
  }

  createLogEntry(team, type, playerNumber);
};

const removeGoal = (team) => {
  if (state.score[team] > 0) {
    state.score[team]--;
    createLogEntry(team, 'goal_removed', null);
  }
};

const createLogEntry = (team, type, playerNumber) => {
  const newEvent = {
    id: Date.now(),
    team,
    player_number: playerNumber,
    type,
    match_time: `${currentPeriodText.value} - ${formattedTime.value}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    synced: false
  };
  state.eventLog.push(newEvent);
  state.unsyncedEvents.push(newEvent);
};

const formatEventType = (type) => {
  const types = {
    goal: '⚽ Gol',
    goal_removed: '❌ Gol Anulado (-1)',
    yellow_card: '🟨 Tarjeta Amarilla',
    '2_min': '✌️ Exclusión 2 Minutos',
    red_card: '🟥 Descalificación',
    blue_card: '🟦 Descalificación (Informe)'
  };
  return types[type] || type;
};

// --- DESCARGA DE BITÁCORA ---
const downloadLog = () => {
  if (filteredLog.value.length === 0) {
    alert("No hay datos para descargar.");
    return;
  }

  let content = `BITÁCORA DE PARTIDO (Filtro: ${logFilter.value})\n`;
  content += `Marcador Final - Local: ${state.score.local} | Visitante: ${state.score.visitor}\n`;
  content += `-------------------------------------------------\n\n`;

  filteredLog.value.forEach(e => {
    const pNumber = e.player_number ? `(Dorsal #${e.player_number})` : '';
    const teamName = e.team === 'local' ? 'Local' : 'Visitante';
    content += `[${e.match_time}] ${teamName} ${pNumber} -> ${formatEventType(e.type)}\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `bitacora_partido_${Date.now()}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- SINCRONIZACIÓN ---
const syncWithBackend = async () => {
  if (state.unsyncedEvents.length === 0) return;
  const token = localStorage.getItem('token_arbitro');
  try {
    const response = await fetch('http://localhost/tu_ruta/api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        entity: 'delegados', action: 'sincronizarEventos',
        payload: { match_id: state.matchId, events: state.unsyncedEvents }
      })
    });
    const result = await response.json();
    if (result.ok && result.payload.status === 'success') {
      state.unsyncedEvents.forEach(unsynced => {
        const logItem = state.eventLog.find(e => e.id === unsynced.id);
        if (logItem) logItem.synced = true;
      });
      state.unsyncedEvents = [];
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(loadState);
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval); });
</script>

<style scoped>
/* MOBILE FIRST STYLES */
.panel-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  color: #333;
  font-family: sans-serif;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.header-controls h2 { font-size: 1.2rem; margin: 0; }
.small-btn { padding: 5px 10px; font-size: 0.8rem; }

.scoreboard-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* CRONÓMETRO */
.timer-column {
  background: #222;
  color: #fff;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.period-indicator { font-size: 1rem; color: #aaa; }
.time-display { font-size: 4.5rem; font-weight: bold; font-family: monospace; line-height: 1; margin: 10px 0; }
.time-paused { color: #ff5252; }

.timer-controls button { width: 100%; padding: 15px; font-size: 1.2rem; font-weight: bold; border-radius: 6px; border: none; margin-bottom: 10px; cursor: pointer;}
.timer-sub-controls { display: flex; gap: 10px; }
.timer-sub-controls button { padding: 10px; font-size: 0.9rem; margin-bottom: 0; }

/* PENALIDADES */
.penalties-container { margin-top: 15px; padding-top: 15px; border-top: 1px solid #444; }
.penalties-container h4 { margin: 0 0 10px 0; font-size: 0.9rem; color: #aaa; }
.penalty-timers { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.penalty-box { background: #333; padding: 5px 15px; border-radius: 20px; font-family: monospace; font-size: 1.1rem; display: flex; gap: 10px; align-items: center; border: 1px solid #555; }
.penalty-box.local { border-color: #4caf50; }
.penalty-box.visitor { border-color: #2196f3; }
.penalty-team { font-weight: bold; }
.penalty-time { color: #ff9800; }

/* EQUIPOS */
.teams-container { display: flex; flex-direction: column; gap: 15px; }
.team-column { padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center; background: #fafafa; }
.team-column h3 { margin: 0 0 10px 0; }
.score-display { font-size: 4rem; font-weight: bold; margin-bottom: 15px; }

.action-buttons button { display: block; width: 100%; margin-bottom: 8px; padding: 12px; border: none; border-radius: 6px; font-weight: bold; font-size: 1rem; cursor: pointer;}
.goal-controls { display: flex; gap: 10px; margin-bottom: 8px; }
.btn-goal { flex: 3; background: #4caf50; color: white; }
.btn-minus { flex: 1; background: #e0e0e0; color: #333; }

.btn-primary { background: #1976d2; color: white; }
.btn-secondary { background: #444; color: white; }
.btn-danger { background: #d32f2f; color: white; border: none; border-radius: 4px; }
.btn-yellow { background: #ffeb3b; color: #000; }
.btn-2min { background: #ff9800; color: white; }
.btn-red { background: #f44336; color: white; }
.btn-blue { background: #2196f3; color: white; }

/* LOGS Y FILTROS */
.event-log-section { margin-top: 25px; border-top: 2px solid #eee; padding-top: 15px; }
.log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.log-header h3 { margin: 0; }
.btn-sync { background: #009688; color: white; padding: 8px 15px; border: none; border-radius: 4px; }
.btn-sync:disabled { background: #ccc; }

.filter-controls { display: flex; gap: 10px; margin-bottom: 10px; }
.filter-controls select { flex: 1; padding: 8px; border-radius: 4px; border: 1px solid #ccc; }
.btn-download { background: #607d8b; color: white; padding: 8px 15px; border: none; border-radius: 4px; }

.log-list ul { list-style: none; padding: 0; max-height: 250px; overflow-y: auto; border: 1px solid #eee; background: #fdfdfd; margin: 0; }
.log-list li { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 0.9rem; }
.log-time { font-family: monospace; color: #666; font-weight: bold; }
.pending-badge { background: #ff9800; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; margin-left: 5px; }
.empty-log { color: #999; text-align: center; font-style: italic; }

/* MEDIA QUERY PARA TABLET / DESKTOP */
@media (min-width: 768px) {
  .teams-container { flex-direction: row; }
  .team-column { flex: 1; }
}
</style>
