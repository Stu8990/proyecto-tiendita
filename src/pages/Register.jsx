import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { RegisterForm } from '../components/auth/RegisterForm'
import { Card } from '../components/ui'

export const Register = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bar Expoflores
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta para empezar
          </p>
        </div>

        {/* Register Card */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Registro
          </h2>
          <RegisterForm />
        </Card>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
