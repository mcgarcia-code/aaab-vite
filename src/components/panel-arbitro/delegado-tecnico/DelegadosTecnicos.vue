<template>
  <div class="panel-card delegados-sheet">
    <div class="header-controls">
      <h2>Planilla Digital</h2>
      <button class="btn-danger small-btn fw-bold" @click="resetMatch">🔄 REINICIAR</button>
    </div>

    <div class="timer-section shadow-sm">
      <div class="period-indicator">{{ currentPeriodText }}</div>

      <div class="time-display" :class="{ 'time-paused': !isRunning }">
        {{ formattedTime }}
      </div>

      <div class="timer-controls">
        <button class="btn-primary btn-main-timer shadow-sm" @click="toggleTimer" :disabled="state.activeTTO !== null">
          {{ isRunning ? '⏸ PAUSAR' : '▶ INICIAR' }}
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

      <div v-if="state.activeTTO" class="tto-countdown-box shadow-sm">
        <div class="tto-info">
          <span class="icon">🟩</span> TTO ({{ state.activeTTO.team === 'local' ? 'L' : 'V' }}): <strong>{{ state.activeTTO.timeRemaining }}s</strong>
        </div>
        <button class="btn-danger small-btn fw-bold" @click="cancelTTO">❌ Cortar</button>
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
      <div class="team-column local shadow-sm">
        <h3 class="team-title">LOCAL</h3>
        <div class="score-display">{{ state.score.local }}</div>

        <div class="indicators">
          <span v-if="localPlayersLess > 0" class="badge-danger">⚠️ -{{ localPlayersLess }} Jug.</span>
          <div class="tto-dots">
            <span v-for="n in 3" :key="n" class="dot" :class="{ 'used': state.timeouts.local.total >= n }"></span>
          </div>
        </div>

        <div class="action-buttons">
          <div class="goal-controls">
            <button class="btn-action btn-goal-minus" @click="restarGol('local')" :disabled="state.score.local === 0">
              <span class="icon">➖</span><span class="btn-text">Restar</span>
            </button>
            <button class="btn-action btn-goal" @click="registrarGol('local')">
              <span class="icon">⚽</span><span class="btn-text">Gol</span>
            </button>
          </div>
          <button class="btn-action btn-yellow" @click="pedirDorsal('local', 'yellow_card')">
            <span class="icon">🟨</span><span class="btn-text">Amarilla</span>
          </button>
          <button class="btn-action btn-2min" @click="pedirDorsal('local', '2_min')">
            <span class="icon">✌️</span><span class="btn-text">2 Minutos</span>
          </button>
          <button class="btn-action btn-red" @click="pedirDorsal('local', 'red_card')">
            <span class="icon">🟥</span><span class="btn-text">Roja</span>
          </button>
          <button class="btn-action btn-blue" @click="pedirDorsal('local', 'blue_card')">
            <span class="icon">🟦</span><span class="btn-text">Azul</span>
          </button>
          <button class="btn-action btn-tto" @click="requestTTO('local')" :disabled="!canUseTimeout('local')">
            <span class="icon">🟩</span><span class="btn-text">TTO</span>
          </button>
        </div>
      </div>

      <div class="team-column visitor shadow-sm">
        <h3 class="team-title">VISITA</h3>
        <div class="score-display">{{ state.score.visitor }}</div>

        <div class="indicators">
          <span v-if="visitorPlayersLess > 0" class="badge-danger">⚠️ -{{ visitorPlayersLess }} Jug.</span>
          <div class="tto-dots">
            <span v-for="n in 3" :key="n" class="dot" :class="{ 'used': state.timeouts.visitor.total >= n }"></span>
          </div>
        </div>

        <div class="action-buttons">
          <div class="goal-controls">
            <button class="btn-action btn-goal-minus" @click="restarGol('visitor')" :disabled="state.score.visitor === 0">
              <span class="icon">➖</span><span class="btn-text">Restar</span>
            </button>
            <button class="btn-action btn-goal" @click="registrarGol('visitor')">
              <span class="icon">⚽</span><span class="btn-text">Gol</span>
            </button>
          </div>
          <button class="btn-action btn-yellow" @click="pedirDorsal('visitor', 'yellow_card')">
            <span class="icon">🟨</span><span class="btn-text">Amarilla</span>
          </button>
          <button class="btn-action btn-2min" @click="pedirDorsal('visitor', '2_min')">
            <span class="icon">✌️</span><span class="btn-text">2 Minutos</span>
          </button>
          <button class="btn-action btn-red" @click="pedirDorsal('visitor', 'red_card')">
            <span class="icon">🟥</span><span class="btn-text">Roja</span>
          </button>
          <button class="btn-action btn-blue" @click="pedirDorsal('visitor', 'blue_card')">
            <span class="icon">🟦</span><span class="btn-text">Azul</span>
          </button>
          <button class="btn-action btn-tto" @click="requestTTO('visitor')" :disabled="!canUseTimeout('visitor')">
            <span class="icon">🟩</span><span class="btn-text">TTO</span>
          </button>
        </div>
      </div>
    </div>

    <div class="event-log-section shadow-sm">
      <div class="log-header">
        <h3>Bitácora</h3>
        <button class="btn-sync fw-bold" @click="syncWithBackend" :disabled="!state.unsyncedEvents.length">
          ☁️ Sincronizar ({{ state.unsyncedEvents.length }})
        </button>
      </div>
      <div class="filter-controls">
        <select v-model="logFilter" class="form-select">
          <option value="all">Todos los eventos</option>
          <option value="goals">Goles</option>
          <option value="sanctions">Sanciones</option>
        </select>
        <button class="btn-download" @click="downloadLog">📥 Txt</button>
      </div>
      <div class="log-list">
        <ul>
          <li v-for="event in filteredLog" :key="event.id">
            <div class="log-content">
              <span class="log-time">[{{ event.match_time }}]</span>
              <strong>{{ event.team === 'local' ? 'L' : 'V' }}</strong>
              <span v-if="event.player_number && event.type !== 'goal_removed'"> (#{{ event.player_number }})</span>:
              {{ formatEventType(event.type) }}
              <span v-if="!event.synced" class="pending-badge">Pendiente</span>
            </div>
            <button class="btn-delete-log" @click="pedirEliminarEvento(event)" title="Eliminar">🗑️</button>
          </li>
          <li v-if="filteredLog.length === 0" class="empty-log">Sin registros.</li>
        </ul>
      </div>
    </div>

    <ModalBase
      :show="modalJugador.visible"
      titulo="Ingresar Sanción"
      icono="sports"
      colorIcono="bg-dark text-white"
      @close="cerrarModalDorsal"
    >
      <div class="text-center">
        <p class="mb-3">Ingrese el número del jugador (o letra A-E para oficiales).</p>

        <div class="shirt-wrapper">
          <svg viewBox="0 0 24 24" class="shirt-svg" :style="{ fill: modalJugador.team === 'local' ? '#dc2626' : '#2563eb' }">
            <path d="M21.99 7.99l-3.99-3.98c-.54-.54-1.42-.64-2.08-.22L12 6.51 8.08 3.79c-.66-.42-1.54-.32-2.08.22L2.01 7.99c-.42.42-.42 1.11 0 1.54l1.49 1.49c.42.42 1.11.42 1.54 0l1.48-1.48v8.46c0 .55.45 1 1 1h8.96c.55 0 1-.45 1-1v-8.46l1.48 1.48c.42.42 1.11.42 1.54 0l1.49-1.49c.43-.43.43-1.12.01-1.54z"/>
          </svg>
          <input
            type="text"
            v-model="modalJugador.dorsal"
            class="dorsal-input"
            placeholder="Nº o A-E"
            @keyup.enter="confirmarSancion"
            autofocus
          >
        </div>
      </div>

      <template #footer>
        <button class="btn btn-light fw-bold px-4" @click="cerrarModalDorsal">CANCELAR</button>
        <button class="btn btn-dark fw-bold px-4 shadow-sm" @click="confirmarSancion">CONFIRMAR</button>
      </template>
    </ModalBase>

    <ModalExito
      :visible="modalNotificacion.visible"
      :titulo="modalNotificacion.titulo"
      :mensaje="modalNotificacion.mensaje"
      :tipo="modalNotificacion.tipo"
      :tieneAccion="modalNotificacion.tieneAccion"
      @cerrar="modalNotificacion.visible = false"
      @confirmar="ejecutarAccionPendiente"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { api } from '@/api/api';
import ModalBase from '@/components/ModalBase.vue'; // Ajustá la ruta si difiere
import ModalExito from '@/components/ModalExito.vue'; // Ajustá la ruta si difiere

const STORAGE_KEY = 'aaab_delegado_match_state';
const HALF_DURATION_SEC = 30 * 60;
const TTO_LIMIT_SEC = 25 * 60;

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

// --- ESTADO DE MODALES ---
const modalJugador = reactive({ visible: false, team: '', type: '', dorsal: '' });
const modalNotificacion = reactive({ visible: false, titulo: '', mensaje: '', tipo: 'success', tieneAccion: false, accionKey: null, tempPayload: null });

const mostrarNotificacion = (titulo, mensaje, tipo = 'success', tieneAccion = false, accionKey = null, payload = null) => {
  modalNotificacion.titulo = titulo;
  modalNotificacion.mensaje = mensaje;
  modalNotificacion.tipo = tipo;
  modalNotificacion.tieneAccion = tieneAccion;
  modalNotificacion.accionKey = accionKey;
  modalNotificacion.tempPayload = payload;
  modalNotificacion.visible = true;
};

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
  if (state.activeTTO && state.activeTTO.timeRemaining > 0) resumeTTOTimer();
};

