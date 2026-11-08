// Inscripción y legajos del curso de árbitros (tabla registro_curso_arbitro).
// Lo usan RegistroArbitroCurso.vue (público), LegajosCursoAdmin.vue y AlumnosRegularesCursoAdmin.vue.

export const DOMINIO_USUARIO_CURSO = 'cursoaaab.com.ar'
export const MAX_CLUBES_DT = 10

export const GENEROS_CURSO = [
  { valor: 'masculino', etiqueta: 'Masculino' },
  { valor: 'femenino', etiqueta: 'Femenino' },
  { valor: 'x', etiqueta: 'X' },
  { valor: 'otro', etiqueta: 'Otro' },
]

export const ESTADOS_CURSO = {
  inscripto: { etiqueta: 'Inscripto', clase: 'bg-secondary' },
  alta: { etiqueta: 'Alta', clase: 'bg-dark' },
  regular: { etiqueta: 'Regular', clase: 'bg-success' },
  reinscripcion: { etiqueta: 'Reinscripción', clase: 'bg-info text-dark' },
  aprobado: { etiqueta: 'Árbitro aprobado', clase: 'bg-primary' },
  desaprobado: { etiqueta: 'Desaprobado', clase: 'bg-warning text-dark' },
  baja: { etiqueta: 'Baja', clase: 'bg-danger' },
}

// Fotos de los alumnos: carpeta propia, separada de las de los árbitros
export const urlFotoCurso = (dni, version = '') => {
  const limpio = String(dni || '').replace(/\D/g, '')
  if (!limpio) return 'https://ui-avatars.com/api/?name=Sin+Foto&background=ef4444&color=fff'
  return `https://arbitroshandball.com.ar/uploads/carnet-curso/${limpio}.webp${version ? `?v=${version}` : ''}`
}
export const FOTO_POR_DEFECTO = 'https://ui-avatars.com/api/?name=Sin+Foto&background=ef4444&color=fff'

const separar = (texto) => String(texto || '').split('|').map(c => c.trim()).filter(Boolean)

export const usuarioSinDominio = (usuario) =>
  String(usuario || '').toLowerCase().replace(`@${DOMINIO_USUARIO_CURSO}`, '')

export const filaDtVacia = () => ({ idClub: '', categorias: [] })

export const formularioCursoVacio = () => ({
  id: null,
  usuario: '', password: '', passwordConfirmacion: '',
  apellido: '', nombre: '', dni: '', fechaNacimiento: '', genero: '', email: '', celular: '',
  provincia: '', localidad: '', direccion: '', zona: '',
  telefonoContacto: '', parentescoContacto: '',
  esJugador: 'no', idClubJugador: '', categoriasJugador: [],
  esDt: 'no', dtClubes: [],
  observaciones: '',
  sitioWeb: '',
})

// Fila de la tabla (columnas de la base) -> formulario
export const formularioDesdeLegajo = (r) => ({
  ...formularioCursoVacio(),
  id: r.id,
  usuario: usuarioSinDominio(r.usuario),
  apellido: r.apellido || '',
  nombre: r.nombre || '',
  dni: r.dni || '',
  fechaNacimiento: r.fecha_nacimiento ? String(r.fecha_nacimiento).substring(0, 10) : '',
  genero: r.genero || '',
  email: r.email || '',
  celular: r.celular || '',
  provincia: r.provincia ? Number(r.provincia) : '',
  localidad: r.localidad ? Number(r.localidad) : '',
  direccion: r.direccion || '',
  zona: r.zona || '',
  telefonoContacto: r.telefonocontacto || '',
  parentescoContacto: r.parentescocontacto || '',
  esJugador: r.es_jugador === 'SI' ? 'si' : 'no',
  idClubJugador: r.id_club_jugador || '',
  categoriasJugador: separar(r.categorias_jugador),
  esDt: r.es_dt === 'SI' ? 'si' : 'no',
  dtClubes: (r.dt_clubes || []).map(d => ({ idClub: d.idClub || '', categorias: d.categorias || [] })),
  observaciones: r.observaciones || '',
})

// "Club A: Mayores Fem, C; Junior | Club B: Menores" (tablas y Excel)
export const textoDtClubes = (lista) =>
  (lista || []).map(d => `${d.club || 'Club'}: ${(d.categorias || []).join('; ')}`).join(' | ')

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USUARIO_VALIDO = /^[a-z0-9][a-z0-9._-]{2,39}$/

const calcularEdad = (fechaIso) => {
  const nacimiento = new Date(`${fechaIso}T00:00:00`)
  if (isNaN(nacimiento)) return null
  const ahora = new Date()
  let edad = ahora.getFullYear() - nacimiento.getFullYear()
  const mes = ahora.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && ahora.getDate() < nacimiento.getDate())) edad--
  return edad
}

