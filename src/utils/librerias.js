// Librerías pesadas que se cargan recién cuando el usuario las necesita (al exportar o descargar).
// Así no se bajan ~1 MB al entrar a cada sección.
export const cargarExcelJS = async () => (await import('exceljs')).default
export const cargarHtml2pdf = async () => (await import('html2pdf.js')).default
export const cargarHtml2canvas = async () => (await import('html2canvas')).default
