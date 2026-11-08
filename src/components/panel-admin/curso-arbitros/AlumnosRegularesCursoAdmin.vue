<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-person-check-fill me-1"></i> Alumnos Regulares {{ anio }}
            </h4>
            <span class="text-muted small d-block mt-1">{{ filas.length }} alumnos · resultado por examen y nota final del curso</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 110px;" aria-label="Año">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <button @click="cargar" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0" :disabled="!filas.length">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <div class="bg-light p-3 border-bottom">
          <div class="row g-2">
            <div class="col-12 col-md-4"><input v-model="filtros.texto" class="form-control form-control-sm shadow-none" placeholder="BUSCAR APELLIDO, NOMBRE O DNI..."></div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.modalidad" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">CURSO</option>
                <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.corta.toUpperCase() }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.notaFinal" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">NOTA FINAL</option>
                <option value="pendiente">PENDIENTE</option>
                <option value="aprobado">APROBÓ</option>
                <option value="desaprobado">DESAPROBÓ</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span></div>
          <template v-else>
            <!-- ESCRITORIO -->
            <div class="d-none d-lg-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0 text-nowrap" style="font-size: 0.78rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted">Alumno</th>
                    <th class="py-3 text-center text-uppercase text-muted">Curso</th>
                    <th class="py-3 text-center text-uppercase text-muted">Clases</th>
                    <th class="py-3 text-center text-uppercase text-muted">Mini</th>
                    <th v-for="tipo in TIPOS_EXAMEN_CURSO" :key="'th-' + tipo" class="py-3 text-center text-uppercase text-muted">{{ ETIQUETAS_TIPO_EXAMEN[tipo] }}</th>
                    <th class="py-3 text-center text-uppercase text-muted">Nota final</th>
                    <th class="py-3 text-center text-uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in filas" :key="f.alumno.id">
                    <td class="ps-3">
                      <div class="fw-bold text-dark text-uppercase">{{ f.alumno.apellido }}, {{ f.alumno.nombre }}</div>
                      <div class="text-muted" style="font-size: 0.68rem;">DNI {{ f.alumno.dni }}</div>
                    </td>
                    <td class="text-center"><span class="badge" :class="MODALIDADES_CURSO[f.alumno.modalidadCurso]?.clase">{{ MODALIDADES_CURSO[f.alumno.modalidadCurso]?.corta }}</span></td>
                    <td class="text-center">
                      <span class="fw-bold" :class="clasePorcentaje(f.asistencia.porcentaje)">{{ f.asistencia.presentes }}/{{ f.asistencia.total }}</span>
                      <span v-if="f.asistencia.total" class="text-muted ms-1">{{ f.asistencia.porcentaje }}%</span>
                    </td>
                    <td class="text-center">
                      <span v-if="f.alumno.modalidadCurso !== 'anual'" class="text-muted">—</span>
                      <span v-else class="fw-bold text-dark">{{ f.mini.presentes }}/{{ f.mini.total }}</span>
                    </td>
                    <td v-for="tipo in TIPOS_EXAMEN_CURSO" :key="'td-' + tipo" class="text-center">
                      <span class="badge" :class="RESULTADOS[f.resultados[tipo]].clase">{{ RESULTADOS[f.resultados[tipo]].etiqueta }}</span>
                    </td>
                    <td class="text-center"><span class="badge" :class="NOTA_FINAL[f.notaFinal].clase">{{ NOTA_FINAL[f.notaFinal].etiqueta }}</span></td>
                    <td class="text-center">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="abrirNotaFinal(f)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Nota final" :aria-label="'Nota final de ' + f.alumno.apellido">
                          <span class="material-icons" style="font-size:16px;">workspace_premium</span>
                        </button>
                        <button @click="seleccionado = f" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Ver detalle" :aria-label="'Ver detalle de ' + f.alumno.apellido">
                          <span class="material-icons" style="font-size:16px;">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!filas.length">
                    <td colspan="9" class="text-center py-5 text-muted border-0">
                      <span class="material-icons d-block fs-1 mb-2 opacity-50">search_off</span>
                      <span class="fw-bold">No hay alumnos para mostrar.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CELULAR Y TABLET -->
            <div class="d-lg-none p-3 bg-light">
              <div v-for="f in filas" :key="'m-' + f.alumno.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-body p-3 small text-dark">
                  <div class="d-flex justify-content-between align-items-start gap-2">
                    <div class="min-w-0">
                      <div class="fw-bold text-uppercase">{{ f.alumno.apellido }}, {{ f.alumno.nombre }}</div>
                      <div class="text-muted" style="font-size: 0.7rem;">DNI {{ f.alumno.dni }}</div>
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
                      <span class="fw-bold">{{ f.mini.presentes }}/{{ f.mini.total }}</span>
                    </div>
                    <div v-for="tipo in TIPOS_EXAMEN_CURSO" :key="'mt-' + tipo" class="col-4">
                      <div class="dato-etiqueta">{{ ETIQUETAS_TIPO_EXAMEN[tipo] }}</div>
                      <span class="badge" :class="RESULTADOS[f.resultados[tipo]].clase">{{ RESULTADOS[f.resultados[tipo]].etiqueta }}</span>
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
              <div v-if="!filas.length" class="text-center p-4 bg-white rounded-3 shadow-sm border text-muted fw-bold">No hay alumnos para mostrar.</div>
            </div>
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
          <span v-for="tipo in TIPOS_EXAMEN_CURSO" :key="'nf-' + tipo" class="badge" :class="RESULTADOS[notaFinal.fila.resultados[tipo]].clase">
            {{ ETIQUETAS_TIPO_EXAMEN[tipo] }}: {{ RESULTADOS[notaFinal.fila.resultados[tipo]].etiqueta }}
          </span>
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
        <h6 class="titulo-seccion"><i class="bi bi-journal-check me-1"></i> Exámenes</h6>
        <div v-if="!seleccionado.detalleExamenes.length" class="small text-muted fst-italic mb-3">No hay exámenes de su curso en {{ anio }}.</div>
        <div v-else class="d-flex flex-column gap-2 mb-4">
          <div v-for="d in seleccionado.detalleExamenes" :key="'ex-' + d.examen.id" class="fila-detalle">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div class="min-w-0 small">
                <div class="fw-bold text-dark">{{ d.examen.titulo }}</div>
                <div class="text-muted">{{ fechaDMA(d.examen.fecha) }} · {{ ETIQUETAS_TIPO_EXAMEN[d.examen.tipo] }}<template v-if="d.examen.clase"> · {{ d.examen.clase }}</template></div>
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

        <h6 class="titulo-seccion"><i class="bi bi-calendar-check me-1"></i> Asistencia a clases</h6>
        <div v-if="!seleccionado.detalleClases.length" class="small text-muted fst-italic mb-3">Todavía no hay clases dictadas.</div>
        <div v-else class="d-flex flex-column gap-1 mb-4">
          <div v-for="d in seleccionado.detalleClases" :key="'cl-' + d.clase.id" class="fila-detalle d-flex justify-content-between align-items-center gap-2">
            <span class="small min-w-0"><strong>{{ fechaDMA(d.clase.fecha) }}</strong> · {{ d.clase.titulo }}</span>
            <span class="badge flex-shrink-0" :class="claseAsistencia(d.asistencia)">{{ textoAsistencia(d.asistencia) }}</span>
          </div>
        </div>

        <template v-if="seleccionado.alumno.modalidadCurso === 'anual'">
          <h6 class="titulo-seccion"><i class="bi bi-people me-1"></i> Encuentros de mini</h6>
          <div v-if="!seleccionado.detalleMini.length" class="small text-muted fst-italic">No fue convocado/a a encuentros de mini.</div>
          <div v-else class="d-flex flex-column gap-1">
            <div v-for="m in seleccionado.detalleMini" :key="'mi-' + m.idEncuentro" class="fila-detalle d-flex justify-content-between align-items-center gap-2">
              <span class="small min-w-0"><strong>{{ fechaDMA(m.fecha) }}</strong> · {{ m.titulo }}</span>
              <span class="badge flex-shrink-0" :class="claseAsistencia(m.asistencia)">{{ textoAsistencia(m.asistencia) }}</span>
            </div>
          </div>
        </template>
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
import ExcelJS from 'exceljs'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { textoNotaExamen } from '@/composables/useExamenesCurso'
import { TIPOS_EXAMEN_CURSO, ETIQUETAS_TIPO_EXAMEN, RESULTADOS, NOTA_FINAL, armarSeguimiento } from '@/composables/useSeguimientoCurso'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'

