<template>
  <div class="vistas-clip">
    <button type="button" class="btn btn-sm btn-light border fw-bold" :aria-expanded="abierto" @click="alternar">
      <i class="bi bi-eye" aria-hidden="true"></i>
      Visto por {{ cantidadMostrada }} {{ cantidadMostrada === 1 ? 'persona' : 'personas' }}
      <i :class="['bi', abierto ? 'bi-chevron-up' : 'bi-chevron-down']" aria-hidden="true"></i>
    </button>
    <div v-if="abierto" class="card card-body shadow-sm border-light-subtle rounded-3 p-2 mt-2">
      <div v-if="cargando" class="small text-muted">
        <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Cargando...
      </div>
      <p v-else-if="error" class="small text-danger m-0" role="alert">{{ error }}</p>
      <p v-else-if="!vistas.length" class="small text-muted m-0">Todavía nadie lo vio.</p>
      <ul v-else class="list-unstyled m-0 d-flex flex-column gap-1">
        <li v-for="v in vistas" :key="`${v.tipoUsuario}-${v.idUsuario}`" class="d-flex justify-content-between gap-2 small border-bottom pb-1">
          <span class="text-truncate">{{ v.nombre || 'Usuario' }}</span>
          <span class="text-muted flex-shrink-0">{{ fechaHora(v.vistoEl) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAaabTv } from '@/composables/useAaabTv'

// Quién vio un clip (para el coordinador general): la cantidad y, al abrir, la lista con la fecha.
// cantidad: la que vino con el clip (cantidadVistas); al abrir la lista se usa la real
const props = defineProps({
  idClip: { type: [String, Number], required: true },
  cantidad: { type: Number, default: 0 }
})

const { listarVistas } = useAaabTv()

const abierto = ref(false)
const cargando = ref(false)
const error = ref('')
const vistas = ref([])
const cargadas = ref(false)

const cantidadMostrada = computed(() => (cargadas.value ? vistas.value.length : props.cantidad))

const fechaHora = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

const cargar = async () => {
  cargando.value = true
  error.value = ''
  try {
    const res = await listarVistas(props.idClip)
    if (res?.ok) {
      vistas.value = res.payload
      cargadas.value = true
    } else {
      error.value = res?.message || 'No se pudo cargar quién lo vio.'
    }
  } finally {
    cargando.value = false
  }
}

const alternar = () => {
  abierto.value = !abierto.value
  if (abierto.value) cargar()
}

watch(() => props.idClip, () => {
  abierto.value = false
  cargadas.value = false
  vistas.value = []
})
</script>

