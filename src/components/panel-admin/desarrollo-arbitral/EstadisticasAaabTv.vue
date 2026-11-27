<template>
  <div>
    <!-- Período (un solo filtro, arriba de todo) -->
    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
      <PestanasSeccion v-model="periodo" :pestanas="PERIODOS" aria-label="Período" />
      <span class="small text-muted ms-auto">{{ clipsDelPeriodo.length }} clips en el período</span>
      <BotonHerramienta tipo="excel" :cargando="exportando" :disabled="!clipsDelPeriodo.length" @click="exportarExcel" />
    </div>

    <EstadoVacio v-if="!clipsDelPeriodo.length" icono="bi-bar-chart" titulo="No hay clips en este período" mensaje="Probá con un período más largo." />

    <template v-else>
      <!-- Totales -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3"><div class="card card-body shadow-sm border-light-subtle rounded-3 p-3 h-100 d-flex flex-column gap-1">
          <span class="fs-3 fw-bold text-dark lh-1">{{ clipsDelPeriodo.length }}</span>
          <span class="small text-muted fw-semibold">Clips publicados</span>
        </div></div>
        <div class="col-6 col-lg-3"><div class="card card-body shadow-sm border-light-subtle rounded-3 p-3 h-100 d-flex flex-column gap-1">
          <span class="fs-3 fw-bold text-dark lh-1">{{ cantidadPendientes }}</span>
          <span class="small text-muted fw-semibold">Pendientes de autorizar</span>
        </div></div>
        <div class="col-6 col-lg-3"><div class="card card-body shadow-sm border-light-subtle rounded-3 p-3 h-100 d-flex flex-column gap-1">
          <span class="fs-3 fw-bold text-dark lh-1">{{ cantidadAutorizados }}</span>
          <span class="small text-muted fw-semibold">Autorizados en algún canal</span>
        </div></div>
        <div class="col-6 col-lg-3"><div class="card card-body shadow-sm border-light-subtle rounded-3 p-3 h-100 d-flex flex-column gap-1">
          <span class="fs-3 fw-bold text-dark lh-1">{{ porcentajeCorrectas === null ? '—' : `${porcentajeCorrectas}%` }}</span>
          <span class="small text-muted fw-semibold">Decisiones correctas
            <template v-if="valorados.length">({{ valorados.length }} {{ valorados.length === 1 ? 'valorado' : 'valorados' }})</template>
          </span>
        </div></div>
      </div>

      <div class="row g-4">
        <section class="col-12 col-lg-6">
          <h6 class="fw-bold text-dark text-uppercase small mb-3 pb-2 border-bottom border-2 border-danger">Clips por situación</h6>
          <div class="barras">
            <div v-for="f in porSituacion" :key="f.nombre" class="fila-barra" :title="`${f.nombre}: ${f.cantidad}`">
              <span class="nombre text-truncate">{{ f.nombre }}</span>
              <span class="pista"><span class="barra" :style="{ width: ancho(f.cantidad, porSituacion) }"></span></span>
              <span class="numero">{{ f.cantidad }}</span>
            </div>
          </div>
        </section>

        <section class="col-12 col-lg-6">
          <h6 class="fw-bold text-dark text-uppercase small mb-3 pb-2 border-bottom border-2 border-danger">Autorizados por canal</h6>
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
          <h6 class="fw-bold text-dark text-uppercase small mb-3 pb-2 border-bottom border-2 border-danger">Clips publicados por mes</h6>
          <div class="columnas" role="img" :aria-label="`Clips por mes: ${porMes.map(m => `${m.nombre} ${m.cantidad}`).join(', ')}`">
            <div v-for="m in porMes" :key="m.clave" class="columna" :title="`${m.nombre}: ${m.cantidad}`">
              <span class="numero-columna">{{ m.cantidad || '' }}</span>
              <span class="pista-columna"><span class="barra-columna" :style="{ height: alto(m.cantidad) }"></span></span>
              <span class="mes">{{ m.corto }}</span>
            </div>
          </div>
        </section>

        <section class="col-12 col-lg-7">
          <h6 class="fw-bold text-dark text-uppercase small mb-3 pb-2 border-bottom border-2 border-danger">Decisiones por árbitro</h6>
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

        <!-- Datos de la jugada (si se cargaron al publicar o al revisar) -->
        <section class="col-12 col-lg-6">
          <h6 class="fw-bold text-dark text-uppercase small mb-3 pb-2 border-bottom border-2 border-danger">Clips por zona de la cancha</h6>
          <p v-if="!porZona.length" class="small text-muted">Todavía no hay clips con la zona cargada.</p>
          <div v-else class="barras">
            <div v-for="f in porZona" :key="f.nombre" class="fila-barra" :title="`${f.nombre}: ${f.cantidad}`">
              <span class="nombre text-truncate">{{ f.nombre }}</span>
              <span class="pista"><span class="barra" :style="{ width: ancho(f.cantidad, porZona) }"></span></span>
              <span class="numero">{{ f.cantidad }}</span>
            </div>
          </div>
        </section>

        <section class="col-12 col-lg-6">
          <h6 class="fw-bold text-dark text-uppercase small mb-3 pb-2 border-bottom border-2 border-danger">Sanción aplicada y la que correspondía</h6>
          <p v-if="!sancionesDistintas.length" class="small text-muted">
            No hay clips donde la sanción aplicada difiera de la que correspondía.
          </p>
          <div v-else class="table-responsive">
            <table class="table table-sm table-hover align-middle mb-0 small">
              <thead class="table-light">
                <tr><th scope="col">Aplicada</th><th scope="col">Correspondía</th><th scope="col" class="text-end">Clips</th></tr>
              </thead>
              <tbody>
                <tr v-for="s in sancionesDistintas" :key="`${s.aplicada}-${s.correspondia}`">
                  <td>{{ s.aplicada }}</td><td>{{ s.correspondia }}</td><td class="text-end fw-bold">{{ s.cantidad }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="col-12 col-lg-6">
          <h6 class="fw-bold text-dark text-uppercase small mb-3 pb-2 border-bottom border-2 border-danger">Clips más vistos</h6>
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
          <h6 class="fw-bold text-dark text-uppercase small mb-3 pb-2 border-bottom border-2 border-danger">Quién publica</h6>
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
import { ref, computed, inject } from 'vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import {
  DECISIONES, ESTADOS_DESTINO, ZONAS_CANCHA, EQUIPOS, SANCIONES, estadoGeneral, formatearTiempo
} from '@/composables/useAaabTv'
import { pintarCeldaExcel, pintarCabeceraExcel, anchosColumnasExcel, descargarLibroExcel } from '@/composables/useExcelPlanilla'
import { fechaArg } from '@/utils/fechas'

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

