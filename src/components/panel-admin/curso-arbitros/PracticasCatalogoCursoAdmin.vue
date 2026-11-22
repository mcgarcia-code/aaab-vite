<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">Aspirantes que practican con el catálogo de preguntas desde su panel · {{ alumnos.length }} aspirantes</p>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <select v-model="filtros.modalidad" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark control-barra" style="width: 150px;" aria-label="Curso">
              <option value="">CURSO</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.corta.toUpperCase() }}</option>
            </select>
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark control-barra" style="width: 110px;" aria-label="Año del curso">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="cargar" />
          </div>
        </div>

        <div class="card-body bg-white" :class="cargando ? 'p-3' : 'p-0 border-top'">
          <EstadoCargando v-if="cargando" texto="Cargando prácticas del catálogo" />
          <template v-else>
            <!-- ============ RESUMEN ============ -->
            <div class="row g-2 p-3 border-bottom">
              <div class="col-6 col-md-3">
                <div class="dato-resumen rounded-3 border p-2 h-100">
                  <div class="dato-etiqueta">Practican</div>
                  <span class="fw-bold fs-5 text-dark">{{ resumen.practican }} <small class="text-muted fs-6">de {{ resumen.aspirantes }}</small></span>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="dato-resumen rounded-3 border p-2 h-100">
                  <div class="dato-etiqueta">Prácticas en total</div>
                  <span class="fw-bold fs-5 text-dark">{{ resumen.practicas }}</span>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="dato-resumen rounded-3 border p-2 h-100">
                  <div class="dato-etiqueta">Prácticas en {{ mesActual }}</div>
                  <span class="fw-bold fs-5 text-dark">{{ resumen.practicasMes }}</span>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="dato-resumen rounded-3 border p-2 h-100">
                  <div class="dato-etiqueta">Promedio general</div>
                  <span class="fw-bold fs-5" :class="resumen.promedio === null ? 'text-muted' : claseNota(resumen.promedio)">{{ textoNota(resumen.promedio) }}</span>
                </div>
              </div>
            </div>

            <!-- ============ FILTROS ============ -->
            <div class="d-flex flex-wrap gap-2 gap-md-3 align-items-center px-3 py-2 border-bottom bg-light small">
              <div class="busqueda-wrap">
                <input v-model="filtros.texto" class="form-control shadow-none control-barra" placeholder="BUSCAR ASPIRANTE..." aria-label="Buscar aspirante">
                <button v-if="filtros.texto" class="btn-limpiar-busqueda" @click="filtros.texto = ''" title="Limpiar búsqueda" type="button">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <select v-model="filtros.uso" class="form-select form-select-sm shadow-none text-uppercase text-dark w-auto" aria-label="Uso del catálogo">
                <option value="">TODOS</option>
                <option value="practican">PRACTICAN</option>
                <option value="mes">PRACTICARON ESTE MES</option>
                <option value="nunca">NUNCA PRACTICARON</option>
              </select>
              <select v-model="filtros.orden" class="form-select form-select-sm shadow-none text-uppercase text-dark w-auto" aria-label="Ordenar">
                <option value="apellido">ORDEN: APELLIDO</option>
                <option value="practicas">ORDEN: MÁS PRÁCTICAS</option>
                <option value="ultima">ORDEN: ÚLTIMA PRÁCTICA</option>
                <option value="promedio">ORDEN: PROMEDIO</option>
              </select>
              <span class="text-muted text-nowrap">{{ filas.length }} aspirantes</span>
            </div>

            <div v-if="!filas.length" class="text-center py-5 text-muted fw-bold">No hay aspirantes para mostrar.</div>
            <template v-else>
              <!-- ESCRITORIO -->
              <div class="d-none d-lg-block tabla-scroll">
                <table class="tabla-excel">
                  <thead>
                    <tr>
                      <th class="col-alumno esquina">ASPIRANTE</th>
                      <th class="th-corta">CURSO</th>
                      <th class="th-media" title="Prácticas terminadas desde que se habilitó el catálogo">PRÁCTICAS</th>
                      <th class="th-media">EN {{ mesActual.toUpperCase() }}</th>
                      <th class="th-media" title="Promedio de nota de sus prácticas">PROMEDIO</th>
                      <th class="th-larga">ÚLTIMA PRÁCTICA</th>
                      <th class="th-corta">DETALLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="a in filas" :key="a.id">
                      <td class="col-alumno celda-nombre text-uppercase">{{ a.apellido }}, {{ a.nombre }}</td>
                      <td class="celda"><span class="badge" :class="MODALIDADES_CURSO[a.modalidadCurso]?.clase">{{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}</span></td>
                      <td class="celda fw-bold" :class="{ 'text-muted fw-normal': !a.practicas }">{{ a.practicas }}</td>
                      <td class="celda" :class="{ 'text-muted': !a.practicasMes }">{{ a.practicasMes }}</td>
                      <td class="celda fw-bold" :class="a.promedio === null ? 'text-muted fw-normal' : claseNota(a.promedio)">{{ textoNota(a.promedio) }}</td>
                      <td class="celda" :class="{ 'text-muted': !a.ultima }">{{ a.ultima ? fechaHoraDMA(a.ultima) : 'Nunca' }}</td>
                      <td class="celda">
                        <button type="button" class="btn btn-link btn-sm p-0 text-dark" :disabled="!a.practicas" title="Ver prácticas" :aria-label="'Ver prácticas de ' + a.apellido" @click="abrirDetalle(a)">
                          <i class="bi bi-eye texto-18px"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- CELULAR Y TABLET -->
              <div class="d-lg-none p-3">
                <div v-for="a in filas" :key="'m-' + a.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                  <div class="card-body p-3 small text-dark">
                    <div class="d-flex justify-content-between align-items-start gap-2">
                      <div class="fw-bold text-uppercase min-w-0">{{ a.apellido }}, {{ a.nombre }}</div>
                      <span class="badge flex-shrink-0" :class="MODALIDADES_CURSO[a.modalidadCurso]?.clase">{{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}</span>
                    </div>
                    <div class="row g-2 mt-2">
                      <div class="col-4">
                        <div class="dato-etiqueta">Prácticas</div>
                        <span class="fw-bold">{{ a.practicas }}</span>
                      </div>
                      <div class="col-4">
                        <div class="dato-etiqueta">En {{ mesActual }}</div>
                        <span class="fw-bold">{{ a.practicasMes }}</span>
                      </div>
                      <div class="col-4">
                        <div class="dato-etiqueta">Promedio</div>
                        <span class="fw-bold" :class="a.promedio === null ? 'text-muted' : claseNota(a.promedio)">{{ textoNota(a.promedio) }}</span>
                      </div>
                      <div class="col-12">
                        <div class="dato-etiqueta">Última práctica</div>
                        <span :class="{ 'text-muted': !a.ultima }">{{ a.ultima ? fechaHoraDMA(a.ultima) : 'Nunca practicó' }}</span>
                      </div>
                    </div>
                    <button v-if="a.practicas" type="button" class="btn btn-outline-secondary btn-sm w-100 mt-3 fw-bold" @click="abrirDetalle(a)">
                      <i class="bi bi-eye me-1"></i>Ver prácticas
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- ============ DETALLE DE UN ASPIRANTE ============ -->
    <ModalBase :show="!!seleccionado" @close="cerrarDetalle" icono="quiz" colorIcono="bg-danger-subtle text-danger" maxWidth="760px">
      <template #header>
        <div v-if="seleccionado" class="text-center w-100">
          <span class="fw-bold fs-5 text-uppercase">{{ seleccionado.apellido }}, {{ seleccionado.nombre }}</span>
          <div class="text-muted small mt-1">
            {{ seleccionado.practicas }} {{ seleccionado.practicas === 1 ? 'práctica' : 'prácticas' }} · promedio
            <strong :class="claseNota(seleccionado.promedio)">{{ textoNota(seleccionado.promedio) }}</strong>
          </div>
        </div>
      </template>

      <EstadoCargando v-if="cargandoDetalle" texto="Cargando prácticas" />
      <p v-else-if="errorDetalle" class="text-danger fw-bold text-center py-4 m-0">{{ errorDetalle }}</p>
      <template v-else-if="detalle">
        <ul class="nav nav-pills gap-1 mb-3 pestanas" role="tablist">
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link fw-bold" :class="{ active: pestanaDetalle === 'practicas' }" role="tab" :aria-selected="pestanaDetalle === 'practicas'" @click="pestanaDetalle = 'practicas'">
              Prácticas ({{ detalle.practicas.length }})
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link fw-bold" :class="{ active: pestanaDetalle === 'falladas' }" role="tab" :aria-selected="pestanaDetalle === 'falladas'" @click="pestanaDetalle = 'falladas'">
              Más falladas ({{ detalle.falladas.length }})
            </button>
          </li>
        </ul>

        <!-- Prácticas -->
        <div v-if="pestanaDetalle === 'practicas'" class="d-flex flex-column gap-2">
          <div v-for="p in detalle.practicas" :key="p.id" class="fila-practica d-flex align-items-center gap-2 p-2 rounded-3 border" :class="p.calificacion >= UMBRAL_APROBADO ? 'borde-bien' : 'borde-mal'">
            <div class="flex-grow-1 min-w-0 small">
              <div class="text-muted"><i class="bi bi-calendar-event me-1"></i>{{ fechaHoraDMA(p.finalizadoEn) }}<span v-if="p.idioma === 'en'"> · Inglés</span></div>
              <div class="fw-semibold text-dark text-truncate">{{ textoReglas(p.reglas) }}</div>
              <div class="text-muted">{{ p.correctas }} de {{ p.cantidad }} correctas</div>
            </div>
            <span class="fw-bold fs-6 flex-shrink-0" :class="claseNota(p.calificacion)">{{ textoNota(p.calificacion) }}</span>
          </div>
          <p v-if="detalle.practicas.length >= 100" class="small text-muted text-center m-0">Se muestran las últimas 100 prácticas.</p>
        </div>

        <!-- Más falladas -->
        <div v-else>
          <p v-if="!detalle.falladas.length" class="text-muted text-center py-4 m-0">No tiene preguntas erradas.</p>
          <div v-else class="d-flex flex-column gap-2">
            <div v-for="(f, i) in detalle.falladas" :key="f.id" class="fila-practica borde-mal p-2 rounded-3 border small">
              <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                <span class="badge rounded-pill bg-danger">#{{ i + 1 }}</span>
                <span class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">{{ textoNumeroPregunta(f) }}</span>
                <span class="text-danger fw-bold ms-auto">{{ f.errores }} de {{ f.respondidas }} {{ f.respondidas === 1 ? 'vez' : 'veces' }}</span>
              </div>
              <div class="text-dark text-break">{{ f.texto }}</div>
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ cerrar }">
        <button type="button" class="btn btn-outline-secondary fw-bold px-4" @click="cerrar">Cerrar</button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@unhead/vue'
import { api } from '@/api/api'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import ModalBase from '@/components/ModalBase.vue'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { UMBRAL_APROBADO, textoNumeroPregunta } from '@/composables/usePracticaCatalogo'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaHoraDMA, MESES } from '@/utils/fechas'
import { normalizarTexto } from '@/utils/texto'

