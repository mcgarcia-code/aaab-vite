// Fechas en formato dd-mm-aaaa (el formato que se muestra en el curso de árbitros).
// Aceptan "aaaa-mm-dd" y "aaaa-mm-dd hh:mm[:ss]" tal como vienen del backend.

export const fechaDMA = (valor) => {
  if (!valor) return ''
  const [fecha] = String(valor).split(' ')
  const [anio, mes, dia] = fecha.split('-')
  if (!anio || !mes || !dia) return String(valor)
  return `${dia.padStart(2, '0')}-${mes.padStart(2, '0')}-${anio}`
}

export const fechaHoraDMA = (valor) => {
  if (!valor) return ''
  const [, hora] = String(valor).split(' ')
  return hora ? `${fechaDMA(valor)} ${hora.substring(0, 5)}` : fechaDMA(valor)
}
