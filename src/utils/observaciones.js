// Datos comunes de las observaciones de partidos (admin, coordinadores, observadores y árbitro observado)

// Categoría del partido observado: según el origen viene como "categoria" o como "categoria_edad"
export const categoriaObs = (o) => o?.categoria || o?.categoria_edad || '-'

// Nombre del torneo de una observación, buscándolo en la lista de torneos que cargó la pantalla
export const nombreDeTorneo = (torneos, o, vacio = '-') => {
  const t = (torneos || []).find(t => String(t.id) === String(o?.id_torneo))
  return t ? t.nombre : vacio
}
