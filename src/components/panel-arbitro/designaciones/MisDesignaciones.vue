<template>
  <div class="container-fluid px-2 px-md-3 py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">

      <!-- ================= HEADER ================= -->
      <div class="card-header bg-white p-0 border-bottom">
        <div class="px-3 py-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-calendar-week"></i> Mis Designaciones
          </h4>
          <p class="text-muted small m-0 mt-1">Tus partidos designados, próximos y anteriores</p>
        </div>

        <div
          v-if="infoTorneo && vistaActiva === 'proximas'"
          class="d-flex flex-wrap align-items-center gap-2 px-3 py-2 bg-danger bg-opacity-10 border-top"
        >
          <span class="d-inline-flex align-items-center gap-2 text-danger fw-bold small min-w-0">
            <i class="bi bi-trophy-fill flex-shrink-0"></i>
            <span class="text-break">{{ infoTorneo.torneo }}</span>
          </span>
          <span class="d-inline-flex align-items-center gap-1 text-muted small ms-md-auto">
            <i class="bi bi-calendar-event flex-shrink-0"></i>
            {{ infoTorneo.fecha_torneo }}
          </span>
        </div>
      </div>

      <!-- ================= BODY ================= -->
      <div class="card-body p-2 p-sm-3 p-md-4">

        <div v-if="cargando" class="text-center py-5">
          <span class="spinner-border text-danger"></span>
          <p class="text-muted mt-3 m-0 fw-bold small">Cargando tus designaciones...</p>
        </div>

        <template v-else>

          <!-- TABS: cada botón ocupa 50% en móvil, auto en desktop -->
          <ul class="nav nav-pills gap-2 mb-4 flex-nowrap">
            <li class="nav-item flex-fill flex-sm-grow-0">
              <button
                @click="vistaActiva = 'proximas'"
                class="nav-link w-100 py-2 px-2 px-sm-4 fw-bold small shadow-sm d-flex align-items-center justify-content-center gap-2"
                :class="vistaActiva === 'proximas' ? 'active bg-danger text-white' : 'bg-light border text-dark'"
              >
                <i class="bi bi-calendar-plus"></i>
                <span>Próximas</span>
                <span class="badge rounded-pill" :class="vistaActiva === 'proximas' ? 'bg-white text-danger' : 'bg-secondary'">{{ proximas.length }}</span>
              </button>
            </li>
            <li class="nav-item flex-fill flex-sm-grow-0">
              <button
                @click="vistaActiva = 'anteriores'"
                class="nav-link w-100 py-2 px-2 px-sm-4 fw-bold small shadow-sm d-flex align-items-center justify-content-center gap-2"
                :class="vistaActiva === 'anteriores' ? 'active bg-dark text-white' : 'bg-light border text-dark'"
              >
                <i class="bi bi-clock-history"></i>
                <span>Anteriores</span>
                <span class="badge rounded-pill" :class="vistaActiva === 'anteriores' ? 'bg-white text-dark' : 'bg-secondary'">{{ anteriores.length }}</span>
              </button>
            </li>
          </ul>

          <!-- ================= PROXIMAS ================= -->
          <div v-if="vistaActiva === 'proximas'">
            <div v-if="proximas.length === 0" class="text-center py-5 text-muted bg-light rounded-3">
              <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">event_busy</span>
              <p class="m-0 fw-bold">No tenés designaciones próximas.</p>
              <p class="small m-0 mt-1">Este fin de semana no fuiste designado.</p>
            </div>

            <div v-else v-for="dia in diasProximas" :key="'prox-' + dia.fecha" class="mb-4">
              <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <span class="badge bg-danger rounded-pill px-3 py-2 shadow-sm text-wrap text-start">
                  <i class="bi bi-calendar-day me-1"></i> {{ etiquetaDia(dia.fecha) }}
                </span>
                <span class="text-muted small fw-bold">{{ dia.partidos.length }} {{ dia.partidos.length === 1 ? 'partido' : 'partidos' }}</span>
              </div>

              <div class="timeline">
                <div v-for="p in dia.partidos" :key="p.id" class="timeline-item">
                  <div class="timeline-hora">
                    <span class="hora-burbuja">{{ formatearHora(p.horario) }}</span>
                  </div>
                  <div class="timeline-card shadow-sm" :class="{ 'card-rechazada': p.rechazada }">
                    <div class="d-flex justify-content-between align-items-start flex-wrap gap-1 mb-1">
                      <span class="fw-bold text-dark text-uppercase text-break">{{ p.local }} <span class="text-muted fw-normal">vs</span> {{ p.visitante }}</span>
                      <span class="badge bg-danger-subtle text-danger border border-danger-subtle text-wrap text-break text-start" style="font-size: 0.65rem;">{{ p.categoria_division }}</span>
                    </div>
                    <div class="small text-muted d-flex align-items-center flex-wrap gap-1 mb-2">
                      <span class="material-icons flex-shrink-0" style="font-size: 15px;">stadium</span>
                      <span class="fw-bold text-dark text-break">{{ p.cancha }}</span>

                      <a v-if="linkMapaCancha(p)"
                        :href="linkMapaCancha(p)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link-mapa-cancha"
                        title="Ver ubicación en Google Maps"
                      ><i class="bi bi-geo-alt-fill"></i> Ver Mapa</a>
                    </div>

                    <!-- FUNCION ARBITRO -->
                    <template v-if="p.funcion == 'arbitro'">
                      <div class="small d-flex align-items-start gap-1 text-dark">
                        <span class="material-icons text-danger flex-shrink-0" style="font-size: 15px;">groups</span>
                        <span class="text-break"><strong>Pareja:</strong> {{ obtenerPareja(p) }}</span>
                      </div>
                      <div v-if="p.delegado" class="small d-flex align-items-start gap-1 text-dark mt-1">
                        <span class="material-icons text-danger flex-shrink-0" style="font-size: 15px;">person</span>
                        <span class="text-break"><strong>Delegado Técnico:</strong> {{ p.delegado }}</span>
                      </div>
                    </template>

                    <!-- FUNCION DELEGADO -->
                    <template v-if="p.funcion == 'delegado'">
                      <div class="small d-flex align-items-start gap-1 text-dark mb-1">
                        <span class="material-icons text-danger flex-shrink-0" style="font-size: 15px;">person</span>
                        <span class="text-break"><strong>Función:</strong> Delegado Técnico</span>
                      </div>
                      <div class="small d-flex align-items-start gap-1 text-dark">
                        <span class="material-icons text-danger flex-shrink-0" style="font-size: 15px;">groups</span>
                        <span class="text-break"><strong>Arbitros:</strong> {{ p.arbitro_1 }} - {{ p.arbitro_2 }}</span>
                      </div>
                    </template>

                    <!-- ACCION / ESTADO DE RECHAZO + INFORME -->
                    <div class="mt-2 pt-2 border-top">
                      <div v-if="p.rechazada" class="mb-2">
                        <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <span class="badge d-inline-flex align-items-center gap-1" :class="badgeEstadoRechazo(p.rechazo_estado)">
                            <i class="bi" :class="iconoEstadoRechazo(p.rechazo_estado)"></i>
                            {{ textoEstadoRechazo(p.rechazo_estado) }}
                          </span>
                          <span v-if="p.rechazo_motivo" class="small text-muted fw-bold text-break">
                            {{ etiquetaMotivo(p.rechazo_motivo) }}
                          </span>
                        </div>
                        <p class="small mb-0 text-break" :class="claseTextoEstadoRechazo(p.rechazo_estado)">
                          {{ mensajeEstadoRechazo(p.rechazo_estado) }}
                        </p>
                      </div>

                      <!-- Botones de acción: rechazar + informe en la misma línea -->
                      <div class="d-flex flex-wrap align-items-center gap-2">
                        <button
                          v-if="!p.rechazada && (p.funcion == 'arbitro' || p.funcion == 'delegado')"
                          @click="abrirModalRechazo(p)"
                          class="btn btn-sm btn-outline-danger fw-bold d-inline-flex align-items-center gap-1"
                        >
                          <span class="material-icons" style="font-size: 15px;">block</span>
                          Rechazar designación
                        </button>

                        <!-- Informe con estado (si ya existe) -->
                        <template v-if="puedeInformar(p) && p.informe">
                          <span class="badge d-inline-flex align-items-center gap-1" :class="badgeEstadoInforme(p.informe.estado)">
                            <i class="bi" :class="iconoEstadoInforme(p.informe.estado)"></i>
                            Informe {{ textoEstadoInforme(p.informe.estado) }}
                          </span>
                          <button
                            v-if="p.informe.estado === 'creado' || p.informe.estado === 'pendiente'"
                            @click="abrirModalInforme(p)"
                            class="btn btn-sm btn-link text-danger fw-bold p-0 text-decoration-none"
                          >
                            <i class="bi bi-pencil-square me-1"></i>Editar
                          </button>
                        </template>

                        <!-- Informe sin cargar -->
                        <button
                          v-else-if="puedeInformar(p)"
                          @click="abrirModalInforme(p)"
                          class="btn btn-sm fw-bold d-inline-flex align-items-center gap-1 btn-informe"
                        >
                          <i class="bi bi-clipboard-plus"></i>
                          ¿Tu partido tuvo informe? Cargalo desde acá
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= ANTERIORES ================= -->
          <div v-else class="anteriores">
            <div v-if="anteriores.length === 0" class="text-center py-5 text-muted bg-light rounded-3">
              <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">history_toggle_off</span>
              <p class="m-0 fw-bold">Todavía no tenés designaciones anteriores.</p>
            </div>

            <template v-else>

              <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <span class="small fw-bold text-muted text-uppercase">Filtrar por año:</span>
                <select v-model="anioSeleccionado" class="form-select form-select-sm shadow-none w-auto fw-bold">
                  <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
                </select>
              </div>

              <div
                v-for="mes in mesesAnteriores"
                :key="mes.clave"
                class="card border shadow-sm mb-3 rounded-3 overflow-hidden"
              >
                <button
                  @click="toggleMes(mes.clave)"
                  class="acordeon-mes d-flex justify-content-between align-items-center w-100 px-3 py-2 gap-2"
                >
                  <span class="fw-bold text-dark d-flex align-items-center gap-2 text-truncate">
                    <i class="bi text-secondary flex-shrink-0" :class="mesesAbiertos.includes(mes.clave) ? 'bi-folder2-open' : 'bi-folder2'"></i>
                    <span class="text-truncate">{{ mes.etiqueta }}</span>
                  </span>
                  <span class="d-flex align-items-center gap-2 flex-shrink-0">
                    <span class="badge bg-secondary rounded-pill">{{ mes.cantidad }}</span>
                    <i class="bi text-muted" :class="mesesAbiertos.includes(mes.clave) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                  </span>
                </button>

                <div v-show="mesesAbiertos.includes(mes.clave)" class="p-2 p-sm-3 bg-light border-top">
                  <div v-for="dia in mes.dias" :key="'ant-' + dia.fecha" class="card border shadow-sm mb-2 rounded-3 overflow-hidden">

                    <button
                      @click="toggleDia(mes.clave, dia.fecha)"
                      class="acordeon-mes d-flex justify-content-between align-items-center w-100 px-2 px-sm-3 py-2 gap-2"
                    >
                      <span class="d-flex align-items-center gap-2 flex-wrap min-w-0">
                        <span class="badge bg-dark rounded-pill px-3 py-2 text-wrap text-start">
                          <i class="bi bi-calendar-day me-1"></i> {{ etiquetaDia(dia.fecha) }}
                        </span>
                        <span v-if="dia.partidos[0] && dia.partidos[0].torneo" class="badge bg-secondary-subtle text-secondary border rounded-pill px-2 py-1 d-none d-md-inline text-truncate">
                          <i class="bi bi-trophy me-1"></i> {{ dia.partidos[0].torneo }}
                        </span>
                      </span>
                      <span class="d-flex align-items-center gap-2 flex-shrink-0">
                        <span class="badge bg-secondary rounded-pill">{{ dia.partidos.length }}</span>
                        <i class="bi text-muted" :class="diaAbierto(mes.clave, dia.fecha) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                      </span>
                    </button>

                    <div v-show="diaAbierto(mes.clave, dia.fecha)" class="p-2 p-sm-3 border-top bg-white">
                      <div class="timeline">
                        <div v-for="p in dia.partidos" :key="p.id" class="timeline-item">
                          <div class="timeline-hora">
                            <span class="hora-burbuja">{{ formatearHora(p.horario) }}</span>
                          </div>
                          <div class="timeline-card shadow-sm" :class="{ 'card-rechazada': p.rechazada }">
                            <div class="d-flex justify-content-between align-items-start flex-wrap gap-1 mb-1">
                              <span class="fw-bold text-dark text-uppercase text-break">{{ p.local }} <span class="text-muted fw-normal">vs</span> {{ p.visitante }}</span>
                              <span class="badge bg-secondary-subtle text-secondary border text-wrap text-break text-start" style="font-size: 0.65rem;">{{ p.categoria_division }}</span>
                            </div>
                            <div class="small text-muted d-flex align-items-center flex-wrap gap-1 mb-2">
                              <span class="material-icons flex-shrink-0" style="font-size: 15px;">stadium</span>
                              <span class="fw-bold text-dark text-break">{{ p.cancha }}</span>

                              <a v-if="linkMapaCancha(p)"
                                :href="linkMapaCancha(p)"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="link-mapa-cancha"
                                title="Ver ubicación en Google Maps"
                              ><i class="bi bi-geo-alt-fill"></i> Ver Mapa</a>
                            </div>

                            <!-- FUNCION ARBITRO -->
                            <template v-if="p.funcion=='arbitro'">
                              <div class="small d-flex align-items-start gap-1 text-dark">
                                <span class="material-icons text-secondary flex-shrink-0" style="font-size: 15px;">groups</span>
                                <span class="text-break"><strong>Pareja:</strong> {{ obtenerPareja(p) }}</span>
                              </div>
                              <div v-if="p.delegado" class="small d-flex align-items-start gap-1 text-dark mt-1">
                                <span class="material-icons text-secondary flex-shrink-0" style="font-size: 15px;">person</span>
                                <span class="text-break"><strong>Delegado Técnico:</strong> {{ p.delegado }}</span>
                              </div>
                            </template>

                            <!-- FUNCION DELEGADO -->
                            <template v-if="p.funcion=='delegado'">
                              <div class="small d-flex align-items-start gap-1 text-dark mb-1">
                                <span class="material-icons text-secondary flex-shrink-0" style="font-size: 15px;">person</span>
                                <span class="text-break"><strong>Función:</strong> Delegado Técnico</span>
                              </div>
                              <div class="small d-flex align-items-start gap-1 text-dark">
                                <span class="material-icons text-secondary flex-shrink-0" style="font-size: 15px;">groups</span>
                                <span class="text-break"><strong>Arbitros:</strong> {{ p.arbitro_1 }} - {{ p.arbitro_2 }}</span>
                              </div>
                            </template>

                          <!-- ESTADO DE RECHAZO (solo lectura en anteriores) -->
                          <div v-if="p.rechazada" class="mt-2 pt-2 border-top">
                            <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                              <span class="badge d-inline-flex align-items-center gap-1" :class="badgeEstadoRechazo(p.rechazo_estado)">
                                <i class="bi" :class="iconoEstadoRechazo(p.rechazo_estado)"></i>
                                {{ textoEstadoRechazo(p.rechazo_estado) }}
                              </span>
                              <span v-if="p.rechazo_motivo" class="small text-muted fw-bold text-break">
                                {{ etiquetaMotivo(p.rechazo_motivo) }}
                              </span>
                            </div>
                            <p class="small mb-0 text-break" :class="claseTextoEstadoRechazo(p.rechazo_estado)">
                              {{ mensajeEstadoRechazo(p.rechazo_estado) }}
                            </p>
                          </div>

                          <!-- AVISO / ACCION DE INFORME -->
                          <div v-if="puedeInformar(p)" class="aviso-informe mt-2 pt-2 border-top">
                            <div v-if="p.informe" class="d-flex align-items-center gap-2 flex-wrap">
                              <span class="badge d-inline-flex align-items-center gap-1" :class="badgeEstadoInforme(p.informe.estado)">
                                <i class="bi" :class="iconoEstadoInforme(p.informe.estado)"></i>
                                Informe {{ textoEstadoInforme(p.informe.estado) }}
                              </span>
                              <button
                                v-if="p.informe.estado === 'creado' || p.informe.estado === 'pendiente'"
                                @click="abrirModalInforme(p)"
                                class="btn btn-sm btn-link text-danger fw-bold p-0 text-decoration-none"
                              >
                                <i class="bi bi-pencil-square me-1"></i>Editar
                              </button>
                            </div>
                            <button
                              v-else
                              @click="abrirModalInforme(p)"
                              class="btn btn-sm fw-bold d-inline-flex align-items-center gap-1 btn-informe"
                            >
                              <i class="bi bi-clipboard-plus"></i>
                              ¿Tu partido tuvo informe? Cargalo desde acá
                            </button>
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </template>
          </div>

        </template>

      </div>
    </div>

    <!-- ================= MODAL RECHAZAR DESIGNACION ================= -->
    <ModalBase
      :show="mostrarModalRechazo"
      titulo="Rechazar designación"
      icono="block"
      colorIcono="bg-danger text-white"
      maxWidth="520px"
      @close="cerrarModalRechazo"
    >
      <div v-if="partidoRechazo" class="alert alert-danger small py-2 px-3 d-flex align-items-start gap-2 mb-3">
        <i class="bi bi-exclamation-triangle-fill mt-1"></i>
        <span>
          Estás por rechazar el partido
          <strong>{{ partidoRechazo.local }} vs {{ partidoRechazo.visitante }}</strong>
          ({{ partidoRechazo.categoria_division }}) del {{ etiquetaDia(partidoRechazo.fecha) }}<template v-if="esDelegadoRechazo">, en tu función de <strong>Delegado Técnico</strong></template>.
        </span>
      </div>

      <!-- ARBITRO: lista de motivos predefinidos -->
      <template v-if="!esDelegadoRechazo">
        <label class="form-label small fw-bold text-dark mb-2">Seleccioná el motivo del rechazo *</label>
        <div class="lista-motivos border rounded mb-3">
          <label
            v-for="op in opcionesMotivo"
            :key="op.valor"
            class="opcion-motivo d-flex align-items-start gap-2"
            :class="{ activa: motivoSeleccionado === op.valor }"
          >
            <input
              type="radio"
              class="form-check-input mt-1 flex-shrink-0"
              :value="op.valor"
              v-model="motivoSeleccionado"
            >
            <span class="small">{{ op.etiqueta }}</span>
          </label>
        </div>

        <div v-if="motivoSeleccionado === 'otro'" class="mb-2">
          <label class="form-label small fw-bold text-dark mb-1">Escribí el motivo *</label>
          <textarea
            v-model="motivoOtro"
            class="form-control shadow-none border-secondary-subtle"
            rows="3"
            placeholder="Contanos brevemente el motivo del rechazo..."
          ></textarea>
        </div>
      </template>

      <!-- DELEGADO TECNICO: motivo de texto libre -->
      <template v-else>
        <label class="form-label small fw-bold text-dark mb-1">Escribí el motivo del rechazo *</label>
        <textarea
          v-model="motivoOtro"
          class="form-control shadow-none border-secondary-subtle"
          rows="4"
          placeholder="Contanos brevemente el motivo del rechazo..."
        ></textarea>
      </template>

      <template #footer>
        <button
          @click="cerrarModalRechazo"
          class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
          :disabled="enviandoRechazo"
        >
          Cancelar
        </button>
        <button
          @click="confirmarRechazo"
          class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100"
          :disabled="enviandoRechazo || !motivoValido"
        >
          <span v-if="enviandoRechazo" class="spinner-border spinner-border-sm me-2"></span>
          {{ enviandoRechazo ? 'Enviando...' : 'Confirmar rechazo' }}
        </button>
      </template>
    </ModalBase>

    <!-- ================= MODAL CARGAR INFORME ================= -->
    <ModalBase
      :show="mostrarModalInforme"
      :titulo="informeEsEdicion ? 'Editar informe del partido' : 'Cargar informe del partido'"
      icono="description"
      colorIcono="bg-danger text-white"
      maxWidth="640px"
      @close="cerrarModalInforme"
    >
      <div v-if="partidoInforme" class="informe-form">

        <!-- Datos automáticos (solo lectura) -->
        <div class="row g-2 mb-3">
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-bold text-dark mb-1">Fecha</label>
            <input type="text" class="form-control form-control-sm bg-light input-readonly" :value="etiquetaDia(partidoInforme.fecha)" readonly>
          </div>
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-bold text-dark mb-1">Categoría</label>
            <input type="text" class="form-control form-control-sm bg-light input-readonly" :value="partidoInforme.categoria_division || '-'" readonly>
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold text-dark mb-1">Encuentro</label>
            <input type="text" class="form-control form-control-sm bg-light input-readonly" :value="`${partidoInforme.local} vs ${partidoInforme.visitante}`" readonly>
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold text-dark mb-1">Árbitros</label>
            <input type="text" class="form-control form-control-sm bg-light input-readonly" :value="arbitrosDelPartido(partidoInforme)" readonly>
          </div>
        </div>

        <hr class="my-3">

        <!-- Datos a completar -->
        <div class="mb-3">
          <label class="form-label small fw-bold text-dark mb-1">Torneo *</label>
          <select v-model="formInforme.torneo" class="form-select form-select-sm shadow-none">
            <option value="" disabled>Seleccioná el torneo...</option>
            <option v-for="t in opcionesTorneo" :key="t.valor" :value="t.valor">{{ t.etiqueta }}</option>
          </select>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <label class="form-label small fw-bold text-dark mb-1">Implicado *</label>
            <input v-model="formInforme.implicado" type="text" class="form-control form-control-sm shadow-none" placeholder="Nombre del implicado">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-dark mb-1">Sanción *</label>
            <input v-model="formInforme.sancion" type="text" class="form-control form-control-sm shadow-none" placeholder="Ej: Descalificación con informe escrito...">
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold text-dark mb-1">Institución a la que pertenece *</label>
          <select v-model="formInforme.institucion" class="form-select form-select-sm shadow-none">
            <option value="" disabled>Seleccioná la institución...</option>
            <option value="local">{{ partidoInforme.local }}</option>
            <option value="visitante">{{ partidoInforme.visitante }}</option>
          </select>
        </div>

        <div class="mb-1">
          <label class="form-label small fw-bold text-dark mb-1">Motivo y descripción *</label>
          <textarea
            v-model="formInforme.motivo_descripcion"
            class="form-control shadow-none"
            rows="4"
            placeholder="Describí el motivo del informe con el mayor detalle posible..."
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button
          @click="cerrarModalInforme"
          class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
          :disabled="enviandoInforme"
        >
          Cancelar
        </button>
        <button
          @click="confirmarInforme"
          class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100"
          :disabled="enviandoInforme || !informeValido"
        >
          <span v-if="enviandoInforme" class="spinner-border spinner-border-sm me-2"></span>
          {{ enviandoInforme ? 'Guardando...' : (informeEsEdicion ? 'Guardar cambios' : 'Cargar informe') }}
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, inject } from 'vue'
import { api } from '@/api/api'
import { auth } from '../../../api/auth'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Mis Designaciones | AAAB',
  meta: [
    { name: 'description', content: 'Consultá los partidos que te fueron designados.' },
    { property: 'og:title', content: 'Mis Designaciones | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' }
  ],
})

