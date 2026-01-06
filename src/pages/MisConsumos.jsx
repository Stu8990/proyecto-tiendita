import { useState, useCallback } from 'react'
import { Layout } from '../components/layout/Layout'
import { ConsumoForm } from '../components/consumos/ConsumoForm'
import { ConsumoList } from '../components/consumos/ConsumoList'
import { MiSaldo } from '../components/saldos/MiSaldo'
import { useConsumos } from '../hooks/useConsumos'
import { useAuth } from '../hooks/useAuth'

/**
 * Página de consumos del usuario
 */
export const MisConsumos = () => {
  const { user } = useAuth()
  const { consumos, loading, refetch } = useConsumos(user?.id)
  const [saldoKey, setSaldoKey] = useState(0)

  // Función para refrescar todo cuando se registra un consumo
  const handleConsumoSuccess = useCallback(() => {
    refetch() // Refrescar lista de consumos
    setSaldoKey(prev => prev + 1) // Forzar re-render del saldo
  }, [refetch])

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Título */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Consumos</h1>
          <p className="text-gray-600 mt-1">
            Registra y gestiona tus consumos del bar
          </p>
        </div>

        {/* Saldo - se refresca con key */}
        <MiSaldo key={saldoKey} />

        {/* Formulario */}
        <ConsumoForm onSuccess={handleConsumoSuccess} />

        {/* Lista de consumos */}
        <ConsumoList
          consumos={consumos}
          loading={loading}
          title="Historial de Consumos"
        />
      </div>
    </Layout>
  )
}
