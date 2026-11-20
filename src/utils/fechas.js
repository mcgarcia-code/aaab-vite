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

// Fecha "aaaa-mm-dd[ hh:mm]" o "dd/mm/aa[aa]" a timestamp (medianoche local). 0 si no se puede leer.
// Se usa para ordenar y comparar designaciones, que llegan en los dos formatos.
export const fechaATimestamp = (fecha) => {
  if (!fecha) return 0
  const texto = String(fecha).trim().slice(0, 10)

  let m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()

  m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    const anio = m[3].length === 2 ? '20' + m[3] : m[3]
    return new Date(Number(anio), Number(m[2]) - 1, Number(m[1])).getTime()
  }

  return 0
}

// Fecha "aaaa-mm-dd[ hh:mm[:ss]]" a "dd/mm/aaaa" (formato argentino). Si viene vacía devuelve `vacio`;
// si no se puede leer, el valor original.
export const fechaArg = (valor, vacio = '') => {
  if (!valor) return vacio
  const [anio, mes, dia] = String(valor).trim().slice(0, 10).split('-')
  if (!anio || !mes || !dia) return String(valor)
  return `${dia}/${mes}/${anio}`
}

// "aaaa-mm-dd hh:mm:ss" a "dd/mm/aaaa hh:mm"
export const fechaHoraArg = (valor, vacio = '-') => {
  if (!valor) return vacio
  const [, hora] = String(valor).trim().split(' ')
  return `${fechaArg(valor)}${hora ? ' ' + hora.slice(0, 5) : ''}`
}

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
export const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
