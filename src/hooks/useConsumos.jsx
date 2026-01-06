import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Hook para gestionar consumos
 * @param {string} userId - ID del usuario (opcional, si es admin puede ver todos)
 * @param {number} limit - Límite de registros a traer (default: 100)
 */
export const useConsumos = (userId = null, limit = 100) => {
  const [consumos, setConsumos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user, isAdmin } = useAuth()

  // Fetch consumos
  const fetchConsumos = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('consumos')
        .select(`
          *,
          profile:profiles(nombre)
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

      setConsumos(data || [])
    } catch (err) {
      console.error('Error fetching consumos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Agregar consumo
  const addConsumo = async (consumoData) => {
    try {
      setError(null)

      const { data, error: insertError } = await supabase
        .from('consumos')
        .insert([
          {
            user_id: consumoData.user_id || user.id,
            producto: consumoData.producto,
            cantidad: consumoData.cantidad,
            valor_unitario: consumoData.valor_unitario
          }
        ])
        .select()

      if (insertError) throw insertError

      // Refetch para actualizar la lista
      await fetchConsumos()

      return { data, error: null }
    } catch (err) {
      console.error('Error adding consumo:', err)
      setError(err.message)
      return { data: null, error: err }
    }
  }

  // Anular consumo
  const anularConsumo = async (consumoId) => {
    try {
      setError(null)

      const { error: updateError } = await supabase
        .from('consumos')
        .update({
          anulado: true,
          anulado_at: new Date().toISOString()
        })
        .eq('id', consumoId)

      if (updateError) throw updateError

      // Refetch para actualizar la lista
      await fetchConsumos()

      return { error: null }
    } catch (err) {
      console.error('Error anulando consumo:', err)
      setError(err.message)
      return { error: err }
    }
  }

  // Fetch inicial
  useEffect(() => {
    let mounted = true

    if (user) {
      fetchConsumos()
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
    consumos,
    loading,
    error,
    addConsumo,
    anularConsumo,
    refetch: fetchConsumos
  }
}
