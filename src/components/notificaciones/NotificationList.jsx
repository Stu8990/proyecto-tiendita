import { useNotificaciones } from '../../hooks/useNotificaciones'
import { formatDate } from '../../utils/formatters'
import { Loading } from '../ui'

/**
 * Lista de notificaciones para admin
 */
export const NotificationList = ({ onClose }) => {
  const {
    notificaciones,
    loading,
    marcarLeida,
    marcarTodasLeidas,
    eliminarNotificacion
  } = useNotificaciones()

  const handleMarcarLeida = async (notifId) => {
    await marcarLeida(notifId)
  }

  const handleMarcarTodasLeidas = async () => {
    await marcarTodasLeidas()
  }

  const handleEliminar = async (notifId) => {
    await eliminarNotificacion(notifId)
  }

  if (loading) {
    return (
      <div className="p-4">
        <Loading message="Cargando notificaciones..." />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">Notificaciones</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {notificaciones.length > 0 && notificaciones.some(n => !n.leida) && (
          <button
            onClick={handleMarcarTodasLeidas}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      {notificaciones.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-6xl mb-3">🔔</div>
          <p className="text-gray-500 text-sm">No hay notificaciones</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notificaciones.map(notif => (
            <div
              key={notif.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !notif.leida ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icono según tipo */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  notif.tipo === 'promo_aceptada'
                    ? 'bg-green-100'
                    : 'bg-blue-100'
                }`}>
                  {notif.tipo === 'promo_aceptada' ? (
                    <span className="text-xl">🎉</span>
                  ) : (
                    <span className="text-xl">💰</span>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm text-gray-900 ${!notif.leida ? 'font-semibold' : ''}`}>
                    {notif.mensaje}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notif.created_at, true)}
                  </p>
                </div>

                {/* Indicador de no leída */}
                {!notif.leida && (
                  <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full" />
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 mt-3 ml-13">
                {!notif.leida && (
                  <button
                    onClick={() => handleMarcarLeida(notif.id)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Marcar como leída
                  </button>
                )}
                <button
                  onClick={() => handleEliminar(notif.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
