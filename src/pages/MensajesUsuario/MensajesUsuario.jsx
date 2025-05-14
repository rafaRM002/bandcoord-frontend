"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import axios from "../../api/axios"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import { Search, MessageSquare, User, Calendar, Eye, Bell, Inbox, Mail, CheckCircle, Archive } from "lucide-react"

const MensajesUsuario = () => {
  const [mensajes, setMensajes] = useState([])
  const [, setMensajesCompletos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [, setTotalPages] = useState(1)
  const [filtroActual, setFiltroActual] = useState("todos") // todos, leidos, no-leidos, archivados
  const { user } = useContext(AuthContext)
  const itemsPerPage = 6

  useEffect(() => {
    const fetchMensajesUsuario = async () => {
      try {
        setLoading(true)

        // Primero obtenemos las relaciones mensaje-usuario
        const responseMensajeUsuario = await axios.get(`/mensaje-usuarios`)
        console.log("Respuesta de relaciones mensaje-usuario:", responseMensajeUsuario.data)

        // Luego obtenemos todos los mensajes para tener los detalles completos
        const responseMensajes = await axios.get(`/mensajes`)
        console.log("Respuesta de mensajes:", responseMensajes.data)

        // Extraemos los datos de ambas respuestas
        let relacionesMensajeUsuario = Array.isArray(responseMensajeUsuario.data)
          ? responseMensajeUsuario.data
          : responseMensajeUsuario.data.data || []

        const mensajesData = Array.isArray(responseMensajes.data)
          ? responseMensajes.data
          : responseMensajes.data.mensajes || responseMensajes.data.data || []

        // Guardamos todos los mensajes para referencia
        setMensajesCompletos(mensajesData)

        // Filtramos las relaciones donde el usuario actual es el receptor
        if (user && user.id) {
          relacionesMensajeUsuario = relacionesMensajeUsuario.filter(
            (relacion) => relacion.usuario_id_receptor === user.id || relacion.usuario_id_receptor === Number(user.id),
          )
        }

        // Combinamos los datos de ambas tablas
        const mensajesCombinados = relacionesMensajeUsuario.map((relacion) => {
          const mensajeCompleto = mensajesData.find((m) => m.id === relacion.mensaje_id)
          return {
            ...relacion,
            asunto: mensajeCompleto?.asunto || "Sin asunto",
            contenido: mensajeCompleto?.contenido || "Sin contenido",
            usuario_id_emisor: mensajeCompleto?.usuario_id_emisor,
            // Importante: el estado 0 es no leído, 1 es leído
            leido: relacion.estado === 1,
            archivado: relacion.archivado || false,
          }
        })

        console.log("Mensajes combinados:", mensajesCombinados)
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

  const marcarComoLeido = async (mensajeId) => {
    try {
      await axios.put(`/mensaje-usuarios/${mensajeId}/${user.id}`, {
        estado: 1, // Importante: usamos estado 1 para marcar como leído
      })

      // Actualizar el estado del mensaje en la lista
      setMensajes(
        mensajes.map((mensaje) =>
          mensaje.mensaje_id === mensajeId && mensaje.usuario_id_receptor === user.id
            ? { ...mensaje, leido: true, estado: 1 }
            : mensaje,
        ),
      )

      toast.success("Mensaje marcado como leído")
    } catch (err) {
      console.error("Error al marcar mensaje como leído:", err)
      toast.error("Error al actualizar el estado del mensaje")
    }
  }

  const archivarMensaje = async (mensajeId) => {
    try {
      await axios.put(`/mensaje-usuarios/${mensajeId}/${user.id}`, {
        archivado: true,
      })

      // Actualizar el estado del mensaje en la lista
      setMensajes(
        mensajes.map((mensaje) =>
          mensaje.mensaje_id === mensajeId && mensaje.usuario_id_receptor === user.id
            ? { ...mensaje, archivado: true }
            : mensaje,
        ),
      )

      toast.success("Mensaje archivado")
    } catch (err) {
      console.error("Error al archivar mensaje:", err)
      toast.error("Error al archivar el mensaje")
    }
  }

  // Obtener el nombre del remitente
  const getNombreRemitente = (usuarioId) => {
    // Aquí podrías implementar una lógica para obtener el nombre del remitente
    // Por ahora, devolvemos un valor por defecto
    return `Usuario ${usuarioId}`
  }

  // Filtrar mensajes según la búsqueda y el filtro actual
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
    } else if (filtroActual === "archivados") {
      return matchesSearch && mensaje.archivado
    }

    // Si es "todos", mostrar todos excepto archivados
    return matchesSearch && !mensaje.archivado
  })

  // Paginación
  const paginatedMensajes = filteredMensajes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha desconocida"

    const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

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
          Anterior
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
          Siguiente
        </button>
      </div>
    )
  }

  if (loading) return <div className="container mx-auto p-4">Cargando tus mensajes...</div>
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>

  const mensajesNoLeidos = mensajes.filter((m) => !m.leido).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Bandeja de entrada</h1>
        <div className="flex items-center">
          <div className="mr-4">
            {mensajesNoLeidos > 0 && (
              <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                {mensajesNoLeidos} sin leer
              </div>
            )}
          </div>
          <Link
            to="/mensajes/nuevo"
            className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            Responder
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-black/30 border border-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-medium text-[#C0C0C0] mb-4">Filtros</h2>

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
                  <span>Todos</span>
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
                  <span>No leídos</span>
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
                  <span>Leídos</span>
                  <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded-full">
                    {mensajes.length - mensajesNoLeidos}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setFiltroActual("archivados")
                    setCurrentPage(1)
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    filtroActual === "archivados" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900/50"
                  }`}
                >
                  <Archive size={18} className="mr-2" />
                  <span>Archivados</span>
                  <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded-full">
                    {mensajes.filter((m) => m.archivado).length}
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
                placeholder="Buscar por remitente, asunto o contenido..."
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
            {paginatedMensajes.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64">
                <MessageSquare size={48} className="text-gray-600 mb-4" />
                <p className="text-gray-400 text-center">
                  {searchTerm
                    ? "No se encontraron mensajes con la búsqueda aplicada."
                    : filtroActual === "no-leidos"
                      ? "No tienes mensajes sin leer."
                      : filtroActual === "leidos"
                        ? "No tienes mensajes leídos."
                        : "No tienes mensajes."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {paginatedMensajes.map((mensaje) => (
                  <div
                    key={`${mensaje.mensaje_id}-${mensaje.usuario_id_receptor}`}
                    className={`p-4 hover:bg-gray-900/30 transition-colors ${
                      !mensaje.leido ? "bg-gray-900/50 border-l-4 border-yellow-500" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          {!mensaje.leido && <Bell size={16} className="text-yellow-500 mr-2" />}
                          <Link
                            to={`/mensajes/${mensaje.mensaje_id}`}
                            className={`text-lg ${
                              !mensaje.leido ? "font-bold text-white" : "font-medium text-[#C0C0C0]"
                            } hover:text-white`}
                            onClick={() => {
                              if (!mensaje.leido) {
                                marcarComoLeido(mensaje.mensaje_id)
                              }
                            }}
                          >
                            {mensaje.asunto || "Sin asunto"}
                          </Link>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-400">
                          <User size={14} className="mr-1" />
                          <span>De: {getNombreRemitente(mensaje.usuario_id_emisor)}</span>
                          <span className="mx-2">•</span>
                          <Calendar size={14} className="mr-1" />
                          <span>{formatDate(mensaje.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex">
                        {!mensaje.leido && (
                          <button
                            onClick={() => marcarComoLeido(mensaje.mensaje_id)}
                            className="p-1 mr-2 text-gray-400 hover:text-[#C0C0C0] bg-gray-900/50 rounded-full"
                            title="Marcar como leído"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => archivarMensaje(mensaje.mensaje_id)}
                          className="p-1 text-gray-400 hover:text-[#C0C0C0] bg-gray-900/50 rounded-full"
                          title="Archivar mensaje"
                        >
                          <Archive size={18} />
                        </button>
                      </div>
                    </div>
                    <p className={`mt-2 ${!mensaje.leido ? "text-gray-300" : "text-gray-400"} line-clamp-2`}>
                      {mensaje.contenido || "Sin contenido"}
                    </p>
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
