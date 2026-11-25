<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">Datos fiscales de clubes · Total: {{ filtrados.length }} instituciones encontradas</p>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Actualizar (con spinner) -->
            <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="cargarDatos" />

            <!-- Botón Filtros (Solo Móvil) -->
            <BotonHerramienta tipo="filtros" class="d-md-none" :solo-icono-en-celular="false" @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" />

            <!-- Botón Limpiar -->
            <BotonHerramienta tipo="limpiar" @click="limpiarFiltros" />
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Instituciones</span>
            <button type="button" aria-label="Cerrar filtros" title="Cerrar filtros" @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-12 col-md-3">
              <input aria-label="Filtrar por club o institución" v-model="filtros.club" class="form-control form-control-sm shadow-none py-2" placeholder="FILTRAR POR CLUB O INSTITUCIÓN...">
            </div>
            <div class="col-6 col-md-3">
              <input aria-label="Forma de pago" v-model="filtros.forma_de_pago" class="form-control form-control-sm shadow-none py-2" placeholder="FORMA DE PAGO...">
            </div>
            <div class="col-6 col-md-3">
              <input aria-label="Filtrar por cuit" v-model="filtros.cuit" class="form-control form-control-sm shadow-none py-2" placeholder="FILTRAR POR CUIT...">
            </div>
            <div class="col-12 col-md-3">
              <input aria-label="Filtrar por condición iva" v-model="filtros.condicion" class="form-control form-control-sm shadow-none py-2" placeholder="FILTRAR POR CONDICIÓN IVA...">
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-danger rounded-pill w-100 btn-sm fw-bold shadow-sm py-2">
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <EstadoCargando v-if="cargando" texto="Cargando instituciones" />

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
              <table class="table table-hover align-middle mb-0 text-nowrap texto-085">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted" style="width: 30%;">Institución / Club</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 15%;">Forma de Pago</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 15%;">CUIT</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 20%;">Condición IVA</th>
                    <th class="py-3 text-center text-uppercase text-muted pe-3" style="width: 20%;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="i in institucionesPaginadas" :key="i.id">
                    <td class="ps-3 text-dark fw-bold text-truncate" :title="i.club">{{ i.club }}</td>
                    <td class="text-dark">
                      <span v-if="i.forma_de_pago" class="badge bg-secondary-subtle text-secondary-emphasis border">{{ i.forma_de_pago }}</span>
                      <span v-else>-</span>
                    </td>
                    <td class="text-muted">{{ i.cuit || '-' }}</td>
                    <td class="text-muted">{{ i.condicion || '-' }}</td>
                    <td class="text-center pe-3">

                      <!-- Acciones en Escritorio (Solo Iconos) -->
                      <div class="d-flex justify-content-center gap-1">
                        <button v-if="i.cuit && i.cuit !== 'NULL'" @click="copiarAlPortapapeles(i.cuit, 'CUIT')" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" title="Copiar CUIT">
                          <i class="bi bi-copy texto-16px"></i>
                        </button>

                        <template v-if="i.email && i.email !== 'NULL' && i.email.trim() !== ''">
                          <button @click="enviarFactura(i.email)" class="btn btn-light border btn-sm shadow-sm rounded p-1" title="Enviar Email">
                            <i class="bi bi-send texto-16px"></i>
                          </button>
                          <button @click="copiarAlPortapapeles(i.email, 'Email')" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" title="Copiar Email">
                            <i class="bi bi-copy texto-16px"></i>
                          </button>
                        </template>

                        <template v-if="i.celular && i.celular !== 'NULL' && i.celular.trim() !== ''">
                          <button @click="enviarWhatsapp(i.celular)" class="btn btn-sm shadow-sm text-white rounded p-1" style="background-color: #25D366;" title="WhatsApp">
                            <i class="bi bi-whatsapp texto-16px"></i>
                          </button>
                          <button @click="copiarAlPortapapeles(i.celular, 'Celular')" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" title="Copiar Celular">
                            <i class="bi bi-phone-vibrate texto-16px"></i>
                          </button>
                        </template>

                        <span v-if="(!i.email || i.email === 'NULL') && (!i.celular || i.celular === 'NULL') && (!i.cuit || i.cuit === 'NULL')" class="text-muted small fst-italic">
                          Sin contacto
                        </span>
                      </div>

                    </td>
                  </tr>
                  <tr v-if="institucionesPaginadas.length === 0">
                    <td colspan="5" class="border-0 bg-white">
                      <EstadoVacio icono="bi-building" titulo="No se encontraron instituciones" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS (Solo Celular) -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="i in institucionesPaginadas" :key="'mob-'+i.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-header bg-white border-bottom-0 pb-2 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold d-flex align-items-center gap-2 texto-105">
                    <i class="bi bi-building text-danger" style="font-size: 20px;"></i>
                    {{ i.club }}
                  </div>
                </div>

                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex flex-column gap-2 bg-light p-2 rounded border mb-3 border-light-subtle">
                    <div class="d-flex justify-content-between">
                      <span class="text-dark small"><strong>CUIT:</strong> {{ i.cuit || '-' }}</span>
                      <span class="text-dark small"><strong>IVA:</strong> {{ i.condicion || '-' }}</span>
                    </div>
                    <div class="d-flex justify-content-between border-top pt-2 mt-1 border-light-subtle">
                      <span class="text-dark small"><strong>Pago:</strong> <span class="badge bg-secondary-subtle text-secondary-emphasis">{{ i.forma_de_pago || '-' }}</span></span>
                    </div>
                  </div>

                  <!-- Botones Originales Móvil -->
                  <div class="row g-2 justify-content-center">

                    <div class="col-12" v-if="i.cuit && i.cuit !== 'NULL'">
                      <button @click="copiarAlPortapapeles(i.cuit, 'CUIT')" class="btn btn-sm btn-light border w-100 d-flex align-items-center justify-content-center gap-1 fw-bold text-dark py-2">
                        <i class="bi bi-copy texto-16px"></i> Copiar CUIT
                      </button>
                    </div>

                    <template v-if="i.email && i.email !== 'NULL' && i.email.trim() !== ''">
                      <div class="col-6">
                        <button @click="enviarFactura(i.email)" class="btn btn-sm btn-light border shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2">
                          <i class="bi bi-send texto-16px"></i> Email
                        </button>
                      </div>
                      <div class="col-6">
                        <button @click="copiarAlPortapapeles(i.email, 'Email')" class="btn btn-sm btn-light border shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2">
                          <i class="bi bi-copy texto-16px"></i> Email
                        </button>
                      </div>
                    </template>

                    <template v-if="i.celular && i.celular !== 'NULL' && i.celular.trim() !== ''">
                      <div class="col-6">
                        <button @click="enviarWhatsapp(i.celular)" class="btn btn-sm text-white shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2" style="background-color: #25D366;">
                          <i class="bi bi-whatsapp texto-16px"></i> WhatsApp
                        </button>
                      </div>
                      <div class="col-6">
                        <button @click="copiarAlPortapapeles(i.celular, 'Celular')" class="btn btn-sm btn-light border shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2">
                          <i class="bi bi-phone-vibrate texto-16px"></i> Celular
                        </button>
                      </div>
                    </template>

                    <div class="col-12 text-center mt-2" v-if="(!i.email || i.email === 'NULL') && (!i.celular || i.celular === 'NULL') && (!i.cuit || i.cuit === 'NULL')">
                      <span class="text-muted small fst-italic">Sin contacto</span>
                    </div>

                  </div>
                </div>
              </div>

              <div v-if="institucionesPaginadas.length === 0" class="bg-white rounded-3 shadow-sm border border-light-subtle mt-2">
                <EstadoVacio icono="bi-building" titulo="No se encontraron instituciones" />
              </div>
            </div>

            <!-- PAGINACIÓN -->
            <BarraPaginacion v-model="paginaActual" :total="totalPaginas" class="mt-4 mb-3" />
          </template>

        </div>
      </div>

      <!-- Alerta de contacto original restaurada -->
      <div class="alert alert-secondary mt-4 border-0 shadow-sm mx-auto w-100 radio-12">
        <div class="d-flex align-items-center">
          <i class="bi bi-info-square-fill me-3 fs-3 text-secondary opacity-75"></i>
          <div class="small text-dark lh-sm">
            Consultas a <a href="mailto:facturas@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none">facturas@arbitroshandball.com.ar</a>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import { ref, onMounted, computed, reactive, watch, inject } from 'vue'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import { usePaginacion } from '@/composables/usePaginacion'
