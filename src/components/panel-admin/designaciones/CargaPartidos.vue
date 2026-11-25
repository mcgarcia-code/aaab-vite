<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">Cargá y asigná partidos · Total: {{ designaciones.length }} partidos
              <template v-if="totalADesignar > 0">
                · <button type="button" @click="abrirModalPendientes('a_designar')" class="btn-contador text-danger fw-bold" title="Ver lista de partidos sin designar"><i class="bi bi-exclamation-circle-fill"></i> {{ totalADesignar }} sin designar</button>
              </template>
              <template v-if="totalSinMatch > 0">
                · <button type="button" @click="abrirModalPendientes('sin_match')" class="btn-contador text-warning-emphasis fw-bold" title="Ver lista de árbitros sin coincidencia">{{ totalSinMatch }} árbitros sin coincidencia</button>
              </template>
              <template v-if="totalSinCancha > 0">
                · <button type="button" @click="abrirModalPendientes('sin_cancha')" class="btn-contador text-danger fw-bold" title="Ver lista de partidos sin cancha"><i class="bi bi-geo-alt-fill"></i> {{ totalSinCancha }} sin cancha</button>
              </template>
              <template v-if="totalConflictos > 0">
                · <button type="button" @click="abrirModalPendientes('aviso_todos')" class="btn-contador text-danger fw-bold" title="Ver lista de partidos con avisos"><i class="bi bi-exclamation-triangle-fill"></i> {{ totalConflictos }} {{ totalConflictos === 1 ? 'conflicto' : 'conflictos' }}</button>
              </template></p>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <BotonHerramienta tipo="enlace" texto="Cargar Excel" icono="bi-file-earmark-arrow-up" @click="abrirModalCarga" />

            <BotonHerramienta tipo="nuevo" texto="Publicar" icono="bi-cloud-upload" :disabled="designaciones.length === 0" @click="abrirModalPublicar" />

            <div class="dropdown">
              <BotonHerramienta tipo="enlace" texto="Descargar" icono="bi-download" class="dropdown-toggle"
                                data-bs-toggle="dropdown" aria-expanded="false"
                                :cargando="descargandoArchivo" :disabled="designaciones.length === 0" />
              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <button class="dropdown-item d-flex align-items-center gap-2" @click="abrirModalDescarga('pdf')">
                    <i class="bi bi-file-earmark-pdf fs-6 text-danger"></i>
                    <span class="small fw-bold">PDF</span>
                  </button>
                </li>
                <li>
                  <button class="dropdown-item d-flex align-items-center gap-2" @click="abrirModalDescarga('excel')">
                    <i class="bi bi-table fs-6 text-success"></i>
                    <span class="small fw-bold">Excel</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card-body p-2 p-md-3 bg-light">

          <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
            <button
              @click="semanaAnterior"
              class="btn btn-outline-secondary btn-sm shadow-sm d-flex align-items-center gap-1"
              :disabled="cargando"
            >
              <i class="bi bi-chevron-left"></i>
              <span class="fw-bold small">Semana anterior</span>
            </button>

            <span class="text-muted small fw-bold">
              {{labelSemana}}
            </span>

            <button
              @click="semanaSiguiente"
              class="btn btn-outline-secondary btn-sm shadow-sm d-flex align-items-center gap-1"
              :disabled="cargando || (semanaAtras <= 0 && !hayPosteriores)"
            >
              <span class="fw-bold small">Semana siguiente</span>
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>

          <EstadoCargando v-if="cargando" texto="Cargando designaciones" />

          <EstadoVacio v-else-if="designaciones.length === 0" icono="bi-file-earmark-arrow-up" titulo="No hay designaciones cargadas" mensaje="Usá el botón «Cargar Excel» para importar la planilla de partidos." />

          <template v-else>
            <!-- Pestañas por día (una sola línea, con scroll si no entran) -->
            <PestanasSeccion v-model="fechaSeleccionada" :pestanas="pestanasFechas" class="mb-3" />

            <!-- Barra de estado: filtros por estado + buscador -->
            <div class="d-flex flex-column flex-lg-row align-items-lg-center gap-2 mb-3 px-3 py-2 bg-white border rounded shadow-sm">
              <span class="text-muted small fw-bold text-uppercase flex-shrink-0 espaciado-05">Estado:</span>

              <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
                <button
                  @click="filtroEstado = ''"
                  class="chip-estado"
                  :class="{ 'chip-activo': filtroEstado === '' }"
                >
                  <span class="leyenda-muestra muestra-todos"></span>
                  Todos
                </button>
                <button
                  @click="toggleFiltroEstado('a_designar')"
                  class="chip-estado"
                  :class="{ 'chip-activo': filtroEstado === 'a_designar' }"
                >
                  <span class="leyenda-muestra muestra-a-designar"></span>
                  Sin designar
                </button>
                <button
                  @click="toggleFiltroEstado('designado')"
                  class="chip-estado"
                  :class="{ 'chip-activo': filtroEstado === 'designado' }"
                >
                  <span class="leyenda-muestra muestra-designado"></span>
                  Designado
                </button>
                <button
                  @click="toggleFiltroEstado('publicado')"
                  class="chip-estado"
                  :class="{ 'chip-activo': filtroEstado === 'publicado' }"
                >
                  <span class="leyenda-muestra muestra-publicado"></span>
                  Publicado
                </button>
              </div>

              <div class="input-group input-group-sm shadow-sm buscador-grupo flex-shrink-0" style="min-width: 260px; max-width: 380px;">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input aria-label="Buscar partido"
                  v-model="filtroBusqueda"
                  type="text"
                  class="form-control border-start-0 shadow-none"
                  :class="{ 'border-end-0': filtroBusqueda.length > 0 }"
                  placeholder="Buscar cancha, equipo, delegado o árbitro..."
                >
                <button
                  v-if="filtroBusqueda.length > 0"
                  @click="filtroBusqueda = ''"
                  class="btn border border-start-0 bg-white text-muted d-flex align-items-center px-2 shadow-none"
                  type="button"
                  title="Limpiar búsqueda"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <!-- Leyenda de avisos por color: cada chip abre la lista de partidos de ese tipo -->
            <div
              v-if="totalConflictos > 0"
              class="d-flex flex-column flex-lg-row align-items-lg-center gap-2 mb-3 px-3 py-2 bg-white border rounded shadow-sm"
            >
              <span class="text-muted small fw-bold text-uppercase flex-shrink-0 espaciado-05">Avisos:</span>
              <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
                <button
                  v-for="t in TIPOS_AVISO"
                  :key="t.color"
                  type="button"
                  @click="abrirModalPendientes('aviso_' + t.color)"
                  class="chip-estado"
                  :class="{ 'opacity-50': cantidadAvisosPorColor[t.color] === 0 }"
                  :disabled="cantidadAvisosPorColor[t.color] === 0"
                  :title="t.descripcion"
                >
                  <span class="aviso-barra aviso-muestra" :class="'aviso-' + t.color"></span>
                  {{ t.titulo }}
                  <span class="badge bg-light text-dark border">{{ cantidadAvisosPorColor[t.color] }}</span>
                </button>
              </div>
            </div>

            <EstadoVacio v-if="canchas.length === 0" icono="bi-search" titulo="No se encontraron partidos con ese filtro" />

            <!-- Vista escritorio: tabla tipo Excel -->
            <TablaPartidosEscritorio
              v-else
              :canchas="canchas"
              :fecha-seleccionada="fechaSeleccionada"
              :es-admin="esAdmin"
              :partido-resaltado="partidoResaltado"
              :avisos-map="avisosMap"
              @cancha="abrirSelectorCancha"
              @fecha-horario="abrirModalFechaHorario"
              @suspender="toggleSuspendido"
              @arbitro="abrirSelectorArbitro"
              @color="abrirSelectorColor"
              @mesa="abrirModalMesa"
              @avisos="mostrarAvisosPartido"
              @borrar="borrarPartido"
            />


            <!-- Vista celular: tarjetas por cancha -->
            <TarjetasPartidosCelular
              :canchas="canchas"
              :fecha-seleccionada="fechaSeleccionada"
              :es-admin="esAdmin"
              :partido-resaltado="partidoResaltado"
              :avisos-map="avisosMap"
              @cancha="abrirSelectorCancha"
              @fecha-horario="abrirModalFechaHorario"
              @suspender="toggleSuspendido"
              @arbitro="abrirSelectorArbitro"
              @color="abrirSelectorColor"
              @mesa="abrirModalMesa"
              @avisos="mostrarAvisosPartido"
              @borrar="borrarPartido"
            />

          </template>

        </div>
      </div>
    </div>

    <div v-if="hayCambios || estadoGuardado" class="barra-cambios shadow-lg">
      <div class="d-flex align-items-center gap-2">
        <template v-if="estadoGuardado === 'guardando'">
          <span class="spinner-border spinner-border-sm text-white"></span>
          <span class="text-white small fw-bold">Guardando...</span>
        </template>
        <template v-else-if="estadoGuardado === 'guardado'">
          <i class="bi bi-check-circle-fill text-success"></i>
          <span class="text-white small fw-bold">Guardado</span>
        </template>
        <template v-else-if="estadoGuardado === 'error'">
          <i class="bi bi-exclamation-triangle-fill text-warning"></i>
          <span class="text-white small fw-bold">No se pudo guardar</span>
          <button @click="guardarAhora" class="btn btn-sm btn-outline-light rounded-pill px-3 fw-bold ms-1">Reintentar</button>
        </template>
        <template v-else>
          <i class="bi bi-pencil-square text-white-50"></i>
          <span class="text-white small fw-bold">Cambios sin guardar</span>
        </template>
      </div>
    </div>

    <ModalSelectorColor
      :show="mostrarSelectorColor"
      :titulo="tituloSelectorColor"
      :opciones="opcionesColor"
      @close="cerrarSelectorColor"
      @elegir="asignarColor"
    />

    <ModalSelectorArbitro
      v-model:busqueda="busquedaArbitro"
      :show="mostrarSelectorArbitro"
      :titulo="tituloSelector"
      :z-index="zIndexSelector"
      :arbitros="arbitrosFiltrados"
      :permite-sin-arbitro="!!seleccionArbitro && (seleccionArbitro.numero === 1 || seleccionArbitro.numero === 2)"
      :texto-sin-arbitro="SIN_ARBITRO"
      @close="cerrarSelectorArbitro"
      @asignar="asignarArbitro"
      @sin-arbitro="asignarSinArbitro"
      @externo="asignarArbitroLibre"
    />
    <ModalAvisos
      :show="mostrarModalConfirmarDesignacion"
      titulo="⚠ Avisos de esta designación"
      pregunta="¿Deseás continuar con esta designación de todos modos?"
      :texto="textoAvisosDesignacionPendiente"
      con-confirmacion
      :z-index="1060"
      @close="rechazarDesignacionConAvisos"
      @confirmar="confirmarDesignacionConAvisos"
    />

    <ModalAvisos
      :show="mostrarModalAvisosPartido"
      :texto="textoAvisosPartidoActual"
      @close="mostrarModalAvisosPartido = false"
    />
    <ModalCargaExcel
      :show="mostrarModalCarga"
      :archivo="archivoExcel"
      :subiendo="subiendoExcel"
      @close="cerrarModalCarga"
      @seleccionar="seleccionarArchivoExcel"
      @confirmar="confirmarCargaExcel"
    />
    <ModalMesaControl
      :show="mostrarModalMesa"
      :partido="partidoMesa"
      @close="cerrarModalMesa"
      @elegir="abrirSelectorMesa"
    />
    <ModalCancha
      v-model="campoJuegoSeleccionado"
      :show="mostrarSelectorCancha"
      :partido="partidoCancha"
      :campos-juego="camposJuego"
      :guardando="guardandoCancha"
      @close="cerrarSelectorCancha"
      @confirmar="confirmarCancha"
    />
    <ModalFechaHorario
      v-model:fecha="fechaEditada"
      v-model:horario="horarioEditada"
      :show="mostrarModalFechaHorario"
      :partido="partidoFechaHorario"
      :guardando="guardandoFechaHorario"
      @close="cerrarModalFechaHorario"
      @confirmar="confirmarFechaHorario"
    />
    <ModalPublicar
      :show="mostrarModalPublicar"
      :fechas="pestanasFechas"
      :fechas-seleccionadas="fechasSeleccionadas"
      :cantidad-a-publicar="cantidadPartidosAPublicar"
      :hay-cambios="hayCambios"
      :total-a-designar="totalADesignarEnSeleccion"
      :total-sin-match="totalSinMatch"
      :publicando="publicando"
      @close="mostrarModalPublicar = false"
      @toggle-fecha="toggleFechaSeleccionada"
      @publicar="publicarDesignaciones"
    />

    <!-- Elegir qué estados incluir al descargar PDF/Excel -->
    <ModalDescarga
      :show="mostrarModalDescarga"
      :formato="formatoDescarga"
      :opciones="opcionesEstadoDescarga"
      :estados="estadosDescarga"
      :descargando="descargandoArchivo"
      @close="mostrarModalDescarga = false"
      @toggle-estado="toggleEstadoDescarga"
      @confirmar="confirmarDescarga"
    />

    <!-- Navegación: partidos sin designar / sin cancha / árbitros sin coincidencia / avisos -->
    <ModalPendientes
      :show="mostrarModalPendientes"
      :titulo="tituloModalPendientes"
      :icono="iconoModalPendientes"
      :color-icono="colorIconoModalPendientes"
      :tipo="tipoPendientes"
      :es-avisos="esModalAvisos"
      :tipo-aviso="tipoAvisoModal"
      :grupos="gruposModalPendientes"
      @close="mostrarModalPendientes = false"
      @ir="irAPartido"
    />

  </div>
