<template>
  <div :class="enColumnas ? 'lista-columnas' : 'd-flex flex-column gap-3'">
    <section v-for="grupo in grupos" :key="grupo.categoria || 'sin-categoria'" class="lista-seccion">
      <h3 v-if="grupo.categoria" class="lista-categoria">
        <i v-if="grupo.icono" :class="grupo.icono"></i>
        <span>{{ grupo.categoria }}</span>
      </h3>

      <div class="lista-grupo">
        <component
          v-for="item in grupo.items"
          :key="item.title"
          :is="item.href ? 'a' : 'RouterLink'"
          :href="item.href"
          :to="item.to"
          :target="item.href ? '_blank' : null"
          :rel="item.href ? 'noopener noreferrer' : null"
          class="lista-fila"
        >
          <span class="lista-icono">
            <i :class="item.icon"></i>
          </span>
          <span class="lista-texto">
            <span class="lista-titulo">{{ item.title }}</span>
            <span v-if="item.desc" class="lista-desc">{{ item.desc }}</span>
          </span>
          <span v-if="item.badge" class="lista-badge" :aria-label="`${item.badge} pendientes`">{{ item.badge }}</span>
          <i :class="['bi', item.href ? 'bi-box-arrow-up-right' : 'bi-chevron-right', 'lista-flecha']"></i>
        </component>
      </div>
    </section>
  </div>
</template>

<script setup>
// Lista agrupada de módulos (estilo "ajustes del celular").
// grupos: [{ categoria?, icono?, items: [{ to | href, title, desc, icon, badge? }] }]
// badge: número de pendientes (se muestra en rojo a la derecha)
// enColumnas: reparte las categorías en 2 columnas (tablet) y 3 (escritorio)
defineProps({
  grupos: { type: Array, required: true },
  enColumnas: { type: Boolean, default: false }
})
</script>

<style scoped>
/* Celular: una columna. Las categorías nunca se cortan entre columnas */
.lista-columnas {
  column-gap: 20px;
}
.lista-columnas .lista-seccion {
  break-inside: avoid;
  margin-bottom: 20px;
}
@media (min-width: 768px) {
  .lista-columnas { columns: 2; }
}
@media (min-width: 992px) {
  .lista-columnas { columns: 3; }
}

.lista-categoria {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 8px 4px;
}
.lista-categoria i { font-size: 0.95rem; color: #dc2626; }

.lista-grupo {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.lista-fila {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 60px;
  padding: 8px 16px;
  border-top: 1px solid #e2e8f0;
  text-decoration: none;
  transition: background-color 0.15s;
}
.lista-fila:first-child { border-top: 0; }
.lista-fila:hover { background: #f8fafc; }
.lista-fila:focus-visible { outline: 2px solid #0f172a; outline-offset: -2px; }

.lista-icono {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 10px;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
}

.lista-texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.lista-titulo {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.25;
}

.lista-desc {
  font-size: 0.8rem;
  color: #475569;
  margin-top: 2px;
  line-height: 1.3;
}

.lista-badge {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 12px;
  background: #dc2626;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lista-flecha {
  color: #94a3b8;
  font-size: 0.85rem;
}
</style>
