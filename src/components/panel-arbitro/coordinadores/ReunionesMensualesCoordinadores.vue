<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 border-bottom">
          <div class="row g-3 align-items-center">
            <div class="col-12 col-xl-auto">
              <div class="border-start border-danger border-5 ps-3">
                <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
                  <i class="bi bi-people-fill me-1"></i> Gestión de Reuniones
                </h4>
                <span class="text-muted small d-block mt-1">
                  <template v-if="modoReunion && !cargandoArbitros">
                    {{ reunionActual?.titulo }} — {{ arbitrosReunion.length }} árbitros
                    <span v-if="resumenReunionActual.presentes"   class="ms-1 badge rounded-pill bg-success">✓ {{ resumenReunionActual.presentes }}</span>
                    <span v-if="resumenReunionActual.ausentes"    class="ms-1 badge rounded-pill bg-secondary">✗ {{ resumenReunionActual.ausentes }}</span>
                    <span v-if="resumenReunionActual.sinRegistro" class="ms-1 badge rounded-pill bg-light text-muted border">— {{ resumenReunionActual.sinRegistro }}</span>
                  </template>
                  <template v-else>Reuniones Mensuales — Mi grupo · {{ totalFiltrados }} árbitros</template>
                </span>
                <span v-if="modoReunion && reunionActual" class="text-muted d-block mt-1 texto-creacion">
                  <i class="bi bi-person-badge me-1"></i>{{ textoCreacionReunion(reunionActual) }}
                </span>
              </div>
            </div>

            <div class="col-12 col-xl">
              <div class="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-center justify-content-md-between">
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
                    <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2 flex-shrink-0 control-encabezado" aria-label="Mostrar filtros">
                      <span class="material-icons fs-6">filter_alt</span>
                    </button>
                    <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2 flex-shrink-0 control-encabezado" aria-label="Limpiar filtros">
                      <span class="material-icons text-dark fs-6">filter_alt_off</span>
                      <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
                    </button>
                    <button @click="abrirModalNuevaReunion" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger flex-shrink-0 control-encabezado" aria-label="Nueva reunión">
                      <span class="material-icons fs-6">add_alert</span>
                      <span class="fw-bold d-none d-md-inline small">Nuevo</span>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="modoReunion" class="d-flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary fw-bold d-flex align-items-center justify-content-center gap-1 flex-fill flex-sm-grow-0"
                  :disabled="cargandoArbitros || !!motivoNoGestionable"
                  @click="abrirModalEditarReunion"
                  :title="motivoNoGestionable || 'Modificar esta reunión'"
                >
                  <i class="bi bi-pencil-square"></i>
                  <span>Modificar</span>
                </button>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger fw-bold d-flex align-items-center justify-content-center gap-1 flex-fill flex-sm-grow-0"
                  :disabled="cargandoArbitros || eliminandoReunion || !puedeEliminarReunion"
                  @click="confirmarEliminarReunion"
                  :title="puedeEliminarReunion ? 'Eliminar esta reunión' : motivoNoEliminable"
                >
                  <span v-if="eliminandoReunion" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-trash3"></i>
                  <span>Eliminar</span>
                </button>

                <template v-if="!reunionEsPasada">
                  <button
                    type="button"
                    class="btn btn-sm btn-danger fw-bold d-flex align-items-center justify-content-center gap-1 flex-fill flex-sm-grow-0"
                    :disabled="habilitandoExamen || cargandoArbitros || !idsGruposExamenReunion.length || examenHabilitado || !asistenciaGrupoExamen.presentes || !reunionAprobada"
                    @click="abrirModalExamen"
                    :title="tituloBotonHabilitar"
                  >
                    <span v-if="habilitandoExamen" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-shield-check"></i>
                    <span>Habilitar examen</span>
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger fw-bold d-flex align-items-center justify-content-center gap-1 flex-fill flex-sm-grow-0"
                    :disabled="deshabilitandoExamen || cargandoArbitros || !idsGruposExamenReunion.length || !examenHabilitado"
                    @click="deshabilitarExamenReunion"
                    title="Deshabilitar el examen de esta reunión"
                  >
                    <span v-if="deshabilitandoExamen" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-shield-slash"></i>
                    <span>Deshabilitar examen</span>
                  </button>
                </template>
              </div>
              <small v-if="modoReunion && motivoNoGestionable" class="d-block text-muted mt-1">
                <i class="bi bi-info-circle me-1"></i>{{ motivoNoGestionable }}
              </small>
            </div>
          </div>
        </div>

        <div v-if="modoReunion && reunionActual?.categoria === 'reunion' && reunionActual?.aprobacion === 'pendiente'" class="alert alert-warning rounded-0 border-0 border-bottom mb-0 py-2 px-3 small d-flex align-items-center gap-2">
          <i class="bi bi-hourglass-split flex-shrink-0"></i>
          <span><strong>Pendiente de aprobación.</strong> Los árbitros la van a ver, y vas a poder tomar asistencia y habilitar el examen, cuando la administración la apruebe.</span>
        </div>
        <div v-else-if="modoReunion && reunionActual?.categoria === 'reunion' && reunionActual?.aprobacion === 'rechazada'" class="alert alert-danger rounded-0 border-0 border-bottom mb-0 py-2 px-3 small d-flex flex-column flex-md-row align-items-md-center gap-2">
          <div class="flex-grow-1">
            <strong><i class="bi bi-x-octagon-fill me-1"></i>Reunión rechazada.</strong>
            <span v-if="reunionActual.motivo_rechazo"> Motivo: {{ reunionActual.motivo_rechazo }}.</span>
            Reprogramala para que vuelva a revisión.
          </div>
          <button v-if="puedeModificarReunion" type="button" class="btn btn-danger btn-sm fw-bold flex-shrink-0" @click="abrirModalEditarReunion">
            <i class="bi bi-calendar-plus me-1"></i>REPROGRAMAR
          </button>
        </div>

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Árbitros</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm" aria-label="Cerrar filtros"></button>
          </div>
          <div class="row g-2">
            <div class="col-6"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido..."></div>
            <div class="col-6"><input v-model="filtros.nombre"   class="form-control form-control-sm shadow-none" placeholder="Nombre..."></div>
            <div class="col-6">
              <select v-model="filtros.grupo" class="form-select form-select-sm shadow-none">
                <option value="">Todos los grupos</option>
                <option v-for="g in GRUPOS" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="filtros.subgrupo" class="form-select form-select-sm shadow-none">
                <option value="">Todos los subgrupos</option>
                <option v-for="sg in SUBGRUPOS" :key="sg" :value="sg">{{ sg }}</option>
              </select>
            </div>
            <div class="col-12" v-if="modoReunion">
              <select v-model="filtros.asistencia" class="form-select form-select-sm shadow-none">
                <option value="">Todas las asistencias</option>
                <option value="presente">Solo Presentes</option>
                <option value="ausente">Solo Ausentes</option>
                <option value="sin_registro">Sin Registro</option>
              </select>
            </div>
            <div class="col-12 mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
            <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted col-fija col-id" style="width: 50px;">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones" style="width: 90px;">Acciones</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
                  <th class="py-3 text-center text-uppercase text-muted">Grupo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Subgrupo</th>
                  <th v-if="!modoReunion" class="py-3 text-center text-uppercase text-muted">Reuniones</th>
                  <th v-if="modoReunion" class="py-3 text-center text-uppercase text-muted">Teórico</th>
                  <th v-if="modoReunion" class="py-3 text-uppercase text-muted" style="min-width: 270px;">
                    Asistencia
                    <span class="fw-normal fst-italic text-muted ms-1" style="font-size: 0.7rem;">(guardado automático)</span>
                  </th>
                </tr>
                <tr class="bg-light">
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id">
                    <button @click="recargar" class="btn btn-sm btn-light border rounded text-secondary shadow-sm px-2 py-1" aria-label="Recargar">
                      <i class="bi bi-arrow-clockwise"></i>
                    </button>
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-acciones"></td>
                  <td class="p-2 border-bottom border-2 col-fija col-apellido">
                    <input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Filtrar..">
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-nombre">
                    <input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Filtrar..">
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.grupo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option>
                      <option v-for="g in GRUPOS" :key="g" :value="g">{{ g }}</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.subgrupo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option>
                      <option v-for="sg in SUBGRUPOS" :key="sg" :value="sg">{{ sg }}</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2 text-center" v-if="!modoReunion">
                    <span class="text-muted small fst-italic">← Seleccioná una reunión</span>
                  </td>
                  <td v-if="modoReunion" class="p-2 border-bottom border-2"></td>
                  <td v-if="modoReunion" class="p-2 border-bottom border-2">
                    <select v-model="filtros.asistencia" class="form-select form-select-sm shadow-none">
                      <option value="">Todas</option>
                      <option value="presente">Solo Presentes</option>
                      <option value="ausente">Solo Ausentes</option>
                      <option value="sin_registro">Sin Registro</option>
                    </select>
                  </td>
                </tr>
              </thead>

              <tbody>
                <tr v-if="cargandoInicial || cargandoArbitros">
                  <td :colspan="modoReunion ? 8 : 7" class="text-center py-5">
                    <div class="spinner-border text-danger spinner-border-sm" role="status"></div>
                    <span class="ms-2 fw-bold text-muted">Cargando datos...</span>
                  </td>
                </tr>
                <tr v-else-if="!arbitrosPaginados.length">
                  <td :colspan="modoReunion ? 8 : 7" class="text-center py-4 text-muted">
                    <span class="material-icons opacity-50 d-block mb-2" style="font-size: 32px;">search_off</span>
                    <span class="fw-bold">No se encontraron árbitros.</span>
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="a in arbitrosPaginados"
                  :key="a.id"
                  :class="{
                    'fila-presente': modoReunion && asistencias[a.id] === 'presente',
                    'fila-ausente':  modoReunion && asistencias[a.id] === 'ausente',
                  }"
                >
                  <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ a.id }}</td>
                  <td class="text-center col-fija col-acciones">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="verDetalleArbitro(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver historial" aria-label="Ver historial">
                        <span class="material-icons" style="font-size:16px;">manage_search</span>
                      </button>
                    </div>
                  </td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
                  <td class="text-center text-dark">{{ a.nombre_grupo || a.grupo || '-' }}</td>
                  <td class="text-center text-dark">{{ a.subgrupo || '-' }}</td>

                  <td v-if="!modoReunion" class="text-center">
                    <div class="d-flex align-items-center justify-content-center gap-2">
                      <ResumenAsistencia :resumen="resumenAsistencia(a.id)" />
                    </div>
                  </td>

                  <td v-if="modoReunion" class="text-center">
                    <div v-if="examenes[a.id]" class="d-flex align-items-center justify-content-center gap-2">
                      <span class="fw-bold" :class="examenes[a.id].aprobado ? 'text-success' : 'text-danger'">
                        {{ examenes[a.id].calificacion.toFixed(2) }} %
                      </span>
                      <button
                        @click="descargarPdfTeorico(a)"
                        :disabled="!!descargandoPdf[a.id]"
                        class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary"
                        title="Descargar teórico"
                        aria-label="Descargar teórico"
                      >
                        <span v-if="descargandoPdf[a.id]" class="spinner-border spinner-border-sm"></span>
                        <i v-else class="bi bi-eye"></i>
                      </button>
                    </div>
                    <span v-else class="text-muted">-</span>
                  </td>

                  <td v-if="modoReunion">
                    <div class="d-flex align-items-center gap-3">
                      <div class="form-check form-check-inline mb-0">
                        <input
                          type="radio"
                          :id="`pres-${a.id}`"
                          :name="`asist-${a.id}`"
                          value="presente"
                          v-model="asistencias[a.id]"
                          @change="guardarAsistencia(a)"
                          :disabled="!!guardando[a.id]"
                          class="form-check-input radio-presente"
                        >
                        <label :for="`pres-${a.id}`" class="form-check-label fw-bold text-success">✓ Presente</label>
                      </div>
                      <div class="form-check form-check-inline mb-0">
                        <input
                          type="radio"
                          :id="`aus-${a.id}`"
                          :name="`asist-${a.id}`"
                          value="ausente"
                          v-model="asistencias[a.id]"
                          @change="guardarAsistencia(a)"
                          :disabled="!!guardando[a.id]"
                          class="form-check-input radio-ausente"
                        >
                        <label :for="`aus-${a.id}`" class="form-check-label fw-bold text-secondary">✗ Ausente</label>
                      </div>
                      <span class="estado-indicator">
                        <span v-if="guardando[a.id]"       class="spinner-border spinner-border-sm text-danger" role="status"></span>
                        <i    v-else-if="guardadoOk[a.id]" class="bi bi-check-circle-fill text-success"></i>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-md-none p-3 bg-light">
            <div v-if="cargandoInicial || cargandoArbitros" class="text-center p-4 bg-white rounded-3 shadow-sm border">
              <div class="spinner-border text-danger spinner-border-sm" role="status"></div>
              <p class="m-0 mt-2 small fw-bold text-muted">Cargando datos...</p>
            </div>
            <template v-else>
              <div
                v-for="a in arbitrosPaginados"
                :key="'mob-'+a.id"
                class="card shadow-sm mb-3 border-light-subtle rounded-3"
                :class="{
                  'border-success border-2':   modoReunion && asistencias[a.id] === 'presente',
                  'border-secondary border-2': modoReunion && asistencias[a.id] === 'ausente',
                }"
              >
                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">{{ a.apellido }}, {{ a.nombre }}</div>
                  <div class="d-flex align-items-center gap-2">
                    <div class="small text-muted fw-bold font-monospace">#{{ a.id }}</div>
                    <span v-if="modoReunion && guardando[a.id]"    class="spinner-border spinner-border-sm text-danger"></span>
                    <i v-else-if="modoReunion && guardadoOk[a.id]" class="bi bi-check-circle-fill text-success fs-6"></i>
                  </div>
                </div>
                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex justify-content-between text-dark mb-2 border-bottom border-secondary-subtle pb-2">
                    <span class="small">
                      <strong>Grupo:</strong> {{ a.grupo }}
                      <template v-if="a.subgrupo"> / {{ a.subgrupo }}</template>
                    </span>
                    <span class="small"><strong>Reuniones:</strong> {{ resumenAsistencia(a.id).total }}</span>
                  </div>

                  <div v-if="modoReunion && examenes[a.id]" class="d-flex justify-content-between align-items-center text-dark mb-2 border-bottom border-secondary-subtle pb-2">
                    <span class="small">
                      <strong>Teórico:</strong>
                      <span class="fw-bold ms-1" :class="examenes[a.id].aprobado ? 'text-success' : 'text-danger'">{{ examenes[a.id].calificacion.toFixed(2) }} %</span>
                    </span>
                    <button
                      @click="descargarPdfTeorico(a)"
                      :disabled="!!descargandoPdf[a.id]"
                      class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary"
                      aria-label="Descargar teórico"
                    >
                      <span v-if="descargandoPdf[a.id]" class="spinner-border spinner-border-sm"></span>
                      <i v-else class="bi bi-eye"></i>
                    </button>
                  </div>

                  <div v-if="!modoReunion" class="d-flex gap-2">
                    <div class="flex-grow-1 bg-light p-2 rounded border border-light-subtle">
                      <ResumenAsistencia :resumen="resumenAsistencia(a.id)" :mobile="true" />
                    </div>
                    <button @click="verDetalleArbitro(a)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center" aria-label="Ver historial">
                      <span class="material-icons" style="font-size: 18px;">manage_search</span>
                    </button>
                  </div>

                  <div v-else class="d-flex gap-2">
                    <label
                      :for="`presm-${a.id}`"
                      class="toggle-asist flex-grow-1 d-flex align-items-center justify-content-center py-2 rounded-2 fw-bold small"
                      :class="asistencias[a.id] === 'presente'
                        ? 'bg-success text-white border border-success'
                        : 'bg-white text-success border border-success'"
                    >
                      <input type="radio" :id="`presm-${a.id}`" :name="`asistm-${a.id}`" value="presente"
                        v-model="asistencias[a.id]" @change="guardarAsistencia(a)" :disabled="!!guardando[a.id]" class="visually-hidden">
                      ✓ Presente
                    </label>
                    <label
                      :for="`ausm-${a.id}`"
                      class="toggle-asist flex-grow-1 d-flex align-items-center justify-content-center py-2 rounded-2 fw-bold small"
                      :class="asistencias[a.id] === 'ausente'
                        ? 'bg-secondary text-white border border-secondary'
                        : 'bg-white text-secondary border border-secondary'"
                    >
                      <input type="radio" :id="`ausm-${a.id}`" :name="`asistm-${a.id}`" value="ausente"
                        v-model="asistencias[a.id]" @change="guardarAsistencia(a)" :disabled="!!guardando[a.id]" class="visually-hidden">
                      ✗ Ausente
                    </label>
                  </div>
                </div>
              </div>

              <div v-if="!arbitrosPaginados.length" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
                <p class="text-muted m-0 fw-bold">No se encontraron árbitros.</p>
              </div>
            </template>
          </div>

          <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1" aria-label="Anterior">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas" aria-label="Siguiente">
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL NUEVA REUNIÓN (mismo formulario que "Nuevo Evento" de Gestión de Eventos) -->
    <ModalBase
      :show="mostrarModalNueva"
      @close="mostrarModalNueva = false"
      :icono="modoEdicionReunion ? 'edit' : 'notification_add'"
      :colorIcono="modoEdicionReunion ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'"
      maxWidth="900px"
    >
      <template #header>
        <span class="fw-bold fs-5">{{ modoEdicionReunion ? 'Modificar Reunión' : 'Nueva Reunión' }}</span>
      </template>

      <p class="text-muted small mb-3">Completá los datos para enviar el aviso a los árbitros de tu grupo.</p>

      <div class="text-start mb-4">
        <label class="small fw-bold text-dark mb-2 d-block">
          <i class="bi bi-calendar3 me-1 text-danger"></i>Agenda de reuniones de todos los grupos
          <span class="fw-normal text-muted">· tocá un día para elegir la fecha</span>
        </label>
        <CalendarioEventos
          v-if="mostrarModalNueva"
          v-model:fecha-seleccionada="formReunion.fecha_evento"
          :fecha-minima="modoEdicionReunion ? manianaStr() : hoyStr()"
          :grupos-destacados="misGrupos.map(g => Number(g.id))"
          @cargado="evs => eventosAgenda = evs"
        />
      </div>

      <form id="formNuevaReunion" @submit.prevent="confirmarGuardadoReunion" class="text-start">
        <div class="row g-3">
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Tema de la Reunión *</label>
            <input v-model="formReunion.titulo" type="text" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: Reunión mensual..." required>
          </div>

          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Lugar *</label>
            <textarea v-model="formReunion.descripcion" class="form-control shadow-none border-secondary-subtle" rows="2" placeholder="Ej: Casa del Handball..." required></textarea>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Fecha de la Reunión *</label>
            <input v-model="formReunion.fecha_evento" type="date" :min="modoEdicionReunion ? manianaStr() : hoyStr()" class="form-control shadow-none border-secondary-subtle" required>
            <small v-if="eventosMismoDia.length" class="d-block text-danger fw-semibold mt-1">
              <i class="bi bi-exclamation-circle-fill me-1"></i>Ese día ya hay {{ eventosMismoDia.length === 1 ? 'otro evento' : `${eventosMismoDia.length} eventos` }}: {{ eventosMismoDia.map(e => e.titulo).join(', ') }}
            </small>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Categoría</label>
            <div class="form-control bg-light border-secondary-subtle fw-bold text-dark">Reunión</div>
          </div>

          <div class="col-12">
            <hr class="my-2 border-secondary-subtle opacity-25">
          </div>

          <div class="col-12">
            <label class="small fw-bold text-danger mb-2">Grupo destinatario *</label>
            <div class="bg-light border border-danger-subtle rounded p-3">
              <div v-if="cargandoMisGrupos" class="text-center py-2">
                <span class="spinner-border spinner-border-sm text-danger"></span>
                <span class="text-muted small ms-2">Cargando tus grupos...</span>
              </div>
              <div v-else-if="misGrupos.length" class="d-flex flex-wrap gap-3">
                <div v-for="g in misGrupos" :key="g.id" class="form-check m-0">
                  <input
                    :id="`reunion-grupo-${g.id}`"
                    class="form-check-input shadow-none border-secondary-subtle"
                    type="checkbox"
                    :value="Number(g.id)"
                    v-model="gruposReunion"
                    :disabled="misGrupos.length === 1"
                  >
                  <label class="form-check-label small fw-bold mt-1" :for="`reunion-grupo-${g.id}`">
                    {{ g.nombre }} {{ g.subgrupo }}
                  </label>
                </div>
              </div>
              <p v-else class="text-muted small mb-0">No tenés grupos a cargo asignados.</p>
              <span v-if="misGrupos.length > 1" class="d-block text-muted mt-2" style="font-size: 0.75rem;">Solo podés convocar a los grupos que coordinás.</span>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModalNueva = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formNuevaReunion" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesandoReunion || !misGrupos.length">
          <span v-if="procesandoReunion" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesandoReunion ? 'GUARDANDO...' : (modoEdicionReunion ? 'GUARDAR CAMBIOS' : 'PUBLICAR REUNIÓN') }}
        </button>
      </template>
    </ModalBase>

    <ModalBase
      :show="mostrarModalExamen"
      @close="mostrarModalExamen = false"
      icono="quiz"
      colorIcono="bg-danger-subtle text-danger"
      maxWidth="640px"
    >
      <template #header>
        <span class="fw-bold fs-5">Programar examen</span>
      </template>

      <div class="d-flex flex-wrap gap-2 justify-content-center mb-3">
        <span class="badge bg-success px-3 py-2"><i class="bi bi-person-check-fill me-1"></i>{{ asistenciaGrupoExamen.presentes }} presentes</span>
        <span class="badge bg-secondary px-3 py-2"><i class="bi bi-person-dash-fill me-1"></i>{{ asistenciaGrupoExamen.ausentes }} ausentes</span>
        <span v-if="asistenciaGrupoExamen.sinRegistro" class="badge bg-light text-muted border px-3 py-2">{{ asistenciaGrupoExamen.sinRegistro }} sin registro</span>
      </div>
      <p class="text-muted small text-center mb-4">Solo los árbitros presentes van a poder rendir el examen desde su panel.</p>

      <div v-if="cargandoReglas" class="text-center py-4">
        <span class="spinner-border spinner-border-sm text-danger"></span>
        <span class="text-muted small ms-2">Cargando reglas...</span>
      </div>

      <form v-else id="formProgramarExamen" @submit.prevent="habilitarExamenReunion" class="text-start">
        <div class="row g-3">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="small fw-bold text-danger m-0">Reglas a evaluar *</label>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none" @click="seleccionarTodasLasReglas(true)">Todas</button>
                <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none text-muted" @click="seleccionarTodasLasReglas(false)">Ninguna</button>
              </div>
            </div>
            <div class="bg-light border border-danger-subtle rounded p-3">
              <div v-if="reglasDisponibles.length" class="d-flex flex-wrap gap-3">
                <div v-for="r in reglasDisponibles" :key="r.codigo" class="form-check m-0" style="min-width: 110px;">
                  <input
                    :id="`examen-regla-${r.codigo}`"
                    class="form-check-input shadow-none border-secondary-subtle"
                    type="checkbox"
                    :value="r.codigo"
                    v-model="formExamen.reglas"
                  >
                  <label class="form-check-label small fw-bold mt-1" :for="`examen-regla-${r.codigo}`">
                    Regla {{ r.codigo }} <span class="text-muted fw-normal">({{ r.cantidad }})</span>
                  </label>
                </div>
              </div>
              <p v-else class="text-muted small mb-0">No hay preguntas cargadas.</p>
            </div>
            <span class="d-block text-muted mt-1" style="font-size: 0.75rem;">{{ preguntasDisponiblesExamen }} preguntas disponibles con las reglas elegidas.</span>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Cantidad de preguntas *</label>
            <input
              v-model.number="formExamen.cantidadPreguntas"
              type="number"
              min="1"
              :max="Math.min(100, preguntasDisponiblesExamen) || 1"
              class="form-control shadow-none border-secondary-subtle"
              required
            >
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Tiempo (minutos) *</label>
            <input
              v-model.number="formExamen.tiempoLimiteMin"
              type="number"
              min="1"
              max="180"
              class="form-control shadow-none border-secondary-subtle"
              required
            >
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModalExamen = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formProgramarExamen" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="habilitandoExamen || cargandoReglas || !programacionValida">
          <span v-if="habilitandoExamen" class="spinner-border spinner-border-sm me-1"></span>
          {{ habilitandoExamen ? 'HABILITANDO...' : 'HABILITAR EXAMEN' }}
        </button>
      </template>
    </ModalBase>

    <ModalBase :show="mostrarModalDetalle" @close="mostrarModalDetalle = false" icono="person_search" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="800px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">Detalle de {{ arbitroSeleccionado.apellido }}, {{ arbitroSeleccionado.nombre }}</span>
          <div class="text-muted small mt-1">Historial de reuniones</div>
        </div>
      </template>

      <div v-if="cargandoHistorial" class="text-center py-5 bg-white rounded shadow-sm border border-light-subtle">
        <div class="spinner-border text-warning" role="status"></div>
        <div class="mt-2 text-muted fw-bold small">Cargando historial...</div>
      </div>

      <div v-else-if="!reunionesDelArbitroDetalle.length" class="text-center py-5 text-muted bg-white rounded shadow-sm border border-light-subtle">
        <span class="material-icons d-block mb-2" style="font-size: 48px; color: #cbd5e1;">history_toggle_off</span>
        <p class="mb-0 fw-bold">No hay reuniones registradas para este árbitro.</p>
      </div>

      <div v-else>
        <div class="d-flex justify-content-end mb-3" v-if="añosDetalleArbitro.length">
          <div class="d-flex align-items-center gap-2">
            <label class="small fw-bold text-dark text-uppercase m-0">Año:</label>
            <select v-model="filtroAñoDetalle" class="form-select form-select-sm shadow-sm border-secondary-subtle" style="min-width: 140px;">
              <option value="">Todos los años</option>
              <option v-for="año in añosDetalleArbitro" :key="año" :value="año">{{ año }}</option>
            </select>
          </div>
        </div>

        <div class="row g-2 mb-4">
          <div class="col-4">
            <div class="card border-0 shadow-sm h-100 bg-success">
              <div class="card-body p-2 text-center text-white">
                <i class="bi bi-person-check-fill" style="font-size: 1.2rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ resumenDetalle.presentes }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">Presentes</div>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="card border-0 shadow-sm h-100 bg-secondary">
              <div class="card-body p-2 text-center text-white">
                <i class="bi bi-person-dash-fill" style="font-size: 1.2rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ resumenDetalle.ausentes }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">Ausentes</div>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="card border-0 shadow-sm h-100 bg-light">
              <div class="card-body p-2 text-center text-muted">
                <i class="bi bi-question-circle-fill" style="font-size: 1.2rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ resumenDetalle.sinInformacion }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">Sin info</div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-warning">
          <span class="material-icons text-warning-emphasis me-2">event_note</span>
          <h6 class="fw-bold m-0 text-dark text-uppercase">Reuniones</h6>
        </div>
        <div class="row g-2">
          <div v-for="ex in reunionesFiltradosDetalle" :key="ex.id" class="col-12 col-md-6">
            <div class="card border border-light-subtle shadow-sm h-100 bg-white">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="text-dark fw-bold small mb-1">
                      <i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatFecha(ex.fecha_reunion) }}
                    </div>
                    <div v-if="ex.titulo" class="text-muted small fst-italic">{{ ex.titulo }}</div>
                  </div>
                  <div class="d-flex flex-column align-items-end gap-1">
                    <span class="badge bg-dark font-monospace" style="font-size: 0.65rem;">#{{ ex.id }}</span>
                    <AsistenciaBadge :asistencia="ex.asistencia" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  </div>
