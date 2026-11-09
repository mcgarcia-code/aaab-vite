<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-calendar2-check me-1"></i> Mis Designaciones
          </h4>
          <span class="text-muted small d-block mt-1">Encuentros de mini a los que fuiste convocado/a</span>
        </div>
      </div>

      <div class="card-body p-3 p-md-4">
        <div v-if="cargando" class="text-center py-5"><span class="spinner-border text-danger"></span></div>

        <div v-else-if="modalidad && modalidad !== 'anual'" class="text-center py-5 text-muted">
          <i class="bi bi-info-circle fs-1 d-block mb-2 opacity-50"></i>
          <span class="fw-bold">Los encuentros de mini son solo para el curso anual.</span>
        </div>

        <div v-else-if="!encuentros.length" class="text-center py-5 text-muted">
          <i class="bi bi-calendar-x fs-1 d-block mb-2 opacity-50"></i>
          <span class="fw-bold">Todavía no tenés designaciones.</span>
        </div>

        <template v-else>
          <!-- PRÓXIMAS -->
          <h6 class="titulo-seccion"><i class="bi bi-calendar-event me-1"></i> Próximas</h6>
          <div v-if="!proximas.length" class="text-muted small fst-italic mb-4">No tenés encuentros próximos.</div>
          <div v-else class="d-flex flex-column gap-2 mb-4">
            <div v-for="(e, i) in proximas" :key="e.id" class="designacion d-flex gap-3" :class="{ destacada: i === 0 }">
              <div class="cal-box text-center flex-shrink-0">
                <div class="dia">{{ Number(e.fecha.substring(8, 10)) }}</div>
                <div class="mes">{{ mesCorto(e.fecha) }}</div>
              </div>
              <div class="min-w-0 flex-grow-1">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div class="fw-bold text-dark text-break">{{ e.titulo }}</div>
                  <span v-if="e.fecha === hoy" class="badge bg-danger flex-shrink-0">Hoy</span>
                  <span v-else-if="i === 0" class="badge bg-danger flex-shrink-0">Próxima</span>
                </div>
                <div class="small text-muted">
                  {{ fechaLargaClase(e.fecha) }}<template v-if="e.hora"> · <i class="bi bi-clock"></i> {{ e.hora }} hs</template>
                </div>
                <div v-if="e.comentarios" class="comentarios small mt-2">{{ e.comentarios }}</div>
              </div>
            </div>
          </div>

          <!-- ANTERIORES: acordeón por mes -->
          <template v-if="anteriores.length">
            <h6 class="titulo-seccion"><i class="bi bi-clock-history me-1"></i> Encuentros anteriores</h6>
            <div v-for="mes in mesesAnteriores" :key="mes.clave" class="card border shadow-sm mb-2 rounded-3 overflow-hidden">
              <button
                type="button"
                class="acordeon-mes d-flex justify-content-between align-items-center w-100 px-3 py-2 gap-2"
                :aria-expanded="mesesAbiertos.includes(mes.clave)"
                @click="alternarMes(mes.clave)"
              >
                <span class="fw-bold text-dark d-flex align-items-center gap-2 text-truncate">
                  <i class="bi text-secondary flex-shrink-0" :class="mesesAbiertos.includes(mes.clave) ? 'bi-folder2-open' : 'bi-folder2'"></i>
                  <span class="text-truncate">{{ mes.etiqueta }}</span>
                </span>
                <span class="d-flex align-items-center gap-2 flex-shrink-0">
                  <span class="badge bg-secondary rounded-pill">{{ mes.encuentros.length }}</span>
                  <i class="bi text-muted" :class="mesesAbiertos.includes(mes.clave) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </span>
              </button>
              <div v-show="mesesAbiertos.includes(mes.clave)" class="p-2 p-sm-3 bg-light border-top d-flex flex-column gap-2">
                <div v-for="e in mes.encuentros" :key="'a-' + e.id" class="designacion pasada d-flex gap-3">
                  <div class="cal-box text-center flex-shrink-0">
                    <div class="dia">{{ Number(e.fecha.substring(8, 10)) }}</div>
                    <div class="mes">{{ mesCorto(e.fecha) }}</div>
                  </div>
                  <div class="min-w-0 flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start gap-2">
                      <div class="fw-bold text-dark text-break">{{ e.titulo }}</div>
                      <span class="badge flex-shrink-0" :class="claseAsistencia(e.asistencia)">{{ textoAsistencia(e.asistencia) }}</span>
                    </div>
                    <div class="small text-muted">
                      {{ fechaLargaClase(e.fecha) }}<template v-if="e.hora"> · {{ e.hora }} hs</template>
                    </div>
                    <div v-if="e.comentarios" class="comentarios small mt-2">{{ e.comentarios }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'

useHead({ title: 'Mis Designaciones | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const encuentros = ref([])
const modalidad = ref('')
const cargando = ref(true)
const mesesAbiertos = ref([])

const hoy = new Date().toLocaleDateString('sv-SE')
const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const mesCorto = (fecha) => MESES_CORTOS[Number(fecha.substring(5, 7)) - 1]

// Próximas de la más cercana a la más lejana; anteriores de la más reciente a la más vieja
const proximas = computed(() => encuentros.value.filter(e => e.fecha >= hoy).sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)))
const anteriores = computed(() => encuentros.value.filter(e => e.fecha < hoy))

// Anteriores agrupados por mes (del más reciente al más viejo); todos arrancan contraídos
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const mesesAnteriores = computed(() => {
  const mapa = {}
  anteriores.value.forEach(e => {
    const clave = e.fecha.substring(0, 7)
    if (!mapa[clave]) mapa[clave] = []
    mapa[clave].push(e)
  })
  return Object.keys(mapa)
    .sort((a, b) => b.localeCompare(a))
    .map(clave => ({
      clave,
      etiqueta: `${MESES[Number(clave.substring(5, 7)) - 1]} ${clave.substring(0, 4)}`,
      encuentros: mapa[clave],
    }))
})

const alternarMes = (clave) => {
  const i = mesesAbiertos.value.indexOf(clave)
  if (i === -1) mesesAbiertos.value.push(clave)
  else mesesAbiertos.value.splice(i, 1)
}

const textoAsistencia = (a) => (a === 'presente' ? 'Presente' : a === 'ausente' ? 'Ausente' : 'Sin registro')
const claseAsistencia = (a) => (a === 'presente' ? 'bg-success' : a === 'ausente' ? 'bg-secondary' : 'bg-light text-muted border')

onMounted(async () => {
  try {
    const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMisDesignacionesCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar tus designaciones')
    modalidad.value = res.payload?.modalidad || ''
    encuentros.value = res.payload?.encuentros || []
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
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
.designacion { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background: #fff; }
.designacion.destacada { border-color: #dc2626; border-left: 5px solid #dc2626; background: #fef2f2; }
.designacion.pasada { background: #f8fafc; }
.cal-box { width: 50px; border-radius: 10px; background: #fee2e2; color: #b91c1c; padding: 6px 0; }
.designacion.destacada .cal-box { background: #dc2626; color: #fff; }
.cal-box .dia { font-size: 1.2rem; font-weight: 800; line-height: 1; }
.cal-box .mes { font-size: 0.62rem; font-weight: 700; margin-top: 2px; }
.comentarios { white-space: pre-wrap; background: #fff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 6px 10px; color: #1e293b; }
.min-w-0 { min-width: 0; }
.acordeon-mes { background: #fff; border: none; cursor: pointer; transition: background-color 0.15s ease; }
.acordeon-mes:hover { background: #f8fafc; }
</style>
