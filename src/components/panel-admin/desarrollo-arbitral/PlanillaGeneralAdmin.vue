<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- ============ HEADER ============ -->
        <div class="card-header bg-white py-3 border-bottom">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-table me-1"></i> Planilla General de Árbitros
            </h4>
            <span class="text-muted small d-block mt-1">
              Asambleas, recuperatorios y reuniones. Hacé clic en una celda de Teórico o Físico para editarla.
            </span>
          </div>
        </div>

        <!-- ============ BODY ============ -->
        <div class="card-body p-0">

          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="text-muted mt-3 mb-0">Cargando planilla...</p>
          </div>

          <template v-else>

            <!-- Barra de herramientas: filtro + solo activos + descargar, en una fila -->
            <div class="d-flex flex-wrap gap-3 align-items-center px-3 py-2 border-bottom bg-light small">
              <div class="form-check form-switch mb-0">
                <input v-model="soloActivos" class="form-check-input" type="checkbox" id="chkSoloActivos">
                <label class="form-check-label text-muted" for="chkSoloActivos">Solo activos</label>
              </div>
              <div class="busqueda-wrap">
                <input
                  v-model="busqueda"
                  class="form-control form-control-sm shadow-none"
                  placeholder="Buscar árbitro..."
                >
                <button
                  v-if="busqueda"
                  class="btn-limpiar-busqueda"
                  @click="busqueda = ''"
                  title="Limpiar búsqueda"
                  type="button"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <button
                @click="descargarExcel"
                class="btn btn-success btn-sm fw-bold d-flex align-items-center gap-1"
                :disabled="cargando"
              >
                <i class="bi bi-file-earmark-excel-fill"></i> Descargar Excel
              </button>
              <span class="ms-auto d-flex flex-wrap gap-3">
                <span><span class="cuadrito bg-success-subtle border-success-subtle"></span> Aprobado / Teórico ≥ 75 / Presente</span>
                <span><span class="cuadrito bg-danger-subtle border-danger-subtle"></span> Desaprobado / Teórico ≤ 74 / Ausente</span>
                <span><span class="cuadrito bg-secondary-subtle border-secondary-subtle"></span> No lo hizo</span>
              </span>
            </div>

            <!-- Solapas de grupo (arriba, cada una con su color) -->
            <div class="hojas-excel border-bottom">
              <button
                v-for="(g, i) in gruposTabs"
                :key="g.clave"
                class="hoja-tab"
                :class="{ activa: g.clave === grupoActivo?.clave }"
                :style="estiloTab(g, i)"
                @click="grupoActivo = g"
              >
                <span class="punto-color" :style="{ backgroundColor: colorDeGrupo(i) }"></span>
                {{ etiquetaGrupo(g) }}
                <span class="badge-cantidad">{{ contarArbitros(g) }}</span>
              </button>
              <span class="ms-auto pe-3 align-self-center text-muted small text-nowrap">
                {{ arbitrosVisibles.length }} árbitros en {{ etiquetaGrupo(grupoActivo) }}
              </span>
            </div>

            <!-- Tabla tipo Excel -->
            <div class="tabla-scroll">
              <table class="tabla-excel">
                <thead>
                  <tr>
                    <th class="col-arbitro esquina" rowspan="2">ÁRBITRO</th>
                    <template v-for="col in columnasGrupo" :key="'h1-' + col.clave">
                      <th v-if="col.esExamen" colspan="2" class="th-evento" :title="col.titulo">
                        <div class="fw-bold text-uppercase texto-recortado">{{ col.titulo }}</div>
                        <div class="fecha-evento">{{ col.fechaCorta }}</div>
                      </th>
                      <th v-else rowspan="2" class="th-reunion" :class="{ 'sep-reuniones': col.separador }" :title="col.titulo">
                        <span class="fw-bold">{{ col.fechaCorta }}</span>
                      </th>
                    </template>
                    <th v-if="columnasGrupo.length === 0" class="text-muted fst-italic fw-normal">
                      Sin eventos para este grupo
                    </th>
                  </tr>
                  <tr>
                    <template v-for="col in columnasGrupo" :key="'h2-' + col.clave">
                      <template v-if="col.esExamen">
                        <th class="th-subtipo">TEÓRICO</th>
                        <th class="th-subtipo">FÍSICO</th>
                      </template>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="a in arbitrosVisibles" :key="a.id">
                    <td class="col-arbitro celda-nombre">
                      {{ a.apellido }}, {{ a.nombre }}
                    </td>
                    <template v-for="col in columnasGrupo" :key="a.id + '-' + col.clave">
                      <template v-if="col.esExamen">
                        <td
                          v-for="tipoDet in ['teorico', 'fisico']"
                          :key="col.clave + '-' + tipoDet"
                          class="celda celda-editable"
                          :class="claseCeldaExamen(a, col, tipoDet)"
                          @click="abrirEditor(a, col, tipoDet)"
                          title="Clic para editar"
                        >
                          <div v-if="esCeldaEnEdicion(a, col, tipoDet)" class="editor-celda" @click.stop>
                            <input
                              v-if="tipoDet === 'teorico' && editor.estado !== 'ausente' && editor.estado !== 'no lo hizo'"
                              v-model="editor.calificacion"
                              @input="alTipearNota"
                              @keyup.enter="guardarEditor"
                              @keyup.esc="cerrarEditor"
                              class="editor-input"
                              placeholder="Nota"
                              ref="editorInputRef"
                            >
                            <select v-model="editor.estado" class="editor-select" @keyup.enter="guardarEditor">
                              <option value="aprobado">Aprobado</option>
                              <option value="desaprobado">Desaprobado</option>
                              <option value="no lo hizo">No lo hizo</option>
                              <option value="ausente">Ausente</option>
                            </select>
                            <div class="editor-botones">
                              <button class="btn-mini ok" @click="guardarEditor" :disabled="editor.guardando" title="Guardar">
                                <i class="bi" :class="editor.guardando ? 'bi-hourglass-split' : 'bi-check-lg'"></i>
                              </button>
                              <button class="btn-mini borrar" @click="borrarCelda" :disabled="editor.guardando" title="Borrar contenido">
                                <i class="bi bi-trash"></i>
                              </button>
                              <button class="btn-mini no" @click="cerrarEditor" title="Cancelar">
                                <i class="bi bi-x-lg"></i>
                              </button>
                            </div>
                          </div>
                          <template v-else>{{ textoCeldaExamen(a, col, tipoDet) }}</template>
                        </td>
                      </template>
                      <td v-else class="celda" :class="[claseCeldaReunion(a, col), { 'sep-reuniones': col.separador }]">
                        {{ textoCeldaReunion(a, col) }}
                      </td>
                    </template>
                    <td v-if="columnasGrupo.length === 0"></td>
                  </tr>
                  <tr v-if="arbitrosVisibles.length === 0">
                    <td class="col-arbitro celda-nombre text-muted fst-italic">Sin árbitros</td>
                    <td :colspan="totalColumnasFisicas || 1" class="text-muted fst-italic px-3">
                      No hay árbitros para mostrar en este grupo.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, inject } from 'vue'