const toast = inject('toast', ({ mensaje }) => alert(mensaje))

const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']

// Motivos de rechazo compartidos (mismo listado que usa la sección de admin)
const opcionesMotivo = [
  { valor: 'no_llego', etiqueta: 'No llego a jugar' },
  { valor: 'club_vinculo', etiqueta: 'No puedo pitar ese club (jugué ahí o vínculo personal)' },
  { valor: 'club_otra', etiqueta: 'No puedo pitar ese club (problema de otra índole)' },
  { valor: 'licencia', etiqueta: 'Tengo licencia aprobada' },
  { valor: 'fuera_horario', etiqueta: 'Estoy designado fuera de mi disponibilidad horaria' },
  { valor: 'otro', etiqueta: 'Otro (escribir motivo)' }
]

const etiquetaMotivo = (valor) => {
  const op = opcionesMotivo.find(o => o.valor === valor)
  return op ? op.etiqueta : valor
}

// Estado del rechazo tal como lo resuelve la asociación
const textoEstadoRechazo = (estado) => {
  if (estado === 'justificado') return 'Rechazo justificado'
  if (estado === 'injustificado') return 'Rechazo injustificado'
  return 'Rechazo registrado'
}

const mensajeEstadoRechazo = (estado) => {
  if (estado === 'justificado') return 'Tu motivo fue justificado. No fuiste enviado al Tribunal de Ética.'
  if (estado === 'injustificado') return 'Tu motivo fue considerado injustificado. Fuiste enviado al Tribunal de Ética.'
  return 'Tu rechazo fue registrado y está pendiente de revisión por la asociación.'
}

