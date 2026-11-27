<template>
  <div>
    <!-- Selector del video (fuera de los bloques: lo usan el modo video y la sincronización en vivo) -->
    <input ref="inputVideo" type="file" accept="video/*" class="d-none" aria-hidden="true" tabindex="-1" @change="elegirVideo">

    <!-- ============ DATOS DEL PARTIDO + MODO ============ -->
    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-5">
        <label for="tv-partido" class="form-label small fw-bold">Partido</label>
        <input id="tv-partido" v-model="sesion.partido" type="text" maxlength="80" class="form-control" placeholder="Ej: River vs. Ferro — Liga de Honor">
      </div>
      <div class="col-6 col-md-3">
        <label for="tv-fecha" class="form-label small fw-bold">Fecha</label>
        <input id="tv-fecha" v-model="sesion.fecha" type="date" class="form-control">
      </div>
      <div class="col-6 col-md-4">
        <span class="form-label small fw-bold d-block">Modo</span>
        <div class="selector-modo" role="tablist" aria-label="Modo de análisis">
          <button type="button" role="tab" :aria-selected="sesion.modo === 'video'" :class="{ activo: sesion.modo === 'video' }" @click="cambiarModo('video')">
            <i class="bi bi-film" aria-hidden="true"></i> Video
          </button>
          <button type="button" role="tab" :aria-selected="sesion.modo === 'vivo'" :class="{ activo: sesion.modo === 'vivo' }" @click="cambiarModo('vivo')">
            <i class="bi bi-stopwatch" aria-hidden="true"></i> En vivo
          </button>
        </div>
      </div>
    </div>

    <!-- ============ EVENTO: guardar y retomar después ============ -->
    <div class="barra-eventos mb-3">
      <button type="button" class="btn btn-sm btn-danger rounded-pill fw-bold" :disabled="!sesion.tags.length || guardandoEvento" @click="guardarEventoActual">
        <span v-if="guardandoEvento" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <i v-else class="bi bi-floppy" aria-hidden="true"></i> {{ sesion.idEvento ? 'Guardar cambios' : 'Guardar evento' }}
      </button>
      <button type="button" class="btn btn-sm btn-light border fw-bold" @click="abrirMisEventos">
        <i class="bi bi-folder2-open" aria-hidden="true"></i> Mis eventos <span class="badge bg-dark ms-1">{{ eventos.length }}</span>
      </button>
      <span v-if="hayCambiosSinGuardar" class="small fw-semibold texto-aviso"><i class="bi bi-exclamation-circle" aria-hidden="true"></i> Tags sin guardar</span>
      <span v-else-if="sesion.idEvento" class="small fw-semibold text-success"><i class="bi bi-check-circle" aria-hidden="true"></i> Evento guardado</span>
    </div>

    <div class="row g-3">
      <!-- ============ COLUMNA PRINCIPAL ============ -->
      <div class="col-12 col-xl-8">

        <!-- Video del partido (modo video, y en vivo para sincronizar) -->
        <section v-if="sesion.modo === 'video' || mostrarVideoEnVivo" class="bloque mb-3">
          <div v-if="!video.url" class="zona-video-vacia">
            <i class="bi bi-camera-video" aria-hidden="true"></i>
            <p class="fw-bold mb-1">Cargá el video del partido</p>
            <p class="small text-muted mb-3">
              Puede ser el partido completo o un solo tiempo (MP4). Si lo cargás por tiempos, usá un evento para cada uno.
              Por ahora se reproduce desde tu computadora.
            </p>
            <button type="button" class="btn btn-danger rounded-pill fw-bold px-4" @click="inputVideo?.click()">
              <i class="bi bi-upload" aria-hidden="true"></i> Elegir video
            </button>
          </div>

          <template v-else>
            <div class="marco-video">
              <video ref="videoRef" :src="video.url" controls playsinline preload="metadata"
                     @loadedmetadata="alCargarMetadatos" @timeupdate="alAvanzarVideo" @play="reproduciendo = true" @pause="reproduciendo = false"
                     @error="formatoNoCompatible = true"></video>
              <span v-if="ultimoTag" class="aviso-tag" :style="{ background: colorTag(ultimoTag.color).solido }">
                <i class="bi bi-bookmark-fill" aria-hidden="true"></i> {{ ultimoTag.nombre }} · {{ formatearTiempo(ultimoTag.segundo ?? ultimoTag.segundoReloj) }}
              </span>
              <span v-if="finPrevia !== null" class="aviso-previa">Viendo clip · termina en {{ formatearTiempo(finPrevia) }}</span>
            </div>

            <!-- Línea de tiempo con los clips marcados -->
            <div class="linea-tiempo mt-2" role="slider" tabindex="0" aria-label="Línea de tiempo del partido"
                 :aria-valuemin="0" :aria-valuemax="video.duracion" :aria-valuenow="Math.floor(tiempoActual)"
                 :aria-valuetext="formatearTiempo(tiempoActual)" @click="saltarConClick">
              <span v-for="m in marcasLinea" :key="m.id" class="marca-clip" :style="m.estilo" :title="m.titulo"></span>
              <span class="cabezal" :style="{ left: porcentaje(tiempoActual) + '%' }"></span>
            </div>

            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
              <div class="d-flex flex-wrap align-items-center gap-1">
                <button type="button" class="btn btn-sm btn-light border" title="Atrás 5 s (←)" @click="mover(-5)">-5s</button>
                <button type="button" class="btn btn-sm btn-light border" title="Cuadro anterior (,)" aria-label="Cuadro anterior" @click="pasoCuadro(-1)">
                  <i class="bi bi-skip-start-fill" aria-hidden="true"></i>
                </button>
                <button type="button" class="btn btn-sm btn-dark fw-bold px-3" :aria-label="reproduciendo ? 'Pausar' : 'Reproducir'" @click="alternarReproduccion">
                  <i :class="['bi', reproduciendo ? 'bi-pause-fill' : 'bi-play-fill']" aria-hidden="true"></i>
                </button>
                <button type="button" class="btn btn-sm btn-light border" title="Cuadro siguiente (.)" aria-label="Cuadro siguiente" @click="pasoCuadro(1)">
                  <i class="bi bi-skip-end-fill" aria-hidden="true"></i>
                </button>
                <button type="button" class="btn btn-sm btn-light border" title="Adelante 5 s (→)" @click="mover(5)">+5s</button>
                <span class="tiempo">{{ formatearTiempo(tiempoActual) }} / {{ formatearTiempo(video.duracion) }}</span>
              </div>
              <div class="d-flex align-items-center gap-1">
                <div class="btn-group btn-group-sm" role="group" aria-label="Velocidad">
                  <button v-for="v in VELOCIDADES" :key="v" type="button" class="btn" :class="velocidad === v ? 'btn-danger' : 'btn-outline-danger'" @click="cambiarVelocidad(v)">{{ v }}x</button>
                </div>
                <button type="button" class="btn btn-sm btn-light border" title="Cambiar video" aria-label="Cambiar video" @click="inputVideo?.click()">
                  <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <p class="small text-muted mt-1 mb-0 text-truncate"><i class="bi bi-file-earmark-play" aria-hidden="true"></i> {{ video.nombre }}</p>
            <div v-if="formatoNoCompatible" class="alert alert-warning small py-2 mt-2 mb-0" role="alert">
              <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
              Este navegador no puede reproducir este video (pasa con algunos videos de iPhone o WhatsApp, en HEVC o .mov).
              Probá abrirlo desde Chrome en el celular, o convertilo a MP4 (H.264) antes de analizarlo.
            </div>
          </template>
        </section>

        <!-- Otras cámaras del mismo partido (solo en modo video, con la principal cargada) -->
        <CamarasPartido v-if="sesion.modo === 'video' && video.url" :principal="videoRef" :reproduciendo="reproduciendo"
                        :tiempo="tiempoActual" :velocidad="velocidad" />

        <!-- Cronómetro (modo en vivo) -->
        <section v-if="sesion.modo === 'vivo'" class="bloque bloque-oscuro mb-3">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="estado-vivo" :class="{ corriendo: sesion.reloj.corriendo }">
              <span class="punto" aria-hidden="true"></span>
              {{ sesion.reloj.corriendo ? 'Marcando en vivo' : (segundosReloj ? 'En pausa' : 'Listo para empezar') }}
            </span>
            <span v-if="sesion.sincronizacion !== null" class="badge bg-success">
              <i class="bi bi-link-45deg" aria-hidden="true"></i> Sincronizado: el cronómetro arranca en el {{ formatearTiempo(sesion.sincronizacion) }} del video
            </span>
          </div>

          <div class="reloj" aria-live="off">{{ formatearTiempo(segundosReloj) }}</div>

          <div class="d-flex flex-wrap justify-content-center gap-2">
            <button v-if="!sesion.reloj.corriendo" type="button" class="btn btn-danger rounded-pill fw-bold px-4" @click="iniciarReloj">
              <i class="bi bi-play-fill" aria-hidden="true"></i> {{ segundosReloj ? 'Seguir' : 'Iniciar con el pitazo' }}
            </button>
            <button v-else type="button" class="btn btn-light fw-bold px-4" @click="pausarReloj">
              <i class="bi bi-pause-fill" aria-hidden="true"></i> Pausar
            </button>
            <button type="button" class="btn btn-outline-light fw-bold" :disabled="sesion.reloj.corriendo || !segundosReloj" @click="confirmarReinicioReloj">
              <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Reiniciar
            </button>
          </div>
          <p class="nota-vivo">
            Iniciá el cronómetro con el pitazo inicial. Vos elegís cómo seguir:
            si vas a cargar el partido completo en un solo video, dejalo correr también en el entretiempo;
            si lo vas a cargar por tiempos, al terminar el primer tiempo guardá el evento y empezá uno nuevo
            para el segundo, con el cronómetro desde cero en su pitazo inicial.
            Podés pausarlo en un tiempo muerto: los clips se ubican igual, con la hora real desde el pitazo.
            Lo que marques queda guardado en este dispositivo aunque se corte internet.
          </p>

          <!-- Sincronización con el video -->
          <div class="sincronizar">
            <h3 class="sincronizar-titulo"><i class="bi bi-link-45deg" aria-hidden="true"></i> Sincronizar con el video</h3>
            <ol class="small mb-2 ps-3">
              <li>Cargá el video de este evento: el partido completo o el tiempo que marcaste.</li>
              <li>Llevalo hasta el pitazo con el que iniciaste el cronómetro.</li>
              <li>Tocá <strong>“Sincronizar acá”</strong>, o escribí ese momento a mano.</li>
            </ol>
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <button v-if="!video.url" type="button" class="btn btn-light btn-sm fw-bold" @click="inputVideo?.click()">
                <i class="bi bi-upload" aria-hidden="true"></i> Cargar video
              </button>
              <template v-else>
                <button type="button" class="btn btn-light btn-sm fw-bold" @click="mostrarVideoEnVivo = !mostrarVideoEnVivo">
                  <i :class="['bi', mostrarVideoEnVivo ? 'bi-eye-slash' : 'bi-eye']" aria-hidden="true"></i> {{ mostrarVideoEnVivo ? 'Ocultar video' : 'Ver video' }}
                </button>
                <button type="button" class="btn btn-success btn-sm fw-bold" :disabled="!mostrarVideoEnVivo" @click="sincronizarAca">
                  Sincronizar acá ({{ formatearTiempo(tiempoActual) }})
                </button>
              </template>
              <div class="d-flex align-items-center gap-1">
                <label for="tv-sync-manual" class="small">o en</label>
                <input id="tv-sync-manual" v-model="syncManual" type="text" inputmode="numeric" class="form-control form-control-sm input-tiempo" placeholder="mm:ss">
                <button type="button" class="btn btn-outline-light btn-sm fw-bold" @click="sincronizarManual">Aplicar</button>
              </div>
            </div>
            <p v-if="errorSync" class="text-warning small fw-semibold mt-2 mb-0" role="alert">{{ errorSync }}</p>
          </div>
        </section>

        <!-- Pad de tags -->
        <section class="bloque">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <h3 class="titulo-bloque m-0">Marcar situación</h3>
            <span class="small text-muted d-none d-md-inline">Video: <kbd class="tecla">Espacio</kbd> play/pausa · <kbd class="tecla">←</kbd><kbd class="tecla">→</kbd> 5 s · <kbd class="tecla">,</kbd><kbd class="tecla">.</kbd> cuadro</span>
          </div>
          <p v-if="motivoPadDeshabilitado" class="small text-muted mb-2"><i class="bi bi-info-circle" aria-hidden="true"></i> {{ motivoPadDeshabilitado }}</p>
          <!-- Celular y app: botones cuadrados, 3 por fila. Escritorio: botones anchos -->
          <div v-if="botones.length" class="pad">
            <button v-for="b in botones" :key="b.id" type="button" class="boton-tag"
                    :class="{ destello: destelloId === b.id }" :disabled="!!motivoPadDeshabilitado"
                    :style="{ background: colorTag(b.color).fondo, color: colorTag(b.color).texto, borderColor: colorTag(b.color).solido }"
                    @click="marcar(b)">
              <span class="nombre-tag" lang="es" :title="b.nombre">{{ conCortesDeSilaba(b.nombre) }}</span>
            </button>
          </div>
          <EstadoVacio v-if="!botones.length" icono="bi-ui-checks-grid" titulo="Tu panel no tiene botones" mensaje="Agregalos en el paso 1 · Mi panel." />
        </section>
      </div>

      <!-- ============ CLIPS MARCADOS ============ -->
      <aside class="col-12 col-xl-4">
        <section class="bloque lista-clips">
          <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
            <h3 class="titulo-bloque m-0">Clips <span class="badge bg-dark">{{ sesion.tags.length }}</span></h3>
            <button v-if="sesion.tags.length" type="button" class="btn btn-sm btn-link text-danger fw-bold p-0" @click="confirmarNuevaSesion">Nueva sesión</button>
          </div>

          <!-- Resumen del evento: cuántas veces se marcó cada situación -->
          <div v-if="resumenEvento.length" class="resumen-evento mb-2" aria-label="Resumen del evento">
            <div v-for="r in resumenEvento" :key="r.nombre" class="fila-resumen" :title="`${r.nombre}: ${r.cantidad}`">
              <span class="nombre-resumen text-truncate">{{ r.nombre }}</span>
              <span class="pista-resumen"><span class="barra-resumen" :style="{ width: (r.cantidad / maximoResumen) * 100 + '%' }"></span></span>
              <span class="cantidad-resumen">{{ r.cantidad }}</span>
            </div>
          </div>

          <div v-if="tagsSinSincronizar.length" class="alert alert-warning small py-2 mb-2">
            {{ tagsSinSincronizar.length }} {{ tagsSinSincronizar.length === 1 ? 'tag marcado en vivo' : 'tags marcados en vivo' }} sin sincronizar con el video.
          </div>

          <EstadoVacio v-if="!sesion.tags.length" icono="bi-bookmark" titulo="Todavía no marcaste nada" :mensaje="`Cada tag genera un clip de ${VENTANA_SEGUNDOS * 2} segundos.`" />

          <ul v-else class="list-unstyled m-0 clips">
            <li v-for="t in tagsOrdenados" :key="t.id" class="clip" :class="{ publicado: t.publicado }" :style="{ borderLeftColor: colorTag(t.color).solido }">
              <div class="d-flex align-items-start gap-2">
                <input v-if="puedePublicar" :id="'sel-' + t.id" v-model="t.seleccionado" type="checkbox" class="form-check-input mt-1"
                       :disabled="t.publicado || t.segundo === null" :aria-label="`Seleccionar ${t.titulo}`">
                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-items-center gap-1 flex-wrap">
                    <span class="badge-tag" :style="{ background: colorTag(t.color).fondo, color: colorTag(t.color).texto }">{{ t.nombre }}</span>
                    <span v-if="t.publicado" class="estado-pill estado-verde">Publicado</span>
                  </div>
                  <div class="tiempo-clip">
                    <template v-if="t.segundo !== null">
                      {{ formatearTiempo(limitesDeTag(t, video.duracion).inicio) }} – {{ formatearTiempo(limitesDeTag(t, video.duracion).fin) }}
                    </template>
                    <template v-else>Cronómetro {{ formatearTiempo(t.segundoReloj) }} · sin sincronizar</template>
                  </div>
                  <input v-model="t.titulo" type="text" maxlength="100" class="form-control form-control-sm mt-1" :aria-label="`Título del clip ${t.nombre}`" placeholder="Título">
                </div>
              </div>
              <div class="d-flex align-items-center gap-1 mt-2">
                <button type="button" class="btn btn-sm btn-dark" :disabled="!video.url || t.segundo === null" :aria-label="`Ver clip ${t.titulo}`" title="Ver clip" @click="verClip(t)">
                  <i class="bi bi-play-fill" aria-hidden="true"></i>
                </button>
                <button type="button" class="btn btn-sm btn-light border" :disabled="t.segundo === null" aria-label="Mover el momento 1 segundo antes" title="Mover 1 s antes" @click="moverTag(t.id, -1)">-1s</button>
                <button type="button" class="btn btn-sm btn-light border" :disabled="t.segundo === null" aria-label="Mover el momento 1 segundo después" title="Mover 1 s después" @click="moverTag(t.id, 1)">+1s</button>
                <button type="button" class="btn btn-sm" :class="ajustando === t.id ? 'btn-dark' : 'btn-light border'" :disabled="t.segundo === null"
                        :aria-expanded="ajustando === t.id" title="Ajustar inicio y fin" @click="ajustando = ajustando === t.id ? null : t.id">
                  <i class="bi bi-scissors" aria-hidden="true"></i><span class="visually-hidden">Ajustar inicio y fin</span>
                </button>
                <button type="button" class="btn btn-sm btn-light border ms-auto" :disabled="!video.url || t.segundo === null || recortando"
                        :aria-label="`Descargar clip ${t.titulo}`" title="Descargar clip" @click="descargarClips([t])">
                  <i class="bi bi-download" aria-hidden="true"></i>
                </button>
                <button type="button" class="btn btn-sm btn-light border text-danger" :aria-label="`Borrar ${t.titulo}`" title="Borrar" @click="borrarTag(t.id)">
                  <i class="bi bi-trash3" aria-hidden="true"></i>
                </button>
              </div>
              <!-- Ajuste del inicio y del fin del clip (segundos antes y después del momento marcado) -->
              <div v-if="ajustando === t.id && t.segundo !== null" class="ajuste-clip mt-2">
                <div v-for="campo in CAMPOS_AJUSTE" :key="campo.clave" class="d-flex align-items-center gap-1">
                  <span class="small fw-bold etiqueta-ajuste">{{ campo.nombre }}</span>
                  <button type="button" class="btn btn-sm btn-light border" :disabled="(t[campo.clave] ?? VENTANA_SEGUNDOS) <= AJUSTE_MINIMO"
                          :aria-label="`${campo.nombre}: 1 segundo menos`" @click="ajustarTag(t.id, campo.clave, -1)">−</button>
                  <span class="valor-ajuste">{{ t[campo.clave] ?? VENTANA_SEGUNDOS }} s</span>
                  <button type="button" class="btn btn-sm btn-light border" :disabled="(t[campo.clave] ?? VENTANA_SEGUNDOS) >= AJUSTE_MAXIMO"
                          :aria-label="`${campo.nombre}: 1 segundo más`" @click="ajustarTag(t.id, campo.clave, 1)">+</button>
                </div>
                <span class="small text-muted">Dura {{ formatearTiempo(limitesDeTag(t, video.duracion).duracion) }}</span>
              </div>
            </li>
          </ul>

          <!-- Descargar: para todos (cada árbitro se lleva sus clips para analizarlos) -->
          <div v-if="sesion.tags.length" class="pie-clips">
            <div v-if="recortando" class="d-flex align-items-center gap-2 small fw-semibold" role="status">
              <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> {{ progreso }}
            </div>
            <button type="button" class="btn btn-dark fw-bold w-100" :disabled="!clipsDescargables.length || !video.url || recortando" @click="descargarClips(clipsDescargables)">
              <i class="bi bi-file-earmark-zip" aria-hidden="true"></i> Descargar {{ clipsDescargables.length === 1 ? 'el clip' : `los ${clipsDescargables.length} clips` }} (ZIP)
            </button>
            <span v-if="!video.url" class="small text-muted">Cargá el video del partido para descargar los clips.</span>
            <span v-else class="small text-muted">Se recortan en tu dispositivo, sin subir el video. La primera vez descarga la herramienta de recorte (unos 30 MB).</span>
          </div>

          <div v-if="sesion.tags.length && puedePublicar" class="pie-clips">
            <span class="small text-muted">
              {{ seleccionados.length }} para publicar ·
              {{ publicaAutorizado ? 'salen autorizados' : 'quedan pendientes hasta que los autorice el coordinador general' }}
            </span>
            <button type="button" class="btn btn-danger rounded-pill fw-bold w-100" :disabled="!seleccionados.length" @click="abrirPublicar">
              <i class="bi bi-broadcast" aria-hidden="true"></i> Publicar en AAAB TV
            </button>
          </div>
          <p v-else-if="sesion.tags.length" class="small text-muted border-top pt-2 mt-1 mb-0">
            <i class="bi bi-info-circle" aria-hidden="true"></i> Publicar en AAAB TV es solo para coordinadores y observadores.
          </p>
        </section>
      </aside>
    </div>

    <!-- ============ PUBLICAR ============ -->
    <ModalBase :show="mostrarPublicar" titulo="Publicar en AAAB TV" icono="bi-broadcast" color-icono="bg-danger-subtle text-danger"
               max-width="720px" :hay-cambios="!publicando" @close="mostrarPublicar = false">
      <form id="form-publicar" novalidate @submit.prevent="publicar">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-8">
            <label for="pub-partido" class="form-label small fw-bold">Partido *</label>
            <input id="pub-partido" v-model="formPublicar.partido" type="text" maxlength="80" class="form-control"
                   :class="{ 'is-invalid': intentoPublicar && !formPublicar.partido.trim() }">
            <div class="invalid-feedback">Indicá el partido.</div>
          </div>
          <div class="col-12 col-md-4">
            <label for="pub-fecha" class="form-label small fw-bold">Fecha *</label>
            <input id="pub-fecha" v-model="formPublicar.fecha" type="date" class="form-control"
                   :class="{ 'is-invalid': intentoPublicar && !formPublicar.fecha }">
            <div class="invalid-feedback">Indicá la fecha.</div>
          </div>
        </div>

        <!-- Canales: el público y/o los de los grupos. El coordinador general autoriza cada uno por separado -->
        <SelectorCanales v-model="formPublicar.canales" class="mb-3" :invalido="intentoPublicar && !formPublicar.canales.length" />

        <p v-if="camarasSincronizadas.length" class="small text-muted mb-3">
          <i class="bi bi-camera-video" aria-hidden="true"></i>
          Cada clip lleva también {{ camarasSincronizadas.length === 1 ? 'el ángulo de' : 'los ángulos de' }}
          {{ camarasSincronizadas.map(c => c.nombre).join(', ') }}.
        </p>

        <div v-for="(c, i) in formPublicar.clips" :key="c.id" class="clip-publicar">
          <div class="d-flex align-items-center justify-content-between gap-2 mb-2 flex-wrap">
            <span class="badge-tag" :style="{ background: colorTag(c.color).fondo, color: colorTag(c.color).texto }">{{ i + 1 }}. {{ c.nombre }}</span>
            <span class="small text-muted">{{ formatearTiempo(limitesDeTag(c, video.duracion).inicio) }} – {{ formatearTiempo(limitesDeTag(c, video.duracion).fin) }}</span>
          </div>
          <label :for="'pub-titulo-' + c.id" class="form-label small fw-bold">Título *</label>
          <input :id="'pub-titulo-' + c.id" v-model="c.titulo" type="text" maxlength="100" class="form-control mb-2"
                 :class="{ 'is-invalid': intentoPublicar && !c.titulo.trim() }">
          <div class="invalid-feedback">El clip necesita un título.</div>
          <label :for="'pub-desc-' + c.id" class="form-label small fw-bold">Descripción</label>
          <textarea :id="'pub-desc-' + c.id" v-model="c.descripcion" rows="2" maxlength="600" class="form-control"
                    placeholder="Qué pasó y qué dice el reglamento"></textarea>
          <div class="row g-2 mt-1">
            <div class="col-12 col-md-5">
              <label :for="'pub-decision-' + c.id" class="form-label small fw-bold">Decisión arbitral</label>
              <select :id="'pub-decision-' + c.id" v-model="c.decision" class="form-select">
                <option :value="null">Sin valorar</option>
                <option v-for="(d, clave) in DECISIONES" :key="clave" :value="clave">{{ d.etiqueta }}</option>
              </select>
            </div>
            <div class="col-12 col-md-7">
              <span class="form-label small fw-bold d-block">Árbitros involucrados</span>
              <SelectorArbitros v-model="c.arbitros" :id="'pub-arbitros-' + c.id" />
              <span class="small text-muted">Lo ven en "Mis clips" cuando se autoriza.</span>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="d-flex gap-2 justify-content-end w-100">
          <button type="button" class="btn btn-light border rounded-pill px-4 fw-bold" :disabled="publicando" @click="mostrarPublicar = false">Cancelar</button>
          <button type="submit" form="form-publicar" class="btn btn-danger rounded-pill fw-bold px-4" :disabled="publicando">
            <span v-if="publicando" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
            {{ textoBotonPublicar }}
          </button>
        </div>
      </template>
    </ModalBase>

    <!-- ============ MIS EVENTOS ============ -->
    <ModalBase :show="mostrarEventos" titulo="Mis eventos" icono="bi-folder2-open" color-icono="bg-danger-subtle text-danger"
               max-width="640px" @close="mostrarEventos = false">
      <p class="small text-muted mb-3">
        Los partidos que guardaste para retomar después: por ejemplo, marcás en vivo hoy desde el celular y mañana cargás el video en la computadora y sincronizás.
        <template v-if="AAAB_TV_CON_SERVIDOR">Los ves desde cualquier dispositivo en el que entres con tu usuario.</template>
        <template v-else>Por ahora quedan guardados en este dispositivo.</template>
      </p>

      <div v-if="cargandoEventos && !eventos.length" class="text-center py-4">
        <span class="spinner-border spinner-border-sm text-secondary" aria-hidden="true"></span>
        <p class="small text-muted mt-2 mb-0">Cargando tus eventos...</p>
      </div>

      <div v-else-if="errorEventos" class="text-center py-3">
        <p class="small text-danger fw-semibold mb-2">{{ errorEventos }}</p>
        <button type="button" class="btn btn-sm btn-light border fw-bold" @click="recargarEventos">Reintentar</button>
      </div>

      <EstadoVacio v-else-if="!eventos.length" icono="bi-folder2" titulo="Todavía no guardaste eventos" mensaje="Marcá tus tags y tocá “Guardar evento”." />

      <ul v-else class="list-unstyled m-0 d-flex flex-column gap-2">
        <li v-for="ev in eventos" :key="ev.id" class="evento-guardado" :class="{ actual: ev.id === sesion.idEvento }">
          <div class="flex-grow-1 min-w-0">
            <div class="fw-bold text-truncate">{{ ev.partido || 'Partido sin nombre' }}</div>
            <div class="small text-muted">
              {{ fechaDMA(ev.fecha) }} · {{ ev.cantidadTags }} {{ ev.cantidadTags === 1 ? 'tag' : 'tags' }}
              · {{ ev.modo === 'vivo' ? (ev.tagsSinSincronizar ? 'en vivo, sin sincronizar' : 'en vivo, sincronizado') : 'sobre video' }}
            </div>
            <div class="small text-muted">Guardado el {{ fechaGuardado(ev.guardadoEl) }}</div>
          </div>
          <div class="d-flex gap-1 flex-shrink-0">
            <button type="button" class="btn btn-sm btn-danger rounded-pill fw-bold" :disabled="ev.id === sesion.idEvento || !!eventoOcupado" @click="pedirAbrirEvento(ev)">
              <span v-if="eventoOcupado === ev.id" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
              {{ ev.id === sesion.idEvento ? 'Abierto' : 'Abrir' }}
            </button>
            <button type="button" class="btn btn-sm btn-light border text-danger" :disabled="!!eventoOcupado" :aria-label="`Borrar evento ${ev.partido}`" title="Borrar" @click="pedirBorrarEvento(ev)">
              <i class="bi bi-trash3" aria-hidden="true"></i>
            </button>
          </div>
        </li>
      </ul>

      <template #footer>
        <button type="button" class="btn btn-dark fw-bold" @click="mostrarEventos = false">Cerrar</button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { conCortesDeSilaba, normalizarTexto } from '@/utils/texto'
