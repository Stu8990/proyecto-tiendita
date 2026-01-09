import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui'
import { NotificationBadge } from '../notificaciones/NotificationBadge'

export const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav className="bg-primary-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Título */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl">🌸</div>
            <div>
              <h1 className="text-xl font-bold text-white">Bar Expoflores</h1>
              <p className="text-xs text-primary-100">
                {isAdmin ? 'Administrador' : 'Usuario'}
              </p>
            </div>
          </Link>

          {/* Navegación */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white hidden sm:block">
              {profile?.nombre}
            </span>

            {!isAdmin && (
              <>
                <Link to="/mis-consumos">
                  <Button variant="secondary" size="sm">
                    Mis Consumos
                  </Button>
                </Link>
                <Link to="/mi-saldo">
                  <Button variant="secondary" size="sm">
                    Mi Saldo
                  </Button>
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin">
                  <Button variant="primary" size="sm">
                    Dashboard Admin
                  </Button>
                </Link>
                <NotificationBadge />
              </>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={handleSignOut}
            >
              Salir
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
