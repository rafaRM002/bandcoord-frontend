"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import api from "../../api/axios"

export default function FormularioInstrumento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [tiposInstrumento, setTiposInstrumento] = useState([])
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    num_serie: "",
    marca: "",
    modelo: "",
    tipo_instrumento_id: "",
    estado: "disponible",
    fecha_adquisicion: "",
    observaciones: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tiposRes = await api.get("/tipo-instrumentos")
        setTiposInstrumento(tiposRes.data)

        if (isEditing) {
          const instrumentoRes = await api.get(`/instrumentos/${id}`)
          const instrumento = instrumentoRes.data

          setFormData({
            num_serie: instrumento.num_serie,
            marca: instrumento.marca,
            modelo: instrumento.modelo,
            tipo_instrumento_id: instrumento.tipo_instrumento_id,
            estado: instrumento.estado,
            fecha_adquisicion: instrumento.fecha_adquisicion,
            observaciones: instrumento.observaciones || "",
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
        await api.put(`/instrumentos/${id}`, formData)
      } else {
        await api.post("/instrumentos", formData)
      }
      navigate("/admin/instrumentos")
    } catch (error) {
      console.error("Error al guardar instrumento:", error)
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
          onClick={() => navigate("/admin/instrumentos")}
          className="mr-4 p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{isEditing ? "Editar Instrumento" : "Nuevo Instrumento"}</h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">{error}</div>
      )}

      <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Número de serie */}
            <div className="space-y-2">
              <label htmlFor="num_serie" className="block text-[#C0C0C0] text-sm font-medium">
                Número de serie *
              </label>
              <input
                id="num_serie"
                name="num_serie"
                value={formData.num_serie}
                onChange={handleChange}
                disabled={isEditing}
                required
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-70 disabled:cursor-not-allowed"
              />
              {isEditing && <p className="text-xs text-gray-500">El número de serie no se puede modificar</p>}
            </div>

            {/* Tipo de instrumento */}
            <div className="space-y-2">
              <label htmlFor="tipo_instrumento_id" className="block text-[#C0C0C0] text-sm font-medium">
                Tipo de instrumento *
              </label>
              <select
                id="tipo_instrumento_id"
                name="tipo_instrumento_id"
                value={formData.tipo_instrumento_id}
                onChange={handleChange}
                required
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="">Selecciona un tipo</option>
                {tiposInstrumento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <label htmlFor="marca" className="block text-[#C0C0C0] text-sm font-medium">
                Marca *
              </label>
              <input
                id="marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              />
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <label htmlFor="modelo" className="block text-[#C0C0C0] text-sm font-medium">
                Modelo *
              </label>
              <input
                id="modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                required
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              />
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
                <option value="disponible">Disponible</option>
                <option value="prestado">Prestado</option>
                <option value="reparacion">En reparación</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            {/* Fecha de adquisición */}
            <div className="space-y-2">
              <label htmlFor="fecha_adquisicion" className="block text-[#C0C0C0] text-sm font-medium">
                Fecha de adquisición *
              </label>
              <input
                id="fecha_adquisicion"
                name="fecha_adquisicion"
                type="date"
                value={formData.fecha_adquisicion}
                onChange={handleChange}
                required
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
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
              onClick={() => navigate("/admin/instrumentos")}
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
