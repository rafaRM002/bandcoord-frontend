"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { Plus, Edit, Trash2, Search, Filter, Calendar, ChevronDown, ChevronUp } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"

export default function EventoUsuario() {
  const [eventosUsuario, setEventosUsuario] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useContext(AuthContext)
  const [eventos, setEventos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [tiposInstrumento, setTiposInstrumento] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [eventoFilter, setEventoFilter] = useState("")
  const [usuarioFilter, setUsuarioFilter] = useState("")
  const [confirmadoFilter, setConfirmadoFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create") // "create" o "edit"
  const [currentEventoUsuario, setCurrentEventoUsuario] = useState({
    evento_id: "",
    usuario_id: "",
    confirmacion: false,
    observaciones: "",
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventoUsuarioToDelete, setEventoUsuarioToDelete] = useState(null)
  const [expandedEventos, setExpandedEventos] = useState({})
  const [viewMode, setViewMode] = useState("list") // "list" o "stats"

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Intentando cargar datos de eventos-usuario...")

      const [eventosUsuarioRes, eventosRes, usuariosRes, tiposInstrumentoRes] = await Promise.all([
        api.get("/evento-usuario"),
        api.get("/eventos"),
        api.get("/usuarios"),
        api.get("/tipo-instrumentos"),
      ])

      console.log("Respuesta de evento-usuario:", eventosUsuarioRes)
      console.log("Respuesta de eventos:", eventosRes)
      console.log("Respuesta de usuarios:", usuariosRes)
      console.log("Respuesta de tipos de instrumento:", tiposInstrumentoRes)

      // Procesar datos de eventos-usuario
      let eventosUsuarioData = []
      if (eventosUsuarioRes.data && Array.isArray(eventosUsuarioRes.data)) {
        eventosUsuarioData = eventosUsuarioRes.data
      } else if (eventosUsuarioRes.data && eventosUsuarioRes.data.data && Array.isArray(eventosUsuarioRes.data.data)) {
        eventosUsuarioData = eventosUsuarioRes.data.data
      } else {
        console.warn("Formato de respuesta inesperado para eventos-usuario:", eventosUsuarioRes.data)
      }

      // Mapear los datos para tener una estructura consistente
      const mappedEventosUsuario = eventosUsuarioData.map((item) => ({
        evento_id: item.evento_id,
        usuario_id: item.usuario_id,
        confirmacion: item.confirmacion || false,
        observaciones: item.observaciones || "",
        evento: item.evento || null,
        usuario: item.usuario || null,
      }))

      setEventosUsuario(mappedEventosUsuario)

      // Procesar datos de eventos
      let eventosData = []
      if (eventosRes.data && Array.isArray(eventosRes.data)) {
        eventosData = eventosRes.data
      } else if (eventosRes.data && eventosRes.data.eventos && Array.isArray(eventosRes.data.eventos)) {
        eventosData = eventosRes.data.eventos
      } else if (
        eventosRes.data &&
        eventosRes.data.data &&
        eventosRes.data.data.eventos &&
        Array.isArray(eventosRes.data.data.eventos)
      ) {
        eventosData = eventosRes.data.data.eventos
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

      // Procesar datos de tipos de instrumento
      let tiposData = []
      if (tiposInstrumentoRes.data && Array.isArray(tiposInstrumentoRes.data)) {
        tiposData = tiposInstrumentoRes.data
      } else if (
        tiposInstrumentoRes.data &&
        tiposInstrumentoRes.data.data &&
        Array.isArray(tiposInstrumentoRes.data.data)
      ) {
        tiposData = tiposInstrumentoRes.data.data
      } else {
        console.warn("Formato de respuesta inesperado para tipos de instrumento:", tiposInstrumentoRes.data)
      }
      setTiposInstrumento(tiposData)

      // Inicializar todos los eventos como expandidos
      const initialExpandedState = {}
      eventosData.forEach((evento) => {
        initialExpandedState[evento.id] = true
      })
      setExpandedEventos(initialExpandedState)
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

  const handleOpenModal = (
    mode,
    eventoUsuario = {
      evento_id: "",
      usuario_id: user ? user.id : "",
      confirmacion: false,
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
      usuario_id: user ? user.id : "",
      confirmacion: false,
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
        await api.post("/evento-usuario", {
          evento_id: currentEventoUsuario.evento_id,
          usuario_id: currentEventoUsuario.usuario_id,
          confirmacion: currentEventoUsuario.confirmacion,
          observaciones: currentEventoUsuario.observaciones,
        })
        toast.success("Asignación creada correctamente")
      } else {
        await api.put(`/evento-usuario/${currentEventoUsuario.evento_id}/${currentEventoUsuario.usuario_id}`, {
          confirmacion: currentEventoUsuario.confirmacion,
          observaciones: currentEventoUsuario.observaciones,
        })
        toast.success("Asignación actualizada correctamente")
      }

      // Recargar los datos
      fetchData()
      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar asignación de evento:", error)
      toast.error("Error al guardar la asignación")
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
      toast.success("Asignación eliminada correctamente")
    } catch (error) {
      console.error("Error al eliminar asignación de evento:", error)
      toast.error("Error al eliminar la asignación")
    }
  }

  const toggleEventoExpanded = (eventoId) => {
    setExpandedEventos((prev) => ({
      ...prev,
      [eventoId]: !prev[eventoId],
    }))
  }

  // Filtrar eventos según los criterios de búsqueda
  const filteredEventos = eventos.filter((evento) => {
    // Filtrar por término de búsqueda en el nombre del evento
    const matchesSearch = evento.nombre.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtrar por evento seleccionado
    const matchesEvento = eventoFilter === "" || evento.id.toString() === eventoFilter

    // Verificar si el evento tiene al menos una asignación
    const tieneAsignaciones = eventosUsuario.some((item) => item.evento_id === evento.id)

    return matchesSearch && matchesEvento && tieneAsignaciones
  })

  // Filtrar asignaciones según los criterios de búsqueda (para vista de lista)
  const filteredEventosUsuario = eventosUsuario.filter((item) => {
    const evento = item.evento || eventos.find((e) => e.id === item.evento_id)
    const usuario = item.usuario || usuarios.find((u) => u.id === item.usuario_id)

    const matchesSearch =
      (evento && evento.nombre && evento.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario &&
        usuario.nombre &&
        `${usuario.nombre} ${usuario.apellido1 || ""}`.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesEvento = eventoFilter === "" || item.evento_id.toString() === eventoFilter
    const matchesUsuario = usuarioFilter === "" || item.usuario_id.toString() === usuarioFilter
    const matchesConfirmado =
      confirmadoFilter === "" ||
      (confirmadoFilter === "true" && item.confirmacion) ||
      (confirmadoFilter === "false" && !item.confirmacion)

    return matchesSearch && matchesEvento && matchesUsuario && matchesConfirmado
  })

  const getEventoNombre = (eventoId) => {
    // Primero buscar en los eventosUsuario por si tiene el objeto evento anidado
    const itemConEvento = eventosUsuario.find((item) => item.evento_id === eventoId && item.evento)
    if (itemConEvento && itemConEvento.evento) {
      return itemConEvento.evento.nombre
    }

    // Si no, buscar en la lista de eventos
    const evento = eventos.find((e) => e.id === eventoId)
    return evento ? evento.nombre : "Desconocido"
  }

  const getUsuarioNombre = (usuarioId) => {
    // Primero buscar en los eventosUsuario por si tiene el objeto usuario anidado
    const itemConUsuario = eventosUsuario.find((item) => item.usuario_id === usuarioId && item.usuario)
    if (itemConUsuario && itemConUsuario.usuario) {
      return `${itemConUsuario.usuario.nombre} ${itemConUsuario.usuario.apellido1 || ""}`
    }

    // Si no, buscar en la lista de usuarios
    const usuario = usuarios.find((u) => u.id === usuarioId)
    return usuario ? `${usuario.nombre} ${usuario.apellido1 || ""}` : "Desconocido"
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const getEventoFecha = (eventoId) => {
    // Primero buscar en los eventosUsuario por si tiene el objeto evento anidado
    const itemConEvento = eventosUsuario.find((item) => item.evento_id === eventoId && item.evento)
    if (itemConEvento && itemConEvento.evento && itemConEvento.evento.fecha) {
      return formatDate(itemConEvento.evento.fecha)
    }

    // Si no, buscar en la lista de eventos
    const evento = eventos.find((e) => e.id === eventoId)
    return evento && evento.fecha ? formatDate(evento.fecha) : "-"
  }

  // Obtener asignaciones por evento
  const getAsignacionesPorEvento = (eventoId) => {
    return eventosUsuario.filter((item) => item.evento_id === eventoId)
  }

  // Calcular estadísticas para un evento
  const getEstadisticasEvento = (eventoId) => {
    const asignaciones = getAsignacionesPorEvento(eventoId)
    const totalAsignados = asignaciones.length
    const totalConfirmados = asignaciones.filter((item) => item.confirmacion).length
    const porcentajeConfirmados = totalAsignados > 0 ? Math.round((totalConfirmados / totalAsignados) * 100) : 0

    // Obtener estadísticas por tipo de instrumento
    // Primero necesitamos saber qué instrumento toca cada usuario
    const usuariosInstrumentos = usuarios.reduce((acc, usuario) => {
      if (usuario.instrumento_tipo_id) {
        acc[usuario.id] = usuario.instrumento_tipo_id
      }
      return acc
    }, {})

    // Contar por tipo de instrumento
    const porTipoInstrumento = {}
    asignaciones.forEach((asignacion) => {
      const usuarioId = asignacion.usuario_id
      const tipoInstrumentoId = usuariosInstrumentos[usuarioId]

      if (tipoInstrumentoId) {
        if (!porTipoInstrumento[tipoInstrumentoId]) {
          porTipoInstrumento[tipoInstrumentoId] = {
            total: 0,
            confirmados: 0,
            nombre: getTipoInstrumentoNombre(tipoInstrumentoId),
          }
        }

        porTipoInstrumento[tipoInstrumentoId].total++
        if (asignacion.confirmacion) {
          porTipoInstrumento[tipoInstrumentoId].confirmados++
        }
      }
    })

    return {
      totalAsignados,
      totalConfirmados,
      porcentajeConfirmados,
      porTipoInstrumento,
    }
  }

  const getTipoInstrumentoNombre = (tipoId) => {
    const tipo = tiposInstrumento.find((t) => t.id === tipoId || t.instrumento === tipoId)
    return tipo ? tipo.nombre || tipo.instrumento : "Desconocido"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Asignación de Eventos</h1>
        <div className="flex space-x-3">
          <div className="flex border border-gray-800 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 ${
                viewMode === "list"
                  ? "bg-black border-r border-gray-800 text-[#C0C0C0]"
                  : "bg-gray-900/50 text-gray-400 hover:bg-gray-900"
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode("stats")}
              className={`px-4 py-2 ${
                viewMode === "stats" ? "bg-black text-[#C0C0C0]" : "bg-gray-900/50 text-gray-400 hover:bg-gray-900"
              }`}
            >
              Estadísticas
            </button>
          </div>
          <button
            onClick={() => handleOpenModal("create")}
            className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            <Plus size={18} />
            Nueva Asignación
          </button>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          {viewMode === "list" && (
            <>
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
                      {usuario.nombre} {usuario.apellido1 || ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <select
                  value={confirmadoFilter}
                  onChange={(e) => setConfirmadoFilter(e.target.value)}
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
                >
                  <option value="">Todos los estados</option>
                  <option value="true">Confirmados</option>
                  <option value="false">Pendientes</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenido según el modo de vista */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-black/30 border border-gray-800 rounded-lg">
          <div className="text-[#C0C0C0]">Cargando datos...</div>
        </div>
      ) : viewMode === "list" ? (
        /* Vista de lista */
        <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
          {filteredEventosUsuario.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64">
              <Calendar size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400 text-center">
                {searchTerm || eventoFilter || usuarioFilter || confirmadoFilter
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
                            item.confirmacion
                              ? "bg-green-900/30 text-green-400 border border-green-800"
                              : "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                          }`}
                        >
                          {item.confirmacion ? "Confirmado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#C0C0C0]">{item.observaciones || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModal("edit", item)}
                            className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(item.evento_id, item.usuario_id)}
                            className="p-1 text-gray-400 hover:text-red-400"
                            title="Eliminar"
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
      ) : (
        /* Vista de estadísticas */
        <div className="space-y-6">
          {filteredEventos.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 bg-black/30 border border-gray-800 rounded-lg">
              <Calendar size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400 text-center">
                {searchTerm || eventoFilter
                  ? "No se encontraron eventos con los filtros aplicados."
                  : "No hay eventos con asignaciones registradas."}
              </p>
              <button
                onClick={() => handleOpenModal("create")}
                className="mt-4 text-[#C0C0C0] hover:text-white underline"
              >
                Añadir la primera asignación
              </button>
            </div>
          ) : (
            filteredEventos.map((evento) => {
              const estadisticas = getEstadisticasEvento(evento.id)

              return (
                <div key={evento.id} className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
                  {/* Cabecera del evento */}
                  <div
                    className="bg-gray-900/50 px-4 py-3 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleEventoExpanded(evento.id)}
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-[#C0C0C0]">{evento.nombre}</h2>
                      <p className="text-sm text-gray-400">
                        {evento.fecha && `${formatDate(evento.fecha)} · `}
                        {evento.tipo && evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
                        {evento.lugar && ` · ${evento.lugar}`}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-right">
                        <div className="text-sm font-medium text-[#C0C0C0]">
                          {estadisticas.totalConfirmados} / {estadisticas.totalAsignados} confirmados
                        </div>
                        <div className="text-xs text-gray-400">{estadisticas.porcentajeConfirmados}% de asistencia</div>
                      </div>
                      <button className="text-gray-400">
                        {expandedEventos[evento.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Contenido expandible con las estadísticas */}
                  {expandedEventos[evento.id] && (
                    <div className="px-4 py-4">
                      {/* Resumen general */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-gray-400 text-sm">Total asignados</div>
                            <div className="text-[#C0C0C0] text-xl font-semibold">{estadisticas.totalAsignados}</div>
                          </div>
                        </div>
                        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-gray-400 text-sm">Confirmados</div>
                            <div className="text-green-400 text-xl font-semibold">{estadisticas.totalConfirmados}</div>
                          </div>
                        </div>
                        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-gray-400 text-sm">Porcentaje de asistencia</div>
                            <div className="text-[#C0C0C0] text-xl font-semibold">
                              {estadisticas.porcentajeConfirmados}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estadísticas por tipo de instrumento */}
                      <h3 className="text-[#C0C0C0] font-medium mb-3">Asistencia por tipo de instrumento</h3>

                      {Object.keys(estadisticas.porTipoInstrumento).length === 0 ? (
                        <p className="text-gray-400 text-center py-4">
                          No hay datos disponibles por tipo de instrumento.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(estadisticas.porTipoInstrumento).map(([tipoId, datos]) => (
                            <div key={tipoId} className="bg-gray-900/20 border border-gray-800 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-[#C0C0C0]">{datos.nombre}</div>
                                <div className="text-gray-400 text-sm">
                                  {datos.confirmados} / {datos.total} confirmados
                                </div>
                              </div>
                              <div className="w-full bg-gray-800 rounded-full h-2.5">
                                <div
                                  className="bg-green-600 h-2.5 rounded-full"
                                  style={{ width: `${datos.total > 0 ? (datos.confirmados / datos.total) * 100 : 0}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Lista de asignaciones */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-[#C0C0C0] font-medium">Listado de asignaciones</h3>
                          <button
                            onClick={() =>
                              handleOpenModal("create", {
                                evento_id: evento.id,
                                usuario_id: "",
                                confirmacion: false,
                                observaciones: "",
                              })
                            }
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#C0C0C0]"
                          >
                            <Plus size={16} />
                            Añadir asignación
                          </button>
                        </div>

                        <div className="bg-gray-900/20 border border-gray-800 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-900/50 border-b border-gray-800">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Usuario
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Estado
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Acciones
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                              {getAsignacionesPorEvento(evento.id).map((item) => (
                                <tr key={`${item.evento_id}-${item.usuario_id}`} className="hover:bg-gray-900/30">
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-[#C0C0C0]">
                                    {getUsuarioNombre(item.usuario_id)}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        item.confirmacion
                                          ? "bg-green-900/30 text-green-400 border border-green-800"
                                          : "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                                      }`}
                                    >
                                      {item.confirmacion ? "Confirmado" : "Pendiente"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleOpenModal("edit", item)}
                                        className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                                        title="Editar"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() => confirmDelete(item.evento_id, item.usuario_id)}
                                        className="p-1 text-gray-400 hover:text-red-400"
                                        title="Eliminar"
                                      >
                                        <Trash2 size={16} />
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
                </div>
              )
            })
          )}
        </div>
      )}

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
                        {usuario.nombre} {usuario.apellido1 || ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    id="confirmacion"
                    name="confirmacion"
                    type="checkbox"
                    checked={currentEventoUsuario.confirmacion}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#C0C0C0] focus:ring-[#C0C0C0] border-gray-800 rounded"
                  />
                  <label htmlFor="confirmacion" className="ml-2 block text-[#C0C0C0] text-sm">
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
    </div>
  )
}
