<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 border-bottom">
          <div class="row g-3 align-items-center">
            <div class="col-12 col-xl-auto">
              <div class="border-start border-danger border-5 ps-3">
                <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
                  <i class="bi bi-people-fill me-1"></i> Gestión de Reuniones
                </h4>
                <span class="text-muted small d-block mt-1">
                  <template v-if="modoReunion && !cargandoArbitros">
                    {{ reunionActual?.titulo }}
                    <span v-if="reunionActual?.nombreGrupo" class="fst-italic"> · {{ reunionActual.nombreGrupo }}</span>
                    — {{ arbitrosReunion.length }} árbitros
                    <span v-if="resumenReunionActual.presentes"   class="ms-1 badge rounded-pill bg-success">✓ {{ resumenReunionActual.presentes }}</span>
                    <span v-if="resumenReunionActual.ausentes"    class="ms-1 badge rounded-pill bg-secondary">✗ {{ resumenReunionActual.ausentes }}</span>
                    <span v-if="resumenReunionActual.sinRegistro" class="ms-1 badge rounded-pill bg-light text-muted border">— {{ resumenReunionActual.sinRegistro }}</span>
                  </template>
                  <template v-else>Reuniones Mensuales — Todos los grupos · {{ totalFiltrados }} árbitros</template>
                </span>
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
                    <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2 flex-shrink-0 control-encabezado" aria-label="Mostrar filtros">
                      <span class="material-icons fs-6">filter_alt</span>
                    </button>
                    <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2 flex-shrink-0 control-encabezado" aria-label="Limpiar filtros">
                      <span class="material-icons text-dark fs-6">filter_alt_off</span>
                      <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  <th v-else class="py-3 text-uppercase text-muted" style="min-width: 270px;">
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
                  <td v-else class="p-2 border-bottom border-2">
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
                  <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-danger spinner-border-sm" role="status"></div>
                    <span class="ms-2 fw-bold text-muted">Cargando datos...</span>
                  </td>
                </tr>
                <tr v-else-if="!arbitrosPaginados.length">
                  <td colspan="7" class="text-center py-4 text-muted">
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

                  <td v-else>
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

      <!-- ¿Quién dio la reunión? -->
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">
        <div class="card-header bg-white py-3 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h5 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-person-video3 me-1"></i> ¿Quién dio la reunión?
            </h5>
            <span class="text-muted small d-block mt-1">
              {{ mesDisertantes ? nombreMes(mesDisertantes) : 'Todos los meses' }} {{ anioDisertantes }} · {{ filasDisertantesFiltradas.length }} reuniones
              <span v-if="sinAsignarDisertantes" class="ms-1 badge rounded-pill bg-warning text-dark">{{ sinAsignarDisertantes }} sin asignar</span>
            </span>
          </div>

          <div class="d-flex gap-2 align-items-stretch">
            <select
              v-model="mesDisertantes"
              class="form-select shadow-sm border-secondary-subtle fw-semibold select-mes"
              :disabled="cargandoInicial || cargandoDisertantes"
              aria-label="Filtrar por mes"
            >
              <option value="">Todos los meses</option>
              <option v-for="m in MESES_DISERTANTES" :key="m.valor" :value="m.valor">{{ m.nombre }}</option>
            </select>
            <select
              v-model="anioDisertantes"
              class="form-select shadow-sm border-secondary-subtle fw-semibold select-anio"
              :disabled="cargandoInicial || cargandoDisertantes"
              aria-label="Filtrar por año"
            >
              <option v-for="a in aniosDisertantes" :key="a" :value="a">{{ a }}</option>
            </select>
            <button
              @click="exportarExcelDisertantes"
              class="btn btn-success shadow-sm py-2 d-flex align-items-center justify-content-center gap-2 text-white border-0 flex-shrink-0"
              :disabled="cargandoDisertantes || !filasDisertantesFiltradas.length"
            >
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargandoInicial || cargandoDisertantes" class="text-center py-5">
            <div class="spinner-border text-danger spinner-border-sm" role="status"></div>
            <span class="ms-2 fw-bold text-muted">Cargando reuniones...</span>
          </div>

          <div v-else-if="!filasDisertantesFiltradas.length" class="text-center py-5 text-muted">
            <span class="material-icons opacity-50 d-block mb-2" style="font-size: 36px;">event_busy</span>
            <span class="fw-bold small">No hay reuniones{{ mesDisertantes ? ' en el mes elegido' : '' }}.</span>
          </div>

          <template v-else>
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0" style="font-size: 0.78rem;">
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
import ExcelJS from 'exceljs'
import { etiquetaCreadorReunion, textoCreacionReunion } from '@/composables/useCreadorReunion'

useHead({
  title: 'Reuniones | AAAB',
  meta: [{ name: 'description', content: 'Gestión de asistencia a reuniones de árbitros AAAB.' }],
})

// ─── Constantes ───────────────────────────────────────────────────
const CATEGORIA         = 'reunion'
const MOBILE_BREAKPOINT = 768

// ─── Helpers ─────────────────────────────────────────────────────
const normalizarTexto = (v) =>
  String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const formatFecha  = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha   = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''
const sortPorFecha = (lista) => [...lista].sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0))


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

