"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import api from "../../api/axios"

export default function FormularioInstrumento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState(null)
  const [tiposInstrumento, setTiposInstrumento] = useState([])
  const [formData, setFormData] = useState({
    numero_serie: "",
    estado: "disponible",
    instrumento_tipo_id: "",
  })

  const isEditing = !!id

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        setError(null)

        // Cargar tipos de instrumento
        const tiposRes = await api.get("/tipo-instrumentos")
        setTiposInstrumento(tiposRes.data)

        // Si estamos editando, cargar los datos del instrumento
        if (isEditing) {
          const instrumentoRes = await api.get(`/instrumentos/${id}`)
          const instrumento = instrumentoRes.data
          setFormData({
            numero_serie: instrumento.numero_serie,
            estado: instrumento.estado,
            instrumento_tipo_id: instrumento.instrumento_tipo_id,
          })
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("Error al cargar datos. Por favor, inténtalo de nuevo.")
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [id, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      if (isEditing) {
        await api.put(`/instrumentos/${id}`, formData)
      } else {
        await api.post("/instrumentos", formData)
      }

      navigate("/admin/instrumentos")
    } catch (error) {
      console.error("Error al guardar instrumento:", error)
      setError("Error al guardar el instrumento. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-[#C0C0C0]">Cargando datos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/admin/instrumentos")}
          className="mr-4 p-2 rounded-full bg-black/30 border border-gray-800 text-[#C0C0C0] hover:bg-gray-900/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{isEditing ? "Editar Instrumento" : "Nuevo Instrumento"}</h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="numero_serie" className="block text-sm font-medium text-gray-400 mb-2">
                Número de Serie
              </label>
              <input
                type="text"
                id="numero_serie"
                name="numero_serie"
                value={formData.numero_serie}
                onChange={handleChange}
                disabled={isEditing}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-60 disabled:cursor-not-allowed"
                required
              />
              {isEditing && <p className="mt-1 text-xs text-gray-500">El número de serie no se puede modificar.</p>}
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-400 mb-2">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
                required
              >
                <option value="disponible">Disponible</option>
                <option value="prestado">Prestado</option>
                <option value="en reparacion">En reparación</option>
              </select>
            </div>

            <div>
              <label htmlFor="instrumento_tipo_id" className="block text-sm font-medium text-gray-400 mb-2">
                Tipo de Instrumento
              </label>
              <select
                id="instrumento_tipo_id"
                name="instrumento_tipo_id"
                value={formData.instrumento_tipo_id}
                onChange={handleChange}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
                required
              >
                <option value="">Selecciona un tipo</option>
                {tiposInstrumento.map((tipo) => (
                  <option key={tipo.instrumento} value={tipo.instrumento}>
                    {tipo.instrumento}
                  </option>
                ))}
              </select>
            </div>
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
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