watch(state, (newState) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(newState)); }, { deep: true });

const resetMatch = () => {
  mostrarNotificacion('Reiniciar', '¿Estás seguro que deseas reiniciar el partido? Se perderán los datos locales no sincronizados.', 'danger', true, 'reset');
};

// --- VALIDACIÓN DE DORSAL ---
const validarDorsal = (dorsal) => {
  // Convertir a mayúsculas y limpiar espacios
  const dorsalLimpio = dorsal.toString().trim().toUpperCase();

  // Verificar si es una letra válida (A-E para oficiales)
  const letrasValidas = ['A', 'B', 'C', 'D', 'E'];
  if (letrasValidas.includes(dorsalLimpio)) {
    return { valido: true, valor: dorsalLimpio, tipo: 'oficial' };
  }

  // Verificar si es un número válido (para jugadores)
  const numero = parseInt(dorsalLimpio);
  if (!isNaN(numero) && numero > 0) {
    return { valido: true, valor: numero.toString(), tipo: 'jugador' };
  }

  return { valido: false };
};

// --- REGLAS PROGRESIVAS IHF ---
const obtenerSancionesJugador = (team, playerNumber) => {
  const events = state.eventLog.filter(e => e.team === team && e.player_number == playerNumber);
  const stats = { yellow: 0, two_min: 0, red: 0, blue: 0 };
  events.forEach(e => {
    if (e.type === 'yellow_card') stats.yellow++;
    if (e.type === '2_min') stats.two_min++;
    if (e.type === 'red_card') stats.red++;
    if (e.type === 'blue_card') stats.blue++;
  });
  return stats;
};

