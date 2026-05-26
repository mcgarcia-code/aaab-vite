<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100 panel-card" style="border-radius: 15px; background: #f8fafc;">

      <!-- HEADER -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-stopwatch-fill me-2"></i> Planilla Digital
          </h4>
          <p class="text-muted small m-0 mt-1">Control de tiempo, anotaciones y eventos del partido.</p>
        </div>
        <div class="d-flex flex-wrap gap-2 justify-content-md-end">
          <button
            class="btn btn-outline-secondary px-3 py-2 fw-bold shadow-sm d-flex align-items-center"
            @click="abrirConfig"
            style="font-size: 0.85rem;"
          >
            <i class="bi bi-gear-fill me-2"></i> CONFIG
          </button>
          <button
            class="btn btn-danger px-3 py-2 fw-bold shadow-sm d-flex align-items-center"
            @click="resetMatch"
            style="font-size: 0.85rem;"
          >
            <i class="bi bi-arrow-counterclockwise me-2"></i> REINICIAR
          </button>
        </div>
      </div>

      <div class="card-body p-2 p-md-4">

        <!-- BANNER: PARTIDO FINALIZADO -->
        <div
          v-if="state.matchStatus === 'finished'"
          class="alert alert-success text-center fw-bold mb-3 rounded-4 d-flex align-items-center justify-content-center gap-2 fs-5"
        >
          🏁 Partido Finalizado — {{ state.score.local }} : {{ state.score.visitor }}
        </div>

        <!-- ================= CRONÓMETRO ================= -->
        <div
          class="bg-dark text-white p-3 p-md-4 rounded-4 shadow-sm text-center mb-3 mb-md-4 border"
          :class="state.period >= 3 ? 'border-warning' : 'border-secondary'"
        >
          <!-- Período actual -->
          <div
            class="text-uppercase fw-bold small mb-2 d-flex align-items-center justify-content-center gap-2"
            :class="state.period >= 3 ? 'text-warning' : 'text-white'"
            style="letter-spacing: 1px;"
          >
            {{ currentPeriodText }}
            <span v-if="state.period >= 3" class="badge bg-warning text-dark">PRÓRROGA</span>
          </div>

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
            <button
              class="btn btn-primary w-100 py-2 py-md-3 fw-bold fs-5 shadow-sm"
              @click="toggleTimer"
              :disabled="state.activeTTO !== null || state.matchStatus === 'finished' || state.breakActive"
            >
              {{ isRunning ? '⏸ PAUSAR' : '▶ INICIAR' }}
            </button>
            <div class="row g-2">
              <div class="col-6 col-md-4">
                <button class="btn btn-secondary w-100 fw-bold small py-2" @click="toggleDirection" :disabled="state.breakActive">
                  ⏱ {{ state.isCountdown ? 'Regresivo' : 'Progresivo' }}
                </button>
              </div>
              <div class="col-6 col-md-8 d-flex gap-2">
                <button
                  class="btn btn-secondary w-100 fw-bold small py-2"
                  @click="prevPeriod"
                  :disabled="isRunning || state.period === 1 || state.matchStatus === 'finished'"
                >
                  ⏮ Volver
                </button>
                <button
                  class="btn btn-secondary w-100 fw-bold small py-2"
                  @click="nextPeriod"
                  :disabled="isRunning || state.matchStatus === 'finished' || state.breakActive"
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
            <button class="btn btn-danger btn-sm fw-bold px-3 py-1 rounded-pill" @click="cancelTTO">❌ Cortar</button>
          </div>

          <!-- Descanso activo (entre tiempos de prórroga) -->
          <div
            v-if="state.breakActive"
            class="mt-3 p-3 rounded-3 fw-bold border text-center"
            :class="state.breakType === 'ot_round' ? 'bg-purple text-white border-purple' : 'bg-info text-white border-info'"
            style="background: #6f42c1 !important;"
            :style="state.breakType === 'ot_half' ? { background: '#0dcaf0' } : { background: '#6f42c1' }"
          >
            <div class="text-uppercase small mb-1" style="letter-spacing: 1px; opacity: 0.85;">
              {{ state.breakType === 'ot_half' ? '⏸ Descanso entre tiempos' : '⏸ Descanso entre prórrogas' }}
            </div>
            <div class="display-6 fw-bold font-monospace">
              {{ formatPenaltyTime(state.breakTimeRemaining) }}
            </div>
            <div class="small mt-1 opacity-75">
              {{ state.breakType === 'ot_half' ? '1 minuto reglamentario' : '5 minutos reglamentarios' }}
            </div>
            <button
              class="btn btn-outline-light btn-sm fw-bold mt-2 px-4"
              @click="skipBreak"
            >
              ⏩ Saltar descanso
            </button>
          </div>

          <!-- Exclusiones activas -->
          <div class="mt-3 pt-3 border-top border-secondary" v-if="state.activePenalties.length > 0">
            <h4 class="text-uppercase text-muted small fw-bold mb-2" style="letter-spacing: 1px;">
              Exclusiones Activas
              <span class="text-muted fw-light ms-1" style="font-size: 0.65rem; letter-spacing: 0;">(toca para editar)</span>
            </h4>
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <div
                v-for="penalty in state.activePenalties"
                :key="penalty.id"
                class="penalty-box"
                :class="penalty.team"
                @click="editarPenalidad(penalty)"
                style="cursor: pointer;"
                title="Toca para corregir el tiempo"
              >
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
              <div class="mb-2">
                <select
                  v-model="state.localClubId"
                  class="form-select form-select-sm fw-bold text-center border-0 bg-light shadow-sm text-uppercase"
                  style="font-size: 1rem; color: #212529;"
                >
                  <option value="" disabled>SELECCIONAR LOCAL</option>
                  <option v-for="club in state.clubes" :key="club.club_id" :value="club.club_id">
                    {{ club.club_nombre }}
                  </option>
                </select>
              </div>

              <div class="score-display text-dark">{{ state.score.local }}</div>

              <!-- Jugadores descalificados LOCAL -->
              <div v-if="disqualifiedLocal.length > 0" class="mb-2 d-flex flex-wrap gap-1 justify-content-center">
                <span
                  v-for="p in disqualifiedLocal"
                  :key="p.playerNumber"
                  class="badge text-white px-2 py-1"
                  :style="{ background: p.reason === 'blue_card' ? '#1d4ed8' : '#991b1b' }"
                  :title="`#${p.playerNumber} descalificado (${p.reason === 'blue_card' ? 'Azul' : 'Roja'})`"
                >
                  🚫 #{{ p.playerNumber }}
                </span>
              </div>

              <div class="d-flex justify-content-center align-items-center gap-2 mb-3 min-h-24">
                <span v-if="localPlayersLess > 0" class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">⚠️ -{{ localPlayersLess }}</span>
                <div class="d-flex gap-1">
                  <span v-for="n in 3" :key="n" class="dot" :class="{ 'used': state.timeouts.local.total >= n }"></span>
                </div>
              </div>

              <div class="d-flex flex-column gap-2 flex-grow-1 justify-content-end">
                <div class="d-flex gap-1 w-100">
                  <button class="btn btn-action bg-orange text-white w-50" @click="restarGol('local')" :disabled="state.score.local === 0 || state.matchStatus === 'finished'">
                    <span class="fs-5 lh-1">➖</span><span class="d-none d-md-inline fw-bold text-uppercase ms-1 small">Restar</span>
                  </button>
                  <button class="btn btn-action bg-success text-white w-50" @click="registrarGol('local')" :disabled="state.matchStatus === 'finished'">
                    <span class="fs-5 lh-1">⚽</span><span class="d-none d-md-inline fw-bold text-uppercase ms-1 small">Gol</span>
                  </button>
                </div>
                <button class="btn btn-action bg-yellow text-dark w-100" @click="pedirDorsal('local', 'yellow_card')" :disabled="state.matchStatus === 'finished'">
                  <span class="fs-5 lh-1">🟨</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Amarilla</span>
                </button>
                <button class="btn btn-action bg-orange text-white w-100" @click="pedirDorsal('local', '2_min')" :disabled="state.matchStatus === 'finished'">
                  <span class="fs-5 lh-1">✌️</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">2 Minutos</span>
                </button>
                <button class="btn btn-action bg-danger text-white w-100" @click="pedirDorsal('local', 'red_card')" :disabled="state.matchStatus === 'finished'">
                  <span class="fs-5 lh-1">🟥</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Roja</span>
                </button>
                <button class="btn btn-action bg-primary text-white w-100" @click="pedirDorsal('local', 'blue_card')" :disabled="state.matchStatus === 'finished'">
                  <span class="fs-5 lh-1">🟦</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Azul</span>
                </button>
                <button class="btn btn-action btn-tto text-white w-100" @click="requestTTO('local')" :disabled="!canUseTimeout('local') || state.matchStatus === 'finished'">
                  <span class="fs-5 lh-1">🟩</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">TTO</span>
                </button>
              </div>
            </div>
          </div>

          <!-- VISITA -->
          <div class="col-6">
            <div class="bg-white p-2 p-md-4 rounded-4 border shadow-sm h-100 d-flex flex-column text-center">
              <div class="mb-2">
                <select
                  v-model="state.visitorClubId"
                  class="form-select form-select-sm fw-bold text-center border-0 bg-light shadow-sm text-uppercase"
                  style="font-size: 1rem; color: #212529;"
                >
                  <option value="" disabled>SELECCIONAR VISITA</option>
                  <option v-for="club in state.clubes" :key="club.club_id" :value="club.club_id">
                    {{ club.club_nombre }}
                  </option>
                </select>
              </div>

              <div class="score-display text-dark">{{ state.score.visitor }}</div>

              <!-- Jugadores descalificados VISITA -->
              <div v-if="disqualifiedVisitor.length > 0" class="mb-2 d-flex flex-wrap gap-1 justify-content-center">
                <span
                  v-for="p in disqualifiedVisitor"
                  :key="p.playerNumber"
                  class="badge text-white px-2 py-1"
                  :style="{ background: p.reason === 'blue_card' ? '#1d4ed8' : '#991b1b' }"
                  :title="`#${p.playerNumber} descalificado (${p.reason === 'blue_card' ? 'Azul' : 'Roja'})`"
                >
                  🚫 #{{ p.playerNumber }}
                </span>
              </div>

              <div class="d-flex justify-content-center align-items-center gap-2 mb-3 min-h-24">
                <span v-if="visitorPlayersLess > 0" class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">⚠️ -{{ visitorPlayersLess }}</span>
                <div class="d-flex gap-1">
                  <span v-for="n in 3" :key="n" class="dot" :class="{ 'used': state.timeouts.visitor.total >= n }"></span>
                </div>
              </div>

              <div class="d-flex flex-column gap-2 flex-grow-1 justify-content-end">
                <div class="d-flex gap-1 w-100">
                  <button class="btn btn-action bg-orange text-white w-50" @click="restarGol('visitor')" :disabled="state.score.visitor === 0 || state.matchStatus === 'finished'">
                    <span class="fs-5 lh-1">➖</span><span class="d-none d-md-inline fw-bold text-uppercase ms-1 small">Restar</span>
                  </button>
                  <button class="btn btn-action bg-success text-white w-50" @click="registrarGol('visitor')" :disabled="state.matchStatus === 'finished'">
                    <span class="fs-5 lh-1">⚽</span><span class="d-none d-md-inline fw-bold text-uppercase ms-1 small">Gol</span>
                  </button>
                </div>
                <button class="btn btn-action bg-yellow text-dark w-100" @click="pedirDorsal('visitor', 'yellow_card')" :disabled="state.matchStatus === 'finished'">
                  <span class="fs-5 lh-1">🟨</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Amarilla</span>
                </button>
                <button class="btn btn-action bg-orange text-white w-100" @click="pedirDorsal('visitor', '2_min')" :disabled="state.matchStatus === 'finished'">
                  <span class="fs-5 lh-1">✌️</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">2 Minutos</span>
                </button>
                <button class="btn btn-action bg-danger text-white w-100" @click="pedirDorsal('visitor', 'red_card')" :disabled="state.matchStatus === 'finished'">
                  <span class="fs-5 lh-1">🟥</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Roja</span>
                </button>
                <button class="btn btn-action bg-primary text-white w-100" @click="pedirDorsal('visitor', 'blue_card')" :disabled="state.matchStatus === 'finished'">
                  <span class="fs-5 lh-1">🟦</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">Azul</span>
                </button>
                <button class="btn btn-action btn-tto text-white w-100" @click="requestTTO('visitor')" :disabled="!canUseTimeout('visitor') || state.matchStatus === 'finished'">
                  <span class="fs-5 lh-1">🟩</span><span class="d-none d-md-inline fw-bold text-uppercase ms-2 small">TTO</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= BITÁCORA ================= -->
        <div class="bg-white border rounded-4 shadow-sm p-3 p-md-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <h3 class="m-0 fs-5 fw-bold text-dark">Eventos</h3>
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
              <li
                v-for="event in filteredLog"
                :key="event.id"
                class="list-group-item bg-transparent d-flex justify-content-between align-items-center py-2 px-3"
              >
                <div class="small">
                  <span class="text-muted fw-bold font-monospace me-2">[{{ event.match_time }}]</span>
                  <strong class="text-dark">{{ event.team === 'local' ? 'L' : (event.team === 'visitor' ? 'V' : 'SISTEMA') }}</strong>
                  <span class="text-dark" v-if="event.player_number && event.type !== 'goal_removed' && event.type !== 'tiempo_ajustado'"> (#{{ event.player_number }})</span><span class="text-dark">:</span>
                  <span class="text-secondary ms-1">{{ formatEventType(event.type) }}</span>
                  <span v-if="event.type === 'tiempo_ajustado'" class="text-muted small ms-1">- {{ event.player_number }}</span>
                  <span v-if="!event.synced" class="badge bg-warning text-dark ms-2" style="font-size: 0.6rem;">Pendiente</span>
                </div>
                <button
                  v-if="event.team !== 'sistema'"
                  class="btn btn-sm btn-light border text-danger p-1 lh-1"
                  @click="pedirEliminarEvento(event)"
                  title="Eliminar"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </li>
              <li v-if="filteredLog.length === 0" class="list-group-item bg-transparent text-center text-muted py-4 small">
                Sin registros en la bitácora.
              </li>
            </ul>
          </div>
        </div>

      </div><!-- /card-body -->
    </div><!-- /card principal -->

    <!-- ================= MODALES ================= -->

    <!-- Modal Sanción / Jugador -->
    <ModalBase
      :show="modalJugador.visible"
      titulo="Ingresar Sanción"
      icono="sports"
      colorIcono="bg-dark text-white"
      @close="cerrarModalDorsal"
    >
      <div class="text-center">
        <p class="mb-3 text-muted small">Ingrese el número del jugador (o letra A–E para oficiales).</p>
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

    <!-- Modal Ajustar Cronómetro -->
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

    <!-- Modal Fin 2° Tiempo / Prórroga -->
    <ModalBase
      :show="modalProrroga.visible"
      :titulo="modalProrroga.titulo"
      icono="sports_score"
      colorIcono="bg-success text-white"
      @close="modalProrroga.visible = false"
    >
      <div class="text-center p-4">
        <div class="display-3 fw-bold mb-3">{{ state.score.local }} — {{ state.score.visitor }}</div>
        <p class="text-muted fs-6 mb-3">El partido terminó empatado. ¿Cómo desean continuar?</p>
        <div class="alert alert-info small text-start mb-0">
          <i class="bi bi-info-circle-fill me-1"></i>
          <strong>Prórroga:</strong> {{ state.config.otDuration / 60 }} min + 1 min descanso + {{ state.config.otDuration / 60 }} min.
          <span v-if="state.config.otRounds === 2"> Si persiste el empate, hay una 2° ronda con 5 min de descanso previo.</span>
          <span v-else> Si persiste el empate, se define por <strong>lanzamiento de 7 metros</strong>.</span>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-outline-danger fw-bold px-4" @click="finalizarPartido">🏁 Finalizar Partido</button>
        <button class="btn btn-success fw-bold px-4 shadow-sm" @click="iniciarProrroga">⚡ Ir a Prórroga</button>
      </template>
    </ModalBase>

    <!-- Modal Configuración -->
    <ModalBase
      :show="modalConfig.visible"
      titulo="Configuración del Partido"
      icono="settings"
      colorIcono="bg-secondary text-white"
      @close="modalConfig.visible = false"
    >
      <div class="p-3">
        <div class="mb-4">
          <label class="fw-bold small text-muted d-block mb-2">⏱ DURACIÓN DE CADA TIEMPO (minutos)</label>
          <input
            type="number"
            v-model="modalConfig.halfMinutes"
            class="form-control form-control-lg text-center fw-bold"
            min="1"
            max="60"
          />
          <div class="form-text">Actualmente: {{ state.config.halfDuration / 60 }} min — IHF estándar: 30 min</div>
        </div>
        <div class="mb-4">
          <label class="fw-bold small text-muted d-block mb-2">⚡ DURACIÓN DE CADA PRÓRROGA (minutos)</label>
          <input
            type="number"
            v-model="modalConfig.otMinutes"
            class="form-control form-control-lg text-center fw-bold"
            min="1"
            max="15"
          />
          <div class="form-text">Actualmente: {{ state.config.otDuration / 60 }} min — IHF estándar: 5 min</div>
        </div>
        <div class="mb-4">
          <label class="fw-bold small text-muted d-block mb-2">🔄 RONDAS DE PRÓRROGA</label>
          <div class="d-flex flex-column gap-2">
            <div
              class="form-check p-3 rounded-3 border"
              :class="modalConfig.otRounds === 1 ? 'bg-primary-subtle border-primary' : 'bg-light'"
              style="cursor: pointer;"
              @click="modalConfig.otRounds = 1"
            >
              <input class="form-check-input" type="radio" v-model="modalConfig.otRounds" :value="1" id="ot1">
              <label class="form-check-label fw-bold" for="ot1" style="cursor: pointer;">
                1 ronda
                <span class="d-block text-muted fw-normal small">Fe.Me.Bal— 5'+5' (un solo período doble)</span>
              </label>
            </div>
            <div
              class="form-check p-3 rounded-3 border"
              :class="modalConfig.otRounds === 2 ? 'bg-primary-subtle border-primary' : 'bg-light'"
              style="cursor: pointer;"
              @click="modalConfig.otRounds = 2"
            >
              <input class="form-check-input" type="radio" v-model="modalConfig.otRounds" :value="2" id="ot2">
              <label class="form-check-label fw-bold" for="ot2" style="cursor: pointer;">
                2 rondas
                <span class="d-block text-muted fw-normal small">Internacional — 5'+5', luego 5'+5' si sigue empatado</span>
              </label>
            </div>
          </div>
        </div>
        <div class="alert alert-warning small mb-0">
          <i class="bi bi-exclamation-triangle-fill me-1"></i>
          Los cambios se aplican inmediatamente. La configuración se preserva al reiniciar el partido.
        </div>
      </div>
      <template #footer>
        <button class="btn btn-light fw-bold px-4 border" @click="modalConfig.visible = false">CANCELAR</button>
        <button class="btn btn-dark fw-bold px-4 shadow-sm" @click="guardarConfig">GUARDAR</button>
      </template>
    </ModalBase>

    <!-- Modal Editar Tiempo de Exclusión -->
    <ModalBase
      :show="modalPenalidad.visible"
      titulo="Corregir Exclusión"
      icono="timer"
      colorIcono="bg-warning text-dark"
      @close="modalPenalidad.visible = false"
    >
      <div class="text-center p-3">
        <p class="fw-bold text-dark mb-1">{{ modalPenalidad.label }}</p>
        <p class="small text-muted mb-4">Ajuste el tiempo restante de la exclusión. Use 0:00 para eliminarla.</p>
        <div class="d-flex justify-content-center align-items-center gap-3">
          <div class="text-center">
            <label class="small fw-bold text-muted d-block mb-1">MINUTOS</label>
            <input
              type="number"
              v-model="modalPenalidad.mm"
              class="form-control form-control-lg text-center fw-bold shadow-none border-secondary"
              style="font-size: 2rem; width: 90px;"
              min="0"
              max="3"
            >
          </div>
          <div class="display-6 fw-bold mt-3 text-muted">:</div>
          <div class="text-center">
            <label class="small fw-bold text-muted d-block mb-1">SEGUNDOS</label>
            <input
              type="number"
              v-model="modalPenalidad.ss"
              class="form-control form-control-lg text-center fw-bold shadow-none border-secondary"
              style="font-size: 2rem; width: 90px;"
              min="0"
              max="59"
            >
          </div>
        </div>
        <div class="mt-3 text-muted small">
          <i class="bi bi-info-circle me-1"></i>
          Ingresar 00:00 elimina la exclusión del cronómetro.
        </div>
      </div>
      <template #footer>
        <button class="btn btn-light fw-bold px-4 border" @click="modalPenalidad.visible = false">CANCELAR</button>
        <button class="btn btn-warning fw-bold px-4 shadow-sm text-dark" @click="confirmarEditarPenalidad">GUARDAR</button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, inject } from 'vue';
