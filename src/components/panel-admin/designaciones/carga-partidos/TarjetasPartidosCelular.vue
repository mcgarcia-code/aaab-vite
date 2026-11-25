<template>
  <div class="d-md-none">
    <div v-for="c in canchas" :key="'mob-' + fechaSeleccionada + '-' + c.nombre" class="mb-3">

  <!-- Encabezado de cancha (solo lectura) -->
  <div class="cancha-mobile-header d-flex align-items-center gap-2 px-3 py-2 rounded-top-3">
    <i class="bi bi-geo-alt fs-5"></i>
    <span class="nombre-cancha fw-bold text-uppercase flex-grow-1">{{ c.nombre }}</span>

    <a
      v-if="c.linkMapa"
      :href="c.linkMapa"
      target="_blank"
      rel="noopener noreferrer"
      class="link-mapa"
      title="Ver ubicación en Google Maps"
    >Mapa</a>

    <span class="badge bg-white text-dark rounded-pill">{{ c.partidos.length }}</span>
  </div>

      <!-- Un card por partido -->
      <div
        v-for="p in c.partidos"
        :key="'mobp-' + (p.id || p._uid)"
        :id="'partido-mob-' + (p.id || p._uid)"
        class="card shadow-sm border-light-subtle rounded-0 partido-mobile"
        :class="['card-estado-' + estadoDesignacion(p), { 'card-resaltada': partidoResaltado === (p.id || p._uid) }]"
      >
        <div class="card-body p-3">

          <!-- Fila superior: categoría + estado + alerta -->
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <span class="fw-bold flex-grow-1" style="font-size: 0.9rem;">{{ p.categoria_division || '—' }}</span>
            <span class="badge-estado" :class="'badge-' + estadoDesignacion(p)">{{ etiquetaEstado(p) }}</span>
            <div
              v-if="cantidadAvisos(avisosMap, p) > 0"
              class="aviso-barra flex-shrink-0"
              :class="'aviso-' + etiquetaAvisos(avisosMap, p)"
              :title="textoAvisos(avisosMap, p)"
              @click="emit('avisos', p)"
            ></div>
            <i
              v-if="estadoDesignacion(p) === 'a_designar'"
              class="bi bi-x-circle text-danger borrar-partido flex-shrink-0"
              title="Borrar partido"
              @click="emit('borrar', p)"
            ></i>
          </div>

          <!-- Horario -->
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-clock text-danger texto-18px"></i>
            <button
              v-if="esAdmin"
              @click="emit('fecha-horario', p)"
              class="btn btn-sm btn-outline-secondary py-0 px-2 d-flex align-items-center gap-1"
              title="Editar fecha y horario (admin)"
            >
              <span class="fw-bold">{{ p.horario || '—' }}</span>
              <i class="bi bi-pencil texto-14px"></i>
            </button>
            <span v-else class="fw-bold">{{ p.horario || '—' }}</span>
          </div>

          <!-- Cancha sin asignar (tocar para elegir) -->
          <button
            v-if="!p.cancha"
            @click="emit('cancha', p)"
            class="badge-sin-cancha w-100 text-start mb-2"
            title="Asignar cancha a este partido"
          >
            <i class="bi bi-geo-alt texto-14px" style="vertical-align: middle;"></i>
            SIN CANCHA — Tocá para asignar
          </button>

          <!-- Equipos -->
          <div class="bg-light rounded p-2 mb-2">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-secondary" style="font-size: 0.65rem;">LOCAL</span>
              <span class="fw-bold">{{ p.local || '—' }}</span>
            </div>
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-secondary-subtle text-secondary border" style="font-size: 0.65rem;">VISIT</span>
              <span class="fw-bold">{{ p.visitante || '—' }}</span>
            </div>
            <div class="form-check mb-0">
              <input
                type="checkbox"
                class="form-check-input"
                :id="'susp-' + (p.id || p._uid)"
                :checked="p.suspendido"
                @change="emit('suspender', p, $event)"
              >
              <label class="form-check-label small fw-bold text-danger" :for="'susp-' + (p.id || p._uid)">
                Partido suspendido antes del inicio
              </label>
            </div>
          </div>

          <!-- Árbitros principales (prioridad) -->
          <div class="row g-2 mt-1">
            <div class="col-6">
              <label class="form-label small fw-bold text-muted mb-1">Árbitro 1</label>
              <button
                @click="emit('arbitro', p, 1)"
                class="celda-arbitro-mobile w-100 text-start"
                :class="[colorClase(p, 1), { 'sin-match': esSinMatch(p, 1), 'externo': esExterno(p, 1), 'sin-arbitro': esSinArbitro(p, 1), 'vacio': !p.arbitro_1 }]"
              >
                {{ p.arbitro_1 || '— Asignar —' }}
              </button>
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold text-muted mb-1">Árbitro 2</label>
              <button
                @click="emit('arbitro', p, 2)"
                class="celda-arbitro-mobile w-100 text-start"
                :class="[colorClase(p, 2), { 'sin-match': esSinMatch(p, 2), 'externo': esExterno(p, 2), 'sin-arbitro': esSinArbitro(p, 2), 'vacio': !p.arbitro_2 }]"
              >
                {{ p.arbitro_2 || '— Asignar —' }}
              </button>
            </div>
          </div>

          <!-- Botones de etiqueta de color (estado del árbitro) -->
          <div class="row g-2 mt-1" v-if="p.arbitro_1 || p.arbitro_2">
            <div class="col-6">
              <button
                v-if="p.arbitro_1"
                @click="emit('color', p, 1)"
                class="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
                :class="colorClase(p, 1)"
              >
                <i class="bi bi-tag texto-14px"></i>
                <span class="small">Estado Árb. 1</span>
              </button>
            </div>
            <div class="col-6">
              <button
                v-if="p.arbitro_2"
                @click="emit('color', p, 2)"
                class="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
                :class="colorClase(p, 2)"
              >
                <i class="bi bi-tag texto-14px"></i>
                <span class="small">Estado Árb. 2</span>
              </button>
            </div>
          </div>

          <!-- Observador / Delegado técnico -->
          <div class="row g-2 mt-1">
            <div class="col-6">
              <label class="form-label small fw-bold text-muted mb-1">Observador</label>
              <button
                @click="emit('arbitro', p, 'observador')"
                class="celda-arbitro-mobile w-100 text-start"
                :class="{ 'externo': esExternoRol(p, 'observador'), 'vacio': !p.observador }"
              >
                {{ p.observador || '— Asignar —' }}
              </button>
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold text-muted mb-1">Del. Técnico</label>
              <button
                @click="emit('arbitro', p, 'delegado')"
                class="celda-arbitro-mobile w-100 text-start"
                :class="[colorClaseDelegado(p), { 'externo': esExternoRol(p, 'delegado'), 'vacio': !p.delegado }]"
              >
                {{ p.delegado || '— Asignar —' }}
              </button>
              <button
                v-if="p.delegado"
                @click="emit('color', p, 'delegado')"
                class="btn btn-sm btn-outline-secondary w-100 mt-1 d-flex align-items-center justify-content-center gap-1"
                :class="colorClaseDelegado(p)"
              >
                <i class="bi bi-tag texto-14px"></i>
                <span class="small">Estado</span>
              </button>
            </div>
          </div>

          <button
            @click="emit('mesa', p)"
            class="btn btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
            :class="tieneMesa(p) ? 'btn-danger' : 'btn-outline-secondary'"
          >
            <i class="bi bi-table texto-16px"></i>
            <span class="small fw-bold">{{ tieneMesa(p) ? 'Mesa de control asignada' : 'Planillero / Cronometrista' }}</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import {
  estadoDesignacion, etiquetaEstado, cantidadAvisos, etiquetaAvisos, textoAvisos,
  colorClase, colorClaseDelegado, esSinArbitro, esExterno, esSinMatch,
  esExternoRol, tieneMesa
} from '@/components/panel-admin/designaciones/carga-partidos/ayudasPartido'

