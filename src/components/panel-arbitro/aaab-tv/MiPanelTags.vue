<template>
  <div>
    <p class="text-muted small mb-3">
      Elegí qué situaciones vas a marcar. Cada tag genera un clip de <strong>{{ VENTANA_SEGUNDOS }} segundos antes y {{ VENTANA_SEGUNDOS }} después</strong>.
      La tecla de atajo sirve para marcar sin usar el mouse.
    </p>

    <div class="row g-3 mb-3">
      <div v-for="cat in CATEGORIAS_TAG" :key="cat.clave" class="col-12 col-lg-6">
        <section class="categoria h-100">
          <header class="categoria-encabezado">
            <h3 class="m-0">{{ cat.titulo }}</h3>
            <span class="badge bg-light text-dark border">{{ botonesDe(cat.clave).length }}</span>
          </header>

          <ul v-if="botonesDe(cat.clave).length" class="list-unstyled m-0 p-2">
            <li v-for="b in botonesDe(cat.clave)" :key="b.id" class="boton-fila" :style="{ borderLeftColor: colorTag(b.color).solido }">
              <span class="flex-grow-1 min-w-0 text-truncate fw-semibold">{{ b.nombre }}</span>
              <kbd v-if="b.atajo" class="tecla">{{ b.atajo }}</kbd>
              <button type="button" class="btn btn-sm btn-light border" :aria-label="`Editar ${b.nombre}`" title="Editar" @click="empezarEdicion(b)">
                <i class="bi bi-pencil" aria-hidden="true"></i>
              </button>
              <button type="button" class="btn btn-sm btn-light border text-danger" :aria-label="`Borrar ${b.nombre}`" title="Borrar" @click="borrarBoton(b.id)">
                <i class="bi bi-trash3" aria-hidden="true"></i>
              </button>
            </li>
          </ul>
          <p v-else class="text-muted small m-0 p-3">Todavía no hay botones en esta categoría.</p>
        </section>
      </div>
    </div>

    <!-- ============ ALTA / EDICIÓN ============ -->
    <form class="formulario-boton" novalidate @submit.prevent="guardarBoton">
      <h3 class="formulario-titulo">{{ editandoId ? 'Editar botón' : 'Nuevo botón' }}</h3>
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-4">
          <label for="tv-boton-nombre" class="form-label small fw-bold">Situación</label>
          <input id="tv-boton-nombre" v-model="form.nombre" type="text" maxlength="40" class="form-control"
                 :class="{ 'is-invalid': error && !form.nombre.trim() }" placeholder="Ej: Cambio antirreglamentario">
        </div>
        <div class="col-6 col-md-3">
          <label for="tv-boton-categoria" class="form-label small fw-bold">Categoría</label>
          <select id="tv-boton-categoria" v-model="form.categoria" class="form-select">
            <option v-for="cat in CATEGORIAS_TAG" :key="cat.clave" :value="cat.clave">{{ cat.titulo }}</option>
          </select>
        </div>
        <div class="col-6 col-md-2">
          <label for="tv-boton-atajo" class="form-label small fw-bold">Tecla</label>
          <input id="tv-boton-atajo" v-model="form.atajo" type="text" maxlength="1" class="form-control text-center text-uppercase" placeholder="Ej: K">
        </div>
        <div class="col-12 col-md-3">
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
        <button type="submit" class="btn btn-danger fw-bold">
          <i :class="['bi', editandoId ? 'bi-check-lg' : 'bi-plus-lg']" aria-hidden="true"></i>
          {{ editandoId ? 'Guardar cambios' : 'Agregar botón' }}
        </button>
        <button v-if="editandoId" type="button" class="btn btn-light border fw-bold" @click="limpiarFormulario">Cancelar</button>
        <button v-else type="button" class="btn btn-light border fw-bold ms-md-auto" @click="restablecerBotones">
          <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Restablecer botones
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAaabTv, CATEGORIAS_TAG, COLORES_TAG, VENTANA_SEGUNDOS, colorTag } from '@/composables/useAaabTv'

const { botones, agregarBoton, editarBoton, borrarBoton, restablecerBotones } = useAaabTv()

const botonesDe = (categoria) => botones.value.filter(b => b.categoria === categoria)

const formVacio = () => ({ nombre: '', categoria: 'sancion', color: 'rojo', atajo: '' })
const form = reactive(formVacio())
const editandoId = ref(null)
const error = ref('')

const limpiarFormulario = () => {
  Object.assign(form, formVacio())
  editandoId.value = null
  error.value = ''
}

const empezarEdicion = (b) => {
  Object.assign(form, { nombre: b.nombre, categoria: b.categoria, color: b.color, atajo: b.atajo })
  editandoId.value = b.id
  error.value = ''
}

const guardarBoton = () => {
  if (!form.nombre.trim()) {
    error.value = 'Escribí el nombre de la situación.'
    return
  }
  if (form.atajo && !/^[a-z0-9]$/i.test(form.atajo)) {
    error.value = 'La tecla tiene que ser una letra o un número.'
    return
  }
  const res = editandoId.value ? editarBoton(editandoId.value, { ...form }) : agregarBoton({ ...form })
  if (!res.ok) {
    error.value = res.mensaje
    return
  }
  limpiarFormulario()
}
</script>

<style scoped>
.categoria {
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 14px;
  background: var(--o-tarjeta, #fff);
  overflow: hidden;
}
.categoria-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--o-superficie, #f8fafc);
  border-bottom: 1px solid var(--o-borde, #e2e8f0);
}
.categoria-encabezado h3 { font-size: 0.9rem; font-weight: 800; color: var(--o-texto, #0f172a); }

.boton-fila {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 6px;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-left: 4px solid;
  border-radius: 10px;
  font-size: 0.875rem;
}
.boton-fila:last-child { margin-bottom: 0; }

.tecla {
  background: #0f172a;
  color: #fff;
  font-size: 0.75rem;
  padding: 2px 7px;
  border-radius: 6px;
}

.formulario-boton {
  border: 1px dashed var(--o-borde, #cbd5e1);
  border-radius: 14px;
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
