import { useEffect } from 'react'

/**
 * Modal de éxito con mascota
 * Aparece centrado en pantalla y se cierra automáticamente
 */
export const SuccessModal = ({ show, onClose, message, duration = 3000 }) => {
  useEffect(() => {
    if (show) {
      // Auto-cerrar después del duration
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, onClose, duration])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Overlay oscuro */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal centrado */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slideUp">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Contenido */}
        <div className="text-center">
          {/* Imagen de mascota */}
          <div className="mb-6">
            <img
              src="/images/mascota.png"
              alt="Mascota feliz"
              className="w-32 h-32 mx-auto object-contain animate-bounce"
              onError={(e) => {
                // Si no existe la imagen, mostrar emoji
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'block'
              }}
            />
            {/* Emoji de respaldo si no hay imagen */}
            <div className="text-8xl animate-bounce" style={{ display: 'none' }}>
              🎉
            </div>
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-600">
              ¡Éxito!
            </h3>
            <p className="text-gray-700 text-lg">
              {message}
            </p>
            <p className="text-gray-500 text-sm">
              ¡Gracias por registrar tu consumo!
            </p>
          </div>

          {/* Indicador de progreso */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-green-500 animate-progress"
                style={{
                  animation: `progress ${duration}ms linear`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
