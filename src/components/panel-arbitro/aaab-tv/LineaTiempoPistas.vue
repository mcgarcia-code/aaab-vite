<template>
  <section class="linea-pistas mt-3" aria-label="Línea de tiempo por situación">
    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
      <h6 class="fw-bold m-0 text-dark text-uppercase small d-flex align-items-center gap-2"><i class="bi bi-distribute-horizontal text-danger" aria-hidden="true"></i> Línea de tiempo</h6>
      <div class="btn-group btn-group-sm" role="group" aria-label="Zoom">
        <button type="button" class="btn btn-light border" :disabled="zoom <= ZOOM_MINIMO" aria-label="Alejar" @click="cambiarZoom(-1)">
          <i class="bi bi-zoom-out" aria-hidden="true"></i>
        </button>
        <span class="btn btn-light border disabled valor-zoom">{{ zoom }}x</span>
        <button type="button" class="btn btn-light border" :disabled="zoom >= ZOOM_MAXIMO" aria-label="Acercar" @click="cambiarZoom(1)">
          <i class="bi bi-zoom-in" aria-hidden="true"></i>
        </button>
      </div>
      <span class="small text-muted d-none d-md-inline">
        Tocá un clip para verlo · arrastralo para moverlo · arrastrá sus bordes para ajustar el inicio y el fin
      </span>
    </div>

    <div class="cuerpo">
      <!-- Nombres de las pistas (columna fija) -->
      <div class="nombres" aria-hidden="true">
        <div class="espacio-regla"></div>
        <div v-for="p in pistas" :key="p.nombre" class="nombre-pista text-truncate" :title="p.nombre">
          <span class="punto" :style="{ background: colorTag(p.color).solido }"></span> {{ p.nombre }}
        </div>
      </div>

      <div ref="desplazable" class="desplazable">
        <div ref="lienzo" class="lienzo" :style="{ width: `${zoom * 100}%` }" @pointerdown="saltar">
          <!-- Regla de tiempo -->
          <div class="regla">
            <span v-for="m in marcasRegla" :key="m" class="marca-regla" :style="{ left: porcentaje(m) + '%' }">
              {{ formatearTiempo(m) }}
            </span>
          </div>

          <!-- Una pista por situación -->
          <div v-for="p in pistas" :key="p.nombre" class="pista">
            <button v-for="t in p.tags" :key="t.id" type="button" class="bloque" :class="{ publicado: t.publicado, arrastrando: arrastre?.id === t.id }"
                    :style="estiloBloque(t)"
                    :aria-label="`${t.titulo}: ${formatearTiempo(limitesDeTag(t, duracion).inicio)} a ${formatearTiempo(limitesDeTag(t, duracion).fin)}. Flechas para moverlo 1 segundo`"
                    @pointerdown.stop="empezar($event, t, 'mover')"
                    @keydown.left.prevent="moverTag(t.id, -1)" @keydown.right.prevent="moverTag(t.id, 1)"
                    @keydown.enter.prevent="emit('ver', t)">
              <span class="borde inicio" @pointerdown.stop="empezar($event, t, 'inicio')"></span>
              <span class="momento" :style="{ left: momentoEnBloque(t) + '%' }"></span>
              <span class="borde fin" @pointerdown.stop="empezar($event, t, 'fin')"></span>
            </button>
          </div>

          <span class="cabezal" :style="{ left: porcentaje(tiempo) + '%' }" aria-hidden="true"></span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useAaabTv, colorTag, formatearTiempo, limitesDeTag, VENTANA_SEGUNDOS } from '@/composables/useAaabTv'

// Línea de tiempo del análisis, como en Dartfish: una pista por situación con sus clips.
// - Tocar un clip lo reproduce (emite "ver"); tocar la regla o una pista vacía salta a ese momento ("saltar").
// - Arrastrar un clip mueve el momento marcado; arrastrar sus bordes ajusta cuántos segundos antes y después dura.
// - Zoom de 1x a 16x, con desplazamiento horizontal; mientras se reproduce, sigue al cabezal.
const props = defineProps({
  duracion: { type: Number, required: true },
  tiempo: { type: Number, default: 0 },
  tags: { type: Array, required: true },
  botones: { type: Array, default: () => [] }
})
const emit = defineEmits(['saltar', 'ver'])

