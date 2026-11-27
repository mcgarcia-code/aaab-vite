import { reactive, ref, computed, watch, markRaw } from 'vue'
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

// Inicio y fin del clip de un tag (recortado a la duración del video si se conoce).
// antes / despues: segundos antes y después del momento marcado (cada tag puede ajustarlos)
export const limitesClip = (segundo, duracion = 0, antes = VENTANA_SEGUNDOS, despues = VENTANA_SEGUNDOS) => {
  const inicio = Math.max(0, segundo - antes)
  const fin = duracion > 0 ? Math.min(duracion, segundo + despues) : segundo + despues
  return { inicio, fin, duracion: Math.max(0, fin - inicio) }
}
// Los límites de un tag con su propio ajuste (los tags viejos no lo tienen: 8 y 8)
export const limitesDeTag = (tag, duracion = 0) =>
  limitesClip(tag.segundo, duracion, tag.antes ?? VENTANA_SEGUNDOS, tag.despues ?? VENTANA_SEGUNDOS)
// Rango permitido al ajustar cuánto dura un clip antes y después del momento marcado
export const AJUSTE_MINIMO = 1
export const AJUSTE_MAXIMO = 60

// Valoración de la decisión arbitral que muestra el clip (para estadísticas y "Mis clips")
export const DECISIONES = {
  correcta: { etiqueta: 'Correcta', icono: 'bi-check-circle-fill', clase: 'estado-verde' },
  incorrecta: { etiqueta: 'Incorrecta', icono: 'bi-x-octagon-fill', clase: 'estado-rojo' },
  a_revisar: { etiqueta: 'A revisar', icono: 'bi-question-circle-fill', clase: 'estado-pendiente' }
}

