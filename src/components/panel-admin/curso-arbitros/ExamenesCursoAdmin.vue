<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-journal-check me-1"></i> Exámenes del Curso
            </h4>
            <span class="text-muted small d-block mt-1">{{ examenesFiltrados.length }} exámenes en {{ anio }} · los teóricos se programan desde Clases y Asistencia</span>
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
            <button @click="abrirNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">post_add</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo práctico / físico</span>
            </button>
          </div>
        </div>

        <div class="card-body p-3 bg-white">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger"></span></div>
          <div v-else-if="!examenesFiltrados.length" class="text-center py-5 text-muted">
            <span class="material-icons d-block fs-1 mb-2 opacity-50">assignment</span>
            <span class="fw-bold">No hay exámenes cargados para {{ anio }}.</span>
          </div>
          <div v-else class="row g-3">
            <div v-for="e in examenesFiltrados" :key="e.id" class="col-12 col-md-6 col-xl-4">
              <div class="tarjeta-examen border rounded-3 p-3 h-100 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div class="min-w-0">
                    <div class="fw-bold text-dark text-break">{{ e.titulo }}</div>
                    <div class="small text-muted text-break">{{ fechaDMA(e.fecha) }}<template v-if="e.clase"> · {{ e.clase }}</template></div>
                  </div>
                  <span class="badge flex-shrink-0" :class="TIPOS_EXAMEN[e.tipo]?.clase">{{ TIPOS_EXAMEN[e.tipo]?.etiqueta }}</span>
                </div>
                <div class="d-flex flex-wrap gap-1 mt-2 etiquetas-examen">
                  <span v-if="e.tipo === 'teorico'" class="badge" :class="e.esFinal ? 'bg-danger' : 'bg-light text-dark border'">{{ e.esFinal ? 'Teórico final' : 'Parcialito' }}</span>
                  <span v-if="e.idExamenOriginal" class="badge bg-warning text-dark"><i class="bi bi-arrow-repeat me-1"></i>Recuperatorio</span>
                  <span class="badge" :class="claseCurso(e.curso)">{{ etiquetaCurso(e.curso) }}</span>
                  <span v-if="e.online" class="badge" :class="e.habilitado ? 'bg-primary' : 'bg-secondary'"><i class="bi bi-laptop me-1"></i>Online{{ e.habilitado ? ' · habilitado' : ' · cerrado' }}</span>
                  <span v-if="e.tipo === 'teorico'" class="badge bg-light text-dark border">Nota máx. {{ formatoNota(e.notaMaxima) }} · aprueba con {{ formatoNota(e.porcentajeAprobacion) }}%</span>
                  <span v-else-if="e.tipo === 'practico'" class="badge bg-light text-dark border">Aprobado / Desaprobado</span>
                </div>
                <div v-if="e.tipo === 'fisico'" class="small text-muted mt-2">{{ TEXTO_UMBRALES_FISICO }}</div>
                <div class="small mt-2 text-break">
                  <span class="text-dark fw-bold">{{ e.cargadas }}</span> {{ e.tipo === 'teorico' ? 'notas cargadas' : 'resultados' }} ·
                  <span class="text-success fw-bold">{{ e.aprobados }}</span> aprobados ·
                  <span class="text-secondary fw-bold">{{ e.ausentes }}</span> ausentes
                  <template v-if="e.recuperatorios"> · <span class="text-warning-emphasis fw-bold">{{ e.recuperatorios }}</span> recuperatorio(s)</template>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-auto pt-3">
                  <button @click="abrirNotas(e)" class="btn btn-sm btn-success flex-fill fw-bold text-nowrap"><i class="bi bi-pencil-square me-1"></i> {{ e.tipo === 'teorico' ? 'Cargar notas' : 'Cargar resultados' }}</button>
                  <button v-if="!e.idExamenOriginal && e.desaprobados" @click="abrirRecuperatorio(e)" class="btn btn-sm btn-warning fw-bold flex-fill text-nowrap"><i class="bi bi-arrow-repeat me-1"></i> Recuperatorio</button>
                  <button v-if="e.idExamenOriginal && e.online" @click="abrirConfigRecuperatorio(e)" class="btn btn-sm btn-outline-dark fw-bold" title="Configurar examen online" aria-label="Configurar examen online"><i class="bi bi-sliders"></i></button>
                  <button @click="abrirEditar(e)" class="btn btn-sm btn-outline-primary fw-bold" title="Editar examen" aria-label="Editar examen"><i class="bi bi-pencil"></i></button>
                  <button @click="confirmarEliminar(e)" class="btn btn-sm btn-outline-danger fw-bold" title="Borrar examen" aria-label="Borrar examen"><i class="bi bi-trash3"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PLANILLA DE NOTAS -->
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-table me-1"></i> Planilla de notas
            </h4>
            <span class="text-muted small d-block mt-1">{{ alumnosPlanilla.length }} alumnos regulares en {{ anio }} · {{ columnasPlanilla.length }} exámenes</span>
          </div>
          <input v-model="filtroAlumno" class="form-control form-control-sm shadow-none" style="max-width: 260px;" placeholder="BUSCAR ALUMNO O DNI..." aria-label="Buscar alumno">
        </div>
        <div class="card-body p-0 p-md-3">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger"></span></div>
          <div v-else-if="!alumnosPlanilla.length" class="text-center py-5 text-muted fw-bold">No hay alumnos regulares para mostrar.</div>
          <div v-else class="table-responsive border rounded shadow-sm">
            <table class="table table-hover table-bordered align-middle mb-0 text-nowrap planilla" style="font-size: 0.78rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-2 ps-3 text-uppercase text-muted col-alumno">Alumno</th>
                  <th class="py-2 text-center text-uppercase text-muted">Curso</th>
                  <th v-for="e in columnasPlanilla" :key="'th-' + e.id" class="py-2 text-center text-muted col-examen" :title="e.clase ? e.titulo + ' · ' + e.clase : e.titulo">
                    <div class="fw-bold text-dark text-truncate">{{ e.titulo }}</div>
                    <div class="fw-normal" style="font-size: 0.68rem;">{{ e.tipo === 'teorico' ? (e.esFinal ? 'Final' : 'Parcialito') : TIPOS_EXAMEN[e.tipo]?.etiqueta }} · {{ fechaDMA(e.fecha) }}</div>
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
                    <span v-if="!correspondeExamen(e, a)" class="text-muted opacity-50" title="No corresponde a su curso">·</span>
                    <template v-else-if="celda(e, a)">
                      <span v-if="celda(e, a).ausente" class="badge bg-secondary">AUS</span>
                      <span v-else-if="celda(e, a).nota !== null" class="fw-bold" :class="aprobadoCelda(e, a) ? 'text-success' : 'text-danger'">
                        {{ textoCelda(e, a) }}
                      </span>
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
        </div>
      </div>
    </div>

    <!-- MODAL EXAMEN -->
    <ModalBase :show="mostrarModal" @close="mostrarModal = false" :icono="form.id ? 'edit_note' : 'post_add'" colorIcono="bg-danger-subtle text-danger" maxWidth="620px">
      <template #header>
        <span class="fw-bold fs-5">{{ form.id ? 'Editar examen' : 'Nuevo examen práctico o físico' }}</span>
      </template>
      <form id="formExamenCurso" class="text-start" novalidate @submit.prevent="guardarExamen">
        <div class="row g-3">
          <div class="col-12">
            <label for="ex-titulo" class="form-label small fw-bold text-dark">Título *</label>
            <input id="ex-titulo" v-model.trim="form.titulo" type="text" maxlength="150" class="form-control" :class="{ 'is-invalid': intento && !form.titulo }" :placeholder="form.tipo === 'fisico' ? 'Ej: Test físico 1' : 'Ej: Práctico en partido de mini'">
          </div>
          <div class="col-6 col-md-4">
            <label for="ex-tipo" class="form-label small fw-bold text-dark">Tipo</label>
            <select id="ex-tipo" v-model="form.tipo" class="form-select" :disabled="form.tipo === 'teorico'">
              <option v-if="form.tipo === 'teorico'" value="teorico">Teórico</option>
              <option value="practico">Práctico</option>
              <option value="fisico">Físico</option>
            </select>
          </div>
          <div class="col-6 col-md-4">
            <label for="ex-fecha" class="form-label small fw-bold text-dark">Fecha *</label>
            <input id="ex-fecha" v-model="form.fecha" type="date" class="form-control" :class="{ 'is-invalid': intento && !form.fecha }">
          </div>
          <div class="col-12 col-md-4">
            <label for="ex-curso" class="form-label small fw-bold text-dark">Curso</label>
            <select id="ex-curso" v-model="form.curso" class="form-select">
              <option value="ambos">Ambos</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.etiqueta }}</option>
            </select>
          </div>
          <div v-if="form.tipo === 'fisico'" class="col-12">
            <div class="alert alert-light border small py-2 mb-0"><i class="bi bi-info-circle me-1"></i> Se carga el nivel alcanzado. {{ TEXTO_UMBRALES_FISICO }}.</div>
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
const examenVacio = () => ({ id: null, titulo: '', tipo: 'practico', fecha: '', curso: 'ambos', idClase: null, notaMaxima: 100, porcentajeAprobacion: PORCENTAJE_DEFECTO })
const form = ref(examenVacio())
const mostrarModal = ref(false)
const intento = ref(false)
const guardando = ref(false)

const abrirNuevo = () => {
  form.value = examenVacio()
  intento.value = false
  mostrarModal.value = true
}

const abrirEditar = (e) => {
  form.value = { id: e.id, titulo: e.titulo, tipo: e.tipo, fecha: e.fecha, curso: e.curso, idClase: e.idClase, notaMaxima: e.notaMaxima, porcentajeAprobacion: e.porcentajeAprobacion }
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
.tarjeta-examen { background: #fff; min-width: 0; overflow-wrap: anywhere; }
.etiquetas-examen .badge { white-space: normal; text-align: left; line-height: 1.3; }
.fila-nota { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
.min-w-0 { min-width: 0; }
.planilla .col-alumno { position: sticky; left: 0; background: #fff; z-index: 1; min-width: 200px; }
.planilla thead .col-alumno { background: #f8f9fa; }
.planilla .col-examen { max-width: 160px; min-width: 110px; }
</style>
