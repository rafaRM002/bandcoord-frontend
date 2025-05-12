"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, MapPin, Calendar, Clock, Info } from "lucide-react"
import api from "../../api/axios"

export default function FormularioEvento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [entidades, setEntidades] = useState([])

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "concierto",
    fecha: "",
    hora: "",
    lugar: "",
    descripcion: "",
    estado: "planificado",
    entidad_id: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar entidades para el selector
        const entidadesRes = await api.get("/entidades")
        if (entidadesRes.data && Array.isArray(entidadesRes.data)) {
          setEntidades(entidadesRes.data)
        } else if (entidadesRes.data && entidadesRes.data.entidades && Array.isArray(entidadesRes.data.entidades)) {
          setEntidades(entidadesRes.data.entidades)
        }

        // Si estamos editando, cargar los datos del evento
        if (isEditing) {
          setLoading(true)
          const response = await api.get(`/eventos/${id}`)
          console.log("Respuesta del evento:", response)

          let evento = null
          if (response.data && response.data.id) {
            evento = response.data
          } else if (response.data && response.data.evento) {
            evento = response.data.evento
          }

          if (evento) {
            setFormData({
              nombre: evento.nombre,
              tipo: evento.tipo,
              fecha: evento.fecha,
              hora: evento.hora || "",
              lugar: evento.lugar,
              descripcion: evento.descripcion || "",
              estado: evento.estado || "planificado",
              entidad_id: evento.entidad_id || "",
            })
          } else {
            setError("No se pudo cargar la información del evento.")
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("Error al cargar los datos. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      console.log("Enviando datos:", formData)

      if (isEditing) {
        const response = await api.put(`/eventos/${id}`, formData)
        console.log("Respuesta de actualización:", response)
      } else {
        const response = await api.post("/eventos", formData)
        console.log("Respuesta de creación:", response)
      }

      navigate("/admin/eventos")
    } catch (error) {
      console.error("Error al guardar evento:", error)

      if (error.response) {
        console.error("Respuesta del servidor:", error.response.status, error.response.data)
        setError(`Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      } else {
        setError("Error al guardar los datos. Por favor, verifica la información e inténtalo de nuevo.")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-[#C0C0C0]">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/admin/eventos")}
          className="mr-4 p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{isEditing ? "Editar Evento" : "Nuevo Evento"}</h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">{error}</div>
      )}

      <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del evento */}
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-[#C0C0C0] text-sm font-medium">
                Nombre del evento *
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
                Tipo de evento *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="concierto">Concierto</option>
                <option value="ensayo">Ensayo</option>
                <option value="procesion">Procesión</option>
                <option value="pasacalles">Pasacalles</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <label htmlFor="fecha" className="block text-[#C0C0C0] text-sm font-medium">
                Fecha *
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
                Hora
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
                Lugar *
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
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="planificado">Planificado</option>
                <option value="en progreso">En progreso</option>
                <option value="finalizado">Finalizado</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Entidad */}
            <div className="space-y-2">
              <label htmlFor="entidad_id" className="block text-[#C0C0C0] text-sm font-medium">
                Entidad
              </label>
              <select
                id="entidad_id"
                name="entidad_id"
                value={formData.entidad_id}
                onChange={handleChange}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="">Ninguna</option>
                {entidades.map((entidad) => (
                  <option key={entidad.id} value={entidad.id}>
                    {entidad.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="mt-6 space-y-2">
            <label htmlFor="descripcion" className="block text-[#C0C0C0] text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/eventos")}
              className="mr-4 px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
