import { api, listaDe } from '@/api/api'
import { auth } from '@/api/auth'
import { AAAB_TV_CON_SERVIDOR } from '@/api/aaabTvEventos'

// =====================================================================
// AAAB TV · panel de botones, canales, clips, autorización, comentarios, dibujos, listas,
// colecciones oficiales y publicación. (Los montajes quedaron en pausa hasta definir cómo se quieren.)
//
// Igual que los eventos (api/aaabTvEventos.js), dos formas con las mismas funciones:
// - Con servidor (VITE_AAAB_TV_SERVIDOR=true): los datos van al backend del hosting
//   (entity 'aaab_tv') y el video se sube a la VPS, que corta los clips y los sirve.
// - Sin servidor (maqueta): todo queda en este navegador.
//
// Canales: el canal público (idGrupo null) y uno por cada grupo de la asociación (idGrupo = id del grupo).
// Un clip se publica en uno o más canales ("destinos") y el coordinador general autoriza cada uno
// por separado: puede quedar autorizado en un canal y no en otro. Lo que publica el propio
// coordinador general (o el admin) sale autorizado: eso lo decide el backend por el token.
//
// Usuarios: los árbitros vienen de registro_arbitro y las autoridades de usuarios_admin, así que un
// mismo id puede ser de los dos. Por eso todo lo que tiene autor lleva idAutor + tipoAutor.
//
// Contrato con el hosting (entity 'aaab_tv'; el usuario, su tipo y su rol salen del token):
//   GET  obtenerPanel        {}                                   → [{ id, nombre, color }] | null
//   POST guardarPanel        { botones }                          → botones guardados
//   GET  listarCanales       {}                                   → [{ idGrupo, nombre }]: el público y el del grupo del árbitro
//                                                                   (el coordinador, todos)
//   GET  listarClips         {}                                   → clips autorizados en los canales que ve, los propios en
//                                                                   cualquier estado y aquellos donde es árbitro involucrado
//                                                                   (si están autorizados en algún canal)
//   POST borrarClip          { id }                               → true (solo el autor, mientras todo esté pendiente)
//   GET  listarClipsAdmin    {}                                   → todos los clips (coordinador general)
//   POST editarClip          { id, titulo, descripcion, decision, arbitros, destinos: [{ idGrupo, estado }] } → clip
//   POST cambiarEstadoDestino { id, idGrupo, estado }             → clip actualizado
//   POST guardarAnotaciones  { idClip, anotaciones }              → clip actualizado (el autor o el coordinador general)
//   GET  listarComentarios   { idClip }                           → [comentario]
//   POST agregarComentario   { idClip, texto, segundo }           → comentario (solo rol 2 y 4, coordinador general y admin)
//                                                                   segundo: momento del clip al que se refiere, o null
//   POST borrarComentario    { id }                               → true (el autor, o el coordinador general)
//   GET  listarListas        {}                                   → [{ id, nombre, idsClips }] del usuario
//   POST guardarLista        { id?, nombre }                      → lista (alta o cambio de nombre)
//   POST borrarLista         { id }                               → true
//   POST cambiarClipEnLista  { idLista, idClip, incluir }         → lista actualizada
//   GET  listarColecciones   {}                                   → colecciones oficiales de los canales que ve
//   GET  listarColeccionesAdmin {}                                → todas (coordinador general)
//   POST guardarColeccion    { id?, nombre, descripcion, idGrupo, idsClips }  → colección (coordinador general)
//   POST borrarColeccion     { id }                               → true (coordinador general)
//   POST iniciarSubida       { nombre, tamanio, tipo, huella }    → { idVideo, urlVps, tokenSubida, tamanioParte, listo }
//   POST publicarClips       { idVideo, partido, fecha, idEvento, destinos: [idGrupo|null],
//                              camaras: [{ idVideo, nombre, desfase }],
//                              clips: [{ idTag, inicio, fin, titulo, descripcion, etiqueta, color, decision, arbitros: [id] }] }
//                                                                → { cantidad, clips }
//   POST publicarVideoExterno { idVideo, titulo, descripcion, etiqueta, color, partido, fecha, destinos, decision, arbitros }
//                                                                → { cantidad: 1, clips: [clip] } (el video entero es el clip)
//   GET  listarGruposPublicacion {}                              → [{ idGrupo, nombre }] todos los grupos activos
//                                                                   (rol 2 y 4, coordinador general y admin: para elegir dónde publicar)
// Avisos (los genera el backend): al autor cuando se autoriza un canal de su clip y cuando le comentan el clip;
// a los árbitros involucrados cuando un clip donde aparecen queda autorizado
// Contrato con la VPS (entity 'videos', Authorization: Bearer <tokenSubida>):
//   POST estadoSubida        { idVideo }                          → { partesRecibidas: [numero] }
//   POST subirParte          FormData: idVideo, numero, parte     → { numero }
//   POST completarSubida     { idVideo }                          → { idVideo, duracion }
// Clip: { id, titulo, descripcion, etiqueta, color, partido, fecha, inicio, fin, origen, idAutor, tipoAutor, autor,
//         publicadoEl, urlVideo, urlHls, urlMiniatura, procesado, decision, arbitros: [{ id, nombre }],
//         angulos: [{ nombre, urlVideo, urlHls }], anotaciones: [anotación], destinos: [{ idGrupo, nombre, estado }] }
//   origen: 'analisis' (cortado de un partido) | 'externo' (video subido entero desde "Subir video")
//   decision: 'correcta' | 'incorrecta' | 'a_revisar' | null (valoración de la decisión arbitral del clip)
//   estado de cada destino: 'pendiente' | 'autorizado' | 'no_autorizado'
//   anotación (dibujo sobre el video): { id, segundo, formas: [{ tipo: 'flecha'|'linea'|'circulo'|'libre', color, puntos: [[x, y]] }] }
//     segundo: dentro del clip (desde su inicio); x e y entre 0 y 1 (proporción del cuadro)
// Comentario: { id, idClip, idAutor, tipoAutor, autor, esCoordinacion, texto, segundo, creadoEl } (segundo: del clip, o null)
// Colección: { id, nombre, descripcion, idGrupo, nombreCanal, idsClips, actualizadoEl }
// =====================================================================

