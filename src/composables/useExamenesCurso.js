// Notas de exámenes del curso (examenes_curso_arbitro + notas_examen_curso_arbitro).
// Lo usan MiRendimientoCurso.vue, MisExamenesCurso.vue y ExamenesCursoAdmin.vue.

// El teórico se aprueba con el 75% de la nota máxima (cada examen puede tener su porcentaje)
export const PORCENTAJE_APROBACION_DEFECTO = 75

export const formatoNota = (n) => {
  if (n === null || n === undefined || n === '') return ''
  const num = Number(n)
  return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/0$/, '')
}

// Usa "aprobado" si lo calculó el backend; si no, lo calcula con el porcentaje del examen
export const estaAprobado = (e) => {
  if (e.aprobado !== null && e.aprobado !== undefined) return e.aprobado
  if (e.nota === null || e.nota === undefined) return null
  const porcentaje = e.porcentajeAprobacion ?? PORCENTAJE_APROBACION_DEFECTO
  return (e.nota / (e.notaMaxima || 100)) * 100 >= porcentaje
}

export const claseNota = (e) => {
  const aprobado = estaAprobado(e)
  if (aprobado === null) return 'text-muted'
  return aprobado ? 'text-success' : 'text-danger'
}