// Por árbitro involucrado: cuántas decisiones correctas, incorrectas y a revisar (todos, para el Excel)
const decisionesPorArbitro = computed(() => {
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
  return [...mapa.values()].sort((a, b) => b.total - a.total)
})
// En pantalla, los que tienen más clips
const porArbitro = computed(() => decisionesPorArbitro.value.slice(0, MAXIMO_ARBITROS))
const maximoArbitro = computed(() => Math.max(1, ...porArbitro.value.map(a => a.total)))

// Datos de la jugada: por zona, y las veces que la sanción aplicada no fue la que correspondía
const porZona = computed(() => contar(clipsDelPeriodo.value, c => ZONAS_CANCHA[c.jugada?.zona]))
const sancionesDistintas = computed(() => {
  const mapa = new Map()
  clipsDelPeriodo.value.forEach(c => {
    const j = c.jugada
    if (!j?.sancion || !j.sancionCorrecta || j.sancion === j.sancionCorrecta) return
    const clave = `${j.sancion}|${j.sancionCorrecta}`
    const fila = mapa.get(clave) || { aplicada: SANCIONES[j.sancion], correspondia: SANCIONES[j.sancionCorrecta], cantidad: 0 }
    fila.cantidad++
    mapa.set(clave, fila)
  })
  return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad)
})

// Los 10 clips con más vistas (cada persona cuenta una vez por clip)
const masVistos = computed(() => clipsDelPeriodo.value
  .filter(c => c.cantidadVistas > 0)
  .sort((a, b) => b.cantidadVistas - a.cantidadVistas)
  .slice(0, 10))
const maximoVistas = computed(() => Math.max(1, ...masVistos.value.map(c => c.cantidadVistas)))

const ancho = (cantidad, lista) => `${(cantidad / Math.max(1, ...lista.map(f => f.cantidad))) * 100}%`

// ─── Exportar a Excel ─────────────────────────────────────
// Un libro con el resumen, una hoja por cada gráfico y el detalle de todos los clips del período
const toast = inject('toast')
const exportando = ref(false)

// Hoja con cabecera fija y bordes en todas las celdas
const agregarHoja = (libro, nombre, cabeceras, filas, anchos, columnasTexto = [0]) => {
  const hoja = libro.addWorksheet(nombre, { views: [{ state: 'frozen', ySplit: 1 }] })
  hoja.addRow(cabeceras)
  filas.forEach(fila => hoja.addRow(fila))
  pintarCabeceraExcel(hoja, 30)
  hoja.eachRow((fila, numero) => {
    if (numero === 1) return
    fila.eachCell({ includeEmpty: true }, (celda, columna) => {
      pintarCeldaExcel(celda, '', { izquierda: columnasTexto.includes(columna - 1), ajustar: true })
    })
  })
  anchosColumnasExcel(hoja, anchos)
  return hoja
}

const porcentaje = (parte, total) => (total ? Math.round((parte / total) * 100) : null)