const badgeEstadoRechazo = (estado) => {
  if (estado === 'justificado') return 'bg-success'
  if (estado === 'injustificado') return 'bg-danger'
  return 'bg-warning text-dark'
}

const iconoEstadoRechazo = (estado) => {
  if (estado === 'justificado') return 'bi-check-circle-fill'
  if (estado === 'injustificado') return 'bi-exclamation-octagon-fill'
  return 'bi-hourglass-split'
}

const claseTextoEstadoRechazo = (estado) => {
  if (estado === 'justificado') return 'text-dark'
  if (estado === 'injustificado') return 'text-dark'
  return 'text-dark'
}

const arbitro = ref(auth.getUser() || {})
const partidos = ref([])
const cargando = ref(false)
const vistaActiva = ref('proximas')

const anioSeleccionado = ref('')
const mesesAbiertos = ref([])
const diasAbiertos = ref([])

const cargarMisDesignaciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerDesignacionesArbitro'
    })
    if ((res.ok || res.success) && res.payload) {
      partidos.value = res.payload.map(normalizarRechazo)

      // Si no hay próximas pero sí historial, arrancamos en Anteriores
      if (proximas.value.length === 0 && anteriores.value.length > 0) {
        vistaActiva.value = 'anteriores'
      }
    }
  } catch (err) {
    console.error('Error al cargar mis designaciones:', err)
  } finally {
    cargando.value = false
  }
}

