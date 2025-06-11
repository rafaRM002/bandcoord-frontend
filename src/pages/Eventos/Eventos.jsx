/**
 * @file Eventos.jsx
 * @module pages/Eventos/Eventos
 * @description Página para la gestión de eventos. Permite listar, buscar, filtrar, crear, editar, eliminar y paginar eventos. Los eventos expirados se actualizan automáticamente a "finalizado". Solo los administradores pueden modificar datos.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Calendar, Filter, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import api from "../../api/axios"
import FormularioEvento from "./FormularioEvento"
import { useTranslation } from "../../hooks/useTranslation"
import { useAuth } from "../../context/AuthContext"

/**
 * Componente principal para la gestión de eventos.
 * Permite listar, buscar, filtrar, crear, editar, eliminar y paginar eventos.
 * @component
 * @returns {JSX.Element} Página de eventos.
 */
export default function Eventos() {
  /** Lista de eventos */
  const [eventos, setEventos] = useState([])
  /** Estado de carga */
  const [loading, setLoading] = useState(true)
  /** Estado de error */
  const [error, setError] = useState(null)
  /** Término de búsqueda */
  const [searchTerm, setSearchTerm] = useState("")
  /** Filtro por tipo de evento */
  const [tipoFilter, setTipoFilter] = useState("")
  /** Filtro por estado de evento */
  const [estadoFilter, setEstadoFilter] = useState("")
  /** Estado del modal de confirmación de borrado */
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  /** ID del evento a eliminar */
  const [eventoToDelete, setEventoToDelete] = useState(null)
  /** Estado del modal de formulario */
  const [showFormModal, setShowFormModal] = useState(false)
  /** Evento actual para editar */
  const [currentEvento, setCurrentEvento] = useState(null)
  /** Hook de traducción */
  const { t } = useTranslation()
  /** Si el usuario es administrador */
  const { isAdmin } = useAuth()

  // Paginación
  /** Página actual */
  const [currentPage, setCurrentPage] = useState(1)
  /** Elementos por página */
  const [itemsPerPage] = useState(10)

  /**
   * Efecto para cargar los eventos al montar el componente.
   */
  useEffect(() => {
    fetchEventos()
  }, [])

  /**
   * Actualiza automáticamente los eventos expirados a estado "finalizado".
   * @param {Array} eventosData - Lista de eventos.
   * @returns {Promise<Array>} Lista de eventos actualizada.
   */
  const updateExpiredEvents = async (eventosData) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day for comparison

    const eventosToUpdate = eventosData.filter((evento) => {
      if (!evento.fecha || evento.estado === "finalizado") return false

      const eventoDate = new Date(evento.fecha)
      eventoDate.setHours(0, 0, 0, 0)

      // Si la fecha del evento es anterior a hoy y no está finalizado
      return eventoDate < today && evento.estado !== "finalizado"
    })

    if (eventosToUpdate.length === 0) return eventosData

    // console.log(`Actualizando ${eventosToUpdate.length} eventos expirados a estado 'finalizado'`)

    // Actualizar cada evento expirado
    const updatePromises = eventosToUpdate.map(async (evento) => {
      try {
        // Solo enviamos los campos necesarios en el formato correcto
        const eventoData = {
          nombre: evento.nombre,
          fecha: evento.fecha,
          lugar: evento.lugar,
          hora: evento.hora ? evento.hora.substring(0, 5) : "00:00",
          estado: "finalizado",
          tipo: evento.tipo,
          entidad_id: evento.entidad_id,
        }

        // console.log(`Actualizando evento ${evento.id} con datos:`, eventoData)

        const response = await api.put(`/eventos/${evento.id}`, eventoData)
        // console.log(`Evento ${evento.id} actualizado correctamente:`, response.data)

        return { ...evento, estado: "finalizado" }
      } catch (error) {
        // console.error(`Error al actualizar evento ${evento.id}:`, error)
        // Si hay error, marcamos localmente como finalizado pero no actualizamos en BD
        return { ...evento, estado: "finalizado", _updateFailed: true }
      }
    })

    const updatedEventos = await Promise.all(updatePromises)

    // Devolver el array de eventos actualizado
    return eventosData.map((evento) => {
      const updatedEvento = updatedEventos.find((updated) => updated.id === evento.id)
      return updatedEvento || evento
    })
  }

  /**
   * Obtiene los eventos desde la API y los procesa.
   * @async
   */
  const fetchEventos = async () => {
    try {
      setLoading(true)
      setError(null)
      // console.log("Intentando conectar a:", `${api.defaults.baseURL}/eventos`)

      const response = await api.get("/eventos")
      // console.log("Respuesta completa de eventos:", response)

      let eventosData = []

      if (response.data && response.data.eventos && Array.isArray(response.data.eventos)) {
        eventosData = response.data.eventos
        // console.log("Eventos cargados correctamente:", eventosData.length)
      } else if (response.data && Array.isArray(response.data)) {
        eventosData = response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        eventosData = response.data.data
      } else {
        // console.warn("Formato de respuesta inesperado para eventos:", response.data)
        setError("Formato de respuesta inesperado. Verifica la consola para más detalles.")
      }

      // Actualizar eventos expirados automáticamente
      eventosData = await updateExpiredEvents(eventosData)

      // Ordenar eventos alfabéticamente por nombre
      eventosData.sort((a, b) => a.nombre.localeCompare(b.nombre))
      setEventos(eventosData)
    } catch (error) {
      // console.error("Error al cargar eventos:", error)
      setError(`Error al cargar eventos: ${error.message}`)

      if (error.response) {
        // console.error("Respuesta del servidor:", error.response.status, error.response.data)
        setError(`Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      } else if (error.request) {
        // console.error("No se recibió respuesta del servidor")
        setError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.")
      } else {
        // console.error("Error de configuración:", error.message)
        setError(`Error de configuración: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Elimina un evento seleccionado.
   * @async
   */
  const handleDelete = async () => {
    if (!eventoToDelete) return

    try {
      await api.delete(`/eventos/${eventoToDelete}`)
      setEventos(eventos.filter((evento) => evento.id !== eventoToDelete))
      setShowDeleteModal(false)
      setEventoToDelete(null)
    } catch (error) {
      // console.error("Error al eliminar evento:", error)
    }
  }

  /**
   * Abre el modal de confirmación de borrado para un evento.
   * @param {number} id - ID del evento a eliminar.
   */
  const confirmDelete = (id) => {
    setEventoToDelete(id)
    setShowDeleteModal(true)
  }

  /**
   * Abre el modal de formulario para crear o editar un evento.
   * @param {Object|null} evento - Evento a editar (opcional).
   */
  const handleOpenFormModal = (evento = null) => {
    setCurrentEvento(evento)
    setShowFormModal(true)
  }

  /**
   * Cierra el modal de formulario de evento.
   * @param {boolean} shouldRefresh - Si debe refrescar la lista tras cerrar.
   */
  const handleCloseFormModal = (shouldRefresh = false) => {
    setShowFormModal(false)
    setCurrentEvento(null)
    if (shouldRefresh) {
      fetchEventos()
    }
  }

  /**
   * Filtra los eventos según los criterios de búsqueda y filtros seleccionados.
   * @type {Array}
   */
  const filteredEventos = eventos.filter((evento) => {
    const matchesSearch =
      evento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.lugar.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = tipoFilter === "" || evento.tipo === tipoFilter
    const matchesEstado = estadoFilter === "" || evento.estado === estadoFilter

    return matchesSearch && matchesTipo && matchesEstado
  })

  // Paginación
  /** Índice del último elemento de la página */
  const indexOfLastItem = currentPage * itemsPerPage
  /** Índice del primer elemento de la página */
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  /** Eventos a mostrar en la página actual */
  const currentEventos = filteredEventos.slice(indexOfFirstItem, indexOfLastItem)
  /** Total de páginas */
  const totalPages = Math.ceil(filteredEventos.length / itemsPerPage)

  /**
   * Cambia la página current de la paginación.
   * @param {number} pageNumber - Número de página a mostrar.
   */
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  /**
   * Formatea una fecha a formato DD/MM/YYYY.
   * @param {string} dateString - Fecha en formato ISO.
   * @returns {string} Fecha formateada.
   */
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  /**
   * Formatea una hora a formato HH:MM.
   * @param {string} timeString - Hora en formato HH:MM:SS.
   * @returns {string} Hora formateada.
   */
  const formatTime = (timeString) => {
    if (!timeString) return "-"
    return timeString.substring(0, 5)
  }

  // Renderizado de la interfaz y modales
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{t("events.title")}</h1>
        {isAdmin && (
          <button
            onClick={() => handleOpenFormModal()}
            className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            <Plus size={18} />
            {t("events.newEvent")}
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">
          <h3 className="font-semibold">{t("instrumentTypes.conexionError")}</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder={t("events.search")}
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
              <option value="">{t("events.allTypes")}</option>
              <option value="concierto">{t("events.concert")}</option>
              <option value="ensayo">{t("events.rehearsal")}</option>
              <option value="procesion">{t("events.procession")}</option>
              <option value="pasacalles">{t("events.parade")}</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
            >
              <option value="">{t("events.allStatuses")}</option>
              <option value="planificado">{t("events.planned")}</option>
              <option value="en progreso">{t("events.inProgress")}</option>
              <option value="finalizado">{t("events.finished")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de eventos */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">{t("common.loading")}</div>
          </div>
        ) : filteredEventos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Calendar size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm || tipoFilter || estadoFilter
                ? "No se encontraron eventos con los filtros aplicados."
                : t("events.noEvents")}
            </p>
            {isAdmin && (
              <button onClick={() => handleOpenFormModal()} className="mt-4 text-[#C0C0C0] hover:text-white underline">
                {t("events.addFirstEvent")}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("common.name")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("events.type")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("events.date")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("events.time")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("events.location")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("common.status")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {isAdmin ? t("common.actions") : ""}
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
                          <div className="flex items-center gap-2">
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
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          {isAdmin && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleOpenFormModal(evento)}
                                className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => confirmDelete(evento.id)}
                                className="p-1 text-gray-400 hover:text-red-400"
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
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredEventos.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
            <div className="text-sm text-gray-400">
              {t("common.showing")} {indexOfFirstItem + 1} {t("common.to")}{" "}
              {Math.min(indexOfLastItem, filteredEventos.length)} {t("common.of")} {filteredEventos.length} eventos
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
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">{t("events.confirmDelete")}</h3>
            <p className="text-gray-400 mb-6">{t("events.deleteConfirmText")}</p>
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

      {/* Modal de formulario de evento */}
      {showFormModal && <FormularioEvento evento={currentEvento} onClose={handleCloseFormModal} />}
    </div>
  )
}
