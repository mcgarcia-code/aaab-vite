// ZIP sin compresión ("store"): para juntar archivos que ya vienen comprimidos (ej. clips MP4)
// en una sola descarga. No hace falta una librería: el formato "store" son cabeceras + los datos tal cual.
// archivos: [{ nombre: 'clip-1.mp4', datos: Uint8Array }] → Blob application/zip

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabla[n] = c >>> 0
  }
  return tabla
})()

const crc32 = (datos) => {
  let crc = 0xffffffff
  for (let i = 0; i < datos.length; i++) crc = TABLA_CRC[(crc ^ datos[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

// Fecha y hora en el formato de MS-DOS que usa el ZIP
const fechaDos = (d) => ({
  hora: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
  fecha: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
})

export const crearZip = (archivos) => {
  const codificador = new TextEncoder()
  const { hora, fecha } = fechaDos(new Date())
  const partes = []
  const central = []
  let desplazamiento = 0

  for (const { nombre, datos } of archivos) {
    const nombreBytes = codificador.encode(nombre)
    const crc = crc32(datos)
    const tam = datos.length

    // Cabecera local
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)          // versión necesaria
    local.setUint16(6, 0x0800, true)      // nombre en UTF-8
    local.setUint16(8, 0, true)           // sin compresión
    local.setUint16(10, hora, true)
    local.setUint16(12, fecha, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, tam, true)
    local.setUint32(22, tam, true)
    local.setUint16(26, nombreBytes.length, true)
    local.setUint16(28, 0, true)
    partes.push(new Uint8Array(local.buffer), nombreBytes, datos)

    // Entrada del directorio central
    const c = new DataView(new ArrayBuffer(46))
    c.setUint32(0, 0x02014b50, true)
    c.setUint16(4, 20, true)
    c.setUint16(6, 20, true)
    c.setUint16(8, 0x0800, true)
    c.setUint16(10, 0, true)
    c.setUint16(12, hora, true)
    c.setUint16(14, fecha, true)
    c.setUint32(16, crc, true)
    c.setUint32(20, tam, true)
    c.setUint32(24, tam, true)
    c.setUint16(28, nombreBytes.length, true)
    c.setUint32(42, desplazamiento, true)
    central.push(new Uint8Array(c.buffer), nombreBytes)

    desplazamiento += 30 + nombreBytes.length + tam
  }

  const tamCentral = central.reduce((suma, p) => suma + p.length, 0)
  const fin = new DataView(new ArrayBuffer(22))
  fin.setUint32(0, 0x06054b50, true)
  fin.setUint16(8, archivos.length, true)
  fin.setUint16(10, archivos.length, true)
  fin.setUint32(12, tamCentral, true)
  fin.setUint32(16, desplazamiento, true)

  return new Blob([...partes, ...central, new Uint8Array(fin.buffer)], { type: 'application/zip' })
}

// Dispara la descarga de un Blob con el nombre indicado
export const descargarBlob = (blob, nombre) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
