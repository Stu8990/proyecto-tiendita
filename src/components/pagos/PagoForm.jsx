import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePagos } from '../../hooks/usePagos'
import { supabase } from '../../lib/supabase'
import { Button, Input, Card, ConfirmModal, SuccessModal } from '../ui'
import { formatCurrency } from '../../utils/formatters'

/**
 * Formulario para registrar pagos (solo admin)
 * @param {object} props
 * @param {string} props.userIdProp - ID del usuario (opcional)
 * @param {function} props.onSuccess - Callback al agregar exitosamente
 */
export const PagoForm = ({ userIdProp, onSuccess }) => {
  const { isAdmin } = useAuth()
  const { addPago } = usePagos()

  const [usuarios, setUsuarios] = useState([])
  const [formData, setFormData] = useState({
    user_id: userIdProp || '',
    monto: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Cargar lista de usuarios (solo si es admin y no hay userIdProp)
  useEffect(() => {
    if (isAdmin && !userIdProp) {
      loadUsuarios()
    }
  }, [isAdmin, userIdProp])

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

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.user_id) {
      newErrors.user_id = 'Debes seleccionar un usuario'
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    // Mostrar modal de confirmación en lugar de registrar directamente
    setShowConfirmModal(true)
  }

  const confirmSubmit = async () => {
    setShowConfirmModal(false)
    setIsLoading(true)
    setErrors({})

    const pagoData = {
      user_id: formData.user_id,
      monto: parseFloat(formData.monto)
    }

    const { error } = await addPago(pagoData)

    if (error) {
      setErrors({ general: 'Error al registrar pago. Intenta de nuevo.' })
      setIsLoading(false)
      return
    }

    // Resetear formulario
    setFormData({
      user_id: userIdProp || '',
      monto: ''
    })

    // Mostrar modal de éxito
    setShowSuccessModal(true)

    if (onSuccess) {
      onSuccess()
    }

    setIsLoading(false)
  }

  if (!isAdmin) {
    return (
      <Card>
        <p className="text-center text-gray-600">
          Solo administradores pueden registrar pagos
        </p>
      </Card>
    )
  }

  return (
    <Card title="Registrar Pago">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        {/* Selector de usuario (si no hay userIdProp) */}
        {!userIdProp && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario <span className="text-red-500">*</span>
            </label>
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecciona un usuario</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre} {usuario.role === 'admin' && '(Admin)'}
                </option>
              ))}
            </select>
            {errors.user_id && (
              <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
            )}
          </div>
        )}

        {/* Monto */}
        <Input
          label="Monto ($)"
          type="number"
          name="monto"
          value={formData.monto}
          onChange={handleChange}
          placeholder="5000"
          error={errors.monto}
          required
          disabled={isLoading}
          min="0.01"
          step="0.01"
        />

        <Button
          type="submit"
          variant="success"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          Registrar Pago
        </Button>
      </form>

      {/* Modal de confirmación */}
      <ConfirmModal
        show={showConfirmModal}
        onConfirm={confirmSubmit}
        onCancel={() => setShowConfirmModal(false)}
        title="¿Estás seguro?"
        message={`Vas a registrar un pago de ${formData.monto ? formatCurrency(parseFloat(formData.monto)) : '$0'}`}
        confirmText="Sí, registrar"
        cancelText="No, cancelar"
      />

      {/* Modal de éxito */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Pago registrado exitosamente"
        duration={3000}
      />
    </Card>
  )
}
