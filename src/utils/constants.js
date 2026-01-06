// Roles de usuario
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
}

// Productos del bar (precios en USD)
export const PRODUCTOS = [
  { value: 'bonyurt', label: 'BonYurt', precio: 1.15 },
  { value: 'cerveza', label: 'Cerveza', precio: 1.50 },
  { value: 'chifle_sin_marca', label: 'Chifle sin Marca', precio: 0.70 },
  { value: 'chochos', label: 'Chochos', precio: 1.15 },
  { value: 'chocochips', label: 'ChocoChips', precio: 0.65 },
  { value: 'club_social_integral', label: 'Club Social Integral', precio: 0.45 },
  { value: 'cocacola_original', label: 'CocaCola Original', precio: 0.65 },
  { value: 'crunch', label: 'Crunch', precio: 0.65 },
  { value: 'doritos_limon', label: 'Doritos Limón', precio: 0.65 },
  { value: 'doritos_queso', label: 'Doritos Queso', precio: 0.65 },
  { value: 'dulcas_break', label: 'Dulcas Break', precio: 1.15 },
  { value: 'galak', label: 'Galak', precio: 0.65 },
  { value: 'galletas_amor', label: 'Galletas Amor', precio: 0.45 },
  { value: 'golpe', label: 'Golpe', precio: 0.65 },
  { value: 'gomitas', label: 'Gomitas', precio: 0.65 },
  { value: 'habas', label: 'Habas', precio: 0.65 },
  { value: 'helado_corneto', label: 'Helado Corneto', precio: 1.15 },
  { value: 'helado_sanduche', label: 'Helado Sánduche', precio: 1.15 },
  { value: 'inacake', label: 'InaCake', precio: 0.65 },
  { value: 'leche_toni', label: 'Leche Toni', precio: 1.15 },
  { value: 'mani_dulce', label: 'Maní de Dulce', precio: 0.65 },
  { value: 'manicho', label: 'Manicho', precio: 0.65 },
  { value: 'manicris', label: 'ManiCris', precio: 0.45 },
  { value: 'oreo', label: 'Oreo', precio: 0.65 },
  { value: 'papas_sin_marca', label: 'Papas sin Marca', precio: 0.65 },
  { value: 'platanitos_limon', label: 'Platanitos de Limón', precio: 0.65 },
  { value: 'pulp', label: 'Pulp', precio: 0.65 },
  { value: 'quintuples', label: 'Quíntuples', precio: 0.50 },
  { value: 'ryskos', label: 'Ryskos', precio: 0.65 },
  { value: 'sanduches', label: 'Sánduches', precio: 0.75 },
  { value: 'tigreton', label: 'Tigreton', precio: 1.10 },
  { value: 'tonimix', label: 'ToniMix', precio: 1.15 },
  { value: 'topsy', label: 'Topsy', precio: 0.35 },
  { value: 'tostitos_nachos', label: 'Tostitos Nachos', precio: 0.65 },
  { value: 'tostitos_original', label: 'Tostitos Original', precio: 0.65 },
  { value: 'trident', label: 'Trident', precio: 0.65 },
  { value: 'galleta_nestle', label: 'Galleta Nestlé', precio: 0.95 },
  { value: 'quinoa', label: 'Quinoa', precio: 0.90 },
  { value: 'galletas_festival', label: 'Galletas Festival', precio: 0.65 },
  { value: 'atun', label: 'Atún', precio: 1.10 },
  { value: 'galletas_ricas', label: 'Galletas Ricas', precio: 0.65 },
  { value: 'natuchips', label: 'NatuChips', precio: 0.65 },
  { value: 'tango', label: 'Tango', precio: 0.45 },
  { value: 'yuca', label: 'Yuca', precio: 0.65 },
  { value: 'frozen', label: 'Frozen', precio: 0.35 },
  { value: 'kash', label: 'Kash', precio: 0.35 },
  { value: 'chips_ahoy', label: 'Chips Ahoy', precio: 0.65 },
  { value: 'queso', label: 'Queso', precio: 0.25 },
  { value: 'jamon', label: 'Jamón', precio: 0.25 },
  { value: 'guitig', label: 'Guitig', precio: 0.80 },
  { value: 'papas_ruffles', label: 'Papas Ruffles', precio: 0.70 },
  { value: 'cono_topsy_mms', label: 'Cono Topsy M&M’s', precio: 1.15 },
  { value: 'sanduche_tomate', label: 'Sánduche de tomate', precio: 1.25 },
  { value: 'otro', label: 'Otro', precio: 0 }
]

// Estados de carga
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  GENERIC: 'Ocurrió un error. Por favor intenta de nuevo.',
  AUTH_FAILED: 'Email o contraseña incorrectos.',
  NETWORK: 'Error de conexión. Verifica tu internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  REQUIRED_FIELDS: 'Por favor completa todos los campos requeridos.'
}
