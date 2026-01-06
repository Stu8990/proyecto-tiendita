import { useState } from 'react'
import { Card, Loading, Input } from '../ui'
import { formatCurrency } from '../../utils/formatters'
import { useSaldos } from '../../hooks/useSaldos'
import { useAuth } from '../../hooks/useAuth'

/**
 * Componente para mostrar saldos de todos los usuarios (solo admin)
 */
export const SaldosGlobales = () => {
  const { isAdmin } = useAuth()
  const { saldos, loading } = useSaldos()
  const [filtro, setFiltro] = useState('')
  const [ordenar, setOrdenar] = useState('nombre') // nombre, saldo, consumido, pagado

  if (!isAdmin) {
    return (
      <Card>
        <p className="text-center text-gray-600">
          Solo administradores pueden ver los saldos globales
        </p>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <Loading message="Cargando saldos..." />
      </Card>
    )
  }

  // Filtrar saldos
  const saldosFiltrados = saldos.filter(s =>
    s.nombre.toLowerCase().includes(filtro.toLowerCase())
  )

  // Ordenar saldos
  const saldosOrdenados = [...saldosFiltrados].sort((a, b) => {
    switch (ordenar) {
      case 'nombre':
        return a.nombre.localeCompare(b.nombre)
      case 'saldo':
        return a.saldo - b.saldo // Menor a mayor (deudas primero)
      case 'consumido':
        return b.total_consumido - a.total_consumido // Mayor a menor
      case 'pagado':
        return b.total_pagado - a.total_pagado // Mayor a menor
      default:
        return 0
    }
  })

  // Calcular totales
  const totales = saldos.reduce(
    (acc, s) => ({
      consumido: acc.consumido + s.total_consumido,
      pagado: acc.pagado + s.total_pagado,
      deuda: acc.deuda + (s.saldo < 0 ? Math.abs(s.saldo) : 0),
      favor: acc.favor + (s.saldo > 0 ? s.saldo : 0)
    }),
    { consumido: 0, pagado: 0, deuda: 0, favor: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <p className="text-sm text-gray-600">Total Consumido</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totales.consumido)}
          </p>
        </Card>

        <Card padding="sm">
          <p className="text-sm text-gray-600">Total Pagado</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totales.pagado)}
          </p>
        </Card>

        <Card padding="sm">
          <p className="text-sm text-gray-600">Total en Deuda</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totales.deuda)}
          </p>
        </Card>

        <Card padding="sm">
          <p className="text-sm text-gray-600">Total a Favor</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(totales.favor)}
          </p>
        </Card>
      </div>

      {/* Tabla de saldos */}
      <Card title="Saldos por Usuario">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="nombre">Ordenar por Nombre</option>
              <option value="saldo">Ordenar por Saldo</option>
              <option value="consumido">Ordenar por Consumido</option>
              <option value="pagado">Ordenar por Pagado</option>
            </select>
          </div>
        </div>

        {/* Tabla responsive */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 text-sm font-semibold text-gray-700">
                  Usuario
                </th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700">
                  Consumido
                </th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700">
                  Pagado
                </th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700">
                  Saldo
                </th>
                <th className="text-center p-3 text-sm font-semibold text-gray-700">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {saldosOrdenados.map((saldo) => {
                const estaEnDeuda = saldo.saldo < 0

                return (
                  <tr key={saldo.user_id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">
                      {saldo.nombre}
                    </td>
                    <td className="p-3 text-right text-gray-700">
                      {formatCurrency(saldo.total_consumido)}
                    </td>
                    <td className="p-3 text-right text-gray-700">
                      {formatCurrency(saldo.total_pagado)}
                    </td>
                    <td
                      className={`p-3 text-right font-bold ${
                        estaEnDeuda ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {formatCurrency(Math.abs(saldo.saldo))}
                      {estaEnDeuda && ' -'}
                      {!estaEnDeuda && saldo.saldo > 0 && ' +'}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          estaEnDeuda
                            ? 'bg-red-100 text-red-700'
                            : saldo.saldo > 0
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {estaEnDeuda && 'Debe'}
                        {!estaEnDeuda && saldo.saldo > 0 && 'A favor'}
                        {saldo.saldo === 0 && 'Al día'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {saldosOrdenados.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No se encontraron usuarios</p>
          </div>
        )}
      </Card>
    </div>
  )
}
