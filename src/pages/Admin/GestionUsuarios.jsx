"use client"

import { useState, useEffect } from "react"
import api from "../../api/axios"
import { CheckCircle, XCircle, Trash2, RefreshCw, Search, Filter, Bell, AlertCircle } from "lucide-react"
import { useTranslation } from "../../hooks/useTranslation"

export default function GestionUsuarios() {
  // Importamos la función de traducción pero NO la usamos como dependencia en useEffect
  const { t } = useTranslation()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [usuariosPendientes, setUsuariosPendientes] = useState(0)
  const [modalConfirmacion, setModalConfirmacion] = useState({ visible: false, accion: null, usuario: null })
  const [actualizando, setActualizando] = useState(false)

  // Cargar usuarios - Mantenemos exactamente igual que el original
  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Cargando usuarios...")
      const response = await api.get("/usuarios")
      console.log("Respuesta de usuarios:", response.data)

      // Check if response.data is an array or if it has a data property
      const usuariosData = Array.isArray(response.data) ? response.data : response.data.data || []
      setUsuarios(usuariosData)

      // Contar usuarios pendientes
      const pendientes = usuariosData.filter((usuario) => usuario.estado === "pendiente").length
      setUsuariosPendientes(pendientes)
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      setError("Error al cargar los usuarios. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Mantenemos el useEffect exactamente igual que el original, sin dependencias
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Cargando usuarios...")
        const response = await api.get("/usuarios")
        console.log("Respuesta de usuarios:", response.data)

        // Check if response.data is an array or if it has a data property
        const usuariosData = Array.isArray(response.data) ? response.data : response.data.data || []
        setUsuarios(usuariosData)

        // Contar usuarios pendientes
        const pendientes = usuariosData.filter((usuario) => usuario.estado === "pendiente").length
        setUsuariosPendientes(pendientes)
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        setError("Error al cargar los usuarios. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    cargarUsuarios()
  }, []) // Mantenemos el array de dependencias vacío

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter((usuario) => {
    // Filtrar por estado
    if (filtroEstado !== "todos" && usuario.estado !== filtroEstado) {
      return false
    }

    // Filtrar por búsqueda
    if (busqueda) {
      const terminoBusqueda = busqueda.toLowerCase()
      return (
        usuario.nombre.toLowerCase().includes(terminoBusqueda) ||
        usuario.apellido1.toLowerCase().includes(terminoBusqueda) ||
        (usuario.apellido2 && usuario.apellido2.toLowerCase().includes(terminoBusqueda)) ||
        usuario.email.toLowerCase().includes(terminoBusqueda)
      )
    }

    return true
  })

  // Aprobar usuario
  const aprobarUsuario = async (id) => {
    try {
      setActualizando(true)
      await api.patch(`/usuarios/${id}/approve`)

      // Actualizar la lista de usuarios
      cargarUsuarios()

      // Cerrar modal
      setModalConfirmacion({ visible: false, accion: null, usuario: null })
    } catch (error) {
      console.error("Error al aprobar usuario:", error)
      setError("Error al aprobar el usuario. Por favor, inténtalo de nuevo.")
    } finally {
      setActualizando(false)
    }
  }

  // Bloquear usuario
  const bloquearUsuario = async (id) => {
    try {
      setActualizando(true)
      await api.patch(`/usuarios/${id}/block`)

      // Actualizar la lista de usuarios
      cargarUsuarios()

      // Cerrar modal
      setModalConfirmacion({ visible: false, accion: null, usuario: null })
    } catch (error) {
      console.error("Error al bloquear usuario:", error)
      setError("Error al bloquear el usuario. Por favor, inténtalo de nuevo.")
    } finally {
      setActualizando(false)
    }
  }

  // Eliminar usuario
  const eliminarUsuario = async (id) => {
    try {
      setActualizando(true)
      await api.delete(`/usuarios/${id}`)

      // Actualizar la lista de usuarios
      cargarUsuarios()

      // Cerrar modal
      setModalConfirmacion({ visible: false, accion: null, usuario: null })
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      setError("Error al eliminar el usuario. Por favor, inténtalo de nuevo.")
    } finally {
      setActualizando(false)
    }
  }

  // Suspender usuario
  const suspenderUsuario = async (id) => {
    try {
      setActualizando(true)
      await api.patch(`/usuarios/${id}/suspend`)

      // Actualizar la lista de usuarios
      cargarUsuarios()

      // Cerrar modal
      setModalConfirmacion({ visible: false, accion: null, usuario: null })
    } catch (error) {
      console.error("Error al suspender usuario:", error)
      setError("Error al suspender el usuario. Por favor, inténtalo de nuevo.")
    } finally {
      setActualizando(false)
    }
  }

  // Mostrar modal de confirmación
  const mostrarConfirmacion = (accion, usuario) => {
    setModalConfirmacion({
      visible: true,
      accion,
      usuario,
    })
  }

  // Ejecutar acción confirmada
  const ejecutarAccion = () => {
    const { accion, usuario } = modalConfirmacion

    if (accion === "aprobar") {
      aprobarUsuario(usuario.id)
    } else if (accion === "bloquear") {
      bloquearUsuario(usuario.id)
    } else if (accion === "suspender") {
      suspenderUsuario(usuario.id)
    } else if (accion === "eliminar") {
      eliminarUsuario(usuario.id)
    }
  }

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "-"
    return new Date(fecha).toLocaleDateString()
  }

  // Modificar el filtro de usuarios para excluir los pendientes de la tabla principal
  const usuariosFiltradosRegistrados = usuariosFiltrados.filter((usuario) => usuario.estado !== "pendiente")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("userManagement.title", "Gestión de Usuarios")}</h1>
          <p className="text-[#C0C0C0]">{t("userManagement.subtitle", "Administra los usuarios de la plataforma")}</p>
        </div>

        {usuariosPendientes > 0 && (
          <div className="bg-yellow-500/80 text-black px-4 py-2 rounded-md flex items-center">
            <Bell className="mr-2" size={20} />
            <span className="font-bold">
              {usuariosPendientes}{" "}
              {t(
                "userManagement.pendingApprovalNotification",
                `usuario${usuariosPendientes !== 1 ? "s" : ""} pendiente${usuariosPendientes !== 1 ? "s" : ""} de aprobación`,
              )}
            </span>
          </div>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-[#C0C0C0]" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            <option value="todos">{t("userManagement.allStatuses", "Todos los estados")}</option>
            <option value="activo">{t("userManagement.active", "Activos")}</option>
            <option value="pendiente">{t("userManagement.pending", "Pendientes")}</option>
            <option value="bloqueado">{t("userManagement.blocked", "Bloqueados")}</option>
            <option value="suspendido">{t("userManagement.suspended", "Suspendidos")}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C0C0C0]" />
            <input
              type="text"
              placeholder={t("userManagement.searchByNameOrEmail", "Buscar por nombre o email...")}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-md pl-10 pr-3 py-2 w-full text-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          <button
            onClick={cargarUsuarios}
            className="bg-gray-800 hover:bg-gray-700 text-[#C0C0C0] px-4 py-2 rounded-md flex items-center"
            disabled={loading}
          >
            <RefreshCw size={20} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            {t("userManagement.update", "Actualizar")}
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-3 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Usuarios pendientes */}
      {usuariosPendientes > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-yellow-900/30 border-b border-yellow-800">
              <h2 className="text-lg font-semibold text-yellow-300">
                {t("userManagement.pendingUsers", "Usuarios pendientes de aprobación")} ({usuariosPendientes})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-800/50">
                <thead className="bg-yellow-900/20">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("userManagement.name", "Nombre")}
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("userManagement.email", "Email")}
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("userManagement.phone", "Teléfono")}
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      {t("userManagement.registrationDate", "Fecha Registro")}
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider min-w-[120px]">
                      {t("userManagement.actions", "Acciones")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-800/30">
                  {usuariosFiltrados
                    .filter((usuario) => usuario.estado === "pendiente")
                    .map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-yellow-900/10">
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-yellow-200">
                          {usuario.nombre} {usuario.apellido1} {usuario.apellido2}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-yellow-200">{usuario.email}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-yellow-200">{usuario.telefono}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-yellow-200">
                          {formatearFecha(usuario.created_at)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => mostrarConfirmacion("aprobar", usuario)}
                              className="text-green-400 hover:text-green-300"
                              title={t("userManagement.activateUser", "Activar usuario")}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => mostrarConfirmacion("eliminar", usuario)}
                              className="text-gray-400 hover:text-gray-300"
                              title={t("userManagement.deleteUser", "Eliminar usuario")}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-[#C0C0C0]">
            {t("userManagement.registeredUsers", "Usuarios registrados")}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-[#C0C0C0] uppercase tracking-wider">
                  {t("userManagement.name", "Nombre")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-[#C0C0C0] uppercase tracking-wider">
                  {t("userManagement.email", "Email")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-[#C0C0C0] uppercase tracking-wider">
                  {t("userManagement.phone", "Teléfono")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-[#C0C0C0] uppercase tracking-wider">
                  {t("userManagement.status", "Estado")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-[#C0C0C0] uppercase tracking-wider">
                  {t("userManagement.role", "Rol")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-[#C0C0C0] uppercase tracking-wider">
                  {t("userManagement.registrationDate", "Fecha Registro")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-[#C0C0C0] uppercase tracking-wider min-w-[140px]">
                  {t("userManagement.actions", "Acciones")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-3 py-4 text-center text-[#C0C0C0]">
                    {t("userManagement.loadingUsers", "Cargando usuarios...")}
                  </td>
                </tr>
              ) : usuariosFiltradosRegistrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 py-4 text-center text-[#C0C0C0]">
                    {t("userManagement.noUsersFound", "No se encontraron usuarios")}
                  </td>
                </tr>
              ) : (
                usuariosFiltradosRegistrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-800/50">
                    <td className="px-3 py-4 whitespace-normal text-sm text-[#C0C0C0]">
                      {usuario.nombre} {usuario.apellido1} {usuario.apellido2}
                    </td>
                    <td className="px-3 py-4 whitespace-normal text-sm text-[#C0C0C0]">{usuario.email}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-[#C0C0C0]">{usuario.telefono}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          usuario.estado === "activo"
                            ? "bg-green-900/50 text-green-300"
                            : usuario.estado === "pendiente"
                              ? "bg-yellow-900/50 text-yellow-300"
                              : usuario.estado === "bloqueado"
                                ? "bg-red-900/50 text-red-300"
                                : usuario.estado === "suspendido"
                                  ? "bg-gray-900/50 text-gray-300 border border-gray-500"
                                  : "bg-gray-900/50 text-gray-300"
                        }`}
                      >
                        {usuario.estado.charAt(0).toUpperCase() + usuario.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-[#C0C0C0]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          usuario.role === "admin" ? "bg-purple-900/50 text-purple-300" : "bg-blue-900/50 text-blue-300"
                        }`}
                      >
                        {usuario.role === "admin"
                          ? t("userManagement.administrator", "Administrador")
                          : t("userManagement.member", "Miembro")}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-[#C0C0C0]">
                      {formatearFecha(usuario.created_at)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-[#C0C0C0]">
                      <div className="flex space-x-1">
                        {(usuario.estado === "pendiente" ||
                          usuario.estado === "bloqueado" ||
                          usuario.estado === "suspendido") && (
                          <button
                            onClick={() => mostrarConfirmacion("aprobar", usuario)}
                            className="text-green-400 hover:text-green-300"
                            title={t("userManagement.activateUser", "Activar usuario")}
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}

                        {usuario.estado === "activo" && (
                          <>
                            <button
                              onClick={() => mostrarConfirmacion("bloquear", usuario)}
                              className="text-red-400 hover:text-red-300"
                              title={t("userManagement.blockUser", "Bloquear usuario")}
                            >
                              <XCircle size={18} />
                            </button>
                            <button
                              onClick={() => mostrarConfirmacion("suspender", usuario)}
                              className="text-yellow-400 hover:text-yellow-300"
                              title={t("userManagement.suspendUser", "Suspender usuario")}
                            >
                              <AlertCircle size={18} />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => mostrarConfirmacion("eliminar", usuario)}
                          className="text-gray-400 hover:text-gray-300"
                          title={t("userManagement.deleteUser", "Eliminar usuario")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modalConfirmacion.visible && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalConfirmacion.accion === "aprobar"
                ? t("userManagement.activateUser", "Activar usuario")
                : modalConfirmacion.accion === "bloquear"
                  ? t("userManagement.blockUser", "Bloquear usuario")
                  : modalConfirmacion.accion === "suspender"
                    ? t("userManagement.suspendUser", "Suspender usuario")
                    : t("userManagement.deleteUser", "Eliminar usuario")}
            </h3>

            <p className="text-[#C0C0C0] mb-6">
              {modalConfirmacion.accion === "aprobar"
                ? t(
                    "userManagement.confirmActivation",
                    "¿Estás seguro de que deseas activar a este usuario? Podrá acceder a la plataforma.",
                  )
                : modalConfirmacion.accion === "bloquear"
                  ? t(
                      "userManagement.confirmBlocking",
                      "¿Estás seguro de que deseas bloquear a este usuario? No podrá acceder a la plataforma.",
                    )
                  : modalConfirmacion.accion === "suspender"
                    ? t(
                        "userManagement.confirmSuspension",
                        "¿Estás seguro de que deseas suspender a este usuario? No podrá acceder a la plataforma temporalmente.",
                      )
                    : t(
                        "userManagement.confirmDeletion",
                        "¿Estás seguro de que deseas eliminar a este usuario? Esta acción no se puede deshacer.",
                      )}
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setModalConfirmacion({ visible: false, accion: null, usuario: null })}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
                disabled={actualizando}
              >
                {t("userManagement.cancel", "Cancelar")}
              </button>

              <button
                onClick={ejecutarAccion}
                className={`px-4 py-2 rounded-md ${
                  modalConfirmacion.accion === "aprobar"
                    ? "bg-green-700 hover:bg-green-600 text-white"
                    : modalConfirmacion.accion === "bloquear"
                      ? "bg-red-700 hover:bg-red-600 text-white"
                      : modalConfirmacion.accion === "suspender"
                        ? "bg-yellow-700 hover:bg-yellow-600 text-white"
                        : "bg-red-700 hover:bg-red-600 text-white"
                }`}
                disabled={actualizando}
              >
                {actualizando
                  ? t("userManagement.processing", "Procesando...")
                  : modalConfirmacion.accion === "aprobar"
                    ? t("userManagement.approve", "Aprobar")
                    : modalConfirmacion.accion === "bloquear"
                      ? t("userManagement.block", "Bloquear")
                      : modalConfirmacion.accion === "suspender"
                        ? t("userManagement.suspend", "Suspender")
                        : t("userManagement.delete", "Eliminar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