const { fijarTag, moverTag } = useAaabTv()

const ZOOM_MINIMO = 1
const ZOOM_MAXIMO = 16
const PASOS_REGLA = [5, 10, 30, 60, 120, 300, 600, 900]
const MARCAS_VISIBLES = 8
// Menos de esto entre que se aprieta y se suelta es un toque, no un arrastre
const UMBRAL_ARRASTRE = 4

const zoom = ref(1)
const desplazable = ref(null)
const lienzo = ref(null)

const porcentaje = (segundo) => (props.duracion ? Math.min(100, Math.max(0, (segundo / props.duracion) * 100)) : 0)

// Pistas en el orden de "Mi panel"; las situaciones que ya no están en el panel van al final
const pistas = computed(() => {
  const conTiempo = props.tags.filter(t => t.segundo !== null)
  const nombres = [...new Set(conTiempo.map(t => t.nombre))]
  const orden = (nombre) => {
    const i = props.botones.findIndex(b => b.nombre === nombre)
    return i === -1 ? Number.MAX_SAFE_INTEGER : i
  }
  return nombres
    .sort((a, b) => orden(a) - orden(b) || a.localeCompare(b))
    .map(nombre => {
      const tags = conTiempo.filter(t => t.nombre === nombre)
      return { nombre, color: tags.at(0).color, tags }
    })
})

const estiloBloque = (t) => {
  const { inicio, fin } = limitesDeTag(t, props.duracion)
  return {
    left: porcentaje(inicio) + '%',
    width: Math.max(0.4, porcentaje(fin) - porcentaje(inicio)) + '%',
    background: colorTag(t.color).fondo,
    borderColor: colorTag(t.color).solido
  }
}
const momentoEnBloque = (t) => {
  const { inicio, duracion } = limitesDeTag(t, props.duracion)
  return duracion ? ((t.segundo - inicio) / duracion) * 100 : 50
}

// Regla: un paso que deje unas 8 marcas en la parte visible
const marcasRegla = computed(() => {
  if (!props.duracion) return []
  const visible = props.duracion / zoom.value
  const paso = PASOS_REGLA.find(p => visible / p <= MARCAS_VISIBLES) || PASOS_REGLA.at(-1)
  const marcas = []
  for (let s = 0; s <= props.duracion; s += paso) marcas.push(s)
  return marcas
})

const cambiarZoom = (sentido) => {
  const caja = desplazable.value
  // Se mantiene a la vista el mismo momento (el cabezal) al acercar o alejar
  zoom.value = Math.min(ZOOM_MAXIMO, Math.max(ZOOM_MINIMO, sentido > 0 ? zoom.value * 2 : zoom.value / 2))
  requestAnimationFrame(() => {
    if (!caja || !lienzo.value) return
    caja.scrollLeft = (porcentaje(props.tiempo) / 100) * lienzo.value.scrollWidth - caja.clientWidth / 2
  })
}

const segundoEn = (clientX) => {
  const caja = lienzo.value.getBoundingClientRect()
  return Math.min(props.duracion, Math.max(0, ((clientX - caja.left) / caja.width) * props.duracion))
}

const saltar = (e) => {
  if (!props.duracion) return
  emit('saltar', segundoEn(e.clientX))
}

// ─── Arrastre ─────────────────────────────────────────────
const arrastre = ref(null)

const alMover = (e) => {
  const a = arrastre.value
  if (!a) return
  if (Math.abs(e.clientX - a.x) >= UMBRAL_ARRASTRE) a.movio = true
  if (!a.movio) return
  const delta = (e.clientX - a.x) / a.pxPorSegundo
  if (a.modo === 'mover') fijarTag(a.id, { segundo: a.original.segundo + delta })
  else if (a.modo === 'inicio') fijarTag(a.id, { antes: a.original.antes - delta })
  else fijarTag(a.id, { despues: a.original.despues + delta })
}

