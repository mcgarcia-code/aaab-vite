<template>
  <div class="inicio-admin py-3 animate__animated animate__fadeIn">

    <!-- Pendientes y eventos: lado a lado en escritorio, uno debajo del otro en celular -->
    <div class="fila-resumen">

    <!-- ============ PENDIENTES ============ -->
    <section class="tarjeta-pendientes">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 class="titulo-bloque m-0">Pendientes</h2>
        <span v-if="cargandoPendientes" class="spinner-border spinner-border-sm text-secondary" role="status">
          <span class="visually-hidden">Buscando pendientes</span>
        </span>
      </div>

      <RouterLink v-for="p in pendientes" :key="p.to" :to="p.to" class="pendiente">
        <span class="pendiente-icono"><i :class="['bi', p.icono]"></i></span>
        <span class="flex-grow-1 min-w-0">
          <span class="pendiente-titulo">{{ p.titulo }}</span>
          <span class="pendiente-detalle">{{ p.detalle }}</span>
        </span>
        <i class="bi bi-chevron-right pendiente-flecha"></i>
      </RouterLink>

      <div v-if="!cargandoPendientes && pendientes.length === 0" class="al-dia">
        <i class="bi bi-check2-circle"></i>
        <span>Todo al día: no hay nada pendiente.</span>
      </div>
    </section>

    <!-- ============ PRÓXIMOS EVENTOS ============ -->
    <section class="tarjeta-pendientes">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 class="titulo-bloque m-0">Próximos eventos</h2>
        <RouterLink v-if="tienePermiso('secretaria')" to="/panel-admin/secretaria/eventos-notificaciones" class="link-ver-todos">Ver todos</RouterLink>
      </div>

      <div v-if="cargandoEventos" class="placeholder-glow py-2" aria-hidden="true">
        <span class="placeholder col-12 rounded mb-2" style="height: 44px;"></span>
        <span class="placeholder col-12 rounded" style="height: 44px;"></span>
      </div>

      <template v-else>
        <div v-for="ev in proximosEventos" :key="ev.id" class="evento">
          <div :class="['cal-box', { hoy: ev.esHoy }]">
            <span class="cal-dia">{{ ev.dia }}</span>
            <span class="cal-mes">{{ ev.esHoy ? 'HOY' : ev.mes }}</span>
          </div>
          <div class="flex-grow-1 min-w-0">
            <span class="evento-titulo text-truncate">{{ ev.titulo }}</span>
            <span class="evento-detalle text-truncate">{{ ev.categoria }} · {{ ev.grupos }}</span>
            <span v-if="ev.pendiente" class="evento-pendiente"><i class="bi bi-hourglass-split me-1"></i>Para aprobar</span>
          </div>
        </div>

        <div v-if="!proximosEventos.length" class="al-dia">
          <i class="bi bi-calendar-x text-secondary"></i>
          <span>{{ errorEventos || 'No hay eventos en los próximos 30 días.' }}</span>
        </div>
      </template>
    </section>

    </div>

    <!-- ============ ACCESOS RÁPIDOS ============ -->
    <section v-if="accesosRapidos.length">
      <h2 class="categoria-label">Accesos rápidos</h2>
      <div class="accesos">
        <RouterLink v-for="acceso in accesosRapidos" :key="acceso.to" :to="acceso.to" class="acceso-rapido">
          <i :class="acceso.icon"></i>
          <span>{{ acceso.title }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- ============ MÓDULOS (celular y tablet; en escritorio están en el menú lateral) ============ -->
    <section class="d-lg-none d-flex flex-column gap-3">
      <h2 class="titulo-modulos m-0">Módulos</h2>

      <label class="buscador">
        <i class="bi bi-search"></i>
        <input v-model="busqueda" type="search" placeholder="Buscar un módulo… (ej. licencias)" aria-label="Buscar un módulo">
        <button v-if="busqueda" type="button" class="buscador-limpiar" @click="busqueda = ''" aria-label="Borrar búsqueda">
          <i class="bi bi-x-lg"></i>
        </button>
      </label>

      <ListaModulos v-if="gruposFiltrados.length" :grupos="gruposFiltrados" en-columnas />
      <p v-else class="sin-resultados">No hay módulos con “{{ busqueda }}”.</p>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { normalizarTexto } from '@/utils/texto'
import { useModulosAdmin } from '@/composables/useModulosAdmin'
import ListaModulos from '@/components/comunes/ListaModulos.vue'

useHead({
  title: 'Panel de Gestión | AAAB',
})

const { cargarPermisos, tienePermiso, gruposModulos, pendientes, cargarPendientes, cargandoPendientes } = useModulosAdmin()

// ============ PRÓXIMOS EVENTOS (los próximos 30 días) ============
const CATEGORIAS_EVENTO = {
  reunion: 'Reunión',
  urgente: 'Urgente',
  recordatorio: 'Recordatorio',
  recuperatorio: 'Recuperatorio',
  asamblea: 'Asamblea'
}
const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const MAX_EVENTOS = 6

const eventos = ref([])
const gruposEvento = ref([])
const cargandoEventos = ref(true)
const errorEventos = ref('')

const aISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const cargarEventos = async () => {
  cargandoEventos.value = true
  errorEventos.value = ''
  const hoy = new Date()
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 30)
  try {
    const res = await api.get({ entity: 'eventos', action: 'obtenerAgenda', payload: { desde: aISO(hoy), hasta: aISO(hasta) } })
    if (!res?.ok) throw new Error()
    eventos.value = res.payload?.eventos || []
    gruposEvento.value = res.payload?.grupos || []
  } catch {
    errorEventos.value = 'No se pudieron cargar los eventos.'
  } finally {
    cargandoEventos.value = false
  }
}

