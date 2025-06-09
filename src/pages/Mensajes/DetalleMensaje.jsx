/**
 * @file DetalleMensaje.jsx
 * @module pages/Mensajes/DetalleMensaje
 * @description Página de detalle de un mensaje privado. Permite ver el contenido, emisor, receptor, fecha y responder al mensaje. Marca el mensaje como leído si el usuario es el receptor. Muestra errores si no se encuentra el mensaje o hay problemas de carga.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, User, Calendar, Reply } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"
import { AuthContext } from "../../context/AuthContext"
import { useTranslation } from "../../hooks/useTranslation"

/**
 * Componente de detalle de mensaje privado.
 * Muestra el mensaje, emisor, receptor, fecha y permite responder.
 * Marca como leído si el usuario es el receptor.
 * @component
 * @returns {JSX.Element} Vista de detalle de mensaje.
 */
export default function DetalleMensaje() {
  /** ID del mensaje desde la URL */
  const { id } = useParams()
  /** Hook de navegación */
  const navigate = useNavigate()
  /** Usuario autenticado */
  const { user } = useContext(AuthContext)
  /** Hook de traducción */
  const { t } = useTranslation()

  /** Estado del mensaje */
  const [mensaje, setMensaje] = useState(null)
  /** Estado del emisor */
  const [emisor, setEmisor] = useState(null)
  /** Estado del receptor */
  const [receptor, setReceptor] = useState(null)
  /** Estado de carga */
  const [loading, setLoading] = useState(true)
  /** Mensaje de error */
  const [error, setError] = useState(null)

  /**
   * Efecto para cargar el mensaje y datos relacionados al montar o cambiar el id.
   */
  useEffect(() => {
    const fetchMensaje = async () => {
      try {
        setLoading(true)
        // Obtener el mensaje
        const response = await api.get(`/mensajes/${id}`)
        const mensajeData = response.data.data || response.data
        setMensaje(mensajeData)

        // Obtener la relación mensaje-usuario para encontrar el receptor
        const mensajeUsuarioResponse = await api.get(`/mensaje-usuarios?mensaje_id=${id}`)
        const mensajeUsuarioData = mensajeUsuarioResponse.data.data || mensajeUsuarioResponse.data

        // Obtener datos del emisor
        if (mensajeData.usuario_id_emisor) {
          const emisorResponse = await api.get(`/usuarios/${mensajeData.usuario_id_emisor}`)
          setEmisor(emisorResponse.data.data || emisorResponse.data)
        }

        // Obtener datos del receptor desde la tabla mensaje_usuario
        if (mensajeUsuarioData && mensajeUsuarioData.length > 0) {
          const receptorId = mensajeUsuarioData[0].usuario_id_receptor
          const receptorResponse = await api.get(`/usuarios/${receptorId}`)
          setReceptor(receptorResponse.data.data || receptorResponse.data)

          // Si el usuario actual es el receptor, marcar como leído
          if (receptorId === user.id || receptorId === Number(user.id)) {
            try {
              // console.log("Marcando mensaje como leído automáticamente:", {
              //   mensajeId: id,
              //   userId: user.id,
              //   url: `/mensaje-usuarios/${id}/${user.id}/`,
              // })

              // CORREGIDO: URL con barra final y payload solo con estado
              const response = await api.put(`/mensaje-usuarios/${id}/${user.id}/`, {
                estado: 1, // Solo enviamos el estado
              })

              // console.log("Respuesta de marcar como leído automáticamente:", response.data)
            } catch (err) {
              console.error("Error al marcar como leído:", err)
              console.error("Detalles del error:", err.response?.data)
            }
          }
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

  /**
   * Navega a la pantalla de respuesta al mensaje.
   */
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

  /**
   * Formatea una fecha a DD/MM/YYYY HH:mm.
   * @param {string} dateString - Fecha en formato ISO.
   * @returns {string} Fecha formateada.
   */
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  // Renderizado de estados de carga y error
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-[#C0C0C0]">{t("messages.loadingMessage")}</div>
        </div>
      </div>
    )
  }

  if (error || !mensaje) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/mensajes-usuarios")}
            className="mr-4 p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-[#C0C0C0]">{t("common.error")}</h1>
        </div>
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md">
          {error || t("messages.messageNotFound")}
        </div>
      </div>
    )
  }

  // Renderizado principal del mensaje
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/mensajes-usuarios")}
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
                  {t("messages.from")}:{" "}
                  {emisor
                    ? `${emisor.nombre} ${emisor.apellido1} (${emisor.email})`
                    : `Usuario ID: ${mensaje.usuario_id_emisor}`}
                </span>
              </div>
              <div className="flex items-center mt-1 text-gray-400">
                <User size={16} className="mr-2" />
                <span>
                  {t("messages.to")}:{" "}
                  {receptor
                    ? `${receptor.nombre} ${receptor.apellido1} (${receptor.email})`
                    : "Destinatario no encontrado"}
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
                  {t("messages.reply")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido del mensaje */}
        <div className="text-[#C0C0C0] whitespace-pre-wrap">{mensaje.contenido}</div>
      </div>
    </div>
  )
}
