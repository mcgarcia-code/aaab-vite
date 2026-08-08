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

            <div class="dropdown">
              <button
                class="btn btn-dark shadow-sm py-2 d-flex align-items-center gap-2 text-white dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                :disabled="designaciones.length === 0 || descargandoArchivo"
                title="Descargar las designaciones"
              >
                <span v-if="descargandoArchivo" class="spinner-border spinner-border-sm"></span>
                <span v-else class="material-icons fs-6">download</span>
                <span class="fw-bold d-none d-md-inline small">Descargar</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <button class="dropdown-item d-flex align-items-center gap-2" @click="descargarDesignaciones('pdf')">
                    <span class="material-icons fs-6 text-danger">picture_as_pdf</span>
                    <span class="small fw-bold">PDF</span>
                  </button>
                </li>
                <li>
                  <button class="dropdown-item d-flex align-items-center gap-2" @click="descargarDesignaciones('excel')">
                    <span class="material-icons fs-6 text-success">table_view</span>
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
              :disabled="cargando || semanaAtras === 0"
            >
              <span class="fw-bold small">Semana siguiente</span>
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>

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

              <div class="d-flex gap-2 align-items-center flex-grow-1 justify-content-md-end">
                <div class="input-group input-group-sm shadow-sm flex-grow-1 flex-md-grow-0 buscador-grupo" style="min-width: 300px; max-width: 450px;">
                  <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input
                    v-model="filtroBusqueda"
                    type="text"
                    class="form-control border-start-0 shadow-none"
                    :class="{ 'border-end-0': filtroBusqueda.length > 0 }"
                    placeholder="Buscar cancha, equipo o árbitro..."
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
                  <th class="text-uppercase text-muted" style="width: 15%;">Categoría / División</th>
                  <th class="text-uppercase text-muted text-center" style="width: 6%;">Horario</th>
                  <th class="text-uppercase text-muted" style="width: 14%;">Local</th>
                  <th class="text-uppercase text-muted" style="width: 14%;">Visitante</th>
                  <th class="text-uppercase text-muted text-center" style="width: 5%;">Susp.</th>
                  <th class="text-uppercase text-muted" style="width: 10%;">Árbitro 1</th>
                  <th class="text-uppercase text-muted" style="width: 10%;">Árbitro 2</th>
                  <th class="text-uppercase text-muted" style="width: 10%;">Observador</th>
                  <th class="text-uppercase text-muted" style="width: 10%;">Del. Técnico</th>
                  <th class="text-uppercase text-muted text-center" style="width: 4%;">Mesa</th>
                  <th style="width: 2%;"></th>
                </tr>
              </thead>
                <tbody>
                  <template v-for="c in canchas" :key="fechaSeleccionada + '-' + c.nombre">

                    <tr class="fila-cancha">
                      <td colspan="11">
                        <div class="d-flex align-items-center gap-2">
                          <span class="material-icons fs-5">stadium</span>
                          <span class="nombre-cancha fw-bold text-uppercase">{{ c.nombre }}</span>
                          <a
                            v-if="c.linkMapa"
                            :href="c.linkMapa"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="link-mapa"
                            title="Ver ubicación en Google Maps"
                          >Mapa</a>
                          <span class="badge bg-white text-dark rounded-pill">{{ c.partidos.length }} PARTIDOS </span>
                        </div>
                      </td>
                    </tr>

                    <tr v-for="p in c.partidos" :key="p.id || p._uid" :class="{ 'fila-suspendida': p.suspendido }">
                      <td><span class="celda-texto">{{ p.categoria_division || '—' }}</span></td>
                      <td class="text-center"><span class="celda-texto">{{ p.horario || '—' }}</span></td>
                      <td><span class="celda-texto">{{ p.local || '—' }}</span></td>
                      <td><span class="celda-texto">{{ p.visitante || '—' }}</span></td>
                      <td class="text-center">
                        <input
                          type="checkbox"
                          class="form-check-input susp-check"
                          :checked="p.suspendido"
                          @change="toggleSuspendido(p, $event)"
                          title="Partido suspendido antes del inicio"
                        >
                      </td>
                      <td>
                        <div class="celda-arb-wrap">
                          <button
                            @click="abrirSelectorArbitro(p, 1)"
                            class="celda-arbitro"
                            :class="[colorClase(p, 1), { 'sin-match': esSinMatch(p, 1), 'externo': esExterno(p, 1), 'vacio': !p.arbitro_1 }]"
                            :title="tituloCelda(p, 1)"
                          >
                            {{ p.arbitro_1 || '— Asignar —' }}
                          </button>
                          <button
                            v-if="p.arbitro_1"
                            @click="abrirSelectorColor(p, 1)"
                            class="btn-color-tag"
                            :class="colorClase(p, 1)"
                            title="Marcar estado del árbitro"
                          >
                            <span class="material-icons" style="font-size: 14px;">label</span>
                          </button>
                        </div>
                      </td>
                      <td>
                        <div class="celda-arb-wrap">
                          <button
                            @click="abrirSelectorArbitro(p, 2)"
                            class="celda-arbitro"
                            :class="[colorClase(p, 2), { 'sin-match': esSinMatch(p, 2), 'externo': esExterno(p, 2), 'vacio': !p.arbitro_2 }]"
                            :title="tituloCelda(p, 2)"
                          >
                            {{ p.arbitro_2 || '— Asignar —' }}
                          </button>
                          <button
                            v-if="p.arbitro_2"
                            @click="abrirSelectorColor(p, 2)"
                            class="btn-color-tag"
                            :class="colorClase(p, 2)"
                            title="Marcar estado del árbitro"
                          >
                            <span class="material-icons" style="font-size: 14px;">label</span>
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          @click="abrirSelectorArbitro(p, 'observador')"
                          class="celda-arbitro"
                          :class="{ 'externo': esExternoRol(p, 'observador'), 'vacio': !p.observador }"
                          :title="tituloCeldaRol(p, 'observador')"
                        >
                          {{ p.observador || '— Asignar —' }}
                        </button>
                      </td>
                      <td>
                        <button
                          @click="abrirSelectorArbitro(p, 'delegado')"
                          class="celda-arbitro"
                          :class="{ 'externo': esExternoRol(p, 'delegado'), 'vacio': !p.delegado }"
                          :title="tituloCeldaRol(p, 'delegado')"
                        >
                          {{ p.delegado || '— Asignar —' }}
                        </button>
                      </td>
                      <td class="text-center">
                      <button
                        @click="abrirModalMesa(p)"
                        class="btn-mesa"
                        :class="{ 'con-mesa': tieneMesa(p) }"
                        :title="tituloMesa(p)"
                      >
                        <span class="material-icons" style="font-size: 18px;">table_restaurant</span>
                      </button>
                    </td>
                      <td class="text-center">
                        <span
                          v-if="avisosPartido(p) > 0"
                          class="material-icons text-warning alerta-partido"
                          :title="textoAvisosPartido(p)"
                          @click="mostrarAvisosPartido(p)"
                        >warning</span>
                      </td>
                    </tr>

                  </template>
                </tbody>
              </table>
            </div>

            <!-- ============ VISTA MÓVIL: CARDS POR CANCHA ============ -->
            <div class="d-md-none">
              <div v-for="c in canchas" :key="'mob-' + fechaSeleccionada + '-' + c.nombre" class="mb-3">

                <!-- Encabezado de cancha (solo lectura) -->
                <div class="cancha-mobile-header d-flex align-items-center gap-2 px-3 py-2 rounded-top-3">
                  <span class="material-icons fs-5">stadium</span>
                  <span class="nombre-cancha fw-bold text-uppercase flex-grow-1">{{ c.nombre }}</span>
                  <a
                    v-if="c.linkMapa"
                    :href="c.linkMapa"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link-mapa"
                    title="Ver ubicación en Google Maps"
                  >Mapa</a>
                  <span class="badge bg-white text-dark rounded-pill">{{ c.partidos.length }}</span>
                </div>

                <!-- Un card por partido -->
                <div
                  v-for="p in c.partidos"
                  :key="'mobp-' + (p.id || p._uid)"
                  class="card shadow-sm border-light-subtle rounded-0 partido-mobile"
                >
                  <div class="card-body p-3">

                    <!-- Fila superior: categoría + alerta -->
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <span class="fw-bold flex-grow-1" style="font-size: 0.9rem;">{{ p.categoria_division || '—' }}</span>
                      <span
                        v-if="avisosPartido(p) > 0"
                        class="material-icons text-warning alerta-partido flex-shrink-0"
                        @click="mostrarAvisosPartido(p)"
                      >warning</span>
                    </div>

                    <!-- Horario -->
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <span class="material-icons text-danger" style="font-size: 18px;">schedule</span>
                      <span class="fw-bold">{{ p.horario || '—' }}</span>
                    </div>

                    <!-- Equipos -->
                    <div class="bg-light rounded p-2 mb-2">
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="badge bg-secondary" style="font-size: 0.6rem;">LOCAL</span>
                        <span class="fw-bold">{{ p.local || '—' }}</span>
                      </div>
                      <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="badge bg-secondary-subtle text-secondary border" style="font-size: 0.6rem;">VISIT</span>
                        <span class="fw-bold">{{ p.visitante || '—' }}</span>
                      </div>
                      <div class="form-check mb-0">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          :id="'susp-' + (p.id || p._uid)"
                          :checked="p.suspendido"
                          @change="toggleSuspendido(p, $event)"
                        >
                        <label class="form-check-label small fw-bold text-danger" :for="'susp-' + (p.id || p._uid)">
                          Partido suspendido antes del inicio
                        </label>
                      </div>
                    </div>

                    <!-- Árbitros (único editable) -->
                    <div class="row g-2 mt-1">
                      <div class="col-6">
                        <label class="form-label small fw-bold text-muted mb-1">Observador</label>
                        <button
                          @click="abrirSelectorArbitro(p, 'observador')"
                          class="celda-arbitro-mobile w-100 text-start"
                          :class="{ 'externo': esExternoRol(p, 'observador'), 'vacio': !p.observador }"
                        >
                          {{ p.observador || '— Asignar —' }}
                        </button>
                      </div>
                      <div class="col-6">
                        <label class="form-label small fw-bold text-muted mb-1">Del. Técnico</label>
                        <button
                          @click="abrirSelectorArbitro(p, 'delegado')"
                          class="celda-arbitro-mobile w-100 text-start"
                          :class="{ 'externo': esExternoRol(p, 'delegado'), 'vacio': !p.delegado }"
                        >
                          {{ p.delegado || '— Asignar —' }}
                        </button>
                      </div>
                    </div>

                    <button
                      @click="abrirModalMesa(p)"
                      class="btn btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
                      :class="tieneMesa(p) ? 'btn-danger' : 'btn-outline-secondary'"
                    >
                      <span class="material-icons" style="font-size: 16px;">table_restaurant</span>
                      <span class="small fw-bold">{{ tieneMesa(p) ? 'Mesa de control asignada' : 'Planillero / Cronometrista' }}</span>
                    </button>
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
  :show="mostrarSelectorColor"
  titulo="Estado del árbitro"
  icono="label"
  colorIcono="bg-danger text-white"
  maxWidth="420px"
  @close="cerrarSelectorColor"
