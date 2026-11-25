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
        <RouterLink v-if="linkVerTodos" :to="linkVerTodos" class="link-ver-todos">Ver todos</RouterLink>
      </div>

      <div v-if="cargandoEventos" class="placeholder-glow py-2" aria-hidden="true">
        <span class="placeholder col-12 rounded mb-2" style="height: 44px;"></span>
        <span class="placeholder col-12 rounded" style="height: 44px;"></span>
      </div>

      <template v-else>
        <div v-for="ev in proximosEventos" :key="ev.clave" class="evento">
          <div :class="['cal-box', { hoy: ev.esHoy }]">
            <span class="cal-dia">{{ ev.dia }}</span>
            <span class="cal-mes">{{ ev.esHoy ? 'HOY' : ev.mes }}</span>
          </div>
          <div class="flex-grow-1 min-w-0">
            <span class="evento-titulo text-truncate">{{ ev.titulo }}</span>
            <span v-if="ev.hora || ev.lugar" class="evento-detalle text-truncate">
              <template v-if="ev.hora"><i class="bi bi-clock"></i> {{ ev.hora }} hs</template>
              <template v-if="ev.hora && ev.lugar"> · </template>
              <template v-if="ev.lugar"><i class="bi bi-geo-alt"></i> {{ ev.lugar }}</template>
            </span>
            <span class="evento-detalle text-truncate">{{ ev.detalle }}</span>
            <span v-if="ev.pendiente" class="evento-pendiente"><i class="bi bi-hourglass-split me-1"></i>Para aprobar</span>
          </div>
        </div>

        <div v-if="!proximosEventos.length" class="al-dia">
          <i class="bi bi-calendar-x text-secondary"></i>
          <span>{{ errorEventos || 'No hay eventos próximos.' }}</span>
        </div>
      </template>
    </section>

    </div>

    <!-- ============ ACCESOS RÁPIDOS ============ -->
    <AccesosRapidos v-if="accesosDisponibles.length" :disponibles="accesosDisponibles"
                    :predeterminados="accesosPredeterminados" :clave-almacenamiento="claveAccesos" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MESES_CORTOS } from '@/utils/fechas'
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import AccesosRapidos from '@/components/comunes/AccesosRapidos.vue'
import { useModulosAdmin } from '@/composables/useModulosAdmin'

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
const MESES = MESES_CORTOS
const MAX_EVENTOS = 8

const eventos = ref([])
const gruposEvento = ref([])
const cargandoEventos = ref(true)
const errorEventos = ref('')

const aISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Clases del curso de los próximos 7 días (solo con permiso del curso)
const DIAS_CLASES = 7
const clasesCurso = ref([])

const cargarClasesCurso = async (hoy) => {
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + DIAS_CLASES)
  // Si la semana cruza de año, se piden los dos cronogramas
  const anios = [...new Set([hoy.getFullYear(), hasta.getFullYear()])]
  const respuestas = await Promise.all(anios.map(anio =>
    api.get({ entity: 'cronograma_curso_arbitro', action: 'obtenerCronogramaCurso', payload: { anio } })
  ))
  const desdeISO = aISO(hoy)
  const hastaISO = aISO(hasta)
  clasesCurso.value = respuestas
    .flatMap(res => (res?.ok && Array.isArray(res.payload) ? res.payload : []))
    .filter(c => c.fecha >= desdeISO && c.fecha <= hastaISO)
}

const cargarEventos = async () => {
  cargandoEventos.value = true
  errorEventos.value = ''
  const hoy = new Date()
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 30)
  try {
    const [res] = await Promise.all([
      api.get({ entity: 'eventos', action: 'obtenerAgenda', payload: { desde: aISO(hoy), hasta: aISO(hasta) } }),
      tienePermiso('curso')
        ? cargarClasesCurso(hoy).catch(err => console.error('Error al cargar las clases del curso:', err))
        : Promise.resolve()
    ])
    if (!res?.ok) throw new Error()
    eventos.value = res.payload?.eventos || []
    gruposEvento.value = res.payload?.grupos || []
  } catch {
    errorEventos.value = 'No se pudieron cargar los eventos.'
  } finally {
    cargandoEventos.value = false
  }
}

const textoGrupos = (ev) => {
  if (ev.todosLosGrupos) return 'Todos los grupos'
  const nombres = (ev.idsGrupos || [])
    .map(id => gruposEvento.value.find(g => Number(g.id) === Number(id))?.nombre)
    .filter(Boolean)
  if (nombres.length === 0) return 'Sin grupos'
  return nombres.length <= 2 ? nombres.join(', ') : `${nombres.length} grupos`
}