</template>

<script setup>
import { anioActual, conAnioActual } from '@/composables/useAnioActual'
import { ref, onMounted, computed, reactive, inject, watch, defineComponent, h } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'
import CalendarioEventos from '@/components/CalendarioEventos.vue'
import { textoCreacionReunion } from '@/composables/useCreadorReunion'

useHead({
  title: 'Reuniones | Coordinador',
  meta: [{ name: 'description', content: 'Gestión de asistencia a reuniones del grupo coordinado.' }],
})

// ─── Constantes ───────────────────────────────────────────────────
const GRUPOS            = ['LH', 'Pre Liga', 'SR', '1', '2', '3', '4']
const SUBGRUPOS         = ['A', 'B', 'C']
const CATEGORIA         = 'reunion'
const MOBILE_BREAKPOINT = 768

// ─── Helpers ─────────────────────────────────────────────────────
const normalizarTexto = (v) =>
  String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const formatFecha  = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha   = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''
const sortPorFecha = (lista) => [...lista].sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0))

// True si la fecha del evento ya pasó (comparación por día, hora 00:00).
// No se puede habilitar un examen para una reunión con fecha pasada.
const esFechaPasada = (fechaEvento) => {
  if (!fechaEvento) return false
  const soloFecha = String(fechaEvento).split(' ')[0] // "YYYY-MM-DD" o "DD/MM/YYYY"
  let d
  if (soloFecha.includes('/')) {
    const [dia, mes, anio] = soloFecha.split('/')
    d = new Date(Number(anio), Number(mes) - 1, Number(dia))
  } else {
    const [anio, mes, dia] = soloFecha.split('-')
    d = new Date(Number(anio), Number(mes) - 1, Number(dia))
  }
  if (isNaN(d)) return false
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return d < hoy
}

