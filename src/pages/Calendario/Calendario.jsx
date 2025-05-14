"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, MapPin, Music, X, AlertTriangle, Check } from "lucide-react"
import api from "../../api/axios"

export default function Calendario() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [eventosDelDia, setEventosDelDia] = useState([])

  // Estado para la paginación de eventos del día
  const [currentEventPage, setCurrentEventPage] = useState(1)
  const eventsPerPage = 5

  // Estado para el modal de detalles del evento
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Estado para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Estado para notificaciones
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true)
        const response = await api.get("/eventos")

        // Acceder correctamente a los eventos en la estructura de respuesta
        const eventosData = response.data?.eventos || response.data?.data?.eventos || []
        console.log("Eventos cargados:", eventosData)
        setEventos(eventosData)
      } catch (error) {
        console.error("Error al cargar eventos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [])

  useEffect(() => {
    if (selectedDate && eventos.length > 0) {
      // Formatear la fecha seleccionada a YYYY-MM-DD para comparar
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      const fechaFormateada = `${year}-${month}-${day}`

      console.log("Fecha seleccionada formateada:", fechaFormateada)

      // Filtrar eventos que coincidan con la fecha seleccionada
      const eventosEnFecha = eventos.filter((evento) => {
        // Extraer solo la parte de la fecha (YYYY-MM-DD) del evento
        const fechaEvento = evento.fecha.split("T")[0]
        console.log(`Comparando: ${fechaEvento} con ${fechaFormateada}`)
        return fechaEvento === fechaFormateada
      })

      console.log("Eventos encontrados para la fecha:", eventosEnFecha)
      setEventosDelDia(eventosEnFecha)
      // Resetear la página actual cuando se selecciona una nueva fecha
      setCurrentEventPage(1)
    } else {
      setEventosDelDia([])
    }
  }, [selectedDate, eventos])

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const prevMonth = new Date(prev)
      prevMonth.setMonth(prev.getMonth() - 1)
      return prevMonth
    })
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const nextMonth = new Date(prev)
      nextMonth.setMonth(prev.getMonth() + 1)
      return nextMonth
    })
    setSelectedDate(null)
  }

  const handleDateClick = (day) => {
    if (day) {
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      setSelectedDate(clickedDate)
    }
  }

  const getEventosForDay = (day) => {
    // Formatear la fecha a YYYY-MM-DD para comparar
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const dayStr = String(day).padStart(2, "0")
    const fechaFormateada = `${year}-${month}-${dayStr}`

    // Filtrar eventos que coincidan con la fecha
    return eventos.filter((evento) => {
      // Extraer solo la parte de la fecha (YYYY-MM-DD) del evento
      const fechaEvento = evento.fecha.split("T")[0]
      return fechaEvento === fechaFormateada
    })
  }

  // Paginación para eventos del día
  const indexOfLastEvent = currentEventPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = eventosDelDia.slice(indexOfFirstEvent, indexOfLastEvent)
  const totalEventPages = Math.ceil(eventosDelDia.length / eventsPerPage)

  const handleNextEventPage = () => {
    if (currentEventPage < totalEventPages) {
      setCurrentEventPage(currentEventPage + 1)
    }
  }

  const handlePrevEventPage = () => {
    if (currentEventPage > 1) {
      setCurrentEventPage(currentEventPage - 1)
    }
  }

  // Función para abrir el modal de detalles del evento
  const handleOpenEventModal = (evento) => {
    setSelectedEvent(evento)
    setShowEventModal(true)
  }

  // Función para cerrar el modal de detalles del evento
  const handleCloseEventModal = () => {
    setShowEventModal(false)
    setSelectedEvent(null)
    setShowDeleteConfirm(false)
  }

  // Función para mostrar la confirmación de eliminación
  const handleShowDeleteConfirm = () => {
    setShowDeleteConfirm(true)
  }

  // Función para eliminar un evento
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return

    try {
      await api.delete(`/eventos/${selectedEvent.id}`)

      // Actualizar la lista de eventos eliminando el evento borrado
      const updatedEventos = eventos.filter((e) => e.id !== selectedEvent.id)
      setEventos(updatedEventos)

      // Actualizar la lista de eventos del día
      const updatedEventosDelDia = eventosDelDia.filter((e) => e.id !== selectedEvent.id)
      setEventosDelDia(updatedEventosDelDia)

      // Mostrar notificación de éxito
      setNotification({
        show: true,
        message: "Evento eliminado correctamente",
        type: "success",
      })

      // Cerrar el modal
      handleCloseEventModal()

      // Ocultar la notificación después de 3 segundos
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" })
      }, 3000)
    } catch (error) {
      console.error("Error al eliminar el evento:", error)

      // Mostrar notificación de error
      setNotification({
        show: true,
        message: "Error al eliminar el evento",
        type: "error",
      })

      // Ocultar la notificación después de 3 segundos
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" })
      }, 3000)
    }
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Días vacíos al inicio para alinear con el día de la semana correcto
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 sm:h-28 md:h-32 lg:h-36"></div>)
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const eventosDelDia = getEventosForDay(day)
      const hasEvents = eventosDelDia.length > 0

      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-24 sm:h-28 md:h-32 lg:h-36 p-1 border border-gray-800 hover:bg-gray-900/30 cursor-pointer transition-colors relative overflow-hidden ${
            isSelected ? "bg-gray-800/50 border-[#C0C0C0]" : ""
          }`}
        >
          <div className="text-xs sm:text-sm text-[#C0C0C0] font-semibold mb-1">{day}</div>
          {hasEvents && (
            <div className="overflow-y-auto max-h-[calc(100%-20px)] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {eventosDelDia.slice(0, 3).map((evento, index) => (
                <div
                  key={index}
                  className={`text-[9px] sm:text-[10px] p-1 mb-1 rounded-full truncate ${
                    getTipoColor(evento.tipo).bg
                  } ${getTipoColor(evento.tipo).text} ${getTipoColor(evento.tipo).border} font-medium`}
                  title={`${evento.nombre} - ${evento.hora ? formatTime(evento.hora) : "Sin hora"} - ${
                    evento.lugar || "Sin lugar"
                  }`}
                >
                  {evento.nombre}
                </div>
              ))}
              {eventosDelDia.length > 3 && (
                <div className="text-[9px] sm:text-[10px] text-gray-400 text-center">
                  +{eventosDelDia.length - 3} más
                </div>
              )}
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  const formatTime = (timeString) => {
    if (!timeString) return "-"
    return timeString.substring(0, 5) // Extraer solo HH:MM
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"

    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    const fechaPartes = dateString.split("T")[0].split("-")

    // Crear una fecha con los componentes
    const fecha = new Date(
      Number.parseInt(fechaPartes[0]),
      Number.parseInt(fechaPartes[1]) - 1,
      Number.parseInt(fechaPartes[2]),
    )

    // Formatear la fecha
    return fecha.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTipoColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case "ensayo":
        return { bg: "bg-blue-900/30", text: "text-blue-400", border: "border border-blue-800" }
      case "concierto":
        return { bg: "bg-purple-900/30", text: "text-purple-400", border: "border border-purple-800" }
      case "procesion":
        return { bg: "bg-green-900/30", text: "text-green-400", border: "border border-green-800" }
      case "pasacalles":
        return { bg: "bg-yellow-900/30", text: "text-yellow-400", border: "border border-yellow-800" }
      default:
        return { bg: "bg-gray-900/30", text: "text-gray-400", border: "border border-gray-800" }
    }
  }

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notificación */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center ${
            notification.type === "success" ? "bg-green-900/80 text-green-100" : "bg-red-900/80 text-red-100"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="mr-2 h-5 w-5" />
          ) : (
            <AlertTriangle className="mr-2 h-5 w-5" />
          )}
          <p>{notification.message}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Calendario de Eventos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-black/30 border border-gray-800 rounded-lg p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-[#C0C0C0]">Cargando eventos...</div>
            </div>
          ) : (
            <>
              {/* Cabecera del calendario */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold text-[#C0C0C0]">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map((day) => (
                  <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
            </>
          )}
        </div>

        {/* Eventos del día seleccionado */}
        <div className="bg-black/30 border border-gray-800 rounded-lg p-4">
          {/* Leyenda de tipos de eventos */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <div className="px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800">
              <span className="text-xs">Ensayo</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-400 border border-purple-800">
              <span className="text-xs">Concierto</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-800">
              <span className="text-xs">Procesión</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-800">
              <span className="text-xs">Pasacalles</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CalendarIcon size={20} className="text-[#C0C0C0] mr-2" />
              <h2 className="text-lg font-semibold text-[#C0C0C0]">
                {selectedDate
                  ? `Eventos del ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`
                  : "Selecciona una fecha"}
              </h2>
            </div>

            {/* Contador de eventos */}
            {eventosDelDia.length > eventsPerPage && (
              <div className="text-xs text-gray-400">
                {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, eventosDelDia.length)} de {eventosDelDia.length}
              </div>
            )}
          </div>

          {selectedDate ? (
            eventosDelDia.length > 0 ? (
              <>
                <div className="space-y-4">
                  {currentEvents.map((evento) => (
                    <div
                      key={evento.id}
                      className="bg-gray-900/30 border border-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-800/30 transition-colors"
                      onClick={() => handleOpenEventModal(evento)}
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-[#C0C0C0] font-medium">{evento.nombre}</h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(evento.tipo).bg} ${
                            getTipoColor(evento.tipo).text
                          } ${getTipoColor(evento.tipo).border}`}
                        >
                          {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-sm">
                          <Clock size={16} className="text-gray-400 mr-2" />
                          <span className="text-[#C0C0C0]">{formatTime(evento.hora) || "Sin hora especificada"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin size={16} className="text-gray-400 mr-2" />
                          <span className="text-[#C0C0C0]">{evento.lugar || "Sin ubicación especificada"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controles de paginación */}
                {eventosDelDia.length > eventsPerPage && (
                  <div className="flex justify-center items-center mt-4 space-x-2">
                    <button
                      onClick={handlePrevEventPage}
                      disabled={currentEventPage === 1}
                      className={`p-1 rounded-md ${
                        currentEventPage === 1
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-400 hover:text-[#C0C0C0] hover:bg-gray-900/50"
                      }`}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Indicador de página */}
                    <div className="flex space-x-1">
                      {Array.from({ length: totalEventPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentEventPage(i + 1)}
                          className={`w-6 h-6 flex items-center justify-center rounded-md text-xs ${
                            currentEventPage === i + 1
                              ? "bg-black border border-[#C0C0C0] text-[#C0C0C0]"
                              : "bg-gray-900/50 text-gray-400 hover:bg-gray-800"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleNextEventPage}
                      disabled={currentEventPage === totalEventPages}
                      className={`p-1 rounded-md ${
                        currentEventPage === totalEventPages
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-400 hover:text-[#C0C0C0] hover:bg-gray-900/50"
                      }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Music size={32} className="mb-2 text-gray-600" />
                <p>No hay eventos programados para esta fecha</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <CalendarIcon size={32} className="mb-2 text-gray-600" />
              <p>Selecciona una fecha para ver los eventos</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del evento */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-lg overflow-hidden">
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-[#C0C0C0]">Detalles del evento</h3>
              <button
                onClick={handleCloseEventModal}
                className="text-gray-400 hover:text-[#C0C0C0] rounded-full p-1 hover:bg-gray-800/50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-[#C0C0C0]">{selectedEvent.nombre}</h2>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(selectedEvent.tipo).bg} ${
                    getTipoColor(selectedEvent.tipo).text
                  } ${getTipoColor(selectedEvent.tipo).border}`}
                >
                  {selectedEvent.tipo.charAt(0).toUpperCase() + selectedEvent.tipo.slice(1)}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <CalendarIcon size={18} className="text-gray-400 mr-3" />
                  <span className="text-[#C0C0C0]">{formatDate(selectedEvent.fecha)}</span>
                </div>

                <div className="flex items-center">
                  <Clock size={18} className="text-gray-400 mr-3" />
                  <span className="text-[#C0C0C0]">{formatTime(selectedEvent.hora) || "Sin hora especificada"}</span>
                </div>

                <div className="flex items-center">
                  <MapPin size={18} className="text-gray-400 mr-3" />
                  <span className="text-[#C0C0C0]">{selectedEvent.lugar || "Sin ubicación especificada"}</span>
                </div>

                {selectedEvent.estado && (
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-gray-400 mr-3"></div>
                    <span className="text-[#C0C0C0] capitalize">{selectedEvent.estado}</span>
                  </div>
                )}
              </div>

              {selectedEvent.descripcion && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Descripción</h4>
                  <p className="text-[#C0C0C0] bg-black/30 p-3 rounded-md">{selectedEvent.descripcion}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="mt-6">
                {!showDeleteConfirm ? (
                  <button
                    onClick={handleShowDeleteConfirm}
                    className="w-full py-2 bg-red-900/50 hover:bg-red-900/80 text-red-100 rounded-md transition-colors"
                  >
                    Cancelar evento
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-red-400 text-sm">
                      ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-[#C0C0C0] rounded-md transition-colors"
                      >
                        No, mantener
                      </button>
                      <button
                        onClick={handleDeleteEvent}
                        className="flex-1 py-2 bg-red-900/80 hover:bg-red-800 text-white rounded-md transition-colors"
                      >
                        Sí, eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
