<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-person-check-fill me-1"></i> Alumnos Regulares {{ anio }}
            </h4>
            <span class="text-muted small d-block mt-1">{{ filas.length }} alumnos · parcialitos, teórico final, práctico, físico y nota final</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <select v-model="filtros.modalidad" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 150px;" aria-label="Curso">
              <option value="">CURSO</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.corta.toUpperCase() }}</option>
            </select>
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 110px;" aria-label="Año">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <button @click="cargar" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
          </div>
        </div>

        <div class="card-body bg-white" :class="cargando ? 'p-3' : 'p-0 border-top'">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando alumnos regulares...</p></div>
          <template v-else>
            <!-- Barra de herramientas: búsqueda + filtro + descargar + leyenda, igual que la planilla de Exámenes -->
            <div class="d-flex flex-wrap gap-3 align-items-center px-3 py-2 border-bottom bg-light small">
              <div class="busqueda-wrap">
                <input v-model="filtros.texto" class="form-control form-control-sm shadow-none" placeholder="BUSCAR ALUMNO..." aria-label="Buscar alumno">
                <button v-if="filtros.texto" class="btn-limpiar-busqueda" @click="filtros.texto = ''" title="Limpiar búsqueda" type="button">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <select v-model="filtros.notaFinal" class="form-select form-select-sm shadow-none text-uppercase text-dark w-auto" aria-label="Nota final">
                <option value="">NOTA FINAL</option>
                <option value="pendiente">PENDIENTE</option>
                <option value="aprobado">APROBÓ</option>
                <option value="desaprobado">DESAPROBÓ</option>
              </select>
              <button
                type="button"
                @click="exportarExcel"
                class="btn btn-success btn-sm fw-bold d-flex align-items-center gap-1"
                :disabled="!filas.length || generandoExcel"
              >
                <span v-if="generandoExcel" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-file-earmark-excel-fill"></i> Descargar Excel
              </button>
              <span class="text-muted text-nowrap">{{ filas.length }} alumnos</span>
              <span class="ms-auto d-flex flex-wrap gap-3">
                <span><span class="cuadrito cuadrito-verde"></span> Aprobado / {{ ASISTENCIA_MINIMA }}% o más</span>
                <span><span class="cuadrito cuadrito-roja"></span> Desaprobado / menos de {{ ASISTENCIA_MINIMA }}%</span>
                <span><span class="cuadrito"></span> Pendiente</span>
                <span><span class="cuadrito cuadrito-na"></span> No le corresponde</span>
              </span>
            </div>

            <div v-if="!filas.length" class="text-center py-5 text-muted fw-bold">No hay alumnos para mostrar.</div>
            <template v-else>
            <!-- ESCRITORIO -->
            <div class="d-none d-lg-block tabla-scroll">
              <table class="tabla-excel">
                <thead>
                  <tr>
                    <th class="col-alumno esquina">ALUMNO</th>
                    <th class="th-corta">CURSO</th>
                    <th class="th-media" :title="`Presente sobre las clases dictadas (mínimo ${ASISTENCIA_MINIMA}%)`">CLASES</th>
                    <th class="th-media" :title="`Presente sobre los encuentros convocados con presente o ausente cargado (mínimo ${ASISTENCIA_MINIMA}%)`">MINI</th>
                    <th class="th-media" title="Aprobados sobre el total: directos y con recuperatorio">PARCIALITOS</th>
                    <th class="th-media">TEÓRICO FINAL</th>
                    <th class="th-media">PRÁCTICO</th>
                    <th class="th-media">FÍSICO</th>
                    <th class="th-larga">NOTA FINAL</th>
                    <th class="th-corta">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in filas" :key="f.alumno.id">
                    <td class="col-alumno celda-nombre text-uppercase">{{ f.alumno.apellido }}, {{ f.alumno.nombre }}</td>
                    <td class="celda"><span class="badge" :class="MODALIDADES_CURSO[f.alumno.modalidadCurso]?.clase">{{ MODALIDADES_CURSO[f.alumno.modalidadCurso]?.corta }}</span></td>
                    <td class="celda" :class="celdaPorcentaje(f.asistencia.porcentaje)" :title="`${f.asistencia.presentes} de ${f.asistencia.total} clases`">
                      {{ f.asistencia.presentes }}/{{ f.asistencia.total }}<template v-if="f.asistencia.porcentaje !== null"> · {{ f.asistencia.porcentaje }}%</template>
                    </td>
                    <td v-if="f.alumno.modalidadCurso !== 'anual'" class="celda celda-na" title="No le corresponde"></td>
                    <td v-else class="celda" :class="celdaPorcentaje(f.mini.porcentaje)" :title="`${f.mini.presentes} de ${f.mini.total} encuentros con asistencia (${f.mini.convocados} convocados)`">
                      {{ f.mini.presentes }}/{{ f.mini.total }}<template v-if="f.mini.porcentaje !== null"> · {{ f.mini.porcentaje }}%</template>
                    </td>
                    <td class="celda" :class="celdaParcialitos(f)" :title="textoParcialitos(f)">
                      <template v-if="f.parcialitos.total">
                        {{ f.parcialitos.aprobados }}/{{ f.parcialitos.total }}
                        <span v-if="f.parcialitos.recuperados" class="detalle-parcialitos text-primary">· {{ f.parcialitos.recuperados }} con recup.</span>
                        <span v-if="f.parcialitos.recuperando" class="detalle-parcialitos text-warning-emphasis">· {{ f.parcialitos.recuperando }} recuperando</span>
                        <span v-if="f.parcialitos.desaprobados" class="detalle-parcialitos text-danger">· {{ f.parcialitos.desaprobados }} desap.</span>
                      </template>
                    </td>
                    <td class="celda" :class="CELDA_RESULTADO[f.final]">{{ TEXTO_RESULTADO[f.final] }}</td>
                    <td class="celda" :class="CELDA_RESULTADO[f.practico]">{{ TEXTO_RESULTADO[f.practico] }}</td>
                    <td class="celda" :class="CELDA_RESULTADO[f.fisico]">{{ TEXTO_RESULTADO[f.fisico] }}</td>
                    <td class="celda celda-total" :class="CELDA_RESULTADO[f.notaFinal]">{{ NOTA_FINAL[f.notaFinal].etiqueta.toUpperCase() }}</td>
                    <td class="celda">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="abrirNotaFinal(f)" class="btn btn-link btn-sm p-0 text-danger" title="Nota final" :aria-label="'Nota final de ' + f.alumno.apellido">
                          <span class="material-icons" style="font-size:18px;">workspace_premium</span>
                        </button>
                        <button @click="seleccionado = f" class="btn btn-link btn-sm p-0 text-primary" title="Ver detalle" :aria-label="'Ver detalle de ' + f.alumno.apellido">
                          <span class="material-icons" style="font-size:18px;">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CELULAR Y TABLET -->
            <div class="d-lg-none p-3">
              <div v-for="f in filas" :key="'m-' + f.alumno.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-body p-3 small text-dark">
                  <div class="d-flex justify-content-between align-items-start gap-2">
                    <div class="min-w-0">
                      <div class="fw-bold text-uppercase">{{ f.alumno.apellido }}, {{ f.alumno.nombre }}</div>
                    </div>
                    <span class="badge flex-shrink-0" :class="MODALIDADES_CURSO[f.alumno.modalidadCurso]?.clase">{{ MODALIDADES_CURSO[f.alumno.modalidadCurso]?.corta }}</span>
                  </div>
                  <div class="row g-2 mt-2">
                    <div class="col-6">
                      <div class="dato-etiqueta">Clases</div>
                      <span class="fw-bold" :class="clasePorcentaje(f.asistencia.porcentaje)">{{ f.asistencia.presentes }}/{{ f.asistencia.total }}</span>
                    </div>
                    <div v-if="f.alumno.modalidadCurso === 'anual'" class="col-6">
                      <div class="dato-etiqueta">Mini</div>
                      <span class="fw-bold" :class="clasePorcentaje(f.mini.porcentaje)">{{ f.mini.presentes }}/{{ f.mini.total }}</span>
                    </div>
                    <div class="col-12">
                      <div class="dato-etiqueta">Parcialitos</div>
                      <span class="fw-bold">{{ textoParcialitos(f) || '—' }}</span>
                    </div>
                    <div class="col-6">
                      <div class="dato-etiqueta">Teórico final</div>
                      <span class="badge" :class="RESULTADOS[f.final].clase">{{ RESULTADOS[f.final].etiqueta }}</span>
                    </div>
                    <div class="col-6">
                      <div class="dato-etiqueta">Práctico</div>
                      <span class="badge" :class="RESULTADOS[f.practico].clase">{{ RESULTADOS[f.practico].etiqueta }}</span>
                    </div>
                    <div class="col-6">
                      <div class="dato-etiqueta">Físico</div>
                      <span class="badge" :class="RESULTADOS[f.fisico].clase">{{ RESULTADOS[f.fisico].etiqueta }}</span>
                    </div>
                    <div class="col-12">
                      <div class="dato-etiqueta">Nota final</div>
                      <span class="badge" :class="NOTA_FINAL[f.notaFinal].clase">{{ NOTA_FINAL[f.notaFinal].etiqueta }}</span>
                    </div>
                  </div>
                  <div class="d-flex gap-2 mt-3">
                    <button @click="abrirNotaFinal(f)" class="btn btn-sm btn-outline-danger flex-fill fw-bold"><i class="bi bi-award me-1"></i> Nota final</button>
                    <button @click="seleccionado = f" class="btn btn-sm btn-outline-primary flex-fill fw-bold"><i class="bi bi-eye me-1"></i> Detalle</button>
                  </div>
                </div>
              </div>
            </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- NOTA FINAL -->
    <ModalBase :show="!!notaFinal" @close="notaFinal = null" icono="workspace_premium" colorIcono="bg-danger-subtle text-danger" maxWidth="560px">
      <template #header>
        <div v-if="notaFinal" class="text-center w-100">
          <span class="fw-bold fs-5">Nota final del curso</span>
          <div class="text-muted small mt-1 text-uppercase">{{ notaFinal.fila.alumno.apellido }}, {{ notaFinal.fila.alumno.nombre }}</div>
        </div>
      </template>
      <div v-if="notaFinal" class="text-start">
        <div class="d-flex flex-wrap gap-1 mb-3">
          <span class="badge bg-light text-dark border">Parcialitos: {{ notaFinal.fila.parcialitos.aprobados }}/{{ notaFinal.fila.parcialitos.total }}</span>
          <span class="badge" :class="RESULTADOS[notaFinal.fila.final].clase">Teórico final: {{ RESULTADOS[notaFinal.fila.final].etiqueta }}</span>
          <span class="badge" :class="RESULTADOS[notaFinal.fila.practico].clase">Práctico: {{ RESULTADOS[notaFinal.fila.practico].etiqueta }}</span>
          <span class="badge" :class="RESULTADOS[notaFinal.fila.fisico].clase">Físico: {{ RESULTADOS[notaFinal.fila.fisico].etiqueta }}</span>
        </div>
        <div class="d-flex flex-column gap-2 mb-3" role="radiogroup" aria-label="Nota final">
          <label v-for="(op, clave) in NOTA_FINAL" :key="clave" class="opcion-final d-flex align-items-center gap-2" :class="{ activa: notaFinal.valor === clave }">
            <input v-model="notaFinal.valor" class="form-check-input m-0" type="radio" :value="clave">
            <span class="badge" :class="op.clase">{{ op.etiqueta }}</span>
          </label>
        </div>
        <label for="nf-motivo" class="form-label small fw-bold text-dark">Observación (opcional)</label>
        <textarea id="nf-motivo" v-model.trim="notaFinal.motivo" rows="2" maxlength="500" class="form-control"></textarea>
        <div class="form-text">Se actualiza el estado en Legajos del Curso, queda en el historial y se le avisa al aspirante por notificación y email.</div>
      </div>
      <template #footer>
        <button type="button" @click="notaFinal = null" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="button" @click="guardarNotaFinal" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardandoNotaFinal">
          <span v-if="guardandoNotaFinal" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR
        </button>
      </template>
    </ModalBase>

    <!-- DETALLE -->
    <ModalBase :show="!!seleccionado" @close="seleccionado = null" icono="person_search" colorIcono="bg-danger-subtle text-danger" maxWidth="820px">
      <template #header>
        <div v-if="seleccionado" class="text-center w-100">
          <span class="fw-bold fs-5 text-uppercase">{{ seleccionado.alumno.apellido }}, {{ seleccionado.alumno.nombre }}</span>
          <div class="text-muted small mt-1">{{ MODALIDADES_CURSO[seleccionado.alumno.modalidadCurso]?.etiqueta }} {{ anio }}</div>
        </div>
      </template>
      <div v-if="seleccionado" class="text-start">
        <div class="accordion acordeon-seccion">
          <!-- Exámenes rendidos -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button type="button" class="accordion-button" :class="{ collapsed: !seccionesDetalle.examenes }" @click="seccionesDetalle.examenes = !seccionesDetalle.examenes">
                <i class="bi bi-journal-check me-2"></i> Exámenes rendidos
                <span class="badge bg-light text-dark border ms-2">{{ seleccionado.detalleExamenes.length }}</span>
              </button>
            </h2>
            <div v-show="seccionesDetalle.examenes" class="accordion-body">
              <div v-if="!seleccionado.detalleExamenes.length" class="small text-muted fst-italic">No hay exámenes de su curso en {{ anio }}.</div>
              <div v-else class="d-flex flex-column gap-2">
                <div v-for="d in seleccionado.detalleExamenes" :key="'ex-' + d.examen.id" class="fila-detalle">
                  <div class="d-flex justify-content-between align-items-start gap-2">
                    <div class="min-w-0 small">
                      <div class="fw-bold text-dark">{{ d.examen.titulo }}</div>
                      <div class="text-muted">{{ fechaDMA(d.examen.fecha) }}</div>
                    </div>
                    <div class="text-end flex-shrink-0">
                      <div class="fw-bold small">{{ textoNota(d) }}</div>
                      <span v-if="!d.nota" class="badge bg-light text-muted border">No rindió</span>
                      <span v-else-if="d.nota.ausente" class="badge bg-secondary">Ausente</span>
                      <span v-else-if="d.nota.aprobado === true" class="badge bg-success">Aprobado</span>
                      <span v-else-if="d.nota.aprobado === false" class="badge bg-danger">Desaprobado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Asistencia a clases -->
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button type="button" class="accordion-button" :class="{ collapsed: !seccionesDetalle.asistencia }" @click="seccionesDetalle.asistencia = !seccionesDetalle.asistencia">
                <i class="bi bi-calendar-check me-2"></i> Asistencia a clases
                <span class="badge bg-light text-dark border ms-2">{{ seleccionado.detalleClases.length }}</span>
              </button>
            </h2>
            <div v-show="seccionesDetalle.asistencia" class="accordion-body">
              <div v-if="!seleccionado.detalleClases.length" class="small text-muted fst-italic">Todavía no hay clases dictadas.</div>
              <div v-else class="d-flex flex-column gap-1">
                <div v-for="d in seleccionado.detalleClases" :key="'cl-' + d.clase.id" class="fila-detalle d-flex justify-content-between align-items-center gap-2">
                  <span class="small min-w-0"><strong>{{ fechaDMA(d.clase.fecha) }}</strong> · {{ d.clase.titulo }}</span>
                  <span class="badge flex-shrink-0" :class="claseAsistencia(d.asistencia)">{{ textoAsistencia(d.asistencia) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Encuentros de mini (solo curso anual) -->
          <div v-if="seleccionado.alumno.modalidadCurso === 'anual'" class="accordion-item">
            <h2 class="accordion-header">
              <button type="button" class="accordion-button" :class="{ collapsed: !seccionesDetalle.mini }" @click="seccionesDetalle.mini = !seccionesDetalle.mini">
                <i class="bi bi-people me-2"></i> Encuentros de mini
                <span class="badge bg-light text-dark border ms-2">{{ seleccionado.detalleMini.length }}</span>
              </button>
            </h2>
            <div v-show="seccionesDetalle.mini" class="accordion-body">
              <div v-if="!seleccionado.detalleMini.length" class="small text-muted fst-italic">No fue convocado/a a encuentros de mini.</div>
              <div v-else class="d-flex flex-column gap-1">
                <div v-for="m in seleccionado.detalleMini" :key="'mi-' + m.idEncuentro" class="fila-detalle d-flex justify-content-between align-items-center gap-2">
                  <span class="small min-w-0"><strong>{{ fechaDMA(m.fecha) }}</strong> · {{ m.titulo }}</span>
                  <span class="badge flex-shrink-0" :class="claseAsistencia(m.asistencia)">{{ textoAsistencia(m.asistencia) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" @click="seleccionado = null" class="btn btn-dark rounded-pill px-4 fw-bold w-100">CERRAR</button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { textoNotaExamen } from '@/composables/useExamenesCurso'
import { RESULTADOS, NOTA_FINAL, armarSeguimiento } from '@/composables/useSeguimientoCurso'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'
import { ASISTENCIA_MINIMA, colorAsistencia } from '@/composables/useAsistenciaCurso'
import { crearPlanillaExcel, pintarCeldaExcel, pintarCabeceraExcel, anchosColumnasExcel, descargarLibroExcel } from '@/composables/useExcelPlanilla'
import { normalizarTexto } from '@/utils/texto'

useHead({ title: 'Alumnos Regulares del Curso | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual().map(Number))
const datos = ref({ alumnos: [], clases: [], asistencias: [], examenes: [], notas: [], mini: [] })
const cargando = ref(false)
const filtros = reactive({ texto: '', modalidad: '', notaFinal: '' })
const seleccionado = ref(null)

// Secciones abiertas del acordeón del detalle (Exámenes abierto por defecto)
const seccionesDetalle = reactive({ examenes: true, asistencia: false, mini: false })
watch(seleccionado, (nuevo) => {
  if (nuevo) Object.assign(seccionesDetalle, { examenes: true, asistencia: false, mini: false })
})

const seguimiento = computed(() => armarSeguimiento(datos.value))

const filas = computed(() => {
  const texto = normalizarTexto(filtros.texto)
  return seguimiento.value.filter(f =>
    (!filtros.modalidad || f.alumno.modalidadCurso === filtros.modalidad) &&
    (!filtros.notaFinal || f.notaFinal === filtros.notaFinal) &&
    (!texto || normalizarTexto(`${f.alumno.apellido} ${f.alumno.nombre}`).includes(texto))
  )
})

// ─── Planilla (mismos colores que la planilla de Exámenes) ───────
const CELDA_RESULTADO = { aprobado: 'celda-verde', desaprobado: 'celda-roja', pendiente: '' }
const TEXTO_RESULTADO = { aprobado: 'APROBADO', desaprobado: 'DESAPROBADO', pendiente: 'PENDIENTE' }
// Asistencia (clases y mini): verde si llega al mínimo común, rojo si no
const celdaPorcentaje = (p) => (colorAsistencia(p) ? `celda-${colorAsistencia(p)}` : '')
const clasePorcentaje = (p) => ({ verde: 'text-success', roja: 'text-danger' }[colorAsistencia(p)] || 'text-muted')

// Parcialitos: aprobados sobre el total, separando los aprobados directo de los aprobados con recuperatorio
const celdaParcialitos = (f) => {
  const p = f.parcialitos
  if (!p.total) return 'celda-na'
  if (p.desaprobados) return 'celda-roja'
  return p.aprobados === p.total ? 'celda-verde' : ''
}
const textoParcialitos = (f) => {
  const p = f.parcialitos
  if (!p.total) return ''
  const partes = [`${p.aprobados}/${p.total} aprobados`]
  if (p.aprobados) partes.push(`(${p.directos} directo${p.directos === 1 ? '' : 's'}, ${p.recuperados} con recuperatorio)`)
  if (p.recuperando) partes.push(`· ${p.recuperando} recuperando`)
  if (p.desaprobados) partes.push(`· ${p.desaprobados} desaprobado${p.desaprobados === 1 ? '' : 's'}`)
  return partes.join(' ')
}

const textoAsistencia = (a) => (a === 'presente' ? 'Presente' : a === 'ausente' ? 'Ausente' : 'Sin marcar')
const claseAsistencia = (a) => (a === 'presente' ? 'bg-success' : a === 'ausente' ? 'bg-secondary' : 'bg-light text-muted border')
const textoNota = (d) => (d.nota ? textoNotaExamen({ ...d.examen, ...d.nota }) : '—')

const cargar = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'seguimiento_curso_arbitro', action: 'obtenerSeguimientoCurso', payload: { anio: anio.value } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar el seguimiento')
    datos.value = res.payload
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

watch(anio, cargar)

// ─── Nota final (cambia el estado del legajo) ────────────────────
const notaFinal = ref(null)
const guardandoNotaFinal = ref(false)

const abrirNotaFinal = (f) => {
  notaFinal.value = { fila: f, valor: f.notaFinal, motivo: '' }
}

const guardarNotaFinal = async () => {
  const { fila, valor, motivo } = notaFinal.value
  if (valor === fila.notaFinal && !motivo) {
    notaFinal.value = null
    return
  }
  guardandoNotaFinal.value = true
  try {
    const res = await api.post({
      entity: 'legajos_curso_arbitro',
      action: 'cambiarEstadoCurso',
      payload: { id: fila.alumno.id, estado: NOTA_FINAL[valor].estado, motivo },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar la nota final')
    toast({ titulo: 'Guardado', mensaje: `Nota final: ${NOTA_FINAL[valor].etiqueta}. Se actualizó en Legajos.`, tipo: 'success' })
    notaFinal.value = null
    await cargar()
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardandoNotaFinal.value = false
  }
}

// ─── Excel (mismo formato que la planilla de Exámenes) ───────────
const generandoExcel = ref(false)

const exportarExcel = async () => {
  generandoExcel.value = true
  try {
    const { libro, hoja } = await crearPlanillaExcel(`Regulares ${anio.value}`)
    hoja.addRow(['ALUMNO', 'CURSO', 'CLASES', 'MINI', 'PARCIALITOS', 'TEÓRICO FINAL', 'PRÁCTICO', 'FÍSICO', 'NOTA FINAL'])
    const colores = []
    filas.value.forEach(f => {
      const esAnual = f.alumno.modalidadCurso === 'anual'
      const { asistencia: c, mini: m } = f
      hoja.addRow([
        `${f.alumno.apellido}, ${f.alumno.nombre}`.toUpperCase(),
        MODALIDADES_CURSO[f.alumno.modalidadCurso]?.corta || '',
        `${c.presentes}/${c.total}${c.porcentaje !== null ? ` · ${c.porcentaje}%` : ''}`,
        esAnual ? `${m.presentes}/${m.total}${m.porcentaje !== null ? ` · ${m.porcentaje}%` : ''}` : '',
        textoParcialitos(f),
        TEXTO_RESULTADO[f.final],
        TEXTO_RESULTADO[f.practico],
        TEXTO_RESULTADO[f.fisico],
        NOTA_FINAL[f.notaFinal].etiqueta.toUpperCase(),
      ])
      colores.push([
        '', '',
        celdaPorcentaje(c.porcentaje),
        esAnual ? celdaPorcentaje(m.porcentaje) : 'celda-na',
        celdaParcialitos(f),
        CELDA_RESULTADO[f.final], CELDA_RESULTADO[f.practico], CELDA_RESULTADO[f.fisico], CELDA_RESULTADO[f.notaFinal],
      ])
    })

    pintarCabeceraExcel(hoja, 30)
    colores.forEach((fila, i) => {
      fila.forEach((color, j) => pintarCeldaExcel(hoja.getRow(i + 2).getCell(j + 1), color, { izquierda: j === 0, negrita: j !== 1 }))
    })
    anchosColumnasExcel(hoja, [32, 10, 16, 16, 44, 16, 16, 16, 22])

    await descargarLibroExcel(libro, `Alumnos_Regulares_${anio.value}.xlsx`)
  } catch (err) {
    console.error('exportarExcel:', err)
    notificar({ titulo: 'Error', mensaje: 'No se pudo generar el Excel.', tipo: 'danger' })
  } finally {
    generandoExcel.value = false
  }
}

onMounted(cargar)
</script>

<style scoped src="@/assets/css/panel-admin-curso.css"></style>
<style scoped src="@/assets/css/planilla-curso.css"></style>
<style scoped>
.dato-etiqueta { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
.acordeon-seccion .accordion-button { font-size: 0.85rem; font-weight: 700; padding: 0.75rem 1rem; box-shadow: none; }
.acordeon-seccion .accordion-button:not(.collapsed) { color: #dc3545; background-color: #fef2f2; }
.acordeon-seccion .accordion-body { padding: 0.75rem 1rem; }
.fila-detalle { border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; }
.opcion-final { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; cursor: pointer; }
.opcion-final.activa { border-color: #dc3545; background: #fef2f2; }

/* Planilla: anchos de columna propios (el resto está en planilla-curso.css) */
.th-corta { min-width: 70px; }
.th-media { min-width: 110px; }
.th-larga { min-width: 150px; }
.detalle-parcialitos { font-size: 0.72rem; font-weight: 600; margin-left: 2px; }
</style>