// Fecha (YYYY-MM-DD o DD/MM/YYYY, con o sin hora) -> "YYYY-MM-DD"
const aISO = (fecha) => {
  const soloFecha = String(fecha || '').split(' ')[0]
  if (soloFecha.includes('/')) {
    const [dia, mes, anio] = soloFecha.split('/')
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
  }
  return soloFecha.substring(0, 10)
}
const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hoyStr = () => isoLocal(new Date())
const manianaStr = () => { const d = new Date(); d.setDate(d.getDate() + 1); return isoLocal(d) }
// True si la fecha es posterior a hoy (mañana en adelante)
const esFechaFutura = (fechaEvento) => !!fechaEvento && aISO(fechaEvento) > hoyStr()

// Nombre legible de un grupo a partir de su id (usa la lista cargada de grupos).
const nombreGrupo = (idGrupo) => {
  const g = grupos.value.find(x => Number(x.id) === Number(idGrupo))
  if (!g) return '—'
  return g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre
}

const normalizarAsistencia = (valor) => {
  if (valor === null || valor === undefined) return ''
  const texto = String(valor).trim().toLowerCase()
  if (texto === 'presente') return 'presente'
  if (texto === 'ausente')  return 'ausente'
  return ''
}

// ─── Componentes internos ─────────────────────────────────────────
const ResumenAsistencia = defineComponent({
  props: { resumen: Object, mobile: Boolean },
  setup(props) {
    return () => {
      const r = props.resumen ?? { presentes: 0, ausentes: 0 }
      const items = []
      if (r.presentes > 0) items.push({ label: 'Presentes', short: 'pres.', badge: 'bg-success',   icon: 'bi-person-check-fill', count: r.presentes })
      if (r.ausentes  > 0) items.push({ label: 'Ausentes',  short: 'aus.',  badge: 'bg-secondary', icon: 'bi-person-dash-fill',  count: r.ausentes  })
      if (!items.length) {
        return h('div', { class: 'd-flex gap-1 flex-wrap' }, [
          h('span', { class: 'badge bg-dark rounded-pill px-3 py-1', title: 'Sin registro' }, '0')
        ])
      }
      return h('div', { class: 'd-flex gap-1 flex-wrap' }, items.map(k =>
        h('span', { class: `badge ${k.badge} text-white px-2 py-1`, title: k.label },
          props.mobile ? `${k.count} ${k.short}` : [h('i', { class: `bi ${k.icon} me-1` }), String(k.count)]
        )
      ))
    }
  },
})

