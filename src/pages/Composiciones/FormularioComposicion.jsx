"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Music, Calendar, FileMusic, Upload } from "lucide-react"
import api from "../../api/axios"

export default function FormularioComposicion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    titulo: "",
    compositor: "",
    tipo: "marcha",
    anio: "",
    url_partitura: "",
    observaciones: "",
  })

  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState("")

  useEffect(() => {
    const fetchComposicion = async () => {
      if (!isEditing) return

      try {
        setLoading(true)
        const response = await api.get(`/composiciones/${id}`)
        const composicion = response.data

        setFormData({
          titulo: composicion.titulo,
          compositor: composicion.compositor || "",
          tipo: composicion.tipo,
          anio: composicion.anio || "",
          url_partitura: composicion.url_partitura || "",
          observaciones: composicion.observaciones || "",
        })
      } catch (error) {
        console.error("Error al cargar composición:", error)
        setError("Error al cargar los datos de la composición. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchComposicion()
  }, [id, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFileError("")

    if (selectedFile) {
      // Verificar tipo de archivo (PDF)
      if (selectedFile.type !== "application/pdf") {
        setFileError("Solo se permiten archivos PDF")
        setFile(null)
        return
      }

      // Verificar tamaño (máximo 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError("El archivo no debe superar los 10MB")
        setFile(null)
        return
      }

      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      // Si hay un archivo nuevo, primero subirlo
      if (file) {
        // En un entorno real, aquí subirías el archivo a un servidor o servicio de almacenamiento
        // y obtendrías la URL para guardarla en la base de datos
        // Simulación:
        const fileUrl = URL.createObjectURL(file)
        setFormData((prev) => ({ ...prev, url_partitura: fileUrl }))
      }

      if (isEditing) {
        await api.put(`/composiciones/${id}`, formData)
      } else {
        await api.post("/composiciones", formData)
      }
      navigate("/admin/composiciones")
    } catch (error) {
      console.error("Error al guardar composición:", error)
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
          onClick={() => navigate("/admin/composiciones")}
          className="mr-4 p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{isEditing ? "Editar Composición" : "Nueva Composición"}</h1>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">{error}</div>
      )}

      <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="space-y-2">
              <label htmlFor="titulo" className="block text-[#C0C0C0] text-sm font-medium">
                Título *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Music size={18} />
                </div>
                <input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Compositor */}
            <div className="space-y-2">
              <label htmlFor="compositor" className="block text-[#C0C0C0] text-sm font-medium">
                Compositor
              </label>
              <input
                id="compositor"
                name="compositor"
                value={formData.compositor}
                onChange={handleChange}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label htmlFor="tipo" className="block text-[#C0C0C0] text-sm font-medium">
                Tipo *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="marcha">Marcha</option>
                <option value="pasodoble">Pasodoble</option>
                <option value="himno">Himno</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Año */}
            <div className="space-y-2">
              <label htmlFor="anio" className="block text-[#C0C0C0] text-sm font-medium">
                Año
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Calendar size={18} />
                </div>
                <input
                  id="anio"
                  name="anio"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.anio}
                  onChange={handleChange}
                  className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>
            </div>

            {/* Partitura */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="partitura" className="block text-[#C0C0C0] text-sm font-medium">
                Partitura (PDF)
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <input id="partitura" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    <label
                      htmlFor="partitura"
                      className="flex items-center justify-center w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] cursor-pointer hover:bg-gray-800/50 transition-colors"
                    >
                      <Upload size={18} className="mr-2" />
                      {file ? file.name : "Seleccionar archivo"}
                    </label>
                  </div>
                  {fileError && <p className="text-red-400 text-xs mt-1">{fileError}</p>}
                </div>
                {formData.url_partitura && !file && (
                  <a
                    href={formData.url_partitura}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <FileMusic size={18} className="mr-2" />
                    Ver actual
                  </a>
                )}
              </div>
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
              onClick={() => navigate("/admin/composiciones")}
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
