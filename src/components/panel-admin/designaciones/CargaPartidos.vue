<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-clipboard2-check-fill me-1"></i> Carga de Designaciones
            </h4>
            <span class="text-muted small d-block mt-1">
              Total: {{ designaciones.length }} partidos
              <template v-if="totalSinMatch > 0">
                · <span class="text-warning-emphasis fw-bold">{{ totalSinMatch }} árbitros sin coincidencia</span>
              </template>
              <template v-if="totalConflictos > 0">
                · <span class="text-danger fw-bold"><i class="bi bi-exclamation-triangle-fill"></i> {{ totalConflictos }} {{ totalConflictos === 1 ? 'conflicto' : 'conflictos' }}</span>
              </template>
            </span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="abrirModalCarga" class="btn btn-primary shadow-sm py-2 d-flex align-items-center gap-2 text-white">
              <span class="material-icons fs-6">upload_file</span>
              <span class="fw-bold d-none d-md-inline small">Cargar Excel</span>
            </button>

            <button
              @click="solicitarEliminarTodo"
              class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2"
              :disabled="designaciones.length === 0"
            >
              <span class="material-icons text-danger fs-6">delete_sweep</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Eliminar Todo</span>
            </button>

            <button
              @click="enviarATesoreria"
              class="btn btn-dark shadow-sm py-2 d-flex align-items-center gap-2 text-white"
              :disabled="designaciones.length === 0"
            >
              <span class="material-icons fs-6">account_balance</span>
              <span class="fw-bold d-none d-md-inline small">Tesorería</span>
            </button>

            <button
              @click="abrirModalPublicar('actualizar')"
              class="btn btn-warning shadow-sm py-2 d-flex align-items-center gap-2 text-dark"
              :disabled="designaciones.length === 0"
              title="Reemplaza la última publicación sin duplicarla"
            >
              <span class="material-icons fs-6">sync</span>
              <span class="fw-bold d-none d-md-inline small">Actualizar</span>
            </button>

            <button
              @click="abrirModalPublicar('publicar')"
              class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white"
              :disabled="designaciones.length === 0"
              title="Primera publicación de esta designación"
            >
              <span class="material-icons fs-6">cloud_upload</span>
              <span class="fw-bold d-none d-md-inline small">Publicar</span>
            </button>
          </div>
        </div>

        <div class="card-body p-2 p-md-3 bg-light">

          <div v-if="cargando" class="text-center py-5">
            <span class="spinner-border text-danger"></span>
            <p class="text-muted mt-3 m-0 fw-bold small">Cargando designaciones...</p>
          </div>

          <div v-else-if="designaciones.length === 0" class="text-center p-5 bg-white rounded shadow-sm border">
            <span class="material-icons text-muted opacity-50 d-block mb-2 fs-1">upload_file</span>
            <p class="text-muted m-0 fw-bold">No hay designaciones cargadas.</p>
            <p class="text-muted small mt-1 mb-0">Usá el botón "Cargar Excel" para importar la planilla de partidos.</p>
          </div>

          <template v-else>

            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
              <ul class="nav nav-pills gap-2 flex-wrap">
                <li v-for="f in fechas" :key="f.fecha" class="nav-item">
                  <button
                    @click="fechaSeleccionada = f.fecha"
                    class="nav-link py-1 px-3 fw-bold small shadow-sm"
                    :class="fechaSeleccionada === f.fecha ? 'active bg-danger text-white' : 'bg-white border text-dark'"
                  >
                    {{ etiquetaDia(f.fecha) }}
                    <span class="badge ms-1" :class="fechaSeleccionada === f.fecha ? 'bg-white text-danger' : 'bg-light text-dark border'">{{ f.cantidad }}</span>
                  </button>
                </li>
              </ul>

              <div class="d-flex gap-2 align-items-center">
                <div class="input-group input-group-sm shadow-sm" style="max-width: 280px;">
                  <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input
                    v-model="filtroBusqueda"
                    type="text"
                    class="form-control border-start-0 shadow-none"
                    placeholder="Buscar cancha, equipo o árbitro..."
                  >
                </div>
                <button @click="agregarCancha" class="btn btn-sm btn-outline-dark fw-bold shadow-sm text-nowrap">
                  <i class="bi bi-plus-lg"></i> Cancha
                </button>
              </div>
            </div>

            <div v-if="canchas.length === 0" class="text-center p-4 bg-white rounded shadow-sm border">
              <span class="material-icons text-muted opacity-50 d-block mb-2 fs-1">search_off</span>
              <p class="text-muted m-0 fw-bold">No se encontraron partidos con ese filtro.</p>
            </div>

            <!-- ============ VISTA DESKTOP: TABLA TIPO EXCEL ============ -->
            <div v-else class="d-none d-md-block border rounded shadow-sm bg-white grilla-container">
              <table class="table align-middle mb-0 grilla-designaciones">
                <thead>
                  <tr>
                    <th class="text-uppercase text-muted" style="width: 22%;">Categoría / División</th>
                    <th class="text-uppercase text-muted text-center" style="width: 8%;">Horario</th>
                    <th class="text-uppercase text-muted" style="width: 17%;">Local</th>
                    <th class="text-uppercase text-muted" style="width: 17%;">Visitante</th>
                    <th class="text-uppercase text-muted" style="width: 16%;">Árbitro 1</th>
                    <th class="text-uppercase text-muted" style="width: 16%;">Árbitro 2</th>
                    <th style="width: 4%;"></th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="c in canchas" :key="fechaSeleccionada + '-' + c.nombre">

                    <tr class="fila-cancha">
                      <td colspan="7">
                        <div class="d-flex justify-content-between align-items-center gap-2">
                          <div class="d-flex align-items-center gap-2 flex-grow-1">
                            <span class="material-icons fs-5">stadium</span>
                            <input
                              :value="c.nombre"
                              @change="renombrarCancha(c, $event.target.value)"
                              class="input-cancha fw-bold text-uppercase"
                              title="Editar nombre de la cancha"
                            >
                            <span class="badge bg-white text-dark rounded-pill">{{ c.partidos.length }}</span>
                          </div>
                          <button @click="agregarPartido(c.nombre)" class="btn btn-sm btn-outline-light fw-bold py-0 px-2 text-nowrap">
                            <i class="bi bi-plus-lg"></i> Partido
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-for="p in c.partidos" :key="p.id || p._uid" :class="{ 'fila-modificada': p._dirty || !p.id }">
                      <td>
                        <input v-model="p.categoria_division" @input="marcar(p)" class="celda-input" placeholder="Categoría...">
                      </td>
                      <td>
                        <input v-model="p.horario" @input="marcar(p)" type="time" class="celda-input text-center">
                      </td>
                      <td>
                        <input v-model="p.local" @input="marcar(p)" class="celda-input" placeholder="Local...">
                      </td>
                      <td>
                        <input v-model="p.visitante" @input="marcar(p)" class="celda-input" placeholder="Visitante...">
                      </td>
                      <td>
                        <button
                          @click="abrirSelectorArbitro(p, 1)"
                          class="celda-arbitro"
                          :class="{ 'sin-match': esSinMatch(p, 1), 'externo': esExterno(p, 1), 'vacio': !p.arbitro_1 }"
                          :title="tituloCelda(p, 1)"
                        >
                          {{ p.arbitro_1 || '— Asignar —' }}
                        </button>
                      </td>
                      <td>
                        <button
                          @click="abrirSelectorArbitro(p, 2)"
                          class="celda-arbitro"
                          :class="{ 'sin-match': esSinMatch(p, 2), 'externo': esExterno(p, 2), 'vacio': !p.arbitro_2 }"
                          :title="tituloCelda(p, 2)"
                        >
                          {{ p.arbitro_2 || '— Asignar —' }}
                        </button>
                      </td>
                      <td class="text-center">
                        <span
                          v-if="avisosPartido(p) > 0"
                          class="material-icons text-warning alerta-partido"
                          :title="textoAvisosPartido(p)"
                          @click="mostrarAvisosPartido(p)"
                        >warning</span>
                        <button @click="quitarPartido(p)" class="btn btn-borrar" title="Eliminar partido">
                          <span class="material-icons">delete</span>
                        </button>
                      </td>
                    </tr>

                  </template>
                </tbody>
              </table>
            </div>

            <!-- ============ VISTA MÓVIL: CARDS POR CANCHA ============ -->
            <div class="d-md-none">
              <div v-for="c in canchas" :key="'mob-' + fechaSeleccionada + '-' + c.nombre" class="mb-3">

                <!-- Encabezado de cancha (editable) -->
                <div class="cancha-mobile-header d-flex justify-content-between align-items-center gap-2 px-3 py-2 rounded-top-3">
                  <div class="d-flex align-items-center gap-2 flex-grow-1">
                    <span class="material-icons fs-5">stadium</span>
                    <input
                      :value="c.nombre"
                      @change="renombrarCancha(c, $event.target.value)"
                      class="input-cancha fw-bold text-uppercase"
                      title="Editar nombre de la cancha"
                    >
                    <span class="badge bg-white text-dark rounded-pill">{{ c.partidos.length }}</span>
                  </div>
                  <button @click="agregarPartido(c.nombre)" class="btn btn-sm btn-outline-light fw-bold py-0 px-2 text-nowrap">
                    <i class="bi bi-plus-lg"></i>
                  </button>
                </div>

                <!-- Un card por partido -->
                <div
                  v-for="p in c.partidos"
                  :key="'mobp-' + (p.id || p._uid)"
                  class="card shadow-sm border-light-subtle rounded-0 partido-mobile"
                  :class="{ 'partido-modificado': p._dirty || !p.id }"
                >
                  <div class="card-body p-3">

                    <!-- Fila superior: categoría + horario + acciones -->
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <input
                        v-model="p.categoria_division"
                        @input="marcar(p)"
                        class="form-control form-control-sm shadow-none fw-bold border-0 px-0 flex-grow-1"
                        placeholder="Categoría / División..."
                        style="font-size: 0.9rem;"
                      >
                      <div class="d-flex align-items-center gap-1 flex-shrink-0">
                        <span
                          v-if="avisosPartido(p) > 0"
                          class="material-icons text-warning alerta-partido"
                          @click="mostrarAvisosPartido(p)"
                        >warning</span>
                        <button @click="quitarPartido(p)" class="btn btn-borrar" title="Eliminar partido">
                          <span class="material-icons">delete</span>
                        </button>
                      </div>
                    </div>

                    <!-- Horario -->
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <span class="material-icons text-danger" style="font-size: 18px;">schedule</span>
                      <input v-model="p.horario" @input="marcar(p)" type="time" class="form-control form-control-sm shadow-none w-auto">
                    </div>

                    <!-- Equipos -->
                    <div class="bg-light rounded p-2 mb-2">
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="badge bg-secondary" style="font-size: 0.6rem;">LOCAL</span>
                        <input v-model="p.local" @input="marcar(p)" class="form-control form-control-sm shadow-none border-0 bg-transparent px-1 fw-bold" placeholder="Equipo local...">
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-secondary-subtle text-secondary border" style="font-size: 0.6rem;">VISIT</span>
                        <input v-model="p.visitante" @input="marcar(p)" class="form-control form-control-sm shadow-none border-0 bg-transparent px-1 fw-bold" placeholder="Equipo visitante...">
                      </div>
                    </div>

                    <!-- Árbitros -->
                    <div class="row g-2">
                      <div class="col-6">
                        <label class="form-label small fw-bold text-muted mb-1">Árbitro 1</label>
                        <button
                          @click="abrirSelectorArbitro(p, 1)"
                          class="celda-arbitro-mobile w-100 text-start"
                          :class="{ 'sin-match': esSinMatch(p, 1), 'externo': esExterno(p, 1), 'vacio': !p.arbitro_1 }"
                        >
                          {{ p.arbitro_1 || '— Asignar —' }}
                        </button>
                      </div>
                      <div class="col-6">
                        <label class="form-label small fw-bold text-muted mb-1">Árbitro 2</label>
                        <button
                          @click="abrirSelectorArbitro(p, 2)"
                          class="celda-arbitro-mobile w-100 text-start"
                          :class="{ 'sin-match': esSinMatch(p, 2), 'externo': esExterno(p, 2), 'vacio': !p.arbitro_2 }"
                        >
                          {{ p.arbitro_2 || '— Asignar —' }}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

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

    <ModalBase
      :show="mostrarSelectorArbitro"
      :titulo="tituloSelector"
      icono="sports"
      colorIcono="bg-danger text-white"
      maxWidth="500px"
      @close="cerrarSelectorArbitro"
    >
      <input
        v-model="busquedaArbitro"
        type="text"
        class="form-control shadow-none border-secondary-subtle mb-3"
        placeholder="Buscar por apellido o nombre..."
      >

      <div class="lista-arbitros border rounded">
        <button @click="asignarArbitro(null)" class="opcion-arbitro text-danger fw-bold">
          — Sin asignar —
        </button>

        <button
          v-if="busquedaArbitro.trim() && arbitrosFiltrados.length === 0"
          @click="asignarArbitroLibre(busquedaArbitro)"
          class="opcion-arbitro text-primary fw-bold d-flex align-items-center gap-2"
        >
          <span class="material-icons" style="font-size: 16px;">person_add</span>
          Usar "{{ busquedaArbitro.trim().toUpperCase() }}" (árbitro externo)
        </button>

        <button
          v-for="a in arbitrosFiltrados"
          :key="a.id"
          @click="asignarArbitro(a)"
          class="opcion-arbitro"
        >
          {{ a.apellido }}, {{ a.nombre }}
        </button>

        <button
          v-if="busquedaArbitro.trim() && arbitrosFiltrados.length > 0"
          @click="asignarArbitroLibre(busquedaArbitro)"
          class="opcion-arbitro text-primary d-flex align-items-center gap-2 border-top"
        >
          <span class="material-icons" style="font-size: 16px;">person_add</span>
          Usar "{{ busquedaArbitro.trim().toUpperCase() }}" como árbitro externo
        </button>
      </div>

      <p class="text-muted small mt-2 mb-0">
        <i class="bi bi-info-circle me-1"></i>
        Si el árbitro no está en el padrón (ej: viene del interior), escribí su nombre y usá la opción azul. Queda designado pero no le aparece en su panel.
      </p>
    </ModalBase>

    <ModalBase
      :show="mostrarModalCarga"
      titulo="Cargar Designaciones desde Excel"
      icono="upload_file"
      colorIcono="bg-primary text-white"
      maxWidth="600px"
      @close="cerrarModalCarga"
    >
      <div class="alert alert-warning small py-2 px-3 d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>Cargar un nuevo archivo <strong>reemplaza</strong> todas las designaciones actuales.</span>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Archivo Excel</label>
        <input
          @change="manejarArchivoExcel"
          type="file"
          class="form-control shadow-none border-secondary-subtle"
          accept=".xlsx,.xls"
        >
        <div class="form-text small">
          Columnas esperadas: FECHA, CANCHA, CATEGORIA, HORARIO, LOCAL, VISITANTE, ARBITRO 1, ARBITRO 2.
        </div>
      </div>

      <div v-if="partidosImportados.length > 0 && faltanFechas" class="mb-3">
        <label class="form-label small fw-bold">El archivo no trae fechas. Asignales una a todos los partidos:</label>
        <input v-model="fechaManual" type="date" class="form-control shadow-none border-secondary-subtle">
      </div>

      <div v-if="partidosImportados.length > 0" class="alert alert-success small py-2 px-3 mb-0">
        Se leyeron <strong>{{ partidosImportados.length }}</strong> partidos
        ({{ sinMatch }} árbitros sin coincidencia en el padrón).
      </div>

      <template #footer>
        <button
          @click="cerrarModalCarga"
          class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
          :disabled="subiendoExcel"
        >
          Cancelar
        </button>
        <button
          @click="confirmarCargaExcel"
          class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm w-100"
          :disabled="subiendoExcel || partidosImportados.length === 0"
        >
          <span v-if="subiendoExcel" class="spinner-border spinner-border-sm me-2"></span>
          {{ subiendoExcel ? 'Cargando...' : 'Cargar Partidos' }}
        </button>
      </template>
    </ModalBase>

    <ModalBase
      :show="mostrarModalPublicar"
      :titulo="modoPublicacion === 'actualizar' ? 'Actualizar Designaciones' : 'Publicar Designaciones'"
      :icono="modoPublicacion === 'actualizar' ? 'sync' : 'publish'"
      colorIcono="bg-danger text-white"
      maxWidth="600px"
      @close="mostrarModalPublicar = false"
    >
      <div v-if="modoPublicacion === 'actualizar'" class="alert alert-warning small py-2 px-3 d-flex align-items-center gap-2">
        <i class="bi bi-arrow-repeat"></i>
        <span>Se <strong>reemplaza la última publicación</strong> con los {{ designaciones.length }} partidos actuales: mismo lugar en el historial público (sin duplicar) y se actualizan los partidos en el panel de los árbitros.</span>
      </div>

      <div v-else class="alert alert-info small py-2 px-3 d-flex align-items-center gap-2">
        <i class="bi bi-info-circle-fill"></i>
        <span>Se publicarán los <strong>{{ designaciones.length }}</strong> partidos como una <strong>publicación nueva</strong>: se genera el PDF para la web pública y cada árbitro verá sus partidos en su panel.</span>
      </div>

      <div v-if="hayCambios" class="alert alert-primary small py-2 px-3 d-flex align-items-center gap-2">
        <i class="bi bi-pencil-square"></i>
        <span>Hay cambios recientes: se terminan de guardar automáticamente antes de {{ modoPublicacion === 'actualizar' ? 'actualizar' : 'publicar' }}.</span>
      </div>

      <div v-if="totalSinMatch > 0" class="alert alert-warning small py-2 px-3 d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>Hay <strong>{{ totalSinMatch }}</strong> árbitros sin coincidencia en el padrón: esos partidos <strong>no</strong> les van a aparecer en su panel. Están marcados en amarillo en la grilla.</span>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Torneo</label>
        <input
          v-model="formPublicar.torneo"
          type="text"
          class="form-control shadow-none border-secondary-subtle"
          placeholder="Ej: TORNEO APERTURA"
        >
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Fecha</label>
        <input
          v-model="formPublicar.fecha"
          type="text"
          class="form-control shadow-none border-secondary-subtle"
          placeholder="Ej: 18 y 19 de Abril"
        >
      </div>

      <template #footer>
        <button
          @click="mostrarModalPublicar = false"
          class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
          :disabled="publicando"
        >
          Cancelar
        </button>
        <button
          @click="publicarDesignaciones"
          class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100"
          :disabled="publicando"
        >
          <span v-if="publicando" class="spinner-border spinner-border-sm me-2"></span>
          <template v-if="publicando">{{ modoPublicacion === 'actualizar' ? 'Actualizando...' : 'Publicando...' }}</template>
          <template v-else>{{ modoPublicacion === 'actualizar' ? 'Actualizar Ahora' : 'Publicar Ahora' }}</template>
        </button>
      </template>
    </ModalBase>

  </div>
