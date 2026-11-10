<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-journal-check me-1"></i> Exámenes del Curso
            </h4>
            <span class="text-muted small d-block mt-1">{{ anio }} · los teóricos se programan desde Clases y Asistencia</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <select v-model="filtroCurso" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 150px;" aria-label="Curso">
              <option value="">CURSO</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.corta.toUpperCase() }}</option>
            </select>
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 110px;" aria-label="Año">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <button @click="cargarExamenes" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
          </div>
        </div>

        <!-- PESTAÑAS -->
        <div class="px-3 pt-3 bg-white">
          <ul class="nav nav-pills flex-nowrap overflow-auto gap-2 pb-2 pestanas-examenes" role="tablist">
            <li v-for="p in PESTANAS" :key="p.clave" class="nav-item flex-shrink-0" role="presentation">
              <button type="button" class="nav-link fw-bold d-flex align-items-center gap-2" :class="{ active: pestana === p.clave }" role="tab" :aria-selected="pestana === p.clave" @click="pestana = p.clave">
                <i :class="['bi', p.icono]"></i> {{ p.etiqueta }}
                <span v-if="p.clave !== 'planilla'" class="badge rounded-pill" :class="pestana === p.clave ? 'bg-white text-danger' : 'bg-secondary'">{{ grupos[p.clave].length }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="card-body bg-white" :class="pestana === 'planilla' && !cargando ? 'p-0 border-top' : 'p-3'">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando exámenes...</p></div>

          <!-- EXÁMENES DE LA PESTAÑA -->
          <template v-else-if="pestana !== 'planilla'">
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <p class="small text-muted mb-0">{{ AYUDA_PESTANA[pestana] }}</p>
              <button v-if="pestana === 'practico'" @click="abrirNuevo('practico')" class="btn btn-danger btn-sm fw-bold shadow-sm flex-shrink-0">
                <i class="bi bi-plus-lg me-1"></i> Nuevo práctico
              </button>
            </div>

            <div v-if="!grupos[pestana].length" class="estado-vacio text-center py-5 text-muted">
              <i :class="['bi', PESTANAS.find(p => p.clave === pestana).icono, 'fs-1 d-block mb-2 opacity-50']"></i>
              <span class="fw-bold">{{ VACIO_PESTANA[pestana] }}</span>
            </div>

            <div v-else class="row g-3">
              <div v-for="g in grupos[pestana]" :key="g.examen.id" class="col-12 col-md-6 col-xxl-4">
                <article class="examen-card h-100 d-flex flex-column" :class="['borde-' + g.examen.tipo, { 'es-recuperatorio': g.esRecuperatorio }]">
                  <header class="d-flex gap-3 p-3 pb-2">
                    <div class="fecha-bloque flex-shrink-0 text-center">
                      <div class="dia">{{ diaDe(g.examen.fecha) }}</div>
                      <div class="mes">{{ mesDe(g.examen.fecha) }}</div>
                    </div>
                    <div class="min-w-0 flex-grow-1">
                      <h6 class="fw-bold text-dark mb-1 text-break">{{ g.examen.titulo }}</h6>
                      <div v-if="g.examen.clase" class="small text-muted text-break"><i class="bi bi-easel me-1"></i>{{ g.examen.clase }}</div>
                      <div v-if="g.original" class="small text-warning-emphasis text-break"><i class="bi bi-arrow-repeat me-1"></i>Recupera: {{ g.original.titulo }} ({{ fechaDMA(g.original.fecha) }})</div>
                      <div v-else-if="g.esRecuperatorio" class="small text-danger text-break"><i class="bi bi-exclamation-triangle me-1"></i>No está vinculado a un examen final activo. Volvé a guardarlo desde su clase eligiendo el final que recupera.</div>
                      <div class="d-flex flex-wrap gap-1 mt-2 etiquetas-examen">
                        <span v-if="g.esRecuperatorio" class="badge bg-warning text-dark"><i class="bi bi-arrow-repeat me-1"></i>Recuperatorio</span>
                        <span v-if="g.examen.esRecuperatorioParcialitos" class="badge bg-warning text-dark"><i class="bi bi-arrow-repeat me-1"></i>Recuperatorio de parcialitos</span>
                        <span v-if="g.examen.tipo === 'fisico'" class="badge" :class="g.examen.esFinal ? 'bg-primary' : 'bg-light text-dark border'">{{ g.examen.esFinal ? 'Físico final' : 'Simulacro' }}</span>
                        <span class="badge" :class="claseCurso(g.examen.curso)">{{ etiquetaCurso(g.examen.curso) }}</span>
                        <span v-if="g.examen.online" class="badge" :class="g.examen.habilitado ? 'bg-primary' : 'bg-secondary'">
                          <i class="bi bi-laptop me-1"></i>{{ g.examen.habilitado ? 'Online habilitado' : 'Online cerrado' }}
                        </span>
                      </div>
                    </div>
                    <div class="d-flex flex-column gap-1 flex-shrink-0">
                      <button v-if="!g.examen.idClase" @click="abrirEditar(g.examen)" class="btn btn-light btn-sm border p-1 lh-1" title="Editar examen" aria-label="Editar examen"><i class="bi bi-pencil text-primary"></i></button>
                      <button @click="confirmarEliminar(g.examen)" class="btn btn-light btn-sm border p-1 lh-1" title="Borrar examen" aria-label="Borrar examen"><i class="bi bi-trash3 text-danger"></i></button>
                    </div>
                  </header>

                  <div class="px-3">
                    <div class="row g-2 text-center">
                      <div class="col-4"><div class="stat stat-ok"><div class="valor">{{ g.examen.aprobados }}</div><div class="etiqueta">Aprobados</div></div></div>
                      <div class="col-4"><div class="stat stat-mal"><div class="valor">{{ desaprobadosSinAusentes(g.examen) }}</div><div class="etiqueta">Desaprob.</div></div></div>
                      <div class="col-4"><div class="stat stat-aus"><div class="valor">{{ g.examen.ausentes }}</div><div class="etiqueta">Ausentes</div></div></div>
                    </div>
                    <div v-if="g.examen.cargadas" class="progress mt-2" style="height: 6px;" role="img" :aria-label="`${g.examen.aprobados} aprobados de ${g.examen.cargadas}`">
                      <div class="progress-bar bg-success" :style="{ width: porcentaje(g.examen.aprobados, g.examen.cargadas) + '%' }"></div>
                      <div class="progress-bar bg-danger" :style="{ width: porcentaje(desaprobadosSinAusentes(g.examen), g.examen.cargadas) + '%' }"></div>
                      <div class="progress-bar bg-secondary" :style="{ width: porcentaje(g.examen.ausentes, g.examen.cargadas) + '%' }"></div>
                    </div>
                    <div class="small text-muted mt-2">
                      <i class="bi bi-info-circle me-1"></i>{{ criterio(g.examen) }}
                    </div>
                  </div>

                  <footer class="d-flex flex-wrap gap-2 p-3 mt-auto">
                    <button @click="abrirNotas(g.examen)" class="btn btn-success btn-sm fw-bold flex-fill text-nowrap">
                      <i class="bi bi-pencil-square me-1"></i> {{ g.examen.tipo === 'teorico' ? 'Notas' : 'Resultados' }}
                      <span class="badge bg-white text-success ms-1">{{ g.examen.cargadas }}</span>
                    </button>
                  </footer>
                </article>
              </div>
            </div>
          </template>

          <!-- PLANILLA -->
          <template v-else>
            <!-- Barra de herramientas: búsqueda + descargar + leyenda, igual que la Planilla General -->
            <div class="d-flex flex-wrap gap-3 align-items-center px-3 py-2 border-bottom bg-light small">
              <div class="busqueda-wrap">
                <input v-model="filtroAlumno" class="form-control form-control-sm shadow-none" placeholder="BUSCAR ALUMNO..." aria-label="Buscar alumno">
                <button v-if="filtroAlumno" class="btn-limpiar-busqueda" @click="filtroAlumno = ''" title="Limpiar búsqueda" type="button">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <button
                type="button"
                @click="descargarExcelPlanilla"
                class="btn btn-success btn-sm fw-bold d-flex align-items-center gap-1"
                :disabled="!alumnosPlanilla.length || generandoExcel"
              >
                <span v-if="generandoExcel" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-file-earmark-excel-fill"></i> Descargar Excel
              </button>
              <span class="text-muted text-nowrap">{{ alumnosPlanilla.length }} alumnos · {{ columnasPlanilla.length }} exámenes</span>
              <span class="ms-auto d-flex flex-wrap gap-3">
                <span><span class="cuadrito cuadrito-verde"></span> Aprobado</span>
                <span><span class="cuadrito cuadrito-roja"></span> Desaprobado</span>
                <span><span class="cuadrito cuadrito-gris"></span> Ausente (AUS)</span>
                <span><span class="cuadrito cuadrito-na"></span> No le corresponde</span>
              </span>
            </div>
            <div v-if="!alumnosPlanilla.length" class="text-center py-5 text-muted fw-bold">No hay alumnos regulares para mostrar.</div>
            <template v-else>
              <div class="d-none d-lg-block tabla-scroll">
                <table class="tabla-excel">
                  <thead>
                    <tr>
                      <th class="col-alumno esquina">ALUMNO</th>
                      <th class="th-curso">CURSO</th>
                      <th v-for="e in columnasPlanilla" :key="'th-' + e.id" class="th-evento" :title="e.clase ? e.titulo + ' · ' + e.clase : e.titulo">
                        <div class="fw-bold text-uppercase texto-recortado">{{ e.titulo }}</div>
                        <div class="fecha-evento">{{ etiquetaColumna(e) }} · {{ fechaDMA(e.fecha) }}</div>
                      </th>
                      <th class="th-total">APROBADOS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="a in alumnosPlanilla" :key="'pl-' + a.id">
                      <td class="col-alumno celda-nombre text-uppercase">{{ a.apellido }}, {{ a.nombre }}</td>
                      <td class="celda"><span class="badge" :class="MODALIDADES_CURSO[a.modalidadCurso]?.clase">{{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}</span></td>
                      <td v-for="e in columnasPlanilla" :key="'c-' + a.id + '-' + e.id" class="celda" :class="claseCeldaPlanilla(e, a)" :title="!correspondeExamen(e, a) ? 'No le corresponde' : undefined">
                        <template v-if="correspondeExamen(e, a) && celda(e, a)">
                          <template v-if="celda(e, a).ausente">AUS</template>
                          <template v-else-if="celda(e, a).nota !== null">{{ textoCelda(e, a) }}</template>
                          <button v-if="celda(e, a).rendidoOnline" type="button" class="btn btn-link btn-sm p-0 ms-1 text-danger align-baseline" :disabled="descargandoPlanilla === a.id + '-' + e.id" title="Descargar PDF" :aria-label="'PDF de ' + a.apellido" @click="descargarPdfPlanilla(e, a)">
                            <i class="bi bi-file-earmark-pdf"></i>
                          </button>
                        </template>
                      </td>
                      <td class="celda celda-total">{{ aprobadosAlumno(a) }} / {{ totalAlumno(a) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-lg-none d-flex flex-column gap-3 p-3">
                <div v-for="a in alumnosPlanilla" :key="'plm-' + a.id" class="card border-light-subtle shadow-sm rounded-3">
                  <div class="card-body p-3 small">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div class="min-w-0">
                        <div class="fw-bold text-dark text-uppercase">{{ a.apellido }}, {{ a.nombre }}</div>
                      </div>
                      <span class="badge bg-dark flex-shrink-0">{{ aprobadosAlumno(a) }} / {{ totalAlumno(a) }} aprob.</span>
                    </div>
                    <div v-for="e in columnasPlanilla.filter(e => correspondeExamen(e, a))" :key="'plme-' + a.id + '-' + e.id" class="fila-planilla d-flex justify-content-between align-items-center gap-2">
                      <div class="min-w-0">
                        <div class="text-dark text-break">{{ e.titulo }}</div>
                        <div class="text-muted" style="font-size: 0.68rem;">{{ etiquetaColumna(e) }} · {{ fechaDMA(e.fecha) }}</div>
                      </div>
                      <div class="flex-shrink-0 text-end">
                        <template v-if="celda(e, a)">
                          <span v-if="celda(e, a).ausente" class="chip-nota celda-gris">AUS</span>
                          <span v-else-if="celda(e, a).nota !== null" class="chip-nota" :class="aprobadoCelda(e, a) ? 'celda-verde' : 'celda-roja'">{{ textoCelda(e, a) }}</span>
                          <button v-if="celda(e, a).rendidoOnline" type="button" class="btn btn-link btn-sm p-0 ms-1 text-danger" :aria-label="'PDF de ' + a.apellido" @click="descargarPdfPlanilla(e, a)"><i class="bi bi-file-earmark-pdf"></i></button>
                        </template>
                        <span v-else class="text-muted">—</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- MODAL EXAMEN -->
    <ModalBase :show="mostrarModal" @close="mostrarModal = false" :icono="form.id ? 'edit_note' : 'post_add'" colorIcono="bg-danger-subtle text-danger" maxWidth="620px">
      <template #header>
        <span class="fw-bold fs-5">{{ tituloModal }}</span>
      </template>
      <form id="formExamenCurso" class="text-start" novalidate @submit.prevent="guardarExamen">
        <div class="row g-3">
          <div class="col-12">
            <label for="ex-titulo" class="form-label small fw-bold text-dark">Título *</label>
            <input id="ex-titulo" v-model.trim="form.titulo" type="text" maxlength="150" class="form-control" :class="{ 'is-invalid': intento && !form.titulo }" :placeholder="form.tipo === 'fisico' ? 'Ej: Test físico 1' : 'Ej: Práctico en partido de mini'">
          </div>
          <div class="col-6">
            <label for="ex-fecha" class="form-label small fw-bold text-dark">Fecha *</label>
            <input id="ex-fecha" v-model="form.fecha" type="date" class="form-control" :class="{ 'is-invalid': intento && !form.fecha }">
          </div>
          <div class="col-6">
            <label for="ex-curso" class="form-label small fw-bold text-dark">Curso</label>
            <select id="ex-curso" v-model="form.curso" class="form-select">
              <option value="ambos">Ambos</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.etiqueta }}</option>
            </select>
          </div>
          <div v-if="form.tipo === 'practico'" class="col-12">
            <div class="alert alert-light border small py-2 mb-0"><i class="bi bi-info-circle me-1"></i> A cada aspirante se le carga Aprobado o Desaprobado.</div>
          </div>
          <div v-if="form.tipo === 'teorico'" class="col-12">
            <label for="ex-clase" class="form-label small fw-bold text-dark">Clase del cronograma (opcional)</label>
            <select id="ex-clase" v-model="form.idClase" class="form-select">
              <option :value="null">— Sin clase asociada —</option>
              <option v-for="c in clasesDelAnio" :key="c.id" :value="c.id">{{ fechaDMA(c.fecha) }} · {{ c.titulo }}</option>
            </select>
          </div>
          <div v-if="form.tipo === 'teorico'" class="col-6">
            <label for="ex-maxima" class="form-label small fw-bold text-dark">Nota máxima *</label>
            <input id="ex-maxima" v-model.number="form.notaMaxima" type="number" min="1" step="0.01" class="form-control" :class="{ 'is-invalid': intento && !(form.notaMaxima > 0) }">
          </div>
          <div v-if="form.tipo === 'teorico'" class="col-6">
            <label for="ex-porcentaje" class="form-label small fw-bold text-dark">Aprueba con (%) *</label>
            <input id="ex-porcentaje" v-model.number="form.porcentajeAprobacion" type="number" min="1" max="100" step="0.01" class="form-control" :class="{ 'is-invalid': intento && !(form.porcentajeAprobacion > 0 && form.porcentajeAprobacion <= 100) }">
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formExamenCurso" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando">
          <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR
        </button>
      </template>
    </ModalBase>

    <!-- MODAL NOTAS -->
    <ModalBase :show="mostrarNotas" @close="mostrarNotas = false" icono="grading" colorIcono="bg-success-subtle text-success" maxWidth="900px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">{{ esPorAspirante ? 'Resultados' : 'Notas' }}</span>
          <div v-if="examenNotas" class="text-muted small mt-1">
            {{ TIPOS_EXAMEN[examenNotas.tipo]?.etiqueta }} · {{ examenNotas.titulo }} · {{ fechaDMA(examenNotas.fecha) }}
            <template v-if="examenNotas.tipo === 'teorico'"> · nota máx. {{ formatoNota(examenNotas.notaMaxima) }} · aprueba con {{ formatoNota(examenNotas.porcentajeAprobacion) }}%</template>
            <template v-else-if="examenNotas.tipo === 'fisico'"> · {{ TEXTO_UMBRALES_FISICO }}</template>
          </div>
        </div>
      </template>
      <div v-if="cargandoNotas" class="text-center py-4"><span class="spinner-border text-success"></span><p class="text-muted mt-2 mb-0 fw-bold small">Cargando notas...</p></div>
      <div v-else class="text-start">
        <div v-if="!notas.length" class="text-muted small fst-italic">No hay alumnos regulares de este curso para el año del examen.</div>
        <template v-else>
          <div v-if="esPorAspirante" class="mb-3">
            <label for="agregar-aspirante" class="form-label small fw-bold text-dark">Agregar aspirante</label>
            <select id="agregar-aspirante" class="form-select" :value="''" @change="agregarAspirante($event)">
              <option value="" disabled>{{ disponiblesParaAgregar.length ? 'Seleccionar aspirante regular...' : 'Ya están todos agregados' }}</option>
              <option v-for="a in disponiblesParaAgregar" :key="a.id" :value="a.id">{{ a.apellido }}, {{ a.nombre }} · {{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}</option>
            </select>
          </div>
          <div class="d-flex flex-wrap align-items-center gap-1 small mb-3">
            <button type="button" class="badge border-0 filtro-badge bg-success" :class="{ activo: filtroNotas === 'aprobados', apagado: filtroNotas && filtroNotas !== 'aprobados' }" :aria-pressed="filtroNotas === 'aprobados'" @click="alternarFiltroNotas('aprobados')">{{ resumenNotas.aprobados }} aprobados</button>
            <button type="button" class="badge border-0 filtro-badge bg-danger" :class="{ activo: filtroNotas === 'desaprobados', apagado: filtroNotas && filtroNotas !== 'desaprobados' }" :aria-pressed="filtroNotas === 'desaprobados'" @click="alternarFiltroNotas('desaprobados')">{{ resumenNotas.desaprobados }} desaprobados</button>
            <button type="button" class="badge border-0 filtro-badge bg-secondary" :class="{ activo: filtroNotas === 'ausentes', apagado: filtroNotas && filtroNotas !== 'ausentes' }" :aria-pressed="filtroNotas === 'ausentes'" @click="alternarFiltroNotas('ausentes')">{{ resumenNotas.ausentes }} ausentes</button>
            <button type="button" class="badge filtro-badge bg-light text-muted border" :class="{ activo: filtroNotas === 'sin', apagado: filtroNotas && filtroNotas !== 'sin' }" :aria-pressed="filtroNotas === 'sin'" @click="alternarFiltroNotas('sin')">{{ resumenNotas.sin }} sin nota</button>
            <button v-if="filtroNotas" type="button" class="btn btn-link btn-sm p-0 ms-1 text-decoration-none small" @click="filtroNotas = null">Ver todos</button>
          </div>
          <div class="d-flex flex-column gap-2">
            <div v-if="esPorAspirante && !filasBase.length" class="text-muted small fst-italic">Todavía no agregaste aspirantes.</div>
            <div v-else-if="!filasVisibles.length" class="text-muted small fst-italic">No hay aspirantes en este filtro.</div>
            <div v-for="n in filasVisibles" :key="n.id" class="fila-nota">
              <div class="row g-2 align-items-center">
                <div class="col-12 min-w-0" :class="esPorAspirante ? 'col-md-5' : 'col-md-4'">
                  <div class="fw-bold text-dark small text-uppercase text-break">{{ n.apellido }}, {{ n.nombre }}</div>
                  <div class="text-muted" style="font-size: 0.72rem;">
                    {{ MODALIDADES_CURSO[n.modalidadCurso]?.corta }}<template v-if="examenNotas.tipo === 'fisico'"> · aprueba con {{ formatoNota(n.umbralFisico) }}</template>
                  </div>
                </div>
                <div v-if="examenNotas.tipo === 'practico'" class="col-12 col-sm-7 col-md-4">
                  <div class="btn-group btn-group-sm w-100" role="group" :aria-label="'Resultado de ' + n.apellido">
                    <button type="button" class="btn fw-bold" :class="String(n.nota) === '1' ? 'btn-success' : 'btn-outline-success'" :disabled="n.ausente" @click="n.nota = '1'">Aprobado</button>
                    <button type="button" class="btn fw-bold" :class="String(n.nota) === '0' ? 'btn-danger' : 'btn-outline-danger'" :disabled="n.ausente" @click="n.nota = '0'">Desaprobado</button>
                  </div>
                </div>
                <div v-else class="col-5" :class="esPorAspirante ? 'col-sm-4 col-md-3' : 'col-md-2'">
                  <label :for="`nota-${n.id}`" class="visually-hidden">Nota de {{ n.apellido }}</label>
                  <input :id="`nota-${n.id}`" v-model="n.nota" type="number" min="0" :max="examenNotas.notaMaxima" :step="examenNotas.tipo === 'fisico' ? 0.1 : 0.01" class="form-control form-control-sm" :class="{ 'is-invalid': notaInvalida(n) }" :disabled="n.ausente" :placeholder="examenNotas.tipo === 'fisico' ? 'Nivel' : 'Nota'">
                </div>
                <div :class="esPorAspirante ? 'col-7 col-sm-3 col-md-2' : 'col-7 col-md-2'">
                  <div class="form-check mb-0">
                    <input :id="`aus-${n.id}`" v-model="n.ausente" class="form-check-input" type="checkbox" @change="limpiarSiAusente(n)">
                    <label :for="`aus-${n.id}`" class="form-check-label small">Ausente</label>
                  </div>
                </div>
                <div v-if="!esPorAspirante" class="col-9 col-md-3">
                  <label :for="`com-${n.id}`" class="visually-hidden">Comentario</label>
                  <input :id="`com-${n.id}`" v-model.trim="n.comentarios" type="text" maxlength="1000" class="form-control form-control-sm" placeholder="Comentario (opcional)">
                </div>
                <div class="text-end d-flex justify-content-end align-items-center gap-1" :class="esPorAspirante ? 'col-12 col-md-1' : 'col-3 col-md-1'">
                  <span v-if="resultado(n) === true" class="badge bg-success">✓</span>
                  <span v-else-if="resultado(n) === false" class="badge bg-danger">✗</span>
                  <button v-if="n.rendidoOnline" type="button" class="btn btn-sm btn-outline-danger p-0 px-1" :disabled="descargandoPdf === n.id" title="Descargar PDF del examen" :aria-label="'PDF de ' + n.apellido" @click="descargarPdf(n)">
                    <span v-if="descargandoPdf === n.id" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-file-earmark-pdf"></i>
                  </button>
                  <button v-if="esPorAspirante" type="button" class="btn btn-sm btn-outline-secondary p-0 px-1" title="Quitar" :aria-label="'Quitar a ' + n.apellido" @click="quitarAspirante(n)">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
                <div v-if="esPorAspirante" class="col-12">
                  <label :for="`com-${n.id}`" class="form-label small fw-bold text-dark mb-1">Comentarios</label>
                  <textarea :id="`com-${n.id}`" v-model.trim="n.comentarios" rows="3" maxlength="1000" class="form-control form-control-sm" placeholder="Devolución del examen (opcional)"></textarea>
                  <div class="form-text text-end mt-0">{{ (n.comentarios || '').length }}/1000</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <button type="button" @click="mostrarNotas = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="button" @click="guardarNotas" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardandoNotas || !notas.length">
          <span v-if="guardandoNotas" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR NOTAS
        </button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { formatoNota } from '@/composables/useExamenesCurso'
import { useCronogramaCurso } from '@/composables/useCronogramaCurso'

useHead({ title: 'Exámenes del Curso | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const PORCENTAJE_DEFECTO = 75

const TIPOS_EXAMEN = {
  teorico: { etiqueta: 'Teórico', clase: 'bg-danger' },
  practico: { etiqueta: 'Práctico', clase: 'bg-dark' },
  fisico: { etiqueta: 'Físico', clase: 'bg-primary' },
}
const TEXTO_UMBRALES_FISICO = 'Aprueba con 8.5 (femenino y masculino de 45 años o más) o 9.5 (masculino menor de 45)'

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual([String(Number(anioActual()) + 1)]).map(Number))
const filtroCurso = ref('')
const examenes = ref([])
const cargando = ref(false)

const { clases: clasesDelAnio, cargar: cargarClases } = useCronogramaCurso()

const etiquetaCurso = (curso) => (curso === 'ambos' ? 'Ambos cursos' : MODALIDADES_CURSO[curso]?.etiqueta || curso)
const claseCurso = (curso) => (curso === 'ambos' ? 'bg-light text-dark border' : MODALIDADES_CURSO[curso]?.clase || 'bg-secondary')

const examenesFiltrados = computed(() =>
  filtroCurso.value ? examenes.value.filter(e => e.curso === filtroCurso.value || e.curso === 'ambos') : examenes.value
)

const cargarExamenes = async () => {
  cargando.value = true
  try {
    const [res, resPlanilla] = await Promise.all([
      api.get({ entity: 'examenes_curso_arbitro', action: 'obtenerExamenesCurso', payload: { anio: anio.value } }),
      api.get({ entity: 'examenes_curso_arbitro', action: 'obtenerPlanillaNotasCurso', payload: { anio: anio.value } }),
    ])
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar los exámenes')
    if (!resPlanilla?.ok) throw new Error(resPlanilla?.message || 'No se pudo cargar la planilla de notas')
    examenes.value = res.payload || []
    planilla.value = resPlanilla.payload || { alumnos: [], notas: [] }
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

// ─── Pestañas ─────────────────────────────────────────────────────
const PESTANAS = [
  { clave: 'parcialito', etiqueta: 'Parcialitos', icono: 'bi-journal-text' },
  { clave: 'final', etiqueta: 'Teórico final', icono: 'bi-mortarboard' },
  { clave: 'practico', etiqueta: 'Prácticos', icono: 'bi-flag' },
  { clave: 'fisico', etiqueta: 'Físicos', icono: 'bi-stopwatch' },
  { clave: 'planilla', etiqueta: 'Planilla', icono: 'bi-table' },
]
const AYUDA_PESTANA = {
  parcialito: 'Parcialitos de cada clase y recuperatorios de parcialitos. Se programan desde Clases y Asistencia.',
  final: 'El teórico final y su recuperatorio se programan desde Clases y Asistencia.',
  practico: 'A cada aspirante se le carga Aprobado o Desaprobado.',
  fisico: 'Simulacros, físico final y su recuperatorio. Se programan desde Clases y Asistencia; acá se carga el nivel de cada aspirante.',
}
const VACIO_PESTANA = {
  parcialito: 'Todavía no hay parcialitos programados.',
  final: 'Todavía no programaste el teórico final.',
  practico: 'Todavía no cargaste exámenes prácticos.',
  fisico: 'Todavía no hay exámenes físicos. Se programan desde una clase en Clases y Asistencia.',
}
const pestana = ref('parcialito')

const pestanaDe = (e) => (e.tipo === 'teorico' ? (e.esFinal ? 'final' : 'parcialito') : e.tipo)

// Los recuperatorios se muestran dentro de su examen original
// Recuperatorio guardado sin vínculo con su final (datos viejos): se marca para poder corregirlo
const pareceRecuperatorio = (e) => !e.esRecuperatorioParcialitos && /^recuperatorio/i.test(String(e.titulo || ''))

// Cada recuperatorio se muestra como tarjeta propia, justo después de su examen original
const grupos = computed(() => {
  const resultado = { parcialito: [], final: [], practico: [], fisico: [], planilla: [] }
  const originales = examenesFiltrados.value.filter(e => !e.idExamenOriginal)
  originales.forEach(examen => {
    const lista = resultado[pestanaDe(examen)]
    if (!lista) return
    lista.push({ examen, original: null, esRecuperatorio: pareceRecuperatorio(examen) })
    examenesFiltrados.value
      .filter(r => r.idExamenOriginal === examen.id)
      .forEach(r => lista.push({ examen: r, original: examen, esRecuperatorio: true }))
  })
  // Recuperatorios cuyo original no está activo (por ejemplo, se borró)
  examenesFiltrados.value
    .filter(r => r.idExamenOriginal && !originales.some(o => o.id === r.idExamenOriginal))
    .forEach(r => resultado[pestanaDe(r)]?.push({ examen: r, original: null, esRecuperatorio: true }))
  return resultado
})

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const diaDe = (fecha) => String(fecha || '').substring(8, 10)
const mesDe = (fecha) => MESES_CORTOS[Number(String(fecha || '').substring(5, 7)) - 1] || ''
const porcentaje = (parte, total) => (total ? Math.round(parte / total * 100) : 0)
const desaprobadosSinAusentes = (e) => Math.max(0, (e.desaprobados || 0) - (e.ausentes || 0))
const criterio = (e) => {
  if (e.esRecuperatorioParcialitos) return 'Cada aspirante rinde las reglas de los parcialitos que debe · aprueba con ' + formatoNota(e.porcentajeAprobacion) + '%'
  if (e.tipo === 'fisico') return TEXTO_UMBRALES_FISICO
  if (e.tipo === 'practico') return 'Resultado: aprobado o desaprobado.'
  return `Nota máxima ${formatoNota(e.notaMaxima)} · aprueba con ${formatoNota(e.porcentajeAprobacion)}%`
}
const etiquetaColumna = (e) => {
  const base = e.tipo === 'teorico'
    ? (e.esFinal ? 'Final' : 'Parcialito')
    : e.tipo === 'fisico' ? (e.esFinal ? 'Físico final' : 'Simulacro') : TIPOS_EXAMEN[e.tipo]?.etiqueta
  if (e.esRecuperatorioParcialitos) return 'Recup. parcialitos'
  return e.idExamenOriginal ? `Recup. ${base.toLowerCase()}` : base
}

// ─── Planilla de notas (alumnos x exámenes) ──────────────────────
const planilla = ref({ alumnos: [], notas: [], recuperados: [] })
const filtroAlumno = ref('')
const descargandoPlanilla = ref(null)

const normalizarTexto = (v) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const columnasPlanilla = computed(() =>
  [...examenesFiltrados.value].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)) || a.id - b.id)
)

const alumnosPlanilla = computed(() => {
  const texto = normalizarTexto(filtroAlumno.value)
  return planilla.value.alumnos.filter(a =>
    (!filtroCurso.value || a.modalidadCurso === filtroCurso.value) &&
    (!texto || normalizarTexto(`${a.apellido} ${a.nombre}`).includes(texto))
  )
})

const indiceNotas = computed(() => {
  const mapa = {}
  planilla.value.notas.forEach(n => { mapa[`${n.idExamen}-${n.idAlumno}`] = n })
  return mapa
})

const celda = (e, a) => indiceNotas.value[`${e.id}-${a.id}`] || null
const correspondeExamen = (e, a) => {
  if (e.curso !== 'ambos' && e.curso !== a.modalidadCurso) return false
  if (e.esRecuperatorioParcialitos) return Boolean(celda(e, a))
  if (!e.idExamenOriginal) return true
  const original = celda({ id: e.idExamenOriginal }, a)
  return Boolean(original && (original.aprobado === false || original.ausente))
}

const aprobadoCelda = (e, a) => {
  const n = celda(e, a)
  if (!n || n.ausente || n.nota === null) return false
  if (n.aprobado !== null && n.aprobado !== undefined) return n.aprobado
  return (n.nota / (e.notaMaxima || 100)) * 100 >= e.porcentajeAprobacion
}

const textoCelda = (e, a) => {
  const n = celda(e, a)
  if (e.tipo === 'practico') return n.nota >= 1 ? 'APROB.' : 'DESAP.'
  return e.online ? `${formatoNota(n.nota / (e.notaMaxima || 100) * 100)}%` : formatoNota(n.nota)
}

// Cuentan los exámenes originales (sin recuperatorios ni simulacros). Si aprobó el recuperatorio, el original cuenta como aprobado.
const cuentaParaAprobados = (e) => !e.idExamenOriginal && !e.esRecuperatorioParcialitos && !(e.tipo === 'fisico' && !e.esFinal)
const examenesQueCuentan = (a) => columnasPlanilla.value.filter(e => cuentaParaAprobados(e) && correspondeExamen(e, a))
// Recuperatorios de parcialitos que el aspirante rindió online: tienen el detalle de qué parcialitos recupera
const recuperatoriosConDetalle = computed(() =>
  new Set((planilla.value.recuperados || []).map(x => `${x.idExamen}-${x.idAlumno}`))
)

const aproboConRecuperatorio = (e, a) => {
  const porRecuperatorio = examenesFiltrados.value.some(r => r.idExamenOriginal === e.id && aprobadoCelda(r, a))
  if (porRecuperatorio) return true
  // Rendido online: se sabe exactamente qué parcialitos recuperó
  const porParcialitos = (planilla.value.recuperados || [])
    .some(x => x.idAlumno === a.id && x.idParcialito === e.id && aprobadoCelda({ id: x.idExamen }, a))
  if (porParcialitos) return true
  // Nota cargada a mano (sin detalle): un recuperatorio de parcialitos aprobado recupera los parcialitos
  // desaprobados o ausentes anteriores a esa fecha. Es la misma regla que usa el backend.
  if (e.tipo !== 'teorico' || e.esFinal || e.idExamenOriginal || e.esRecuperatorioParcialitos || !celda(e, a)) return false
  return examenes.value.some(r =>
    r.esRecuperatorioParcialitos &&
    String(r.fecha) >= String(e.fecha) &&
    !recuperatoriosConDetalle.value.has(`${r.id}-${a.id}`) &&
    aprobadoCelda(r, a)
  )
}
const aprobadosAlumno = (a) => examenesQueCuentan(a).filter(e => aprobadoCelda(e, a) || aproboConRecuperatorio(e, a)).length
const totalAlumno = (a) => examenesQueCuentan(a).length

// ─── Excel de la planilla (mismos colores que la Planilla General) ──
const generandoExcel = ref(false)

const RELLENO_EXCEL = { verde: 'FFD1E7DD', roja: 'FFF8D7DA', gris: 'FFE9ECEF', cabecera: 'FFF1F3F5' }
const FUENTE_EXCEL = { verde: 'FF0F5132', roja: 'FF842029', gris: 'FF6C757D' }

const pintarCeldaExcel = (c, color, opciones = {}) => {
  const borde = { style: 'thin', color: { argb: 'FFD4D4D8' } }
  c.border = { top: borde, left: borde, bottom: borde, right: borde }
  c.alignment = { horizontal: opciones.izquierda ? 'left' : 'center', vertical: 'middle', wrapText: !!opciones.ajustar }
  if (RELLENO_EXCEL[color]) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RELLENO_EXCEL[color] } }
  c.font = { bold: !!opciones.negrita, size: opciones.tamanio || 11, color: { argb: FUENTE_EXCEL[color] || 'FF212529' } }
}

const claseCeldaPlanilla = (e, a) => {
  if (!correspondeExamen(e, a)) return 'celda-na'
  const { color } = celdaExcel(e, a)
  return color ? `celda-${color}` : ''
}

// Texto y color de una celda del Excel, con la misma lógica que la vista
const celdaExcel = (e, a) => {
  if (!correspondeExamen(e, a)) return { texto: '', color: 'gris' }
  const n = celda(e, a)
  if (!n) return { texto: '', color: '' }
  if (n.ausente) return { texto: 'AUS', color: 'gris' }
  if (n.nota === null) return { texto: '', color: '' }
  const texto = e.tipo === 'practico' ? (n.nota >= 1 ? 'APROBADO' : 'DESAPROBADO') : textoCelda(e, a)
  return { texto, color: aprobadoCelda(e, a) ? 'verde' : 'roja' }
}

const descargarExcelPlanilla = async () => {
  generandoExcel.value = true
  try {
    const { default: ExcelJS } = await import('exceljs')
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet(`Planilla ${anio.value}`, { views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }] })
    const columnas = columnasPlanilla.value

    ws.addRow([
      'ALUMNO',
      'CURSO',
      ...columnas.map(e => `${e.titulo}\n${etiquetaColumna(e)} · ${fechaDMA(e.fecha)}`),
      'APROBADOS'
    ])
    alumnosPlanilla.value.forEach(a => {
      ws.addRow([
        `${a.apellido}, ${a.nombre}`.toUpperCase(),
        MODALIDADES_CURSO[a.modalidadCurso]?.corta || '',
        ...columnas.map(e => celdaExcel(e, a).texto),
        `${aprobadosAlumno(a)} / ${totalAlumno(a)}`
      ])
    })

    ws.getRow(1).eachCell({ includeEmpty: true }, c => pintarCeldaExcel(c, 'cabecera', { negrita: true, ajustar: true, tamanio: 10 }))
    ws.getRow(1).height = 45
    alumnosPlanilla.value.forEach((a, i) => {
      const fila = ws.getRow(i + 2)
      pintarCeldaExcel(fila.getCell(1), '', { izquierda: true, negrita: true })
      pintarCeldaExcel(fila.getCell(2), '')
      columnas.forEach((e, j) => pintarCeldaExcel(fila.getCell(j + 3), celdaExcel(e, a).color, { negrita: true }))
      pintarCeldaExcel(fila.getCell(columnas.length + 3), '', { negrita: true })
    })

    ws.getColumn(1).width = 30
    ws.getColumn(2).width = 10
    columnas.forEach((_, j) => { ws.getColumn(j + 3).width = 16 })
    ws.getColumn(columnas.length + 3).width = 12

    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `planilla_examenes_curso_${anio.value}.xlsx`
    enlace.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('descargarExcelPlanilla:', err)
    notificar({ titulo: 'Error', mensaje: 'No se pudo generar el Excel.', tipo: 'danger' })
  } finally {
    generandoExcel.value = false
  }
}

