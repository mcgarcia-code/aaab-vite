<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="panel-personal animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- ── Header ── -->
        <div class="card-header bg-white py-3 border-bottom">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-eye me-1"></i> Observación Arbitral
            </h4>
            <span class="text-muted small d-block mt-1">
              Seguimiento y evaluación de desempeño arbitral
            </span>
          </div>
        </div>

        <div class="card-body p-0 bg-white">

          <!-- ══════════════════════════════════════════════════
               DATOS DEL PARTIDO (se mantiene de la planilla original)
               ══════════════════════════════════════════════════ -->
          <div class="p-3 p-md-4 border-bottom">
            <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
              <i class="bi bi-clipboard-data text-danger me-2 fs-5"></i>
              <h6 class="fw-bold m-0 text-dark text-uppercase">Datos del Partido</h6>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label fw-bold text-uppercase small text-dark">Género *</label>
                <div class="btn-group w-100" role="group">
                  <template v-for="opt in ['Caballeros', 'Damas']" :key="opt">
                    <input type="radio" class="btn-check" :id="'gen-' + opt"
                      :value="opt" v-model="formulario.partido_genero">
                    <label class="btn btn-outline-danger fw-bold" :for="'gen-' + opt">{{ opt }}</label>
                  </template>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label fw-bold text-uppercase small text-dark">Categoría *</label>
                <div class="btn-group w-100" role="group">
                  <template v-for="opt in ['Mayores', 'Inferiores']" :key="opt">
                    <input type="radio" class="btn-check" :id="'cat-' + opt"
                      :value="opt" v-model="formulario.partido_categoria">
                    <label class="btn btn-outline-danger fw-bold" :for="'cat-' + opt">{{ opt }}</label>
                  </template>
                </div>
              </div>
            </div>

            <div v-if="formulario.partido_categoria === 'Mayores'" class="mb-3 animate__animated animate__fadeIn">
              <label class="form-label fw-bold text-uppercase small text-dark">Competencia Mayores *</label>
              <select @change='obtenerEquipos()' v-model="formulario.inf_nivel" class="form-select shadow-sm border-secondary-subtle" required>
                <option value="" disabled>Seleccione competencia</option>
                <option v-for="(div, k) in divisionesMayores" :key="k" :value="div">{{ div }}</option>
              </select>
            </div>

            <div v-if="formulario.partido_categoria === 'Inferiores'" class="row g-3 mb-3 animate__animated animate__fadeIn">
              <div class="col-12 col-md-8">
                <label class="form-label fw-bold text-uppercase small text-dark">Categoría Específica *</label>
                <select @change='setDivisiones()' v-model="formulario.id_categoria_especifica" class="form-select shadow-sm border-secondary-subtle" required :disabled="cargandoCategorias">
                  <option value="" disabled>{{ cargandoCategorias ? 'Cargando...' : 'Seleccione Categoría' }}</option>
                  <option v-for="(cat, k) in listas.divisiones_categorias" :key="k" :value="k">{{ cat.categoria }}</option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label fw-bold text-uppercase small text-dark">Nivel *</label>
                <select @change='obtenerEquipos()' v-model="formulario.inf_nivel" class="form-select shadow-sm border-secondary-subtle" required>
                  <option value="" disabled>Nivel</option>
                  <option v-for="opt in listas.divisiones" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-uppercase small text-dark">Equipos *</label>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <select v-model="formulario.eq1_id" class="form-select shadow-sm border-secondary-subtle" required>
                    <option value="" disabled>Local</option>
                    <option v-for="(eq, k) in listas.equipos" :key="k" :value="k">{{ eq.club }}</option>
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <select v-model="formulario.eq2_id" class="form-select shadow-sm border-secondary-subtle" required>
                    <option value="" disabled>Visitante</option>
                    <option v-for="(eq, k) in listas.equipos" :key="k" :value="k">{{ eq.club }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-6 col-md-3">
                <label class="form-label fw-bold text-uppercase small text-dark">Result. 1er tiempo</label>
                <input type="text" v-model="formulario.resultado_primer_tiempo" class="form-control shadow-sm border-secondary-subtle" placeholder="Ej: 14 : 12">
              </div>
              <div class="col-6 col-md-3">
                <label class="form-label fw-bold text-uppercase small text-dark">Resultado final</label>
                <input type="text" v-model="formulario.resultado_final" class="form-control shadow-sm border-secondary-subtle" placeholder="Ej: 28 : 26">
              </div>
              <div class="col-6 col-md-3">
                <label class="form-label fw-bold text-uppercase small text-dark">Fecha del partido</label>
                <input type="date" v-model="formulario.fecha_partido" class="form-control shadow-sm border-secondary-subtle">
              </div>
              <div class="col-6 col-md-3">
                <label class="form-label fw-bold text-uppercase small text-dark">Estadio / Lugar</label>
                <input type="text" v-model="formulario.estadio" class="form-control shadow-sm border-secondary-subtle" placeholder="Ej: Casa del Handball">
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════
               ARBITRAJE (se mantiene de la planilla original)
               ══════════════════════════════════════════════════ -->
          <div class="p-3 p-md-4 bg-light border-bottom">
            <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
              <i class="bi bi-person-badge text-danger me-2 fs-5"></i>
              <h6 class="fw-bold m-0 text-dark text-uppercase">Arbitraje</h6>
            </div>

            <div class="mb-4">
              <label class="form-label fw-bold text-uppercase small text-dark">Cantidad de Árbitros *</label>
              <div class="btn-group d-block" role="group" style="max-width: 200px;">
                <template v-for="opt in ['1', '2']" :key="opt">
                  <input type="radio" class="btn-check" :id="'ref-' + opt" :value="opt" v-model="formulario.ref_count">
                  <label class="btn btn-outline-danger fw-bold px-4" :for="'ref-' + opt">{{ opt }}</label>
                </template>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="card shadow-sm border-light-subtle h-100">
                  <div class="card-body p-3">
                    <label class="fw-bold mb-2 text-danger small text-uppercase">Árbitro 1</label>
                    <select v-model="formulario.ref1_id" class="form-select shadow-sm border-secondary-subtle" required>
                      <option value="" disabled>Seleccione Árbitro</option>
                      <option v-for="arb in listas.arbitros" :key="arb.id" :value="arb.id">{{arb.apellido}}, {{ arb.nombre }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6" v-if="formulario.ref_count === '2'">
                <div class="card shadow-sm border-light-subtle h-100 animate__animated animate__fadeIn">
                  <div class="card-body p-3">
                    <label class="fw-bold mb-2 text-danger small text-uppercase">Árbitro 2</label>
                    <select v-model="formulario.ref2_id" class="form-select shadow-sm border-secondary-subtle" required>
                      <option value="" disabled>Seleccione Árbitro</option>
                      <option v-for="arb in listas.arbitros" :key="arb.id" :value="arb.id">{{arb.apellido}}, {{ arb.nombre }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════
               EVALUACIÓN FINAL — pantalla dividida (Nota / Comentarios)
               ══════════════════════════════════════════════════ -->
          <div class="p-3 p-md-4">
            <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
              <i class="bi bi-clipboard2-check-fill text-danger me-2 fs-5"></i>
              <h6 class="fw-bold m-0 text-dark text-uppercase">Evaluación Final</h6>
            </div>

            <!-- ══════════ PANTALLA DIVIDIDA ══════════ -->
            <div class="row g-4">

            <!-- ══════════ COLUMNA NOTA ══════════ -->
            <div class="col-12 col-lg-6">
              <div class="d-flex align-items-center gap-2 mb-3">
                <i class="bi bi-clipboard-data text-danger fs-6"></i>
                <span class="fw-bold text-dark text-uppercase small">Nota</span>
                <span class="badge bg-danger rounded-pill ms-auto fs-6">{{ notaFinal }}</span>
              </div>

              <!-- Dificultad del partido (N15) -->
              <div class="mb-4">
                <label class="form-label fw-bold text-uppercase small text-dark">Dificultad del partido *</label>
                <div class="d-flex flex-wrap gap-1">
                  <template v-for="d in dificultades" :key="d.mult">
                    <input type="radio" class="btn-check" :id="'dif-' + d.mult" :value="d.mult" v-model="nota.dificultad">
                    <label class="btn btn-outline-danger btn-sm fw-semibold px-2 py-1 dif-btn" :for="'dif-' + d.mult">{{ d.label }}</label>
                  </template>
                </div>
              </div>

              <!-- Grilla de categorías: una nota 1-10 por categoría -->
              <div class="mb-4">
                <label class="form-label fw-bold text-uppercase small text-dark">Puntaje por categoría (1 a 10) *</label>
                <p class="text-muted small mb-3">Seleccioná la nota de cada bloque. El promedio pondera el puntaje base.</p>

                <div v-for="cat in categorias" :key="cat.id" class="card shadow-sm border-light-subtle mb-3">
                  <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="fw-bold text-dark small">{{ cat.nombre }}</span>
                      <span class="badge fs-6 rounded-pill px-3" :class="nota.categorias[cat.id] ? 'bg-danger' : 'bg-secondary bg-opacity-50'">
                        {{ nota.categorias[cat.id] || '—' }}
                      </span>
                    </div>
                    <div class="d-grid gap-1 cat-scale mb-2">
                      <button type="button" v-for="n in 10" :key="n"
                        class="btn btn-sm fw-bold"
                        :class="nota.categorias[cat.id] === (11 - n) ? 'btn-danger' : 'btn-outline-secondary'"
                        @click="nota.categorias[cat.id] = (11 - n)">
                        {{ 11 - n }}
                      </button>
                    </div>
                    <ul class="text-muted small mb-0 ps-3">
                      <li v-for="(c, i) in cat.criterios" :key="i">{{ c }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Tabla de Uso del VR (video-repetición) -->
              <div class="mb-4">
                <label class="form-label fw-bold text-uppercase small text-dark">Uso del VR (video-repetición)</label>
                <p class="text-muted small mb-3">
                  Cada fila penaliza el puntaje: Uso incorrecto −2 · Evaluación incorrecta −0.5 · VR no necesario −0.25
                </p>

                <div v-for="(fila, idx) in nota.vr" :key="idx" class="input-group input-group-sm mb-2 flex-nowrap">
                  <input v-model="fila.tiempo" class="form-control shadow-sm border-secondary-subtle" style="max-width: 80px;" placeholder="mm:ss">
                  <select v-model="fila.situacion" class="form-select shadow-sm border-secondary-subtle" title="Situación">
                    <option value="">Situación —</option>
                    <option v-for="s in situacionesVR" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <input v-model="fila.decision" class="form-control shadow-sm border-secondary-subtle" placeholder="Decisión">
                  <select v-model="fila.uso" class="form-select shadow-sm"
                    :class="fila.uso === 'USO INCORRECTO' ? 'border-danger bg-danger bg-opacity-10' : 'border-secondary-subtle'" title="Uso">
                    <option value="">Uso —</option>
                    <option value="USO CORRECTO">Uso correcto</option>
                    <option value="USO INCORRECTO">Uso incorrecto</option>
                  </select>
                  <select v-model="fila.evaluacion" class="form-select shadow-sm"
                    :class="fila.evaluacion === 'incorrecto' ? 'border-danger bg-danger bg-opacity-10' : 'border-secondary-subtle'" title="Evaluación">
                    <option value="">Eval. —</option>
                    <option value="correcto">Correcto</option>
                    <option value="incorrecto">Incorrecto</option>
                  </select>
                  <select v-model="fila.vr_necesario" class="form-select shadow-sm"
                    :class="fila.vr_necesario === 'no' ? 'border-danger bg-danger bg-opacity-10' : 'border-secondary-subtle'" title="VR necesario">
                    <option value="">VR —</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                  <button type="button" class="btn btn-danger" @click="quitarFilaVR(idx)" title="Quitar fila">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>

                <button type="button" class="btn btn-danger btn-sm mt-1" @click="agregarFilaVR">
                  <i class="bi bi-plus-lg"></i> Agregar situación de VR
                </button>

                <div v-if="penalizacionVR !== 0" class="alert alert-danger border-danger-subtle border-start border-danger border-4 mt-3 mb-0 py-2" style="font-size: 0.9rem;">
                  Penalización total por VR: <strong>{{ penalizacionVR.toFixed(2) }}</strong>
                </div>
              </div>

              <!-- Influencia en el resultado final -->
              <div class="mb-4">
                <label class="form-label fw-bold text-uppercase small text-dark">Influencia de los árbitros en el resultado final</label>
                <select v-model="nota.influencia" class="form-select shadow-sm border-secondary-subtle">
                  <option value="">No influyeron</option>
                  <option value="Decisión única con influencia en el resultado">Decisión única con influencia en el resultado (−1)</option>
                  <option value="Múltiples decisiones con influencia en el resultado">Múltiples decisiones con influencia en el resultado (−2)</option>
                </select>
              </div>

              <!-- Desglose del cálculo -->
              <div class="card shadow-sm border-light-subtle mb-3">
                <ul class="list-group list-group-flush small">
                  <li class="list-group-item d-flex justify-content-between"><span class="text-muted">Promedio de categorías </span><strong class="text-dark">{{ promedioCategorias.toFixed(2) }}</strong></li>
                  <li class="list-group-item d-flex justify-content-between"><span class="text-muted">× Multiplicador dificultad </span><strong class="text-dark">× {{ nota.dificultad.toFixed(2) }}</strong></li>
                  <li class="list-group-item d-flex justify-content-between"><span class="text-muted">Puntaje ponderado </span><strong class="text-dark">{{ puntajePonderado.toFixed(2) }}</strong></li>
                  <li class="list-group-item d-flex justify-content-between"><span class="text-muted">− Penalización VR</span><strong class="text-danger">{{ penalizacionVR.toFixed(2) }}</strong></li>
                  <li class="list-group-item d-flex justify-content-between"><span class="text-muted">− Penalización influencia</span><strong class="text-danger">{{ penalizacionInfluencia.toFixed(2) }}</strong></li>
                </ul>
              </div>

              <!-- Nota final destacada -->
              <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 12px;">
                <div class="card-body p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <span class="text-white small text-uppercase d-block">Nota Final</span>
                    <span class="text-white fw-light small">Cálculo automático AAAB</span>
                  </div>
                  <span class="nota-final-num">{{ notaFinal }}</span>
                </div>
              </div>

              <div class="d-grid d-sm-flex justify-content-sm-center">
                <button type="button" class="btn btn-danger fw-bold px-4 py-2 shadow"
                  :disabled="procesandoNota" @click="guardarNota">
                  <span v-if="procesandoNota" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-check-lg me-1"></i>
                  {{ procesandoNota ? 'GUARDANDO...' : 'CONFIRMAR NOTA' }}
                </button>
              </div>
            </div>

            <!-- ══════════ COLUMNA COMENTARIOS ══════════ -->
            <div class="col-12 col-lg-6 border-start-lg">
              <div class="d-flex align-items-center gap-2 mb-3">
                <i class="bi bi-chat-left-text text-danger fs-6"></i>
                <span class="fw-bold text-dark text-uppercase small">Comentarios</span>
                <i v-if="comentariosCompletos" class="bi bi-check-circle-fill text-success ms-auto"></i>
              </div>
              <p class="text-muted small mb-4">
                Comentario cualitativo por cada bloque de evaluación. Los marcados con * son obligatorios.
              </p>

              <div v-for="cat in categorias" :key="cat.id" class="mb-4">
                <label class="form-label fw-bold text-uppercase small text-dark">
                  {{ cat.nombre }}<span v-if="cat.obligatorio" class="text-danger"> *</span>
                </label>
                <textarea v-model="comentarios.categorias[cat.id]" rows="6" class="form-control shadow-sm border-secondary-subtle"
                  :placeholder="cat.ayuda || 'Observaciones...'"></textarea>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold text-uppercase small text-dark">Prioridades de mejora <span class="text-danger">*</span></label>
                <div class="input-group mb-2">
                  <span class="input-group-text bg-danger text-white fw-bold">1</span>
                  <input v-model="comentarios.prioridad_1" class="form-control shadow-sm border-secondary-subtle" placeholder="Prioridad principal">
                </div>
                <div class="input-group mb-2">
                  <span class="input-group-text bg-danger text-white fw-bold">2</span>
                  <input v-model="comentarios.prioridad_2" class="form-control shadow-sm border-secondary-subtle" placeholder="Segunda prioridad">
                </div>
                <div class="input-group">
                  <span class="input-group-text bg-danger text-white fw-bold">Resto</span>
                  <textarea v-model="comentarios.prioridad_resto" rows="4" class="form-control shadow-sm border-secondary-subtle" placeholder="Otros temas a mejorar"></textarea>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold text-uppercase small text-dark">Situaciones clave <span class="text-danger">*</span></label>
                <div v-for="(sit, idx) in comentarios.situaciones" :key="idx" class="input-group mb-2">
                  <input v-model="sit.tiempo" class="form-control shadow-sm border-secondary-subtle" style="max-width: 120px;" placeholder="mm:ss">
                  <input v-model="sit.descripcion" class="form-control shadow-sm border-secondary-subtle" placeholder="Descripción de la situación">
                  <button type="button" class="btn btn-danger" @click="quitarSituacion(idx)" title="Quitar">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
                <button type="button" class="btn btn-danger btn-sm mt-1" @click="agregarSituacion">
                  <i class="bi bi-plus-lg"></i> Agregar situación clave
                </button>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold text-uppercase small text-dark">Comentarios adicionales</label>
                <textarea v-model="comentarios.adicionales" rows="8" class="form-control shadow-sm border-secondary-subtle" placeholder="Comentarios generales..."></textarea>
              </div>

              <div class="d-grid d-sm-flex justify-content-sm-center">
                <button type="button" class="btn btn-danger fw-bold px-4 py-2 shadow"
                  :disabled="procesandoComentarios" @click="guardarComentarios">
                  <span v-if="procesandoComentarios" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-check-lg me-1"></i>
                  {{ procesandoComentarios ? 'GUARDANDO...' : 'CONFIRMAR COMENTARIOS' }}
                </button>
              </div>
            </div>

            </div>
          </div>

          <!-- ── Alerta de soporte ── -->
          <div class="alert alert-warning border-warning-subtle text-dark d-flex align-items-start gap-2 m-3 m-md-4 rounded-3" style="font-size: 0.85rem;">
            <i class="bi bi-info-circle-fill text-dark mt-1 flex-shrink-0"></i>
            <span>
              <strong>Recordá:</strong> la nota y los comentarios se guardan por separado. Confirmá cada mitad para que ambas queden registradas en el sistema.
            </span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, inject } from 'vue'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Observación Arbitral | AAAB',
  meta: [
    { name: 'description', content: 'Carga de observaciones arbitrales para partidos de handball.' }
  ]
})

const notificar = inject('notificar')

const procesandoNota = ref(false)
const procesandoComentarios = ref(false)
const cargandoCategorias = ref(false)

// Observador tomado de la sesión iniciada (no se pide en el formulario)
const observador = ref(auth.getUser() || {})

const divisionesMayores = ref([])

const listas = reactive({
  divisiones_categorias: [],
  divisiones: [],
  arbitros: [],
  equipos: []
})

// Multiplicadores de dificultad (N15 del Excel)
const dificultades = [
  { label: 'Muy difícil', mult: 1.15 },
  { label: 'Difícil', mult: 1.10 },
  { label: 'Levemente difícil', mult: 1.05 },
  { label: 'Normal', mult: 1.00 },
  { label: 'Fácil', mult: 0.95 },
  { label: 'Árbitros aumentaron dificultad', mult: 0.80 }
]

// Situaciones de VR (1-11) del catálogo del Excel
const situacionesVR = [
  '1. Gol/no gol: si el balón cruzó la línea de gol',
  '2. Gol/no gol: si el gol fue dentro del tiempo o no',
  '3. Acciones graves y antideportivas fuera de la visión de los árbitros',
  '4. Descalificación: identificar el número de camiseta del jugador culpable',
  '5. Conflicto en la cancha',
  '6. Sustitución incorrecta',
  '7. Simulación',
  '8. Regla 8: duda seria si debe otorgarse D2M o tarjeta roja',
  '9. Situación que cambia el partido en los últimos 30 segundos',
  '10. Team Time-out electrónico',
  '11. Otro: si una decisión puede llevar a una protesta'
]

// Las 10 categorías con sus criterios (tal cual la Score sheet)
const categorias = [
  {
    id: 'management', nombre: 'Management', obligatorio: true,
    ayuda: 'Aplicación e interpretación de las Reglas / control del partido, enfoque táctico y manejo del juego.',
    criterios: [
      'Balance Concept / criterio uniforme',
      'Capacidad para crear un ambiente favorable',
      'Presencia en el juego, Personalidad',
      'Capacidad para manejar conflictos (por ejemplo, confrontaciones)',
      'Aplicación de herramientas preventivas (big Free Throw, manejo de provocaciones, etc.)'
    ]
  },
  {
    id: 'comprension', nombre: 'Comprensión del juego',
    ayuda: 'Fluidez evitando silbatos innecesarios, uso de la ventaja, manejo del tiempo y del juego pasivo.',
    criterios: ['Ventaja y Flow Line', 'Línea adaptada al nivel', 'Juego pasivo', 'Manejo del tiempo']
  },
  {
    id: 'posicionamiento', nombre: 'Posicionamiento, Movimientos y cooperación',
    ayuda: 'Posicionamiento y movimiento en cancha, distribución de tareas y cooperación entre árbitros.',
    criterios: [
      'Condición física general de los árbitros',
      'Desplazamiento y posicionamiento del árbitro de campo',
      'Desplazamiento y posicionamiento del árbitro de portería',
      'Distribución de tareas'
    ]
  },
  {
    id: 'lenguaje', nombre: 'Lenguaje corporal y comunicación',
    ayuda: 'Comunicación verbal y no verbal de los árbitros con los participantes.',
    criterios: ['Comunicación verbal con los participantes', 'Lenguaje corporal y comportamiento', 'Gestoformas y uso del silbato']
  },
  {
    id: 'punishment', nombre: 'Punishment Line (Línea disciplinaria)',
    ayuda: 'Aplicación de sanciones, observación y diferenciación de contactos, consistencia de la línea disciplinaria.',
    criterios: [
      'Línea disciplinaria consistente durante todo el partido',
      'Encontrar el punto de partida correcto de la línea disciplinaria',
      'Sanción de provocaciones, sobrerreacciones y simulaciones (SOP)',
      'Decisiones directas de suspensión de 2 minutos',
      'Decisiones directas de descalificación (si aplica)',
      'Correcta observación, diferenciación y determinación de las faltas'
    ]
  },
  {
    id: 'pivot', nombre: 'Pivot Zone',
    ayuda: 'Manejo de la lucha por el espacio, observación de bloqueos, aplicación de sanciones en la zona del pivote.',
    criterios: [
      'Medida preventiva, comunicación en el Pivot Zone',
      'Observación de bloqueos',
      'Observación de la lucha por el espacio',
      'Sanciones relacionadas con situaciones alrededor del pivote'
    ]
  },
  {
    id: 'siete_metros', nombre: 'Línea de 7 metros',
    ayuda: 'Manejo de contactos en el área, observación de ocasión manifiesta de gol, consistencia de la línea.',
    criterios: [
      'Observación de ocasión manifiesta de gol',
      'Observación de la defensa dentro del área de portería',
      'Observación de contactos antes o durante una ocasión manifiesta de gol',
      'Línea de 7 metros consistente durante todo el partido'
    ]
  },
  {
    id: 'faltas_ataque', nombre: 'Faltas de Ataque',
    ayuda: 'Observación de qué jugador gana el espacio y uso del cuerpo para provocar contactos.',
    criterios: [
      'Falta del atacante con balón',
      'Falta del atacante sin balón',
      'Provocaciones o simulaciones del defensor',
      'Línea consistente de faltas en ataque durante todo el partido'
    ]
  },
  {
    id: 'errores_tecnicos', nombre: 'Errores técnicos',
    ayuda: 'Observación de errores técnicos de los atacantes (pasos, dribling, etc.).',
    criterios: [
      'Pasos en situaciones neutras',
      'Pasos en situaciones de 1 vs 1 cerca del área de portería',
      'Evitar goles convertidos tras pasos',
      'Ejecución de lanzamientos (golpe franco, saque de centro, etc.)',
      'Otros errores técnicos (doble dribling, 3 segundos, etc.)'
    ]
  },
  {
    id: 'mentales', nombre: 'Capacidades mentales',
    ayuda: 'Preparación mental, manejo de la presión interna y externa, mantenimiento de la concentración.',
    criterios: [
      'Manejo de la presión externa (espectadores, dirigentes, medios, etc.)',
      'Manejo de la presión interna (protestas de jugadores, bancos, etc.)',
      'Manejo de los propios errores',
      'Capacidad para recuperarse después de una serie de errores',
      'Capacidad para mantenerse concentrado durante el partido',
      'Valentía para tomar decisiones impopulares cuando sea necesario'
    ]
  }
]

// -------------------- ESTADO --------------------
const formulario = reactive({
  partido_genero: '',
  partido_categoria: '',
  inf_nivel: '',
  id_categoria_especifica: '',
  categoria: '',
  eq_nombre1: '',
  eq_nombre2: '',
  eq1_id: '',
  eq2_id: '',
  resultado_primer_tiempo: '',
  resultado_final: '',
  fecha_partido: null,
  estadio: '',
  ref_count: '1',
  ref1_id: '',
  ref2_id: ''
})

const nota = reactive({
  dificultad: 1.00,
  categorias: {},   // { management: 8, comprension: 7, ... }
  vr: [],
  influencia: ''
})
categorias.forEach(c => { nota.categorias[c.id] = null })

const comentarios = reactive({
  categorias: {},
  prioridad_1: '',
  prioridad_2: '',
  prioridad_resto: '',
  situaciones: [{ tiempo: '', descripcion: '' }],
  adicionales: ''
})
categorias.forEach(c => { comentarios.categorias[c.id] = '' })

// -------------------- CÁLCULO DE LA NOTA (réplica del Excel) --------------------
// M71 = AVERAGE de las 10 notas de categoría (solo cuenta las cargadas)
const promedioCategorias = computed(() => {
  const vals = categorias.map(c => nota.categorias[c.id]).filter(v => v != null && v !== '')
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + Number(b), 0) / vals.length
})

