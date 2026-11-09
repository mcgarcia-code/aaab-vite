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

        <div class="card-body p-3 bg-white">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger"></span></div>

          <!-- EXÁMENES DE LA PESTAÑA -->
          <template v-else-if="pestana !== 'planilla'">
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <p class="small text-muted mb-0">{{ AYUDA_PESTANA[pestana] }}</p>
              <button v-if="pestana === 'practico' || pestana === 'fisico'" @click="abrirNuevo(pestana)" class="btn btn-danger btn-sm fw-bold shadow-sm flex-shrink-0">
                <i class="bi bi-plus-lg me-1"></i> Nuevo {{ pestana === 'practico' ? 'práctico' : 'físico' }}
              </button>
            </div>

            <div v-if="!grupos[pestana].length" class="estado-vacio text-center py-5 text-muted">
              <i :class="['bi', PESTANAS.find(p => p.clave === pestana).icono, 'fs-1 d-block mb-2 opacity-50']"></i>
              <span class="fw-bold">{{ VACIO_PESTANA[pestana] }}</span>
            </div>

            <div v-else class="row g-3">
              <div v-for="g in grupos[pestana]" :key="g.examen.id" class="col-12 col-md-6 col-xxl-4">
                <article class="examen-card h-100 d-flex flex-column" :class="'borde-' + g.examen.tipo">
                  <header class="d-flex gap-3 p-3 pb-2">
                    <div class="fecha-bloque flex-shrink-0 text-center">
                      <div class="dia">{{ diaDe(g.examen.fecha) }}</div>
                      <div class="mes">{{ mesDe(g.examen.fecha) }}</div>
                    </div>
                    <div class="min-w-0 flex-grow-1">
                      <h6 class="fw-bold text-dark mb-1 text-break">{{ g.examen.titulo }}</h6>
                      <div v-if="g.examen.clase" class="small text-muted text-break"><i class="bi bi-easel me-1"></i>{{ g.examen.clase }}</div>
                      <div class="d-flex flex-wrap gap-1 mt-2 etiquetas-examen">
                        <span v-if="g.examen.tipo === 'fisico'" class="badge" :class="g.examen.esFinal ? 'bg-primary' : 'bg-light text-dark border'">{{ g.examen.esFinal ? 'Físico final' : 'Simulacro' }}</span>
                        <span class="badge" :class="claseCurso(g.examen.curso)">{{ etiquetaCurso(g.examen.curso) }}</span>
                        <span v-if="g.examen.online" class="badge" :class="g.examen.habilitado ? 'bg-primary' : 'bg-secondary'">
                          <i class="bi bi-laptop me-1"></i>{{ g.examen.habilitado ? 'Online habilitado' : 'Online cerrado' }}
                        </span>
                      </div>
                    </div>
                    <div class="d-flex flex-column gap-1 flex-shrink-0">
                      <button @click="abrirEditar(g.examen)" class="btn btn-light btn-sm border p-1 lh-1" title="Editar examen" aria-label="Editar examen"><i class="bi bi-pencil text-primary"></i></button>
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

                  <!-- RECUPERATORIOS -->
                  <div v-if="g.recuperatorios.length" class="mx-3 mt-3 recuperatorios">
                    <div class="small fw-bold text-warning-emphasis mb-1"><i class="bi bi-arrow-repeat me-1"></i>Recuperatorios</div>
                    <div v-for="r in g.recuperatorios" :key="r.id" class="recuperatorio d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <div class="small min-w-0">
                        <strong>{{ fechaDMA(r.fecha) }}</strong>
                        <span class="text-success fw-bold ms-2">{{ r.aprobados }} aprob.</span>
                        <span class="text-danger fw-bold ms-1">{{ desaprobadosSinAusentes(r) }} desap.</span>
                        <span v-if="r.online" class="badge ms-1" :class="r.habilitado ? 'bg-primary' : 'bg-secondary'">{{ r.habilitado ? 'Online' : 'Cerrado' }}</span>
                      </div>
                      <div class="btn-group btn-group-sm flex-shrink-0">
                        <button @click="abrirNotas(r)" class="btn btn-outline-success fw-bold" :aria-label="'Cargar resultados del recuperatorio del ' + fechaDMA(r.fecha)"><i class="bi bi-pencil-square"></i></button>
                        <button v-if="r.online" @click="abrirConfigRecuperatorio(r)" class="btn btn-outline-dark" title="Configurar" aria-label="Configurar recuperatorio online"><i class="bi bi-sliders"></i></button>
                        <button @click="confirmarEliminar(r)" class="btn btn-outline-danger" title="Borrar" aria-label="Borrar recuperatorio"><i class="bi bi-trash3"></i></button>
                      </div>
                    </div>
                  </div>

                  <footer class="d-flex flex-wrap gap-2 p-3 mt-auto">
                    <button @click="abrirNotas(g.examen)" class="btn btn-success btn-sm fw-bold flex-fill text-nowrap">
                      <i class="bi bi-pencil-square me-1"></i> {{ g.examen.tipo === 'teorico' ? 'Notas' : 'Resultados' }}
                      <span class="badge bg-white text-success ms-1">{{ g.examen.cargadas }}</span>
                    </button>
                    <button v-if="g.examen.desaprobados && admiteRecuperatorio(g.examen)" @click="abrirRecuperatorio(g.examen)" class="btn btn-warning btn-sm fw-bold flex-fill text-nowrap">
                      <i class="bi bi-arrow-repeat me-1"></i> Recuperatorio
                    </button>
                  </footer>
                </article>
              </div>
            </div>
          </template>

          <!-- PLANILLA -->
          <template v-else>
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <p class="small text-muted mb-0">{{ alumnosPlanilla.length }} alumnos regulares · {{ columnasPlanilla.length }} exámenes</p>
              <input v-model="filtroAlumno" class="form-control form-control-sm shadow-none" style="max-width: 260px;" placeholder="BUSCAR ALUMNO O DNI..." aria-label="Buscar alumno">
            </div>
            <div v-if="!alumnosPlanilla.length" class="text-center py-5 text-muted fw-bold">No hay alumnos regulares para mostrar.</div>
            <template v-else>
              <div class="d-none d-lg-block table-responsive border rounded shadow-sm">
                <table class="table table-hover table-bordered align-middle mb-0 text-nowrap planilla" style="font-size: 0.78rem;">
                  <thead class="table-light">
                    <tr>
                      <th class="py-2 ps-3 text-uppercase text-muted col-alumno">Alumno</th>
                      <th class="py-2 text-center text-uppercase text-muted">Curso</th>
                      <th v-for="e in columnasPlanilla" :key="'th-' + e.id" class="py-2 text-center text-muted col-examen" :title="e.clase ? e.titulo + ' · ' + e.clase : e.titulo">
                        <div class="fw-bold text-dark text-truncate">{{ e.titulo }}</div>
                        <div class="fw-normal" style="font-size: 0.68rem;">{{ etiquetaColumna(e) }} · {{ fechaDMA(e.fecha) }}</div>
                      </th>
                      <th class="py-2 text-center text-uppercase text-muted">Aprobados</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="a in alumnosPlanilla" :key="'pl-' + a.id">
                      <td class="ps-3 col-alumno">
                        <div class="fw-bold text-dark text-uppercase">{{ a.apellido }}, {{ a.nombre }}</div>
                        <div class="text-muted" style="font-size: 0.68rem;">DNI {{ a.dni }}</div>
                      </td>
                      <td class="text-center"><span class="badge" :class="MODALIDADES_CURSO[a.modalidadCurso]?.clase">{{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}</span></td>
                      <td v-for="e in columnasPlanilla" :key="'c-' + a.id + '-' + e.id" class="text-center">
                        <span v-if="!correspondeExamen(e, a)" class="text-muted opacity-50" title="No le corresponde">·</span>
                        <template v-else-if="celda(e, a)">
                          <span v-if="celda(e, a).ausente" class="badge bg-secondary">AUS</span>
                          <span v-else-if="celda(e, a).nota !== null" class="fw-bold" :class="aprobadoCelda(e, a) ? 'text-success' : 'text-danger'">{{ textoCelda(e, a) }}</span>
                          <button v-if="celda(e, a).rendidoOnline" type="button" class="btn btn-link btn-sm p-0 ms-1 text-danger align-baseline" :disabled="descargandoPlanilla === a.id + '-' + e.id" title="Descargar PDF" :aria-label="'PDF de ' + a.apellido" @click="descargarPdfPlanilla(e, a)">
                            <i class="bi bi-file-earmark-pdf"></i>
                          </button>
                        </template>
                        <span v-else class="text-muted">—</span>
                      </td>
                      <td class="text-center fw-bold text-dark">{{ aprobadosAlumno(a) }} / {{ columnasPlanilla.filter(e => correspondeExamen(e, a)).length }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-lg-none d-flex flex-column gap-3">
                <div v-for="a in alumnosPlanilla" :key="'plm-' + a.id" class="card border-light-subtle shadow-sm rounded-3">
                  <div class="card-body p-3 small">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div class="min-w-0">
                        <div class="fw-bold text-dark text-uppercase">{{ a.apellido }}, {{ a.nombre }}</div>
                        <div class="text-muted" style="font-size: 0.7rem;">DNI {{ a.dni }}</div>
                      </div>
                      <span class="badge bg-dark flex-shrink-0">{{ aprobadosAlumno(a) }} / {{ columnasPlanilla.filter(e => correspondeExamen(e, a)).length }} aprob.</span>
                    </div>
                    <div v-for="e in columnasPlanilla.filter(e => correspondeExamen(e, a))" :key="'plme-' + a.id + '-' + e.id" class="fila-planilla d-flex justify-content-between align-items-center gap-2">
                      <div class="min-w-0">
                        <div class="text-dark text-break">{{ e.titulo }}</div>
                        <div class="text-muted" style="font-size: 0.68rem;">{{ etiquetaColumna(e) }} · {{ fechaDMA(e.fecha) }}</div>
                      </div>
                      <div class="flex-shrink-0 text-end">
                        <template v-if="celda(e, a)">
                          <span v-if="celda(e, a).ausente" class="badge bg-secondary">Ausente</span>
                          <span v-else-if="celda(e, a).nota !== null" class="fw-bold" :class="aprobadoCelda(e, a) ? 'text-success' : 'text-danger'">{{ textoCelda(e, a) }}</span>
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
          <template v-if="form.tipo === 'fisico'">
            <div class="col-12">
              <div class="d-flex flex-column flex-sm-row gap-2" role="radiogroup" aria-label="Tipo de examen físico">
                <label class="opcion-fisico flex-fill" :class="{ activa: !form.esFinal }">
                  <input v-model="form.esFinal" class="form-check-input me-2" type="radio" :value="false">
                  <span class="fw-bold">Simulacro</span>
                  <span class="d-block small text-muted">Para ver cómo están físicamente. No cuenta para el curso ni tiene recuperatorio.</span>
                </label>
                <label class="opcion-fisico flex-fill" :class="{ activa: form.esFinal }">
                  <input v-model="form.esFinal" class="form-check-input me-2" type="radio" :value="true">
                  <span class="fw-bold">Examen físico final</span>
                  <span class="d-block small text-muted">Define el resultado del físico y permite programar recuperatorio.</span>
                </label>
              </div>
            </div>
            <div class="col-12">
              <div class="alert alert-light border small py-2 mb-0"><i class="bi bi-info-circle me-1"></i> Se carga el nivel alcanzado. {{ TEXTO_UMBRALES_FISICO }}.</div>
            </div>
          </template>
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

    <!-- MODAL RECUPERATORIO -->
    <ModalBase :show="!!recuperatorio" @close="recuperatorio = null" icono="restart_alt" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="680px">
      <template #header>
        <div v-if="recuperatorio" class="text-center w-100">
          <span class="fw-bold fs-5">{{ recuperatorio.idExamen ? 'Configurar recuperatorio' : 'Programar recuperatorio' }}</span>
          <div class="text-muted small mt-1">{{ recuperatorio.titulo }}</div>
        </div>
      </template>
      <form v-if="recuperatorio" id="formRecuperatorio" class="text-start" novalidate @submit.prevent="guardarRecuperatorio">
        <p v-if="!recuperatorio.idExamen" class="small text-muted">
          Solo lo pueden rendir los <strong>{{ recuperatorio.desaprobados }}</strong> aspirante(s) que desaprobaron o estuvieron ausentes en el examen original. Les llega una notificación.
        </p>
        <div v-if="!recuperatorio.idExamen" class="mb-3">
          <label for="recup-fecha" class="form-label small fw-bold text-dark">Fecha del recuperatorio *</label>
          <input id="recup-fecha" v-model="recuperatorio.fecha" type="date" class="form-control" :class="{ 'is-invalid': intentoRecuperatorio && !recuperatorio.fecha }">
        </div>
        <ConfigExamenOnline v-if="recuperatorio.online" ref="configRef" v-model="recuperatorio.config" prefijo="recup" :intento="intentoRecuperatorio" />
        <div v-else class="alert alert-light border small py-2 mb-0">
          <i class="bi bi-info-circle me-1"></i> Después cargás el resultado desde "{{ recuperatorio.tipo === 'teorico' ? 'Cargar notas' : 'Cargar resultados' }}" del recuperatorio.
        </div>
      </form>
      <template #footer>
        <button type="button" @click="recuperatorio = null" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formRecuperatorio" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardandoRecuperatorio">
          <span v-if="guardandoRecuperatorio" class="spinner-border spinner-border-sm me-1"></span>
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
      <div v-if="cargandoNotas" class="text-center py-4"><span class="spinner-border text-success"></span></div>
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
          <div class="small mb-3">
            <span class="badge bg-success me-1">{{ resumenNotas.aprobados }} aprobados</span>
            <span class="badge bg-danger me-1">{{ resumenNotas.desaprobados }} desaprobados</span>
            <span class="badge bg-secondary me-1">{{ resumenNotas.ausentes }} ausentes</span>
            <span class="badge bg-light text-muted border">{{ resumenNotas.sin }} sin nota</span>
          </div>
          <div class="d-flex flex-column gap-2">
            <div v-if="esPorAspirante && !filasVisibles.length" class="text-muted small fst-italic">Todavía no agregaste aspirantes.</div>
            <div v-for="n in filasVisibles" :key="n.id" class="fila-nota">
              <div class="row g-2 align-items-center">
                <div class="col-12 min-w-0" :class="esPorAspirante ? 'col-md-5' : 'col-md-4'">
                  <div class="fw-bold text-dark small text-uppercase text-break">{{ n.apellido }}, {{ n.nombre }}</div>
                  <div class="text-muted" style="font-size: 0.72rem;">
                    DNI {{ n.dni }} · {{ MODALIDADES_CURSO[n.modalidadCurso]?.corta }}<template v-if="examenNotas.tipo === 'fisico'"> · aprueba con {{ formatoNota(n.umbralFisico) }}</template>
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
import ConfigExamenOnline from '@/components/ConfigExamenOnline.vue'
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
  parcialito: 'Teóricos de cada clase. Se programan desde Clases y Asistencia.',
  final: 'Se programa desde Clases y Asistencia tildando "Es el examen teórico final".',
  practico: 'A cada aspirante se le carga Aprobado o Desaprobado.',
  fisico: 'Simulacros para ver cómo están y el examen físico final, que es el que cuenta y tiene recuperatorio.',
}
const VACIO_PESTANA = {
  parcialito: 'Todavía no hay parcialitos programados.',
  final: 'Todavía no programaste el teórico final.',
  practico: 'Todavía no cargaste exámenes prácticos.',
  fisico: 'Todavía no cargaste exámenes físicos.',
}
const pestana = ref('parcialito')

const pestanaDe = (e) => (e.tipo === 'teorico' ? (e.esFinal ? 'final' : 'parcialito') : e.tipo)

// Los recuperatorios se muestran dentro de su examen original
const grupos = computed(() => {
  const resultado = { parcialito: [], final: [], practico: [], fisico: [], planilla: [] }
  examenesFiltrados.value.filter(e => !e.idExamenOriginal).forEach(examen => {
    resultado[pestanaDe(examen)]?.push({
      examen,
      recuperatorios: examenesFiltrados.value.filter(r => r.idExamenOriginal === examen.id),
    })
  })
  return resultado
})

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const diaDe = (fecha) => String(fecha || '').substring(8, 10)
const mesDe = (fecha) => MESES_CORTOS[Number(String(fecha || '').substring(5, 7)) - 1] || ''
const porcentaje = (parte, total) => (total ? Math.round(parte / total * 100) : 0)
const admiteRecuperatorio = (e) => e.tipo !== 'fisico' || e.esFinal
const desaprobadosSinAusentes = (e) => Math.max(0, (e.desaprobados || 0) - (e.ausentes || 0))
const criterio = (e) => {
  if (e.tipo === 'fisico') return TEXTO_UMBRALES_FISICO
  if (e.tipo === 'practico') return 'Resultado: aprobado o desaprobado.'
  return `Nota máxima ${formatoNota(e.notaMaxima)} · aprueba con ${formatoNota(e.porcentajeAprobacion)}%`
}
const etiquetaColumna = (e) => {
  const base = e.tipo === 'teorico'
    ? (e.esFinal ? 'Final' : 'Parcialito')
    : e.tipo === 'fisico' ? (e.esFinal ? 'Físico final' : 'Simulacro') : TIPOS_EXAMEN[e.tipo]?.etiqueta
  return e.idExamenOriginal ? `Recup. ${base.toLowerCase()}` : base
}

// ─── Planilla de notas (alumnos x exámenes) ──────────────────────
const planilla = ref({ alumnos: [], notas: [] })
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
    (!texto || normalizarTexto(`${a.apellido} ${a.nombre} ${a.dni}`).includes(texto))
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

const aprobadosAlumno = (a) => columnasPlanilla.value.filter(e => correspondeExamen(e, a) && aprobadoCelda(e, a)).length

const descargarPdfPlanilla = async (e, a) => {
  descargandoPlanilla.value = `${a.id}-${e.id}`
  try {
    await api.getFile({
      entity: 'examen_online_curso_arbitro',
      action: 'descargarPdfExamenCurso',
      payload: { idExamen: e.id, idAlumno: a.id },
    }, `examen_curso_${a.apellido}_${a.dni}.pdf`)
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

// En práctico y físico se agregan los aspirantes que rindieron con un select
const esPorAspirante = computed(() => ['practico', 'fisico'].includes(examenNotas.value?.tipo))
const filasVisibles = computed(() => (esPorAspirante.value ? notas.value.filter(n => n.agregado) : notas.value))
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
  aprobados: filasVisibles.value.filter(n => resultado(n) === true).length,
  desaprobados: filasVisibles.value.filter(n => resultado(n) === false).length,
  ausentes: filasVisibles.value.filter(n => n.ausente).length,
  sin: filasVisibles.value.filter(n => !n.ausente && notaNumero(n) === null).length,
}))

