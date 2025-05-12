"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { Check, X, Calendar, MapPin, Clock, Info } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"

export default function ConfirmacionEventos() {
  const [eventosUsuario, setEventosUsuario] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useContext(AuthContext)
  const [eventos, setEventos] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!user || !user.id) {
          setError("Debes iniciar sesión para ver tus eventos pendientes")
          return
        }

        // Obtener eventos-usuario del usuario actual que no estén confirmados
        const eventosUsuarioRes = await api.get(`/evento-usuario?usuario_id=${user.id}&confirmado=0`)
        console.log("Respuesta de eventos pendientes:", eventosUsuarioRes)

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

      // Actualizar la lista de eventos pendientes
      setEventosUsuario(eventosUsuario.filter((item) => item.evento_id !== eventoId))

      toast.success(confirmado ? "Has confirmado tu asistencia al evento" : "Has rechazado la asistencia al evento")
    } catch (error) {
      console.error("Error al confirmar asistencia:", error)
      toast.error("Error al confirmar la asistencia")
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

      {eventosUsuario.length === 0 ? (
        <div className="bg-black/30 border border-gray-800 rounded-lg p-8 text-center">
          <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No tienes eventos pendientes de confirmación.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventosUsuario.map((item) => {
            const evento = getEventoDetalles(item.evento_id)
            return (
              <div
                key={`${item.evento_id}-${item.usuario_id}`}
                className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden"
              >
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-[#C0C0C0] mb-2">{evento.nombre || "Evento"}</h2>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-400">
                      <Calendar size={16} className="mr-2 flex-shrink-0" />
                      <span>{formatDate(evento.fecha)}</span>
                    </div>

                    {evento.hora && (
                      <div className="flex items-center text-gray-400">
                        <Clock size={16} className="mr-2 flex-shrink-0" />
                        <span>{formatTime(evento.hora)}</span>
                      </div>
                    )}

                    {evento.lugar && (
                      <div className="flex items-center text-gray-400">
                        <MapPin size={16} className="mr-2 flex-shrink-0" />
                        <span>{evento.lugar}</span>
                      </div>
                    )}

                    {evento.tipo && (
                      <div className="flex items-center text-gray-400">
                        <Info size={16} className="mr-2 flex-shrink-0" />
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
                      </div>
                    )}
                  </div>

                  {evento.descripcion && <p className="text-gray-400 mb-4">{evento.descripcion}</p>}

                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => confirmarAsistencia(item.evento_id, true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-900/30 border border-green-800 text-green-400 px-4 py-2 rounded-md hover:bg-green-900/50 transition-colors"
                    >
                      <Check size={18} />
                      Asistiré
                    </button>
                    <button
                      onClick={() => confirmarAsistencia(item.evento_id, false)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-900/30 border border-red-800 text-red-400 px-4 py-2 rounded-md hover:bg-red-900/50 transition-colors"
                    >
                      <X size={18} />
                      No asistiré
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