const ENTIDAD = 'aaab_tv'
const ENTIDAD_VPS = 'videos'
const INTENTOS_POR_PARTE = 3
export const NOMBRE_CANAL_PUBLICO = 'Canal público'

// Quiénes pueden publicar: en el panel árbitro, observadores y coordinadores; en el panel admin,
// el coordinador general y el admin (que además autorizan)
const ROLES_PUBLICAN = [2, 4]   // observador, coordinador
const ROLES_AUTORIDAD_PUBLICAN = ['coordinador general', 'admin']
// El coordinador general y el admin: lo que publican sale autorizado en todos los canales elegidos
export const publicaAutorizado = (usuario = auth.getUser() || {}) =>
  !!usuario.esAutoridad && ROLES_AUTORIDAD_PUBLICAN.includes(String(usuario.rol || '').toLowerCase())
export const esRolPublicador = (usuario = auth.getUser() || {}) =>
  publicaAutorizado(usuario) || (!usuario.esAutoridad && ROLES_PUBLICAN.includes(Number(usuario.rol)))

// Tipo de usuario: 'admin' (usuarios_admin) o 'arbitro' (registro_arbitro)
export const tipoUsuario = (usuario = auth.getUser() || {}) => (usuario.esAutoridad ? 'admin' : 'arbitro')
// ¿Es el usuario logueado? Compara id y tipo (un id solo puede repetirse entre árbitros y autoridades)
export const esUsuarioActual = (id, tipo = 'arbitro') => {
  const usuario = auth.getUser() || {}
  return id !== null && id !== undefined && String(id) === String(usuario.id) && (tipo || 'arbitro') === tipoUsuario(usuario)
}
// ¿El árbitro logueado está entre los involucrados del clip?
export const estaInvolucrado = (clip) => {
  const usuario = auth.getUser() || {}
  return !usuario.esAutoridad && (clip.arbitros || []).some(a => String(a.id) === String(usuario.id))
}

