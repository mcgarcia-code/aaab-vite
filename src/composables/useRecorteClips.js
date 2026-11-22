import { ref } from 'vue'

// Recorte de clips en el propio dispositivo con ffmpeg (versión para navegador, ffmpeg.wasm).
// - No se sube nada: el video se lee del archivo elegido.
// - El archivo se "monta" con WORKERFS: ffmpeg lee solo los pedazos que necesita, así que sirve
//   para videos de varios GB sin cargarlos enteros en memoria.
// - Se copia el video tal cual (-c copy), sin recodificar: es rápido y no pierde calidad.
//   Por eso cada clip arranca en el fotograma clave anterior al inicio (puede empezar 1 o 2 s antes).
// - La herramienta (~30 MB) se descarga la primera vez que se usa y después queda en caché del navegador.

const VERSION_CORE = '0.12.10'
const BASE_CORE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${VERSION_CORE}/dist/esm`
const CARPETA = '/entrada'

let ffmpeg = null
let cargandoFfmpeg = null

const obtenerFfmpeg = () => {
  if (ffmpeg) return Promise.resolve(ffmpeg)
  if (!cargandoFfmpeg) {
    cargandoFfmpeg = (async () => {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([import('@ffmpeg/ffmpeg'), import('@ffmpeg/util')])
      const instancia = new FFmpeg()
      await instancia.load({
        coreURL: await toBlobURL(`${BASE_CORE}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${BASE_CORE}/ffmpeg-core.wasm`, 'application/wasm')
      })
      ffmpeg = instancia
      return instancia
    })().catch((e) => {
      cargandoFfmpeg = null
      throw e
    })
  }
  return cargandoFfmpeg
}

// Extensión del archivo original (el clip sale en el mismo formato, porque se copia sin recodificar)
const extensionDe = (nombre) => {
  const m = String(nombre).toLowerCase().match(/\.([a-z0-9]{2,4})$/)
  return m ? m[1] : 'mp4'
}

export function useRecorteClips() {
  const recortando = ref(false)
  const progreso = ref('')

  // archivo: el File del video. clips: [{ nombre, inicio, duracion }] (nombre sin extensión)
  // Devuelve [{ nombre, datos: Uint8Array }]
  const recortar = async (archivo, clips) => {
    recortando.value = true
    progreso.value = ffmpeg ? 'Preparando...' : 'Descargando la herramienta de recorte (solo la primera vez)...'
    const ext = extensionDe(archivo.name)
    let montado = false
    let f = null
    try {
      f = await obtenerFfmpeg()
      try { await f.createDir(CARPETA) } catch { /* ya existe */ }
      await f.mount('WORKERFS', { files: [archivo] }, CARPETA)
      montado = true

      const resultado = []
      for (const [i, clip] of clips.entries()) {
        progreso.value = `Recortando clip ${i + 1} de ${clips.length}...`
        const salida = `salida-${i}.${ext}`
        const codigo = await f.exec([
          '-ss', String(clip.inicio),
          '-i', `${CARPETA}/${archivo.name}`,
          '-t', String(clip.duracion),
          '-map', '0:v:0', '-map', '0:a:0?',
          '-c', 'copy',
          '-avoid_negative_ts', 'make_zero',
          salida
        ])
        if (codigo !== 0) throw new Error(`No se pudo recortar el clip ${i + 1}.`)
        const datos = await f.readFile(salida)
        await f.deleteFile(salida)
        resultado.push({ nombre: `${clip.nombre}.${ext}`, datos })
      }
      return resultado
    } finally {
      if (montado) await f.unmount(CARPETA).catch(() => {})
      recortando.value = false
      progreso.value = ''
    }
  }

  return { recortando, progreso, recortar }
}