>
  <div class="lista-colores">
    <button @click="asignarColor('')" class="opcion-color">
      <span class="muestra-color muestra-none"></span>
      Sin marca
    </button>
    <button
      v-for="op in opcionesColor"
      :key="op.valor"
      @click="asignarColor(op.valor)"
      class="opcion-color"
    >
      <span class="muestra-color" :class="'estado-' + op.valor"></span>
      {{ op.etiqueta }}
    </button>
  </div>
</ModalBase>

<ModalBase
  :show="mostrarSelectorArbitro"
  :titulo="tituloSelector"
  icono="sports"
  colorIcono="bg-danger text-white"
  maxWidth="500px"
  :zIndex="zIndexSelector"
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
      <div class="alert alert-info small py-2 px-3 d-flex align-items-center gap-2">
        <i class="bi bi-info-circle-fill"></i>
        <span>El archivo se procesa en el servidor y sus partidos se agregan a la tabla de designaciones.</span>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Archivo Excel</label>
        <input
          @change="seleccionarArchivoExcel"
          type="file"
          class="form-control shadow-none border-secondary-subtle"
          accept=".xlsx,.xls"
        >
        <div class="form-text small">
          Columnas esperadas: FECHA, CANCHA, CATEGORIA, HORARIO, LOCAL, VISITANTE, ARBITRO 1, ARBITRO 2.
        </div>
      </div>

      <div v-if="archivoExcel" class="alert alert-success small py-2 px-3 mb-0 d-flex align-items-center gap-2">
        <i class="bi bi-file-earmark-excel-fill"></i>
        <span>Archivo seleccionado: <strong>{{ archivoExcel.name }}</strong></span>
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
          :disabled="subiendoExcel || !archivoExcel"
        >
          <span v-if="subiendoExcel" class="spinner-border spinner-border-sm me-2"></span>
          {{ subiendoExcel ? 'Cargando...' : 'Cargar Partidos' }}
        </button>
      </template>
    </ModalBase>

