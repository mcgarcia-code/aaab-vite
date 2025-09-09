import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useSancionesStore = defineStore('sanciones', () => {
  // --- STATE ---
  const sanciones = ref([])
  const loading = ref(false)

  // --- GETTERS ---
  const sancionesVigentes = computed(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return sanciones.value.filter((sancion) => {
      if (!sancion.desde || !sancion.hasta) return false
      if (!sancion.desde.includes('/') || !sancion.hasta.includes('/')) {
        if (sancion.hasta.toLowerCase() === 'indefinido') {
          const [diaDesde, mesDesde, anioDesde] = sancion.desde.split('/')
          const fechaDesde = new Date(`${anioDesde}-${mesDesde}-${diaDesde}`)
          fechaDesde.setHours(0, 0, 0, 0)
          return hoy >= fechaDesde
        }
        return false
      }

      const [diaDesde, mesDesde, anioDesde] = sancion.desde.split('/')
      const fechaDesde = new Date(`${anioDesde}-${mesDesde}-${diaDesde}`)
      fechaDesde.setHours(0, 0, 0, 0)

      const [diaHasta, mesHasta, anioHasta] = sancion.hasta.split('/')
      const fechaHasta = new Date(`${anioHasta}-${mesHasta}-${diaHasta}`)
      fechaHasta.setHours(0, 0, 0, 0)

      return hoy >= fechaDesde && hoy <= fechaHasta
    })
  })

  // --- ACTIONS ---
  async function fetchSanciones() {
    loading.value = true
    try {
      // TODO: Reemplaza esta URL por la de tu API real.
      const response = await axios.get('URL_DE_TU_API/sanciones')
      sanciones.value = response.data
    } catch (error) {
      console.error('Error al cargar las sanciones:', error)
      // Para desarrollo, puedes cargar datos de ejemplo si falla la API
      // sanciones.value = [{ id: 1, arbitro: 'Ejemplo', ... }]
    } finally {
      loading.value = false
    }
  }

  async function agregarSancion(nuevaSancion) {
    try {
      // TODO: Reemplaza esta URL por la de tu API real.
      await axios.post('URL_DE_TU_API/sanciones', nuevaSancion)

      // Después de guardar en la base de datos, se vuelve a pedir la lista completa
      // para asegurar que los datos en pantalla estén actualizados.
      await fetchSanciones()
    } catch (error) {
      console.error('Error al guardar la sanción:', error)
    }
  }

  return {
    sanciones,
    loading,
    sancionesVigentes,
    agregarSancion,
    fetchSanciones,
  }
})
