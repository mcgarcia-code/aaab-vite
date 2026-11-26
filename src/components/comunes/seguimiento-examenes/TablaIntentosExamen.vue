<template>
  <div>
    <!-- ============ FILTROS ============ -->
    <div class="d-flex flex-wrap gap-2 gap-md-3 align-items-center px-3 py-2 border-bottom bg-light small">
      <div class="busqueda-wrap">
        <input v-model="filtros.texto" class="form-control form-control-sm shadow-none" placeholder="Buscar persona o examen..." aria-label="Buscar persona o examen">
        <button v-if="filtros.texto" class="btn-limpiar-busqueda" type="button" title="Limpiar búsqueda" aria-label="Limpiar búsqueda" @click="filtros.texto = ''">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <slot name="filtros"></slot>
      <select v-model="filtros.estado" class="form-select form-select-sm shadow-none w-auto" aria-label="Estado del examen">
        <option value="">Todos los estados</option>
        <option value="finalizado">Finalizados</option>
        <option value="en_curso">En curso</option>
      </select>
      <div class="form-check form-switch m-0">
        <input id="seguimiento-alertas" v-model="filtros.soloAlertas" class="form-check-input shadow-none" type="checkbox" role="switch">
        <label for="seguimiento-alertas" class="form-check-label fw-bold text-dark">Solo con avisos</label>
      </div>
      <span class="text-muted text-nowrap ms-auto">{{ filas.length }} de {{ intentos.length }}</span>
    </div>

    <EstadoCargando v-if="cargando && !intentos.length" texto="Cargando exámenes" />
    <EstadoVacio v-else-if="!filas.length" icono="bi-search" :titulo="intentos.length ? 'Ningún examen coincide con el filtro' : textoVacio" />

    <template v-else>
      <!-- ESCRITORIO -->
      <div class="d-none d-lg-block table-responsive">
        <table class="table table-hover align-middle mb-0 small">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Persona</th>
              <th>Examen</th>
              <th class="text-center">Estado</th>
              <th class="text-center">Nota</th>
              <th class="text-center">Actividad</th>
              <th>Avisos</th>
              <th class="text-end pe-3">Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in filas" :key="i.clave" class="fila-intento" @click="emit('ver', i)">
              <td class="ps-3">
                <div class="fw-bold text-dark text-uppercase">{{ i.persona }}</div>
                <span v-if="i.personaDetalle" class="badge mt-1" :class="i.personaDetalleClase || 'bg-light text-dark border'">{{ i.personaDetalle }}</span>
              </td>
              <td>
                <div class="fw-semibold text-dark">{{ i.examen }}</div>
                <small class="text-muted">{{ i.examenDetalle }}</small>
              </td>
              <td class="text-center">
                <span class="badge" :class="ESTADOS_INTENTO[i.estado]?.clase || 'bg-light text-dark border'">{{ ESTADOS_INTENTO[i.estado]?.etiqueta || i.estado }}</span>
              </td>
              <td class="text-center fw-bold" :class="claseNota(i)">{{ textoNota(i) }}</td>
              <td class="text-center text-nowrap">
                <span :title="'Pasos registrados'"><i class="bi bi-list-ol me-1"></i>{{ i.seguimiento.pasos }}</span>
                <span class="ms-2" :title="'Veces que abrió el examen'"><i class="bi bi-box-arrow-in-right me-1"></i>{{ i.seguimiento.aperturas }}</span>
              </td>
              <td>
                <div class="d-flex flex-wrap gap-1">
                  <span v-for="a in alertasIntento(i.seguimiento)" :key="a.texto" class="badge rounded-pill" :class="a.clase" :title="a.ayuda">{{ a.texto }}</span>
                </div>
              </td>
              <td class="text-end pe-3">
                <button type="button" class="btn btn-sm btn-light border" title="Ver seguimiento" :aria-label="'Ver seguimiento de ' + i.persona" @click.stop="emit('ver', i)">
                  <i class="bi bi-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CELULAR Y TABLET -->
      <div class="d-lg-none p-3">
        <button v-for="i in filas" :key="'m-' + i.clave" type="button" class="card shadow-sm mb-3 border-light-subtle rounded-3 w-100 text-start p-0" @click="emit('ver', i)">
          <div class="card-body p-3 small w-100">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div class="min-w-0">
                <div class="fw-bold text-dark text-uppercase">{{ i.persona }}</div>
                <div class="text-dark">{{ i.examen }}</div>
                <small class="text-muted">{{ i.examenDetalle }}</small>
              </div>
              <div class="text-end flex-shrink-0">
                <span class="badge d-block mb-1" :class="ESTADOS_INTENTO[i.estado]?.clase || 'bg-light text-dark border'">{{ ESTADOS_INTENTO[i.estado]?.etiqueta || i.estado }}</span>
                <span class="fw-bold" :class="claseNota(i)">{{ textoNota(i) }}</span>
              </div>
            </div>
            <div class="d-flex flex-wrap gap-1 mt-2 align-items-center">
              <span v-if="i.personaDetalle" class="badge" :class="i.personaDetalleClase || 'bg-light text-dark border'">{{ i.personaDetalle }}</span>
              <span class="badge bg-light text-dark border"><i class="bi bi-list-ol me-1"></i>{{ i.seguimiento.pasos }} pasos</span>
              <span v-for="a in alertasIntento(i.seguimiento)" :key="a.texto" class="badge rounded-pill" :class="a.clase">{{ a.texto }}</span>
            </div>
          </div>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import { ESTADOS_INTENTO, alertasIntento } from '@/composables/useSeguimientoExamenes'
