import { computed } from 'vue'
import { normalizarTexto } from '@/utils/texto'

// Grupos (solapas) de las planillas generales: de árbitros y de observaciones, en admin y en coordinadores.
// - arbitros, grupos: refs con las listas que carga cada planilla
// - grupoActivo: la ref del grupo elegido en la barra de herramientas
// - modo:
//   'nombre' (admin): el árbitro pertenece al grupo por nombre y subgrupo; las solapas son todos los grupos
//   'id' (coordinadores): pertenece por id de grupo; las solapas son solo los grupos que tienen árbitros
//                         en la lista (el backend ya la filtró a los grupos del coordinador)
// En los dos modos se suma la solapa "Sin grupo" si hay árbitros sin grupo.

const SIN_GRUPO = { clave: 'singrupo', id: null, nombre: 'Sin grupo', subgrupo: '' }

// Colores de los grupos: se usan en las pestañas de las hojas del Excel
const PALETA_GRUPOS = ['#0d6efd', '#6f42c1', '#d63384', '#fd7e14', '#198754', '#20c997', '#0dcaf0', '#dc3545', '#6610f2', '#795548', '#607d8b', '#9e9d24']
export const colorDeGrupo = (indice) => PALETA_GRUPOS[indice % PALETA_GRUPOS.length]

export const etiquetaGrupo = (g) => {
  if (!g) return ''
  if (g.clave === 'singrupo') return 'Sin grupo'
  return g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre
}

const idGrupoDe = (a) => a.id_grupo ?? a.idGrupo ?? null

export function useGruposPlanilla({ arbitros, grupos, grupoActivo, modo }) {
  // ============ MODO NOMBRE (admin) ============
  const mismoGrupoPorNombre = (a, g) =>
    normalizarTexto(a.nombre_grupo || a.grupo || '') === normalizarTexto(g.nombre) &&
    normalizarTexto(a.subgrupo || '') === normalizarTexto(g.subgrupo || '')

  // ============ MODO ID (coordinadores) ============
  const mismoGrupoPorId = (a, g) => {
    const idGrupoArb = idGrupoDe(a)
    if (idGrupoArb != null && g.id != null) return Number(idGrupoArb) === Number(g.id)
    // Si no hubiera id, por nombre
    return normalizarTexto(a.nombre_grupo || a.grupo || '') === normalizarTexto(g.nombre)
  }

  const perteneceAlGrupo = (a, g) => {
    if (modo === 'id') return g.clave === 'singrupo' ? idGrupoDe(a) == null : mismoGrupoPorId(a, g)
    // Por nombre, "Sin grupo" es el árbitro que no coincide con ningún grupo de la lista
    if (g.clave === 'singrupo') return !grupos.value.some(gr => mismoGrupoPorNombre(a, gr))
    return mismoGrupoPorNombre(a, g)
  }

  const gruposTabs = computed(() => {
    let tabs
    if (modo === 'id') {
      // Un grupo por cada id presente en la lista; el nombre sale de obtenerGrupos
      // y si no está, del propio árbitro
      const presentes = new Map()
      arbitros.value.forEach(a => {
        const idGrupo = idGrupoDe(a)
        if (idGrupo == null || presentes.has(String(idGrupo))) return
        const grupo = grupos.value.find(gr => Number(gr.id) === Number(idGrupo))
        presentes.set(String(idGrupo), {
          id: idGrupo,
          clave: `${idGrupo}`,
          nombre: grupo ? grupo.nombre : (a.grupo || a.nombre_grupo || `Grupo ${idGrupo}`),
          subgrupo: grupo ? (grupo.subgrupo || '') : (a.subgrupo || '')
        })
      })
      tabs = [...presentes.values()]
    } else {
      tabs = grupos.value.map(g => ({ ...g, clave: `${g.id}` }))
    }
    const haySinGrupo = arbitros.value.some(a => perteneceAlGrupo(a, SIN_GRUPO))
    return haySinGrupo ? [...tabs, SIN_GRUPO] : tabs
  })

  const contarArbitros = (g) => arbitros.value.filter(a => perteneceAlGrupo(a, g)).length

  // Selector de grupo de la barra de herramientas
  const elegirGrupo = (clave) => {
    grupoActivo.value = gruposTabs.value.find(g => g.clave === clave) || null
  }

  return { etiquetaGrupo, perteneceAlGrupo, gruposTabs, contarArbitros, elegirGrupo, colorDeGrupo }
}
