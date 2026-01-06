/**
 * Formatea un número como moneda en dólares (USD)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como $X.XX
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Si incluir la hora
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return ''

  const d = new Date(date)

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return new Intl.DateTimeFormat('es-CO', options).format(d)
}

/**
 * Formatea una fecha en formato relativo (hace X minutos/horas/días)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha en formato relativo
 */
export const formatRelativeDate = (date) => {
  if (!date) return ''

  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Hace un momento'
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`

  return formatDate(date)
}

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
