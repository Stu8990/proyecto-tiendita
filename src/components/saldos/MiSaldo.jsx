import { useEffect } from 'react'
import { Card, Loading } from '../ui'
import { formatCurrency } from '../../utils/formatters'
import { useSaldos } from '../../hooks/useSaldos'
import { useAuth } from '../../hooks/useAuth'

/**
 * Componente para mostrar el saldo de un usuario
 * @param {function} onRefetch - Callback para obtener la función refetch
 */
export const MiSaldo = ({ onRefetch }) => {
  const { user } = useAuth()
  const { saldos, loading, refetch } = useSaldos(user?.id)

  // Exponer refetch al componente padre
  useEffect(() => {
    if (onRefetch && refetch) {
      onRefetch(refetch)
    }
  }, [onRefetch, refetch])

  if (loading) {
    return (
      <Card>
        <Loading message="Cargando saldo..." />
      </Card>
    )
  }

  const saldo = saldos[0] || {
    total_consumido: 0,
    total_pagado: 0,
    saldo: 0
  }

  const estaEnDeuda = saldo.saldo < 0
  const estaAlDia = saldo.saldo >= 0

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50">
      <div className="text-center space-y-6">
        {/* Título */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tu Saldo
          </h2>
          <p className="text-sm text-gray-600">
            Estado actual de tu cuenta
          </p>
        </div>

        {/* Saldo principal */}
        <div className="py-8">
          <p className="text-sm text-gray-600 mb-2">Saldo Total</p>
          <p
            className={`text-5xl font-bold ${
              estaEnDeuda ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {formatCurrency(Math.abs(saldo.saldo))}
          </p>
          <p className="mt-2 text-lg font-medium text-gray-700">
            {estaEnDeuda && 'Debes'}
            {estaAlDia && saldo.saldo > 0 && 'A tu favor'}
            {saldo.saldo === 0 && 'Estás al día'}
          </p>
        </div>

        {/* Desglose */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Consumido</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(saldo.total_consumido)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Pagado</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(saldo.total_pagado)}
            </p>
          </div>
        </div>

        {/* Indicador visual */}
        {estaEnDeuda && (
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              Tienes una deuda pendiente. Por favor realiza un pago.
            </p>
          </div>
        )}

        {estaAlDia && saldo.saldo === 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              ¡Excelente! Estás al día con tus pagos.
            </p>
          </div>
        )}

        {estaAlDia && saldo.saldo > 0 && (
          <div className="p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-800">
              Tienes saldo a tu favor. ¡Puedes seguir consumiendo!
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
