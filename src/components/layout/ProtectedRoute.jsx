import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Loading } from '../ui'

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {object} props
 * @param {React.ReactNode} props.children - Componentes hijos
 * @param {boolean} props.requireAdmin - Si requiere rol admin
 */
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth()

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return <Loading fullScreen message="Verificando sesión..." />
  }

  // Si no está autenticado, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si requiere admin y no es admin, redirigir a home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