<ModalBase
  :show="mostrarModalMesa"
  titulo="Mesa de control"
  icono="table_restaurant"
  colorIcono="bg-danger text-white"
  maxWidth="480px"
  :zIndex="1055"
  @close="cerrarModalMesa"
>
      <p class="text-muted small mb-3">
        <i class="bi bi-info-circle me-1"></i>
        Asigná planillero y/o cronometrista solo si este partido se juega con mesa de control. Ambos son opcionales.
      </p>

      <div class="mb-3">
        <label class="form-label small fw-bold text-muted">Planillero</label>
        <button @click="abrirSelectorMesa('planillero')" class="celda-arbitro-mobile w-100 text-start" :class="{ 'vacio': !partidoMesa?.planillero }">
          {{ partidoMesa?.planillero || '— Asignar planillero —' }}
        </button>
      </div>

      <div class="mb-2">
        <label class="form-label small fw-bold text-muted">Cronometrista</label>
        <button @click="abrirSelectorMesa('cronometrista')" class="celda-arbitro-mobile w-100 text-start" :class="{ 'vacio': !partidoMesa?.cronometrista }">
          {{ partidoMesa?.cronometrista || '— Asignar cronometrista —' }}
        </button>
      </div>
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
        <span>Se publicarán los <strong>{{ cantidadPartidosAPublicar }}</strong> partidos de las fechas tildadas como una <strong>publicación nueva</strong>: se genera el PDF para la web pública y cada árbitro verá sus partidos en su panel.</span>
      </div>

      <div v-if="modoPublicacion === 'publicar'" class="mb-3">
        <label class="form-label small fw-bold">Fechas a publicar</label>
        <div class="d-flex flex-column gap-1 border rounded p-2">
          <label v-for="f in fechas" :key="f.fecha" class="d-flex align-items-center gap-2 small mb-0" style="cursor:pointer;">
            <input
              type="checkbox"
              class="form-check-input m-0 flex-shrink-0"
              :checked="fechasSeleccionadas.includes(f.fecha)"
              @change="toggleFechaSeleccionada(f.fecha)"
            >
            <span>{{ etiquetaDia(f.fecha) }}</span>
            <span class="badge bg-light text-dark border ms-auto">{{ f.cantidad }}</span>
          </label>
        </div>
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
          :disabled="publicando || (modoPublicacion === 'publicar' && fechasSeleccionadas.length === 0)"
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
const labelSemana = ref('')
const arbitros = ref([])
const cargando = ref(false)
const eliminados = ref([])
const semanaAtras = ref(0)
let contadorUid = 0


