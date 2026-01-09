import { useState, useEffect } from 'react'
import { Navbar } from './Navbar'
import { PromoModal } from '../promociones/PromoModal'
import { useAuth } from '../../hooks/useAuth'
import { usePromociones } from '../../hooks/usePromociones'

export const Layout = ({ children }) => {
  const { user, isAdmin } = useAuth()
  const { getPromocionNoVista, aceptarPromocion, rechazarPromocion } = usePromociones()

  const [promoActiva, setPromoActiva] = useState(null)
  const [showPromo, setShowPromo] = useState(false)
  const [loading, setLoading] = useState(false)

  // Verificar si hay promo no vista al cargar (solo usuarios no-admin)
  useEffect(() => {
    if (!user || isAdmin) return

    const checkPromo = async () => {
      const promo = await getPromocionNoVista()
      if (promo) {
        setPromoActiva(promo)
        setShowPromo(true)
      }
    }

    checkPromo()
  }, [user, isAdmin])

  const handleAceptarPromo = async () => {
    if (!promoActiva) return

    setLoading(true)
    const { error } = await aceptarPromocion(promoActiva)

    if (!error) {
      setShowPromo(false)
      setPromoActiva(null)
    }
    setLoading(false)
  }

  const handleRechazarPromo = async () => {
    if (!promoActiva) return

    setLoading(true)
    await rechazarPromocion(promoActiva.id)
    setShowPromo(false)
    setPromoActiva(null)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Modal de promoción (solo usuarios no-admin) */}
      {!isAdmin && showPromo && promoActiva && (
        <PromoModal
          promo={promoActiva}
          onAceptar={handleAceptarPromo}
          onRechazar={handleRechazarPromo}
          loading={loading}
        />
      )}
    </div>
  )
}
