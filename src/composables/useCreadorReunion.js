// Etiqueta legible de quién creó una reunión, a partir de creador_rol / creador_nombre
// que devuelve reuniones/obtenerReuniones. Las reuniones viejas creadas por una
// autoridad no tienen rol guardado: se muestran como "Administración".
const ROLES_CREADOR = {
  'admin': 'Admin',
  'coordinador general': 'Coordinador general',
  'secretario': 'Secretario',
  'designador': 'Designador',
}

export const etiquetaCreadorReunion = (reunion) => {
  const rol = String(reunion?.creador_rol || '').trim().toLowerCase()
  const nombre = String(reunion?.creador_nombre || '').trim()
  if (!rol) return 'Administración'
  if (rol === 'coordinador') return nombre ? `Coordinador: ${nombre}` : 'Coordinador'
  if (ROLES_CREADOR[rol]) return ROLES_CREADOR[rol]
  const rolLegible = rol.charAt(0).toUpperCase() + rol.slice(1)
  return nombre ? `${rolLegible} (${nombre})` : rolLegible
}

export const textoCreacionReunion = (reunion) => {
  if (!reunion) return ''
  const fecha = reunion.fecha_creacion_formateada
  const creador = etiquetaCreadorReunion(reunion)
  return fecha ? `Creada el ${fecha} por ${creador}` : `Creada por ${creador}`
}
