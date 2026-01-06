import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode removido para evitar doble render/fetch en desarrollo
// que causaba lentitud extrema con Supabase
createRoot(document.getElementById('root')).render(
  <App />
)
