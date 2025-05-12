"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import axios from "../../api/axios"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"

const MensajesUsuario = () => {
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useContext(AuthContext)

  useEffect(() => {
    const fetchMensajesUsuario = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/mensaje-usuarios`)
        console.log("Respuesta de mensajes del usuario:", response.data)

        // Manejar diferentes formatos de respuesta
        const mensajesData = Array.isArray(response.data)
          ? response.data
          : response.data.mensajes || response.data.data || []

        setMensajes(mensajesData)
        setError(null)
      } catch (err) {
        console.error("Error al cargar mensajes del usuario:", err)
        setError("Error al cargar tus mensajes. Por favor, inténtelo de nuevo más tarde.")
        toast.error("Error al cargar tus mensajes")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.id) {
      fetchMensajesUsuario()
    }
  }, [user])

  const marcarComoLeido = async (mensajeId) => {
    try {
      await axios.put(`/mensaje-usuarios/${mensajeId}/${user.id}`, {
        leido: true,
      })

      // Actualizar el estado del mensaje en la lista
      setMensajes(mensajes.map((mensaje) => (mensaje.id === mensajeId ? { ...mensaje, leido: true } : mensaje)))

      toast.success("Mensaje marcado como leído")
    } catch (err) {
      console.error("Error al marcar mensaje como leído:", err)
      toast.error("Error al actualizar el estado del mensaje")
    }
  }

  if (loading) return <div className="container mx-auto p-4">Cargando tus mensajes...</div>
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mis Mensajes</h1>

      <div className="mb-4">
        <Link to="/mensajes/nuevo" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Nuevo Mensaje
        </Link>
      </div>

      {mensajes.length === 0 ? (
        <p>No tienes mensajes.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {mensajes.map((mensaje) => (
            <div key={mensaje.id} className={`border rounded-lg p-4 shadow-md ${!mensaje.leido ? "bg-blue-50" : ""}`}>
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{mensaje.asunto}</h2>
                <span className="text-sm text-gray-500">
                  {new Date(mensaje.fecha_envio || mensaje.created_at).toLocaleDateString("es-ES")}
                </span>
              </div>

              <p className="text-gray-600 mb-2">
                De: {mensaje.remitente?.nombre || mensaje.nombre_remitente || "Desconocido"}
              </p>

              <div className="my-3 border-t pt-3">
                <p>{mensaje.contenido}</p>
              </div>

              {!mensaje.leido && (
                <button
                  onClick={() => marcarComoLeido(mensaje.id)}
                  className="mt-2 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                >
                  Marcar como leído
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MensajesUsuario
