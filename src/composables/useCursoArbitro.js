// Inscripción y legajos del curso de árbitros (tabla registro_curso_arbitro).
// Lo usan RegistroArbitroCurso.vue (público) y LegajosCursoAdmin.vue (admin).

export const GENEROS_CURSO = [
  { valor: 'masculino', etiqueta: 'Masculino' },
  { valor: 'femenino', etiqueta: 'Femenino' },
  { valor: 'x', etiqueta: 'X' },
  { valor: 'otro', etiqueta: 'Otro' },
]

export const ESTADOS_CURSO = {
  regular: { etiqueta: 'Regular', clase: 'bg-success' },
  baja: { etiqueta: 'Baja', clase: 'bg-danger' },
}

const separar = (texto) => String(texto || '').split('|').map(c => c.trim()).filter(Boolean)

export const formularioCursoVacio = () => ({
  id: null,
  apellido: '', nombre: '', dni: '', fechaNacimiento: '', genero: '', email: '', celular: '',
  provincia: '', localidad: '', direccion: '', zona: '',
  telefonoContacto: '', parentescoContacto: '',
  esJugador: 'no', idClubJugador: '', categoriasJugador: [],
  esDt: 'no', idClubDt: '', categoriasDt: [],
  observaciones: '',
  sitioWeb: '',
})

// Fila de la tabla (columnas de la base) -> formulario
export const formularioDesdeLegajo = (r) => ({
  ...formularioCursoVacio(),
  id: r.id,
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
  idClubDt: r.id_club_dt || '',
  categoriasDt: separar(r.categorias_dt),
  observaciones: r.observaciones || '',
})

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const calcularEdad = (fechaIso) => {
  const nacimiento = new Date(`${fechaIso}T00:00:00`)
  if (isNaN(nacimiento)) return null
  const ahora = new Date()
  let edad = ahora.getFullYear() - nacimiento.getFullYear()
  const mes = ahora.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && ahora.getDate() < nacimiento.getDate())) edad--
  return edad
}

// Devuelve { campo: mensaje } con los errores (vacío si está todo bien)
export const validarFormularioCurso = (f) => {
  const e = {}
  const obligatorio = (campo, mensaje) => { if (!String(f[campo] ?? '').trim()) e[campo] = mensaje }

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
  if (!EMAIL_VALIDO.test(f.email)) e.email = 'Ingresá un email válido.'
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
    if (!f.idClubDt) e.dt = 'Seleccioná el club donde sos DT.'
    else if (!f.categoriasDt.length) e.dt = 'Seleccioná al menos una categoría que dirigís.'
  }
  return e
}

// Formulario -> payload para el backend
export const payloadCurso = (f) => ({
  ...f,
  dni: String(f.dni).replace(/\D/g, ''),
  idClubJugador: f.esJugador === 'si' ? f.idClubJugador : '',
  categoriasJugador: f.esJugador === 'si' ? f.categoriasJugador : [],
  idClubDt: f.esDt === 'si' ? f.idClubDt : '',
  categoriasDt: f.esDt === 'si' ? f.categoriasDt : [],
})
