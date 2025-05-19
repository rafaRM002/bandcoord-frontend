"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Save,
  UserRound,
  Mail,
  Phone,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  UserPlus,
  UserMinus,
  Shield,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import api from "../../api/axios"
import { toast } from "react-toastify"

export default function Perfil() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("datos")
  // Añadir un nuevo estado para el spinner
  const [showSpinner, setShowSpinner] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminAction, setAdminAction] = useState("add") // "add" or "remove"

  const [formData, setFormData] = useState({
    nombre: "",
    apellido1: "",
    apellido2: "",
    email: "",
    telefono: "",
    fecha_nac: "",
    fecha_entrada: "",
  })

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        apellido1: user.apellido1 || "",
        apellido2: user.apellido2 || "",
        email: user.email || "",
        telefono: user.telefono || "",
        fecha_nac: user.fecha_nac ? new Date(user.fecha_nac).toISOString().split("T")[0] : "",
        fecha_entrada: user.fecha_entrada ? new Date(user.fecha_entrada).toISOString().split("T")[0] : "",
      })
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (activeTab === "admin" && user && user.role === "admin") {
      const fetchUsuarios = async () => {
        try {
          setLoadingUsers(true)
          const response = await api.get("/usuarios")

          // Obtener todos los usuarios
          const usuariosData = Array.isArray(response.data) ? response.data : response.data.data || []

          // Filtrar administradores y usuarios normales
          const admins = usuariosData.filter((u) => u.role === "admin" && u.id !== user.id)
          const regularUsers = usuariosData.filter((u) => u.role !== "admin" && u.estado === "activo")

          setAdminUsers(admins)
          setUsuarios(regularUsers)
        } catch (error) {
          console.error("Error al cargar usuarios:", error)
          toast.error("Error al cargar la lista de usuarios")
        } finally {
          setLoadingUsers(false)
        }
      }

      fetchUsuarios()
    }
  }, [activeTab, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhoneChange = (e) => {
    // Solo permitir números
    const value = e.target.value.replace(/\D/g, "")
    setFormData((prev) => ({ ...prev, telefono: value }))
  }

  const handleOpenAdminModal = (action) => {
    setAdminAction(action)
    setSelectedUserId("")
    setShowAdminModal(true)
  }

  const handleAdminAction = async () => {
    if (!selectedUserId) {
      toast.error("Debes seleccionar un usuario")
      return
    }

    try {
      if (adminAction === "add") {
        // Hacer al usuario seleccionado administrador
        await api.put(`/usuarios/${selectedUserId}/make-admin`)
        toast.success("Usuario promovido a administrador correctamente")
      } else {
        // Quitar permisos de administrador
        await api.put(`/usuarios/${selectedUserId}/remove-admin`)
        toast.success("Permisos de administrador revocados correctamente")
      }

      // Recargar la lista de usuarios
      const response = await api.get("/usuarios")
      const usuariosData = Array.isArray(response.data) ? response.data : response.data.data || []

      const admins = usuariosData.filter((u) => u.role === "admin" && u.id !== user.id)
      const regularUsers = usuariosData.filter((u) => u.role !== "admin" && u.estado === "activo")

      setAdminUsers(admins)
      setUsuarios(regularUsers)
      setShowAdminModal(false)
    } catch (error) {
      console.error("Error al modificar permisos de administrador:", error)
      toast.error("Error al modificar permisos de administrador")
    }
  }

  const handleSubmitProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    setShowSpinner(true)

    try {
      // Validar formato de teléfono
      const phoneRegex = /^[0-9]{9}$/
      if (!phoneRegex.test(formData.telefono)) {
        setError("El teléfono debe contener 9 dígitos numéricos")
        setSaving(false)
        setShowSpinner(false)
        return
      }

      // Preparar los datos para enviar al backend
      // Asegurarse de que la fecha tiene el formato correcto (YYYY-MM-DD)
      const fechaNac = formData.fecha_nac ? new Date(formData.fecha_nac).toISOString().split("T")[0] : null

      const userData = {
        ...formData,
        fecha_nac: fechaNac,
      }

      await api.put(`/usuarios/${user.id}`, userData)
      setSuccess("Datos actualizados correctamente")

      // Configurar el temporizador para ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess("")
        setShowSpinner(false)
      }, 3000)

      // Actualizar los datos del usuario en el contexto
      // Esto normalmente requeriría recargar los datos del usuario desde el backend
      // o actualizar el contexto de autenticación
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      setError("Error al actualizar los datos. Por favor, inténtalo de nuevo.")
      setShowSpinner(false)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitPassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    setShowSpinner(true)

    try {
      // Validar que las contraseñas coincidan
      if (passwordData.new_password !== passwordData.new_password_confirmation) {
        setError("Las nuevas contraseñas no coinciden")
        setSaving(false)
        setShowSpinner(false)
        return
      }

      // Validar longitud mínima
      if (passwordData.new_password.length < 8) {
        setError("La nueva contraseña debe tener al menos 8 caracteres")
        setSaving(false)
        setShowSpinner(false)
        return
      }

      await api.put(`/usuarios/${user.id}/password`, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })

      setSuccess("Contraseña actualizada correctamente")
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      })

      // Configurar el temporizador para ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess("")
        setShowSpinner(false)
      }, 3000)
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)

      if (error.response && error.response.status === 401) {
        setError("La contraseña actual es incorrecta")
      } else {
        setError("Error al cambiar la contraseña. Por favor, inténtalo de nuevo.")
      }
      setShowSpinner(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-[#C0C0C0]">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="mr-4 p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Mi Perfil</h1>
      </div>

      {/* Pestañas */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "datos" ? "text-[#C0C0C0] border-b-2 border-[#C0C0C0]" : "text-gray-400 hover:text-[#C0C0C0]"
          }`}
          onClick={() => setActiveTab("datos")}
        >
          Datos Personales
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "password"
              ? "text-[#C0C0C0] border-b-2 border-[#C0C0C0]"
              : "text-gray-400 hover:text-[#C0C0C0]"
          }`}
          onClick={() => setActiveTab("password")}
        >
          Cambiar Contraseña
        </button>
        {user && user.role === "admin" && (
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "admin"
                ? "text-[#C0C0C0] border-b-2 border-[#C0C0C0]"
                : "text-gray-400 hover:text-[#C0C0C0]"
            }`}
            onClick={() => setActiveTab("admin")}
          >
            Gestión de Administradores
          </button>
        )}
      </div>

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">{error}</div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-800 text-green-100 px-4 py-3 rounded-md mb-6 flex items-center">
          {showSpinner ? (
            <>
              <div className="animate-spin mr-2 h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
              {success}
            </>
          ) : (
            <>
              <CheckCircle size={20} className="mr-2" />
              {success}
            </>
          )}
        </div>
      )}

      {activeTab === "admin" && user && user.role === "admin" && (
        <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#C0C0C0] mb-4">Gestión de Administradores</h2>

          <div className="flex justify-between mb-6">
            <button
              onClick={() => handleOpenAdminModal("add")}
              className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
            >
              <UserPlus size={18} />
              Añadir Administrador
            </button>

            <button
              onClick={() => handleOpenAdminModal("remove")}
              className="flex items-center gap-2 bg-gray-800 text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <UserMinus size={18} />
              Revocar Permisos
            </button>
          </div>

          <div className="space-y-6">
            {/* Lista de administradores actuales */}
            <div>
              <h3 className="text-lg font-medium text-[#C0C0C0] mb-3 flex items-center">
                <Shield size={18} className="mr-2" />
                Administradores Actuales
              </h3>

              <div className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden">
                {loadingUsers ? (
                  <div className="p-4 text-center text-gray-400">Cargando usuarios...</div>
                ) : adminUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">No hay otros administradores</div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {adminUsers.map((admin) => (
                      <div key={admin.id} className="p-3 flex justify-between items-center">
                        <div>
                          <div className="text-[#C0C0C0] font-medium">
                            {admin.nombre} {admin.apellido1} {admin.apellido2}
                          </div>
                          <div className="text-gray-400 text-sm">{admin.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para añadir/quitar administradores */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">
              {adminAction === "add" ? "Añadir Administrador" : "Revocar Permisos de Administrador"}
            </h3>

            <div className="mb-6">
              <label htmlFor="usuario" className="block text-[#C0C0C0] text-sm font-medium mb-2">
                Seleccionar usuario
              </label>
              <select
                id="usuario"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="">Seleccionar usuario...</option>
                {adminAction === "add"
                  ? usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.apellido1} - {usuario.email}
                      </option>
                    ))
                  : adminUsers.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.nombre} {admin.apellido1} - {admin.email}
                      </option>
                    ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdminAction}
                disabled={!selectedUserId}
                className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adminAction === "add" ? "Añadir" : "Revocar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
        {activeTab === "datos" ? (
          <form onSubmit={handleSubmitProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="nombre" className="block text-[#C0C0C0] text-sm font-medium">
                  Nombre *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <UserRound size={18} />
                  </div>
                  <input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
              </div>

              {/* Email (solo lectura) */}
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
                    value={formData.email}
                    readOnly
                    className="w-full pl-10 py-2 bg-gray-800/50 border border-gray-800 rounded-md text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500">El email no se puede modificar</p>
              </div>

              {/* Primer apellido */}
              <div className="space-y-2">
                <label htmlFor="apellido1" className="block text-[#C0C0C0] text-sm font-medium">
                  Primer apellido *
                </label>
                <input
                  id="apellido1"
                  name="apellido1"
                  value={formData.apellido1}
                  onChange={handleChange}
                  required
                  className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>

              {/* Segundo apellido */}
              <div className="space-y-2">
                <label htmlFor="apellido2" className="block text-[#C0C0C0] text-sm font-medium">
                  Segundo apellido
                </label>
                <input
                  id="apellido2"
                  name="apellido2"
                  value={formData.apellido2}
                  onChange={handleChange}
                  className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label htmlFor="telefono" className="block text-[#C0C0C0] text-sm font-medium">
                  Teléfono *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Phone size={18} />
                  </div>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    pattern="[0-9]{9}"
                    maxLength="9"
                    value={formData.telefono}
                    onChange={handlePhoneChange}
                    required
                    className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
                <p className="text-xs text-gray-400">Introduce 9 dígitos numéricos</p>
              </div>

              {/* Fecha de nacimiento */}
              <div className="space-y-2">
                <label htmlFor="fecha_nac" className="block text-[#C0C0C0] text-sm font-medium">
                  Fecha de nacimiento *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Calendar size={18} />
                  </div>
                  <input
                    id="fecha_nac"
                    name="fecha_nac"
                    type="date"
                    value={formData.fecha_nac}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
              </div>

              {/* Fecha de entrada (solo lectura) */}
              <div className="space-y-2">
                <label htmlFor="fecha_entrada" className="block text-[#C0C0C0] text-sm font-medium">
                  Fecha de entrada
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Calendar size={18} />
                  </div>
                  <input
                    id="fecha_entrada"
                    name="fecha_entrada"
                    type="date"
                    value={formData.fecha_entrada}
                    readOnly
                    className="w-full pl-10 py-2 bg-gray-800/50 border border-gray-800 rounded-md text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500">La fecha de entrada no se puede modificar</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitPassword}>
            <div className="space-y-6 max-w-md mx-auto">
              {/* Contraseña actual */}
              <div className="space-y-2">
                <label htmlFor="current_password" className="block text-[#C0C0C0] text-sm font-medium">
                  Contraseña actual *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="current_password"
                    name="current_password"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
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

              {/* Nueva contraseña */}
              <div className="space-y-2">
                <label htmlFor="new_password" className="block text-[#C0C0C0] text-sm font-medium">
                  Nueva contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="new_password"
                    name="new_password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#C0C0C0]"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400">La contraseña debe tener al menos 8 caracteres</p>
              </div>

              {/* Confirmar nueva contraseña */}
              <div className="space-y-2">
                <label htmlFor="new_password_confirmation" className="block text-[#C0C0C0] text-sm font-medium">
                  Confirmar nueva contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="new_password_confirmation"
                    name="new_password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.new_password_confirmation}
                    onChange={handlePasswordChange}
                    required
                    className="w-full pl-10 pr-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#C0C0C0]"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {saving ? "Guardando..." : "Cambiar contraseña"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
