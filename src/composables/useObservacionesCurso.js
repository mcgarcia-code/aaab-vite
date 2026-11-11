export const CAMPOS_OBSERVACION_CURSO = [
  { clave: 'puntualidadPresencia', columna: 'puntualidad_presencia', etiqueta: 'Puntualidad y presencia', icono: 'bi-clock' },
  { clave: 'conduccionDesplazamientos', columna: 'conduccion_desplazamientos', etiqueta: 'Conducción y desplazamientos', icono: 'bi-arrows-move' },
  { clave: 'silbatoGestoformas', columna: 'silbato_gestoformas', etiqueta: 'Silbato y gestoformas', icono: 'bi-megaphone' },
  { clave: 'sancionesTecnicas', columna: 'sanciones_tecnicas', etiqueta: 'Sanciones técnicas', icono: 'bi-flag' },
  { clave: 'sancionesDisciplinarias', columna: 'sanciones_disciplinarias', etiqueta: 'Sanciones disciplinarias', icono: 'bi-card-heading' },
  { clave: 'comentarios', columna: 'comentarios', etiqueta: 'Comentarios', icono: 'bi-chat-left-text' },
  { clave: 'aspectosAMejorar', columna: 'aspectos_a_mejorar', etiqueta: 'Aspectos a mejorar', icono: 'bi-arrow-up-circle' },
]

// Tipos de observación: encuentro de mini (curso anual) o partido amistoso (anual o intensivo)
export const TIPOS_OBSERVACION_CURSO = {
  mini: { etiqueta: 'Encuentro de mini', icono: 'bi-people', ayuda: 'Curso anual: se elige un encuentro de mini en el que el aspirante estuvo presente. El observador es el profesor a cargo.' },
  amistoso: { etiqueta: 'Partido amistoso', icono: 'bi-flag', ayuda: 'Curso anual o intensivo: partido amistoso de otra categoría, con el árbitro que observó.' },
}

export const observacionCursoVacia = () => ({
  id: null,
  tipo: 'mini',
  modalidad: '',
  idAlumno: null,
  idEncuentro: null,
  fechaPartido: '',
  encuentro: '',
  categoria: '',
  observador: '',
  ...Object.fromEntries(CAMPOS_OBSERVACION_CURSO.map(c => [c.clave, ''])),
})

export const observacionCursoDesdeFila = (o) => ({
  id: o.id,
  tipo: o.tipo || 'mini',
  modalidad: o.modalidad_curso || '',
  idAlumno: o.id_alumno,
  idEncuentro: o.id_encuentro ?? null,
  fechaPartido: o.fecha_partido || '',
  encuentro: o.encuentro || '',
  categoria: o.categoria || '',
  observador: o.observador || '',
  ...Object.fromEntries(CAMPOS_OBSERVACION_CURSO.map(c => [c.clave, o[c.columna] || ''])),
})

// Revisión: se carga pendiente; recién aprobada la ve el aspirante. El observador solo edita las pendientes.
// Mismas píldoras que Observaciones del panel-admin (clases estado-pill, ver estilos en cada vista)
export const ESTADOS_REVISION_OBSERVACION = {
  pendiente: { etiqueta: 'PENDIENTE', clase: 'estado-pill estado-pendiente', alerta: 'alert-warning' },
  aprobada: { etiqueta: 'APROBADA', clase: 'estado-pill estado-aprobada', alerta: 'alert-success' },
  rechazada: { etiqueta: 'RECHAZADA', clase: 'estado-pill estado-rechazada', alerta: 'alert-danger' },
}
