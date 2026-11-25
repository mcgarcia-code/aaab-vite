<template>
  <div class="d-none d-md-block border rounded shadow-sm bg-white grilla-container">
    <table class="table align-middle mb-0 grilla-designaciones">
    <thead>
      <tr>
        <th class="text-uppercase text-muted" style="width: 15%;">Categoría / División</th>
        <th class="text-uppercase text-muted text-center" style="width: 6%;">Horario</th>
        <th class="text-uppercase text-muted" style="width: 14%;">Local</th>
        <th class="text-uppercase text-muted" style="width: 14%;">Visitante</th>
        <th class="text-uppercase text-muted text-center" style="width: 5%;">Susp.</th>
        <th class="text-uppercase text-muted" style="width: 10%;">Árbitro 1</th>
        <th class="text-uppercase text-muted" style="width: 10%;">Árbitro 2</th>
        <th class="text-uppercase text-muted" style="width: 10%;">Observador</th>
        <th class="text-uppercase text-muted" style="width: 10%;">Del. Técnico</th>
        <th class="text-uppercase text-muted text-center" style="width: 4%;">Mesa</th>
        <th style="width: 2%;"></th>
      </tr>
    </thead>
      <tbody>
        <template v-for="c in canchas" :key="fechaSeleccionada + '-' + c.nombre">

    <tr class="fila-cancha">
      <td colspan="11">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-geo-alt fs-5"></i>

          <span class="nombre-cancha fw-bold text-uppercase">
            {{ c.nombre }}
          </span>

          <a
            v-if="c.linkMapa"
            :href="c.linkMapa"
            target="_blank"
            rel="noopener noreferrer"
            class="link-mapa"
            title="Ver ubicación en Google Maps"
          >
            Mapa
          </a>

          <span class="badge bg-white text-dark rounded-pill">
            {{ c.partidos.length }} PARTIDOS
          </span>
        </div>
      </td>
    </tr>

          <tr
            v-for="p in c.partidos"
            :key="p.id || p._uid"
            :id="'partido-' + (p.id || p._uid)"
            :class="[
              'fila-estado-' + estadoDesignacion(p),
              { 'fila-suspendida': p.suspendido, 'fila-resaltada': partidoResaltado === (p.id || p._uid) }
            ]"
          >
            <td>
              <span class="celda-texto d-flex align-items-center gap-2">
                <span class="punto-estado" :class="'punto-' + estadoDesignacion(p)" :title="tituloEstado(p)"></span>
                {{ p.categoria_division || '—' }}
              </span>
              <button
                v-if="!p.cancha"
                @click="emit('cancha', p)"
                class="badge-sin-cancha"
                title="Asignar cancha a este partido"
              >
                <i class="bi bi-geo-alt" style="font-size: 12px; vertical-align: middle;"></i>
                SIN CANCHA
              </button>
            </td>
            <td class="text-center">
              <button
                v-if="esAdmin"
                @click="emit('fecha-horario', p)"
                class="celda-arbitro"
                title="Editar fecha y horario (admin)"
              >
                {{ p.horario || '—' }}
              </button>
              <span v-else class="celda-texto">{{ p.horario || '—' }}</span>
            </td>
            <td><span class="celda-texto">{{ p.local || '—' }}</span></td>
            <td><span class="celda-texto">{{ p.visitante || '—' }}</span></td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input susp-check"
                :checked="p.suspendido"
                @change="emit('suspender', p, $event)"
                title="Partido suspendido antes del inicio"
              >
            </td>
            <td>
              <div class="celda-arb-wrap">
                <button
                  @click="emit('arbitro', p, 1)"
                  class="celda-arbitro"
                  :class="[colorClase(p, 1), { 'sin-match': esSinMatch(p, 1), 'externo': esExterno(p, 1), 'sin-arbitro': esSinArbitro(p, 1), 'vacio': !p.arbitro_1 }]"
                  :title="tituloCelda(p, 1)"
                >
                  {{ p.arbitro_1 || '— Asignar —' }}
                </button>
                <button
                  v-if="p.arbitro_1"
                  @click="emit('color', p, 1)"
                  class="btn-color-tag"
                  :class="colorClase(p, 1)"
                  title="Marcar estado del árbitro"
                >
                  <i class="bi bi-tag texto-14px"></i>
                </button>
              </div>
            </td>
            <td>
              <div class="celda-arb-wrap">
                <button
                  @click="emit('arbitro', p, 2)"
                  class="celda-arbitro"
                  :class="[colorClase(p, 2), { 'sin-match': esSinMatch(p, 2), 'externo': esExterno(p, 2), 'sin-arbitro': esSinArbitro(p, 2), 'vacio': !p.arbitro_2 }]"
                  :title="tituloCelda(p, 2)"
                >
                  {{ p.arbitro_2 || '— Asignar —' }}
                </button>
                <button
                  v-if="p.arbitro_2"
                  @click="emit('color', p, 2)"
                  class="btn-color-tag"
                  :class="colorClase(p, 2)"
                  title="Marcar estado del árbitro"
                >
                  <i class="bi bi-tag texto-14px"></i>
                </button>
              </div>
            </td>
            <td>
              <button
                @click="emit('arbitro', p, 'observador')"
                class="celda-arbitro"
                :class="{ 'externo': esExternoRol(p, 'observador'), 'vacio': !p.observador }"
                :title="tituloCeldaRol(p, 'observador')"
              >
                {{ p.observador || '— Asignar —' }}
              </button>
            </td>
            <td>
              <div class="celda-arb-wrap">
                <button
                  @click="emit('arbitro', p, 'delegado')"
                  class="celda-arbitro"
                  :class="[colorClaseDelegado(p), { 'externo': esExternoRol(p, 'delegado'), 'vacio': !p.delegado }]"
                  :title="tituloCeldaRol(p, 'delegado')"
                >
                  {{ p.delegado || '— Asignar —' }}
                </button>
                <button
                  v-if="p.delegado"
                  @click="emit('color', p, 'delegado')"
                  class="btn-color-tag"
                  :class="colorClaseDelegado(p)"
                  title="Marcar estado del delegado técnico"
                >
                  <i class="bi bi-tag texto-14px"></i>
                </button>
              </div>
            </td>
            <td class="text-center">
            <button
              @click="emit('mesa', p)"
              class="btn-mesa"
              :class="{ 'con-mesa': tieneMesa(p) }"
              :title="tituloMesa(p)"
            >
              <i class="bi bi-table texto-18px"></i>
            </button>
          </td>
            <td class="text-center">
              <div class="d-flex align-items-center justify-content-center gap-1">
                <div
                  v-if="cantidadAvisos(avisosMap, p) > 0"
                  class="aviso-barra"
                  :class="'aviso-' + etiquetaAvisos(avisosMap, p)"
                  :title="textoAvisos(avisosMap, p)"
                  @click="emit('avisos', p)"
                ></div>
                <i
                  v-if="estadoDesignacion(p) === 'a_designar'"
                  class="bi bi-x-circle text-danger borrar-partido"
                  title="Borrar partido"
                  @click="emit('borrar', p)"
                ></i>
              </div>
            </td>
          </tr>

        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import {
  estadoDesignacion, tituloEstado, cantidadAvisos, etiquetaAvisos, textoAvisos,
  colorClase, colorClaseDelegado, esSinArbitro, esExterno, esSinMatch, tituloCelda,
  esExternoRol, tituloCeldaRol, tieneMesa, tituloMesa
} from '@/components/panel-admin/designaciones/carga-partidos/ayudasPartido'

