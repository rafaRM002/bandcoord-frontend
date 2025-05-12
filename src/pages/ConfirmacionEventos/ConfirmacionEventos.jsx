"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import axios from "../../api/axios"
import { toast } from "react-toastify"

const ConfirmacionEventos = () => {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useContext(AuthContext)

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/evento-usuario")
        console.log("Respuesta de eventos pendientes:", response.data)

        // Manejar diferentes formatos de respuesta
        const eventosData = Array.isArray(response.data)
          ? response.data
          : response.data.eventos || response.data.data || []

        setEventos(eventosData)
        setError(null)
      } catch (err) {
        console.error("Error al cargar eventos pendientes:", err)
        setError("Error al cargar los eventos pendientes. Por favor, inténtelo de nuevo más tarde.")
        toast.error("Error al cargar los eventos pendientes")
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [])

  const confirmarAsistencia = async (eventoId, asistira) => {
    try {
      const response = await axios.put(`/evento-usuario/${eventoId}/${user.id}`, {
        confirmado: asistira,
      })

      console.log("Respuesta de confirmación:", response.data)

      // Actualizar la lista de eventos
      setEventos(eventos.filter((evento) => evento.id !== eventoId))

      toast.success(asistira ? "Has confirmado tu asistencia al evento" : "Has rechazado la asistencia al evento")
    } catch (err) {
      console.error("Error al confirmar asistencia:", err)
      toast.error("Error al confirmar la asistencia")
    }
  }

  if (loading) return <div className="container mx-auto p-4">Cargando eventos pendientes...</div>
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Confirmación de Eventos</h1>

      {eventos.length === 0 ? (
        <p>No tienes eventos pendientes de confirmación.</p>
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
                  onClick={() => confirmarAsistencia(evento.id, true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Asistiré
                </button>
                <button
                  onClick={() => confirmarAsistencia(evento.id, false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  No asistiré
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConfirmacionEventos
