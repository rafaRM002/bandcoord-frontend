/**
 * @file AuthContext.jsx
 * @module context/AuthContext
 * @description Contexto y proveedor de autenticación para toda la aplicación. Gestiona el usuario autenticado, login, logout, registro y notificaciones.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import axios from "axios"
import { Bell } from "lucide-react"

/**
 * Contexto de autenticación para toda la aplicación.
 * @type {React.Context}
 */
const AuthContext = createContext()

/**
 * Obtiene el token CSRF necesario para peticiones seguras a Laravel Sanctum.
 * @async
 * @function
 * @returns {Promise<void>}
 */
const getCsrfCookie = async () => {
  await axios.get(
    "https://www.iestrassierra.net/alumnado/curso2425/DAW/daw2425a16/laravel/public/sanctum/csrf-cookie",
    { withCredentials: true },
  )
}

/**
 * Proveedor de autenticación que envuelve la app y gestiona el estado de usuario y notificaciones.
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto.
 * @returns {JSX.Element} Proveedor de autenticación.
 */
export const AuthProvider = ({ children }) => {
  /** Usuario autenticado */
  /** @type {Object|null} */
  const [user, setUser] = useState(null)

  /** Estado de carga */
  /** @type {boolean} */
  const [loading, setLoading] = useState(true)

  /** Navegación de React Router */
  const navigate = useNavigate()

  // Estados para notificaciones y contadores

  /** Número de usuarios pendientes */
  /** @type {number} */
  const [pendingUsersCount, setPendingUsersCount] = useState(0)

  /** Número de mensajes no leídos */
  /** @type {number} */
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)

  /** Mostrar notificación */
  /** @type {boolean} */
  const [showNotification, setShowNotification] = useState(false)

  /** Mensaje de notificación */
  /** @type {string} */
  const [notificationMessage, setNotificationMessage] = useState("")

  /**
   * Efecto para comprobar si el usuario está autenticado al cargar la app.
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setLoading(false)
          return
        }

        // Consulta al endpoint /me para obtener los datos del usuario
        const response = await api.get("/me")
        const userData = response.data

        // Si el usuario está pendiente, lo redirige y elimina el token
        if (userData.estado === "pendiente") {
          localStorage.removeItem("token")
          setUser(null)
          navigate("/registro-pendiente")
        } else if (userData.estado === "bloqueado") {
          // Si está bloqueado, lo redirige y elimina el token
          localStorage.removeItem("token")
          setUser(null)
          alert("Tu cuenta ha sido bloqueada. Contacta con el administrador.")
          navigate("/login")
        } else {
          setUser(userData)
        }
      } catch (error) {
        // Si hay error, elimina el token y limpia el usuario
        console.error("Error al verificar autenticación:", error)
        localStorage.removeItem("token")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  /**
   * Comprueba notificaciones para el usuario (usuarios pendientes y mensajes no leídos).
   * @async
   * @param {Object} userData - Datos del usuario autenticado.
   */
  const checkNotifications = async (userData) => {
    try {
      let pendingUsers = 0
      if (userData.role === "admin") {
        // Si es admin, cuenta los usuarios pendientes de aprobación
        const usuariosResponse = await api.get("/usuarios")
        const usuariosData = Array.isArray(usuariosResponse.data)
          ? usuariosResponse.data
          : usuariosResponse.data.data || []

        pendingUsers = usuariosData.filter((u) => u.estado === "pendiente").length
        setPendingUsersCount(pendingUsers)
      }

      // Cuenta los mensajes no leídos para el usuario
      const mensajesResponse = await api.get("/mensaje-usuarios")
      const mensajesData = Array.isArray(mensajesResponse.data)
        ? mensajesResponse.data
        : mensajesResponse.data.data || []

      // Filtra mensajes no leídos
      const unreadMessages = mensajesData.filter(
        (m) => m.usuario_id_receptor === userData.id && m.estado === false,
      ).length

      setUnreadMessagesCount(unreadMessages)

      // Prepara el mensaje de notificación
      const notifications = []

      if (userData.role === "admin" && pendingUsers > 0) {
        notifications.push(
          `Tienes ${pendingUsers} usuario${
            pendingUsers !== 1 ? "s" : ""
          } pendiente${pendingUsers !== 1 ? "s" : ""} de aprobación`,
        )
      }

      if (unreadMessages > 0) {
        notifications.push(`Tienes ${unreadMessages} mensaje${unreadMessages !== 1 ? "s" : ""} sin leer`)
      }

      // Si hay notificaciones, las muestra durante 5 segundos
      if (notifications.length > 0) {
        setNotificationMessage(notifications.join(" • "))
        setShowNotification(true)

        setTimeout(() => {
          setShowNotification(false)
        }, 5000)
      }
    } catch (error) {
      console.error("Error al verificar notificaciones:", error)
    }
  }

  /**
   * Inicia sesión del usuario.
   * @async
   * @param {string} email - Email del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<Object>} Resultado del login.
   */
  const login = async (email, password) => {
    try {
      // console.log("Solicitando CSRF token...")
      await getCsrfCookie()

      // console.log("Intentando iniciar sesión...")
      const response = await api.post("/login", { email, password })

      if (response.status === 200) {
        const { token } = response.data
        localStorage.setItem("token", token)
        // console.log("Token guardado correctamente")

        const userResponse = await api.get("/me")
        const userData = userResponse.data

        if (userData.estado === "pendiente") {
          localStorage.removeItem("token")
          navigate("/registro-pendiente")
          return {
            success: false,
            message: "Tu cuenta está pendiente de aprobación.",
          }
        } else if (userData.estado === "bloqueado") {
          localStorage.removeItem("token")
          return { success: false, message: "Tu cuenta ha sido bloqueada." }
        }

        setUser(userData)
        await checkNotifications(userData)
        return { success: true }
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)

      if (error.response?.status === 401) {
        // Mensaje mejorado que incluye información sobre posibles estados de cuenta
        return {
          success: false,
          message: "No se pudo iniciar sesión. Verifica tus credenciales o si tu cuenta está pendiente de activación.",
        }
      }

      return {
        success: false,
        message: "Error al iniciar sesión. Inténtalo de nuevo.",
      }
    }
  }

  /**
   * Registra un nuevo usuario.
   * @async
   * @param {Object} userData - Datos del usuario a registrar.
   * @returns {Promise<Object>} Resultado del registro.
   */
  const register = async (userData) => {
    try {
      // console.log("Solicitando CSRF token para registro...")
      await getCsrfCookie()

      // console.log("Intentando registrar usuario con datos:", userData)
      const response = await api.post("/register", userData)

      if (response.status === 201) {
        navigate("/registro-pendiente")
        return { success: true }
      } else {
        return { success: false, message: "Error al registrarse." }
      }
    } catch (error) {
      console.error("Error al registrarse:", error)

      if (error.response?.status === 422) {
        if (error.response.data.errors?.email) {
          return { success: false, message: "El email ya está en uso." }
        }
      }

      return {
        success: false,
        message: "Error al registrarse. Inténtalo de nuevo.",
      }
    }
  }

  /**
   * Cierra la sesión del usuario.
   * @async
   * @returns {Promise<void>}
   */
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
      // Pequeño delay para evitar problemas de routing
      setTimeout(() => {
        navigate("/login", { replace: true })
      }, 100)
    }
  }

  /**
   * Valores y funciones que se exponen a toda la app.
   * @type {Object}
   * @property {Object|null} user - Usuario autenticado.
   * @property {boolean} loading - Estado de carga.
   * @property {Function} login - Función para iniciar sesión.
   * @property {Function} register - Función para registrar usuario.
   * @property {Function} logout - Función para cerrar sesión.
   * @property {boolean} isAdmin - Indica si el usuario es administrador.
   * @property {number} pendingUsersCount - Número de usuarios pendientes.
   * @property {number} unreadMessagesCount - Número de mensajes no leídos.
   * @property {boolean} showNotification - Si se muestra la notificación.
   * @property {string} notificationMessage - Mensaje de notificación.
   */
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

  // Renderiza el proveedor de contexto y la notificación si corresponde
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

/**
 * Hook personalizado para consumir el contexto de autenticación.
 * @function
 * @returns {Object} Contexto de autenticación con usuario y funciones.
 * @throws {Error} Si se usa fuera de un AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

export { AuthContext }
