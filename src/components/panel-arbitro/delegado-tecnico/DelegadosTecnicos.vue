<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100 panel-card radio-15 fondo-planilla">

      <!-- HEADER -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <p class="seccion-descripcion">Planilla digital</p>
        <div class="d-flex flex-wrap gap-2 justify-content-md-end">
          <button type="button" class="btn btn-light border rounded-pill px-3 py-2 fw-bold shadow-sm d-flex align-items-center texto-085" @click="abrirConfig">
            <i class="bi bi-gear-fill me-2"></i> CONFIG
          </button>
          <button type="button" class="btn btn-danger rounded-pill px-3 py-2 fw-bold shadow-sm d-flex align-items-center texto-085" @click="resetMatch">
            <i class="bi bi-arrow-counterclockwise me-2"></i> REINICIAR
          </button>
        </div>
      </div>

      <div class="card-body p-2 p-md-4">

        <!-- BANNER: PARTIDO FINALIZADO -->
        <div
          v-if="state.matchStatus === 'finished'"
          class="alert alert-success text-center fw-bold mb-3 rounded-4 d-flex align-items-center justify-content-center gap-2 fs-5"
        >
          🏁 Partido Finalizado — {{ state.score.local }} : {{ state.score.visitor }}
        </div>

        <!-- CRONÓMETRO -->
        <CronometroPartido
          :state="state"
          :corriendo="isRunning"
          :tiempo="formattedTime"
          :texto-periodo="currentPeriodText"
          @ajustar="abrirModalTiempo"
          @iniciar-pausar="toggleTimer"
          @cambiar-sentido="toggleDirection"
          @anterior="prevPeriod"
          @siguiente="nextPeriod"
          @cortar-tto="cancelTTO"
          @saltar-descanso="skipBreak"
          @editar-exclusion="editarPenalidad"
        />

        <!-- EQUIPOS -->
        <div class="row g-2 g-md-4 mb-3 mb-md-4">
          <div v-for="eq in EQUIPOS" :key="eq.equipo" class="col-6">
            <TableroEquipo
              v-model:club-id="state[eq.campoClub]"
              :equipo="eq.equipo"
              :clubes="state.clubes"
              :goles="state.score[eq.equipo]"
              :descalificados="eq.equipo === 'local' ? disqualifiedLocal : disqualifiedVisitor"
              :jugadores-menos="eq.equipo === 'local' ? localPlayersLess : visitorPlayersLess"
              :timeouts-usados="state.timeouts[eq.equipo].total"
              :puede-tto="canUseTimeout(eq.equipo)"
              :finalizado="state.matchStatus === 'finished'"
              @gol="registrarGol(eq.equipo)"
              @restar="restarGol(eq.equipo)"
              @sancion="(tipo) => pedirDorsal(eq.equipo, tipo)"
              @tto="requestTTO(eq.equipo)"
            />
          </div>
        </div>

        <!-- BITÁCORA -->
        <BitacoraEventos
          v-model:filtro="logFilter"
          :eventos="filteredLog"
          :pendientes="state.unsyncedEvents.length"
          @descargar="downloadLog"
          @eliminar="pedirEliminarEvento"
        />

      </div>
    </div>

    <!-- MODALES -->
    <ModalDorsal
      v-model="modalJugador.dorsal"
      :show="modalJugador.visible"
      :equipo="modalJugador.team"
      @close="cerrarModalDorsal"
      @confirmar="confirmarSancion"
    />

    <ModalTiempoPartido
      v-model:mm="modalTiempo.mm"
      v-model:ss="modalTiempo.ss"
      :show="modalTiempo.visible"
      titulo="Ajustar Tiempo"
      descripcion="Modifique los minutos y segundos del partido:"
      texto-guardar="GUARDAR TIEMPO"
      @close="modalTiempo.visible = false"
      @guardar="confirmarAjusteTiempo"
    />

    <ModalProrroga
      :show="modalProrroga.visible"
      :titulo="modalProrroga.titulo"
      :goles-local="state.score.local"
      :goles-visita="state.score.visitor"
      :minutos-prorroga="state.config.otDuration / 60"
      :rondas="state.config.otRounds"
      @close="modalProrroga.visible = false"
      @finalizar="finalizarPartido"
      @prorroga="iniciarProrroga"
    />

    <ModalConfigPartido
      v-model:minutos-tiempo="modalConfig.halfMinutes"
      v-model:minutos-prorroga="modalConfig.otMinutes"
      v-model:rondas="modalConfig.otRounds"
      :show="modalConfig.visible"
      :hay-cambios="hayCambiosConfig"
      :actual-tiempo="state.config.halfDuration / 60"
      :actual-prorroga="state.config.otDuration / 60"
      @close="modalConfig.visible = false"
      @guardar="guardarConfig"
    />

    <ModalTiempoPartido
      v-model:mm="modalPenalidad.mm"
      v-model:ss="modalPenalidad.ss"
      :show="modalPenalidad.visible"
      titulo="Corregir Exclusión"
      color-icono="bg-warning text-dark"
      :etiqueta="modalPenalidad.label"
      descripcion="Ajuste el tiempo restante de la exclusión. Use 0:00 para eliminarla."
      ayuda="Ingresar 00:00 elimina la exclusión del cronómetro."
      :max-minutos="3"
      @close="modalPenalidad.visible = false"
      @guardar="confirmarEditarPenalidad"
    />

  </div>
