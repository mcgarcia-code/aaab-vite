// Notas de exámenes del curso (tabla examenes_curso_arbitro).
// Lo usan MiRendimientoCurso.vue y MisExamenesCurso.vue.

export const formatoNota = (n) => {
  if (n === null || n === undefined || n === '') return ''
  const num = Number(n)
  return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/0$/, '')
}

// Color de la nota: usa "aprobado" si viene cargado; si no, aprueba con 60% o más
export const estaAprobado = (e) => {
  if (e.aprobado !== null && e.aprobado !== undefined) return e.aprobado
  if (e.nota === null) return null
  return e.nota / (e.notaMaxima || 10) >= 0.6
}

export const claseNota = (e) => {
  const aprobado = estaAprobado(e)
  if (aprobado === null) return 'text-muted'
  return aprobado ? 'text-success' : 'text-danger'
}