const AsistenciaBadge = defineComponent({
  props: { asistencia: String },
  setup(props) {
    return () => {
      const estado = normalizarAsistencia(props.asistencia)
      return h('span', {
        class: estado === 'presente'
          ? 'badge bg-success text-white px-2 py-1'
          : estado === 'ausente'
            ? 'badge bg-secondary text-white px-2 py-1'
            : 'badge bg-light text-muted border px-2 py-1',
      }, estado === 'presente' ? 'PRESENTE' : estado === 'ausente' ? 'AUSENTE' : 'SIN INFORMACION')
    }
  },
})

// ─── Inyectado ───────────────────────────────────────────────────
const toast = inject('toast', (msg) => alert(msg.mensaje || msg))
const notificar = inject('notificar')

// ─── Estado ──────────────────────────────────────────────────────
const arrReuniones        = ref([])
const arbitros            = ref([])
const arbitrosReunion     = ref([])
const examenes            = ref({})
const descargandoPdf      = reactive({})
const grupos              = ref([])
const habilitandoExamen   = ref(false)
const deshabilitandoExamen = ref(false)
const examenHabilitado    = ref(false)
const mostrarModalExamen  = ref(false)
const cargandoReglas      = ref(false)
const reglasDisponibles   = ref([])
const formExamen          = reactive({ cantidadPreguntas: 20, tiempoLimiteMin: 25, reglas: [] })