</template>


<script setup>
import { ref, onMounted, computed, reactive, watch, inject } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

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

const notificar = inject('notificar')

const designaciones = ref([])
const arbitros = ref([])
const cargando = ref(false)
const eliminados = ref([])
let contadorUid = 0

/* ====================================================
   AVISOS DE VALIDACIÓN (calculados en el backend)
   El servidor valida todo (inactivo, disponibilidad de día
   y horario, sanción vigente, licencias, doble cancha y
   mismo equipo la fecha anterior) con la acción
   obtenerAvisosDesignaciones. Acá solo se muestran.
   Mapa: { id_partido: [ { nombre, avisos: [...] } ] }
   ==================================================== */
const avisosMap = ref({})

const cargarAvisos = async () => {
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerAvisosDesignaciones'
    })
    if (res.ok && res.payload && res.payload.success) {
      avisosMap.value = res.payload.avisos || {}
    }
  } catch (err) {
    console.error('Error al cargar avisos de validación:', err)
  }
}

// Total de avisos de un partido (para el ícono de alerta)
const avisosPartido = (p) => {
  const grupos = p.id ? avisosMap.value[p.id] : null
  if (!grupos) return 0
  return grupos.reduce((total, g) => total + g.avisos.length, 0)
}

// Texto del modal: por cada árbitro con problemas, su nombre y
// debajo sus avisos con viñeta. Árbitros separados por línea en blanco.
const textoAvisosPartido = (p) => {
  const grupos = (p.id ? avisosMap.value[p.id] : null) || []
  return grupos
    .map(g => `${g.nombre}:\n` + g.avisos.map(a => `• ${a}`).join('\n'))
    .join('\n\n')
}

