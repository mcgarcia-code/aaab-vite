<template>
  <div>
    <!-- Período (un solo filtro, arriba de todo) -->
    <div class="d-flex flex-wrap align-items-center gap-2 mb-3" role="group" aria-label="Período">
      <button v-for="p in PERIODOS" :key="p.clave" type="button" class="filtro" :class="{ activo: periodo === p.clave }"
              :aria-pressed="periodo === p.clave" @click="periodo = p.clave">{{ p.etiqueta }}</button>
      <span class="small text-muted ms-auto">{{ clipsDelPeriodo.length }} clips en el período</span>
    </div>

    <EstadoVacio v-if="!clipsDelPeriodo.length" icono="bi-bar-chart" titulo="No hay clips en este período" mensaje="Probá con un período más largo." />

    <template v-else>
      <!-- Totales -->
      <div class="tarjetas mb-4">
        <div class="tarjeta-dato">
          <span class="valor">{{ clipsDelPeriodo.length }}</span>
          <span class="etiqueta">Clips publicados</span>
        </div>
        <div class="tarjeta-dato">
          <span class="valor">{{ cantidadPendientes }}</span>
          <span class="etiqueta">Pendientes de autorizar</span>
        </div>
        <div class="tarjeta-dato">
          <span class="valor">{{ cantidadAutorizados }}</span>
          <span class="etiqueta">Autorizados en algún canal</span>
        </div>
        <div class="tarjeta-dato">
          <span class="valor">{{ porcentajeCorrectas === null ? '—' : `${porcentajeCorrectas}%` }}</span>
          <span class="etiqueta">Decisiones correctas
            <template v-if="valorados.length">({{ valorados.length }} {{ valorados.length === 1 ? 'valorado' : 'valorados' }})</template>
          </span>
        </div>
      </div>

      <div class="row g-4">
        <section class="col-12 col-lg-6">
          <h3 class="titulo-grafico">Clips por situación</h3>
          <div class="barras">
            <div v-for="f in porSituacion" :key="f.nombre" class="fila-barra" :title="`${f.nombre}: ${f.cantidad}`">
              <span class="nombre text-truncate">{{ f.nombre }}</span>
              <span class="pista"><span class="barra" :style="{ width: ancho(f.cantidad, porSituacion) }"></span></span>
              <span class="numero">{{ f.cantidad }}</span>
            </div>
          </div>
        </section>

        <section class="col-12 col-lg-6">
          <h3 class="titulo-grafico">Autorizados por canal</h3>
          <p v-if="!porCanal.length" class="small text-muted">Todavía no hay clips autorizados en el período.</p>
          <div v-else class="barras">
            <div v-for="f in porCanal" :key="f.nombre" class="fila-barra" :title="`${f.nombre}: ${f.cantidad}`">
              <span class="nombre text-truncate">{{ f.nombre }}</span>
              <span class="pista"><span class="barra" :style="{ width: ancho(f.cantidad, porCanal) }"></span></span>
              <span class="numero">{{ f.cantidad }}</span>
            </div>
          </div>
        </section>

        <section class="col-12">
          <h3 class="titulo-grafico">Clips publicados por mes</h3>
          <div class="columnas" role="img" :aria-label="`Clips por mes: ${porMes.map(m => `${m.nombre} ${m.cantidad}`).join(', ')}`">
            <div v-for="m in porMes" :key="m.clave" class="columna" :title="`${m.nombre}: ${m.cantidad}`">
              <span class="numero-columna">{{ m.cantidad || '' }}</span>
              <span class="pista-columna"><span class="barra-columna" :style="{ height: alto(m.cantidad) }"></span></span>
              <span class="mes">{{ m.corto }}</span>
            </div>
          </div>
        </section>

        <section class="col-12 col-lg-7">
          <h3 class="titulo-grafico">Decisiones por árbitro</h3>
          <!-- Leyenda: el color siempre va con su nombre -->
          <div class="leyenda mb-2">
            <span v-for="(d, clave) in DECISIONES" :key="clave" class="item-leyenda">
              <span class="muestra" :style="{ background: COLOR_DECISION[clave] }"></span>
              <i :class="['bi', d.icono]" :style="{ color: COLOR_DECISION[clave] }" aria-hidden="true"></i> {{ d.etiqueta }}
            </span>
          </div>
          <p v-if="!porArbitro.length" class="small text-muted">
            Todavía no hay clips con árbitros involucrados y decisión valorada. Se cargan al publicar o al revisar cada clip.
          </p>
          <div v-else class="barras">
            <div v-for="a in porArbitro" :key="a.id" class="fila-barra fila-arbitro"
                 :title="`${a.nombre}: ${a.correcta} correctas, ${a.incorrecta} incorrectas, ${a.a_revisar} a revisar`">
              <span class="nombre text-truncate">{{ a.nombre }}</span>
              <span class="pista apilada">
                <span v-for="clave in ORDEN_DECISIONES" :key="clave" v-show="a[clave]" class="segmento"
                      :style="{ width: (a[clave] / maximoArbitro) * 100 + '%', background: COLOR_DECISION[clave] }"></span>
              </span>
              <span class="numero numero-ancho">{{ a.correcta }} / {{ a.incorrecta }} / {{ a.a_revisar }}</span>
            </div>
          </div>
          <p v-if="porArbitro.length" class="small text-muted mt-1">Correctas / incorrectas / a revisar. Los 15 árbitros con más clips.</p>
        </section>

        <section class="col-12 col-lg-6">
          <h3 class="titulo-grafico">Clips más vistos</h3>
          <p v-if="!masVistos.length" class="small text-muted">Todavía no hay vistas registradas en el período.</p>
          <div v-else class="barras">
            <div v-for="c in masVistos" :key="c.id" class="fila-barra" :title="`${c.titulo}: ${c.cantidadVistas} ${c.cantidadVistas === 1 ? 'vista' : 'vistas'}`">
              <span class="nombre text-truncate">{{ c.titulo }}</span>
              <span class="pista"><span class="barra" :style="{ width: (c.cantidadVistas / maximoVistas) * 100 + '%' }"></span></span>
              <span class="numero">{{ c.cantidadVistas }}</span>
            </div>
          </div>
        </section>

        <section class="col-12 col-lg-5">
          <h3 class="titulo-grafico">Quién publica</h3>
          <div class="barras">
            <div v-for="f in porAutor" :key="f.nombre" class="fila-barra" :title="`${f.nombre}: ${f.cantidad}`">
              <span class="nombre text-truncate">{{ f.nombre }}</span>
              <span class="pista"><span class="barra" :style="{ width: ancho(f.cantidad, porAutor) }"></span></span>
              <span class="numero">{{ f.cantidad }}</span>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import { DECISIONES, estadoGeneral } from '@/composables/useAaabTv'

