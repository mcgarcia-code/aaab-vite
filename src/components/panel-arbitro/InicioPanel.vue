<template>
  <div class="inicio-grid py-3 animate__animated animate__fadeIn">

    <!-- ============ PROXIMA DESIGNACION ============ -->
    <section class="area-hero">
      <!-- Partidos suspendidos: aviso arriba de la próxima designación -->
      <RouterLink v-for="s in partidosSuspendidos" :key="'susp-' + s.id" to="/panel-arbitro/designaciones" class="aviso-suspendido mb-3" role="status">
        <i class="bi bi-slash-circle" aria-hidden="true"></i>
        <span class="min-w-0">
          <span class="d-block fw-bold">Partido suspendido</span>
          <span class="d-block text-truncate">{{ s.partido }}</span>
          <span class="d-block small">{{ s.fechaTexto }}<template v-if="s.horario"> · {{ s.horario }}</template></span>
        </span>
        <i class="bi bi-chevron-right ms-auto" aria-hidden="true"></i>
      </RouterLink>

      <div v-if="cargandoDesignacion" class="tarjeta-hero placeholder-glow" aria-hidden="true">
        <span class="placeholder col-5 rounded mb-3"></span>
        <div class="d-flex gap-3 align-items-center mb-3">
          <span class="placeholder rounded-3" style="width: 64px; height: 76px;"></span>
          <div class="flex-grow-1">
            <span class="placeholder col-10 rounded mb-2"></span>
            <span class="placeholder col-6 rounded"></span>
          </div>
        </div>
        <span class="placeholder col-12 rounded-3" style="height: 46px;"></span>
      </div>

      <div v-else-if="proximaDesignacion" class="tarjeta-hero">
        <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
          <span class="hero-label">Próxima designación</span>
          <span v-if="textoRelativoDesignacion" class="hero-pill">{{ textoRelativoDesignacion }}</span>
        </div>

        <div class="d-flex gap-3 align-items-center mb-3">
          <div class="bloque-fecha">
            <template v-if="bloqueFechaDesignacion">
              <span class="bloque-dia">{{ bloqueFechaDesignacion.diaSemana }}</span>
              <span class="bloque-numero">{{ bloqueFechaDesignacion.numero }}</span>
              <span class="bloque-mes">{{ bloqueFechaDesignacion.mes }}</span>
            </template>
            <i v-else class="bi bi-calendar4-week fs-3"></i>
          </div>

          <div class="d-flex flex-column gap-1 min-w-0">
            <span class="hero-partido">{{ partidoProximaDesignacion }}</span>
            <span v-if="proximaDesignacion.horario" class="hero-dato">
              <i class="bi bi-clock"></i>{{ String(proximaDesignacion.horario).slice(0, 5) }} hs
            </span>
            <span v-if="proximaDesignacion.cancha" class="hero-dato flex-wrap">
              <i class="bi bi-geo-alt"></i><span class="text-break">{{ proximaDesignacion.cancha }}</span>
              <a v-if="linkMapaCancha(proximaDesignacion)"
                 :href="linkMapaCancha(proximaDesignacion)"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="link-mapa">Ver mapa</a>
            </span>
            <span class="d-flex flex-wrap gap-1">
              <span v-if="proximaDesignacion.funcion" class="hero-funcion">
                <i class="bi bi-person-fill me-1"></i>{{ textoFuncion(proximaDesignacion.funcion) }}
              </span>
              <span v-if="proximaDesignacion.categoria_division" class="hero-categoria">{{ proximaDesignacion.categoria_division }}</span>
            </span>
          </div>
        </div>

        <RouterLink to="/panel-arbitro/designaciones" class="btn btn-danger w-100 rounded-3 fw-bold py-2 d-flex align-items-center justify-content-center gap-2">
          Ver detalle <i class="bi bi-chevron-right"></i>
        </RouterLink>

        <!-- Celular: solo el aviso de cuántas hay -->
        <RouterLink v-if="cantidadOtrasEstaSemana > 0" to="/panel-arbitro/designaciones" class="otras-designaciones d-lg-none">
          +{{ cantidadOtrasEstaSemana }} {{ cantidadOtrasEstaSemana === 1 ? 'designación más' : 'designaciones más' }} en los próximos 7 días
        </RouterLink>

        <!-- Escritorio: las siguientes designaciones, listadas -->
        <div v-if="siguientesDesignaciones.length" class="siguientes d-none d-lg-block">
          <RouterLink v-for="p in siguientesDesignaciones" :key="p.id" to="/panel-arbitro/designaciones" class="siguiente">
            <span class="siguiente-fecha">{{ p.fechaTexto }}</span>
            <span class="siguiente-partido text-truncate">{{ p.partido }}</span>
            <span class="siguiente-dato">{{ p.detalle }}</span>
            <i class="bi bi-chevron-right"></i>
          </RouterLink>
        </div>
      </div>

      <div v-else class="tarjeta-hero d-flex align-items-center gap-3">
        <div class="bloque-fecha bloque-fecha-vacio">
          <i class="bi bi-calendar-x fs-3"></i>
        </div>
        <div class="flex-grow-1">
          <span class="hero-label d-block mb-1">Próxima designación</span>
          <span class="hero-dato d-block">No tenés designaciones próximas.</span>
          <RouterLink to="/panel-arbitro/designaciones" class="link-hero">Ver designaciones</RouterLink>
        </div>
      </div>
    </section>

    <!-- ============ ACCESOS RAPIDOS ============ -->
    <section class="area-rapidos">
      <AccesosRapidos :disponibles="accesosDisponibles" :predeterminados="accesosPredeterminados" :clave-almacenamiento="claveAccesos" />
    </section>

    <!-- ============ AVISOS Y EVENTOS ============ -->
    <aside class="area-avisos">
      <div class="tarjeta-avisos">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="titulo-avisos m-0">Avisos y eventos</h2>
          <div v-if="cargando" class="spinner-border spinner-border-sm text-secondary" role="status">
            <span class="visually-hidden">Cargando avisos</span>
          </div>
        </div>

        <div class="tabs-avisos" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.clave"
            type="button"
            role="tab"
            :aria-selected="tabActiva === tab.clave"
            @click="tabActiva = tab.clave"
            class="tab-btn"
            :class="{ activa: tabActiva === tab.clave }"
          >
            <span class="tab-texto">{{ tab.etiqueta }}</span>
            <span v-if="tab.cantidad > 0" class="tab-badge">{{ tab.cantidad }}</span>
          </button>
        </div>

        <!-- Celular: sin scroll propio (el dedo siempre desliza la página); se ven los primeros
             LIMITE_AVISOS y el resto con "Ver todos". Escritorio: scroll por dentro, como siempre -->
        <div class="avisos-scroll">

          <!-- REUNIONES -->
          <div v-show="tabActiva === 'reuniones'">
            <div v-if="proximasFechas.length > 0" :class="{ 'lista-recortada': !expandidos.includes('reuniones') }">
              <div class="evento" v-for="ev in proximasFechas" :key="ev.id">
                <div class="cal-box">
                  <span class="day">{{ ev.fecha_evento.split('-')[2] }}</span>
                  <span class="month">{{ obtenerMesCorta(ev.fecha_evento) }}</span>
                </div>
                <div class="event-info">
                  <strong :class="{ 'text-danger': ev.categoria === 'urgente' }">{{ ev.titulo }}</strong>
                  <p class="mb-0"><template v-if="ev.hora_evento">{{ String(ev.hora_evento).slice(0, 5) }} hs · </template>{{ ev.descripcion || 'Lugar a confirmar' }}</p>
                  <span v-if="ev.grupos_coordinados" class="badge-coordina mt-1">
                    <i class="bi bi-person-badge me-1"></i>Coordinás · Grupo {{ ev.grupos_coordinados }}
                  </span>
                </div>
              </div>
            </div>
            <p v-else class="empty-msg">No hay eventos próximos.</p>
            <BotonVerTodos :cantidad="proximasFechas.length" :expandido="expandidos.includes('reuniones')" @alternar="alternarExpandido('reuniones')" />
          </div>

          <!-- CUMPLEAÑOS -->
          <div v-show="tabActiva === 'cumpleanos'">
            <div v-if="avisos.cumpleanos && avisos.cumpleanos.length > 0" :class="{ 'lista-recortada': !expandidos.includes('cumpleanos') }">
              <div v-for="cumple in avisos.cumpleanos" :key="cumple.nombre + cumple.apellido" class="evento">
                <div :class="['cal-box', esHoy(cumple.fecha_nacimiento) ? 'today-bg' : '']">
                  <span class="day">{{ cumple.fecha_nacimiento.split('/')[0] }}</span>
                  <span class="month">{{ esHoy(cumple.fecha_nacimiento) ? 'HOY' : obtenerMesNombre(cumple.fecha_nacimiento.split('/')[1]) }}</span>
                </div>
                <div class="event-info">
                  <strong>{{ cumple.nombre }} {{ cumple.apellido }}</strong>
                  <p class="mb-0">{{ esHoy(cumple.fecha_nacimiento) ? '¡Cumple años hoy!' : textoRelativoCumple(cumple.fecha_nacimiento) }}</p>
                </div>
              </div>
            </div>
            <p v-else class="empty-msg">Sin cumpleaños cercanos.</p>
            <BotonVerTodos :cantidad="(avisos.cumpleanos || []).length" :expandido="expandidos.includes('cumpleanos')" @alternar="alternarExpandido('cumpleanos')" />
          </div>

          <!-- RECORDATORIOS -->
          <div v-show="tabActiva === 'recordatorios'">
            <div v-if="avisos.recordatorio && avisos.recordatorio.length > 0" :class="{ 'lista-recortada': !expandidos.includes('recordatorios') }">
              <div v-for="rec in avisos.recordatorio" :key="rec.id" class="reminder-pill">
                <i class="bi bi-info-circle-fill me-2"></i>
                <span class="texto-recordatorio">{{ textoPlano(rec.descripcion) }}</span>
              </div>
            </div>
            <p v-else class="empty-msg">No hay recordatorios.</p>
            <BotonVerTodos :cantidad="(avisos.recordatorio || []).length" :expandido="expandidos.includes('recordatorios')" @alternar="alternarExpandido('recordatorios')" />
          </div>

        </div>
      </div>
    </aside>


  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { fechaATimestamp } from '@/utils/fechas'
