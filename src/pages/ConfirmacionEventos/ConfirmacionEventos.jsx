"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { Check, X, Calendar, MapPin, Clock, Info, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"

export default function ConfirmacionEventos() {
  const [eventosUsuario, setEventosUsuario] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useContext(AuthContext)
  const [eventos, setEventos] = useState([])

  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [confirmadoFilter, setConfirmadoFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!user || !user.id) {
          setError("Debes iniciar sesión para ver tus eventos pendientes")
          return
        }

        // Obtener solo los eventos-usuario del usuario autenticado
        const eventosUsuarioRes = await api.get(`/evento-usuario?usuario_id=${user.id}`)
        console.log("Respuesta de eventos del usuario:", eventosUsuarioRes)

        // Procesar datos de eventos-usuario
        let eventosUsuarioData = []
        if (eventosUsuarioRes.data && Array.isArray(eventosUsuarioRes.data)) {
          eventosUsuarioData = eventosUsuarioRes.data
        } else if (
          eventosUsuarioRes.data &&
          eventosUsuarioRes.data.data &&
          Array.isArray(eventosUsuarioRes.data.data)
        ) {
          eventosUsuarioData = eventosUsuarioRes.data.data
        } else {
          console.warn("Formato de respuesta inesperado para eventos-usuario:", eventosUsuarioRes.data)
        }

        // Filtrar explícitamente para asegurar que solo se muestran los eventos del usuario actual
        eventosUsuarioData = eventosUsuarioData.filter((item) => item.usuario_id === user.id)

        // Obtener detalles de los eventos
        const eventosIds = eventosUsuarioData.map((item) => item.evento_id)
        if (eventosIds.length > 0) {
          const eventosRes = await api.get("/eventos")

          let eventosData = []
          if (eventosRes.data && Array.isArray(eventosRes.data)) {
            eventosData = eventosRes.data
          } else if (eventosRes.data && eventosRes.data.eventos && Array.isArray(eventosRes.data.eventos)) {
            eventosData = eventosRes.data.eventos
          } else if (eventosRes.data && eventosRes.data.data && Array.isArray(eventosRes.data.data)) {
            eventosData = eventosRes.data.data
          }

          // Filtrar solo los eventos que están en eventosIds
          eventosData = eventosData.filter((evento) => eventosIds.includes(evento.id))

          // Ordenar eventos por nombre
          eventosData.sort((a, b) => a.nombre.localeCompare(b.nombre))
          setEventos(eventosData)
        }

        setEventosUsuario(eventosUsuarioData)
      } catch (error) {
        console.error("Error al cargar eventos pendientes:", error)
        setError(`Error al cargar eventos pendientes: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const confirmarAsistencia = async (eventoId, confirmado) => {
    try {
      if (!user || !user.id) {
        toast.error("Debes iniciar sesión para confirmar asistencia")
        return
      }

      await api.put(`/evento-usuario/${eventoId}/${user.id}`, {
        confirmacion: confirmado,
      })

      // Actualizar el estado local en lugar de eliminar
      setEventosUsuario(
        eventosUsuario.map((item) => {
          if (item.evento_id === eventoId) {
            return { ...item, confirmacion: confirmado }
          }
          return item
        }),
      )

      toast.success(confirmado ? "Has confirmado tu asistencia al evento" : "Has cancelado tu asistencia al evento")
    } catch (error) {
      console.error("Error al actualizar asistencia:", error)
      toast.error("Error al actualizar la asistencia")
    }
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  // Formatear hora para mostrar
  const formatTime = (timeString) => {
    if (!timeString) return "-"
    return timeString.substring(0, 5) // Extraer solo HH:MM
  }

  const getEventoDetalles = (eventoId) => {
    return eventos.find((evento) => evento.id === eventoId) || {}
  }

  // Combinar datos de eventos y eventosUsuario para tener toda la información
  const eventosConDetalles = eventosUsuario.map((item) => {
    const eventoDetalle = getEventoDetalles(item.evento_id)
    return {
      ...item,
      nombre: eventoDetalle.nombre || "Evento sin nombre",
      fecha: eventoDetalle.fecha || null,
      lugar: eventoDetalle.lugar || "",
      hora: eventoDetalle.hora || null,
      tipo: eventoDetalle.tipo || "",
      estado: eventoDetalle.estado || "",
      descripcion: eventoDetalle.descripcion || "",
      confirmacion: item.confirmacion || false,
    }
  })

  // Filtrar eventos según criterios de búsqueda
  const filteredEventos = eventosConDetalles.filter((evento) => {
    const matchesSearch =
      evento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evento.lugar && evento.lugar.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTipo = tipoFilter === "" || evento.tipo === tipoFilter
    const matchesConfirmado =
      confirmadoFilter === "" ||
      (confirmadoFilter === "true" && evento.confirmacion) ||
      (confirmadoFilter === "false" && !evento.confirmacion)

    return matchesSearch && matchesTipo && matchesConfirmado
  })

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentEventos = filteredEventos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredEventos.length / itemsPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-[#C0C0C0]">Cargando eventos pendientes...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#C0C0C0] mb-6">Confirmación de Eventos</h1>

      {/* Filtros y búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o lugar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
            >
              <option value="">Todos los tipos</option>
              <option value="concierto">Concierto</option>
              <option value="ensayo">Ensayo</option>
              <option value="procesion">Procesión</option>
              <option value="pasacalles">Pasacalles</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <select
              value={confirmadoFilter}
              onChange={(e) => setConfirmadoFilter(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
            >
              <option value="">Todos</option>
              <option value="true">Confirmados</option>
              <option value="false">Pendientes</option>
            </select>
          </div>
        </div>
      </div>

      {currentEventos.length === 0 ? (
        <div className="bg-black/30 border border-gray-800 rounded-lg p-8 text-center">
          <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No tienes eventos pendientes de confirmación.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEventos.map((item) => (
            <div
              key={`${item.evento_id}-${item.usuario_id}`}
              className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden"
            >
              <div className="p-5">
                <h2 className="text-xl font-semibold text-[#C0C0C0] mb-2">{item.nombre}</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-400">
                    <Calendar size={16} className="mr-2 flex-shrink-0" />
                    <span>{formatDate(item.fecha)}</span>
                  </div>

                  {item.hora && (
                    <div className="flex items-center text-gray-400">
                      <Clock size={16} className="mr-2 flex-shrink-0" />
                      <span>{formatTime(item.hora)}</span>
                    </div>
                  )}

                  {item.lugar && (
                    <div className="flex items-center text-gray-400">
                      <MapPin size={16} className="mr-2 flex-shrink-0" />
                      <span>{item.lugar}</span>
                    </div>
                  )}

                  {item.tipo && (
                    <div className="flex items-center text-gray-400">
                      <Info size={16} className="mr-2 flex-shrink-0" />
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.tipo === "concierto"
                            ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                            : item.tipo === "ensayo"
                              ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                              : item.tipo === "procesion"
                                ? "bg-green-900/30 text-green-400 border border-green-800"
                                : item.tipo === "pasacalles"
                                  ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                                  : "bg-gray-900/30 text-gray-400 border border-gray-800"
                        }`}
                      >
                        {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-4">
                  {item.confirmacion ? (
                    <button
                      onClick={() => confirmarAsistencia(item.evento_id, false)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-900/30 border border-red-800 text-red-400 px-4 py-2 rounded-md hover:bg-red-900/50 transition-colors"
                    >
                      <X size={18} />
                      Cancelar asistencia
                    </button>
                  ) : (
                    <button
                      onClick={() => confirmarAsistencia(item.evento_id, true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-900/30 border border-green-800 text-green-400 px-4 py-2 rounded-md hover:bg-green-900/50 transition-colors"
                    >
                      <Check size={18} />
                      Confirmar asistencia
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-gray-900/50 px-4 py-3 mt-6 rounded-md">
          <div className="text-sm text-gray-400">
            Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEventos.length)} de{" "}
            {filteredEventos.length} eventos
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-gray-800 text-gray-400 hover:text-[#C0C0C0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  currentPage === page ? "bg-black text-[#C0C0C0]" : "bg-gray-900 text-gray-400 hover:text-[#C0C0C0]"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md bg-gray-800 text-gray-400 hover:text-[#C0C0C0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
