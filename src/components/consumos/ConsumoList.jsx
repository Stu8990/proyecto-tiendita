import { ConsumoItem } from './ConsumoItem'
import { Loading, Card } from '../ui'

/**
 * Componente para listar consumos
 */
export const ConsumoList = ({ consumos, loading, title = 'Consumos' }) => {
  if (loading) {
    return (
      <Card>
        <Loading message="Cargando consumos..." />
      </Card>
    )
  }

  if (!consumos || consumos.length === 0) {
    return (
      <Card title={title}>
        <div className="text-center py-8 text-gray-500">
          <p>No hay consumos registrados</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title={title}>
      <div className="space-y-3">
        {consumos.map(consumo => (
          <ConsumoItem key={consumo.id} consumo={consumo} />
        ))}
      </div>
    </Card>
  )
}
