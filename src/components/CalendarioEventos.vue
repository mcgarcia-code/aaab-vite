<template>
  <div class="calendario-eventos">
    <div class="alert alert-warning d-flex align-items-start gap-2 py-2 px-3 small mb-3 border-warning-subtle">
      <i class="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1"></i>
      <span class="fw-semibold">{{ AVISO_MARTES }}</span>
    </div>

    <div class="d-flex justify-content-between align-items-center mb-2 gap-2">
      <button type="button" class="btn btn-light border btn-sm rounded-pill px-3" @click="moverMes(-1)" aria-label="Mes anterior">
        <i class="bi bi-chevron-left"></i>
      </button>
      <div class="text-center">
        <div class="fw-bold text-dark text-capitalize">{{ tituloMes }}</div>
        <button type="button" class="btn btn-link btn-sm p-0 text-danger text-decoration-none small" @click="irAHoy">Hoy</button>
      </div>
      <button type="button" class="btn btn-light border btn-sm rounded-pill px-3" @click="moverMes(1)" aria-label="Mes siguiente">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <div v-if="error" class="alert alert-danger py-2 px-3 small">{{ error }}</div>

    <div class="cal-grid position-relative">
      <div v-for="d in DIAS_SEMANA" :key="d" class="cal-head">{{ d }}</div>

      <button
        v-for="dia in dias"
        :key="dia.fecha"
        type="button"
        class="cal-dia"
        :class="{
          'fuera-mes': !dia.delMes,
          'es-hoy': dia.fecha === hoy,
          'activo': dia.fecha === diaActivo,
          'elegido': dia.fecha === fechaSeleccionada,
          'bloqueado': esBloqueado(dia.fecha)
        }"
        @click="clickDia(dia)"
      >
        <div class="d-flex justify-content-between align-items-start">
          <span class="num">{{ dia.numero }}</span>
          <i v-if="dia.superpuestos" class="bi bi-exclamation-circle-fill text-danger" :title="`${dia.eventos.length} eventos este día`"></i>
        </div>
        <div class="d-flex flex-column gap-1 mt-1 w-100">
          <span
            v-for="c in dia.chips.slice(0, 3)"
            :key="c.clave"
            class="chip"
            :class="{ pendiente: c.pendiente }"
            :style="{ background: c.color }"
            :title="`${c.grupo} · ${c.titulo} (${c.categoria})${c.pendiente ? ' · pendiente de aprobación' : ''}`"
          ><i v-if="c.pendiente" class="bi bi-hourglass-split me-1"></i>{{ c.grupo }}</span>
          <span v-if="dia.chips.length > 3" class="mas">+{{ dia.chips.length - 3 }}</span>
        </div>
      </button>

      <div v-if="cargando" class="cal-cargando">
        <span class="spinner-border spinner-border-sm text-danger"></span>
      </div>
    </div>

    <div v-if="grupos.length" class="d-flex flex-wrap gap-1 mt-3">
      <button
        v-for="g in leyenda"
        :key="g.id"
        type="button"
        class="leyenda-item"
        :class="{ oculto: gruposOcultos.includes(g.id) }"
        @click="toggleGrupo(g.id)"
        :title="gruposOcultos.includes(g.id) ? 'Mostrar' : 'Ocultar'"
      >
        <span class="punto" :style="{ background: g.color }"></span>
        {{ g.nombre }}<span v-if="gruposDestacados.includes(g.id)" class="fw-bold"> (tu grupo)</span>
      </button>
    </div>

    <div v-if="diaActivo" class="detalle-dia mt-3 p-3 rounded-3 border bg-light">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
        <span class="fw-bold text-dark text-capitalize">{{ tituloDia(diaActivo) }}</span>
        <button
          v-if="editable"
          type="button"
          class="btn btn-sm btn-danger rounded-pill px-3 fw-bold"
          @click="emit('nuevo', diaActivo)"
        >
          <i class="bi bi-plus-lg me-1"></i>Nuevo evento
        </button>
      </div>

      <p v-if="!eventosDiaActivo.length" class="text-muted small m-0">No hay eventos este día.</p>
      <div v-else class="d-flex flex-column gap-2">
        <div v-for="ev in eventosDiaActivo" :key="ev.id" class="detalle-evento bg-white border rounded-3 p-2 d-flex gap-2" :style="{ borderLeftColor: colorEvento(ev) }">
          <div class="flex-grow-1 min-w-0">
            <div class="fw-bold text-dark text-break">{{ ev.titulo }}</div>
            <div class="small text-muted text-break">{{ ev.descripcion || 'Lugar a confirmar' }}</div>
            <div class="d-flex flex-wrap gap-1 mt-1">
              <span class="badge text-bg-light border text-uppercase">{{ ev.categoria }}</span>
              <span v-if="ev.aprobacion === 'pendiente'" class="badge text-bg-warning"><i class="bi bi-hourglass-split me-1"></i>PENDIENTE DE APROBACIÓN</span>
              <span v-if="ev.todosLosGrupos" class="badge" :style="{ background: COLOR_TODOS }">TODOS</span>
              <span v-for="id in ev.idsGrupos" :key="id" class="badge" :style="{ background: colorGrupo(id) }">{{ nombreGrupo(id) }}</span>
            </div>
          </div>
          <div v-if="editable" class="d-flex flex-column gap-1 flex-shrink-0">
            <template v-if="puedeAprobar && ev.aprobacion === 'pendiente'">
              <button type="button" class="btn btn-success btn-sm p-1" title="Aprobar" @click="emit('aprobar', ev)">
                <span class="material-icons" style="font-size:16px;">check</span>
              </button>
              <button type="button" class="btn btn-outline-danger btn-sm p-1" title="Rechazar" @click="emit('rechazar', ev)">
                <span class="material-icons" style="font-size:16px;">block</span>
              </button>
            </template>
            <button type="button" class="btn btn-light btn-sm border p-1 text-primary" title="Editar" @click="emit('editar', ev)">
              <span class="material-icons" style="font-size:16px;">edit</span>
            </button>
            <button v-if="puedeEliminar" type="button" class="btn btn-light btn-sm border p-1 text-danger" title="Eliminar" @click="emit('eliminar', ev)">
              <span class="material-icons" style="font-size:16px;">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '@/api/api'

