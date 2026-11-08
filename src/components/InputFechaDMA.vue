<template>
  <input
    :value="texto"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    maxlength="10"
    placeholder="dd-mm-aaaa"
    class="form-control"
    @input="alEscribir"
    @blur="alSalir"
  >
</template>

<script setup>
import { ref, watch } from 'vue'

// v-model en formato aaaa-mm-dd (el que espera el backend); se muestra y se escribe como dd-mm-aaaa
const modelo = defineModel({ type: String, default: '' })

const aTexto = (iso) => {
  const [anio, mes, dia] = String(iso || '').substring(0, 10).split('-')
  return anio && mes && dia ? `${dia}-${mes}-${anio}` : ''
}

const aIso = (dma) => {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dma)
  if (!m) return ''
  const [, dia, mes, anio] = m
  const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia))
  const valida = fecha.getFullYear() === Number(anio) && fecha.getMonth() === Number(mes) - 1 && fecha.getDate() === Number(dia)
  return valida ? `${anio}-${mes}-${dia}` : ''
}

const texto = ref(aTexto(modelo.value))

watch(modelo, (v) => {
  if (aIso(texto.value) !== v) texto.value = aTexto(v)
})

const alEscribir = (e) => {
  const digitos = e.target.value.replace(/\D/g, '').substring(0, 8)
  const partes = [digitos.substring(0, 2), digitos.substring(2, 4), digitos.substring(4, 8)].filter(Boolean)
  texto.value = partes.join('-')
  e.target.value = texto.value
  modelo.value = aIso(texto.value)
}

const alSalir = () => {
  if (texto.value && !aIso(texto.value)) modelo.value = ''
}
</script>