// Estadísticas de AAAB TV para el coordinador general, a partir de todos los clips.
// Conteos con barras de un solo color (magnitud); las decisiones con los colores de estado,
// siempre acompañados de su nombre e ícono.
const props = defineProps({
  clips: { type: Array, required: true }
})

const PERIODOS = [
  { clave: 'todo', etiqueta: 'Todo', dias: null },
  { clave: '30', etiqueta: 'Últimos 30 días', dias: 30 },
  { clave: '90', etiqueta: 'Últimos 90 días', dias: 90 },
  { clave: '365', etiqueta: 'Último año', dias: 365 }
]
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const ORDEN_DECISIONES = ['correcta', 'incorrecta', 'a_revisar']
// Colores de estado (bien / mal / atención): no se usan para otra cosa
const COLOR_DECISION = { correcta: '#16a34a', incorrecta: '#dc2626', a_revisar: '#d97706' }
const MAXIMO_ARBITROS = 15

const periodo = ref('todo')

const clipsDelPeriodo = computed(() => {
  const dias = PERIODOS.find(p => p.clave === periodo.value)?.dias
  if (!dias) return props.clips
  const desde = Date.now() - dias * 864e5
  return props.clips.filter(c => new Date(c.publicadoEl).getTime() >= desde)
})

const contar = (lista, clave) => {
  const cuentas = new Map()
  lista.forEach(item => {
    const k = clave(item)
    if (k) cuentas.set(k, (cuentas.get(k) || 0) + 1)
  })
  return [...cuentas].map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad)
}

const cantidadPendientes = computed(() => clipsDelPeriodo.value.filter(c => estadoGeneral(c) === 'pendiente').length)
const cantidadAutorizados = computed(() => clipsDelPeriodo.value.filter(c => c.destinos.some(d => d.estado === 'autorizado')).length)
const valorados = computed(() => clipsDelPeriodo.value.filter(c => c.decision === 'correcta' || c.decision === 'incorrecta'))
const porcentajeCorrectas = computed(() => (valorados.value.length
  ? Math.round((valorados.value.filter(c => c.decision === 'correcta').length / valorados.value.length) * 100)
  : null))

const porSituacion = computed(() => contar(clipsDelPeriodo.value, c => c.etiqueta))
const porAutor = computed(() => contar(clipsDelPeriodo.value, c => c.autor || 'Sin nombre').slice(0, 10))
const porCanal = computed(() => contar(
  clipsDelPeriodo.value.flatMap(c => c.destinos.filter(d => d.estado === 'autorizado')),
  d => d.nombre
))

