// Planilla digital del delegado técnico (panel árbitro · Delegado técnico).
// Cronómetro, períodos y prórrogas (Fe.Me.Bal / internacional), descansos, goles,
// sanciones con reglas IHF, exclusiones, TTO, bitácora y sincronización con el backend.
// El partido se guarda en localStorage para no perderlo si se recarga la página.
// Lo usa DelegadosTecnicos.vue.
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { api } from '@/api/api'
import { useCambiosSinGuardar } from '@/composables/useCambiosSinGuardar'
import { formatEventType } from '@/components/panel-arbitro/delegado-tecnico/ayudasPlanilla'

export function usePlanillaDelegado({ toast, notificar }) {
  const STORAGE_KEY = 'aaab_delegado_match_state'

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
  })

  const isRunning  = ref(false)
  const isSyncing  = ref(false)
  const logFilter  = ref('all')
  let timerInterval = null
  let ttoInterval   = null
  let breakInterval = null

  // ─── MODALES ─────────────────────────────────────────────────────────────────
  const modalJugador   = reactive({ visible: false, team: '', type: '', dorsal: '' })
  const modalTiempo    = reactive({ visible: false, mm: 0, ss: 0 })
  const modalProrroga  = reactive({ visible: false, titulo: '' })
  const modalConfig    = reactive({ visible: false, halfMinutes: 30, otMinutes: 5, otRounds: 1 })
  const { hayCambios: hayCambiosConfig } = useCambiosSinGuardar(
    () => [modalConfig.halfMinutes, modalConfig.otMinutes, modalConfig.otRounds],
    () => modalConfig.visible
  )
  const modalPenalidad = reactive({ visible: false, penaltyId: null, mm: 0, ss: 0, label: '' })

  const mostrarNotificacion = (titulo, mensaje, tipo = 'success') =>
    toast({ titulo, mensaje, tipo })

  // ─── COMPUTADOS ──────────────────────────────────────────────────────────────

  /** Duración del período actual según si es tiempo normal o prórroga */
  const currentPeriodDuration = computed(() =>
    state.period <= 2 ? state.config.halfDuration : state.config.otDuration
  )

  /**
   * Límite de tiempo en 2° período a partir del cual se pierde el 3er TTO
   * (5 minutos antes del final, escalado con la duración configurada)
   */
  const TTO_LIMIT_SEC = computed(() => state.config.halfDuration - 5 * 60)

  const formattedTime = computed(() => {
    let secs = state.timeInSeconds
    if (state.isCountdown) {
      secs = currentPeriodDuration.value - state.timeInSeconds
      if (secs < 0) secs = 0
    }
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  })

  const currentPeriodText = computed(() => ({
    1: '1° Tiempo',
    2: '2° Tiempo',
    3: '1° Prórr. — 1T',
    4: '1° Prórr. — 2T',
    5: '2° Prórr. — 1T',
    6: '2° Prórr. — 2T',
  }[state.period] ?? `Período ${state.period}`))

  const localPlayersLess    = computed(() => state.activePenalties.filter(p => p.team === 'local').length)
  const visitorPlayersLess  = computed(() => state.activePenalties.filter(p => p.team === 'visitor').length)
  const disqualifiedLocal   = computed(() => state.disqualifiedPlayers.filter(p => p.team === 'local'))
  const disqualifiedVisitor = computed(() => state.disqualifiedPlayers.filter(p => p.team === 'visitor'))

  const filteredLog = computed(() => {
    const reversed = [...state.eventLog].reverse()
    if (logFilter.value === 'goals')
      return reversed.filter(e => e.type === 'goal' || e.type === 'goal_removed')
    if (logFilter.value === 'sanctions')
      return reversed.filter(e => ['yellow_card', '2_min', 'red_card', 'blue_card'].includes(e.type))
    return reversed
  })

  // ─── PERSISTENCIA ────────────────────────────────────────────────────────────
  // Lee el partido guardado. Si el dato está corrupto o no hay almacenamiento (modo privado),
  // se descarta y la planilla arranca vacía en lugar de quedar rota.
  const leerGuardado = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      return parsed && typeof parsed === 'object' ? parsed : null
    } catch {
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* sin almacenamiento */ }
      return null
    }
  }

  const loadState = () => {
    const parsed = leerGuardado()
    if (parsed) {
      delete parsed.clubes
      // Defaults para campos nuevos en saves previos
      parsed.config              ??= { halfDuration: 30 * 60, otDuration: 5 * 60, otRounds: 1 }
      parsed.config.otRounds     ??= 1
      parsed.disqualifiedPlayers ??= []
      parsed.matchStatus         ??= 'active'
      parsed.breakActive         ??= false
      parsed.breakTimeRemaining  ??= 0
      parsed.breakType           ??= null
      Object.assign(state, parsed)
    }
    if (state.activeTTO?.timeRemaining > 0) resumeTTOTimer()
    if (state.breakActive && state.breakTimeRemaining > 0) resumeBreakTimer()
  }

  watch(state, (newState) => {
    const toSave = { ...newState }
    delete toSave.clubes
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch { /* sin almacenamiento: la planilla sigue funcionando, solo no se recupera al recargar */ }
  }, { deep: true })

  watch(() => state.unsyncedEvents.length, (n) => {
    if (n > 0 && !isSyncing.value) syncWithBackend()
  })

  // ─── RESET ───────────────────────────────────────────────────────────────────
  const resetMatch = () => {
    notificar({
      titulo: 'Reiniciar',
      mensaje: '¿Estás seguro que deseas reiniciar el partido? Se perderán los datos locales no sincronizados.',
      tipo: 'danger',
      alConfirmar: () => {
        if (isRunning.value) toggleTimer()
        if (ttoInterval)   clearInterval(ttoInterval)
        if (breakInterval) clearInterval(breakInterval)
        // Preservamos la configuración al reiniciar
        const savedConfig = { ...state.config }
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
        })
        try { localStorage.removeItem(STORAGE_KEY) } catch { /* sin almacenamiento */ }
      },
    })
  }

  // --- CARGAR CLUBES ---
  const cargarClubes = async () => {
    try {
      const result = await api.get({
        entity: 'clubes',
        action: 'obtenerClubes'
      })

      if (result && Array.isArray(result.payload)) {
        state.clubes = result.payload.map(club => ({
          club_id: club.club_id,
          club_nombre: club.club_nombre
        }))
      } else {
        console.warn("La API no devolvió el formato esperado:", result)
      }
    } catch (error) {
      console.error("Error al cargar la lista de clubes:", error)
    }
  }

  // ─── SINCRONIZACIÓN ──────────────────────────────────────────────────────────
  const syncWithBackend = async () => {
    if (state.unsyncedEvents.length === 0 || isSyncing.value) return
    isSyncing.value = true
    try {
      const eventsToSend = [...state.unsyncedEvents]
      const result = await api.post({
        entity: 'delegados',
        action: 'sincronizarEventos',
        payload: { match_id: state.matchId, events: eventsToSend },
      })
      if (result === true || result?.payload === true || result?.status === 'success') {
        eventsToSend.forEach(u => {
          const log = state.eventLog.find(e => e.id === u.id)
          if (log) log.synced = true
        })
        state.unsyncedEvents = state.unsyncedEvents.filter(
          e => !eventsToSend.some(s => s.id === e.id)
        )
      }
    } catch (err) {
      console.error('Error sincronizando:', err)
    } finally {
      isSyncing.value = false
    }
  }

  // ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
  const abrirConfig = () => {
    modalConfig.halfMinutes = state.config.halfDuration / 60
    modalConfig.otMinutes   = state.config.otDuration   / 60
    modalConfig.otRounds    = state.config.otRounds
    modalConfig.visible = true
  }

  const guardarConfig = () => {
    const half = parseInt(modalConfig.halfMinutes, 10)
    const ot   = parseInt(modalConfig.otMinutes, 10)
    if (isNaN(half) || half < 1 || half > 60) {
      mostrarNotificacion('Error', 'La duración del tiempo debe ser entre 1 y 60 minutos.', 'danger')
      return
    }
    if (isNaN(ot) || ot < 1 || ot > 15) {
      mostrarNotificacion('Error', 'La duración de la prórroga debe ser entre 1 y 15 minutos.', 'danger')
      return
    }
    state.config.halfDuration = half * 60
    state.config.otDuration   = ot   * 60
    state.config.otRounds     = modalConfig.otRounds
    modalConfig.visible = false
    const roundsLabel = modalConfig.otRounds === 1 ? 'Fe.Me.Bal (1 ronda)' : 'Internacional (2 rondas)'
    mostrarNotificacion('Guardado', `Tiempo: ${half} min | Prórroga: ${ot} min | ${roundsLabel}`, 'success')
  }

  // ─── AJUSTE MANUAL DE TIEMPO ──────────────────────────────────────────────────
  const abrirModalTiempo = () => {
    if (isRunning.value) {
      mostrarNotificacion('Reloj en marcha', 'Pause el cronómetro para ajustar el tiempo manualmente.', 'danger')
      return
    }
    modalTiempo.mm = Math.floor(state.timeInSeconds / 60)
    modalTiempo.ss = state.timeInSeconds % 60
    modalTiempo.visible = true
  }

  const confirmarAjusteTiempo = () => {
    const m = parseInt(modalTiempo.mm, 10)
    const s = parseInt(modalTiempo.ss, 10)
    if (isNaN(m) || isNaN(s) || s < 0 || s > 59 || m < 0) {
      mostrarNotificacion('Error', 'Ingrese un formato de tiempo válido.', 'danger')
      return
    }

    const newTime = m * 60 + s
    const delta   = newTime - state.timeInSeconds // + = avanza, - = retrocede

    // Recalcular exclusiones activas según el delta de tiempo
    if (delta !== 0 && state.activePenalties.length > 0) {
      state.activePenalties.forEach(p => {
        p.timeRemaining = Math.max(0, p.timeRemaining - delta)
      })
      state.activePenalties = state.activePenalties.filter(p => p.timeRemaining > 0)

      const abs     = Math.abs(delta)
      const mm      = Math.floor(abs / 60)
      const ss      = abs % 60
      const deltaStr = mm > 0 ? `${mm}m ${ss}s` : `${ss}s`
      const dir      = delta > 0 ? 'adelante' : 'atrás'
      mostrarNotificacion(
        'Exclusiones Recalculadas',
        `El reloj se movió ${deltaStr} ${dir}. Los tiempos de exclusión fueron ajustados automáticamente.`,
        'info'
      )
    }

    state.timeInSeconds = newTime
    guardarEventoEnLog('sistema', 'tiempo_ajustado', null, `Ajuste manual a ${m}:${s.toString().padStart(2, '0')}`)
    modalTiempo.visible = false
  }

  // ─── CRONÓMETRO ──────────────────────────────────────────────────────────────
  const toggleTimer = () => {
    if (isRunning.value) {
      clearInterval(timerInterval)
    } else {
      timerInterval = setInterval(() => {
        if (state.timeInSeconds < currentPeriodDuration.value) {
          state.timeInSeconds++
          state.activePenalties.forEach(p => { if (p.timeRemaining > 0) p.timeRemaining-- })
          state.activePenalties = state.activePenalties.filter(p => p.timeRemaining > 0)
        } else {
          clearInterval(timerInterval)
          isRunning.value = false
        }
      }, 1000)
    }
    isRunning.value = !isRunning.value
  }

  const toggleDirection = () => { state.isCountdown = !state.isCountdown }

  /**
   * Avanza al siguiente período:
   * - Fin del 2° tiempo → modal si empate, confirmación si no empate
   * - Dentro de un round de prórroga (impar→par): arranca descanso de 1 minuto
   * - Fin del último tiempo de una prórroga (par): decide si hay otra ronda o tiro de 7m
   */
  const nextPeriod = () => {
    if (isRunning.value || state.breakActive) return

    // ── Fin del tiempo reglamentario ────────────────────────────────────────────
    if (state.period === 2) {
      if (state.score.local === state.score.visitor) {
        modalProrroga.titulo  = 'Fin del 2° Tiempo'
        modalProrroga.visible = true
      } else {
        confirmarFinPartido()
      }
      return
    }

    // ── Transición intra-ronda: 1T→2T de prórroga (períodos impares ≥3) ─────────
    // Ej: período 3 (1T de 1° Prórr.) → período 4 (2T de 1° Prórr.) = descanso 1 min
    if (state.period >= 3 && state.period % 2 !== 0) {
      state.period++
      state.timeInSeconds = 0
      startBreak('ot_half', 60)
      guardarEventoEnLog('sistema', 'descanso_ot', null, 'Descanso 1 min entre tiempos')
      return
    }

    // ── Fin de un 2° tiempo de prórroga (períodos pares ≥4) ─────────────────────
    if (state.period >= 4 && state.period % 2 === 0) {
      const otRoundJustFinished = (state.period - 2) / 2 // 1 tras período 4, 2 tras período 6
      const hayMasRondas        = otRoundJustFinished < state.config.otRounds

      if (state.score.local === state.score.visitor) {
        if (hayMasRondas) {
          const ordinal = otRoundJustFinished === 1 ? '1°' : '2°'
          modalProrroga.titulo  = `Fin de la ${ordinal} Prórroga`
          modalProrroga.visible = true
        } else {
          mostrarNotificacion(
            'Lanzamiento de 7 Metros',
            'El partido continúa empatado. Se define por lanzamiento de 7 metros.',
            'warning'
          )
        }
      } else {
        confirmarFinPartido()
      }
      return
    }

    // ── Avance normal: 1→2 ──────────────────────────────────────────────────────
    state.period++
    state.timeInSeconds = 0
  }

  const prevPeriod = () => {
    if (isRunning.value || state.period === 1) return
    // Si hay un descanso activo, cancelarlo al retroceder
    if (state.breakActive) endBreak()
    state.period--
    state.timeInSeconds = 0
    if (state.matchStatus === 'finished') state.matchStatus = 'active'
  }

  /** Pide confirmación antes de finalizar el partido */
  const confirmarFinPartido = () => {
    notificar({
      titulo: 'Finalizar Partido',
      mensaje: `El resultado es ${state.score.local} — ${state.score.visitor}. ¿Desea finalizar el partido?`,
      tipo: 'success',
      alConfirmar: finalizarPartido,
    })
  }

  const finalizarPartido = () => {
    modalProrroga.visible = false
    state.matchStatus = 'finished'
    guardarEventoEnLog('sistema', 'partido_finalizado', null)
    mostrarNotificacion(
      'Partido Finalizado',
      `Resultado final: ${state.score.local} — ${state.score.visitor}`,
      'success'
    )
  }

  /**
   * Inicia la prórroga que corresponde según el período actual.
   * Desde período 2 → 1° Prórroga (período 3) — sin descanso previo
   * Desde período 4 → 2° Prórroga (período 5) — descanso previo de 5 minutos
   */
  const iniciarProrroga = () => {
    modalProrroga.visible = false
    const nextPer         = state.period + 1            // 2→3, 4→5
    const otRound         = Math.ceil((nextPer - 2) / 2) // 1 para período 3, 2 para período 5
    const ordinal         = otRound === 1 ? '1°' : '2°'

    state.period        = nextPer
    state.timeInSeconds = 0

    const tipo = otRound === 1 ? 'inicio_prorroga' : 'inicio_segunda_prorroga'
    guardarEventoEnLog('sistema', tipo, null)

    if (otRound === 2) {
      // Descanso de 5 minutos entre la 1° y la 2° prórroga (solo Internacional)
      startBreak('ot_round', 5 * 60)
      mostrarNotificacion('Descanso', '5 minutos de descanso antes de la 2° Prórroga.', 'info')
    } else {
      mostrarNotificacion(
        'Prórroga',
        `${ordinal} Prórroga — ${state.config.otDuration / 60} min por tiempo, con 1 min de descanso entre tiempos.`,
        'info'
      )
    }
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────
  const getLocalTimestamp = () => {
    const d = new Date()
    const p = n => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  }

  const validarDorsal = (dorsal) => {
    const clean = dorsal.toString().trim().toUpperCase()
    if (['A','B','C','D','E'].includes(clean)) return { valido: true, valor: clean, tipo: 'oficial' }
    const n = parseInt(clean, 10)
    if (!isNaN(n) && n > 0) return { valido: true, valor: n.toString(), tipo: 'jugador' }
    return { valido: false }
  }

  const obtenerSancionesJugador = (team, playerNumber) => {
    const stats = { yellow: 0, two_min: 0, red: 0, blue: 0 }
    state.eventLog
      .filter(e => e.team === team && e.player_number == playerNumber)
      .forEach(e => {
        if (e.type === 'yellow_card') stats.yellow++
        if (e.type === '2_min')       stats.two_min++
        if (e.type === 'red_card')    stats.red++
        if (e.type === 'blue_card')   stats.blue++
      })
    return stats
  }

  // ─── GOLES ───────────────────────────────────────────────────────────────────
  const registrarGol = (team) => {
    state.score[team]++
    guardarEventoEnLog(team, 'goal', null)
  }

  const restarGol = (team) => {
    if (state.score[team] > 0) {
      state.score[team]--
      guardarEventoEnLog(team, 'goal_removed', null)
    }
  }

  // ─── SANCIONES ───────────────────────────────────────────────────────────────
  const pedirDorsal = (team, type) => {
    // Las exclusiones pausan el reloj automáticamente
    if (['2_min', 'red_card', 'blue_card'].includes(type) && isRunning.value) {
      clearInterval(timerInterval)
      isRunning.value = false
    }
    Object.assign(modalJugador, { visible: true, team, type, dorsal: '' })
  }

  const cerrarModalDorsal = () => { modalJugador.visible = false }

  const confirmarSancion = () => {
    const { team, type, dorsal } = modalJugador

    if (!dorsal?.trim()) {
      mostrarNotificacion('Error', 'Ingrese un número de dorsal o letra (A–E) para oficiales.', 'danger')
      return
    }

    const validacion = validarDorsal(dorsal)
    if (!validacion.valido) {
      mostrarNotificacion('Error', 'Dorsal inválido. Use número positivo o letra A–E.', 'danger')
      return
    }

    const dorsalFinal = validacion.valor

    if (validacion.tipo === 'jugador') {
      // ── Bloquear si ya está descalificado ────────────────────────────────────
      const estaDescalificado = state.disqualifiedPlayers.some(
        p => p.team === team && p.playerNumber === dorsalFinal
      )
      if (estaDescalificado) {
        mostrarNotificacion(
          'Jugador Inhabilitado',
          `El jugador #${dorsalFinal} está descalificado y no puede recibir más sanciones.`,
          'danger'
        )
        cerrarModalDorsal()
        return
      }

      const stats = obtenerSancionesJugador(team, dorsalFinal)

      // ── Reglas IHF para amarilla ─────────────────────────────────────────────
      if (type === 'yellow_card') {
        if (stats.yellow >= 1) {
          mostrarNotificacion('Reglamento IHF', `#${dorsalFinal}: máximo una tarjeta amarilla por partido.`, 'danger')
          return
        }
        if (stats.two_min > 0) {
          mostrarNotificacion('Reglamento IHF', `#${dorsalFinal} ya tiene exclusión; no puede recibir amarilla.`, 'danger')
          return
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
        )
        aplicarPenalidadReloj(team, '2_min', dorsalFinal)
        guardarEventoEnLog(team, '2_min', dorsalFinal)
        guardarEventoEnLog(team, 'red_card', dorsalFinal) // solo bitácora
        state.disqualifiedPlayers.push({ team, playerNumber: dorsalFinal, reason: 'red_card' })
        cerrarModalDorsal()
        return
      }

      // ── Sanción normal ───────────────────────────────────────────────────────
      aplicarPenalidadReloj(team, type, dorsalFinal)
      guardarEventoEnLog(team, type, dorsalFinal)

      if (type === 'red_card' || type === 'blue_card') {
        state.disqualifiedPlayers.push({ team, playerNumber: dorsalFinal, reason: type })
      }

    } else {
      // ── Oficial (A–E) ────────────────────────────────────────────────────────
      aplicarPenalidadReloj(team, type, dorsalFinal)
      guardarEventoEnLog(team, type, dorsalFinal)
      if (type === 'red_card' || type === 'blue_card') {
        state.disqualifiedPlayers.push({ team, playerNumber: dorsalFinal, reason: type })
      }
    }

    cerrarModalDorsal()
  }

  const aplicarPenalidadReloj = (team, type, playerNumber) => {
    if (!['2_min', 'red_card', 'blue_card'].includes(type)) return

    const existing = [...state.activePenalties]
      .reverse()
      .find(p => p.team === team && p.playerNumber === playerNumber)

    if (existing && existing.timeGiven === state.timeInSeconds) {
      if (existing.timeRemaining < 240) {
        existing.timeRemaining = Math.min(existing.timeRemaining + 120, 240)
      }
      if (type === 'red_card' || type === 'blue_card') existing.type = type
    } else {
      state.activePenalties.push({
        id: crypto.randomUUID(),
        team, type, playerNumber,
        timeRemaining: 120,
        timeGiven: state.timeInSeconds,
      })
    }
  }

  const guardarEventoEnLog = (team, type, playerNumber, customTimeStr = null) => {
    const matchTimeStr = customTimeStr ?? `${currentPeriodText.value} - ${formattedTime.value}`
    const newEvent = {
      id: crypto.randomUUID(),
      team,
      player_number: playerNumber,
      type,
      match_time: matchTimeStr,
      timestamp: getLocalTimestamp(),
      synced: false,
    }
    state.eventLog.push(newEvent)
    state.unsyncedEvents.push(newEvent)
  }

  const pedirEliminarEvento = (eventToDel) => {
    notificar({
      titulo: 'Eliminar Evento',
      mensaje: `¿Eliminar "${formatEventType(eventToDel.type)}" de la bitácora?`,
      tipo: 'danger',
      alConfirmar: async () => {
        // Revertir efectos secundarios del evento
        if (eventToDel.type === 'goal') {
          if (state.score[eventToDel.team] > 0) state.score[eventToDel.team]--
        } else if (eventToDel.type === 'goal_removed') {
          state.score[eventToDel.team]++
        } else if (['2_min', 'red_card', 'blue_card'].includes(eventToDel.type)) {
          const idx = state.activePenalties.findIndex(
            p => p.team === eventToDel.team && p.playerNumber === eventToDel.player_number
          )
          if (idx !== -1) state.activePenalties.splice(idx, 1)
        } else if (eventToDel.type === 'timeout') {
          const t = state.timeouts[eventToDel.team]
          if (state.period === 1) t.h1 = Math.max(0, t.h1 - 1)
          if (state.period === 2) t.h2 = Math.max(0, t.h2 - 1)
          t.total = Math.max(0, t.total - 1)
        }

        // Remover de descalificados si era una roja/azul
        if (['red_card', 'blue_card'].includes(eventToDel.type)) {
          const dqIdx = state.disqualifiedPlayers.findIndex(
            p => p.team === eventToDel.team && p.playerNumber === eventToDel.player_number
          )
          if (dqIdx !== -1) state.disqualifiedPlayers.splice(dqIdx, 1)
        }

        state.eventLog       = state.eventLog.filter(e => e.id !== eventToDel.id)
        state.unsyncedEvents = state.unsyncedEvents.filter(e => e.id !== eventToDel.id)

        if (eventToDel.synced) {
          try {
            await api.post({
              entity: 'delegados',
              action: 'eliminarEvento',
              payload: { event_local_id: eventToDel.id },
            })
          } catch (e) { console.error('Error al eliminar en backend:', e) }
        }
      },
    })
  }

  // ─── EDICIÓN MANUAL DE EXCLUSIONES ───────────────────────────────────────────

  /** Abre el modal para corregir el tiempo restante de una exclusión específica */
  const editarPenalidad = (penalty) => {
    modalPenalidad.penaltyId = penalty.id
    modalPenalidad.mm        = Math.floor(penalty.timeRemaining / 60)
    modalPenalidad.ss        = penalty.timeRemaining % 60
    modalPenalidad.label     = `${penalty.team === 'local' ? 'Local' : 'Visita'} — #${penalty.playerNumber}`
    modalPenalidad.visible   = true
  }

  const confirmarEditarPenalidad = () => {
    const m = parseInt(modalPenalidad.mm, 10)
    const s = parseInt(modalPenalidad.ss, 10)
    if (isNaN(m) || isNaN(s) || s < 0 || s > 59 || m < 0) {
      mostrarNotificacion('Error', 'Tiempo inválido.', 'danger')
      return
    }
    const nuevoTiempo = m * 60 + s
    const penalty     = state.activePenalties.find(p => p.id === modalPenalidad.penaltyId)
    if (penalty) {
      if (nuevoTiempo === 0) {
        state.activePenalties = state.activePenalties.filter(p => p.id !== modalPenalidad.penaltyId)
        mostrarNotificacion('Exclusión', 'Exclusión eliminada.', 'info')
      } else {
        penalty.timeRemaining = nuevoTiempo
      }
    }
    modalPenalidad.visible = false
  }

  const startBreak = (type, seconds) => {
    state.breakActive        = true
    state.breakTimeRemaining = seconds
    state.breakType          = type
    resumeBreakTimer()
  }

  const resumeBreakTimer = () => {
    if (breakInterval) clearInterval(breakInterval)
    breakInterval = setInterval(() => {
      state.breakTimeRemaining--
      if (state.breakTimeRemaining <= 0) endBreak()
    }, 1000)
  }

  const endBreak = () => {
    if (breakInterval) clearInterval(breakInterval)
    state.breakActive        = false
    state.breakTimeRemaining = 0
    state.breakType          = null
  }

  const skipBreak = () => {
    guardarEventoEnLog('sistema', 'descanso_salteado', null, 'Descanso cortado manualmente')
    endBreak()
  }

  // ─── TTO ─────────────────────────────────────────────────────────────────────
  const canUseTimeout = (team) => {
    const t = state.timeouts[team]
    if (state.activeTTO !== null) return false
    if (state.period === 1) return t.h1 < 2
    if (state.period === 2) {
      if (t.h2 >= 2)              return false
      if (t.total >= 3)           return false
      if (t.total === 2 && t.lostThird) return false
      return true
    }
    return false
  }

  const requestTTO = (team) => {
    if (!canUseTimeout(team)) return
    if (isRunning.value) { clearInterval(timerInterval); isRunning.value = false }

    const t = state.timeouts[team]
    if (state.period === 1) t.h1++
    if (state.period === 2) {
      t.h2++
      if (t.total === 1 && state.timeInSeconds >= TTO_LIMIT_SEC.value) t.lostThird = true
    }
    t.total++

    state.activeTTO = { team, timeRemaining: 60 }
    resumeTTOTimer()
    guardarEventoEnLog(team, 'timeout', null)
  }

  const resumeTTOTimer = () => {
    if (ttoInterval) clearInterval(ttoInterval)
    ttoInterval = setInterval(() => {
      state.activeTTO.timeRemaining--
      if (state.activeTTO.timeRemaining <= 0) cancelTTO()
    }, 1000)
  }

  const cancelTTO = () => {
    if (ttoInterval) clearInterval(ttoInterval)
    state.activeTTO = null
  }

  const downloadLog = () => {
    if (!filteredLog.value.length) {
      mostrarNotificacion('Atención', 'No hay datos en la bitácora para descargar.', 'danger')
      return
    }
    let content = `BITÁCORA\nLocal: ${state.score.local} | Visita: ${state.score.visitor}\n\n`
    filteredLog.value.forEach(e => {
      content += `[${e.match_time}] ${e.team === 'local' ? 'L' : (e.team === 'visitor' ? 'V' : 'SISTEMA')}`
      if (e.player_number && e.type !== 'tiempo_ajustado') content += ` (#${e.player_number})`
      content += ` -> ${formatEventType(e.type)}`
      if (e.type === 'tiempo_ajustado') content += ` (${e.player_number})`
      content += '\n'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    link.download = 'bitacora_partido.txt'
    link.click()
  }

  onMounted(() => { loadState(); cargarClubes() })
  onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
    if (ttoInterval)   clearInterval(ttoInterval)
    if (breakInterval) clearInterval(breakInterval)
  })

  return {
    state, isRunning, logFilter,
    // computados
    formattedTime, currentPeriodText, localPlayersLess, visitorPlayersLess, disqualifiedLocal, disqualifiedVisitor, filteredLog,
    // modales
    modalJugador, modalTiempo, modalProrroga, modalConfig, hayCambiosConfig, modalPenalidad,
    // partido
    resetMatch, abrirConfig, guardarConfig, abrirModalTiempo, confirmarAjusteTiempo,
    toggleTimer, toggleDirection, nextPeriod, prevPeriod, finalizarPartido, iniciarProrroga,
    // goles, sanciones y exclusiones
    registrarGol, restarGol, pedirDorsal, cerrarModalDorsal, confirmarSancion,
    editarPenalidad, confirmarEditarPenalidad, skipBreak,
    // TTO
    canUseTimeout, requestTTO, cancelTTO,
    // bitácora
    pedirEliminarEvento, downloadLog
  }
}
