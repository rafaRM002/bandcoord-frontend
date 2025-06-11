/**
 * @file MinimosEvento.jsx
 * @module pages/MinimosEvento/MinimosEvento
 * @description Página para la gestión de mínimos de instrumentos por evento. Permite crear, editar, eliminar, filtrar y paginar mínimos, así como ver la cantidad disponible de cada tipo de instrumento. Solo los administradores pueden modificar los mínimos.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Filter, Search, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"
import { useTranslation } from "../../hooks/useTranslation"
import { useAuth } from "../../context/AuthContext"

/**
 * Componente principal para la gestión de mínimos de instrumentos por evento.
 * Permite listar, buscar, filtrar, crear, editar y eliminar mínimos.
 * @component
 * @returns {JSX.Element} Página de mínimos de evento.
 */
export default function MinimosEvento() {
  /** Lista de mínimos de instrumentos por evento */
  const [minimos, setMinimos] = useState([])
  /** Estado de carga */
  const [loading, setLoading] = useState(true)
  /** Mensaje de error */
  const [error, setError] = useState(null)
  /** Lista de eventos */
  const [eventos, setEventos] = useState([])
  /** Lista de tipos de instrumento */
  const [tiposInstrumento, setTiposInstrumento] = useState([])
  /** Filtro por evento */
  const [eventoFilter, setEventoFilter] = useState("")
  /** Filtro por tipo de instrumento */
  const [tipoFilter, setTipoFilter] = useState("")
  /** Término de búsqueda */
  const [searchTerm, setSearchTerm] = useState("")
  /** Estado del modal de formulario */
  const [showModal, setShowModal] = useState(false)
  /** Modo del modal: "create" o "edit" */
  const [modalMode, setModalMode] = useState("create")
  /** Mínimo actual para crear/editar */
  const [currentMinimo, setCurrentMinimo] = useState({
    evento_id: "",
    instrumento_tipo_id: "",
    cantidad: 1,
  })
  /** Estado del modal de confirmación de borrado */
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  /** Identificador del mínimo a eliminar */
  const [minimoToDelete, setMinimoToDelete] = useState(null)
  /** Estado de eventos expandidos */
  const [expandedEventos, setExpandedEventos] = useState({})
  /** Página actual de la paginación */
  const [currentPage, setCurrentPage] = useState(1)
  /** Eventos por página */
  const [eventosPerPage] = useState(2)

  /** Hook de traducción */
  const { t } = useTranslation()
  /** Si el usuario es administrador */
  const { isAdmin } = useAuth()

  /**
   * Efecto para cargar datos al montar el componente.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        // console.log("Intentando cargar datos de mínimos de evento...")

        const [minimosRes, eventosRes, tiposRes] = await Promise.all([
          api.get("/minimos-evento"),
          api.get("/eventos"),
          api.get("/tipo-instrumentos"),
        ])

        // console.log("Respuesta de minimos-evento:", minimosRes)
        // console.log("Respuesta de eventos:", eventosRes)
        // console.log("Respuesta de tipos de instrumento:", tiposRes)

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
          // console.warn("Formato de respuesta inesperado para mínimos:", minimosRes.data)
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
          // console.warn("Formato de respuesta inesperado para eventos:", eventosRes.data)
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
          // console.warn("Formato de respuesta inesperado para tipos de instrumento:", tiposRes.data)
        }

        // console.log("Tipos de instrumentos cargados:", tiposData)
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

  /**
   * Abre el modal para crear o editar un mínimo.
   * @param {"create"|"edit"} mode - Modo del modal.
   * @param {Object} minimo - Mínimo a editar (opcional).
   */
  const handleOpenModal = (mode, minimo = { evento_id: "", instrumento_tipo_id: "", cantidad: 1 }) => {
    setModalMode(mode)
    setCurrentMinimo(minimo)
    setShowModal(true)
  }

  /**
   * Cierra el modal de formulario.
   */
  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentMinimo({ evento_id: "", instrumento_tipo_id: "", cantidad: 1 })
  }

  /**
   * Maneja el cambio en los campos del formulario de mínimo.
   * @param {Object} e - Evento de cambio.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentMinimo((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * Envía el formulario para crear o editar un mínimo.
   * @async
   * @param {Object} e - Evento de envío.
   */
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

  /**
   * Abre el modal de confirmación de borrado para un mínimo.
   * @param {string|number} eventoId - ID del evento.
   * @param {string|number} instrumentoTipoId - ID del tipo de instrumento.
   */
  const confirmDelete = (eventoId, instrumentoTipoId) => {
    setMinimoToDelete({ eventoId, instrumentoTipoId })
    setShowDeleteModal(true)
  }

  /**
   * Elimina un mínimo de evento.
   * @async
   */
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

  /**
   * Alterna el estado expandido de un evento.
   * @param {string|number} eventoId - ID del evento.
   */
  const toggleEventoExpanded = (eventoId) => {
    setExpandedEventos((prev) => ({
      ...prev,
      [eventoId]: !prev[eventoId],
    }))
  }

  /**
   * Filtra los eventos según los criterios de búsqueda y filtros seleccionados.
   * @type {Array}
   */
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

  /**
   * Cambia la página actual de la paginación.
   * @param {number} pageNumber - Número de página a mostrar.
   */
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  /**
   * Obtiene el nombre del tipo de instrumento a partir de su ID.
   * @param {string|number} tipoId - ID del tipo de instrumento.
   * @returns {string} Nombre del tipo de instrumento.
   */
  const getTipoNombre = (tipoId) => {
    // Buscar en los mínimos por si tiene el objeto tipo_instrumento anidado
    const minimoConTipo = minimos.find(
      (m) => (m.instrumento_tipo_id === tipoId || m.instrumento_tipo_id.toString() === tipoId) && m.tipo_instrumento,
    )

    if (minimoConTipo && minimoConTipo.tipo_instrumento) {
      return minimoConTipo.tipo_instrumento.instrumento || minimoConTipo.tipo_instrumento.nombre || tipoId
    }

    // Buscar en la lista de tipos
    const tipo = tiposInstrumento.find((t) => {
      return (
        (t.id !== undefined && t.id.toString() === tipoId.toString()) ||
        (t.instrumento !== undefined && t.instrumento.toString() === tipoId.toString())
      )
    })

    return tipo ? tipo.instrumento || tipo.nombre || tipoId : tipoId
  }

  /**
   * Obtiene la cantidad disponible de un tipo de instrumento.
   * @param {string|number} tipoId - ID del tipo de instrumento.
   * @returns {number} Cantidad disponible.
   */
  const getCantidadDisponible = (tipoId) => {
    if (!tipoId) return 0

    // console.log("Buscando cantidad disponible para tipo:", tipoId)
    // console.log("Tipos de instrumentos disponibles:", tiposInstrumento)

    const tipo = tiposInstrumento.find((t) => {
      const matchesId = t.id !== undefined && t.id.toString() === tipoId.toString()
      const matchesName =
        t.instrumento !== undefined &&
        typeof t.instrumento === "string" &&
        t.instrumento.toString() === tipoId.toString()

      // console.log(
      //   `Comparando: ${tipoId} con instrumento: ${t.instrumento}, id: ${t.id}, matches: ${matchesId || matchesName}`,
      // )

      return matchesId || matchesName
    })

    // console.log("Tipo encontrado:", tipo)

    if (tipo && typeof tipo.cantidad === "number") {
      // console.log(`Cantidad disponible para ${tipoId}: ${tipo.cantidad}`)
      return tipo.cantidad
    }

    // Buscar por nombre del instrumento en los tipos
    const tipoByName = tiposInstrumento.find((t) => {
      return (
        t.instrumento &&
        typeof t.instrumento === "string" &&
        getTipoNombre(tipoId).toLowerCase() === t.instrumento.toLowerCase()
      )
    })

    if (tipoByName && typeof tipoByName.cantidad === "number") {
      // console.log(`Cantidad disponible (por nombre) para ${tipoId}: ${tipoByName.cantidad}`)
      return tipoByName.cantidad
    }

    // console.log(`No se encontró cantidad para ${tipoId}, devolviendo 0`)
    return 0
  }

  /**
   * Agrupa los mínimos por evento.
   * @param {string|number} eventoId - ID del evento.
   * @returns {Array} Lista de mínimos para el evento.
   */
  const getMinimosPorEvento = (eventoId) => {
    return minimos.filter((minimo) => minimo.evento_id === eventoId)
  }

  /**
   * Formatea una fecha a DD/MM/YYYY.
   * @param {string} dateString - Fecha en formato ISO.
   * @returns {string} Fecha formateada.
   */
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  // Renderizado principal de la página de mínimos de evento
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{t("eventMinimums.title")}</h1>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal("create")}
            className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            <Plus size={18} />
            {t("eventMinimums.newMinimum")}
          </button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder={t("eventMinimums.searchByEvent")}
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
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
            >
              <option value="">{t("eventMinimums.allInstrumentTypes")}</option>
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
            <div className="text-[#C0C0C0]">{t("common.loading")}</div>
          </div>
        ) : filteredEventos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 bg-black/30 border border-gray-800 rounded-lg">
            <p className="text-gray-400 text-center">
              {eventoFilter || tipoFilter || searchTerm
                ? "No se encontraron eventos con los filtros aplicados."
                : t("eventMinimums.noMinimums")}
            </p>
            {isAdmin && (
              <button
                onClick={() => handleOpenModal("create")}
                className="mt-4 text-[#C0C0C0] hover:text-white underline"
              >
                {t("eventMinimums.addFirstMinimum")}
              </button>
            )}
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
                    <span className="text-sm text-gray-400 mr-3">
                      {eventosMinimos.length} {t("eventMinimums.instruments")}
                    </span>
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
                        {t("eventMinimums.noMinimumsForThisEvent")}
                        {isAdmin && (
                          <button
                            onClick={() =>
                              handleOpenModal("create", { evento_id: evento.id, instrumento_tipo_id: "", cantidad: 1 })
                            }
                            className="ml-2 text-[#C0C0C0] hover:text-white underline"
                          >
                           {t("common.add")}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-12 gap-4 py-2 border-b border-gray-800 text-xs font-medium text-gray-400 uppercase">
                          <div className="col-span-5">{t("eventMinimums.instrumentType")}</div>
                          <div className="col-span-3">{t("eventMinimums.minimumQuantity")}</div>
                          <div className="col-span-4 text-right">{isAdmin ? t("common.actions") : ""}</div>
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
                              {isAdmin && (
                                <>
                                  {evento.estado === "finalizado" ? (
                                    <span className="text-xs text-red-400">{t("common.eventFinished")}</span>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleOpenModal("edit", minimo)}
                                        className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                                        title={t("common.edit")}
                                      >
                                        <Edit size={18} />
                                      </button>
                                      <button
                                        onClick={() => confirmDelete(minimo.evento_id, minimo.instrumento_tipo_id)}
                                        className="p-1 text-gray-400 hover:text-red-400"
                                        title={t("common.delete")}
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Botón para añadir nuevo mínimo para este evento */}
                        {isAdmin && evento.estado !== "finalizado" && (
                          <div className="py-3 flex justify-center">
                            <button
                              onClick={() =>
                                handleOpenModal("create", {
                                  evento_id: evento.id,
                                  instrumento_tipo_id: "",
                                  cantidad: 1,
                                })
                              }
                              className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#C0C0C0]"
                            >
                              <Plus size={16} />
                              {t("eventMinimums.addInstrument")}
                            </button>
                          </div>
                        )}
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
              {modalMode === "create" ? t("eventMinimums.newMinimum") : t("eventMinimums.editMinimum")}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="evento_id" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("eventMinimums.event")} *
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
                    <option value="">{t("eventMinimums.selectEvent")}</option>
                    {eventos
                      .filter((evento) => evento.estado !== "finalizado")
                      .map((evento) => (
                        <option key={evento.id} value={evento.id}>
                          {evento.nombre}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="instrumento_tipo_id" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("eventMinimums.instrumentType")} *
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
                    <option value="">{t("eventMinimums.selectType")}</option>
                    {tiposInstrumento.map((tipo) => (
                      <option key={tipo.id || tipo.instrumento} value={tipo.id || tipo.instrumento}>
                        {tipo.instrumento}
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
                          {t("eventMinimums.messageMinimumExists")}
                        </span>
                      </div>
                    )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="cantidad" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("eventMinimums.minimumQuantity")} *
                  </label>
                  <input
                    id="cantidad"
                    name="cantidad"
                    type="number"
                    min="1"
                    max={
                      currentMinimo.instrumento_tipo_id ? getCantidadDisponible(currentMinimo.instrumento_tipo_id) : 1
                    }
                    value={currentMinimo.cantidad}
                    onChange={handleInputChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                  {currentMinimo.instrumento_tipo_id && (
                    <div className="text-sm text-gray-400">
                      {t("eventMinimums.quantityAvaiable")}: {getCantidadDisponible(currentMinimo.instrumento_tipo_id)}
                    </div>
                  )}
                  {currentMinimo.instrumento_tipo_id &&
                    Number(currentMinimo.cantidad) > getCantidadDisponible(currentMinimo.instrumento_tipo_id) && (
                      <div className="mt-2 flex items-start text-red-400 text-sm">
                        <AlertCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                        <span>
                          {t("eventMinimums.quantityMessage")} (
                          {getCantidadDisponible(currentMinimo.instrumento_tipo_id)}).
                        </span>
                      </div>
                    )}
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
                  className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    (modalMode === "create" &&
                      currentMinimo.evento_id &&
                      currentMinimo.instrumento_tipo_id &&
                      minimos.some(
                        (minimo) =>
                          minimo.evento_id.toString() === currentMinimo.evento_id.toString() &&
                          minimo.instrumento_tipo_id.toString() === currentMinimo.instrumento_tipo_id.toString(),
                      )) ||
                    (currentMinimo.instrumento_tipo_id &&
                      Number(currentMinimo.cantidad) > getCantidadDisponible(currentMinimo.instrumento_tipo_id))
                  }
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
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">{t("eventMinimums.confirmDelete")}</h3>
            <p className="text-gray-400 mb-6">{t("eventMinimums.deleteConfirmText")}</p>
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