const alSoltar = () => {
  const a = arrastre.value
  window.removeEventListener('pointermove', alMover)
  window.removeEventListener('pointerup', alSoltar)
  window.removeEventListener('pointercancel', alSoltar)
  arrastre.value = null
  // Un toque sin arrastrar reproduce el clip
  if (a && !a.movio) emit('ver', a.tag)
}

const empezar = (e, tag, modo) => {
  if (!lienzo.value || !props.duracion) return
  e.preventDefault()
  arrastre.value = {
    id: tag.id,
    tag,
    modo,
    x: e.clientX,
    movio: false,
    pxPorSegundo: lienzo.value.getBoundingClientRect().width / props.duracion,
    original: { segundo: tag.segundo, antes: tag.antes ?? VENTANA_SEGUNDOS, despues: tag.despues ?? VENTANA_SEGUNDOS }
  }
  window.addEventListener('pointermove', alMover)
  window.addEventListener('pointerup', alSoltar)
  window.addEventListener('pointercancel', alSoltar)
}

// Mientras se reproduce, si el cabezal sale de la parte visible, se lleva a la vista
watch(() => props.tiempo, (t) => {
  const caja = desplazable.value
  if (!caja || !lienzo.value || arrastre.value || zoom.value === 1) return
  const x = (porcentaje(t) / 100) * lienzo.value.scrollWidth
  if (x < caja.scrollLeft || x > caja.scrollLeft + caja.clientWidth) caja.scrollLeft = x - caja.clientWidth * 0.1
})

onBeforeUnmount(alSoltar)
</script>

<style scoped>
.linea-pistas { user-select: none; }
.valor-zoom { min-width: 46px; font-variant-numeric: tabular-nums; opacity: 1; }
.cuerpo { display: flex; border: 1px solid var(--o-borde, #e2e8f0); border-radius: 12px; overflow: hidden; }
.nombres { flex: 0 0 7.5rem; border-right: 1px solid var(--o-borde, #e2e8f0); background: var(--o-tarjeta, #fff); }
.espacio-regla { height: 22px; border-bottom: 1px solid var(--o-borde, #e2e8f0); }
.nombre-pista {
  height: 30px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--o-texto-medio, #475569);
  border-bottom: 1px solid var(--o-borde, #f1f5f9);
}
.punto { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.desplazable { flex: 1; overflow-x: auto; overflow-y: hidden; }
.lienzo { position: relative; min-width: 100%; cursor: pointer; }
.regla { position: relative; height: 22px; border-bottom: 1px solid var(--o-borde, #e2e8f0); }
.marca-regla {
  position: absolute;
  top: 3px;
  padding-left: 3px;
  border-left: 1px solid var(--o-borde, #cbd5e1);
  font-size: 0.65rem;
  color: var(--o-texto-suave, #64748b);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.pista { position: relative; height: 30px; border-bottom: 1px solid var(--o-borde, #f1f5f9); }
.bloque {
  position: absolute;
  top: 5px;
  height: 20px;
  min-width: 6px;
  padding: 0;
  border: 2px solid;
  border-radius: 5px;
  cursor: grab;
  touch-action: none;
}
.bloque.publicado { opacity: 0.55; }
.bloque.arrastrando { cursor: grabbing; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.25); z-index: 2; }
.bloque:focus-visible { outline: 2px solid var(--o-texto, #0f172a); outline-offset: 1px; }
.borde { position: absolute; top: -2px; bottom: -2px; width: 8px; cursor: ew-resize; touch-action: none; }
.borde.inicio { left: -4px; }
.borde.fin { right: -4px; }
.momento { position: absolute; top: 2px; bottom: 2px; width: 2px; margin-left: -1px; background: var(--o-texto, #0f172a); pointer-events: none; }
.cabezal { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: #dc2626; pointer-events: none; }
@media (max-width: 575px) {
  .nombres { flex-basis: 5.5rem; }
}
</style>
