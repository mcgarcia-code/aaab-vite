<template>
  <div class="inicio-grid py-3 animate__animated animate__fadeIn">

    <!-- ============ PRÓXIMA CLASE ============ -->
    <section class="area-hero">
      <div v-if="cargando" class="tarjeta-hero placeholder-glow" aria-hidden="true">
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

      <div v-else-if="proximaClase" class="tarjeta-hero">
        <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
          <span class="hero-label">Próxima clase</span>
          <span v-if="textoRelativo(proximaClase.fecha)" class="hero-pill">{{ textoRelativo(proximaClase.fecha) }}</span>
        </div>

        <div class="d-flex gap-3 align-items-center mb-3">
          <div class="bloque-fecha">
            <span class="bloque-dia">{{ diaSemana(proximaClase.fecha) }}</span>
            <span class="bloque-numero">{{ proximaClase.fecha.substring(8, 10) }}</span>
            <span class="bloque-mes">{{ MESES_CORTOS[Number(proximaClase.fecha.substring(5, 7)) - 1] }}</span>
          </div>

          <div class="d-flex flex-column gap-1 min-w-0">
            <span class="hero-partido">{{ proximaClase.titulo || 'Clase del curso' }}</span>
            <span class="hero-dato"><i class="bi bi-clock"></i>{{ horarioClase(proximaClase) || 'Horario a confirmar' }}</span>
            <span class="hero-dato flex-wrap">
              <i class="bi bi-geo-alt"></i>
              <span class="text-break">{{ proximaClase.lugar || (proximaClase.modalidad === 'virtual' ? 'Virtual' : 'Lugar a confirmar') }}</span>
              <a v-if="proximaClase.enlace" :href="proximaClase.enlace" target="_blank" rel="noopener noreferrer" class="link-mapa">Entrar a la clase</a>
            </span>
          </div>
        </div>

        <RouterLink to="/panel-curso/cronograma-curso" class="btn btn-danger w-100 rounded-3 fw-bold py-2 d-flex align-items-center justify-content-center gap-2">
          Ver cronograma <i class="bi bi-chevron-right"></i>
        </RouterLink>
      </div>

      <div v-else class="tarjeta-hero d-flex align-items-center gap-3">
        <div class="bloque-fecha bloque-fecha-vacio">
          <i class="bi bi-calendar-x fs-3"></i>
        </div>
        <div class="flex-grow-1">
          <span class="hero-label d-block mb-1">Próxima clase</span>
          <span class="hero-dato d-block">No hay clases próximas cargadas.</span>
          <RouterLink to="/panel-curso/cronograma-curso" class="link-hero">Ver cronograma</RouterLink>
        </div>
      </div>

      <!-- Aprobó el curso: próximo paso -->
      <RouterLink v-if="aprobado" :to="ITEM_REGISTRO_ARBITRO.to" class="aviso-registro mt-3">
        <i class="bi bi-patch-check-fill"></i>
        <span class="flex-grow-1">
          <span class="d-block fw-bold">Registrarme como árbitro</span>
          <span class="d-block small">¡Aprobaste el curso! Completá tu registro con tu email personal.</span>
        </span>
        <i class="bi bi-chevron-right"></i>
      </RouterLink>
    </section>

    <!-- ============ ACCESOS RÁPIDOS ============ -->
    <section class="area-rapidos">
      <AccesosRapidos :disponibles="accesosDisponibles" :predeterminados="accesosPredeterminados" :clave-almacenamiento="claveAccesos" />
    </section>

    <!-- ============ AVISOS Y EVENTOS ============ -->
    <aside class="area-avisos">
      <div class="tarjeta-avisos">
        <h2 class="titulo-avisos mb-3">Avisos y eventos</h2>

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
            {{ tab.etiqueta }}
            <span v-if="tab.cantidad > 0" class="tab-badge">{{ tab.cantidad }}</span>
          </button>
        </div>

        <div class="avisos-scroll">
          <EstadoCargando v-if="cargando" texto="Cargando avisos" />

          <template v-else>
            <!-- CLASES -->
            <div v-show="tabActiva === 'clases'">
              <RouterLink v-for="c in otrasClases" :key="c.id" to="/panel-curso/cronograma-curso" class="evento text-decoration-none">
                <div class="cal-box">
                  <span class="day">{{ c.fecha.substring(8, 10) }}</span>
                  <span class="month">{{ MESES_CORTOS[Number(c.fecha.substring(5, 7)) - 1] }}</span>
                </div>
                <div class="event-info">
                  <strong>{{ c.titulo || 'Clase del curso' }}</strong>
                  <p class="mb-0">{{ horarioClase(c) || 'Horario a confirmar' }} · {{ c.lugar || (c.modalidad === 'virtual' ? 'Virtual' : 'Lugar a confirmar') }}</p>
                </div>
              </RouterLink>
              <p v-if="!otrasClases.length" class="empty-msg">{{ proximaClase ? 'No hay más clases cargadas por ahora.' : 'No hay clases próximas cargadas.' }}</p>
            </div>

            <!-- CUMPLEAÑOS -->
            <div v-show="tabActiva === 'cumpleanos'">
              <div v-for="c in cumpleanosProximos" :key="c.nombre + c.dia" class="evento">
                <div :class="['cal-box', { 'today-bg': c.esHoy }]">
                  <span class="day">{{ String(c.dia).padStart(2, '0') }}</span>
                  <span class="month">{{ c.esHoy ? 'HOY' : MESES_CORTOS[new Date().getMonth()] }}</span>
                </div>
                <div class="event-info">
                  <strong>{{ c.nombre }}<template v-if="c.soyYo"> (vos)</template></strong>
                  <p class="mb-0">{{ c.esHoy ? '¡Cumple años hoy!' : textoRelativoCumple(c.dia) }}</p>
                </div>
              </div>
              <p v-if="!cumpleanosProximos.length" class="empty-msg">No hay más cumpleaños de alumnos regulares este mes.</p>
            </div>
          </template>
        </div>
      </div>
    </aside>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import AccesosRapidos from '@/components/comunes/AccesosRapidos.vue'
