"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext, useAuth } from "../../context/AuthContext"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Info,
} from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"
import { useTranslation } from "../../hooks/useTranslation"

export default function EventoUsuario() {
  const { t } = useTranslation()
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
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventoUsuarioToDelete, setEventoUsuarioToDelete] = useState(null)
  const [expandedEventos, setExpandedEventos] = useState({})
  const [viewMode, setViewMode] = useState("list") // "list" o "stats"
  const [itemsPerPage] = useState(2)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentStatsPage, setCurrentStatsPage] = useState(1)
  const [statsPerPage] = useState(2)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)

  const { user: loggedInUser, isAdmin } = useAuth()

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

      // Ordenar eventos por nombre
      eventosData.sort((a, b) => a.nombre.localeCompare(b.nombre))
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
    },
  ) => {
    setModalMode(mode)
    setCurrentEventoUsuario(eventoUsuario)
    setShowModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newEventoUsuario = {
      ...currentEventoUsuario,
      [name]: type === "checkbox" ? checked : value,
    }

    setCurrentEventoUsuario(newEventoUsuario)

    // Verificar duplicados solo en modo crear y cuando ambos campos están llenos
    if (modalMode === "create" && newEventoUsuario.evento_id && newEventoUsuario.usuario_id) {
      const existeAsignacion = eventosUsuario.some(
        (item) =>
          item.evento_id === Number.parseInt(newEventoUsuario.evento_id) &&
          item.usuario_id === Number.parseInt(newEventoUsuario.usuario_id),
      )
      setShowDuplicateWarning(existeAsignacion)
    } else {
      setShowDuplicateWarning(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Si hay advertencia de duplicado, no permitir envío
      if (showDuplicateWarning) {
        toast.error(t("userEvents.assignmentAlreadyExists"))
        return
      }

      if (modalMode === "create") {
        await api.post("/evento-usuario", {
          evento_id: currentEventoUsuario.evento_id,
          usuario_id: currentEventoUsuario.usuario_id,
          confirmacion: currentEventoUsuario.confirmacion,
        })
        toast.success(t("userEvents.assignmentCreatedSuccessfully"))
      } else {
        await api.put(`/evento-usuario/${currentEventoUsuario.evento_id}/${currentEventoUsuario.usuario_id}`, {
          confirmacion: currentEventoUsuario.confirmacion,
        })
        toast.success(t("userEvents.assignmentUpdatedSuccessfully"))
      }

      // Recargar los datos
      fetchData()
      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar asignación de evento:", error)
      toast.error(t("userEvents.errorSavingAssignment"))
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
      toast.success(t("userEvents.assignmentDeletedSuccessfully"))
    } catch (error) {
      console.error("Error al eliminar asignación de evento:", error)
      toast.error(t("userEvents.errorDeletingAssignment"))
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
    let tieneAsignaciones = eventosUsuario.some((item) => item.evento_id === evento.id)

    // Si no es admin, solo mostrar eventos donde el usuario actual está asignado
    if (!isAdmin) {
      tieneAsignaciones = eventosUsuario.some(
        (item) => item.evento_id === evento.id && item.usuario_id === loggedInUser.id,
      )
    }

    return matchesSearch && matchesEvento && tieneAsignaciones
  })

  const getUsuarioNombre = (usuarioId) => {
    // Primero buscar en los eventosUsuario por si tiene el objeto usuario anidado
    const itemConUsuario = eventosUsuario.find((item) => item.usuario_id === usuarioId && item.usuario)
    if (itemConUsuario && itemConUsuario.usuario) {
      return `${itemConUsuario.usuario.nombre} ${itemConUsuario.usuario.apellido1 || ""}`
    }

    // Si no, buscar en la lista de usuarios
    const usuario = usuarios.find((u) => u.id === usuarioId)
    return usuario ? `${usuario.nombre} ${usuario.apellido1 || ""}` : t("userEvents.unknownUser")
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

  const getEventoHora = (eventoId) => {
    const evento = eventos.find((e) => e.id === eventoId)
    return evento && evento.hora ? formatTime(evento.hora) : "-"
  }

  const getEventoLugar = (eventoId) => {
    const evento = eventos.find((e) => e.id === eventoId)
    return evento && evento.lugar ? evento.lugar : "-"
  }

  const getEventoTipo = (eventoId) => {
    const evento = eventos.find((e) => e.id === eventoId)
    return evento && evento.tipo ? evento.tipo : ""
  }

  const getEventoTipoTranslated = (tipo) => {
    switch (tipo) {
      case "concierto":
        return t("events.concert")
      case "ensayo":
        return t("events.rehearsal")
      case "procesion":
        return t("events.procession")
      case "pasacalles":
        return t("events.parade")
      default:
        return tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : ""
    }
  }

  const getAsignacionesPorEvento = (eventoId) => {
    let asignaciones = eventosUsuario.filter((item) => item.evento_id === eventoId)

    // Si no es admin, solo mostrar la asignación del usuario actual
    if (!isAdmin) {
      asignaciones = asignaciones.filter((item) => item.usuario_id === loggedInUser.id)
    }

    return asignaciones
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
    return tipo ? tipo.nombre || tipo.instrumento : t("userEvents.unknownInstrument")
  }

  // Agrupar asignaciones por evento para la vista de lista
  const eventosAgrupados = filteredEventos.map((evento) => {
    const asignaciones = getAsignacionesPorEvento(evento.id)
    return {
      evento,
      asignaciones,
    }
  })

  // Calcular los índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentEventosAgrupados = eventosAgrupados.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(eventosAgrupados.length / itemsPerPage)

  // Función para cambiar la página
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const indexOfLastStat = currentStatsPage * statsPerPage
  const indexOfFirstStat = indexOfLastStat - statsPerPage
  const currentStatsEventos = filteredEventos.slice(indexOfFirstStat, indexOfLastStat)
  const totalStatsPages = Math.ceil(filteredEventos.length / statsPerPage)

  // Función para cambiar la página de estadísticas
  const paginateStats = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalStatsPages) {
      setCurrentStatsPage(pageNumber)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setShowDuplicateWarning(false)
    setCurrentEventoUsuario({
      evento_id: "",
      usuario_id: user ? user.id : "",
      confirmacion: false,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{t("userEvents.title")}</h1>
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
              {t("userEvents.list")}
            </button>
            <button
              onClick={() => setViewMode("stats")}
              className={`px-4 py-2 ${
                viewMode === "stats" ? "bg-black text-[#C0C0C0]" : "bg-gray-900/50 text-gray-400 hover:bg-gray-900"
              }`}
            >
              {t("userEvents.statistics")}
            </button>
          </div>
          {isAdmin && (
            <button
              onClick={() => handleOpenModal("create")}
              className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
            >
              <Plus size={18} />
              {t("userEvents.newAssignment")}
            </button>
          )}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">
          <h3 className="font-semibold">{t("userEvents.connectionError")}</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            {t("userEvents.verifyThat")}:
            <ul className="list-disc pl-5 mt-1">
              <li>{t("userEvents.serverRunning")}</li>
              <li>{t("userEvents.corsConfiguration")}</li>
              <li>{t("userEvents.apiRoutesCorrect")}</li>
              <li>{t("userEvents.authenticatedWithToken")}</li>
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
              placeholder={t("userEvents.searchByEventOrUser")}
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
              <option value="">{t("eventMinimums.allEvents")}</option>
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
                  <option value="">{t("userEvents.allUsers")}</option>
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
                  <option value="">{t("userEvents.allStatuses")}</option>
                  <option value="true">{t("userEvents.confirmed")}</option>
                  <option value="false">{t("userEvents.pending")}</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenido según el modo de vista */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-black/30 border border-gray-800 rounded-lg">
          <div className="text-[#C0C0C0]">{t("common.loading")}</div>
        </div>
      ) : viewMode === "list" ? (
        /* Vista de lista agrupada por evento */
        <div className="space-y-6">
          {currentEventosAgrupados.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 bg-black/30 border border-gray-800 rounded-lg">
              <Calendar size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400 text-center">
                {searchTerm || eventoFilter || usuarioFilter || confirmadoFilter
                  ? t("userEvents.noAssignmentsWithFilters")
                  : t("userEvents.noAssignments")}
              </p>
              {isAdmin && (
                <button
                  onClick={() => handleOpenModal("create")}
                  className="mt-4 text-[#C0C0C0] hover:text-white underline"
                >
                  {t("userEvents.addFirstAssignment")}
                </button>
              )}
            </div>
          ) : (
            currentEventosAgrupados.map(({ evento, asignaciones }) => (
              <div key={evento.id} className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
                {/* Cabecera del evento */}
                <div
                  className="bg-gray-900/50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleEventoExpanded(evento.id)}
                >
                  <div>
                    <h2 className="text-lg font-semibold text-[#C0C0C0]">{evento.nombre}</h2>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        {getEventoFecha(evento.id)}
                      </div>
                      {getEventoHora(evento.id) !== "-" && (
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2" />
                          {getEventoHora(evento.id)}
                        </div>
                      )}
                      {getEventoLugar(evento.id) !== "-" && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          {getEventoLugar(evento.id)}
                        </div>
                      )}
                      {getEventoTipo(evento.id) && (
                        <div className="flex items-center">
                          <Info size={16} className="mr-2" />
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getEventoTipo(evento.id) === "concierto"
                                ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                                : getEventoTipo(evento.id) === "ensayo"
                                  ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                                  : getEventoTipo(evento.id) === "procesion"
                                    ? "bg-green-900/30 text-green-400 border border-green-800"
                                    : getEventoTipo(evento.id) === "pasacalles"
                                      ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                                      : "bg-gray-900/30 text-gray-400 border border-gray-800"
                            }`}
                          >
                            {getEventoTipoTranslated(getEventoTipo(evento.id))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="text-gray-400">
                    {expandedEventos[evento.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Tabla de asignaciones (solo visible si está expandido) */}
                {expandedEventos[evento.id] && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-900/30 border-b border-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              {t("userEvents.user")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              {t("userEvents.confirmed")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              {isAdmin ? t("common.actions") : ""}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {asignaciones.map((item) => (
                            <tr key={`${item.evento_id}-${item.usuario_id}`} className="hover:bg-gray-900/30">
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
                                  {item.confirmacion ? t("userEvents.confirmed") : t("userEvents.pending")}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                                {isAdmin && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleOpenModal("edit", item)}
                                      className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                                      title={t("common.edit")}
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button
                                      onClick={() => confirmDelete(item.evento_id, item.usuario_id)}
                                      className="p-1 text-gray-400 hover:text-red-400"
                                      title={t("common.delete")}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Botón para añadir asignación a este evento */}
                    {isAdmin && (
                      <div className="bg-gray-900/20 px-4 py-3 flex justify-end">
                        <button
                          onClick={() =>
                            handleOpenModal("create", {
                              evento_id: evento.id,
                              usuario_id: "",
                              confirmacion: false,
                            })
                          }
                          className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#C0C0C0]"
                        >
                          <Plus size={16} />
                          {t("userEvents.addAssignment")}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-gray-900/50 px-4 py-3 rounded-md">
              <div className="text-sm text-gray-400">
                {t("common.showing")} {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, eventosAgrupados.length)}{" "}
                {t("common.of")} {eventosAgrupados.length} {t("events.events")}
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
                      currentPage === page
                        ? "bg-black text-[#C0C0C0]"
                        : "bg-gray-900 text-gray-400 hover:text-[#C0C0C0]"
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
      ) : (
        /* Vista de estadísticas */
        <div className="space-y-6">
          {filteredEventos.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 bg-black/30 border border-gray-800 rounded-lg">
              <Calendar size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400 text-center">
                {searchTerm || eventoFilter
                  ? t("userEvents.noEventsWithFilters")
                  : t("userEvents.noEventsWithAssignments")}
              </p>
              {isAdmin && (
                <button
                  onClick={() => handleOpenModal("create")}
                  className="mt-4 text-[#C0C0C0] hover:text-white underline"
                >
                  {t("userEvents.addFirstAssignment")}
                </button>
              )}
            </div>
          ) : (
            currentStatsEventos.map((evento) => {
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
                        {evento.tipo && getEventoTipoTranslated(evento.tipo)}
                        {evento.lugar && ` · ${evento.lugar}`}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-right">
                        <div className="text-sm font-medium text-[#C0C0C0]">
                          {estadisticas.totalConfirmados} / {estadisticas.totalAsignados} {t("userEvents.confirmed")}
                        </div>
                        <div className="text-xs text-gray-400">
                          {estadisticas.porcentajeConfirmados}% {t("userEvents.attendance")}
                        </div>
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
                            <div className="text-gray-400 text-sm">{t("userEvents.totalAssigned")}</div>
                            <div className="text-[#C0C0C0] text-xl font-semibold">{estadisticas.totalAsignados}</div>
                          </div>
                        </div>
                        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-gray-400 text-sm">{t("userEvents.confirmed")}</div>
                            <div className="text-green-400 text-xl font-semibold">{estadisticas.totalConfirmados}</div>
                          </div>
                        </div>
                        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-gray-400 text-sm">{t("userEvents.attendancePercentage")}</div>
                            <div className="text-[#C0C0C0] text-xl font-semibold">
                              {estadisticas.porcentajeConfirmados}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estadísticas por tipo de instrumento */}
                      <h3 className="text-[#C0C0C0] font-medium mb-3">{t("userEvents.attendanceByInstrument")}</h3>

                      {Object.keys(estadisticas.porTipoInstrumento).length === 0 ? (
                        <p className="text-gray-400 text-center py-4">{t("userEvents.noInstrumentData")}</p>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(estadisticas.porTipoInstrumento).map(([tipoId, datos]) => (
                            <div key={tipoId} className="bg-gray-900/20 border border-gray-800 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-[#C0C0C0]">{datos.nombre}</div>
                                <div className="text-gray-400 text-sm">
                                  {datos.confirmados} / {datos.total} {t("userEvents.confirmed")}
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
                          <h3 className="text-[#C0C0C0] font-medium">{t("userEvents.assignmentList")}</h3>
                          {isAdmin && (
                            <button
                              onClick={() =>
                                handleOpenModal("create", {
                                  evento_id: evento.id,
                                  usuario_id: "",
                                  confirmacion: false,
                                })
                              }
                              className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#C0C0C0]"
                            >
                              <Plus size={16} />
                              {t("userEvents.addAssignment")}
                            </button>
                          )}
                        </div>

                        <div className="bg-gray-900/20 border border-gray-800 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-900/50 border-b border-gray-800">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  {t("userEvents.user")}
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  {t("common.status")}
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  {t("common.actions")}
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
                                      {item.confirmacion ? t("userEvents.confirmed") : t("userEvents.pending")}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleOpenModal("edit", item)}
                                        className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                                        title={t("common.edit")}
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() => confirmDelete(item.evento_id, item.usuario_id)}
                                        className="p-1 text-gray-400 hover:text-red-400"
                                        title={t("common.delete")}
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
          {/* Paginación para estadísticas */}
          {totalStatsPages > 1 && (
            <div className="flex justify-between items-center bg-gray-900/50 px-4 py-3 rounded-md">
              <div className="text-sm text-gray-400">
                {t("common.showing")} {indexOfFirstStat + 1}-{Math.min(indexOfLastStat, filteredEventos.length)}{" "}
                {t("common.of")} {filteredEventos.length} {t("events.events")}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => paginateStats(currentStatsPage - 1)}
                  disabled={currentStatsPage === 1}
                  className="p-2 rounded-md bg-gray-800 text-gray-400 hover:text-[#C0C0C0] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalStatsPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginateStats(page)}
                    className={`w-8 h-8 rounded-md ${
                      currentStatsPage === page
                        ? "bg-black text-[#C0C0C0]"
                        : "bg-gray-900 text-gray-400 hover:text-[#C0C0C0]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => paginateStats(currentStatsPage + 1)}
                  disabled={currentStatsPage === totalStatsPages}
                  className="p-2 rounded-md bg-gray-800 text-gray-400 hover:text-[#C0C0C0] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear/editar asignación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">
              {modalMode === "create" ? t("userEvents.newAssignment") : t("userEvents.editAssignment")}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Mensaje de advertencia para duplicados */}
                {showDuplicateWarning && (
                  <div className="bg-yellow-900/20 border border-yellow-800 text-yellow-100 px-4 py-3 rounded-md flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-0.5">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm">{t("userEvents.assignmentAlreadyExistsWarning")}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="evento_id" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("events.name")} *
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
                    <option value="">{t("eventMinimums.selectEvent")}</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nombre} ({formatDate(evento.fecha)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="usuario_id" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("userEvents.user")} *
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
                    <option value="">{t("userEvents.selectUser")}</option>
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
                    {t("userEvents.confirmed")}
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors"
                >
                  {modalMode === "create" ? t("common.create") : t("common.save")}
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
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">{t("userEvents.confirmDelete")}</h3>
            <p className="text-gray-400 mb-6">{t("userEvents.deleteConfirmText")}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                {t("common.cancel")}
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-900/80 text-white rounded-md hover:bg-red-800">
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
