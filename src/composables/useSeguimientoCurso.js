// Seguimiento de los alumnos regulares del curso: asistencia, mini y resultado por tipo de examen.
// Lo usa AlumnosRegularesCursoAdmin.vue con los datos de seguimiento_curso_arbitro/obtenerSeguimientoCurso.

export const TIPOS_EXAMEN_CURSO = ['teorico', 'practico', 'fisico']
export const ETIQUETAS_TIPO_EXAMEN = { teorico: 'Teórico', practico: 'Práctico', fisico: 'Físico' }

export const RESULTADOS = {
  aprobado: { etiqueta: 'Aprobado', clase: 'bg-success' },
  desaprobado: { etiqueta: 'Desaprobado', clase: 'bg-danger' },
  pendiente: { etiqueta: 'Pendiente', clase: 'bg-light text-muted border' },
}

// La nota final del curso es el estado del legajo
export const NOTA_FINAL = {
  aprobado: { etiqueta: 'Aprobó el curso', clase: 'bg-success', estado: 'aprobado' },
  desaprobado: { etiqueta: 'Desaprobó el curso', clase: 'bg-danger', estado: 'desaprobado' },
  pendiente: { etiqueta: 'Pendiente', clase: 'bg-light text-muted border', estado: 'regular' },
}

export const notaFinalDeEstado = (estado) => (estado === 'aprobado' || estado === 'desaprobado' ? estado : 'pendiente')

const corresponde = (curso, alumno) => curso === 'ambos' || curso === alumno.modalidadCurso

const desaprobo = (nota) => Boolean(nota && (nota.aprobado === false || nota.ausente))

// Un examen original queda aprobado si lo aprobó o si aprobó alguno de sus recuperatorios
const resultadoExamen = (examen, recuperatorios, notaDe) => {
  const nota = notaDe(examen)
  if (nota?.aprobado === true) return 'aprobado'
  if (recuperatorios.some(r => notaDe(r)?.aprobado === true)) return 'aprobado'
  if (!nota) return null
  if (!desaprobo(nota)) return null
  const pendienteRecuperatorio = recuperatorios.some(r => !notaDe(r))
  return pendienteRecuperatorio ? 'recuperando' : 'desaprobado'
}

// Teórico: tienen que estar aprobados todos los del curso.
// Práctico y físico: se toman solo los que rindió (se cargan por aspirante).
const resultadoTipo = (tipo, resultados) => {
  const lista = tipo === 'teorico' ? resultados : resultados.filter(r => r !== null)
  if (!lista.length) return 'pendiente'
  if (lista.includes('desaprobado')) return 'desaprobado'
  if (lista.every(r => r === 'aprobado')) return 'aprobado'
  return 'pendiente'
}

export const armarSeguimiento = ({ alumnos, clases, asistencias, examenes, notas, mini }) => {
  const asis = {}
  asistencias.forEach(a => { asis[`${a.idClase}-${a.idAlumno}`] = a })
  const nts = {}
  notas.forEach(n => { nts[`${n.idExamen}-${n.idAlumno}`] = n })

  return alumnos.map(alumno => {
    const notaDe = (examen) => nts[`${examen.id}-${alumno.id}`] || null

    const detalleClases = clases.filter(c => corresponde(c.curso, alumno)).map(clase => {
      const a = asis[`${clase.id}-${alumno.id}`]
      return { clase, asistencia: a ? (a.presente ? 'presente' : 'ausente') : null }
    })
    const presentes = detalleClases.filter(d => d.asistencia === 'presente').length

    const delCurso = examenes.filter(e => corresponde(e.curso, alumno))
    const originales = delCurso.filter(e => !e.idExamenOriginal)
    const recuperatoriosDe = (examen) => delCurso.filter(r => r.idExamenOriginal === examen.id && desaprobo(notaDe(examen)))

    const resultados = Object.fromEntries(TIPOS_EXAMEN_CURSO.map(tipo => {
      const lista = originales.filter(e => e.tipo === tipo).map(e => resultadoExamen(e, recuperatoriosDe(e), notaDe))
      return [tipo, resultadoTipo(tipo, lista)]
    }))

    const detalleExamenes = delCurso
      .filter(e => !e.idExamenOriginal || desaprobo(nts[`${e.idExamenOriginal}-${alumno.id}`]))
      .map(examen => ({ examen, nota: notaDe(examen) }))
      .reverse()

    const detalleMini = mini.filter(m => m.idAlumno === alumno.id)
    return {
      alumno,
      notaFinal: notaFinalDeEstado(alumno.estado),
      asistencia: { presentes, total: detalleClases.length, porcentaje: detalleClases.length ? Math.round(presentes / detalleClases.length * 100) : null },
      mini: {
        presentes: detalleMini.filter(m => m.asistencia === 'presente').length,
        ausentes: detalleMini.filter(m => m.asistencia === 'ausente').length,
        total: detalleMini.length,
      },
      resultados,
      detalleClases: [...detalleClases].reverse(),
      detalleExamenes,
      detalleMini: [...detalleMini].reverse(),
    }
  })
}
