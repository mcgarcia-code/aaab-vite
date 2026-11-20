import { reactive, ref, computed, watch } from 'vue'
import { auth } from '@/api/auth'

// =====================================================================
// AAAB TV — Estudio de análisis de partidos + portal de clips
// ---------------------------------------------------------------------
// Por ahora todo es local (mockup): el backend y los videos van a vivir en
// un VPS aparte. Las funciones marcadas con "VPS" son las que después se
// reemplazan por llamadas reales; el resto de la pantalla no cambia.
// =====================================================================

// Cada tag genera un clip de 8 segundos antes y 8 después del momento marcado
export const VENTANA_SEGUNDOS = 8

export const CATEGORIAS_TAG = [
  { clave: 'sancion', titulo: 'Sanciones disciplinarias' },
  { clave: 'juego', titulo: 'Situaciones de juego' }
]

// Colores de los botones (categóricos: sirven para distinguir tags entre sí)
export const COLORES_TAG = {
  rojo: { nombre: 'Rojo', solido: '#dc2626', fondo: '#fee2e2', texto: '#991b1b' },
  naranja: { nombre: 'Naranja', solido: '#ea580c', fondo: '#ffedd5', texto: '#9a3412' },
  amarillo: { nombre: 'Amarillo', solido: '#ca8a04', fondo: '#fef9c3', texto: '#854d0e' },
  verde: { nombre: 'Verde', solido: '#16a34a', fondo: '#dcfce7', texto: '#166534' },
  azul: { nombre: 'Azul', solido: '#1d4ed8', fondo: '#dbeafe', texto: '#1e3a8a' },
  violeta: { nombre: 'Violeta', solido: '#7c3aed', fondo: '#ede9fe', texto: '#5b21b6' },
  gris: { nombre: 'Gris', solido: '#475569', fondo: '#e2e8f0', texto: '#1e293b' },
  negro: { nombre: 'Negro', solido: '#0f172a', fondo: '#cbd5e1', texto: '#0f172a' }
}
export const colorTag = (clave) => COLORES_TAG[clave] || COLORES_TAG.gris

const BOTONES_DEFECTO = [
  { id: 'tarjeta-amarilla', nombre: 'Tarjeta amarilla', categoria: 'sancion', color: 'amarillo', atajo: '1' },
  { id: 'dos-minutos', nombre: '2 minutos', categoria: 'sancion', color: 'naranja', atajo: '2' },
  { id: 'descalificacion', nombre: 'Descalificación', categoria: 'sancion', color: 'rojo', atajo: '3' },
  { id: 'tarjeta-azul', nombre: 'Tarjeta azul', categoria: 'sancion', color: 'azul', atajo: '4' },
  { id: 'siete-metros', nombre: '7 metros', categoria: 'juego', color: 'violeta', atajo: 'Q' },
  { id: 'play-on', nombre: 'Play on (ventaja)', categoria: 'juego', color: 'verde', atajo: 'W' },
  { id: 'falta-ataque', nombre: 'Falta en ataque', categoria: 'juego', color: 'gris', atajo: 'E' },
  { id: 'juego-pasivo', nombre: 'Juego pasivo', categoria: 'juego', color: 'negro', atajo: 'R' }
]

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

const botones = ref(leer(claveStorage('panel'), null) || BOTONES_DEFECTO.map(b => ({ ...b })))

const SESION_VACIA = () => ({
  partido: '',
  fecha: new Date().toISOString().slice(0, 10),
  modo: 'video',
  tags: [],
  // Reloj del modo en vivo (se guarda para no perderlo si se recarga la página)
  reloj: { corriendo: false, acumulado: 0, desde: null },
  // Segundo del video en el que se inició el cronómetro (null = todavía no se sincronizó)
  sincronizacion: null
})
const sesion = reactive({ ...SESION_VACIA(), ...leer(claveStorage('sesion'), {}) })

// El video no se guarda: es un archivo local que se vuelve a elegir al recargar
const video = reactive({ url: '', nombre: '', duracion: 0 })

watch(botones, (v) => guardar(claveStorage('panel'), v), { deep: true })
watch(sesion, (v) => guardar(claveStorage('sesion'), v), { deep: true })

