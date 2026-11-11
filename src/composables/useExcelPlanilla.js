// Excel de las planillas del curso: mismos colores, bordes y descarga en todas
// (Exámenes, Planilla de asistencia, Alumnos Regulares y Legajos).

// Acepta 'verde' o 'celda-verde' (la clase de la vista)
const COLORES = {
  verde: { relleno: 'FFD1E7DD', fuente: 'FF0F5132' },
  roja: { relleno: 'FFF8D7DA', fuente: 'FF842029' },
  gris: { relleno: 'FFE9ECEF', fuente: 'FF6C757D' },
  na: { relleno: 'FFF8F9FA' },
  cabecera: { relleno: 'FFF1F3F5' },
}

export const pintarCeldaExcel = (celda, color = '', opciones = {}) => {
  const c = COLORES[String(color).replace('celda-', '')] || {}
  const borde = { style: 'thin', color: { argb: 'FFD4D4D8' } }
  celda.border = { top: borde, left: borde, bottom: borde, right: borde }
  celda.alignment = { horizontal: opciones.izquierda ? 'left' : 'center', vertical: 'middle', wrapText: !!opciones.ajustar }
  if (c.relleno) celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.relleno } }
  celda.font = { bold: !!opciones.negrita, size: opciones.tamanio || 11, color: { argb: c.fuente || 'FF212529' } }
}

// Libro con una hoja y la primera fila y columna fijas
export const crearPlanillaExcel = async (nombreHoja) => {
  const { default: ExcelJS } = await import('exceljs')
  const libro = new ExcelJS.Workbook()
  const hoja = libro.addWorksheet(nombreHoja, { views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }] })
  return { libro, hoja }
}

export const pintarCabeceraExcel = (hoja, alto = 45) => {
  hoja.getRow(1).eachCell({ includeEmpty: true }, c => pintarCeldaExcel(c, 'cabecera', { negrita: true, ajustar: true, tamanio: 10 }))
  hoja.getRow(1).height = alto
}

export const anchosColumnasExcel = (hoja, anchos) => {
  anchos.forEach((ancho, i) => { hoja.getColumn(i + 1).width = ancho })
}

export const descargarLibroExcel = async (libro, nombreArchivo) => {
  const buffer = await libro.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  enlace.click()
  URL.revokeObjectURL(url)
}
