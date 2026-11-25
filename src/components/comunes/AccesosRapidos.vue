<template>
  <section class="accesos-rapidos">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h2 class="accesos-titulo m-0">Accesos rápidos</h2>
      <button type="button" class="btn-personalizar" :aria-expanded="editando" @click="editando = !editando">
        <i :class="['bi', editando ? 'bi-check-lg' : 'bi-sliders']"></i>
        {{ editando ? 'Listo' : 'Personalizar' }}
      </button>
    </div>

    <!-- ============ ACCESOS ELEGIDOS ============ -->
    <div v-if="accesos.length" class="accesos-grilla">
      <RouterLink v-for="acceso in accesos" :key="claveDe(acceso)" :to="acceso.to" class="acceso-rapido">
        <i :class="acceso.icon"></i>
        <span>{{ acceso.title }}</span>
      </RouterLink>
    </div>
    <button v-else-if="!editando" type="button" class="acceso-vacio" @click="editando = true">
      <i class="bi bi-plus-lg"></i> Elegí tus accesos rápidos
    </button>

    <!-- ============ PERSONALIZAR ============ -->
    <div v-if="editando" class="panel-edicion mt-3">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
        <span class="small fw-bold text-dark">Elegí hasta {{ maximo }} · {{ elegidos.length }} de {{ maximo }}</span>
        <button type="button" class="btn-restablecer" @click="restablecer">
          <i class="bi bi-arrow-counterclockwise"></i> Restablecer
        </button>
      </div>
      <div class="opciones">
        <button
          v-for="item in disponibles"
          :key="claveDe(item)"
          type="button"
          class="opcion"
          :class="{ elegida: estaElegido(item) }"
          :aria-pressed="estaElegido(item)"
          :disabled="!estaElegido(item) && elegidos.length >= maximo"
          @click="alternar(item)"
        >
          <i :class="['bi', estaElegido(item) ? 'bi-check-circle-fill' : 'bi-plus-circle']"></i>
          <i :class="item.icon"></i>
          <span class="text-truncate">{{ item.title }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Accesos rápidos que cada usuario elige, comunes a todos los paneles.
// Se recuerdan en este navegador (por panel y por usuario).
// disponibles: [{ to, title, icon }]  ·  predeterminados: claves (ruta o título) que se muestran si no eligió nada
const props = defineProps({
  disponibles: { type: Array, required: true },
  predeterminados: { type: Array, default: () => [] },
  claveAlmacenamiento: { type: String, required: true },
  maximo: { type: Number, default: 8 }
})

// Clave de cada acceso: su ruta (o el título si la ruta no es un texto)
const claveDe = (item) => (typeof item.to === 'string' ? item.to : item.title)

const leer = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(props.claveAlmacenamiento) || 'null')
    return Array.isArray(guardado) ? guardado : null
  } catch {
    return null
  }
}

const guardar = (claves) => {
  try {
    localStorage.setItem(props.claveAlmacenamiento, JSON.stringify(claves))
  } catch {
    // Sin almacenamiento (modo privado): funciona igual, solo no se recuerda
  }
}

// null = nunca personalizó: se usan los predeterminados (aunque lleguen después, como en admin con los permisos)
const personalizados = ref(leer())
const elegidos = computed(() => personalizados.value ?? props.predeterminados)
const editando = ref(false)

// Si cambia el usuario (otra clave), se vuelve a leer lo suyo
watch(() => props.claveAlmacenamiento, () => { personalizados.value = leer() })

// Solo los que siguen disponibles (por ejemplo, si perdió un permiso), en el orden elegido
const accesos = computed(() =>
  elegidos.value
    .map(clave => props.disponibles.find(item => claveDe(item) === clave))
    .filter(Boolean)
)

const estaElegido = (item) => elegidos.value.includes(claveDe(item))

const alternar = (item) => {
  const clave = claveDe(item)
  personalizados.value = estaElegido(item)
    ? elegidos.value.filter(c => c !== clave)
    : [...elegidos.value, clave].slice(0, props.maximo)
  guardar(personalizados.value)
}

const restablecer = () => {
  personalizados.value = null
  try {
    localStorage.removeItem(props.claveAlmacenamiento)
  } catch {
    // Sin almacenamiento: no hay nada que borrar
  }
}
</script>

<style scoped>
.accesos-titulo {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t-sobre-fondo-suave);
}

.btn-personalizar,
.btn-restablecer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 700;
}
.btn-personalizar { color: var(--t-sobre-fondo-texto); }
.btn-personalizar:hover { background: var(--t-baldosa); color: var(--t-baldosa-texto); }
.btn-restablecer { color: var(--t-texto-medio); }
.btn-restablecer:hover { background: var(--t-chip); color: var(--t-texto); }

/* ============ GRILLA ============ */
.accesos-grilla {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.acceso-rapido {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 84px;
  padding: 10px 4px;
  border-radius: 16px;
  background: var(--t-baldosa);
  color: var(--t-baldosa-texto);
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  line-height: 1.2;
  overflow-wrap: anywhere;
  hyphens: auto;
  transition: background 0.2s;
}
.acceso-rapido i { font-size: 1.25rem; color: var(--t-barra-acento); }
.acceso-rapido:hover { background: var(--t-baldosa-hover); color: var(--t-baldosa-texto); }

/* Escritorio: accesos horizontales (ícono + texto) */
@media (min-width: 992px) {
  .accesos-grilla { gap: 12px; }
  .acceso-rapido {
    flex-direction: row;
    justify-content: flex-start;
    gap: 12px;
    min-height: 64px;
    padding: 0 18px;
    font-size: 0.9rem;
    text-align: left;
  }
}

.acceso-vacio {
  width: 100%;
  min-height: 64px;
  border: 1px dashed var(--t-baldosa-borde);
  border-radius: 16px;
  background: transparent;
  color: var(--t-sobre-fondo-texto);
  font-size: 0.9rem;
  font-weight: 600;
}
.acceso-vacio:hover { background: var(--t-baldosa); color: var(--t-baldosa-texto); }

/* ============ PERSONALIZAR ============ */
.panel-edicion {
  background: var(--t-tarjeta);
  border-radius: 16px;
  padding: 14px;
}

.opciones {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.opcion {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--t-tarjeta-borde);
  border-radius: 12px;
  background: var(--t-tarjeta);
  color: var(--t-texto);
  font-size: 0.85rem;
  font-weight: 600;
  text-align: left;
  min-width: 0;
}
.opcion > .bi:first-child { color: var(--t-texto-tenue); font-size: 1rem; }
.opcion > .bi:nth-child(2) { color: var(--t-icono-texto); }
.opcion:hover:not(:disabled) { background: var(--t-tarjeta-hover); }
.opcion:disabled { opacity: 0.5; cursor: not-allowed; }
.opcion.elegida { border-color: var(--t-elegido-borde); background: var(--t-icono-fondo); }
.opcion.elegida > .bi:first-child { color: var(--t-icono-texto); }
.opcion:focus-visible { outline: 2px solid var(--t-texto); outline-offset: 1px; }
</style>
