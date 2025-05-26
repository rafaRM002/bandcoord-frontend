// main.jsx

if (window.location.protocol !== "https:") {
  window.location.href = window.location.href.replace("http://", "https://");
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
