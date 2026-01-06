import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Hook para gestionar pagos
 * @param {string} userId - ID del usuario (opcional, si es admin puede ver todos)
 * @param {number} limit - Límite de registros a traer (default: 100)
 */
export const usePagos = (userId = null, limit = 100) => {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user, isAdmin } = useAuth()

  // Fetch pagos
  const fetchPagos = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('pagos')
        .select(`
          *,
          profile:profiles!pagos_user_id_fkey(nombre),
          registrado:profiles!pagos_registrado_por_fkey(nombre)
        `)
        .order('created_at', { ascending: false })

      // Si hay userId específico, filtrar por ese usuario
      // Si no hay userId y no es admin, usar el user actual
      if (userId) {
        query = query.eq('user_id', userId)
      } else if (!isAdmin && user) {
        query = query.eq('user_id', user.id)
      }

      // Aplicar límite solo si no hay un filtro de usuario específico
      // Para evitar traer miles de registros
      if (!userId && isAdmin && limit) {
        query = query.limit(limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setPagos(data || [])
    } catch (err) {
      console.error('Error fetching pagos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Agregar pago (solo admin)
  const addPago = async (pagoData) => {
    try {
      setError(null)

      if (!isAdmin) {
        throw new Error('Solo administradores pueden registrar pagos')
      }

      const { data, error: insertError } = await supabase
        .from('pagos')
        .insert([
          {
            user_id: pagoData.user_id,
            monto: pagoData.monto,
            registrado_por: user.id
          }
        ])
        .select()

      if (insertError) throw insertError

      // Refetch para actualizar la lista
      await fetchPagos()

      return { data, error: null }
    } catch (err) {
      console.error('Error adding pago:', err)
      setError(err.message)
      return { data: null, error: err }
    }
  }

  // Anular pago (solo admin)
  const anularPago = async (pagoId) => {
    try {
      setError(null)

      if (!isAdmin) {
        throw new Error('Solo administradores pueden anular pagos')
      }

      const { error: updateError } = await supabase
        .from('pagos')
        .update({
          anulado: true,
          anulado_at: new Date().toISOString()
        })
        .eq('id', pagoId)

      if (updateError) throw updateError

      // Refetch para actualizar la lista
      await fetchPagos()

      return { error: null }
    } catch (err) {
      console.error('Error anulando pago:', err)
      setError(err.message)
      return { error: err }
    }
  }

  // Fetch inicial
  useEffect(() => {
    let mounted = true

    if (user) {
      fetchPagos()
    } else {
      // Si no hay usuario, resetear loading
      if (mounted) setLoading(false)
    }

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userId, isAdmin])

  return {
    pagos,
    loading,
    error,
    addPago,
    anularPago,
    refetch: fetchPagos
  }
}
