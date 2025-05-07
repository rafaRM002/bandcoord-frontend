"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Building2, Phone, Mail, MapPin, CreditCard } from "lucide-react"
import api from "../../api/axios"

export default function FormularioEntidad() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    nombre: "",
    cif: "",
    direccion: "",
    localidad: "",
    provincia: "",
    codigo_postal: "",
    telefono: "",
    email: "",
    persona_contacto: "",
    observaciones: "",
  })

  useEffect(() => {
    const fetchEntidad = async () => {
      if (!isEditing) return

      try {
        setLoading(true)
        const response = await api.get(`/entidades/${id}`)
        const entidad = response.data

        setFormData({
          nombre: entidad.nombre,
          cif: entidad.cif || "",
          direccion: entidad.direccion || "",
          localidad: entidad.localidad || "",
          provincia: entidad.provincia || "",
          codigo_postal: entidad.codigo_postal || "",
          telefono: entidad.telefono || "",
          email: entidad.email || "",
          persona_contacto: entidad.persona_contacto || "",
          observaciones: entidad.observaciones || "",
        })
      } catch (error) {
        console.error("Error al cargar entidad:", error)
        setError("Error al cargar los datos de la entidad. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchEntidad()
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
        await api.put(`/entidades/${id}`, formData)
      } else {
        await api.post("/entidades", formData)
      }
      navigate("/admin/entidades")
    } catch (error) {
      console.error("Error al guardar entidad:", error)
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
          onClick={() => navigate("/admin/entidades")}
          className="mr-4 p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{isEditing ? "Editar Entidad" : "Nueva Entidad"}</h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">{error}</div>
      )}

      <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-[#C0C0C0] text-sm font-medium">
                Nombre *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Building2 size={18} />
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

            {/* CIF */}
            <div className="space-y-2">
              <label htmlFor="cif" className="block text-[#C0C0C0] text-sm font-medium">
                CIF
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <CreditCard size={18} />
                </div>
                <input
                  id="cif"
                  name="cif"
                  value={formData.cif}
                  onChange={handleChange}
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="direccion" className="block text-[#C0C0C0] text-sm font-medium">
                Dirección
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <MapPin size={18} />
                </div>
                <input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Localidad, Provincia y Código Postal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
              <div className="space-y-2">
                <label htmlFor="localidad" className="block text-[#C0C0C0] text-sm font-medium">
                  Localidad
                </label>
                <input
                  id="localidad"
                  name="localidad"
                  value={formData.localidad}
                  onChange={handleChange}
                  className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="provincia" className="block text-[#C0C0C0] text-sm font-medium">
                  Provincia
                </label>
                <input
                  id="provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleChange}
                  className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="codigo_postal" className="block text-[#C0C0C0] text-sm font-medium">
                  Código Postal
                </label>
                <input
                  id="codigo_postal"
                  name="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={handleChange}
                  className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label htmlFor="telefono" className="block text-[#C0C0C0] text-sm font-medium">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Phone size={18} />
                </div>
                <input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[#C0C0C0] text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Persona de contacto */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="persona_contacto" className="block text-[#C0C0C0] text-sm font-medium">
                Persona de contacto
              </label>
              <input
                id="persona_contacto"
                name="persona_contacto"
                value={formData.persona_contacto}
                onChange={handleChange}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="mt-6 space-y-2">
            <label htmlFor="observaciones" className="block text-[#C0C0C0] text-sm font-medium">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={4}
              className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/entidades")}
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
