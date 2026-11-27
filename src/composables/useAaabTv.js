import { reactive, ref, computed, watch } from 'vue'
import { auth } from '@/api/auth'
import { crearRepositorioEventos, resumirEvento, AAAB_TV_CON_SERVIDOR } from '@/api/aaabTvEventos'
import { crearRepositorioClips, esRolPublicador, publicaAutorizado as publicaYaAutorizado } from '@/api/aaabTvClips'

// =====================================================================
// AAAB TV — Estudio de análisis de partidos + portal de clips
// ---------------------------------------------------------------------
// Los datos (eventos, panel, clips, moderación) van al backend del hosting y el video
// a la VPS, a través de api/aaabTvEventos.js y api/aaabTvClips.js. Sin servidor
// (VITE_AAAB_TV_SERVIDOR distinto de 'true') esos mismos archivos guardan todo en el navegador.
//
// Un evento es un video: el usuario decide si carga el partido completo o cada tiempo
// por separado (un evento por tiempo). Los segundos de los tags y de los clips son
// siempre del video de ese evento.
// =====================================================================

// Cada tag genera un clip de 8 segundos antes y 8 después del momento marcado
export const VENTANA_SEGUNDOS = 8

// Colores de los botones (categóricos: sirven para distinguir tags entre sí)
export const COLORES_TAG = {
  rojo: { nombre: 'Rojo', solido: '#dc2626', fondo: '#fee2e2', texto: '#991b1b' },
  naranja: { nombre: 'Naranja', solido: '#ea580c', fondo: '#ffedd5', texto: '#9a3412' },
  amarillo: { nombre: 'Amarillo', solido: '#ca8a04', fondo: '#fef9c3', texto: '#854d0e' },
  verde: { nombre: 'Verde', solido: '#16a34a', fondo: '#dcfce7', texto: '#166534' },
  azul: { nombre: 'Azul', solido: '#1d4ed8', fondo: '#dbeafe', texto: '#1e3a8a' },
  celeste: { nombre: 'Celeste', solido: '#0891b2', fondo: '#cffafe', texto: '#155e75' },
  violeta: { nombre: 'Violeta', solido: '#7c3aed', fondo: '#ede9fe', texto: '#5b21b6' },
  gris: { nombre: 'Gris', solido: '#475569', fondo: '#e2e8f0', texto: '#1e293b' },
  negro: { nombre: 'Negro', solido: '#0f172a', fondo: '#cbd5e1', texto: '#0f172a' }
}
export const colorTag = (clave) => COLORES_TAG[clave] || COLORES_TAG.gris

// Panel predeterminado: una sola lista, sin categorías ni teclas de atajo
const BOTONES_DEFECTO = [
  { id: 'progresiva', nombre: 'Progresiva', color: 'amarillo' },
  { id: 'dos-minutos', nombre: '2 minutos', color: 'naranja' },
  { id: 'red-blue-card', nombre: 'Red/Blue Card', color: 'rojo' },
  { id: 'faltas-tecnicas', nombre: 'Faltas técnicas', color: 'gris' },
  { id: 'juego-pasivo', nombre: 'Juego pasivo', color: 'negro' },
  { id: 'play-on', nombre: 'Play on', color: 'verde' },
  { id: 'siete-metros', nombre: '7 metros', color: 'violeta' },
  { id: 'body-language', nombre: 'Body language', color: 'azul' },
  { id: 'pivot-zone', nombre: 'Pivot zone', color: 'celeste' }
]

// Predeterminado anterior (con categorías). Si el panel guardado de un usuario es exactamente
// este, sin cambios, se reemplaza por el nuevo; si lo había personalizado, se respeta
const IDS_DEFECTO_ANTERIOR = 'tarjeta-amarilla,dos-minutos,descalificacion,tarjeta-azul,siete-metros,play-on,falta-ataque,juego-pasivo'
const esDefectoAnterior = (lista) =>
  Array.isArray(lista) && lista.map(b => b.id).join(',') === IDS_DEFECTO_ANTERIOR