// ─── Clips de AAAB TV ─────────────────────────────────────────────
// Estados: al publicar quedan "pendiente"; Desarrollo Arbitral los pasa a
// "publico" (los ve todo el que entra a AAAB TV) o "no_publico" (solo coordinadores y observadores).
export const ESTADOS_CLIP = {
  pendiente: { etiqueta: 'Pendiente', icono: 'bi-hourglass-split', clase: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' },
  publico: { etiqueta: 'Público', icono: 'bi-globe2', clase: 'bg-success-subtle text-success-emphasis border border-success-subtle' },
  no_publico: { etiqueta: 'No público', icono: 'bi-lock-fill', clase: 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle' }
}

// Roles del panel árbitro que pueden publicar y ver los clips no públicos
const ROL_OBSERVADOR = 2
const ROL_COORDINADOR = 4
const ROLES_PUBLICAN = [ROL_OBSERVADOR, ROL_COORDINADOR]

const usuarioActual = () => auth.getUser() || {}
const esRolPublicador = (u = usuarioActual()) => ROLES_PUBLICAN.includes(Number(u.rol))

// Mockup: los clips se guardan en este navegador, compartidos entre usuarios (así se puede
// probar publicar con un usuario y moderar con otro). El video local no se puede guardar:
// solo se reproduce en la sesión en la que se publicó. VPS: todo esto viene del backend.
const CLAVE_CLIPS = 'aaabTv.clips'
const CLIPS_EJEMPLO = [
  {
    id: 'ej-1', titulo: 'Descalificación por golpe en la cara al lanzador',
    descripcion: 'El defensor llega tarde al bloqueo y golpea con el antebrazo en la cara del lanzador en suspensión. Regla 8:5.',
    etiqueta: 'Descalificación', color: 'rojo', partido: 'River vs. SAG Villa Ballester', fecha: '2026-11-15',
    inicio: 1114, fin: 1130, estado: 'publico', idAutor: null, autor: 'Ejemplo', publicadoEl: '2026-11-15T21:00:00'
  },
  {
    id: 'ej-2', titulo: '2 minutos por agarre al pivote desde atrás',
    descripcion: 'El pivote gana la posición y el defensor lo toma de la cintura impidiendo el giro. 2 minutos y 7 metros.',
    etiqueta: '2 minutos', color: 'naranja', partido: 'Ferro vs. Dorrego', fecha: '2026-11-08',
    inicio: 3367, fin: 3383, estado: 'no_publico', idAutor: null, autor: 'Ejemplo', publicadoEl: '2026-11-08T22:00:00'
  },
  {
    id: 'ej-3', titulo: 'Ventaja bien aplicada en el contraataque',
    descripcion: 'Falta leve en mitad de cancha: la pareja espera y el extremo convierte. Regla 13:2.',
    etiqueta: 'Play on (ventaja)', color: 'verde', partido: 'Sedalo vs. CID Moreno', fecha: '2026-11-01',
    inicio: 1440, fin: 1456, estado: 'pendiente', idAutor: null, autor: 'Ejemplo', publicadoEl: '2026-11-01T20:30:00'
  }
]
const clipsPublicados = ref(leer(CLAVE_CLIPS, null) || CLIPS_EJEMPLO.map(c => ({ ...c })))
// Videos locales de esta sesión (no se pueden guardar): id del clip → URL del archivo
const videosDeSesion = reactive({})
watch(clipsPublicados, (v) => guardar(CLAVE_CLIPS, v), { deep: true })

// Si se modera desde otra pestaña (panel admin abierto al mismo tiempo), se refleja acá
window.addEventListener('storage', (e) => {
  if (e.key === CLAVE_CLIPS && e.newValue) {
    try { clipsPublicados.value = JSON.parse(e.newValue) } catch { /* dato inválido: se ignora */ }
  }
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
  const agregarBoton = ({ nombre, categoria, color, atajo }) => {
    const tecla = String(atajo || '').trim().toUpperCase().slice(0, 1)
    if (tecla && botones.value.some(b => b.atajo === tecla)) {
      return { ok: false, mensaje: `La tecla ${tecla} ya la usa otro botón.` }
    }
    botones.value.push({ id: nuevoId(), nombre: nombre.trim(), categoria, color, atajo: tecla })
    return { ok: true }
  }
  const editarBoton = (id, cambios) => {
    const tecla = String(cambios.atajo || '').trim().toUpperCase().slice(0, 1)
    if (tecla && botones.value.some(b => b.id !== id && b.atajo === tecla)) {
      return { ok: false, mensaje: `La tecla ${tecla} ya la usa otro botón.` }
    }
    const boton = botones.value.find(b => b.id === id)
    if (boton) Object.assign(boton, { ...cambios, nombre: cambios.nombre.trim(), atajo: tecla })
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
  }

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
  // Como el partido se filma completo (los dos tiempos juntos), alcanza con un solo punto.
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

  // ─── Publicación ──────────────────────────────────────────
  // VPS: subir el video completo (subida por partes, puede pesar varios GB) y enviar
  // { idVideo, partido, fecha, clips: [{ inicio, fin, titulo, descripcion, etiqueta }] }.
  // El servidor corta cada clip con ffmpeg y lo publica en AAAB TV.
  const publicarClips = async ({ partido, fecha, clips }) => {
    if (!puedePublicar.value) return { ok: false, message: 'Solo coordinadores y observadores pueden publicar.' }
    await new Promise(r => setTimeout(r, 900))
    const autor = usuarioActual()
    const nombreAutor = `${autor.nombre || ''} ${autor.apellido || ''}`.trim()
    clips.forEach(c => {
      const { inicio, fin } = limitesClip(c.segundo, video.duracion)
      const id = nuevoId()
      clipsPublicados.value.unshift({
        id, titulo: c.titulo.trim(), descripcion: c.descripcion.trim(),
        etiqueta: c.nombre, color: c.color, partido, fecha, inicio, fin,
        estado: 'pendiente', idAutor: autor.id ?? null, autor: nombreAutor, publicadoEl: new Date().toISOString()
      })
      videosDeSesion[id] = video.url
      const tag = sesion.tags.find(t => t.id === c.id)
      if (tag) { tag.publicado = true; tag.seleccionado = false }
    })
    return { ok: true, payload: clips.length }
  }

  // VPS: borrar en el servidor
  const borrarClipPublicado = (id) => { clipsPublicados.value = clipsPublicados.value.filter(c => c.id !== id) }

  // ─── Permisos y visibilidad ───────────────────────────────
  const puedePublicar = computed(() => esRolPublicador())

  // Lo que ve cada uno en el portal: públicos para todos; no públicos para coordinadores y
  // observadores; y sus propios clips (aunque estén pendientes) para quien los publicó
  const clipsVisibles = computed(() => {
    const u = usuarioActual()
    const veNoPublicos = esRolPublicador(u)
    return clipsPublicados.value.filter(c =>
      c.estado === 'publico' ||
      (c.estado === 'no_publico' && veNoPublicos) ||
      (c.idAutor !== null && String(c.idAutor) === String(u.id))
    )
  })

  const urlVideoDe = (clip) => videosDeSesion[clip.id] || ''

  // ─── Moderación (Desarrollo Arbitral) ─────────────────────
  // VPS: cambiar estado y editar en el servidor
  const cambiarEstadoClip = (id, estado) => {
    const clip = clipsPublicados.value.find(c => c.id === id)
    if (clip && ESTADOS_CLIP[estado]) clip.estado = estado
  }
  const editarClip = (id, { titulo, descripcion }) => {
    const clip = clipsPublicados.value.find(c => c.id === id)
    if (clip) Object.assign(clip, { titulo: titulo.trim(), descripcion: descripcion.trim() })
  }

  return {
    botones, sesion, video, clipsPublicados,
    segundosReloj, tagsOrdenados, tagsSinSincronizar,
    agregarBoton, editarBoton, borrarBoton, restablecerBotones,
    cargarVideo, marcarTag, borrarTag, moverTag,
    iniciarReloj, pausarReloj, reiniciarReloj, sincronizar, nuevaSesion,
    publicarClips, borrarClipPublicado,
    puedePublicar, clipsVisibles, urlVideoDe, cambiarEstadoClip, editarClip
  }
}