// ─── Estado ──────────────────────────────────────────────────────
const arrReuniones         = ref([])
const arbitros             = ref([])
const arbitrosReunion      = ref([])
const grupos               = ref([])

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

const cargandoHistorial            = ref(false)
const reunionesArbitroSeleccionado = ref([])
const asistenciasGlobales          = ref({})

// ─── Grupos (fuente para filtros y desglose) ──────────────────────
const collator = new Intl.Collator('es', { sensitivity: 'base' })

const GRUPOS = computed(() => {
  const vistos = []
  for (const g of grupos.value) {
    const nombre = String(g.nombre || '').trim()
    if (nombre && !vistos.includes(nombre)) vistos.push(nombre)
  }
  return vistos.sort((a, b) => collator.compare(a, b))
})

const SUBGRUPOS = computed(() => {
  const vistos = []
  for (const g of grupos.value) {
    const sub = String(g.subgrupo || '').trim()
    if (sub && !vistos.includes(sub)) vistos.push(sub)
  }
  return vistos.sort((a, b) => collator.compare(a, b))
})

const nombreGrupo = (idGrupo) => {
  const g = grupos.value.find(x => Number(x.id) === Number(idGrupo))
  if (!g) return '—'
  return g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre
}

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

// ─── Computeds: modo ─────────────────────────────────────────────
const modoReunion   = computed(() => !!reunionSeleccionada.value)
const reunionActual = computed(() =>
  opcionesReunion.value.find(o => o.key === reunionSeleccionada.value) ?? null
)


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
// En modo reunión, los árbitros ya vienen filtrados al grupo de la fila
// desglosada seleccionada (ver onReunionSeleccionada).
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
    if ((res.ok || res.success) && res.payload)
      arrReuniones.value = res.payload.filter(r => r.categoria === 'reunion')
  } catch (e) { console.error('obtenerReuniones:', e) }
}

const obtenerGrupos = async () => {
  try {
    const res = await api.get({ entity: 'grupos', action: 'obtenerGrupos' })
    const lista = res?.payload ?? res ?? []
    grupos.value = Array.isArray(lista) ? lista : []
  } catch (e) { console.error('obtenerGrupos:', e) }
}

// Admin ve TODOS los árbitros (no solo su grupo).
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
  registrosExistentes.value = {}
  arbitrosReunion.value = []
}

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
  const opcion = reunionActual.value
  cargandoArbitros.value = true
  try {
    const resArb = await api.get({
      entity: 'reuniones',
      action: 'obtenerArbitrosReunion',
      payload: { idEvento: Number(opcion.idEvento), soloActivos: soloActivos.value }
    })
    if ((resArb.ok || resArb.success) && resArb.payload) {
      // Desglose por grupo: solo los árbitros del grupo de esta fila.
      arbitrosReunion.value = filtrarPorGrupoOpcion(resArb.payload, opcion)
      arbitrosReunion.value.forEach(a => {
        const asistencia = normalizarAsistencia(a.asistencia)
        if (asistencia) asistencias[a.id] = asistencia
      })
    }
  } catch (e) {
    console.error('onReunionSeleccionada:', e)
    toast({ titulo: 'Error', mensaje: 'No se pudieron cargar los datos de la reunión.', tipo: 'danger' })
  } finally {
    cargandoArbitros.value = false
  }
}

const guardarAsistencia = async (a) => {
  const estado = asistencias[a.id]
  if (!estado) return
  guardando[a.id] = true
  delete guardadoOk[a.id]
  try {
    const res = await api.post({
      entity: 'reuniones',
      action: 'registrarAsistenciaArbitro',
      payload: { idEvento: Number(reunionActual.value?.idEvento), idArbitro: a.id, tipo: estado },
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
        : api.get({ entity: 'arbitros', action: 'getArbitrosBasico', payload: { soloActivos: false } }),
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
  const wb = new ExcelJS.Workbook()
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
  await Promise.all([obtenerReuniones(), cargarArbitros(), obtenerGrupos()])
  cargarDisertantes()
  await cargarAsistenciasGlobales()
  cargandoInicial.value = false
})
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.4s; }
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
.texto-creacion { font-size: 0.75rem; }
.control-encabezado { height: 40px; }
.select-reunion { width: 100%; min-width: 0; font-size: 1rem; }
@media (min-width: 768px) {
  .select-reunion { flex: 0 1 300px; max-width: 300px; font-size: 0.875rem; }
}
@media (min-width: 1400px) {
  .select-reunion { flex-basis: 380px; max-width: 380px; }
}
.select-mes { flex: 1 1 auto; min-width: 0; font-size: 1rem; }
.select-anio { flex: 0 0 100px; font-size: 1rem; }
@media (min-width: 576px) {
  .select-mes { flex: 0 0 170px; font-size: 0.875rem; }
  .select-anio { font-size: 0.875rem; }
}
.select-disertante { width: 190px; max-width: 190px; font-size: 0.75rem; }
.radio-presente { accent-color: #198754; }
.radio-ausente  { accent-color: #6c757d; }
.estado-indicator { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; }
.toggle-asist { cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease; user-select: none; font-size: 0.85rem; }
.toggle-asist:active { opacity: 0.82; }
</style>
