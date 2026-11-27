<template>
  <div>
    <p class="text-muted small mb-3">
      Elegí qué situaciones vas a marcar. Cada tag genera un clip de <strong>{{ VENTANA_SEGUNDOS }} segundos antes y {{ VENTANA_SEGUNDOS }} después</strong>;
      en "Revisar evento" podés ajustar el inicio y el fin de cada clip.
    </p>

    <section class="card card-body shadow-sm border-light-subtle rounded-3 p-3 mb-3">
      <header class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-2 border-danger">
        <h6 class="fw-bold m-0 text-dark text-uppercase d-flex align-items-center gap-2"><i class="bi bi-ui-checks-grid text-danger fs-5" aria-hidden="true"></i> Mis botones</h6>
        <span class="badge rounded-pill bg-dark">{{ botones.length }}</span>
        <span v-if="estadoPanel === 'guardando'" class="small text-muted ms-auto">
          <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Guardando...
        </span>
      </header>
      <div v-if="estadoPanel === 'error'" class="alert alert-danger small py-2 mb-3 d-flex flex-wrap align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i> No se pudieron guardar los cambios del panel.
        <button type="button" class="btn btn-sm btn-danger fw-bold ms-auto" @click="guardarPanelAhora">Reintentar</button>
      </div>

      <!-- Una sola lista: en celular una columna, desde tablet dos -->
      <ul v-if="botones.length" class="list-unstyled m-0 grilla-filas">
        <li v-for="b in botones" :key="b.id" class="card shadow-sm border-light-subtle rounded-3 py-2 px-3 d-flex flex-row align-items-center gap-2 small boton-fila" :style="{ borderLeftColor: colorTag(b.color).solido }">
          <span class="flex-grow-1 min-w-0 text-truncate fw-semibold">{{ b.nombre }}</span>
          <button type="button" class="btn btn-sm btn-light border" :aria-label="`Editar ${b.nombre}`" title="Editar" @click="empezarEdicion(b)">
            <i class="bi bi-pencil" aria-hidden="true"></i>
          </button>
          <button type="button" class="btn btn-sm btn-light border text-danger" :aria-label="`Borrar ${b.nombre}`" title="Borrar" @click="borrarBoton(b.id)">
            <i class="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </li>
      </ul>
      <p v-else class="text-muted small m-0">Todavía no hay botones. Agregalos abajo o tocá "Restablecer botones".</p>
    </section>

    <!-- ============ ALTA / EDICIÓN ============ -->
    <form class="card card-body shadow-sm border-light-subtle rounded-3 p-3" novalidate @submit.prevent="guardarBoton">
      <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
        <h6 class="fw-bold m-0 text-dark text-uppercase d-flex align-items-center gap-2"><i :class="['bi', editandoId ? 'bi-pencil' : 'bi-plus-circle', 'text-danger', 'fs-5']" aria-hidden="true"></i> {{ editandoId ? 'Editar botón' : 'Nuevo botón' }}</h6>
      </div>
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-6">
          <label for="tv-boton-nombre" class="form-label small fw-bold">Situación</label>
          <input id="tv-boton-nombre" v-model="form.nombre" type="text" maxlength="40" class="form-control"
                 :class="{ 'is-invalid': error && !form.nombre.trim() }" placeholder="Ej: Cambio antirreglamentario">
        </div>
        <div class="col-12 col-md-6">
          <span class="form-label small fw-bold d-block">Color</span>
          <div class="d-flex flex-wrap gap-1" role="radiogroup" aria-label="Color del botón">
            <button v-for="(c, clave) in COLORES_TAG" :key="clave" type="button" class="muestra-color"
                    :class="{ elegido: form.color === clave }" :style="{ background: c.solido }"
                    role="radio" :aria-checked="form.color === clave" :aria-label="c.nombre" :title="c.nombre"
                    @click="form.color = clave"></button>
          </div>
        </div>
      </div>

      <p v-if="error" class="text-danger small fw-semibold mt-2 mb-0" role="alert">{{ error }}</p>

      <div class="d-flex flex-wrap gap-2 mt-3">
        <button type="submit" class="btn btn-danger rounded-pill fw-bold px-4">
          <i :class="['bi', editandoId ? 'bi-check-lg' : 'bi-plus-lg']" aria-hidden="true"></i>
          {{ editandoId ? 'Guardar cambios' : 'Agregar botón' }}
        </button>
        <button v-if="editandoId" type="button" class="btn btn-light border rounded-pill px-4 fw-bold" @click="limpiarFormulario">Cancelar</button>
        <button v-else type="button" class="btn btn-light border rounded-pill px-4 fw-bold ms-md-auto" @click="restablecerBotones">
          <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Restablecer botones
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAaabTv, COLORES_TAG, VENTANA_SEGUNDOS, colorTag } from '@/composables/useAaabTv'

const { botones, agregarBoton, editarBoton, borrarBoton, restablecerBotones, estadoPanel, guardarPanelAhora } = useAaabTv()

const formVacio = () => ({ nombre: '', color: 'rojo' })
const form = reactive(formVacio())
const editandoId = ref(null)
const error = ref('')

const limpiarFormulario = () => {
  Object.assign(form, formVacio())
  editandoId.value = null
  error.value = ''
}

const empezarEdicion = (b) => {
  Object.assign(form, { nombre: b.nombre, color: b.color })
  editandoId.value = b.id
  error.value = ''
}

const guardarBoton = () => {
  if (!form.nombre.trim()) {
    error.value = 'Escribí el nombre de la situación.'
    return
  }
  if (editandoId.value) editarBoton(editandoId.value, { ...form })
  else agregarBoton({ ...form })
  limpiarFormulario()
}
</script>

<style scoped>
/* Celular: una columna. Desde tablet: dos columnas */
.grilla-filas { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; }
@media (min-width: 768px) {
  .grilla-filas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.boton-fila { border-left: 4px solid !important; }

.muestra-color {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--o-tarjeta, #fff);
  box-shadow: 0 0 0 1px #cbd5e1;
}
.muestra-color.elegido { box-shadow: 0 0 0 2px #0f172a; }
.muestra-color:focus-visible { outline: 2px solid var(--o-texto, #0f172a); outline-offset: 2px; }

.min-w-0 { min-width: 0; }
</style>
