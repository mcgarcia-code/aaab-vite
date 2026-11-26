import { ref } from 'vue'
import { api } from '@/api/api'

// Administración del catálogo de preguntas (backend: catalogo_admin.php, permiso catalogo_preguntas).
// Las tablas preguntas / respuestas son las mismas que usan el examen de asamblea, el examen del curso,
// la práctica del catálogo y el catálogo público: lo que se cambia acá se ve en todos lados.

const ENTIDAD = 'catalogo_admin'

// Una pregunta sin ninguna respuesta correcta no aparece en exámenes, práctica ni catálogo público
export const AVISO_SIN_CORRECTA = 'Sin respuesta correcta: no aparece en los exámenes, la práctica ni el catálogo público.'

// Lanza el mensaje del backend si la respuesta no fue ok
const conRespuesta = (res, mensaje) => {
  if (!res?.ok) throw new Error(res?.message || mensaje)
  return res.payload
}

export function useCatalogoAdmin() {
  const reglas = ref([])            // [{ codigo, preguntas, sinCorrecta }]
  const preguntas = ref([])         // preguntas de la regla abierta
  const cargandoReglas = ref(false)
  const cargandoPreguntas = ref(false)

  const cargarReglas = async () => {
    cargandoReglas.value = true
    try {
      const res = await api.get({ entity: ENTIDAD, action: 'reglasCatalogoAdmin' })
      reglas.value = conRespuesta(res, 'No se pudieron cargar las reglas') || []
    } finally {
      cargandoReglas.value = false
    }
  }

  // Si mientras cargaba se abrió otra regla, la respuesta vieja se descarta
  let ultimoPedido = 0
  const cargarPreguntas = async (codigo) => {
    const pedido = ++ultimoPedido
    cargandoPreguntas.value = true
    try {
      const res = await api.get({ entity: ENTIDAD, action: 'preguntasReglaCatalogo', payload: { codigo } })
      const lista = conRespuesta(res, 'No se pudieron cargar las preguntas') || []
      if (pedido === ultimoPedido) preguntas.value = lista
    } finally {
      if (pedido === ultimoPedido) cargandoPreguntas.value = false
    }
  }

  // Las acciones de abajo devuelven la pregunta completa ({ ..., respuestas: [] }) o lanzan el error

  const obtenerPregunta = async (id) =>
    conRespuesta(await api.get({ entity: ENTIDAD, action: 'detallePreguntaCatalogo', payload: { id } }), 'No se pudo cargar la pregunta')

  const guardarPregunta = async ({ id, codigo, subcodigo, texto, textoEn, excluidaExamenes }) =>
    conRespuesta(await api.post({
      entity: ENTIDAD,
      action: 'guardarPreguntaCatalogo',
      payload: { id: id || 0, codigo, subcodigo: subcodigo ?? '', texto, textoEn, excluidaExamenes: !!excluidaExamenes }
    }), 'No se pudo guardar la pregunta')

  const borrarPregunta = async (id) =>
    conRespuesta(await api.post({ entity: ENTIDAD, action: 'borrarPreguntaCatalogo', payload: { id } }), 'No se pudo borrar la pregunta')

  const guardarRespuesta = async ({ id, idPregunta, texto, textoEn, esCorrecta }) =>
    conRespuesta(await api.post({
      entity: ENTIDAD,
      action: 'guardarRespuestaCatalogo',
      payload: { id: id || 0, idPregunta, texto, textoEn, esCorrecta: !!esCorrecta }
    }), 'No se pudo guardar la respuesta')

  const borrarRespuesta = async (id) =>
    conRespuesta(await api.post({ entity: ENTIDAD, action: 'borrarRespuestaCatalogo', payload: { id } }), 'No se pudo borrar la respuesta')

  return {
    reglas,
    preguntas,
    cargandoReglas,
    cargandoPreguntas,
    cargarReglas,
    cargarPreguntas,
    obtenerPregunta,
    guardarPregunta,
    borrarPregunta,
    guardarRespuesta,
    borrarRespuesta
  }
}