// Normaliza los campos de rechazo que devuelve el backend por partido
const normalizarRechazo = (p) => ({
  ...p,
  rechazada: p.rechazada === true || p.rechazada === 1 || p.rechazada === '1' || !!p.id_rechazo,
  id_rechazo: p.id_rechazo || null,
  rechazo_motivo: p.rechazo_motivo || p.motivo_rechazo || '',
  rechazo_estado: p.rechazo_estado || 'creado',
  // Informe asociado al partido (si el backend lo devuelve)
  informe: p.informe || null
})

/* ====================================================
   FECHAS
   ==================================================== */
const parsearFecha = (fecha) => {
  if (!fecha) return 0
  const texto = String(fecha).trim().slice(0, 10)

  let m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()

  m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    const anio = m[3].length === 2 ? '20' + m[3] : m[3]
    return new Date(Number(anio), Number(m[2]) - 1, Number(m[1])).getTime()
  }

  return 0
}

const linkMapaCancha = (p) => {
  const direccion = [p.cj_domicilio, p.cj_localidad].filter(Boolean).join(', ').trim()
  return direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}` : null
}

const etiquetaDia = (fecha) => {
  const timestamp = parsearFecha(fecha)
  if (!timestamp) return fecha || 'Sin fecha'
  const d = new Date(timestamp)
  const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dias[d.getDay()]} ${dd}/${mm}/${d.getFullYear()}`
}