// ─── Utilidades ──────────────────────────────────────────────────────
export const formatearTiempo = (segundos) => {
  const s = Math.max(0, Math.floor(Number(segundos) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const dos = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${dos(m)}:${dos(s % 60)}` : `${dos(m)}:${dos(s % 60)}`
}

// Inicio y fin del clip de un tag (recortado a la duración del video si se conoce)
export const limitesClip = (segundo, duracion = 0) => {
  const inicio = Math.max(0, segundo - VENTANA_SEGUNDOS)
  const fin = duracion > 0 ? Math.min(duracion, segundo + VENTANA_SEGUNDOS) : segundo + VENTANA_SEGUNDOS
  return { inicio, fin, duracion: Math.max(0, fin - inicio) }
}

const nuevoId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

const leer = (clave, defecto) => {
  try {
    const valor = JSON.parse(localStorage.getItem(clave) || 'null')
    return valor ?? defecto
  } catch {
    return defecto
  }
}
const guardar = (clave, valor) => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // Sin almacenamiento (modo privado): funciona igual, solo no se recuerda al recargar
  }
}

// ─── Estado compartido (módulo): sobrevive al cambiar de pestaña dentro del panel ───
const idUsuario = () => auth.getUser()?.id ?? 'anonimo'
const claveStorage = (nombre) => `aaabTv.${nombre}.${idUsuario()}`

// Panel de botones: sin servidor se lee al instante de este navegador; con servidor arranca con el
// predeterminado y cargarPanel() trae el del usuario (el mismo en el celular y en la computadora)
const panelDe = (lista) => (lista && !esDefectoAnterior(lista) ? lista : BOTONES_DEFECTO.map(b => ({ ...b })))
const botones = ref(panelDe(AAAB_TV_CON_SERVIDOR ? null : leer(claveStorage('panel'), null)))
let panelCargado = !AAAB_TV_CON_SERVIDOR
// Lo último guardado o leído: si el panel no cambió respecto de eso, no se vuelve a guardar
let ultimoPanel = JSON.stringify(botones.value)
let temporizadorPanel = null

const SESION_VACIA = () => ({
  partido: '',
  fecha: new Date().toISOString().slice(0, 10),
  modo: 'video',
  tags: [],
  // Reloj del modo en vivo (se guarda para no perderlo si se recarga la página)
  reloj: { corriendo: false, acumulado: 0, desde: null },
  // Segundo del video en el que se inició el cronómetro (null = todavía no se sincronizó)
  sincronizacion: null,
  // Evento guardado del que viene esta sesión (null = todavía no se guardó)
  idEvento: null,
  // Huella de lo que se guardó o abrió por última vez: si la sesión cambió, hay cambios sin guardar
  huellaGuardada: null
})
const sesion = reactive({ ...SESION_VACIA(), ...leer(claveStorage('sesion'), {}) })

// El video no se guarda: es un archivo local que se vuelve a elegir al recargar.
// El File queda fuera del estado reactivo: lo usa el recorte de clips para descargarlos
const video = reactive({ url: '', nombre: '', duracion: 0 })
let archivoVideo = null

// "Mis eventos": sesiones guardadas para retomarlas (ej. marcar en vivo hoy y cargar el video mañana).
// Con servidor se ven desde cualquier dispositivo; sin servidor, en este navegador (ver api/aaabTvEventos.js)
const repoEventos = crearRepositorioEventos(() => claveStorage('eventos'))
const eventos = ref([])          // resúmenes, de la lista
const cargandoEventos = ref(false)

watch(sesion, (v) => guardar(claveStorage('sesion'), v), { deep: true })

const copiar = (valor) => JSON.parse(JSON.stringify(valor))
const huellaDe = (s) => JSON.stringify({ partido: s.partido.trim(), fecha: s.fecha, tags: s.tags, sincronizacion: s.sincronizacion })
// Id de un evento nuevo: UUID (lo usa el servidor como clave), con respaldo si el navegador no lo tiene
const nuevoIdEvento = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : nuevoId())

// ─── Clips de AAAB TV ─────────────────────────────────────────────
// Un clip se publica en uno o más canales: el público y/o los de los grupos de la asociación.
// Cada canal ("destino") se autoriza por separado: al publicar queda "pendiente" y el coordinador
// general lo pasa a "autorizado" (se ve en ese canal) o "no_autorizado" (no se ve en ese canal).
// clase: tono de la píldora de estado (assets/css/estados.css), se usa junto con .estado-pill
export const ESTADOS_DESTINO = {
  pendiente: { etiqueta: 'Pendiente', icono: 'bi-hourglass-split', clase: 'estado-pendiente' },
  autorizado: { etiqueta: 'Autorizado', icono: 'bi-check-circle-fill', clase: 'estado-verde' },
  no_autorizado: { etiqueta: 'No autorizado', icono: 'bi-x-circle-fill', clase: 'estado-gris' }
}

// Clave del canal para selectores y comparaciones: 'publico' o 'g-<idGrupo>'
export const claveCanal = (idGrupo) => (idGrupo === null || idGrupo === undefined ? 'publico' : `g-${idGrupo}`)
// Al revés: 'publico' → null, 'g-7' → 7
export const idGrupoDeClave = (clave) => (clave === 'publico' ? null : Number(String(clave).slice(2)))

// Estado de conjunto de un clip (para la moderación): pendiente si algún canal espera revisión;
// si no, autorizado si se ve en al menos un canal; si no, no autorizado
export const estadoGeneral = (clip) => {
  const estados = (clip.destinos || []).map(d => d.estado)
  if (estados.includes('pendiente')) return 'pendiente'
  return estados.includes('autorizado') ? 'autorizado' : 'no_autorizado'
}

// Clips, moderación, comentarios, listas y panel: con servidor o en este navegador (ver api/aaabTvClips.js)
const repoClips = crearRepositorioClips(() => claveStorage('panel'), () => claveStorage('listas'))

watch(botones, (v) => {
  if (!panelCargado) return   // con servidor: no pisar el panel guardado antes de leerlo
  const json = JSON.stringify(v)
  if (json === ultimoPanel) return
  ultimoPanel = json
  clearTimeout(temporizadorPanel)
  // Con servidor se espera a que termine de editar para no mandar un pedido por cada cambio
  temporizadorPanel = setTimeout(() => repoClips.guardarPanel(copiar(v)), AAAB_TV_CON_SERVIDOR ? 800 : 0)
}, { deep: true })

const cargarPanel = async () => {
  if (panelCargado) return { ok: true, payload: botones.value }
  const res = await repoClips.obtenerPanel()
  if (!res?.ok) return res
  const lista = panelDe(Array.isArray(res.payload) ? res.payload : null)
  ultimoPanel = JSON.stringify(lista)
  botones.value = lista
  panelCargado = true
  return res
}

// Portal: los clips que el usuario puede ver (el servidor ya los filtra según sus canales)
const clipsVisibles = ref([])
const cargandoClips = ref(false)
// Canales que el usuario ve: [{ idGrupo, nombre }] (el público tiene idGrupo null)
const canales = ref([])
// Grupos en los que se puede publicar: [{ idGrupo, nombre }]
const gruposPublicacion = ref([])
// Listas de reproducción del usuario: [{ id, nombre, idsClips }]
const listasReproduccion = ref([])
// Moderación (coordinador general): todos los clips
const clipsModeracion = ref([])
const cargandoModeracion = ref(false)
// Qué vistas se cargaron alguna vez (para recargar solo esas si cambian en otra pestaña)
const vistasUsadas = { portal: false, moderacion: false }

// Videos locales de esta sesión (maqueta: el video no se sube): id del clip → URL del archivo
const videosDeSesion = reactive({})
// Subida del video al publicar: null = no hay subida; 0..1 = fracción subida
const progresoSubida = ref(null)

const cargarEn = async (destino, cargando, listar) => {
  if (cargando) cargando.value = true
  try {
    const res = await listar()
    if (res?.ok) destino.value = res.payload
    return res
  } finally {
    if (cargando) cargando.value = false
  }
}
const cargarClips = () => {
  vistasUsadas.portal = true
  return cargarEn(clipsVisibles, cargandoClips, repoClips.listarClips)
}
const cargarClipsModeracion = () => {
  vistasUsadas.moderacion = true
  return cargarEn(clipsModeracion, cargandoModeracion, repoClips.listarClipsAdmin)
}
const cargarCanales = () => cargarEn(canales, null, repoClips.listarCanales)
const cargarGruposPublicacion = () => cargarEn(gruposPublicacion, null, repoClips.listarGruposPublicacion)
const cargarListasReproduccion = () => cargarEn(listasReproduccion, null, repoClips.listarListas)

// Reemplaza un clip actualizado en las vistas cargadas
const actualizarEnVistas = (clip) => {
  for (const vista of [clipsVisibles, clipsModeracion]) {
    vista.value = vista.value.map(c => (c.id === clip.id ? { ...c, ...clip } : c))
  }
}

// Si se modera desde otra pestaña (solo en la maqueta), se recargan las vistas que se usan
repoClips.alCambiarEnOtraPestana(() => {
  if (vistasUsadas.portal) cargarClips()
  if (vistasUsadas.moderacion) cargarClipsModeracion()
})

// Reloj en vivo: se calcula con la hora real, así no se atrasa si la pestaña queda en segundo plano
const ahora = ref(Date.now())
let intervaloReloj = null
const segundosReloj = computed(() => {
  const r = sesion.reloj
  const corriendo = r.corriendo && r.desde ? (ahora.value - r.desde) / 1000 : 0
  return Math.floor(r.acumulado + corriendo)
})
const asegurarIntervalo = () => {
  if (sesion.reloj.corriendo && !intervaloReloj) intervaloReloj = setInterval(() => { ahora.value = Date.now() }, 250)
  if (!sesion.reloj.corriendo && intervaloReloj) { clearInterval(intervaloReloj); intervaloReloj = null }
}
asegurarIntervalo()

export function useAaabTv() {
  // ─── Mi panel ─────────────────────────────────────────────
  const agregarBoton = ({ nombre, color }) => {
    botones.value.push({ id: nuevoId(), nombre: nombre.trim(), color })
    return { ok: true }
  }
  const editarBoton = (id, { nombre, color }) => {
    const boton = botones.value.find(b => b.id === id)
    if (boton) Object.assign(boton, { nombre: nombre.trim(), color })
    return { ok: true }
  }
  const borrarBoton = (id) => { botones.value = botones.value.filter(b => b.id !== id) }
  const restablecerBotones = () => { botones.value = BOTONES_DEFECTO.map(b => ({ ...b })) }

  // ─── Video del partido ───────────────────────────────────
  const cargarVideo = (archivo) => {
    if (video.url) URL.revokeObjectURL(video.url)
    video.url = URL.createObjectURL(archivo)
    video.nombre = archivo.name
    video.duracion = 0
    archivoVideo = archivo
  }
  const archivoDelVideo = () => archivoVideo

  // ─── Tags ─────────────────────────────────────────────────
  // En modo video el segundo es el del video; en vivo, el del cronómetro (se pasa al video al sincronizar)
  const marcarTag = (boton, segundoVideo = null) => {
    const enVivo = sesion.modo === 'vivo'
    const segundoRelojActual = enVivo ? segundosReloj.value : null
    const segundo = enVivo
      ? (sesion.sincronizacion !== null ? segundoRelojActual + sesion.sincronizacion : null)
      : Math.floor(segundoVideo ?? 0)
    const tag = {
      id: nuevoId(),
      idBoton: boton.id,
      nombre: boton.nombre,
      color: boton.color,
      origen: enVivo ? 'vivo' : 'video',
      segundoReloj: segundoRelojActual,
      segundo,
      titulo: boton.nombre,
      descripcion: '',
      seleccionado: true,
      publicado: false
    }
    sesion.tags.push(tag)
    return tag
  }
  const borrarTag = (id) => { sesion.tags = sesion.tags.filter(t => t.id !== id) }

  // Ajuste fino de un tag (±1 s) por si se marcó un poco antes o después
  const moverTag = (id, delta) => {
    const tag = sesion.tags.find(t => t.id === id)
    if (!tag || tag.segundo === null) return
    tag.segundo = Math.max(0, tag.segundo + delta)
  }

  const tagsOrdenados = computed(() =>
    [...sesion.tags].sort((a, b) => (a.segundo ?? a.segundoReloj ?? 0) - (b.segundo ?? b.segundoReloj ?? 0))
  )
  const tagsSinSincronizar = computed(() => sesion.tags.filter(t => t.segundo === null))

  // ─── Cronómetro en vivo ───────────────────────────────────
  const iniciarReloj = () => {
    if (sesion.reloj.corriendo) return
    sesion.reloj.corriendo = true
    sesion.reloj.desde = Date.now()
    ahora.value = Date.now()
    asegurarIntervalo()
  }
  const pausarReloj = () => {
    if (!sesion.reloj.corriendo) return
    sesion.reloj.acumulado = segundosReloj.value
    sesion.reloj.corriendo = false
    sesion.reloj.desde = null
    asegurarIntervalo()
  }
  const reiniciarReloj = () => {
    sesion.reloj = { corriendo: false, acumulado: 0, desde: null }
    asegurarIntervalo()
  }

  // Cronómetro → video: el segundo del video en el que arrancó el cronómetro.
  // Alcanza con un solo punto porque cada evento es un solo video: el partido completo, o un
  // tiempo si el usuario carga cada tiempo como un evento aparte (con su propio cronómetro).
  const sincronizar = (segundoInicioEnVideo) => {
    const offset = Math.max(0, Math.floor(segundoInicioEnVideo))
    sesion.sincronizacion = offset
    sesion.tags.forEach(t => {
      if (t.origen === 'vivo' && t.segundoReloj !== null) t.segundo = t.segundoReloj + offset
    })
  }

  const nuevaSesion = () => {
    Object.assign(sesion, SESION_VACIA())
    asegurarIntervalo()
  }

  // ─── Eventos guardados ────────────────────────────────────
  // Hay cambios sin guardar si la sesión tiene tags y difiere de lo último que se guardó o abrió
  const hayCambiosSinGuardar = computed(() => sesion.tags.length > 0 && huellaDe(sesion) !== sesion.huellaGuardada)

  const cargarEventos = async () => {
    cargandoEventos.value = true
    try {
      const res = await repoEventos.listar()
      if (res?.ok) eventos.value = res.payload
      return res
    } finally {
      cargandoEventos.value = false
    }
  }

  // Guarda (o actualiza) la sesión actual como evento. El cronómetro se guarda en pausa,
  // con el tiempo que llevaba: al abrir el evento se puede seguir desde ahí.
  // Devuelve { ok, payload: evento guardado, message }
  const guardarEvento = async () => {
    const evento = {
      id: sesion.idEvento || nuevoIdEvento(),
      partido: sesion.partido.trim(),
      fecha: sesion.fecha,
      modo: sesion.modo,
      tags: copiar(sesion.tags),
      reloj: { acumulado: segundosReloj.value },
      sincronizacion: sesion.sincronizacion
    }
    // La huella es la de lo que se manda (si se marca un tag mientras guarda, queda como cambio sin guardar)
    const huella = huellaDe(evento)
    const res = await repoEventos.guardar(evento)
    if (!res?.ok) return res
    const guardado = res.payload?.id ? res.payload : evento
    sesion.idEvento = guardado.id
    sesion.huellaGuardada = huella
    eventos.value = [resumirEvento(guardado), ...eventos.value.filter(e => e.id !== guardado.id)]
    return { ok: true, payload: guardado }
  }

  // Trae el evento completo y lo deja como sesión actual. Devuelve { ok, payload: evento, message }
  const abrirEvento = async (id) => {
    const res = await repoEventos.obtener(id)
    if (!res?.ok || !res.payload) return { ok: false, message: res?.message || 'No se pudo abrir el evento.' }
    const ev = res.payload
    Object.assign(sesion, SESION_VACIA(), {
      partido: ev.partido || '',
      fecha: ev.fecha || '',
      modo: ev.modo === 'vivo' ? 'vivo' : 'video',
      tags: Array.isArray(ev.tags) ? ev.tags : [],
      reloj: { corriendo: false, acumulado: Number(ev.reloj?.acumulado) || 0, desde: null },
      sincronizacion: Number.isFinite(ev.sincronizacion) ? ev.sincronizacion : null,
      idEvento: ev.id
    })
    sesion.huellaGuardada = huellaDe(sesion)
    asegurarIntervalo()
    return { ok: true, payload: ev }
  }

  const borrarEvento = async (id) => {
    const res = await repoEventos.borrar(id)
    if (!res?.ok) return res
    eventos.value = eventos.value.filter(e => e.id !== id)
    if (sesion.idEvento === id) Object.assign(sesion, { idEvento: null, huellaGuardada: null })
    return res
  }

  // ─── Publicación ──────────────────────────────────────────
  // Con servidor: se sube a la VPS el video cargado en este evento (el partido completo o un
  // tiempo, lo que haya elegido el usuario) y el hosting registra los clips; la VPS los corta.
  // Devuelve { ok, payload: cantidad de clips, message }
  // destinos: canales elegidos, [idGrupo | null] (null = canal público)
  const publicarClips = async ({ partido, fecha, destinos, clips }) => {
    if (!puedePublicar.value) return { ok: false, message: 'Solo coordinadores y observadores pueden publicar.' }
    if (!archivoVideo) return { ok: false, message: 'Cargá el video para poder publicar los clips.' }
    if (!destinos?.length) return { ok: false, message: 'Elegí al menos un canal.' }
    progresoSubida.value = 0
    try {
      const res = await repoClips.publicarClips({
        archivo: archivoVideo,
        partido,
        fecha,
        destinos,
        idEvento: sesion.idEvento,
        clips: clips.map(c => ({
          ...c,
          titulo: c.titulo.trim(),
          descripcion: c.descripcion.trim(),
          // inicio y fin los usa la maqueta; con servidor los calcula el hosting a partir del segundo
          ...limitesClip(c.segundo, video.duracion)
        })),
        alProgresar: (fraccion) => { progresoSubida.value = fraccion }
      })
      if (!res?.ok) return res
      const nuevos = Array.isArray(res.payload?.clips) ? res.payload.clips : []
      // En la maqueta el clip se ve con el video local de esta sesión
      if (!AAAB_TV_CON_SERVIDOR) nuevos.forEach(c => { videosDeSesion[c.id] = video.url })
      clipsVisibles.value = [...nuevos, ...clipsVisibles.value.filter(c => !nuevos.some(n => n.id === c.id))]
      clips.forEach(c => {
        const tag = sesion.tags.find(t => t.id === c.id)
        if (tag) { tag.publicado = true; tag.seleccionado = false }
      })
      return { ok: true, payload: res.payload?.cantidad ?? nuevos.length }
    } finally {
      progresoSubida.value = null
    }
  }

  // Video externo (pestaña "Subir video"): una jugada que llegó por fuera del análisis, por ejemplo
  // por WhatsApp. Se sube entero y queda como un solo clip, pendiente en cada canal elegido.
  // archivo: File del video; duracion: segundos (la lee el navegador). Devuelve { ok, payload: clip, message }
  const publicarVideoExterno = async ({ archivo, titulo, descripcion, etiqueta, color, partido, fecha, duracion, destinos }) => {
    if (!puedePublicar.value) return { ok: false, message: 'Solo coordinadores y observadores pueden subir videos.' }
    if (!destinos?.length) return { ok: false, message: 'Elegí al menos un canal.' }
    progresoSubida.value = 0
    try {
      const res = await repoClips.publicarVideoExterno({
        archivo,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        etiqueta,
        color,
        partido: partido.trim(),
        fecha,
        duracion: Math.floor(duracion),
        destinos,
        alProgresar: (fraccion) => { progresoSubida.value = fraccion }
      })
      if (!res?.ok) return res
      const clip = res.payload?.clips?.[0]
      if (!clip) return { ok: true, payload: null }
      // En la maqueta el clip se ve con el archivo local de esta sesión
      if (!AAAB_TV_CON_SERVIDOR) videosDeSesion[clip.id] = URL.createObjectURL(archivo)
      clipsVisibles.value = [clip, ...clipsVisibles.value.filter(c => c.id !== clip.id)]
      return { ok: true, payload: clip }
    } finally {
      progresoSubida.value = null
    }
  }

  // El autor borra su clip mientras está pendiente
  const borrarClipPublicado = async (id) => {
    const res = await repoClips.borrarClip(id)
    if (res?.ok) clipsVisibles.value = clipsVisibles.value.filter(c => c.id !== id)
    return res
  }

  // ─── Permisos y reproducción ──────────────────────────────
  const puedePublicar = computed(() => esRolPublicador())
  // El coordinador general (o el admin) no pasa por la autorización: lo suyo sale autorizado
  const publicaAutorizado = computed(() => publicaYaAutorizado())

  // Qué reproducir de un clip: si el servidor ya lo cortó, el archivo del clip entero;
  // si no (maqueta), el tramo [inicio, fin] del video local de esta sesión
  const tramoDe = (clip) => (clip.urlVideo
    ? { url: clip.urlVideo, inicio: 0, fin: Math.max(0, clip.fin - clip.inicio) }
    : { url: videosDeSesion[clip.id] || '', inicio: clip.inicio, fin: clip.fin })

  // ─── Moderación (coordinador general) ─────────────────────
  // Devuelven { ok, payload: clip actualizado, message }
  const cambiarEstadoDestino = async (id, idGrupo, estado) => {
    if (!ESTADOS_DESTINO[estado]) return { ok: false, message: 'Estado no válido.' }
    const res = await repoClips.cambiarEstadoDestino(id, idGrupo, estado)
    if (res?.ok && res.payload?.id) actualizarEnVistas(res.payload)
    return res
  }
  // destinos: [{ idGrupo, estado }]
  const editarClip = async (id, { titulo, descripcion, destinos }) => {
    const res = await repoClips.editarClip({ id, titulo: titulo.trim(), descripcion: descripcion.trim(), destinos })
    if (res?.ok && res.payload?.id) actualizarEnVistas(res.payload)
    return res
  }

  // ─── Comentarios de un clip ───────────────────────────────
  // El coordinador general comenta desde la moderación; los demás desde el portal
  const listarComentarios = (idClip) => repoClips.listarComentarios(idClip)
  const agregarComentario = (idClip, texto) => repoClips.agregarComentario(idClip, texto.trim())
  const borrarComentario = (id) => repoClips.borrarComentario(id)

  // ─── Listas de reproducción (de cada usuario) ─────────────
  const crearListaReproduccion = async (nombre) => {
    const res = await repoClips.guardarLista({ nombre: nombre.trim() })
    if (res?.ok) listasReproduccion.value = [...listasReproduccion.value, res.payload]
    return res
  }
  const borrarListaReproduccion = async (id) => {
    const res = await repoClips.borrarLista(id)
    if (res?.ok) listasReproduccion.value = listasReproduccion.value.filter(l => l.id !== id)
    return res
  }
  // incluir: true agrega el clip a la lista, false lo saca
  const cambiarClipEnLista = async (idLista, idClip, incluir) => {
    const res = await repoClips.cambiarClipEnLista(idLista, idClip, incluir)
    if (res?.ok && res.payload?.id) {
      listasReproduccion.value = listasReproduccion.value.map(l => (l.id === idLista ? res.payload : l))
    }
    return res
  }

  return {
    botones, sesion, video,
    segundosReloj, tagsOrdenados, tagsSinSincronizar,
    cargarPanel, agregarBoton, editarBoton, borrarBoton, restablecerBotones,
    cargarVideo, archivoDelVideo, marcarTag, borrarTag, moverTag,
    iniciarReloj, pausarReloj, reiniciarReloj, sincronizar, nuevaSesion,
    eventos, cargandoEventos, cargarEventos, hayCambiosSinGuardar, guardarEvento, abrirEvento, borrarEvento,
    gruposPublicacion, cargarGruposPublicacion, publicarClips, publicarVideoExterno, progresoSubida, borrarClipPublicado,
    puedePublicar, publicaAutorizado, clipsVisibles, cargandoClips, cargarClips, canales, cargarCanales, tramoDe,
    clipsModeracion, cargandoModeracion, cargarClipsModeracion, cambiarEstadoDestino, editarClip,
    listarComentarios, agregarComentario, borrarComentario,
    listasReproduccion, cargarListasReproduccion, crearListaReproduccion, borrarListaReproduccion, cambiarClipEnLista
  }
}