// K12 = N15 * M71
const puntajePonderado = computed(() => nota.dificultad * promedioCategorias.value)

// Penalización VR: incorrecto -2, evaluación incorrecta -0.5, VR no necesario -0.25
const penalizacionVR = computed(() => {
  const usoInc = nota.vr.some(f => f.uso === 'USO INCORRECTO') ? -2 : 0
  const evalInc = nota.vr.some(f => f.evaluacion === 'incorrecto') ? -0.5 : 0
  const vrNo = nota.vr.some(f => f.vr_necesario === 'no') ? -0.25 : 0
  return usoInc + evalInc + vrNo
})

// Penalización por influencia en el resultado (AM30 del Excel)
const penalizacionInfluencia = computed(() => {
  if (nota.influencia === 'Decisión única con influencia en el resultado') return -1
  if (nota.influencia === 'Múltiples decisiones con influencia en el resultado') return -2
  return 0
})

// FINAL = K12 + penalización VR + penalización influencia
const notaFinal = computed(() => {
  const total = puntajePonderado.value + penalizacionVR.value + penalizacionInfluencia.value
  return total.toFixed(2)
})

const comentariosCompletos = computed(() => {
  const oblig = categorias.filter(c => c.obligatorio).every(c => (comentarios.categorias[c.id] || '').trim())
  const prio = comentarios.prioridad_1.trim() && comentarios.prioridad_2.trim()
  const sit = comentarios.situaciones.some(s => s.descripcion.trim())
  return oblig && prio && sit
})

