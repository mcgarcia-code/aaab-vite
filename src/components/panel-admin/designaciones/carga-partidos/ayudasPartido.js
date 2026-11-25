// Funciones de ayuda de un partido de la grilla de designaciones (CargaPartidos).
// Son puras: solo leen el partido (y el mapa de avisos que llega del backend),
// así las usan la página, la tabla de escritorio y las tarjetas del celular.
import { normalizarTexto } from '@/utils/texto'

export const SIN_ARBITRO = 'Sin Árbitro'

/* ====================================================
   UTILIDADES DE TEXTO Y FECHAS
   ==================================================== */
export const capitalizarNombre = (texto) => {
  return String(texto || '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ')
}

export const parsearFecha = (fecha) => {
  if (!fecha) return 0
  const texto = String(fecha).trim()

  let m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()

  m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    const anio = m[3].length === 2 ? '20' + m[3] : m[3]
    return new Date(Number(anio), Number(m[2]) - 1, Number(m[1])).getTime()
  }

  return 0
}

export const etiquetaDia = (fecha) => {
  const timestamp = parsearFecha(fecha)
  if (!timestamp) return fecha || 'Sin fecha'
  const d = new Date(timestamp)
  const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dias[d.getDay()]} ${dd}/${mm}/${d.getFullYear()}`
}

// Clave del día de un partido (la de las pestañas)
export const claveFecha = (p) => String(p.fecha || '').trim() || 'Sin fecha'

// Listas de partidos pendientes (de todas las fechas), ordenadas por fecha y horario
export const ordenarPorFechaHorario = (a, b) => {
  const df = parsearFecha(claveFecha(a)) - parsearFecha(claveFecha(b))
  if (df !== 0) return df
  return String(a.horario || '').localeCompare(String(b.horario || ''))
}

/* ====================================================
   ESTADO DE DESIGNACIÓN DEL PARTIDO (ayuda visual)
   - a_designar: sin árbitro 1 ni árbitro 2.
   - designado:  al menos un árbitro asignado.
   - publicado:  ya fue publicado (campo publicado del backend).
   El estado publicado prevalece sobre los demás. Un partido
   a_designar nunca puede estar publicado.
   ==================================================== */
export const estadoDesignacion = (p) => {
  const estado = String(p.estado || '').trim()
  if (estado === 'publicado' || estado === 'designado' || estado === 'a_designar') return estado
  // Fallback por si un registro viejo no tiene estado seteado
  return (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'
}

export const etiquetaEstado = (p) => {
  const estado = estadoDesignacion(p)
  if (estado === 'publicado') return 'Publicado'
  if (estado === 'designado') return 'Designado'
  return 'Sin designar'
}

export const tituloEstado = (p) => {
  const estado = estadoDesignacion(p)
  if (estado === 'publicado') return 'Partido publicado'
  if (estado === 'designado') return 'Partido designado (falta publicar)'
  return 'Sin árbitros designados'
}

/* ====================================================
   AVISOS (el mapa llega de designaciones/obtenerAvisosDesignaciones:
   { [idPartido]: [{ nombre, etiqueta, avisos: [] }] })
   ==================================================== */

// Total de avisos de un partido (para el ícono de alerta)
export const cantidadAvisos = (avisosMap, p) => {
  const grupos = p.id ? avisosMap[p.id] : null
  if (!grupos) return 0
  return grupos.reduce((total, g) => total + g.avisos.length, 0)
}

// Color de la barra de alerta: se toma el más grave entre los grupos
// de avisos del partido (rojo > naranja > amarillo > verde).
const PRIORIDAD_ETIQUETA = { rojo: 4, naranja: 3, amarillo: 2, verde: 1 }
export const etiquetaAvisos = (avisosMap, p) => {
  const grupos = (p.id ? avisosMap[p.id] : null) || []
  return grupos.reduce((peor, g) => {
    const prioridad = PRIORIDAD_ETIQUETA[g.etiqueta] || 0
    return prioridad > (PRIORIDAD_ETIQUETA[peor] || 0) ? g.etiqueta : peor
  }, 'amarillo')
}

// Texto del modal: por cada árbitro con problemas, su nombre y
// debajo sus avisos con viñeta. Árbitros separados por línea en blanco.
export const textoAvisos = (avisosMap, p) => {
  const grupos = (p.id ? avisosMap[p.id] : null) || []
  return grupos
    .map(g => `${g.nombre}:\n` + g.avisos.map(a => `• ${a}`).join('\n'))
    .join('\n\n')
}

// Grupos de avisos de un partido que realmente tienen avisos
export const gruposAvisos = (avisosMap, p) => {
  const grupos = (p.id ? avisosMap[p.id] : null) || []
  return grupos.filter(g => g.avisos && g.avisos.length > 0)
}

/* ====================================================
   MARCA DE COLOR DEL ÁRBITRO / DELEGADO
   ==================================================== */
export const colorClase = (p, numero) => {
  const estado = numero === 1 ? p._estado1 : p._estado2
  return estado ? 'estado-' + estado : ''
}

// La etiqueta del delegado técnico (solo lectura para el admin): la fija el
// backend cuando el delegado rechaza el partido ('reemplazar'). Se limpia sola
// al cambiar de delegado (ver asignarObservadorDelegado / editarObservadorDelegado).
export const colorClaseDelegado = (p) => (p._estadoDel ? 'estado-' + p._estadoDel : '')

/* ====================================================
   CELDA DE ÁRBITRO (sin árbitro, externo, sin match)
   ==================================================== */
export const esSinArbitro = (p, numero) => {
  const nombre = numero === 1 ? p.arbitro_1 : p.arbitro_2
  const id = numero === 1 ? p.id_arb1 : p.id_arb2
  return !id && normalizarTexto(nombre).trim() === normalizarTexto(SIN_ARBITRO)
}

export const esExterno = (p, numero) => {
  const nombre = numero === 1 ? p.arbitro_1 : p.arbitro_2
  const id = numero === 1 ? p.id_arb1 : p.id_arb2
  const ext = numero === 1 ? p._ext1 : p._ext2
  return !!nombre && !id && !!ext && !esSinArbitro(p, numero)
}

export const esSinMatch = (p, numero) => {
  const nombre = numero === 1 ? p.arbitro_1 : p.arbitro_2
  const id = numero === 1 ? p.id_arb1 : p.id_arb2
  const ext = numero === 1 ? p._ext1 : p._ext2
  return !!nombre && !id && !ext && !esSinArbitro(p, numero)
}

export const tituloCelda = (p, numero) => {
  const nombre = numero === 1 ? p.arbitro_1 : p.arbitro_2
  if (!nombre) return 'Asignar árbitro'
  if (esSinArbitro(p, numero)) return 'El partido se juega sin árbitro en este puesto'
  if (esExterno(p, numero)) return 'Árbitro externo (fuera del padrón): ' + nombre
  if (esSinMatch(p, numero)) return 'Sin match en el padrón: ' + nombre
  return nombre
}

// Observador / delegado sin id = puesto a mano (externo)
export const esExternoRol = (p, tipo) => {
  const nombre = tipo === 'observador' ? p.observador : p.delegado
  const id = tipo === 'observador' ? p.id_observador : p.id_delegado
  return !!nombre && !id
}

export const tituloCeldaRol = (p, tipo) => {
  const nombre = tipo === 'observador' ? p.observador : p.delegado
  const etiqueta = tipo === 'observador' ? 'Observador' : 'Delegado técnico'
  if (!nombre) return 'Asignar ' + etiqueta.toLowerCase()
  return etiqueta + ': ' + nombre
}

/* ====================================================
   MESA DE CONTROL
   ==================================================== */
export const tieneMesa = (p) => !!p.planillero || !!p.cronometrista

export const tituloMesa = (p) => {
  const partes = []
  if (p.planillero) partes.push('Planillero: ' + p.planillero)
  if (p.cronometrista) partes.push('Cronometrista: ' + p.cronometrista)
  return partes.length ? partes.join(' · ') : 'Mesa de control (sin asignar)'
}
