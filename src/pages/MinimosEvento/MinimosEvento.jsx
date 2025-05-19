"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Filter, Search, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"

export default function MinimosEvento() {
  const [minimos, setMinimos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [eventos, setEventos] = useState([])
  const [tiposInstrumento, setTiposInstrumento] = useState([])
  const [eventoFilter, setEventoFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create") // "create" o "edit"
  const [currentMinimo, setCurrentMinimo] = useState({
    evento_id: "",
    instrumento_tipo_id: "",
    cantidad: 1,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [minimoToDelete, setMinimoToDelete] = useState(null)
  const [expandedEventos, setExpandedEventos] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [eventosPerPage] = useState(2) // Mostrar solo 2 eventos por página

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Intentando cargar datos de mínimos de evento...")

        const [minimosRes, eventosRes, tiposRes] = await Promise.all([
          api.get("/minimos-evento"),
          api.get("/eventos"),
          api.get("/tipo-instrumentos"),
        ])

        console.log("Respuesta de minimos-evento:", minimosRes)
        console.log("Respuesta de eventos:", eventosRes)
        console.log("Respuesta de tipos de instrumento:", tiposRes)

        // Procesar datos de mínimos
        let minimosData = []
        if (minimosRes.data && Array.isArray(minimosRes.data)) {
          minimosData = minimosRes.data
        } else if (minimosRes.data && minimosRes.data.data && Array.isArray(minimosRes.data.data)) {
          minimosData = minimosRes.data.data
        } else if (
          minimosRes.data &&
          minimosRes.data.originalData &&
          minimosRes.data.originalData.data &&
          Array.isArray(minimosRes.data.originalData.data)
        ) {
          minimosData = minimosRes.data.originalData.data
        } else {
          console.warn("Formato de respuesta inesperado para mínimos:", minimosRes.data)
        }

        // Mapear los datos para tener una estructura consistente
        const mappedMinimos = minimosData.map((minimo) => ({
          evento_id: minimo.evento_id,
          instrumento_tipo_id: minimo.instrumento_tipo_id,
          cantidad: minimo.cantidad || 0,
          evento: minimo.evento || null,
          tipo_instrumento: minimo.tipo_instrumento || null,
        }))

        setMinimos(mappedMinimos)

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

        // Ordenar eventos alfabéticamente por nombre
        eventosData.sort((a, b) => a.nombre.localeCompare(b.nombre))
        setEventos(eventosData)

        // Procesar datos de tipos de instrumento
        let tiposData = []
        if (tiposRes.data && Array.isArray(tiposRes.data)) {
          tiposData = tiposRes.data
        } else if (tiposRes.data && tiposRes.data.data && Array.isArray(tiposRes.data.data)) {
          tiposData = tiposRes.data.data
        } else {
          console.warn("Formato de respuesta inesperado para tipos de instrumento:", tiposRes.data)
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

    fetchData()
  }, [])

  const handleOpenModal = (mode, minimo = { evento_id: "", instrumento_tipo_id: "", cantidad: 1 }) => {
    setModalMode(mode)
    setCurrentMinimo(minimo)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentMinimo({ evento_id: "", instrumento_tipo_id: "", cantidad: 1 })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentMinimo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Verificar si ya existe un mínimo para este evento y tipo de instrumento
      if (modalMode === "create") {
        const existeMinimo = minimos.some(
          (minimo) =>
            minimo.evento_id.toString() === currentMinimo.evento_id.toString() &&
            minimo.instrumento_tipo_id.toString() === currentMinimo.instrumento_tipo_id.toString(),
        )

        if (existeMinimo) {
          toast.error(
            "Ya existe un mínimo para este evento y tipo de instrumento. Por favor, edita el existente si necesitas modificarlo.",
          )
          return
        }

        await api.post("/minimos-evento", {
          evento_id: currentMinimo.evento_id,
          instrumento_tipo_id: currentMinimo.instrumento_tipo_id,
          cantidad: Number.parseInt(currentMinimo.cantidad),
        })
        toast.success("Mínimo de instrumento creado correctamente")
      } else {
        await api.put(`/minimos-evento/${currentMinimo.evento_id}/${currentMinimo.instrumento_tipo_id}`, {
          cantidad: Number.parseInt(currentMinimo.cantidad),
        })
        toast.success("Mínimo de instrumento actualizado correctamente")
      }

      // Recargar los datos
      const response = await api.get("/minimos-evento")

      // Procesar datos de mínimos
      let minimosData = []
      if (response.data && Array.isArray(response.data)) {
        minimosData = response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        minimosData = response.data.data
      } else if (
        response.data &&
        response.data.originalData &&
        response.data.originalData.data &&
        Array.isArray(response.data.originalData.data)
      ) {
        minimosData = response.data.originalData.data
      }

      // Mapear los datos para tener una estructura consistente
      const mappedMinimos = minimosData.map((minimo) => ({
        evento_id: minimo.evento_id,
        instrumento_tipo_id: minimo.instrumento_tipo_id,
        cantidad: minimo.cantidad || 0,
        evento: minimo.evento || null,
        tipo_instrumento: minimo.tipo_instrumento || null,
      }))

      setMinimos(mappedMinimos)
      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar mínimo de evento:", error)
      toast.error("Error al guardar el mínimo de instrumento")
    }
  }

  const confirmDelete = (eventoId, instrumentoTipoId) => {
    setMinimoToDelete({ eventoId, instrumentoTipoId })
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!minimoToDelete) return

    try {
      await api.delete(`/minimos-evento/${minimoToDelete.eventoId}/${minimoToDelete.instrumentoTipoId}`)
      setMinimos(
        minimos.filter(
          (minimo) =>
            !(
              minimo.evento_id === minimoToDelete.eventoId &&
              minimo.instrumento_tipo_id === minimoToDelete.instrumentoTipoId
            ),
        ),
      )
      setShowDeleteModal(false)
      setMinimoToDelete(null)
      toast.success("Mínimo de instrumento eliminado correctamente")
    } catch (error) {
      console.error("Error al eliminar mínimo de evento:", error)
      toast.error("Error al eliminar el mínimo de instrumento")
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

    // Verificar si el evento tiene al menos un mínimo que coincida con el filtro de tipo
    const tieneMinimosConTipo =
      tipoFilter === "" ||
      minimos.some(
        (minimo) =>
          minimo.evento_id === evento.id &&
          (minimo.instrumento_tipo_id.toString() === tipoFilter ||
            (minimo.tipo_instrumento &&
              ((minimo.tipo_instrumento.instrumento && minimo.tipo_instrumento.instrumento.toString() === tipoFilter) ||
                (minimo.tipo_instrumento.id && minimo.tipo_instrumento.id.toString() === tipoFilter)))),
      )

    return matchesSearch && matchesEvento && tieneMinimosConTipo
  })

  // Paginación para mostrar solo 2 eventos por página
  const indexOfLastEvento = currentPage * eventosPerPage
  const indexOfFirstEvento = indexOfLastEvento - eventosPerPage
  const currentEventos = filteredEventos.slice(indexOfFirstEvento, indexOfLastEvento)
  const totalPages = Math.ceil(filteredEventos.length / eventosPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Función para obtener el nombre del tipo de instrumento
  const getTipoNombre = (tipoId) => {
    // Primero buscar en los minimos por si tiene el objeto tipo_instrumento anidado
    const minimoConTipo = minimos.find(
      (m) => (m.instrumento_tipo_id === tipoId || m.instrumento_tipo_id.toString() === tipoId) && m.tipo_instrumento,
    )

    if (minimoConTipo && minimoConTipo.tipo_instrumento) {
      return minimoConTipo.tipo_instrumento.instrumento || minimoConTipo.tipo_instrumento.nombre || tipoId
    }

    // Si no, buscar en la lista de tipos
    const tipo = tiposInstrumento.find((t) => t.id === tipoId || t.instrumento === tipoId)
    return tipo ? tipo.nombre || tipo.instrumento : tipoId
  }

  // Agrupar mínimos por evento
  const getMinimosPorEvento = (eventoId) => {
    return minimos.filter((minimo) => minimo.evento_id === eventoId)
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Mínimos en Eventos</h1>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nuevo Mínimo
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
              placeholder="Buscar por nombre de evento..."
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
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
            >
              <option value="">Todos los tipos de instrumento</option>
              {/* Extraer tipos únicos de los mínimos para asegurar que mostramos los que realmente existen */}
              {Array.from(new Set(minimos.map((m) => m.instrumento_tipo_id))).map((tipoId) => (
                <option key={tipoId} value={tipoId.toString()}>
                  {getTipoNombre(tipoId)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de eventos con sus mínimos */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-black/30 border border-gray-800 rounded-lg">
            <div className="text-[#C0C0C0]">Cargando datos...</div>
          </div>
        ) : filteredEventos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 bg-black/30 border border-gray-800 rounded-lg">
            <p className="text-gray-400 text-center">
              {eventoFilter || tipoFilter || searchTerm
                ? "No se encontraron eventos con los filtros aplicados."
                : "No hay mínimos de instrumentos registrados."}
            </p>
            <button
              onClick={() => handleOpenModal("create")}
              className="mt-4 text-[#C0C0C0] hover:text-white underline"
            >
              Añadir el primer mínimo
            </button>
          </div>
        ) : (
          currentEventos.map((evento) => {
            const eventosMinimos = getMinimosPorEvento(evento.id)

            // Si no hay mínimos para este evento y hay un filtro de tipo, no mostrar el evento
            if (eventosMinimos.length === 0 && tipoFilter !== "") {
              return null
            }

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
                    <span className="text-sm text-gray-400 mr-3">{eventosMinimos.length} instrumentos</span>
                    <button className="text-gray-400">
                      {expandedEventos[evento.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Contenido expandible con los mínimos */}
                {expandedEventos[evento.id] && (
                  <div className="px-4 py-2">
                    {eventosMinimos.length === 0 ? (
                      <div className="py-4 text-center text-gray-400">
                        No hay mínimos de instrumentos registrados para este evento.
                        <button
                          onClick={() =>
                            handleOpenModal("create", { evento_id: evento.id, instrumento_tipo_id: "", cantidad: 1 })
                          }
                          className="ml-2 text-[#C0C0C0] hover:text-white underline"
                        >
                          Añadir
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-12 gap-4 py-2 border-b border-gray-800 text-xs font-medium text-gray-400 uppercase">
                          <div className="col-span-5">Tipo de Instrumento</div>
                          <div className="col-span-3">Cantidad Mínima</div>
                          <div className="col-span-4 text-right">Acciones</div>
                        </div>

                        {/* Lista de mínimos para este evento */}
                        {eventosMinimos.map((minimo) => (
                          <div
                            key={`${minimo.evento_id}-${minimo.instrumento_tipo_id}`}
                            className="grid grid-cols-12 gap-4 py-3 border-b border-gray-800 items-center hover:bg-gray-900/20"
                          >
                            <div className="col-span-5 text-[#C0C0C0]">{getTipoNombre(minimo.instrumento_tipo_id)}</div>
                            <div className="col-span-3 text-[#C0C0C0]">{minimo.cantidad || 0}</div>
                            <div className="col-span-4 flex justify-end space-x-2">
                              <button
                                onClick={() => handleOpenModal("edit", minimo)}
                                className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => confirmDelete(minimo.evento_id, minimo.instrumento_tipo_id)}
                                className="p-1 text-gray-400 hover:text-red-400"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Botón para añadir nuevo mínimo para este evento */}
                        <div className="py-3 flex justify-center">
                          <button
                            onClick={() =>
                              handleOpenModal("create", { evento_id: evento.id, instrumento_tipo_id: "", cantidad: 1 })
                            }
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#C0C0C0]"
                          >
                            <Plus size={16} />
                            Añadir instrumento
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Paginación */}
      {filteredEventos.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-gray-900/50 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
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
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Modal para crear/editar mínimo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">
              {modalMode === "create" ? "Nuevo Mínimo de Instrumento" : "Editar Mínimo de Instrumento"}
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
                    value={currentMinimo.evento_id}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === "edit"}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-70"
                  >
                    <option value="">Selecciona un evento</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="instrumento_tipo_id" className="block text-[#C0C0C0] text-sm font-medium">
                    Tipo de Instrumento *
                  </label>
                  <select
                    id="instrumento_tipo_id"
                    name="instrumento_tipo_id"
                    value={currentMinimo.instrumento_tipo_id}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === "edit"}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-70"
                  >
                    <option value="">Selecciona un tipo</option>
                    {tiposInstrumento.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre || tipo.instrumento}
                      </option>
                    ))}
                  </select>
                  {modalMode === "create" &&
                    currentMinimo.evento_id &&
                    currentMinimo.instrumento_tipo_id &&
                    minimos.some(
                      (minimo) =>
                        minimo.evento_id.toString() === currentMinimo.evento_id.toString() &&
                        minimo.instrumento_tipo_id.toString() === currentMinimo.instrumento_tipo_id.toString(),
                    ) && (
                      <div className="mt-2 flex items-start text-amber-400 text-sm">
                        <AlertCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                        <span>
                          Este mínimo ya existe para este evento. Por favor, edita el existente o selecciona otro tipo
                          de instrumento.
                        </span>
                      </div>
                    )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="cantidad" className="block text-[#C0C0C0] text-sm font-medium">
                    Cantidad Mínima *
                  </label>
                  <input
                    id="cantidad"
                    name="cantidad"
                    type="number"
                    min="1"
                    value={currentMinimo.cantidad}
                    onChange={handleInputChange}
                    required
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
                  disabled={
                    modalMode === "create" &&
                    currentMinimo.evento_id &&
                    currentMinimo.instrumento_tipo_id &&
                    minimos.some(
                      (minimo) =>
                        minimo.evento_id.toString() === currentMinimo.evento_id.toString() &&
                        minimo.instrumento_tipo_id.toString() === currentMinimo.instrumento_tipo_id.toString(),
                    )
                  }
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
              ¿Estás seguro de que deseas eliminar este mínimo de instrumento? Esta acción no se puede deshacer.
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