import { useHead } from '@unhead/vue'
import { api } from '@/api/api'
import { textoPlano } from '@/utils/texto'
import { auth } from '@/api/auth'
import AccesosRapidos from '@/components/comunes/AccesosRapidos.vue'
import BotonVerTodos from '@/components/comunes/BotonVerTodos.vue'
import { useModulosArbitro } from '@/composables/useModulosArbitro'

useHead({ title: 'Panel de Inicio | AAAB' })

// Accesos rápidos (los módulos están en la pestaña Menú y en el menú lateral)
const { gruposModulos, accesosRapidos } = useModulosArbitro()

// Accesos rápidos personalizables: todos los módulos internos + datos y credencial
const accesosDisponibles = computed(() => [
  ...gruposModulos.value.flatMap(g => g.items).filter(item => item.to),
  { to: '/panel-arbitro/datos', title: 'Datos personales', icon: 'bi bi-person-lines-fill' },
  { to: '/panel-arbitro/credencial', title: 'Credencial digital', icon: 'bi bi-person-badge' }
])
const accesosPredeterminados = accesosRapidos.map(a => a.to)
const claveAccesos = `panelArbitro.accesos.${auth.getUser()?.id ?? 'anonimo'}`

// ====================================================
// AVISOS Y TABS
// ====================================================
const avisos = ref({ reunion: [], urgente: [], cumpleanos: [], recordatorio: [], recuperatorio: [], asamblea: [] })
const cargando = ref(true)