const props = defineProps({
  editable: { type: Boolean, default: false },
  fechaSeleccionada: { type: String, default: '' },
  fechaMinima: { type: String, default: '' },
  gruposDestacados: { type: Array, default: () => [] },
  filtro: { type: Function, default: null },
  puedeAprobar: { type: Boolean, default: false },
  puedeEliminar: { type: Boolean, default: true },
})
const emit = defineEmits(['update:fechaSeleccionada', 'editar', 'eliminar', 'nuevo', 'cargado', 'aprobar', 'rechazar'])

const AVISO_MARTES = 'Los días martes hay curso de árbitros, solo se puede programar una reunión en el Dickens.'
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const PALETA = ['#e63946', '#1d4ed8', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#b45309', '#4f46e5', '#0f766e', '#c2410c', '#9333ea', '#be123c', '#0369a1', '#15803d']
const COLOR_TODOS = '#343a40'
const CATEGORIAS_SIN_SUPERPOSICION = ['recordatorio']

const aISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const desdeISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const hoy = aISO(new Date())

const mesVisible = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const eventos = ref([])
const grupos = ref([])
const cargando = ref(false)
const error = ref('')
const gruposOcultos = ref([])
const diaActivo = ref('')

const rango = computed(() => {
  const primero = mesVisible.value
  const offset = (primero.getDay() + 6) % 7
  const inicio = new Date(primero.getFullYear(), primero.getMonth(), 1 - offset)
  const fin = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 41)
  return { inicio, fin }
})

const tituloMes = computed(() => mesVisible.value.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }))

const colores = computed(() => {
  const mapa = {}
  grupos.value.forEach((g, i) => { mapa[g.id] = PALETA[i % PALETA.length] })
  return mapa
})
const nombres = computed(() => Object.fromEntries(grupos.value.map(g => [g.id, g.nombre])))

const colorGrupo = (id) => colores.value[id] || '#6c757d'
const nombreGrupo = (id) => nombres.value[id] || `Grupo ${id}`
const colorEvento = (ev) => {
  if (ev.todosLosGrupos) return COLOR_TODOS
  const visible = ev.idsGrupos.find(id => !gruposOcultos.value.includes(id))
  return colorGrupo(visible ?? ev.idsGrupos[0])
}

const leyenda = computed(() => [
  { id: 0, nombre: 'Todos', color: COLOR_TODOS },
  ...grupos.value.map(g => ({ id: g.id, nombre: g.nombre, color: colorGrupo(g.id) })),
])

const eventoVisible = (ev) => {
  if (props.filtro && !props.filtro(ev)) return false
  if (ev.todosLosGrupos) return !gruposOcultos.value.includes(0)
  if (!ev.idsGrupos.length) return true
  return ev.idsGrupos.some(id => !gruposOcultos.value.includes(id))
}

const eventosPorDia = computed(() => {
  const mapa = {}
  eventos.value.filter(eventoVisible).forEach(ev => {
    (mapa[ev.fecha_evento] ||= []).push(ev)
  })
  return mapa
})

const chipsDe = (evs) => evs.flatMap(ev => {
  const base = { titulo: ev.titulo, categoria: ev.categoria, pendiente: ev.aprobacion === 'pendiente' }
  if (ev.todosLosGrupos || !ev.idsGrupos.length) {
    return [{ ...base, clave: `${ev.id}-t`, grupo: 'Todos', color: COLOR_TODOS }]
  }
  return ev.idsGrupos
    .filter(id => !gruposOcultos.value.includes(id))
    .map(id => ({ ...base, clave: `${ev.id}-${id}`, grupo: nombreGrupo(id), color: colorGrupo(id) }))
})

