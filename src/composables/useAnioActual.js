// Año en que empezó a usarse el sistema: no hay datos anteriores.
export const ANIO_INICIO_SISTEMA = 2026

// Año en curso como string ("2026"), que es como lo comparan los filtros de año.
export const anioActual = () => String(new Date().getFullYear())

// Lista de años para un select de filtro: desde el inicio del sistema hasta el
// año en curso, más cualquier año posterior que aparezca en los datos. Nunca
// incluye años anteriores al inicio del sistema. Ordenada de más nuevo a más viejo.
export const conAnioActual = (anios = []) => {
  const actual = Number(anioActual())
  const set = new Set()
  for (let a = ANIO_INICIO_SISTEMA; a <= actual; a++) set.add(a)
  for (const a of anios) {
    const n = Number(a)
    if (n >= ANIO_INICIO_SISTEMA) set.add(n)
  }
  return [...set].sort((a, b) => b - a).map(String)
}
