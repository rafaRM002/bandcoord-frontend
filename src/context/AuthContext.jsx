"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setLoading(false)
          return
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()

          // Verificar si el usuario está pendiente
          if (userData.estado === "pendiente") {
            localStorage.removeItem("token")
            setUser(null)
            navigate("/registro-pendiente")
          } else {
            setUser(userData)
          }
        } else {
          // Token inválido o expirado
          localStorage.removeItem("token")
          setUser(null)
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        localStorage.removeItem("token")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Verificar si el usuario está pendiente
        if (data.user && data.user.estado === "pendiente") {
          navigate("/registro-pendiente")
          return { success: false, message: "Tu cuenta está pendiente de aprobación." }
        }

        localStorage.setItem("token", data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, message: data.message || "Error al iniciar sesión" }
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  // Función para registrarse
  const register = async (userData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        navigate("/registro-pendiente")
        return { success: true }
      } else {
        return { success: false, message: data.message || "Error al registrarse" }
      }
    } catch (error) {
      console.error("Error al registrarse:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  // Función para cerrar sesión
  const logout = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      localStorage.removeItem("token")
      setUser(null)
      navigate("/login")
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