const avisosMap = ref({})

const cargarAvisos = async () => {
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerAvisosDesignaciones'
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
const archivoExcel = ref(null)

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

// Fechas tildadas en el modal de Publicar: solo se publican los partidos de esas fechas
const fechasSeleccionadas = ref([])

const toggleFechaSeleccionada = (fecha) => {
  const i = fechasSeleccionadas.value.indexOf(fecha)
  if (i === -1) fechasSeleccionadas.value.push(fecha)
  else fechasSeleccionadas.value.splice(i, 1)
}

const cantidadPartidosAPublicar = computed(() =>
  designaciones.value.filter(p => fechasSeleccionadas.value.includes(claveFecha(p))).length
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

const abrirSelectorColor = (partido, numero) => {
  seleccionColor.value = { partido, numero }
  mostrarSelectorColor.value = true
}

const cerrarSelectorColor = () => {
  mostrarSelectorColor.value = false
  seleccionColor.value = null
}

const colorClase = (p, numero) => {
  const estado = numero === 1 ? p._estado1 : p._estado2
  return estado ? 'estado-' + estado : ''
}

const asignarColor = async (valor) => {
  const sel = seleccionColor.value
  if (!sel) return
  const p = sel.partido
  const numero = sel.numero

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
    notificar({ titulo: 'Error', mensaje: 'No se pudo guardar la etiqueta del árbitro.', tipo: 'danger' })
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
    notificar({ titulo: 'Error', mensaje: 'No se pudo cambiar el estado del partido.', tipo: 'danger' })
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
  observador: p.observador || '',
  id_observador: p.id_observador || null,
  delegado: p.delegado || '',
  id_delegado: p.id_delegado || null,
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
      eliminados.value = []
    }
  } catch (err) {
    console.error('Error al cargar designaciones:', err)
    notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar las designaciones.', tipo: 'danger' })
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
  if (semanaAtras.value === 0) return
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

/* ====================================================
   MARCA DE CAMBIO (solo para la asignación de árbitros)
   ==================================================== */
const marcar = (p) => {
  p._dirty = true
  programarAutoguardado()
}

const hayCambios = computed(() => {
  return eliminados.value.length > 0 || designaciones.value.some(p => p._dirty || !p.id)
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
  if (!arbitro) {
    if (sel.numero === 1) { p.arbitro_1 = ''; p.id_arb1 = null; p._ext1 = false }
    else { p.arbitro_2 = ''; p.id_arb2 = null; p._ext2 = false }
  } else {
    const nombreCompleto = capitalizarNombre(`${arbitro.apellido} ${arbitro.nombre}`)
    if (sel.numero === 1) { p.arbitro_1 = nombreCompleto; p.id_arb1 = arbitro.id; p._ext1 = false }
    else { p.arbitro_2 = nombreCompleto; p.id_arb2 = arbitro.id; p._ext2 = false }
  }

  marcar(p)
  cerrarSelectorArbitro()

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
  const nombre = capitalizarNombre(texto)
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

const tieneMesa = (p) => !!p.planillero || !!p.cronometrista

const tituloMesa = (p) => {
  const partes = []
  if (p.planillero) partes.push('Planillero: ' + p.planillero)
  if (p.cronometrista) partes.push('Cronometrista: ' + p.cronometrista)
  return partes.length ? partes.join(' · ') : 'Mesa de control (sin asignar)'
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
    notificar({ titulo: 'Error', mensaje: 'No se pudo guardar la mesa de control.', tipo: 'danger' })
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

  // Actualización optimista
  if (!arbitro) {
    p[campoNombre] = ''
    p[campoId] = null
  } else {
    p[campoNombre] = capitalizarNombre(`${arbitro.apellido} ${arbitro.nombre}`)
    p[campoId] = arbitro.id
  }

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
    notificar({ titulo: 'Error', mensaje: 'No se pudo guardar el observador/delegado técnico.', tipo: 'danger' })
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

// Observador / delegado sin id = puesto a mano (externo)
const esExternoRol = (p, tipo) => {
  const nombre = tipo === 'observador' ? p.observador : p.delegado
  const id = tipo === 'observador' ? p.id_observador : p.id_delegado
  return !!nombre && !id
}

const tituloCeldaRol = (p, tipo) => {
  const nombre = tipo === 'observador' ? p.observador : p.delegado
  const etiqueta = tipo === 'observador' ? 'Observador' : 'Delegado técnico'
  if (!nombre) return 'Asignar ' + etiqueta.toLowerCase()
  return etiqueta + ': ' + nombre
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
  id_arb2: p.id_arb2
})

const programarAutoguardado = () => {
  estadoGuardado.value = 'pendiente'
  if (timerAutoguardado) clearTimeout(timerAutoguardado)
  timerAutoguardado = setTimeout(() => { ejecutarGuardado() }, 1500)
}

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
      notificar({ titulo: 'Éxito', mensaje: res.payload.mensaje || 'Se cargaron los partidos.', tipo: 'success' })
      cerrarModalCarga()
      await cargarDesignaciones()
      cargarAvisos()
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al cargar designaciones:', err)
    notificar({ titulo: 'Error', mensaje: err.message || 'Hubo un problema al subir el archivo.', tipo: 'danger' })
  } finally {
    subiendoExcel.value = false
  }
}


/* ====================================================
   PUBLICAR (PDF PARA LA WEB + PANEL DE ARBITROS)
   Si hay cambios sin guardar, se guardan automáticamente
   antes de publicar. El PDF se genera en el servidor.
   ==================================================== */
const abrirModalPublicar = async (modo) => {
  modoPublicacion.value = modo

  // Al publicar, arrancamos con todas las fechas tildadas (el usuario puede destildar)
  fechasSeleccionadas.value = modo === 'publicar' ? fechas.value.map(f => f.fecha) : []

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

  if (modoPublicacion.value === 'publicar' && fechasSeleccionadas.value.length === 0) {
    notificar({ titulo: 'Atención', mensaje: 'Tildá al menos una fecha para publicar.', tipo: 'warning' })
    return
  }

  publicando.value = true
  try {
    //if (hayCambios.value) {
      const guardado = await ejecutarGuardado()
      if (!guardado) return
    //}

    const res = await api.post({
      entity: 'designaciones',
      action: 'publicarDesignaciones',
      payload: {
        torneo: formPublicar.torneo,
        fecha: formPublicar.fecha,
        modo: modoPublicacion.value,
        fechas: fechasSeleccionadas.value
      }
    })

    if (res.ok) {
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

const descargandoArchivo = ref(false)

const descargarDesignaciones = async (formato = 'pdf') => {
  const esExcel = formato === 'excel'
  descargandoArchivo.value = true
  try {
    await api.getFile({
      entity: 'designaciones',
      action: 'descargarDesignaciones',
      payload: {
        semanaAtras: semanaAtras.value,
        ...(esExcel ? { formato: 'excel' } : {})
      }
    }, esExcel ? 'designaciones.xlsx' : 'designaciones.pdf')
  } catch (err) {
    console.error('Error al descargar las designaciones:', err)
    notificar({ titulo: 'Error', mensaje: err.message || 'No se pudo descargar el archivo.', tipo: 'danger' })
  } finally {
    descargandoArchivo.value = false
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

/* Nombre de cancha (solo lectura) */
.nombre-cancha {
  color: #fff;
  font-size: 0.8rem;
  padding: 2px 6px;
}

/* Link a Google Maps con la dirección de la cancha */
.link-mapa {
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 2px 8px;
  text-decoration: none;
  white-space: nowrap;
}

.link-mapa:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}

/* Celdas de solo lectura (categoría, horario, equipos) */
.celda-texto {
  display: block;
  width: 100%;
  padding: 5px 6px;
  font-size: 0.78rem;
  color: #212529;
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

.partido-mobile {
  border-left: 3px solid #dc3545;
}

.partido-mobile:last-child {
  border-bottom-left-radius: 12px !important;
  border-bottom-right-radius: 12px !important;
  overflow: hidden;
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

/* ====================================================
   ESTILOS DEL BUSCADOR (Bordes unificados)
   ==================================================== */
.buscador-grupo {
  border-radius: var(--bs-border-radius-sm);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

/* Evitar que el input ponga su propio borde cuando tiene foco */
.buscador-grupo .form-control:focus {
  border-color: #dee2e6;
  box-shadow: none;
}

/* Aplicar el color celeste de Bootstrap a todos los hijos cuando el grupo tiene foco */
.buscador-grupo:focus-within > .input-group-text,
.buscador-grupo:focus-within > .form-control,
.buscador-grupo:focus-within > .btn {
  border-color: #86b7fe !important;
}

/* Sombra exterior (anillo) celeste a todo el grupo */
.buscador-grupo:focus-within {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
}

/* ====================================================
   FILA SUSPENDIDA
   ==================================================== */
.fila-suspendida td {
  background-color: #fee2e2 !important;
}

.fila-suspendida .celda-texto {
  color: #991b1b;
  text-decoration: line-through;
}

.susp-check {
  cursor: pointer;
}

.susp-check:checked {
  background-color: #dc3545;
  border-color: #dc3545;
}

/* ====================================================
   MARCAS DE ESTADO POR COLOR (árbitros)
   ==================================================== */
.celda-arb-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
}

.celda-arb-wrap .celda-arbitro {
  flex-grow: 1;
}

.btn-color-tag,
.btn-color-tag-mobile {
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  color: #6c757d;
  padding: 3px;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-color-tag:hover,
.btn-color-tag-mobile:hover {
  background: #f8f9fa;
}

/* Colores de estado (celda y botón toman el mismo fondo) */
.estado-observaciones {
  background-color: #ede9fe !important;
  border-color: #8b5cf6 !important;
  color: #5b21b6 !important;
}

.estado-reemplazar {
  background-color: #fee2e2 !important;
  border-color: #ef4444 !important;
  color: #991b1b !important;
}

.estado-cambiar {
  background-color: #ffedd5 !important;
  border-color: #f97316 !important;
  color: #9a3412 !important;
}

.estado-confirmado {
  background-color: #fef9c3 !important;
  border-color: #eab308 !important;
  color: #854d0e !important;
}

.estado-posible {
  background-color: #dcfce7 !important;
  border-color: #22c55e !important;
  color: #166534 !important;
}

/* ====================================================
   SELECTOR DE COLOR (modal)
   ==================================================== */
.lista-colores {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.opcion-color {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  background: #fff;
  border: 1px solid #f1f3f5;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 0.85rem;
  color: #212529;
  cursor: pointer;
}

.opcion-color:hover {
  background: #f8f9fa;
}

.muestra-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.muestra-none {
  background: repeating-linear-gradient(45deg, #f1f3f5, #f1f3f5 4px, #fff 4px, #fff 8px);
}

/* ====================================================
   BOTÓN MESA DE CONTROL (planillero / cronometrista)
   ==================================================== */
.btn-mesa {
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  color: #adb5bd;
  padding: 3px 6px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.btn-mesa:hover {
  background: #f8f9fa;
  color: #6c757d;
}

/* Cuando el partido ya tiene planillero o cronometrista */
.btn-mesa.con-mesa {
  background: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}
</style>
