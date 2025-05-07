"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

export default function Login({ login }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulación de inicio de sesión
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // En una implementación real, aquí harías la llamada a tu API
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form)
      // });

      // Simulación de respuesta exitosa - estableciendo role como "admin" para pruebas
      const userData = { nombre: "Usuario", email: form.email, role: "admin" }

      // Llamar a la función login del contexto
      login(userData)

      // Redirigir al inicio
      navigate("/")
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setError("Error al iniciar sesión. Verifica tus credenciales.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="border border-gray-800 rounded-lg bg-black/90 backdrop-blur-sm shadow-xl">
          {/* Header */}
          <div className="space-y-3 text-center border-b border-gray-800 p-6">
            <Link to="/">
              <img src="/1-removebg-preview.png" alt="Logo BandCoord" className="mx-auto h-20 w-auto" />
            </Link>
            <h2 className="text-2xl font-bold tracking-tight text-[#C0C0C0]">Iniciar Sesión</h2>
            <p className="text-gray-400">Accede a tu cuenta de BandCoord</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 p-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-[#C0C0C0] text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    onChange={handleChange}
                    required
                    className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-[#C0C0C0] text-sm font-medium">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#C0C0C0]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col space-y-4 border-t border-gray-800 p-6">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Iniciar Sesión"}
              </button>

              <div className="text-center text-sm text-gray-400">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="text-[#C0C0C0] hover:text-white underline underline-offset-4">
                  Registrarse
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
