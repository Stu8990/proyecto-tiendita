import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { Loading, Card } from '../ui'

/**
 * Componente para mostrar estadísticas de promociones
 * Muestra cuántos usuarios aceptaron cada promoción
 */
export const PromoStats = () => {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPromo, setSelectedPromo] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('promociones_stats')
        .select('*')
        .order('fecha_promo', { ascending: false })

      if (fetchError) throw fetchError

      setStats(data || [])
    } catch (err) {
      console.error('Error fetching promo stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getFechaLabel = (fechaPromo, puedeAceptar, diasParaEntrega) => {
    const fecha = new Date(fechaPromo + 'T00:00:00')
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const diff = Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24))

    // Si es hoy (día de entrega)
    if (diff === 0) return '🔴 HOY - ENTREGA'

    // Si es mañana (cierre ya pasó, entrega mañana - DÍA DE PREPARACIÓN)
    if (diff === 1 && !puedeAceptar) return '🟡 MAÑANA - Entrega (Preparando)'

    // Si ya pasó
    if (diff < 0) return '🔵 ENTREGADA'

    // Si todavía pueden aceptar
    if (puedeAceptar) {
      if (diff === 1) return '🔴 MAÑANA - Último día'
      if (diff === 2) return '🟡 2 días - Aceptando'
      if (diff <= 4) return `🟢 ${diff} días - Aceptando`
      return `🟢 ${diff} días - Aceptando`
    }

    // Cierre cerrado pero aún no entregada
    return `🟡 ${diff} días - Preparando`
  }

  if (loading) {
    return (
      <Card>
        <Loading message="Cargando estadísticas..." />
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 text-red-600">
          <p>Error al cargar estadísticas: {error}</p>
        </div>
      </Card>
    )
  }

  if (stats.length === 0) {
    return (
      <Card title="Estadísticas de Promociones">
        <div className="text-center py-12">
          <div className="text-6xl mb-3">📊</div>
          <p className="text-gray-500">No hay promociones creadas aún</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Estadísticas de Promociones">
      <div className="space-y-4">
        {stats.map(promo => (
          <div
            key={promo.promocion_id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header de la promo */}
            <div
              className={`p-4 cursor-pointer ${
                selectedPromo === promo.promocion_id ? 'bg-primary-50' : 'bg-white'
              }`}
              onClick={() => setSelectedPromo(
                selectedPromo === promo.promocion_id ? null : promo.promocion_id
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {promo.titulo}
                    </h3>
                    <span className="text-sm font-medium px-2 py-1 rounded">
                      {getFechaLabel(promo.fecha_promo, promo.puede_aceptar, promo.dias_para_entrega)}
                    </span>
                    {!promo.activa && (
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                        INACTIVA
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {promo.descripcion}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      📅 {new Date(promo.fecha_promo + 'T00:00:00').toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                    <span>💰 {formatCurrency(promo.precio)}</span>
                    <span>📦 {promo.producto}</span>
                  </div>
                </div>

                {/* Estadísticas principales */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {promo.total_aceptadas}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      Aceptaron
                    </div>
                  </div>

                  {promo.total_vistas > 0 && (
                    <div className="text-xs text-gray-500">
                      {promo.total_rechazadas} rechazaron • {promo.total_vistas} vieron
                    </div>
                  )}
                </div>
              </div>

              {/* Flecha para expandir */}
              {promo.total_aceptadas > 0 && (
                <div className="mt-2 text-center">
                  <svg
                    className={`w-5 h-5 mx-auto text-gray-400 transition-transform ${
                      selectedPromo === promo.promocion_id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>

            {/* Detalle de usuarios que aceptaron */}
            {selectedPromo === promo.promocion_id && promo.total_aceptadas > 0 && (
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">
                  Usuarios que aceptaron ({promo.total_aceptadas}):
                </h4>
                <div className="space-y-2">
                  {promo.usuarios_detalle
                    .filter(u => u.aceptada)
                    .map((usuario, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {usuario.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">
                            {usuario.nombre}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(usuario.fecha, true)}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    <span className="font-bold">💡 Preparar: </span>
                    {promo.total_aceptadas} {promo.producto}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botón para refrescar */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchStats}
          className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          🔄 Actualizar estadísticas
        </button>
      </div>
    </Card>
  )
}