import { fechaDMA } from '@/utils/fechas'
import { crearZip, descargarBlob } from '@/utils/zip'
import ModalBase from '@/components/ModalBase.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import {
  useAaabTv, VENTANA_SEGUNDOS, colorTag, formatearTiempo, limitesDeTag, idGrupoDeClave, DECISIONES, AJUSTE_MINIMO, AJUSTE_MAXIMO
} from '@/composables/useAaabTv'
import { useRecorteClips } from '@/composables/useRecorteClips'
import { AAAB_TV_CON_SERVIDOR } from '@/api/aaabTvEventos'
import SelectorCanales from '@/components/panel-arbitro/aaab-tv/SelectorCanales.vue'
import CamarasPartido from '@/components/panel-arbitro/aaab-tv/CamarasPartido.vue'
import SelectorArbitros from '@/components/SelectorArbitros.vue'

const emit = defineEmits(['publicado'])
const toast = inject('toast')
const notificar = inject('notificar')

const {
  botones, sesion, video, camaras, segundosReloj, tagsOrdenados, tagsSinSincronizar,
  cargarVideo, archivoDelVideo, marcarTag, borrarTag, moverTag, ajustarTag, puedePublicar,
  iniciarReloj, pausarReloj, reiniciarReloj, sincronizar, nuevaSesion, publicarClips, progresoSubida, publicaAutorizado,
  eventos, cargandoEventos, cargarEventos, hayCambiosSinGuardar, guardarEvento, abrirEvento, borrarEvento
} = useAaabTv()

