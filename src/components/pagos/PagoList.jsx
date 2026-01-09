import { useState } from 'react'
import { Loading, Card, Button, ConfirmModal } from '../ui'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'

/**
 * Componente para listar pagos
 */
export const PagoList = ({ pagos, loading, title = 'Pagos', onAnular }) => {
  const { isAdmin } = useAuth()
  const [anulandoId, setAnulandoId] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pagoToAnular, setPagoToAnular] = useState(null)

  const handleAnular = (pago) => {
    setPagoToAnular(pago)
    setShowConfirmModal(true)
  }

  const confirmAnular = async () => {
    setShowConfirmModal(false)
    if (!pagoToAnular) return

    setAnulandoId(pagoToAnular.id)
    await onAnular(pagoToAnular.id)
    setAnulandoId(null)
    setPagoToAnular(null)
  }

  if (loading) {
    return (
      <Card>
        <Loading message="Cargando pagos..." />
      </Card>
    )
  }

  if (!pagos || pagos.length === 0) {
    return (
      <Card title={title}>
        <div className="text-center py-8 text-gray-500">
          <p>No hay pagos registrados</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title={title}>
      <div className="space-y-3">
        {pagos.map(pago => (
          <div
            key={pago.id}
            className={`
              p-4 rounded-lg border
              ${pago.anulado
                ? 'bg-gray-50 border-gray-300 opacity-60'
                : 'bg-white border-gray-200 hover:border-green-300'
              }
              transition-colors
            `}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {/* Monto destacado */}
                <div className="flex items-center gap-2 mb-2">
                  <p className={`text-2xl font-bold ${pago.anulado ? 'text-gray-500 line-through' : 'text-green-600'}`}>
                    {formatCurrency(pago.monto)}
                  </p>
                  {pago.anulado && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                      ANULADO
                    </span>
                  )}
                </div>

                {/* Detalles */}
                <div className="text-sm text-gray-600 space-y-1">
                  {isAdmin && pago.profile?.nombre && (
                    <p>
                      <span className="font-medium">Usuario:</span> {pago.profile.nombre}
                    </p>
                  )}

                  {pago.registrado?.nombre && (
                    <p className="text-xs text-gray-500">
                      Registrado por: {pago.registrado.nombre}
                    </p>
                  )}

                  <p className="text-xs text-gray-500">
                    {formatDate(pago.created_at, true)}
                  </p>

                  {pago.anulado && pago.anulado_at && (
                    <p className="text-xs text-red-600">
                      Anulado: {formatDate(pago.anulado_at, true)}
                    </p>
                  )}
                </div>
              </div>

              {/* Badge y acciones */}
              <div className="flex flex-col items-end gap-2">
                {!pago.anulado && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    PAGO
                  </span>
                )}

                {/* Botón anular (solo admin) */}
                {isAdmin && !pago.anulado && onAnular && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleAnular(pago)}
                    loading={anulandoId === pago.id}
                  >
                    Anular
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        show={showConfirmModal}
        onConfirm={confirmAnular}
        onCancel={() => {
          setShowConfirmModal(false)
          setPagoToAnular(null)
        }}
        title="¿Estás seguro?"
        message={pagoToAnular ? `Vas a anular un pago de ${formatCurrency(pagoToAnular.monto)}` : ''}
        confirmText="Sí, anular"
        cancelText="No, cancelar"
      />
    </Card>
  )
}