const totalConflictos = computed(() => {
  return designaciones.value.filter(p => avisosPartido(p) > 0).length
})

const mostrarAvisosPartido = (p) => {
  if (avisosPartido(p) === 0) return
  notificar({
    titulo: '⚠ Avisos de este partido',
    mensaje: textoAvisosPartido(p),
    tipo: 'warning'
  })
}

/* ====================================================
   UTILIDADES DE TEXTO Y FECHAS
   ==================================================== */
const normalizarTexto = (valor) => {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
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
    const res = await api.get({
      entity: 'arbitros',
      action: 'getArbitrosBasico',
      payload: { soloActivos: false }
    })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (err) { console.error(err) }
}

const fechaSeleccionada = ref('')
const filtroBusqueda = ref('')

const mostrarModalCarga = ref(false)
const subiendoExcel = ref(false)
const partidosImportados = ref([])
const sinMatch = ref(0)
const fechaManual = ref('')

const estadoGuardado = ref('') // '' | 'pendiente' | 'guardando' | 'guardado' | 'error'
let timerAutoguardado = null
let timerOcultar = null

const mostrarSelectorArbitro = ref(false)
const seleccionArbitro = ref(null)
const busquedaArbitro = ref('')

const mostrarModalPublicar = ref(false)
const publicando = ref(false)
const modoPublicacion = ref('publicar')
const formPublicar = reactive({
  torneo: '',
  fecha: ''
})

