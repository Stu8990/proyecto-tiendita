import { createContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { ROLES } from '../utils/constants'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verificar si el usuario es admin (memoizado para evitar re-renders)
  const isAdmin = useMemo(() => profile?.role === ROLES.ADMIN, [profile?.role])

  // Cargar perfil del usuario
  const loadProfile = async (userId) => {
    try {
      // Intentar cargar desde caché primero
      const cachedProfile = localStorage.getItem(`profile_${userId}`)
      if (cachedProfile) {
        try {
          const parsed = JSON.parse(cachedProfile)
          setProfile(parsed)
          setLoading(false) // Mostrar caché inmediatamente
        } catch (e) {
          console.error('Error parseando caché:', e)
        }
      }

      // Luego hacer la query real
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Guardar en caché y actualizar state
      localStorage.setItem(`profile_${userId}`, JSON.stringify(data))
      setProfile(data)
      return data
    } catch (err) {
      console.error('Error cargando perfil:', err)
      setError(err.message)
      return null
    } finally {
      // CRÍTICO: Siempre resetear loading al final
      setLoading(false)
    }
  }

  // Inicializar sesión
  useEffect(() => {
    let mounted = true

    // Función async para cargar sesión
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return

        setUser(session?.user ?? null)

        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error inicializando sesión:', err)
        if (mounted) {
          setLoading(false)
          setError(err.message)
        }
      }
    }

    initSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return

        setUser(session?.user ?? null)

        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Registrar nuevo usuario
  const signUp = async (email, password, nombre) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: nombre || email.split('@')[0]
          }
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      console.error('Error en registro:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  // Iniciar sesión
  const signIn = async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      console.error('Error en login:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  // Cerrar sesión
  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Limpiar caché del perfil
      if (user?.id) {
        localStorage.removeItem(`profile_${user.id}`)
      }

      setUser(null)
      setProfile(null)
    } catch (err) {
      console.error('Error cerrando sesión:', err)
      setError(err.message)
    }
  }

  const value = {
    user,
    profile,
    isAdmin,
    loading,
    error,
    signUp,
    signIn,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