const errorClubesDt = (clubes) => {
  if (!clubes.length) return 'Cargá al menos un club donde sos DT.'
  for (const [i, d] of clubes.entries()) {
    if (!d.idClub) return `Club ${i + 1}: seleccioná el club.`
    if (!d.categorias.length) return `Club ${i + 1}: seleccioná al menos una categoría.`
  }
  return ''
}

// Devuelve { campo: mensaje } con los errores (vacío si está todo bien).
// passwordObligatoria: true en la inscripción pública; en el admin es opcional.
export const validarFormularioCurso = (f, { passwordObligatoria = true } = {}) => {
  const e = {}
  const obligatorio = (campo, mensaje) => { if (!String(f[campo] ?? '').trim()) e[campo] = mensaje }

  if (!USUARIO_VALIDO.test(usuarioSinDominio(f.usuario).trim())) {
    e.usuario = 'Entre 3 y 40 caracteres: letras minúsculas, números, punto, guion o guion bajo.'
  }
  if (passwordObligatoria || f.password) {
    if (String(f.password).length < 8) e.password = 'La contraseña tiene que tener al menos 8 caracteres.'
    else if (f.password !== f.passwordConfirmacion) e.passwordConfirmacion = 'Las contraseñas no coinciden.'
  }

  obligatorio('apellido', 'Ingresá el apellido.')
  obligatorio('nombre', 'Ingresá el nombre.')
  const dni = String(f.dni).replace(/\D/g, '')
  if (dni.length < 7 || dni.length > 9) e.dni = 'Ingresá un DNI válido, sin puntos.'
  if (!f.fechaNacimiento) e.fechaNacimiento = 'Ingresá la fecha de nacimiento.'
  else {
    const edad = calcularEdad(f.fechaNacimiento)
    if (edad === null || edad < 14 || edad > 90) e.fechaNacimiento = 'Revisá la fecha de nacimiento.'
  }
  obligatorio('genero', 'Seleccioná un género.')
  if (!EMAIL_VALIDO.test(f.email)) e.email = 'Ingresá un email personal válido.'
  else if (f.email.toLowerCase().endsWith(`@${DOMINIO_USUARIO_CURSO}`)) e.email = 'Usá tu email personal, no el del curso.'
  obligatorio('celular', 'Ingresá el celular.')
  obligatorio('provincia', 'Seleccioná la provincia.')
  obligatorio('localidad', 'Seleccioná la localidad.')
  obligatorio('direccion', 'Ingresá la dirección.')
  obligatorio('telefonoContacto', 'Ingresá un teléfono de emergencia.')
  obligatorio('parentescoContacto', 'Indicá el parentesco.')

  if (f.esJugador === 'si') {
    if (!f.idClubJugador) e.jugador = 'Seleccioná el club donde jugás.'
    else if (!f.categoriasJugador.length) e.jugador = 'Seleccioná al menos una categoría en la que jugás.'
  }
  if (f.esDt === 'si') {
    const errorDt = errorClubesDt(f.dtClubes)
    if (errorDt) e.dt = errorDt
  }
  return e
}

// Formulario -> payload para el backend
export const payloadCurso = (f) => {
  const payload = {
    ...f,
    usuario: usuarioSinDominio(f.usuario).trim(),
    dni: String(f.dni).replace(/\D/g, ''),
    idClubJugador: f.esJugador === 'si' ? f.idClubJugador : '',
    categoriasJugador: f.esJugador === 'si' ? f.categoriasJugador : [],
    dtClubes: f.esDt === 'si' ? f.dtClubes.map(d => ({ idClub: d.idClub, categorias: d.categorias })) : [],
  }
  if (!payload.password) {
    delete payload.password
    delete payload.passwordConfirmacion
  }
  return payload
}

// Datos del alumno aprobado para precargar el registro como árbitro
export const CLAVE_PRECARGA_REGISTRO = 'precarga_registro_arbitro'
export const precargaRegistroArbitro = (i) => ({
  apellido: i.apellido || '',
  nombre: i.nombre || '',
  dni: i.dni || '',
  fechaNacimiento: i.fecha_nacimiento ? String(i.fecha_nacimiento).substring(0, 10) : '',
  genero: i.genero || '',
  email: i.email || '',
  celular: i.celular || '',
  provincia: i.provincia ? Number(i.provincia) : '',
  localidad: i.localidad ? Number(i.localidad) : '',
  direccion: i.direccion || '',
  zona: i.zona || '',
  telefonoContacto: i.telefonocontacto || '',
  parentescoContacto: i.parentescocontacto || '',
})