/* ====================================================
   CARGA INICIAL
   ==================================================== */
const normalizarPartido = (p) => ({
  ...p,
  fecha: (p.fecha && !String(p.fecha).startsWith('0000')) ? String(p.fecha).slice(0, 10) : '',
  horario: p.horario ? String(p.horario).slice(0, 5) : '',
  _dirty: false,
  _uid: 'u' + (++contadorUid)
})

const cargarDesignaciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerDesignaciones'
    })
    if ((res.ok || res.success) && res.payload) {
      designaciones.value = res.payload.map(normalizarPartido)
      eliminados.value = []
    }
  } catch (err) {
    console.error('Error al cargar designaciones:', err)
    notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar las designaciones.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

/* ====================================================
   FECHAS (PESTAÑAS POR DIA)
   ==================================================== */
const fechas = computed(() => {
  const mapa = {}
  designaciones.value.forEach(p => {
    const f = String(p.fecha || '').trim() || 'Sin fecha'
    mapa[f] = (mapa[f] || 0) + 1
  })

  return Object.keys(mapa)
    .sort((a, b) => parsearFecha(a) - parsearFecha(b))
    .map(f => ({ fecha: f, cantidad: mapa[f] }))
})

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

    if (!busqueda) return true
    const textoPartido = normalizarTexto(
      `${p.cancha} ${p.local} ${p.visitante} ${p.arbitro_1} ${p.arbitro_2} ${p.categoria_division}`
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
    .map(nombre => ({
      nombre,
      partidos: mapa[nombre].sort((a, b) => String(a.horario || '').localeCompare(String(b.horario || '')))
    }))
})

const totalSinMatch = computed(() => {
  let contador = 0
  designaciones.value.forEach(p => {
    if (p.arbitro_1 && !p.id_arb1) contador++
    if (p.arbitro_2 && !p.id_arb2) contador++
  })
  return contador
})

/* ====================================================
   EDICION INLINE
   ==================================================== */
const marcar = (p) => {
  p._dirty = true
  programarAutoguardado()
}

const hayCambios = computed(() => {
  return eliminados.value.length > 0 || designaciones.value.some(p => p._dirty || !p.id)
})

const renombrarCancha = (grupo, nuevoNombre) => {
  const nombre = String(nuevoNombre || '').trim().toUpperCase()
  if (!nombre) return
  grupo.partidos.forEach(p => {
    p.cancha = nombre
    marcar(p)
  })
}

const fechaDelDia = () => {
  return (fechaSeleccionada.value && fechaSeleccionada.value !== 'Sin fecha') ? fechaSeleccionada.value : ''
}

const agregarPartido = (cancha) => {
  designaciones.value.push({
    id: null,
    fecha: fechaDelDia(),
    cancha,
    categoria_division: '',
    horario: '',
    local: '',
    visitante: '',
    arbitro_1: '',
    arbitro_2: '',
    id_arb1: null,
    id_arb2: null,
    _dirty: true,
    _uid: 'u' + (++contadorUid)
  })
}

const agregarCancha = () => {
  agregarPartido('NUEVA CANCHA')
}

const quitarPartido = (p) => {
  if (p.id) eliminados.value.push(p.id)
  const idx = designaciones.value.indexOf(p)
  if (idx !== -1) designaciones.value.splice(idx, 1)
  programarAutoguardado()
}

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
  return `Árbitro ${seleccionArbitro.value.numero} — ${p.local || '?'} vs ${p.visitante || '?'}`
})

const arbitrosFiltrados = computed(() => {
  const busqueda = normalizarTexto(busquedaArbitro.value)
  if (!busqueda) return arbitros.value
  return arbitros.value.filter(a => normalizarTexto(`${a.apellido} ${a.nombre}`).includes(busqueda))
})

const asignarArbitro = async (arbitro) => {
  const sel = seleccionArbitro.value
  if (!sel) return
  const p = sel.partido

  if (!arbitro) {
    if (sel.numero === 1) { p.arbitro_1 = ''; p.id_arb1 = null; p._ext1 = false }
    else { p.arbitro_2 = ''; p.id_arb2 = null; p._ext2 = false }
  } else {
    const nombreCompleto = `${arbitro.apellido} ${arbitro.nombre}`.toUpperCase()
    if (sel.numero === 1) { p.arbitro_1 = nombreCompleto; p.id_arb1 = arbitro.id; p._ext1 = false }
    else { p.arbitro_2 = nombreCompleto; p.id_arb2 = arbitro.id; p._ext2 = false }
  }

  marcar(p)
  cerrarSelectorArbitro()

  // Guardado inmediato (sin esperar el debounce) para que el backend
  // valide la designación y avise si hay algún conflicto.
  if (arbitro) {
    const ok = await ejecutarGuardado()
    if (ok) {
      await cargarAvisos()
      if (avisosPartido(p) > 0) {
        notificar({
          titulo: '⚠ Atención con esta designación',
          mensaje: textoAvisosPartido(p),
          tipo: 'warning'
        })
      }
    }
  }
}

// Asigna un árbitro que no está en el padrón (ej: viene del interior).
// Queda como texto libre, sin id_arb, y por eso no le aparece en su panel.
const asignarArbitroLibre = async (texto) => {
  const sel = seleccionArbitro.value
  if (!sel) return
  const nombre = String(texto || '').trim().toUpperCase()
  if (!nombre) return
  const p = sel.partido

  if (sel.numero === 1) { p.arbitro_1 = nombre; p.id_arb1 = null; p._ext1 = true }
  else { p.arbitro_2 = nombre; p.id_arb2 = null; p._ext2 = true }

  marcar(p)
  cerrarSelectorArbitro()

  // También validamos externos: doble cancha y mismo equipo aplican igual
  const ok = await ejecutarGuardado()
  if (ok) {
    await cargarAvisos()
    if (avisosPartido(p) > 0) {
      notificar({
        titulo: '⚠ Atención con esta designación',
        mensaje: textoAvisosPartido(p),
        tipo: 'warning'
      })
    }
  }
}

// Helpers de estado de la celda de árbitro
const esExterno = (p, numero) => {
  const nombre = numero === 1 ? p.arbitro_1 : p.arbitro_2
  const id = numero === 1 ? p.id_arb1 : p.id_arb2
  const ext = numero === 1 ? p._ext1 : p._ext2
  return !!nombre && !id && !!ext
}

const esSinMatch = (p, numero) => {
  const nombre = numero === 1 ? p.arbitro_1 : p.arbitro_2
  const id = numero === 1 ? p.id_arb1 : p.id_arb2
  const ext = numero === 1 ? p._ext1 : p._ext2
  return !!nombre && !id && !ext
}

const tituloCelda = (p, numero) => {
  const nombre = numero === 1 ? p.arbitro_1 : p.arbitro_2
  if (!nombre) return 'Asignar árbitro'
  if (esExterno(p, numero)) return 'Árbitro externo (fuera del padrón): ' + nombre
  if (esSinMatch(p, numero)) return 'Sin match en el padrón: ' + nombre
  return nombre
}

/* ====================================================
   AUTOGUARDADO (con debounce, sin botón manual)
   Cada edición marca el partido y programa un guardado
   a los 1,5s. Guarda en segundo plano y actualiza los
   ids de los partidos nuevos sin recargar toda la grilla.
   ==================================================== */
const limpiarPartidoParaEnviar = (p) => ({
  id: p.id,
  _uid: p._uid,
  fecha: p.fecha,
  cancha: p.cancha,
  categoria_division: p.categoria_division,
  horario: p.horario,
  local: p.local,
  visitante: p.visitante,
  arbitro_1: p.arbitro_1,
  arbitro_2: p.arbitro_2,
  id_arb1: p.id_arb1,
  id_arb2: p.id_arb2
})

const programarAutoguardado = () => {
  estadoGuardado.value = 'pendiente'
  if (timerAutoguardado) clearTimeout(timerAutoguardado)
  timerAutoguardado = setTimeout(() => { ejecutarGuardado() }, 1500)
}

// Guarda los cambios pendientes. Devuelve true/false.
// No recarga toda la grilla: solo asigna los ids nuevos que devuelve
// el backend y limpia las marcas de "modificado", para no interrumpir
// la edición ni reordenar las filas mientras la persona trabaja.
const ejecutarGuardado = async () => {
  if (timerAutoguardado) { clearTimeout(timerAutoguardado); timerAutoguardado = null }

  const modificados = designaciones.value.filter(p => p._dirty || !p.id)
  const eliminadosEnviar = [...eliminados.value]

  if (modificados.length === 0 && eliminadosEnviar.length === 0) {
    estadoGuardado.value = ''
    return true
  }

  estadoGuardado.value = 'guardando'

  try {
    const res = await api.post({
      entity: 'designaciones',
      action: 'guardarPartidos',
      payload: {
        partidos: modificados.map(limpiarPartidoParaEnviar),
        eliminados: eliminadosEnviar
      }
    })

    if (res.ok && res.payload && res.payload.success) {
      // Asignar ids nuevos que devuelve el backend (map _uid -> id)
      const nuevosIds = res.payload.ids || {}
      modificados.forEach(p => {
        if (!p.id && p._uid && nuevosIds[p._uid]) p.id = nuevosIds[p._uid]
        p._dirty = false
      })
      eliminados.value = eliminados.value.filter(id => !eliminadosEnviar.includes(id))

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

/* ====================================================
   IMPORTACION DE EXCEL
   ==================================================== */
const mapearCabecera = (texto) => {
  const t = normalizarTexto(texto).replace(/[^a-z0-9]/g, '')
  if (t.includes('fecha')) return 'fecha'
  if (t.includes('cancha')) return 'cancha'
  if (t.includes('categoria') || t.includes('division')) return 'categoria_division'
  if (t.includes('horario') || t === 'hora') return 'horario'
  if (t.includes('local')) return 'local'
  if (t.includes('visitante')) return 'visitante'
  if (t.includes('arbitro1') || t === 'arbitroa' || t.includes('arbitrouno')) return 'arbitro_1'
  if (t.includes('arbitro2') || t === 'arbitrob' || t.includes('arbitrodos')) return 'arbitro_2'
  return null
}

// Convierte cualquier formato de fecha (serial de Excel, dd/mm/yyyy, yyyy-mm-dd)
// a yyyy-mm-dd, que es lo que espera la columna DATE de MySQL
const aFechaISO = (valor) => {
  if (typeof valor === 'number') return XLSX.SSF.format('yyyy-mm-dd', valor)

  const texto = String(valor || '').trim()

  let m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`

  m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    const anio = m[3].length === 2 ? '20' + m[3] : m[3]
    return `${anio}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`
  }

  return ''
}

// Convierte horarios (serial de Excel o texto) a HH:MM,
// compatible con la columna TIME de MySQL
const aHorario = (valor) => {
  if (typeof valor === 'number') return XLSX.SSF.format('hh:mm', valor)

  const m = String(valor || '').trim().match(/^(\d{1,2}):(\d{2})/)
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}`

  return ''
}

const buscarIdArbitro = (nombreCelda) => {
  const buscado = normalizarTexto(nombreCelda).replace(/,/g, '')
  if (!buscado) return null

  const encontrado = arbitros.value.find(a => {
    const apellido = normalizarTexto(a.apellido)
    const nombreCompleto = normalizarTexto(a.nombre)
    const primerNombre = nombreCompleto.split(' ')[0]

    const variantes = [
      `${apellido} ${nombreCompleto}`,
      `${nombreCompleto} ${apellido}`,
      `${apellido} ${primerNombre}`,
      `${primerNombre} ${apellido}`
    ]

    return variantes.includes(buscado)
  })

  return encontrado ? encontrado.id : null
}

const faltanFechas = computed(() => {
  return partidosImportados.value.length > 0 && partidosImportados.value.every(p => !p.fecha)
})

const abrirModalCarga = () => {
  partidosImportados.value = []
  sinMatch.value = 0
  fechaManual.value = ''
  mostrarModalCarga.value = true
}

const cerrarModalCarga = () => {
  mostrarModalCarga.value = false
  partidosImportados.value = []
  sinMatch.value = 0
  fechaManual.value = ''
}

const manejarArchivoExcel = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.readAsArrayBuffer(file)
  reader.onload = (e) => {
    try {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
      const hoja = workbook.Sheets[workbook.SheetNames[0]]
      const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: '' })

      if (filas.length < 2) {
        notificar({ titulo: 'Atención', mensaje: 'El archivo no tiene datos.', tipo: 'warning' })
        return
      }

      // Buscar la fila de cabecera (la primera que tenga CANCHA y LOCAL)
      let indiceCabecera = -1
      let mapaColumnas = {}

      for (let i = 0; i < Math.min(filas.length, 10); i++) {
        const mapa = {}
        filas[i].forEach((celda, col) => {
          const campo = mapearCabecera(celda)
          if (campo && mapa[campo] === undefined) mapa[campo] = col
        })
        if (mapa.cancha !== undefined && mapa.local !== undefined) {
          indiceCabecera = i
          mapaColumnas = mapa
          break
        }
      }

      if (indiceCabecera === -1) {
        notificar({ titulo: 'Atención', mensaje: 'No se encontraron las columnas esperadas (CANCHA, LOCAL, etc.) en el archivo.', tipo: 'warning' })
        return
      }

      const partidos = []
      let contadorSinMatch = 0
      let ultimaCancha = ''
      let ultimaFecha = ''

      for (let i = indiceCabecera + 1; i < filas.length; i++) {
        const fila = filas[i]
        const leer = (campo) => mapaColumnas[campo] !== undefined ? fila[mapaColumnas[campo]] : ''

        const local = String(leer('local') || '').trim()
        const visitante = String(leer('visitante') || '').trim()
        const categoria = String(leer('categoria_division') || '').trim()

        // Fila vacía de datos: la salteamos
        if (!local && !visitante && !categoria) continue

        // CANCHA: si viene vacía (celdas combinadas), arrastramos la anterior
        let cancha = String(leer('cancha') || '').trim()
        if (cancha) ultimaCancha = cancha
        else cancha = ultimaCancha

        // FECHA: mismo criterio de arrastre por si también viene combinada
        let fecha = aFechaISO(leer('fecha'))
        if (fecha) ultimaFecha = fecha
        else fecha = ultimaFecha

        const arbitro1 = String(leer('arbitro_1') || '').trim()
        const arbitro2 = String(leer('arbitro_2') || '').trim()
        const idArb1 = buscarIdArbitro(arbitro1)
        const idArb2 = buscarIdArbitro(arbitro2)

        if (arbitro1 && !idArb1) contadorSinMatch++
        if (arbitro2 && !idArb2) contadorSinMatch++

        partidos.push({
          fecha,
          cancha: cancha.toUpperCase(),
          categoria_division: categoria,
          horario: aHorario(leer('horario')),
          local,
          visitante,
          arbitro_1: arbitro1,
          arbitro_2: arbitro2,
          id_arb1: idArb1,
          id_arb2: idArb2
        })
      }

      if (partidos.length === 0) {
        notificar({ titulo: 'Atención', mensaje: 'No se leyeron partidos válidos del archivo.', tipo: 'warning' })
        return
      }

      partidosImportados.value = partidos
      sinMatch.value = contadorSinMatch
    } catch (err) {
      console.error('Error al leer Excel:', err)
      notificar({ titulo: 'Error', mensaje: 'No se pudo leer el archivo Excel.', tipo: 'danger' })
    }
  }
}

