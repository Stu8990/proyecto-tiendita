import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useConsumos } from '../../hooks/useConsumos'
import { Button, Input, Card, SuccessModal } from '../ui'
import { PRODUCTOS } from '../../utils/constants'

/**
 * Formulario para registrar un nuevo consumo
 * @param {object} props
 * @param {string} props.userIdProp - ID del usuario (opcional, para admin)
 * @param {function} props.onSuccess - Callback al agregar exitosamente
 */
export const ConsumoForm = ({ userIdProp, onSuccess }) => {
  const { user, isAdmin } = useAuth()
  const { addConsumo } = useConsumos()

  const [formData, setFormData] = useState({
    producto: '',
    productoCustom: '',
    cantidad: '1',
    valor_unitario: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-llenar precio si selecciona producto predefinido
    if (name === 'producto' && value !== 'otro') {
      const producto = PRODUCTOS.find(p => p.value === value)
      if (producto) {
        setFormData(prev => ({
          ...prev,
          valor_unitario: producto.precio.toString()
        }))
      }
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    const productoFinal = formData.producto === 'otro'
      ? formData.productoCustom
      : formData.producto

    if (!productoFinal) {
      newErrors.producto = 'Debes seleccionar o ingresar un producto'
    }

    const cantidad = parseInt(formData.cantidad)
    if (!formData.cantidad || cantidad <= 0 || !Number.isInteger(cantidad)) {
      newErrors.cantidad = 'La cantidad debe ser un número entero mayor a 0'
    }

    if (!formData.valor_unitario || parseFloat(formData.valor_unitario) <= 0) {
      newErrors.valor_unitario = 'El valor debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    const productoFinal = formData.producto === 'otro'
      ? formData.productoCustom
      : PRODUCTOS.find(p => p.value === formData.producto)?.label || formData.producto

    const consumoData = {
      user_id: userIdProp || user.id,
      producto: productoFinal,
      cantidad: parseInt(formData.cantidad),
      valor_unitario: parseFloat(formData.valor_unitario)
    }

    const { error } = await addConsumo(consumoData)

    if (error) {
      setErrors({ general: 'Error al registrar consumo. Intenta de nuevo.' })
      setIsLoading(false)
      return
    }

    // Resetear formulario
    setFormData({
      producto: '',
      productoCustom: '',
      cantidad: '1',
      valor_unitario: ''
    })

    // Mostrar modal de éxito
    setShowSuccessModal(true)

    if (onSuccess) {
      onSuccess()
    }

    setIsLoading(false)
  }

  return (
    <>
      <Card title="Registrar Consumo">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

        {/* Selector de producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Producto <span className="text-red-500">*</span>
          </label>
          <select
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Selecciona un producto</option>
            {PRODUCTOS.map(producto => {
              // Solo admin puede seleccionar "Otro"
              if (producto.value === 'otro' && !isAdmin) return null

              return (
                <option key={producto.value} value={producto.value}>
                  {producto.label} {producto.precio > 0 && `- $${producto.precio}`}
                </option>
              )
            })}
          </select>
          {errors.producto && (
            <p className="mt-1 text-sm text-red-600">{errors.producto}</p>
          )}
        </div>

        {/* Input para producto personalizado */}
        {formData.producto === 'otro' && (
          <Input
            label="Especifica el producto"
            type="text"
            name="productoCustom"
            value={formData.productoCustom}
            onChange={handleChange}
            placeholder="Ej: Sandwich"
            required
            disabled={isLoading}
          />
        )}

        {/* Cantidad */}
        <Input
          label="Cantidad"
          type="number"
          name="cantidad"
          value={formData.cantidad}
          onChange={handleChange}
          placeholder="1"
          error={errors.cantidad}
          required
          disabled={isLoading}
          min="1"
          step="1"
        />

        {/* Valor unitario - Solo admin puede editarlo */}
        <Input
          label="Valor Unitario ($)"
          type="number"
          name="valor_unitario"
          value={formData.valor_unitario}
          onChange={handleChange}
          placeholder="1000"
          error={errors.valor_unitario}
          required
          disabled={isLoading || !isAdmin}
          min="0.01"
          step="0.01"
        />
        {!isAdmin && (
          <p className="text-xs text-gray-500 -mt-2">
            El precio se asigna automáticamente según el producto seleccionado
          </p>
        )}

        {/* Total calculado */}
        {formData.cantidad && formData.valor_unitario && (
          <div className="p-3 bg-primary-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Total: </span>
              <span className="text-lg font-bold text-primary-600">
                ${(parseInt(formData.cantidad) * parseFloat(formData.valor_unitario)).toLocaleString('es-CO')}
              </span>
            </p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          Registrar Consumo
        </Button>
      </form>
    </Card>

      {/* Modal de éxito */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Consumo registrado exitosamente"
        duration={3000}
      />
    </>
  )
}
