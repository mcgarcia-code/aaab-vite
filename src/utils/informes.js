// Datos comunes de los informes de partido (carga del árbitro, coordinadores y admin)

export const OPCIONES_TORNEO = [
  { valor: 'metropolitano_apertura', etiqueta: 'Metropolitano Apertura' },
  { valor: 'metropolitano_clausura', etiqueta: 'Metropolitano Clausura' },
  { valor: 'super_8', etiqueta: 'Super 8' },
  { valor: 'copa_campeones', etiqueta: 'Copa de Campeones' },
  { valor: 'desarrollo_apertura', etiqueta: 'Torneo Desarrollo Apertura' },
  { valor: 'desarrollo_clausura', etiqueta: 'Torneo Desarrollo Clausura' },
  { valor: 'otros', etiqueta: 'Otros' }
]

export const etiquetaTorneo = (valor) => (OPCIONES_TORNEO.find(t => t.valor === valor) || {}).etiqueta || valor
