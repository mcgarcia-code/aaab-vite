<template>
  <div>
    <!-- Filtros en celular -->
    <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="small fw-bold text-dark text-uppercase">Filtrar Árbitros</span>
        <button type="button" @click="mostrarFiltrosMobile = false" class="btn-close btn-sm" aria-label="Cerrar filtros"></button>
      </div>
      <div class="row g-2">
        <div class="col-6"><input aria-label="Apellido" v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="APELLIDO..."></div>
        <div class="col-6"><input aria-label="Nombre" v-model="filtros.nombre"   class="form-control form-control-sm shadow-none" placeholder="NOMBRE..."></div>
        <div class="col-6">
          <select aria-label="Filtrar por grupo" v-model="filtros.grupo" class="form-select form-select-sm shadow-none text-uppercase text-dark">
            <option value="">GRUPO</option>
            <option v-for="g in GRUPOS" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>
        <div class="col-6">
          <select aria-label="Filtrar por subgrupo" v-model="filtros.subgrupo" class="form-select form-select-sm shadow-none text-uppercase text-dark">
            <option value="">SUBGRUPO</option>
            <option v-for="sg in SUBGRUPOS" :key="sg" :value="sg">{{ sg }}</option>
          </select>
        </div>
        <div class="col-12" v-if="modoReunion">
          <select aria-label="Filtrar por asistencia" v-model="filtros.asistencia" class="form-select form-select-sm shadow-none text-uppercase text-dark">
            <option value="">ASISTENCIA</option>
            <option value="presente">SOLO PRESENTES</option>
            <option value="ausente">SOLO AUSENTES</option>
            <option value="sin_registro">SIN REGISTRO</option>
          </select>
        </div>
        <div class="col-12 mt-2">
          <button type="button" @click="mostrarFiltrosMobile = false" class="btn btn-danger rounded-pill w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
        </div>
      </div>
    </div>

    <div class="card-body p-0 p-md-3 bg-white">
      <!-- Escritorio: tabla -->
      <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
        <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija texto-075">
          <thead class="table-light">
            <tr>
              <th class="py-3 ps-3 text-uppercase text-muted col-fija col-id" style="width: 50px;">ID</th>
              <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones" style="width: 90px;">Acciones</th>
              <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
              <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
              <th class="py-3 text-center text-uppercase text-muted">Grupo</th>
              <th class="py-3 text-center text-uppercase text-muted">Subgrupo</th>
              <th v-if="!modoReunion" class="py-3 text-center text-uppercase text-muted">Reuniones</th>
              <slot v-if="modoReunion" name="encabezado-extra"></slot>
              <th v-if="modoReunion" class="py-3 text-uppercase text-muted" style="min-width: 270px;">
                Asistencia
                <span class="fw-normal fst-italic text-muted ms-1 texto-07">(guardado automático)</span>
              </th>
            </tr>
            <tr class="bg-light">
              <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id"></td>
              <td class="p-2 border-bottom border-2 col-fija col-acciones"></td>
              <td class="p-2 border-bottom border-2 col-fija col-apellido">
                <input aria-label="Filtrar por apellido" v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="FILTRAR..">
              </td>
              <td class="p-2 border-bottom border-2 col-fija col-nombre">
                <input aria-label="Filtrar por nombre" v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="FILTRAR..">
              </td>
              <td class="p-2 border-bottom border-2">
                <select aria-label="Filtrar por grupo" v-model="filtros.grupo" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                  <option value="">TODOS</option>
                  <option v-for="g in GRUPOS" :key="g" :value="g">{{ g }}</option>
                </select>
              </td>
              <td class="p-2 border-bottom border-2">
                <select aria-label="Filtrar por subgrupo" v-model="filtros.subgrupo" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                  <option value="">TODOS</option>
                  <option v-for="sg in SUBGRUPOS" :key="sg" :value="sg">{{ sg }}</option>
                </select>
              </td>
              <td class="p-2 border-bottom border-2 text-center" v-if="!modoReunion">
                <span class="text-muted small fst-italic">← Seleccioná una reunión</span>
              </td>
              <td v-if="modoReunion && $slots['encabezado-extra']" class="p-2 border-bottom border-2"></td>
              <td v-if="modoReunion" class="p-2 border-bottom border-2">
                <select aria-label="Filtrar por asistencia" v-model="filtros.asistencia" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                  <option value="">TODAS</option>
                  <option value="presente">SOLO PRESENTES</option>
                  <option value="ausente">SOLO AUSENTES</option>
                  <option value="sin_registro">SIN REGISTRO</option>
                </select>
              </td>
            </tr>
          </thead>

          <tbody>
            <tr v-if="cargandoInicial || cargandoArbitros">
              <td :colspan="columnas">
                <EstadoCargando texto="Cargando datos" />
              </td>
            </tr>
            <tr v-else-if="!arbitrosPaginados.length">
              <td :colspan="columnas" class="border-0">
                <EstadoVacio icono="bi-search" titulo="No se encontraron árbitros" />
              </td>
            </tr>
            <tr
              v-else
              v-for="a in arbitrosPaginados"
              :key="a.id"
              :class="{
                'fila-presente': modoReunion && asistencias[a.id] === 'presente',
                'fila-ausente':  modoReunion && asistencias[a.id] === 'ausente',
              }"
            >
              <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ a.id }}</td>
              <td class="text-center col-fija col-acciones">
                <div class="d-flex justify-content-center gap-1">
                  <button type="button" @click="emit('ver-historial', a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver historial" aria-label="Ver historial">
                    <i class="bi bi-search texto-16px"></i>
                  </button>
                </div>
              </td>
              <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
              <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
              <td class="text-center text-dark">{{ a.nombre_grupo || a.grupo || '-' }}</td>
              <td class="text-center text-dark">{{ a.subgrupo || '-' }}</td>

              <td v-if="!modoReunion" class="text-center">
                <div class="d-flex align-items-center justify-content-center gap-2">
                  <ResumenAsistencia :resumen="resumenAsistencia(a.id)" />
                </div>
              </td>

              <slot v-if="modoReunion" name="celda-extra" :arbitro="a"></slot>

              <td v-if="modoReunion">
                <div class="d-flex align-items-center gap-3">
                  <div class="form-check form-check-inline mb-0">
                    <input
                      type="radio"
                      :id="`pres-${a.id}`"
                      :name="`asist-${a.id}`"
                      value="presente"
                      v-model="asistencias[a.id]"
                      @change="emit('guardar', a)"
                      :disabled="!!guardando[a.id]"
                      class="form-check-input radio-presente"
                    >
                    <label :for="`pres-${a.id}`" class="form-check-label fw-bold text-success">✓ Presente</label>
                  </div>
                  <div class="form-check form-check-inline mb-0">
                    <input
                      type="radio"
                      :id="`aus-${a.id}`"
                      :name="`asist-${a.id}`"
                      value="ausente"
                      v-model="asistencias[a.id]"
                      @change="emit('guardar', a)"
                      :disabled="!!guardando[a.id]"
                      class="form-check-input radio-ausente"
                    >
                    <label :for="`aus-${a.id}`" class="form-check-label fw-bold text-secondary">✗ Ausente</label>
                  </div>
                  <span class="estado-indicator">
                    <span v-if="guardando[a.id]"       class="spinner-border spinner-border-sm text-danger" role="status"></span>
                    <i    v-else-if="guardadoOk[a.id]" class="bi bi-check-circle-fill text-success"></i>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Celular: tarjetas -->
      <div class="d-md-none p-3 bg-light">
        <EstadoCargando v-if="cargandoInicial || cargandoArbitros" texto="Cargando datos" />
        <template v-else>
          <div
            v-for="a in arbitrosPaginados"
            :key="'mob-'+a.id"
            class="card shadow-sm mb-3 border-light-subtle rounded-3"
            :class="{
              'border-success border-2':   modoReunion && asistencias[a.id] === 'presente',
              'border-secondary border-2': modoReunion && asistencias[a.id] === 'ausente',
            }"
          >
            <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
              <div class="text-dark fw-bold text-uppercase texto-105">{{ a.apellido }}, {{ a.nombre }}</div>
              <div class="d-flex align-items-center gap-2">
                <div class="small text-muted fw-bold font-monospace">#{{ a.id }}</div>
                <span v-if="modoReunion && guardando[a.id]"    class="spinner-border spinner-border-sm text-danger"></span>
                <i v-else-if="modoReunion && guardadoOk[a.id]" class="bi bi-check-circle-fill text-success fs-6"></i>
              </div>
            </div>
            <div class="card-body pt-0 px-3 pb-3">
              <div class="d-flex justify-content-between text-dark mb-2 border-bottom border-secondary-subtle pb-2">
                <span class="small">
                  <strong>Grupo:</strong> {{ a.grupo }}
                  <template v-if="a.subgrupo"> / {{ a.subgrupo }}</template>
                </span>
                <span class="small"><strong>Reuniones:</strong> {{ resumenAsistencia(a.id).total }}</span>
              </div>

              <slot v-if="modoReunion" name="tarjeta-extra" :arbitro="a"></slot>

              <div v-if="!modoReunion" class="d-flex gap-2">
                <div class="flex-grow-1 bg-light p-2 rounded border border-light-subtle">
                  <ResumenAsistencia :resumen="resumenAsistencia(a.id)" :mobile="true" />
                </div>
                <button type="button" @click="emit('ver-historial', a)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center" aria-label="Ver historial">
                  <i class="bi bi-search texto-18px"></i>
                </button>
              </div>

              <div v-else class="d-flex gap-2">
                <label
                  :for="`presm-${a.id}`"
                  class="toggle-asist flex-grow-1 d-flex align-items-center justify-content-center py-2 rounded-2 fw-bold small"
                  :class="asistencias[a.id] === 'presente'
                    ? 'bg-success text-white border border-success'
                    : 'bg-white text-success border border-success'"
                >
                  <input type="radio" :id="`presm-${a.id}`" :name="`asistm-${a.id}`" value="presente"
                    v-model="asistencias[a.id]" @change="emit('guardar', a)" :disabled="!!guardando[a.id]" class="visually-hidden">
                  ✓ Presente
                </label>
                <label
                  :for="`ausm-${a.id}`"
                  class="toggle-asist flex-grow-1 d-flex align-items-center justify-content-center py-2 rounded-2 fw-bold small"
                  :class="asistencias[a.id] === 'ausente'
                    ? 'bg-secondary text-white border border-secondary'
                    : 'bg-white text-secondary border border-secondary'"
                >
                  <input type="radio" :id="`ausm-${a.id}`" :name="`asistm-${a.id}`" value="ausente"
                    v-model="asistencias[a.id]" @change="emit('guardar', a)" :disabled="!!guardando[a.id]" class="visually-hidden">
                  ✗ Ausente
                </label>
              </div>
            </div>
          </div>

          <EstadoVacio v-if="!arbitrosPaginados.length" icono="bi-search" titulo="No se encontraron árbitros" />
        </template>
      </div>

      <BarraPaginacion v-model="paginaActual" :total="totalPaginas" class="mt-4 mb-3" />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, useSlots, defineComponent, h } from 'vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'