export const nombreGrupo = (g) => (g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre)

const comoLista = (res) => (res?.ok ? { ok: true, payload: listaDe(res) } : res)

// Grupos de la asociación (los mismos de Secretaría): cada uno es un canal.
// Ojo: 'grupos.obtenerGrupos' a un árbitro del panel le devuelve solo los grupos que coordina
// (vacío para un observador). Por eso con servidor se usa 'aaab_tv.listarGruposPublicacion',
// y en la maqueta se le suma el grupo propio, que viene en la sesión
const listarGrupos = async () => {
  const res = await api.getCacheado({ entity: 'grupos', action: 'obtenerGrupos' })
  if (!res?.ok && !res?.success) return { ok: false, payload: null, message: res?.message || 'No se pudieron cargar los grupos.' }
  return {
    ok: true,
    payload: listaDe({ ok: true, payload: res.payload }).map(g => ({ idGrupo: Number(g.id), nombre: nombreGrupo(g) }))
  }
}

// Identifica el archivo sin leerlo entero (un hash de varios GB tardaría minutos):
// el mismo archivo elegido de nuevo da la misma huella, y la subida puede retomarse
const huellaDe = (archivo) => `${archivo.name}|${archivo.size}|${archivo.lastModified}`

// ─── Subida de un video a la VPS, por partes ──────────────────
// alProgresar(fraccion 0..1). Devuelve { ok, payload: { idVideo }, message }
const subirVideo = async (archivo, alProgresar) => {
  const pedirPermiso = () => api.post({
    entity: ENTIDAD,
    action: 'iniciarSubida',
    payload: { nombre: archivo.name, tamanio: archivo.size, tipo: archivo.type, huella: huellaDe(archivo) }
  })

  const permiso = await pedirPermiso()
  if (!permiso?.ok) return permiso
  const { idVideo, urlVps, tamanioParte, listo } = permiso.payload
  let tokenSubida = permiso.payload.tokenSubida
  // Ya estaba subido (mismo archivo): no se vuelve a subir
  if (listo) {
    alProgresar?.(1)
    return { ok: true, payload: { idVideo } }
  }

  // Llama a la VPS; si venció el token de subida, pide otro al hosting y repite una vez
  const enVps = async (llamada) => {
    let res = await llamada({ baseUrl: urlVps, token: tokenSubida })
    if (res?.permisoVencido) {
      const nuevo = await pedirPermiso()
      if (!nuevo?.ok) return nuevo
      tokenSubida = nuevo.payload.tokenSubida
      res = await llamada({ baseUrl: urlVps, token: tokenSubida })
    }
    return res
  }

  const estado = await enVps(destino => api.post({ entity: ENTIDAD_VPS, action: 'estadoSubida', payload: { idVideo } }, destino))
  if (!estado?.ok) return estado
  const recibidas = new Set(estado.payload?.partesRecibidas ?? [])

  const totalPartes = Math.max(1, Math.ceil(archivo.size / tamanioParte))
  for (let numero = 0; numero < totalPartes; numero++) {
    if (!recibidas.has(numero)) {
      const parte = archivo.slice(numero * tamanioParte, (numero + 1) * tamanioParte)
      let res = null
      for (let intento = 1; intento <= INTENTOS_POR_PARTE && !res?.ok; intento++) {
        res = await enVps(destino => {
          // El FormData se arma en cada intento: api.postFile le agrega entity y action
          const datos = new FormData()
          datos.set('idVideo', idVideo)
          datos.set('numero', String(numero))
          datos.set('parte', parte)
          return api.postFile({ entity: ENTIDAD_VPS, action: 'subirParte', payload: datos }, destino)
        })
      }
      if (!res?.ok) return { ...res, message: res?.message || 'Se cortó la subida del video. Volvé a publicar para seguir desde donde quedó.' }
    }
    alProgresar?.((numero + 1) / totalPartes)
  }

  const fin = await enVps(destino => api.post({ entity: ENTIDAD_VPS, action: 'completarSubida', payload: { idVideo } }, destino))
  if (!fin?.ok) return fin
  return { ok: true, payload: { idVideo } }
}