const reunionSeleccionada = ref('')
const soloActivos         = ref(false)

const registrosExistentes = ref({})
const asistencias         = reactive({})
const guardando           = reactive({})
const guardadoOk          = reactive({})

const cargandoInicial      = ref(true)
const cargandoArbitros     = ref(false)
const paginaActual         = ref(1)
const registrosPorPagina   = 10
const mostrarFiltrosMobile = ref(false)
const mostrarModalDetalle  = ref(false)
const arbitroSeleccionado  = ref({ id: null, apellido: '', nombre: '' })
const filtroAñoDetalle     = ref(anioActual())

const filtros = reactive({ apellido: '', nombre: '', grupo: '', subgrupo: '', asistencia: '' })

const cargandoHistorial              = ref(false)
const reunionesArbitroSeleccionado   = ref([])
const asistenciasGlobales            = ref({})

// ─── Computeds: modo ─────────────────────────────────────────────
// El select trabaja con una clave "idEvento|idGrupo" (o "idEvento|all" para
// reuniones de todos los grupos), de modo que cada grupo de una reunión es una
// opción separada. Igual acá derivamos el idEvento y el idGrupo elegidos.
const modoReunion = computed(() => !!reunionSeleccionada.value)

// Opciones del select: una por evento + grupo. Para un coordinador, el backend
// adjunta idsGruposCoordinados/nombresGruposCoordinados (solo los grupos que
// coordina, ya intersectados con los de la reunión); en ese caso desglosamos
// únicamente esos. Para otros roles se desglosa por los grupos de la reunión
// (o todos los del sistema, si la reunión es "todos los grupos").
const opcionesReunion = computed(() => {
  const ops = []
  for (const r of arrReuniones.value) {
    const estado = r.categoria === 'reunion' && r.aprobacion === 'pendiente'
      ? ' · PENDIENTE'
      : (r.categoria === 'reunion' && r.aprobacion === 'rechazada' ? ' · RECHAZADA' : '')
    const base = `${r.fecha_formateada}  —  ${r.titulo}${estado}`

    let ids = []
    let nombres = []
    if (Array.isArray(r.idsGruposCoordinados)) {
      ids = r.idsGruposCoordinados
      nombres = r.nombresGruposCoordinados || []
    } else if (r.todosLosGrupos) {
      ids = grupos.value.map(g => g.id)
      nombres = grupos.value.map(g => (g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre))
    } else {
      ids = r.idsGrupos || []
      nombres = r.nombresGrupos || []
    }

    ids.forEach((idGrupo, i) => {
      ops.push({
        key: `${r.id}|${idGrupo}`,
        idEvento: r.id,
        idsGrupos: [idGrupo],
        label: `${base} (${nombres[i] ?? nombreGrupo(idGrupo)})`,
      })
    })
  }
  return ops
})

const opcionSeleccionada = computed(() =>
  opcionesReunion.value.find(o => o.key === reunionSeleccionada.value) ?? null
)

// idEvento derivado de la opción elegida (para cargar árbitros del evento).
const idEventoSeleccionado = computed(() => opcionSeleccionada.value?.idEvento ?? null)

const reunionActual = computed(() =>
  arrReuniones.value.find(r => String(r.id) === String(idEventoSeleccionado.value)) ?? null
)

// Ids de grupos que se habilitarían para el examen de la opción elegida:
// solo el grupo de la opción (o todos, si la reunión es "todos los grupos").
const idsGruposExamenReunion = computed(() => opcionSeleccionada.value?.idsGrupos ?? [])

// La reunión seleccionada tiene fecha pasada => no se puede habilitar examen.
const reunionEsPasada = computed(() =>
  reunionActual.value ? esFechaPasada(reunionActual.value.fecha_evento) : false
)

// El coordinador puede modificar una reunión si es futura, es de categoría "reunion"
// y está dirigida solo a grupos que él coordina (no "todos los grupos" ni grupos ajenos).
const reunionAprobada = computed(() => {
  const r = reunionActual.value
  return !r || r.categoria !== 'reunion' || !r.aprobacion || r.aprobacion === 'aprobada'
})

const motivoNoEliminable = computed(() => {
  const r = reunionActual.value
  if (!r) return 'Elegí una reunión'
  if (r.categoria !== 'reunion') return 'Solo se pueden gestionar reuniones'
  if (r.todosLosGrupos) return 'Es una reunión para todos los grupos: solo la puede gestionar la administración'
  const propios = misGrupos.value.map(g => Number(g.id))
  const idsReunion = (r.idsGrupos || []).map(Number)
  if (!idsReunion.length) return 'La reunión no tiene grupos asignados'
  const ajenos = idsReunion.filter(id => !propios.includes(id))
  if (ajenos.length) {
    return `La reunión incluye grupos que no coordinás (${ajenos.map(nombreGrupo).join(', ')}): solo la puede gestionar la administración`
  }
  return ''
})

const motivoNoGestionable = computed(() => {
  if (motivoNoEliminable.value) return motivoNoEliminable.value
  const r = reunionActual.value
  if (r.aprobacion !== 'rechazada' && !esFechaFutura(r.fecha_evento)) return 'Solo se pueden modificar reuniones futuras'
  return ''
})

const puedeModificarReunion = computed(() => !motivoNoGestionable.value)
const puedeEliminarReunion = computed(() => !motivoNoEliminable.value)

const eliminandoReunion = ref(false)

const confirmarEliminarReunion = () => {
  const r = reunionActual.value
  if (!r) return
  notificar({
    titulo: '¿Eliminar reunión?',
    mensaje: `${r.fecha_formateada} · ${r.titulo}. Los árbitros del grupo dejarán de verla. Esta acción no se puede deshacer.`,
    tipo: 'danger',
    alConfirmar: eliminarReunion
  })
}