import { normalizarTexto } from '@/utils/texto'
import { abrirWhatsApp } from '@/utils/whatsapp'
import { api, listaDe } from '@/api/api'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Instituciones y CUITs | AAAB',
  meta: [
    { name: 'description', content: 'Accedé al listado de instituciones y CUITs para realizar la facturación.' },
    { property: 'og:title', content: 'Instituciones y CUITs | AAAB' },
    { property: 'og:description', content: 'Accedé al listado de instituciones y CUITs para realizar la facturación.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const toast = inject('toast')
const mostrarToast = (mensaje, tipo = 'success') => {
  toast({ mensaje, tipo })
}

const instituciones = ref([])
const mostrarFiltrosMobile = ref(false)
const cargando = ref(false)

const filtros = reactive({
  club: '', forma_de_pago: '', cuit: '', condicion: ''
})

const paginaActual = ref(1)
const registrosPorPagina = 7

const limpiarFiltros = () => {
  filtros.club = ''
  filtros.forma_de_pago = ''
  filtros.cuit = ''
  filtros.condicion = ''
}

const cargarDatos = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'facturacion',
      action: 'getInstitucionesCuit',
      payload: {}
    })
    instituciones.value = listaDe(res)
  } catch (err) {
    console.error("Error al cargar instituciones:", err)
  } finally {
    cargando.value = false
  }
}

