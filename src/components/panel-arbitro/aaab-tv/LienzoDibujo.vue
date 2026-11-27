<template>
  <canvas ref="lienzo" class="lienzo" :class="{ editable }" aria-hidden="true"
          @pointerdown="empezar" @pointermove="mover" @pointerup="terminar" @pointerleave="terminar" @pointercancel="terminar"></canvas>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

// Capa para dibujar sobre el video (flechas, líneas, círculos y a mano alzada).
// v-model: formas [{ tipo: 'flecha'|'linea'|'circulo'|'libre', color, puntos: [[x, y]] }]
// con x e y entre 0 y 1 (proporción del cuadro): el dibujo queda igual en cualquier tamaño de pantalla.
// editable: si se puede dibujar (si no, solo muestra). herramienta y color: lo que dibuja el próximo trazo.
const props = defineProps({
  editable: { type: Boolean, default: false },
  herramienta: { type: String, default: 'flecha' },
  color: { type: String, default: '#facc15' }
})
const formas = defineModel({ type: Array, default: () => [] })

const lienzo = ref(null)
let enCurso = null
let observador = null

const grosor = (ancho) => Math.max(3, ancho / 180)

const dibujarForma = (ctx, forma, ancho, alto) => {
  const pts = forma.puntos.map(([x, y]) => [x * ancho, y * alto])
  if (!pts.length) return
  ctx.strokeStyle = forma.color
  ctx.fillStyle = forma.color
  ctx.lineWidth = grosor(ancho)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  const [x1, y1] = pts.at(0)
  const [x2, y2] = pts.at(-1)
  if (forma.tipo === 'libre') {
    ctx.moveTo(x1, y1)
    pts.slice(1).forEach(([x, y]) => ctx.lineTo(x, y))
    ctx.stroke()
  } else if (forma.tipo === 'circulo') {
    ctx.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    if (forma.tipo === 'flecha') {
      const angulo = Math.atan2(y2 - y1, x2 - x1)
      const largo = grosor(ancho) * 4
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - largo * Math.cos(angulo - Math.PI / 7), y2 - largo * Math.sin(angulo - Math.PI / 7))
      ctx.lineTo(x2 - largo * Math.cos(angulo + Math.PI / 7), y2 - largo * Math.sin(angulo + Math.PI / 7))
      ctx.closePath()
      ctx.fill()
    }
  }
}

const redibujar = () => {
  const c = lienzo.value
  if (!c) return
  const escala = window.devicePixelRatio || 1
  const { width, height } = c.getBoundingClientRect()
  c.width = Math.round(width * escala)
  c.height = Math.round(height * escala)
  const ctx = c.getContext('2d')
  ctx.setTransform(escala, 0, 0, escala, 0, 0)
  ctx.clearRect(0, 0, width, height)
  const todas = enCurso ? [...formas.value, enCurso] : formas.value
  todas.forEach(f => dibujarForma(ctx, f, width, height))
}

const puntoDe = (e) => {
  const caja = lienzo.value.getBoundingClientRect()
  const x = Math.min(1, Math.max(0, (e.clientX - caja.left) / caja.width))
  const y = Math.min(1, Math.max(0, (e.clientY - caja.top) / caja.height))
  return [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]
}

const empezar = (e) => {
  if (!props.editable) return
  lienzo.value.setPointerCapture?.(e.pointerId)
  const p = puntoDe(e)
  enCurso = { tipo: props.herramienta, color: props.color, puntos: [p, p] }
  redibujar()
}
const mover = (e) => {
  if (!enCurso) return
  const p = puntoDe(e)
  if (enCurso.tipo === 'libre') enCurso.puntos.push(p)
  else enCurso.puntos = [enCurso.puntos.at(0), p]
  redibujar()
}
const terminar = () => {
  if (!enCurso) return
  const [a, b] = [enCurso.puntos.at(0), enCurso.puntos.at(-1)]
  // Un toque sin arrastrar no deja nada
  const movio = enCurso.tipo === 'libre' ? enCurso.puntos.length > 2 : Math.hypot(b[0] - a[0], b[1] - a[1]) > 0.01
  if (movio) formas.value = [...formas.value, enCurso]
  enCurso = null
  redibujar()
}

watch(formas, redibujar, { deep: true })
onMounted(() => {
  observador = new ResizeObserver(redibujar)
  observador.observe(lienzo.value)
  redibujar()
})
onBeforeUnmount(() => observador?.disconnect())
</script>

<style scoped>
.lienzo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  touch-action: none;
}
.lienzo.editable { pointer-events: auto; cursor: crosshair; }
</style>
