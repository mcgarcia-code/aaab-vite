<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <!-- Contenedor principal -->
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100 panel-card" style="border-radius: 15px; background: #f8fafc;">

      <!-- NUEVO HEADER -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-stopwatch-fill me-2"></i> Planilla Digital
          </h4>
          <p class="text-muted small m-0 mt-1">Control de tiempo, anotaciones y eventos del partido.</p>
        </div>

        <div class="d-flex flex-wrap gap-2 justify-content-md-end">
          <button class="btn btn-danger px-3 py-2 fw-bold shadow-sm d-flex align-items-center" @click="resetMatch" style="font-size: 0.85rem;">
            <i class="bi bi-arrow-counterclockwise me-2"></i> REINICIAR
          </button>
        </div>
      </div>

      <!-- Cuerpo del panel -->
      <div class="card-body p-2 p-md-4">

        <!-- ================= CRONÓMETRO ================= -->
        <div class="bg-dark text-white p-3 p-md-4 rounded-4 shadow-sm text-center mb-3 mb-md-4 border border-secondary">
          <div class="text-uppercase fw-bold text-white small mb-2" style="letter-spacing: 1px;">{{ currentPeriodText }}</div>

          <!-- Reloj clickeable -->
          <div
            class="time-display"
            :class="{ 'text-danger': !isRunning }"
            @click="abrirModalTiempo"
            style="cursor: pointer;"
            title="Ajustar cronómetro"
          >
            {{ formattedTime }}
          </div>

          <div class="d-flex flex-column gap-2 mt-2">
            <button class="btn btn-primary w-100 py-2 py-md-3 fw-bold fs-5 shadow-sm" @click="toggleTimer" :disabled="state.activeTTO !== null">
              {{ isRunning ? '⏸ PAUSAR' : '▶ INICIAR' }}
            </button>
            <div class="row g-2">
              <div class="col-6 col-md-4">
                <button class="btn btn-secondary w-100 fw-bold small py-2" @click="toggleDirection">
                  ⏱ {{ state.isCountdown ? 'Regresivo' : 'Progresivo' }}
                </button>
              </div>
              <div class="col-6 col-md-8 d-flex gap-2">
                <button class="btn btn-secondary w-100 fw-bold small py-2" @click="prevPeriod" :disabled="isRunning || state.period === 1">⏮ Volver</button>
                <button class="btn btn-secondary w-100 fw-bold small py-2" @click="nextPeriod" :disabled="isRunning">⏭ Sig.</button>
              </div>
            </div>
          </div>

          <div v-if="state.activeTTO" class="bg-success text-white mt-3 p-2 rounded-3 fw-bold border border-success d-flex justify-content-between align-items-center">
            <div>
              <span class="me-1">🟩</span> TTO ({{ state.activeTTO.team === 'local' ? 'L' : 'V' }}): <strong>{{ state.activeTTO.timeRemaining }}s</strong>
            </div>
            <button class="btn btn-danger btn-sm fw-bold px-3 py-1 rounded-pill" @click="cancelTTO">❌ Cortar</button>
          </div>

          <div class="mt-3 pt-3 border-top border-secondary" v-if="state.activePenalties.length > 0">
            <h4 class="text-uppercase text-muted small fw-bold mb-2" style="letter-spacing: 1px;">Exclusiones Activas</h4>
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <div v-for="penalty in state.activePenalties" :key="penalty.id" class="penalty-box" :class="penalty.team">
                <span class="penalty-team">{{ penalty.team === 'local' ? 'L' : 'V' }}</span>
                <span class="penalty-player">#{{ penalty.playerNumber }}</span>
                <span class="penalty-time">{{ formatPenaltyTime(penalty.timeRemaining) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= EQUIPOS ================= -->
        <div class="row g-2 g-md-4 mb-3 mb-md-4">

          <!-- LOCAL -->
          <div class="col-6">
            <div class="bg-white p-2 p-md-4 rounded-4 border shadow-sm h-100 d-flex flex-column text-center">
              <!-- SELECT DE CLUB LOCAL -->
              <div class="mb-2">
                <select v-model="state.localClubId" class="form-select form-select-sm fw-bold text-center border-0 bg-light shadow-sm text-uppercase" style="font-size: 1rem; color: #212529;">
                  <option value="" disabled>SELECCIONAR LOCAL</option>
                  <option v-for="club in state.clubes" :key="club.club_id" :value="club.club_id">
                    {{ club.club_nombre }}
                  </option>
                </select>
              </div>

              <div class="score-display text-dark">{{ state.score.local }}</div>

              <div class="d-flex justify-content-center align-items-center gap-2 mb-3 min-h-24">
                <span v-if="localPlayersLess > 0" class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">⚠️ -{{ localPlayersLess }}</span>
                <div class="d-flex gap-1">
                  <span v-for="n in 3" :key="n" class="dot" :class="{ 'used': state.timeouts.local.total >= n }"></span>
                </div>
              </div>

              <div class="d-flex flex-column gap-2 flex-grow-1 justify-content-end">
                <div class="d-flex gap-1 w-100">
                  <button class="btn btn-action bg-orange text-white w-50" @click="restarGol('local')" :disabled="state.score.local === 0">
                    <span class="fs-5 lh-1">➖</span><span class="d-none d-md-inline fw-bold text-uppercase ms-1 small">Restar</span>
                  </button>
                  <button class="btn btn-action bg-success text-white w-50" @click="registrarGol('local')">
                    <span class="fs-5 lh-1">⚽</span><span class="d-none d-md-inline fw-bold text-uppercase ms-1 small">Gol</span>
                  </button>
                </div>
                <button class="btn btn-action bg-yellow text-dark w-100" @click="pedirDorsal('local', 'yellow_card')">
                  <span class="fs-5 lh-1">🟨</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Amarilla</span>
                </button>
                <button class="btn btn-action bg-orange text-white w-100" @click="pedirDorsal('local', '2_min')">
                  <span class="fs-5 lh-1">✌️</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">2 Minutos</span>
                </button>
                <button class="btn btn-action bg-danger text-white w-100" @click="pedirDorsal('local', 'red_card')">
                  <span class="fs-5 lh-1">🟥</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Roja</span>
                </button>
                <button class="btn btn-action bg-primary text-white w-100" @click="pedirDorsal('local', 'blue_card')">
                  <span class="fs-5 lh-1">🟦</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Azul</span>
                </button>
                <button class="btn btn-action btn-tto text-white w-100" @click="requestTTO('local')" :disabled="!canUseTimeout('local')">
                  <span class="fs-5 lh-1">🟩</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">TTO</span>
                </button>
              </div>
            </div>
          </div>

          <!-- VISITA -->
          <div class="col-6">
            <div class="bg-white p-2 p-md-4 rounded-4 border shadow-sm h-100 d-flex flex-column text-center">
              <!-- SELECT DE CLUB VISITA -->
              <div class="mb-2">
                <select v-model="state.visitorClubId" class="form-select form-select-sm fw-bold text-center border-0 bg-light shadow-sm text-uppercase" style="font-size: 1rem; color: #212529;">
                  <option value="" disabled>SELECCIONAR VISITA</option>
                  <option v-for="club in state.clubes" :key="club.club_id" :value="club.club_id">
                    {{ club.club_nombre }}
                  </option>
                </select>
              </div>

              <div class="score-display text-dark">{{ state.score.visitor }}</div>

              <div class="d-flex justify-content-center align-items-center gap-2 mb-3 min-h-24">
                <span v-if="visitorPlayersLess > 0" class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">⚠️ -{{ visitorPlayersLess }}</span>
                <div class="d-flex gap-1">
                  <span v-for="n in 3" :key="n" class="dot" :class="{ 'used': state.timeouts.visitor.total >= n }"></span>
                </div>
              </div>

              <div class="d-flex flex-column gap-2 flex-grow-1 justify-content-end">
                <div class="d-flex gap-1 w-100">
                  <button class="btn btn-action bg-orange text-white w-50" @click="restarGol('visitor')" :disabled="state.score.visitor === 0">
                    <span class="fs-5 lh-1">➖</span><span class="d-none d-md-inline fw-bold text-uppercase ms-1 small">Restar</span>
                  </button>
                  <button class="btn btn-action bg-success text-white w-50" @click="registrarGol('visitor')">
                    <span class="fs-5 lh-1">⚽</span><span class="d-none d-md-inline fw-bold text-uppercase ms-1 small">Gol</span>
                  </button>
                </div>
                <button class="btn btn-action bg-yellow text-dark w-100" @click="pedirDorsal('visitor', 'yellow_card')">
                  <span class="fs-5 lh-1">🟨</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Amarilla</span>
                </button>
                <button class="btn btn-action bg-orange text-white w-100" @click="pedirDorsal('visitor', '2_min')">
                  <span class="fs-5 lh-1">✌️</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">2 Minutos</span>
                </button>
                <button class="btn btn-action bg-danger text-white w-100" @click="pedirDorsal('visitor', 'red_card')">
                  <span class="fs-5 lh-1">🟥</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Roja</span>
                </button>
                <button class="btn btn-action bg-primary text-white w-100" @click="pedirDorsal('visitor', 'blue_card')">
                  <span class="fs-5 lh-1">🟦</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Azul</span>
                </button>
                <button class="btn btn-action btn-tto text-white w-100" @click="requestTTO('visitor')" :disabled="!canUseTimeout('visitor')">
                  <span class="fs-5 lh-1">🟩</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">TTO</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= BITÁCORA ================= -->
        <div class="bg-white border rounded-4 shadow-sm p-3 p-md-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <h3 class="m-0 fs-5 fw-bold text-dark">Bitácora</h3>
            <span class="badge px-3 py-2" :class="state.unsyncedEvents.length > 0 ? 'bg-warning-subtle text-dark border border-warning' : 'bg-success-subtle text-success border border-success'">
              {{ state.unsyncedEvents.length > 0 ? '☁️ Sincronizando...' : '✅ Sincronizado' }}
            </span>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-12 col-md-9">
              <select v-model="logFilter" class="form-select bg-light shadow-none">
                <option value="all">Todos los eventos</option>
                <option value="goals">Goles</option>
                <option value="sanctions">Sanciones</option>
              </select>
            </div>
            <div class="col-12 col-md-3">
              <button class="btn btn-secondary w-100 fw-bold d-flex align-items-center justify-content-center gap-2" @click="downloadLog">
                <i class="bi bi-download"></i> Txt
              </button>
            </div>
          </div>

          <div class="border rounded bg-light overflow-hidden" style="max-height: 250px; overflow-y: auto;">
            <ul class="list-group list-group-flush mb-0">
              <li v-for="event in filteredLog" :key="event.id" class="list-group-item bg-transparent d-flex justify-content-between align-items-center py-2 px-3">
                <div class="small">
                  <span class="text-muted fw-bold font-monospace me-2">[{{ event.match_time }}]</span>
                  <strong class="text-dark">{{ event.team === 'local' ? 'L' : (event.team === 'visitor' ? 'V' : 'SISTEMA') }}</strong>
                  <span class="text-dark" v-if="event.player_number && event.type !== 'goal_removed' && event.type !== 'tiempo_ajustado'"> (#{{ event.player_number }})</span><span class="text-dark">:</span>
                  <span class="text-secondary ms-1">{{ formatEventType(event.type) }}</span>
                  <span v-if="event.type === 'tiempo_ajustado'" class="text-muted small ms-1">- {{ event.player_number }}</span>
                  <span v-if="!event.synced" class="badge bg-warning text-dark ms-2" style="font-size: 0.6rem;">Pendiente</span>
                </div>
                <button v-if="event.team !== 'sistema'" class="btn btn-sm btn-light border text-danger p-1 lh-1" @click="pedirEliminarEvento(event)" title="Eliminar">
                  <i class="bi bi-trash"></i>
                </button>
              </li>
              <li v-if="filteredLog.length === 0" class="list-group-item bg-transparent text-center text-muted py-4 small">
                Sin registros en la bitácora.
              </li>
            </ul>
          </div>
        </div>

      </div> <!-- Cierre card-body -->
    </div> <!-- Cierre card principal -->

    <!-- ================= MODALES ================= -->
    <ModalBase
      :show="modalJugador.visible"
      titulo="Ingresar Sanción"
      icono="sports"
      colorIcono="bg-dark text-white"
      @close="cerrarModalDorsal"
    >
      <div class="text-center">
        <p class="mb-3 text-muted small">Ingrese el número del jugador (o letra A-E para oficiales).</p>

        <div class="shirt-wrapper">
          <svg viewBox="0 0 24 24" class="shirt-svg" :style="{ fill: modalJugador.team === 'local' ? '#dc2626' : '#2563eb' }">
            <path d="M21.99 7.99l-3.99-3.98c-.54-.54-1.42-.64-2.08-.22L12 6.51 8.08 3.79c-.66-.42-1.54-.32-2.08.22L2.01 7.99c-.42.42-.42 1.11 0 1.54l1.49 1.49c.42.42 1.11.42 1.54 0l1.48-1.48v8.46c0 .55.45 1 1 1h8.96c.55 0 1-.45 1-1v-8.46l1.48 1.48c.42.42 1.11.42 1.54 0l1.49-1.49c.43-.43.43-1.12.01-1.54z"/>
          </svg>
          <input
            type="text"
            v-model="modalJugador.dorsal"
            class="dorsal-input"
            placeholder="Nº"
            @keyup.enter="confirmarSancion"
            autofocus
          >
        </div>
      </div>

      <template #footer>
        <button class="btn btn-light fw-bold px-4 border" @click="cerrarModalDorsal">CANCELAR</button>
        <button class="btn btn-dark fw-bold px-4 shadow-sm" @click="confirmarSancion">CONFIRMAR</button>
      </template>
    </ModalBase>

    <!-- Modal para Ajustar Cronómetro Manualmente -->
    <ModalBase
      :show="modalTiempo.visible"
      titulo="Ajustar Tiempo"
      icono="timer"
      colorIcono="bg-primary text-white"
      @close="modalTiempo.visible = false"
    >
      <div class="text-center p-3">
        <p class="small text-muted mb-4">Modifique los minutos y segundos del partido:</p>

        <div class="d-flex justify-content-center align-items-center gap-3">
          <div class="text-center">
            <label class="small fw-bold text-muted d-block mb-1">MINUTOS</label>
            <input
              type="number"
              v-model="modalTiempo.mm"
              class="form-control form-control-lg text-center fw-bold shadow-none border-secondary"
              style="font-size: 2rem; width: 90px;"
              min="0"
            >
          </div>

          <div class="display-6 fw-bold mt-3 text-muted">:</div>

          <div class="text-center">
            <label class="small fw-bold text-muted d-block mb-1">SEGUNDOS</label>
            <input
              type="number"
              v-model="modalTiempo.ss"
              class="form-control form-control-lg text-center fw-bold shadow-none border-secondary"
              style="font-size: 2rem; width: 90px;"
              min="0"
              max="59"
            >
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-light fw-bold px-4 border" @click="modalTiempo.visible = false">CANCELAR</button>
        <button class="btn btn-primary fw-bold px-4 shadow-sm" @click="confirmarAjusteTiempo">GUARDAR TIEMPO</button>
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
import ModalBase from '@/components/ModalBase.vue';
import ModalExito from '@/components/ModalExito.vue';
import { useHead } from '@vueuse/head'

useHead({
  title: 'Delegados Técnicos | AAAB',
  meta: [
    { name: 'description', content: 'Planilla de Delegados Técnicos' }
  ],
})

const STORAGE_KEY = 'aaab_delegado_match_state';
const HALF_DURATION_SEC = 30 * 60;
const TTO_LIMIT_SEC = 25 * 60;

const state = reactive({
  matchId: 1,
  localClubId: '',
  visitorClubId: '',
  clubes: [],
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
const isSyncing = ref(false);
const logFilter = ref('all');
let timerInterval = null;
let ttoInterval = null;

// --- ESTADO DE MODALES ---
const modalJugador = reactive({ visible: false, team: '', type: '', dorsal: '' });
const modalTiempo = reactive({ visible: false, mm: 0, ss: 0 });
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

// --- PERSISTENCIA Y SINCRONIZACIÓN AUTOMÁTICA ---
const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) Object.assign(state, JSON.parse(saved));
  if (state.activeTTO && state.activeTTO.timeRemaining > 0) resumeTTOTimer();
};

watch(state, (newState) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(newState)); }, { deep: true });

watch(() => state.unsyncedEvents.length, (newVal) => {
  if (newVal > 0 && !isSyncing.value) syncWithBackend();
});

const resetMatch = () => {
  mostrarNotificacion('Reiniciar', '¿Estás seguro que deseas reiniciar el partido? Se perderán los datos locales no sincronizados.', 'danger', true, 'reset');
};

// --- CARGAR CLUBES ---
const cargarClubes = async () => {
  try {
    const result = await api.post({
      entity: 'clubes',
      action: 'obtenerClubes'
    });

    if (result.ok && result.payload) {
      state.clubes = result.payload;
    } else if (Array.isArray(result)) {
      state.clubes = result; // Por si el endpoint devuelve el array directamente
    }
  } catch (error) {
    console.error("Error al cargar la lista de clubes:", error);
  }
};

// --- AJUSTE MANUAL DE TIEMPO ---
const abrirModalTiempo = () => {
  if (isRunning.value) {
    mostrarNotificacion('Reloj en marcha', 'Debe pausar el cronómetro para ajustar el tiempo manualmente.', 'danger');
    return;
  }
  modalTiempo.mm = Math.floor(state.timeInSeconds / 60);
  modalTiempo.ss = state.timeInSeconds % 60;
  modalTiempo.visible = true;
};

const confirmarAjusteTiempo = () => {
  const m = parseInt(modalTiempo.mm);
  const s = parseInt(modalTiempo.ss);

  if (isNaN(m) || isNaN(s) || s < 0 || s > 59 || m < 0) {
    mostrarNotificacion('Error', 'Ingrese un formato de tiempo válido.', 'danger');
    return;
  }

  state.timeInSeconds = (m * 60) + s;
  guardarEventoEnLog('sistema', 'tiempo_ajustado', null, `Ajuste manual a ${m}:${s.toString().padStart(2, '0')}`);
  modalTiempo.visible = false;
};

const getLocalTimestamp = () => {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// --- VALIDACIÓN DE DORSAL ---
const validarDorsal = (dorsal) => {
  const dorsalLimpio = dorsal.toString().trim().toUpperCase();
  const letrasValidas = ['A', 'B', 'C', 'D', 'E'];
  if (letrasValidas.includes(dorsalLimpio)) {
    return { valido: true, valor: dorsalLimpio, tipo: 'oficial' };
  }
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
  if (['2_min', 'red_card', 'blue_card'].includes(type)) {
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

  const validacion = validarDorsal(dorsal);
  if (!validacion.valido) {
    mostrarNotificacion('Error', 'Debe ingresar un número válido o una letra entre A y E para oficiales.', 'danger');
    return;
  }

  const dorsalFinal = validacion.valor;

  if (validacion.tipo === 'jugador') {
    const stats = obtenerSancionesJugador(team, dorsalFinal);

    if (type === 'yellow_card') {
      if (stats.yellow >= 1) {
        mostrarNotificacion('Reglamento IHF', `El jugador #${dorsalFinal} ya tiene una amarilla. Máximo una por jugador.`, 'danger');
        return;
      }
      if (stats.two_min > 0) {
        mostrarNotificacion('Reglamento IHF', `El jugador #${dorsalFinal} ya posee una exclusión. No puede recibir tarjeta amarilla.`, 'danger');
        return;
      }
    }

    let esTerceraExclusion = false;
    if (type === '2_min' && stats.two_min >= 2) {
      esTerceraExclusion = true;
      mostrarNotificacion('Roja Automática', `El jugador #${dorsalFinal} alcanzó su 3ra exclusión de 2 minutos. Corresponde Descalificación.`, 'danger');
    }

    aplicarPenalidadReloj(team, type, dorsalFinal);
    guardarEventoEnLog(team, type, dorsalFinal);

    if (esTerceraExclusion) {
      aplicarPenalidadReloj(team, 'red_card', dorsalFinal);
      guardarEventoEnLog(team, 'red_card', dorsalFinal);
    }
  } else {
    aplicarPenalidadReloj(team, type, dorsalFinal);
    guardarEventoEnLog(team, type, dorsalFinal);
  }

  cerrarModalDorsal();
};

const aplicarPenalidadReloj = (team, type, playerNumber) => {
  if (['2_min', 'red_card', 'blue_card'].includes(type)) {
    const existing = [...state.activePenalties].reverse().find(p => p.team === team && p.playerNumber === playerNumber);

    if (existing && existing.timeGiven === state.timeInSeconds) {
      if (existing.timeRemaining < 240) {
        existing.timeRemaining = Math.min(existing.timeRemaining + 120, 240);
      }
      if (type === 'red_card' || type === 'blue_card') {
        existing.type = type;
      }
    } else {
      state.activePenalties.push({ id: Date.now(), team, type, playerNumber, timeRemaining: 120, timeGiven: state.timeInSeconds });
    }
  }
};

const guardarEventoEnLog = (team, type, playerNumber, customTimeStr = null) => {
  const matchTimeStr = customTimeStr ? customTimeStr : `${currentPeriodText.value} - ${formattedTime.value}`;

  const newEvent = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    team,
    player_number: playerNumber,
    type,
    match_time: matchTimeStr,
    timestamp: getLocalTimestamp(),
    synced: false
  };
  state.eventLog.push(newEvent);
  state.unsyncedEvents.push(newEvent);
};

// --- ELIMINAR EVENTO ---
const pedirEliminarEvento = (eventToDel) => {
  mostrarNotificacion('Eliminar Evento', `¿Seguro que deseas eliminar este evento (${formatEventType(eventToDel.type)}) de la bitácora?`, 'danger', true, 'delete', eventToDel);
};

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
    // Limpia localstorage pero conserva los clubes cargados
    localStorage.removeItem(STORAGE_KEY);
    modalNotificacion.visible = false;
  }

  if (key === 'delete') {
    const eventToDel = modalNotificacion.tempPayload;

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

    state.eventLog = state.eventLog.filter(e => e.id !== eventToDel.id);
    state.unsyncedEvents = state.unsyncedEvents.filter(e => e.id !== eventToDel.id);

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
    timeout: '🟩 TTO',
    tiempo_ajustado: '⚙️ Tiempo Ajustado'
  };
  return t[type] || type;
};