const copiarAlPortapapeles = async (texto, etiqueta) => {
  if (!texto || texto === 'NULL' || texto.trim() === '') return
  try {
    await navigator.clipboard.writeText(texto.trim())
    mostrarToast(`${etiqueta} copiado: ${texto}`)
  } catch (err) {
    console.error('Error al copiar:', err)
    mostrarToast('No se pudo copiar el texto', 'danger')
  }
}

const enviarFactura = (emailClub) => {
  if (!emailClub || String(emailClub).toUpperCase() === 'NULL' || emailClub.trim() === '') return
  const destinatario = emailClub.trim()
  const cc = "aaabfacturas@gmail.com"
  const subject = "Envío de Factura - Arbitraje AAAB"
  const body = "Estimados,\n\nAdjuntamos la factura correspondiente.\n\nSaludos cordiales."
  const mailtoLink = `mailto:${destinatario}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  window.open(mailtoLink, '_self')
}

const enviarWhatsapp = (celular) => {
  if (!celular || celular === 'NULL' || celular.trim() === '') return
  abrirWhatsApp(celular, 'Hola, ¿Cómo estás? Me comunico por el envío de facturación de arbitraje de Handball.')
}


const filtrados = computed(() => {
  const listaFiltrada = instituciones.value.filter(i => {
    const matchClub = normalizarTexto(i.club).includes(normalizarTexto(filtros.club))
    const matchPago = normalizarTexto(i.forma_de_pago).includes(normalizarTexto(filtros.forma_de_pago))
    const matchCuit = normalizarTexto(i.cuit).includes(normalizarTexto(filtros.cuit))
    const matchCondicion = normalizarTexto(i.condicion).includes(normalizarTexto(filtros.condicion))
    return matchClub && matchPago && matchCuit && matchCondicion
  })

  return listaFiltrada.sort((a, b) => {
    return (a.club || '').localeCompare(b.club || '')
  })
})

const { totalPaginas, paginados: institucionesPaginadas } = usePaginacion(filtrados, registrosPorPagina, paginaActual)



watch(filtros, () => { paginaActual.value = 1 }, { deep: true })


onMounted(cargarDatos)
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES
   ==================================================== */

/* ====================================================
   TABLA SIN LÍNEAS
   ==================================================== */

</style>
