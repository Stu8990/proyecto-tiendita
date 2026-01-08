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

  // Fetch pagos (sin manejar loading internamente)
  const fetchPagos = async (signal = null) => {
    try {
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

      // Agregar abort signal si se proporciona
      if (signal) {
        query = query.abortSignal(signal)
      }

      const { data, error: fetchError } = await query

      // Verificar si fue abortado
      if (signal?.aborted) {
        return null
      }

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      // Solo loggear si no fue abortado
      if (!signal?.aborted) {
        console.error('Error fetching pagos:', err)
        setError(err.message)
      }
      throw err
    }
  }

  // Función pública para refetch manual (sin signal)
  const refetchPagos = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await fetchPagos()
      if (data !== null) {
        setPagos(data)
        // Actualizar caché
        const cacheKey = `pagos_${user.id}_${userId || 'all'}`
        localStorage.setItem(cacheKey, JSON.stringify(data))
      }
    } catch (err) {
      console.error('Error refetching pagos:', err)
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
      await refetchPagos()

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
      await refetchPagos()

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
    let abortController = new AbortController()

    const loadData = async () => {
      // Solo setear loading si hay usuario
      if (!user) {
        if (mounted) setLoading(false)
        return
      }

      // Intentar cargar desde caché primero
      const cacheKey = `pagos_${user.id}_${userId || 'all'}`
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData && mounted) {
        try {
          const parsed = JSON.parse(cachedData)
          setPagos(parsed)
          setLoading(false) // Mostrar caché inmediatamente
        } catch (e) {
          console.error('Error parseando caché de pagos:', e)
        }
      }

      // Setear loading solo si no hay caché
      if (!cachedData && mounted) {
        setLoading(true)
      }

      try {
        const data = await fetchPagos(abortController.signal)

        // Solo actualizar estado si el componente sigue montado
        if (mounted && data !== null) {
          setPagos(data)
          // Guardar en caché
          localStorage.setItem(cacheKey, JSON.stringify(data))
        }
      } catch (err) {
        // Solo actualizar error si no fue abortado y el componente sigue montado
        if (!abortController.signal.aborted && mounted) {
          console.error('Error loading pagos:', err)
          setError(err.message)
        }
      } finally {
        // Solo actualizar loading si el componente sigue montado
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
      abortController.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userId, isAdmin])

  return {
    pagos,
    loading,
    error,
    addPago,
    anularPago,
    refetch: refetchPagos
  }
}