const { recortando, progreso, recortar } = useRecorteClips()

const VELOCIDADES = [0.5, 1, 2]
// Cuadro a cuadro: 1/30 de segundo (los navegadores no informan los cuadros por segundo del video)
const CUADRO = 1 / 30
const CAMPOS_AJUSTE = [
  { clave: 'antes', nombre: 'Antes' },
  { clave: 'despues', nombre: 'Después' }
]

// Tag cuyo inicio y fin se está ajustando (uno a la vez)
const ajustando = ref(null)
// El navegador no pudo leer el video elegido (formato no compatible)
const formatoNoCompatible = ref(false)
const camarasSincronizadas = computed(() => camaras.value.filter(c => c.desfase !== null))

// Resumen del evento: cuántas veces se marcó cada situación, de más a menos
const resumenEvento = computed(() => {
  const cuentas = new Map()
  sesion.tags.forEach(t => cuentas.set(t.nombre, (cuentas.get(t.nombre) || 0) + 1))
  return [...cuentas].map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad)
})
const maximoResumen = computed(() => Math.max(1, ...resumenEvento.value.map(r => r.cantidad)))

// ─── Video ──────────────────────────────────────────────────
const videoRef = ref(null)
const inputVideo = ref(null)
const tiempoActual = ref(0)
const reproduciendo = ref(false)
const velocidad = ref(1)
const finPrevia = ref(null)
const mostrarVideoEnVivo = ref(false)

