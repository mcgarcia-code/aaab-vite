<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 border-bottom">
          <div class="row g-3 align-items-center">
            <div class="col-12 col-xl-auto">
              <div>
                <p class="seccion-descripcion">
                  <template v-if="modoReunion && !cargandoArbitros">
                    {{ reunionActual?.titulo }}
                    <span v-if="reunionActual?.nombreGrupo" class="fst-italic"> · {{ reunionActual.nombreGrupo }}</span>
                    — {{ arbitrosReunion.length }} árbitros
                    <span v-if="resumenReunionActual.presentes"   class="ms-1 estado-pill estado-verde">✓ {{ resumenReunionActual.presentes }}</span>
                    <span v-if="resumenReunionActual.ausentes"    class="ms-1 estado-pill estado-naranja">✗ {{ resumenReunionActual.ausentes }}</span>
                    <span v-if="resumenReunionActual.sinRegistro" class="ms-1 estado-pill estado-gris">— {{ resumenReunionActual.sinRegistro }}</span>
                  </template>
                  <template v-else>Presentes y ausentes · Todos los grupos · {{ totalFiltrados }} árbitros</template>
                </p>
                <span v-if="modoReunion && reunionActual?.reunion" class="text-muted d-block mt-1 texto-creacion">
                  <i class="bi bi-person-badge me-1"></i>{{ textoCreacionReunion(reunionActual.reunion) }}
                </span>
              </div>
            </div>

            <div class="col-12 col-xl">
              <div class="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-center justify-content-md-between">
                <!-- Select de reunión (desglosado por grupo) -->
                <select
                  v-model="reunionSeleccionada"
                  @change="onReunionSeleccionada"
                  class="form-select shadow-sm border-secondary-subtle fw-semibold text-truncate select-reunion control-encabezado"
                  :disabled="cargandoInicial || cargandoArbitros"
                  aria-label="Elegir reunión"
                >
                  <option value="">— Ver listado general —</option>
                  <option v-for="op in opcionesReunion" :key="op.key" :value="op.key">
                    {{ op.label }}
                  </option>
                </select>

                <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between justify-content-md-end flex-shrink-0">
                  <div class="form-check form-switch d-flex align-items-center gap-2 m-0 border rounded px-3 py-2 shadow-sm bg-white flex-shrink-0 control-encabezado">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="toggleSoloActivos"
                      v-model="soloActivos"
                      role="switch"
                      :disabled="cargandoInicial || cargandoArbitros"
                    >
                    <label class="form-check-label small fw-bold text-dark m-0" for="toggleSoloActivos">
                      Solo activos
                    </label>
                  </div>
                  <div class="d-flex gap-2">
                    <BotonHerramienta tipo="filtros" class="d-md-none flex-shrink-0" :solo-icono-en-celular="false" @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" />
                    <BotonHerramienta tipo="limpiar" class="flex-shrink-0" @click="limpiarFiltros" />
                    <BotonHerramienta tipo="actualizar" class="flex-shrink-0" :cargando="cargandoInicial || cargandoArbitros" @click="recargar" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <TablaAsistenciaReunion @ver-historial="verDetalleArbitro" @guardar="guardarAsistencia" />
      </div>

      <!-- ¿Quién dio la reunión? -->
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">
        <div class="card-header bg-white py-3 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h5 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-person-video3 me-1"></i> ¿Quién dio la reunión?
            </h5>
            <span class="text-muted small d-block mt-1">
              {{ mesDisertantes ? nombreMes(mesDisertantes) : 'Todos los meses' }} {{ anioDisertantes }} · {{ filasDisertantesFiltradas.length }} reuniones
              <span v-if="sinAsignarDisertantes" class="ms-1 estado-pill estado-ambar">{{ sinAsignarDisertantes }} sin asignar</span>
            </span>
          </div>

          <div class="d-flex gap-2 align-items-stretch">
            <select
              v-model="mesDisertantes"
              class="form-select shadow-sm border-secondary-subtle fw-semibold select-mes text-uppercase text-dark"
              :disabled="cargandoInicial || cargandoDisertantes"
              aria-label="Filtrar por mes"
            >
              <option value="">MES</option>
              <option v-for="m in MESES_DISERTANTES" :key="m.valor" :value="m.valor">{{ m.nombre }}</option>
            </select>
            <select
              v-model="anioDisertantes"
              class="form-select shadow-sm border-secondary-subtle fw-semibold select-anio text-uppercase text-dark"
              :disabled="cargandoInicial || cargandoDisertantes"
              aria-label="Filtrar por año"
            >
              <option v-for="a in aniosDisertantes" :key="a" :value="a">{{ a }}</option>
            </select>
            <BotonHerramienta tipo="excel" :disabled="cargandoDisertantes || !filasDisertantesFiltradas.length" @click="exportarExcelDisertantes" />
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargandoInicial || cargandoDisertantes" class="text-center py-5">
            <div class="spinner-border text-danger spinner-border-sm" role="status"></div>
            <span class="ms-2 fw-bold text-muted">Cargando reuniones...</span>
          </div>

          <div v-else-if="!filasDisertantesFiltradas.length" class="text-center py-5 text-muted">
            <i class="bi bi-calendar-x opacity-50 d-block mb-2" style="font-size: 36px;"></i>
            <span class="fw-bold small">No hay reuniones{{ mesDisertantes ? ' en el mes elegido' : '' }}.</span>
          </div>

          <template v-else>
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0" style="font-size: 0.8rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted text-nowrap">Fecha</th>
                    <th class="py-3 text-uppercase text-muted text-nowrap">Grupo</th>
                    <th class="py-3 text-uppercase text-muted">Tema</th>
                    <th class="py-3 text-uppercase text-muted">Lugar</th>
                    <th class="py-3 text-uppercase text-muted text-nowrap">Fecha de creación</th>
                    <th class="py-3 text-uppercase text-muted text-nowrap">Creada por</th>
                    <th class="py-3 text-uppercase text-muted text-nowrap">Árbitro que la dio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in filasDisertantesFiltradas" :key="'dis-' + f.clave">
                    <td class="ps-3 fw-bold text-dark text-nowrap">{{ f.reunion.fecha_formateada }}</td>
                    <td class="text-nowrap"><span class="badge bg-light text-dark border">{{ f.nombreGrupo }}</span></td>
                    <td class="text-dark fw-semibold">{{ f.reunion.titulo }}</td>
                    <td class="text-muted">{{ f.reunion.descripcion || '-' }}</td>
                    <td class="text-muted text-nowrap">{{ f.reunion.fecha_creacion_formateada || '-' }}</td>
                    <td class="text-muted">{{ etiquetaCreadorReunion(f.reunion) }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-1">
                        <select
                          :value="disertantes[f.clave] ?? ''"
                          @change="guardarDisertante(f, $event.target.value)"
                          class="form-select form-select-sm shadow-none select-disertante"
                          :disabled="!!guardandoDisertante[f.clave]"
                          :aria-label="`Árbitro que dio la reunión del ${f.reunion.fecha_formateada} (${f.nombreGrupo})`"
                        >
                          <option value="">— Sin asignar —</option>
                          <option v-for="a in opcionesArbitrosDisertantes" :key="a.id" :value="a.id">{{ a.etiqueta }}</option>
                        </select>
                        <span class="estado-indicator">
                          <span v-if="guardandoDisertante[f.clave]" class="spinner-border spinner-border-sm text-danger" role="status"></span>
                          <i v-else-if="disertanteGuardadoOk[f.clave]" class="bi bi-check-circle-fill text-success"></i>
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-md-none p-3 bg-light">
              <div v-for="f in filasDisertantesFiltradas" :key="'dis-mob-' + f.clave" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-body p-3">
                  <div class="d-flex justify-content-between align-items-start mb-1 gap-2">
                    <span class="fw-bold text-dark"><i class="bi bi-calendar3 me-1 text-muted"></i>{{ f.reunion.fecha_formateada }}</span>
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge bg-light text-dark border">{{ f.nombreGrupo }}</span>
                      <span v-if="guardandoDisertante[f.clave]" class="spinner-border spinner-border-sm text-danger"></span>
                      <i v-else-if="disertanteGuardadoOk[f.clave]" class="bi bi-check-circle-fill text-success"></i>
                    </div>
                  </div>
                  <div class="text-dark fw-semibold small">{{ f.reunion.titulo }}</div>
                  <div v-if="f.reunion.descripcion" class="text-muted small">{{ f.reunion.descripcion }}</div>
                  <div class="text-muted fst-italic mt-1 texto-creacion">{{ textoCreacionReunion(f.reunion) }}</div>
                  <label class="small fw-bold text-dark mt-2 mb-1 d-block" :for="`dis-mob-sel-${f.clave}`">Árbitro que la dio</label>
                  <select
                    :id="`dis-mob-sel-${f.clave}`"
                    :value="disertantes[f.clave] ?? ''"
                    @change="guardarDisertante(f, $event.target.value)"
                    class="form-select form-select-sm shadow-none"
                    :disabled="!!guardandoDisertante[f.clave]"
                  >
                    <option value="">— Sin asignar —</option>
                    <option v-for="a in opcionesArbitrosDisertantes" :key="a.id" :value="a.id">{{ a.etiqueta }}</option>
                  </select>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <ModalHistorialReuniones :show="mostrarModalDetalle" :arbitro="arbitroSeleccionado" @close="mostrarModalDetalle = false" />
  </div>
</template>

<script setup>
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import TablaAsistenciaReunion from '@/components/comunes/reuniones/TablaAsistenciaReunion.vue'
import ModalHistorialReuniones from '@/components/comunes/reuniones/ModalHistorialReuniones.vue'
import { anioActual, conAnioActual } from '@/utils/anios'
import { ref, onMounted, computed, reactive, inject, watch, provide } from 'vue'
import { cargarExcelJS } from '@/utils/librerias'
import { normalizarTexto } from '@/utils/texto'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'
import { etiquetaCreadorReunion, textoCreacionReunion } from '@/composables/useCreadorReunion'
import { useAsistenciaReuniones } from '@/composables/useAsistenciaReuniones'

useHead({
  title: 'Reuniones | AAAB',
  meta: [{ name: 'description', content: 'Gestión de asistencia a reuniones de árbitros AAAB.' }],
})

// ─── Inyectado ───────────────────────────────────────────────────
const toast = inject('toast')

// ─── Asistencia (compartida con el panel de coordinadores) ────────
// Admin ve TODOS los árbitros (no solo su grupo).
const asistencia = useAsistenciaReuniones({ toast, accionArbitros: 'todos' })
provide('asistenciaReuniones', asistencia)
const {
  arbitrosReunion, grupos, reunionSeleccionada, soloActivos,
  cargandoInicial, cargandoArbitros, paginaActual, mostrarFiltrosMobile,
  nombreGrupo, modoReunion, resumenReunionActual, totalFiltrados,
  obtenerGrupos, cargarArbitros, cargarAsistenciasGlobales,
  limpiarAsistencias, limpiarFiltros, cargarArbitrosReunion
} = asistencia

// ─── Estado propio ───────────────────────────────────────────────
const arrReuniones        = ref([])
const mostrarModalDetalle = ref(false)
const arbitroSeleccionado = ref({ id: null, apellido: '', nombre: '' })

const collator = new Intl.Collator('es', { sensitivity: 'base' })

// ─── Desglose de reuniones por grupo ─────────────────────────────
// Cada reunión-evento se desglosa en una opción por grupo. Si un evento tiene
// dos grupos, aparece en dos filas distintas (misma fecha/título, distinto
// grupo). Reuniones "de todos los grupos" quedan como una única fila.
const opcionesReunion = computed(() => {
  const ops = []
  for (const r of arrReuniones.value) {
    const base = `${r.fecha_formateada}  —  ${r.titulo}`
    if (r.todosLosGrupos) {
      ops.push({
        key: `${r.id}|all`,
        idEvento: r.id,
        reunion: r,
        titulo: r.titulo,
        nombreGrupo: 'Todos los grupos',
        idGrupo: null,
        idsGrupos: grupos.value.map(g => g.id),
        label: `${base} (Todos los grupos)`,
      })
    } else {
      for (const idGrupo of (r.idsGrupos || [])) {
        ops.push({
          key: `${r.id}|${idGrupo}`,
          idEvento: r.id,
          reunion: r,
          titulo: r.titulo,
          nombreGrupo: nombreGrupo(idGrupo),
          idGrupo,
          idsGrupos: [idGrupo],
          label: `${base} (${nombreGrupo(idGrupo)})`,
        })
      }
    }
  }
  return ops
})

const reunionActual = computed(() =>
  opcionesReunion.value.find(o => o.key === reunionSeleccionada.value) ?? null
)

// ─── Cargas ──────────────────────────────────────────────────────
const obtenerReuniones = async () => {
  try {
    const res = await api.get({ entity: 'reuniones', action: 'obtenerReuniones' })
    if ((res.ok || res.success) && res.payload)
      arrReuniones.value = (res.payload || []).filter(r => r.categoria === 'reunion')
  } catch (e) { console.error('obtenerReuniones:', e) }
}

// ─── Cambio de reunión ────────────────────────────────────────────
// Filtra los árbitros de un evento al grupo de la fila desglosada elegida.
// Para reuniones "de todos los grupos" no se filtra (idGrupo === null).
const filtrarPorGrupoOpcion = (lista, opcion) => {
  if (!opcion || opcion.idGrupo == null) return lista
  return lista.filter(a =>
    Number(a.id_grupo) === Number(opcion.idGrupo) ||
    (opcion.idsGrupos || []).map(Number).includes(Number(a.id_grupo))
  )
}

const onReunionSeleccionada = async () => {
  limpiarAsistencias()
  paginaActual.value = 1
  limpiarFiltros()
  mostrarFiltrosMobile.value = false
  if (!reunionSeleccionada.value) {
    cargandoInicial.value = true
    await cargarAsistenciasGlobales()
    cargandoInicial.value = false
    return
  }
  const opcion = reunionActual.value
  cargandoArbitros.value = true
  try {
    // Desglose por grupo: solo los árbitros del grupo de esta fila.
    await cargarArbitrosReunion(opcion.idEvento, (lista) => filtrarPorGrupoOpcion(lista, opcion))
  } catch (e) {
    console.error('onReunionSeleccionada:', e)
    toast({ titulo: 'Error', mensaje: 'No se pudieron cargar los datos de la reunión.', tipo: 'danger' })
  } finally {
    cargandoArbitros.value = false
  }
}

const guardarAsistencia = (a) => asistencia.guardarAsistencia(a, reunionActual.value?.idEvento)

// ─── Acciones ────────────────────────────────────────────────────
const verDetalleArbitro = (a) => {
  arbitroSeleccionado.value = { id: a.id, apellido: a.apellido, nombre: a.nombre }
  mostrarModalDetalle.value = true
}

const recargar = async () => {
  if (modoReunion.value) {
    await onReunionSeleccionada()
  } else {
    cargandoInicial.value = true
    await Promise.all([obtenerReuniones(), cargarArbitros()])
    cargarDisertantes()
    await cargarAsistenciasGlobales()
    cargandoInicial.value = false
  }
}

// ─── ¿Quién dio la reunión? ───────────────────────────────────────
// Lista por mes y año las reuniones aprobadas de todos los grupos, una fila por
// reunión + grupo (las de "todos los grupos" van en una sola fila, grupo 0),
// para asignar el árbitro que la dio y exportarlo a liquidación. Tiene su propio
// listado de reuniones porque puede consultar años anteriores.
const anioDisertantes         = ref(anioActual())
const mesDisertantes          = ref(String(new Date().getMonth() + 1).padStart(2, '0'))
const reunionesDisertantes    = ref([])
const cargandoDisertantes     = ref(false)
const arbitrosDisertantesBase = ref([])
const disertantes             = reactive({})
const guardandoDisertante     = reactive({})
const disertanteGuardadoOk    = reactive({})

const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const MESES_DISERTANTES = NOMBRES_MESES.map((nombre, i) => ({ valor: String(i + 1).padStart(2, '0'), nombre }))
const mesDeFecha = (fechaEvento) => String(fechaEvento || '').substring(5, 7)
const nombreMes = (mes) => NOMBRES_MESES[Number(mes) - 1] ?? ''
const aniosDisertantes = computed(() => conAnioActual())
const claveDisertante = (idEvento, idGrupo) => `${idEvento}|${idGrupo}`

const filasDisertantes = computed(() => {
  const filas = []
  const aprobadas = reunionesDisertantes.value.filter(r => !r.aprobacion || r.aprobacion === 'aprobada')
  for (const r of aprobadas) {
    const idsGrupos = r.todosLosGrupos ? [0] : (r.idsGrupos || []).map(Number)
    for (const idGrupo of idsGrupos) {
      filas.push({
        clave: claveDisertante(r.id, idGrupo),
        idGrupo,
        nombreGrupo: idGrupo ? nombreGrupo(idGrupo) : 'Todos los grupos',
        reunion: r,
      })
    }
  }
  return filas.sort((a, b) =>
    String(a.reunion.fecha_evento).localeCompare(String(b.reunion.fecha_evento)) ||
    collator.compare(a.nombreGrupo, b.nombreGrupo)
  )
})

const filasDisertantesFiltradas = computed(() =>
  !mesDisertantes.value
    ? filasDisertantes.value
    : filasDisertantes.value.filter(f => mesDeFecha(f.reunion.fecha_evento) === mesDisertantes.value)
)

const sinAsignarDisertantes = computed(() =>
  filasDisertantesFiltradas.value.filter(f => !disertantes[f.clave]).length
)

const opcionesArbitrosDisertantes = computed(() =>
  [...arbitrosDisertantesBase.value]
    .sort((a, b) =>
      normalizarTexto(a.apellido).localeCompare(normalizarTexto(b.apellido), 'es') ||
      normalizarTexto(a.nombre).localeCompare(normalizarTexto(b.nombre), 'es')
    )
    .map(a => ({ id: Number(a.id), etiqueta: `${String(a.apellido || '').toUpperCase()}, ${a.nombre || ''}` }))
)

const nombreArbitroDisertante = (idArbitro) =>
  opcionesArbitrosDisertantes.value.find(a => a.id === Number(idArbitro))?.etiqueta ?? ''

const cargarDisertantes = async () => {
  const anio = Number(anioDisertantes.value)
  cargandoDisertantes.value = true
  try {
    const [resReu, resDis, resArb] = await Promise.all([
      api.get({ entity: 'reuniones', action: 'obtenerReuniones', payload: { anio } }),
      api.get({ entity: 'reuniones', action: 'obtenerDisertantesReuniones', payload: { anio } }),
      arbitrosDisertantesBase.value.length
        ? Promise.resolve(null)
        : api.getCacheado({ entity: 'arbitros', action: 'getArbitrosBasico', payload: { soloActivos: false } }, { ttl: 60 * 1000 }),
    ])
    if (resArb && (resArb.ok || resArb.success) && Array.isArray(resArb.payload)) arbitrosDisertantesBase.value = resArb.payload
    if (Number(anioDisertantes.value) !== anio) return
    if (!resReu?.ok) throw new Error(resReu?.message || 'No se pudieron cargar las reuniones')
    if (!resDis?.ok) throw new Error(resDis?.message || 'No se pudieron cargar los árbitros asignados')
    reunionesDisertantes.value = (resReu.payload || []).filter(r => r.categoria === 'reunion')
    Object.keys(disertantes).forEach(k => delete disertantes[k])
    for (const d of (resDis.payload || [])) disertantes[claveDisertante(d.id_evento, d.id_grupo)] = Number(d.id_arbitro)
  } catch (e) {
    console.error('cargarDisertantes:', e)
    toast({ titulo: 'Error', mensaje: e?.message || 'No se pudieron cargar los árbitros asignados.', tipo: 'danger' })
  } finally {
    cargandoDisertantes.value = false
  }
}

const guardarDisertante = async (fila, valor) => {
  const anterior = disertantes[fila.clave] ?? ''
  const idArbitro = valor ? Number(valor) : null
  disertantes[fila.clave] = idArbitro ?? ''
  guardandoDisertante[fila.clave] = true
  delete disertanteGuardadoOk[fila.clave]
  try {
    const res = await api.post({
      entity: 'reuniones',
      action: 'guardarDisertanteReunion',
      payload: { idEvento: Number(fila.reunion.id), idGrupo: fila.idGrupo, idArbitro },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar el árbitro')
    disertanteGuardadoOk[fila.clave] = true
    setTimeout(() => { delete disertanteGuardadoOk[fila.clave] }, 2500)
  } catch (e) {
    disertantes[fila.clave] = anterior
    toast({ titulo: 'Error', mensaje: e?.message || 'No se pudo guardar el árbitro.', tipo: 'danger' })
  } finally {
    guardandoDisertante[fila.clave] = false
  }
}

const exportarExcelDisertantes = async () => {
  const lista = filasDisertantesFiltradas.value
  if (!lista.length) {
    toast({ titulo: 'Tabla vacía', mensaje: 'No hay reuniones para exportar.', tipo: 'warning' })
    return
  }
  const wb = new (await cargarExcelJS()).Workbook()
  const ws = wb.addWorksheet('Reuniones')
  ws.columns = [
    { header: 'Fecha',             key: 'fecha',      width: 12 },
    { header: 'Grupo',             key: 'grupo',      width: 18 },
    { header: 'Tema',              key: 'tema',       width: 36 },
    { header: 'Lugar',             key: 'lugar',      width: 30 },
    { header: 'Árbitro que la dio', key: 'disertante', width: 32 },
    { header: 'Fecha de creación', key: 'creada',     width: 18 },
    { header: 'Creada por',        key: 'creador',    width: 30 },
  ]
  lista.forEach(f => ws.addRow({
    fecha:      f.reunion.fecha_formateada,
    grupo:      f.nombreGrupo,
    tema:       f.reunion.titulo,
    lugar:      f.reunion.descripcion || '',
    disertante: nombreArbitroDisertante(disertantes[f.clave]) || 'Sin asignar',
    creada:     f.reunion.fecha_creacion_formateada || '',
    creador:    etiquetaCreadorReunion(f.reunion),
  }))
  ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Reuniones_disertantes_${anioDisertantes.value}${mesDisertantes.value ? '-' + mesDisertantes.value : ''}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}

watch(anioDisertantes, () => cargarDisertantes())

watch(soloActivos, async () => {
  if (modoReunion.value) {
    cargandoArbitros.value = true
    await onReunionSeleccionada()
    cargandoArbitros.value = false
  } else {
    cargandoInicial.value = true
    await cargarArbitros()
    await cargarAsistenciasGlobales()
    cargandoInicial.value = false
  }
})

onMounted(async () => {
  await Promise.all([obtenerReuniones(), cargarArbitros(), obtenerGrupos()])
  cargarDisertantes()
  await cargarAsistenciasGlobales()
  cargandoInicial.value = false
})
</script>

<style scoped>
.texto-creacion { font-size: 0.75rem; }
.control-encabezado { height: 40px; }
.select-reunion { width: 100%; min-width: 0; font-size: 1rem; }
@media (min-width: 768px) {
  .select-reunion { flex: 0 1 300px; max-width: 300px; font-size: 0.85rem; }
}
@media (min-width: 1400px) {
  .select-reunion { flex-basis: 380px; max-width: 380px; }
}
.select-mes { flex: 1 1 auto; min-width: 0; font-size: 1rem; }
.select-anio { flex: 0 0 100px; font-size: 1rem; }
@media (min-width: 576px) {
  .select-mes { flex: 0 0 170px; font-size: 0.85rem; }
  .select-anio { font-size: 0.85rem; }
}
.select-disertante { width: 190px; max-width: 190px; font-size: 0.75rem; }
.estado-indicator { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; }
</style>
