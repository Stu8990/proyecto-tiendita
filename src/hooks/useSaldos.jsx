import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Hook para consultar saldos de usuarios
 * @param {string} userId - ID del usuario (opcional, si es admin puede ver todos)
 */
export const useSaldos = (userId = null) => {
  const [saldos, setSaldos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user, isAdmin } = useAuth()

  // Fetch saldos desde la vista (sin manejar loading internamente)
  const fetchSaldos = async (signal = null) => {
    try {
      setError(null)

      let query = supabase
        .from('saldos_usuarios')
        .select('*')

      // Si hay userId específico, filtrar por ese usuario
      // Si no hay userId y no es admin, usar el user actual
      if (userId) {
        query = query.eq('user_id', userId)
      } else if (!isAdmin && user) {
        query = query.eq('user_id', user.id)
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
        console.error('Error fetching saldos:', err)
        setError(err.message)
      }
      throw err
    }
  }

  // Obtener saldo de un usuario específico
  const getSaldoUsuario = (userId) => {
    return saldos.find(s => s.user_id === userId) || {
      total_consumido: 0,
      total_pagado: 0,
      saldo: 0
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
      const cacheKey = `saldos_${user.id}_${userId || 'all'}`
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData && mounted) {
        try {
          const parsed = JSON.parse(cachedData)
          setSaldos(parsed)
          setLoading(false) // Mostrar caché inmediatamente
        } catch (e) {
          console.error('Error parseando caché de saldos:', e)
        }
      }

      // Setear loading solo si no hay caché
      if (!cachedData && mounted) {
        setLoading(true)
      }

      try {
        const data = await fetchSaldos(abortController.signal)

        // Solo actualizar estado si el componente sigue montado
        if (mounted && data !== null) {
          setSaldos(data)
          // Guardar en caché
          localStorage.setItem(cacheKey, JSON.stringify(data))
        }
      } catch (err) {
        // Solo actualizar error si no fue abortado y el componente sigue montado
        if (!abortController.signal.aborted && mounted) {
          console.error('Error loading saldos:', err)
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

  // Función pública para refetch manual (sin signal)
  const refetchSaldos = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await fetchSaldos()
      if (data !== null) {
        setSaldos(data)
        // Actualizar caché
        const cacheKey = `saldos_${user.id}_${userId || 'all'}`
        localStorage.setItem(cacheKey, JSON.stringify(data))
      }
    } catch (err) {
      console.error('Error refetching saldos:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    saldos,
    loading,
    error,
    getSaldoUsuario,
    refetch: refetchSaldos
  }
}