// Sube varios videos uno detrás de otro (la cámara principal y las extra), con un solo progreso
// pesado por tamaño. Devuelve { ok, payload: [idVideo, ...] en el mismo orden }
const subirVideos = async (archivos, alProgresar) => {
  const total = archivos.reduce((s, a) => s + a.size, 0) || 1
  let hecho = 0
  const ids = []
  for (const archivo of archivos) {
    const res = await subirVideo(archivo, (f) => alProgresar?.((hecho + f * archivo.size) / total))
    if (!res?.ok) return res
    hecho += archivo.size
    ids.push(res.payload.idVideo)
  }
  return { ok: true, payload: ids }
}

// ─── Con servidor ─────────────────────────────────────────────
const pedir = (action, payload = {}) => api.get({ entity: ENTIDAD, action, payload })
const enviar = (action, payload = {}) => api.post({ entity: ENTIDAD, action, payload })
const idsDe = (arbitros) => (arbitros || []).map(a => a.id)

const conServidor = {
  obtenerPanel: () => pedir('obtenerPanel'),
  guardarPanel: (botones) => enviar('guardarPanel', { botones }),

  listarCanales: async () => comoLista(await pedir('listarCanales')),
  listarGruposPublicacion: async () => comoLista(await pedir('listarGruposPublicacion')),

  listarClips: async () => comoLista(await pedir('listarClips')),
  borrarClip: (id) => enviar('borrarClip', { id }),

  listarClipsAdmin: async () => comoLista(await pedir('listarClipsAdmin')),
  editarClip: ({ id, titulo, descripcion, decision, arbitros, destinos }) =>
    enviar('editarClip', { id, titulo, descripcion, decision, arbitros: idsDe(arbitros), destinos }),
  cambiarEstadoDestino: (id, idGrupo, estado) => enviar('cambiarEstadoDestino', { id, idGrupo, estado }),
  guardarAnotaciones: (idClip, anotaciones) => enviar('guardarAnotaciones', { idClip, anotaciones }),

  listarComentarios: async (idClip) => comoLista(await pedir('listarComentarios', { idClip })),
  agregarComentario: (idClip, texto, segundo = null) => enviar('agregarComentario', { idClip, texto, segundo }),
  borrarComentario: (id) => enviar('borrarComentario', { id }),

  listarListas: async () => comoLista(await pedir('listarListas')),
  guardarLista: ({ id, nombre }) => enviar('guardarLista', { id: id ?? null, nombre }),
  borrarLista: (id) => enviar('borrarLista', { id }),
  cambiarClipEnLista: (idLista, idClip, incluir) => enviar('cambiarClipEnLista', { idLista, idClip, incluir }),

  listarColecciones: async () => comoLista(await pedir('listarColecciones')),
  listarColeccionesAdmin: async () => comoLista(await pedir('listarColeccionesAdmin')),
  guardarColeccion: ({ id, nombre, descripcion, idGrupo, idsClips }) =>
    enviar('guardarColeccion', { id: id ?? null, nombre, descripcion, idGrupo, idsClips }),
  borrarColeccion: (id) => enviar('borrarColeccion', { id }),


  // archivo: el video del evento (partido completo o un tiempo); camaras: [{ archivo, nombre, desfase }]
  publicarClips: async ({ archivo, camaras = [], partido, fecha, idEvento, destinos, clips, alProgresar }) => {
    const subida = await subirVideos([archivo, ...camaras.map(c => c.archivo)], alProgresar)
    if (!subida?.ok) return subida
    const [idVideo, ...idsCamaras] = subida.payload
    return enviar('publicarClips', {
      idVideo,
      partido,
      fecha,
      idEvento: idEvento || null,
      destinos,
      camaras: camaras.map((c, i) => ({ idVideo: idsCamaras[i], nombre: c.nombre, desfase: c.desfase })),
      clips: clips.map(c => ({
        idTag: c.id, inicio: c.inicio, fin: c.fin, titulo: c.titulo, descripcion: c.descripcion,
        etiqueta: c.nombre, color: c.color, decision: c.decision || null, arbitros: idsDe(c.arbitros)
      }))
    })
  },

  // Video externo (ej. una jugada que llegó por WhatsApp): se sube entero y es un solo clip
  publicarVideoExterno: async ({ archivo, titulo, descripcion, etiqueta, color, partido, fecha, destinos, decision, arbitros, alProgresar }) => {
    const subida = await subirVideo(archivo, alProgresar)
    if (!subida?.ok) return subida
    return enviar('publicarVideoExterno', {
      idVideo: subida.payload.idVideo, titulo, descripcion, etiqueta, color, partido, fecha, destinos,
      decision: decision || null, arbitros: idsDe(arbitros)
    })
  },

  // Los cambios se ven al volver a cargar: no hay aviso entre pestañas
  alCambiarEnOtraPestana: () => {}
}