// Datos de la jugada de un clip (todos opcionales): dónde pasó, qué equipo, qué sanción se aplicó
// y cuál correspondía. Sirven para filtrar y para las estadísticas
export const ZONAS_CANCHA = {
  area: 'Área de 6 m',
  entre_6_9: 'Entre 6 y 9 m',
  mas_9: 'Más de 9 m',
  mitad: 'Mitad de cancha / contraataque',
  cambios: 'Zona de cambios / banco'
}
export const EQUIPOS = {
  local: 'Local',
  visitante: 'Visitante'
}
export const SANCIONES = {
  ninguna: 'Sin sanción',
  ventaja: 'Ventaja',
  tiro_libre: 'Tiro libre',
  siete_metros: '7 metros',
  pasivo: 'Juego pasivo',
  amonestacion: 'Amonestación (amarilla)',
  exclusion: '2 minutos',
  descalificacion: 'Descalificación (roja)',
  descalificacion_informe: 'Descalificación con informe (azul)'
}
export const JUGADA_VACIA = () => ({ zona: null, equipo: null, sancion: null, sancionCorrecta: null })
// Texto corto de la jugada para mostrar ("Área de 6 m · Local · 2 minutos (correspondía: Descalificación)")
export const resumenJugada = (jugada) => {
  if (!jugada) return ''
  const partes = [ZONAS_CANCHA[jugada.zona], EQUIPOS[jugada.equipo], SANCIONES[jugada.sancion]].filter(Boolean)
  const distinta = jugada.sancionCorrecta && jugada.sancionCorrecta !== jugada.sancion
  return `${partes.join(' · ')}${distinta ? ` (correspondía: ${SANCIONES[jugada.sancionCorrecta]})` : ''}`
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
// Las autoridades (usuarios_admin) pueden tener el mismo id que un árbitro: sus claves llevan "admin-".
// Los árbitros conservan la clave de siempre, para no perder lo que ya tenían guardado
const idUsuario = () => {
  const usuario = auth.getUser()
  if (!usuario) return 'anonimo'
  return usuario.esAutoridad ? `admin-${usuario.id}` : usuario.id
}
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
  modo: 'vivo',
  tags: [],
  // Reloj del modo en vivo (se guarda para no perderlo si se recarga la página).
  // inicioReal: hora (ms) del pitazo con el que se inició. Los tags se ubican con la hora real desde
  // ese pitazo, así pausar el cronómetro (tiempo muerto) no corre los clips: el video sigue grabando
  reloj: { corriendo: false, acumulado: 0, desde: null, inicioReal: null },
  // Segundo del video en el que se inició el cronómetro (null = todavía no se sincronizó)
  sincronizacion: null,
  // Cámaras extra del mismo partido (otro ángulo): [{ id, nombre, desfase, nombreArchivo }].
  // desfase: segundo de esa cámara cuando la principal está en 0 (null = todavía no se sincronizó).
  // Se guardan con el evento; el archivo no (es local): al reabrirlo se vuelve a elegir y la
  // sincronización se conserva. Al publicar, cada clip lleva también esos ángulos
  camaras: [],
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

// Archivos de las cámaras extra de esta sesión (no se guardan): id de la cámara → { url, archivo }
const archivosCamara = reactive({})
const soltarArchivosCamara = () => {
  Object.keys(archivosCamara).forEach(id => {
    URL.revokeObjectURL(archivosCamara[id].url)
    delete archivosCamara[id]
  })
}

// "Mis eventos": sesiones guardadas para retomarlas (ej. marcar en vivo hoy y cargar el video mañana).
// Con servidor se ven desde cualquier dispositivo; sin servidor, en este navegador (ver api/aaabTvEventos.js)
const repoEventos = crearRepositorioEventos(() => claveStorage('eventos'))
const eventos = ref([])          // resúmenes, de la lista
const cargandoEventos = ref(false)

watch(sesion, (v) => guardar(claveStorage('sesion'), v), { deep: true })

const copiar = (valor) => JSON.parse(JSON.stringify(valor))
const huellaDe = (s) => JSON.stringify({
  partido: s.partido.trim(), fecha: s.fecha, tags: s.tags, sincronizacion: s.sincronizacion,
  camaras: (s.camaras || []).map(c => ({ nombre: c.nombre, desfase: c.desfase }))
})
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

// Guardado del panel: 'guardado' | 'guardando' | 'error' (si falla se avisa y se puede reintentar)
const estadoPanel = ref('guardado')
const guardarPanelAhora = async () => {
  clearTimeout(temporizadorPanel)
  estadoPanel.value = 'guardando'
  const res = await repoClips.guardarPanel(copiar(botones.value))
  estadoPanel.value = res?.ok ? 'guardado' : 'error'
  if (res?.ok) ultimoPanel = JSON.stringify(botones.value)
  return res
}

watch(botones, (v) => {
  if (!panelCargado) return   // con servidor: no pisar el panel guardado antes de leerlo
  if (JSON.stringify(v) === ultimoPanel) return
  clearTimeout(temporizadorPanel)
  estadoPanel.value = 'guardando'
  // Con servidor se espera a que termine de editar para no mandar un pedido por cada cambio
  temporizadorPanel = setTimeout(guardarPanelAhora, AAAB_TV_CON_SERVIDOR ? 800 : 0)
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
// Colecciones oficiales: las del portal (de los canales que ve) y todas, para el coordinador general
const colecciones = ref([])
const coleccionesAdmin = ref([])
// Qué vistas se cargaron alguna vez (para recargar solo esas si cambian en otra pestaña)
const vistasUsadas = { portal: false, moderacion: false }

// Videos locales de esta sesión (maqueta: el video no se sube): id del clip → URL del archivo
const videosDeSesion = reactive({})
// Clips cuya vista ya se registró en esta pestaña (para no mandarla de nuevo cada vez que se abre)
const vistasRegistradas = new Set()
// Subida del video al publicar: null = no hay subida; 0..1 = fracción subida
const progresoSubida = ref(null)
// Subida en curso: se puede cancelar (se detiene después de la parte que está subiendo)
let controlSubida = null
// Mientras se sube un video, cerrar o recargar la pestaña pide confirmación
const avisarAlSalir = (e) => {
  e.preventDefault()
  e.returnValue = ''
}
watch(progresoSubida, (valor, anterior) => {
  if (valor !== null && anterior === null) window.addEventListener('beforeunload', avisarAlSalir)
  if (valor === null && anterior !== null) window.removeEventListener('beforeunload', avisarAlSalir)
})

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
const cargarColecciones = () => cargarEn(colecciones, null, repoClips.listarColecciones)
const cargarColeccionesAdmin = () => cargarEn(coleccionesAdmin, null, repoClips.listarColeccionesAdmin)

// Reemplaza un clip actualizado en las vistas cargadas
const actualizarEnVistas = (clip) => {
  for (const vista of [clipsVisibles, clipsModeracion]) {
    vista.value = vista.value.map(c => (c.id === clip.id ? { ...c, ...clip } : c))
  }
}

// Si se modera desde otra pestaña (solo en la maqueta), se recargan las vistas que se usan
repoClips.alCambiarEnOtraPestana(() => {
  if (vistasUsadas.portal) { cargarClips(); cargarColecciones() }
  if (vistasUsadas.moderacion) { cargarClipsModeracion(); cargarColeccionesAdmin() }
})

// Reloj en vivo: se calcula con la hora real, así no se atrasa si la pestaña queda en segundo plano
const ahora = ref(Date.now())
let intervaloReloj = null
const segundosReloj = computed(() => {
  const r = sesion.reloj
  const corriendo = r.corriendo && r.desde ? (ahora.value - r.desde) / 1000 : 0
  return Math.floor(r.acumulado + corriendo)
})
// Segundos reales desde el pitazo (incluye las pausas del cronómetro); sin hora real, los del cronómetro
const segundosRealesAhora = () => (sesion.reloj.inicioReal
  ? Math.max(0, Math.floor((Date.now() - sesion.reloj.inicioReal) / 1000))
  : segundosReloj.value)
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

  // ─── Cámaras extra ────────────────────────────────────────
  // Le asigna (o vuelve a asignar, al reabrir un evento) el archivo de video a una cámara
  const cargarArchivoCamara = (id, archivo) => {
    if (archivosCamara[id]) URL.revokeObjectURL(archivosCamara[id].url)
    archivosCamara[id] = { url: URL.createObjectURL(archivo), archivo: markRaw(archivo) }
    const camara = sesion.camaras.find(c => c.id === id)
    if (camara) camara.nombreArchivo = archivo.name
  }
  const agregarCamara = (archivo) => {
    const id = nuevoId()
    sesion.camaras.push({ id, nombre: `Cámara ${sesion.camaras.length + 2}`, desfase: null, nombreArchivo: archivo.name })
    cargarArchivoCamara(id, archivo)
  }
  const quitarCamara = (id) => {
    if (archivosCamara[id]) URL.revokeObjectURL(archivosCamara[id].url)
    delete archivosCamara[id]
    sesion.camaras = sesion.camaras.filter(c => c.id !== id)
  }
  // El archivo cargado de una cámara en esta sesión ({ url, archivo }), o null si falta elegirlo
  const archivoCamara = (id) => archivosCamara[id] || null
  // segundoCamara: lo que muestra esa cámara en el mismo instante en que la principal está en segundoPrincipal
  const sincronizarCamara = (id, segundoCamara, segundoPrincipal) => {
    const camara = sesion.camaras.find(c => c.id === id)
    if (camara) camara.desfase = Math.round((segundoCamara - segundoPrincipal) * 10) / 10
  }

  // ─── Tags ─────────────────────────────────────────────────
  // En modo video el segundo es el del video; en vivo, los segundos reales desde el pitazo
  // (se pasan al video al sincronizar)
  const marcarTag = (boton, segundoVideo = null) => {
    const enVivo = sesion.modo === 'vivo'
    const segundoRelojActual = enVivo ? segundosReloj.value : null
    const segundoReal = enVivo ? segundosRealesAhora() : null
    const segundo = enVivo
      ? (sesion.sincronizacion !== null ? segundoReal + sesion.sincronizacion : null)
      : Math.floor(segundoVideo ?? 0)
    const tag = {
      id: nuevoId(),
      idBoton: boton.id,
      nombre: boton.nombre,
      color: boton.color,
      origen: enVivo ? 'vivo' : 'video',
      segundoReloj: segundoRelojActual,
      segundoReal,
      segundo,
      antes: VENTANA_SEGUNDOS,
      despues: VENTANA_SEGUNDOS,
      titulo: boton.nombre,
      descripcion: '',
      decision: null,
      arbitros: [],
      seleccionado: true,
      publicado: false
    }
    sesion.tags.push(tag)
    return tag
  }

  // Valores exactos para un tag (lo usa la línea de tiempo al arrastrar): el momento marcado
  // y/o cuántos segundos antes y después dura el clip, siempre dentro de los límites permitidos
  const fijarTag = (id, { segundo, antes, despues }) => {
    const tag = sesion.tags.find(t => t.id === id)
    if (!tag || tag.segundo === null) return
    const acotar = (v) => Math.min(AJUSTE_MAXIMO, Math.max(AJUSTE_MINIMO, Math.round(v)))
    if (segundo !== undefined) tag.segundo = Math.max(0, Math.round(segundo))
    if (antes !== undefined) tag.antes = acotar(antes)
    if (despues !== undefined) tag.despues = acotar(despues)
  }

  // Ajuste del inicio o del fin de un clip: cuántos segundos antes y después del momento marcado
  const ajustarTag = (id, campo, delta) => {
    const tag = sesion.tags.find(t => t.id === id)
    if (!tag || !['antes', 'despues'].includes(campo)) return
    const actual = tag[campo] ?? VENTANA_SEGUNDOS
    tag[campo] = Math.min(AJUSTE_MAXIMO, Math.max(AJUSTE_MINIMO, actual + delta))
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
    // Primer inicio (o un evento viejo sin hora real): el pitazo fue hace "acumulado" segundos
    if (!sesion.reloj.inicioReal) sesion.reloj.inicioReal = Date.now() - (sesion.reloj.acumulado || 0) * 1000
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
    sesion.reloj = { corriendo: false, acumulado: 0, desde: null, inicioReal: null }
    asegurarIntervalo()
  }

  // Cronómetro → video: el segundo del video en el que arrancó el cronómetro (el pitazo).
  // Alcanza con un solo punto porque cada evento es un solo video y los tags usan la hora real desde
  // el pitazo (las pausas del cronómetro no los corren). Los tags viejos sin hora real usan el cronómetro.
  const sincronizar = (segundoInicioEnVideo) => {
    const offset = Math.max(0, Math.floor(segundoInicioEnVideo))
    sesion.sincronizacion = offset
    sesion.tags.forEach(t => {
      const base = t.segundoReal ?? t.segundoReloj
      if (t.origen === 'vivo' && base !== null && base !== undefined) t.segundo = base + offset
    })
  }

  const nuevaSesion = () => {
    soltarArchivosCamara()
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
      reloj: { acumulado: segundosReloj.value, inicioReal: sesion.reloj.inicioReal },
      sincronizacion: sesion.sincronizacion,
      camaras: copiar(sesion.camaras)
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
    // Las cámaras vuelven con su nombre y su sincronización; los archivos se eligen de nuevo
    soltarArchivosCamara()
    Object.assign(sesion, SESION_VACIA(), {
      camaras: Array.isArray(ev.camaras) ? ev.camaras.map(c => ({ ...c })) : [],
      partido: ev.partido || '',
      fecha: ev.fecha || '',
      modo: ev.modo === 'vivo' ? 'vivo' : 'video',
      tags: Array.isArray(ev.tags) ? ev.tags : [],
      reloj: { corriendo: false, acumulado: Number(ev.reloj?.acumulado) || 0, desde: null, inicioReal: Number(ev.reloj?.inicioReal) || null },
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
    controlSubida = { cancelado: false }
    try {
      // Solo las cámaras sincronizadas y con su archivo elegido: sin eso no se sabe qué cortar
      const camarasListas = sesion.camaras
        .filter(c => c.desfase !== null && archivosCamara[c.id])
        .map(c => ({ ...c, ...archivosCamara[c.id] }))
      const res = await repoClips.publicarClips({
        archivo: archivoVideo,
        camaras: camarasListas.map(c => ({ archivo: c.archivo, nombre: c.nombre, desfase: c.desfase })),
        partido,
        fecha,
        destinos,
        idEvento: sesion.idEvento,
        clips: clips.map(c => ({
          ...c,
          titulo: c.titulo.trim(),
          descripcion: (c.descripcion || '').trim(),
          // Inicio y fin ya ajustados por el usuario (antes / después del momento marcado)
          ...limitesDeTag(c, video.duracion)
        })),
        alProgresar: (fraccion) => { progresoSubida.value = fraccion },
        control: controlSubida
      })
      if (!res?.ok) return res
      const nuevos = Array.isArray(res.payload?.clips) ? res.payload.clips : []
      // En la maqueta el clip se ve con los videos locales de esta sesión (la principal y las cámaras)
      if (!AAAB_TV_CON_SERVIDOR) {
        nuevos.forEach(c => {
          videosDeSesion[c.id] = {
            url: video.url,
            angulos: camarasListas.map(cam => ({ nombre: cam.nombre, url: cam.url, desfase: cam.desfase }))
          }
        })
      }
      clipsVisibles.value = [...nuevos, ...clipsVisibles.value.filter(c => !nuevos.some(n => n.id === c.id))]
      clips.forEach(c => {
        const tag = sesion.tags.find(t => t.id === c.id)
        if (tag) { tag.publicado = true; tag.seleccionado = false }
      })
      return { ok: true, payload: res.payload?.cantidad ?? nuevos.length }
    } finally {
      progresoSubida.value = null
      controlSubida = null
    }
  }

  // Video externo (pestaña "Subir video"): una jugada que llegó por fuera del análisis, por ejemplo
  // por WhatsApp. Se sube entero y queda como un solo clip, pendiente en cada canal elegido.
  // archivo: File del video; duracion: segundos (la lee el navegador). Devuelve { ok, payload: clip, message }
  const publicarVideoExterno = async ({ archivo, titulo, descripcion, etiqueta, color, partido, fecha, duracion, destinos, decision, arbitros, jugada }) => {
    if (!puedePublicar.value) return { ok: false, message: 'Solo coordinadores y observadores pueden subir videos.' }
    if (!destinos?.length) return { ok: false, message: 'Elegí al menos un canal.' }
    progresoSubida.value = 0
    controlSubida = { cancelado: false }
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
        decision,
        arbitros,
        jugada,
        alProgresar: (fraccion) => { progresoSubida.value = fraccion },
        control: controlSubida
      })
      if (!res?.ok) return res
      const clip = res.payload?.clips?.[0]
      if (!clip) return { ok: true, payload: null }
      // En la maqueta el clip se ve con el archivo local de esta sesión
      if (!AAAB_TV_CON_SERVIDOR) videosDeSesion[clip.id] = { url: URL.createObjectURL(archivo), angulos: [] }
      clipsVisibles.value = [clip, ...clipsVisibles.value.filter(c => c.id !== clip.id)]
      return { ok: true, payload: clip }
    } finally {
      progresoSubida.value = null
      controlSubida = null
    }
  }

  // Cancela la subida en curso (se detiene después de la parte que está subiendo)
  const cancelarSubida = () => {
    if (controlSubida) controlSubida.cancelado = true
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

  // Qué reproducir de un clip, para ReproductorClip:
  // - con servidor: el clip ya cortado (de 0 a su duración), en HLS si hay y si no en MP4, con sus ángulos
  // - en la maqueta: el tramo [inicio, fin] del video local de esta sesión (y de las cámaras, con su desfase)
  // procesando: la VPS todavía lo está cortando
  const tramoDe = (clip) => {
    const duracion = Math.max(0, clip.fin - clip.inicio)
    if (clip.urlVideo || clip.urlHls) {
      return {
        url: clip.urlVideo || '',
        urlHls: clip.urlHls || '',
        inicio: 0,
        fin: duracion,
        procesando: false,
        angulos: (clip.angulos || []).map(a => ({ nombre: a.nombre, url: a.urlVideo || '', urlHls: a.urlHls || '', inicio: 0, fin: duracion }))
      }
    }
    const local = videosDeSesion[clip.id]
    return {
      url: local?.url || '',
      urlHls: '',
      inicio: clip.inicio,
      fin: clip.fin,
      procesando: AAAB_TV_CON_SERVIDOR && clip.procesado === false,
      angulos: (local?.angulos || []).map(a => ({ nombre: a.nombre, url: a.url, urlHls: '', inicio: clip.inicio + a.desfase, fin: clip.fin + a.desfase }))
    }
  }

  // ─── Moderación (coordinador general) ─────────────────────
  // Devuelven { ok, payload: clip actualizado, message }
  const cambiarEstadoDestino = async (id, idGrupo, estado) => {
    if (!ESTADOS_DESTINO[estado]) return { ok: false, message: 'Estado no válido.' }
    const res = await repoClips.cambiarEstadoDestino(id, idGrupo, estado)
    if (res?.ok && res.payload?.id) actualizarEnVistas(res.payload)
    return res
  }
  // destinos: [{ idGrupo, estado }]; decision: clave de DECISIONES o null; arbitros: [{ id, nombre }]
  const editarClip = async (id, { titulo, descripcion, decision, arbitros, jugada, destinos }) => {
    const res = await repoClips.editarClip({
      id, titulo: titulo.trim(), descripcion: descripcion.trim(), decision: decision || null, arbitros: arbitros || [],
      jugada: jugada || null, destinos
    })
    if (res?.ok && res.payload?.id) actualizarEnVistas(res.payload)
    return res
  }

  // ─── Dibujos sobre el video (anotaciones del clip) ────────
  // Los guarda el autor del clip o el coordinador general. Devuelve { ok, payload: clip, message }
  const guardarAnotaciones = async (idClip, anotaciones) => {
    const res = await repoClips.guardarAnotaciones(idClip, anotaciones)
    if (res?.ok && res.payload?.id) actualizarEnVistas(res.payload)
    return res
  }

  // ─── Colecciones oficiales (las arma el coordinador general) ───
  const guardarColeccion = async (datos) => {
    const res = await repoClips.guardarColeccion({ ...datos, nombre: datos.nombre.trim(), descripcion: (datos.descripcion || '').trim() })
    if (res?.ok && res.payload?.id) {
      coleccionesAdmin.value = [res.payload, ...coleccionesAdmin.value.filter(c => c.id !== res.payload.id)]
    }
    return res
  }
  const borrarColeccion = async (id) => {
    const res = await repoClips.borrarColeccion(id)
    if (res?.ok) coleccionesAdmin.value = coleccionesAdmin.value.filter(c => c.id !== id)
    return res
  }


  // ─── Comentarios de un clip ───────────────────────────────
  // El coordinador general comenta desde la moderación; los demás desde el portal
  const listarComentarios = (idClip) => repoClips.listarComentarios(idClip)
  // segundo: momento del clip al que se refiere el comentario (null = el clip en general)
  // idPadre: comentario al que responde (null = comentario nuevo)
  const agregarComentario = (idClip, texto, segundo = null, idPadre = null) =>
    repoClips.agregarComentario(idClip, texto.trim(), segundo, idPadre)
  const borrarComentario = (id) => repoClips.borrarComentario(id)

  // ─── Vistas (quién vio cada clip) ─────────────────────────
  // Se registra una vez por clip en esta pestaña, cuando el reproductor avisa que se vio
  const registrarVista = async (idClip) => {
    if (vistasRegistradas.has(String(idClip))) return
    vistasRegistradas.add(String(idClip))
    const res = await repoClips.registrarVista(idClip)
    if (!res?.ok) {
      vistasRegistradas.delete(String(idClip))
      return
    }
    for (const vista of [clipsVisibles, clipsModeracion]) {
      vista.value = vista.value.map(c => (String(c.id) === String(idClip) ? { ...c, vistoPorMi: true } : c))
    }
  }
  const listarVistas = (idClip) => repoClips.listarVistas(idClip)

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
    cargarPanel, agregarBoton, editarBoton, borrarBoton, restablecerBotones, estadoPanel, guardarPanelAhora,
    cargarVideo, archivoDelVideo, agregarCamara, cargarArchivoCamara, archivoCamara, quitarCamara, sincronizarCamara,
    marcarTag, borrarTag, moverTag, ajustarTag, fijarTag,
    iniciarReloj, pausarReloj, reiniciarReloj, sincronizar, nuevaSesion,
    eventos, cargandoEventos, cargarEventos, hayCambiosSinGuardar, guardarEvento, abrirEvento, borrarEvento,
    gruposPublicacion, cargarGruposPublicacion, publicarClips, publicarVideoExterno, progresoSubida, cancelarSubida, borrarClipPublicado,
    puedePublicar, publicaAutorizado, clipsVisibles, cargandoClips, cargarClips, canales, cargarCanales, tramoDe,
    clipsModeracion, cargandoModeracion, cargarClipsModeracion, cambiarEstadoDestino, editarClip, guardarAnotaciones,
    listarComentarios, agregarComentario, borrarComentario, registrarVista, listarVistas,
    listasReproduccion, cargarListasReproduccion, crearListaReproduccion, borrarListaReproduccion, cambiarClipEnLista,
    colecciones, cargarColecciones, coleccionesAdmin, cargarColeccionesAdmin, guardarColeccion, borrarColeccion
  }
}