const proximosEventos = computed(() => {
  const hoyISO = aISO(new Date())
  const nombreGrupo = (id) => gruposEvento.value.find(g => Number(g.id) === Number(id))?.nombre
  return eventos.value.slice(0, MAX_EVENTOS).map(ev => {
    const [, mes, dia] = String(ev.fecha_evento).split('-')
    const nombres = (ev.idsGrupos || []).map(nombreGrupo).filter(Boolean)
    let grupos = 'Todos los grupos'
    if (!ev.todosLosGrupos) {
      grupos = nombres.length === 0 ? 'Sin grupos' : nombres.length <= 2 ? nombres.join(', ') : `${nombres.length} grupos`
    }
    return {
      id: ev.id,
      titulo: ev.titulo,
      dia,
      mes: MESES[Number(mes) - 1] || '',
      esHoy: ev.fecha_evento === hoyISO,
      categoria: CATEGORIAS_EVENTO[ev.categoria] || ev.categoria || 'Evento',
      grupos,
      pendiente: ev.aprobacion === 'pendiente'
    }
  })
})

// Accesos rápidos: los primeros 4 módulos que el usuario tiene permitidos
const accesosRapidos = computed(() => gruposModulos.value.flatMap(g => g.items).slice(0, 4))

// ============ BÚSQUEDA (sin importar tildes ni mayúsculas) ============
const busqueda = ref('')

const gruposFiltrados = computed(() => {
  const texto = normalizarTexto(busqueda.value.trim())
  if (!texto) return gruposModulos.value
  return gruposModulos.value
    .map(grupo => ({
      ...grupo,
      items: grupo.items.filter(item =>
        normalizarTexto(item.title).includes(texto) ||
        normalizarTexto(item.desc).includes(texto) ||
        normalizarTexto(grupo.categoria).includes(texto)
      )
    }))
    .filter(grupo => grupo.items.length > 0)
})

// Cada vez que se vuelve al Inicio se actualizan los pendientes
onMounted(async () => {
  cargarEventos()
  await cargarPermisos()
  cargarPendientes()
})
</script>

<style scoped>
.inicio-admin {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.min-w-0 { min-width: 0; }

/* ============ PENDIENTES + EVENTOS ============ */
.fila-resumen {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}
@media (min-width: 992px) {
  .fila-resumen { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.link-ver-todos {
  font-size: 0.85rem;
  font-weight: 700;
  color: #b91c1c;
  text-decoration: none;
}
.link-ver-todos:hover { text-decoration: underline; }

.evento {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid #e2e8f0;
}
.evento:first-of-type { border-top: 0; }

.cal-box {
  width: 46px;
  min-width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.cal-dia { font-size: 1rem; font-weight: 800; color: #0f172a; line-height: 1; }
.cal-mes { font-size: 0.7rem; font-weight: 700; color: #b91c1c; margin-top: 2px; }
.cal-box.hoy { background: #dc2626; }
.cal-box.hoy .cal-dia, .cal-box.hoy .cal-mes { color: #fff; }

.evento-titulo {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
}

.evento-detalle {
  display: block;
  font-size: 0.8rem;
  color: #475569;
}

.evento-pendiente {
  display: inline-block;
  margin-top: 3px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #92400e;
  background: #fef3c7;
  padding: 2px 8px;
  border-radius: 999px;
}

/* ============ PENDIENTES ============ */
.tarjeta-pendientes {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  color: #0f172a;
}

.titulo-bloque {
  font-size: 1rem;
  font-weight: 800;
}

.pendiente {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #e2e8f0;
  color: #0f172a;
  text-decoration: none;
}
.pendiente:first-of-type { border-top: 0; }
.pendiente:hover .pendiente-titulo { text-decoration: underline; }

.pendiente-icono {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 12px;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.pendiente-titulo {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
}

.pendiente-detalle {
  display: block;
  font-size: 0.8rem;
  color: #475569;
}

.pendiente-flecha { color: #94a3b8; font-size: 0.8rem; }

.al-dia {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0 4px;
  font-size: 0.9rem;
  color: #475569;
}
.al-dia .bi { font-size: 1.2rem; color: #16a34a; }

/* ============ ACCESOS RÁPIDOS ============ */
.categoria-label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 10px;
}

.accesos {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.acceso-rapido {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 84px;
  padding: 10px 4px;
  border-radius: 16px;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  line-height: 1.2;
  overflow-wrap: anywhere;
  hyphens: auto;
  transition: background 0.2s;
}
.acceso-rapido i { font-size: 1.35rem; color: #f87171; }
.acceso-rapido:hover { background: #334155; color: #fff; }

/* Escritorio: accesos horizontales (ícono + texto) a todo el ancho */
@media (min-width: 992px) {
  .accesos { gap: 12px; }
  .acceso-rapido {
    flex-direction: row;
    justify-content: flex-start;
    gap: 12px;
    min-height: 64px;
    padding: 0 18px;
    font-size: 0.95rem;
    text-align: left;
  }
}

/* ============ MÓDULOS (celular) ============ */
.titulo-modulos {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
}

.buscador {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 14px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  color: #94a3b8;
}
.buscador:focus-within { border-color: #94a3b8; }

.buscador input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: none;
  color: #fff;
  font-size: 1rem;
}
.buscador input::placeholder { color: #94a3b8; }
.buscador input::-webkit-search-cancel-button { display: none; }

.buscador-limpiar {
  border: 0;
  background: none;
  color: #94a3b8;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sin-resultados {
  margin: 0;
  padding: 24px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

.animate__animated { animation-duration: 0.4s; }
</style>
