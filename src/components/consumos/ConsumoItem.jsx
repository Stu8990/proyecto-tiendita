import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useConsumos } from '../../hooks/useConsumos'
import { Button, ConfirmModal } from '../ui'
import { formatCurrency, formatDate } from '../../utils/formatters'

/**
 * Componente para mostrar un consumo individual
 */
export const ConsumoItem = ({ consumo }) => {
  const { user, isAdmin } = useAuth()
  const { anularConsumo } = useConsumos()
  const [isAnulando, setIsAnulando] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Solo admin puede anular consumos
  const puedeAnular = isAdmin && !consumo.anulado

  const handleAnular = () => {
    setShowConfirmModal(true)
  }

  const confirmAnular = async () => {
    setShowConfirmModal(false)
    setIsAnulando(true)
    await anularConsumo(consumo.id)
    setIsAnulando(false)
  }

  return (
    <div
      className={`
        p-4 rounded-lg border
        ${consumo.anulado
          ? 'bg-gray-50 border-gray-300 opacity-60'
          : 'bg-white border-gray-200 hover:border-primary-300'
        }
        transition-colors
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Producto y cantidad */}
          <div className="flex items-center space-x-2 mb-1">
            <h4 className={`font-medium text-gray-900 ${consumo.anulado ? 'line-through' : ''}`}>
              {consumo.producto}
            </h4>
            {consumo.anulado && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                ANULADO
              </span>
            )}
          </div>

          {/* Detalles */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              Cantidad: <span className="font-medium">{consumo.cantidad}</span>
              {' × '}
              <span className="font-medium">{formatCurrency(consumo.valor_unitario)}</span>
            </p>

            {isAdmin && consumo.profile?.nombre && (
              <p className="text-xs text-gray-500">
                Usuario: {consumo.profile.nombre}
              </p>
            )}

            <p className="text-xs text-gray-500">
              {formatDate(consumo.created_at, true)}
            </p>

            {consumo.anulado && consumo.anulado_at && (
              <p className="text-xs text-red-600">
                Anulado: {formatDate(consumo.anulado_at, true)}
              </p>
            )}
          </div>
        </div>

        {/* Total y acciones */}
        <div className="flex flex-col items-end space-y-2">
          <p className={`text-lg font-bold ${consumo.anulado ? 'text-gray-500' : 'text-green-600'}`}>
            {formatCurrency(consumo.total)}
          </p>

          {puedeAnular && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleAnular}
              loading={isAnulando}
            >
              Anular
            </Button>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        show={showConfirmModal}
        onConfirm={confirmAnular}
        onCancel={() => setShowConfirmModal(false)}
        title="¿Estás seguro?"
        message={`Vas a anular: ${consumo.producto} (${consumo.cantidad} ${consumo.cantidad === 1 ? 'unidad' : 'unidades'}) - ${formatCurrency(consumo.total)}`}
        confirmText="Sí, anular"
        cancelText="No, cancelar"
      />
    </div>
  )
}
