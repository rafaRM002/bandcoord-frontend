/**
 * @file main.jsx
 * @module main
 * @description Punto de entrada principal de la aplicación BandCoord. Fuerza HTTPS en producción, importa los estilos globales y monta el componente raíz <App /> en el DOM usando React 18. Utiliza StrictMode para mejores prácticas de desarrollo.
 * @author Rafael Rodriguez Mengual
 */

// Fuerza el uso de HTTPS en producción (excepto localhost y 127.0.0.1)
if (
  window.location.protocol !== "https:" &&
  !window.location.hostname.includes("localhost") &&
  !window.location.hostname.includes("127.0.0.1")
) {
  window.location.href = window.location.href.replace("http://", "https://");
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Monta la aplicación React en el elemento root usando StrictMode
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