// -------------------- ACCIONES VR / SITUACIONES --------------------
const agregarFilaVR = () => {
  nota.vr.push({ tiempo: '', situacion: '', decision: '', uso: '', evaluacion: '', vr_necesario: '' })
}
const quitarFilaVR = (idx) => nota.vr.splice(idx, 1)

const agregarSituacion = () => comentarios.situaciones.push({ tiempo: '', descripcion: '' })
const quitarSituacion = (idx) => {
  if (comentarios.situaciones.length > 1) comentarios.situaciones.splice(idx, 1)
}

// -------------------- CARGA DE CATÁLOGOS (igual a la planilla original) --------------------
const pedirCategoriasEspecificas = async () => {
  if (!formulario.partido_genero || !formulario.partido_categoria) return
  cargandoCategorias.value = true
  listas.divisiones = []
  formulario.id_categoria_especifica = ''
  try {
    const res = await api.get({
      entity: 'observaciones',
      action: 'obtenerCategorias',
      payload: { genero: formulario.partido_genero, tipo: formulario.partido_categoria }
    })
    if (res.ok) {
      if (formulario.partido_categoria === 'Mayores') {
        divisionesMayores.value = res.payload[0]?.divisiones || []
      } else {
        listas.divisiones_categorias = res.payload
      }
    }
  } catch (error) {
    console.error('Error pidiendo listado:', error)
  } finally {
    cargandoCategorias.value = false
  }
}

