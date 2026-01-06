import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loading } from '../components/ui'

/**
 * Página Home que redirige según el rol del usuario
 */
export const Home = () => {
  const { user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        navigate('/admin')
      } else {
        navigate('/mis-consumos')
      }
    }
  }, [user, isAdmin, loading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading fullScreen message="Cargando..." />
    </div>
  )
}