const downloadLog = () => {
  if (filteredLog.value.length === 0) return mostrarNotificacion('Atención', 'No hay datos en la bitácora para descargar.', 'danger');
  let content = `BITÁCORA\nLocal: ${state.score.local} | Visita: ${state.score.visitor}\n\n`;
  filteredLog.value.forEach(e => {
    content += `[${e.match_time}] ${e.team === 'local' ? 'L' : (e.team === 'visitor' ? 'V' : 'SISTEMA')} ${e.player_number && e.type !== 'tiempo_ajustado' ? `(#${e.player_number})` : ''} -> ${formatEventType(e.type)}`;
    if (e.type === 'tiempo_ajustado') content += ` (${e.player_number})`;
    content += '\n';
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  link.download = `bitacora_partido.txt`;
  link.click();
};

const syncWithBackend = async () => {
  if (state.unsyncedEvents.length === 0 || isSyncing.value) return;
  isSyncing.value = true;

  try {
    const result = await api.post({
      entity: 'delegados',
      action: 'sincronizarEventos',
      payload: { match_id: state.matchId, events: state.unsyncedEvents }
    });

    if (result.ok && result.payload && result.payload.status === 'success') {
      state.unsyncedEvents.forEach(u => { const l = state.eventLog.find(e => e.id === u.id); if (l) l.synced = true; });
      state.unsyncedEvents = [];
    }
  } catch (err) {
    console.error("Error al sincronizar automáticamente:", err);
  } finally {
    isSyncing.value = false;
  }
};

onMounted(() => {
  loadState();
  cargarClubes();
});

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval); if (ttoInterval) clearInterval(ttoInterval); });
</script>

