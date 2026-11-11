// Seguimiento de los alumnos regulares del curso: asistencia, mini, parcialitos, teórico final, práctico y físico.
// Lo usa AlumnosRegularesCursoAdmin.vue con los datos de seguimiento_curso_arbitro/obtenerSeguimientoCurso.
import { porcentajeAsistencia } from '@/composables/useAsistenciaCurso'

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

// Aprobado con la misma regla que la planilla de Exámenes: si la nota tiene aprobado/desaprobado se usa eso,
// si no, el porcentaje de la nota tiene que llegar al % de aprobación del examen
export const aproboNota = (examen, nota) => {
  if (!nota || nota.ausente || nota.nota === null) return false
  if (nota.aprobado !== null && nota.aprobado !== undefined) return nota.aprobado
  return (nota.nota / (examen.notaMaxima || 100)) * 100 >= (examen.porcentajeAprobacion ?? 75)
}
const desaprobo = (examen, nota) => Boolean(nota && (nota.ausente || (nota.nota !== null && !aproboNota(examen, nota))))

// Resultado de un examen: 'aprobado' (lo aprobó), 'recuperado' (lo aprobó con un recuperatorio),
// 'recuperando' (tiene un recuperatorio sin nota), 'desaprobado' o null (todavía sin nota)
const resultadoExamen = (examen, recuperatorios, notaDe) => {
  const nota = notaDe(examen)
  if (aproboNota(examen, nota)) return 'aprobado'
  if (recuperatorios.some(r => aproboNota(r, notaDe(r)))) return 'recuperado'
  if (!desaprobo(examen, nota)) return null
  return recuperatorios.some(r => !notaDe(r)) ? 'recuperando' : 'desaprobado'
}

const aprobo = (r) => r === 'aprobado' || r === 'recuperado'

// Resultado de un grupo de exámenes: con uno desaprobado (sin recuperar) queda desaprobado
const resultadoGrupo = (resultados, soloRendidos) => {
  const lista = soloRendidos ? resultados.filter(r => r !== null) : resultados
  if (!lista.length) return 'pendiente'
  if (lista.includes('desaprobado')) return 'desaprobado'
  return lista.every(aprobo) ? 'aprobado' : 'pendiente'
}

export const armarSeguimiento = ({ alumnos, clases, asistencias, examenes, notas, mini, recuperados = [] }) => {
  const asis = {}
  asistencias.forEach(a => { asis[`${a.idClase}-${a.idAlumno}`] = a })
  const nts = {}
  notas.forEach(n => { nts[`${n.idExamen}-${n.idAlumno}`] = n })

  const examenPorId = {}
  examenes.forEach(e => { examenPorId[e.id] = e })

  return alumnos.map(alumno => {
    const notaDe = (examen) => (examen ? nts[`${examen.id}-${alumno.id}`] || null : null)
    const propios = recuperados.filter(r => r.idAlumno === alumno.id)
    // Rendidos online: se sabe exactamente qué parcialitos recuperó cada recuperatorio
    const recuperatoriosParcialito = (idParcialito) => propios
      .filter(r => r.idParcialito === idParcialito)
      .map(r => examenPorId[r.idExamen])
      .filter(Boolean)
    const conDetalle = new Set(propios.map(r => r.idExamen))

    const detalleClases = clases.filter(c => corresponde(c.curso, alumno)).map(clase => {
      const a = asis[`${clase.id}-${alumno.id}`]
      return { clase, asistencia: a ? (a.presente ? 'presente' : 'ausente') : null }
    })

    const delCurso = examenes.filter(e => corresponde(e.curso, alumno))
    const originales = delCurso.filter(e => !e.idExamenOriginal && !e.esRecuperatorioParcialitos)
    // Recuperatorios de parcialitos (1° y 2°) a los que se presentó o figura ausente, por fecha
    const recuperatoriosRendidos = delCurso.filter(e => e.esRecuperatorioParcialitos && notaDe(e))

    // Nota cargada a mano (sin detalle): un recuperatorio de parcialitos aprobado recupera los parcialitos
    // desaprobados o ausentes de fechas anteriores. Es la misma regla que la planilla de Exámenes y el backend.
    const recuperatoriosManuales = (e) => (e.tipo === 'teorico' && !e.esFinal && notaDe(e)
      ? recuperatoriosRendidos.filter(r => String(r.fecha) >= String(e.fecha) && !conDetalle.has(r.id))
      : [])

    const resultadoDe = (e) => resultadoExamen(e, [
      ...delCurso.filter(r => r.idExamenOriginal === e.id && desaprobo(e, notaDe(e))),
      ...recuperatoriosParcialito(e.id),
      ...recuperatoriosManuales(e),
    ], notaDe)

    const parcialitos = originales.filter(e => e.tipo === 'teorico' && !e.esFinal).map(resultadoDe)
    const finales = originales.filter(e => e.tipo === 'teorico' && e.esFinal).map(resultadoDe)
    const practicosRendidos = originales.filter(e => e.tipo === 'practico').map(resultadoDe)
    // Los simulacros físicos no cuentan: solo el examen físico final
    const fisicos = originales.filter(e => e.tipo === 'fisico' && e.esFinal).map(resultadoDe)

    const detalleExamenes = delCurso
      .filter(e => (e.esRecuperatorioParcialitos ? Boolean(notaDe(e)) : !e.idExamenOriginal || desaprobo(examenPorId[e.idExamenOriginal] || e, notaDe(examenPorId[e.idExamenOriginal]))))
      .map(examen => ({ examen, nota: notaDe(examen) }))
      .reverse()

    const detalleMini = mini.filter(m => m.idAlumno === alumno.id)
    return {
      alumno,
      notaFinal: notaFinalDeEstado(alumno.estado),
      // Regla común de asistencia (useAsistenciaCurso): clases sobre las dictadas, mini sobre los encuentros con presente o ausente
      asistencia: porcentajeAsistencia(detalleClases.map(d => ({ fecha: d.clase.fecha, asistencia: d.asistencia })), 'clases'),
      mini: { ...porcentajeAsistencia(detalleMini, 'mini'), convocados: detalleMini.length },
      parcialitos: {
        aprobados: parcialitos.filter(aprobo).length,
        directos: parcialitos.filter(r => r === 'aprobado').length,
        recuperados: parcialitos.filter(r => r === 'recuperado').length,
        recuperando: parcialitos.filter(r => r === 'recuperando').length,
        desaprobados: parcialitos.filter(r => r === 'desaprobado').length,
        total: parcialitos.length,
      },
      // 1° recuperatorio (sin recuperatorio anterior) y 2° (encadenado a un recuperatorio anterior)
      recuperatorios: recuperatoriosRendidos.map(examen => ({
        examen,
        nota: notaDe(examen),
        orden: examen.idExamenOriginal ? 2 : 1,
        aprobado: aproboNota(examen, notaDe(examen)),
      })),
      final: resultadoGrupo(finales, false),
      practico: resultadoGrupo(practicosRendidos, true),
      fisico: resultadoGrupo(fisicos, true),
      detalleClases: [...detalleClases].reverse(),
      detalleExamenes,
      detalleMini: [...detalleMini].reverse(),
    }
  })
}
