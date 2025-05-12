"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Edit, Trash2, Search, Calendar, Filter, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import api from "../../api/axios"

export default function Eventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventoToDelete, setEventoToDelete] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchEventos()
  }, [])

  const fetchEventos = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Intentando conectar a:", `${api.defaults.baseURL}/eventos`)

      const response = await api.get("/eventos")
      console.log("Respuesta completa de eventos:", response)

      // Verificar la estructura de la respuesta
      let eventosData = []

      // Estructura correcta según la respuesta de la API
      if (response.data && response.data.eventos && Array.isArray(response.data.eventos)) {
        eventosData = response.data.eventos
        console.log("Eventos cargados correctamente:", eventosData.length)
      } else if (response.data && Array.isArray(response.data)) {
        eventosData = response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        eventosData = response.data.data
      } else {
        console.warn("Formato de respuesta inesperado para eventos:", response.data)
        setError("Formato de respuesta inesperado. Verifica la consola para más detalles.")
      }

      setEventos(eventosData)
    } catch (error) {
      console.error("Error al cargar eventos:", error)
      setError(`Error al cargar eventos: ${error.message}`)

      // Intentar determinar el tipo de error
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.status, error.response.data)
        setError(`Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor")
        setError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.")
      } else {
        console.error("Error de configuración:", error.message)
        setError(`Error de configuración: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!eventoToDelete) return

    try {
      await api.delete(`/eventos/${eventoToDelete}`)
      setEventos(eventos.filter((evento) => evento.id !== eventoToDelete))
      setShowDeleteModal(false)
      setEventoToDelete(null)
    } catch (error) {
      console.error("Error al eliminar evento:", error)
    }
  }

  const confirmDelete = (id) => {
    setEventoToDelete(id)
    setShowDeleteModal(true)
  }

  const filteredEventos = eventos.filter((evento) => {
    const matchesSearch =
      evento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.lugar.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = tipoFilter === "" || evento.tipo === tipoFilter
    const matchesEstado = estadoFilter === "" || evento.estado === estadoFilter

    return matchesSearch && matchesTipo && matchesEstado
  })

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentEventos = filteredEventos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredEventos.length / itemsPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Gestión de Eventos</h1>
        <Link
          to="/admin/eventos/nuevo"
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nuevo Evento
        </Link>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">
          <h3 className="font-semibold">Error de conexión</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Verifica que:
            <ul className="list-disc pl-5 mt-1">
              <li>El servidor Laravel esté en ejecución en http://localhost:8000</li>
              <li>La configuración CORS en Laravel permita peticiones desde http://localhost:5173</li>
              <li>Las rutas de la API estén correctamente definidas</li>
              <li>Estés autenticado con un token válido</li>
            </ul>
          </p>
        </div>
      )}

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
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
            >
              <option value="">Todos los estados</option>
              <option value="planificado">Planificado</option>
              <option value="en progreso">En progreso</option>
              <option value="finalizado">Finalizado</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de eventos */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">Cargando eventos...</div>
          </div>
        ) : filteredEventos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Calendar size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm || tipoFilter || estadoFilter
                ? "No se encontraron eventos con los filtros aplicados."
                : "No hay eventos registrados."}
            </p>
            <Link to="/admin/eventos/nuevo" className="mt-4 text-[#C0C0C0] hover:text-white underline">
              Añadir el primer evento
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Hora
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Lugar
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {currentEventos.map((evento) => (
                      <tr key={evento.id} className="hover:bg-gray-900/30">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">{evento.nombre}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              evento.tipo === "concierto"
                                ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                                : evento.tipo === "ensayo"
                                  ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                                  : evento.tipo === "procesion"
                                    ? "bg-green-900/30 text-green-400 border border-green-800"
                                    : evento.tipo === "pasacalles"
                                      ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                                      : "bg-gray-900/30 text-gray-400 border border-gray-800"
                            }`}
                          >
                            {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          {formatDate(evento.fecha)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          {formatTime(evento.hora)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-1 text-gray-400 flex-shrink-0" />
                            {evento.lugar}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              evento.estado === "planificado"
                                ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                                : evento.estado === "en progreso"
                                  ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                                  : evento.estado === "finalizado" || evento.estado === "completado"
                                    ? "bg-green-900/30 text-green-400 border border-green-800"
                                    : "bg-red-900/30 text-red-400 border border-red-800"
                            }`}
                          >
                            {evento.estado.charAt(0).toUpperCase() + evento.estado.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          <div className="flex space-x-2">
                            <Link
                              to={`/admin/eventos/editar/${evento.id}`}
                              className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => confirmDelete(evento.id)}
                              className="p-1 text-gray-400 hover:text-red-400"
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

        {/* Pagination */}
        {filteredEventos.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredEventos.length)} de{" "}
              {filteredEventos.length} eventos
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md bg-gray-900/50 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageNum
                        ? "bg-black border border-[#C0C0C0] text-[#C0C0C0]"
                        : "bg-gray-900/50 text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md bg-gray-900/50 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">Confirmar eliminación</h3>
            <p className="text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-900/80 text-white rounded-md hover:bg-red-800">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
