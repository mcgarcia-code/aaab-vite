<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-person-check-fill me-1"></i> Alumnos Regulares {{ anio }}
            </h4>
            <span class="text-muted small d-block mt-1">{{ filas.length }} alumnos · asistencia a clases, encuentros de mini y exámenes rendidos</span>
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
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span></div>
          <template v-else>
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0 text-nowrap" style="font-size: 0.78rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted">Alumno</th>
                    <th class="py-3 text-center text-uppercase text-muted">Curso</th>
                    <th class="py-3 text-center text-uppercase text-muted">Asistencia clases</th>
                    <th class="py-3 text-center text-uppercase text-muted">Encuentros mini</th>
                    <th class="py-3 text-center text-uppercase text-muted">Teóricos</th>
                    <th class="py-3 text-center text-uppercase text-muted">Prácticos</th>
                    <th class="py-3 text-center text-uppercase text-muted">Físicos</th>
                    <th class="py-3 text-center text-uppercase text-muted">Detalle</th>
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
                      <span class="fw-bold" :class="clasePorcentaje(f.asistencia.porcentaje)">{{ f.asistencia.presentes }} / {{ f.asistencia.total }}</span>
                      <span v-if="f.asistencia.total" class="text-muted ms-1">({{ f.asistencia.porcentaje }}%)</span>
                    </td>
                    <td class="text-center">
                      <span v-if="f.alumno.modalidadCurso !== 'anual'" class="text-muted">—</span>
                      <template v-else>
                        <span class="fw-bold text-dark">{{ f.mini.presentes }} / {{ f.mini.total }}</span>
                        <span v-if="f.mini.ausentes" class="text-danger ms-1">({{ f.mini.ausentes }} aus.)</span>
                      </template>
                    </td>
                    <td v-for="tipo in TIPOS" :key="tipo" class="text-center">
                      <span v-if="!f.examenes[tipo].total" class="text-muted">—</span>
                      <template v-else>
                        <span class="fw-bold text-success">{{ f.examenes[tipo].aprobados }}</span>
                        <span class="text-muted"> aprob. de {{ f.examenes[tipo].total }}</span>
                        <span v-if="f.examenes[tipo].desaprobados" class="text-danger ms-1">· {{ f.examenes[tipo].desaprobados }} desap.</span>
                      </template>
                    </td>
                    <td class="text-center">
                      <button @click="seleccionado = f" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Ver detalle" :aria-label="'Ver detalle de ' + f.alumno.apellido">
                        <span class="material-icons" style="font-size:16px;">visibility</span>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!filas.length">
                    <td colspan="8" class="text-center py-5 text-muted border-0">
                      <span class="material-icons d-block fs-1 mb-2 opacity-50">search_off</span>
                      <span class="fw-bold">No hay alumnos regulares para mostrar.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-md-none p-3 bg-light">
              <div v-for="f in filas" :key="'m-' + f.alumno.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-body p-3 small text-dark">
                  <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <span class="fw-bold text-uppercase">{{ f.alumno.apellido }}, {{ f.alumno.nombre }}</span>
                    <span class="badge" :class="MODALIDADES_CURSO[f.alumno.modalidadCurso]?.clase">{{ MODALIDADES_CURSO[f.alumno.modalidadCurso]?.corta }}</span>
                  </div>
                  <div>Clases: <strong :class="clasePorcentaje(f.asistencia.porcentaje)">{{ f.asistencia.presentes }} / {{ f.asistencia.total }}</strong></div>
                  <div v-if="f.alumno.modalidadCurso === 'anual'">Mini: <strong>{{ f.mini.presentes }} / {{ f.mini.total }}</strong></div>
                  <div v-for="tipo in TIPOS" :key="'m-' + tipo">
                    {{ ETIQUETAS_TIPO[tipo] }}s: <strong class="text-success">{{ f.examenes[tipo].aprobados }}</strong> aprob. de {{ f.examenes[tipo].total }}
                  </div>
                  <button @click="seleccionado = f" class="btn btn-sm btn-outline-primary w-100 fw-bold mt-3"><i class="bi bi-eye me-1"></i> Ver detalle</button>
                </div>
              </div>
              <div v-if="!filas.length" class="text-center p-4 bg-white rounded-3 shadow-sm border text-muted fw-bold">No hay alumnos regulares para mostrar.</div>
            </div>
          </template>
        </div>
      </div>
    </div>

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
        <div v-else class="table-responsive mb-4">
          <table class="table table-sm align-middle small mb-0">
            <thead class="table-light">
              <tr><th>Fecha</th><th>Tipo</th><th>Examen</th><th class="text-center">Nota</th><th class="text-center">Resultado</th></tr>
            </thead>
            <tbody>
              <tr v-for="d in seleccionado.detalleExamenes" :key="'ex-' + d.examen.id">
                <td class="text-nowrap">{{ fechaDMA(d.examen.fecha) }}</td>
                <td>{{ ETIQUETAS_TIPO[d.examen.tipo] }}</td>
                <td>{{ d.examen.titulo }}<div v-if="d.examen.clase" class="text-muted" style="font-size: 0.7rem;">{{ d.examen.clase }}</div></td>
                <td class="text-center fw-bold">{{ textoNota(d) }}</td>
                <td class="text-center">
                  <span v-if="!d.nota" class="badge bg-light text-muted border">No rindió</span>
                  <span v-else-if="d.nota.ausente" class="badge bg-secondary">Ausente</span>
                  <span v-else-if="d.nota.aprobado === true" class="badge bg-success">Aprobado</span>
                  <span v-else-if="d.nota.aprobado === false" class="badge bg-danger">Desaprobado</span>
                  <span v-else class="badge bg-light text-muted border">Pendiente</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h6 class="titulo-seccion"><i class="bi bi-calendar-check me-1"></i> Asistencia a clases</h6>
        <div v-if="!seleccionado.detalleClases.length" class="small text-muted fst-italic mb-3">Todavía no hay clases dictadas.</div>
        <div v-else class="d-flex flex-column gap-1 mb-4">
          <div v-for="d in seleccionado.detalleClases" :key="'cl-' + d.clase.id" class="fila-detalle d-flex justify-content-between align-items-center gap-2">
            <span class="small"><strong>{{ fechaDMA(d.clase.fecha) }}</strong> · {{ d.clase.titulo }}</span>
            <span class="badge flex-shrink-0" :class="claseAsistencia(d.asistencia)">{{ textoAsistencia(d.asistencia) }}</span>
          </div>
        </div>

        <template v-if="seleccionado.alumno.modalidadCurso === 'anual'">
          <h6 class="titulo-seccion"><i class="bi bi-people me-1"></i> Encuentros de mini</h6>
          <div v-if="!seleccionado.detalleMini.length" class="small text-muted fst-italic">No fue convocado/a a encuentros de mini.</div>
          <div v-else class="d-flex flex-column gap-1">
            <div v-for="m in seleccionado.detalleMini" :key="'mi-' + m.idEncuentro" class="fila-detalle d-flex justify-content-between align-items-center gap-2">
              <span class="small"><strong>{{ fechaDMA(m.fecha) }}</strong> · {{ m.titulo }}</span>
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
import { formatoNota } from '@/composables/useExamenesCurso'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'