import { CLAVE_PRECARGA_REGISTRO, precargaRegistroArbitro } from '@/composables/useCursoArbitro'
import { horarioClase } from '@/composables/useCronogramaCurso'
import { useModulosCurso, ITEM_REGISTRO_ARBITRO } from '@/composables/useModulosCurso'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'

useHead({ title: 'Inicio Curso | AAAB' })

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const DIAS_CORTOS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

const cargando = ref(true)
const estado = ref('')
const proximasClases = ref([])
const cumpleanos = ref([])

const { gruposModulos, accesosRapidos, aprobado } = useModulosCurso(estado)

// Accesos rápidos personalizables: todos los módulos + datos y credencial
const accesosDisponibles = computed(() => [
  ...gruposModulos.value.flatMap(g => g.items),
  { to: '/panel-curso/datos-curso', title: 'Datos personales', icon: 'bi bi-person-lines-fill' },
  { to: '/panel-curso/credencial-curso', title: 'Credencial digital', icon: 'bi bi-person-badge' }
])
const accesosPredeterminados = accesosRapidos.map(a => a.to)
const claveAccesos = `panelCurso.accesos.${auth.getUser()?.id ?? 'anonimo'}`

const proximaClase = computed(() => proximasClases.value[0] || null)

// La próxima clase ya está destacada arriba: en Avisos solo van las siguientes
const otrasClases = computed(() => proximasClases.value.slice(1))

// Cumpleaños del mes: solo el de hoy y los que faltan (los que ya pasaron no se muestran)
const cumpleanosProximos = computed(() => {
  const hoy = new Date().getDate()
  return cumpleanos.value.filter(c => c.esHoy || Number(c.dia) >= hoy)
})

// ─── Avisos: pestañas ────────────────────────────────────────────
const tabActiva = ref('clases')
const tabs = computed(() => [
  { clave: 'clases', etiqueta: 'Clases', cantidad: otrasClases.value.length },
  { clave: 'cumpleanos', etiqueta: 'Cumpleaños', cantidad: cumpleanosProximos.value.length }
])

// ─── Fechas ──────────────────────────────────────────────────────
const fechaLocal = (iso) => {
  const [a, m, d] = String(iso).split('-').map(Number)
  return new Date(a, m - 1, d)
}

const diaSemana = (iso) => DIAS_CORTOS[fechaLocal(iso).getDay()]

const diasHasta = (fecha) => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.round((fecha - hoy) / 86400000)
}