// --- CONTROL DE EVENTOS Y MODALES ---
const registrarGol = (team) => {
  // El gol no necesita dorsal
  state.score[team]++;
  guardarEventoEnLog(team, 'goal', null);
};

const restarGol = (team) => {
  if (state.score[team] > 0) {
    state.score[team]--;
    guardarEventoEnLog(team, 'goal_removed', null);
  }
};

const pedirDorsal = (team, type) => {
  // REGLA: Cualquier sanción frena el tiempo automáticamente
  if (['yellow_card', '2_min', 'red_card', 'blue_card'].includes(type)) {
    if (isRunning.value) {
      clearInterval(timerInterval);
      isRunning.value = false;
    }
  }

  modalJugador.team = team;
  modalJugador.type = type;
  modalJugador.dorsal = '';
  modalJugador.visible = true;
};

const cerrarModalDorsal = () => {
  modalJugador.visible = false;
};

const confirmarSancion = () => {
  const { team, type, dorsal } = modalJugador;

  if (!dorsal || dorsal.trim() === '') {
    mostrarNotificacion('Error', 'Debe ingresar un número de dorsal o letra (A-E).', 'danger');
    return;
  }

  // Validar dorsal
  const validacion = validarDorsal(dorsal);
  if (!validacion.valido) {
    mostrarNotificacion('Error', 'Debe ingresar un número válido o una letra entre A y E para oficiales.', 'danger');
    return;
  }

  const dorsalFinal = validacion.valor;

  // Solo aplicar reglas IHF a jugadores (números), no a oficiales (letras)
  if (validacion.tipo === 'jugador') {
    const stats = obtenerSancionesJugador(team, dorsalFinal);

    // REGLA: No amarilla si ya tiene 2 minutos
    if (type === 'yellow_card' && stats.two_min > 0) {
      mostrarNotificacion('Reglamento IHF', `El jugador #${dorsalFinal} ya posee una exclusión. No puede recibir tarjeta amarilla.`, 'danger');
      return;
    }

    // REGLA: Tercer 2 Minutos = Descalificación
    let esTerceraExclusion = false;
    if (type === '2_min' && stats.two_min >= 2) {
      esTerceraExclusion = true;
      mostrarNotificacion('Roja Automática', `El jugador #${dorsalFinal} alcanzó su 3ra exclusión de 2 minutos. Corresponde Descalificación.`, 'danger');
    }

    // Procesamos la sanción solicitada
    aplicarPenalidadReloj(team, type, dorsalFinal);
    guardarEventoEnLog(team, type, dorsalFinal);

    // Si era la 3ra, le clavamos la roja automáticamente
    if (esTerceraExclusion) {
      aplicarPenalidadReloj(team, 'red_card', dorsalFinal);
      guardarEventoEnLog(team, 'red_card', dorsalFinal);
    }
  } else {
    // Es un oficial (letra A-E), aplicar sanción sin reglas de jugador
    aplicarPenalidadReloj(team, type, dorsalFinal);
    guardarEventoEnLog(team, type, dorsalFinal);
  }

  cerrarModalDorsal();
};