<style scoped>
/* =========================================
   FUENTES Y CLAMPING (RESPONSIVO AUTOMÁTICO)
   ========================================= */
.time-display {
  font-size: clamp(3.5rem, 12vw, 5rem);
  font-weight: 900;
  font-family: 'Courier New', monospace;
  line-height: 1;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
.score-display {
  font-size: clamp(3rem, 10vw, 4rem);
  font-weight: 900;
  margin-bottom: 5px;
  line-height: 1;
}

/* =========================================
   BADGES Y PUNTOS DE TTO
   ========================================= */
.penalty-box { background: #1e293b; padding: 4px 10px; border-radius: 8px; font-family: monospace; font-size: 0.95rem; display: flex; gap: 8px; border: 1px solid #475569; font-weight: bold; }
.penalty-box.local { border-color: #ef4444; color: #fca5a5; }
.penalty-box.visitor { border-color: #3b82f6; color: #bfdbfe; }

.min-h-24 { min-height: 24px; }
.dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #94a3b8; background: transparent; }
.dot.used { background: #16a34a; border-color: #15803d; }

/* =========================================
   BOTONES DE ACCIÓN (EQUIPOS)
   ========================================= */
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

/* Colores Específicos para tarjetas y acciones */
.bg-orange { background-color: #f97316 !important; }
.bg-yellow { background-color: #facc15 !important; }

.btn-tto { background: #16a34a; border: 2px dashed #14532d; }
.btn-tto:disabled { background: #e2e8f0; color: #94a3b8 !important; border-color: #cbd5e1; cursor: not-allowed; }

/* =========================================
   DIBUJO DE CAMISETA EN MODAL DORSAL
   ========================================= */
.shirt-wrapper { position: relative; width: 140px; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
.shirt-svg { width: 100%; height: auto; drop-shadow: 0px 4px 6px rgba(0,0,0,0.1); }
.dorsal-input { position: absolute; width: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-size: 1.5rem; font-weight: 900; background: transparent; border: none; border-bottom: 2px dashed rgba(255,255,255,0.5); color: white; outline: none; text-transform: uppercase; }
.dorsal-input::placeholder { color: rgba(255,255,255,0.4); }

.animate__animated { animation-duration: 0.5s; }


</style>