const eliminarReunion = async () => {
  const r = reunionActual.value
  if (!r) return
  eliminandoReunion.value = true
  try {
    const res = await api.post({ entity: 'eventos', action: 'eliminarEvento', payload: { id: r.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo eliminar la reunión')
    reunionSeleccionada.value = ''
    await obtenerReuniones()
    await onReunionSeleccionada()
    toast({ titulo: 'Eliminada', mensaje: 'La reunión fue eliminada.', tipo: 'success' })
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e?.message || 'No se pudo eliminar la reunión', tipo: 'danger' })
  } finally {
    eliminandoReunion.value = false
  }
}

const asistenciaGrupoExamen = computed(() => {
  const ids = idsGruposExamenReunion.value.map(Number)
  const r = { presentes: 0, ausentes: 0, sinRegistro: 0 }
  for (const a of arbitrosReunion.value) {
    if (ids.length && !ids.includes(Number(a.id_grupo))) continue
    const v = asistencias[a.id]
    if      (v === 'presente') r.presentes++
    else if (v === 'ausente')  r.ausentes++
    else                       r.sinRegistro++
  }
  return r
})

const tituloBotonHabilitar = computed(() => {
  if (!idsGruposExamenReunion.value.length) return 'Esta reunión no tiene grupos asociados'
  if (examenHabilitado.value) return 'El examen ya está habilitado'
  if (!asistenciaGrupoExamen.value.presentes) return 'Marcá presentes y ausentes antes de habilitar el examen'
  return 'Programar y habilitar el examen para los presentes'
})

const preguntasDisponiblesExamen = computed(() =>
  reglasDisponibles.value
    .filter(r => formExamen.reglas.includes(r.codigo))
    .reduce((total, r) => total + r.cantidad, 0)
)

const programacionValida = computed(() =>
  formExamen.reglas.length > 0 &&
  formExamen.cantidadPreguntas >= 1 &&
  formExamen.cantidadPreguntas <= Math.min(100, preguntasDisponiblesExamen.value) &&
  formExamen.tiempoLimiteMin >= 1 &&
  formExamen.tiempoLimiteMin <= 180
)

const seleccionarTodasLasReglas = (todas) => {
  formExamen.reglas = todas ? reglasDisponibles.value.map(r => r.codigo) : []
}

const cargarProgramacionExamen = async () => {
  examenHabilitado.value = false
  if (!idEventoSeleccionado.value || !idsGruposExamenReunion.value.length) return
  try {
    const res = await api.get({
      entity: 'examenes_habilitaciones',
      action: 'obtenerProgramacion',
      payload: { idEvento: Number(idEventoSeleccionado.value), idsGrupos: idsGruposExamenReunion.value }
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo obtener la programación del examen')
    const p = res.payload
    if (!p) return
    examenHabilitado.value = !!p.habilitado
    formExamen.cantidadPreguntas = p.cantidadPreguntas
    formExamen.tiempoLimiteMin = p.tiempoLimiteMin
    formExamen.reglas = (p.reglas || []).map(Number)
  } catch (e) { console.error('cargarProgramacionExamen:', e) }
}

async function abrirModalExamen() {
  if (!asistenciaGrupoExamen.value.presentes) {
    toast({ tipo: 'danger', mensaje: 'Marcá presentes y ausentes antes de habilitar el examen' })
    return
  }
  mostrarModalExamen.value = true
  if (reglasDisponibles.value.length) return
  cargandoReglas.value = true
  try {
    const res = await api.get({ entity: 'examenes_habilitaciones', action: 'obtenerReglasExamen' })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar las reglas')
    reglasDisponibles.value = (res?.payload?.reglas || []).map(r => ({ codigo: Number(r.codigo), cantidad: Number(r.cantidad) }))
    const codigos = reglasDisponibles.value.map(r => r.codigo)
    formExamen.reglas = formExamen.reglas.filter(c => codigos.includes(c))
  } catch (e) {
    console.error('obtenerReglasExamen:', e)
    toast({ tipo: 'danger', mensaje: e?.message || 'No se pudieron cargar las reglas' })
  } finally {
    cargandoReglas.value = false
  }
}

async function habilitarExamenReunion() {
  const r = reunionActual.value
  if (!r || !idsGruposExamenReunion.value.length || !programacionValida.value) return
  if (reunionEsPasada.value) {
    toast({ tipo: 'danger', mensaje: 'No se puede habilitar el examen: la reunión ya pasó' })
    return
  }
  habilitandoExamen.value = true
  try {
    const res = await api.post({
      entity: 'examenes_habilitaciones',
      action: 'guardarHabilitacion',
      payload: {
        idEvento: r.id,
        idsGrupos: idsGruposExamenReunion.value,
        arrArbitros: [],
        sumar: true,
        programacion: {
          cantidadPreguntas: formExamen.cantidadPreguntas,
          tiempoLimiteMin: formExamen.tiempoLimiteMin,
          reglas: formExamen.reglas
        }
      }
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo habilitar el examen')
    toast({ tipo: 'success', mensaje: 'Examen habilitado para los árbitros presentes' })
    examenHabilitado.value = true
    mostrarModalExamen.value = false
  } catch (e) {
    console.error('habilitarExamenReunion:', e)
    toast({ tipo: 'danger', mensaje: e?.message || 'No se pudo habilitar el examen' })
  } finally {
    habilitandoExamen.value = false
  }
}

async function deshabilitarExamenReunion() {
  const r = reunionActual.value
  if (!r || !idsGruposExamenReunion.value.length) return
  deshabilitandoExamen.value = true
  try {
    const res = await api.post({
      entity: 'examenes_habilitaciones',
      action: 'deshabilitarHabilitacion',
      payload: {
        idEvento: r.id,
        idsGrupos: idsGruposExamenReunion.value
      }
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo deshabilitar el examen')
    toast({ tipo: 'success', mensaje: 'Examen deshabilitado para la reunión' })
    examenHabilitado.value = false
  } catch (e) {
    console.error('deshabilitarExamenReunion:', e)
    toast({ tipo: 'danger', mensaje: e?.message || 'No se pudo deshabilitar el examen' })
  } finally {
    deshabilitandoExamen.value = false
  }
}

const resumenReunionActual = computed(() => {
  const r = { presentes: 0, ausentes: 0, sinRegistro: 0 }
  for (const a of arbitrosReunion.value) {
    const v = asistencias[a.id]
    if      (v === 'presente') r.presentes++
    else if (v === 'ausente')  r.ausentes++
    else                       r.sinRegistro++
  }
  return r
})

const resumenAsistencia = (id) =>
  asistenciasGlobales.value[id] ?? { presentes: 0, ausentes: 0, total: 0 }

// ─── Computeds: modal historial ───────────────────────────────────
const reunionesDelArbitroDetalle = computed(() => {
  if (!reunionesArbitroSeleccionado.value.length) return []
  const map = {}
  reunionesArbitroSeleccionado.value.forEach(row => {
    if (row.tipo !== CATEGORIA) return
    const key = row.id_evento
    if (!map[key]) {
      map[key] = {
        id:            row.id,
        id_evento:     row.id_evento,
        id_arbitro:    row.id_arbitro,
        tipo:          row.tipo,
        asistencia:    row.asistencia,
        fecha_reunion: row.fecha_examen,
        titulo:        row.titulo,
        _ts:           row.ts,
        detalles:      [],
      }
    }
  })
  return sortPorFecha(Object.values(map))
})

const añosDetalleArbitro = computed(() => {
  const set = new Set()
  for (const ex of reunionesDelArbitroDetalle.value) {
    const año = añoDeFecha(ex.fecha_reunion)
    if (año) set.add(año)
  }
  return conAnioActual(set)
})

const reunionesFiltradosDetalle = computed(() =>
  !filtroAñoDetalle.value
    ? reunionesDelArbitroDetalle.value
    : reunionesDelArbitroDetalle.value.filter(ex => añoDeFecha(ex.fecha_reunion) === filtroAñoDetalle.value)
)

const resumenDetalle = computed(() => {
  const r = { presentes: 0, ausentes: 0, sinInformacion: 0 }
  for (const ex of reunionesFiltradosDetalle.value) {
    const estado = normalizarAsistencia(ex.asistencia)
    if      (estado === 'presente') r.presentes++
    else if (estado === 'ausente')  r.ausentes++
    else                            r.sinInformacion++
  }
  return r
})

// ─── Computeds: filtrado y paginación ────────────────────────────
const arbitrosMostrados = computed(() =>
  modoReunion.value ? arbitrosReunion.value : arbitros.value
)

const arbitrosFiltrados = computed(() => {
  const { apellido, nombre, grupo, subgrupo, asistencia } = filtros
  return arbitrosMostrados.value.filter(a => {
    if (apellido && !normalizarTexto(a.apellido).includes(normalizarTexto(apellido))) return false
    if (nombre   && !normalizarTexto(a.nombre).includes(normalizarTexto(nombre)))     return false
    if (grupo    && (a.nombre_grupo || a.grupo) !== grupo)                            return false
    if (subgrupo && (a.subgrupo ?? '') !== subgrupo)                                  return false
    if (modoReunion.value && asistencia) {
      const estadoActual = asistencias[a.id] || ''
      if (asistencia === 'presente'     && estadoActual !== 'presente')                                    return false
      if (asistencia === 'ausente'      && estadoActual !== 'ausente')                                     return false
      if (asistencia === 'sin_registro' && (estadoActual === 'presente' || estadoActual === 'ausente'))    return false
    }
    return true
  })
})

const arbitrosOrdenados = computed(() =>
  [...arbitrosFiltrados.value].sort((a, b) =>
    normalizarTexto(a.apellido).localeCompare(normalizarTexto(b.apellido), 'es')
  )
)

const totalFiltrados    = computed(() => arbitrosOrdenados.value.length)
const totalPaginas      = computed(() => Math.ceil(arbitrosOrdenados.value.length / registrosPorPagina) || 1)
const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return arbitrosOrdenados.value.slice(inicio, inicio + registrosPorPagina)
})

// ─── Cargas ──────────────────────────────────────────────────────
const obtenerReuniones = async () => {
  try {
    const res = await api.get({ entity: 'reuniones', action: 'obtenerReuniones' })
    if ((res.ok || res.success) && res.payload) {
      const vistos = new Set()
      arrReuniones.value = res.payload.filter(r => {
        if (r.categoria !== 'reunion' || vistos.has(String(r.id))) return false
        vistos.add(String(r.id))
        return true
      })
    }
  } catch (e) { console.error('obtenerReuniones:', e) }
}

const obtenerGrupos = async () => {
  try {
    const res = await api.get({ entity: 'grupos', action: 'obtenerGrupos' })
    const lista = res?.payload ?? res ?? []
    grupos.value = Array.isArray(lista) ? lista : []
  } catch (e) { console.error('obtenerGrupos:', e) }
}

// ← ÚNICO CAMBIO vs. admin: obtenerArbitrosFiltradosPorGrupo
const cargarArbitros = async () => {
  try {
    const res = await api.get({
      entity: 'arbitros',
      action: 'obtenerArbitrosFiltradosPorGrupo',
      payload: { soloActivos: soloActivos.value }
    })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (e) { console.error('cargarArbitros:', e) }
}

// Un solo request con los totales de presentes/ausentes por árbitro
// (antes se pedía obtenerArbitrosReunion una vez por cada reunión).
const cargarAsistenciasGlobales = async () => {
  if (!arbitros.value.length) return
  const mapa = {}
  arbitros.value.forEach(a => { mapa[a.id] = { presentes: 0, ausentes: 0, total: 0 } })
  try {
    const res = await api.get({ entity: 'reuniones', action: 'obtenerResumenAsistenciasReuniones', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo obtener el resumen de asistencias')
    for (const r of (res.payload || [])) {
      const presentes = Number(r.presentes) || 0
      const ausentes  = Number(r.ausentes) || 0
      mapa[r.id_arbitro] = { presentes, ausentes, total: presentes + ausentes }
    }
    asistenciasGlobales.value = mapa
  } catch (e) { console.error('Error cargando asistencias globales:', e) }
}

// ─── Cambio de reunión ────────────────────────────────────────────
const limpiarEstadoReunion = () => {
  Object.keys(asistencias).forEach(k => delete asistencias[k])
  Object.keys(guardando).forEach(k => delete guardando[k])
  Object.keys(guardadoOk).forEach(k => delete guardadoOk[k])
  Object.keys(descargandoPdf).forEach(k => delete descargandoPdf[k])
  registrosExistentes.value = {}
  arbitrosReunion.value = []
  examenes.value = {}
  examenHabilitado.value = false
  mostrarModalExamen.value = false
}

const onReunionSeleccionada = async () => {
  limpiarEstadoReunion()
  paginaActual.value = 1
  limpiarFiltros()
  mostrarFiltrosMobile.value = false
  if (!reunionSeleccionada.value) {
    cargandoInicial.value = true
    await cargarAsistenciasGlobales()
    cargandoInicial.value = false
    return
  }
  cargandoArbitros.value = true
  try {
    const resArb = await api.get({
      entity: 'reuniones',
      action: 'obtenerArbitrosReunion',
      payload: { idEvento: Number(idEventoSeleccionado.value), soloActivos: soloActivos.value }
    })
    if ((resArb.ok || resArb.success) && resArb.payload) {
      arbitrosReunion.value = resArb.payload
      resArb.payload.forEach(a => {
        const asistencia = normalizarAsistencia(a.asistencia)
        if (asistencia) asistencias[a.id] = asistencia
      })
    }
    await Promise.all([cargarExamenes(), cargarProgramacionExamen()])
  } catch (e) {
    console.error('onReunionSeleccionada:', e)
    toast({ titulo: 'Error', mensaje: 'No se pudieron cargar los datos de la reunión.', tipo: 'danger' })
  } finally {
    cargandoArbitros.value = false
  }
}

const cargarExamenes = async () => {
  const resExamenes = await api.get({
    entity: 'examen_online',
    action: 'obtenerExamenesReunion',
    payload: { idEvento: Number(idEventoSeleccionado.value) }
  })
  const mapa = {}
  if (resExamenes.ok && Array.isArray(resExamenes.payload)) {
    resExamenes.payload.forEach(e => { mapa[e.id_arbitro] = e })
  }
  examenes.value = mapa
}

const descargarPdfTeorico = async (a) => {
  descargandoPdf[a.id] = true
  try {
    await api.getFile({
      entity: 'examen_online',
      action: 'descargarPdfExamen',
      payload: { idEvento: Number(idEventoSeleccionado.value), idArbitro: a.id }
    }, `teorico_${a.apellido}_${a.nombre}.pdf`)
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e?.message || 'No se pudo descargar el PDF', tipo: 'danger' })
  } finally {
    delete descargandoPdf[a.id]
  }
}

const guardarAsistencia = async (a) => {
  const estado = asistencias[a.id]
  if (!estado) return
  if (!reunionAprobada.value) {
    delete asistencias[a.id]
    toast({ titulo: 'Reunión no aprobada', mensaje: 'La reunión todavía no fue aprobada: no se puede tomar asistencia.', tipo: 'danger' })
    return
  }
  guardando[a.id] = true
  delete guardadoOk[a.id]
  try {
    const res = await api.post({
      entity: 'reuniones',
      action: 'registrarAsistenciaArbitro',
      payload: { idEvento: Number(idEventoSeleccionado.value), idArbitro: a.id, tipo: estado },
    })
    if (res.payload) {
      guardadoOk[a.id] = true
      setTimeout(() => { delete guardadoOk[a.id] }, 2500)
    } else {
      const prev = registrosExistentes.value[a.id]
      if (prev) asistencias[a.id] = prev.estado == 2 ? 'ausente' : 'presente'
      else delete asistencias[a.id]
      toast({ titulo: 'Error', mensaje: res.message || 'No se pudo guardar la asistencia.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error fatal', mensaje: 'Error de conexión con el servidor.', tipo: 'danger' })
  } finally {
    guardando[a.id] = false
  }
}

// ─── Acciones ────────────────────────────────────────────────────
const verDetalleArbitro = async (a) => {
  arbitroSeleccionado.value = { id: a.id, apellido: a.apellido, nombre: a.nombre }
  filtroAñoDetalle.value = anioActual()
  mostrarModalDetalle.value = true
  reunionesArbitroSeleccionado.value = []
  cargandoHistorial.value = true
  try {
    const res = await api.get({
      entity: 'reuniones',
      action: 'obtenerAsistenciasArbitro',
      payload: { idArbitro: a.id }
    })
    if ((res.ok || res.success) && res.payload)
      reunionesArbitroSeleccionado.value = res.payload
  } catch (e) { console.error('Error al cargar historial del árbitro:', e) }
  finally { cargandoHistorial.value = false }
}

const recargar = async () => {
  if (modoReunion.value) {
    await onReunionSeleccionada()
  } else {
    cargandoInicial.value = true
    await Promise.all([obtenerReuniones(), cargarArbitros()])
    await cargarAsistenciasGlobales()
    cargandoInicial.value = false
  }
}

// ─── Nueva reunión (reutiliza eventos/guardarEvento de Gestión de Eventos) ─
const mostrarModalNueva  = ref(false)
const modoEdicionReunion = ref(false)
const idReunionEditada   = ref(null)
const procesandoReunion  = ref(false)
const cargandoMisGrupos  = ref(false)
const misGrupos          = ref([]) // grupos que coordina el usuario
const gruposReunion      = ref([]) // ids de grupos destinatarios elegidos

const formReunionBase = () => ({ titulo: '', descripcion: '', fecha_evento: '' })
const formReunion = reactive(formReunionBase())

const eventosAgenda = ref([])
const eventosMismoDia = computed(() => eventosAgenda.value.filter(e =>
  e.fecha_evento === formReunion.fecha_evento &&
  e.categoria !== 'recordatorio' &&
  Number(e.id) !== Number(idReunionEditada.value)
))

const cargarMisGrupos = async () => {
  cargandoMisGrupos.value = true
  try {
    const res = await api.get({ entity: 'coordinadores', action: 'obtenerGruposCoordinados' })
    if ((res.ok || res.success) && Array.isArray(res.payload)) misGrupos.value = res.payload
  } catch (e) {
    console.error('cargarMisGrupos:', e)
  } finally {
    cargandoMisGrupos.value = false
  }
}

const abrirModalEditarReunion = () => {
  const r = reunionActual.value
  if (!r) return
  modoEdicionReunion.value = true
  idReunionEditada.value = r.id
  Object.assign(formReunion, {
    titulo: r.titulo || '',
    descripcion: r.descripcion || '',
    fecha_evento: aISO(r.fecha_evento),
  })
  gruposReunion.value = (r.idsGrupos || []).map(Number)
  mostrarModalNueva.value = true
}

const abrirModalNuevaReunion = async () => {
  modoEdicionReunion.value = false
  idReunionEditada.value = null
  Object.assign(formReunion, formReunionBase())
  mostrarModalNueva.value = true
  if (!misGrupos.value.length) await cargarMisGrupos()
  // Por defecto, todos los grupos a cargo quedan marcados
  gruposReunion.value = misGrupos.value.map(g => Number(g.id))
}

const confirmarGuardadoReunion = () => {
  if (!gruposReunion.value.length) {
    toast({ titulo: 'Faltan grupos', mensaje: 'Seleccioná al menos un grupo destinatario.', tipo: 'danger' })
    return
  }
  if (modoEdicionReunion.value && formReunion.fecha_evento <= hoyStr()) {
    toast({ titulo: 'Fecha inválida', mensaje: 'La reunión modificada tiene que seguir siendo futura.', tipo: 'danger' })
    return
  }
  notificar({
    titulo: modoEdicionReunion.value ? '¿Guardar cambios?' : '¿Publicar?',
    mensaje: modoEdicionReunion.value
      ? 'Se modificarán los datos de la reunión y quedará pendiente de aprobación hasta que la revise la administración.'
      : 'La reunión quedará pendiente de aprobación. Cuando la administración la apruebe, los árbitros del grupo la van a ver.',
    tipo: 'success',
    alConfirmar: guardarReunion
  })
}

const guardarReunion = async () => {
  procesandoReunion.value = true
  try {
    const esEdicion = modoEdicionReunion.value
    const res = await api.post({
      entity: 'eventos',
      action: esEdicion ? 'editarEvento' : 'guardarEvento',
      payload: {
        id: esEdicion ? idReunionEditada.value : null,
        titulo: formReunion.titulo,
        descripcion: formReunion.descripcion,
        fecha_evento: formReunion.fecha_evento,
        categoria: 'reunion',
        todosLosGrupos: false,
        nombresGrupos: [],
        idsGrupos: gruposReunion.value,
      }
    })
    if (res.ok) {
      mostrarModalNueva.value = false
      await obtenerReuniones()
      // Si al modificar cambió el grupo, la opción elegida puede haber desaparecido del select
      if (reunionSeleccionada.value && !opcionSeleccionada.value) {
        reunionSeleccionada.value = ''
        await onReunionSeleccionada()
      }
      const pendiente = res.payload?.aprobacion === 'pendiente'
      toast({
        titulo: 'Éxito',
        mensaje: pendiente
          ? (esEdicion ? 'Los cambios quedaron pendientes de aprobación.' : 'La reunión quedó pendiente de aprobación.')
          : (esEdicion ? 'La reunión se modificó correctamente.' : 'La reunión se publicó correctamente.'),
        tipo: 'success'
      })
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    procesandoReunion.value = false
  }
}

// ─── Misc ────────────────────────────────────────────────────────
const limpiarFiltros = () => Object.keys(filtros).forEach(k => (filtros[k] = ''))

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  if (window.innerWidth <= MOBILE_BREAKPOINT)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
}

watch(filtros,      () => { paginaActual.value = 1 }, { deep: true })
watch(modoReunion,  () => { paginaActual.value = 1 })
watch(totalPaginas, (n) => { if (paginaActual.value > n) paginaActual.value = n })

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
  await Promise.all([obtenerReuniones(), cargarArbitros(), obtenerGrupos(), cargarMisGrupos()])
  await cargarAsistenciasGlobales()
  cargandoInicial.value = false
})
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.4s; }
.min-w-0 { min-width: 0; }
.select-reunion { width: 100%; min-width: 0; font-size: 1rem; }
@media (min-width: 768px) {
  .select-reunion { flex: 0 1 300px; max-width: 300px; font-size: 0.875rem; }
}
@media (min-width: 1400px) {
  .select-reunion { flex-basis: 380px; max-width: 380px; }
}
.tabla-container { overflow-x: auto; }
.tabla-fija { border-collapse: separate; border-spacing: 0; }
.tabla-fija th, .tabla-fija td { border-left: none !important; border-right: none !important; }
.col-fija { position: sticky; background-color: inherit; z-index: 10; }
.tabla-fija thead .col-fija { background-color: #f8f9fa; z-index: 12; }
.tabla-fija tbody .col-fija { background-color: #ffffff; }
.col-id       { left: 0;     min-width: 60px;  }
.col-acciones { left: 60px;  min-width: 90px;  }
.col-apellido { left: 150px; min-width: 150px; }
.col-nombre   { left: 300px; min-width: 150px; }
.col-nombre::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to right, rgba(0,0,0,0.1), transparent); }
.fila-presente           { background-color: #f0fdf4 !important; }
.fila-presente .col-fija { background-color: #f0fdf4 !important; }
.fila-ausente            { background-color: #f9fafb !important; }
.fila-ausente  .col-fija { background-color: #f9fafb !important; }
.radio-presente { accent-color: #198754; }
.radio-ausente  { accent-color: #6c757d; }
.estado-indicator { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; }
.toggle-asist { cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease; user-select: none; font-size: 0.85rem; }
.toggle-asist:active { opacity: 0.82; }
.texto-creacion { font-size: 0.75rem; }
.control-encabezado { height: 40px; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }
</style>
