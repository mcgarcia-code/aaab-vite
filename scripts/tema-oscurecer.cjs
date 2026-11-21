// Herramienta de la migración a modo oscuro (ver src/assets/css/tema.css).
// Uso: node scripts/tema-oscurecer.cjs src/components/carpeta/*.vue
// Envuelve colores fijos en var(--o-*, #original): en claro/producción queda el color original,
// en oscuro toma el token. Solo toca <style> y atributos style="..." estáticos del <template>.
// Uso: node oscurecer.cjs archivo...   (imprime los colores que no supo mapear)
const fs = require('fs')
const G = (lista, token) => Object.fromEntries(lista.split(' ').map(h => [h, token]))
const TEXTO = {
  ...G('#0f172a #111827 #1e293b #1f2937 #212529 #000000 #0b1222 #020617 #1a1a1a #333333 #343a40 #374151 #111111 #222222', 'o-texto'),
  ...G('#334155 #475569 #495057 #4b5563 #52525b #555555 #666666 #444444', 'o-texto-medio'),
  ...G('#64748b #6c757d #6b7280 #94a3b8 #adb5bd #9ca3af #8a94a6 #888888 #999999 #777777 #aaaaaa #5b6b7f', 'o-texto-suave'),
  ...G('#dc2626 #b91c1c #991b1b #7f1d1d #dc3545 #c8102e #842029 #b02a37 #ef4444 #e11d48 #be123c #c0304a', 'o-rojo-texto'),
  ...G('#198754 #15803d #166534 #0f5132 #146c43 #16a34a #047857 #065f46 #059669 #14532d #2f8a45', 'o-verde-texto'),
  ...G('#92400e #b45309 #856404 #664d03 #a16207 #d97706 #997404 #9a3412 #c2410c #78350f #854d0e #a6841f #b5691a', 'o-ambar-texto'),
  ...G('#1d4ed8 #2563eb #0d6efd #1e40af #0369a1 #055160 #084298 #1e3a8a #0284c7 #0c4a6e #3730a3 #4338ca #1c6ea4 #006064', 'o-azul-texto'),
}
const FONDO = {
  ...G('#ffffff', 'o-tarjeta'),
  ...G('#f8fafc #f8f9fa #f9fafb #fafafa #f5f5f5 #fcfcfd #fdfdfd #f7f7f7', 'o-superficie'),
  ...G('#f1f5f9 #f1f3f5 #f3f4f6 #e9ecef #eef2f7 #f0f0f0 #f1f1f1 #e2e8f0 #e5e7eb #dee2e6 #eeeeee #f4f4f5 #f0f2f5 #eef1f5', 'o-chip'),
  ...G('#fef2f2 #fee2e2 #fde8e8 #f8d7da #fff5f5 #fecaca #fff1f2 #ffe4e6 #fde7ea #fff8f8', 'o-rojo-fondo'),
  ...G('#d1e7dd #dcfce7 #f0fdf4 #ecfdf5 #d1fae5 #bbf7d0 #e3f5e6', 'o-verde-fondo'),
  ...G('#fff3cd #fef3c7 #fffbeb #fef9c3 #fff7ed #ffedd5 #fefce8 #fdf3d3 #fdecd8 #fef08a', 'o-ambar-fondo'),
  ...G('#dbeafe #eff6ff #cfe2ff #e0f2fe #cff4fc #f0f9ff #e0e7ff #eef2ff #dceefb #e0f7fa', 'o-azul-fondo'),
}
const BORDE = {
  ...G('#ffffff', 'o-tarjeta'),
  ...G('#e2e8f0 #e5e7eb #dee2e6 #e9ecef #f1f5f9 #eeeeee #dddddd #ced4da #cbd5e1 #d1d5db #f0f0f0 #e4e4e7 #f3f4f6 #f8fafc #d4dbe4 #d4d4d8 #adb5bd #f1f3f5', 'o-borde'),
  ...G('#0f172a', 'o-texto'),
  ...G('#fecaca #fca5a5 #f1aeb5 #f5c2c7 #fee2e2 #fecdd3 #f5c2cb', 'o-rojo-borde'),
  ...G('#a3cfbb #bbf7d0 #badbcc #86efac #a7f3d0 #bfe6c8', 'o-verde-borde'),
  ...G('#ffe69c #fde68a #fcd34d #ffecb5 #fed7aa #f2e2a5 #f6d3a8 #fef08a', 'o-ambar-borde'),
  ...G('#bfdbfe #9ec5fe #93c5fd #b6effb #c7d2fe #b6dcf5', 'o-azul-borde'),
}
const tablaPara = (prop) => {
  prop = prop.toLowerCase()
  if (/^(background|background-color|background-image)$/.test(prop)) return FONDO
  if (/^(border|border-(top|bottom|left|right)|border-(top-|bottom-|left-|right-)?color|outline|outline-color|border-inline.*|border-block.*)$/.test(prop)) return BORDE
  if (/^(color|fill|stroke|caret-color|-webkit-text-fill-color|text-decoration-color|accent-color)$/.test(prop)) return TEXTO
  return null
}
const norm = (h) => { h = h.toLowerCase(); return h.length === 4 ? '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3] : h }
const sinMapa = {}
const procesarDecl = (txt) => txt.replace(/([a-zA-Z-]+)(\s*:\s*)([^;{}"]+?)(\s*(?:!important)?\s*)(?=[;}"]|$)/g, (m, prop, sep, valor, imp) => {
  const tabla = tablaPara(prop)
  if (!tabla) return m
  // separa los var(...) ya existentes para no tocarlos
  const partes = valor.split(/(var\([^)]*\))/)
  const nuevo = partes.map(p => p.startsWith('var(') ? p : p.replace(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, (h) => {
    const t = tabla[norm(h)]
    if (!t) { sinMapa[`${prop}:${norm(h)}`] = (sinMapa[`${prop}:${norm(h)}`] || 0) + 1; return h }
    return `var(--${t}, ${h})`
  })).join('')
  return prop + sep + nuevo + imp
})
for (const archivo of process.argv.slice(2)) {
  let txt = fs.readFileSync(archivo, 'utf8')
  const antes = txt
  // <style> ... </style>
  txt = txt.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, a, cuerpo, c) => a + procesarDecl(cuerpo) + c)
  // style="..." estáticos dentro del <template> (no :style)
  const ini = txt.indexOf('<template>'), fin = txt.lastIndexOf('</template>')
  if (ini >= 0 && fin > ini) {
    const tpl = txt.slice(ini, fin).replace(/(\s)style="([^"]*)"/g, (m, esp, s) => `${esp}style="${procesarDecl(s)}"`)
    txt = txt.slice(0, ini) + tpl + txt.slice(fin)
  }
  if (txt !== antes) fs.writeFileSync(archivo, txt)
}
console.log(Object.entries(sinMapa).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k}`).join('\n'))
