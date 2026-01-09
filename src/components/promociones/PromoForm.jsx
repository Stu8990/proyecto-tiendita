import { useState } from 'react'
import { Button, Input, Card, SuccessModal } from '../ui'
import { usePromociones } from '../../hooks/usePromociones'
import { formatCurrency } from '../../utils/formatters'

/**
 * Formulario para crear promociones (solo admin)
 */
export const PromoForm = ({ onSuccess }) => {
  const { createPromocion, subirImagen } = usePromociones()

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    producto: '',
    fecha_promo: '' // Fecha para la cual es válida la promo
  })
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (file) {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imagen: 'Debe ser una imagen (JPG, PNG, WebP)' }))
        return
      }

      // Validar tamaño (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, imagen: 'La imagen debe ser menor a 2MB' }))
        return
      }

      setImagenFile(file)
      setErrors(prev => ({ ...prev, imagen: null }))

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagenFile(null)
    setImagenPreview(null)
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.titulo) {
      newErrors.titulo = 'El título es obligatorio'
    }

    if (!formData.descripcion) {
      newErrors.descripcion = 'La descripción es obligatoria'
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0'
    }

    if (!formData.producto) {
      newErrors.producto = 'El nombre del producto es obligatorio'
    }

    if (!formData.fecha_promo) {
      newErrors.fecha_promo = 'La fecha es obligatoria'
    } else {
      // Validar que la fecha no sea en el pasado
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const fechaPromo = new Date(formData.fecha_promo + 'T00:00:00')

      if (fechaPromo < hoy) {
        newErrors.fecha_promo = 'La fecha no puede ser en el pasado'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    try {
      let imagenUrl = null

      // Subir imagen si existe
      if (imagenFile) {
        const { url, error: uploadError } = await subirImagen(imagenFile)

        if (uploadError) {
          setErrors({ general: 'Error al subir imagen. Intenta de nuevo.' })
          setIsLoading(false)
          return
        }

        imagenUrl = url
      }

      // Crear promoción
      const promoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        producto: formData.producto,
        fecha_promo: formData.fecha_promo,
        imagen_url: imagenUrl
      }

      const { error } = await createPromocion(promoData)

      if (error) {
        setErrors({ general: 'Error al crear promoción. Intenta de nuevo.' })
        setIsLoading(false)
        return
      }

      // Resetear formulario
      setFormData({
        titulo: '',
        descripcion: '',
        precio: '',
        producto: '',
        fecha_promo: ''
      })
      setImagenFile(null)
      setImagenPreview(null)

      // Mostrar modal de éxito
      setShowSuccessModal(true)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error en submit:', err)
      setErrors({ general: 'Error inesperado. Intenta de nuevo.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card title="Crear Nueva Promoción">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {/* Título */}
          <Input
            label="Título de la Promoción"
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej: Café del Día"
            error={errors.titulo}
            required
            disabled={isLoading}
          />

          {/* Fecha de la Promoción */}
          <Input
            label="Fecha de la Promoción"
            type="date"
            name="fecha_promo"
            value={formData.fecha_promo}
            onChange={handleChange}
            error={errors.fecha_promo}
            required
            disabled={isLoading}
            min={new Date().toISOString().split('T')[0]}
          />

          {formData.fecha_promo && (() => {
            const fechaEntrega = new Date(formData.fecha_promo + 'T00:00:00')
            const fechaCierre = new Date(fechaEntrega)
            fechaCierre.setDate(fechaCierre.getDate() - 1)

            return (
              <div className="p-3 bg-blue-50 rounded-lg -mt-2 space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">📅 Fecha de entrega: </span>
                  <span className="text-primary-600 font-bold">
                    {fechaEntrega.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">⏰ Cierre de pedidos: </span>
                  <span className="text-orange-600 font-bold">
                    {fechaCierre.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </p>
                <p className="text-xs text-gray-600">
                  ℹ️ Tendrás el día antes para preparar sin sorpresas de última hora
                </p>
              </div>
            )
          })()}

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ej: Café americano grande con galleta gratis"
              rows={3}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
            )}
          </div>

          {/* Producto */}
          <Input
            label="Nombre del Producto"
            type="text"
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            placeholder="Ej: Café Americano Grande"
            error={errors.producto}
            required
            disabled={isLoading}
          />

          {/* Precio */}
          <Input
            label="Precio Promocional ($)"
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            placeholder="2500"
            error={errors.precio}
            required
            disabled={isLoading}
            min="0.01"
            step="0.01"
          />

          {/* Preview del precio */}
          {formData.precio && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Precio que verán los usuarios: </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(parseFloat(formData.precio))}
                </span>
              </p>
            </div>
          )}

          {/* Imagen (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del Producto (opcional)
            </label>
            <div className="space-y-2">
              {!imagenPreview ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100
                      cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG o WebP. Máximo 2MB.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagenPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={isLoading}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {errors.imagen && (
              <p className="mt-1 text-sm text-red-600">{errors.imagen}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            Crear Promoción
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Al crear la promoción, se desactivarán automáticamente las promociones anteriores.
            Solo puede haber una promoción activa a la vez.
          </p>
        </form>
      </Card>

      {/* Modal de éxito */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Promoción creada exitosamente"
        duration={3000}
      />
    </>
  )
}
