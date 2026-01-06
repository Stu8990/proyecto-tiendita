import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { MiSaldo } from '../components/saldos/MiSaldo'
import { ConsumoList } from '../components/consumos/ConsumoList'
import { PagoList } from '../components/pagos/PagoList'
import { useConsumos } from '../hooks/useConsumos'
import { usePagos } from '../hooks/usePagos'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui'

/**
 * Página de saldo del usuario
 */
export const MiSaldoPage = () => {
  const { user } = useAuth()
  const { consumos, loading: loadingConsumos } = useConsumos(user?.id)
  const { pagos, loading: loadingPagos } = usePagos(user?.id)

  // Limitar a últimos 5
  const ultimosConsumos = consumos.slice(0, 5)
  const ultimosPagos = pagos.slice(0, 5)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Título */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Saldo</h1>
          <p className="text-gray-600 mt-1">
            Resumen de tu cuenta en el bar
          </p>
        </div>

        {/* Saldo principal */}
        <MiSaldo />

        {/* Botón para registrar consumo */}
        <div className="text-center">
          <Link to="/mis-consumos">
            <Button variant="primary" size="lg">
              Registrar Nuevo Consumo
            </Button>
          </Link>
        </div>

        {/* Últimos consumos */}
        <ConsumoList
          consumos={ultimosConsumos}
          loading={loadingConsumos}
          title="Últimos Consumos"
        />

        {consumos.length > 5 && (
          <div className="text-center">
            <Link to="/mis-consumos">
              <Button variant="secondary">Ver Todos los Consumos</Button>
            </Link>
          </div>
        )}

        {/* Últimos pagos */}
        <PagoList
          pagos={ultimosPagos}
          loading={loadingPagos}
          title="Últimos Pagos"
        />
      </div>
    </Layout>
  )
}