// Vista de celular: una tarjeta por partido, agrupada por cancha del día elegido.
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
.card-resaltada {
  animation: destello 3s ease-out;
}

/* ====================================================
   VISTA MÓVIL: CARDS POR CANCHA
   ==================================================== */
.cancha-mobile-header {
  background-color: #1f2937;
  color: #fff;
}

.partido-mobile {
  border-left: 3px solid #dc2626;
}

.partido-mobile:last-child {
  border-bottom-left-radius: 12px !important;
  border-bottom-right-radius: 12px !important;
  overflow: hidden;
}

/* Fondos y borde izquierdo de card según estado (móvil) */
.card-estado-a_designar {
  background-color: var(--o-rojo-fondo, #fef2f2);
  border-left-color: #dc2626;
}

.card-estado-designado {
  background-color: var(--o-ambar-fondo, #fefce8);
  border-left-color: #eab308;
}

.card-estado-publicado {
  background-color: var(--o-verde-fondo, #f0fdf4);
  border-left-color: #22c55e;
}

/* Badge de estado en el card móvil */
.badge-estado {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 3px 8px;
  border-radius: 50rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-a_designar {
  background-color: var(--o-rojo-fondo, #fee2e2);
  color: var(--o-rojo-texto, #991b1b);
  border: 1px solid #f87171;
}

.badge-designado {
  background-color: var(--o-ambar-fondo, #fef9c3);
  color: var(--o-ambar-texto, #854d0e);
  border: 1px solid #facc15;
}

.badge-publicado {
  background-color: var(--o-verde-fondo, #dcfce7);
  color: var(--o-verde-texto, #166534);
  border: 1px solid #4ade80;
}
</style>