// Meses del período (o los últimos 12 si es "Todo"), incluidos los que no tienen clips
const porMes = computed(() => {
  const fechas = clipsDelPeriodo.value.map(c => new Date(c.publicadoEl)).filter(d => !Number.isNaN(d.getTime()))
  const hoy = new Date()
  const dias = PERIODOS.find(p => p.clave === periodo.value)?.dias
  const cantidadMeses = dias ? Math.max(1, Math.ceil(dias / 30)) : 12
  const meses = []
  for (let i = cantidadMeses - 1; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const clave = `${d.getFullYear()}-${d.getMonth()}`
    meses.push({
      clave,
      corto: MESES.at(d.getMonth()),
      nombre: `${MESES.at(d.getMonth())} ${d.getFullYear()}`,
      cantidad: fechas.filter(f => `${f.getFullYear()}-${f.getMonth()}` === clave).length
    })
  }
  return meses
})
const maximoMes = computed(() => Math.max(1, ...porMes.value.map(m => m.cantidad)))
const alto = (cantidad) => `${(cantidad / maximoMes.value) * 100}%`

// Por árbitro involucrado: cuántas decisiones correctas, incorrectas y a revisar
const porArbitro = computed(() => {
  const mapa = new Map()
  clipsDelPeriodo.value.forEach(c => {
    if (!DECISIONES[c.decision]) return
    const involucrados = c.arbitros || []
    involucrados.forEach(a => {
      const fila = mapa.get(a.id) || { id: a.id, nombre: a.nombre, correcta: 0, incorrecta: 0, a_revisar: 0, total: 0 }
      fila[c.decision]++
      fila.total++
      mapa.set(a.id, fila)
    })
  })
  return [...mapa.values()].sort((a, b) => b.total - a.total).slice(0, MAXIMO_ARBITROS)
})
const maximoArbitro = computed(() => Math.max(1, ...porArbitro.value.map(a => a.total)))

// Los 10 clips con más vistas (cada persona cuenta una vez por clip)
const masVistos = computed(() => clipsDelPeriodo.value
  .filter(c => c.cantidadVistas > 0)
  .sort((a, b) => b.cantidadVistas - a.cantidadVistas)
  .slice(0, 10))
const maximoVistas = computed(() => Math.max(1, ...masVistos.value.map(c => c.cantidadVistas)))

const ancho = (cantidad, lista) => `${(cantidad / Math.max(1, ...lista.map(f => f.cantidad))) * 100}%`
</script>

<style scoped>
.filtro {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 50rem;
  border: 1px solid var(--o-borde, #e2e8f0);
  background: var(--o-tarjeta, #fff);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--o-texto-medio, #475569);
}
.filtro.activo { background: #0f172a; border-color: var(--o-texto, #0f172a); color: #fff; }

.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
.tarjeta-dato {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 12px;
}
.tarjeta-dato .valor { font-size: 1.6rem; font-weight: 800; color: var(--o-texto, #0f172a); font-variant-numeric: tabular-nums; line-height: 1.1; }
.tarjeta-dato .etiqueta { font-size: 0.75rem; color: var(--o-texto-suave, #64748b); font-weight: 600; }

.titulo-grafico { font-size: 0.9rem; font-weight: 800; color: var(--o-texto, #0f172a); margin-bottom: 10px; }

.barras { display: flex; flex-direction: column; gap: 6px; }
.fila-barra { display: grid; grid-template-columns: minmax(0, 9rem) 1fr 2.5rem; align-items: center; gap: 10px; font-size: 0.8rem; }
.fila-arbitro { grid-template-columns: minmax(0, 9rem) 1fr 5.5rem; }
.nombre { color: var(--o-texto-medio, #475569); font-weight: 600; }
.pista { height: 10px; border-radius: 4px; background: var(--o-chip, #f1f5f9); overflow: hidden; display: flex; }
.barra { display: block; height: 100%; border-radius: 0 4px 4px 0; background: var(--o-texto-medio, #475569); }
.apilada { gap: 2px; background: transparent; }
.segmento { display: block; height: 100%; }
.segmento:last-of-type { border-radius: 0 4px 4px 0; }
.numero { text-align: right; font-weight: 800; color: var(--o-texto, #0f172a); font-variant-numeric: tabular-nums; }
.numero-ancho { font-weight: 700; font-size: 0.75rem; }

.columnas {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 6px;
  height: 160px;
}
.columna { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
.numero-columna { font-size: 0.7rem; font-weight: 800; color: var(--o-texto, #0f172a); font-variant-numeric: tabular-nums; min-height: 1em; }
.pista-columna { flex: 1; width: 100%; max-width: 32px; display: flex; align-items: flex-end; }
.barra-columna { display: block; width: 100%; border-radius: 4px 4px 0 0; background: var(--o-texto-medio, #475569); }
.mes { font-size: 0.7rem; color: var(--o-texto-suave, #64748b); }

.leyenda { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.75rem; font-weight: 600; color: var(--o-texto-medio, #475569); }
.item-leyenda { display: inline-flex; align-items: center; gap: 4px; }
.muestra { width: 10px; height: 10px; border-radius: 2px; }
</style>