const elegirVideo = (e) => {
  const archivo = e.target.files?.[0]
  e.target.value = ''
  if (!archivo) return
  if (!archivo.type.startsWith('video/')) {
    toast({ tipo: 'warning', titulo: 'Archivo no válido', mensaje: 'Elegí un archivo de video (MP4).' })
    return
  }
  formatoNoCompatible.value = false
  cargarVideo(archivo)
  tiempoActual.value = 0
  if (sesion.modo === 'vivo') mostrarVideoEnVivo.value = true
}

const alCargarMetadatos = () => {
  video.duracion = Math.floor(videoRef.value?.duration || 0)
  // Hay archivos que se abren pero el navegador no puede decodificar: sin duración ni imagen
  formatoNoCompatible.value = !video.duracion || !videoRef.value?.videoWidth
  if (videoRef.value) videoRef.value.playbackRate = velocidad.value
}

const pasoCuadro = (sentido) => {
  const v = videoRef.value
  if (!v) return
  v.pause()
  finPrevia.value = null
  v.currentTime = Math.min(Math.max(0, v.currentTime + sentido * CUADRO), v.duration || 0)
}

const alAvanzarVideo = () => {
  const v = videoRef.value
  if (!v) return
  tiempoActual.value = v.currentTime
  // Al ver un clip, se corta solo al llegar al final de la ventana
  if (finPrevia.value !== null && v.currentTime >= finPrevia.value) {
    v.pause()
    finPrevia.value = null
  }
}