useHead({ title: 'Práctica del catálogo · Curso | AAAB' })

const notificar = inject('notificar')

// Aspirantes del año del curso con el resumen de sus prácticas (backend: seguimiento_curso_arbitro)
const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual().map(Number))
const alumnos = ref([])
const cargando = ref(false)
const filtros = reactive({ texto: '', modalidad: '', uso: '', orden: 'apellido' })

const mesActual = MESES[new Date().getMonth()].toLowerCase()

const cargar = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'seguimiento_curso_arbitro', action: 'obtenerPracticasCatalogoCurso', payload: { anio: anio.value } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar las prácticas')
    alumnos.value = Array.isArray(res.payload) ? res.payload : []
  } catch (e) {
    alumnos.value = []
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

watch(anio, cargar)
onMounted(cargar)

// ============ FORMATOS ============
const textoNota = (valor) => (valor === null || valor === undefined
  ? '—'
  : `${Number(valor).toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`)
const claseNota = (valor) => (Number(valor) >= UMBRAL_APROBADO ? 'text-success' : 'text-danger')
const textoReglas = (lista = []) => {
  if (lista.length >= 18) return 'Todas las reglas'
  return lista.length === 1 ? `Regla ${lista[0]}` : `Reglas ${lista.join(', ')}`
}

// ============ LISTA ============
const delCurso = computed(() => alumnos.value.filter(a => !filtros.modalidad || a.modalidadCurso === filtros.modalidad))

// El resumen respeta el filtro de curso (anual / intensivo) pero no la búsqueda
const resumen = computed(() => {
  const lista = delCurso.value
  const conPracticas = lista.filter(a => a.practicas > 0)
  const practicas = conPracticas.reduce((suma, a) => suma + a.practicas, 0)
  // Promedio general ponderado por la cantidad de prácticas de cada aspirante
  const promedio = practicas
    ? conPracticas.reduce((suma, a) => suma + a.promedio * a.practicas, 0) / practicas
    : null
  return {
    aspirantes: lista.length,
    practican: conPracticas.length,
    practicas,
    practicasMes: lista.reduce((suma, a) => suma + a.practicasMes, 0),
    promedio
  }
})

const ORDENES = {
  apellido: () => 0,
  practicas: (a, b) => b.practicas - a.practicas,
  ultima: (a, b) => String(b.ultima || '').localeCompare(String(a.ultima || '')),
  promedio: (a, b) => (b.promedio ?? -1) - (a.promedio ?? -1)
}

const filas = computed(() => {
  const texto = normalizarTexto(filtros.texto)
  const lista = delCurso.value.filter(a =>
    (!texto || normalizarTexto(`${a.apellido} ${a.nombre}`).includes(texto)) &&
    (filtros.uso !== 'practican' || a.practicas > 0) &&
    (filtros.uso !== 'mes' || a.practicasMes > 0) &&
    (filtros.uso !== 'nunca' || a.practicas === 0)
  )
  // El backend ya los manda por apellido: los demás órdenes desempatan por apellido (sort estable)
  return [...lista].sort(ORDENES[filtros.orden])
})

// ============ DETALLE ============
const seleccionado = ref(null)
const detalle = ref(null)
const cargandoDetalle = ref(false)
const errorDetalle = ref('')
const pestanaDetalle = ref('practicas')

const abrirDetalle = async (alumno) => {
  seleccionado.value = alumno
  detalle.value = null
  errorDetalle.value = ''
  pestanaDetalle.value = 'practicas'
  cargandoDetalle.value = true
  const res = await api.get({ entity: 'seguimiento_curso_arbitro', action: 'obtenerPracticasAlumnoCurso', payload: { idAlumno: alumno.id } })
  // Si mientras cargaba se abrió otro aspirante, se descarta esta respuesta
  if (seleccionado.value?.id !== alumno.id) return
  if (res?.ok) detalle.value = { practicas: res.payload?.practicas || [], falladas: res.payload?.falladas || [] }
  else errorDetalle.value = res?.message || 'No se pudieron cargar las prácticas'
  cargandoDetalle.value = false
}

const cerrarDetalle = () => {
  seleccionado.value = null
  detalle.value = null
}
</script>

<style scoped src="@/assets/css/panel-admin-curso.css"></style>
<style scoped src="@/assets/css/planilla-curso.css"></style>
<style scoped>
.min-w-0 { min-width: 0; }
.dato-resumen { background: var(--o-chip, #f8fafc); }
.dato-etiqueta { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; color: var(--o-texto-medio, #64748b); }

/* Anchos de columna de la planilla (el resto está en planilla-curso.css) */
.col-alumno { min-width: 240px; }
.th-corta { min-width: 90px; }
.th-media { min-width: 110px; }
.th-larga { min-width: 150px; }

.pestanas .nav-link { color: var(--o-texto-medio, #475569); background: var(--o-chip, #f1f5f9); font-size: 0.85rem; padding: 0.45rem 0.75rem; }
.pestanas .nav-link.active { background: #dc3545; color: #fff; }

.fila-practica { background: var(--o-tarjeta, #fff); border-left-width: 4px !important; }
.borde-bien { border-left-color: #198754 !important; }
.borde-mal { border-left-color: #dc3545 !important; }
</style>