// Árbitros de las reuniones: tabla (escritorio) y tarjetas (celular), con filtros y paginación.
// Sin reunión elegida muestra el total de presentes/ausentes de cada árbitro; con una reunión,
// la asistencia de esa reunión para marcar.
// El estado viene de useAsistenciaReuniones, que la pantalla comparte con provide('asistenciaReuniones').
// Slots para una columna extra en modo reunión: encabezado-extra, celda-extra y tarjeta-extra ({ arbitro }).
const emit = defineEmits(['ver-historial', 'guardar'])

const {
  filtros, mostrarFiltrosMobile, GRUPOS, SUBGRUPOS, modoReunion,
  cargandoInicial, cargandoArbitros, arbitrosPaginados, asistencias, guardando, guardadoOk,
  resumenAsistencia, paginaActual, totalPaginas
} = inject('asistenciaReuniones')

const slots = useSlots()
const columnas = computed(() => 7 + (modoReunion.value && slots['encabezado-extra'] ? 1 : 0))

// Totales de reuniones de un árbitro (presentes y ausentes)
const ResumenAsistencia = defineComponent({
  props: { resumen: Object, mobile: Boolean },
  setup(props) {
    return () => {
      const r = props.resumen ?? { presentes: 0, ausentes: 0 }
      const items = []
      if (r.presentes > 0) items.push({ label: 'Presentes', short: 'pres.', clase: 'estado-verde',   icon: 'bi-person-check-fill', count: r.presentes })
      if (r.ausentes  > 0) items.push({ label: 'Ausentes',  short: 'aus.',  clase: 'estado-naranja', icon: 'bi-person-dash-fill',  count: r.ausentes  })
      if (!items.length) {
        return h('div', { class: 'd-flex gap-1 flex-wrap' }, [
          h('span', { class: 'estado-pill estado-gris', title: 'Sin registro' }, '0')
        ])
      }
      return h('div', { class: 'd-flex gap-1 flex-wrap' }, items.map(k =>
        h('span', { class: `estado-pill ${k.clase}`, title: k.label },
          props.mobile ? `${k.count} ${k.short}` : [h('i', { class: `bi ${k.icon} me-1` }), String(k.count)]
        )
      ))
    }
  },
})
</script>

<style scoped>
.col-acciones { left: 60px;  min-width: 90px;  }
.col-apellido { left: 150px; min-width: 150px; }
.col-nombre   { left: 300px; min-width: 150px; }
.col-nombre::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to right, rgba(0,0,0,0.1), transparent); }
.fila-presente           { background-color: var(--o-verde-fondo, #f0fdf4) !important; }
.fila-presente .col-fija { background-color: var(--o-verde-fondo, #f0fdf4) !important; }
.fila-ausente            { background-color: var(--o-superficie, #f9fafb) !important; }
.fila-ausente  .col-fija { background-color: var(--o-superficie, #f9fafb) !important; }
.radio-presente { accent-color: var(--o-verde-texto, #198754); }
.radio-ausente  { accent-color: var(--o-texto-suave, #6c757d); }
.estado-indicator { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; }
.toggle-asist { cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease; user-select: none; font-size: 0.85rem; }
.toggle-asist:active { opacity: 0.82; }
</style>
