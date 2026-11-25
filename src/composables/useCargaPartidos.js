// Carga de designaciones (panel admin · Designaciones · Carga de partidos).
// Estado de la semana, carga inicial y por Excel, días, filtros, agrupado por cancha,
// totales, avisos del backend, guardado automático y el modal de pendientes.
// Lo usan CargaPartidos.vue, useDesignacionPartido y usePublicarDesignaciones.
import { ref, computed, watch, nextTick } from 'vue'
import { normalizarTexto } from '@/utils/texto'
import { api } from '@/api/api'
import {
  estadoDesignacion, cantidadAvisos, etiquetaAvisos, textoAvisos, gruposAvisos, esSinMatch,
  parsearFecha, etiquetaDia, claveFecha, ordenarPorFechaHorario
} from '@/components/panel-admin/designaciones/carga-partidos/ayudasPartido'

// Tipos de aviso según el color que asigna el backend (de más a menos grave)
export const TIPOS_AVISO = [
  {
    color: 'rojo',
    titulo: 'Impedimento',
    descripcion: 'No debería dirigir: inactivo, sanción, licencia aprobada o indeterminada, juega en el club o la categoría, vínculo en la categoría o solicitud institucional.'
  },
  {
    color: 'naranja',
    titulo: 'Conflicto',
    descripcion: 'Sin disponibilidad ese día, licencia pendiente o ya designado en otra cancha el mismo día.'
  },
  {
    color: 'amarillo',
    titulo: 'Advertencia',
    descripcion: 'Fuera de su horario declarado, licencia rechazada, ya dirigió al equipo en la categoría, o vínculo / ex-jugador / se identifica con el club.'
  }
]