// ─── Sin servidor (este navegador) ────────────────────────────
// Los clips, comentarios y colecciones se comparten entre los usuarios de este navegador (así se puede
// publicar con uno y autorizar con otro). El video local no se guarda: solo se ve en la sesión en la que
// se publicó. Cada árbitro ve el canal público y el de su grupo (id_grupo de la sesión); el coordinador
// ve todos. Los avisos los genera el backend (acá no hay).
const CLAVE_CLIPS = 'aaabTv.clips'
const CLAVE_COMENTARIOS = 'aaabTv.comentarios'
const CLAVE_COLECCIONES = 'aaabTv.colecciones'
const publico = (estado) => [{ idGrupo: null, nombre: NOMBRE_CANAL_PUBLICO, estado }]
const CLIPS_EJEMPLO = [
  {
    id: 'ej-1', titulo: 'Descalificación por golpe en la cara al lanzador',
    descripcion: 'El defensor llega tarde al bloqueo y golpea con el antebrazo en la cara del lanzador en suspensión. Regla 8:5.',
    etiqueta: 'Red/Blue Card', color: 'rojo', partido: 'River vs. SAG Villa Ballester', fecha: '2026-11-15',
    inicio: 1114, fin: 1130, idAutor: null, autor: 'Ejemplo', publicadoEl: '2026-11-15T21:00:00',
    decision: 'correcta', destinos: publico('autorizado')
  },
  {
    id: 'ej-2', titulo: '2 minutos por agarre al pivote desde atrás',
    descripcion: 'El pivote gana la posición y el defensor lo toma de la cintura impidiendo el giro. 2 minutos y 7 metros.',
    etiqueta: '2 minutos', color: 'naranja', partido: 'Ferro vs. Dorrego', fecha: '2026-11-08',
    inicio: 3367, fin: 3383, idAutor: null, autor: 'Ejemplo', publicadoEl: '2026-11-08T22:00:00',
    decision: 'a_revisar', destinos: publico('no_autorizado')
  },
  {
    id: 'ej-3', titulo: 'Ventaja bien aplicada en el contraataque',
    descripcion: 'Falta leve en mitad de cancha: la pareja espera y el extremo convierte. Regla 13:2.',
    etiqueta: 'Play on', color: 'verde', partido: 'Sedalo vs. CID Moreno', fecha: '2026-11-01',
    inicio: 1440, fin: 1456, idAutor: null, autor: 'Ejemplo', publicadoEl: '2026-11-01T20:30:00',
    decision: 'correcta', destinos: publico('pendiente')
  }
]
// Los ejemplos que ya estaban guardados toman la etiqueta actual (su moderación se respeta)
const ETIQUETA_EJEMPLO = Object.fromEntries(CLIPS_EJEMPLO.map(c => [c.id, c.etiqueta]))
// Clips guardados con la versión anterior (un solo estado, sin canales): pasan al canal público
const ESTADO_ANTERIOR = { publico: 'autorizado', no_publico: 'no_autorizado', pendiente: 'pendiente' }