// Grilla de escritorio: una fila por partido, agrupada por cancha del día elegido.
defineProps({
  canchas: { type: Array, default: () => [] },
  fechaSeleccionada: { type: String, default: '' },
  esAdmin: { type: Boolean, default: false },
  partidoResaltado: { type: [String, Number], default: '' },
  avisosMap: { type: Object, default: () => ({}) }
})

// Acciones sobre un partido: las resuelve CargaPartidos (abren modales o guardan)
const emit = defineEmits(['cancha', 'fecha-horario', 'suspender', 'arbitro', 'color', 'mesa', 'avisos', 'borrar'])
</script>

<style scoped src="@/components/panel-admin/designaciones/carga-partidos/carga-partidos-compartido.css"></style>
<style scoped>
/* ====================================================
   GRILLA TIPO EXCEL (un solo scroll: el de la página)
   ==================================================== */
.grilla-container {
  overflow: visible;
}

/* En pantallas chicas la tabla necesita scroll horizontal propio */
@media (max-width: 991px) {
  .grilla-container {
    overflow-x: auto;
  }
}

.grilla-designaciones {
  font-size: 0.8rem;
  border-collapse: separate;
  border-spacing: 0;
}

.grilla-designaciones thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: var(--o-superficie, #f8f9fa);
  border-bottom: 2px solid var(--o-borde, #dee2e6);
  padding: 10px 8px;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

.grilla-designaciones td {
  padding: 2px 4px;
  border-bottom: 1px solid var(--o-borde, #f1f3f5);
}

/* Fila separadora de cancha (como la celda combinada del Excel) */
.fila-cancha td {
  background-color: #1f2937;
  color: #fff;
  padding: 6px 10px;
  position: sticky;
  top: 37px;
  z-index: 4;
}

/* Celdas de solo lectura (categoría, horario, equipos) */
.celda-texto {
  display: block;
  width: 100%;
  padding: 5px 6px;
  font-size: 0.8rem;
  color: var(--o-texto, #212529);
}

/* Celda de árbitro: botón liviano que abre el selector compartido */
.celda-arbitro {
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  padding: 5px 6px;
  font-size: 0.8rem;
  color: var(--o-texto, #212529);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.celda-arbitro:hover {
  border-color: var(--o-borde, #ced4da);
  background: var(--o-tarjeta, #fff);
}

.celda-arbitro.vacio {
  color: var(--o-texto-suave, #adb5bd);
}

/* Árbitro que no matcheó con el padrón (hay que corregirlo) */
.celda-arbitro.sin-match {
  background-color: var(--o-ambar-fondo, #fef08a);
  border-color: #eab308;
  font-weight: 700;
}

.celda-arbitro.sin-arbitro {
  background-color: var(--o-chip, #f1f3f5);
  border-color: var(--o-borde, #adb5bd);
  border-style: dashed;
  color: var(--o-texto-medio, #495057);
  font-style: italic;
  font-weight: 600;
}

/* Árbitro externo puesto a mano (intencional, fuera del padrón) */
.celda-arbitro.externo {
  background-color: var(--o-violeta-fondo, #f3e8ff);
  border-color: #c084fc;
  font-weight: 600;
}

/* Resaltado temporal al saltar a un partido desde el modal */
.fila-resaltada td {
  animation: destello 3s ease-out;
}

/* ====================================================
   FONDOS DE FILA SEGÚN ESTADO (DESKTOP)
   a_designar: rojo tenue (hay que resolverlo)
   designado:  amarillo tenue (falta publicar)
   publicado:  verde tenue (ya publicado)
   La fila suspendida (más abajo) prevalece sobre estos.
   ==================================================== */
.fila-estado-a_designar td {
  background-color: var(--o-rojo-fondo, #fef2f2);
}

.fila-estado-designado td {
  background-color: var(--o-ambar-fondo, #fefce8);
}

.fila-estado-publicado td {
  background-color: var(--o-verde-fondo, #f0fdf4);
}

/* ====================================================
   FILA SUSPENDIDA
   ==================================================== */
.fila-suspendida td {
  background-color: var(--o-rojo-fondo, #fee2e2) !important;
}

.fila-suspendida .celda-texto {
  color: var(--o-rojo-texto, #991b1b);
  text-decoration: line-through;
}

.susp-check {
  cursor: pointer;
}

.susp-check:checked {
  background-color: #dc2626;
  border-color: #dc2626;
}

/* ====================================================
   MARCAS DE ESTADO POR COLOR (árbitros)
   ==================================================== */
.celda-arb-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
}

.celda-arb-wrap .celda-arbitro {
  flex-grow: 1;
}

.btn-color-tag {
  border: 1px solid var(--o-borde, #ced4da);
  border-radius: 4px;
  background: var(--o-tarjeta, #fff);
  color: var(--o-texto-suave, #6c757d);
  padding: 3px;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-color-tag:hover {
  background: var(--o-superficie, #f8f9fa);
}

/* ====================================================
   BOTÓN MESA DE CONTROL (planillero / cronometrista)
   ==================================================== */
.btn-mesa {
  border: 1px solid var(--o-borde, #ced4da);
  border-radius: 4px;
  background: var(--o-tarjeta, #fff);
  color: var(--o-texto-suave, #adb5bd);
  padding: 3px 6px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.btn-mesa:hover {
  background: var(--o-superficie, #f8f9fa);
  color: var(--o-texto-suave, #6c757d);
}

/* Cuando el partido ya tiene planillero o cronometrista */
.btn-mesa.con-mesa {
  background: var(--o-rojo-fondo, #fee2e2);
  border-color: #dc2626;
  color: var(--o-rojo-texto, #dc2626);
}
</style>
