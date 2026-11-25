// Acciones sobre un partido de la carga de designaciones: árbitros 1/2 (con avisos),
// sin árbitro y externos, marcas de color, mesa de control, observador / delegado técnico,
// cancha, fecha y horario, suspender y borrar.
// Recibe lo que devuelve useCargaPartidos (partidos, padrón, guardado).
import { ref, computed } from 'vue'
import { normalizarTexto } from '@/utils/texto'
import { api } from '@/api/api'
import { SIN_ARBITRO, capitalizarNombre } from '@/components/panel-admin/designaciones/carga-partidos/ayudasPartido'

// Marcas de color del árbitro / delegado (se persisten con editarEtiquetaArbitro / editarEtiquetaDelegado)
export const OPCIONES_COLOR = [
  { valor: 'observaciones', etiqueta: 'Observaciones', color: 'violeta' },
  { valor: 'reemplazar', etiqueta: 'Reemplazar', color: 'rojo' },
  { valor: 'cambiar', etiqueta: 'Cambiar', color: 'naranja' },
  { valor: 'confirmado', etiqueta: 'Cambio confirmado', color: 'amarillo' },
  { valor: 'posible', etiqueta: 'Posible cambio', color: 'verde' }
]

export function useDesignacionPartido({ carga, esAdmin, toast, notificar }) {
  const { designaciones, arbitros, camposJuego, marcar, ejecutarGuardado } = carga

  /* ====================================================
     SELECTOR DE ARBITRO (modal compartido con buscador)
     Un solo listado en el DOM en vez de un <select> con
     todo el padrón por cada celda: mucho más liviano.
     ==================================================== */
  const mostrarSelectorArbitro = ref(false)
  const seleccionArbitro = ref(null)
  const busquedaArbitro = ref('')

  // Confirmación de avisos al designar árbitro 1/2 (antes de guardar)
  const mostrarModalConfirmarDesignacion = ref(false)
  const avisosDesignacionPendiente = ref([])
  const designacionPendiente = ref(null) // { p, numero }

  const abrirSelectorArbitro = (partido, numero) => {
    seleccionArbitro.value = { partido, numero }
    busquedaArbitro.value = ''
    mostrarSelectorArbitro.value = true
  }

  const cerrarSelectorArbitro = () => {
    mostrarSelectorArbitro.value = false
    seleccionArbitro.value = null
  }

  const tituloSelector = computed(() => {
    if (!seleccionArbitro.value) return 'Asignar Árbitro'
    const p = seleccionArbitro.value.partido
    const num = seleccionArbitro.value.numero
    const versus = `${p.local || '?'} vs ${p.visitante || '?'}`
    if (num === 'observador') return `Observador — ${versus}`
    if (num === 'delegado') return `Delegado técnico — ${versus}`
    if (num === 'planillero') return `Planillero — ${versus}`
    if (num === 'cronometrista') return `Cronometrista — ${versus}`
    return `Árbitro ${num} — ${versus}`
  })

  const arbitrosFiltrados = computed(() => {
    const busqueda = normalizarTexto(busquedaArbitro.value)
    if (!busqueda) return arbitros.value
    return arbitros.value.filter(a => normalizarTexto(`${a.apellido} ${a.nombre}`).includes(busqueda))
  })

  // "Sin Árbitro" solo para los puestos de árbitro 1 y 2
  const permiteSinArbitro = computed(() =>
    !!seleccionArbitro.value && (seleccionArbitro.value.numero === 1 || seleccionArbitro.value.numero === 2)
  )

  // Texto del modal de confirmación: lista simple de avisos (un solo árbitro).
  const textoAvisosDesignacionPendiente = computed(() => {
    return avisosDesignacionPendiente.value.map(a => `• ${a}`).join('\n')
  })

  // Antes de guardar la designación de árbitro 1/2, se consulta si genera
  // conflictos (doble cancha, mismo equipo, etc). Si no hay avisos, se guarda
  // directo; si hay, se pide confirmación antes de persistir.
  // numero (1 o 2) es solo para uso del FE, para saber qué puesto vaciar si se rechaza.
  const consultarDesignacion = async (p, numero, idArbitro) => {
    try {
      const res = await api.get({
        entity: 'designaciones',
        action: 'obtenerAvisosArbitro',
        payload: {
          idPartido: p.id,
          idArbitro
        }
      })
      const avisos = (res.ok && res.payload && res.payload.success) ? (res.payload.avisos || []) : []

      if (avisos.length === 0) {
        marcar(p)
        return
      }

      avisosDesignacionPendiente.value = avisos
      designacionPendiente.value = { p, numero }
      mostrarModalConfirmarDesignacion.value = true
    } catch (err) {
      console.error('Error al calcular avisos del árbitro:', err)
      marcar(p)
    }
  }

  const cerrarModalConfirmarDesignacion = () => {
    mostrarModalConfirmarDesignacion.value = false
    avisosDesignacionPendiente.value = []
    designacionPendiente.value = null
  }

  // Sí: recién acá se persiste la designación con ejecutarGuardado (vía marcar).
  const confirmarDesignacionConAvisos = () => {
    const pendiente = designacionPendiente.value
    cerrarModalConfirmarDesignacion()
    if (!pendiente) return
    marcar(pendiente.p)
  }

  // No: se quita el árbitro seleccionado y el puesto vuelve a quedar en blanco.
  const rechazarDesignacionConAvisos = () => {
    const pendiente = designacionPendiente.value
    cerrarModalConfirmarDesignacion()
    if (!pendiente) return
    const { p, numero } = pendiente
    if (numero === 1) { p.arbitro_1 = ''; p.id_arb1 = null; p._ext1 = false; p._estado1 = '' }
    else { p.arbitro_2 = ''; p.id_arb2 = null; p._ext2 = false; p._estado2 = '' }
    p.estado = (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'
  }

  /* ====================================================
     MESA DE CONTROL (planillero / cronometrista)
     Opcional por partido. Se abre un modal con los dos roles.
     Cada asignación reutiliza el selector de árbitros y se
     persiste con la acción editarCronometristaPlanillero.
     Payload: { idPartido, tipo, idArbitro }.
     tipo: 'planillero' | 'cronometrista'.
     ==================================================== */
  const mostrarModalMesa = ref(false)
  const partidoMesa = ref(null)

  const zIndexSelector = computed(() => {
    return mostrarModalMesa.value ? 1060 : 1040
  })

  const abrirModalMesa = (partido) => {
    partidoMesa.value = partido
    mostrarModalMesa.value = true
  }

  const cerrarModalMesa = () => {
    mostrarModalMesa.value = false
    partidoMesa.value = null
  }

  // Abre el selector de árbitros reutilizado, marcando el rol de mesa.
  // No cerramos el modal de mesa: el selector se abre encima.
  const abrirSelectorMesa = (tipo) => {
    if (!partidoMesa.value) return
    seleccionArbitro.value = { partido: partidoMesa.value, numero: tipo } // 'planillero' | 'cronometrista'
    busquedaArbitro.value = ''
    mostrarSelectorArbitro.value = true
  }

  const asignarMesa = async (arbitro, tipo, p) => {
    const campoNombre = tipo === 'planillero' ? 'planillero' : 'cronometrista'
    const campoId = tipo === 'planillero' ? 'id_planillero' : 'id_cronometrista'

    const nombreAnterior = p[campoNombre]
    const idAnterior = p[campoId]

    // Actualización optimista
    if (!arbitro) {
      p[campoNombre] = ''
      p[campoId] = null
    } else {
      p[campoNombre] = capitalizarNombre(`${arbitro.apellido} ${arbitro.nombre}`)
      p[campoId] = arbitro.id
    }

    setTimeout(() => cerrarSelectorArbitro(), 0)

    try {
      const resultado = await api.post({
        entity: 'designaciones',
        action: 'editarCronometristaPlanillero',
        payload: {
          idPartido: p.id,
          tipo,                            // 'planillero' | 'cronometrista'
          idArbitro: arbitro ? arbitro.id : null
        }
      })

      if (!resultado.ok) {
        throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
      }
    } catch (err) {
      console.error('Error al editar planillero/cronometrista:', err)
      p[campoNombre] = nombreAnterior
      p[campoId] = idAnterior
      toast({ titulo: 'Error', mensaje: 'No se pudo guardar la mesa de control.', tipo: 'danger' })
    }
  }

  /* ====================================================
     OBSERVADOR / DELEGADO TÉCNICO
     Se persiste con la acción editarObservadorDelegado.
     Payload: { id, tipo, id_arbitro }.
     tipo: 'observador' | 'delegado'. id_arbitro null = sin asignar.
     Actualización optimista con reversión si falla.
     ==================================================== */
  const asignarObservadorDelegado = async (arbitro, tipo, p) => {
    const campoNombre = tipo === 'observador' ? 'observador' : 'delegado'
    const campoId = tipo === 'observador' ? 'id_observador' : 'id_delegado'

    // Guardo valores anteriores por si hay que revertir
    const nombreAnterior = p[campoNombre]
    const idAnterior = p[campoId]
    const estadoDelAnterior = p._estadoDel

    // Actualización optimista
    if (!arbitro) {
      p[campoNombre] = ''
      p[campoId] = null
    } else {
      p[campoNombre] = capitalizarNombre(`${arbitro.apellido} ${arbitro.nombre}`)
      p[campoId] = arbitro.id
    }

    // Al cambiar el delegado técnico, su etiqueta ('reemplazar' por rechazo del
    // delegado anterior) deja de corresponder: se limpia acá y en el backend.
    if (tipo === 'delegado') p._estadoDel = ''

    cerrarSelectorArbitro()

    try {
      const resultado = await api.post({
        entity: 'designaciones',
        action: 'editarObservadorDelegado',
        payload: {
          idPartido: p.id,
          tipo,                        // 'observador' | 'delegado'
          idArbitro: arbitro ? arbitro.id : null
        }
      })

      if (!resultado.ok) {
        throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
      }
    } catch (err) {
      console.error('Error al editar observador/delegado:', err)
      // Revertir
      p[campoNombre] = nombreAnterior
      p[campoId] = idAnterior
      if (tipo === 'delegado') p._estadoDel = estadoDelAnterior
      toast({ titulo: 'Error', mensaje: 'No se pudo guardar el observador/delegado técnico.', tipo: 'danger' })
    }
  }

  /* ====================================================
     ASIGNAR (árbitro 1/2, mesa, observador o delegado)
     ==================================================== */
  const asignarArbitro = async (arbitro) => {
    const sel = seleccionArbitro.value
    if (!sel) return
    const p = sel.partido

    // ---- Mesa de control (planillero / cronometrista) ----
    if (sel.numero === 'planillero' || sel.numero === 'cronometrista') {
      await asignarMesa(arbitro, sel.numero, p)
      return
    }

    // ---- Observador / Delegado técnico (acción propia) ----
    if (sel.numero === 'observador' || sel.numero === 'delegado') {
      await asignarObservadorDelegado(arbitro, sel.numero, p)
      return
    }

    // ---- Árbitro 1 / 2 (flujo existente) ----
    // Al cambiar de árbitro se limpia la etiqueta: si el anterior había
    // rechazado (quedó en 'reemplazar'), esa marca ya no corresponde.
    cerrarSelectorArbitro()

    if (!arbitro) {
      if (sel.numero === 1) { p.arbitro_1 = ''; p.id_arb1 = null; p._ext1 = false; p._estado1 = '' }
      else { p.arbitro_2 = ''; p.id_arb2 = null; p._ext2 = false; p._estado2 = '' }
      p.estado = (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'
      marcar(p)
      return
    }

    const nombreCompleto = capitalizarNombre(`${arbitro.apellido}, ${arbitro.nombre}`)
    if (sel.numero === 1) { p.arbitro_1 = nombreCompleto; p.id_arb1 = arbitro.id; p._ext1 = false; p._estado1 = '' }
    else { p.arbitro_2 = nombreCompleto; p.id_arb2 = arbitro.id; p._ext2 = false; p._estado2 = '' }

    // Recalcular estado local para que la ayuda visual reaccione al instante.
    // El backend lo confirma igual al guardar (guardarPartidos).
    p.estado = (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'

    await consultarDesignacion(p, sel.numero, arbitro.id)
  }

  const asignarSinArbitro = () => {
    const sel = seleccionArbitro.value
    if (!sel || (sel.numero !== 1 && sel.numero !== 2)) return
    const p = sel.partido
    cerrarSelectorArbitro()

    if (sel.numero === 1) { p.arbitro_1 = SIN_ARBITRO; p.id_arb1 = null; p._ext1 = false; p._estado1 = '' }
    else { p.arbitro_2 = SIN_ARBITRO; p.id_arb2 = null; p._ext2 = false; p._estado2 = '' }

    p.estado = (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'
    marcar(p)
  }

  // Asigna un árbitro que no está en el padrón (ej: viene del interior).
  // Queda como texto libre, sin id_arb, y por eso no le aparece en su panel.
  // Al no tener id no hay contra qué calcular avisos: se guarda directo.
  const asignarArbitroLibre = async (texto) => {
    const sel = seleccionArbitro.value
    if (!sel) return
    const nombre = capitalizarNombre(texto)
    if (!nombre) return
    const p = sel.partido
    cerrarSelectorArbitro()

    if (sel.numero === 1) { p.arbitro_1 = nombre; p.id_arb1 = null; p._ext1 = true; p._estado1 = '' }
    else { p.arbitro_2 = nombre; p.id_arb2 = null; p._ext2 = true; p._estado2 = '' }

    // Recalcular estado local para que la ayuda visual reaccione al instante.
    // El backend lo confirma igual al guardar (guardarPartidos).
    p.estado = (p.arbitro_1 || p.arbitro_2) ? 'designado' : 'a_designar'

    marcar(p)
  }

  /* ====================================================
     MARCA DE ESTADO POR COLOR (etiqueta del árbitro)
     Se persiste con la acción editarEtiquetaArbitro.
     Payload: { id, numero, etiqueta }.
     El backend devuelve etiqueta_arb1 / etiqueta_arb2 al
     cargar las designaciones; acá se mapean a _estado1/_estado2.
     ==================================================== */
  const mostrarSelectorColor = ref(false)
  const seleccionColor = ref(null)

  // numero: 1 | 2 para árbitros, o 'delegado' para el delegado técnico.
  const abrirSelectorColor = (partido, numero) => {
    seleccionColor.value = { partido, numero }
    mostrarSelectorColor.value = true
  }

  const cerrarSelectorColor = () => {
    mostrarSelectorColor.value = false
    seleccionColor.value = null
  }

  const tituloSelectorColor = computed(() =>
    seleccionColor.value?.numero === 'delegado' ? 'Estado del delegado técnico' : 'Estado del árbitro'
  )

  const asignarColor = async (valor) => {
    const sel = seleccionColor.value
    if (!sel) return
    const p = sel.partido
    const numero = sel.numero

    // ---- Delegado técnico ----
    if (numero === 'delegado') {
      const valorAnterior = p._estadoDel

      // Actualización optimista
      p._estadoDel = valor
      cerrarSelectorColor()

      try {
        const resultado = await api.post({
          entity: 'designaciones',
          action: 'editarEtiquetaDelegado',
          payload: {
            idPartido: p.id,
            etiqueta: valor
          }
        })

        if (!resultado.ok) {
          throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
        }
      } catch (err) {
        console.error('Error al editar etiqueta del delegado:', err)
        // Revertir
        p._estadoDel = valorAnterior
        toast({ titulo: 'Error', mensaje: 'No se pudo guardar la etiqueta del delegado técnico.', tipo: 'danger' })
      }
      return
    }

    // ---- Árbitro 1 / 2 ----
    const valorAnterior = numero === 1 ? p._estado1 : p._estado2

    // Actualización optimista
    if (numero === 1) p._estado1 = valor
    else p._estado2 = valor
    cerrarSelectorColor()

    try {
      const resultado = await api.post({
        entity: 'designaciones',
        action: 'editarEtiquetaArbitro',
        payload: {
          idPartido: p.id,
          numero,
          etiqueta: valor
        }
      })

      if (!resultado.ok) {
        throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
      }
    } catch (err) {
      console.error('Error al editar etiqueta de árbitro:', err)
      // Revertir
      if (numero === 1) p._estado1 = valorAnterior
      else p._estado2 = valorAnterior
      toast({ titulo: 'Error', mensaje: 'No se pudo guardar la etiqueta del árbitro.', tipo: 'danger' })
    }
  }

  /* ====================================================
     CANCHA (editable cuando llega vacía desde el Excel)
     Se persiste con la acción editarCampoDeJuego.
     Payload: { idPartido, cancha, idCampoJuego }.
     ==================================================== */
  const mostrarSelectorCancha = ref(false)
  const partidoCancha = ref(null)
  const campoJuegoSeleccionado = ref('')
  const guardandoCancha = ref(false)

  const abrirSelectorCancha = (partido) => {
    partidoCancha.value = partido
    campoJuegoSeleccionado.value = partido.id_campo_juego || ''
    mostrarSelectorCancha.value = true
  }

  const cerrarSelectorCancha = () => {
    mostrarSelectorCancha.value = false
    partidoCancha.value = null
    campoJuegoSeleccionado.value = ''
  }

  const confirmarCancha = async () => {
    const p = partidoCancha.value
    const campo = camposJuego.value.find(cj => cj.cj_id === campoJuegoSeleccionado.value)
    if (!p || !campo) return

    guardandoCancha.value = true
    try {
      // Si el partido todavía no está en la base (recién cargado del Excel),
      // primero lo persistimos para que tenga id; editarCampoDeJuego lo necesita.
      if (!p.id) {
        const ok = await ejecutarGuardado()
        if (!ok || !p.id) {
          throw new Error('No se pudo guardar el partido antes de asignar la cancha')
        }
      }

      const resultado = await api.post({
        entity: 'designaciones',
        action: 'editarCampoDeJuego',
        payload: {
          idPartido: p.id,
          cancha: campo.cj_nombre,
          idCampoJuego: campo.cj_id
        }
      })

      if (!resultado.ok) {
        throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
      }

      p.cancha = campo.cj_nombre
      p.id_campo_juego = campo.cj_id
      cerrarSelectorCancha()
    } catch (err) {
      console.error('Error al editar cancha:', err)
      toast({ titulo: 'Error', mensaje: 'No se pudo guardar la cancha.', tipo: 'danger' })
    } finally {
      guardandoCancha.value = false
    }
  }

  /* ====================================================
     FECHA Y HORARIO (solo admin)
     Se persiste reutilizando guardarPartidos, que ya acepta
     fecha/horario por partido (ver limpiarPartidoParaEnviar).
     ==================================================== */
  const mostrarModalFechaHorario = ref(false)
  const partidoFechaHorario = ref(null)
  const fechaEditada = ref('')
  const horarioEditada = ref('')
  const guardandoFechaHorario = ref(false)

  const abrirModalFechaHorario = (p) => {
    if (!esAdmin.value) return
    partidoFechaHorario.value = p
    fechaEditada.value = p.fecha || ''
    horarioEditada.value = p.horario || ''
    mostrarModalFechaHorario.value = true
  }

  const cerrarModalFechaHorario = () => {
    mostrarModalFechaHorario.value = false
    partidoFechaHorario.value = null
    fechaEditada.value = ''
    horarioEditada.value = ''
  }

  const confirmarFechaHorario = async () => {
    const p = partidoFechaHorario.value
    if (!p || !fechaEditada.value || !horarioEditada.value) return

    const fechaAnterior = p.fecha
    const horarioAnterior = p.horario

    guardandoFechaHorario.value = true
    p.fecha = fechaEditada.value
    p.horario = horarioEditada.value
    marcar(p)

    const ok = await ejecutarGuardado()
    guardandoFechaHorario.value = false

    if (ok) {
      cerrarModalFechaHorario()
    } else {
      p.fecha = fechaAnterior
      p.horario = horarioAnterior
      toast({ titulo: 'Error', mensaje: 'No se pudo guardar la fecha/horario.', tipo: 'danger' })
    }
  }

  /* ====================================================
     SUSPENDER PARTIDO (antes del inicio)
     ==================================================== */
  const toggleSuspendido = async (p, event) => {
    const nuevoValor = event.target.checked
    const valorAnterior = p.suspendido

    // Actualización optimista
    p.suspendido = nuevoValor

    try {
      const resultado = await api.post({
        entity: 'designaciones',
        action: 'marcarPartidoSuspendido',
        payload: {
          idPartido: p.id,
          suspendido: nuevoValor
        }
      })

      if (!resultado.ok) {
        throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
      }
    } catch (err) {
      console.error('Error al marcar partido suspendido:', err)
      // Revertir estado y checkbox
      p.suspendido = valorAnterior
      event.target.checked = valorAnterior
      toast({ titulo: 'Error', mensaje: 'No se pudo cambiar el estado del partido.', tipo: 'danger' })
    }
  }

  /* ====================================================
     BORRAR PARTIDO (solo sin árbitros, estado a_designar)
     ==================================================== */
  const confirmarBorrarPartido = async (p) => {
    try {
      const resultado = await api.post({
        entity: 'designaciones',
        action: 'borrarPartido',
        payload: {
          idPartido: p.id
        }
      })

      if (!resultado.ok || resultado.payload !== true) {
        throw new Error((resultado.payload && resultado.payload.mensaje) ? resultado.payload.mensaje : 'Error del servidor')
      }

      designaciones.value = designaciones.value.filter(d => d !== p)
      toast({ titulo: 'Éxito', mensaje: 'Partido borrado correctamente.', tipo: 'success' })
    } catch (err) {
      console.error('Error al borrar partido:', err)
      toast({ titulo: 'Error', mensaje: 'No se pudo borrar el partido.', tipo: 'danger' })
    }
  }

  const borrarPartido = (p) => {
    notificar({
      titulo: '¿Borrar partido?',
      mensaje: `${p.local || '?'} vs ${p.visitante || '?'}\nEsta acción no se puede deshacer.`,
      tipo: 'danger',
      alConfirmar: () => confirmarBorrarPartido(p)
    })
  }

  return {
    // selector de árbitro
    mostrarSelectorArbitro, busquedaArbitro, tituloSelector, arbitrosFiltrados, permiteSinArbitro, zIndexSelector,
    abrirSelectorArbitro, cerrarSelectorArbitro, asignarArbitro, asignarSinArbitro, asignarArbitroLibre,
    // confirmación con avisos
    mostrarModalConfirmarDesignacion, textoAvisosDesignacionPendiente, confirmarDesignacionConAvisos, rechazarDesignacionConAvisos,
    // mesa de control
    mostrarModalMesa, partidoMesa, abrirModalMesa, cerrarModalMesa, abrirSelectorMesa,
    // marca de color
    mostrarSelectorColor, tituloSelectorColor, abrirSelectorColor, cerrarSelectorColor, asignarColor,
    // cancha
    mostrarSelectorCancha, partidoCancha, campoJuegoSeleccionado, guardandoCancha, abrirSelectorCancha, cerrarSelectorCancha, confirmarCancha,
    // fecha y horario
    mostrarModalFechaHorario, partidoFechaHorario, fechaEditada, horarioEditada, guardandoFechaHorario,
    abrirModalFechaHorario, cerrarModalFechaHorario, confirmarFechaHorario,
    // suspender y borrar
    toggleSuspendido, borrarPartido
  }
}
