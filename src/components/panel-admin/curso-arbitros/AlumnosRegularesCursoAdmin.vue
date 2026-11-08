<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-person-check-fill me-1"></i> Alumnos Regulares {{ anioActual }}
            </h4>
            <span class="text-muted small d-block mt-1">{{ alumnosFiltrados.length }} alumnos regulares o reinscriptos en el curso de este año</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <button @click="cargarDatos" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0" :disabled="!alumnosFiltrados.length">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <div class="bg-light p-3 border-bottom">
          <div class="row g-2">
            <div class="col-12 col-md-4"><input v-model="filtros.texto" class="form-control form-control-sm shadow-none" placeholder="BUSCAR APELLIDO, NOMBRE, DNI O USUARIO..."></div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.modalidad" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">CURSO</option>
                <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.corta.toUpperCase() }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">ESTADO</option>
                <option value="regular">REGULAR</option>
                <option value="reinscripcion">REINSCRIPCIÓN</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargando" class="text-center p-5">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
          </div>
          <template v-else>
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0 text-nowrap" style="font-size: 0.78rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted">#</th>
                    <th class="py-3 text-uppercase text-muted">Apellido y nombre</th>
                    <th class="py-3 text-center text-uppercase text-muted">Curso</th>
                    <th class="py-3 text-center text-uppercase text-muted">Estado</th>
                    <th class="py-3 text-center text-uppercase text-muted">DNI</th>
                    <th class="py-3 text-uppercase text-muted">Usuario</th>
                    <th class="py-3 text-uppercase text-muted">Email</th>
                    <th class="py-3 text-uppercase text-muted">Celular</th>
                    <th class="py-3 text-uppercase text-muted">Localidad</th>
                    <th class="py-3 text-uppercase text-muted">Juega en</th>
                    <th class="py-3 text-uppercase text-muted">DT en</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(a, i) in alumnosFiltrados" :key="a.id">
                    <td class="ps-3 text-muted fw-bold">{{ i + 1 }}</td>
                    <td class="fw-bold text-dark text-uppercase">{{ a.apellido }}, {{ a.nombre }}</td>
                    <td class="text-center"><span class="badge" :class="MODALIDADES_CURSO[a.modalidad_curso]?.clase">{{ MODALIDADES_CURSO[a.modalidad_curso]?.corta }}</span></td>
                    <td class="text-center"><span class="badge" :class="ESTADOS_CURSO[a.estado]?.clase">{{ ESTADOS_CURSO[a.estado]?.etiqueta }}</span></td>
                    <td class="text-center text-dark">{{ a.dni }}</td>
                    <td class="text-dark">{{ a.usuario }}</td>
                    <td class="text-dark">{{ a.email }}</td>
                    <td class="text-dark">{{ a.celular }}</td>
                    <td class="text-dark">{{ a.nombre_localidad }}</td>
                    <td class="text-dark"><span class="d-inline-block text-truncate" style="max-width: 200px;" :title="textoJugador(a)">{{ textoJugador(a) || '-' }}</span></td>
                    <td class="text-dark"><span class="d-inline-block text-truncate" style="max-width: 200px;" :title="textoDtClubes(a.dt_clubes)">{{ textoDtClubes(a.dt_clubes) || '-' }}</span></td>
                  </tr>
                  <tr v-if="!alumnosFiltrados.length">
                    <td colspan="11" class="text-center py-5 text-muted border-0">
                      <span class="material-icons d-block fs-1 mb-2 opacity-50">search_off</span>
                      <span class="fw-bold">No hay alumnos regulares para mostrar.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-md-none p-3 bg-light">
              <div v-for="a in alumnosFiltrados" :key="'m-' + a.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-body p-3 small text-dark">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <span class="fw-bold text-uppercase" style="font-size: 1rem;">{{ a.apellido }}, {{ a.nombre }}</span>
                    <span class="d-flex gap-1 flex-shrink-0">
                      <span class="badge" :class="MODALIDADES_CURSO[a.modalidad_curso]?.clase">{{ MODALIDADES_CURSO[a.modalidad_curso]?.corta }}</span>
                      <span class="badge" :class="ESTADOS_CURSO[a.estado]?.clase">{{ ESTADOS_CURSO[a.estado]?.etiqueta }}</span>
                    </span>
                  </div>
                  <div><strong>DNI:</strong> {{ a.dni }} · <strong>Cel:</strong> {{ a.celular }}</div>
                  <div class="text-truncate"><strong>Email:</strong> {{ a.email }}</div>
                  <div v-if="textoJugador(a)"><strong>Juega:</strong> {{ textoJugador(a) }}</div>
                  <div v-if="a.dt_clubes.length"><strong>DT:</strong> {{ textoDtClubes(a.dt_clubes) }}</div>
                </div>
              </div>
              <div v-if="!alumnosFiltrados.length" class="text-center p-4 bg-white rounded-3 shadow-sm border text-muted fw-bold">
                No hay alumnos regulares para mostrar.
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import ExcelJS from 'exceljs'
import { api } from '@/api/api'
import { ESTADOS_CURSO, MODALIDADES_CURSO, textoDtClubes } from '@/composables/useCursoArbitro'

