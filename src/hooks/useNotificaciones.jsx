import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Hook para gestionar notificaciones (solo admin)
 */
export const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user, isAdmin } = useAuth()

  // Fetch notificaciones
  const fetchNotificaciones = async () => {
    if (!isAdmin) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('notificaciones')
        .select(`
          *,
          usuario:profiles!notificaciones_user_id_fkey(nombre),
          promocion:promociones(titulo)
        `)
        .order('created_at', { ascending: false })
        .limit(50) // Últimas 50 notificaciones

      if (fetchError) throw fetchError

      setNotificaciones(data || [])

      // Contar no leídas
      const countNoLeidas = data?.filter(n => !n.leida).length || 0
      setNoLeidas(countNoLeidas)
    } catch (err) {
      console.error('Error fetching notificaciones:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Marcar notificación como leída
  const marcarLeida = async (notifId) => {
    if (!isAdmin) return { error: 'No autorizado' }

    try {
      const { error: updateError } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notifId)

      if (updateError) throw updateError

      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n => n.id === notifId ? { ...n, leida: true } : n)
      )

      // Reducir contador
      setNoLeidas(prev => Math.max(0, prev - 1))

      return { error: null }
    } catch (err) {
      console.error('Error marcando notificación:', err)
      return { error: err }
    }
  }

  // Marcar todas como leídas
  const marcarTodasLeidas = async () => {
    if (!isAdmin) return { error: 'No autorizado' }

    try {
      const { error: updateError } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('leida', false)

      if (updateError) throw updateError

      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n => ({ ...n, leida: true }))
      )

      setNoLeidas(0)

      return { error: null }
    } catch (err) {
      console.error('Error marcando todas leídas:', err)
      return { error: err }
    }
  }

  // Eliminar notificación
  const eliminarNotificacion = async (notifId) => {
    if (!isAdmin) return { error: 'No autorizado' }

    try {
      const { error: deleteError } = await supabase
        .from('notificaciones')
        .delete()
        .eq('id', notifId)

      if (deleteError) throw deleteError

      // Actualizar estado local
      const notifEliminada = notificaciones.find(n => n.id === notifId)
      setNotificaciones(prev => prev.filter(n => n.id !== notifId))

      // Si era no leída, reducir contador
      if (notifEliminada && !notifEliminada.leida) {
        setNoLeidas(prev => Math.max(0, prev - 1))
      }

      return { error: null }
    } catch (err) {
      console.error('Error eliminando notificación:', err)
      return { error: err }
    }
  }

  // Suscribirse a nuevas notificaciones en tiempo real
  useEffect(() => {
    if (!isAdmin || !user) return

    // Fetch inicial
    fetchNotificaciones()

    // Suscripción a cambios en tiempo real
    const subscription = supabase
      .channel('notificaciones-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones'
        },
        (payload) => {
          console.log('Nueva notificación:', payload.new)

          // Agregar nueva notificación al inicio
          setNotificaciones(prev => [payload.new, ...prev])
          setNoLeidas(prev => prev + 1)
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [isAdmin, user])

  return {
    notificaciones,
    noLeidas,
    loading,
    error,
    marcarLeida,
    marcarTodasLeidas,
    eliminarNotificacion,
    refetch: fetchNotificaciones
  }
}
