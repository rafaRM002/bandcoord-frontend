"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, User, Calendar, Reply, Archive } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"
import { useAuth } from "../../context/AuthContext"

export default function DetalleMensaje() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [mensaje, setMensaje] = useState(null)
  const [emisor, setEmisor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMensaje = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/mensajes/${id}`)

        // Normalizar la respuesta
        const mensajeData = response.data.data || response.data
        setMensaje(mensajeData)

        // Si el mensaje es recibido por el usuario actual, marcarlo como leído
        if (mensajeData.usuario_id_receptor === user.id) {
          try {
            await api.put(`/mensaje-usuarios/${id}/${user.id}`, {
              leido: true,
              estado: 1,
            })
          } catch (err) {
            console.error("Error al marcar como leído:", err)
          }
        }

        // Obtener datos del emisor
        if (mensajeData.usuario_id_emisor) {
          const emisorResponse = await api.get(`/usuarios/${mensajeData.usuario_id_emisor}`)
          setEmisor(emisorResponse.data.data || emisorResponse.data)
        }
      } catch (error) {
        console.error("Error al cargar el mensaje:", error)
        setError("No se pudo cargar el mensaje. Por favor, inténtalo de nuevo.")
        toast.error("Error al cargar el mensaje")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMensaje()
    }
  }, [id, user.id])

  const handleResponder = () => {
    navigate("/mensajes/nuevo", {
      state: {
        respuestaA: mensaje.id,
        asunto: `RE: ${mensaje.asunto}`,
        destinatario: mensaje.usuario_id_emisor,
        destinatarioNombre: emisor ? `${emisor.nombre} ${emisor.apellido1}` : `Usuario ${mensaje.usuario_id_emisor}`,
        destinatarioEmail: emisor ? emisor.email : "",
        soloLectura: true,
      },
    })
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-[#C0C0C0]">Cargando mensaje...</div>
        </div>
      </div>
    )
  }

  if (error || !mensaje) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/mensajes")}
            className="mr-4 p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-[#C0C0C0]">Error</h1>
        </div>
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md">
          {error || "No se pudo encontrar el mensaje solicitado."}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/mensajes")}
          className="mr-4 p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#C0C0C0] truncate">{mensaje.asunto}</h1>
      </div>

      <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
        {/* Cabecera del mensaje */}
        <div className="border-b border-gray-800 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-[#C0C0C0]">{mensaje.asunto}</h2>
              <div className="flex items-center mt-2 text-gray-400">
                <User size={16} className="mr-2" />
                <span>
                  {emisor
                    ? `${emisor.nombre} ${emisor.apellido1} (${emisor.email})`
                    : `Usuario ID: ${mensaje.usuario_id_emisor}`}
                </span>
              </div>
              <div className="flex items-center mt-1 text-gray-400">
                <Calendar size={16} className="mr-2" />
                <span>{formatDate(mensaje.created_at)}</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end mt-4 space-x-3">
              {mensaje.usuario_id_emisor !== user.id && (
                <button
                  onClick={handleResponder}
                  className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-3 py-2 rounded-md hover:bg-gray-900 transition-colors"
                >
                  <Reply size={16} />
                  Responder
                </button>
              )}

              <button
                onClick={() => {
                  // Implementar función para archivar
                  navigate("/mensajes")
                }}
                className="flex items-center gap-2 bg-gray-800 text-[#C0C0C0] px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <Archive size={16} />
                Archivar
              </button>
            </div>
          </div>
        </div>

        {/* Contenido del mensaje */}
        <div className="text-[#C0C0C0] whitespace-pre-wrap">{mensaje.contenido}</div>
      </div>
    </div>
  )
}