import { api } from '@/api/api';
import ModalBase from '@/components/ModalBase.vue';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Delegados Técnicos | AAAB',
  meta: [{ name: 'description', content: 'Planilla de Delegados Técnicos' }],
});

const notificar = inject('notificar');
const STORAGE_KEY = 'aaab_delegado_match_state';

// ─── ESTADO PRINCIPAL ────────────────────────────────────────────────────────
const state = reactive({
  matchId: 1,
  localClubId: '',
  visitorClubId: '',
  clubes: [],
  score: { local: 0, visitor: 0 },
  timeInSeconds: 0,
  period: 1,
  isCountdown: false,
  // 'active' | 'finished'
  matchStatus: 'active',
  // Duraciones y formato configurables
  config: {
    halfDuration: 30 * 60,  // cada tiempo reglamentario (segundos)
    otDuration:   5  * 60,  // cada tiempo de prórroga (segundos)
    otRounds:     1,         // 1 = nacional (5+5), 2 = internacional (5+5 + 5+5)
  },
  eventLog: [],
  unsyncedEvents: [],
  activePenalties: [],
  activeTTO: null,
  // { team, playerNumber, reason } — jugadores descalificados permanentemente
  disqualifiedPlayers: [],
  timeouts: {
    local:   { h1: 0, h2: 0, total: 0, lostThird: false },
    visitor: { h1: 0, h2: 0, total: 0, lostThird: false },
  },
  // Descansos entre tiempos de prórroga
  // breakType: 'ot_half' (1 min entre 1T y 2T de una prórr.) | 'ot_round' (5 min entre 1° y 2° prórr.)
  breakActive:        false,
  breakTimeRemaining: 0,
  breakType:          null,
});

