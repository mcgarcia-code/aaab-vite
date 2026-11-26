// Guardado de avance de a un envío por vez (examen online y práctica del catálogo).
// Si se pide guardar mientras hay un envío en vuelo, no se manda otro en paralelo:
// al terminar el actual se manda uno más con el estado más reciente.
// Así nunca puede llegar último al servidor un guardado viejo que pise al nuevo.
// `enviar` debe armar el payload al momento de llamarse (con la selección actual).
export function useGuardadoEnCola(enviar) {
  let envioEnCurso = null
  let hayPendiente = false

  const guardar = () => {
    if (envioEnCurso) {
      hayPendiente = true
      return envioEnCurso
    }
    envioEnCurso = (async () => {
      try {
        let respuesta
        do {
          hayPendiente = false
          respuesta = await enviar()
        } while (hayPendiente)
        return respuesta
      } finally {
        envioEnCurso = null
        hayPendiente = false
      }
    })()
    return envioEnCurso
  }

  return { guardar }
}
