// Datos comunes a los cuestionarios sobre las reglas: exámenes online (asamblea y curso),
// práctica del catálogo, catálogo público, planillas y la administración del catálogo.

// Nota mínima (%) para aprobar el teórico. Tiene que coincidir con Cuestionario::UMBRAL_APROBADO del backend.
// Los exámenes del curso guardan su propio porcentaje de aprobación; este es el que se propone por defecto.
export const UMBRAL_APROBADO = 75

export const aprobado = (porcentaje) => Number(porcentaje) >= UMBRAL_APROBADO

// Número de la pregunta en el catálogo: regla.número ("8.12"); sin número de pregunta queda solo la regla ("8")
export const numeroPregunta = (pregunta) => {
  if (!pregunta) return ''
  const { codigo, subcodigo } = pregunta
  return subcodigo !== null && subcodigo !== undefined && subcodigo !== '' ? `${codigo}.${subcodigo}` : String(codigo ?? '')
}

// "Regla 8.12" (o "Rule 8.12" con la etiqueta en inglés)
export const textoNumeroPregunta = (pregunta, etiqueta = 'Regla') => (pregunta ? `${etiqueta} ${numeroPregunta(pregunta)}` : '')