const tabActiva = ref('reuniones')

// Pestañas desplegadas con "Ver todos" (solo celular)
const expandidos = ref([])
const alternarExpandido = (clave) => {
  expandidos.value = expandidos.value.includes(clave)
    ? expandidos.value.filter(c => c !== clave)
    : [...expandidos.value, clave]
}

const proximasFechas = computed(() => {
  const combinados = [...(avisos.value.reunion || []), ...(avisos.value.urgente || []), ...(avisos.value.recuperatorio || []), ...(avisos.value.asamblea || [])]
  return combinados.sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento))
})

const tabs = computed(() => [
  { clave: 'reuniones', etiqueta: 'Reuniones', cantidad: proximasFechas.value.length },
  { clave: 'cumpleanos', etiqueta: 'Cumples', cantidad: (avisos.value.cumpleanos || []).length },
  { clave: 'recordatorios', etiqueta: 'Recordatorios', cantidad: (avisos.value.recordatorio || []).length }
])

const cargarAvisos = async () => {
  try {
    const res = await api.get({ entity: 'eventos', action: 'obtenerDashboardAvisos' })
    if (res.ok || res.success) {
      avisos.value = res.payload
      tabActiva.value = elegirTabInicial()
    }
  } catch (e) { console.error(e) } finally { cargando.value = false }
}