const alternarReproduccion = () => {
  const v = videoRef.value
  if (!v) return
  if (v.paused) v.play().catch(() => {})
  else { v.pause(); finPrevia.value = null }
}

const mover = (segundos) => {
  const v = videoRef.value
  if (!v) return
  finPrevia.value = null
  v.currentTime = Math.min(Math.max(0, v.currentTime + segundos), v.duration || 0)
}

const cambiarVelocidad = (v) => {
  velocidad.value = v
  if (videoRef.value) videoRef.value.playbackRate = v
}

const porcentaje = (segundo) => (video.duracion ? Math.min(100, Math.max(0, (segundo / video.duracion) * 100)) : 0)

const saltarConClick = (e) => {
  const v = videoRef.value
  if (!v || !video.duracion) return
  const caja = e.currentTarget.getBoundingClientRect()
  finPrevia.value = null
  v.currentTime = ((e.clientX - caja.left) / caja.width) * video.duracion
}

const marcasLinea = computed(() =>
  sesion.tags.filter(t => t.segundo !== null && video.duracion).map(t => {
    const { inicio, fin } = limitesDeTag(t, video.duracion)
    return {
      id: t.id,
      titulo: `${t.titulo} · ${formatearTiempo(inicio)} – ${formatearTiempo(fin)}`,
      estilo: { left: porcentaje(inicio) + '%', width: Math.max(0.6, porcentaje(fin) - porcentaje(inicio)) + '%', background: colorTag(t.color).solido }
    }
  })
)