const aplicarPenalidadReloj = (team, type, playerNumber) => {
  if (['2_min', 'red_card', 'blue_card'].includes(type)) {
    const existing = [...state.activePenalties].reverse().find(p => p.team === team && p.playerNumber === playerNumber);

    if (existing && existing.timeGiven === state.timeInSeconds) {
      if ((existing.type === 'red_card' && type === 'blue_card') || (existing.type === 'blue_card' && type === 'red_card')) {
        existing.type = type; // Es la misma, solo evoluciona
      } else {
        existing.timeRemaining += 120; // Se suman 2 minutos si el reloj no corrió
      }
    } else {
      state.activePenalties.push({ id: Date.now(), team, type, playerNumber, timeRemaining: 120, timeGiven: state.timeInSeconds });
    }
  }
};

const guardarEventoEnLog = (team, type, playerNumber) => {
  const newEvent = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    team, player_number: playerNumber, type,
    match_time: `${currentPeriodText.value} - ${formattedTime.value}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), synced: false
  };
  state.eventLog.push(newEvent); state.unsyncedEvents.push(newEvent);
};

// --- ELIMINAR EVENTO ---
const pedirEliminarEvento = (eventToDel) => {
  mostrarNotificacion('Eliminar Evento', `¿Seguro que deseas eliminar este evento (${formatEventType(eventToDel.type)}) de la bitácora?`, 'danger', true, 'delete', eventToDel);
};

// Este handler se dispara cuando el componente ModalExito emite '@confirmar'
const ejecutarAccionPendiente = async () => {
  const key = modalNotificacion.accionKey;

  if (key === 'reset') {
    if (isRunning.value) toggleTimer();
    if (ttoInterval) clearInterval(ttoInterval);
    Object.assign(state, {
      score: { local: 0, visitor: 0 }, timeInSeconds: 0, period: 1, isCountdown: false,
      eventLog: [], unsyncedEvents: [], activePenalties: [], activeTTO: null,
      timeouts: { local: { h1: 0, h2: 0, total: 0, lostThird: false }, visitor: { h1: 0, h2: 0, total: 0, lostThird: false } }
    });
    localStorage.removeItem(STORAGE_KEY);
    modalNotificacion.visible = false;
  }

  if (key === 'delete') {
    const eventToDel = modalNotificacion.tempPayload;

    // 1. Revertir lógica en el marcador/reloj
    if (eventToDel.type === 'goal') {
      if (state.score[eventToDel.team] > 0) state.score[eventToDel.team]--;
    } else if (eventToDel.type === 'goal_removed') {
      state.score[eventToDel.team]++;
    } else if (['2_min', 'red_card', 'blue_card'].includes(eventToDel.type)) {
      const activeIdx = state.activePenalties.findIndex(p => p.team === eventToDel.team && p.playerNumber === eventToDel.player_number);
      if (activeIdx !== -1) state.activePenalties.splice(activeIdx, 1);
    } else if (eventToDel.type === 'timeout') {
      const t = state.timeouts[eventToDel.team];
      if (state.period === 1) t.h1--;
      if (state.period === 2) t.h2--;
      t.total--;
    }

    // 2. Limpiar Bitácora
    state.eventLog = state.eventLog.filter(e => e.id !== eventToDel.id);
    state.unsyncedEvents = state.unsyncedEvents.filter(e => e.id !== eventToDel.id);

    // 3. Avisar al Backend
    if (eventToDel.synced) {
      try {
        await api.post({ entity: 'delegados', action: 'eliminarEvento', payload: { event_local_id: eventToDel.id } });
      } catch (e) { console.error("Error backend delete", e); }
    }

    modalNotificacion.visible = false;
  }
};


// --- TIEMPOS MUERTOS DE EQUIPO (TTO) ---
const canUseTimeout = (team) => {
  const t = state.timeouts[team];
  if (state.activeTTO !== null) return false;
  if (state.period === 1) return t.h1 < 2;
  if (state.period === 2) {
    if (t.h2 >= 2) return false;
    if (t.total >= 3) return false;
    if (t.total === 2 && t.lostThird) return false;
    return true;
  }
  return false;
};

const requestTTO = (team) => {
  if (!canUseTimeout(team)) return;
  if (isRunning.value) { clearInterval(timerInterval); isRunning.value = false; }

  const t = state.timeouts[team];
  if (state.period === 1) t.h1++;
  if (state.period === 2) {
    t.h2++;
    if (t.total === 1 && state.timeInSeconds >= TTO_LIMIT_SEC) t.lostThird = true;
  }
  t.total++;

  state.activeTTO = { team, timeRemaining: 60 };
  resumeTTOTimer();
  guardarEventoEnLog(team, 'timeout', null);
};

const resumeTTOTimer = () => {
  if (ttoInterval) clearInterval(ttoInterval);
  ttoInterval = setInterval(() => {
    state.activeTTO.timeRemaining--;
    if (state.activeTTO.timeRemaining <= 0) cancelTTO();
  }, 1000);
};

const cancelTTO = () => {
  if (ttoInterval) clearInterval(ttoInterval);
  state.activeTTO = null;
};

// --- LÓGICA DEL CRONÓMETRO ---
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

const formatEventType = (type) => {
  const t = {
    goal: '⚽ Gol',
    goal_removed: '❌ Gol Anulado',
    yellow_card: '🟨 Amarilla',
    '2_min': '✌️ 2 Min',
    red_card: '🟥 Roja',
    blue_card: '🟦 Azul',
    timeout: '🟩 TTO'
  };
  return t[type] || type;
};

// --- DESCARGA Y SINC ---
const downloadLog = () => {
  if (filteredLog.value.length === 0) return mostrarNotificacion('Atención', 'No hay datos en la bitácora para descargar.', 'danger');
  let content = `BITÁCORA\nLocal: ${state.score.local} | Visita: ${state.score.visitor}\n\n`;
  filteredLog.value.forEach(e => {
    content += `[${e.match_time}] ${e.team === 'local' ? 'L' : 'V'} ${e.player_number ? `(#${e.player_number})` : ''} -> ${formatEventType(e.type)}\n`;
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  link.download = `bitacora_partido.txt`;
  link.click();
};

const syncWithBackend = async () => {
  if (state.unsyncedEvents.length === 0) return;

  try {
    const result = await api.post({
      entity: 'delegados',
      action: 'sincronizarEventos',
      payload: { match_id: state.matchId, events: state.unsyncedEvents }
    });

    if (result.ok && result.payload && result.payload.status === 'success') {
      state.unsyncedEvents.forEach(u => { const l = state.eventLog.find(e => e.id === u.id); if (l) l.synced = true; });
      state.unsyncedEvents = [];
      mostrarNotificacion('Sincronización Exitosa', 'Los eventos del partido se enviaron al servidor correctamente.', 'success');
    } else {
      mostrarNotificacion('Error', 'El servidor rechazó la sincronización.', 'danger');
    }
  } catch (err) {
    console.error(err);
    mostrarNotificacion('Sin Conexión', 'No se pudo conectar con el servidor. Los datos siguen guardados localmente.', 'danger');
  }
};

onMounted(loadState);
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval); if (ttoInterval) clearInterval(ttoInterval); });
</script>

<style scoped>
/* =========================================
   ESTILOS GENERALES
   ========================================= */
.panel-card { background: #f8fafc; border-radius: 12px; padding: 15px; color: #1e293b; font-family: 'Inter', sans-serif; }
.header-controls { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
.header-controls h2 { font-size: 1.25rem; margin: 0; font-weight: 800; color: #0f172a; }
.small-btn { padding: 6px 12px; font-size: 0.85rem; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; }

/* =========================================
   CRONÓMETRO
   ========================================= */
.timer-section { background: #0f172a; color: #f8fafc; padding: 15px; border-radius: 10px; text-align: center; margin-bottom: 15px; border: 1px solid #1e293b; }
.period-indicator { font-size: 0.9rem; color: #94a3b8; margin-bottom: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
.time-display { font-size: 3.5rem; font-weight: 900; font-family: 'Courier New', monospace; line-height: 1; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.time-paused { color: #ef4444; } /* Rojo más suave cuando pausa */
.timer-controls { display: flex; flex-direction: column; gap: 8px; }
.btn-main-timer { width: 100%; padding: 12px; font-size: 1.1rem; font-weight: 800; border-radius: 6px; border: none; cursor: pointer; background: #2563eb; color: white; transition: background 0.2s; }
.btn-main-timer:hover { background: #1d4ed8; }
.timer-sub-controls { display: flex; gap: 8px; }
.timer-sub-controls > button, .period-nav { flex: 1; }
.period-nav { display: flex; gap: 5px; }
.period-nav button { flex: 1; }

.tto-countdown-box { background: #16a34a; color: #fff; margin-top: 10px; padding: 8px 12px; border-radius: 6px; font-size: 1rem; border: 1px solid #15803d; display: flex; justify-content: space-between; align-items: center; }
.penalties-container { margin-top: 15px; padding-top: 10px; border-top: 1px solid #334155; }
.penalties-container h4 { margin: 0 0 8px 0; font-size: 0.8rem; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px; }
.penalty-timers { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.penalty-box { background: #1e293b; padding: 4px 10px; border-radius: 8px; font-family: monospace; font-size: 0.95rem; display: flex; gap: 8px; border: 1px solid #475569; font-weight: bold; }
.penalty-box.local { border-color: #ef4444; color: #fca5a5; }
.penalty-box.visitor { border-color: #3b82f6; color: #bfdbfe; }

/* =========================================
   EQUIPOS Y CONTROLES (Escritorio Fix)
   ========================================= */
.teams-container { display: flex; gap: 15px; }
.team-column { flex: 1; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center; background: #ffffff; display: flex; flex-direction: column; }
.team-title { margin: 0 0 5px 0; font-size: 1.1rem; font-weight: 800; color: #334155; }
.score-display { font-size: 4rem; font-weight: 900; margin-bottom: 5px; line-height: 1; color: #0f172a; }

.indicators { display: flex; justify-content: center; align-items: center; gap: 8px; min-height: 24px; margin-bottom: 12px; }
.badge-danger { color: #991b1b; background: #fee2e2; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; border: 1px solid #fecaca; }
.tto-dots { display: flex; gap: 4px; }
.dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #94a3b8; background: transparent; }
.dot.used { background: #16a34a; border-color: #15803d; }

.action-buttons { display: flex; flex-direction: column; gap: 8px; flex-grow: 1; justify-content: flex-end;}

.goal-controls { display: flex; gap: 5px; width: 100%; }
.goal-controls .btn-action { flex: 1; }

.btn-action { padding: 12px 10px; border: none; border-radius: 8px; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: transform 0.1s, filter 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.btn-action:active { transform: scale(0.98); }
.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }

/* Colores Alto Contraste para Desktop */
.btn-goal { background: #22c55e; color: white; }
.btn-goal-minus { background: #f97316; color: white; }
.btn-yellow { background: #facc15; color: #422006; } /* Texto oscuro para la amarilla */
.btn-2min { background: #f97316; color: white; }
.btn-red { background: #ef4444; color: white; }
.btn-blue { background: #3b82f6; color: white; }
.btn-tto { background: #16a34a; color: white; border: 2px dashed #14532d; }
.btn-tto:disabled { background: #e2e8f0; color: #94a3b8; border-color: #cbd5e1; cursor: not-allowed; }

.icon { font-size: 1.2rem; }
.btn-text { font-size: 0.95rem; font-weight: 800; letter-spacing: 0.5px; margin-left: 8px; text-transform: uppercase; }

/* Botones genéricos extra */
.btn-danger { background: #dc3545; color: white; }
.btn-secondary { background: #475569; color: white; }

/* =========================================
   BITÁCORA
   ========================================= */
.event-log-section { margin-top: 15px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; }
.log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.log-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.btn-sync { background: #0ea5e9; color: white; padding: 8px 15px; border: none; border-radius: 6px; font-size: 0.85rem; transition: background 0.2s; }
.btn-sync:disabled { background: #cbd5e1; color: #64748b; }
.filter-controls { display: flex; gap: 8px; margin-bottom: 10px; }
.filter-controls select { flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; background: #f8fafc;}
.btn-download { background: #64748b; color: white; padding: 8px 15px; border: none; border-radius: 6px; font-size: 0.85rem; font-weight: bold; }
.log-list ul { list-style: none; padding: 0; max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; margin: 0; background: #f8fafc; }
.log-list li { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center; color: #334155;}
.log-content { flex: 1; }
.btn-delete-log { background: transparent; border: none; font-size: 1.1rem; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s; }
.btn-delete-log:hover { background: #fee2e2; }
.log-time { font-family: monospace; color: #64748b; font-weight: bold; }
.pending-badge { background: #f59e0b; color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 10px; margin-left: 6px; font-weight: bold; }

/* =========================================
   DIBUJO DE CAMISETA EN MODAL DORSAL
   ========================================= */
.shirt-wrapper { position: relative; width: 140px; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
.shirt-svg { width: 100%; height: auto; drop-shadow: 0px 4px 6px rgba(0,0,0,0.1); }
.dorsal-input { position: absolute; width: 50%; top: 35%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-size: 2rem; font-weight: 900; background: transparent; border: none; border-bottom: 2px dashed rgba(255,255,255,0.5); color: white; outline: none; text-transform: uppercase; }
.dorsal-input::placeholder { color: rgba(255,255,255,0.4); }

/* =========================================
   RESPONSIVE MOBILE FIRST
   ========================================= */
@media (max-width: 767px) {
  .btn-text { display: none; } /* En celular ocultamos el texto para ahorrar espacio */
  .teams-container { gap: 8px; }
  .team-column { padding: 8px; }
  .action-buttons { gap: 5px; }
  .btn-action { padding: 10px 0; }
  .icon { font-size: 1.3rem; }
  .score-display { font-size: 3rem; }
}

@media (min-width: 768px) {
  .panel-card { padding: 25px; }
  .time-display { font-size: 4.5rem; }
}
</style>