</template>

<script setup>
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { ref, onMounted, computed, watch, inject, nextTick } from 'vue'
import { normalizarTexto } from '@/utils/texto'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import { useHead } from '@unhead/vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import ModalAvisos from '@/components/panel-admin/designaciones/carga-partidos/ModalAvisos.vue'
import ModalCargaExcel from '@/components/panel-admin/designaciones/carga-partidos/ModalCargaExcel.vue'
import ModalCancha from '@/components/panel-admin/designaciones/carga-partidos/ModalCancha.vue'
import ModalFechaHorario from '@/components/panel-admin/designaciones/carga-partidos/ModalFechaHorario.vue'
import ModalPublicar from '@/components/panel-admin/designaciones/carga-partidos/ModalPublicar.vue'
import ModalDescarga from '@/components/panel-admin/designaciones/carga-partidos/ModalDescarga.vue'
import ModalSelectorColor from '@/components/panel-admin/designaciones/carga-partidos/ModalSelectorColor.vue'
import ModalSelectorArbitro from '@/components/panel-admin/designaciones/carga-partidos/ModalSelectorArbitro.vue'
import ModalMesaControl from '@/components/panel-admin/designaciones/carga-partidos/ModalMesaControl.vue'
import ModalPendientes from '@/components/panel-admin/designaciones/carga-partidos/ModalPendientes.vue'
import TablaPartidosEscritorio from '@/components/panel-admin/designaciones/carga-partidos/TablaPartidosEscritorio.vue'
import TarjetasPartidosCelular from '@/components/panel-admin/designaciones/carga-partidos/TarjetasPartidosCelular.vue'
import {
  SIN_ARBITRO, estadoDesignacion, cantidadAvisos, etiquetaAvisos, textoAvisos, gruposAvisos, esSinMatch
} from '@/components/panel-admin/designaciones/carga-partidos/ayudasPartido'

