// Año en curso como string ("2026"), que es como lo comparan los filtros de año.
export const anioActual = () => String(new Date().getFullYear())

// Lista de años para un select de filtro: siempre incluye el año en curso
// (aunque todavía no haya datos de ese año) y queda ordenada de más nuevo a más viejo.
export const conAnioActual = (anios) =>
  [...new Set([...anios, anioActual()])].sort((a, b) => Number(b) - Number(a))