const descargarPdfPlanilla = async (e, a) => {
  descargandoPlanilla.value = `${a.id}-${e.id}`
  try {
    await api.getFile({
      entity: 'examen_online_curso_arbitro',
      action: 'descargarPdfExamenCurso',
      payload: { idExamen: e.id, idAlumno: a.id },
    }, `examen_curso_${a.apellido}_${a.nombre}.pdf`)
  } catch (err) {
    notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
  } finally {
    descargandoPlanilla.value = null
  }
}

watch(anio, () => {
  cargarExamenes()
  cargarClases(anio.value)
})

// ─── Alta / edición del examen ───────────────────────────────────
const examenVacio = () => ({ id: null, titulo: '', tipo: 'practico', fecha: '', curso: 'ambos', idClase: null, notaMaxima: 100, porcentajeAprobacion: PORCENTAJE_DEFECTO, esFinal: false })
const form = ref(examenVacio())
const mostrarModal = ref(false)
const intento = ref(false)
const guardando = ref(false)

const abrirNuevo = (tipo = 'practico') => {
  form.value = { ...examenVacio(), tipo }
  intento.value = false
  mostrarModal.value = true
}

const NOMBRES_TIPO = { teorico: 'examen teórico', practico: 'examen práctico', fisico: 'examen físico' }
const tituloModal = computed(() => {
  const nombre = NOMBRES_TIPO[form.value.tipo] || 'examen'
  return form.value.id ? `Editar ${nombre}` : `Nuevo ${nombre}`
})

