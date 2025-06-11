/**
 * @file FormularioEvento.jsx
 * @module pages/Eventos/FormularioEvento
 * @description Componente de formulario para crear o editar eventos. Permite introducir nombre, tipo, fecha, hora, lugar, estado y entidad asociada. Muestra errores y feedback de guardado. Solo accesible para administradores.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState, useEffect } from "react"
import { Save, MapPin, Calendar, Clock, Info, X } from "lucide-react"
import api from "../../api/axios"
import { useTranslation } from "../../hooks/useTranslation"

/**
 * Formulario para crear o editar un evento.
 * @component
 * @param {Object} props
 * @param {Object|null} props.evento - Evento a editar (si es null, es creación).
 * @param {Function} props.onClose - Función para cerrar el modal, recibe true si se guardó correctamente.
 * @returns {JSX.Element} Modal de formulario de evento.
 */
export default function FormularioEvento({ evento = null, onClose }) {
  /** Indica si es edición o creación */
  const isEditing = !!evento
  /** Hook de traducción */
  const { t } = useTranslation()

  /** Estado de carga de datos */
  const [loading, setLoading] = useState(false)
  /** Estado de guardado */
  const [saving, setSaving] = useState(false)
  /** Mensaje de error */
  const [error, setError] = useState("")
  /** Lista de entidades disponibles */
  const [entidades, setEntidades] = useState([])

  /** Estado del formulario */
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "concierto",
    fecha: "",
    hora: "",
    lugar: "",
    estado: "planificado",
    entidad_id: "",
  })

  /**
   * Carga entidades y, si es edición, los datos del evento.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const entidadesRes = await api.get("/entidades")
        if (entidadesRes.data && Array.isArray(entidadesRes.data)) {
          setEntidades(entidadesRes.data)
        } else if (entidadesRes.data && entidadesRes.data.entidades && Array.isArray(entidadesRes.data.entidades)) {
          setEntidades(entidadesRes.data.entidades)
        }

        if (isEditing) {
          setFormData({
            nombre: evento.nombre || "",
            tipo: evento.tipo || "concierto",
            fecha: evento.fecha || "",
            hora: evento.hora || "",
            lugar: evento.lugar || "",
            estado: evento.estado || "planificado",
            entidad_id: evento.entidad_id || "",
          })
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("Error al cargar los datos. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isEditing, evento])

  /**
   * Maneja el cambio en los campos del formulario.
   * @param {Object} e - Evento de cambio.
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * Envía el formulario para crear o editar el evento.
   * @async
   * @param {Object} e - Evento de envío.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      // Formatear la hora para que coincida con el formato H:i esperado por el backend
      const formDataToSend = {
        ...formData,
        hora: formData.hora ? formData.hora.substring(0, 5) : "", // Convertir de HH:MM:SS a HH:MM
      }

      // console.log("Enviando datos:", formDataToSend)

      if (isEditing) {
        const response = await api.put(`/eventos/${evento.id}`, formDataToSend)
        // console.log("Respuesta de actualización:", response)
      } else {
        const response = await api.post("/eventos", formDataToSend)
        // console.log("Respuesta de creación:", response)
      }

      onClose(true)
    } catch (error) {
      console.error("Error al guardar evento:", error)

      if (error.response && error.response.data) {
        // Extraer mensajes de error más legibles
        let errorMessage = "Error al guardar el evento."

        if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.errors) {
          const errors = Object.values(error.response.data.errors).flat()
          errorMessage = errors.join(", ")
        }

        setError(errorMessage)
      } else {
        setError("Error al guardar los datos. Por favor, verifica la información e inténtalo de nuevo.")
      }
      setSaving(false)
    }
  }

  // Renderizado de la interfaz y modal
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-3xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">{t("common.loading")}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#C0C0C0]">
            {isEditing ? t("events.editEvent") : t("events.newEvent")}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del evento */}
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-[#C0C0C0] text-sm font-medium">
                {t("events.name")} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Info size={18} />
                </div>
                <input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Tipo de evento */}
            <div className="space-y-2">
              <label htmlFor="tipo" className="block text-[#C0C0C0] text-sm font-medium">
                {t("events.type")} *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="concierto">{t("events.concert")}</option>
                <option value="ensayo">{t("events.rehearsal")}</option>
                <option value="procesion">{t("events.procession")}</option>
                <option value="pasacalles">{t("events.parade")}</option>
              </select>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <label htmlFor="fecha" className="block text-[#C0C0C0] text-sm font-medium">
                {t("events.date")} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Calendar size={18} />
                </div>
                <input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <label htmlFor="hora" className="block text-[#C0C0C0] text-sm font-medium">
                {t("events.time")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Clock size={18} />
                </div>
                <input
                  id="hora"
                  name="hora"
                  type="time"
                  value={formData.hora}
                  onChange={handleChange}
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Lugar */}
            <div className="space-y-2">
              <label htmlFor="lugar" className="block text-[#C0C0C0] text-sm font-medium">
                {t("events.location")} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <MapPin size={18} />
                </div>
                <input
                  id="lugar"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <label htmlFor="estado" className="block text-[#C0C0C0] text-sm font-medium">
                {t("events.status")} *
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="planificado">{t("events.planned")}</option>
                <option value="en progreso">{t("events.inProgress")}</option>
                <option value="finalizado">{t("events.finished")}</option>
              </select>
            </div>

            {/* Entidad */}
            <div className="space-y-2">
              <label htmlFor="entidad_id" className="block text-[#C0C0C0] text-sm font-medium">
                {t("events.entity")}
              </label>
              <select
                id="entidad_id"
                name="entidad_id"
                value={formData.entidad_id}
                onChange={handleChange}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="">{t("events.none")}</option>
                {entidades.map((entidad) => (
                  <option key={entidad.id} value={entidad.id}>
                    {entidad.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="mr-4 px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {saving ? t("events.saving") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