useHead({ title: 'Alumnos Regulares del Curso | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual().map(Number))
const datos = ref({ alumnos: [], clases: [], asistencias: [], examenes: [], notas: [], mini: [] })
const cargando = ref(false)
const filtros = reactive({ texto: '', modalidad: '', notaFinal: '' })
const seleccionado = ref(null)

const normalizar = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const seguimiento = computed(() => armarSeguimiento(datos.value))

const filas = computed(() => {
  const texto = normalizar(filtros.texto)
  return seguimiento.value.filter(f =>
    (!filtros.modalidad || f.alumno.modalidadCurso === filtros.modalidad) &&
    (!filtros.notaFinal || f.notaFinal === filtros.notaFinal) &&
    (!texto || normalizar(`${f.alumno.apellido} ${f.alumno.nombre} ${f.alumno.dni}`).includes(texto))
  )
})

const limpiarFiltros = () => Object.assign(filtros, { texto: '', modalidad: '', notaFinal: '' })

const clasePorcentaje = (p) => {
  if (p === null) return 'text-muted'
  if (p >= 75) return 'text-success'
  return p >= 50 ? 'text-warning' : 'text-danger'
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

const exportarExcel = async () => {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet(`Regulares ${anio.value}`)
  ws.columns = [
    { header: 'Apellido', key: 'apellido', width: 18 }, { header: 'Nombre', key: 'nombre', width: 18 },
    { header: 'DNI', key: 'dni', width: 14 }, { header: 'Curso', key: 'curso', width: 16 },
    { header: 'Clases presentes', key: 'presentes', width: 16 }, { header: 'Clases dictadas', key: 'clases', width: 16 }, { header: '% asistencia', key: 'porcentaje', width: 13 },
    { header: 'Mini presentes', key: 'miniPresentes', width: 15 }, { header: 'Mini convocado', key: 'miniTotal', width: 15 },
    ...TIPOS_EXAMEN_CURSO.map(t => ({ header: ETIQUETAS_TIPO_EXAMEN[t], key: t, width: 14 })),
    { header: 'Nota final', key: 'notaFinal', width: 20 },
  ]
  filas.value.forEach(f => ws.addRow({
    apellido: f.alumno.apellido, nombre: f.alumno.nombre, dni: f.alumno.dni,
    curso: MODALIDADES_CURSO[f.alumno.modalidadCurso]?.etiqueta || '',
    presentes: f.asistencia.presentes, clases: f.asistencia.total, porcentaje: f.asistencia.porcentaje ?? '',
    miniPresentes: f.alumno.modalidadCurso === 'anual' ? f.mini.presentes : '', miniTotal: f.alumno.modalidadCurso === 'anual' ? f.mini.total : '',
    ...Object.fromEntries(TIPOS_EXAMEN_CURSO.map(t => [t, RESULTADOS[f.resultados[t]].etiqueta])),
    notaFinal: NOTA_FINAL[f.notaFinal].etiqueta,
  }))
  ws.getRow(1).font = { bold: true }
  const buffer = await wb.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `Alumnos_Regulares_${anio.value}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(cargar)
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.5s; }
.titulo-seccion {
  color: #dc3545;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}
.dato-etiqueta { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
.fila-detalle { border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; }
.opcion-final { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; cursor: pointer; }
.opcion-final.activa { border-color: #dc3545; background: #fef2f2; }
.min-w-0 { min-width: 0; }
</style>
