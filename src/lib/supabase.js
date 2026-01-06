import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. ' +
    'Por favor configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Reducir tiempo de espera para token refresh
    storageKey: 'bar-deudas-auth',
    storage: window.localStorage
  },
  global: {
    headers: {
      // Habilitar caché del navegador
      'Cache-Control': 'max-age=60'
    }
  },
  db: {
    schema: 'public'
  },
  // Configuración de realtime (deshabilitado por ahora para mejor performance)
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
})
