// Publicar y descargar las designaciones de la semana (CargaPartidos).
// Recibe lo que devuelve useCargaPartidos (partidos, fechas, semana, recarga).
import { ref, computed } from 'vue'
import { api } from '@/api/api'
import { estadoDesignacion, claveFecha } from '@/components/panel-admin/designaciones/carga-partidos/ayudasPartido'

// Estados que se pueden incluir en la descarga PDF / Excel
export const OPCIONES_ESTADO_DESCARGA = [
  { valor: 'a_designar', etiqueta: 'Sin designar' },
  { valor: 'designado', etiqueta: 'Designado' },
  { valor: 'publicado', etiqueta: 'Publicado' }
]

export function usePublicarDesignaciones({ carga, toast }) {
  const { designaciones, fechas, semanaAtras, cargarDesignaciones, cargarAvisos } = carga

  /* ====================================================
     PUBLICAR (PDF PARA LA WEB + PANEL DE ARBITROS)
     Si hay cambios sin guardar, se guardan automáticamente
     antes de publicar. El PDF se genera en el servidor.
     ==================================================== */
  const mostrarModalPublicar = ref(false)
  const publicando = ref(false)

  // Fechas tildadas en el modal de Publicar: solo se publican los partidos de esas fechas
  const fechasSeleccionadas = ref([])

  const toggleFechaSeleccionada = (fecha) => {
    const i = fechasSeleccionadas.value.indexOf(fecha)
    if (i === -1) fechasSeleccionadas.value.push(fecha)
    else fechasSeleccionadas.value.splice(i, 1)
  }

  // Solo cuentan los partidos designados (los a_designar no se publican)
  const cantidadPartidosAPublicar = computed(() =>
    designaciones.value.filter(p =>
      fechasSeleccionadas.value.includes(claveFecha(p)) && estadoDesignacion(p) !== 'a_designar'
    ).length
  )

  const totalADesignarEnSeleccion = computed(() =>
    designaciones.value.filter(p =>
      fechasSeleccionadas.value.includes(claveFecha(p)) && estadoDesignacion(p) === 'a_designar'
    ).length
  )

  const abrirModalPublicar = () => {
    // Arrancamos con todas las fechas tildadas (el usuario puede destildar)
    fechasSeleccionadas.value = fechas.value.map(f => f.fecha)
    mostrarModalPublicar.value = true
  }

  const publicarDesignaciones = async () => {
    if (fechasSeleccionadas.value.length === 0) {
      toast({ titulo: 'Atención', mensaje: 'Tildá al menos una fecha para publicar.', tipo: 'warning' })
      return
    }

    publicando.value = true
    try {
    /*
      const guardado = await ejecutarGuardado()
      if (!guardado) return
  */
      const res = await api.post({
        entity: 'designaciones',
        action: 'publicarDesignaciones',
        payload: {
          fechas: fechasSeleccionadas.value
        }
      })

      if (res.ok) {
        toast({ titulo: 'Éxito', mensaje: res.payload.mensaje || 'Las designaciones se publicaron en la web y en el panel de los árbitros.', tipo: 'success' })
        mostrarModalPublicar.value = false
        // Refrescamos para reflejar el nuevo estado publicado de los partidos
        await cargarDesignaciones()
        cargarAvisos()
      } else {
        throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor al publicar designaciones.')
      }
    } catch (err) {
      console.error('Error al publicar:', err)
      toast({ titulo: 'Error', mensaje: err.message || 'Hubo un problema al publicar las designaciones.', tipo: 'danger' })
    } finally {
      publicando.value = false
    }
  }

  /* ====================================================
     DESCARGAR (PDF / Excel, con los estados tildados)
     ==================================================== */
  const descargandoArchivo = ref(false)

  // Modal para elegir qué estados de designación incluir en la descarga
  const mostrarModalDescarga = ref(false)
  const formatoDescarga = ref('pdf')
  const estadosDescarga = ref(OPCIONES_ESTADO_DESCARGA.map(e => e.valor))

  const toggleEstadoDescarga = (estado) => {
    const i = estadosDescarga.value.indexOf(estado)
    if (i === -1) estadosDescarga.value.push(estado)
    else estadosDescarga.value.splice(i, 1)
  }

  const abrirModalDescarga = (formato) => {
    formatoDescarga.value = formato
    mostrarModalDescarga.value = true
  }

  const descargarDesignaciones = async (formato = 'pdf') => {
    const esExcel = formato === 'excel'
    descargandoArchivo.value = true
    try {
      await api.getFile({
        entity: 'designaciones',
        action: 'descargarDesignaciones',
        payload: {
          semanaAtras: semanaAtras.value,
          estados: estadosDescarga.value,
          ...(esExcel ? { formato: 'excel' } : {})
        }
      }, esExcel ? 'designaciones.xlsx' : 'designaciones.pdf')
    } catch (err) {
      console.error('Error al descargar las designaciones:', err)
      toast({ titulo: 'Error', mensaje: err.message || 'No se pudo descargar el archivo.', tipo: 'danger' })
    } finally {
      descargandoArchivo.value = false
    }
  }

  const confirmarDescarga = async () => {
    if (estadosDescarga.value.length === 0) return
    await descargarDesignaciones(formatoDescarga.value)
    mostrarModalDescarga.value = false
  }

  return {
    // publicar
    mostrarModalPublicar, publicando, fechasSeleccionadas, toggleFechaSeleccionada,
    cantidadPartidosAPublicar, totalADesignarEnSeleccion, abrirModalPublicar, publicarDesignaciones,
    // descargar
    descargandoArchivo, mostrarModalDescarga, formatoDescarga, estadosDescarga,
    toggleEstadoDescarga, abrirModalDescarga, confirmarDescarga
  }
}