const setDivisiones = () => {
  listas.divisiones = listas.divisiones_categorias[formulario.id_categoria_especifica].divisiones
}

const obtenerEquipos = async () => {
  let categoria = ''
  if (formulario.id_categoria_especifica !== '') {
    categoria = listas.divisiones_categorias[formulario.id_categoria_especifica].categoria
  }
  const r = await api.get({
    entity: 'observaciones',
    action: 'obtenerEquipos',
    payload: {
      genero: formulario.partido_genero,
      tipo: formulario.partido_categoria,
      categoria,
      division: formulario.inf_nivel
    }
  })
  listas.equipos = r.payload
}

watch(() => [formulario.partido_genero, formulario.partido_categoria], () => {
  pedirCategoriasEspecificas()
})

const cargarCatalogosBase = async () => {
  try {
    const resA = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    if (resA.ok) listas.arbitros = resA.payload
  } catch (e) { console.error(e) }
}
onMounted(cargarCatalogosBase)

// -------------------- ARMADO DE DATOS DEL PARTIDO --------------------
const armarDatosPartido = () => {
  const datos = { ...formulario }
  // El observador es un árbitro en actividad: usamos los datos de su sesión
  datos.id_arbitro = observador.value.id ?? null
  datos.observador = `${observador.value.apellido ?? ''}, ${observador.value.nombre ?? ''}`.trim()
  if (formulario.partido_categoria === 'Mayores') {
    datos.categoria = 'Mayores'
  } else if (formulario.id_categoria_especifica !== '') {
    datos.categoria = listas.divisiones_categorias[formulario.id_categoria_especifica].categoria
  }
  if (listas.equipos[formulario.eq1_id]) {
    datos.eq_nombre1 = listas.equipos[formulario.eq1_id].club
    datos.eq1_id = listas.equipos[formulario.eq1_id].eq_id
  }
  if (listas.equipos[formulario.eq2_id]) {
    datos.eq_nombre2 = listas.equipos[formulario.eq2_id].club
    datos.eq2_id = listas.equipos[formulario.eq2_id].eq_id
  }
  return datos
}

