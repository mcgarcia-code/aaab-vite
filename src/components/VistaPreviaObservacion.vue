<template>
  <!-- ============================================================
       Vista previa de la observación (mismo diseño que el modal
       "Detalle de la Observación"). Se muestra apenas se lee un
       Excel válido, para confirmar el puntaje final antes de subir.
       ============================================================ -->
  <div class="vista-previa-obs mt-4">

    <!-- Cargando (parseando el Excel) -->
    <div v-if="analizando" class="text-center py-4 border rounded-3 bg-light">
      <span class="spinner-border text-danger"></span>
      <p class="text-muted mt-2 mb-0 fw-bold small">Analizando la planilla...</p>
    </div>

    <!-- Error de lectura (archivo dañado / sin las hojas) -->
    <div v-else-if="errorLectura" class="alert alert-danger d-flex align-items-start gap-2 mb-0 rounded-3">
      <i class="bi bi-x-octagon-fill mt-1 flex-shrink-0"></i>
      <div>
        <div class="fw-bold">No se puede previsualizar la planilla</div>
        <div class="small">{{ errorLectura }}</div>
      </div>
    </div>

    <!-- Vista previa -->
    <div v-else-if="preview" class="text-start">

      <!-- ── Banner de estado (válida / con errores) ── -->
      <div
        class="alert d-flex align-items-start gap-2 rounded-3"
        :class="preview.errores.length ? 'alert-danger' : 'alert-success'"
      >
        <i class="bi mt-1 flex-shrink-0 fs-6" :class="preview.errores.length ? 'bi-x-octagon-fill' : 'bi-check-circle-fill'"></i>
        <div class="w-100">
          <div class="fw-bold">
            {{ preview.errores.length ? 'No se puede cargar: falta el puntaje final' : 'La observación se puede cargar' }}
          </div>

          <!-- Puntaje final destacado -->
          <div class="d-flex align-items-center gap-2 mt-1">
            <span class="small text-muted">Puntaje final:</span>
            <span v-if="preview.puntaje_final != null" class="badge bg-dark fs-6 rounded-pill px-3">
              {{ preview.puntaje_final }}
            </span>
            <span v-else class="badge bg-danger rounded-pill px-3">No figura</span>
          </div>

          <!-- Lista de errores que bloquean -->
          <ul v-if="preview.errores.length" class="small mt-2 mb-0 ps-3">
            <li v-for="(err, i) in preview.errores" :key="'e' + i">{{ err }}</li>
          </ul>
        </div>
      </div>

      <!-- ── Recordatorio antes de cargar ── -->
      <div class="alert alert-warning border-warning-subtle text-dark d-flex align-items-start gap-2 rounded-3" style="font-size: 0.85rem;">
        <i class="bi bi-exclamation-triangle-fill text-warning mt-1 flex-shrink-0 fs-6"></i>
        <span>
          <strong>Antes de cargar:</strong> revisá que <strong>no haya errores</strong> en la planilla.
        </span>
      </div>

      <!-- ── Tabs: Puntajes / Comentarios ── -->
      <ul class="nav nav-tabs mb-0" role="tablist">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab === 'puntajes' }" type="button" @click="tab = 'puntajes'">
            <i class="bi bi-list-ol me-1"></i> Puntajes
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: tab === 'comentarios' }" type="button" @click="tab = 'comentarios'">
            <i class="bi bi-chat-left-text me-1"></i> Comentarios
          </button>
        </li>
      </ul>

      <!-- TAB PUNTAJES -->
      <div v-show="tab === 'puntajes'" class="border border-top-0 rounded-bottom overflow-hidden">
        <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.78rem;">
          <thead class="table-light">
            <tr>
              <th class="py-2 ps-3 text-uppercase text-muted">Categoría / Ítem</th>
              <th class="py-2 text-center text-uppercase text-muted" style="width: 150px;">Valoración</th>
              <th class="py-2 text-center text-uppercase text-muted" style="width: 90px;">Puntaje</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(it, idx) in preview.items" :key="'it-' + idx">
              <tr v-if="it.tipo === 'categoria'" class="table-light">
                <td class="fw-bold text-dark ps-3">{{ it.categoria }}</td>
                <td></td>
                <td class="text-center fw-bold text-danger">{{ it.puntaje ?? '-' }}</td>
              </tr>
              <tr v-else>
                <td class="text-dark ps-4">{{ it.item }}</td>
                <td class="text-center text-muted">{{ it.valoracion || '—' }}</td>
                <td class="text-center">{{ it.puntaje ?? '-' }}</td>
              </tr>
            </template>
            <tr v-if="!preview.items || preview.items.length === 0">
              <td colspan="3" class="text-center py-3 text-muted">Sin ítems cargados.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TAB COMENTARIOS -->
      <div v-show="tab === 'comentarios'" class="border border-top-0 rounded-bottom p-3">
        <div v-if="comentariosPorCategoria.length">
          <div v-for="(c, idx) in comentariosPorCategoria" :key="'com-' + idx" class="mb-3">
            <div class="fw-bold small text-dark">{{ c.categoria }}</div>
            <div class="small text-muted" style="white-space: pre-line;">{{ c.comentario }}</div>
          </div>
        </div>

        <div v-if="preview.prioridad_mejora_1 || preview.prioridad_mejora_2 || preview.prioridad_mejora_resto" class="mt-2 pt-2 border-top">
          <div class="fw-bold small text-dark mb-1">Prioridades de mejora</div>
          <div v-if="preview.prioridad_mejora_1" class="small text-muted mb-1"><strong>1.</strong> {{ preview.prioridad_mejora_1 }}</div>
          <div v-if="preview.prioridad_mejora_2" class="small text-muted mb-1"><strong>2.</strong> {{ preview.prioridad_mejora_2 }}</div>
          <div v-if="preview.prioridad_mejora_resto" class="small text-muted mb-1" style="white-space: pre-line;">{{ preview.prioridad_mejora_resto }}</div>
        </div>

        <div v-if="preview.influencia_resultado_comentarios" class="mt-2 pt-2 border-top">
          <div class="fw-bold small text-dark mb-1">Influencia en el resultado</div>
          <div class="small text-muted" style="white-space: pre-line;">{{ preview.influencia_resultado_comentarios }}</div>
        </div>

        <div v-if="!tieneComentarios" class="text-center py-3 text-muted small">
          Esta observación no tiene comentarios cargados.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  preview: { type: Object, default: null },
  analizando: { type: Boolean, default: false },
  errorLectura: { type: String, default: null },
});

const tab = ref('puntajes');

const comentariosPorCategoria = computed(() => {
  if (!props.preview || !Array.isArray(props.preview.items)) return [];
  return props.preview.items
    .filter(it => it.tipo === 'categoria' && it.comentario)
    .map(it => ({ categoria: it.categoria, comentario: it.comentario }));
});

const tieneComentarios = computed(() => {
  if (!props.preview) return false;
  return comentariosPorCategoria.value.length > 0
    || !!props.preview.prioridad_mejora_1
    || !!props.preview.prioridad_mejora_2
    || !!props.preview.prioridad_mejora_resto
    || !!props.preview.influencia_resultado_comentarios;
});
</script>
