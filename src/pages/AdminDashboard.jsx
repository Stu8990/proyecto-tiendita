import { useState, useEffect, useCallback, useRef } from 'react'
import { Layout } from '../components/layout/Layout'
import { ConsumoForm } from '../components/consumos/ConsumoForm'
import { ConsumoList } from '../components/consumos/ConsumoList'
import { PagoForm } from '../components/pagos/PagoForm'
import { PagoList } from '../components/pagos/PagoList'
import { SaldosGlobales } from '../components/saldos/SaldosGlobales'
import { PromoForm } from '../components/promociones/PromoForm'
import { PromoStats } from '../components/promociones/PromoStats'
import { useConsumos } from '../hooks/useConsumos'
import { usePagos } from '../hooks/usePagos'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui'

/**
 * Dashboard de administrador con tabs
 */
export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('saldos') // saldos, consumos, pagos, nuevo-consumo, nuevo-pago
  const [usuarios, setUsuarios] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('')

  const { consumos, loading: loadingConsumos, refetch: refetchConsumos, addConsumo } = useConsumos()
  const { pagos, loading: loadingPagos, anularPago, refetch: refetchPagos } = usePagos()
  const refetchSaldosRef = useRef(null)

  // Cargar usuarios
  useEffect(() => {
    loadUsuarios()
  }, [])

  // Callback estable para recibir la función refetch de SaldosGlobales
  const handleRefetchSaldos = useCallback((refetchFn) => {
    refetchSaldosRef.current = refetchFn
  }, [])

  // Función para refrescar todo después de cualquier cambio
  const refreshAll = useCallback(() => {
    refetchConsumos()
    refetchPagos()
    if (refetchSaldosRef.current) {
      refetchSaldosRef.current()
    }
  }, [refetchConsumos, refetchPagos])

  // Wrapper para anular pago que refresca todo
  const handleAnularPago = async (pagoId) => {
    await anularPago(pagoId)
    refreshAll()
  }

  const loadUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre, role')
        .order('nombre')

      if (error) throw error

      setUsuarios(data || [])
    } catch (err) {
      console.error('Error cargando usuarios:', err)
    }
  }

  // Filtrar por usuario si hay uno seleccionado
  const consumosFiltrados = usuarioSeleccionado
    ? consumos.filter(c => c.user_id === usuarioSeleccionado)
    : consumos

  const pagosFiltrados = usuarioSeleccionado
    ? pagos.filter(p => p.user_id === usuarioSeleccionado)
    : pagos

  const tabs = [
    { id: 'saldos', label: 'Saldos Globales', icon: '💰' },
    { id: 'consumos', label: 'Todos los Consumos', icon: '☕' },
    { id: 'pagos', label: 'Todos los Pagos', icon: '💵' },
    { id: 'nuevo-consumo', label: 'Registrar Consumo', icon: '➕' },
    { id: 'nuevo-pago', label: 'Registrar Pago', icon: '✅' },
    { id: 'promocion', label: 'Nueva Promoción', icon: '🎉' },
    { id: 'stats-promos', label: 'Estadísticas Promos', icon: '📊' }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">
            Gestión completa del bar
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex overflow-x-auto border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 min-w-max px-4 py-3 text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Tab: Saldos Globales */}
            {activeTab === 'saldos' && (
              <SaldosGlobales onRefetch={handleRefetchSaldos} />
            )}

            {/* Tab: Todos los Consumos */}
            {activeTab === 'consumos' && (
              <div className="space-y-4">
                {/* Filtro por usuario */}
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por usuario
                  </label>
                  <select
                    value={usuarioSeleccionado}
                    onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Todos los usuarios</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.role === 'admin' && '(Admin)'}
                      </option>
                    ))}
                  </select>
                </div>

                <ConsumoList
                  consumos={consumosFiltrados}
                  loading={loadingConsumos}
                  title={`Consumos ${usuarioSeleccionado ? 'del usuario' : 'de todos'}`}
                />
              </div>
            )}

            {/* Tab: Todos los Pagos */}
            {activeTab === 'pagos' && (
              <div className="space-y-4">
                {/* Filtro por usuario */}
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por usuario
                  </label>
                  <select
                    value={usuarioSeleccionado}
                    onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Todos los usuarios</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.role === 'admin' && '(Admin)'}
                      </option>
                    ))}
                  </select>
                </div>

                <PagoList
                  pagos={pagosFiltrados}
                  loading={loadingPagos}
                  title={`Pagos ${usuarioSeleccionado ? 'del usuario' : 'de todos'}`}
                  onAnular={handleAnularPago}
                />
              </div>
            )}

            {/* Tab: Nuevo Consumo */}
            {activeTab === 'nuevo-consumo' && (
              <div className="max-w-2xl mx-auto">
                {/* Selector de usuario */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecciona el usuario
                  </label>
                  <select
                    value={usuarioSeleccionado}
                    onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.role === 'admin' && '(Admin)'}
                      </option>
                    ))}
                  </select>
                </div>

                {usuarioSeleccionado ? (
                  <ConsumoForm
                    userIdProp={usuarioSeleccionado}
                    addConsumo={addConsumo}
                    onSuccess={() => {
                      refreshAll()
                      setUsuarioSeleccionado('')
                    }}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>Selecciona un usuario para registrar un consumo</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Nuevo Pago */}
            {activeTab === 'nuevo-pago' && (
              <div className="max-w-2xl mx-auto">
                <PagoForm
                  onSuccess={refreshAll}
                />
              </div>
            )}

            {/* Tab: Nueva Promoción */}
            {activeTab === 'promocion' && (
              <div className="max-w-2xl mx-auto">
                <PromoForm
                  onSuccess={() => {
                    // Opcional: hacer algo después de crear la promo
                  }}
                />
              </div>
            )}

            {/* Tab: Estadísticas de Promociones */}
            {activeTab === 'stats-promos' && (
              <div className="max-w-4xl mx-auto">
                <PromoStats />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
