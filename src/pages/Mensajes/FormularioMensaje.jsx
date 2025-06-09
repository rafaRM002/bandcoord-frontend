/**
 * @file FormularioMensaje.jsx
 * @module pages/Mensajes/FormularioMensaje
 * @description Formulario para enviar mensajes privados a uno o varios usuarios. Permite redactar, seleccionar destinatarios, responder mensajes y muestra mensajes de error y éxito. Solo usuarios autenticados pueden enviar mensajes.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Save, Users, MessageSquare } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"
import { useAuth } from "../../context/AuthContext"
import { useTranslation } from "../../hooks/useTranslation"

/**
 * Componente de formulario para enviar o responder mensajes privados.
 * Permite seleccionar destinatarios, redactar asunto y contenido, y gestionar el envío.
 * @component
 * @returns {JSX.Element} Formulario de mensaje.
 */
export default function FormularioMensaje() {
  /** Hook de navegación */
  const navigate = useNavigate()
  /** Hook de localización para obtener datos de navegación */
  const location = useLocation()
  /** Usuario autenticado */
  const { user } = useAuth()
  /** Hook de traducción */
  const { t } = useTranslation()

  /** Estado de carga de usuarios */
  const [loading, setLoading] = useState(true)
  /** Estado de guardado/envío */
  const [saving, setSaving] = useState(false)
  /** Mensaje de error */
  const [error, setError] = useState("")
  /** Lista de usuarios disponibles como destinatarios */
  const [usuarios, setUsuarios] = useState([])
  /** Indica si es una respuesta a un mensaje */
  const [esRespuesta, setEsRespuesta] = useState(false)

  /** Estado del formulario */
  const [formData, setFormData] = useState({
    asunto: "",
    contenido: "",
    receptores: [],
  })

  /**
   * Efecto para inicializar el formulario y cargar usuarios.
   * Si es respuesta, precarga el destinatario y asunto.
   */
  useEffect(() => {
    // Verificar si estamos respondiendo a un mensaje
    if (location.state && location.state.destinatario) {
      setEsRespuesta(true)
      setFormData({
        asunto: location.state.asunto || "",
        contenido: "",
        receptores: [Number.parseInt(location.state.destinatario)],
      })
    }

    /**
     * Carga la lista de usuarios disponibles como destinatarios.
     * @async
     */
    const fetchUsuarios = async () => {
      try {
        setLoading(true)
        const response = await api.get("/usuarios")
        // Filtrar para no incluir al usuario actual en la lista de receptores
        const usuariosData = Array.isArray(response.data)
          ? response.data.filter((u) => u.id !== user.id)
          : (response.data.data || []).filter((u) => u.id !== user.id)

        setUsuarios(usuariosData)
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        setError("Error al cargar la lista de usuarios. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [user, location.state])

  /**
   * Maneja el cambio en los campos de asunto y contenido.
   * @param {Object} e - Evento de cambio.
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * Maneja el cambio en los destinatarios seleccionados.
   * Si es respuesta, no permite modificar el receptor.
   * @param {Object} e - Evento de cambio.
   */
  const handleReceptorChange = (e) => {
    // Si es una respuesta, no permitir cambiar el receptor
    if (esRespuesta) return

    const { value, checked } = e.target

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        receptores: [...prev.receptores, Number.parseInt(value)],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        receptores: prev.receptores.filter((id) => id !== Number.parseInt(value)),
      }))
    }
  }

  /**
   * Envía el formulario para crear y enviar el mensaje.
   * Crea el mensaje y las relaciones mensaje-usuario para cada receptor.
   * @async
   * @param {Object} e - Evento de envío.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      // Crear el mensaje
      const mensajeResponse = await api.post("/mensajes", {
        asunto: formData.asunto,
        contenido: formData.contenido,
        usuario_id_emisor: user.id, // Asegurarse de que el emisor sea el usuario actual
        respuesta_a: location.state?.respuestaA || null,
      })

      const mensajeId = mensajeResponse.data.id

      // Crear las relaciones mensaje-usuario para cada receptor
      await Promise.all(
        formData.receptores.map((usuarioId) =>
          api.post("/mensaje-usuarios", {
            mensaje_id: mensajeId,
            usuario_id_receptor: usuarioId,
            leido: false,
            estado: 0,
          }),
        ),
      )

      toast.success("Mensaje enviado correctamente")
      navigate("/mensajes")
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      setError("Error al enviar el mensaje. Por favor, verifica la información e inténtalo de nuevo.")
      toast.error("Error al enviar el mensaje")
    } finally {
      setSaving(false)
    }
  }

  // Renderizado de estado de carga
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-[#C0C0C0]">{t("common.loading")}</div>
        </div>
      </div>
    )
  }

  // Renderizado principal del formulario
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/mensajes")}
          className="mr-4 p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#C0C0C0]">
          {esRespuesta ? t("messages.replyMessage") : t("messages.newMessage")}
        </h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">{error}</div>
      )}

      <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          {/* Asunto */}
          <div className="space-y-2 mb-6">
            <label htmlFor="asunto" className="block text-[#C0C0C0] text-sm font-medium">
              {t("messages.subject")} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <MessageSquare size={18} />
              </div>
              <input
                id="asunto"
                name="asunto"
                value={formData.asunto}
                onChange={handleChange}
                required
                className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              />
            </div>
          </div>

          {/* Contenido */}
          <div className="space-y-2 mb-6">
            <label htmlFor="contenido" className="block text-[#C0C0C0] text-sm font-medium">
              {t("messages.content")} *
            </label>
            <textarea
              id="contenido"
              name="contenido"
              value={formData.contenido}
              onChange={handleChange}
              required
              rows={6}
              className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
            />
          </div>

          {/* Receptores */}
          <div className="space-y-2 mb-6">
            <label className="block text-[#C0C0C0] text-sm font-medium flex items-center">
              <Users size={18} className="mr-2" />
              {t("messages.recipients")} *
            </label>

            {esRespuesta && location.state?.destinatarioNombre ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-md p-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mr-2 h-4 w-4 rounded border-gray-700 bg-gray-800 text-[#C0C0C0]"
                  />
                  <label className="text-[#C0C0C0] text-sm">
                    {location.state.destinatarioNombre}
                    {location.state.destinatarioEmail && ` (${location.state.destinatarioEmail})`}
                  </label>
                </div>
                <p className="text-gray-400 text-xs mt-2">{t("messages.replyRecipientInfo")}</p>
              </div>
            ) : (
              <div className="bg-gray-900/50 border border-gray-800 rounded-md p-4 max-h-60 overflow-y-auto">
                {usuarios.length === 0 ? (
                  <p className="text-gray-400">{t("messages.noUsersAvailable")}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {usuarios.map((usuario) => (
                      <div key={usuario.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`usuario-${usuario.id}`}
                          value={usuario.id}
                          checked={formData.receptores.includes(usuario.id)}
                          onChange={handleReceptorChange}
                          className="mr-2 h-4 w-4 rounded border-gray-700 bg-gray-800 text-[#C0C0C0] focus:ring-[#C0C0C0]"
                        />
                        <label htmlFor={`usuario-${usuario.id}`} className="text-[#C0C0C0] text-sm">
                          {usuario.nombre} {usuario.apellido1}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formData.receptores.length === 0 && !esRespuesta && (
              <p className="text-red-400 text-xs">{t("messages.formMessage.selectRecipients")}</p>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/mensajes")}
              className="mr-4 px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving || formData.receptores.length === 0}
              className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {saving ? t("messages.sending") : t("messages.send")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