import { api } from '@/api/api'
//import ExcelJS from 'exceljs'
import { useHead } from '@vueuse/head';

// Actualización de Meta Tags
useHead({
  title: 'Planilla General de árbitros | AAAB',
  meta: [
    { name: 'description', content: 'Planilla general de árbitros para la AAAB.' }
  ],
})

const notificar = inject('notificar', (msg) => alert(msg.mensaje || msg))

/* ====================================================
   ESTADO
   ==================================================== */
const cargando = ref(true)
const soloActivos = ref(false)
const busqueda = ref('')

const arbitros = ref([])
const grupos = ref([])
const eventosExamen = ref([])   // asambleas y recuperatorios
const reuniones = ref([])       // eventos categoría reunion
const notasExamenes = ref({})   // "idEvento|idArbitro|tipo" -> { calificacion, estado }
const asistencias = ref({})     // "idEvento|idArbitro" -> 'presente' | 'ausente'

const grupoActivo = ref(null)

/* ====================================================
   UTILIDADES
   ==================================================== */
const normalizar = (v) => {
  return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

// Acepta 'dd/mm/yyyy', 'yyyy-mm-dd' y 'yyyy-mm-dd hh:mm:ss'
const parseFechaFlexible = (f) => {
  const texto = String(f || '').trim()
  let m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()
  m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  if (m) {
    const anio = m[3].length === 2 ? '20' + m[3] : m[3]
    return new Date(Number(anio), Number(m[2]) - 1, Number(m[1])).getTime()
  }
  return 0
}

const fechaCortaDe = (f) => {
  const ts = parseFechaFlexible(f)
  if (!ts) return ''
  const d = new Date(ts)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

/* ====================================================
   CARGA DE DATOS
   ==================================================== */
const cargarArbitros = async () => {
  try {
    const res = await api.get({
      entity: 'arbitros',
      action: 'getArbitrosBasico',
      payload: { soloActivos: soloActivos.value }
    })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (e) { console.error('cargarArbitros:', e) }
}

const cargarGrupos = async () => {
  try {
    const res = await api.get({ entity: 'grupos', action: 'obtenerGrupos' })
    if ((res.ok || res.success) && res.payload) grupos.value = res.payload
  } catch (e) { console.error('cargarGrupos:', e) }
}

const cargarEventosExamen = async () => {
  try {
    const res = await api.get({ entity: 'eventos', action: 'obtenerEventosParaExamen' })
    if ((res.ok || res.success) && res.payload) {
      eventosExamen.value = res.payload.filter(ev => ['asamblea', 'recuperatorio'].includes(ev.categoria))
    }
  } catch (e) { console.error('cargarEventosExamen:', e) }
}

const cargarReuniones = async () => {
  try {
    const res = await api.get({ entity: 'reuniones', action: 'obtenerReuniones' })
    if ((res.ok || res.success) && res.payload) {
      reuniones.value = res.payload.filter(r => r.categoria === 'reunion')
    }
  } catch (e) { console.error('cargarReuniones:', e) }
}

// Notas de TODOS los árbitros: una fila por evaluación (teorico/fisico).
// Usa la acción obtenerNotasPlanilla (hay que agregarla en examenes.php).
// Los registros viejos guardan el estado como número: 1 aprobado,
// 2 desaprobado, 3 no lo hizo, 4 borrado. Los nuevos usan texto.
const MAPA_ESTADOS_NUMERICOS = { '1': 'aprobado', '2': 'desaprobado', '3': 'no lo hizo' }

const cargarNotas = async () => {
  try {
    const res = await api.get({ entity: 'examenes', action: 'obtenerNotasPlanilla' })
    if ((res.ok || res.success) && res.payload && Array.isArray(res.payload)) {
      const mapa = {}
      res.payload.forEach(row => {
        let estado = String(row.estado ?? '').trim().toLowerCase()
        if (estado === '4') return // borrado lógico
        if (MAPA_ESTADOS_NUMERICOS[estado]) estado = MAPA_ESTADOS_NUMERICOS[estado]
        if (!row.tipo) return
        const clave = `${row.id_evento}|${row.id_arbitro}|${String(row.tipo).trim().toLowerCase()}`
        mapa[clave] = {
          calificacion: row.calificacion,
          estado
        }
      })
      notasExamenes.value = mapa
    } else {
      console.error('obtenerNotasPlanilla no devolvió datos. ¿Se agregó la función en examenes.php?', res)
    }
  } catch (e) { console.error('cargarNotas:', e) }
}

// Asistencias de TODOS los eventos, leídas directo de eventos_asistencia
// (estado 1 = presente, 0 = ausente). Al no pasar por la lista de árbitros,
// también trae las ausencias de los árbitros inactivos.
const cargarAsistencias = async () => {
  try {
    const res = await api.get({ entity: 'reuniones', action: 'obtenerAsistenciasPlanilla' })
    if ((res.ok || res.success) && res.payload && Array.isArray(res.payload)) {
      const mapa = {}
      res.payload.forEach(row => {
        const estado = Number(row.estado)
        let asis = ''
        if (estado === 1) asis = 'presente'
        else if (estado === 0) asis = 'ausente'
        if (asis) mapa[`${row.id_evento}|${row.id_arbitro}`] = asis
      })
      asistencias.value = mapa
    } else {
      console.error('obtenerAsistenciasPlanilla no devolvió datos. ¿Se agregó la función en reuniones.php?', res)
    }
  } catch (e) { console.error('cargarAsistencias:', e) }
}

const cargarTodo = async () => {
  cargando.value = true
  await Promise.all([
    cargarArbitros(), cargarGrupos(), cargarEventosExamen(),
    cargarReuniones(), cargarNotas(), cargarAsistencias()
  ])
  if (!grupoActivo.value && gruposTabs.value.length > 0) grupoActivo.value = gruposTabs.value[0]
  cargando.value = false
}

watch(soloActivos, async () => {
  cargando.value = true
  await cargarArbitros()
  cargando.value = false
})

onMounted(cargarTodo)

/* ====================================================
   GRUPOS (SOLAPAS)
   ==================================================== */
const etiquetaGrupo = (g) => {
  if (!g) return ''
  if (g.clave === 'singrupo') return 'Sin grupo'
  return g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre
}

const perteneceAlGrupo = (a, g) => {
  const grupoArb = a.nombre_grupo || a.grupo || ''
  const subArb = a.subgrupo || ''
  if (g.clave === 'singrupo') {
    // Árbitro que no matchea con ningún grupo de la lista
    return !grupos.value.some(gr =>
      normalizar(grupoArb) === normalizar(gr.nombre) &&
      normalizar(subArb) === normalizar(gr.subgrupo || '')
    )
  }
  return normalizar(grupoArb) === normalizar(g.nombre) &&
         normalizar(subArb) === normalizar(g.subgrupo || '')
}

const gruposTabs = computed(() => {
  const tabs = grupos.value.map(g => ({
    ...g,
    clave: `${g.id}`,
  }))
  // Solapa extra para árbitros sin grupo asignado (solo si existen)
  const sinGrupo = { clave: 'singrupo', id: null, nombre: 'Sin grupo', subgrupo: '' }
  const haySinGrupo = arbitros.value.some(a => perteneceAlGrupo(a, sinGrupo))
  return haySinGrupo ? [...tabs, sinGrupo] : tabs
})

const contarArbitros = (g) => arbitros.value.filter(a => perteneceAlGrupo(a, g)).length

/* Colores para distinguir los grupos en las solapas */
const PALETA_GRUPOS = ['#0d6efd', '#6f42c1', '#d63384', '#fd7e14', '#198754', '#20c997', '#0dcaf0', '#dc3545', '#6610f2', '#795548', '#607d8b', '#9e9d24']
const colorDeGrupo = (indice) => PALETA_GRUPOS[indice % PALETA_GRUPOS.length]

const estiloTab = (g, indice) => {
  const color = colorDeGrupo(indice)
  const activa = g.clave === grupoActivo.value?.clave
  return {
    borderTop: `3px solid ${color}`,
    backgroundColor: activa ? '#fff' : color + '14', // tinte suave al color cuando está inactiva
    color: activa ? color : '#495057'
  }
}

const arbitrosDelGrupo = computed(() => {
  if (!grupoActivo.value) return []
  return arbitros.value
    .filter(a => perteneceAlGrupo(a, grupoActivo.value))
    .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'))
})

const arbitrosVisibles = computed(() => {
  const b = normalizar(busqueda.value)
  if (!b) return arbitrosDelGrupo.value
  return arbitrosDelGrupo.value.filter(a => normalizar(`${a.apellido} ${a.nombre}`).includes(b))
})

/* ====================================================
   COLUMNAS DEL GRUPO ACTIVO (orden cronológico)
   Asamblea (Teó/Fís) → Recuperatorio (Teó/Fís) → Reuniones →
   siguiente asamblea... según las fechas de los eventos.
   ==================================================== */
const examenAplicaAlGrupo = (ev, g) => {
  if (Number(ev.todos_grupos) === 1) return true
  if (g.clave === 'singrupo') return Number(ev.todos_grupos) === 1
  if (!g.id) return true
  return String(ev.id_grupos ?? '').split(',').map(s => s.trim()).includes(String(g.id))
}

const reunionAplicaAlGrupo = (r, g) => {
  if (r.todosLosGrupos || Number(r.todos_grupos) === 1) return true
  if (g.clave === 'singrupo') return false
  // Por ids si vienen; si no, por nombres de grupo
  const ids = String(r.id_grupos ?? '').split(',').map(s => s.trim()).filter(Boolean)
  if (ids.length > 0 && g.id) return ids.includes(String(g.id))
  const nombres = (r.nombresGrupos || []).map(normalizar)
  return nombres.includes(normalizar(etiquetaGrupo(g))) || nombres.includes(normalizar(g.nombre))
}

const fechaDeEvento = (ev) => ev.fecha_examen || ev.fecha_formateada || ev.fecha_evento || ev.fecha || ''

const columnasGrupo = computed(() => {
  if (!grupoActivo.value) return []
  const g = grupoActivo.value

  // Primero todos los exámenes (asambleas y recuperatorios) por fecha,
  // después todas las reuniones por fecha: bloques contiguos.
  const examenes = eventosExamen.value
    .filter(ev => examenAplicaAlGrupo(ev, g))
    .map(ev => ({
      clave: `ex-${ev.id}`,
      esExamen: true,
      id: ev.id,
      titulo: ev.titulo || (ev.categoria === 'recuperatorio' ? 'Recuperatorio' : 'Asamblea'),
      categoria: ev.categoria,
      fechaCorta: fechaCortaDe(fechaDeEvento(ev)),
      _ts: parseFechaFlexible(fechaDeEvento(ev))
    }))
    .sort((a, b) => a._ts - b._ts)

  const reunionesCols = reuniones.value
    .filter(r => reunionAplicaAlGrupo(r, g))
    .map(r => ({
      clave: `re-${r.id}`,
      esExamen: false,
      id: r.id,
      titulo: r.titulo || 'Reunión',
      categoria: 'reunion',
      fechaCorta: fechaCortaDe(fechaDeEvento(r)),
      _ts: parseFechaFlexible(fechaDeEvento(r))
    }))
    .sort((a, b) => a._ts - b._ts)

  // Marca visual: la primera reunión lleva un separador a la izquierda
  if (reunionesCols.length > 0) reunionesCols[0].separador = true

  return [...examenes, ...reunionesCols]
})

const totalColumnasFisicas = computed(() =>
  columnasGrupo.value.reduce((total, c) => total + (c.esExamen ? 2 : 1), 0)
)

/* ====================================================
   CELDAS
   ==================================================== */
const notaDe = (a, col, tipo) => notasExamenes.value[`${col.id}|${a.id}|${tipo}`] || null
const asistenciaDe = (a, col) => asistencias.value[`${col.id}|${a.id}`] || ''

// Nota numérica (acepta "80", "80%", "72,5")
const notaNumerica = (nota) => {
  if (!nota) return null
  const num = parseFloat(String(nota.calificacion ?? '').replace('%', '').replace(',', '.').trim())
  return Number.isNaN(num) ? null : num
}

const textoCeldaExamen = (a, col, tipo) => {
  const nota = notaDe(a, col, tipo)
  if (nota) {
    if (nota.estado === 'no lo hizo') return 'No lo hizo'
    // El físico nunca lleva nota: solo aprobado/desaprobado
    if (tipo === 'fisico') {
      if (nota.estado === 'aprobado') return 'APROB.'
      if (nota.estado === 'desaprobado') return 'DESAP.'
      return nota.estado ? nota.estado.toUpperCase() : ''
    }
    const cal = String(nota.calificacion ?? '').trim()
    if (cal !== '') return cal
    if (nota.estado === 'aprobado') return 'APROB.'
    if (nota.estado === 'desaprobado') return 'DESAP.'
    return nota.estado ? nota.estado.toUpperCase() : ''
  }
  // Sin evaluación cargada: si figura ausente en la asistencia del evento, mostrarlo
  if (asistenciaDe(a, col) === 'ausente') return 'AUS'
  return ''
}

const claseCeldaExamen = (a, col, tipo) => {
  const nota = notaDe(a, col, tipo)
  if (nota) {
    if (nota.estado === 'no lo hizo') return 'celda-gris'
    // Umbral SOLO para el teórico: verde con 75 o más, rojo con 74 o menos.
    // El físico se colorea siempre por su estado.
    if (tipo === 'teorico') {
      const num = notaNumerica(nota)
      if (num !== null) return num >= 75 ? 'celda-verde' : 'celda-roja'
    }
    if (nota.estado === 'aprobado') return 'celda-verde'
    if (nota.estado === 'desaprobado') return 'celda-roja'
    return ''
  }
  if (asistenciaDe(a, col) === 'ausente') return 'celda-roja'
  return ''
}

const textoCeldaReunion = (a, col) => {
  const asis = asistenciaDe(a, col)
  if (asis === 'presente') return 'P'
  if (asis === 'ausente') return 'A'
  return ''
}

const claseCeldaReunion = (a, col) => {
  const asis = asistenciaDe(a, col)
  if (asis === 'presente') return 'celda-verde'
  if (asis === 'ausente') return 'celda-roja'
  return ''
}

/* ====================================================
   EDICIÓN INLINE (solo asambleas y recuperatorios)
   Guarda en examenes_panel vía guardarNotaPlanilla, la
   misma tabla que usa Exámenes Generales: los cambios
   se ven en ambas pantallas. Las reuniones NO se editan
   acá (se cargan desde su propia pantalla).
   ==================================================== */
const editor = ref(null)
const editorInputRef = ref(null)

const esCeldaEnEdicion = (a, col, tipo) => {
  const e = editor.value
  return !!e && e.idArbitro === a.id && e.idEvento === col.id && e.tipo === tipo
}

const abrirEditor = async (a, col, tipo) => {
  if (!col.esExamen) return
  if (editor.value && editor.value.guardando) return

  const existente = notaDe(a, col, tipo)
  const estaAusente = asistenciaDe(a, col) === 'ausente'
  editor.value = {
    idArbitro: a.id,
    idEvento: col.id,
    tipo,
    // El físico no lleva nota
    calificacion: tipo === 'fisico' ? '' : (existente ? String(existente.calificacion ?? '') : ''),
    estado: existente ? existente.estado : (estaAusente ? 'ausente' : 'aprobado'),
    guardando: false
  }
  await nextTick()
  const input = Array.isArray(editorInputRef.value) ? editorInputRef.value[0] : editorInputRef.value
  if (input) input.focus()
}

const cerrarEditor = () => { editor.value = null }

// En el teórico, al tipear la nota se autocompleta el estado por el umbral 75
// (se puede cambiar a mano igual)
const alTipearNota = () => {
  const e = editor.value
  if (!e || e.tipo !== 'teorico') return
  const num = parseFloat(String(e.calificacion ?? '').replace('%', '').replace(',', '.').trim())
  if (!Number.isNaN(num)) e.estado = num >= 75 ? 'aprobado' : 'desaprobado'
}

const guardarEditor = async () => {
  const e = editor.value
  if (!e || e.guardando) return
  e.guardando = true

  const claveNota = `${e.idEvento}|${e.idArbitro}|${e.tipo}`
  const claveAsis = `${e.idEvento}|${e.idArbitro}`

  try {
    // Caso AUSENTE: no es una nota. Se registra la ausencia en
    // eventos_asistencia y se borra cualquier nota que hubiera en examenes_panel.
    if (e.estado === 'ausente') {
      const res = await api.post({
        entity: 'reuniones',
        action: 'registrarAsistenciaArbitro',
        payload: { idArbitro: e.idArbitro, idEvento: e.idEvento, tipo: 'ausente' }
      })

      if (res.ok || res.success) {
        // Borrar la nota de este tipo si existía (ausente no lleva nota)
        if (notasExamenes.value[claveNota]) {
          api.post({
            entity: 'examenes',
            action: 'borrarExamenPlanilla',
            payload: { idEvento: e.idEvento, idArbitro: e.idArbitro, tipo: e.tipo }
          }).catch(err => console.error('borrarExamenPlanilla:', err))
          const copia = { ...notasExamenes.value }
          delete copia[claveNota]
          notasExamenes.value = copia
        }
        asistencias.value = { ...asistencias.value, [claveAsis]: 'ausente' }
        cerrarEditor()
      } else {
        notificar({ titulo: 'Error', mensaje: 'No se pudo registrar la ausencia.', tipo: 'danger' })
        e.guardando = false
      }
      return
    }

    // Caso con NOTA (aprobado / desaprobado / no lo hizo)
    const res = await api.post({
      entity: 'examenes',
      action: 'guardarNotaPlanilla',
      payload: {
        idEvento: e.idEvento,
        idArbitro: e.idArbitro,
        tipo: e.tipo,
        calificacion: (e.tipo === 'fisico' || e.estado === 'no lo hizo') ? '' : String(e.calificacion ?? '').trim(),
        estado: e.estado
      }
    })

    if (res.ok || res.success) {
      notasExamenes.value = {
        ...notasExamenes.value,
        [claveNota]: {
          calificacion: e.tipo === 'fisico' || e.estado === 'no lo hizo' ? '' : String(e.calificacion ?? '').trim(),
          estado: e.estado
        }
      }

      // Tener una evaluación implica presente: registrar la asistencia
      // (igual que hace Exámenes Generales al guardar un examen)
      if (asistencias.value[claveAsis] !== 'presente') {
        asistencias.value = { ...asistencias.value, [claveAsis]: 'presente' }
        api.post({
          entity: 'reuniones',
          action: 'registrarAsistenciaArbitro',
          payload: { idArbitro: e.idArbitro, idEvento: e.idEvento, tipo: 'presente' }
        }).catch(err => console.error('registrarAsistenciaArbitro:', err))
      }

      cerrarEditor()
    } else {
      const mensaje = (res.payload && res.payload.mensaje) ? res.payload.mensaje : 'No se pudo guardar la nota.'
      notificar({ titulo: 'Error', mensaje, tipo: 'danger' })
      e.guardando = false
    }
  } catch (err) {
    console.error('guardarEditor:', err)
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión al guardar.', tipo: 'danger' })
    e.guardando = false
  }
}

// Borra el contenido de la celda (marca la evaluación como borrada en el
// backend con borrarExamenPlanilla). No toca la asistencia.
const borrarCelda = async () => {
  const e = editor.value
  if (!e || e.guardando) return

  const clave = `${e.idEvento}|${e.idArbitro}|${e.tipo}`
  // Si no hay nada cargado, solo cerrar
  if (!notasExamenes.value[clave]) { cerrarEditor(); return }

  e.guardando = true
  try {
    const res = await api.post({
      entity: 'examenes',
      action: 'borrarExamenPlanilla',
      payload: { idEvento: e.idEvento, idArbitro: e.idArbitro, tipo: e.tipo }
    })

    if (res.ok || res.success) {
      const copia = { ...notasExamenes.value }
      delete copia[clave]
      notasExamenes.value = copia
      cerrarEditor()
    } else {
      const mensaje = (res.payload && res.payload.mensaje) ? res.payload.mensaje : 'No se pudo borrar.'
      notificar({ titulo: 'Error', mensaje, tipo: 'danger' })
      e.guardando = false
    }
  } catch (err) {
    console.error('borrarExamenPlanilla:', err)
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión al borrar.', tipo: 'danger' })
    e.guardando = false
  }
}

/* ====================================================
   EXPORTAR A EXCEL (una hoja por grupo)
   ==================================================== */
const textoExcelExamen = (a, col, tipo) => {
  const nota = notaDe(a, col, tipo)
  if (nota) {
    if (nota.estado === 'no lo hizo') return 'NO LO HIZO'
    if (tipo === 'fisico') {
      if (nota.estado === 'aprobado') return 'APROBADO'
      if (nota.estado === 'desaprobado') return 'DESAPROBADO'
      return nota.estado ? nota.estado.toUpperCase() : ''
    }
    const cal = String(nota.calificacion ?? '').trim()
    if (cal !== '') return cal
    if (nota.estado === 'aprobado') return 'APROBADO'
    if (nota.estado === 'desaprobado') return 'DESAPROBADO'
    return nota.estado ? nota.estado.toUpperCase() : ''
  }
  if (asistenciaDe(a, col) === 'ausente') return 'AUSENTE'
  return ''
}

const textoExcelReunion = (a, col) => {
  const asis = asistenciaDe(a, col)
  if (asis === 'presente') return 'PRESENTE'
  if (asis === 'ausente') return 'AUSENTE'
  return ''
}

const nombreHoja = (texto, usados) => {
  let base = String(texto || 'Grupo').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 31) || 'Grupo'
  let nombre = base
  let n = 2
  while (usados.has(nombre)) {
    nombre = `${base.slice(0, 28)} ${n}`
    n++
  }
  usados.add(nombre)
  return nombre
}

// Relleno ARGB para cada color de celda (sin el # y con FF de alfa adelante)
const RELLENO = {
  verde: 'FFD1E7DD',
  roja: 'FFF8D7DA',
  gris: 'FFE9ECEF',
  cabecera: 'FFF1F3F5',
  ninguno: null
}
const FUENTE_COLOR = {
  verde: 'FF0F5132',
  roja: 'FF842029',
  gris: 'FF6C757D'
}

// Reusa la lógica de color de la vista, devolviendo la clave del relleno
const colorCeldaExamen = (a, col, tipo) => {
  const clase = claseCeldaExamen(a, col, tipo)
  if (clase === 'celda-verde') return 'verde'
  if (clase === 'celda-roja') return 'roja'
  if (clase === 'celda-gris') return 'gris'
  return 'ninguno'
}
const colorCeldaReunion = (a, col) => {
  const clase = claseCeldaReunion(a, col)
  if (clase === 'celda-verde') return 'verde'
  if (clase === 'celda-roja') return 'roja'
  return 'ninguno'
}

const pintarCelda = (celda, colorKey, opciones = {}) => {
  celda.alignment = { horizontal: opciones.left ? 'left' : 'center', vertical: 'middle', wrapText: !!opciones.wrap }
  celda.border = {
    top: { style: 'thin', color: { argb: 'FFD4D4D8' } },
    left: { style: 'thin', color: { argb: 'FFD4D4D8' } },
    bottom: { style: 'thin', color: { argb: 'FFD4D4D8' } },
    right: { style: 'thin', color: { argb: 'FFD4D4D8' } }
  }
  const relleno = RELLENO[colorKey]
  if (relleno) {
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: relleno } }
  }
  const fuenteColor = FUENTE_COLOR[colorKey]
  celda.font = {
    bold: !!opciones.bold,
    color: fuenteColor ? { argb: fuenteColor } : { argb: 'FF212529' },
    size: opciones.size || 11
  }
}

