import { ref, computed, watch, nextTick, toValue } from 'vue'

export function useCambiosSinGuardar(fuente, abierto) {
  const base = ref(null)
  const serializar = () => JSON.stringify(toValue(fuente) ?? null)

  const tomarFoto = () => {
    base.value = serializar()
  }

  watch(() => !!toValue(abierto), async (valor) => {
    if (!valor) {
      base.value = null
      return
    }
    await nextTick()
    tomarFoto()
  }, { immediate: true })

  const hayCambios = computed(() => base.value !== null && serializar() !== base.value)

  return { hayCambios, tomarFoto }
}
