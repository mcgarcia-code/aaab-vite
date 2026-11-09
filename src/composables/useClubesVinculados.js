// Ex-jugador y clubes con los que se identifica el árbitro. Se guardan en registro_arbitro:
// ex_jugador (SI/NO), id_club_ex_jugador, club_ex_jugador (el ÚLTIMO club donde jugó),
// identifica_club (SI/NO) y clubes_identifica (JSON [{ idClub, club }]).
// Se usa en SeccionClubesVinculados.vue, RegistroArbitro, PanelDisponibilidad y Legajos.

export const clubesVinculadosVacios = () => ({
  exJugador: 'no',
  idClubExJugador: '',
  identificaClub: 'no',
  idsClubesIdentifica: [],
})

// '' si está todo bien, o el mensaje del primer error
export const validarClubesVinculados = (v) => {
  if (v.exJugador === 'si' && !v.idClubExJugador) return 'Elegí el último club donde fuiste jugador/a.'
  if (v.identificaClub === 'si' && !v.idsClubesIdentifica.length) return 'Elegí al menos un club con el que te identificás.'
  return ''
}

export const clubesVinculadosParaEnviar = (v) => ({
  exJugador: v.exJugador,
  idClubExJugador: v.exJugador === 'si' ? v.idClubExJugador : '',
  identificaClub: v.identificaClub,
  idsClubesIdentifica: v.identificaClub === 'si' ? v.idsClubesIdentifica : [],
})

export const clubesVinculadosDesdeServidor = (d) => ({
  exJugador: d?.exJugador === 'si' ? 'si' : 'no',
  idClubExJugador: d?.idClubExJugador || '',
  identificaClub: d?.identificaClub === 'si' ? 'si' : 'no',
  idsClubesIdentifica: (d?.clubesIdentifica || []).map(c => String(c.idClub)).filter(Boolean),
})