const isRunning  = ref(false);
const isSyncing  = ref(false);
const logFilter  = ref('all');
let timerInterval = null;
let ttoInterval   = null;
let breakInterval = null;

// ─── MODALES ─────────────────────────────────────────────────────────────────
const modalJugador   = reactive({ visible: false, team: '', type: '', dorsal: '' });
const modalTiempo    = reactive({ visible: false, mm: 0, ss: 0 });
const modalProrroga  = reactive({ visible: false, titulo: '' });
const modalConfig    = reactive({ visible: false, halfMinutes: 30, otMinutes: 5, otRounds: 1 });
const modalPenalidad = reactive({ visible: false, penaltyId: null, mm: 0, ss: 0, label: '' });

const mostrarNotificacion = (titulo, mensaje, tipo = 'success') =>
  notificar({ titulo, mensaje, tipo });

// ─── COMPUTADOS ──────────────────────────────────────────────────────────────

/** Duración del período actual según si es tiempo normal o prórroga */
const currentPeriodDuration = computed(() =>
  state.period <= 2 ? state.config.halfDuration : state.config.otDuration
);

/**
 * Límite de tiempo en 2° período a partir del cual se pierde el 3er TTO
 * (5 minutos antes del final, escalado con la duración configurada)
 */
const TTO_LIMIT_SEC = computed(() => state.config.halfDuration - 5 * 60);