// -------------------- GUARDAR NOTA --------------------
const guardarNota = async () => {
  const faltantes = categorias.filter(c => !nota.categorias[c.id])
  if (faltantes.length) {
    notificar({ titulo: 'Faltan notas', mensaje: `Cargá la nota de: ${faltantes.map(c => c.nombre).join(', ')}`, tipo: 'danger' })
    return
  }
  procesandoNota.value = true
  try {
    const res = await api.post({
      entity: 'observaciones',
      action: 'guardarNota',
      payload: {
        partido: armarDatosPartido(),
        dificultad: nota.dificultad,
        categorias: nota.categorias,
        vr: nota.vr,
        influencia: nota.influencia,
        promedio_categorias: promedioCategorias.value,
        puntaje_ponderado: puntajePonderado.value,
        penalizacion_vr: penalizacionVR.value,
        penalizacion_influencia: penalizacionInfluencia.value,
        nota_final: notaFinal.value
      }
    })
    if (res.ok) {
      notificar({ titulo: '¡Nota guardada!', mensaje: 'La nota se registró correctamente.', tipo: 'success' })
    } else {
      notificar({ titulo: 'Error al guardar', mensaje: res.message || 'No se pudo procesar el envío.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión con el servidor.', tipo: 'danger' })
  } finally {
    procesandoNota.value = false
  }
}

// -------------------- GUARDAR COMENTARIOS --------------------
const guardarComentarios = async () => {
  if (!comentariosCompletos.value) {
    notificar({ titulo: 'Comentarios incompletos', mensaje: 'Completá los comentarios obligatorios, las prioridades y al menos una situación clave.', tipo: 'danger' })
    return
  }
  procesandoComentarios.value = true
  try {
    const res = await api.post({
      entity: 'observaciones',
      action: 'guardarComentarios',
      payload: {
        partido: armarDatosPartido(),
        categorias: comentarios.categorias,
        prioridad_1: comentarios.prioridad_1,
        prioridad_2: comentarios.prioridad_2,
        prioridad_resto: comentarios.prioridad_resto,
        situaciones: comentarios.situaciones.filter(s => s.descripcion.trim()),
        adicionales: comentarios.adicionales
      }
    })
    if (res.ok) {
      notificar({ titulo: '¡Comentarios guardados!', mensaje: 'Los comentarios se registraron correctamente.', tipo: 'success' })
    } else {
      notificar({ titulo: 'Error al guardar', mensaje: res.message || 'No se pudo procesar el envío.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión con el servidor.', tipo: 'danger' })
  } finally {
    procesandoComentarios.value = false
  }
}
</script>

<style scoped>
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  margin-left: 50%;
  transform: translateX(-50%);
  padding-bottom: 120px;
}
.panel-personal {
  width: 100%;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}
.animate__animated {
  animation-duration: 0.4s;
}

/* Grilla de la escala 1-10 por categoría */
.cat-scale { grid-template-columns: repeat(10, 1fr); }

/* Botones de dificultad compactos para que entren en la columna dividida */
.dif-btn {
  font-size: 0.78rem;
  line-height: 1.15;
}

/* Divisor vertical entre las dos mitades (solo desktop) */
@media (min-width: 992px) {
  .border-start-lg {
    border-left: 1px solid #dee2e6;
  }
}

/* Número grande de la nota final */
.nota-final-num {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1;
  color: #ff4d4d;
  text-shadow: 0 0 20px rgba(255, 77, 77, 0.5);
}
</style>