const abrirEditar = (e) => {
  form.value = { id: e.id, titulo: e.titulo, tipo: e.tipo, fecha: e.fecha, curso: e.curso, idClase: e.idClase, notaMaxima: e.notaMaxima, porcentajeAprobacion: e.porcentajeAprobacion, esFinal: Boolean(e.esFinal) }
  intento.value = false
  mostrarModal.value = true
}

const guardarExamen = async () => {
  intento.value = true
  const f = form.value
  const teoricoInvalido = f.tipo === 'teorico' && (!(f.notaMaxima > 0) || !(f.porcentajeAprobacion > 0 && f.porcentajeAprobacion <= 100))
  if (!f.titulo || !f.fecha || teoricoInvalido) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Revisá los campos marcados.', tipo: 'danger' })
    return
  }
  guardando.value = true
  try {
    const payload = f.tipo === 'teorico' ? f : { ...f, idClase: null }
    const res = await api.post({ entity: 'examenes_curso_arbitro', action: 'guardarExamenCurso', payload })
    if (!f.id && f.tipo !== 'teorico') pestana.value = f.tipo
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar el examen')
    toast({ titulo: 'Guardado', mensaje: 'El examen se guardó.', tipo: 'success' })
    mostrarModal.value = false
    const anioExamen = Number(f.fecha.substring(0, 4))
    if (anioExamen !== anio.value) anio.value = anioExamen
    else await cargarExamenes()
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (e) => {
  notificar({
    titulo: '¿Borrar examen?',
    mensaje: `${e.titulo} (${fechaDMA(e.fecha)}). Los alumnos dejarán de ver esta nota.`,
    tipo: 'danger',
    alConfirmar: async () => {
      try {
        const res = await api.post({ entity: 'examenes_curso_arbitro', action: 'eliminarExamenCurso', payload: { id: e.id } })
        if (!res?.ok) throw new Error(res?.message || 'No se pudo borrar el examen')
        toast({ titulo: 'Borrado', mensaje: 'El examen se borró.', tipo: 'success' })
        await cargarExamenes()
      } catch (err) {
        notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
      }
    },
  })
}

// ─── Carga de notas ──────────────────────────────────────────────
const mostrarNotas = ref(false)
const examenNotas = ref(null)
const notas = ref([])
const cargandoNotas = ref(false)
const guardandoNotas = ref(false)

const limpiarSiAusente = (n) => {
  if (n.ausente) n.nota = ''
}
const notaNumero = (n) => (n.nota === '' || n.nota === null || n.nota === undefined ? null : Number(n.nota))
const notaInvalida = (n) => {
  const v = notaNumero(n)
  return v !== null && (isNaN(v) || v < 0 || v > examenNotas.value.notaMaxima)
}
const resultado = (n) => {
  const v = notaNumero(n)
  if (n.ausente || v === null || notaInvalida(n)) return null
  if (examenNotas.value.tipo === 'practico') return v >= 1
  if (examenNotas.value.tipo === 'fisico') return v >= n.umbralFisico
  return (v / examenNotas.value.notaMaxima) * 100 >= examenNotas.value.porcentajeAprobacion
}

// En el práctico se agregan los aspirantes que rindieron con un select; en teórico y físico aparecen todos
const esPorAspirante = computed(() => examenNotas.value?.tipo === 'practico')
const filasBase = computed(() => (esPorAspirante.value ? notas.value.filter(n => n.agregado) : notas.value))

const filtroNotas = ref(null)
const alternarFiltroNotas = (valor) => {
  filtroNotas.value = filtroNotas.value === valor ? null : valor
}
const categoriaNota = (n) => {
  if (n.ausente) return 'ausentes'
  if (notaNumero(n) === null) return 'sin'
  const r = resultado(n)
  if (r === true) return 'aprobados'
  if (r === false) return 'desaprobados'
  return null
}
const filasVisibles = computed(() => (filtroNotas.value ? filasBase.value.filter(n => categoriaNota(n) === filtroNotas.value) : filasBase.value))
const disponiblesParaAgregar = computed(() => notas.value.filter(n => !n.agregado))

const agregarAspirante = (evento) => {
  const fila = notas.value.find(n => n.id === Number(evento.target.value))
  if (fila) fila.agregado = true
  evento.target.value = ''
}

const quitarAspirante = (n) => {
  Object.assign(n, { agregado: false, nota: '', ausente: false, comentarios: '' })
}
const resumenNotas = computed(() => ({
  aprobados: filasBase.value.filter(n => resultado(n) === true).length,
  desaprobados: filasBase.value.filter(n => resultado(n) === false).length,
  ausentes: filasBase.value.filter(n => n.ausente).length,
  sin: filasBase.value.filter(n => !n.ausente && notaNumero(n) === null).length,
}))

const descargandoPdf = ref(null)

const descargarPdf = async (n) => {
  descargandoPdf.value = n.id
  try {
    await api.getFile({
      entity: 'examen_online_curso_arbitro',
      action: 'descargarPdfExamenCurso',
      payload: { idExamen: examenNotas.value.id, idAlumno: n.id },
    }, `examen_curso_${n.apellido}_${n.nombre}.pdf`)
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    descargandoPdf.value = null
  }
}

const abrirNotas = async (e) => {
  examenNotas.value = { ...e }
  notas.value = []
  filtroNotas.value = null
  mostrarNotas.value = true
  cargandoNotas.value = true
  try {
    const res = await api.get({ entity: 'examenes_curso_arbitro', action: 'obtenerNotasExamenCurso', payload: { idExamen: e.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar las notas')
    examenNotas.value = res.payload.examen
    notas.value = (res.payload.alumnos || []).map(a => ({
      ...a,
      nota: a.nota ?? '',
      comentarios: a.comentarios || '',
      agregado: a.nota !== null || a.ausente || Boolean(a.comentarios),
      ausenteOriginal: a.ausente,
    }))
  } catch (err) {
    notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
    mostrarNotas.value = false
  } finally {
    cargandoNotas.value = false
  }
}

// Quienes ya rindieron online o tenían nota y ahora pasan a ausente: al guardar se borra su
// intento y quedan ausentes también en la asistencia de la clase, por eso se confirma antes.
const aspirantesQuePierdenResultado = computed(() =>
  notas.value.filter(n => n.ausente && !n.ausenteOriginal && n.rendidoOnline)
)

const guardarNotas = () => {
  if (esPorAspirante.value && notas.value.some(n => n.agregado && !n.ausente && notaNumero(n) === null)) {
    notificar({ titulo: 'Faltan resultados', mensaje: 'Completá el resultado de cada aspirante agregado o marcalo ausente.', tipo: 'danger' })
    return
  }
  if (notas.value.some(notaInvalida)) {
    notificar({ titulo: 'Notas inválidas', mensaje: `Las notas tienen que estar entre 0 y ${formatoNota(examenNotas.value.notaMaxima)}.`, tipo: 'danger' })
    return
  }
  const afectados = aspirantesQuePierdenResultado.value
  if (afectados.length === 0) {
    enviarNotas()
    return
  }
  const nombres = afectados.map(n => `${n.apellido}, ${n.nombre}`).join(' · ')
  notificar({
    titulo: '¿Marcar como ausente?',
    mensaje: afectados.length === 1
      ? `${nombres} ya rindió este examen online. Si lo marcás ausente se borra su examen rendido y queda ausente también en la clase. No se puede deshacer.`
      : `Estos aspirantes ya rindieron este examen online: ${nombres}. Si los marcás ausentes se borran sus exámenes rendidos y quedan ausentes también en la clase. No se puede deshacer.`,
    tipo: 'danger',
    alConfirmar: enviarNotas,
  })
}

const enviarNotas = async () => {
  guardandoNotas.value = true
  try {
    const res = await api.post({
      entity: 'examenes_curso_arbitro',
      action: 'guardarNotasExamenCurso',
      payload: {
        idExamen: examenNotas.value.id,
        notas: notas.value.map(n => ({ idAlumno: n.id, nota: n.ausente ? '' : String(n.nota ?? ''), ausente: n.ausente, comentarios: n.comentarios })),
      },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron guardar las notas')
    toast({ titulo: 'Guardado', mensaje: 'Los resultados se guardaron. Los aspirantes ya pueden verlos.', tipo: 'success' })
    mostrarNotas.value = false
    await cargarExamenes()
  } catch (err) {
    notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
  } finally {
    guardandoNotas.value = false
  }
}

onMounted(() => {
  cargarExamenes()
  cargarClases(anio.value)
})
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.5s; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }
.filtro-badge { cursor: pointer; font-size: 0.75rem; padding: 0.35em 0.65em; transition: opacity 0.15s ease, box-shadow 0.15s ease; }
.filtro-badge.activo { box-shadow: 0 0 0 2px #0f172a; }
.filtro-badge.apagado { opacity: 0.45; }
.pestanas-examenes { scrollbar-width: thin; }
.pestanas-examenes .nav-link { color: #475569; background: #f1f5f9; font-size: 0.85rem; white-space: nowrap; }
.pestanas-examenes .nav-link.active { background: #dc3545; color: #fff; }
.examen-card { background: #fff; border: 1px solid #e2e8f0; border-top: 4px solid #94a3b8; border-radius: 12px; min-width: 0; overflow-wrap: anywhere; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); }
.examen-card.borde-teorico { border-top-color: #dc3545; }
.examen-card.borde-practico { border-top-color: #0f172a; }
.examen-card.borde-fisico { border-top-color: #0d6efd; }
.fecha-bloque { width: 52px; border-radius: 10px; background: #f1f5f9; padding: 6px 0; line-height: 1; }
.fecha-bloque .dia { font-size: 1.3rem; font-weight: 900; color: #0f172a; }
.fecha-bloque .mes { font-size: 0.65rem; font-weight: 800; color: #dc3545; letter-spacing: 1px; margin-top: 3px; }
.stat { border-radius: 10px; padding: 6px 4px; }
.stat .valor { font-size: 1.25rem; font-weight: 900; line-height: 1.1; }
.stat .etiqueta { font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; }
.stat-ok { background: #f0fdf4; color: #15803d; }
.stat-mal { background: #fef2f2; color: #b91c1c; }
.stat-aus { background: #f1f5f9; color: #475569; }
.examen-card.es-recuperatorio { background: #fffbeb; border-color: #fde68a; }
.fila-planilla { border-top: 1px solid #f1f5f9; padding: 6px 0; }
.opcion-fisico { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; cursor: pointer; }
.opcion-fisico.activa { border-color: #0d6efd; background: #eff6ff; }
.estado-vacio { border: 2px dashed #e2e8f0; border-radius: 12px; }
.etiquetas-examen .badge { white-space: normal; text-align: left; line-height: 1.3; }
.fila-nota { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
.min-w-0 { min-width: 0; }

/* Planilla con el mismo estilo que la Planilla General (Desarrollo Arbitral) */
.tabla-scroll { overflow-x: auto; }
.tabla-excel { border-collapse: separate; border-spacing: 0; width: max-content; min-width: 100%; font-size: 0.8rem; background: #fff; }
.tabla-excel th,
.tabla-excel td { border-right: 1px solid #d4d4d8; border-bottom: 1px solid #d4d4d8; padding: 4px 8px; white-space: nowrap; }
.tabla-excel thead th { background-color: #f1f3f5; color: #343a40; position: sticky; top: 0; z-index: 5; text-align: center; vertical-align: middle; font-size: 0.72rem; }
.th-evento { min-width: 140px; }
.th-curso, .th-total { min-width: 70px; }
.fecha-evento { font-size: 0.68rem; color: #6c757d; font-weight: 500; }
.texto-recortado { max-width: 180px; overflow: hidden; text-overflow: ellipsis; margin: 0 auto; }
.col-alumno { position: sticky; left: 0; background-color: #fff; z-index: 6; min-width: 190px; text-align: left !important; }
.tabla-excel thead .esquina { z-index: 8; background-color: #e9ecef; }
.celda-nombre { font-weight: 600; color: #212529; border-right: 2px solid #adb5bd !important; }
.celda { text-align: center; min-width: 44px; color: #212529; }
.celda-total { font-weight: 700; border-left: 2px solid #adb5bd; }
.celda-verde { background-color: #d1e7dd; color: #0f5132; font-weight: 600; }
.celda-roja { background-color: #f8d7da; color: #842029; font-weight: 600; }
.celda-gris { background-color: #e9ecef; color: #6c757d; font-weight: 600; }
.celda-na { background-color: #f8f9fa; }
.chip-nota { display: inline-block; border-radius: 4px; padding: 1px 8px; font-size: 0.75rem; }
.cuadrito { display: inline-block; width: 12px; height: 12px; border: 1px solid #ced4da; border-radius: 2px; margin-right: 4px; vertical-align: -1px; }
.cuadrito-verde { background-color: #d1e7dd; }
.cuadrito-roja { background-color: #f8d7da; }
.cuadrito-gris { background-color: #e9ecef; }
.cuadrito-na { background-color: #f8f9fa; }
.busqueda-wrap { position: relative; max-width: 200px; flex: 0 0 auto; }
.busqueda-wrap input { padding-right: 30px; }
.btn-limpiar-busqueda { position: absolute; top: 50%; right: 6px; transform: translateY(-50%); border: none; background: transparent; color: #adb5bd; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem; line-height: 1; }
.btn-limpiar-busqueda:hover { color: #dc3545; }
</style>
