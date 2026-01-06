import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'

// Páginas
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import { MisConsumos } from './pages/MisConsumos'
import { MiSaldoPage } from './pages/MiSaldoPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mis-consumos"
            element={
              <ProtectedRoute>
                <MisConsumos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mi-saldo"
            element={
              <ProtectedRoute>
                <MiSaldoPage />
              </ProtectedRoute>
            }
          />

          {/* Ruta solo para admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
