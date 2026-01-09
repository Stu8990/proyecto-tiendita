import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Hook para gestionar promociones
 */
export const usePromociones = () => {
  const [promocionActiva, setPromocionActiva] = useState(null)
  const [promociones, setPromociones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user, isAdmin } = useAuth()

  // Obtener promoción activa (para usuarios)
  const fetchPromocionActiva = async () => {
    try {
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('promociones')
        .select('*')
        .eq('activa', true)
        .single()

      if (fetchError) {
        // Si no hay promo activa, no es un error crítico
        if (fetchError.code === 'PGRST116') {
          setPromocionActiva(null)
          return
        }
        throw fetchError
      }

      setPromocionActiva(data)
    } catch (err) {
      console.error('Error fetching promoción activa:', err)
      setError(err.message)
    }
  }

  // Verificar si el usuario ya vio la promoción activa
  const checkPromocionVista = async (promoId) => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from('promociones_vistas')
        .select('*')
        .eq('user_id', user.id)
        .eq('promocion_id', promoId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Si existe registro, ya la vio
      return !!data
    } catch (err) {
      console.error('Error checking promo vista:', err)
      return false
    }
  }

  // Obtener promoción activa no vista por el usuario
  // Ahora busca promos VIGENTES (dentro del periodo de aceptación)
  const getPromocionNoVista = async () => {
    if (!user) return null

    try {
      setLoading(true)

      // Obtener fecha de hoy en formato YYYY-MM-DD
      const hoy = new Date().toISOString().split('T')[0]

      // Obtener promo vigente (activa y dentro del periodo de aceptación)
      // fecha_limite >= hoy (todavía se puede aceptar)
      const { data: promos, error: promoError } = await supabase
        .from('promociones')
        .select('*')
        .eq('activa', true)
        .gte('fecha_limite', hoy) // Todavía se puede aceptar
        .order('fecha_promo', { ascending: true })
        .limit(1)

      if (promoError) throw promoError

      if (!promos || promos.length === 0) {
        return null // No hay promos vigentes
      }

      const promo = promos[0]

      // Verificar si ya la vio
      const yaVista = await checkPromocionVista(promo.id)

      return yaVista ? null : promo
    } catch (err) {
      console.error('Error getting promo no vista:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Marcar promoción como vista
  const marcarPromoVista = async (promoId, aceptada = false) => {
    if (!user) return { error: 'Usuario no autenticado' }

    try {
      const { error: insertError } = await supabase
        .from('promociones_vistas')
        .insert({
          user_id: user.id,
          promocion_id: promoId,
          aceptada
        })

      if (insertError) throw insertError

      return { error: null }
    } catch (err) {
      console.error('Error marcando promo vista:', err)
      return { error: err }
    }
  }

  // Aceptar promoción (marcar como vista + crear consumo)
  const aceptarPromocion = async (promo) => {
    if (!user) return { error: 'Usuario no autenticado' }

    try {
      // 1. Crear el consumo
      const { data: consumo, error: consumoError } = await supabase
        .from('consumos')
        .insert({
          user_id: user.id,
          producto: promo.producto,
          cantidad: 1,
          valor_unitario: promo.precio
        })
        .select()
        .single()

      if (consumoError) throw consumoError

      // 2. Marcar como vista y aceptada
      await marcarPromoVista(promo.id, true)

      return { data: consumo, error: null }
    } catch (err) {
      console.error('Error aceptando promoción:', err)
      return { data: null, error: err }
    }
  }

  // Rechazar promoción (solo marcar como vista)
  const rechazarPromocion = async (promoId) => {
    return await marcarPromoVista(promoId, false)
  }

  // Obtener todas las promociones (admin)
  const fetchPromociones = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('promociones')
        .select(`
          *,
          creado:profiles!promociones_creado_por_fkey(nombre)
        `)
        .order('fecha_creacion', { ascending: false })

      if (fetchError) throw fetchError

      setPromociones(data || [])
    } catch (err) {
      console.error('Error fetching promociones:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Crear nueva promoción (admin)
  const createPromocion = async (promoData) => {
    try {
      if (!isAdmin) {
        throw new Error('Solo administradores pueden crear promociones')
      }

      const { data, error: insertError } = await supabase
        .from('promociones')
        .insert({
          titulo: promoData.titulo,
          descripcion: promoData.descripcion,
          precio: promoData.precio,
          producto: promoData.producto,
          fecha_promo: promoData.fecha_promo,
          imagen_url: promoData.imagen_url || null,
          activa: true,
          creado_por: user.id
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Refetch para actualizar lista
      await fetchPromociones()

      return { data, error: null }
    } catch (err) {
      console.error('Error creating promoción:', err)
      return { data: null, error: err }
    }
  }

  // Desactivar promoción (admin)
  const desactivarPromocion = async (promoId) => {
    try {
      if (!isAdmin) {
        throw new Error('Solo administradores pueden desactivar promociones')
      }

      const { error: updateError } = await supabase
        .from('promociones')
        .update({ activa: false })
        .eq('id', promoId)

      if (updateError) throw updateError

      await fetchPromociones()

      return { error: null }
    } catch (err) {
      console.error('Error desactivando promoción:', err)
      return { error: err }
    }
  }

  // Subir imagen a Storage
  const subirImagen = async (file) => {
    try {
      if (!isAdmin) {
        throw new Error('Solo administradores pueden subir imágenes')
      }

      // Generar nombre único
      const fileExt = file.name.split('.').pop()
      const fileName = `promo-${Date.now()}.${fileExt}`

      // Subir a Storage
      const { data, error: uploadError } = await supabase.storage
        .from('promociones')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('promociones')
        .getPublicUrl(fileName)

      return { url: publicUrl, error: null }
    } catch (err) {
      console.error('Error subiendo imagen:', err)
      return { url: null, error: err }
    }
  }

  // Fetch inicial (solo admin ve todas)
  useEffect(() => {
    if (isAdmin) {
      fetchPromociones()
    } else if (user) {
      fetchPromocionActiva()
    }
  }, [user, isAdmin])

  return {
    promocionActiva,
    promociones,
    loading,
    error,
    getPromocionNoVista,
    aceptarPromocion,
    rechazarPromocion,
    createPromocion,
    desactivarPromocion,
    subirImagen,
    refetch: isAdmin ? fetchPromociones : fetchPromocionActiva
  }
}