const formattedTime = computed(() => {
  let secs = state.timeInSeconds;
  if (state.isCountdown) {
    secs = currentPeriodDuration.value - state.timeInSeconds;
    if (secs < 0) secs = 0;
  }
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

const currentPeriodText = computed(() => ({
  1: '1° Tiempo',
  2: '2° Tiempo',
  3: '1° Prórr. — 1T',
  4: '1° Prórr. — 2T',
  5: '2° Prórr. — 1T',
  6: '2° Prórr. — 2T',
}[state.period] ?? `Período ${state.period}`));

const localPlayersLess    = computed(() => state.activePenalties.filter(p => p.team === 'local').length);
const visitorPlayersLess  = computed(() => state.activePenalties.filter(p => p.team === 'visitor').length);
const disqualifiedLocal   = computed(() => state.disqualifiedPlayers.filter(p => p.team === 'local'));
const disqualifiedVisitor = computed(() => state.disqualifiedPlayers.filter(p => p.team === 'visitor'));

const filteredLog = computed(() => {
  const reversed = [...state.eventLog].reverse();
  if (logFilter.value === 'goals')
    return reversed.filter(e => e.type === 'goal' || e.type === 'goal_removed');
  if (logFilter.value === 'sanctions')
    return reversed.filter(e => ['yellow_card', '2_min', 'red_card', 'blue_card'].includes(e.type));
  return reversed;
});

// ─── PERSISTENCIA ────────────────────────────────────────────────────────────
const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    delete parsed.clubes;
    // Defaults para campos nuevos en saves previos
    parsed.config              ??= { halfDuration: 30 * 60, otDuration: 5 * 60, otRounds: 1 };
    parsed.config.otRounds     ??= 1;
    parsed.disqualifiedPlayers ??= [];
    parsed.matchStatus         ??= 'active';
    parsed.breakActive         ??= false;
    parsed.breakTimeRemaining  ??= 0;
    parsed.breakType           ??= null;
    Object.assign(state, parsed);
  }
  if (state.activeTTO?.timeRemaining > 0) resumeTTOTimer();
  if (state.breakActive && state.breakTimeRemaining > 0) resumeBreakTimer();
};

