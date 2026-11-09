<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-calendar3-week me-1"></i> Cronograma {{ anio }}
          </h4>
          <span class="text-muted small d-block mt-1">Clases del curso de árbitros</span>
        </div>
      </div>

      <div class="card-body p-3 p-md-4">
        <div v-if="cargando" class="text-center py-5">
          <span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando cronograma...</p>
        </div>
        <div v-else-if="error" class="alert alert-danger small mb-0">{{ error }}</div>
        <div v-else-if="!clases.length" class="text-center py-5 text-muted">
          <span class="material-icons d-block fs-1 mb-2 opacity-50">event_busy</span>
          <span class="fw-bold">Todavía no hay clases cargadas.</span>
        </div>
        <template v-else>
          <!-- PRÓXIMA CLASE: siempre visible -->
          <div v-if="proximaClase" class="proxima-destacada rounded-3 p-3 mb-4 d-flex gap-3">
            <div class="cal-box cal-box-grande text-center flex-shrink-0">
              <div class="dia">{{ Number(proximaClase.fecha.substring(8, 10)) }}</div>
              <div class="mes">{{ mesCorto(proximaClase.fecha) }}</div>
            </div>
            <div class="min-w-0">
              <div class="small text-uppercase fw-bold text-danger mb-1" style="letter-spacing: 1px;">
                {{ proximaClase.fecha === hoy ? 'Hoy hay clase' : 'Próxima clase' }}
              </div>
              <div class="fw-bold text-dark fs-6 text-break">{{ proximaClase.titulo }}</div>
              <div class="small text-dark">
                {{ fechaLargaClase(proximaClase.fecha) }}<template v-if="horarioClase(proximaClase)"> · {{ horarioClase(proximaClase) }}</template>
              </div>
              <div class="small text-muted">
                <i class="bi" :class="proximaClase.modalidad === 'virtual' ? 'bi-camera-video' : 'bi-geo-alt'"></i>
                {{ proximaClase.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}<template v-if="proximaClase.lugar"> · {{ proximaClase.lugar }}</template>
              </div>
              <div v-if="proximaClase.docentes?.length" class="small text-dark">
                <i class="bi bi-person-video3 me-1"></i><strong>Dictada por:</strong> {{ proximaClase.docentes.map(d => d.nombre).join(' · ') }}
              </div>
              <a v-if="proximaClase.enlace" :href="proximaClase.enlace" target="_blank" rel="noopener noreferrer" class="btn btn-danger btn-sm fw-bold mt-2">
                <i class="bi bi-box-arrow-up-right me-1"></i> Entrar a la clase
              </a>
            </div>
          </div>
          <div v-else class="alert alert-light border small mb-4">
            <i class="bi bi-check2-circle me-1 text-success"></i> Ya se dictaron todas las clases del año.
          </div>

          <!-- MESES EN ACORDEÓN -->
          <div class="accordion" id="acordeonMeses">
            <div v-for="grupo in meses" :key="grupo.mes" class="accordion-item">
              <h2 class="accordion-header">
                <button
                  type="button"
                  class="accordion-button fw-bold"
                  :class="{ collapsed: !abiertos[grupo.mes] }"
                  :aria-expanded="Boolean(abiertos[grupo.mes])"
                  :aria-controls="'mes-' + grupo.clave"
                  @click="abiertos[grupo.mes] = !abiertos[grupo.mes]"
                >
                  <span class="text-uppercase me-2">{{ grupo.mes }}</span>
                  <span class="badge rounded-pill me-1" :class="grupo.proximas.length ? 'bg-danger' : 'bg-secondary'">{{ grupo.clases.length }} {{ grupo.clases.length === 1 ? 'clase' : 'clases' }}</span>
                  <span v-if="!grupo.proximas.length" class="badge bg-light text-muted border">Dictadas</span>
                  <span v-else-if="grupo.pasadas.length" class="badge bg-light text-muted border">{{ grupo.pasadas.length }} dictadas</span>
                </button>
              </h2>
              <div v-show="abiertos[grupo.mes]" :id="'mes-' + grupo.clave" class="accordion-collapse">
                <div class="accordion-body p-2 p-md-3 d-flex flex-column gap-2">
                  <!-- Clases ya dictadas del mes: contraídas -->
                  <template v-if="grupo.pasadas.length && grupo.proximas.length">
                    <button type="button" class="btn btn-light btn-sm border text-start fw-bold text-muted" :aria-expanded="Boolean(pasadasVisibles[grupo.mes])" @click="pasadasVisibles[grupo.mes] = !pasadasVisibles[grupo.mes]">
                      <i class="bi me-1" :class="pasadasVisibles[grupo.mes] ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                      {{ pasadasVisibles[grupo.mes] ? 'Ocultar' : 'Ver' }} {{ grupo.pasadas.length }} {{ grupo.pasadas.length === 1 ? 'clase dictada' : 'clases dictadas' }}
                    </button>
                    <template v-if="pasadasVisibles[grupo.mes]">
                      <ClaseItem v-for="c in grupo.pasadas" :key="c.id" :clase="c" pasada />
                    </template>
                  </template>
                  <template v-else-if="!grupo.proximas.length">
                    <ClaseItem v-for="c in grupo.pasadas" :key="c.id" :clase="c" pasada />
                  </template>

                  <ClaseItem v-for="c in grupo.proximas" :key="c.id" :clase="c" :destacada="proximaClase?.id === c.id" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted, defineComponent, h } from 'vue'
