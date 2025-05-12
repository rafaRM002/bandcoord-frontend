"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import api from "../../api/axios"

export default function Calendario() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [eventosDelDia, setEventosDelDia] = useState([])

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true)
        const response = await api.get("/eventos")

        // Check if response.data is an array or if it has a data property
        const eventosData = Array.isArray(response.data) ? response.data : response.data.data || []
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
    if (selectedDate) {
      const fechaSeleccionada = selectedDate.toISOString().split("T")[0]
      const eventosEnFecha = eventos.filter((evento) => evento.fecha === fechaSeleccionada)
      setEventosDelDia(eventosEnFecha)
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

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Días vacíos al inicio para alinear con el día de la semana correcto
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 sm:h-10 md:h-12 lg:h-16"></div>)
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split("T")[0]
      const hasEvents = eventos.some((evento) => evento.fecha === dateString)

      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-8 sm:h-10 md:h-12 lg:h-16 p-1 border border-gray-800 hover:bg-gray-900/30 cursor-pointer transition-colors relative ${
            isSelected ? "bg-gray-800/50 border-[#C0C0C0]" : ""
          }`}
        >
          <div className="text-xs sm:text-sm text-[#C0C0C0]">{day}</div>
          {hasEvents && <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#C0C0C0]"></div>}
        </div>,
      )
    }

    return days
  }

  //const formatDate = (dateString) => {
  //const options = { day: "2-digit", month: "2-digit", year: "numeric" }
  //return new Date(dateString).toLocaleDateString("es-ES", options)
  //}

  const formatTime = (timeString) => {
    if (!timeString) return "-"
    return timeString.substring(0, 5) // Extraer solo HH:MM
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
      <div className="flex justify-between items-center mb-6">
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
          <div className="flex items-center mb-4">
            <CalendarIcon size={20} className="text-[#C0C0C0] mr-2" />
            <h2 className="text-lg font-semibold text-[#C0C0C0]">
              {selectedDate
                ? `Eventos del ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`
                : "Selecciona una fecha"}
            </h2>
          </div>

          {selectedDate ? (
            eventosDelDia.length > 0 ? (
              <div className="space-y-4">
                {eventosDelDia.map((evento) => (
                  <div key={evento.id} className="bg-gray-900/30 border border-gray-800 rounded-lg p-3">
                    <h3 className="text-[#C0C0C0] font-medium">{evento.nombre}</h3>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Tipo:</span>
                        <span className="ml-2 text-[#C0C0C0]">
                          {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Hora:</span>
                        <span className="ml-2 text-[#C0C0C0]">{formatTime(evento.hora)}</span>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-gray-400">Lugar:</span>
                        <span className="ml-2 text-[#C0C0C0]">{evento.lugar}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <p>No hay eventos programados para esta fecha</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p>Selecciona una fecha para ver los eventos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
