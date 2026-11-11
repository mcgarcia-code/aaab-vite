// Texto sin tildes y en minúsculas, para buscar sin importar acentos ni mayúsculas
export const normalizarTexto = (valor) => String(valor ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