useHead({
  title: 'Carga de Designaciones | AAAB',
  meta: [
    { name: 'description', content: 'Cargá, editá y publicá las designaciones de árbitros para los partidos del fin de semana.' },
    { property: 'og:title', content: 'Carga de Designaciones | AAAB' },
    { property: 'og:description', content: 'Cargá, editá y publicá las designaciones de árbitros para los partidos del fin de semana.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const toast = inject('toast')
const notificar = inject('notificar')

const esAdmin = computed(() => auth.getUser()?.rol === 'admin')

const designaciones = ref([])
const labelSemana = ref('')
const arbitros = ref([])
const cargando = ref(false)
const semanaAtras = ref(0)
const hayPosteriores = ref(false)
let contadorUid = 0

const avisosMap = ref({})

const cargarAvisos = async () => {
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerAvisosDesignaciones',
      payload: {
        semanaAtras: semanaAtras.value
      }
    })
    if (res.ok && res.payload && res.payload.success) {
      avisosMap.value = res.payload.avisos || {}
    } else {
      const detalle = (res.payload && res.payload.mensaje) ? res.payload.mensaje : JSON.stringify(res)
      console.error('obtenerAvisosDesignaciones falló:', detalle)
    }
  } catch (err) {
    console.error('Error al cargar avisos de validación:', err)
  }
}

// Avisos del partido (las funciones están en carga-partidos/ayudasPartido.js)
const avisosPartido = (p) => cantidadAvisos(avisosMap.value, p)
const etiquetaPartido = (p) => etiquetaAvisos(avisosMap.value, p)
const textoAvisosPartido = (p) => textoAvisos(avisosMap.value, p)
const gruposAvisosPartido = (p) => gruposAvisos(avisosMap.value, p)

const totalConflictos = computed(() => {
  return designaciones.value.filter(p => avisosPartido(p) > 0).length
})

// Tipos de aviso según el color que asigna el backend (de más a menos grave)
const TIPOS_AVISO = [
  {
    color: 'rojo',
    titulo: 'Impedimento',
    descripcion: 'No debería dirigir: inactivo, sanción, licencia aprobada o indeterminada, juega en el club o la categoría, vínculo en la categoría o solicitud institucional.'
  },
  {
    color: 'naranja',
    titulo: 'Conflicto',
    descripcion: 'Sin disponibilidad ese día, licencia pendiente o ya designado en otra cancha el mismo día.'
  },
  {
    color: 'amarillo',
    titulo: 'Advertencia',
    descripcion: 'Fuera de su horario declarado, licencia rechazada, ya dirigió al equipo en la categoría, o vínculo / ex-jugador / se identifica con el club.'
  }
]

const partidosConAviso = computed(() =>
  designaciones.value
    .filter(p => avisosPartido(p) > 0)
    .sort(ordenarPorFechaHorario)
)

const cantidadAvisosPorColor = computed(() => {
  const conteo = { rojo: 0, naranja: 0, amarillo: 0 }
  partidosConAviso.value.forEach(p => {
    const color = etiquetaPartido(p)
    if (conteo[color] !== undefined) conteo[color]++
  })
  return conteo
})

const mostrarAvisosPartido = (p) => {
  if (avisosPartido(p) === 0) return
  textoAvisosPartidoActual.value = textoAvisosPartido(p)
  mostrarModalAvisosPartido.value = true
}

const totalADesignar = computed(() =>
  designaciones.value.filter(p => estadoDesignacion(p) === 'a_designar').length
)

const totalADesignarEnSeleccion = computed(() =>
  designaciones.value.filter(p =>
    fechasSeleccionadas.value.includes(claveFecha(p)) && estadoDesignacion(p) === 'a_designar'
  ).length
)

/* ====================================================
   UTILIDADES DE TEXTO Y FECHAS
   ==================================================== */
const capitalizarNombre = (texto) => {
  return String(texto || '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ')
}

const parsearFecha = (fecha) => {
  if (!fecha) return 0
  const texto = String(fecha).trim()

  let m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()

  m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    const anio = m[3].length === 2 ? '20' + m[3] : m[3]
    return new Date(Number(anio), Number(m[2]) - 1, Number(m[1])).getTime()
  }

  return 0
}

