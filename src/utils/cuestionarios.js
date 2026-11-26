// Datos comunes a los cuestionarios sobre las reglas: exámenes online (asamblea y curso),
// práctica del catálogo, catálogo público, planillas y la administración del catálogo.

// Nota mínima (%) para aprobar el teórico. Tiene que coincidir con Cuestionario::UMBRAL_APROBADO del backend.
// Los exámenes del curso guardan su propio porcentaje de aprobación; este es el que se propone por defecto.
export const UMBRAL_APROBADO = 75

export const aprobado = (porcentaje) => Number(porcentaje) >= UMBRAL_APROBADO

// Reglas del reglamento: del 1 al 18 y algunas con nombre (ej. "SAR"). Orden: primero los números, después el resto
const esNumero = (regla) => /^\d+$/.test(String(regla))

// Como llega del backend o de la base: "8" → 8, "sar" → "SAR"
export const normalizarRegla = (regla) => (esNumero(regla) ? Number(regla) : String(regla ?? '').trim().toUpperCase())
export const compararReglas = (a, b) => {
  if (esNumero(a) && esNumero(b)) return Number(a) - Number(b)
  if (esNumero(a) !== esNumero(b)) return esNumero(a) ? -1 : 1
  return String(a).localeCompare(String(b))
}

// "Todas las reglas" (las 18), "Todas las reglas y SAR", "Regla 8" o "Reglas 1, 4, SAR"
export const textoReglas = (lista = []) => {
  const ordenadas = [...lista].sort(compararReglas)
  const estanLas18 = Array.from({ length: 18 }, (_, i) => i + 1).every(n => ordenadas.some(r => Number(r) === n))
  if (estanLas18) {
    const otras = ordenadas.filter(r => !esNumero(r))
    return otras.length ? `Todas las reglas y ${otras.join(', ')}` : 'Todas las reglas'
  }
  return ordenadas.length === 1 ? `Regla ${ordenadas[0]}` : `Reglas ${ordenadas.join(', ')}`
}

// Número de la pregunta en el catálogo: regla.número ("8.12"); sin número de pregunta queda solo la regla ("8")
export const numeroPregunta = (pregunta) => {
  if (!pregunta) return ''
  const { codigo, subcodigo } = pregunta
  return subcodigo !== null && subcodigo !== undefined && subcodigo !== '' ? `${codigo}.${subcodigo}` : String(codigo ?? '')
}

// "Regla 8.12" (o "Rule 8.12" con la etiqueta en inglés)
export const textoNumeroPregunta = (pregunta, etiqueta = 'Regla') => (pregunta ? `${etiqueta} ${numeroPregunta(pregunta)}` : '')
