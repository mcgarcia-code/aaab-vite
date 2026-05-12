<template>
  <div class="panel-card delegados-sheet">
    <div class="header-controls">
      <h2>Planilla Digital - Delegado Técnico</h2>
      <button class="btn-danger" @click="resetMatch">🔄 Reiniciar Partido</button>
    </div>

    <div class="scoreboard-grid">
      <!-- EQUIPO LOCAL -->
      <div class="team-column local">
        <h3>Local</h3>
        <div class="score-display">{{ state.score.local }}</div>
        <div class="action-buttons">
          <button class="btn-goal" @click="registerEvent('local', 'goal')">+1 Gol</button>
          <button class="btn-yellow" @click="registerEvent('local', 'yellow_card')">Amarilla</button>
          <button class="btn-2min" @click="registerEvent('local', '2_min')">2 Minutos</button>
          <button class="btn-red" @click="registerEvent('local', 'red_card')">Roja (Descalif.)</button>
          <button class="btn-blue" @click="registerEvent('local', 'blue_card')">Azul (C/Informe)</button>
        </div>
      </div>

      <!-- CRONÓMETRO -->
      <div class="timer-column">
        <div class="period-indicator">
          {{ currentPeriodText }}
        </div>

        <div class="time-display" :class="{ 'time-paused': !isRunning }">
          {{ formattedTime }}
        </div>

        <div class="timer-controls">
          <button class="btn-primary" @click="toggleTimer">
            {{ isRunning ? '⏸ Pausar' : '▶ Iniciar' }}
          </button>
          <button class="btn-secondary" @click="toggleDirection">
            ⏱ {{ state.isCountdown ? 'Modo: Regresivo' : 'Modo: Progresivo' }}
          </button>
          <button class="btn-secondary" @click="nextPeriod" :disabled="isRunning">
            ⏭ Siguiente Periodo
          </button>
        </div>
      </div>

      <!-- EQUIPO VISITANTE -->
      <div class="team-column visitor">
        <h3>Visitante</h3>
        <div class="score-display">{{ state.score.visitor }}</div>
        <div class="action-buttons">
          <button class="btn-goal" @click="registerEvent('visitor', 'goal')">+1 Gol</button>
          <button class="btn-yellow" @click="registerEvent('visitor', 'yellow_card')">Amarilla</button>
          <button class="btn-2min" @click="registerEvent('visitor', '2_min')">2 Minutos</button>
          <button class="btn-red" @click="registerEvent('visitor', 'red_card')">Roja (Descalif.)</button>
          <button class="btn-blue" @click="registerEvent('visitor', 'blue_card')">Azul (C/Informe)</button>
        </div>
      </div>
    </div>

    <!-- REGISTRO Y SINCRONIZACIÓN -->
    <div class="event-log-section">
      <div class="log-header">
        <h3>Bitácora de Eventos</h3>
        <button class="btn-sync" @click="syncWithBackend" :disabled="!state.unsyncedEvents.length">
          ☁️ Sincronizar ({{ state.unsyncedEvents.length }})
        </button>
      </div>

      <div class="log-list">
        <ul>
          <li v-for="(event, index) in reversedLog" :key="index">
            <span class="log-time">[{{ event.match_time }}]</span>
            <strong>{{ event.team === 'local' ? 'Local' : 'Visitante' }}</strong>:
            {{ formatEventType(event.type) }}
            <span v-if="!event.synced" class="pending-badge">Pendiente</span>
          </li>
          <li v-if="state.eventLog.length === 0" class="empty-log">Aún no hay eventos registrados.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';

const STORAGE_KEY = 'aaab_delegado_match_state';
const HALF_DURATION_SEC = 30 * 60; // 30 minutos

// Estado global agrupado para facilitar el guardado en localStorage
const state = reactive({
  matchId: 1, // Esto debería venir como prop o seleccionarse previamente
  score: { local: 0, visitor: 0 },
  timeInSeconds: 0,
  period: 1, // 1: 1T, 2: 2T (obviamos el descanso en el contador activo)
  isCountdown: false,
  eventLog: [],
  unsyncedEvents: []
});

const isRunning = ref(false);
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

const currentPeriodText = computed(() => {
  return state.period === 1 ? '1° Tiempo' : '2° Tiempo';
});

const reversedLog = computed(() => {
  return [...state.eventLog].reverse();
});

// --- PERSISTENCIA (LocalStorage) ---
const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(state, parsed);
  }
};

// Guarda automáticamente ante cualquier cambio en 'state'
watch(state, (newState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}, { deep: true });