const formatearHora = (horario) => {
  if (!horario) return '--:--'
  return String(horario).slice(0, 5)
}

const fechaLimpia = (fecha) => {
  const f = String(fecha || '').trim().slice(0, 10)
  return (!f || f.startsWith('0000')) ? '' : f
}

const hoy = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/* ====================================================
   PROXIMAS / ANTERIORES
   ==================================================== */
const proximas = computed(() => {
  return partidos.value.filter(p => {
    const t = parsearFecha(fechaLimpia(p.fecha))
    return !t || t >= hoy()
  })
})

const anteriores = computed(() => {
  return partidos.value.filter(p => {
    const t = parsearFecha(fechaLimpia(p.fecha))
    return t && t < hoy()
  })
})

const agruparPorDia = (lista, orden) => {
  const mapa = {}
  lista.forEach(p => {
    const f = fechaLimpia(p.fecha) || 'Sin fecha'
    if (!mapa[f]) mapa[f] = []
    mapa[f].push(p)
  })

  return Object.keys(mapa)
    .sort((a, b) => orden === 'desc' ? parsearFecha(b) - parsearFecha(a) : parsearFecha(a) - parsearFecha(b))
    .map(fecha => ({
      fecha,
      partidos: mapa[fecha].sort((a, b) => String(a.horario || '').localeCompare(String(b.horario || '')))
    }))
}