const confirmarCargaExcel = async () => {
  if (partidosImportados.value.length === 0) return

  const partidos = partidosImportados.value.map(p => ({
    ...p,
    fecha: p.fecha || fechaManual.value || ''
  }))

  subiendoExcel.value = true
  try {
    const res = await api.post({
      entity: 'designaciones',
      action: 'cargarDesignaciones',
      payload: { partidos }
    })

    if (res.ok && res.payload && res.payload.success) {
      notificar({ titulo: 'Éxito', mensaje: res.payload.mensaje || `Se cargaron ${partidos.length} partidos.`, tipo: 'success' })
      cerrarModalCarga()
      await cargarDesignaciones()
      cargarAvisos()
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al cargar designaciones:', err)
    notificar({ titulo: 'Error', mensaje: err.message || 'Hubo un problema al guardar los partidos.', tipo: 'danger' })
  } finally {
    subiendoExcel.value = false
  }
}

/* ====================================================
   ELIMINAR TODO
   ==================================================== */
const solicitarEliminarTodo = () => {
  notificar({
    titulo: 'Eliminar Designaciones',
    mensaje: '¿Estás segura que deseas eliminar todos los partidos cargados? Esta acción no se puede deshacer.',
    tipo: 'warning',
    alConfirmar: () => eliminarTodo()
  })
}

const eliminarTodo = async () => {
  try {
    const res = await api.post({
      entity: 'designaciones',
      action: 'eliminarDesignaciones',
      payload: {}
    })

    if (res.ok || res.success) {
      designaciones.value = []
      eliminados.value = []
      avisosMap.value = {}
      notificar({ titulo: 'Éxito', mensaje: 'Se eliminaron todas las designaciones.', tipo: 'success' })
    } else {
      throw new Error('Error del servidor')
    }
  } catch (err) {
    console.error('Error al eliminar designaciones:', err)
    notificar({ titulo: 'Error', mensaje: 'Hubo un problema al eliminar las designaciones.', tipo: 'danger' })
  }
}

/* ====================================================
   TESORERIA (placeholder: la lógica se implementa a futuro)
   ==================================================== */
const enviarATesoreria = () => {
  notificar({
    titulo: 'Próximamente',
    mensaje: 'El envío de designaciones a tesorería para los balances va a estar disponible próximamente.',
    tipo: 'warning'
  })
}

/* ====================================================
   PUBLICAR (PDF PARA LA WEB + PANEL DE ARBITROS)
   Si hay cambios sin guardar, se guardan automáticamente
   antes de publicar. El PDF se genera en el servidor.
   ==================================================== */
const abrirModalPublicar = async (modo) => {
  modoPublicacion.value = modo

  // Al actualizar, precargamos torneo y fecha de la última publicación
  if (modo === 'actualizar') {
    try {
      const res = await api.get({
        entity: 'designaciones',
        action: 'obtenerHistorialDesignaciones'
      })
      const ultima = res.payload && res.payload[0]
      if (ultima && ultima.torneo && ultima.torneo !== 'Información no disponible') {
        formPublicar.torneo = ultima.torneo
        formPublicar.fecha = ultima.fecha
      }
    } catch (err) {
      console.error('No se pudo precargar la última publicación:', err)
    }
  }

  mostrarModalPublicar.value = true
}

const publicarDesignaciones = async () => {
  if (!formPublicar.torneo || !formPublicar.fecha) {
    notificar({ titulo: 'Atención', mensaje: 'Completá el torneo y la fecha.', tipo: 'warning' })
    return
  }

  publicando.value = true
  try {
    if (hayCambios.value) {
      const guardado = await ejecutarGuardado()
      if (!guardado) return
    }

    const res = await api.post({
      entity: 'designaciones',
      action: 'publicarDesignaciones',
      payload: {
        torneo: formPublicar.torneo,
        fecha: formPublicar.fecha,
        modo: modoPublicacion.value
      }
    })

    if (res.ok && res.payload && res.payload.success) {
      notificar({ titulo: 'Éxito', mensaje: res.payload.mensaje || 'Las designaciones se publicaron en la web y en el panel de los árbitros.', tipo: 'success' })
      mostrarModalPublicar.value = false
      formPublicar.torneo = ''
      formPublicar.fecha = ''
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor al publicar designaciones.')
    }
  } catch (err) {
    console.error('Error al publicar:', err)
    notificar({ titulo: 'Error', mensaje: err.message || 'Hubo un problema al publicar las designaciones.', tipo: 'danger' })
  } finally {
    publicando.value = false
  }
}

onMounted(async () => {
  await cargarArbitros()
  await cargarDesignaciones()
  cargarAvisos()
})
</script>


<style scoped>
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  margin-left: 50%;
  transform: translateX(-50%);
  padding-bottom: 120px;
}

