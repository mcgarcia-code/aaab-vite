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

// Estado del informe: texto y píldora (creado · pendiente · aprobado · desestimado · anulado)
export const etiquetaEstadoInforme = (estado) => {
  const e = (estado || 'creado').toLowerCase()
  if (e === 'aprobado') return 'APROBADO'
  if (e === 'desestimado') return 'DESESTIMADO'
  if (e === 'anulado') return 'ANULADO'
  if (e === 'pendiente') return 'PENDIENTE'
  return 'CREADO'
}

export const claseEstadoInforme = (estado) => {
  const e = (estado || 'creado').toLowerCase()
  if (e === 'aprobado') return 'estado-pill estado-aprobado'
  if (e === 'desestimado') return 'estado-pill estado-desestimado'
  if (e === 'anulado') return 'estado-pill estado-anulado'
  if (e === 'pendiente') return 'estado-pill estado-pendiente'
  return 'estado-pill estado-creado'
}

// Un informe se puede editar (y cambiar sus archivos) mientras no fue resuelto
export const informeEditable = (inf) => !!inf && (inf.estado === 'creado' || inf.estado === 'pendiente')
