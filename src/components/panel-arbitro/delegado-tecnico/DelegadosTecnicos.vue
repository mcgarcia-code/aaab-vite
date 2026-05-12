<template>
  <div class="panel-card delegados-sheet">
    <div class="header-controls">
      <h2>Planilla Digital</h2>
      <button class="btn-danger small-btn" @click="resetMatch">🔄 Reiniciar</button>
    </div>

    <div class="timer-section">
      <div class="period-indicator">{{ currentPeriodText }}</div>

      <div class="time-display" :class="{ 'time-paused': !isRunning }">
        {{ formattedTime }}
      </div>

      <div class="timer-controls">
        <button class="btn-primary btn-main-timer" @click="toggleTimer" :disabled="state.activeTTO !== null">
          {{ isRunning ? '⏸ Pausar' : '▶ Iniciar' }}
        </button>
        <div class="timer-sub-controls">
          <button class="btn-secondary small-btn" @click="toggleDirection">
            ⏱ {{ state.isCountdown ? 'Regresivo' : 'Progresivo' }}
          </button>
          <div class="period-nav">
            <button class="btn-secondary small-btn" @click="prevPeriod" :disabled="isRunning || state.period === 1">⏮ Volver</button>
            <button class="btn-secondary small-btn" @click="nextPeriod" :disabled="isRunning">⏭ Sig.</button>
          </div>
        </div>
      </div>

      <div v-if="state.activeTTO" class="tto-countdown-box">
        <span class="tto-icon">🟩</span>
        Tiempo Muerto ({{ state.activeTTO.team === 'local' ? 'Local' : 'Visita' }}):
        <strong>{{ state.activeTTO.timeRemaining }}s</strong>
      </div>

      <div class="penalties-container" v-if="state.activePenalties.length > 0">
        <h4>Exclusiones Activas</h4>
        <div class="penalty-timers">
          <div v-for="penalty in state.activePenalties" :key="penalty.id" class="penalty-box" :class="penalty.team">
            <span class="penalty-team">{{ penalty.team === 'local' ? 'L' : 'V' }}</span>
            <span class="penalty-player">#{{ penalty.playerNumber }}</span>
            <span class="penalty-time">{{ formatPenaltyTime(penalty.timeRemaining) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="teams-container">

      <div class="team-column local">
        <h3>Local</h3>
        <div class="score-display">{{ state.score.local }}</div>

        <div class="indicators">
          <span v-if="localPlayersLess > 0" class="badge-danger">
            ⚠️ -{{ localPlayersLess }} Jug.
          </span>
          <div class="tto-dots">
            <span v-for="n in 3" :key="n" class="dot" :class="{ 'used': state.timeouts.local.total >= n }"></span>
          </div>
        </div>

        <div class="action-buttons">
          <div class="goal-controls">
            <button class="btn-goal" @click="registerEvent('local', 'goal')"><span class="icon">⚽</span></button>
            <button class="btn-minus" @click="removeGoal('local')"><span class="icon">➖</span></button>
          </div>
          <button class="btn-yellow" @click="registerEvent('local', 'yellow_card')"><span class="icon">🟨</span></button>
          <button class="btn-2min" @click="registerEvent('local', '2_min')"><span class="icon">✌️</span></button>
          <button class="btn-red" @click="registerEvent('local', 'red_card')"><span class="icon">🟥</span></button>
          <button class="btn-blue" @click="registerEvent('local', 'blue_card')"><span class="icon">🟦</span></button>
          <button class="btn-tto" @click="requestTTO('local')" :disabled="!canUseTimeout('local')">🟩 TTO</button>
        </div>
      </div>

      <div class="team-column visitor">
        <h3>Visita</h3>
        <div class="score-display">{{ state.score.visitor }}</div>

        <div class="indicators">
          <span v-if="visitorPlayersLess > 0" class="badge-danger">
            ⚠️ -{{ visitorPlayersLess }} Jug.
          </span>
          <div class="tto-dots">
            <span v-for="n in 3" :key="n" class="dot" :class="{ 'used': state.timeouts.visitor.total >= n }"></span>
          </div>
        </div>

        <div class="action-buttons">
          <div class="goal-controls">
            <button class="btn-goal" @click="registerEvent('visitor', 'goal')"><span class="icon">⚽</span></button>
            <button class="btn-minus" @click="removeGoal('visitor')"><span class="icon">➖</span></button>
          </div>
          <button class="btn-yellow" @click="registerEvent('visitor', 'yellow_card')"><span class="icon">🟨</span></button>
          <button class="btn-2min" @click="registerEvent('visitor', '2_min')"><span class="icon">✌️</span></button>
          <button class="btn-red" @click="registerEvent('visitor', 'red_card')"><span class="icon">🟥</span></button>
          <button class="btn-blue" @click="registerEvent('visitor', 'blue_card')"><span class="icon">🟦</span></button>
          <button class="btn-tto" @click="requestTTO('visitor')" :disabled="!canUseTimeout('visitor')">🟩 TTO</button>
        </div>
      </div>
    </div>

    <div class="event-log-section">
      <div class="log-header">
        <h3>Bitácora</h3>
        <button class="btn-sync" @click="syncWithBackend" :disabled="!state.unsyncedEvents.length">
          ☁️ Sinc. ({{ state.unsyncedEvents.length }})
        </button>
      </div>
      <div class="filter-controls">
        <select v-model="logFilter">
          <option value="all">Todos</option>
          <option value="goals">Goles</option>
          <option value="sanctions">Sanciones</option>
        </select>
        <button class="btn-download" @click="downloadLog">📥 .Txt</button>
      </div>
      <div class="log-list">
        <ul>
          <li v-for="(event, index) in filteredLog" :key="index">
            <span class="log-time">[{{ event.match_time }}]</span>
            <strong>{{ event.team === 'local' ? 'L' : 'V' }}</strong>
            <span v-if="event.player_number && event.type !== 'goal_removed'"> (#{{ event.player_number }})</span>:
            {{ formatEventType(event.type) }}
            <span v-if="!event.synced" class="pending-badge">P</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';

const STORAGE_KEY = 'aaab_delegado_match_state';
const HALF_DURATION_SEC = 30 * 60; // 30 mins
const TTO_LIMIT_SEC = 25 * 60; // 25 mins (Límite para pedir 2do TTO y salvar el 3ro)

const state = reactive({
  matchId: 1,
  score: { local: 0, visitor: 0 },
  timeInSeconds: 0,
  period: 1,
  isCountdown: false,
  eventLog: [],
  unsyncedEvents: [],
  activePenalties: [],
  activeTTO: null,
  timeouts: {
    local: { h1: 0, h2: 0, total: 0, lostThird: false },
    visitor: { h1: 0, h2: 0, total: 0, lostThird: false }
  }
});

const isRunning = ref(false);
const logFilter = ref('all');
let timerInterval = null;
let ttoInterval = null;

// --- COMPUTADOS ---
const formattedTime = computed(() => {
  let displaySeconds = state.timeInSeconds;
  if (state.isCountdown) {
    displaySeconds = HALF_DURATION_SEC - state.timeInSeconds;
    if (displaySeconds < 0) displaySeconds = 0;
  }
  const m = Math.floor(displaySeconds / 60).toString().padStart(2, '0');
  const s = (displaySeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

const currentPeriodText = computed(() => state.period === 1 ? '1° Tiempo' : '2° Tiempo');
const localPlayersLess = computed(() => state.activePenalties.filter(p => p.team === 'local').length);
const visitorPlayersLess = computed(() => state.activePenalties.filter(p => p.team === 'visitor').length);

const filteredLog = computed(() => {
  const reversed = [...state.eventLog].reverse();
  if (logFilter.value === 'goals') return reversed.filter(e => e.type === 'goal' || e.type === 'goal_removed');
  if (logFilter.value === 'sanctions') return reversed.filter(e => ['yellow_card', '2_min', 'red_card', 'blue_card'].includes(e.type));
  return reversed;
});

// --- PERSISTENCIA ---
const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) Object.assign(state, JSON.parse(saved));

  if (state.activeTTO && state.activeTTO.timeRemaining > 0) {
    resumeTTOTimer();
  }
};

watch(state, (newState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}, { deep: true });

const resetMatch = () => {
  if (confirm("¿Reiniciar partido? Se borrarán datos no sincronizados.")) {
    if (isRunning.value) toggleTimer();
    if (ttoInterval) clearInterval(ttoInterval);
    Object.assign(state, {
      score: { local: 0, visitor: 0 }, timeInSeconds: 0, period: 1, isCountdown: false,
      eventLog: [], unsyncedEvents: [], activePenalties: [], activeTTO: null,
      timeouts: { local: { h1: 0, h2: 0, total: 0, lostThird: false }, visitor: { h1: 0, h2: 0, total: 0, lostThird: false } }
    });
    localStorage.removeItem(STORAGE_KEY);
  }
};

// --- TIEMPOS MUERTOS DE EQUIPO (TTO) ---
const canUseTimeout = (team) => {
  const t = state.timeouts[team];
  if (state.activeTTO !== null) return false; // Ya hay un TTO corriendo
  if (state.period === 1) return t.h1 < 2; // Máximo 2 en H1
  if (state.period === 2) {
    if (t.h2 >= 2) return false; // Máximo 2 en H2
    if (t.total >= 3) return false; // Máximo 3 en total
    if (t.total === 2 && t.lostThird) return false; // Perdió el derecho al tercero
    return true;
  }
  return false;
};

const requestTTO = (team) => {
  if (!canUseTimeout(team)) return;

  // 1. Frena el reloj principal
  if (isRunning.value) {
    clearInterval(timerInterval);
    isRunning.value = false;
  }

  // 2. Lógica de registro
  const t = state.timeouts[team];
  if (state.period === 1) t.h1++;
  if (state.period === 2) {
    t.h2++;
    // REGLA: Si piden el 2do TTO total después de los 25 minutos, pierden el 3ro.
    if (t.total === 1 && state.timeInSeconds >= TTO_LIMIT_SEC) {
      t.lostThird = true;
    }
  }
  t.total++;

  // 3. Arranca el reloj de 60 segundos
  state.activeTTO = { team, timeRemaining: 60 };
  resumeTTOTimer();

  createLogEntry(team, 'timeout', null);
};

const resumeTTOTimer = () => {
  if (ttoInterval) clearInterval(ttoInterval);
  ttoInterval = setInterval(() => {
    state.activeTTO.timeRemaining--;
    if (state.activeTTO.timeRemaining <= 0) {
      clearInterval(ttoInterval);
      state.activeTTO = null;
      alert("⚠️ Fin del Tiempo Muerto. Reinicie el reloj principal.");
    }
  }, 1000);
};

// --- LÓGICA DEL CRONÓMETRO Y PENALIDADES ---
const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval);
  } else {
    timerInterval = setInterval(() => {
      if (state.timeInSeconds < HALF_DURATION_SEC) {
        state.timeInSeconds++;
        state.activePenalties.forEach(penalty => {
          if (penalty.timeRemaining > 0) penalty.timeRemaining--;
        });
        state.activePenalties = state.activePenalties.filter(p => p.timeRemaining > 0);
      } else {
        clearInterval(timerInterval);
        isRunning.value = false;
      }
    }, 1000);
  }
  isRunning.value = !isRunning.value;
};

const toggleDirection = () => state.isCountdown = !state.isCountdown;
const nextPeriod = () => { if (state.period === 1) { state.period = 2; state.timeInSeconds = 0; } };
const prevPeriod = () => { if (state.period > 1) { state.period--; state.timeInSeconds = 0; } };

const formatPenaltyTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// --- EVENTOS ---
const registerEvent = (team, type) => {
  let playerNumber = null;
  if (type !== 'goal') {
    playerNumber = prompt(`Dorsal sancionado (${team === 'local' ? 'L' : 'V'}):`);
    if (!playerNumber) return;

    if (['2_min', 'red_card', 'blue_card'].includes(type)) {
      if (isRunning.value) { clearInterval(timerInterval); isRunning.value = false; }
      const existing = [...state.activePenalties].reverse().find(p => p.team === team && p.playerNumber === playerNumber);

      if (existing && existing.timeGiven === state.timeInSeconds) {
        if ((existing.type === 'red_card' && type === 'blue_card') || (existing.type === 'blue_card' && type === 'red_card')) {
          existing.type = type;
        } else {
          existing.timeRemaining += 120;
        }
      } else {
        state.activePenalties.push({ id: Date.now(), team, type, playerNumber, timeRemaining: 120, timeGiven: state.timeInSeconds });
      }
    }
  } else {
    state.score[team]++;
  }
  createLogEntry(team, type, playerNumber);
};

const removeGoal = (team) => {
  if (state.score[team] > 0) { state.score[team]--; createLogEntry(team, 'goal_removed', null); }
};

const createLogEntry = (team, type, playerNumber) => {
  const newEvent = {
    id: Date.now(), team, player_number: playerNumber, type,
    match_time: `${currentPeriodText.value} - ${formattedTime.value}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), synced: false
  };
  state.eventLog.push(newEvent); state.unsyncedEvents.push(newEvent);
};

const formatEventType = (type) => {
  const t = { goal: '⚽ Gol', goal_removed: '❌ Gol Anulado', yellow_card: '🟨 Amarilla', '2_min': '✌️ 2 Minutos', red_card: '🟥 Roja', blue_card: '🟦 Azul', timeout: '🟩 Tiempo Muerto' };
  return t[type] || type;
};

// --- DESCARGA Y SINC ---
const downloadLog = () => {
  if (filteredLog.value.length === 0) return alert("Sin datos.");
  let content = `BITÁCORA\nLocal: ${state.score.local} | Visita: ${state.score.visitor}\n\n`;
  filteredLog.value.forEach(e => {
    content += `[${e.match_time}] ${e.team === 'local' ? 'L' : 'V'} ${e.player_number ? `(#${e.player_number})` : ''} -> ${formatEventType(e.type)}\n`;
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  link.download = `bitacora.txt`;
  link.click();
};

const syncWithBackend = async () => {
  if (state.unsyncedEvents.length === 0) return;
  const token = localStorage.getItem('token_arbitro');
  try {
    const res = await fetch('http://localhost/tu_ruta/api.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ entity: 'delegados', action: 'sincronizarEventos', payload: { match_id: state.matchId, events: state.unsyncedEvents } })
    });
    const result = await res.json();
    if (result.ok && result.payload.status === 'success') {
      state.unsyncedEvents.forEach(u => { const l = state.eventLog.find(e => e.id === u.id); if (l) l.synced = true; });
      state.unsyncedEvents = [];
    }
  } catch (err) { console.error(err); }
};

onMounted(loadState);
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval); if (ttoInterval) clearInterval(ttoInterval); });
</script>

<style scoped>
/* ESTILOS SÚPER COMPACTOS PARA MOBILE */
.panel-card { background: #fff; border-radius: 6px; padding: 6px; color: #333; font-family: sans-serif; font-size: 0.9rem; }
.header-controls { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 8px; }
.header-controls h2 { font-size: 1rem; margin: 0; }
.small-btn { padding: 4px 8px; font-size: 0.75rem; border-radius: 4px; border: none; cursor: pointer; }

/* CRONÓMETRO */
.timer-section { background: #222; color: #fff; padding: 10px; border-radius: 6px; text-align: center; margin-bottom: 10px; }
.period-indicator { font-size: 0.85rem; color: #aaa; margin-bottom: 2px; }
.time-display { font-size: 3rem; font-weight: bold; font-family: monospace; line-height: 1; margin: 0 0 8px 0; }
.time-paused { color: #ff5252; }
.timer-controls { display: flex; flex-direction: column; gap: 6px; }
.btn-main-timer { width: 100%; padding: 8px; font-size: 1rem; font-weight: bold; border-radius: 4px; border: none; cursor: pointer; }
.timer-sub-controls { display: flex; gap: 6px; }
.timer-sub-controls > button, .period-nav { flex: 1; }
.period-nav { display: flex; gap: 4px; }
.period-nav button { flex: 1; }

/* TTO CUENTA REGRESIVA */
.tto-countdown-box { background: #4caf50; color: #fff; margin-top: 8px; padding: 6px; border-radius: 4px; font-size: 0.9rem; border: 1px solid #1b5e20; }

/* PENALIDADES COMPACTAS */
.penalties-container { margin-top: 8px; padding-top: 6px; border-top: 1px solid #444; }
.penalties-container h4 { margin: 0 0 5px 0; font-size: 0.75rem; }
.penalty-timers { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.penalty-box { background: #333; padding: 2px 6px; border-radius: 8px; font-family: monospace; font-size: 0.85rem; display: flex; gap: 5px; border: 1px solid #555; }
.penalty-box.local { border-color: #4caf50; }
.penalty-box.visitor { border-color: #2196f3; }
.penalty-time { color: #ff9800; }

/* EQUIPOS Y BOTONES MINIMIZADOS */
.teams-container { display: flex; gap: 6px; }
.team-column { flex: 1; min-width: 0; padding: 6px; border-radius: 6px; border: 1px solid #ddd; text-align: center; background: #fafafa; }
.team-column h3 { margin: 0 0 2px 0; font-size: 0.85rem; }
.score-display { font-size: 2.5rem; font-weight: bold; margin-bottom: 2px; line-height: 1; }

.indicators { display: flex; justify-content: center; align-items: center; gap: 5px; min-height: 18px; margin-bottom: 6px; }
.badge-danger { color: #d32f2f; background: #ffebee; padding: 1px 4px; border-radius: 3px; font-size: 0.65rem; font-weight: bold; }
.tto-dots { display: flex; gap: 3px; }
.dot { width: 8px; height: 8px; border-radius: 50%; border: 1px solid #666; background: transparent; }
.dot.used { background: #4caf50; border-color: #2e7d32; }

.action-buttons { display: flex; flex-direction: column; gap: 4px; }
.action-buttons button { padding: 8px 0; border: none; border-radius: 4px; cursor: pointer; display: flex; justify-content: center; align-items: center; }
.goal-controls { display: flex; gap: 4px; }
.btn-goal { flex: 3; background: #4caf50; }
.btn-minus { flex: 1; background: #e0e0e0; }

.btn-yellow { background: #ffeb3b; }
.btn-2min { background: #ff9800; }
.btn-red { background: #f44336; }
.btn-blue { background: #2196f3; }
.btn-tto { background: #8bc34a; font-weight: bold; font-size: 0.75rem !important; color: #1b5e20;}
.btn-tto:disabled { background: #ccc; color: #888; }
.icon { font-size: 1rem; }

/* COLORES BASE */
.btn-primary { background: #1976d2; color: white; }
.btn-secondary { background: #444; color: white; }
.btn-danger { background: #d32f2f; color: white; }

/* LOGS */
.event-log-section { margin-top: 10px; border-top: 1px solid #eee; padding-top: 8px; }
.log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.log-header h3 { margin: 0; font-size: 0.85rem; }
.btn-sync { background: #009688; color: white; padding: 4px 8px; border: none; border-radius: 3px; font-size: 0.7rem; }
.filter-controls { display: flex; gap: 4px; margin-bottom: 6px; }
.filter-controls select { flex: 1; padding: 4px; border-radius: 3px; border: 1px solid #ccc; font-size: 0.75rem; }
.btn-download { background: #607d8b; color: white; padding: 4px 8px; border: none; border-radius: 3px; font-size: 0.75rem; }
.log-list ul { list-style: none; padding: 0; max-height: 120px; overflow-y: auto; border: 1px solid #eee; margin: 0; }
.log-list li { padding: 6px 4px; border-bottom: 1px solid #eee; font-size: 0.75rem; }
.log-time { font-family: monospace; color: #666; font-weight: bold; }
.pending-badge { background: #ff9800; color: white; font-size: 0.6rem; padding: 1px 4px; border-radius: 8px; margin-left: 3px; }
</style>