const resetMatch = () => {
  if (confirm("¿Estás seguro de reiniciar? Se borrarán los datos no sincronizados y el marcador volverá a cero.")) {
    if (isRunning.value) toggleTimer();

    state.score.local = 0;
    state.score.visitor = 0;
    state.timeInSeconds = 0;
    state.period = 1;
    state.isCountdown = false;
    state.eventLog = [];
    state.unsyncedEvents = [];

    localStorage.removeItem(STORAGE_KEY);
  }
};

// --- LÓGICA DEL CRONÓMETRO ---
const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval);
  } else {
    timerInterval = setInterval(() => {
      if (state.timeInSeconds < HALF_DURATION_SEC) {
        state.timeInSeconds++;
      } else {
        clearInterval(timerInterval);
        isRunning.value = false;
        alert("¡Fin del tiempo reglamentario del periodo!");
      }
    }, 1000);
  }
  isRunning.value = !isRunning.value;
};

const toggleDirection = () => {
  state.isCountdown = !state.isCountdown;
};

const nextPeriod = () => {
  if (state.period === 1) {
    state.period = 2;
    state.timeInSeconds = 0; // Resetea a 0 para el 2do tiempo
  }
};

// --- REGISTRO DE EVENTOS ---
const registerEvent = (team, type) => {
  let playerNumber = prompt(`Ingrese el dorsal del jugador (${team}):`);
  if (!playerNumber) playerNumber = 'S/D'; // Sin dorsal

  if (type === 'goal') {
    state.score[team]++;
  }

  const newEvent = {
    id: Date.now(), // ID temporal para identificarlo
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
    yellow_card: '🟨 Tarjeta Amarilla',
    '2_min': '✌️ Exclusión 2 Minutos',
    red_card: '🟥 Descalificación',
    blue_card: '🟦 Descalificación (Informe)'
  };
  return types[type] || type;
};

// --- SINCRONIZACIÓN CON BACKEND (api.php) ---
const syncWithBackend = async () => {
  if (state.unsyncedEvents.length === 0) return;

  // Obtenemos el token desde donde lo guardes en el front (ej. localStorage o store)
  const token = localStorage.getItem('token_arbitro');

  try {
    const response = await fetch('http://localhost/tu_ruta/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        entity: 'delegados',
        action: 'sincronizarEventos',
        payload: {
          match_id: state.matchId,
          events: state.unsyncedEvents
        }
      })
    });

    const result = await response.json();

    if (result.ok && result.payload.status === 'success') {
      // Marcamos los eventos como sincronizados en el log general
      state.unsyncedEvents.forEach(unsynced => {
        const logItem = state.eventLog.find(e => e.id === unsynced.id);
        if (logItem) logItem.synced = true;
      });
      // Vaciamos la cola
      state.unsyncedEvents = [];
    } else {
      alert("Error al sincronizar: " + (result.message || result.payload?.message));
    }
  } catch (error) {
    console.error("Fallo la conexión:", error);
    alert("Error de red. Los datos siguen guardados localmente.");
  }
};

// --- CICLO DE VIDA ---
onMounted(() => {
  loadState();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
/* CSS Base para la tarjeta. Se integrará con los estilos generales del panel */
.panel-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  color: #333;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.scoreboard-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 20px;
  text-align: center;
}

.team-column {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.score-display {
  font-size: 4rem;
  font-weight: bold;
  margin: 10px 0;
}

.timer-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.period-indicator {
  font-size: 1.2rem;
  font-weight: 600;
  color: #666;
}

.time-display {
  font-size: 5rem;
  font-weight: bold;
  font-family: monospace;
  line-height: 1;
  margin: 10px 0;
}

.time-paused {
  color: #d32f2f;
}

.timer-controls button, .action-buttons button {
  display: block;
  width: 100%;
  margin-bottom: 8px;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

/* Colores orientativos */
.btn-primary { background: #1976d2; color: white; }
.btn-secondary { background: #e0e0e0; color: #333; }
.btn-danger { background: #d32f2f; color: white; }
.btn-goal { background: #4caf50; color: white; }
.btn-yellow { background: #ffeb3b; color: #000; }
.btn-2min { background: #ff9800; color: white; }
.btn-red { background: #f44336; color: white; }
.btn-blue { background: #2196f3; color: white; }
.btn-sync { background: #009688; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; }
.btn-sync:disabled { background: #ccc; cursor: not-allowed; }

.event-log-section {
  margin-top: 30px;
  border-top: 2px solid #eee;
  padding-top: 20px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.log-list ul {
  list-style: none;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  background: #fafafa;
}

.log-list li {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-time { font-family: monospace; color: #666; }
.pending-badge { background: #ff9800; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; }
.empty-log { color: #999; text-align: center; font-style: italic; }
</style>
