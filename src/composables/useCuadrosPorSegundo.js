import { ref, computed, onBeforeUnmount } from 'vue'

// Detecta los cuadros por segundo de un <video> mientras se reproduce, para que el
// "cuadro a cuadro" avance exactamente un cuadro (los navegadores no informan los fps).
// Usa requestVideoFrameCallback: mide el tiempo entre cuadros mostrados y lo redondea al valor
// común más cercano (24, 25, 30, 50 o 60). Hasta que lo detecta, o si el navegador no lo soporta,
// usa 30. Con 25 o 50 (lo habitual en las transmisiones de Argentina) un paso de 1/30 no es un cuadro.
const COMUNES = [24, 25, 30, 50, 60]
const POR_DEFECTO = 30
const MUESTRAS = 24

export function useCuadrosPorSegundo() {
  const cuadrosPorSegundo = ref(POR_DEFECTO)
  const detectado = ref(false)
  const duracionCuadro = computed(() => 1 / cuadrosPorSegundo.value)

  let video = null
  let idCallback = null
  let anterior = null
  let diferencias = []

  const soltar = () => {
    if (video && idCallback !== null) video.cancelVideoFrameCallback?.(idCallback)
    video = null
    idCallback = null
  }

  const calcular = () => {
    const ordenadas = [...diferencias].sort((a, b) => a - b)
    const mediana = ordenadas.at(Math.floor(ordenadas.length / 2))
    if (!mediana) return
    const medido = 1 / mediana
    cuadrosPorSegundo.value = COMUNES.reduce((mejor, f) => (Math.abs(f - medido) < Math.abs(mejor - medido) ? f : mejor), POR_DEFECTO)
    detectado.value = true
  }

  const alCuadro = (_ahora, datos) => {
    // A velocidad normal hay un cuadro por llamada; se descartan saltos (seek) y cuadros perdidos
    if (anterior !== null) {
      const diferencia = datos.mediaTime - anterior
      if (diferencia > 0.005 && diferencia < 0.1) diferencias.push(diferencia)
    }
    anterior = datos.mediaTime
    if (diferencias.length >= MUESTRAS) {
      calcular()
      soltar()
      return
    }
    idCallback = video.requestVideoFrameCallback(alCuadro)
  }

  // Empieza a medir sobre un video (al cargarlo). Mide solo mientras se reproduce
  const observar = (elemento) => {
    soltar()
    detectado.value = false
    cuadrosPorSegundo.value = POR_DEFECTO
    if (!elemento?.requestVideoFrameCallback) return
    video = elemento
    anterior = null
    diferencias = []
    idCallback = video.requestVideoFrameCallback(alCuadro)
  }

  onBeforeUnmount(soltar)

  return { cuadrosPorSegundo, duracionCuadro, detectado, observar }
}
