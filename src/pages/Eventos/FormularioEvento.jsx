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

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "concierto",
    fecha: "",
    hora: "",
    lugar: "",
    descripcion: "",
  })

  useEffect(() => {
    const fetchEvento = async () => {
      if (!isEditing) return

      try {
        setLoading(true)
        const response = await api.get(`/eventos/${id}`)
        const evento = response.data

        setFormData({
          nombre: evento.nombre,
          tipo: evento.tipo,
          fecha: evento.fecha,
          hora: evento.hora || "",
          lugar: evento.lugar,
          descripcion: evento.descripcion || "",
        })
      } catch (error) {
        console.error("Error al cargar evento:", error)
        setError("Error al cargar los datos del evento. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvento()
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
      if (isEditing) {
        await api.put(`/eventos/${id}`, formData)
      } else {
        await api.post("/eventos", formData)
      }
      navigate("/admin/eventos")
    } catch (error) {
      console.error("Error al guardar evento:", error)
      setError("Error al guardar los datos. Por favor, verifica la información e inténtalo de nuevo.")
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
            <div className="space-y-2 md:col-span-2">
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
