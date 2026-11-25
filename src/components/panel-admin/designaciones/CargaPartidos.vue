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
      :opciones="OPCIONES_COLOR"
      @close="cerrarSelectorColor"
      @elegir="asignarColor"
    />

    <ModalSelectorArbitro
      v-model:busqueda="busquedaArbitro"
      :show="mostrarSelectorArbitro"
      :titulo="tituloSelector"
      :z-index="zIndexSelector"
      :arbitros="arbitrosFiltrados"
      :permite-sin-arbitro="permiteSinArbitro"
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
      :opciones="OPCIONES_ESTADO_DESCARGA"
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
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import { onMounted, computed, inject } from 'vue'
import { auth } from '@/api/auth'
import { useHead } from '@unhead/vue'
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
import { SIN_ARBITRO } from '@/components/panel-admin/designaciones/carga-partidos/ayudasPartido'
import { useCargaPartidos, TIPOS_AVISO } from '@/composables/useCargaPartidos'
import { useDesignacionPartido, OPCIONES_COLOR } from '@/composables/useDesignacionPartido'
import { usePublicarDesignaciones, OPCIONES_ESTADO_DESCARGA } from '@/composables/usePublicarDesignaciones'

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

// La lógica vive en los composables; acá solo se arma la pantalla.
//  - useCargaPartidos: semana, días, filtros, canchas, avisos, guardado, Excel y pendientes
//  - useDesignacionPartido: árbitros, marcas, mesa, observador/delegado, cancha, horario, suspender y borrar
//  - usePublicarDesignaciones: publicar y descargar
const carga = useCargaPartidos({ toast })
const {
  designaciones, labelSemana, cargando, semanaAtras, hayPosteriores, camposJuego,
  iniciar, semanaAnterior, semanaSiguiente,
  avisosMap, totalConflictos, cantidadAvisosPorColor,
  mostrarModalAvisosPartido, textoAvisosPartidoActual, mostrarAvisosPartido,
  pestanasFechas, fechaSeleccionada, filtroBusqueda, filtroEstado, toggleFiltroEstado, canchas,
  totalADesignar, totalSinMatch, totalSinCancha,
  estadoGuardado, guardarAhora, hayCambios,
  mostrarModalCarga, subiendoExcel, archivoExcel, abrirModalCarga, cerrarModalCarga, seleccionarArchivoExcel, confirmarCargaExcel,
  mostrarModalPendientes, tipoPendientes, partidoResaltado, esModalAvisos, tipoAvisoModal,
  tituloModalPendientes, iconoModalPendientes, colorIconoModalPendientes, gruposModalPendientes,
  abrirModalPendientes, irAPartido
} = carga

const {
  mostrarSelectorArbitro, busquedaArbitro, tituloSelector, arbitrosFiltrados, permiteSinArbitro, zIndexSelector,
  abrirSelectorArbitro, cerrarSelectorArbitro, asignarArbitro, asignarSinArbitro, asignarArbitroLibre,
  mostrarModalConfirmarDesignacion, textoAvisosDesignacionPendiente, confirmarDesignacionConAvisos, rechazarDesignacionConAvisos,
  mostrarModalMesa, partidoMesa, abrirModalMesa, cerrarModalMesa, abrirSelectorMesa,
  mostrarSelectorColor, tituloSelectorColor, abrirSelectorColor, cerrarSelectorColor, asignarColor,
  mostrarSelectorCancha, partidoCancha, campoJuegoSeleccionado, guardandoCancha, abrirSelectorCancha, cerrarSelectorCancha, confirmarCancha,
  mostrarModalFechaHorario, partidoFechaHorario, fechaEditada, horarioEditada, guardandoFechaHorario,
  abrirModalFechaHorario, cerrarModalFechaHorario, confirmarFechaHorario,
  toggleSuspendido, borrarPartido
} = useDesignacionPartido({ carga, esAdmin, toast, notificar })

const {
  mostrarModalPublicar, publicando, fechasSeleccionadas, toggleFechaSeleccionada,
  cantidadPartidosAPublicar, totalADesignarEnSeleccion, abrirModalPublicar, publicarDesignaciones,
  descargandoArchivo, mostrarModalDescarga, formatoDescarga, estadosDescarga,
  toggleEstadoDescarga, abrirModalDescarga, confirmarDescarga
} = usePublicarDesignaciones({ carga, toast })

onMounted(iniciar)
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