// Si alguien cumple hoy se abre Cumples; si no, la primera pestaña con contenido
const elegirTabInicial = () => {
  const cumples = avisos.value.cumpleanos || []
  if (cumples.some(c => esHoy(c.fecha_nacimiento))) return 'cumpleanos'
  const conContenido = tabs.value.find(t => t.cantidad > 0)
  return conContenido ? conContenido.clave : 'reuniones'
}

// ====================================================
// PROXIMA DESIGNACION
// ====================================================
const designacionesFuturas = ref([])
const esSuspendido = (p) => p.suspendido === true || Number(p.suspendido) === 1
// Los partidos suspendidos se avisan aparte; la próxima designación es la próxima que se juega
const designacionesActivas = computed(() => designacionesFuturas.value.filter(p => !esSuspendido(p)))
const proximaDesignacion = computed(() => designacionesActivas.value[0] || null)

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const partidosSuspendidos = computed(() => designacionesFuturas.value.filter(esSuspendido).map(p => {
  const t = fechaATimestamp(fechaLimpiaDesignacion(p.fecha))
  const d = t ? new Date(t) : null
  const local = p.local || ''
  const visitante = p.visitante || ''
  return {
    id: p.id,
    partido: (local && visitante) ? `${local} vs ${visitante}` : (local || visitante || 'Partido'),
    fechaTexto: d ? `${DIAS_CORTOS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}` : 'Fecha a confirmar',
    horario: p.horario ? `${String(p.horario).slice(0, 5)} hs` : ''
  }
}))
const cargandoDesignacion = ref(true)

const esRechazada = (p) => p.rechazada === true || Number(p.rechazada) === 1

const FUNCIONES = { arbitro: 'Árbitro', delegado: 'Delegado técnico' }

const textoFuncion = (funcion) => {
  if (!funcion) return ''
  const clave = String(funcion).toLowerCase()
  return FUNCIONES[clave] || clave.charAt(0).toUpperCase() + clave.slice(1)
}