</template>

<script setup>
import { inject } from 'vue'
import { useHead } from '@unhead/vue'
import CronometroPartido from '@/components/panel-arbitro/delegado-tecnico/CronometroPartido.vue'
import TableroEquipo from '@/components/panel-arbitro/delegado-tecnico/TableroEquipo.vue'
import BitacoraEventos from '@/components/panel-arbitro/delegado-tecnico/BitacoraEventos.vue'
import ModalDorsal from '@/components/panel-arbitro/delegado-tecnico/ModalDorsal.vue'
import ModalTiempoPartido from '@/components/panel-arbitro/delegado-tecnico/ModalTiempoPartido.vue'
import ModalProrroga from '@/components/panel-arbitro/delegado-tecnico/ModalProrroga.vue'
import ModalConfigPartido from '@/components/panel-arbitro/delegado-tecnico/ModalConfigPartido.vue'
import { usePlanillaDelegado } from '@/composables/usePlanillaDelegado'

useHead({
  title: 'Delegados Técnicos | AAAB',
  meta: [{ name: 'description', content: 'Planilla de Delegados Técnicos' }],
})

const notificar = inject('notificar')
const toast = inject('toast')

// Los dos tableros (local y visita) son el mismo componente
const EQUIPOS = [
  { equipo: 'local', campoClub: 'localClubId' },
  { equipo: 'visitor', campoClub: 'visitorClubId' }
]

// La lógica de la planilla (cronómetro, reglas, bitácora y sincronización) vive en el composable
const {
  state, isRunning, logFilter,
  formattedTime, currentPeriodText, localPlayersLess, visitorPlayersLess, disqualifiedLocal, disqualifiedVisitor, filteredLog,
  modalJugador, modalTiempo, modalProrroga, modalConfig, hayCambiosConfig, modalPenalidad,
  resetMatch, abrirConfig, guardarConfig, abrirModalTiempo, confirmarAjusteTiempo,
  toggleTimer, toggleDirection, nextPeriod, prevPeriod, finalizarPartido, iniciarProrroga,
  registrarGol, restarGol, pedirDorsal, cerrarModalDorsal, confirmarSancion,
  editarPenalidad, confirmarEditarPenalidad, skipBreak,
  canUseTimeout, requestTTO, cancelTTO,
  pedirEliminarEvento, downloadLog
} = usePlanillaDelegado({ toast, notificar })
</script>

<style scoped>
.fondo-planilla { background: var(--o-superficie, #f8fafc); }
</style>