const textoRelativo = (iso) => {
  const dias = diasHasta(fechaLocal(iso))
  if (dias <= 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  return `En ${dias} días`
}

// Cumpleaños del mes que todavía no llegaron: "Mañana", "En 3 días"
const textoRelativoCumple = (dia) => {
  const hoy = new Date()
  const dias = diasHasta(new Date(hoy.getFullYear(), hoy.getMonth(), dia))
  return dias === 1 ? 'Mañana' : `En ${dias} días`
}

// ─── Datos del inicio ────────────────────────────────────────────
const cargarInicio = async () => {
  try {
    const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerInicioCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message)
    estado.value = res.payload.estado
    proximasClases.value = res.payload.proximasClases || []
    cumpleanos.value = res.payload.cumpleanos || []
    // Si alguien cumple hoy, se abre directamente esa pestaña
    if (cumpleanos.value.some(c => c.esHoy)) tabActiva.value = 'cumpleanos'
    // Alumno aprobado: deja listos sus datos para precargar el registro de árbitros
    if (res.payload.precargaArbitro) {
      sessionStorage.setItem(CLAVE_PRECARGA_REGISTRO, JSON.stringify(precargaRegistroArbitro(res.payload.precargaArbitro)))
    }
  } catch (e) {
    console.error('cargarInicio:', e)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarInicio)
</script>

<style scoped>
/* ============ LAYOUT (mobile first) ============ */
/* Celular: próxima clase → accesos → avisos */
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

/* Escritorio: próxima clase y avisos lado a lado (los avisos no flotan),
   los accesos rápidos debajo a todo el ancho */
@media (min-width: 992px) {
  .inicio-grid {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    grid-template-areas:
      "hero avisos"
      "rapidos rapidos";
  }
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
    max-height: none;
  }
}

.min-w-0 { min-width: 0; }

/* ============ PRÓXIMA CLASE ============ */
.tarjeta-hero {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  color: #0f172a;
}

.hero-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #475569;
}

.hero-pill {
  font-size: 0.75rem;
  font-weight: 700;
  background: #fef3c7;
  color: #92400e;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.bloque-fecha {
  width: 64px;
  min-width: 64px;
  height: 76px;
  border-radius: 14px;
  background: #0f172a;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.bloque-fecha-vacio { background: #f1f5f9; color: #64748b; }
.bloque-dia { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }
.bloque-numero { font-size: 1.75rem; font-weight: 800; line-height: 1.1; }
.bloque-mes { font-size: 0.75rem; font-weight: 700; color: #f87171; }

.hero-partido { font-size: 1.05rem; font-weight: 800; line-height: 1.25; }

.hero-dato {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #475569;
}

.link-mapa {
  font-size: 0.8rem;
  font-weight: 700;
  color: #b91c1c;
  text-decoration: none;
  white-space: nowrap;
}
.link-mapa::before { content: '·'; color: #94a3b8; margin-right: 6px; }
.link-mapa:hover { text-decoration: underline; }

.link-hero {
  font-size: 0.875rem;
  font-weight: 700;
  color: #b91c1c;
  text-decoration: none;
}
.link-hero:hover { text-decoration: underline; }

.aviso-registro {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  text-decoration: none;
}
.aviso-registro > .bi:first-child { font-size: 1.5rem; color: #059669; }
.aviso-registro:hover { background: #d1fae5; color: #064e3b; }

/* ============ ACCESOS RÁPIDOS ============ */
.categoria-label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 10px;
}

.acceso-rapido {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 84px;
  height: 100%;
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

/* ============ AVISOS ============ */
.tarjeta-avisos {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  color: #0f172a;
}

.titulo-avisos { font-size: 1rem; font-weight: 800; }

.tabs-avisos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 4px;
}

.tab-btn {
  border: none;
  background: transparent;
  min-height: 40px;
  padding: 6px 4px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tab-btn:hover { color: #0f172a; }
.tab-btn:focus-visible { outline: 2px solid #0f172a; outline-offset: 1px; }
.tab-btn.activa {
  background: #fff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
}

.tab-badge {
  background-color: #e2e8f0;
  color: #334155;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 800;
}
.tab-btn.activa .tab-badge { background: #0f172a; color: #fff; }

.avisos-scroll {
  max-height: 340px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.evento {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #e2e8f0;
  color: #0f172a;
}
.evento:first-child { border-top: none; }

.cal-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
}
.cal-box .day { font-weight: 800; font-size: 1.05rem; line-height: 1; color: #0f172a; }
.cal-box .month { font-size: 0.7rem; font-weight: 700; color: #b91c1c; margin-top: 2px; }
.today-bg { background: #dc2626; }
.today-bg .day, .today-bg .month { color: #fff; }

.event-info { flex: 1; min-width: 0; }
.event-info strong {
  font-size: 0.875rem;
  color: #0f172a;
  display: block;
  line-height: 1.25;
}
.event-info p {
  font-size: 0.8rem;
  color: #475569;
  margin: 2px 0 0;
}

.empty-msg { font-size: 0.8rem; color: #64748b; font-style: italic; padding: 12px 0 4px; margin: 0; }

.animate__animated { animation-duration: 0.4s; }
</style>
