// Equivalencias de los nombres de Material Icons que todavía se pasan como prop (ej. icono="edit" en ModalBase)
// a Bootstrap Icons, el único set de íconos del proyecto. Si llega un "bi-..." se usa tal cual.
// Los nombres van completos ("bi-eye") para que el build los detecte y los incluya (ver vite/iconosBootstrap.js).
const EQUIVALENCIAS = {
  visibility: 'bi-eye', description: 'bi-file-earmark-text', edit: 'bi-pencil-square', manage_search: 'bi-search',
  history: 'bi-clock-history', block: 'bi-slash-circle', person_search: 'bi-person-vcard', warning: 'bi-exclamation-triangle',
  timer: 'bi-stopwatch', sports: 'bi-flag', quiz: 'bi-question-circle', gavel: 'bi-hammer', forum: 'bi-chat-square-text',
  add_circle: 'bi-plus-circle', edit_calendar: 'bi-calendar-event', event: 'bi-calendar-event', workspace_premium: 'bi-award',
  upload_file: 'bi-file-earmark-arrow-up', table_restaurant: 'bi-table', swap_horiz: 'bi-arrow-left-right', stadium: 'bi-building',
  sports_score: 'bi-flag-fill', shopping_cart_checkout: 'bi-cart-check', settings: 'bi-gear', publish: 'bi-upload',
  playlist_add: 'bi-card-checklist', note_add: 'bi-file-earmark-plus', local_shipping: 'bi-truck', label: 'bi-tag', key: 'bi-key',
  how_to_reg: 'bi-person-check', grading: 'bi-clipboard-check', drive_file_rename_outline: 'bi-pencil', download: 'bi-download',
  calendar_month: 'bi-calendar3', add_box: 'bi-plus-square', account_balance_wallet: 'bi-wallet2', inventory: 'bi-box-seam',
  graph_up_arrow: 'bi-graph-up-arrow', calendar_today: 'bi-calendar-date', domain: 'bi-building', domain_add: 'bi-building-add',
  person_add: 'bi-person-plus', notification_add: 'bi-bell', group_add: 'bi-people', edit_note: 'bi-pencil-square',
  post_add: 'bi-file-earmark-plus', person_off: 'bi-person-x', wrong_location: 'bi-geo-alt', error_outline: 'bi-exclamation-circle',
  error: 'bi-exclamation-circle', check: 'bi-check-lg', check_circle: 'bi-check-circle', info: 'bi-info-circle', close: 'bi-x-lg'
}

export const claseIcono = (nombre) => {
  if (!nombre) return ''
  if (nombre.startsWith('bi-')) return `bi ${nombre}`
  if (nombre.startsWith('bi ')) return nombre
  return `bi ${EQUIVALENCIAS[nombre] || 'bi-app'}`
}