const etiquetaDia = (fecha) => {
  const timestamp = parsearFecha(fecha)
  if (!timestamp) return fecha || 'Sin fecha'
  const d = new Date(timestamp)
  const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dias[d.getDay()]} ${dd}/${mm}/${d.getFullYear()}`
}

// Padrón liviano solo para el selector (las validaciones ya no lo necesitan)
const cargarArbitros = async () => {
  try {
    const res = await api.getCacheado({
      entity: 'arbitros',
      action: 'getArbitrosBasico',
      payload: { soloActivos: false }
    }, { ttl: 60 * 1000 })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (err) { console.error(err) }
}

/* ====================================================
   CANCHA (editable cuando llega vacía desde el Excel)
   Se persiste con la acción editarCampoDeJuego.
   Payload: { idPartido, cancha, idCampoJuego }.
   ==================================================== */
const camposJuego = ref([])

const cargarCamposJuego = async () => {
  try {
    const res = await api.get({ entity: 'clubes', action: 'obtenerCamposDeJuego' })
    if ((res.ok || res.success) && res.payload) camposJuego.value = res.payload
  } catch (err) { console.error(err) }
}

const mostrarSelectorCancha = ref(false)
const partidoCancha = ref(null)
const campoJuegoSeleccionado = ref('')
const guardandoCancha = ref(false)

const abrirSelectorCancha = (partido) => {
  partidoCancha.value = partido
  campoJuegoSeleccionado.value = partido.id_campo_juego || ''
  mostrarSelectorCancha.value = true
}

const cerrarSelectorCancha = () => {
  mostrarSelectorCancha.value = false
  partidoCancha.value = null
  campoJuegoSeleccionado.value = ''
}

const confirmarCancha = async () => {
  const p = partidoCancha.value
  const campo = camposJuego.value.find(cj => cj.cj_id === campoJuegoSeleccionado.value)
  if (!p || !campo) return

  guardandoCancha.value = true
  try {
    // Si el partido todavía no está en la base (recién cargado del Excel),
    // primero lo persistimos para que tenga id; editarCampoDeJuego lo necesita.
    if (!p.id) {
      const ok = await ejecutarGuardado()
      if (!ok || !p.id) {
        throw new Error('No se pudo guardar el partido antes de asignar la cancha')
      }
    }

    const resultado = await api.post({
      entity: 'designaciones',
      action: 'editarCampoDeJuego',
      payload: {
        idPartido: p.id,
        cancha: campo.cj_nombre,
        idCampoJuego: campo.cj_id
      }
    })

    if (!resultado.ok) {
      throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
    }

    p.cancha = campo.cj_nombre
    p.id_campo_juego = campo.cj_id
    cerrarSelectorCancha()
  } catch (err) {
    console.error('Error al editar cancha:', err)
    toast({ titulo: 'Error', mensaje: 'No se pudo guardar la cancha.', tipo: 'danger' })
  } finally {
    guardandoCancha.value = false
  }
}

/* ====================================================
   FECHA Y HORARIO (solo admin)
   Se persiste reutilizando guardarPartidos, que ya acepta
   fecha/horario por partido (ver limpiarPartidoParaEnviar).
   ==================================================== */
const mostrarModalFechaHorario = ref(false)
const partidoFechaHorario = ref(null)
const fechaEditada = ref('')
const horarioEditada = ref('')
const guardandoFechaHorario = ref(false)

const abrirModalFechaHorario = (p) => {
  if (!esAdmin.value) return
  partidoFechaHorario.value = p
  fechaEditada.value = p.fecha || ''
  horarioEditada.value = p.horario || ''
  mostrarModalFechaHorario.value = true
}

const cerrarModalFechaHorario = () => {
  mostrarModalFechaHorario.value = false
  partidoFechaHorario.value = null
  fechaEditada.value = ''
  horarioEditada.value = ''
}

const confirmarFechaHorario = async () => {
  const p = partidoFechaHorario.value
  if (!p || !fechaEditada.value || !horarioEditada.value) return

  const fechaAnterior = p.fecha
  const horarioAnterior = p.horario

  guardandoFechaHorario.value = true
  p.fecha = fechaEditada.value
  p.horario = horarioEditada.value
  marcar(p)

  const ok = await ejecutarGuardado()
  guardandoFechaHorario.value = false

  if (ok) {
    cerrarModalFechaHorario()
  } else {
    p.fecha = fechaAnterior
    p.horario = horarioAnterior
    toast({ titulo: 'Error', mensaje: 'No se pudo guardar la fecha/horario.', tipo: 'danger' })
  }
}

const fechaSeleccionada = ref('')
const filtroBusqueda = ref('')
const filtroEstado = ref('') // '' | 'a_designar' | 'designado' | 'publicado'

// Modal de navegación rápida (sin designar / sin coincidencia)
const mostrarModalPendientes = ref(false)
const tipoPendientes = ref('') // 'a_designar' | 'sin_match'
const partidoResaltado = ref('') // id/_uid del partido al que se saltó

const toggleFiltroEstado = (estado) => {
  filtroEstado.value = filtroEstado.value === estado ? '' : estado
}

const mostrarModalCarga = ref(false)
const subiendoExcel = ref(false)
const archivoExcel = ref(null)

const estadoGuardado = ref('') // '' | 'guardando' | 'guardado' | 'error'
let timerOcultar = null

const mostrarSelectorArbitro = ref(false)
const seleccionArbitro = ref(null)
const busquedaArbitro = ref('')

// Confirmación de avisos al designar árbitro 1/2 (antes de guardar)
const mostrarModalConfirmarDesignacion = ref(false)
const avisosDesignacionPendiente = ref([])
const designacionPendiente = ref(null) // { p, numero }

// Modal de avisos de un partido ya designado (ícono ⚠ en la grilla)
const mostrarModalAvisosPartido = ref(false)
const textoAvisosPartidoActual = ref('')

const mostrarModalPublicar = ref(false)
const publicando = ref(false)

// Fechas tildadas en el modal de Publicar: solo se publican los partidos de esas fechas
const fechasSeleccionadas = ref([])

const toggleFechaSeleccionada = (fecha) => {
  const i = fechasSeleccionadas.value.indexOf(fecha)
  if (i === -1) fechasSeleccionadas.value.push(fecha)
  else fechasSeleccionadas.value.splice(i, 1)
}

// Solo cuentan los partidos designados (los a_designar no se publican)
const cantidadPartidosAPublicar = computed(() =>
  designaciones.value.filter(p =>
    fechasSeleccionadas.value.includes(claveFecha(p)) && estadoDesignacion(p) !== 'a_designar'
  ).length
)

const zIndexSelector = computed(() => {
  return mostrarModalMesa.value ? 1060 : 1040
})

/* ====================================================
   MARCA DE ESTADO POR COLOR (etiqueta del árbitro)
   Se persiste con la acción editarEtiquetaArbitro.
   Payload: { id, numero, etiqueta }.
   El backend devuelve etiqueta_arb1 / etiqueta_arb2 al
   cargar las designaciones; acá se mapean a _estado1/_estado2.
   ==================================================== */
const opcionesColor = [
  { valor: 'observaciones', etiqueta: 'Observaciones', color: 'violeta' },
  { valor: 'reemplazar', etiqueta: 'Reemplazar', color: 'rojo' },
  { valor: 'cambiar', etiqueta: 'Cambiar', color: 'naranja' },
  { valor: 'confirmado', etiqueta: 'Cambio confirmado', color: 'amarillo' },
  { valor: 'posible', etiqueta: 'Posible cambio', color: 'verde' }
]

const mostrarSelectorColor = ref(false)
const seleccionColor = ref(null)

// numero: 1 | 2 para árbitros, o 'delegado' para el delegado técnico.
const abrirSelectorColor = (partido, numero) => {
  seleccionColor.value = { partido, numero }
  mostrarSelectorColor.value = true
}

const cerrarSelectorColor = () => {
  mostrarSelectorColor.value = false
  seleccionColor.value = null
}

const tituloSelectorColor = computed(() =>
  seleccionColor.value?.numero === 'delegado' ? 'Estado del delegado técnico' : 'Estado del árbitro'
)

const asignarColor = async (valor) => {
  const sel = seleccionColor.value
  if (!sel) return
  const p = sel.partido
  const numero = sel.numero

  // ---- Delegado técnico ----
  if (numero === 'delegado') {
    const valorAnterior = p._estadoDel

    // Actualización optimista
    p._estadoDel = valor
    cerrarSelectorColor()

    try {
      const resultado = await api.post({
        entity: 'designaciones',
        action: 'editarEtiquetaDelegado',
        payload: {
          idPartido: p.id,
          etiqueta: valor
        }
      })

      if (!resultado.ok) {
        throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
      }
    } catch (err) {
      console.error('Error al editar etiqueta del delegado:', err)
      // Revertir
      p._estadoDel = valorAnterior
      toast({ titulo: 'Error', mensaje: 'No se pudo guardar la etiqueta del delegado técnico.', tipo: 'danger' })
    }
    return
  }

  // ---- Árbitro 1 / 2 ----
  const valorAnterior = numero === 1 ? p._estado1 : p._estado2

  // Actualización optimista
  if (numero === 1) p._estado1 = valor
  else p._estado2 = valor
  cerrarSelectorColor()

  try {
    const resultado = await api.post({
      entity: 'designaciones',
      action: 'editarEtiquetaArbitro',
      payload: {
        idPartido: p.id,
        numero,
        etiqueta: valor
      }
    })

    if (!resultado.ok) {
      throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al editar etiqueta de árbitro:', err)
    // Revertir
    if (numero === 1) p._estado1 = valorAnterior
    else p._estado2 = valorAnterior
    toast({ titulo: 'Error', mensaje: 'No se pudo guardar la etiqueta del árbitro.', tipo: 'danger' })
  }
}

/* ====================================================
   SUSPENDER PARTIDO (antes del inicio)
   ==================================================== */
const toggleSuspendido = async (p, event) => {
  const nuevoValor = event.target.checked
  const valorAnterior = p.suspendido

  // Actualización optimista
  p.suspendido = nuevoValor

  try {
    const resultado = await api.post({
      entity: 'designaciones',
      action: 'marcarPartidoSuspendido',
      payload: {
        idPartido: p.id,
        suspendido: nuevoValor
      }
    })

    if (!resultado.ok) {
      throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al marcar partido suspendido:', err)
    // Revertir estado y checkbox
    p.suspendido = valorAnterior
    event.target.checked = valorAnterior
    toast({ titulo: 'Error', mensaje: 'No se pudo cambiar el estado del partido.', tipo: 'danger' })
  }
}

/* ====================================================
   BORRAR PARTIDO (solo sin árbitros, estado a_designar)
   ==================================================== */
const borrarPartido = (p) => {
  notificar({
    titulo: '¿Borrar partido?',
    mensaje: `${p.local || '?'} vs ${p.visitante || '?'}\nEsta acción no se puede deshacer.`,
    tipo: 'danger',
    alConfirmar: () => confirmarBorrarPartido(p)
  })
}

const confirmarBorrarPartido = async (p) => {
  try {
    const resultado = await api.post({
      entity: 'designaciones',
      action: 'borrarPartido',
      payload: {
        idPartido: p.id
      }
    })

    if (!resultado.ok || resultado.payload !== true) {
      throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
    }

    designaciones.value = designaciones.value.filter(d => d !== p)
    toast({ titulo: 'Éxito', mensaje: 'Partido borrado correctamente.', tipo: 'success' })
  } catch (err) {
    console.error('Error al borrar partido:', err)
    toast({ titulo: 'Error', mensaje: 'No se pudo borrar el partido.', tipo: 'danger' })
  }
}

/* ====================================================
   CARGA INICIAL
   ==================================================== */
const normalizarPartido = (p) => ({
  ...p,
  fecha: (p.fecha && !String(p.fecha).startsWith('0000')) ? String(p.fecha).slice(0, 10) : '',
  horario: p.horario ? String(p.horario).slice(0, 5) : '',
  suspendido: p.suspendido === true || p.suspendido === 1 || p.suspendido === '1',
  _estado1: p.etiqueta_arb1 || '',
  _estado2: p.etiqueta_arb2 || '',
  _ext1: Number(p.externo_arb1) === 1 && !p.id_arb1,
  _ext2: Number(p.externo_arb2) === 1 && !p.id_arb2,
  observador: p.observador || '',
  id_observador: p.id_observador || null,
  delegado: p.delegado || '',
  id_delegado: p.id_delegado || null,
  _estadoDel: p.etiqueta_delegado || '',
  planillero: p.planillero || '',
  id_planillero: p.id_planillero || null,
  cronometrista: p.cronometrista || '',
  id_cronometrista: p.id_cronometrista || null,
  _dirty: false,
  _uid: 'u' + (++contadorUid)
})
const cargarDesignaciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerDesignaciones',
      payload: { semanaAtras: semanaAtras.value }
    })
    if ((res.ok || res.success) && res.payload) {
      designaciones.value = res.payload.designaciones.map(normalizarPartido)
      labelSemana.value = res.payload.labelSemana
      hayPosteriores.value = !!res.payload.hayPosteriores
    }
  } catch (err) {
    console.error('Error al cargar designaciones:', err)
    toast({ titulo: 'Error', mensaje: 'No se pudieron cargar las designaciones.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const semanaAnterior = async () => {
  semanaAtras.value++
  await cargarDesignaciones()
  await cargarAvisos()
}

const semanaSiguiente = async () => {
  if (semanaAtras.value <= 0 && !hayPosteriores.value) return
  semanaAtras.value--
  await cargarDesignaciones()
  await cargarAvisos()
}

/* ====================================================
   FECHAS (PESTAÑAS POR DIA)
   ==================================================== */
const claveFecha = (p) => String(p.fecha || '').trim() || 'Sin fecha'

const fechas = computed(() => {
  const mapa = {}
  designaciones.value.forEach(p => {
    const f = claveFecha(p)
    mapa[f] = (mapa[f] || 0) + 1
  })

  return Object.keys(mapa)
    .sort((a, b) => parsearFecha(a) - parsearFecha(b))
    .map(f => ({ fecha: f, cantidad: mapa[f] }))
})

// Pestañas por día: etiqueta del día y cantidad de partidos
const pestanasFechas = computed(() => fechas.value.map(f => ({ clave: f.fecha, etiqueta: etiquetaDia(f.fecha), cantidad: f.cantidad })))

watch(fechas, (nuevas) => {
  if (!nuevas.find(f => f.fecha === fechaSeleccionada.value)) {
    fechaSeleccionada.value = nuevas.length > 0 ? nuevas[0].fecha : ''
  }
}, { immediate: true })

/* ====================================================
   AGRUPADO POR CANCHA (DEL DIA SELECCIONADO)
   ==================================================== */
const canchas = computed(() => {
  const busqueda = normalizarTexto(filtroBusqueda.value)

  const delDia = designaciones.value.filter(p => {
    const f = String(p.fecha || '').trim() || 'Sin fecha'
    if (f !== fechaSeleccionada.value) return false

    // Filtro por estado de designación
    if (filtroEstado.value && estadoDesignacion(p) !== filtroEstado.value) return false

    if (!busqueda) return true
    const textoPartido = normalizarTexto(
      `${p.cancha} ${p.local} ${p.visitante} ${p.arbitro_1} ${p.arbitro_2} ${p.observador} ${p.delegado} ${p.categoria_division}`
    )
    return textoPartido.includes(busqueda)
  })

  const mapa = {}
  delDia.forEach(p => {
    const nombre = String(p.cancha || 'SIN CANCHA').trim()
    if (!mapa[nombre]) mapa[nombre] = []
    mapa[nombre].push(p)
  })

  return Object.keys(mapa)
    .sort((a, b) => a.localeCompare(b))
    .map(nombre => {
      const partidos = mapa[nombre].sort((a, b) => String(a.horario || '').localeCompare(String(b.horario || '')))
      const primero = partidos[0] || {}
      const direccion = [primero.cj_domicilio, primero.cj_localidad].filter(Boolean).join(', ').trim()

      return {
        nombre,
        partidos,
        linkMapa: direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}` : null
      }
    })
})

