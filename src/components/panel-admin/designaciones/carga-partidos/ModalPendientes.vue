<template>
  <ModalBase
    :show="show"
    :titulo="titulo"
    :icono="icono"
    :colorIcono="colorIcono"
    maxWidth="640px"
    @close="emit('close')"
  >
    <div v-if="esAvisos" class="small mb-3">
      <p v-if="tipoAviso" class="text-muted mb-2">
        <span class="aviso-barra aviso-muestra me-1" :class="'aviso-' + tipoAviso.color"></span>
        <strong>{{ tipoAviso.titulo }}:</strong> {{ tipoAviso.descripcion }}
      </p>
      <p class="text-muted mb-0">
        Se listan los partidos según su aviso más grave. Tocá uno para ir al partido.
      </p>
    </div>
    <p v-else-if="tipo === 'sin_match'" class="text-muted small mb-3">
      Estos árbitros no coinciden con el padrón: los partidos <strong>no</strong> les aparecerán en su panel. Tocá un partido para ir a corregirlo.
    </p>
    <p v-else-if="tipo === 'sin_cancha'" class="text-muted small mb-3">
      Estos partidos no tienen cancha asignada. Tocá uno para ir a asignarle la cancha.
    </p>
    <p v-else class="text-muted small mb-3">
      Estos partidos todavía no tienen árbitros asignados. Tocá uno para ir a designarlo.
    </p>

    <EstadoVacio v-if="grupos.length === 0" icono="bi-check-circle" titulo="No hay pendientes" />

    <div v-else class="lista-pendientes">
      <div v-for="grupo in grupos" :key="grupo.fecha" class="mb-3">
        <div class="fecha-encabezado small fw-bold text-uppercase text-muted mb-2">
          <i class="bi bi-calendar-event me-1"></i> {{ grupo.etiqueta }}
          <span class="badge bg-light text-dark border ms-1">{{ grupo.items.length }}</span>
        </div>

        <button
          v-for="item in grupo.items"
          :key="item.partido.id || item.partido._uid"
          type="button"
          @click="emit('ir', item.partido)"
          class="item-pendiente w-100 text-start"
        >
          <div class="d-flex align-items-center gap-2">
            <span v-if="esAvisos" class="aviso-barra flex-shrink-0" :class="'aviso-' + item.etiqueta"></span>
            <span v-else class="punto-estado flex-shrink-0" :class="'punto-' + item.estado"></span>
            <div class="flex-grow-1 overflow-hidden">
              <div class="fw-bold text-truncate">
                {{ item.partido.local || '—' }} <span class="text-muted fw-normal">vs</span> {{ item.partido.visitante || '—' }}
              </div>
              <div class="small text-muted text-truncate">
                <span v-if="item.partido.horario">{{ item.partido.horario }} · </span>
                <span v-if="item.partido.categoria_division">{{ item.partido.categoria_division }} · </span>
                {{ item.partido.cancha || 'Sin cancha' }}
              </div>
              <div v-if="tipo === 'sin_match'" class="small text-warning-emphasis fw-bold text-truncate">
                <i class="bi bi-person-x me-1"></i>{{ item.sinMatch.join(', ') }}
              </div>
              <div v-else-if="tipo === 'sin_cancha'" class="small text-danger fw-bold text-truncate">
                <i class="bi bi-geo-alt me-1"></i>Sin cancha asignada
              </div>
              <div v-else-if="esAvisos" class="mt-1">
                <div v-for="g in item.avisos" :key="g.nombre" class="small mb-1">
                  <span class="aviso-barra aviso-mini me-1" :class="'aviso-' + g.etiqueta"></span>
                  <span class="fw-bold">{{ g.nombre }}</span>
                  <ul class="mb-0 ps-3 text-body-secondary lista-avisos">
                    <li v-for="(a, i) in g.avisos" :key="i">{{ a }}</li>
                  </ul>
                </div>
              </div>
            </div>
            <i class="bi bi-chevron-right text-muted flex-shrink-0"></i>
          </div>
        </button>
      </div>
    </div>

    <template #footer>
      <button type="button" @click="emit('close')" class="btn btn-light rounded-pill px-4 fw-bold border w-100">
        Cerrar
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import ModalBase from '@/components/ModalBase.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'

// Lista navegable de partidos pendientes (sin designar, sin cancha, sin coincidencia en el padrón)
// o con avisos de un tipo. Tocar un partido emite "ir" para saltar a él en la grilla.
// grupos: [{ fecha, etiqueta, items: [{ partido, etiqueta, estado, sinMatch, avisos }] }]
defineProps({
  show: { type: Boolean, default: false },
  titulo: { type: String, default: '' },
  icono: { type: String, default: '' },
  colorIcono: { type: String, default: '' },
  tipo: { type: String, default: '' },
  esAvisos: { type: Boolean, default: false },
  tipoAviso: { type: Object, default: null },
  grupos: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'ir'])
</script>

<style scoped src="@/components/panel-admin/designaciones/carga-partidos/carga-partidos-compartido.css"></style>
<style scoped>
.lista-pendientes {
  max-height: 60vh;
  overflow-y: auto;
}

.fecha-encabezado {
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--o-borde, #e5e7eb);
  padding-bottom: 4px;
}

.item-pendiente {
  display: block;
  background: var(--o-tarjeta, #fff);
  border: 1px solid var(--o-borde, #e5e7eb);
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 8px;
  transition: background-color 0.12s ease, border-color 0.12s ease, transform 0.12s ease;
}

.item-pendiente:hover {
  background: var(--o-superficie, #f8fafc);
  border-color: var(--o-borde, #cbd5e1);
  transform: translateY(-1px);
}

.lista-avisos {
  white-space: normal;
}
</style>