.admin-panel {
  width: 100%;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

.animate__animated {
  animation-duration: 0.5s;
}

/* ====================================================
   GRILLA TIPO EXCEL (un solo scroll: el de la página)
   ==================================================== */
.grilla-container {
  overflow: visible;
}

/* En pantallas chicas la tabla necesita scroll horizontal propio */
@media (max-width: 991px) {
  .grilla-container {
    overflow-x: auto;
  }
}

.grilla-designaciones {
  font-size: 0.78rem;
  border-collapse: separate;
  border-spacing: 0;
}

.grilla-designaciones thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  padding: 10px 8px;
  font-size: 0.68rem;
  letter-spacing: 0.5px;
}

.grilla-designaciones td {
  padding: 2px 4px;
  border-bottom: 1px solid #f1f3f5;
}

/* Fila separadora de cancha (como la celda combinada del Excel) */
.fila-cancha td {
  background-color: #1f2937;
  color: #fff;
  padding: 6px 10px;
  position: sticky;
  top: 37px;
  z-index: 4;
}

.input-cancha {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #fff;
  font-size: 0.8rem;
  padding: 2px 6px;
  min-width: 100px;
  width: 60%;
}

.input-cancha:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.input-cancha:focus {
  outline: none;
  background: #fff;
  color: #000;
  border-color: #fff;
}

/* Celdas editables: se ven como texto plano hasta que las tocás */
.celda-input {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  padding: 5px 6px;
  font-size: 0.78rem;
  color: #212529;
}

.celda-input:hover {
  border-color: #ced4da;
  background: #fff;
}

.celda-input:focus {
  outline: none;
  border-color: #dc3545;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.15);
}

/* Celda de árbitro: botón liviano que abre el selector compartido */
.celda-arbitro {
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  padding: 5px 6px;
  font-size: 0.78rem;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.celda-arbitro:hover {
  border-color: #ced4da;
  background: #fff;
}

.celda-arbitro.vacio {
  color: #adb5bd;
}

/* Árbitro que no matcheó con el padrón (hay que corregirlo) */
.celda-arbitro.sin-match {
  background-color: #fef08a;
  border-color: #eab308;
  font-weight: 700;
}

/* Árbitro externo puesto a mano (intencional, fuera del padrón) */
.celda-arbitro.externo {
  background-color: #dbeafe;
  border-color: #60a5fa;
  font-weight: 600;
}

/* Fila con cambios sin guardar o nueva */
.fila-modificada td {
  background-color: #eff6ff;
}

.btn-borrar {
  border: none;
  background: transparent;
  color: #adb5bd;
  padding: 2px;
  line-height: 1;
}

.btn-borrar:hover {
  color: #dc3545;
}

.btn-borrar .material-icons {
  font-size: 17px;
}

/* Ícono de alerta cuando el partido tiene un conflicto de designación */
.alerta-partido {
  font-size: 18px;
  cursor: pointer;
  vertical-align: middle;
  margin-right: 2px;
}

/* ====================================================
   SELECTOR DE ARBITRO
   ==================================================== */
.lista-arbitros {
  max-height: 50vh;
  overflow-y: auto;
}

.opcion-arbitro {
  display: block;
  width: 100%;
  text-align: left;
  background: #fff;
  border: none;
  border-bottom: 1px solid #f1f3f5;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #212529;
  cursor: pointer;
}

.opcion-arbitro:hover {
  background: #fef2f2;
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
  border-radius: 50px;
  padding: 10px 24px;
  z-index: 1050;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* ====================================================
   VISTA MÓVIL: CARDS POR CANCHA
   ==================================================== */
.cancha-mobile-header {
  background-color: #1f2937;
  color: #fff;
}

/* El input de cancha ya tiene color blanco (definido arriba),
   funciona igual en el header móvil */
.cancha-mobile-header .input-cancha {
  width: 100%;
}

.partido-mobile {
  border-left: 3px solid #dc3545;
}

.partido-mobile:last-child {
  border-bottom-left-radius: 12px !important;
  border-bottom-right-radius: 12px !important;
  overflow: hidden;
}

/* Card de partido con cambios sin guardar o nuevo */
.partido-mobile.partido-modificado {
  background-color: #eff6ff;
}

/* Botón de árbitro en móvil: como un select tocable */
.celda-arbitro-mobile {
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: #fff;
  padding: 8px 10px;
  font-size: 0.8rem;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.celda-arbitro-mobile:active {
  background: #f8f9fa;
}

.celda-arbitro-mobile.vacio {
  color: #adb5bd;
}

/* Árbitro que no matcheó con el padrón (hay que corregirlo) */
.celda-arbitro-mobile.sin-match {
  background-color: #fef08a;
  border-color: #eab308;
  font-weight: 700;
}

/* Árbitro externo puesto a mano (intencional) */
.celda-arbitro-mobile.externo {
  background-color: #dbeafe;
  border-color: #60a5fa;
  font-weight: 600;
}
</style>