const totalSinMatch = computed(() => {
  let contador = 0
  designaciones.value.forEach(p => {
    if (p.arbitro_1 && !p.id_arb1) contador++
    if (p.arbitro_2 && !p.id_arb2) contador++
  })
  return contador
})

const totalSinCancha = computed(() =>
  designaciones.value.filter(p => !p.cancha).length
)

/* ====================================================
   MARCA DE CAMBIO (solo para la asignación de árbitros)
   ==================================================== */
const marcar = (p) => {
  p._dirty = true
  ejecutarGuardado()
}

const hayCambios = computed(() => {
  return designaciones.value.some(p => p._dirty || !p.id)
})

/* ====================================================
   SELECTOR DE ARBITRO (modal compartido con buscador)
   Un solo listado en el DOM en vez de un <select> con
   todo el padrón por cada celda: mucho más liviano.
   ==================================================== */
const abrirSelectorArbitro = (partido, numero) => {
  seleccionArbitro.value = { partido, numero }
  busquedaArbitro.value = ''
  mostrarSelectorArbitro.value = true
}

const cerrarSelectorArbitro = () => {
  mostrarSelectorArbitro.value = false
  seleccionArbitro.value = null
}

const tituloSelector = computed(() => {
  if (!seleccionArbitro.value) return 'Asignar Árbitro'
  const p = seleccionArbitro.value.partido
  const num = seleccionArbitro.value.numero
  const versus = `${p.local || '?'} vs ${p.visitante || '?'}`
  if (num === 'observador') return `Observador — ${versus}`
  if (num === 'delegado') return `Delegado técnico — ${versus}`
  if (num === 'planillero') return `Planillero — ${versus}`
  if (num === 'cronometrista') return `Cronometrista — ${versus}`
  return `Árbitro ${num} — ${versus}`
})

const arbitrosFiltrados = computed(() => {
  const busqueda = normalizarTexto(busquedaArbitro.value)
  if (!busqueda) return arbitros.value
  return arbitros.value.filter(a => normalizarTexto(`${a.apellido} ${a.nombre}`).includes(busqueda))
})

// Texto del modal de confirmación: lista simple de avisos (un solo árbitro).
const textoAvisosDesignacionPendiente = computed(() => {
  return avisosDesignacionPendiente.value.map(a => `• ${a}`).join('\n')
})

// Antes de guardar la designación de árbitro 1/2, se consulta si genera
// conflictos (doble cancha, mismo equipo, etc). Si no hay avisos, se guarda
// directo; si hay, se pide confirmación antes de persistir.
// numero (1 o 2) es solo para uso del FE, para saber qué puesto vaciar si se rechaza.
const consultarDesignacion = async (p, numero, idArbitro) => {
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerAvisosArbitro',
      payload: {
        idPartido: p.id,
        idArbitro
      }
    })
    const avisos = (res.ok && res.payload && res.payload.success) ? (res.payload.avisos || []) : []

    if (avisos.length === 0) {
      marcar(p)
      return
    }

    avisosDesignacionPendiente.value = avisos
    designacionPendiente.value = { p, numero }
    mostrarModalConfirmarDesignacion.value = true
  } catch (err) {
    console.error('Error al calcular avisos del árbitro:', err)
    marcar(p)
  }
}