// Eventos (agenda) + clases del curso, ordenados por fecha y hora
const proximosEventos = computed(() => {
  const hoyISO = aISO(new Date())

  const deAgenda = eventos.value.map(ev => ({
    clave: `evento-${ev.id}`,
    fecha: ev.fecha_evento,
    hora: ev.hora || '',
    lugar: ev.descripcion || 'Lugar a confirmar',
    titulo: ev.titulo,
    detalle: `${CATEGORIAS_EVENTO[ev.categoria] || ev.categoria || 'Evento'} · ${textoGrupos(ev)}`,
    pendiente: ev.aprobacion === 'pendiente',
    esClase: false
  }))

  const deCurso = clasesCurso.value.map(c => {
    return {
      clave: `clase-${c.id}`,
      fecha: c.fecha,
      hora: c.hora_inicio || '',
      lugar: c.lugar || (c.modalidad === 'virtual' ? 'Virtual' : 'Lugar a confirmar'),
      titulo: c.titulo || 'Clase del curso',
      detalle: 'Clase del curso',
      pendiente: false,
      esClase: true
    }
  })

  return [...deAgenda, ...deCurso]
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .slice(0, MAX_EVENTOS)
    .map(ev => {
      const [, mes, dia] = String(ev.fecha).split('-')
      return { ...ev, dia, mes: MESES[Number(mes) - 1] || '', esHoy: ev.fecha === hoyISO }
    })
})

// "Ver todos": Gestión de eventos (Secretaría) o el cronograma del curso
const linkVerTodos = computed(() => {
  if (tienePermiso('secretaria')) return '/panel-admin/secretaria/eventos-notificaciones'
  if (tienePermiso('curso')) return '/panel-admin/curso-arbitros/cronograma'
  return null
})

// Accesos rápidos: los primeros 4 módulos que el usuario tiene permitidos
// Accesos rápidos personalizables: los módulos que el usuario tiene permitidos (por defecto, los primeros 4)
const accesosDisponibles = computed(() => gruposModulos.value.flatMap(g => g.items))
const accesosPredeterminados = computed(() => accesosDisponibles.value.slice(0, 4).map(item => item.to))
const claveAccesos = `panelAdmin.accesos.${auth.getUser()?.id ?? 'anonimo'}`

// Cada vez que se vuelve al Inicio se actualizan los pendientes
// Primero los permisos: definen si se piden las clases del curso
onMounted(async () => {
  await cargarPermisos()
  cargarEventos()
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
  color: var(--o-rojo-texto, #b91c1c);
  text-decoration: none;
}
.link-ver-todos:hover { text-decoration: underline; }

.evento {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--o-borde, #e2e8f0);
}
.evento:first-of-type { border-top: 0; }

.cal-box {
  width: 48px;
  min-width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--o-chip, #f1f5f9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.cal-dia { font-size: 1rem; font-weight: 800; color: var(--o-texto, #0f172a); line-height: 1; }
.cal-mes { font-size: 0.7rem; font-weight: 700; color: var(--o-rojo-texto, #b91c1c); margin-top: 2px; }
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
  color: var(--o-texto-medio, #475569);
}

.evento-pendiente {
  display: inline-block;
  margin-top: 3px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--o-ambar-texto, #92400e);
  background: var(--o-ambar-fondo, #fef3c7);
  padding: 2px 8px;
  border-radius: 50rem;
}

/* ============ PENDIENTES ============ */
.tarjeta-pendientes {
  background: var(--o-tarjeta, #fff);
  border-radius: 16px;
  padding: 16px;
  color: var(--o-texto, #0f172a);
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
  border-top: 1px solid var(--o-borde, #e2e8f0);
  color: var(--o-texto, #0f172a);
  text-decoration: none;
}
.pendiente:first-of-type { border-top: 0; }
.pendiente:hover .pendiente-titulo { text-decoration: underline; }

.pendiente-icono {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 12px;
  background: var(--o-rojo-fondo, #fef2f2);
  color: var(--o-rojo-texto, #dc2626);
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
  color: var(--o-texto-medio, #475569);
}

.pendiente-flecha { color: var(--o-texto-suave, #94a3b8); font-size: 0.8rem; }

.al-dia {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0 4px;
  font-size: 0.9rem;
  color: var(--o-texto-medio, #475569);
}
.al-dia .bi { font-size: 1.25rem; color: var(--o-verde-texto, #16a34a); }

</style>
