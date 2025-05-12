"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import axios from "../../api/axios"
import { toast } from "react-toastify"
import { Plus, Edit, Trash2, Search, Filter, Calendar } from "lucide-react"
import api from "../../api/axios"

const EventoUsuario = () => {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useContext(AuthContext)
  const [eventosUsuario, setEventosUsuario] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [eventoFilter, setEventoFilter] = useState("")
  const [usuarioFilter, setUsuarioFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create") // "create" o "edit"
  const [currentEventoUsuario, setCurrentEventoUsuario] = useState({
    evento_id: "",
    usuario_id: "",
    confirmado: false,
    observaciones: "",
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventoUsuarioToDelete, setEventoUsuarioToDelete] = useState(null)
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Intentando cargar datos de eventos-usuario...")

        const [eventosUsuarioRes, eventosRes, usuariosRes] = await Promise.all([
          api.get("/evento-usuario"),
          api.get("/eventos"),
          api.get("/usuarios"),
        ])

        console.log("Respuesta de evento-usuario:", eventosUsuarioRes)
        console.log("Respuesta de eventos:", eventosRes)
        console.log("Respuesta de usuarios:", usuariosRes)

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
        setEventosUsuario(eventosUsuarioData)

        // Procesar datos de eventos
        let eventosData = []
        if (eventosRes.data && Array.isArray(eventosRes.data)) {
          eventosData = eventosRes.data
        } else if (eventosRes.data && eventosRes.data.data && Array.isArray(eventosRes.data.data)) {
          eventosData = eventosRes.data.data
        } else {
          console.warn("Formato de respuesta inesperado para eventos:", eventosRes.data)
        }
        setEventos(eventosData)

        // Procesar datos de usuarios
        let usuariosData = []
        if (usuariosRes.data && Array.isArray(usuariosRes.data)) {
          usuariosData = usuariosRes.data
        } else if (usuariosRes.data && usuariosRes.data.data && Array.isArray(usuariosRes.data.data)) {
          usuariosData = usuariosRes.data.data
        } else {
          console.warn("Formato de respuesta inesperado para usuarios:", usuariosRes.data)
        }
        setUsuarios(usuariosData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError(`Error al cargar datos: ${error.message}`)

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

    const fetchEventosUsuario = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/evento-usuario`)
        console.log("Respuesta de eventos del usuario:", response.data)

        // Manejar diferentes formatos de respuesta
        const eventosData = Array.isArray(response.data)
          ? response.data
          : response.data.eventos || response.data.data || []

        setEventos(eventosData)
        setError(null)
      } catch (err) {
        console.error("Error al cargar eventos del usuario:", err)
        setError("Error al cargar tus eventos. Por favor, inténtelo de nuevo más tarde.")
        toast.error("Error al cargar tus eventos")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.id) {
      fetchEventosUsuario()
    }

    fetchData()
  }, [user])

  const handleOpenModal = (
    mode,
    eventoUsuario = {
      evento_id: "",
      usuario_id: "",
      confirmado: false,
      observaciones: "",
    },
  ) => {
    setModalMode(mode)
    setCurrentEventoUsuario(eventoUsuario)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentEventoUsuario({
      evento_id: "",
      usuario_id: "",
      confirmado: false,
      observaciones: "",
    })
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setCurrentEventoUsuario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (modalMode === "create") {
        await api.post("/evento-usuario", currentEventoUsuario)
      } else {
        await api.put(
          `/evento-usuario/${currentEventoUsuario.evento_id}/${currentEventoUsuario.usuario_id}`,
          currentEventoUsuario,
        )
      }

      // Recargar los datos
      const response = await api.get("/evento-usuario")

      // Procesar datos de eventos-usuario
      let eventosUsuarioData = []
      if (response.data && Array.isArray(response.data)) {
        eventosUsuarioData = response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        eventosUsuarioData = response.data.data
      }

      setEventosUsuario(eventosUsuarioData)
      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar asignación de evento:", error)
    }
  }

  const confirmDelete = (eventoId, usuarioId) => {
    setEventoUsuarioToDelete({ eventoId, usuarioId })
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!eventoUsuarioToDelete) return

    try {
      await api.delete(`/evento-usuario/${eventoUsuarioToDelete.eventoId}/${eventoUsuarioToDelete.usuarioId}`)
      setEventosUsuario(
        eventosUsuario.filter(
          (item) =>
            !(item.evento_id === eventoUsuarioToDelete.eventoId && item.usuario_id === eventoUsuarioToDelete.usuarioId),
        ),
      )
      setShowDeleteModal(false)
      setEventoUsuarioToDelete(null)
    } catch (error) {
      console.error("Error al eliminar asignación de evento:", error)
    }
  }

  const filteredEventosUsuario = eventosUsuario.filter((item) => {
    const evento = eventos.find((e) => e.id === item.evento_id)
    const usuario = usuarios.find((u) => u.id === item.usuario_id)

    const matchesSearch =
      (evento && evento.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario && `${usuario.nombre} ${usuario.apellido1}`.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesEvento = eventoFilter === "" || item.evento_id.toString() === eventoFilter
    const matchesUsuario = usuarioFilter === "" || item.usuario_id.toString() === usuarioFilter

    return matchesSearch && matchesEvento && matchesUsuario
  })

  const getEventoNombre = (eventoId) => {
    const evento = eventos.find((e) => e.id === eventoId)
    return evento ? evento.nombre : "Desconocido"
  }

  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuarios.find((u) => u.id === usuarioId)
    return usuario ? `${usuario.nombre} ${usuario.apellido1}` : "Desconocido"
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const getEventoFecha = (eventoId) => {
    const evento = eventos.find((e) => e.id === eventoId)
    return evento ? formatDate(evento.fecha) : "-"
  }

  const cancelarAsistencia = async (eventoId) => {
    try {
      await axios.delete(`/evento-usuario/${eventoId}/${user.id}`)

      // Actualizar la lista de eventos
      setEventos(eventos.filter((evento) => evento.id !== eventoId))

      toast.success("Has cancelado tu asistencia al evento")
    } catch (err) {
      console.error("Error al cancelar asistencia:", err)
      toast.error("Error al cancelar la asistencia")
    }
  }

  if (loading) return <div className="container mx-auto p-4">Cargando tus eventos...</div>
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mis Eventos</h1>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Asignación de Eventos</h1>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nueva Asignación
        </button>
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
              placeholder="Buscar por evento o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <select
              value={eventoFilter}
              onChange={(e) => setEventoFilter(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
            >
              <option value="">Todos los eventos</option>
              {eventos.map((evento) => (
                <option key={evento.id} value={evento.id.toString()}>
                  {evento.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <select
              value={usuarioFilter}
              onChange={(e) => setUsuarioFilter(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
            >
              <option value="">Todos los usuarios</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id.toString()}>
                  {usuario.nombre} {usuario.apellido1}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de asignaciones */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">Cargando asignaciones...</div>
          </div>
        ) : filteredEventosUsuario.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Calendar size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm || eventoFilter || usuarioFilter
                ? "No se encontraron asignaciones con los filtros aplicados."
                : "No hay asignaciones de eventos registradas."}
            </p>
            <button
              onClick={() => handleOpenModal("create")}
              className="mt-4 text-[#C0C0C0] hover:text-white underline"
            >
              Añadir la primera asignación
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Confirmado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Observaciones
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredEventosUsuario.map((item) => (
                  <tr key={`${item.evento_id}-${item.usuario_id}`} className="hover:bg-gray-900/30">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                      {getEventoNombre(item.evento_id)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                      {getEventoFecha(item.evento_id)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                      {getUsuarioNombre(item.usuario_id)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.confirmado
                            ? "bg-green-900/30 text-green-400 border border-green-800"
                            : "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                        }`}
                      >
                        {item.confirmado ? "Confirmado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#C0C0C0]">{item.observaciones || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal("edit", item)}
                          className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(item.evento_id, item.usuario_id)}
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
        )}
      </div>

      {/* Modal para crear/editar asignación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">
              {modalMode === "create" ? "Nueva Asignación de Evento" : "Editar Asignación de Evento"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="evento_id" className="block text-[#C0C0C0] text-sm font-medium">
                    Evento *
                  </label>
                  <select
                    id="evento_id"
                    name="evento_id"
                    value={currentEventoUsuario.evento_id}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === "edit"}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-70"
                  >
                    <option value="">Selecciona un evento</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nombre} ({formatDate(evento.fecha)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="usuario_id" className="block text-[#C0C0C0] text-sm font-medium">
                    Usuario *
                  </label>
                  <select
                    id="usuario_id"
                    name="usuario_id"
                    value={currentEventoUsuario.usuario_id}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === "edit"}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-70"
                  >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.apellido1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    id="confirmado"
                    name="confirmado"
                    type="checkbox"
                    checked={currentEventoUsuario.confirmado}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#C0C0C0] focus:ring-[#C0C0C0] border-gray-800 rounded"
                  />
                  <label htmlFor="confirmado" className="ml-2 block text-[#C0C0C0] text-sm">
                    Confirmado
                  </label>
                </div>
                <div className="space-y-2">
                  <label htmlFor="observaciones" className="block text-[#C0C0C0] text-sm font-medium">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={currentEventoUsuario.observaciones || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors"
                >
                  {modalMode === "create" ? "Crear" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">Confirmar eliminación</h3>
            <p className="text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar esta asignación de evento? Esta acción no se puede deshacer.
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
      {eventos.length === 0 ? (
        <p>No tienes eventos programados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventos.map((evento) => (
            <div key={evento.id} className="border rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold">{evento.nombre || evento.titulo}</h2>
              <p className="text-gray-600">
                {new Date(evento.fecha).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="my-2">{evento.descripcion}</p>
              <p className="mb-4">Lugar: {evento.lugar}</p>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => cancelarAsistencia(evento.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancelar asistencia
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EventoUsuario
