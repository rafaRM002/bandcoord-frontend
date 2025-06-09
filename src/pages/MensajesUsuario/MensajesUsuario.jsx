/**
 * @file MensajesUsuario.jsx
 * @module pages/MensajesUsuario/MensajesUsuario
 * @description Página de mensajes recibidos por el usuario. Permite filtrar por leídos/no leídos, buscar, seleccionar y marcar mensajes como leídos (individual o múltiple), y muestra información del remitente, asunto, contenido y fecha. Integra paginación y sidebar de filtros.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import axios from "../../api/axios"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import {
  Search,
  MessageSquare,
  User,
  Calendar,
  Bell,
  Inbox,
  Mail,
  CheckCircle,
  Square,
  CheckSquare,
} from "lucide-react"
import { useTranslation } from "../../hooks/useTranslation"

/**
 * Componente principal para la gestión de mensajes recibidos por el usuario.
 * Permite buscar, filtrar, seleccionar y marcar mensajes como leídos.
 * @component
 * @returns {JSX.Element} Página de mensajes recibidos.
 */
const MensajesUsuario = () => {
  /** Lista de mensajes combinados con estado de lectura */
  const [mensajes, setMensajes] = useState([])
  /** Estado para guardar todos los mensajes completos */
  const [, setMensajesCompletos] = useState([])
  /** Mapa de usuarios para mostrar nombres */
  const [usuarios, setUsuarios] = useState({})
  /** Estado de carga */
  const [loading, setLoading] = useState(true)
  /** Mensaje de error */
  const [error, setError] = useState(null)
  /** Término de búsqueda */
  const [searchTerm, setSearchTerm] = useState("")
  /** Página actual */
  const [currentPage, setCurrentPage] = useState(1)
  /** Total de páginas (no usado directamente) */
  const [, setTotalPages] = useState(1)
  /** Filtro actual: todos, leidos, no-leidos */
  const [filtroActual, setFiltroActual] = useState("todos")
  /** Usuario autenticado */
  const { user } = useContext(AuthContext)
  /** Mensajes por página */
  const itemsPerPage = 6
  /** IDs de mensajes seleccionados */
  const [selectedMensajes, setSelectedMensajes] = useState([])
  /** Estado de selección global */
  const [selectAll, setSelectAll] = useState(false)
  /** Hook de traducción */
  const { t } = useTranslation()

  /**
   * Efecto para cargar mensajes, relaciones y usuarios al montar o cambiar usuario.
   */
  useEffect(() => {
    const fetchMensajesUsuario = async () => {
      try {
        setLoading(true)

        // Primero obtenemos las relaciones mensaje-usuario
        const responseMensajeUsuario = await axios.get(`/mensaje-usuarios`)
        // console.log("Respuesta de relaciones mensaje-usuario:", responseMensajeUsuario.data)

        // Luego obtenemos todos los mensajes para tener los detalles completos
        const responseMensajes = await axios.get(`/mensajes`)
        // console.log("Respuesta de mensajes:", responseMensajes.data)

        // Obtenemos todos los usuarios para mostrar nombres reales
        const responseUsuarios = await axios.get(`/usuarios`)
        // console.log("Respuesta de usuarios:", responseUsuarios.data)

        // Extraemos los datos de ambas respuestas
        let relacionesMensajeUsuario = Array.isArray(responseMensajeUsuario.data)
          ? responseMensajeUsuario.data
          : responseMensajeUsuario.data.data || []

        const mensajesData = Array.isArray(responseMensajes.data)
          ? responseMensajes.data
          : responseMensajes.data.mensajes || responseMensajes.data.data || []

        const usuariosData = Array.isArray(responseUsuarios.data)
          ? responseUsuarios.data
          : responseUsuarios.data.data || []

        // Crear un mapa de usuarios para acceso rápido
        const usuariosMap = {}
        usuariosData.forEach((usuario) => {
          usuariosMap[usuario.id] = usuario
        })
        setUsuarios(usuariosMap)

        // Guardamos todos los mensajes para referencia
        setMensajesCompletos(mensajesData)

        // Filtramos las relaciones donde el usuario actual es el receptor
        if (user && user.id) {
          relacionesMensajeUsuario = relacionesMensajeUsuario.filter(
            (relacion) => relacion.usuario_id_receptor === user.id || relacion.usuario_id_receptor === Number(user.id),
          )
        }

        // console.log("Relaciones filtradas para el usuario:", relacionesMensajeUsuario)

        // Combinamos los datos de ambas tablas
        const mensajesCombinados = relacionesMensajeUsuario.map((relacion) => {
          const mensajeCompleto = mensajesData.find((m) => m.id === relacion.mensaje_id)

          // CORREGIDO: Manejar tanto boolean como numeric para el estado
          let estadoLeido = false

          if (typeof relacion.estado === "boolean") {
            // Si viene como boolean: true = leído, false = no leído
            estadoLeido = relacion.estado
          } else if (typeof relacion.estado === "number") {
            // Si viene como número: 1 = leído, 0 = no leído
            estadoLeido = relacion.estado === 1
          } else if (typeof relacion.estado === "string") {
            // Si viene como string: "1" = leído, "0" = no leído
            estadoLeido = relacion.estado === "1" || relacion.estado === "true"
          }

          // console.log(
          //   `Mensaje ${relacion.mensaje_id}: estado=${relacion.estado} (${typeof relacion.estado}), leído=${estadoLeido}`,
          // )

          return {
            ...relacion,
            asunto: mensajeCompleto?.asunto || "Sin asunto",
            contenido: mensajeCompleto?.contenido || "Sin contenido",
            usuario_id_emisor: mensajeCompleto?.usuario_id_emisor,
            created_at: mensajeCompleto?.created_at || relacion.created_at,
            // IMPORTANTE: Usar el estado calculado correctamente
            leido: estadoLeido,
            estado: relacion.estado, // Mantener el estado original también
            archivado: relacion.archivado || false,
          }
        })

        // console.log("Mensajes combinados con estado correcto:", mensajesCombinados)
        setMensajes(mensajesCombinados)
        setTotalPages(Math.ceil(mensajesCombinados.length / itemsPerPage))
        setError(null)
      } catch (err) {
        console.error("Error al cargar mensajes del usuario:", err)
        setError("Error al cargar tus mensajes. Por favor, inténtelo de nuevo más tarde.")
        toast.error("Error al cargar tus mensajes")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.id) {
      fetchMensajesUsuario()
    }
  }, [user])

  /**
   * Marca un mensaje como leído para el usuario actual.
   * @async
   * @param {number} mensajeId - ID del mensaje.
   */
  const marcarComoLeido = async (mensajeId) => {
    try {
      // console.log("Intentando marcar mensaje como leído:", {
      //   mensajeId,
      //   userId: user.id,
      //   url: `/mensaje-usuarios/${mensajeId}/${user.id}/`,
      // })

      // CORREGIDO: URL con barra final y payload solo con estado
      const response = await axios.put(`/mensaje-usuarios/${mensajeId}/${user.id}/`, {
        estado: 1, // Solo enviamos el estado
      })

      // console.log("Respuesta de marcar como leído:", response.data)

      // Verificar que la respuesta sea exitosa (incluso si dice que ya tenía ese valor)
      if (response.status === 200) {
        // Actualizar el estado del mensaje en la lista inmediatamente
        setMensajes((prevMensajes) => {
          const nuevosMensajes = prevMensajes.map((mensaje) => {
            if (
              mensaje.mensaje_id === Number.parseInt(mensajeId) &&
              (mensaje.usuario_id_receptor === Number.parseInt(user.id) || mensaje.usuario_id_receptor === user.id)
            ) {
              // console.log("Actualizando mensaje:", mensaje.mensaje_id)
              return { ...mensaje, leido: true, estado: 1 }
            }
            return mensaje
          })
          // console.log("Mensajes actualizados:", nuevosMensajes)
          return nuevosMensajes
        })

        // console.log(`Mensaje ${mensajeId} marcado como leído exitosamente`)

        // Solo mostrar toast si realmente se hizo un cambio
        if (!response.data.message?.includes("ya tiene ese valor")) {
          toast.success("Mensaje marcado como leído")
        }
      } else {
        // console.error("Respuesta no exitosa:", response.status)
        toast.error("Error al actualizar el estado del mensaje")
      }
    } catch (err) {
      console.error("Error al marcar mensaje como leído:", err)
      console.error("Detalles del error:", err.response?.data)
      console.error("Status del error:", err.response?.status)
      console.error("URL utilizada:", `/mensaje-usuarios/${mensajeId}/${user.id}/`)
      toast.error("Error al actualizar el estado del mensaje")
    }
  }

  /**
   * Devuelve el nombre completo del remitente a partir del usuarioId.
   * @param {number} usuarioId - ID del usuario emisor.
   * @returns {string} Nombre completo o fallback.
   */
  const getNombreRemitente = (usuarioId) => {
    const usuario = usuarios[usuarioId]
    if (usuario) {
      return `${usuario.nombre} ${usuario.apellido1}${usuario.apellido2 ? ` ${usuario.apellido2}` : ""}`
    }
    return `Usuario ${usuarioId}` // Fallback si no se encuentra el usuario
  }

  /**
   * Selecciona o deselecciona un mensaje para acciones múltiples.
   * @param {number} mensajeId - ID del mensaje.
   */
  const handleSelectMensaje = (mensajeId) => {
    if (selectedMensajes.includes(mensajeId)) {
      setSelectedMensajes(selectedMensajes.filter((id) => id !== mensajeId))
    } else {
      setSelectedMensajes([...selectedMensajes, mensajeId])
    }
  }

  /**
   * Selecciona o deselecciona todos los mensajes de la página actual.
   */
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMensajes([])
    } else {
      setSelectedMensajes(paginatedMensajes.map((mensaje) => mensaje.mensaje_id))
    }
    setSelectAll(!selectAll)
  }

  /**
   * Marca como leídos todos los mensajes seleccionados.
   * @async
   */
  const handleMarcarLeidosSeleccionados = async () => {
    if (selectedMensajes.length === 0) return

    try {
      // console.log("Marcando múltiples mensajes como leídos:", selectedMensajes)

      const promises = selectedMensajes.map((mensajeId) => {
        // console.log(`Marcando mensaje ${mensajeId} para usuario ${user.id}`)
        // CORREGIDO: URL con barra final y payload solo con estado
        return axios.put(`/mensaje-usuarios/${mensajeId}/${user.id}/`, {
          estado: 1, // Solo enviamos el estado
        })
      })

      const responses = await Promise.all(promises)
      // console.log("Respuestas de marcado múltiple:", responses)

      // Verificar que todas las respuestas sean exitosas
      const allSuccessful = responses.every((response) => response.status === 200)

      if (allSuccessful) {
        // Actualizar el estado de los mensajes en la lista
        setMensajes((prevMensajes) => {
          return prevMensajes.map((mensaje) => {
            if (
              selectedMensajes.includes(mensaje.mensaje_id) &&
              (mensaje.usuario_id_receptor === Number.parseInt(user.id) || mensaje.usuario_id_receptor === user.id)
            ) {
              return { ...mensaje, leido: true, estado: 1 }
            }
            return mensaje
          })
        })

        toast.success(`${selectedMensajes.length} mensaje(s) marcado(s) como leído(s)`)
        setSelectedMensajes([])
        setSelectAll(false)
      } else {
        // console.error("Algunas respuestas no fueron exitosas")
        toast.error("Error al actualizar algunos mensajes")
      }
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error)
      console.error("Detalles del error:", error.response?.data)
      toast.error("Error al actualizar el estado de los mensajes")
    }
  }

  /**
   * Filtra los mensajes según búsqueda y filtro de estado.
   * @type {Array}
   */
  const filteredMensajes = mensajes.filter((mensaje) => {
    // Primero aplicar filtro de búsqueda
    const matchesSearch =
      mensaje.asunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mensaje.contenido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getNombreRemitente(mensaje.usuario_id_emisor)?.toLowerCase().includes(searchTerm.toLowerCase())

    // Luego aplicar filtro de estado
    if (filtroActual === "leidos") {
      return matchesSearch && mensaje.leido && !mensaje.archivado
    } else if (filtroActual === "no-leidos") {
      return matchesSearch && !mensaje.leido && !mensaje.archivado
    }

    // Si es "todos", mostrar todos excepto archivados
    return matchesSearch && !mensaje.archivado
  })

  // Paginación
  const paginatedMensajes = filteredMensajes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  /**
   * Cambia la página actual de la paginación.
   * @param {number} page - Página a mostrar.
   */
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  /**
   * Formatea una fecha a DD/MM/YYYY HH:mm.
   * @param {string} dateString - Fecha en formato ISO.
   * @returns {string} Fecha formateada.
   */
  const formatDate = (dateString) => {
    if (!dateString) return t("common.unknownDate")

    const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  /**
   * Renderiza la paginación de la lista de mensajes.
   * @returns {JSX.Element|null}
   */
  const renderPagination = () => {
    const totalFilteredPages = Math.ceil(filteredMensajes.length / itemsPerPage)

    if (totalFilteredPages <= 1) return null

    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-md text-[#C0C0C0] disabled:opacity-50"
        >
          {t("common.previous")}
        </button>

        {Array.from({ length: totalFilteredPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md ${
              currentPage === page ? "bg-[#C0C0C0] text-black" : "bg-gray-900 border border-gray-700 text-[#C0C0C0]"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(Math.min(totalFilteredPages, currentPage + 1))}
          disabled={currentPage === totalFilteredPages}
          className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-md text-[#C0C0C0] disabled:opacity-50"
        >
          {t("common.next")}
        </button>
      </div>
    )
  }

  if (loading) return <div className="container mx-auto p-4">{t("messages.loadingMessages")}</div>
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>

  /** Número de mensajes no leídos */
  const mensajesNoLeidos = mensajes.filter((m) => !m.leido).length

  // Renderizado principal de la página de mensajes recibidos
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{t("messages.receivedMessages")}</h1>
        {/* Reemplazar el botón "Responder" en la parte superior */}
        <div className="flex items-center">
          <div className="mr-4">
            {mensajesNoLeidos > 0 && (
              <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                {mensajesNoLeidos} {t("messages.unread")}
              </div>
            )}
          </div>
          {selectedMensajes.length > 0 ? (
            <button
              onClick={handleMarcarLeidosSeleccionados}
              className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
            >
              <CheckCircle size={18} />
              {t("messages.markAsRead")} ({selectedMensajes.length})
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-black/30 border border-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-medium text-[#C0C0C0] mb-4">{t("common.filter")}</h2>

            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setFiltroActual("todos")
                    setCurrentPage(1)
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    filtroActual === "todos" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900/50"
                  }`}
                >
                  <Inbox size={18} className="mr-2" />
                  <span>{t("common.all")}</span>
                  <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded-full">{mensajes.length}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setFiltroActual("no-leidos")
                    setCurrentPage(1)
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    filtroActual === "no-leidos" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900/50"
                  }`}
                >
                  <Mail size={18} className="mr-2" />
                  <span>{t("messages.unread")}</span>
                  <span className="ml-auto bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                    {mensajesNoLeidos}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setFiltroActual("leidos")
                    setCurrentPage(1)
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    filtroActual === "leidos" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900/50"
                  }`}
                >
                  <CheckCircle size={18} className="mr-2" />
                  <span>{t("messages.read")}</span>
                  <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded-full">
                    {mensajes.length - mensajesNoLeidos}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="md:col-span-3">
          {/* Búsqueda */}
          <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder={t("messages.searchBySubjectOrContent")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Resetear a primera página al buscar
                }}
                className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              />
            </div>
          </div>

          {/* Lista de mensajes */}
          <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
            {/* Añadir selector de todos los mensajes */}
            <div className="p-2 bg-gray-900/50 flex items-center">
              <button
                onClick={handleSelectAll}
                className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                title={selectAll ? t("common.deselectAll") : t("common.selectAll")}
              >
                {selectAll ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
              <span className="ml-2 text-sm text-gray-400">
                {selectedMensajes.length > 0
                  ? `${selectedMensajes.length} ${t("common.selected")}`
                  : t("common.select")}
              </span>
            </div>
            {paginatedMensajes.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64">
                <MessageSquare size={48} className="text-gray-600 mb-4" />
                <p className="text-gray-400 text-center">
                  {searchTerm
                    ? t("messages.noMessagesWithSearch")
                    : filtroActual === "no-leidos"
                      ? t("messages.noUnreadMessages")
                      : filtroActual === "leidos"
                        ? t("messages.noReadMessages")
                        : t("messages.noMessages")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {/* Modificar la visualización de cada mensaje */}
                {paginatedMensajes.map((mensaje) => (
                  <div
                    key={`${mensaje.mensaje_id}-${mensaje.usuario_id_receptor}`}
                    className={`p-4 hover:bg-gray-900/30 transition-colors ${
                      !mensaje.leido ? "bg-gray-900/50 border-l-4 border-yellow-500" : ""
                    }`}
                  >
                    <div className="flex items-start">
                      <button
                        onClick={() => handleSelectMensaje(mensaje.mensaje_id)}
                        className="p-1 mr-2 text-gray-400 hover:text-[#C0C0C0] mt-1"
                      >
                        {selectedMensajes.includes(mensaje.mensaje_id) ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              {!mensaje.leido && <Bell size={16} className="text-yellow-500 mr-2" />}
                              <Link
                                to={`/mensajes/${mensaje.mensaje_id}`}
                                className={`text-lg ${
                                  !mensaje.leido ? "font-bold text-white" : "font-medium text-[#C0C0C0]"
                                } hover:text-white`}
                                onClick={async (e) => {
                                  if (!mensaje.leido) {
                                    await marcarComoLeido(mensaje.mensaje_id)
                                  }
                                }}
                              >
                                {mensaje.asunto || "Sin asunto"}
                              </Link>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-400">
                              <User size={14} className="mr-1" />
                              <span>
                                {t("messages.from")}: {getNombreRemitente(mensaje.usuario_id_emisor)}
                              </span>
                              <span className="mx-2">•</span>
                              <Calendar size={14} className="mr-1" />
                              <span>{formatDate(mensaje.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/mensajes/${mensaje.mensaje_id}`}
                          className="block"
                          onClick={async (e) => {
                            if (!mensaje.leido) {
                              await marcarComoLeido(mensaje.mensaje_id)
                            }
                          }}
                        >
                          <p className={`mt-2 ${!mensaje.leido ? "text-gray-300" : "text-gray-400"} line-clamp-2`}>
                            {mensaje.contenido || "Sin contenido"}
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paginación */}
          {renderPagination()}
        </div>
      </div>
    </div>
  )
}

export default MensajesUsuario
