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
          <span class="spinner-border text-danger"></span>
        </div>
        <div v-else-if="error" class="alert alert-danger small mb-0">{{ error }}</div>
        <div v-else-if="!clases.length" class="text-center py-5 text-muted">
          <span class="material-icons d-block fs-1 mb-2 opacity-50">event_busy</span>
          <span class="fw-bold">Todavía no hay clases cargadas.</span>
        </div>
        <template v-else>
          <div v-if="proximaClase" class="proxima-destacada rounded-3 p-3 mb-4">
            <div class="small text-uppercase fw-bold text-danger mb-1" style="letter-spacing: 1px;">Próxima clase</div>
            <div class="fw-bold text-dark fs-6">{{ proximaClase.titulo }}</div>
            <div class="small text-dark">
              {{ fechaLargaClase(proximaClase.fecha) }}<template v-if="horarioClase(proximaClase)"> · {{ horarioClase(proximaClase) }}</template>
            </div>
            <div class="small text-muted">
              {{ proximaClase.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}<template v-if="proximaClase.lugar"> · {{ proximaClase.lugar }}</template>
            </div>
            <a v-if="proximaClase.enlace" :href="proximaClase.enlace" target="_blank" rel="noopener noreferrer" class="btn btn-danger btn-sm fw-bold mt-2">
              <i class="bi bi-box-arrow-up-right me-1"></i> Entrar a la clase
            </a>
          </div>

          <div v-for="grupo in clasesPorMes" :key="grupo.mes" class="mb-4">
            <h6 class="text-danger fw-bold text-uppercase small border-bottom pb-2 mb-3" style="letter-spacing: 1px;">{{ grupo.mes }}</h6>
            <div class="d-flex flex-column gap-2">
              <div v-for="c in grupo.clases" :key="c.id" class="clase-item d-flex gap-3 border rounded-3 p-3" :class="{ pasada: esClasePasada(c) }">
                <div class="cal-box text-center flex-shrink-0">
                  <div class="dia">{{ Number(c.fecha.substring(8, 10)) }}</div>
                  <div class="mes">{{ grupo.mes.substring(0, 3).toUpperCase() }}</div>
                </div>
                <div class="flex-grow-1 min-w-0">
                  <div class="fw-bold text-dark">{{ c.titulo }}</div>
                  <div class="small text-muted">
                    {{ fechaLargaClase(c.fecha) }}<template v-if="horarioClase(c)"> · {{ horarioClase(c) }}</template>
                  </div>
                  <div class="small text-muted">
                    <i class="bi" :class="c.modalidad === 'virtual' ? 'bi-camera-video' : 'bi-geo-alt'"></i>
                    {{ c.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}<template v-if="c.lugar"> · {{ c.lugar }}</template>
                  </div>
                  <div v-if="c.descripcion" class="small text-dark mt-1 texto-multilinea">{{ c.descripcion }}</div>
                  <a v-if="c.enlace && !esClasePasada(c)" :href="c.enlace" target="_blank" rel="noopener noreferrer" class="small d-inline-block mt-1">
                    <i class="bi bi-link-45deg"></i> Enlace
                  </a>
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
import { onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { useCronogramaCurso, fechaLargaClase, horarioClase, esClasePasada } from '@/composables/useCronogramaCurso'

useHead({ title: 'Cronograma | Curso AAAB' })

const anio = new Date().getFullYear()
const { clases, cargando, error, cargar, clasesPorMes, proximaClase } = useCronogramaCurso()

onMounted(() => cargar(anio))
</script>

<style scoped>
.proxima-destacada {
  background: #fef2f2;
  border: 1px solid #fecaca;
}
.clase-item { background: #fff; }
.clase-item.pasada { background: #f8fafc; opacity: 0.7; }
.cal-box {
  width: 52px;
  border-radius: 10px;
  background: #fee2e2;
  color: #b91c1c;
  padding: 6px 0;
}
.cal-box .dia { font-size: 1.25rem; font-weight: 800; line-height: 1; }
.cal-box .mes { font-size: 0.65rem; font-weight: 700; }
.min-w-0 { min-width: 0; }
.texto-multilinea { white-space: pre-wrap; }
</style>