export function useCargaPartidos({ toast }) {
  const designaciones = ref([])
  const labelSemana = ref('')
  const arbitros = ref([])
  const cargando = ref(false)
  const semanaAtras = ref(0)
  const hayPosteriores = ref(false)
  let contadorUid = 0

  /* ====================================================
     AVISOS (los calcula el backend por partido)
     ==================================================== */
  const avisosMap = ref({})

  const cargarAvisos = async () => {
    try {
      const res = await api.get({
        entity: 'designaciones',
        action: 'obtenerAvisosDesignaciones',
        payload: {
          semanaAtras: semanaAtras.value
        }
      })
      if (res.ok && res.payload && res.payload.success) {
        avisosMap.value = res.payload.avisos || {}
      } else {
        const detalle = (res.payload && res.payload.mensaje) ? res.payload.mensaje : JSON.stringify(res)
        console.error('obtenerAvisosDesignaciones falló:', detalle)
      }
    } catch (err) {
      console.error('Error al cargar avisos de validación:', err)
    }
  }

  // Avisos del partido (las funciones están en carga-partidos/ayudasPartido.js)
  const avisosPartido = (p) => cantidadAvisos(avisosMap.value, p)
  const etiquetaPartido = (p) => etiquetaAvisos(avisosMap.value, p)
  const textoAvisosPartido = (p) => textoAvisos(avisosMap.value, p)
  const gruposAvisosPartido = (p) => gruposAvisos(avisosMap.value, p)

  const totalConflictos = computed(() => {
    return designaciones.value.filter(p => avisosPartido(p) > 0).length
  })

  const partidosConAviso = computed(() =>
    designaciones.value
      .filter(p => avisosPartido(p) > 0)
      .sort(ordenarPorFechaHorario)
  )

  const cantidadAvisosPorColor = computed(() => {
    const conteo = { rojo: 0, naranja: 0, amarillo: 0 }
    partidosConAviso.value.forEach(p => {
      const color = etiquetaPartido(p)
      if (conteo[color] !== undefined) conteo[color]++
    })
    return conteo
  })

  // Modal de avisos de un partido ya designado (ícono ⚠ en la grilla)
  const mostrarModalAvisosPartido = ref(false)
  const textoAvisosPartidoActual = ref('')

  const mostrarAvisosPartido = (p) => {
    if (avisosPartido(p) === 0) return
    textoAvisosPartidoActual.value = textoAvisosPartido(p)
    mostrarModalAvisosPartido.value = true
  }

  const totalADesignar = computed(() =>
    designaciones.value.filter(p => estadoDesignacion(p) === 'a_designar').length
  )

  /* ====================================================
     PADRÓN Y CANCHAS
     ==================================================== */
  // Padrón liviano solo para el selector (las validaciones ya no lo necesitan)
  const cargarArbitros = async () => {
    try {
      const res = await api.getCacheado({
        entity: 'arbitros',
        action: 'getArbitrosBasico',
        payload: { soloActivos: false }
      }, { ttl: 60 * 1000 })
      if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
    } catch (err) { console.error(err) }
  }

  const camposJuego = ref([])

  const cargarCamposJuego = async () => {
    try {
      const res = await api.get({ entity: 'clubes', action: 'obtenerCamposDeJuego' })
      if ((res.ok || res.success) && res.payload) camposJuego.value = res.payload
    } catch (err) { console.error(err) }
  }

  /* ====================================================
     FILTROS
     ==================================================== */
  const fechaSeleccionada = ref('')
  const filtroBusqueda = ref('')
  const filtroEstado = ref('') // '' | 'a_designar' | 'designado' | 'publicado'

  const toggleFiltroEstado = (estado) => {
    filtroEstado.value = filtroEstado.value === estado ? '' : estado
  }

  /* ====================================================
     CARGA INICIAL
     ==================================================== */
  const normalizarPartido = (p) => ({
    ...p,
    fecha: (p.fecha && !String(p.fecha).startsWith('0000')) ? String(p.fecha).slice(0, 10) : '',
    horario: p.horario ? String(p.horario).slice(0, 5) : '',
    suspendido: p.suspendido === true || p.suspendido === 1 || p.suspendido === '1',
    _estado1: p.etiqueta_arb1 || '',
    _estado2: p.etiqueta_arb2 || '',
    _ext1: Number(p.externo_arb1) === 1 && !p.id_arb1,
    _ext2: Number(p.externo_arb2) === 1 && !p.id_arb2,
    observador: p.observador || '',
    id_observador: p.id_observador || null,
    delegado: p.delegado || '',
    id_delegado: p.id_delegado || null,
    _estadoDel: p.etiqueta_delegado || '',
    planillero: p.planillero || '',
    id_planillero: p.id_planillero || null,
    cronometrista: p.cronometrista || '',
    id_cronometrista: p.id_cronometrista || null,
    _dirty: false,
    _uid: 'u' + (++contadorUid)
  })

  const cargarDesignaciones = async () => {
    cargando.value = true
    try {
      const res = await api.get({
        entity: 'designaciones',
        action: 'obtenerDesignaciones',
        payload: { semanaAtras: semanaAtras.value }
      })
      if ((res.ok || res.success) && res.payload) {
        designaciones.value = res.payload.designaciones.map(normalizarPartido)
        labelSemana.value = res.payload.labelSemana
        hayPosteriores.value = !!res.payload.hayPosteriores
      }
    } catch (err) {
      console.error('Error al cargar designaciones:', err)
      toast({ titulo: 'Error', mensaje: 'No se pudieron cargar las designaciones.', tipo: 'danger' })
    } finally {
      cargando.value = false
    }
  }

  const semanaAnterior = async () => {
    semanaAtras.value++
    await cargarDesignaciones()
    await cargarAvisos()
  }

  const semanaSiguiente = async () => {
    if (semanaAtras.value <= 0 && !hayPosteriores.value) return
    semanaAtras.value--
    await cargarDesignaciones()
    await cargarAvisos()
  }

  // Carga completa al entrar a la sección
  const iniciar = async () => {
    await cargarArbitros()
    await cargarDesignaciones()
    cargarAvisos()
    cargarCamposJuego()
  }

  /* ====================================================
     FECHAS (PESTAÑAS POR DIA)
     ==================================================== */
  const fechas = computed(() => {
    const mapa = {}
    designaciones.value.forEach(p => {
      const f = claveFecha(p)
      mapa[f] = (mapa[f] || 0) + 1
    })

    return Object.keys(mapa)
      .sort((a, b) => parsearFecha(a) - parsearFecha(b))
      .map(f => ({ fecha: f, cantidad: mapa[f] }))
  })

  // Pestañas por día: etiqueta del día y cantidad de partidos
  const pestanasFechas = computed(() => fechas.value.map(f => ({ clave: f.fecha, etiqueta: etiquetaDia(f.fecha), cantidad: f.cantidad })))

  watch(fechas, (nuevas) => {
    if (!nuevas.find(f => f.fecha === fechaSeleccionada.value)) {
      fechaSeleccionada.value = nuevas.length > 0 ? nuevas[0].fecha : ''
    }
  }, { immediate: true })

  /* ====================================================
     AGRUPADO POR CANCHA (DEL DIA SELECCIONADO)
     ==================================================== */
  const canchas = computed(() => {
    const busqueda = normalizarTexto(filtroBusqueda.value)

    const delDia = designaciones.value.filter(p => {
      const f = String(p.fecha || '').trim() || 'Sin fecha'
      if (f !== fechaSeleccionada.value) return false

      // Filtro por estado de designación
      if (filtroEstado.value && estadoDesignacion(p) !== filtroEstado.value) return false

      if (!busqueda) return true
      const textoPartido = normalizarTexto(
        `${p.cancha} ${p.local} ${p.visitante} ${p.arbitro_1} ${p.arbitro_2} ${p.observador} ${p.delegado} ${p.categoria_division}`
      )
      return textoPartido.includes(busqueda)
    })

    const mapa = {}
    delDia.forEach(p => {
      const nombre = String(p.cancha || 'SIN CANCHA').trim()
      if (!mapa[nombre]) mapa[nombre] = []
      mapa[nombre].push(p)
    })

    return Object.keys(mapa)
      .sort((a, b) => a.localeCompare(b))
      .map(nombre => {
        const partidos = mapa[nombre].sort((a, b) => String(a.horario || '').localeCompare(String(b.horario || '')))
        const primero = partidos[0] || {}
        const direccion = [primero.cj_domicilio, primero.cj_localidad].filter(Boolean).join(', ').trim()

        return {
          nombre,
          partidos,
          linkMapa: direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}` : null
        }
      })
  })

  const totalSinMatch = computed(() => {
    let contador = 0
    designaciones.value.forEach(p => {
      if (p.arbitro_1 && !p.id_arb1) contador++
      if (p.arbitro_2 && !p.id_arb2) contador++
    })
    return contador
  })

  const totalSinCancha = computed(() =>
    designaciones.value.filter(p => !p.cancha).length
  )

  /* ====================================================
     GUARDADO AUTOMÁTICO (asignación de árbitros, fecha y horario)
     ==================================================== */
  const estadoGuardado = ref('') // '' | 'guardando' | 'guardado' | 'error'
  let timerOcultar = null

  const limpiarPartidoParaEnviar = (p) => ({
    id: p.id,
    _uid: p._uid,
    fecha: p.fecha,
    //cancha: p.cancha,
    //categoria_division: p.categoria_division,
    horario: p.horario,
    //local: p.local,
    //visitante: p.visitante,
    arbitro_1: p.arbitro_1,
    arbitro_2: p.arbitro_2,
    id_arb1: p.id_arb1,
    id_arb2: p.id_arb2,
    externo_arb1: !!p._ext1 && !p.id_arb1,
    externo_arb2: !!p._ext2 && !p.id_arb2
  })

  const ejecutarGuardado = async () => {
    const modificados = designaciones.value.filter(p => p._dirty || !p.id)

    if (modificados.length === 0) {
      estadoGuardado.value = ''
      return true
    }

    estadoGuardado.value = 'guardando'

    try {
      const res = await api.post({
        entity: 'designaciones',
        action: 'guardarPartidos',
        payload: {
          partidos: modificados.map(limpiarPartidoParaEnviar)
        }
      })

      if (res.ok && res.payload && res.payload.success) {
        // Asignar ids nuevos que devuelve el backend (map _uid -> id)
        const nuevosIds = res.payload.ids || {}
        modificados.forEach(p => {
          if (!p.id && p._uid && nuevosIds[p._uid]) p.id = nuevosIds[p._uid]
          p._dirty = false
        })

        estadoGuardado.value = 'guardado'
        if (timerOcultar) clearTimeout(timerOcultar)
        timerOcultar = setTimeout(() => {
          if (estadoGuardado.value === 'guardado') estadoGuardado.value = ''
        }, 2000)

        // Con los datos ya persistidos, el backend recalcula los avisos
        cargarAvisos()
        return true
      }
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    } catch (err) {
      console.error('Error al guardar cambios:', err)
      estadoGuardado.value = 'error'
      return false
    }
  }

  const guardarAhora = () => { ejecutarGuardado() }

  // Marca de cambio (solo para la asignación de árbitros): guarda enseguida
  const marcar = (p) => {
    p._dirty = true
    ejecutarGuardado()
  }

  const hayCambios = computed(() => {
    return designaciones.value.some(p => p._dirty || !p.id)
  })

  /* ====================================================
     CARGA DESDE EXCEL
     ==================================================== */
  const mostrarModalCarga = ref(false)
  const subiendoExcel = ref(false)
  const archivoExcel = ref(null)

  const abrirModalCarga = () => {
    archivoExcel.value = null
    mostrarModalCarga.value = true
  }

  const cerrarModalCarga = () => {
    mostrarModalCarga.value = false
    archivoExcel.value = null
  }

  const seleccionarArchivoExcel = (event) => {
    archivoExcel.value = event.target.files[0] || null
  }

  const confirmarCargaExcel = async () => {
    if (!archivoExcel.value) return

    const formData = new FormData()
    formData.append('archivo', archivoExcel.value)

    subiendoExcel.value = true
    try {
      const res = await api.postFile({
        entity: 'designaciones',
        action: 'cargarDesignacionesExcel',
        payload: formData
      })

      if (res.ok && res.payload && res.payload.success) {
        toast({ titulo: 'Éxito', mensaje: res.payload.mensaje || 'Se cargaron los partidos.', tipo: 'success' })
        cerrarModalCarga()
        await cargarDesignaciones()
        cargarAvisos()
      } else {
        throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
      }
    } catch (err) {
      console.error('Error al cargar designaciones:', err)
      toast({ titulo: 'Error', mensaje: err.message || 'Hubo un problema al subir el archivo.', tipo: 'danger' })
    } finally {
      subiendoExcel.value = false
    }
  }

  /* ====================================================
     MODAL DE PENDIENTES (sin designar / sin coincidencia / sin cancha / avisos)
     ==================================================== */
  const mostrarModalPendientes = ref(false)
  const tipoPendientes = ref('') // 'a_designar' | 'sin_match' | 'sin_cancha' | 'aviso_*'
  const partidoResaltado = ref('') // id/_uid del partido al que se saltó

  // Un partido "tiene sin coincidencia" si alguno de sus arbitros esta sin match
  const partidoTieneSinMatch = (p) => esSinMatch(p, 1) || esSinMatch(p, 2)

  const partidosSinDesignar = computed(() =>
    designaciones.value
      .filter(p => estadoDesignacion(p) === 'a_designar')
      .sort(ordenarPorFechaHorario)
  )

  const partidosSinCoincidencia = computed(() =>
    designaciones.value
      .filter(p => partidoTieneSinMatch(p))
      .sort(ordenarPorFechaHorario)
  )

  const partidosSinCancha = computed(() =>
    designaciones.value
      .filter(p => !p.cancha)
      .sort(ordenarPorFechaHorario)
  )

  // Lista que se muestra en el modal segun el tipo abierto
  // Modal de avisos: tipoPendientes = 'aviso_todos' | 'aviso_rojo' | 'aviso_naranja' | 'aviso_amarillo'
  const esModalAvisos = computed(() => tipoPendientes.value.startsWith('aviso_'))
  const tipoAvisoModal = computed(() =>
    TIPOS_AVISO.find(t => 'aviso_' + t.color === tipoPendientes.value) || null
  )

  const partidosPendientesModal = computed(() => {
    if (tipoPendientes.value === 'sin_match') return partidosSinCoincidencia.value
    if (tipoPendientes.value === 'sin_cancha') return partidosSinCancha.value
    if (tipoPendientes.value === 'aviso_todos') return partidosConAviso.value
    if (tipoAvisoModal.value) {
      return partidosConAviso.value.filter(p => etiquetaPartido(p) === tipoAvisoModal.value.color)
    }
    return partidosSinDesignar.value
  })

  const tituloModalPendientes = computed(() => {
    if (tipoPendientes.value === 'sin_match') return 'Árbitros sin coincidencia'
    if (tipoPendientes.value === 'sin_cancha') return 'Partidos sin cancha'
    if (tipoPendientes.value === 'aviso_todos') return 'Partidos con avisos'
    if (tipoAvisoModal.value) return 'Avisos: ' + tipoAvisoModal.value.titulo
    return 'Partidos sin designar'
  })

  const iconoModalPendientes = computed(() => {
    if (tipoPendientes.value === 'sin_match') return 'person_off'
    if (tipoPendientes.value === 'sin_cancha') return 'wrong_location'
    if (esModalAvisos.value) return 'warning'
    return 'error_outline'
  })

  const colorIconoModalPendientes = computed(() => {
    if (tipoPendientes.value === 'sin_match') return 'bg-warning text-dark'
    if (tipoAvisoModal.value?.color === 'amarillo') return 'bg-warning text-dark'
    if (tipoAvisoModal.value?.color === 'naranja') return 'bg-warning text-white'
    return 'bg-danger text-white'
  })

  // Agrupa la lista del modal por fecha para mostrarla con encabezados
  const pendientesAgrupados = computed(() => {
    const mapa = {}
    partidosPendientesModal.value.forEach(p => {
      const f = claveFecha(p)
      if (!mapa[f]) mapa[f] = []
      mapa[f].push(p)
    })
    return Object.keys(mapa)
      .sort((a, b) => parsearFecha(a) - parsearFecha(b))
      .map(f => ({ fecha: f, partidos: mapa[f] }))
  })

  const abrirModalPendientes = (tipo) => {
    tipoPendientes.value = tipo
    mostrarModalPendientes.value = true
  }

  // Nombres de arbitros sin match de un partido (para mostrarlos en el modal)
  const arbitrosSinMatchDe = (p) => {
    const nombres = []
    if (esSinMatch(p, 1)) nombres.push(p.arbitro_1)
    if (esSinMatch(p, 2)) nombres.push(p.arbitro_2)
    return nombres
  }

  // Datos ya armados para ModalPendientes (solo se calculan con el modal abierto)
  const gruposModalPendientes = computed(() => {
    if (!mostrarModalPendientes.value) return []
    return pendientesAgrupados.value.map(g => ({
      fecha: g.fecha,
      etiqueta: etiquetaDia(g.fecha),
      items: g.partidos.map(p => ({
        partido: p,
        etiqueta: esModalAvisos.value ? etiquetaPartido(p) : '',
        estado: estadoDesignacion(p),
        sinMatch: tipoPendientes.value === 'sin_match' ? arbitrosSinMatchDe(p) : [],
        avisos: esModalAvisos.value ? gruposAvisosPartido(p) : []
      }))
    }))
  })

  // Salta al partido elegido: cambia a su fecha, limpia filtros, cierra el modal,
  // hace scroll a la fila y la resalta unos segundos.
  let timerResaltado = null
  const irAPartido = (p) => {
    const destino = claveFecha(p)
    if (fechaSeleccionada.value !== destino) fechaSeleccionada.value = destino
    filtroEstado.value = ''
    filtroBusqueda.value = ''
    mostrarModalPendientes.value = false

    const uid = p.id || p._uid
    partidoResaltado.value = uid

    nextTick(() => {
      const fila = document.getElementById('partido-' + uid) || document.getElementById('partido-mob-' + uid)
      if (fila) fila.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })

    clearTimeout(timerResaltado)
    timerResaltado = setTimeout(() => { partidoResaltado.value = '' }, 3000)
  }

  return {
    // datos de la semana
    designaciones, labelSemana, arbitros, camposJuego, cargando, semanaAtras, hayPosteriores,
    iniciar, cargarDesignaciones, cargarAvisos, semanaAnterior, semanaSiguiente,
    // avisos
    avisosMap, totalConflictos, cantidadAvisosPorColor,
    mostrarModalAvisosPartido, textoAvisosPartidoActual, mostrarAvisosPartido,
    // días, filtros y canchas
    fechas, pestanasFechas, fechaSeleccionada, filtroBusqueda, filtroEstado, toggleFiltroEstado, canchas,
    totalADesignar, totalSinMatch, totalSinCancha,
    // guardado
    estadoGuardado, ejecutarGuardado, guardarAhora, marcar, hayCambios,
    // Excel
    mostrarModalCarga, subiendoExcel, archivoExcel, abrirModalCarga, cerrarModalCarga, seleccionarArchivoExcel, confirmarCargaExcel,
    // pendientes
    mostrarModalPendientes, tipoPendientes, partidoResaltado, esModalAvisos, tipoAvisoModal,
    tituloModalPendientes, iconoModalPendientes, colorIconoModalPendientes, gruposModalPendientes,
    abrirModalPendientes, irAPartido
  }
}
