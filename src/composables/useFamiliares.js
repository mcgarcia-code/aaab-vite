// Familiares del árbitro que juegan en algún club. Se guardan en registro_arbitro:
// tiene_familiares (SI/NO) y familiares (JSON con la lista de abajo).
// Cada fila: { idClub, categorias: ['Menores A', ...], parentesco }
// Se usa en SeccionFamiliares.vue, RegistroArbitro, PanelDisponibilidad y Legajos.

export const MAX_FAMILIARES = 10

export const filaFamiliarVacia = () => ({ idClub: '', club: '', categorias: [], parentesco: '' })

export const errorFilaFamiliar = (f) => {
  if (!f.idClub) return 'Seleccioná el club.'
  if (!f.categorias?.length) return 'Seleccioná al menos una categoría.'
  if (!String(f.parentesco || '').trim()) return 'Indicá el parentesco.'
  return ''
}

// Devuelve '' si está todo bien, o el mensaje del primer error
export const validarFamiliares = (tiene, familiares) => {
  if (tiene !== 'si') return ''
  if (!familiares.length) return 'Si tenés familiares en algún club, cargá al menos uno.'
  for (const [i, fila] of familiares.entries()) {
    const error = errorFilaFamiliar(fila)
    if (error) return `Familiar ${i + 1}: ${error}`
  }
  return ''
}

// Lista para mandar al backend (sin datos de más)
export const familiaresParaEnviar = (tiene, familiares) =>
  tiene === 'si'
    ? familiares.map(f => ({ idClub: f.idClub, categorias: f.categorias, parentesco: String(f.parentesco || '').trim() }))
    : []

// Texto de una línea para tablas y Excel:
// "Club A: Menores A; Junior Fem, C (Hijo) | Club B: Mini (Hija)"
export const textoFamiliares = (lista) =>
  (lista || [])
    .map(f => `${f.club || 'Club'}: ${(f.categorias || []).join('; ')}${f.parentesco ? ` (${f.parentesco})` : ''}`)
    .join(' | ')

// Lo que devuelve el backend -> estado del formulario
export const familiaresDesdeServidor = (lista) => {
  const familiares = (lista || []).map(f => ({
    idClub: String(f.idClub || ''),
    club: f.club || '',
    categorias: Array.isArray(f.categorias) ? f.categorias : [],
    parentesco: f.parentesco || '',
  }))
  return { tiene: familiares.length ? 'si' : 'no', familiares }
}