import { aprobado as estaAprobado } from '@/utils/cuestionarios'
import { normalizarTexto } from '@/utils/texto'

// Lista de intentos de exámenes online con su resumen de seguimiento (árbitros y aspirantes del curso).
// Cada intento llega ya armado por la pantalla que la usa:
// { clave, persona, personaDetalle?, personaDetalleClase?, examen, examenDetalle, estado, calificacion, aprobado, seguimiento }
// filtrar(intento): filtro extra de la pantalla (ej. categoría del evento o curso)
const props = defineProps({
  intentos: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false },
  textoVacio: { type: String, default: 'No hay exámenes online en este año' },
  filtrar: { type: Function, default: () => true }
})
const emit = defineEmits(['ver'])

const filtros = reactive({ texto: '', estado: '', soloAlertas: false })

const filas = computed(() => {
  const texto = normalizarTexto(filtros.texto)
  return props.intentos.filter(i =>
    props.filtrar(i) &&
    (!texto || normalizarTexto(`${i.persona} ${i.examen}`).includes(texto)) &&
    (!filtros.estado || i.estado === filtros.estado) &&
    (!filtros.soloAlertas || alertasIntento(i.seguimiento).some(a => a.texto !== 'Sin registro'))
  )
})

const textoNota = (i) => (i.calificacion === null || i.calificacion === undefined || i.estado !== 'finalizado'
  ? '—'
  : `${Number(i.calificacion).toLocaleString('es-AR', { maximumFractionDigits: 2 })}%`)
const claseNota = (i) => {
  if (i.estado !== 'finalizado' || i.calificacion === null) return 'text-muted'
  const aprobo = i.aprobado ?? estaAprobado(i.calificacion)
  return aprobo ? 'text-success' : 'text-danger'
}
</script>

<style scoped>
.min-w-0 { min-width: 0; }
.fila-intento { cursor: pointer; }

.busqueda-wrap { position: relative; flex: 1 1 180px; max-width: 280px; }
.busqueda-wrap input { padding-right: 30px; }
.btn-limpiar-busqueda {
  position: absolute; top: 50%; right: 6px; transform: translateY(-50%);
  border: none; background: transparent; padding: 0; width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  color: var(--o-texto-suave, #adb5bd); font-size: 0.75rem;
}
</style>
