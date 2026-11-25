<template>
  <div>
    <p class="text-muted small mb-3">
      Elegí qué situaciones vas a marcar. Cada tag genera un clip de <strong>{{ VENTANA_SEGUNDOS }} segundos antes y {{ VENTANA_SEGUNDOS }} después</strong>.
    </p>

    <section class="lista-botones mb-3">
      <header class="lista-encabezado">
        <h3 class="m-0">Mis botones</h3>
        <span class="badge bg-light text-dark border">{{ botones.length }}</span>
      </header>

      <!-- Una sola lista: en celular una columna, desde tablet dos -->
      <ul v-if="botones.length" class="list-unstyled m-0 p-2 grilla-filas">
        <li v-for="b in botones" :key="b.id" class="boton-fila" :style="{ borderLeftColor: colorTag(b.color).solido }">
          <span class="flex-grow-1 min-w-0 text-truncate fw-semibold">{{ b.nombre }}</span>
          <button type="button" class="btn btn-sm btn-light border" :aria-label="`Editar ${b.nombre}`" title="Editar" @click="empezarEdicion(b)">
            <i class="bi bi-pencil" aria-hidden="true"></i>
          </button>
          <button type="button" class="btn btn-sm btn-light border text-danger" :aria-label="`Borrar ${b.nombre}`" title="Borrar" @click="borrarBoton(b.id)">
            <i class="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </li>
      </ul>
      <p v-else class="text-muted small m-0 p-3">Todavía no hay botones. Agregalos abajo o tocá "Restablecer botones".</p>
    </section>

    <!-- ============ ALTA / EDICIÓN ============ -->
    <form class="formulario-boton" novalidate @submit.prevent="guardarBoton">
      <h3 class="formulario-titulo">{{ editandoId ? 'Editar botón' : 'Nuevo botón' }}</h3>
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

const { botones, agregarBoton, editarBoton, borrarBoton, restablecerBotones } = useAaabTv()

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
.lista-botones {
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 16px;
  background: var(--o-tarjeta, #fff);
  overflow: hidden;
}
.lista-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--o-superficie, #f8fafc);
  border-bottom: 1px solid var(--o-borde, #e2e8f0);
}
.lista-encabezado h3 { font-size: 0.9rem; font-weight: 800; color: var(--o-texto, #0f172a); }

/* Celular: una columna. Desde tablet: dos columnas */
.grilla-filas { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; }
@media (min-width: 768px) {
  .grilla-filas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.boton-fila {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-left: 4px solid;
  border-radius: 12px;
  font-size: 0.85rem;
}

.formulario-boton {
  border: 1px dashed var(--o-borde, #cbd5e1);
  border-radius: 16px;
  padding: 14px;
  background: var(--o-superficie, #f8fafc);
}
.formulario-titulo { font-size: 0.9rem; font-weight: 800; color: var(--o-texto, #0f172a); margin-bottom: 10px; }

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
