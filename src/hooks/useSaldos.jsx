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

  // Fetch saldos desde la vista
  const fetchSaldos = async () => {
    try {
      setLoading(true)
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

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setSaldos(data || [])
    } catch (err) {
      console.error('Error fetching saldos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
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
      if (!user) {
        if (mounted) setLoading(false)
        return
      }

      try {
        await fetchSaldos()
      } catch (err) {
        if (!mounted || abortController.signal.aborted) {
          return
        }
        console.error('Error loading saldos:', err)
      } finally {
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
    saldos,
    loading,
    error,
    getSaldoUsuario,
    refetch: fetchSaldos
  }
}
