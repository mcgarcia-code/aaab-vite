// Texto sin tildes, en minúsculas, con un solo espacio entre palabras y sin espacios en los extremos.
// Sirve para buscar sin importar acentos ni mayúsculas, y para comparar nombres (ej. grupos de la planilla general)
export const normalizarTexto = (valor) => String(valor ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// Marca dónde se pueden cortar las palabras largas (9 letras o más) con guiones invisibles (U+00AD),
// entre vocal y consonante + vocal (regla básica de sílabas del español: "Desca·li·fi·ca·ción").
// El guion solo aparece si la palabra no entra en el renglón. Sirve en cualquier navegador,
// aunque no tenga diccionario de español para hyphens: auto (ej. botones angostos de AAAB TV)
const VOCALES = 'aeiouáéíóúü'
const CORTE_SILABA = new RegExp(`([${VOCALES}])(?=[^${VOCALES}\\s/][${VOCALES}])`, 'gi')
export const conCortesDeSilaba = (texto) =>
  String(texto ?? '').replace(/[a-záéíóúüñ]{9,}/gi, (palabra) => palabra.replace(CORTE_SILABA, '$1­'))

// Convierte HTML cargado por usuarios (ej. recordatorios) en texto plano seguro para mostrar con {{ }}.
// DOMParser arma un documento inerte: no ejecuta scripts ni carga imágenes.
// Los <br> y cierres de párrafo se vuelven saltos de línea (mostrar con white-space: pre-line).
export const textoPlano = (html) => {
  const conSaltos = String(html ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li)>/gi, '\n')
  const doc = new DOMParser().parseFromString(conSaltos, 'text/html')
  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}