const leer = (clave, defecto) => {
  try {
    return JSON.parse(localStorage.getItem(clave) || 'null') ?? defecto
  } catch {
    return defecto
  }
}
const escribir = (clave, valor) => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}
const nuevoId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
const nombreDe = (u) => `${u.nombre || ''} ${u.apellido || ''}`.trim()
const ahoraIso = () => new Date().toISOString()

// Grupo del árbitro logueado (null si no tiene) y si puede entrar a un canal:
// el coordinador entra a todos; el resto, al público y al de su grupo
const ROL_COORDINADOR = 4
const idGrupoUsuario = () => {
  const idGrupo = (auth.getUser() || {}).id_grupo
  return idGrupo === null || idGrupo === undefined || idGrupo === '' ? null : Number(idGrupo)
}
const puedeVerCanal = (idGrupo) =>
  idGrupo === null ||
  Number((auth.getUser() || {}).rol) === ROL_COORDINADOR ||
  (idGrupoUsuario() !== null && Number(idGrupo) === idGrupoUsuario())

// El grupo propio sale de la sesión (id_grupo, grupo, subgrupo): no depende de 'grupos.obtenerGrupos'
const sumarGrupoPropio = (lista) => {
  const idGrupo = idGrupoUsuario()
  if (idGrupo === null || lista.some(g => g.idGrupo === idGrupo)) return lista
  const usuario = auth.getUser() || {}
  return [...lista, { idGrupo, nombre: nombreGrupo({ nombre: usuario.grupo || `Grupo ${idGrupo}`, subgrupo: usuario.subgrupo }) }]
}
const listarGruposMaqueta = async () => {
  const grupos = await listarGrupos()
  return { ok: true, payload: sumarGrupoPropio(grupos.ok ? grupos.payload : []) }
}
const nombreCanalDe = async (idGrupo) => {
  if (idGrupo === null) return NOMBRE_CANAL_PUBLICO
  const grupos = await listarGruposMaqueta()
  return grupos.payload.find(g => g.idGrupo === idGrupo)?.nombre || `Grupo ${idGrupo}`
}