const verClip = (t) => {
  const v = videoRef.value
  if (!v) {
    if (sesion.modo === 'vivo') mostrarVideoEnVivo.value = true
    return
  }
  const { inicio, fin } = limitesDeTag(t, video.duracion)
  v.currentTime = inicio
  finPrevia.value = fin
  v.play().catch(() => {})
}

// ─── Modo ───────────────────────────────────────────────────
const cambiarModo = (modo) => {
  if (modo === sesion.modo) return
  videoRef.value?.pause()
  sesion.modo = modo
  mostrarVideoEnVivo.value = false
}

// ─── Tags ───────────────────────────────────────────────────
const ultimoTag = ref(null)
const destelloId = ref(null)
let temporizadorAviso = null

const motivoPadDeshabilitado = computed(() => {
  if (sesion.modo === 'video' && !video.url) return 'Cargá el video para empezar a marcar.'
  if (sesion.modo === 'vivo' && !sesion.reloj.corriendo) return 'Iniciá el cronómetro para marcar en vivo.'
  return ''
})

const marcar = (boton) => {
  if (motivoPadDeshabilitado.value) return
  const tag = marcarTag(boton, videoRef.value?.currentTime ?? 0)
  ultimoTag.value = tag
  destelloId.value = boton.id
  clearTimeout(temporizadorAviso)
  temporizadorAviso = setTimeout(() => { ultimoTag.value = null; destelloId.value = null }, 1500)
}

// ─── Cronómetro y sincronización ───────────────────────────
const syncManual = ref('')
const errorSync = ref('')

const aplicarSincronizacion = (segundo) => {
  sincronizar(segundo)
  errorSync.value = ''
  toast({ tipo: 'success', titulo: 'Tags sincronizados', mensaje: `El cronómetro arranca en el ${formatearTiempo(segundo)} del video.` })
}

const sincronizarAca = () => aplicarSincronizacion(tiempoActual.value)

const sincronizarManual = () => {
  const m = String(syncManual.value).trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/)
  if (!m) {
    errorSync.value = 'Escribilo como minutos:segundos, por ejemplo 02:35.'
    return
  }
  const segundos = Number(m[1] || 0) * 3600 + Number(m[2]) * 60 + Number(m[3])
  if (video.duracion && segundos > video.duracion) {
    errorSync.value = 'Ese momento es posterior al final del video.'
    return
  }
  aplicarSincronizacion(segundos)
}

const confirmarReinicioReloj = () => {
  notificar({
    tipo: 'danger',
    titulo: 'Reiniciar cronómetro',
    mensaje: 'El cronómetro vuelve a cero. Los tags que ya marcaste se conservan.',
    alConfirmar: reiniciarReloj
  })
}

const confirmarNuevaSesion = () => {
  notificar({
    tipo: 'danger',
    titulo: 'Nueva sesión',
    mensaje: hayCambiosSinGuardar.value
      ? 'Tenés tags sin guardar: si seguís se pierden. Si los querés retomar después, cancelá y tocá “Guardar evento”.'
      : 'Se limpia la pantalla para un partido nuevo. Los eventos guardados y los clips publicados no se tocan.',
    alConfirmar: nuevaSesion
  })
}

// ─── Eventos guardados ──────────────────────────────────────
const mostrarEventos = ref(false)
const guardandoEvento = ref(false)
const errorEventos = ref('')
const eventoOcupado = ref(null)   // id del evento que se está abriendo o borrando

// Nombre de archivo sin tildes ni símbolos (ej. "River vs. Ferro" → "river-vs-ferro")
const slug = (texto) => normalizarTexto(texto).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const fechaGuardado = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

const recargarEventos = async () => {
  errorEventos.value = ''
  const res = await cargarEventos()
  if (!res?.ok) errorEventos.value = res?.message || 'No se pudieron cargar tus eventos.'
}

// Se recarga cada vez que se abre: con servidor puede haber eventos guardados desde otro dispositivo
const abrirMisEventos = () => {
  mostrarEventos.value = true
  recargarEventos()
}

const guardarEventoActual = async () => {
  if (!sesion.partido.trim()) {
    toast({ tipo: 'warning', titulo: 'Falta el partido', mensaje: 'Escribí el nombre del partido para poder encontrar el evento después.' })
    document.getElementById('tv-partido')?.focus()
    return
  }
  guardandoEvento.value = true
  try {
    const res = await guardarEvento()
    if (!res?.ok) throw new Error(res?.message)
    const n = res.payload.tags.length
    toast({ tipo: 'success', titulo: 'Evento guardado', mensaje: `“${res.payload.partido}” quedó en Mis eventos con ${n} ${n === 1 ? 'tag' : 'tags'}.` })
  } catch (e) {
    toast({ tipo: 'danger', titulo: 'No se pudo guardar', mensaje: `${e.message || 'Intentá de nuevo.'} Tus tags siguen en pantalla.` })
  } finally {
    guardandoEvento.value = false
  }
}

const abrirEventoElegido = async (ev) => {
  eventoOcupado.value = ev.id
  try {
    const res = await abrirEvento(ev.id)
    if (!res.ok) throw new Error(res.message)
    mostrarEventos.value = false
    mostrarVideoEnVivo.value = false
    const evento = res.payload
    const sinSincronizar = evento.tags.filter(t => t.segundo === null).length
    toast({
      tipo: 'success',
      titulo: 'Evento abierto',
      mensaje: sinSincronizar
        ? `Cargá el video del partido y sincronizalo para ubicar ${sinSincronizar === 1 ? 'el tag marcado' : `los ${sinSincronizar} tags marcados`} en vivo.`
        : `${evento.partido}: ${evento.tags.length} ${evento.tags.length === 1 ? 'tag' : 'tags'}. Cargá el video para ver y descargar los clips.`
    })
  } catch (e) {
    toast({ tipo: 'danger', titulo: 'No se pudo abrir', mensaje: e.message || 'Intentá de nuevo.' })
  } finally {
    eventoOcupado.value = null
  }
}