const cerrarModalConfirmarDesignacion = () => {
  mostrarModalConfirmarDesignacion.value = false
  avisosDesignacionPendiente.value = []
  designacionPendiente.value = null
}

// Sí: recién acá se persiste la designación con ejecutarGuardado (vía marcar).
const confirmarDesignacionConAvisos = () => {
  const pendiente = designacionPendiente.value
  cerrarModalConfirmarDesignacion()
  if (!pendiente) return
  marcar(pendiente.p)
}

// No: se quita el árbitro seleccionado y el puesto vuelve a quedar en blanco.
const rechazarDesignacionConAvisos = () => {
  const pendiente = designacionPendiente.value
  cerrarModalConfirmarDesignacion()
  if (!pendiente) return
  const { p, numero } = pendiente
  if (numero === 1) { p.arbitro_1 = ''; p.id_arb1 = null; p._ext1 = false; p._estado1 = '' }
  else { p.arbitro_2 = ''; p.id_arb2 = null; p._ext2 = false; p._estado2 = '' }
  p.estado = (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'
}

const asignarArbitro = async (arbitro) => {
  const sel = seleccionArbitro.value
  if (!sel) return
  const p = sel.partido

  // ---- Mesa de control (planillero / cronometrista) ----
  if (sel.numero === 'planillero' || sel.numero === 'cronometrista') {
    await asignarMesa(arbitro, sel.numero, p)
    return
  }

  // ---- Observador / Delegado técnico (acción propia) ----
  if (sel.numero === 'observador' || sel.numero === 'delegado') {
    await asignarObservadorDelegado(arbitro, sel.numero, p)
    return
  }

  // ---- Árbitro 1 / 2 (flujo existente) ----
  // Al cambiar de árbitro se limpia la etiqueta: si el anterior había
  // rechazado (quedó en 'reemplazar'), esa marca ya no corresponde.
  cerrarSelectorArbitro()

  if (!arbitro) {
    if (sel.numero === 1) { p.arbitro_1 = ''; p.id_arb1 = null; p._ext1 = false; p._estado1 = '' }
    else { p.arbitro_2 = ''; p.id_arb2 = null; p._ext2 = false; p._estado2 = '' }
    p.estado = (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'
    marcar(p)
    return
  }

  const nombreCompleto = capitalizarNombre(`${arbitro.apellido}, ${arbitro.nombre}`)
  if (sel.numero === 1) { p.arbitro_1 = nombreCompleto; p.id_arb1 = arbitro.id; p._ext1 = false; p._estado1 = '' }
  else { p.arbitro_2 = nombreCompleto; p.id_arb2 = arbitro.id; p._ext2 = false; p._estado2 = '' }

  // Recalcular estado local para que la ayuda visual reaccione al instante.
  // El backend lo confirma igual al guardar (guardarPartidos).
  p.estado = (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'

  await consultarDesignacion(p, sel.numero, arbitro.id)
}

const asignarSinArbitro = () => {
  const sel = seleccionArbitro.value
  if (!sel || (sel.numero !== 1 && sel.numero !== 2)) return
  const p = sel.partido
  cerrarSelectorArbitro()

  if (sel.numero === 1) { p.arbitro_1 = SIN_ARBITRO; p.id_arb1 = null; p._ext1 = false; p._estado1 = '' }
  else { p.arbitro_2 = SIN_ARBITRO; p.id_arb2 = null; p._ext2 = false; p._estado2 = '' }

  p.estado = (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'
  marcar(p)
}

// Asigna un árbitro que no está en el padrón (ej: viene del interior).
// Queda como texto libre, sin id_arb, y por eso no le aparece en su panel.
// Al no tener id no hay contra qué calcular avisos: se guarda directo.
const asignarArbitroLibre = async (texto) => {
  const sel = seleccionArbitro.value
  if (!sel) return
  const nombre = capitalizarNombre(texto)
  if (!nombre) return
  const p = sel.partido
  cerrarSelectorArbitro()

  if (sel.numero === 1) { p.arbitro_1 = nombre; p.id_arb1 = null; p._ext1 = true; p._estado1 = '' }
  else { p.arbitro_2 = nombre; p.id_arb2 = null; p._ext2 = true; p._estado2 = '' }

  // Recalcular estado local para que la ayuda visual reaccione al instante.
  // El backend lo confirma igual al guardar (guardarPartidos).
  p.estado = (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'

  marcar(p)
}

/* ====================================================
   MESA DE CONTROL (planillero / cronometrista)
   Opcional por partido. Se abre un modal con los dos roles.
   Cada asignación reutiliza el selector de árbitros y se
   persiste con la acción editarCronometristaPlanillero.
   Payload: { idPartido, tipo, idArbitro }.
   tipo: 'planillero' | 'cronometrista'.
   ==================================================== */
const mostrarModalMesa = ref(false)
const partidoMesa = ref(null)

const abrirModalMesa = (partido) => {
  partidoMesa.value = partido
  mostrarModalMesa.value = true
}

const cerrarModalMesa = () => {
  mostrarModalMesa.value = false
  partidoMesa.value = null
}

// Abre el selector de árbitros reutilizado, marcando el rol de mesa.
// No cerramos el modal de mesa: el selector se abre encima.
const abrirSelectorMesa = (tipo) => {
  if (!partidoMesa.value) return
  seleccionArbitro.value = { partido: partidoMesa.value, numero: tipo } // 'planillero' | 'cronometrista'
  busquedaArbitro.value = ''
  mostrarSelectorArbitro.value = true
}

const asignarMesa = async (arbitro, tipo, p) => {
  const campoNombre = tipo === 'planillero' ? 'planillero' : 'cronometrista'
  const campoId = tipo === 'planillero' ? 'id_planillero' : 'id_cronometrista'

  const nombreAnterior = p[campoNombre]
  const idAnterior = p[campoId]

  // Actualización optimista
  if (!arbitro) {
    p[campoNombre] = ''
    p[campoId] = null
  } else {
    p[campoNombre] = capitalizarNombre(`${arbitro.apellido} ${arbitro.nombre}`)
    p[campoId] = arbitro.id
  }

  setTimeout(() => cerrarSelectorArbitro(), 0)

  try {
    const resultado = await api.post({
      entity: 'designaciones',
      action: 'editarCronometristaPlanillero',
      payload: {
        idPartido: p.id,
        tipo,                            // 'planillero' | 'cronometrista'
        idArbitro: arbitro ? arbitro.id : null
      }
    })

    if (!resultado.ok) {
      throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al editar planillero/cronometrista:', err)
    p[campoNombre] = nombreAnterior
    p[campoId] = idAnterior
    toast({ titulo: 'Error', mensaje: 'No se pudo guardar la mesa de control.', tipo: 'danger' })
  }
}

/* ====================================================
   OBSERVADOR / DELEGADO TÉCNICO
   Se persiste con la acción editarObservadorDelegado.
   Payload: { id, tipo, id_arbitro }.
   tipo: 'observador' | 'delegado'. id_arbitro null = sin asignar.
   Actualización optimista con reversión si falla.
   ==================================================== */
const asignarObservadorDelegado = async (arbitro, tipo, p) => {
  const campoNombre = tipo === 'observador' ? 'observador' : 'delegado'
  const campoId = tipo === 'observador' ? 'id_observador' : 'id_delegado'

  // Guardo valores anteriores por si hay que revertir
  const nombreAnterior = p[campoNombre]
  const idAnterior = p[campoId]
  const estadoDelAnterior = p._estadoDel

  // Actualización optimista
  if (!arbitro) {
    p[campoNombre] = ''
    p[campoId] = null
  } else {
    p[campoNombre] = capitalizarNombre(`${arbitro.apellido} ${arbitro.nombre}`)
    p[campoId] = arbitro.id
  }

  // Al cambiar el delegado técnico, su etiqueta ('reemplazar' por rechazo del
  // delegado anterior) deja de corresponder: se limpia acá y en el backend.
  if (tipo === 'delegado') p._estadoDel = ''

  cerrarSelectorArbitro()

  try {
    const resultado = await api.post({
      entity: 'designaciones',
      action: 'editarObservadorDelegado',
      payload: {
        idPartido: p.id,
        tipo,                        // 'observador' | 'delegado'
        idArbitro: arbitro ? arbitro.id : null
      }
    })

    if (!resultado.ok) {
      throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al editar observador/delegado:', err)
    // Revertir
    p[campoNombre] = nombreAnterior
    p[campoId] = idAnterior
    if (tipo === 'delegado') p._estadoDel = estadoDelAnterior
    toast({ titulo: 'Error', mensaje: 'No se pudo guardar el observador/delegado técnico.', tipo: 'danger' })
  }
}

// Un partido "tiene sin coincidencia" si alguno de sus arbitros esta sin match
const partidoTieneSinMatch = (p) => esSinMatch(p, 1) || esSinMatch(p, 2)

// Listas de partidos pendientes (de todas las fechas), ordenadas por fecha y horario
const ordenarPorFechaHorario = (a, b) => {
  const df = parsearFecha(claveFecha(a)) - parsearFecha(claveFecha(b))
  if (df !== 0) return df
  return String(a.horario || '').localeCompare(String(b.horario || ''))
}

const partidosSinDesignar = computed(() =>
  designaciones.value
    .filter(p => estadoDesignacion(p) === 'a_designar')
    .sort(ordenarPorFechaHorario)
)

const partidosSinCoincidencia = computed(() =>
  designaciones.value
    .filter(p => partidoTieneSinMatch(p))
    .sort(ordenarPorFechaHorario)
)

const partidosSinCancha = computed(() =>
  designaciones.value
    .filter(p => !p.cancha)
    .sort(ordenarPorFechaHorario)
)

// Lista que se muestra en el modal segun el tipo abierto
// Modal de avisos: tipoPendientes = 'aviso_todos' | 'aviso_rojo' | 'aviso_naranja' | 'aviso_amarillo'
const esModalAvisos = computed(() => tipoPendientes.value.startsWith('aviso_'))
const tipoAvisoModal = computed(() =>
  TIPOS_AVISO.find(t => 'aviso_' + t.color === tipoPendientes.value) || null
)

const partidosPendientesModal = computed(() => {
  if (tipoPendientes.value === 'sin_match') return partidosSinCoincidencia.value
  if (tipoPendientes.value === 'sin_cancha') return partidosSinCancha.value
  if (tipoPendientes.value === 'aviso_todos') return partidosConAviso.value
  if (tipoAvisoModal.value) {
    return partidosConAviso.value.filter(p => etiquetaPartido(p) === tipoAvisoModal.value.color)
  }
  return partidosSinDesignar.value
})

const tituloModalPendientes = computed(() => {
  if (tipoPendientes.value === 'sin_match') return 'Árbitros sin coincidencia'
  if (tipoPendientes.value === 'sin_cancha') return 'Partidos sin cancha'
  if (tipoPendientes.value === 'aviso_todos') return 'Partidos con avisos'
  if (tipoAvisoModal.value) return 'Avisos: ' + tipoAvisoModal.value.titulo
  return 'Partidos sin designar'
})

const iconoModalPendientes = computed(() => {
  if (tipoPendientes.value === 'sin_match') return 'person_off'
  if (tipoPendientes.value === 'sin_cancha') return 'wrong_location'
  if (esModalAvisos.value) return 'warning'
  return 'error_outline'
})

const colorIconoModalPendientes = computed(() => {
  if (tipoPendientes.value === 'sin_match') return 'bg-warning text-dark'
  if (tipoAvisoModal.value?.color === 'amarillo') return 'bg-warning text-dark'
  if (tipoAvisoModal.value?.color === 'naranja') return 'bg-warning text-white'
  return 'bg-danger text-white'
})

// Agrupa la lista del modal por fecha para mostrarla con encabezados
const pendientesAgrupados = computed(() => {
  const mapa = {}
  partidosPendientesModal.value.forEach(p => {
    const f = claveFecha(p)
    if (!mapa[f]) mapa[f] = []
    mapa[f].push(p)
  })
  return Object.keys(mapa)
    .sort((a, b) => parsearFecha(a) - parsearFecha(b))
    .map(f => ({ fecha: f, partidos: mapa[f] }))
})

const abrirModalPendientes = (tipo) => {
  tipoPendientes.value = tipo
  mostrarModalPendientes.value = true
}

// Nombres de arbitros sin match de un partido (para mostrarlos en el modal)
const arbitrosSinMatchDe = (p) => {
  const nombres = []
  if (esSinMatch(p, 1)) nombres.push(p.arbitro_1)
  if (esSinMatch(p, 2)) nombres.push(p.arbitro_2)
  return nombres
}

// Datos ya armados para ModalPendientes (solo se calculan con el modal abierto)
const gruposModalPendientes = computed(() => {
  if (!mostrarModalPendientes.value) return []
  return pendientesAgrupados.value.map(g => ({
    fecha: g.fecha,
    etiqueta: etiquetaDia(g.fecha),
    items: g.partidos.map(p => ({
      partido: p,
      etiqueta: esModalAvisos.value ? etiquetaPartido(p) : '',
      estado: estadoDesignacion(p),
      sinMatch: tipoPendientes.value === 'sin_match' ? arbitrosSinMatchDe(p) : [],
      avisos: esModalAvisos.value ? gruposAvisosPartido(p) : []
    }))
  }))
})

// Salta al partido elegido: cambia a su fecha, limpia filtros, cierra el modal,
// hace scroll a la fila y la resalta unos segundos.
let timerResaltado = null
const irAPartido = (p) => {
  const destino = claveFecha(p)
  if (fechaSeleccionada.value !== destino) fechaSeleccionada.value = destino
  filtroEstado.value = ''
  filtroBusqueda.value = ''
  mostrarModalPendientes.value = false

  const uid = p.id || p._uid
  partidoResaltado.value = uid

  nextTick(() => {
    const fila = document.getElementById('partido-' + uid) || document.getElementById('partido-mob-' + uid)
    if (fila) fila.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })

  clearTimeout(timerResaltado)
  timerResaltado = setTimeout(() => { partidoResaltado.value = '' }, 3000)
}

const limpiarPartidoParaEnviar = (p) => ({
  id: p.id,
  _uid: p._uid,
  fecha: p.fecha,
  //cancha: p.cancha,
  //categoria_division: p.categoria_division,
  horario: p.horario,
  //local: p.local,
  //visitante: p.visitante,
  arbitro_1: p.arbitro_1,
  arbitro_2: p.arbitro_2,
  id_arb1: p.id_arb1,
  id_arb2: p.id_arb2,
  externo_arb1: !!p._ext1 && !p.id_arb1,
  externo_arb2: !!p._ext2 && !p.id_arb2
})

const ejecutarGuardado = async () => {
  const modificados = designaciones.value.filter(p => p._dirty || !p.id)

  if (modificados.length === 0) {
    estadoGuardado.value = ''
    return true
  }

  estadoGuardado.value = 'guardando'

  try {
    const res = await api.post({
      entity: 'designaciones',
      action: 'guardarPartidos',
      payload: {
        partidos: modificados.map(limpiarPartidoParaEnviar)
      }
    })

    if (res.ok && res.payload && res.payload.success) {
      // Asignar ids nuevos que devuelve el backend (map _uid -> id)
      const nuevosIds = res.payload.ids || {}
      modificados.forEach(p => {
        if (!p.id && p._uid && nuevosIds[p._uid]) p.id = nuevosIds[p._uid]
        p._dirty = false
      })

      estadoGuardado.value = 'guardado'
      if (timerOcultar) clearTimeout(timerOcultar)
      timerOcultar = setTimeout(() => {
        if (estadoGuardado.value === 'guardado') estadoGuardado.value = ''
      }, 2000)

      // Con los datos ya persistidos, el backend recalcula los avisos
      cargarAvisos()
      return true
    }
    throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
  } catch (err) {
    console.error('Error al guardar cambios:', err)
    estadoGuardado.value = 'error'
    return false
  }
}

const guardarAhora = () => { ejecutarGuardado() }

const abrirModalCarga = () => {
  archivoExcel.value = null
  mostrarModalCarga.value = true
}

const cerrarModalCarga = () => {
  mostrarModalCarga.value = false
  archivoExcel.value = null
}

const seleccionarArchivoExcel = (event) => {
  archivoExcel.value = event.target.files[0] || null
}

const confirmarCargaExcel = async () => {
  if (!archivoExcel.value) return

  const formData = new FormData()
  formData.append('archivo', archivoExcel.value)

  subiendoExcel.value = true
  try {
    const res = await api.postFile({
      entity: 'designaciones',
      action: 'cargarDesignacionesExcel',
      payload: formData
    })

    if (res.ok && res.payload && res.payload.success) {
      toast({ titulo: 'Éxito', mensaje: res.payload.mensaje || 'Se cargaron los partidos.', tipo: 'success' })
      cerrarModalCarga()
      await cargarDesignaciones()
      cargarAvisos()
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al cargar designaciones:', err)
    toast({ titulo: 'Error', mensaje: err.message || 'Hubo un problema al subir el archivo.', tipo: 'danger' })
  } finally {
    subiendoExcel.value = false
  }
}

/* ====================================================
   PUBLICAR (PDF PARA LA WEB + PANEL DE ARBITROS)
   Si hay cambios sin guardar, se guardan automáticamente
   antes de publicar. El PDF se genera en el servidor.
   ==================================================== */
const abrirModalPublicar = () => {
  // Arrancamos con todas las fechas tildadas (el usuario puede destildar)
  fechasSeleccionadas.value = fechas.value.map(f => f.fecha)
  mostrarModalPublicar.value = true
}

const publicarDesignaciones = async () => {
  if (fechasSeleccionadas.value.length === 0) {
    toast({ titulo: 'Atención', mensaje: 'Tildá al menos una fecha para publicar.', tipo: 'warning' })
    return
  }

  publicando.value = true
  try {
  /*
    const guardado = await ejecutarGuardado()
    if (!guardado) return
*/
    const res = await api.post({
      entity: 'designaciones',
      action: 'publicarDesignaciones',
      payload: {
        fechas: fechasSeleccionadas.value
      }
    })

    if (res.ok) {
      toast({ titulo: 'Éxito', mensaje: res.payload.mensaje || 'Las designaciones se publicaron en la web y en el panel de los árbitros.', tipo: 'success' })
      mostrarModalPublicar.value = false
      // Refrescamos para reflejar el nuevo estado publicado de los partidos
      await cargarDesignaciones()
      cargarAvisos()
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor al publicar designaciones.')
    }
  } catch (err) {
    console.error('Error al publicar:', err)
    toast({ titulo: 'Error', mensaje: err.message || 'Hubo un problema al publicar las designaciones.', tipo: 'danger' })
  } finally {
    publicando.value = false
  }
}

const descargandoArchivo = ref(false)

// Modal para elegir qué estados de designación incluir en la descarga
const mostrarModalDescarga = ref(false)
const formatoDescarga = ref('pdf')
const opcionesEstadoDescarga = [
  { valor: 'a_designar', etiqueta: 'Sin designar' },
  { valor: 'designado', etiqueta: 'Designado' },
  { valor: 'publicado', etiqueta: 'Publicado' }
]
const estadosDescarga = ref(opcionesEstadoDescarga.map(e => e.valor))

const toggleEstadoDescarga = (estado) => {
  const i = estadosDescarga.value.indexOf(estado)
  if (i === -1) estadosDescarga.value.push(estado)
  else estadosDescarga.value.splice(i, 1)
}

const abrirModalDescarga = (formato) => {
  formatoDescarga.value = formato
  mostrarModalDescarga.value = true
}

const confirmarDescarga = async () => {
  if (estadosDescarga.value.length === 0) return
  await descargarDesignaciones(formatoDescarga.value)
  mostrarModalDescarga.value = false
}

const descargarDesignaciones = async (formato = 'pdf') => {
  const esExcel = formato === 'excel'
  descargandoArchivo.value = true
  try {
    await api.getFile({
      entity: 'designaciones',
      action: 'descargarDesignaciones',
      payload: {
        semanaAtras: semanaAtras.value,
        estados: estadosDescarga.value,
        ...(esExcel ? { formato: 'excel' } : {})
      }
    }, esExcel ? 'designaciones.xlsx' : 'designaciones.pdf')
  } catch (err) {
    console.error('Error al descargar las designaciones:', err)
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo descargar el archivo.', tipo: 'danger' })
  } finally {
    descargandoArchivo.value = false
  }
}

onMounted(async () => {
  await cargarArbitros()
  await cargarDesignaciones()
  cargarAvisos()
  cargarCamposJuego()
})
</script>

<style scoped src="@/components/panel-admin/designaciones/carga-partidos/carga-partidos-compartido.css"></style>
<style scoped>
/* ====================================================
   CHIPS DE FILTRO
   ==================================================== */

.leyenda-muestra {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.muestra-a-designar {
  background-color: var(--o-rojo-fondo, #fee2e2);
  border-color: #f87171;
}

.muestra-designado {
  background-color: var(--o-ambar-fondo, #fef9c3);
  border-color: #facc15;
}

.muestra-publicado {
  background-color: var(--o-verde-fondo, #dcfce7);
  border-color: #4ade80;
}

/* Contadores clickeables del encabezado (sin designar / sin coincidencia) */
.btn-contador {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-style: dotted;
}

.btn-contador:hover {
  text-decoration-style: solid;
}

/* ====================================================
   BARRA FLOTANTE DE CAMBIOS SIN GUARDAR
   ==================================================== */
.barra-cambios {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  border-radius: 50rem;
  padding: 10px 24px;
  z-index: 1050;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* ====================================================
   ESTILOS DEL BUSCADOR (Bordes unificados)
   ==================================================== */
.buscador-grupo {
  border-radius: var(--bs-border-radius-sm);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

/* Evitar que el input ponga su propio borde cuando tiene foco */
.buscador-grupo .form-control:focus {
  border-color: var(--o-borde, #dee2e6);
  box-shadow: none;
}

/* Aplicar el color celeste de Bootstrap a todos los hijos cuando el grupo tiene foco */
.buscador-grupo:focus-within > .input-group-text,
.buscador-grupo:focus-within > .form-control,
.buscador-grupo:focus-within > .btn {
  border-color: #86b7fe !important;
}

/* Sombra exterior (anillo) roja a todo el grupo */
.buscador-grupo:focus-within {
  box-shadow: 0 0 0 0.25rem rgba(220, 38, 38, 0.2) !important;
}

/* Chips de filtro por estado */
.chip-estado {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--o-tarjeta, #fff);
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 50rem;
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--o-texto-medio, #475569);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.chip-estado:hover {
  border-color: var(--o-borde, #cbd5e1);
  background: var(--o-superficie, #f8fafc);
}

.chip-estado.chip-activo {
  border-color: #1f2937;
  background: #1f2937;
  color: #fff;
}

.muestra-todos {
  background: linear-gradient(135deg, var(--o-rojo-fondo, #fee2e2) 0%, var(--o-rojo-fondo, #fee2e2) 33%, var(--o-ambar-fondo, #fef9c3) 33%, var(--o-ambar-fondo, #fef9c3) 66%, var(--o-verde-fondo, #dcfce7) 66%);
}
</style>
