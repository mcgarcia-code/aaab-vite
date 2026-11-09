// Seguimiento de los alumnos regulares del curso: asistencia, mini, parcialitos, teórico final, práctico y físico.
// Lo usa AlumnosRegularesCursoAdmin.vue con los datos de seguimiento_curso_arbitro/obtenerSeguimientoCurso.

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

// Un examen queda aprobado si lo aprobó o si aprobó alguno de sus recuperatorios
const resultadoExamen = (examen, recuperatorios, notaDe) => {
  const nota = notaDe(examen)
  if (nota?.aprobado === true) return 'aprobado'
  if (recuperatorios.some(r => notaDe(r)?.aprobado === true)) return 'aprobado'
  if (!desaprobo(nota)) return null
  return recuperatorios.some(r => !notaDe(r)) ? 'recuperando' : 'desaprobado'
}

// Resultado de un grupo de exámenes: con uno desaprobado (sin recuperar) queda desaprobado
const resultadoGrupo = (resultados, soloRendidos) => {
  const lista = soloRendidos ? resultados.filter(r => r !== null) : resultados
  if (!lista.length) return 'pendiente'
  if (lista.includes('desaprobado')) return 'desaprobado'
  return lista.every(r => r === 'aprobado') ? 'aprobado' : 'pendiente'
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
    const resultadoDe = (e) => resultadoExamen(e, delCurso.filter(r => r.idExamenOriginal === e.id && desaprobo(notaDe(e))), notaDe)

    const parcialitos = originales.filter(e => e.tipo === 'teorico' && !e.esFinal).map(resultadoDe)
    const finales = originales.filter(e => e.tipo === 'teorico' && e.esFinal).map(resultadoDe)
    const practicosRendidos = originales.filter(e => e.tipo === 'practico').map(resultadoDe)
    const fisicos = originales.filter(e => e.tipo === 'fisico').map(resultadoDe)

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
      parcialitos: {
        aprobados: parcialitos.filter(r => r === 'aprobado').length,
        desaprobados: parcialitos.filter(r => r === 'desaprobado').length,
        total: parcialitos.length,
      },
      final: resultadoGrupo(finales, false),
      practico: resultadoGrupo(practicosRendidos, true),
      fisico: resultadoGrupo(fisicos, true),
      detalleClases: [...detalleClases].reverse(),
      detalleExamenes,
      detalleMini: [...detalleMini].reverse(),
    }
  })
}
