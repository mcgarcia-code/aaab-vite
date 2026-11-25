// Formatos de la planilla del delegado técnico (cronómetro, exclusiones y bitácora)

// Segundos → "MM:SS" (exclusiones, descanso)
export const formatPenaltyTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// Tipo de evento → texto de la bitácora
export const formatEventType = (type) => ({
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
}[type] ?? type)

// Equipo de un evento → letra de la bitácora
export const letraEquipo = (team) => (team === 'local' ? 'L' : (team === 'visitor' ? 'V' : 'SISTEMA'))