const pedirAbrirEvento = (ev) => {
  if (!hayCambiosSinGuardar.value) return abrirEventoElegido(ev)
  notificar({
    tipo: 'danger',
    titulo: 'Tags sin guardar',
    mensaje: 'La sesión que tenés abierta tiene tags sin guardar. Si abrís otro evento, se pierden.',
    alConfirmar: () => abrirEventoElegido(ev)
  })
}

const pedirBorrarEvento = (ev) => {
  notificar({
    tipo: 'danger',
    titulo: 'Borrar evento',
    mensaje: `Se borra “${ev.partido || 'Partido sin nombre'}” de Mis eventos. Si lo tenés abierto, los tags siguen en pantalla.`,
    alConfirmar: async () => {
      eventoOcupado.value = ev.id
      const res = await borrarEvento(ev.id)
      eventoOcupado.value = null
      if (!res?.ok) toast({ tipo: 'danger', titulo: 'No se pudo borrar', mensaje: res?.message || 'Intentá de nuevo.' })
    }
  })
}

// ─── Descargar clips (para todos) ───────────────────────────
const clipsDescargables = computed(() => tagsOrdenados.value.filter(t => t.segundo !== null))

const nombreClip = (t, numero) => {
  const { inicio } = limitesDeTag(t, video.duracion)
  const mm = String(Math.floor(inicio / 60)).padStart(2, '0')
  const ss = String(Math.floor(inicio % 60)).padStart(2, '0')
  return `${String(numero).padStart(2, '0')}-${slug(t.titulo || t.nombre) || 'clip'}-${mm}m${ss}s`
}

const descargarClips = async (lista) => {
  const archivo = archivoDelVideo()
  if (!archivo || !video.url) {
    toast({ tipo: 'warning', titulo: 'Falta el video', mensaje: 'Cargá el video del partido para descargar los clips.' })
    return
  }
  const clips = lista.map(t => {
    const { inicio, duracion } = limitesDeTag(t, video.duracion)
    const numero = clipsDescargables.value.findIndex(c => c.id === t.id) + 1
    return { nombre: nombreClip(t, numero), inicio, duracion }
  })
  try {
    const recortes = await recortar(archivo, clips)
    if (recortes.length === 1) {
      descargarBlob(new Blob([recortes[0].datos], { type: archivo.type || 'video/mp4' }), recortes[0].nombre)
    } else {
      descargarBlob(crearZip(recortes), `aaab-tv-${slug(sesion.partido) || 'clips'}-${sesion.fecha || 'sin-fecha'}.zip`)
    }
  } catch (e) {
    console.error('Recorte de clips:', e)
    toast({ tipo: 'danger', titulo: 'No se pudieron descargar los clips', mensaje: 'Revisá tu conexión (la primera vez se descarga la herramienta de recorte) e intentá de nuevo.' })
  }
}

// ─── Publicar ───────────────────────────────────────────────
const seleccionados = computed(() => tagsOrdenados.value.filter(t => t.seleccionado && !t.publicado && t.segundo !== null))
const mostrarPublicar = ref(false)
const publicando = ref(false)
const intentoPublicar = ref(false)
// canales: claves de los canales elegidos ('publico', 'g-<idGrupo>'); los de la vez anterior se mantienen
const formPublicar = reactive({ partido: '', fecha: '', canales: ['publico'], clips: [] })

// Mientras se sube el video a la VPS se muestra cuánto va; después, mientras se registran los clips, "Publicando"
const textoBotonPublicar = computed(() => {
  if (!publicando.value) {
    const n = formPublicar.clips.length
    return `Publicar ${n} ${n === 1 ? 'clip' : 'clips'}`
  }
  const p = progresoSubida.value
  return p !== null && p < 1 ? `Subiendo video ${Math.floor(p * 100)}%...` : 'Publicando...'
})

const abrirPublicar = () => {
  if (!video.url) {
    toast({ tipo: 'warning', titulo: 'Falta el video', mensaje: 'Cargá el video del partido para poder publicar los clips.' })
    return
  }
  formPublicar.partido = sesion.partido
  formPublicar.fecha = sesion.fecha
  // Los tags viejos no tienen valoración ni árbitros: se completan para el formulario
  formPublicar.clips = seleccionados.value.map(t => ({ ...t, decision: t.decision ?? null, arbitros: [...(t.arbitros || [])] }))
  intentoPublicar.value = false
  mostrarPublicar.value = true
}

const publicar = async () => {
  intentoPublicar.value = true
  const valido = formPublicar.partido.trim() && formPublicar.fecha && formPublicar.canales.length &&
    formPublicar.clips.every(c => c.titulo.trim())
  if (!valido) return
  publicando.value = true
  try {
    const res = await publicarClips({
      partido: formPublicar.partido.trim(),
      fecha: formPublicar.fecha,
      destinos: formPublicar.canales.map(idGrupoDeClave),
      clips: formPublicar.clips
    })
    if (!res.ok) throw new Error(res.message)
    sesion.partido = formPublicar.partido.trim()
    mostrarPublicar.value = false
    const uno = res.payload === 1
    toast(publicaAutorizado.value
      ? { tipo: 'success', titulo: 'Publicado en AAAB TV', mensaje: `${uno ? 'El clip ya está autorizado' : `Los ${res.payload} clips ya están autorizados`} en los canales elegidos.` }
      : { tipo: 'success', titulo: 'Enviado a AAAB TV', mensaje: `${uno ? 'El clip quedó pendiente' : `Los ${res.payload} clips quedaron pendientes`} hasta que el coordinador general autorice cada canal.` })
    emit('publicado')
  } catch (e) {
    toast({ tipo: 'danger', titulo: 'No se pudo publicar', mensaje: e.message || 'Intentá de nuevo.' })
  } finally {
    publicando.value = false
  }
}

// ─── Teclado: solo controles del video (los tags se marcan con los botones) ───
const alPresionarTecla = (e) => {
  const destino = e.target
  if (mostrarPublicar.value || mostrarEventos.value || e.ctrlKey || e.metaKey || e.altKey) return
  if (destino.closest?.('input, textarea, select, [contenteditable="true"]')) return

  if (e.code === 'Space' && videoRef.value) {
    if (destino === videoRef.value) return
    e.preventDefault()
    alternarReproduccion()
    return
  }
  if (e.key === 'ArrowLeft' && videoRef.value) { e.preventDefault(); mover(-5); return }
  if (e.key === 'ArrowRight' && videoRef.value) { e.preventDefault(); mover(5); return }
  // Cuadro a cuadro: coma atrás, punto adelante
  if (e.key === ',' && videoRef.value) { e.preventDefault(); pasoCuadro(-1); return }
  if (e.key === '.' && videoRef.value) { e.preventDefault(); pasoCuadro(1) }
}

onMounted(() => window.addEventListener('keydown', alPresionarTecla))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', alPresionarTecla)
  clearTimeout(temporizadorAviso)
})
</script>

