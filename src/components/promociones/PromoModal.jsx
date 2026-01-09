import { useState } from 'react'
import { Button } from '../ui'
import { formatCurrency } from '../../utils/formatters'

/**
 * Modal de promoción para usuarios
 * Se muestra cuando hay una promo activa que no han visto
 */
export const PromoModal = ({ promo, onAceptar, onRechazar, loading }) => {
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  if (!promo) return null

  const handleAceptar = async () => {
    setIsAccepting(true)
    await onAceptar()
    setIsAccepting(false)
  }

  const handleRechazar = async () => {
    setIsRejecting(true)
    await onRechazar()
    setIsRejecting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slideUp">
        <div className="flex flex-col md:flex-row">
          {/* Lado izquierdo - Mascota */}
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-6 md:p-8 flex items-center justify-center md:w-2/5">
            <img
              src="/images/mascotaSaludo.png"
              alt="Mascota saludando"
              className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'block'
              }}
            />
            {/* Emoji fallback */}
            <div className="text-9xl" style={{ display: 'none' }}>👋</div>
          </div>

          {/* Lado derecho - Contenido */}
          <div className="p-6 md:p-8 md:w-3/5 flex flex-col">
            {/* Título */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full mb-2">
                PROMOCIÓN DISPONIBLE
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {promo.titulo}
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                {promo.descripcion}
              </p>

              {/* Fecha de entrega */}
              {promo.fecha_promo && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">📅 Entrega: </span>
                    {new Date(promo.fecha_promo + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Imagen del producto (si existe) */}
            {promo.imagen_url && (
              <div className="mb-4 rounded-xl overflow-hidden border-2 border-gray-200">
                <img
                  src={promo.imagen_url}
                  alt={promo.producto}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.parentElement.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Precio */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-700 font-medium mb-1">
                Precio especial
              </p>
              <p className="text-4xl font-bold text-green-600">
                {formatCurrency(promo.precio)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {promo.producto}
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-auto">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleRechazar}
                loading={isRejecting}
                disabled={isAccepting || loading}
                className="flex-1"
              >
                No, gracias
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleAceptar}
                loading={isAccepting}
                disabled={isRejecting || loading}
                className="flex-1"
              >
                Sí, quiero
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Al aceptar, se registrará el consumo automáticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
