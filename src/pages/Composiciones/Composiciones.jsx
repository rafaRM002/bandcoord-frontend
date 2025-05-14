"use client"

import { useState, useEffect, useRef } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Music,
  FileMusic,
  Play,
  Pause,
  Youtube,
  ImageIcon,
  X,
  Save,
  Calendar,
} from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"

export default function Composiciones() {
  const [composiciones, setComposiciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [composicionToDelete, setComposicionToDelete] = useState(null)
  const [currentAudio, setCurrentAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState(null)

  // Estados para el modal de composición
  const [showModal, setShowModal] = useState(false)
  const [editingComposicion, setEditingComposicion] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    nombre_autor: "",
    ruta: "",
    anio: "",
  })

  // Estado para el tipo de ruta (YouTube o archivo)
  const [rutaType, setRutaType] = useState("youtube")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [fileUrls, setFileUrls] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchComposiciones = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Intentando conectar a:", `${api.defaults.baseURL}/composiciones`)

        const response = await api.get("/composiciones")
        console.log("Respuesta completa de composiciones:", response)

        // Verificar la estructura de la respuesta
        let composicionesData = []

        // Primero tratamos de obtener los datos directamente de response.data
        if (response.data && Array.isArray(response.data)) {
          composicionesData = response.data
        }
        // Si response.data no es un array, pero response.data.data lo es
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          composicionesData = response.data.data
        }
        // Si response.data.originalData.data es un array (estructura vista en la respuesta que mostraste)
        else if (
          response.data &&
          response.data.originalData &&
          response.data.originalData.data &&
          Array.isArray(response.data.originalData.data)
        ) {
          composicionesData = response.data.originalData.data
        } else {
          console.warn("Formato de respuesta inesperado para composiciones:", response.data)
          setError("Formato de respuesta inesperado. Verifica la consola para más detalles.")
        }

        // Procesar las rutas para identificar YouTube vs imágenes
        composicionesData = composicionesData.map((comp) => {
          const ruta = comp.ruta || ""
          let parsedRuta = { type: "unknown", urls: [] }

          try {
            // Intentar parsear la ruta como JSON si es un string
            if (ruta && typeof ruta === "string" && (ruta.startsWith("[") || ruta.startsWith("{"))) {
              parsedRuta = JSON.parse(ruta)
            }
            // Si es una URL de YouTube (formato simple)
            else if (ruta && typeof ruta === "string" && (ruta.includes("youtube.com") || ruta.includes("youtu.be"))) {
              parsedRuta = { type: "youtube", urls: [ruta] }
            }
            // Si es una ruta de archivo (formato simple)
            else if (ruta) {
              parsedRuta = { type: "file", urls: [ruta] }
            }
          } catch (e) {
            console.warn("Error al parsear ruta:", e)
            // Si hay error, mantener la ruta original como una sola URL
            parsedRuta = { type: "unknown", urls: [ruta] }
          }

          return {
            ...comp,
            parsedRuta: parsedRuta,
          }
        })

        console.log("Datos de composiciones procesados:", composicionesData)
        setComposiciones(composicionesData)
      } catch (error) {
        console.error("Error al cargar composiciones:", error)
        setError(`Error al cargar composiciones: ${error.message}`)

        if (error.response) {
          console.error("Respuesta del servidor:", error.response.status, error.response.data)
          setError(`Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
        } else if (error.request) {
          console.error("No se recibió respuesta del servidor")
          setError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.")
        } else {
          console.error("Error de configuración:", error.message)
          setError(`Error de configuración: ${error.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchComposiciones()

    // Limpiar audio al desmontar
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }
    }
  }, [audioElement])

  const handleDelete = async () => {
    if (!composicionToDelete) return

    try {
      await api.delete(`/composiciones/${composicionToDelete}`)
      setComposiciones(composiciones.filter((comp) => comp.id !== composicionToDelete))
      setShowDeleteModal(false)
      setComposicionToDelete(null)
      toast.success("Composición eliminada correctamente")
    } catch (error) {
      console.error("Error al eliminar composición:", error)
      toast.error("Error al eliminar la composición")
    }
  }

  const confirmDelete = (id) => {
    setComposicionToDelete(id)
    setShowDeleteModal(true)
  }

  const handlePlayPause = (composicion) => {
    // Si la composición tiene una URL de YouTube, no hacer nada (se abre en otra ventana)
    if (composicion.parsedRuta && composicion.parsedRuta.type === "youtube") {
      window.open(composicion.parsedRuta.urls[0], "_blank")
      return
    }

    // Si ya hay un audio reproduciéndose, detenerlo
    if (audioElement) {
      audioElement.pause()
      audioElement.src = ""
    }

    // Si estamos reproduciendo la misma composición, solo pausar
    if (currentAudio === composicion.id && isPlaying) {
      setIsPlaying(false)
      setCurrentAudio(null)
      return
    }

    // Obtener la URL del archivo de audio (primera URL si hay varias)
    const audioUrl =
      composicion.parsedRuta && composicion.parsedRuta.urls && composicion.parsedRuta.urls.length > 0
        ? composicion.parsedRuta.urls[0]
        : composicion.ruta || ""

    // Crear nuevo elemento de audio
    const audio = new Audio(`${api.defaults.baseURL}${audioUrl}`)
    audio.onended = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
    }
    audio.onerror = () => {
      toast.error("Error al reproducir el audio")
      setIsPlaying(false)
      setCurrentAudio(null)
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true)
        setCurrentAudio(composicion.id)
        setAudioElement(audio)
      })
      .catch((err) => {
        console.error("Error al reproducir:", err)
        toast.error("No se pudo reproducir el audio")
      })
  }

  // Manejador para abrir modal de nueva composición
  const handleNewComposicion = () => {
    setEditingComposicion(null)
    setFormData({
      nombre: "",
      descripcion: "",
      nombre_autor: "",
      ruta: "",
      anio: "",
    })
    setRutaType("youtube")
    setYoutubeUrl("")
    setFileUrls([])
    setShowModal(true)
  }

  // Manejador para editar composición
  const handleEditComposicion = (composicion) => {
    setEditingComposicion(composicion)

    // Determinar el tipo de ruta y parsear las URLs
    let rutaType = "youtube"
    let youtubeUrl = ""
    let fileUrls = []

    if (composicion.parsedRuta) {
      if (composicion.parsedRuta.type === "youtube" && composicion.parsedRuta.urls.length > 0) {
        rutaType = "youtube"
        youtubeUrl = composicion.parsedRuta.urls[0] || ""
      } else if (composicion.parsedRuta.type === "file" || composicion.parsedRuta.urls.length > 0) {
        rutaType = "file"
        fileUrls = composicion.parsedRuta.urls || []
      }
    } else if (composicion.ruta) {
      if (composicion.ruta.includes("youtube.com") || composicion.ruta.includes("youtu.be")) {
        rutaType = "youtube"
        youtubeUrl = composicion.ruta
      } else {
        rutaType = "file"
        fileUrls = [composicion.ruta]
      }
    }

    setFormData({
      nombre: composicion.nombre || "",
      descripcion: composicion.descripcion || "",
      nombre_autor: composicion.nombre_autor || "",
      ruta: composicion.ruta || "",
      anio: composicion.anio || "",
    })

    setRutaType(rutaType)
    setYoutubeUrl(youtubeUrl)
    setFileUrls(fileUrls)
    setShowModal(true)
  }

  // Cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambio de tipo de ruta (YouTube/Archivo)
  const handleRutaTypeChange = (type) => {
    setRutaType(type)
  }

  // Manejar cambio en URL de YouTube
  const handleYoutubeUrlChange = (e) => {
    setYoutubeUrl(e.target.value)
  }

  // Agregar URL de archivo
  const handleAddFileUrl = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newUrls = [...fileUrls]

      // Simular carga de archivos (en una implementación real, aquí subirías el archivo)
      Array.from(e.target.files).forEach((file) => {
        const fileName = file.name.replace(/\s+/g, "_").toLowerCase()
        const newPath = `/composiciones/${fileName}`
        if (!newUrls.includes(newPath)) {
          newUrls.push(newPath)
        }
      })

      setFileUrls(newUrls)
    }
  }

  // Eliminar URL de archivo
  const handleRemoveFileUrl = (index) => {
    const newUrls = [...fileUrls]
    newUrls.splice(index, 1)
    setFileUrls(newUrls)
  }

  // Enviar formulario de composición
  const handleSubmitComposicion = async (e) => {
    e.preventDefault()

    try {
      // Preparar la ruta según el tipo seleccionado
      let finalRuta

      if (rutaType === "youtube") {
        if (!youtubeUrl) {
          toast.error("Debes proporcionar una URL de YouTube")
          return
        }
        finalRuta = JSON.stringify({ type: "youtube", urls: [youtubeUrl] })
      } else {
        if (fileUrls.length === 0) {
          toast.error("Debes agregar al menos un archivo")
          return
        }
        finalRuta = JSON.stringify({ type: "file", urls: fileUrls })
      }

      // Preparar datos para el envío
      const composicionData = {
        ...formData,
        ruta: finalRuta,
      }

      if (editingComposicion) {
        // Actualizar composición existente
        await api.put(`/composiciones/${editingComposicion.id}`, composicionData)
        toast.success("Composición actualizada correctamente")

        // Actualizar estado local
        setComposiciones((prev) =>
          prev.map((comp) =>
            comp.id === editingComposicion.id
              ? {
                  ...comp,
                  ...composicionData,
                  parsedRuta:
                    rutaType === "youtube" ? { type: "youtube", urls: [youtubeUrl] } : { type: "file", urls: fileUrls },
                }
              : comp,
          ),
        )
      } else {
        // Crear nueva composición
        const response = await api.post("/composiciones", composicionData)
        console.log("Respuesta al crear composición:", response.data)

        // Obtener el ID de la nueva composición
        const newComposicion = response.data.data || response.data

        // Agregar a estado local
        setComposiciones((prev) => [
          ...prev,
          {
            ...newComposicion,
            ...composicionData,
            parsedRuta:
              rutaType === "youtube" ? { type: "youtube", urls: [youtubeUrl] } : { type: "file", urls: fileUrls },
          },
        ])

        toast.success("Composición creada correctamente")
      }

      // Cerrar modal
      setShowModal(false)
    } catch (error) {
      console.error("Error al guardar composición:", error)
      toast.error("Error al guardar la composición")
    }
  }

  const filteredComposiciones = composiciones.filter((composicion) => {
    if (!composicion) return false

    const matchesSearch =
      (composicion.nombre && composicion.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (composicion.nombre_autor && composicion.nombre_autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (composicion.descripcion && composicion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  const getYoutubeEmbedUrl = (youtubeUrl) => {
    if (!youtubeUrl) return ""

    let videoId = ""

    // Extraer ID de video de diferentes formatos de URL de YouTube
    if (youtubeUrl.includes("youtube.com/watch")) {
      const url = new URL(youtubeUrl)
      videoId = url.searchParams.get("v")
    } else if (youtubeUrl.includes("youtu.be")) {
      videoId = youtubeUrl.split("/").pop().split("?")[0]
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }

    return youtubeUrl // Si no se pudo procesar, devolver la URL original
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Composiciones</h1>
        <button
          onClick={handleNewComposicion}
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nueva Composición
        </button>
      </div>

      {/* Mostrar mensaje de error si existe */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-md mb-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Buscar por título, autor o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de composiciones */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">Cargando composiciones...</div>
          </div>
        ) : filteredComposiciones.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Music size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm
                ? "No se encontraron composiciones con los filtros aplicados."
                : "No hay composiciones registradas."}
            </p>
            <button onClick={handleNewComposicion} className="mt-4 text-[#C0C0C0] hover:text-white underline">
              Añadir la primera composición
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredComposiciones.map((composicion) => (
              <div key={composicion.id} className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-[#C0C0C0] truncate">{composicion.nombre}</h3>

                    {/* Botón de reproducción/YouTube según el tipo */}
                    {composicion.parsedRuta &&
                      composicion.parsedRuta.urls &&
                      composicion.parsedRuta.urls.length > 0 && (
                        <button
                          onClick={() => handlePlayPause(composicion)}
                          className={`p-2 rounded-full ${
                            composicion.parsedRuta.type === "youtube"
                              ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                              : currentAudio === composicion.id && isPlaying
                                ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                                : "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                          }`}
                        >
                          {composicion.parsedRuta.type === "youtube" ? (
                            <Youtube size={16} />
                          ) : currentAudio === composicion.id && isPlaying ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                      )}
                  </div>

                  {composicion.nombre_autor && (
                    <p className="text-sm text-gray-400 mb-2">
                      <span className="font-medium">Autor:</span> {composicion.nombre_autor}
                    </p>
                  )}

                  {composicion.anio && (
                    <p className="text-sm text-gray-400 mb-2">
                      <span className="font-medium">Año:</span> {composicion.anio}
                    </p>
                  )}

                  {composicion.descripcion && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{composicion.descripcion}</p>
                  )}

                  {/* Mostrar tipo de contenido */}
                  {composicion.parsedRuta &&
                    composicion.parsedRuta.type === "youtube" &&
                    composicion.parsedRuta.urls &&
                    composicion.parsedRuta.urls.length > 0 && (
                      <div className="flex items-center text-sm text-red-400 mb-4">
                        <Youtube size={16} className="mr-2" />
                        <span className="truncate">Enlace de YouTube</span>
                      </div>
                    )}

                  {composicion.parsedRuta && composicion.parsedRuta.type === "file" && composicion.parsedRuta.urls && (
                    <div className="flex items-center text-sm text-gray-400 mb-4">
                      <FileMusic size={16} className="mr-2" />
                      <span className="truncate">{composicion.parsedRuta.urls.length} archivo(s)</span>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => handleEditComposicion(composicion)}
                      className="p-2 bg-gray-800 text-gray-400 rounded-md hover:bg-gray-700 hover:text-[#C0C0C0]"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => confirmDelete(composicion.id)}
                      className="p-2 bg-gray-800 text-gray-400 rounded-md hover:bg-red-900/50 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">Confirmar eliminación</h3>
            <p className="text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar esta composición? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-900/80 text-white rounded-md hover:bg-red-800">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear/editar composición */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-auto py-8">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-4xl m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#C0C0C0]">
                {editingComposicion ? "Editar Composición" : "Nueva Composición"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitComposicion}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label htmlFor="nombre" className="block text-[#C0C0C0] text-sm font-medium">
                    Nombre *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Music size={18} />
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

                {/* Autor */}
                <div className="space-y-2">
                  <label htmlFor="nombre_autor" className="block text-[#C0C0C0] text-sm font-medium">
                    Autor
                  </label>
                  <input
                    id="nombre_autor"
                    name="nombre_autor"
                    value={formData.nombre_autor}
                    onChange={handleChange}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
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
                  rows={3}
                  className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                />
              </div>

              {/* Selector de tipo de ruta */}
              <div className="mt-6 space-y-2">
                <label className="block text-[#C0C0C0] text-sm font-medium">Tipo de contenido</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleRutaTypeChange("youtube")}
                    className={`px-4 py-2 flex items-center gap-2 rounded-md ${
                      rutaType === "youtube"
                        ? "bg-red-900/50 text-red-300 border border-red-700"
                        : "bg-gray-900/30 text-gray-400 border border-gray-800"
                    }`}
                  >
                    <Youtube size={18} />
                    YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRutaTypeChange("file")}
                    className={`px-4 py-2 flex items-center gap-2 rounded-md ${
                      rutaType === "file"
                        ? "bg-green-900/50 text-green-300 border border-green-700"
                        : "bg-gray-900/30 text-gray-400 border border-gray-800"
                    }`}
                  >
                    <FileMusic size={18} />
                    Archivos
                  </button>
                </div>
              </div>

              {/* Formulario según tipo */}
              {rutaType === "youtube" ? (
                <div className="mt-4 space-y-2">
                  <label htmlFor="youtubeUrl" className="block text-[#C0C0C0] text-sm font-medium">
                    URL de YouTube
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-red-500">
                      <Youtube size={18} />
                    </div>
                    <input
                      id="youtubeUrl"
                      name="youtubeUrl"
                      type="url"
                      value={youtubeUrl}
                      onChange={handleYoutubeUrlChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-red-700 focus:border-red-700"
                    />
                  </div>

                  {/* Previsualización de YouTube */}
                  {youtubeUrl && (
                    <div className="mt-4 p-2 bg-gray-900/50 border border-gray-800 rounded-md">
                      <p className="text-sm text-gray-400 mb-2">Previsualización:</p>
                      <div className="aspect-video w-full">
                        <iframe
                          src={getYoutubeEmbedUrl(youtubeUrl)}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full rounded-md"
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <label className="block text-[#C0C0C0] text-sm font-medium">Archivos (MP3 y partituras)</label>
                  <div className="space-y-4">
                    {/* Input de archivo */}
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            id="archivo"
                            type="file"
                            ref={fileInputRef}
                            accept=".mp3,audio/mpeg,.pdf,.jpg,.jpeg,.png"
                            onChange={handleAddFileUrl}
                            className="hidden"
                            multiple
                          />
                          <label
                            htmlFor="archivo"
                            className="flex items-center justify-center w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] cursor-pointer hover:bg-gray-800/50 transition-colors"
                          >
                            <Plus size={18} className="mr-2" />
                            Seleccionar archivos
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Archivos aceptados: MP3, PDF, JPG, PNG</p>
                      </div>
                    </div>

                    {/* Lista de archivos */}
                    {fileUrls.length > 0 && (
                      <div className="p-3 bg-gray-900/30 border border-gray-800 rounded-md">
                        <p className="text-sm text-gray-400 mb-2">Archivos seleccionados:</p>
                        <ul className="space-y-2">
                          {fileUrls.map((url, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between text-sm text-gray-400 p-2 bg-gray-900/50 rounded"
                            >
                              <div className="flex items-center">
                                {url.endsWith(".mp3") ? (
                                  <FileMusic size={16} className="mr-2 text-green-400" />
                                ) : (
                                  <ImageIcon size={16} className="mr-2 text-blue-400" />
                                )}
                                <span className="truncate">{url.split("/").pop()}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFileUrl(index)}
                                className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mr-4 px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
