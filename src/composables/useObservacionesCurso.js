export const CAMPOS_OBSERVACION_CURSO = [
  { clave: 'puntualidadPresencia', columna: 'puntualidad_presencia', etiqueta: 'Puntualidad y presencia', icono: 'bi-clock' },
  { clave: 'conduccionDesplazamientos', columna: 'conduccion_desplazamientos', etiqueta: 'Conducción y desplazamientos', icono: 'bi-arrows-move' },
  { clave: 'silbatoGestoformas', columna: 'silbato_gestoformas', etiqueta: 'Silbato y gestoformas', icono: 'bi-megaphone' },
  { clave: 'sancionesTecnicas', columna: 'sanciones_tecnicas', etiqueta: 'Sanciones técnicas', icono: 'bi-flag' },
  { clave: 'sancionesDisciplinarias', columna: 'sanciones_disciplinarias', etiqueta: 'Sanciones disciplinarias', icono: 'bi-card-heading' },
  { clave: 'comentarios', columna: 'comentarios', etiqueta: 'Comentarios', icono: 'bi-chat-left-text' },
  { clave: 'aspectosAMejorar', columna: 'aspectos_a_mejorar', etiqueta: 'Aspectos a mejorar', icono: 'bi-arrow-up-circle' },
]

export const observacionCursoVacia = () => ({
  id: null,
  modalidad: '',
  idAlumno: null,
  fechaPartido: '',
  encuentro: '',
  categoria: '',
  observador: '',
  ...Object.fromEntries(CAMPOS_OBSERVACION_CURSO.map(c => [c.clave, ''])),
})

export const observacionCursoDesdeFila = (o) => ({
  id: o.id,
  modalidad: o.modalidad_curso || '',
  idAlumno: o.id_alumno,
  fechaPartido: o.fecha_partido || '',
  encuentro: o.encuentro || '',
  categoria: o.categoria || '',
  observador: o.observador || '',
  ...Object.fromEntries(CAMPOS_OBSERVACION_CURSO.map(c => [c.clave, o[c.columna] || ''])),
})

// Revisión: se carga pendiente; recién aprobada la ve el aspirante. El observador solo edita las pendientes.
export const ESTADOS_REVISION_OBSERVACION = {
  pendiente: { etiqueta: 'Pendiente', clase: 'bg-warning text-dark', icono: 'bi-hourglass-split' },
  aprobada: { etiqueta: 'Aprobada', clase: 'bg-success', icono: 'bi-check-circle-fill' },
  rechazada: { etiqueta: 'Rechazada', clase: 'bg-danger', icono: 'bi-x-circle-fill' },
}