watch(state, (newState) => {
  const toSave = { ...newState };
  delete toSave.clubes;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}, { deep: true });

watch(() => state.unsyncedEvents.length, (n) => {
  if (n > 0 && !isSyncing.value) syncWithBackend();
});

// ─── RESET ───────────────────────────────────────────────────────────────────
const resetMatch = () => {
  notificar({
    titulo: 'Reiniciar',
    mensaje: '¿Estás seguro que deseas reiniciar el partido? Se perderán los datos locales no sincronizados.',
    tipo: 'danger',
    alConfirmar: () => {
      if (isRunning.value) toggleTimer();
      if (ttoInterval)   clearInterval(ttoInterval);
      if (breakInterval) clearInterval(breakInterval);
      // Preservamos la configuración al reiniciar
      const savedConfig = { ...state.config };
      Object.assign(state, {
        score:          { local: 0, visitor: 0 },
        timeInSeconds:  0,
        period:         1,
        isCountdown:    false,
        matchStatus:    'active',
        eventLog:       [],
        unsyncedEvents: [],
        activePenalties:[],
        activeTTO:      null,
        disqualifiedPlayers: [],
        timeouts: {
          local:   { h1: 0, h2: 0, total: 0, lostThird: false },
          visitor: { h1: 0, h2: 0, total: 0, lostThird: false },
        },
        config: savedConfig,
        breakActive:        false,
        breakTimeRemaining: 0,
        breakType:          null,
      });
      localStorage.removeItem(STORAGE_KEY);
    },
  });
};

// --- CARGAR CLUBES ---
const cargarClubes = async () => {
  try {
    const result = await api.get({
      entity: 'clubes',
      action: 'obtenerClubes'
    });

    if (result && Array.isArray(result.payload)) {
      state.clubes = result.payload.map(club => ({
        club_id: club.club_id,
        club_nombre: club.club_nombre
      }));
    } else {
      console.warn("La API no devolvió el formato esperado:", result);
    }
  } catch (error) {
    console.error("Error al cargar la lista de clubes:", error);
  }
};

// ─── SINCRONIZACIÓN ──────────────────────────────────────────────────────────
const syncWithBackend = async () => {
  if (state.unsyncedEvents.length === 0 || isSyncing.value) return;
  isSyncing.value = true;
  try {
    const eventsToSend = [...state.unsyncedEvents];
    const result = await api.post({
      entity: 'delegados',
      action: 'sincronizarEventos',
      payload: { match_id: state.matchId, events: eventsToSend },
    });
    if (result === true || result?.payload === true || result?.status === 'success') {
      eventsToSend.forEach(u => {
        const log = state.eventLog.find(e => e.id === u.id);
        if (log) log.synced = true;
      });
      state.unsyncedEvents = state.unsyncedEvents.filter(
        e => !eventsToSend.some(s => s.id === e.id)
      );
    }
  } catch (err) {
    console.error('Error sincronizando:', err);
  } finally {
    isSyncing.value = false;
  }
};

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
const abrirConfig = () => {
  modalConfig.halfMinutes = state.config.halfDuration / 60;
  modalConfig.otMinutes   = state.config.otDuration   / 60;
  modalConfig.otRounds    = state.config.otRounds;
  modalConfig.visible = true;
};

const guardarConfig = () => {
  const half = parseInt(modalConfig.halfMinutes);
  const ot   = parseInt(modalConfig.otMinutes);
  if (isNaN(half) || half < 1 || half > 60) {
    mostrarNotificacion('Error', 'La duración del tiempo debe ser entre 1 y 60 minutos.', 'danger');
    return;
  }
  if (isNaN(ot) || ot < 1 || ot > 15) {
    mostrarNotificacion('Error', 'La duración de la prórroga debe ser entre 1 y 15 minutos.', 'danger');
    return;
  }
  state.config.halfDuration = half * 60;
  state.config.otDuration   = ot   * 60;
  state.config.otRounds     = modalConfig.otRounds;
  modalConfig.visible = false;
  const roundsLabel = modalConfig.otRounds === 1 ? 'Fe.Me.Bal (1 ronda)' : 'Internacional (2 rondas)';
  mostrarNotificacion('Guardado', `Tiempo: ${half} min | Prórroga: ${ot} min | ${roundsLabel}`, 'success');
};

