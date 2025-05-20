"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { Bell } from "lucide-react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [pendingUsersCount, setPendingUsersCount] = useState(0)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setLoading(false)
          return
        }

        try {
          console.log("Verificando autenticación...")
          const response = await api.get("/me")
          const userData = response.data

          console.log("Respuesta de /me:", userData)

          if (userData.estado === "pendiente") {
            localStorage.removeItem("token")
            setUser(null)
            navigate("/registro-pendiente")
          } else if (userData.estado === "bloqueado") {
            localStorage.removeItem("token")
            setUser(null)
            alert("Tu cuenta ha sido bloqueada. Contacta con el administrador.")
            navigate("/login")
          } else {
            setUser(userData)
            console.log("Usuario autenticado:", userData)

            if (userData.role === "admin") {
              console.log("El usuario es administrador")
            } else {
              console.log("El usuario NO es administrador, su rol es:", userData.role)
            }
          }
        } catch (error) {
          console.error("Error al verificar token:", error)
          if (error.message && error.message.includes("Error de conexión")) {
            alert("Error de conexión con el servidor. Por favor, verifica la configuración de la API.")
          }

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

  const checkNotifications = async (userData) => {
    try {
      if (userData.role === "admin") {
        const usuariosResponse = await api.get("/usuarios")
        const usuariosData = Array.isArray(usuariosResponse.data)
          ? usuariosResponse.data
          : usuariosResponse.data.data || []

        const pendingUsers = usuariosData.filter((u) => u.estado === "pendiente").length
        setPendingUsersCount(pendingUsers)

        if (pendingUsers > 0) {
          setNotificationMessage(
            `Tienes ${pendingUsers} usuario${pendingUsers !== 1 ? "s" : ""} pendiente${pendingUsers !== 1 ? "s" : ""} de aprobación`
          )
          setShowNotification(true)

          setTimeout(() => {
            setShowNotification(false)
          }, 5000)
        }
      }

      const mensajesResponse = await api.get("/mensaje-usuarios")
      const mensajesData = Array.isArray(mensajesResponse.data)
        ? mensajesResponse.data
        : mensajesResponse.data.data || []

      const unreadMessages = mensajesData.filter(
        (m) => m.usuario_id_receptor === userData.id && (m.estado === 0 || !m.leido)
      ).length

      setUnreadMessagesCount(unreadMessages)

      if (unreadMessages > 0) {
        setNotificationMessage(
          `Tienes ${unreadMessages} mensaje${unreadMessages !== 1 ? "s" : ""} sin leer`
        )
        setShowNotification(true)

        setTimeout(() => {
          setShowNotification(false)
        }, 5000)
      }
    } catch (error) {
      console.error("Error al verificar notificaciones:", error)
    }
  }

  const login = async (email, password) => {
    try {
      console.log("Intentando iniciar sesión...")
      const response = await api.post("/login", { email, password })

      if (response.status === 200) {
        const { token } = response.data
        localStorage.setItem("token", token)
        console.log("Token guardado correctamente")

        const userResponse = await api.get("/me")
        const userData = userResponse.data

        if (userData.estado === "pendiente") {
          localStorage.removeItem("token")
          navigate("/registro-pendiente")
          return { success: false, message: "Tu cuenta está pendiente de aprobación." }
        } else if (userData.estado === "bloqueado") {
          localStorage.removeItem("token")
          return { success: false, message: "Tu cuenta ha sido bloqueada. Contacta con el administrador." }
        }

        setUser(userData)

        // ✅ Mostrar notificaciones solo una vez al iniciar sesión
        await checkNotifications(userData)

        return { success: true }
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)

      if (error.response && error.response.status === 401) {
        if (error.response.data.message === "Tu cuenta está pendiente de aprobación por un administrador.") {
          navigate("/registro-pendiente")
          return { success: false, message: "Tu cuenta está pendiente de aprobación." }
        } else if (error.response.data.message === "Credenciales incorrectas.") {
          return { success: false, message: "Email o contraseña incorrectos." }
        } else if (error.response.data.message === "Usuario no encontrado.") {
          return { success: false, message: "El usuario no existe. Por favor, regístrate." }
        }
      }

      if (error.message && error.message.includes("Error de conexión")) {
        return { success: false, message: "Error de conexión con el servidor. Por favor, inténtalo de nuevo." }
      }

      return { success: false, message: "Error al iniciar sesión. Inténtalo de nuevo." }
    }
  }

  const register = async (userData) => {
    try {
      console.log("Intentando registrar usuario con datos:", userData)
      const response = await api.post("/register", userData)

      if (response.status === 201) {
        navigate("/registro-pendiente")
        return { success: true }
      } else {
        return { success: false, message: "Error al registrarse. Inténtalo de nuevo." }
      }
    } catch (error) {
      console.error("Error al registrarse:", error)

      if (error.response && error.response.status === 422) {
        if (error.response.data.errors?.email) {
          return { success: false, message: "El email ya está en uso." }
        }
        if (error.response.data.errors?.fecha_nac) {
          return { success: false, message: "Formato de fecha de nacimiento incorrecto." }
        }
      }

      if (error.message && error.message.includes("Error de conexión")) {
        return { success: false, message: "Error de conexión con el servidor. Por favor, inténtalo de nuevo." }
      }

      return { success: false, message: "Error al registrarse. Inténtalo de nuevo." }
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        await api.post("/logout")
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
    pendingUsersCount,
    unreadMessagesCount,
    showNotification,
    notificationMessage,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-3 rounded-md shadow-lg flex items-center z-50 animate-fade-in">
          <Bell size={20} className="mr-2 text-yellow-500" />
          <span>{notificationMessage}</span>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

export { AuthContext }