import { useHead } from '@vueuse/head'
import { useCronogramaCurso, fechaLargaClase, horarioClase, esClasePasada } from '@/composables/useCronogramaCurso'

useHead({ title: 'Cronograma | Curso AAAB' })

const anio = new Date().getFullYear()
const { clases, cargando, error, cargar, clasesPorMes, proximaClase } = useCronogramaCurso()

const hoy = new Date().toLocaleDateString('sv-SE')
const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const mesCorto = (fecha) => MESES_CORTOS[Number(fecha.substring(5, 7)) - 1]

const meses = computed(() => clasesPorMes.value.map((g, i) => ({
  ...g,
  clave: i,
  pasadas: g.clases.filter(esClasePasada),
  proximas: g.clases.filter(c => !esClasePasada(c)),
})))

// Abiertos: los meses con clases por venir. Los meses ya dictados arrancan contraídos.
const abiertos = reactive({})
const pasadasVisibles = reactive({})

watch(meses, (lista) => {
  lista.forEach(g => {
    if (!(g.mes in abiertos)) abiertos[g.mes] = g.proximas.length > 0
  })
}, { immediate: true })

// Tarjeta de una clase
const ClaseItem = defineComponent({
  props: {
    clase: { type: Object, required: true },
    pasada: { type: Boolean, default: false },
    destacada: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const c = props.clase
      const virtual = c.modalidad === 'virtual'
      return h('div', { class: ['clase-item d-flex gap-3 border rounded-3 p-2 p-md-3', { pasada: props.pasada, destacada: props.destacada }] }, [
        h('div', { class: 'cal-box text-center flex-shrink-0' }, [
          h('div', { class: 'dia' }, Number(c.fecha.substring(8, 10))),
          h('div', { class: 'mes' }, mesCorto(c.fecha)),
        ]),
        h('div', { class: 'flex-grow-1 min-w-0' }, [
          h('div', { class: 'd-flex justify-content-between align-items-start gap-2' }, [
            h('div', { class: 'fw-bold text-dark text-break' }, c.titulo),
            props.pasada ? h('span', { class: 'badge bg-light text-muted border flex-shrink-0' }, 'Dictada') : null,
            props.destacada ? h('span', { class: 'badge bg-danger flex-shrink-0' }, 'Próxima') : null,
          ]),
          h('div', { class: 'small text-muted' }, [fechaLargaClase(c.fecha), horarioClase(c) ? ` · ${horarioClase(c)}` : '']),
          h('div', { class: 'small text-muted' }, [
            h('i', { class: ['bi me-1', virtual ? 'bi-camera-video' : 'bi-geo-alt'] }),
            virtual ? 'Virtual' : 'Presencial',
            c.lugar ? ` · ${c.lugar}` : '',
          ]),
          c.docentes?.length
            ? h('div', { class: 'small text-dark' }, [h('i', { class: 'bi bi-person-video3 me-1' }), h('strong', 'Dictada por: '), c.docentes.map(d => d.nombre).join(' · ')])
            : null,
          c.descripcion && !props.pasada ? h('div', { class: 'small text-dark mt-1 texto-multilinea' }, c.descripcion) : null,
          c.enlace && !props.pasada
            ? h('a', { href: c.enlace, target: '_blank', rel: 'noopener noreferrer', class: 'small d-inline-block mt-1' }, [h('i', { class: 'bi bi-link-45deg' }), ' Enlace'])
            : null,
        ]),
      ])
    }
  },
})

onMounted(() => cargar(anio))
</script>

<style scoped>
.proxima-destacada {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-left: 5px solid #dc2626;
}
.accordion-item { border-radius: 10px !important; overflow: hidden; margin-bottom: 8px; border: 1px solid #e2e8f0; }
.accordion-button { font-size: 0.9rem; color: #0f172a; background: #fff; box-shadow: none; flex-wrap: wrap; row-gap: 4px; }
.accordion-button:not(.collapsed) { color: #dc2626; background: #fef2f2; }
.accordion-button:focus { box-shadow: 0 0 0 0.2rem rgba(220, 38, 38, 0.2); }
:deep(.clase-item) { background: #fff; }
:deep(.clase-item.pasada) { background: #f8fafc; opacity: 0.75; }
:deep(.clase-item.destacada) { border-color: #dc2626 !important; box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.12); }
:deep(.cal-box), .cal-box {
  width: 48px;
  border-radius: 10px;
  background: #fee2e2;
  color: #b91c1c;
  padding: 6px 0;
}
.cal-box-grande { width: 58px; background: #dc2626; color: #fff; }
:deep(.cal-box .dia), .cal-box .dia { font-size: 1.2rem; font-weight: 800; line-height: 1; }
:deep(.cal-box .mes), .cal-box .mes { font-size: 0.62rem; font-weight: 700; margin-top: 2px; }
:deep(.min-w-0), .min-w-0 { min-width: 0; }
:deep(.texto-multilinea) { white-space: pre-wrap; }
</style>