const enNavegador = (clavePanel, claveListas) => {
  const leerClips = () => {
    const guardados = leer(CLAVE_CLIPS, null)
    if (!guardados) return CLIPS_EJEMPLO.map(c => ({ ...c, destinos: c.destinos.map(d => ({ ...d })) }))
    return guardados.map(c => {
      const clip = ETIQUETA_EJEMPLO[c.id] ? { ...c, etiqueta: ETIQUETA_EJEMPLO[c.id] } : { ...c }
      if (!Array.isArray(clip.destinos)) clip.destinos = publico(ESTADO_ANTERIOR[clip.estado] || 'pendiente')
      delete clip.estado
      return clip
    })
  }
  const sinEspacio = { ok: false, payload: null, message: 'No hay espacio para guardar en este navegador.' }
  const noEncontrado = { ok: false, payload: null, message: 'El clip ya no existe.' }

  // Aplica un cambio a un clip y devuelve el clip actualizado
  const modificarClip = (id, cambiar) => {
    const lista = leerClips()
    const clip = lista.find(c => c.id === id)
    if (!clip) return noEncontrado
    cambiar(clip)
    return escribir(CLAVE_CLIPS, lista) ? { ok: true, payload: { ...clip } } : sinEspacio
  }

  const leerListas = () => leer(claveListas(), [])
  const guardarListas = (listas) => escribir(claveListas(), listas)

  // Clip nuevo en cada canal elegido (destinos: [idGrupo | null]): pendiente, o autorizado
  // si lo publica el coordinador general o el admin
  const armarClip = async (datos, destinos) => {
    const autor = auth.getUser() || {}
    const estado = publicaAutorizado(autor) ? 'autorizado' : 'pendiente'
    const conNombre = await Promise.all(destinos.map(async idGrupo => ({ idGrupo, nombre: await nombreCanalDe(idGrupo), estado })))
    return {
      id: nuevoId(), anotaciones: [], ...datos,
      idAutor: autor.id ?? null, tipoAutor: tipoUsuario(autor), autor: nombreDe(autor), publicadoEl: ahoraIso(),
      destinos: conNombre
    }
  }
  const guardarNuevos = (nuevos) => (escribir(CLAVE_CLIPS, [...nuevos, ...leerClips()])
    ? { ok: true, payload: { cantidad: nuevos.length, clips: nuevos } }
    : sinEspacio)

  // Lo que ve un usuario en el portal: autorizados en sus canales, los propios, y los autorizados
  // en cualquier canal donde es árbitro involucrado ("Mis clips")
  const veClip = (c) =>
    c.destinos.some(d => d.estado === 'autorizado' && puedeVerCanal(d.idGrupo)) ||
    esUsuarioActual(c.idAutor, c.tipoAutor) ||
    (estaInvolucrado(c) && c.destinos.some(d => d.estado === 'autorizado'))

  const leerColecciones = () => leer(CLAVE_COLECCIONES, [])

  return {
    obtenerPanel: async () => ({ ok: true, payload: leer(clavePanel(), null) }),
    guardarPanel: async (botones) => (escribir(clavePanel(), botones) ? { ok: true, payload: botones } : sinEspacio),

    // El canal público y el del grupo del árbitro (el coordinador, todos)
    listarCanales: async () => {
      const grupos = await listarGruposMaqueta()
      return { ok: true, payload: [{ idGrupo: null, nombre: NOMBRE_CANAL_PUBLICO }, ...grupos.payload.filter(g => puedeVerCanal(g.idGrupo))] }
    },
    listarGruposPublicacion: listarGruposMaqueta,

    listarClips: async () => ({ ok: true, payload: leerClips().filter(veClip) }),
    borrarClip: async (id) => {
      escribir(CLAVE_CLIPS, leerClips().filter(c => c.id !== id))
      return { ok: true, payload: true }
    },

    listarClipsAdmin: async () => ({ ok: true, payload: leerClips() }),
    editarClip: async ({ id, titulo, descripcion, decision, arbitros, destinos }) => modificarClip(id, (clip) => {
      Object.assign(clip, { titulo, descripcion, decision: decision || null, arbitros: arbitros || [] })
      clip.destinos = clip.destinos.map(d => {
        const cambio = destinos.find(x => String(x.idGrupo) === String(d.idGrupo))
        return cambio ? { ...d, estado: cambio.estado } : d
      })
    }),
    cambiarEstadoDestino: async (id, idGrupo, estado) => modificarClip(id, (clip) => {
      clip.destinos = clip.destinos.map(d => (String(d.idGrupo) === String(idGrupo) ? { ...d, estado } : d))
    }),
    guardarAnotaciones: async (idClip, anotaciones) => modificarClip(idClip, (clip) => { clip.anotaciones = anotaciones }),

    listarComentarios: async (idClip) => ({
      ok: true,
      payload: leer(CLAVE_COMENTARIOS, []).filter(c => c.idClip === idClip)
    }),
    agregarComentario: async (idClip, texto, segundo = null) => {
      const usuario = auth.getUser() || {}
      if (!esRolPublicador(usuario)) {
        return { ok: false, payload: null, message: 'Solo observadores, coordinadores y la coordinación general pueden comentar.' }
      }
      const comentario = {
        id: nuevoId(), idClip, idAutor: usuario.id ?? null, tipoAutor: tipoUsuario(usuario), autor: nombreDe(usuario),
        esCoordinacion: !!usuario.esAutoridad, texto, segundo, creadoEl: ahoraIso()
      }
      return escribir(CLAVE_COMENTARIOS, [...leer(CLAVE_COMENTARIOS, []), comentario])
        ? { ok: true, payload: comentario }
        : sinEspacio
    },
    borrarComentario: async (id) => {
      escribir(CLAVE_COMENTARIOS, leer(CLAVE_COMENTARIOS, []).filter(c => c.id !== id))
      return { ok: true, payload: true }
    },

    listarListas: async () => ({ ok: true, payload: leerListas() }),
    guardarLista: async ({ id, nombre }) => {
      const listas = leerListas()
      const existente = id ? listas.find(l => l.id === id) : null
      const lista = existente ? Object.assign(existente, { nombre }) : { id: nuevoId(), nombre, idsClips: [] }
      if (!existente) listas.push(lista)
      return guardarListas(listas) ? { ok: true, payload: { ...lista } } : sinEspacio
    },
    borrarLista: async (id) => {
      guardarListas(leerListas().filter(l => l.id !== id))
      return { ok: true, payload: true }
    },
    cambiarClipEnLista: async (idLista, idClip, incluir) => {
      const listas = leerListas()
      const lista = listas.find(l => l.id === idLista)
      if (!lista) return { ok: false, payload: null, message: 'La lista ya no existe.' }
      lista.idsClips = incluir
        ? [...new Set([...lista.idsClips, idClip])]
        : lista.idsClips.filter(id => id !== idClip)
      return guardarListas(listas) ? { ok: true, payload: { ...lista } } : sinEspacio
    },

    // Colecciones oficiales: las arma el coordinador general para un canal; las ve quien ve ese canal
    listarColecciones: async () => ({ ok: true, payload: leerColecciones().filter(c => puedeVerCanal(c.idGrupo)) }),
    listarColeccionesAdmin: async () => ({ ok: true, payload: leerColecciones() }),
    guardarColeccion: async ({ id, nombre, descripcion, idGrupo, idsClips }) => {
      const colecciones = leerColecciones()
      const datos = { nombre, descripcion, idGrupo, nombreCanal: await nombreCanalDe(idGrupo), idsClips, actualizadoEl: ahoraIso() }
      const existente = id ? colecciones.find(c => c.id === id) : null
      const coleccion = existente ? Object.assign(existente, datos) : { id: nuevoId(), ...datos }
      if (!existente) colecciones.push(coleccion)
      return escribir(CLAVE_COLECCIONES, colecciones) ? { ok: true, payload: { ...coleccion } } : sinEspacio
    },
    borrarColeccion: async (id) => {
      escribir(CLAVE_COLECCIONES, leerColecciones().filter(c => c.id !== id))
      return { ok: true, payload: true }
    },


    // En la maqueta no se sube nada: cada clip lleva inicio y fin dentro del video local
    publicarClips: async ({ partido, fecha, destinos, clips, alProgresar }) => {
      await new Promise(r => setTimeout(r, 900))
      alProgresar?.(1)
      const nuevos = await Promise.all(clips.map(c => armarClip({
        titulo: c.titulo, descripcion: c.descripcion, etiqueta: c.nombre, color: c.color,
        partido, fecha, inicio: c.inicio, fin: c.fin, origen: 'analisis',
        decision: c.decision || null, arbitros: c.arbitros || []
      }, destinos)))
      return guardarNuevos(nuevos)
    },

    // Video externo: un solo clip con el video entero
    publicarVideoExterno: async ({ titulo, descripcion, etiqueta, color, partido, fecha, duracion, destinos, decision, arbitros, alProgresar }) => {
      await new Promise(r => setTimeout(r, 900))
      alProgresar?.(1)
      const clip = await armarClip({
        titulo, descripcion, etiqueta, color, partido, fecha, inicio: 0, fin: duracion, origen: 'externo',
        decision: decision || null, arbitros: arbitros || []
      }, destinos)
      return guardarNuevos([clip])
    },

    // Si se modera, se comenta o se arma una colección desde otra pestaña, se avisa para recargar
    alCambiarEnOtraPestana: (alCambiar) => {
      window.addEventListener('storage', (e) => {
        if ([CLAVE_CLIPS, CLAVE_COLECCIONES].includes(e.key)) alCambiar()
      })
    }
  }
}

// clavePanel / claveListas: funciones que devuelven la clave de localStorage del usuario logueado
export const crearRepositorioClips = (clavePanel, claveListas) =>
  AAAB_TV_CON_SERVIDOR ? conServidor : enNavegador(clavePanel, claveListas)