const dias = computed(() => {
  const lista = []
  const { inicio } = rango.value
  for (let i = 0; i < 42; i++) {
    const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
    const fecha = aISO(d)
    const evs = eventosPorDia.value[fecha] || []
    lista.push({
      fecha,
      numero: d.getDate(),
      delMes: d.getMonth() === mesVisible.value.getMonth(),
      eventos: evs,
      chips: chipsDe(evs),
      superpuestos: evs.filter(e => !CATEGORIAS_SIN_SUPERPOSICION.includes(e.categoria)).length > 1,
    })
  }
  return lista
})

const eventosDiaActivo = computed(() => eventosPorDia.value[diaActivo.value] || [])

const tituloDia = (fecha) => desdeISO(fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

const esBloqueado = (fecha) => !props.editable && !!props.fechaMinima && fecha < props.fechaMinima

const clickDia = (dia) => {
  diaActivo.value = dia.fecha
  if (!dia.delMes) mesVisible.value = new Date(desdeISO(dia.fecha).getFullYear(), desdeISO(dia.fecha).getMonth(), 1)
  if (!props.editable && !esBloqueado(dia.fecha)) emit('update:fechaSeleccionada', dia.fecha)
}

const moverMes = (delta) => {
  const m = mesVisible.value
  mesVisible.value = new Date(m.getFullYear(), m.getMonth() + delta, 1)
}
const irAFecha = (fecha) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) return
  const d = desdeISO(fecha)
  mesVisible.value = new Date(d.getFullYear(), d.getMonth(), 1)
  diaActivo.value = fecha
}
const irAHoy = () => {
  const d = new Date()
  mesVisible.value = new Date(d.getFullYear(), d.getMonth(), 1)
  diaActivo.value = hoy
}

const toggleGrupo = (id) => {
  gruposOcultos.value = gruposOcultos.value.includes(id)
    ? gruposOcultos.value.filter(g => g !== id)
    : [...gruposOcultos.value, id]
}

let pedido = 0
const recargar = async () => {
  const actual = ++pedido
  cargando.value = true
  error.value = ''
  try {
    const res = await api.get({
      entity: 'eventos',
      action: 'obtenerAgenda',
      payload: { desde: aISO(rango.value.inicio), hasta: aISO(rango.value.fin) },
    })
    if (actual !== pedido) return
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar la agenda')
    eventos.value = (res.payload?.eventos || []).map(e => ({ ...e, idsGrupos: (e.idsGrupos || []).map(Number) }))
    grupos.value = (res.payload?.grupos || []).map(g => ({ ...g, id: Number(g.id) }))
    emit('cargado', eventos.value)
  } catch (e) {
    if (actual !== pedido) return
    error.value = e?.message || 'No se pudo cargar la agenda'
  } finally {
    if (actual === pedido) cargando.value = false
  }
}

watch(() => props.fechaSeleccionada, (f) => {
  if (!f || !/^\d{4}-\d{2}-\d{2}$/.test(f)) return
  diaActivo.value = f
  const d = desdeISO(f)
  if (d.getFullYear() !== mesVisible.value.getFullYear() || d.getMonth() !== mesVisible.value.getMonth()) {
    mesVisible.value = new Date(d.getFullYear(), d.getMonth(), 1)
  }
}, { immediate: true })

watch(mesVisible, recargar)
onMounted(recargar)

defineExpose({ recargar, irAFecha })
</script>

<style scoped>
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
}
.cal-head {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6c757d;
  padding: 4px 0;
}
.cal-dia {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
  min-height: 56px;
  padding: 4px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}
.cal-dia:hover { border-color: #adb5bd; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); }
.cal-dia.fuera-mes { opacity: 0.45; }
.cal-dia.es-hoy .num { background: #dc3545; color: #fff; border-radius: 999px; padding: 0 6px; }
.cal-dia.activo { border-color: #212529; box-shadow: 0 0 0 1px #212529; }
.cal-dia.elegido { border-color: #dc3545; box-shadow: 0 0 0 2px #dc3545; }
.cal-dia.bloqueado { cursor: not-allowed; background: #f8f9fa; }
.cal-dia.bloqueado .num { color: #adb5bd; }
.num { font-size: 0.8rem; font-weight: 700; color: #212529; }
.chip {
  display: block;
  color: #fff;
  font-size: 0.55rem;
  font-weight: 700;
  line-height: 1.3;
  padding: 1px 3px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chip.pendiente {
  background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.28) 0 4px, transparent 4px 8px) !important;
  opacity: 0.8;
  outline: 1px dashed rgba(0, 0, 0, 0.45);
  outline-offset: -1px;
}
.mas { font-size: 0.65rem; color: #6c757d; font-weight: 600; }
.punto { display: inline-block; width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; }
.cal-cargando {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
}
.leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff;
  color: #212529;
}
.leyenda-item.oculto { opacity: 0.4; text-decoration: line-through; }
.detalle-evento { border-left-width: 4px !important; }
.min-w-0 { min-width: 0; }
@media (min-width: 768px) {
  .cal-dia { min-height: 96px; padding: 6px; }
  .chip { font-size: 0.68rem; padding: 1px 5px; }
}
</style>