// ─── AJUSTE MANUAL DE TIEMPO ──────────────────────────────────────────────────
const abrirModalTiempo = () => {
  if (isRunning.value) {
    mostrarNotificacion('Reloj en marcha', 'Pause el cronómetro para ajustar el tiempo manualmente.', 'danger');
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

  const newTime = m * 60 + s;
  const delta   = newTime - state.timeInSeconds; // + = avanza, - = retrocede

  // Recalcular exclusiones activas según el delta de tiempo
  if (delta !== 0 && state.activePenalties.length > 0) {
    state.activePenalties.forEach(p => {
      p.timeRemaining = Math.max(0, p.timeRemaining - delta);
    });
    state.activePenalties = state.activePenalties.filter(p => p.timeRemaining > 0);

    const abs     = Math.abs(delta);
    const mm      = Math.floor(abs / 60);
    const ss      = abs % 60;
    const deltaStr = mm > 0 ? `${mm}m ${ss}s` : `${ss}s`;
    const dir      = delta > 0 ? 'adelante' : 'atrás';
    mostrarNotificacion(
      'Exclusiones Recalculadas',
      `El reloj se movió ${deltaStr} ${dir}. Los tiempos de exclusión fueron ajustados automáticamente.`,
      'info'
    );
  }

  state.timeInSeconds = newTime;
  guardarEventoEnLog('sistema', 'tiempo_ajustado', null, `Ajuste manual a ${m}:${s.toString().padStart(2, '0')}`);
  modalTiempo.visible = false;
};

// ─── CRONÓMETRO ──────────────────────────────────────────────────────────────
const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval);
  } else {
    timerInterval = setInterval(() => {
      if (state.timeInSeconds < currentPeriodDuration.value) {
        state.timeInSeconds++;
        state.activePenalties.forEach(p => { if (p.timeRemaining > 0) p.timeRemaining--; });
        state.activePenalties = state.activePenalties.filter(p => p.timeRemaining > 0);
      } else {
        clearInterval(timerInterval);
        isRunning.value = false;
      }
    }, 1000);
  }
  isRunning.value = !isRunning.value;
};

const toggleDirection = () => { state.isCountdown = !state.isCountdown; };

/**
 * Avanza al siguiente período:
 * - Fin del 2° tiempo → modal si empate, confirmación si no empate
 * - Dentro de un round de prórroga (impar→par): arranca descanso de 1 minuto
 * - Fin del último tiempo de una prórroga (par): decide si hay otra ronda o tiro de 7m
 */
const nextPeriod = () => {
  if (isRunning.value || state.breakActive) return;

  // ── Fin del tiempo reglamentario ────────────────────────────────────────────
  if (state.period === 2) {
    if (state.score.local === state.score.visitor) {
      modalProrroga.titulo  = 'Fin del 2° Tiempo';
      modalProrroga.visible = true;
    } else {
      confirmarFinPartido();
    }
    return;
  }

  // ── Transición intra-ronda: 1T→2T de prórroga (períodos impares ≥3) ─────────
  // Ej: período 3 (1T de 1° Prórr.) → período 4 (2T de 1° Prórr.) = descanso 1 min
  if (state.period >= 3 && state.period % 2 !== 0) {
    state.period++;
    state.timeInSeconds = 0;
    startBreak('ot_half', 60);
    guardarEventoEnLog('sistema', 'descanso_ot', null, 'Descanso 1 min entre tiempos');
    return;
  }

  // ── Fin de un 2° tiempo de prórroga (períodos pares ≥4) ─────────────────────
  if (state.period >= 4 && state.period % 2 === 0) {
    const otRoundJustFinished = (state.period - 2) / 2; // 1 tras período 4, 2 tras período 6
    const hayMasRondas        = otRoundJustFinished < state.config.otRounds;

    if (state.score.local === state.score.visitor) {
      if (hayMasRondas) {
        const ordinal = otRoundJustFinished === 1 ? '1°' : '2°';
        modalProrroga.titulo  = `Fin de la ${ordinal} Prórroga`;
        modalProrroga.visible = true;
      } else {
        mostrarNotificacion(
          'Lanzamiento de 7 Metros',
          'El partido continúa empatado. Se define por lanzamiento de 7 metros.',
          'warning'
        );
      }
    } else {
      confirmarFinPartido();
    }
    return;
  }

  // ── Avance normal: 1→2 ──────────────────────────────────────────────────────
  state.period++;
  state.timeInSeconds = 0;
};

const prevPeriod = () => {
  if (isRunning.value || state.period === 1) return;
  // Si hay un descanso activo, cancelarlo al retroceder
  if (state.breakActive) endBreak();
  state.period--;
  state.timeInSeconds = 0;
  if (state.matchStatus === 'finished') state.matchStatus = 'active';
};

/** Pide confirmación antes de finalizar el partido */
const confirmarFinPartido = () => {
  notificar({
    titulo: 'Finalizar Partido',
    mensaje: `El resultado es ${state.score.local} — ${state.score.visitor}. ¿Desea finalizar el partido?`,
    tipo: 'success',
    alConfirmar: finalizarPartido,
  });
};

const finalizarPartido = () => {
  modalProrroga.visible = false;
  state.matchStatus = 'finished';
  guardarEventoEnLog('sistema', 'partido_finalizado', null);
  mostrarNotificacion(
    'Partido Finalizado',
    `Resultado final: ${state.score.local} — ${state.score.visitor}`,
    'success'
  );
};

/**
 * Inicia la prórroga que corresponde según el período actual.
 * Desde período 2 → 1° Prórroga (período 3) — sin descanso previo
 * Desde período 4 → 2° Prórroga (período 5) — descanso previo de 5 minutos
 */