const diasProximas = computed(() => agruparPorDia(proximas.value, 'asc'))

const infoTorneo = computed(() => {
  if (proximas.value.length === 0) return null
  const primero = proximas.value[0]
  if (!primero.torneo && !primero.fecha_torneo) return null
  return { torneo: primero.torneo, fecha_torneo: primero.fecha_torneo }
})

/* ====================================================
   ANTERIORES: FILTRO POR AÑO + MESES COLAPSABLES
   ==================================================== */
const aniosDisponibles = computed(() => {
  const anios = new Set()
  anteriores.value.forEach(p => {
    const f = fechaLimpia(p.fecha)
    if (f) anios.add(f.slice(0, 4))
  })
  return [...anios].sort((a, b) => b.localeCompare(a))
})

watch(aniosDisponibles, (anios) => {
  if (!anios.includes(anioSeleccionado.value)) {
    anioSeleccionado.value = anios.length > 0 ? anios[0] : ''
  }
}, { immediate: true })

const mesesAnteriores = computed(() => {
  const mapa = {}
  anteriores.value.forEach(p => {
    const f = fechaLimpia(p.fecha)
    if (!f || f.slice(0, 4) !== anioSeleccionado.value) return
    const clave = f.slice(0, 7) // YYYY-MM
    if (!mapa[clave]) mapa[clave] = []
    mapa[clave].push(p)
  })

  return Object.keys(mapa)
    .sort((a, b) => b.localeCompare(a))
    .map(clave => ({
      clave,
      etiqueta: `${MESES[Number(clave.slice(5, 7)) - 1]} ${clave.slice(0, 4)}`,
      cantidad: mapa[clave].length,
      dias: agruparPorDia(mapa[clave], 'desc')
    }))
})

// Al cambiar de año, todo arranca colapsado
watch(anioSeleccionado, () => {
  mesesAbiertos.value = []
  diasAbiertos.value = []
})

const toggleMes = (clave) => {
  const idx = mesesAbiertos.value.indexOf(clave)
  if (idx === -1) mesesAbiertos.value.push(clave)
  else mesesAbiertos.value.splice(idx, 1)
}

const claveDia = (mesClave, fecha) => `${mesClave}|${fecha}`

const diaAbierto = (mesClave, fecha) => diasAbiertos.value.includes(claveDia(mesClave, fecha))

const toggleDia = (mesClave, fecha) => {
  const clave = claveDia(mesClave, fecha)
  const idx = diasAbiertos.value.indexOf(clave)
  if (idx === -1) diasAbiertos.value.push(clave)
  else diasAbiertos.value.splice(idx, 1)
}

const obtenerPareja = (p) => {
  const miId = String(arbitro.value.id)
  if (String(p.id_arb1) === miId) return p.arbitro_2 || 'Sin pareja asignada'
  if (String(p.id_arb2) === miId) return p.arbitro_1 || 'Sin pareja asignada'
  return p.arbitro_2 || p.arbitro_1 || '-'
}

/* ====================================================
   RECHAZO DE DESIGNACION
   ==================================================== */
const mostrarModalRechazo = ref(false)
const partidoRechazo = ref(null)
const motivoSeleccionado = ref('')
const motivoOtro = ref('')
const enviandoRechazo = ref(false)