const exportarExcel = async () => {
  exportando.value = true
  try {
    const { default: ExcelJS } = await import('exceljs')
    const libro = new ExcelJS.Workbook()
    const nombrePeriodo = PERIODOS.find(p => p.clave === periodo.value)?.etiqueta || 'Todo'

    agregarHoja(libro, 'Resumen', ['Dato', 'Valor'], [
      ['Período', nombrePeriodo],
      ['Exportado el', new Date().toLocaleString('es-AR')],
      ['Clips publicados', clipsDelPeriodo.value.length],
      ['Pendientes de autorizar', cantidadPendientes.value],
      ['Autorizados en algún canal', cantidadAutorizados.value],
      ['Decisiones valoradas (correctas o incorrectas)', valorados.value.length],
      ['Decisiones correctas (%)', porcentajeCorrectas.value ?? '—'],
      ['Vistas registradas', clipsDelPeriodo.value.reduce((s, c) => s + (c.cantidadVistas || 0), 0)]
    ], [44, 24])

    agregarHoja(libro, 'Por situación', ['Situación', 'Clips'],
      porSituacion.value.map(f => [f.nombre, f.cantidad]), [30, 10])

    agregarHoja(libro, 'Por canal', ['Canal', 'Clips autorizados'],
      porCanal.value.map(f => [f.nombre, f.cantidad]), [30, 18])

    agregarHoja(libro, 'Por mes', ['Mes', 'Clips publicados'],
      porMes.value.map(m => [m.nombre, m.cantidad]), [16, 18])

    agregarHoja(libro, 'Decisiones por árbitro', ['Árbitro', 'Correctas', 'Incorrectas', 'A revisar', 'Total', 'Correctas (%)'],
      decisionesPorArbitro.value.map(a => [
        a.nombre, a.correcta, a.incorrecta, a.a_revisar, a.total,
        porcentaje(a.correcta, a.correcta + a.incorrecta) ?? '—'
      ]), [32, 12, 12, 12, 10, 14])

    agregarHoja(libro, 'Por zona', ['Zona de la cancha', 'Clips'],
      porZona.value.map(f => [f.nombre, f.cantidad]), [32, 10])

    agregarHoja(libro, 'Sanciones', ['Sanción aplicada', 'Correspondía', 'Clips'],
      sancionesDistintas.value.map(s => [s.aplicada, s.correspondia, s.cantidad]), [32, 32, 10], [0, 1])

    agregarHoja(libro, 'Quién publica', ['Autor', 'Clips'],
      contar(clipsDelPeriodo.value, c => c.autor || 'Sin nombre').map(f => [f.nombre, f.cantidad]), [32, 10])

    agregarHoja(libro, 'Clips', [
      'Título', 'Situación', 'Partido', 'Fecha', 'Minuto', 'Duración', 'Origen', 'Publicó', 'Publicado el',
      'Estado', 'Canales', 'Decisión', 'Árbitros involucrados', 'Zona', 'Equipo', 'Sanción aplicada', 'Correspondía',
      'Vistas', 'Descripción'
    ], [...clipsDelPeriodo.value]
      .sort((a, b) => String(b.publicadoEl || '').localeCompare(String(a.publicadoEl || '')))
      .map(c => [
        c.titulo,
        c.etiqueta,
        c.partido || '',
        fechaArg(c.fecha),
        c.origen === 'externo' ? '' : formatearTiempo((c.inicio + c.fin) / 2),
        formatearTiempo(c.fin - c.inicio),
        c.origen === 'externo' ? 'Video externo' : 'Análisis',
        c.autor || '',
        c.publicadoEl ? new Date(c.publicadoEl).toLocaleString('es-AR') : '',
        ESTADOS_DESTINO[estadoGeneral(c)]?.etiqueta || '',
        c.destinos.map(d => `${d.nombre}: ${ESTADOS_DESTINO[d.estado]?.etiqueta || d.estado}`).join(' · '),
        DECISIONES[c.decision]?.etiqueta || 'Sin valorar',
        (c.arbitros || []).map(a => a.nombre).join(' · '),
        ZONAS_CANCHA[c.jugada?.zona] || '',
        EQUIPOS[c.jugada?.equipo] || '',
        SANCIONES[c.jugada?.sancion] || '',
        SANCIONES[c.jugada?.sancionCorrecta] || '',
        c.cantidadVistas || 0,
        c.descripcion || ''
      ]), [36, 18, 28, 12, 9, 10, 14, 22, 18, 14, 40, 13, 34, 24, 12, 26, 26, 8, 50], [0, 1, 2, 7, 10, 12, 13, 15, 16, 18])

    const hoy = new Date().toISOString().slice(0, 10)
    await descargarLibroExcel(libro, `aaab-tv-estadisticas-${periodo.value === 'todo' ? 'todo' : `${periodo.value}-dias`}-${hoy}.xlsx`)
  } catch (e) {
    console.error('Exportar estadísticas de AAAB TV:', e)
    toast({ tipo: 'danger', titulo: 'No se pudo exportar', mensaje: 'Intentá de nuevo en un rato.' })
  } finally {
    exportando.value = false
  }
}
</script>

<style scoped>



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