const iniciarProrroga = () => {
  modalProrroga.visible = false;
  const nextPer         = state.period + 1;            // 2→3, 4→5
  const otRound         = Math.ceil((nextPer - 2) / 2); // 1 para período 3, 2 para período 5
  const ordinal         = otRound === 1 ? '1°' : '2°';

  state.period        = nextPer;
  state.timeInSeconds = 0;

  const tipo = otRound === 1 ? 'inicio_prorroga' : 'inicio_segunda_prorroga';
  guardarEventoEnLog('sistema', tipo, null);

  if (otRound === 2) {
    // Descanso de 5 minutos entre la 1° y la 2° prórroga (solo Internacional)
    startBreak('ot_round', 5 * 60);
    mostrarNotificacion('Descanso', '5 minutos de descanso antes de la 2° Prórroga.', 'info');
  } else {
    mostrarNotificacion(
      'Prórroga',
      `${ordinal} Prórroga — ${state.config.otDuration / 60} min por tiempo, con 1 min de descanso entre tiempos.`,
      'info'
    );
  }
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getLocalTimestamp = () => {
  const d = new Date();
  const p = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const validarDorsal = (dorsal) => {
  const clean = dorsal.toString().trim().toUpperCase();
  if (['A','B','C','D','E'].includes(clean)) return { valido: true, valor: clean, tipo: 'oficial' };
  const n = parseInt(clean);
  if (!isNaN(n) && n > 0) return { valido: true, valor: n.toString(), tipo: 'jugador' };
  return { valido: false };
};

const obtenerSancionesJugador = (team, playerNumber) => {
  const stats = { yellow: 0, two_min: 0, red: 0, blue: 0 };
  state.eventLog
    .filter(e => e.team === team && e.player_number == playerNumber)
    .forEach(e => {
      if (e.type === 'yellow_card') stats.yellow++;
      if (e.type === '2_min')       stats.two_min++;
      if (e.type === 'red_card')    stats.red++;
      if (e.type === 'blue_card')   stats.blue++;
    });
  return stats;
};

// ─── GOLES ───────────────────────────────────────────────────────────────────
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

// ─── SANCIONES ───────────────────────────────────────────────────────────────
const pedirDorsal = (team, type) => {
  // Las exclusiones pausan el reloj automáticamente
  if (['2_min', 'red_card', 'blue_card'].includes(type) && isRunning.value) {
    clearInterval(timerInterval);
    isRunning.value = false;
  }
  Object.assign(modalJugador, { visible: true, team, type, dorsal: '' });
};

const cerrarModalDorsal = () => { modalJugador.visible = false; };

const confirmarSancion = () => {
  const { team, type, dorsal } = modalJugador;

  if (!dorsal?.trim()) {
    mostrarNotificacion('Error', 'Ingrese un número de dorsal o letra (A–E) para oficiales.', 'danger');
    return;
  }

  const validacion = validarDorsal(dorsal);
  if (!validacion.valido) {
    mostrarNotificacion('Error', 'Dorsal inválido. Use número positivo o letra A–E.', 'danger');
    return;
  }

  const dorsalFinal = validacion.valor;

  if (validacion.tipo === 'jugador') {
    // ── Bloquear si ya está descalificado ────────────────────────────────────
    const estaDescalificado = state.disqualifiedPlayers.some(
      p => p.team === team && p.playerNumber === dorsalFinal
    );
    if (estaDescalificado) {
      mostrarNotificacion(
        'Jugador Inhabilitado',
        `El jugador #${dorsalFinal} está descalificado y no puede recibir más sanciones.`,
        'danger'
      );
      cerrarModalDorsal();
      return;
    }

    const stats = obtenerSancionesJugador(team, dorsalFinal);

    // ── Reglas IHF para amarilla ─────────────────────────────────────────────
    if (type === 'yellow_card') {
      if (stats.yellow >= 1) {
        mostrarNotificacion('Reglamento IHF', `#${dorsalFinal}: máximo una tarjeta amarilla por partido.`, 'danger');
        return;
      }
      if (stats.two_min > 0) {
        mostrarNotificacion('Reglamento IHF', `#${dorsalFinal} ya tiene exclusión; no puede recibir amarilla.`, 'danger');
        return;
      }
    }

    // ── 3ra exclusión → descalificación automática ───────────────────────────
    // FIX: se aplica solo UNA penalidad de 2 min al reloj.
    // La roja se registra únicamente en la bitácora, sin sumar tiempo extra.
    if (type === '2_min' && stats.two_min >= 2) {
      mostrarNotificacion(
        'Roja Automática',
        `#${dorsalFinal}: 3ra exclusión → descalificación automática aplicada.`,
        'danger'
      );
      aplicarPenalidadReloj(team, '2_min', dorsalFinal);
      guardarEventoEnLog(team, '2_min', dorsalFinal);
      guardarEventoEnLog(team, 'red_card', dorsalFinal); // solo bitácora
      state.disqualifiedPlayers.push({ team, playerNumber: dorsalFinal, reason: 'red_card' });
      cerrarModalDorsal();
      return;
    }

    // ── Sanción normal ───────────────────────────────────────────────────────
    aplicarPenalidadReloj(team, type, dorsalFinal);
    guardarEventoEnLog(team, type, dorsalFinal);

    if (type === 'red_card' || type === 'blue_card') {
      state.disqualifiedPlayers.push({ team, playerNumber: dorsalFinal, reason: type });
    }

  } else {
    // ── Oficial (A–E) ────────────────────────────────────────────────────────
    aplicarPenalidadReloj(team, type, dorsalFinal);
    guardarEventoEnLog(team, type, dorsalFinal);
    if (type === 'red_card' || type === 'blue_card') {
      state.disqualifiedPlayers.push({ team, playerNumber: dorsalFinal, reason: type });
    }
  }

  cerrarModalDorsal();
};

const aplicarPenalidadReloj = (team, type, playerNumber) => {
  if (!['2_min', 'red_card', 'blue_card'].includes(type)) return;

  const existing = [...state.activePenalties]
    .reverse()
    .find(p => p.team === team && p.playerNumber === playerNumber);

  if (existing && existing.timeGiven === state.timeInSeconds) {
    if (existing.timeRemaining < 240) {
      existing.timeRemaining = Math.min(existing.timeRemaining + 120, 240);
    }
    if (type === 'red_card' || type === 'blue_card') existing.type = type;
  } else {
    state.activePenalties.push({
      id: crypto.randomUUID(),
      team, type, playerNumber,
      timeRemaining: 120,
      timeGiven: state.timeInSeconds,
    });
  }
};

const guardarEventoEnLog = (team, type, playerNumber, customTimeStr = null) => {
  const matchTimeStr = customTimeStr ?? `${currentPeriodText.value} - ${formattedTime.value}`;
  const newEvent = {
    id: crypto.randomUUID(),
    team,
    player_number: playerNumber,
    type,
    match_time: matchTimeStr,
    timestamp: getLocalTimestamp(),
    synced: false,
  };
  state.eventLog.push(newEvent);
  state.unsyncedEvents.push(newEvent);
};

const pedirEliminarEvento = (eventToDel) => {
  notificar({
    titulo: 'Eliminar Evento',
    mensaje: `¿Eliminar "${formatEventType(eventToDel.type)}" de la bitácora?`,
    tipo: 'danger',
    alConfirmar: async () => {
      // Revertir efectos secundarios del evento
      if (eventToDel.type === 'goal') {
        if (state.score[eventToDel.team] > 0) state.score[eventToDel.team]--;
      } else if (eventToDel.type === 'goal_removed') {
        state.score[eventToDel.team]++;
      } else if (['2_min', 'red_card', 'blue_card'].includes(eventToDel.type)) {
        const idx = state.activePenalties.findIndex(
          p => p.team === eventToDel.team && p.playerNumber === eventToDel.player_number
        );
        if (idx !== -1) state.activePenalties.splice(idx, 1);
      } else if (eventToDel.type === 'timeout') {
        const t = state.timeouts[eventToDel.team];
        if (state.period === 1) t.h1 = Math.max(0, t.h1 - 1);
        if (state.period === 2) t.h2 = Math.max(0, t.h2 - 1);
        t.total = Math.max(0, t.total - 1);
      }

      // Remover de descalificados si era una roja/azul
      if (['red_card', 'blue_card'].includes(eventToDel.type)) {
        const dqIdx = state.disqualifiedPlayers.findIndex(
          p => p.team === eventToDel.team && p.playerNumber === eventToDel.player_number
        );
        if (dqIdx !== -1) state.disqualifiedPlayers.splice(dqIdx, 1);
      }

      state.eventLog       = state.eventLog.filter(e => e.id !== eventToDel.id);
      state.unsyncedEvents = state.unsyncedEvents.filter(e => e.id !== eventToDel.id);

      if (eventToDel.synced) {
        try {
          await api.post({
            entity: 'delegados',
            action: 'eliminarEvento',
            payload: { event_local_id: eventToDel.id },
          });
        } catch (e) { console.error('Error al eliminar en backend:', e); }
      }
    },
  });
};

// ─── EDICIÓN MANUAL DE EXCLUSIONES ───────────────────────────────────────────

/** Abre el modal para corregir el tiempo restante de una exclusión específica */
const editarPenalidad = (penalty) => {
  modalPenalidad.penaltyId = penalty.id;
  modalPenalidad.mm        = Math.floor(penalty.timeRemaining / 60);
  modalPenalidad.ss        = penalty.timeRemaining % 60;
  modalPenalidad.label     = `${penalty.team === 'local' ? 'Local' : 'Visita'} — #${penalty.playerNumber}`;
  modalPenalidad.visible   = true;
};

const confirmarEditarPenalidad = () => {
  const m = parseInt(modalPenalidad.mm);
  const s = parseInt(modalPenalidad.ss);
  if (isNaN(m) || isNaN(s) || s < 0 || s > 59 || m < 0) {
    mostrarNotificacion('Error', 'Tiempo inválido.', 'danger');
    return;
  }
  const nuevoTiempo = m * 60 + s;
  const penalty     = state.activePenalties.find(p => p.id === modalPenalidad.penaltyId);
  if (penalty) {
    if (nuevoTiempo === 0) {
      state.activePenalties = state.activePenalties.filter(p => p.id !== modalPenalidad.penaltyId);
      mostrarNotificacion('Exclusión', 'Exclusión eliminada.', 'info');
    } else {
      penalty.timeRemaining = nuevoTiempo;
    }
  }
  modalPenalidad.visible = false;
};

const startBreak = (type, seconds) => {
  state.breakActive        = true;
  state.breakTimeRemaining = seconds;
  state.breakType          = type;
  resumeBreakTimer();
};

const resumeBreakTimer = () => {
  if (breakInterval) clearInterval(breakInterval);
  breakInterval = setInterval(() => {
    state.breakTimeRemaining--;
    if (state.breakTimeRemaining <= 0) endBreak();
  }, 1000);
};

const endBreak = () => {
  if (breakInterval) clearInterval(breakInterval);
  state.breakActive        = false;
  state.breakTimeRemaining = 0;
  state.breakType          = null;
};

const skipBreak = () => {
  guardarEventoEnLog('sistema', 'descanso_salteado', null, 'Descanso cortado manualmente');
  endBreak();
};

// ─── TTO ─────────────────────────────────────────────────────────────────────
const canUseTimeout = (team) => {
  const t = state.timeouts[team];
  if (state.activeTTO !== null) return false;
  if (state.period === 1) return t.h1 < 2;
  if (state.period === 2) {
    if (t.h2 >= 2)              return false;
    if (t.total >= 3)           return false;
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
    if (t.total === 1 && state.timeInSeconds >= TTO_LIMIT_SEC.value) t.lostThird = true;
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

// ─── FORMATO ─────────────────────────────────────────────────────────────────
const formatPenaltyTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const formatEventType = (type) => ({
  goal:                    '⚽ Gol',
  goal_removed:            '❌ Gol Anulado',
  yellow_card:             '🟨 Amarilla',
  '2_min':                 '✌️ 2 Min',
  red_card:                '🟥 Roja',
  blue_card:               '🟦 Azul',
  timeout:                 '🟩 TTO',
  tiempo_ajustado:         '⚙️ Tiempo Ajustado',
  partido_finalizado:      '🏁 Partido Finalizado',
  inicio_prorroga:         '⚡ Inicio 1° Prórroga',
  inicio_segunda_prorroga: '⚡ Inicio 2° Prórroga',
  descanso_ot:             '⏸ Descanso OT (1 min)',
  descanso_salteado:       '⏩ Descanso Salteado',
}[type] ?? type);

const downloadLog = () => {
  if (!filteredLog.value.length) {
    mostrarNotificacion('Atención', 'No hay datos en la bitácora para descargar.', 'danger');
    return;
  }
  let content = `BITÁCORA\nLocal: ${state.score.local} | Visita: ${state.score.visitor}\n\n`;
  filteredLog.value.forEach(e => {
    content += `[${e.match_time}] ${e.team === 'local' ? 'L' : (e.team === 'visitor' ? 'V' : 'SISTEMA')}`;
    if (e.player_number && e.type !== 'tiempo_ajustado') content += ` (#${e.player_number})`;
    content += ` -> ${formatEventType(e.type)}`;
    if (e.type === 'tiempo_ajustado') content += ` (${e.player_number})`;
    content += '\n';
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  link.download = 'bitacora_partido.txt';
  link.click();
};

onMounted(() => { loadState(); cargarClubes(); });
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (ttoInterval)   clearInterval(ttoInterval);
  if (breakInterval) clearInterval(breakInterval);
});
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
.shirt-svg { width: 100%; height: auto; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.1)); }
.dorsal-input { position: absolute; width: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-size: 1.5rem; font-weight: 900; background: transparent; border: none; border-bottom: 2px dashed rgba(255,255,255,0.5); color: white; outline: none; text-transform: uppercase; }
.dorsal-input::placeholder { color: rgba(255,255,255,0.4); }

.animate__animated { animation-duration: 0.5s; }


</style>
