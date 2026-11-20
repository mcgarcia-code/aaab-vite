// Texto sin tildes, en minúsculas y sin espacios en los extremos, para buscar sin importar acentos ni mayúsculas
export const normalizarTexto = (valor) => String(valor ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// Convierte HTML cargado por usuarios (ej. recordatorios) en texto plano seguro para mostrar con {{ }}.
// DOMParser arma un documento inerte: no ejecuta scripts ni carga imágenes.
// Los <br> y cierres de párrafo se vuelven saltos de línea (mostrar con white-space: pre-line).
export const textoPlano = (html) => {
  const conSaltos = String(html ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li)>/gi, '\n')
  const doc = new DOMParser().parseFromString(conSaltos, 'text/html')
  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}