<style scoped>
.bloque {
  background: var(--o-tarjeta, #fff);
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 16px;
  padding: 14px;
}

/* Barra de eventos guardados */
.barra-eventos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.texto-aviso { color: var(--o-ambar-texto, #b45309); }

.evento-guardado {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 12px;
  background: var(--o-tarjeta, #fff);
}
.evento-guardado.actual { border-color: #dc2626; box-shadow: 0 0 0 1px #dc2626; }
.min-w-0 { min-width: 0; }
.bloque-oscuro {
  background: #0f172a;
  border-color: var(--o-texto, #0f172a);
  color: #e2e8f0;
}
.titulo-bloque { font-size: 0.9rem; font-weight: 800; color: var(--o-texto, #0f172a); }

/* Selector de modo */
.selector-modo {
  display: flex;
  background: var(--o-chip, #f1f5f9);
  border-radius: 12px;
  padding: 3px;
  gap: 3px;
}
.selector-modo button {
  flex: 1;
  min-height: 38px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--o-texto-medio, #475569);
}
.selector-modo button.activo { background: #0f172a; color: #fff; }

/* Video */
.zona-video-vacia {
  text-align: center;
  padding: 36px 16px;
  border: 2px dashed var(--o-borde, #cbd5e1);
  border-radius: 12px;
  background: var(--o-superficie, #f8fafc);
}
.zona-video-vacia > .bi { font-size: 2.5rem; color: var(--o-rojo-texto, #dc2626); }

.marco-video {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.marco-video video { display: block; width: 100%; max-height: 62vh; background: #000; }

.aviso-tag,
.aviso-previa {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 14px;
  border-radius: 50rem;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
  pointer-events: none;
}
.aviso-tag { top: 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35); }
.aviso-previa { top: 12px; background: rgba(15, 23, 42, 0.85); }
.aviso-tag + .aviso-previa { top: 48px; }

.linea-tiempo {
  position: relative;
  height: 26px;
  border-radius: 8px;
  background: var(--o-chip, #e2e8f0);
  cursor: pointer;
  overflow: hidden;
}
.linea-tiempo:focus-visible { outline: 2px solid var(--o-texto, #0f172a); outline-offset: 2px; }
.marca-clip {
  position: absolute;
  top: 5px;
  bottom: 5px;
  border-radius: 4px;
  opacity: 0.85;
}
.cabezal {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #0f172a;
  transform: translateX(-1px);
}
.tiempo {
  font-variant-numeric: tabular-nums;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--o-texto, #0f172a);
  padding: 0 6px;
}

/* En vivo */
.estado-vivo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--o-texto-suave, #94a3b8);
}
.estado-vivo .punto { width: 10px; height: 10px; border-radius: 50%; background: #64748b; }
.estado-vivo.corriendo { color: #fca5a5; }
.estado-vivo.corriendo .punto { background: #dc2626; animation: latido 1.2s infinite; }
@keyframes latido { 50% { opacity: 0.3; } }
@media (prefers-reduced-motion: reduce) { .estado-vivo.corriendo .punto { animation: none; } }

.reloj {
  text-align: center;
  font-size: clamp(3rem, 12vw, 5rem);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: #fff;
  line-height: 1.1;
  margin: 10px 0 14px;
}
.nota-vivo { font-size: 0.8rem; color: var(--o-texto-suave, #94a3b8); text-align: center; margin: 12px 0 0; }

.sincronizar {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #334155;
}
.sincronizar-titulo { font-size: 0.9rem; font-weight: 800; color: #fff; margin-bottom: 6px; }
.input-tiempo { width: 80px; text-align: center; }

/* Pad */
/* Celular y app (mobile first): botones cuadrados, 3 por fila, con el nombre centrado.
   La letra se achica con el ancho de la pantalla; los nombres largos pasan a dos o tres líneas y
   las palabras que no entran se cortan entre sílabas (conCortesDeSilaba). Probado de 320 a 390 px */
.pad {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.boton-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  min-width: 0;
  padding: 4px;
  border: 2px solid;
  border-radius: 16px;
  font-weight: 800;
  font-size: clamp(0.64rem, 3.1vw, 0.85rem);
  line-height: 1.15;
  text-align: center;
  transition: transform 0.1s ease, filter 0.15s ease;
}
.nombre-tag {
  max-width: 100%;
  overflow-wrap: break-word;
  hyphens: manual;
}

/* Escritorio: botones anchos en una línea, con el nombre centrado */
@media (min-width: 768px) {
  .pad { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .boton-tag {
    aspect-ratio: auto;
    min-height: 52px;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
  }
  .nombre-tag {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-wrap: normal;
  }
}
.boton-tag:hover:not(:disabled) { filter: brightness(0.96); }
.boton-tag:active:not(:disabled) { transform: scale(0.97); }
.boton-tag:disabled { opacity: 0.45; cursor: not-allowed; }
.boton-tag.destello { animation: destello 0.4s ease; }
@keyframes destello { from { transform: scale(0.94); filter: brightness(1.15); } to { transform: scale(1); } }

.tecla {
  background: #0f172a;
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 8px;
  margin-left: 2px;
}

/* Clips */
.lista-clips { position: sticky; top: 12px; }
.clips { max-height: 60vh; overflow-y: auto; padding-right: 2px; }
.clip {
  border: 1px solid var(--o-borde, #e2e8f0);
  border-left: 4px solid;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 8px;
}
.clip.publicado { background: var(--o-superficie, #f8fafc); opacity: 0.8; }
.badge-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
}
.tiempo-clip { font-size: 0.8rem; font-weight: 700; color: var(--o-texto-medio, #475569); margin-top: 4px; font-variant-numeric: tabular-nums; }
.pie-clips {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid var(--o-borde, #e2e8f0);
  padding-top: 10px;
  margin-top: 4px;
}
.ajuste-clip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  padding: 8px;
  border-radius: 10px;
  background: var(--o-fondo-suave, #f8fafc);
}
.etiqueta-ajuste { min-width: 52px; color: var(--o-texto-medio, #475569); }
.valor-ajuste { min-width: 36px; text-align: center; font-weight: 800; font-variant-numeric: tabular-nums; }
.resumen-evento { display: flex; flex-direction: column; gap: 4px; }
.fila-resumen { display: grid; grid-template-columns: minmax(0, 7rem) 1fr 2rem; align-items: center; gap: 8px; font-size: 0.75rem; }
.nombre-resumen { color: var(--o-texto-medio, #475569); font-weight: 600; }
.pista-resumen { height: 8px; border-radius: 4px; background: var(--o-chip, #e2e8f0); overflow: hidden; }
.barra-resumen { display: block; height: 100%; border-radius: 0 4px 4px 0; background: var(--o-texto-medio, #475569); }
.cantidad-resumen { text-align: right; font-weight: 800; color: var(--o-texto, #0f172a); font-variant-numeric: tabular-nums; }
.clip-publicar {
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
}

.min-w-0 { min-width: 0; }

@media (max-width: 1199px) {
  .lista-clips { position: static; }
}
</style>