// El delegado técnico rechaza con motivo de texto libre; el árbitro con lista de opciones.
const esDelegadoRechazo = computed(() => partidoRechazo.value?.funcion == 'delegado')

const motivoValido = computed(() => {
  if (esDelegadoRechazo.value) return motivoOtro.value.trim().length > 0
  if (!motivoSeleccionado.value) return false
  if (motivoSeleccionado.value === 'otro') return motivoOtro.value.trim().length > 0
  return true
})

const abrirModalRechazo = (partido) => {
  partidoRechazo.value = partido
  motivoSeleccionado.value = ''
  motivoOtro.value = ''
  mostrarModalRechazo.value = true
}

const cerrarModalRechazo = () => {
  mostrarModalRechazo.value = false
  partidoRechazo.value = null
}

const confirmarRechazo = async () => {
  if (!motivoValido.value || !partidoRechazo.value) return

  const p = partidoRechazo.value
  const motivo = (esDelegadoRechazo.value || motivoSeleccionado.value === 'otro')
    ? motivoOtro.value.trim()
    : motivoSeleccionado.value

  enviandoRechazo.value = true
  try {
    const res = await api.post({
      entity: 'designaciones',
      action: 'rechazarDesignacion',
      payload: {
        idPartido: p.id,
        motivo,
        funcion: p.funcion,
        id_arb1: p.id_arb1,
        id_arb2: p.id_arb2,
      }
    })
  if (res.ok) {
      // Marca optimista: la card queda en rojo
      p.rechazada = true
      p.rechazo_motivo = motivo
      p.rechazo_estado = 'creado'
      p.id_rechazo = (res.payload) ? res.payload : p.id_rechazo
      cerrarModalRechazo()
      toast({ titulo: 'Designación rechazada', mensaje: 'Se registró el rechazo. La asociación fue notificada.', tipo: 'success' })
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al rechazar designación:', err)
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo registrar el rechazo.', tipo: 'danger' })
  } finally {
    enviandoRechazo.value = false
  }
}

/* ====================================================
   INFORME DE PARTIDO
   ==================================================== */
const opcionesTorneo = [
  { valor: 'metropolitano_apertura', etiqueta: 'Metropolitano Apertura' },
  { valor: 'metropolitano_clausura', etiqueta: 'Metropolitano Clausura' },
  { valor: 'super_8', etiqueta: 'Super 8' },
  { valor: 'copa_campeones', etiqueta: 'Copa de Campeones' },
  { valor: 'desarrollo_apertura', etiqueta: 'Torneo Desarrollo Apertura' },
  { valor: 'desarrollo_clausura', etiqueta: 'Torneo Desarrollo Clausura' },
  { valor: 'otros', etiqueta: 'Otros' }
]

// Estados del informe (mismos que ve el coordinador)
const textoEstadoInforme = (estado) => {
  if (estado === 'aprobado') return 'aprobado'
  if (estado === 'anulado') return 'anulado'
  if (estado === 'pendiente') return 'pendiente'
  return 'creado'
}
const badgeEstadoInforme = (estado) => {
  if (estado === 'aprobado') return 'bg-success'
  if (estado === 'anulado') return 'bg-secondary'
  if (estado === 'pendiente') return 'bg-warning text-dark'
  return 'bg-info text-dark'
}
const iconoEstadoInforme = (estado) => {
  if (estado === 'aprobado') return 'bi-check-circle-fill'
  if (estado === 'anulado') return 'bi-x-circle-fill'
  if (estado === 'pendiente') return 'bi-hourglass-split'
  return 'bi-file-earmark-text-fill'
}

// Solo el árbitro (no el delegado) puede cargar informe
const puedeInformar = (p) => p.funcion === 'arbitro'

const arbitrosDelPartido = (p) => [p.arbitro_1, p.arbitro_2].filter(Boolean).join(' - ') || '-'

const mostrarModalInforme = ref(false)
const partidoInforme = ref(null)
const enviandoInforme = ref(false)
const informeEsEdicion = ref(false)

const formInforme = ref({
  torneo: '',
  implicado: '',
  sancion: '',
  institucion: '',
  motivo_descripcion: ''
})

const informeValido = computed(() => {
  const f = formInforme.value
  return f.torneo && f.implicado.trim() && f.sancion.trim() && f.institucion && f.motivo_descripcion.trim()
})

const abrirModalInforme = (partido) => {
  partidoInforme.value = partido
  if (partido.informe) {
    informeEsEdicion.value = true
    formInforme.value = {
      torneo: partido.informe.torneo || '',
      implicado: partido.informe.implicado || '',
      sancion: partido.informe.sancion || '',
      institucion: partido.informe.institucion || '',
      motivo_descripcion: partido.informe.motivo_descripcion || ''
    }
  } else {
    informeEsEdicion.value = false
    formInforme.value = { torneo: '', implicado: '', sancion: '', institucion: '', motivo_descripcion: '' }
  }
  mostrarModalInforme.value = true
}

const cerrarModalInforme = () => {
  mostrarModalInforme.value = false
  partidoInforme.value = null
}

const confirmarInforme = async () => {
  if (!informeValido.value || !partidoInforme.value) return

  const p = partidoInforme.value
  const f = formInforme.value
  const institucionNombre = f.institucion === 'local' ? p.local : p.visitante

  enviandoInforme.value = true
  try {
    const res = await api.post({
      entity: 'informes',
      action: informeEsEdicion.value ? 'actualizarInforme' : 'crearInforme',
      payload: {
        id_informe: p.informe ? p.informe.id : null,
        id_partido: p.id,
        fecha_partido: fechaLimpia(p.fecha),
        encuentro: `${p.local} vs ${p.visitante}`,
        equipo_local: p.local,
        equipo_visitante: p.visitante,
        categoria: p.categoria_division || '',
        arbitros: arbitrosDelPartido(p),
        torneo: f.torneo,
        implicado: f.implicado.trim(),
        sancion: f.sancion.trim(),
        institucion: f.institucion,
        institucion_nombre: institucionNombre,
        motivo_descripcion: f.motivo_descripcion.trim()
      }
    })
    if (res.ok || res.success) {
      // Marca optimista en la card
      p.informe = {
        id: (res.payload && res.payload.id) ? res.payload.id : (p.informe ? p.informe.id : null),
        estado: p.informe ? p.informe.estado : 'creado',
        torneo: f.torneo,
        implicado: f.implicado.trim(),
        sancion: f.sancion.trim(),
        institucion: f.institucion,
        institucion_nombre: institucionNombre,
        motivo_descripcion: f.motivo_descripcion.trim()
      }
      cerrarModalInforme()
      toast({
        titulo: informeEsEdicion.value ? 'Informe actualizado' : 'Informe cargado',
        mensaje: informeEsEdicion.value
          ? 'Se guardaron los cambios del informe.'
          : 'El informe fue enviado al coordinador de tu grupo.',
        tipo: 'success'
      })
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al guardar informe:', err)
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo guardar el informe.', tipo: 'danger' })
  } finally {
    enviandoInforme.value = false
  }
}

onMounted(cargarMisDesignaciones)
</script>

<style scoped>
/* Evita cualquier scroll horizontal por hijos anchos */
.container-fluid {
  overflow-x: hidden;
}

/* Utilidad: permite que un flex-item encoja bajo su contenido (Bootstrap no la trae) */
.min-w-0 {
  min-width: 0;
}

/* ====================================================
   VISTA TIMELINE
   ==================================================== */
.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 10px;
  position: relative;
  padding-bottom: 16px;
}

/* Línea vertical que conecta los partidos del día */
.timeline-item::before {
  content: '';
  position: absolute;
  left: 28px;
  top: 34px;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item:last-child::before {
  display: none;
}

/* Hora: más angosta en móvil, 70px desde tablet */
.timeline-hora {
  width: 56px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.hora-burbuja {
  display: block;
  background: #dc2626;
  color: #fff;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.75rem;
  text-align: center;
  padding: 5px 0;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
}

/* min-width:0 permite que la card encoja y el texto haga wrap */
.timeline-card {
  flex: 1 1 auto;
  min-width: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #dc2626;
  border-radius: 10px;
  padding: 10px 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
}

/* Card de un partido rechazado: fondo rojo (como el estado reemplazar) */
.timeline-card.card-rechazada {
  background-color: #fee2e2 !important;
  border-color: #ef4444 !important;
  border-left-color: #dc2626 !important;
}

.link-mapa-cancha {
  font-size: 0.7rem;
  font-weight: 700;
  color: #dc2626;
  text-decoration: none;
  white-space: nowrap;
  margin-left: 2px;
}

.link-mapa-cancha:hover {
  text-decoration: underline;
  color: #dc2626;
}

/* Variante apagada para las designaciones anteriores */
.anteriores .hora-burbuja {
  background: #6b7280;
  box-shadow: 0 2px 6px rgba(107, 114, 128, 0.3);
}

.anteriores .timeline-card {
  border-left-color: #9ca3af;
  background: #fff;
}

/* El rechazo pinta de rojo aun en anteriores */
.anteriores .timeline-card.card-rechazada {
  background-color: #fee2e2 !important;
  border-color: #ef4444 !important;
  border-left-color: #dc2626 !important;
}

/* ====================================================
   ACORDEON DE MESES (ANTERIORES)
   ==================================================== */
.acordeon-mes {
  background: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.acordeon-mes:hover {
  background: #f8fafc;
}

/* ====================================================
   MODAL DE MOTIVOS DE RECHAZO
   ==================================================== */
.lista-motivos {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.opcion-motivo {
  background: #fff;
  border-bottom: 1px solid #f1f3f5;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  margin: 0;
}

.opcion-motivo:last-child {
  border-bottom: none;
}

.opcion-motivo:hover {
  background: #fef2f2;
}

.opcion-motivo.activa {
  background: #fee2e2;
  font-weight: 600;
}

/* ====================================================
   AVISO / BOTON DE INFORME
   ==================================================== */
.btn-informe {
  border: 1px dashed #dc2626;
  color: #dc2626;
  background: #fff5f5;
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 0.75rem;
  transition: background-color 0.15s ease;
}

.btn-informe:hover {
  background: #fee2e2;
  color: #b91c1c;
}

/* ====================================================
   MODAL DE INFORME
   ==================================================== */
/* Inputs de solo lectura: sin borde azul de foco */
.input-readonly {
  cursor: default;
}

.input-readonly:focus {
  border-color: #dee2e6;
  box-shadow: none;
}

.animate__animated { animation-duration: 0.5s; }

@media (min-width: 576px) {
  .timeline-hora { width: 70px; }
  .timeline-item { gap: 14px; }
  .timeline-item::before { left: 34px; }
  .timeline-card { padding: 10px 14px; }
  .hora-burbuja { font-size: 0.8rem; }
}
</style>