// Mismo armado que en Mis Designaciones
const linkMapaCancha = (p) => {
  const direccion = [p.cj_domicilio, p.cj_localidad].filter(Boolean).join(', ').trim()
  return direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}` : null
}

const fechaLimpiaDesignacion = (fecha) => {
  const f = String(fecha || '').trim().slice(0, 10)
  return (!f || f.startsWith('0000')) ? '' : f
}

const cargarProximaDesignacion = async () => {
  try {
    const res = await api.get({ entity: 'designaciones', action: 'obtenerDesignacionesArbitro' })
    if ((res.ok || res.success) && res.payload) {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      designacionesFuturas.value = res.payload
        .filter(p => {
          if (esRechazada(p)) return false
          const t = fechaATimestamp(fechaLimpiaDesignacion(p.fecha))
          return !t || t >= hoy.getTime()
        })
        .sort((a, b) => {
          const diff = fechaATimestamp(fechaLimpiaDesignacion(a.fecha)) - fechaATimestamp(fechaLimpiaDesignacion(b.fecha))
          if (diff !== 0) return diff
          return String(a.horario || '').localeCompare(String(b.horario || ''))
        })
    }
  } catch (e) {
    console.error(e)
  } finally {
    cargandoDesignacion.value = false
  }
}

const partidoProximaDesignacion = computed(() => {
  const p = proximaDesignacion.value
  if (!p) return ''
  const local = p.local || ''
  const visitante = p.visitante || ''
  return (local && visitante) ? `${local} vs ${visitante}` : (local || visitante || 'Partido a confirmar')
})

const tiempoProximaDesignacion = computed(() => {
  const p = proximaDesignacion.value
  if (!p) return 0
  return fechaATimestamp(fechaLimpiaDesignacion(p.fecha))
})

const bloqueFechaDesignacion = computed(() => {
  const t = tiempoProximaDesignacion.value
  if (!t) return null
  const d = new Date(t)
  const dias = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  return {
    diaSemana: dias[d.getDay()],
    numero: String(d.getDate()).padStart(2, '0'),
    mes: meses[d.getMonth()]
  }
})

const textoRelativoDesignacion = computed(() => {
  const t = tiempoProximaDesignacion.value
  if (!t) return ''
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const dias = Math.round((t - hoy.getTime()) / 86400000)
  if (dias <= 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  return `En ${dias} días`
})

// Otras designaciones (además de la próxima) en los próximos 7 días
const cantidadOtrasEstaSemana = computed(() => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const limite = hoy.getTime() + 7 * 86400000
  return designacionesActivas.value.slice(1).filter(p => {
    const t = fechaATimestamp(fechaLimpiaDesignacion(p.fecha))
    return t && t < limite
  }).length
})

// Escritorio: las 2 designaciones que siguen a la próxima
const siguientesDesignaciones = computed(() => {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return designacionesActivas.value.slice(1, 3).map(p => {
    const t = fechaATimestamp(fechaLimpiaDesignacion(p.fecha))
    const d = t ? new Date(t) : null
    const local = p.local || ''
    const visitante = p.visitante || ''
    return {
      id: p.id,
      fechaTexto: d ? `${dias[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}` : 'A confirmar',
      partido: (local && visitante) ? `${local} vs ${visitante}` : (local || visitante || 'Partido a confirmar'),
      detalle: [p.horario ? String(p.horario).slice(0, 5) : '', textoFuncion(p.funcion)].filter(Boolean).join(' · ')
    }
  })
})

// ====================================================
// HELPERS DE FECHA
// ====================================================

// "dd/mm" del cumpleaños → texto relativo para los que no son hoy
const textoRelativoCumple = (diaMes) => {
  const [dia, mes] = String(diaMes || '').split('/').map(Number)
  if (!dia || !mes) return ''
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fecha = new Date(hoy.getFullYear(), mes - 1, dia)
  let dias = Math.round((fecha - hoy) / 86400000)
  // Si ya pasó hace más de una semana, el próximo es el año que viene
  if (dias < -7) dias = Math.round((new Date(hoy.getFullYear() + 1, mes - 1, dia) - hoy) / 86400000)
  if (dias === 1) return 'Mañana'
  if (dias === -1) return 'Fue ayer'
  if (dias < 0) return `Fue hace ${-dias} días`
  return `En ${dias} días`
}
const obtenerMesNombre = (n) => {
  const meses = ['', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  return meses[parseInt(n, 10)]
}

const obtenerMesCorta = (f) => {
  const date = new Date(f + 'T00:00:00')
  return date.toLocaleString('es-AR', { month: 'short' }).replace('.', '').toUpperCase()
}

const esHoy = (diaMes) => {
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
  return diaMes === hoy
}

onMounted(() => {
  cargarAvisos()
  cargarProximaDesignacion()
})
</script>

<style scoped>
/* ============ LAYOUT (mobile first) ============ */
/* Celular: designación → accesos → avisos (los módulos están en la pestaña Menú) */
.inicio-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "hero"
    "rapidos"
    "avisos";
  gap: 24px;
}
.area-hero { grid-area: hero; }
.area-rapidos { grid-area: rapidos; }
.area-avisos { grid-area: avisos; }

/* Escritorio (con menú lateral): designación y avisos lado a lado,
   los accesos rápidos debajo a todo el ancho. Los módulos van en el menú lateral */
@media (min-width: 992px) {
  .inicio-grid {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    grid-template-areas:
      "hero avisos"
      "rapidos rapidos";
  }
  /* La tarjeta de avisos toma la altura de la designación (no flota)
     y si tiene muchos eventos, scrollea por dentro */
  .area-avisos { position: relative; min-height: 320px; }
  .area-avisos .tarjeta-avisos {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
  }
  .area-avisos .avisos-scroll {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }
  .avisos-scroll::-webkit-scrollbar { width: 5px; }
  .avisos-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 12px; }
}

/* ============ PROXIMA DESIGNACION ============ */
.tarjeta-hero {
  background: var(--o-tarjeta, #fff);
  border-radius: 16px;
  padding: 16px;
  color: var(--o-texto, #0f172a);
}

.hero-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--o-texto-medio, #475569);
}

.hero-pill {
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--o-ambar-fondo, #fef3c7);
  color: var(--o-ambar-texto, #92400e);
  padding: 4px 10px;
  border-radius: 50rem;
  white-space: nowrap;
}

.bloque-fecha {
  width: 64px;
  min-width: 64px;
  height: 76px;
  border-radius: 16px;
  background: #0f172a;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.bloque-fecha-vacio { background: var(--o-chip, #f1f5f9); color: var(--o-texto-suave, #64748b); }
.bloque-dia { font-size: 0.75rem; font-weight: 600; color: var(--o-texto-suave, #94a3b8); }
.bloque-numero { font-size: 1.75rem; font-weight: 800; line-height: 1.1; }
.bloque-mes { font-size: 0.75rem; font-weight: 700; color: #f87171; }

.min-w-0 { min-width: 0; }

.hero-partido {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}

.hero-dato {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--o-texto-medio, #475569);
}

.hero-categoria {
  align-self: flex-start;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--o-chip, #f1f5f9);
  color: var(--o-texto-medio, #334155);
  padding: 2px 8px;
  border-radius: 8px;
}

.hero-funcion {
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--o-rojo-fondo, #fef2f2);
  color: var(--o-rojo-texto, #b91c1c);
  padding: 2px 8px;
  border-radius: 8px;
}

.link-mapa {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--o-rojo-texto, #b91c1c);
  text-decoration: none;
  white-space: nowrap;
}
.link-mapa::before { content: '·'; color: var(--o-texto-suave, #94a3b8); margin-right: 6px; }
.link-mapa:hover { text-decoration: underline; }

.otras-designaciones {
  display: block;
  margin-top: 10px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--o-texto-medio, #475569);
  text-decoration: none;
}
.otras-designaciones:hover { color: var(--o-texto, #0f172a); text-decoration: underline; }

.link-hero {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--o-rojo-texto, #b91c1c);
  text-decoration: none;
}
.link-hero:hover { text-decoration: underline; }

/* ============ SIGUIENTES DESIGNACIONES (escritorio) ============ */
.siguientes { margin-top: 14px; }
.siguiente {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 2px;
  border-top: 1px solid var(--o-borde, #e2e8f0);
  color: var(--o-texto, #0f172a);
  text-decoration: none;
}
.siguiente:hover { background: var(--o-superficie, #f8fafc); }
.siguiente-fecha { width: 88px; font-size: 0.8rem; font-weight: 700; color: var(--o-texto-medio, #475569); flex-shrink: 0; }
.siguiente-partido { flex: 1; min-width: 0; font-size: 0.85rem; font-weight: 600; }
.siguiente-dato { font-size: 0.8rem; color: var(--o-texto-medio, #475569); white-space: nowrap; }
.siguiente .bi { color: var(--o-texto-suave, #94a3b8); font-size: 0.75rem; }

/* ============ AVISOS ============ */
.tarjeta-avisos {
  background: var(--o-tarjeta, #fff);
  border-radius: 16px;
  padding: 16px;
  color: var(--o-texto, #0f172a);
}

.titulo-avisos {
  font-size: 1rem;
  font-weight: 800;
}

/* Cada pestaña toma el ancho de su texto ("Recordatorios" es más larga que "Cumples"):
   con tercios fijos, en celular el texto se desbordaba y se pisaba con la pestaña de al lado */
.tabs-avisos {
  display: flex;
  gap: 4px;
  background: var(--o-chip, #f1f5f9);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 4px;
}

.tab-btn {
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  border: none;
  background: transparent;
  min-height: 40px;
  padding: 6px 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--o-texto-medio, #475569);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tab-btn:hover { color: var(--o-texto, #0f172a); }
.tab-btn:focus-visible { outline: 2px solid var(--o-texto, #0f172a); outline-offset: 1px; }
.tab-btn.activa {
  background: var(--o-tarjeta, #fff);
  color: var(--o-texto, #0f172a);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
}

/* Si en un celular muy angosto igual no entra, el texto se corta con "…" en vez de pisarse */
.tab-texto {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-badge {
  flex-shrink: 0;
  background-color: var(--o-chip, #e2e8f0);
  color: var(--o-texto-medio, #334155);
  padding: 1px 6px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 800;
}
.tab-btn.activa .tab-badge { background: #0f172a; color: #fff; }

/* Celular: texto + número no entran en el ancho, así que el número pasa a un globito
   en la esquina de la pestaña y los tres textos se leen completos (probado a 320px) */
.tab-btn { position: relative; }
@media (max-width: 575.98px) {
  .tabs-avisos { padding-top: 6px; }
  .tab-btn { padding: 6px 4px; }
  .tab-badge {
    position: absolute;
    top: -5px;
    right: -2px;
    z-index: 1;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    line-height: 1;
    box-shadow: 0 0 0 2px var(--o-chip, #f1f5f9);
  }
}

/* ============ EVENTOS ============ */
.evento {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid var(--o-borde, #e2e8f0);
}
.evento:first-child { border-top: none; }

.cal-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--o-chip, #f1f5f9);
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
}
.cal-box .day { font-weight: 800; font-size: 1rem; line-height: 1; color: var(--o-texto, #0f172a); }
.cal-box .month { font-size: 0.7rem; font-weight: 700; color: var(--o-rojo-texto, #b91c1c); margin-top: 2px; }
.today-bg { background: #dc2626; }
.today-bg .day, .today-bg .month { color: #fff; }

.event-info { flex: 1; min-width: 0; }
.event-info strong {
  font-size: 0.85rem;
  color: var(--o-texto, #0f172a);
  display: block;
  line-height: 1.25;
}
.event-info p {
  font-size: 0.8rem;
  color: var(--o-texto-medio, #475569);
  margin: 2px 0 0;
}

.badge-coordina {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--o-chip, #f1f5f9);
  color: var(--o-texto-medio, #334155);
  padding: 2px 8px;
  border-radius: 50rem;
}

.texto-recordatorio { white-space: pre-line; }

/* ============ PARTIDO SUSPENDIDO ============ */
.aviso-suspendido {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--o-rojo-fondo, #fef2f2);
  border: 1px solid var(--o-rojo-borde, #fecaca);
  border-left: 4px solid #dc2626;
  color: var(--o-rojo-texto, #7f1d1d);
  text-decoration: none;
  font-size: 0.9rem;
}
.aviso-suspendido > .bi:first-child { font-size: 1.5rem; color: var(--o-rojo-texto, #dc2626); }
.aviso-suspendido:hover { background: var(--o-rojo-fondo, #fee2e2); color: var(--o-rojo-texto, #7f1d1d); }
.reminder-pill {
  background: var(--o-ambar-fondo, #fffbeb);
  color: var(--o-ambar-texto, #92400e);
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin: 8px 0;
}
.empty-msg { font-size: 0.8rem; color: var(--o-texto-suave, #64748b); font-style: italic; padding: 12px 0 4px; margin: 0; }

</style>