useHead({ title: 'Alumnos Regulares | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))

const anioActual = new Date().getFullYear()
const alumnos = ref([])
const cargando = ref(false)
const filtros = reactive({ texto: '', estado: '', modalidad: '' })

const normalizar = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const textoJugador = (a) => (a.es_jugador === 'SI'
  ? `${a.club_jugador}: ${String(a.categorias_jugador || '').split('|').map(c => c.trim()).filter(Boolean).join('; ')}`
  : '')

const alumnosFiltrados = computed(() => {
  const texto = normalizar(filtros.texto)
  return alumnos.value.filter(a =>
    (!filtros.estado || a.estado === filtros.estado) &&
    (!filtros.modalidad || a.modalidad_curso === filtros.modalidad) &&
    (!texto || normalizar(`${a.apellido} ${a.nombre} ${a.dni} ${a.usuario}`).includes(texto))
  )
})

const limpiarFiltros = () => Object.assign(filtros, { texto: '', estado: '', modalidad: '' })

const cargarDatos = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'legajos_curso_arbitro', action: 'obtenerAlumnosRegularesCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar los alumnos')
    alumnos.value = res.payload || []
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const exportarExcel = async () => {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet(`Regulares ${anioActual}`)
  ws.columns = [
    { header: 'Apellido', key: 'apellido', width: 18 }, { header: 'Nombre', key: 'nombre', width: 18 },
    { header: 'Curso', key: 'curso', width: 14 }, { header: 'Estado', key: 'estado', width: 16 }, { header: 'DNI', key: 'dni', width: 14 },
    { header: 'Usuario', key: 'usuario', width: 28 }, { header: 'Email', key: 'email', width: 28 },
    { header: 'Celular', key: 'celular', width: 16 }, { header: 'Localidad', key: 'localidad', width: 18 },
    { header: 'Juega en', key: 'juega', width: 30 }, { header: 'DT en', key: 'dt', width: 30 },
  ]
  alumnosFiltrados.value.forEach(a => ws.addRow({
    apellido: a.apellido, nombre: a.nombre, curso: MODALIDADES_CURSO[a.modalidad_curso]?.etiqueta || '', estado: ESTADOS_CURSO[a.estado]?.etiqueta || a.estado, dni: a.dni,
    usuario: a.usuario, email: a.email, celular: a.celular, localidad: a.nombre_localidad,
    juega: textoJugador(a), dt: textoDtClubes(a.dt_clubes),
  }))
  ws.getRow(1).font = { bold: true }
  const buffer = await wb.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `Alumnos_Regulares_${anioActual}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(cargarDatos)
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.5s; }
</style>