useHead({ title: 'Alumnos Regulares del Curso | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))

const TIPOS = ['teorico', 'practico', 'fisico']
const ETIQUETAS_TIPO = { teorico: 'Teórico', practico: 'Práctico', fisico: 'Físico' }

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual().map(Number))
const datos = ref({ alumnos: [], clases: [], asistencias: [], examenes: [], notas: [], mini: [] })
const cargando = ref(false)
const filtros = reactive({ texto: '', modalidad: '' })
const seleccionado = ref(null)

const normalizar = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const corresponde = (curso, a) => curso === 'ambos' || curso === a.modalidadCurso

const indice = (lista, clave) => {
  const mapa = {}
  lista.forEach(x => { mapa[clave(x)] = x })
  return mapa
}

const seguimiento = computed(() => {
  const { alumnos, clases, asistencias, examenes, notas, mini } = datos.value
  const asis = indice(asistencias, x => `${x.idClase}-${x.idAlumno}`)
  const nts = indice(notas, x => `${x.idExamen}-${x.idAlumno}`)
  return alumnos.map(alumno => {
    const detalleClases = clases.filter(c => corresponde(c.curso, alumno)).map(clase => {
      const a = asis[`${clase.id}-${alumno.id}`]
      return { clase, asistencia: a ? (a.presente ? 'presente' : 'ausente') : null }
    })
    const presentes = detalleClases.filter(d => d.asistencia === 'presente').length
    const detalleExamenes = examenes.filter(e => corresponde(e.curso, alumno)).map(examen => ({ examen, nota: nts[`${examen.id}-${alumno.id}`] || null }))
    const resumenExamenes = Object.fromEntries(TIPOS.map(tipo => {
      const delTipo = detalleExamenes.filter(d => d.examen.tipo === tipo)
      return [tipo, {
        total: delTipo.length,
        aprobados: delTipo.filter(d => d.nota?.aprobado === true).length,
        desaprobados: delTipo.filter(d => d.nota && (d.nota.aprobado === false || d.nota.ausente)).length,
      }]
    }))
    const detalleMini = mini.filter(m => m.idAlumno === alumno.id)
    return {
      alumno,
      asistencia: { presentes, total: detalleClases.length, porcentaje: detalleClases.length ? Math.round(presentes / detalleClases.length * 100) : null },
      mini: {
        presentes: detalleMini.filter(m => m.asistencia === 'presente').length,
        ausentes: detalleMini.filter(m => m.asistencia === 'ausente').length,
        total: detalleMini.length,
      },
      examenes: resumenExamenes,
      detalleClases: [...detalleClases].reverse(),
      detalleExamenes: [...detalleExamenes].reverse(),
      detalleMini: [...detalleMini].reverse(),
    }
  })
})

const filas = computed(() => {
  const texto = normalizar(filtros.texto)
  return seguimiento.value.filter(f =>
    (!filtros.modalidad || f.alumno.modalidadCurso === filtros.modalidad) &&
    (!texto || normalizar(`${f.alumno.apellido} ${f.alumno.nombre} ${f.alumno.dni}`).includes(texto))
  )
})

const limpiarFiltros = () => Object.assign(filtros, { texto: '', modalidad: '' })

const clasePorcentaje = (p) => {
  if (p === null) return 'text-muted'
  if (p >= 75) return 'text-success'
  return p >= 50 ? 'text-warning' : 'text-danger'
}
const textoAsistencia = (a) => (a === 'presente' ? 'Presente' : a === 'ausente' ? 'Ausente' : 'Sin marcar')
const claseAsistencia = (a) => (a === 'presente' ? 'bg-success' : a === 'ausente' ? 'bg-secondary' : 'bg-light text-muted border')

const textoNota = (d) => {
  if (!d.nota || d.nota.ausente || d.nota.nota === null) return '—'
  if (d.examen.tipo === 'practico') return d.nota.nota >= 1 ? 'Aprob.' : 'Desap.'
  if (d.examen.online) return `${formatoNota(d.nota.nota / (d.examen.notaMaxima || 100) * 100)}%`
  return formatoNota(d.nota.nota)
}

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

const exportarExcel = async () => {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet(`Regulares ${anio.value}`)
  ws.columns = [
    { header: 'Apellido', key: 'apellido', width: 18 }, { header: 'Nombre', key: 'nombre', width: 18 },
    { header: 'DNI', key: 'dni', width: 14 }, { header: 'Curso', key: 'curso', width: 16 },
    { header: 'Clases presentes', key: 'presentes', width: 16 }, { header: 'Clases dictadas', key: 'clases', width: 16 }, { header: '% asistencia', key: 'porcentaje', width: 13 },
    { header: 'Mini presentes', key: 'miniPresentes', width: 15 }, { header: 'Mini convocado', key: 'miniTotal', width: 15 },
    ...TIPOS.flatMap(t => [
      { header: `${ETIQUETAS_TIPO[t]}s aprobados`, key: `${t}Aprob`, width: 18 },
      { header: `${ETIQUETAS_TIPO[t]}s del curso`, key: `${t}Total`, width: 18 },
    ]),
  ]
  filas.value.forEach(f => ws.addRow({
    apellido: f.alumno.apellido, nombre: f.alumno.nombre, dni: f.alumno.dni,
    curso: MODALIDADES_CURSO[f.alumno.modalidadCurso]?.etiqueta || '',
    presentes: f.asistencia.presentes, clases: f.asistencia.total, porcentaje: f.asistencia.porcentaje ?? '',
    miniPresentes: f.alumno.modalidadCurso === 'anual' ? f.mini.presentes : '', miniTotal: f.alumno.modalidadCurso === 'anual' ? f.mini.total : '',
    ...Object.fromEntries(TIPOS.flatMap(t => [[`${t}Aprob`, f.examenes[t].aprobados], [`${t}Total`, f.examenes[t].total]])),
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
.fila-detalle { border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; }
</style>
