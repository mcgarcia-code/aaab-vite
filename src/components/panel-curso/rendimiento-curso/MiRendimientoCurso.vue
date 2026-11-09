<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-graph-up-arrow me-1"></i> Mi Rendimiento
          </h4>
          <span class="text-muted small d-block mt-1">Asistencia a clases<template v-if="datos.modalidad === 'anual'">, encuentros de mini</template> y notas de exámenes · Curso {{ datos.anio }}</span>
        </div>
      </div>

      <div v-if="cargando" class="card-body text-center py-5">
        <span class="spinner-border text-danger"></span>
      </div>

      <div v-else class="card-body p-3 p-md-4">
        <!-- RESUMEN -->
        <div class="row g-2 g-md-3 mb-4">
          <div class="col-6" :class="esAnual ? 'col-md' : 'col-md-3'">
            <div class="resumen-card bg-success text-white">
              <i class="bi bi-person-check-fill"></i>
              <div class="valor">{{ resumen.presentes }}</div>
              <div class="etiqueta">Presentes</div>
            </div>
          </div>
          <div class="col-6" :class="esAnual ? 'col-md' : 'col-md-3'">
            <div class="resumen-card bg-secondary text-white">
              <i class="bi bi-person-dash-fill"></i>
              <div class="valor">{{ resumen.ausentes }}</div>
              <div class="etiqueta">Ausentes</div>
            </div>
          </div>
          <div class="col-6" :class="esAnual ? 'col-md' : 'col-md-3'">
            <div class="resumen-card bg-dark text-white">
              <i class="bi bi-percent"></i>
              <div class="valor">{{ resumen.porcentaje !== null ? `${resumen.porcentaje}%` : '-' }}</div>
              <div class="etiqueta">Asistencia a clases</div>
            </div>
          </div>
          <div v-if="esAnual" class="col-6 col-md">
            <div class="resumen-card bg-primary text-white">
              <i class="bi bi-people-fill"></i>
              <div class="valor">{{ resumenMini.porcentaje !== null ? `${resumenMini.porcentaje}%` : '-' }}</div>
              <div class="etiqueta">Asistencia a mini</div>
            </div>
          </div>
          <div :class="esAnual ? 'col-12 col-md' : 'col-6 col-md-3'">
            <div class="resumen-card bg-danger text-white">
              <i class="bi bi-journal-check"></i>
              <div class="valor">{{ resumen.promedio !== null ? resumen.promedio : '-' }}</div>
              <div class="etiqueta">Promedio exámenes</div>
            </div>
          </div>
        </div>

        <!-- Secciones y meses en acordeón (mismo formato que Mis Designaciones del panel de árbitros) -->
        <div v-for="sec in secciones" :key="sec.clave" class="card border shadow-sm mb-3 rounded-3 overflow-hidden">
          <button type="button" class="acordeon-mes d-flex justify-content-between align-items-center w-100 px-3 py-2 gap-2" :aria-expanded="abierto(sec.clave)" @click="alternar(sec.clave)">
            <span class="fw-bold text-dark d-flex align-items-center gap-2 text-truncate">
              <i class="bi text-secondary flex-shrink-0" :class="abierto(sec.clave) ? 'bi-folder2-open' : 'bi-folder2'"></i>
              <span class="text-truncate">{{ sec.titulo }}</span>
            </span>
            <span class="d-flex align-items-center gap-1 flex-shrink-0">
              <template v-if="sec.clave !== 'examenes'">
                <span class="badge bg-success rounded-pill">{{ sec.presentes }} P</span>
                <span class="badge bg-secondary rounded-pill">{{ sec.ausentes }} A</span>
              </template>
              <span v-else class="badge bg-secondary rounded-pill">{{ sec.items.length }}</span>
              <i class="bi text-muted ms-1" :class="abierto(sec.clave) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </span>
          </button>

          <div v-show="abierto(sec.clave)" class="p-2 p-sm-3 bg-light border-top">
            <div v-if="!sec.items.length" class="text-muted small fst-italic px-1">{{ sec.vacio }}</div>
            <div v-for="mes in sec.meses" :key="sec.clave + mes.clave" class="card border shadow-sm mb-2 rounded-3 overflow-hidden">
              <button type="button" class="acordeon-mes d-flex justify-content-between align-items-center w-100 px-3 py-2 gap-2" :aria-expanded="abierto(sec.clave + mes.clave)" @click="alternar(sec.clave + mes.clave)">
                <span class="fw-bold text-dark d-flex align-items-center gap-2 text-truncate">
                  <i class="bi text-secondary flex-shrink-0" :class="abierto(sec.clave + mes.clave) ? 'bi-folder2-open' : 'bi-folder2'"></i>
                  <span class="text-truncate">{{ mes.etiqueta }}</span>
                </span>
                <span class="d-flex align-items-center gap-2 flex-shrink-0">
                  <span class="badge bg-secondary rounded-pill">{{ mes.items.length }}</span>
                  <i class="bi text-muted" :class="abierto(sec.clave + mes.clave) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </span>
              </button>
              <div v-show="abierto(sec.clave + mes.clave)" class="p-2 p-sm-3 border-top bg-white d-flex flex-column gap-2">
                <div v-for="item in mes.items" :key="sec.clave + '-' + item.id" class="fila-item d-flex justify-content-between align-items-center gap-2">
                  <div class="min-w-0">
                    <div class="fw-bold text-dark small text-break">{{ item.titulo }}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">
                      {{ fechaLargaClase(item.fecha) }}<template v-if="item.hora"> · {{ item.hora }} hs</template><template v-if="item.clase"> · {{ item.clase }}</template>
                    </div>
                  </div>
                  <span v-if="sec.clave === 'examenes'" class="nota flex-shrink-0 text-end" :class="claseNota(item)">{{ textoNotaExamen(item) }}</span>
                  <span v-else class="badge flex-shrink-0" :class="claseAsistencia(item.asistencia)">{{ textoAsistencia(item.asistencia) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'
import { formatoNota, claseNota, textoNotaExamen } from '@/composables/useExamenesCurso'

useHead({ title: 'Mi Rendimiento | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const datos = ref({ anio: new Date().getFullYear(), modalidad: '', clases: [], mini: [], examenes: [] })
const cargando = ref(true)

// Secciones y meses del acordeón: siempre arrancan contraídos y se despliegan al tocarlos
const abiertos = ref([])
const abierto = (clave) => abiertos.value.includes(clave)
const alternar = (clave) => {
  const i = abiertos.value.indexOf(clave)
  if (i === -1) abiertos.value.push(clave)
  else abiertos.value.splice(i, 1)
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const porMes = (items) => {
  const mapa = {}
  items.forEach(it => {
    const clave = String(it.fecha || '').substring(0, 7)
    if (!mapa[clave]) mapa[clave] = []
    mapa[clave].push(it)
  })
  return Object.keys(mapa)
    .sort((a, b) => b.localeCompare(a))
    .map(clave => ({ clave, etiqueta: `${MESES[Number(clave.substring(5, 7)) - 1] || ''} ${clave.substring(0, 4)}`, items: mapa[clave] }))
}

const secciones = computed(() => {
  const lista = [{
    clave: 'clases',
    titulo: 'Asistencia a clases',
    items: datos.value.clases,
    presentes: resumen.value.presentes,
    ausentes: resumen.value.ausentes,
    vacio: 'Todavía no hubo clases.',
  }]
  if (esAnual.value) {
    lista.push({
      clave: 'mini',
      titulo: 'Encuentros de mini',
      items: datos.value.mini || [],
      presentes: resumenMini.value.presentes,
      ausentes: resumenMini.value.ausentes,
      vacio: 'Todavía no fuiste convocado/a a encuentros de mini.',
    })
  }
  lista.push({ clave: 'examenes', titulo: 'Exámenes', items: datos.value.examenes, vacio: 'Todavía no tenés notas cargadas.' })
  return lista.map(sec => ({ ...sec, meses: porMes(sec.items) }))
})

const esAnual = computed(() => datos.value.modalidad === 'anual')

// Porcentaje sobre los encuentros con asistencia registrada (presente o ausente)
const resumenMini = computed(() => {
  const presentes = (datos.value.mini || []).filter(m => m.asistencia === 'presente').length
  const ausentes = (datos.value.mini || []).filter(m => m.asistencia === 'ausente').length
  const registrados = presentes + ausentes
  return { presentes, ausentes, porcentaje: registrados ? Math.round(presentes / registrados * 100) : null }
})

const resumen = computed(() => {
  const presentes = datos.value.clases.filter(c => c.asistencia === 'presente').length
  const ausentes = datos.value.clases.filter(c => c.asistencia === 'ausente').length
  const registradas = presentes + ausentes
  const conNota = datos.value.examenes.filter(e => e.nota !== null && (e.tipo || 'teorico') === 'teorico')
  const promedio = conNota.length
    ? `${formatoNota(Math.round(conNota.reduce((s, e) => s + (e.nota / (e.notaMaxima || 100)) * 100, 0) / conNota.length))}%`
    : null
  return {
    presentes,
    ausentes,
    porcentaje: registradas ? Math.round((presentes / registradas) * 100) : null,
    promedio,
  }
})

const textoAsistencia = (a) => (a === 'presente' ? 'Presente' : a === 'ausente' ? 'Ausente' : 'Sin registro')
const claseAsistencia = (a) => (a === 'presente' ? 'bg-success' : a === 'ausente' ? 'bg-secondary' : 'bg-light text-muted border')

onMounted(async () => {
  try {
    const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMiRendimientoCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar tu rendimiento')
    datos.value = res.payload
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.resumen-card {
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  height: 100%;
}
.resumen-card i { font-size: 1.2rem; }
.resumen-card .valor { font-size: 1.4rem; font-weight: 800; line-height: 1.1; margin-top: 4px; }
.resumen-card .etiqueta { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; opacity: 0.85; }
.acordeon-mes { background: #fff; border: none; cursor: pointer; transition: background-color 0.15s ease; }
.acordeon-mes:hover { background: #f8fafc; }
.fila-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
}
.min-w-0 { min-width: 0; }
.nota { font-weight: 800; font-size: 0.9rem; }
</style>