const descargarExcel = async () => {
  const wb = new ExcelJS.Workbook()
  const usados = new Set()

  gruposTabs.value.forEach((g, indiceGrupo) => {
    const lista = arbitros.value
      .filter(a => perteneceAlGrupo(a, g))
      .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'))

    // Columnas de este grupo (misma lógica que la vista: exámenes primero, reuniones después)
    const columnas = [
      ...eventosExamen.value.filter(ev => examenAplicaAlGrupo(ev, g)).map(ev => ({
        esExamen: true, id: ev.id,
        titulo: ev.titulo || (ev.categoria === 'recuperatorio' ? 'Recuperatorio' : 'Asamblea'),
        fechaCorta: fechaCortaDe(fechaDeEvento(ev)),
        _ts: parseFechaFlexible(fechaDeEvento(ev))
      })).sort((a, b) => a._ts - b._ts),
      ...reuniones.value.filter(r => reunionAplicaAlGrupo(r, g)).map(r => ({
        esExamen: false, id: r.id,
        titulo: 'Reunión',
        fechaCorta: fechaCortaDe(fechaDeEvento(r)),
        _ts: parseFechaFlexible(fechaDeEvento(r))
      })).sort((a, b) => a._ts - b._ts)
    ]

    const ws = wb.addWorksheet(nombreHoja(etiquetaGrupo(g), usados), {
      views: [{ state: 'frozen', xSplit: 1, ySplit: 2 }] // fija árbitro + cabecera
    })

    // Color de la solapa igual al de la vista
    ws.properties.tabColor = { argb: 'FF' + colorDeGrupo(indiceGrupo).replace('#', '').toUpperCase() }

    // ---- Cabecera de dos filas ----
    const fila1 = ['ÁRBITRO']
    const fila2 = ['']
    columnas.forEach(col => {
      if (col.esExamen) {
        const etiqueta = `${col.titulo}${col.fechaCorta ? ' (' + col.fechaCorta + ')' : ''}`.toUpperCase()
        fila1.push(etiqueta, '')
        fila2.push('TEÓRICO', 'FÍSICO')
      } else {
        fila1.push(`REUNIÓN ${col.fechaCorta}`.trim())
        fila2.push('ASISTENCIA')
      }
    })
    ws.addRow(fila1)
    ws.addRow(fila2)

    // ---- Filas de datos ----
    lista.forEach(a => {
      const fila = [`${a.apellido}, ${a.nombre}`]
      columnas.forEach(col => {
        if (col.esExamen) {
          fila.push(textoExcelExamen(a, col, 'teorico'), textoExcelExamen(a, col, 'fisico'))
        } else {
          fila.push(textoExcelReunion(a, col))
        }
      })
      ws.addRow(fila)
    })

    // ---- Merges de cabecera ----
    ws.mergeCells(1, 1, 2, 1) // ÁRBITRO ocupa las dos filas
    let c = 2
    columnas.forEach(col => {
      if (col.esExamen) {
        ws.mergeCells(1, c, 1, c + 1) // título abarca teórico+físico
        c += 2
      } else {
        ws.mergeCells(1, c, 2, c) // reunión ocupa las dos filas
        c += 1
      }
    })

    // ---- Estilos de cabecera ----
    ws.getRow(1).eachCell({ includeEmpty: true }, celda => pintarCelda(celda, 'cabecera', { bold: true, wrap: true, size: 10 }))
    ws.getRow(2).eachCell({ includeEmpty: true }, celda => pintarCelda(celda, 'cabecera', { bold: true, size: 10 }))

    // ---- Estilos de datos (con los colores del front) ----
    lista.forEach((a, i) => {
      const filaExcel = ws.getRow(i + 3)
      pintarCelda(filaExcel.getCell(1), 'ninguno', { left: true, bold: true }) // nombre
      let cc = 2
      columnas.forEach(col => {
        if (col.esExamen) {
          pintarCelda(filaExcel.getCell(cc), colorCeldaExamen(a, col, 'teorico'), { bold: true })
          pintarCelda(filaExcel.getCell(cc + 1), colorCeldaExamen(a, col, 'fisico'), { bold: true })
          cc += 2
        } else {
          pintarCelda(filaExcel.getCell(cc), colorCeldaReunion(a, col), { bold: true })
          cc += 1
        }
      })
    })

    // ---- Anchos ----
    ws.getColumn(1).width = 26
    let cw = 2
    columnas.forEach(col => {
      if (col.esExamen) { ws.getColumn(cw).width = 13; ws.getColumn(cw + 1).width = 13; cw += 2 }
      else { ws.getColumn(cw).width = 12; cw += 1 }
    })
    ws.getRow(1).height = 30
  })

  // Descargar
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'resumen_por_grupos.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; padding: 16px 0; }
.animate__animated { animation-duration: 0.4s; }

/* ====================================================
   TABLA TIPO EXCEL
   ==================================================== */
.tabla-scroll {
  overflow-x: auto;
}

.tabla-excel {
  border-collapse: separate;
  border-spacing: 0;
  width: max-content;
  min-width: 100%;
  font-size: 0.8rem;
  background: #fff;
}

.tabla-excel th,
.tabla-excel td {
  border-right: 1px solid #d4d4d8;
  border-bottom: 1px solid #d4d4d8;
  padding: 4px 8px;
  white-space: nowrap;
}

/* Cabeceras estilo planilla */
.tabla-excel thead th {
  background-color: #f1f3f5;
  color: #343a40;
  position: sticky;
  top: 0;
  z-index: 5;
  text-align: center;
  vertical-align: middle;
  font-size: 0.72rem;
}
.tabla-excel thead tr:nth-child(2) th {
  top: auto;
}

.th-evento { min-width: 140px; }
.th-subtipo { font-weight: 600; color: #6c757d; }
.fecha-evento { font-size: 0.68rem; color: #6c757d; font-weight: 500; }
.texto-recortado { max-width: 180px; overflow: hidden; text-overflow: ellipsis; margin: 0 auto; }

/* Reuniones: columna angosta, solo la fecha */
.th-reunion { min-width: 48px; max-width: 60px; padding: 6px 4px; }

/* Separador visual entre el bloque de exámenes y el de reuniones */
.sep-reuniones { border-left: 2px solid #adb5bd !important; }

/* Primera columna fija (árbitro) */
.col-arbitro {
  position: sticky;
  left: 0;
  background-color: #fff;
  z-index: 6;
  min-width: 190px;
  text-align: left !important;
}
.tabla-excel thead .esquina {
  z-index: 8;
  background-color: #e9ecef;
}
.celda-nombre {
  font-weight: 600;
  color: #212529;
  border-right: 2px solid #adb5bd !important;
}

/* Celdas de datos */
.celda {
  text-align: center;
  min-width: 44px;
  color: #212529;
}
.celda-verde { background-color: #d1e7dd; color: #0f5132; font-weight: 600; }
.celda-roja { background-color: #f8d7da; color: #842029; font-weight: 600; }
.celda-gris { background-color: #e9ecef; color: #6c757d; font-weight: 600; }

/* Leyenda */
.cuadrito {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1px solid #ced4da;
  border-radius: 2px;
  margin-right: 4px;
  vertical-align: -1px;
}
.cuadrito.bg-success-subtle { background-color: #d1e7dd !important; }
.cuadrito.bg-danger-subtle { background-color: #f8d7da !important; }
.cuadrito.bg-secondary-subtle { background-color: #e9ecef !important; }

/* ====================================================
   SOLAPAS DE GRUPO (arriba, cada una con su color)
   ==================================================== */
.hojas-excel {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  background-color: #f1f3f5;
  padding: 8px 8px 0 8px;
  gap: 3px;
}

.hoja-tab {
  border: 1px solid #ced4da;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: filter 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hoja-tab:hover { filter: brightness(0.96); }

.hoja-tab.activa {
  margin-bottom: -1px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.06);
  font-weight: 700;
}

.punto-color {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge-cantidad {
  display: inline-block;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 0.65rem;
  padding: 1px 6px;
}

/* ====================================================
   EDICIÓN INLINE DE CELDAS
   ==================================================== */
.celda-editable { cursor: pointer; }
.celda-editable:hover { outline: 2px solid #0d6efd; outline-offset: -2px; }

.editor-celda {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px;
  cursor: default;
}

.editor-input {
  width: 52px;
  border: 1px solid #0d6efd;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 0.75rem;
  text-align: center;
}

.editor-select {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 2px;
  font-size: 0.72rem;
  max-width: 92px;
}

.editor-botones { display: flex; gap: 2px; }

.btn-mini {
  border: none;
  border-radius: 4px;
  width: 22px;
  height: 22px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.btn-mini.ok { background-color: #198754; color: #fff; }
.btn-mini.borrar { background-color: #f8d7da; color: #842029; }
.btn-mini.no { background-color: #e9ecef; color: #495057; }
.btn-mini:disabled { opacity: 0.6; }

/* ====================================================
   BUSCADOR CON BOTÓN DE LIMPIAR (X)
   ==================================================== */
.busqueda-wrap {
  position: relative;
  max-width: 200px;
  flex: 0 0 auto;
}

.busqueda-wrap input {
  padding-right: 30px;
}

.btn-limpiar-busqueda {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #adb5bd;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  line-height: 1;
}

.btn-limpiar-busqueda:hover {
  color: #dc3545;
}
</style>