const descargandoPdf = ref(null)

const descargarPdf = async (n) => {
  descargandoPdf.value = n.id
  try {
    await api.getFile({
      entity: 'examen_online_curso_arbitro',
      action: 'descargarPdfExamenCurso',
      payload: { idExamen: examenNotas.value.id, idAlumno: n.id },
    }, `examen_curso_${n.apellido}_${n.dni}.pdf`)
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    descargandoPdf.value = null
  }
}

// ─── Recuperatorios ──────────────────────────────────────────────
const recuperatorio = ref(null)
const intentoRecuperatorio = ref(false)
const guardandoRecuperatorio = ref(false)
const configRef = ref(null)
const configVacia = () => ({ cantidadPreguntas: 20, tiempoLimiteMin: 25, reglas: [], habilitado: true })

const abrirRecuperatorio = (e) => {
  intentoRecuperatorio.value = false
  recuperatorio.value = {
    idExamen: null, idExamenOriginal: e.id, titulo: e.titulo, tipo: e.tipo, online: e.online,
    desaprobados: e.desaprobados, fecha: '', config: configVacia(),
  }
}

const abrirConfigRecuperatorio = async (e) => {
  try {
    const res = await api.get({ entity: 'examen_online_curso_arbitro', action: 'obtenerConfigOnlineExamenCurso', payload: { idExamen: e.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar la configuración')
    intentoRecuperatorio.value = false
    recuperatorio.value = { idExamen: e.id, titulo: e.titulo, tipo: e.tipo, online: true, config: res.payload }
  } catch (err) {
    notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
  }
}

const guardarRecuperatorio = async () => {
  intentoRecuperatorio.value = true
  const r = recuperatorio.value
  const errorConfig = r.online ? configRef.value?.validar() : ''
  if ((!r.idExamen && !r.fecha) || errorConfig) {
    notificar({ titulo: 'Faltan datos', mensaje: errorConfig || 'Elegí la fecha del recuperatorio.', tipo: 'danger' })
    return
  }
  guardandoRecuperatorio.value = true
  try {
    const res = r.idExamen
      ? await api.post({ entity: 'examen_online_curso_arbitro', action: 'actualizarRecuperatorioOnlineCurso', payload: { idExamen: r.idExamen, ...r.config } })
      : await api.post({ entity: 'examen_online_curso_arbitro', action: 'programarRecuperatorioCurso', payload: { idExamenOriginal: r.idExamenOriginal, fecha: r.fecha, ...r.config } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar el recuperatorio')
    toast({ titulo: 'Guardado', mensaje: r.idExamen ? 'El recuperatorio se actualizó.' : 'El recuperatorio se programó y se avisó a los aspirantes.', tipo: 'success' })
    recuperatorio.value = null
    await cargarExamenes()
  } catch (err) {
    notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
  } finally {
    guardandoRecuperatorio.value = false
  }
}

const abrirNotas = async (e) => {
  examenNotas.value = { ...e }
  notas.value = []
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
    }))
  } catch (err) {
    notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
    mostrarNotas.value = false
  } finally {
    cargandoNotas.value = false
  }
}

const guardarNotas = async () => {
  if (esPorAspirante.value && notas.value.some(n => n.agregado && !n.ausente && notaNumero(n) === null)) {
    notificar({ titulo: 'Faltan resultados', mensaje: 'Completá el resultado de cada aspirante agregado o marcalo ausente.', tipo: 'danger' })
    return
  }
  if (notas.value.some(notaInvalida)) {
    notificar({ titulo: 'Notas inválidas', mensaje: `Las notas tienen que estar entre 0 y ${formatoNota(examenNotas.value.notaMaxima)}.`, tipo: 'danger' })
    return
  }
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
.recuperatorios { border-top: 1px dashed #fcd34d; padding-top: 8px; }
.recuperatorio { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; }
.fila-planilla { border-top: 1px solid #f1f5f9; padding: 6px 0; }
.opcion-fisico { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; cursor: pointer; }
.opcion-fisico.activa { border-color: #0d6efd; background: #eff6ff; }
.estado-vacio { border: 2px dashed #e2e8f0; border-radius: 12px; }
.etiquetas-examen .badge { white-space: normal; text-align: left; line-height: 1.3; }
.fila-nota { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
.min-w-0 { min-width: 0; }
.planilla .col-alumno { position: sticky; left: 0; background: #fff; z-index: 1; min-width: 200px; }
.planilla thead .col-alumno { background: #f8f9fa; }
.planilla .col-examen { max-width: 160px; min-width: 110px; }
</style>
