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

  // Fetch consumos (sin manejar loading internamente)
  const fetchConsumos = async (signal = null) => {
    try {
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
        console.error('Error fetching consumos:', err)
        setError(err.message)
      }
      throw err
    }
  }

  // Función pública para refetch manual (sin signal)
  const refetchConsumos = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await fetchConsumos()

      if (data !== null) {
        setConsumos(data)
        // Actualizar caché
        const cacheKey = `consumos_${user.id}_${userId || 'all'}`
        localStorage.setItem(cacheKey, JSON.stringify(data))
      }
    } catch (err) {
      console.error('Error refetching consumos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Agregar consumo
  const addConsumo = async (consumoData) => {
    try {
      setError(null)

      console.log('🍺 addConsumo: Iniciando...', consumoData)
      console.log('🍺 addConsumo: Usuario actual:', user)

      const insertData = {
        user_id: consumoData.user_id || user.id,
        producto: consumoData.producto,
        cantidad: consumoData.cantidad,
        valor_unitario: consumoData.valor_unitario
      }

      console.log('🍺 addConsumo: Datos a insertar:', insertData)

      const { data, error: insertError } = await supabase
        .from('consumos')
        .insert([insertData])
        .select()

      console.log('🍺 addConsumo: Respuesta de Supabase - data:', data, 'error:', insertError)

      if (insertError) {
        console.error('❌ Error en insert:', insertError)
        throw insertError
      }

      console.log('✅ addConsumo: Consumo insertado exitosamente')

      // Refetch para actualizar la lista
      console.log('🔄 addConsumo: Refetching consumos...')
      await refetchConsumos()
      console.log('✅ addConsumo: Refetch completado')

      return { data, error: null }
    } catch (err) {
      console.error('❌ Error adding consumo:', err)
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
      await refetchConsumos()

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
    let abortController = new AbortController()

    const loadData = async () => {
      // Solo setear loading si hay usuario
      if (!user) {
        if (mounted) setLoading(false)
        return
      }

      // Intentar cargar desde caché primero
      const cacheKey = `consumos_${user.id}_${userId || 'all'}`
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData && mounted) {
        try {
          const parsed = JSON.parse(cachedData)
          setConsumos(parsed)
          setLoading(false) // Mostrar caché inmediatamente
        } catch (e) {
          console.error('Error parseando caché de consumos:', e)
        }
      }

      // Setear loading solo si no hay caché
      if (!cachedData && mounted) {
        setLoading(true)
      }

      try {
        const data = await fetchConsumos(abortController.signal)

        // Solo actualizar estado si el componente sigue montado
        if (mounted && data !== null) {
          setConsumos(data)
          // Guardar en caché
          localStorage.setItem(cacheKey, JSON.stringify(data))
        }
      } catch (err) {
        // Solo actualizar error si no fue abortado y el componente sigue montado
        if (!abortController.signal.aborted && mounted) {
          console.error('Error loading consumos:', err)
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
    consumos,
    loading,
    error,
    addConsumo,
    anularConsumo,
    refetch: refetchConsumos
  }
}
