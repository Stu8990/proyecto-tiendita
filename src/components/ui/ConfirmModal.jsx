import { Button } from './Button'

/**
 * Modal de confirmación con imagen de mascota
 */
export const ConfirmModal = ({
  show,
  onConfirm,
  onCancel,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Sí, confirmar',
  cancelText = 'Cancelar'
}) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slideUp">
        {/* Imagen de mascota preguntando */}
        <div className="text-center mb-6">
          <img
            src="/images/mascotaPregunta.png"
            alt="Mascota preguntando"
            className="w-32 h-32 mx-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'block'
            }}
          />
          {/* Emoji fallback si no carga la imagen */}
          <div className="text-8xl" style={{ display: 'none' }}>🤔</div>
        </div>

        {/* Título */}
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
          {title}
        </h3>

        {/* Mensaje */}
        {message && (
          <p className="text-gray-700 text-center text-lg mb-6">
            {message}
          </p>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={onCancel}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
