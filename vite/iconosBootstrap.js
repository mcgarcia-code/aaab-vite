// Plugin de Vite: en el build deja en bootstrap-icons.css solo los íconos que aparecen en el código.
// El CSS original define ~2.000 clases (.bi-xxx::before); el sitio usa una fracción.
//
// Cómo detecta los íconos: busca el texto "bi-<nombre>" en src/ e index.html. Por eso los nombres de
// íconos tienen que estar escritos completos en el código (ej. 'bi-eye'), nunca armados con
// 'bi-' + variable. Si un nombre no existe en Bootstrap Icons, avisa en la consola del build.
// En desarrollo (npm run dev) no hace nada: se carga el archivo completo.
import fs from 'node:fs'
import path from 'node:path'

const EXTENSIONES = /\.(vue|js|ts|html|css|scss)$/

const listarArchivos = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name)
    if (e.isDirectory()) return listarArchivos(ruta)
    return EXTENSIONES.test(e.name) ? [ruta] : []
  })

export default function iconosBootstrap({ raiz = process.cwd() } = {}) {
  return {
    name: 'iconos-bootstrap-usados',
    apply: 'build',
    enforce: 'pre',
    load(id) {
      const archivo = id.split('?')[0].replace(/\\/g, '/')
      if (!archivo.endsWith('bootstrap-icons/font/bootstrap-icons.css')) return null

      const usados = new Set()
      const fuentes = [...listarArchivos(path.join(raiz, 'src')), path.join(raiz, 'index.html')]
      for (const f of fuentes) {
        for (const m of fs.readFileSync(f, 'utf8').matchAll(/\bbi-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) usados.add(m[1])
      }

      const css = fs.readFileSync(archivo, 'utf8')
      const existentes = new Set()
      const filtrado = css.replace(/^\.bi-([a-z0-9-]+)::before \{[^}]*\}\r?\n/gm, (regla, nombre) => {
        existentes.add(nombre)
        return usados.has(nombre) ? regla : ''
      })

      const inexistentes = [...usados].filter((n) => !existentes.has(n))
      if (inexistentes.length) {
        this.warn(`Íconos que no existen en Bootstrap Icons (revisar el nombre): ${inexistentes.map((n) => 'bi-' + n).join(', ')}`)
      }
      return filtrado
    }
  }
}
