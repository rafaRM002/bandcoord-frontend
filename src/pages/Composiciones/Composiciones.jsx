"use client"

import { useState, useEffect, useRef } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Music,
  FileMusic,
  Youtube,
  ImageIcon,
  X,
  Save,
  ArrowLeft,
  ArrowRight,
  File,
  Upload,
  Loader2,
  RefreshCw,
} from "lucide-react"
import api, { IMAGES_URL } from "../../api/axios"
import { toast } from "react-toastify"
import { useTranslation } from "../../hooks/useTranslation"
// Importar useAuth
import { useAuth } from "../../context/AuthContext"

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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(useState(false)[0])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const { t } = useTranslation()
  // Dentro del componente:
  const { isAdmin } = useAuth()

  // Estados para el modal de composición
  const [showModal, setShowModal] = useState(false)
  const [editingComposicion, setEditingComposicion] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    nombre_autor: "",
  })

  // Estado para el tipo de ruta (YouTube y/o archivo)
  const [includeYoutube, setIncludeYoutube] = useState(false)
  const [includeFiles, setIncludeFiles] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")

  // Nuevo estado para manejar archivos
  const [newFiles, setNewFiles] = useState([])
  const [existingFiles, setExistingFiles] = useState([])

  const fileInputRef = useRef(null)

  // Estado para el modal de archivos
  const [showFilesModal, setShowFilesModal] = useState(false)
  const [selectedComposicion, setSelectedComposicion] = useState(null)

  // Función para cargar las composiciones
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
        setError(t("compositions.unexpectedResponseFormat"))
      }

      // Ordenar composiciones alfabéticamente por nombre
      composicionesData.sort((a, b) => {
        const nombreA = a.nombre || a.titulo || ""
        const nombreB = b.nombre || b.titulo || ""
        return nombreA.localeCompare(nombreB)
      })

      // Procesar las rutas para identificar YouTube vs imágenes
      composicionesData = composicionesData.map((comp) => {
        const ruta = comp.ruta || ""
        let parsedRuta = { youtube: null, files: [] }

        try {
          // Intentar parsear la ruta como JSON si es un string
          if (ruta && typeof ruta === "string" && (ruta.startsWith("[") || ruta.startsWith("{"))) {
            const parsed = JSON.parse(ruta)

            // Nuevo formato con youtube y files separados
            if (parsed.youtube !== undefined || parsed.files !== undefined) {
              parsedRuta = {
                youtube: parsed.youtube || null,
                files: Array.isArray(parsed.files) ? parsed.files : [],
              }
            }
            // Formato anterior con type y urls
            else if (parsed.type && parsed.urls) {
              if (parsed.type === "youtube" && parsed.urls.length > 0) {
                parsedRuta = { youtube: parsed.urls[0], files: [] }
              } else if (parsed.type === "file") {
                parsedRuta = { youtube: null, files: parsed.urls || [] }
              }
            }
          }
          // Si es una URL de YouTube (formato simple)
          else if (ruta && typeof ruta === "string" && (ruta.includes("youtube.com") || ruta.includes("youtu.be"))) {
            parsedRuta = { youtube: ruta, files: [] }
          }
          // Si es una ruta de archivo (formato simple)
          else if (ruta) {
            parsedRuta = { youtube: null, files: [ruta] }
          }
        } catch (e) {
          console.warn("Error al parsear ruta:", e)
          // Si hay error, mantener la ruta original como una sola URL
          parsedRuta = { youtube: null, files: ruta ? [ruta] : [] }
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
      setError(`${t("compositions.errorLoadingCompositions")}: ${error.message}`)

      if (error.response) {
        console.error("Respuesta del servidor:", error.response.status, error.response.data)
        setError(`${t("compositions.serverError")}: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor")
        setError(t("compositions.noServerResponse"))
      } else {
        console.error("Error de configuración:", error.message)
        setError(`${t("compositions.configurationError")}: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar las composiciones
  useEffect(() => {
    fetchComposiciones()

    // Limpiar audio al desmontar
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  // Función para recargar los datos
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleDelete = async () => {
    if (!composicionToDelete) return

    try {
      await api.delete(`/composiciones/${composicionToDelete}`)
      setComposiciones(composiciones.filter((comp) => comp.id !== composicionToDelete))
      setShowDeleteModal(false)
      setComposicionToDelete(null)
      toast.success(t("compositions.compositionDeletedSuccessfully"))
    } catch (error) {
      console.error("Error al eliminar composición:", error)
      toast.error(t("compositions.errorDeletingComposition"))
    }
  }

  const confirmDelete = (id) => {
    setComposicionToDelete(id)
    setShowDeleteModal(true)
  }

  const handlePlayAudio = (composicion) => {
    // Si no hay archivos de audio, no hacer nada
    if (!composicion.parsedRuta || !composicion.parsedRuta.files || composicion.parsedRuta.files.length === 0) {
      toast.error(t("compositions.noAudioFilesAvailable"))
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
    const audioUrl = composicion.parsedRuta.files[0]

    // Crear nuevo elemento de audio
    const audio = new Audio(`${api.defaults.baseURL}${audioUrl}`)

    audio.onended = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
    }
    audio.onerror = () => {
      toast.error(t("compositions.errorPlayingAudio"))
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
        toast.error(t("compositions.audioPlaybackFailed"))
      })
  }

  const handleOpenYoutube = (composicion) => {
    if (composicion.parsedRuta && composicion.parsedRuta.youtube) {
      window.open(composicion.parsedRuta.youtube, "_blank")
    } else {
      toast.error(t("compositions.noYoutubeLinkAvailable"))
    }
  }

  // Manejador para abrir modal de nueva composición
  const handleNewComposicion = () => {
    setEditingComposicion(null)
    setFormData({
      nombre: "",
      descripcion: "",
      nombre_autor: "",
    })
    setIncludeYoutube(false)
    setIncludeFiles(false)
    setYoutubeUrl("")
    setNewFiles([])
    setExistingFiles([])
    setShowModal(true)
  }

  // Manejador para editar composición
  const handleEditComposicion = (composicion) => {
    setEditingComposicion(composicion)

    // Determinar si incluye YouTube y/o archivos
    const hasYoutube = composicion.parsedRuta && composicion.parsedRuta.youtube
    const hasFiles = composicion.parsedRuta && composicion.parsedRuta.files && composicion.parsedRuta.files.length > 0

    setIncludeYoutube(hasYoutube)
    setIncludeFiles(hasFiles)
    setYoutubeUrl(hasYoutube ? composicion.parsedRuta.youtube : "")

    // Separar archivos existentes
    setNewFiles([])
    setExistingFiles(hasFiles ? composicion.parsedRuta.files : [])

    setFormData({
      nombre: composicion.nombre || "",
      descripcion: composicion.descripcion || "",
      nombre_autor: composicion.nombre_autor || "",
    })

    setShowModal(true)
  }

  // Cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambio en URL de YouTube
  const handleYoutubeUrlChange = (e) => {
    setYoutubeUrl(e.target.value)
  }

  // Validar tipo de archivo
  const isValidFileType = (file) => {
    const acceptedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ]
    return acceptedTypes.includes(file.type)
  }

  // Validar tamaño de archivo (máximo 20MB)
  const isValidFileSize = (file) => {
    const maxSize = 20 * 1024 * 1024 // 20MB en bytes
    return file.size <= maxSize
  }

  // Agregar archivos
  const handleAddFiles = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      const validFiles = []

      // Validar archivos
      selectedFiles.forEach((file) => {
        if (!isValidFileType(file)) {
          toast.error(`${t("compositions.invalidFileType")}: ${file.name}`)
          return
        }

        if (!isValidFileSize(file)) {
          toast.error(`${t("compositions.fileTooLarge")} (máx. 20MB): ${file.name}`)
          return
        }

        // Verificar duplicados
        const isDuplicate = newFiles.some(
          (existingFile) => existingFile.name === file.name && existingFile.size === file.size,
        )

        if (!isDuplicate) {
          validFiles.push(file)
        }
      })

      if (validFiles.length > 0) {
        setNewFiles((prev) => [...prev, ...validFiles])
      }
    }
  }

  // Eliminar archivo nuevo
  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Eliminar archivo existente
  const handleRemoveExistingFile = (index) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Enviar formulario de composición
  const handleSubmitComposicion = async (e) => {
    e.preventDefault()

    try {
      if (!includeYoutube && !includeFiles) {
        toast.error(t("compositions.includeYoutubeOrFiles"))
        return
      }

      if (includeYoutube && !youtubeUrl) {
        toast.error(t("compositions.provideYoutubeUrl"))
        return
      }

      if (includeFiles && newFiles.length === 0 && existingFiles.length === 0) {
        toast.error(t("compositions.addAtLeastOneFile"))
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      const composicionData = new FormData()
      composicionData.append("nombre", formData.nombre)
      composicionData.append("descripcion", formData.descripcion)
      composicionData.append("nombre_autor", formData.nombre_autor)

      // Agregar iframe (URL de YouTube) si está incluido
      if (includeYoutube && youtubeUrl) {
        composicionData.append("iframe", youtubeUrl)
      }

      // Agregar archivos existentes si hay
      if (includeFiles && existingFiles.length > 0) {
        existingFiles.forEach((filePath) => {
          composicionData.append("existing_files[]", filePath)
        })
      }

      // Agregar nuevos archivos si hay
      if (includeFiles && newFiles.length > 0) {
        newFiles.forEach((file) => {
          composicionData.append("files[]", file)
        })
      }

      // Configurar opciones para seguimiento de progreso
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }

      // LOG del contenido que se manda
      console.log("Datos a enviar:")
      console.log("nombre:", formData.nombre)
      console.log("descripcion:", formData.descripcion)
      console.log("nombre_autor:", formData.nombre_autor)
      if (includeYoutube) console.log("iframe:", youtubeUrl)
      if (includeFiles && existingFiles.length > 0) console.log("existing_files[]:", existingFiles)
      if (includeFiles && newFiles.length > 0) {
        console.log(
          "files[]:",
          newFiles.map((file) => `File: ${file.name} (${file.size} bytes)`),
        )
      }

      let response

      if (editingComposicion) {
        composicionData.append("_method", "PUT")
        response = await api.post(`/composiciones/${editingComposicion.id}`, composicionData, config)
        console.log("Respuesta al actualizar composición:", response.data)

        // Actualizar con los datos del servidor
        if (response.data && (response.data.data || response.data)) {
          const updatedComposicion = response.data.data || response.data

          // Parsear la ruta devuelta por el servidor
          let parsedRuta = { youtube: null, files: [] }
          if (updatedComposicion.ruta) {
            try {
              const rutaObj = JSON.parse(updatedComposicion.ruta)
              parsedRuta = {
                youtube: rutaObj.youtube || null,
                files: Array.isArray(rutaObj.files) ? rutaObj.files : [],
              }
            } catch (e) {
              console.warn("Error al parsear ruta devuelta:", e)
            }
          }

          // Actualizar la composición en el estado
          setComposiciones((prev) =>
            prev.map((comp) =>
              comp.id === editingComposicion.id
                ? {
                    ...comp,
                    ...updatedComposicion,
                    parsedRuta: parsedRuta,
                  }
                : comp,
            ),
          )

          toast.success(t("compositions.compositionUpdatedSuccessfully"))
        } else {
          // Si no hay datos en la respuesta, recargar todos los datos
          refreshData()
          toast.success(`${t("compositions.compositionUpdatedSuccessfully")} ${t("compositions.reloadingData")}...`)
        }
      } else {
        response = await api.post("/composiciones", composicionData, config)
        console.log("Respuesta al crear composición:", response.data)

        // Añadir la nueva composición con los datos del servidor
        if (response.data && (response.data.data || response.data)) {
          const newComposicion = response.data.data || response.data

          // Parsear la ruta devuelta por el servidor
          let parsedRuta = { youtube: null, files: [] }
          if (newComposicion.ruta) {
            try {
              const rutaObj = JSON.parse(newComposicion.ruta)
              parsedRuta = {
                youtube: rutaObj.youtube || null,
                files: Array.isArray(rutaObj.files) ? rutaObj.files : [],
              }
            } catch (e) {
              console.warn("Error al parsear ruta devuelta:", e)
            }
          }

          // Añadir la nueva composición al estado
          setComposiciones((prev) => [
            ...prev,
            {
              ...newComposicion,
              parsedRuta: parsedRuta,
            },
          ])

          toast.success(t("compositions.compositionCreatedSuccessfully"))
        } else {
          // Si no hay datos en la respuesta, recargar todos los datos
          refreshData()
          toast.success(`${t("compositions.compositionCreatedSuccessfully")} ${t("compositions.reloadingData")}...`)
        }
      }

      setShowModal(false)
    } catch (error) {
      console.error("Error al guardar composición:", error)
      toast.error(`${t("compositions.errorSavingComposition")}: ${error.message || t("compositions.unknownError")}`)

      if (error.response) {
        console.error("Respuesta del servidor:", error.response.status, error.response.data)
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Función para abrir archivos en una nueva pestaña
  const handleOpenFile = (fileName) => {
    if (fileName) {
      const fileUrl = `${IMAGES_URL}/${fileName}`
      window.open(fileUrl, "_blank")
    }
  }

  // Función para mostrar el modal de archivos
  const handleShowFilesModal = (composicion) => {
    setSelectedComposicion(composicion)
    setShowFilesModal(true)
  }

  const filteredComposiciones = composiciones.filter((composicion) => {
    if (!composicion) return false

    const matchesSearch =
      (composicion.nombre && composicion.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (composicion.nombre_autor && composicion.nombre_autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (composicion.descripcion && composicion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedComposiciones = filteredComposiciones.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredComposiciones.length / itemsPerPage)

  // Renderizar paginación con números
  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center bg-gray-900 border border-gray-700 rounded-md text-[#C0C0C0] disabled:opacity-50"
        >
          <ArrowLeft size={18} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-md ${
              currentPage === page ? "bg-[#C0C0C0] text-black" : "bg-gray-900 border border-gray-700 text-[#C0C0C0]"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center bg-gray-900 border border-gray-700 rounded-md text-[#C0C0C0] disabled:opacity-50"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    )
  }

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

  // Obtener icono según tipo de archivo
  const getFileIcon = (fileName) => {
    if (!fileName) return <File size={16} className="mr-2 text-gray-400" />

    const fileExtension = fileName.split(".").pop().toLowerCase()

    if (["mp3", "wav", "ogg"].includes(fileExtension)) {
      return <FileMusic size={16} className="mr-2 text-green-400" />
    } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
      return <ImageIcon size={16} className="mr-2 text-blue-400" />
    } else if (fileExtension === "pdf") {
      return <File size={16} className="mr-2 text-red-400" />
    } else if (["mp4", "webm", "mov"].includes(fileExtension)) {
      return <File size={16} className="mr-2 text-purple-400" />
    }

    return <File size={16} className="mr-2 text-gray-400" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{t("compositions.title")}</h1>
        {/* Modificar los botones en la cabecera: */}
        <div className="flex space-x-2">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 bg-gray-900 border border-gray-700 text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {t("compositions.reload")}
          </button>
          {isAdmin && (
            <button
              onClick={handleNewComposicion}
              className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
            >
              <Plus size={18} />
              {t("compositions.newComposition")}
            </button>
          )}
        </div>
      </div>

      {/* Mostrar mensaje de error si existe */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-md mb-6">
          <p className="font-medium">{t("compositions.error")}:</p>
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
                placeholder={t("compositions.searchByTitleAuthorDescription")}
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
            <div className="flex flex-col items-center">
              <Loader2 size={36} className="text-[#C0C0C0] animate-spin mb-4" />
              <div className="text-[#C0C0C0]">{t("compositions.loadingCompositions")}</div>
            </div>
          </div>
        ) : filteredComposiciones.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Music size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm ? t("compositions.noCompositionsWithFilters") : t("compositions.noRegisteredCompositions")}
            </p>
            {/* Modificar el mensaje cuando no hay composiciones: */}
            {isAdmin && (
              <button onClick={handleNewComposicion} className="mt-4 text-[#C0C0C0] hover:text-white underline">
                {t("compositions.addFirstComposition")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {paginatedComposiciones.map((composicion) => (
              <div key={composicion.id} className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-[#C0C0C0] truncate">{composicion.nombre}</h3>

                    {/* Botones de acción según el contenido disponible */}
                    <div className="flex space-x-2">
                      {/* Botón para YouTube si está disponible */}
                      {composicion.parsedRuta && composicion.parsedRuta.youtube && (
                        <button
                          onClick={() => handleOpenYoutube(composicion)}
                          className="p-2 rounded-full bg-red-900/30 text-red-400 hover:bg-red-900/50"
                          title={t("compositions.viewOnYoutube")}
                        >
                          <Youtube size={16} />
                        </button>
                      )}

                      {/* Botón para archivos si están disponibles */}
                      {composicion.parsedRuta &&
                        composicion.parsedRuta.files &&
                        composicion.parsedRuta.files.length > 0 && (
                          <button
                            onClick={() => handleShowFilesModal(composicion)}
                            className="p-2 rounded-full bg-green-900/30 text-green-400 hover:bg-green-900/50"
                            title={t("compositions.viewFiles")}
                          >
                            <File size={16} />
                          </button>
                        )}
                    </div>
                  </div>

                  {composicion.nombre_autor && (
                    <p className="text-sm text-gray-400 mb-2">
                      <span className="font-medium">{t("compositions.author")}:</span> {composicion.nombre_autor}
                    </p>
                  )}

                  {composicion.descripcion && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{composicion.descripcion}</p>
                  )}

                  {/* Mostrar tipo de contenido */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {composicion.parsedRuta && composicion.parsedRuta.youtube && (
                      <div className="flex items-center text-sm text-red-400 bg-red-900/20 px-2 py-1 rounded">
                        <Youtube size={14} className="mr-1" />
                        <span className="truncate">{t("compositions.youtubeVideo")}</span>
                      </div>
                    )}

                    {composicion.parsedRuta &&
                      composicion.parsedRuta.files &&
                      composicion.parsedRuta.files.length > 0 && (
                        <div className="flex items-center text-sm text-green-400 bg-green-900/20 px-2 py-1 rounded">
                          <FileMusic size={14} className="mr-1" />
                          <span className="truncate">
                            {composicion.parsedRuta.files.length}{" "}
                            {t("compositions.file", { count: composicion.parsedRuta.files.length })}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Modificar los botones de acción en cada composición: */}
                  <div className="flex justify-end space-x-2 mt-4">
                    {isAdmin && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {renderPagination()}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">{t("compositions.confirmDeletion")}</h3>
            <p className="text-gray-400 mb-6">{t("compositions.deletionConfirmationMessage")}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                {t("compositions.cancel")}
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-900/80 text-white rounded-md hover:bg-red-800">
                {t("compositions.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear/editar composición */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#C0C0C0]">
                {editingComposicion ? t("compositions.editComposition") : t("compositions.newComposition")}
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
                    {t("compositions.name")} *
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
                    {t("compositions.author")}
                  </label>
                  <input
                    id="nombre_autor"
                    name="nombre_autor"
                    value={formData.nombre_autor}
                    onChange={handleChange}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="mt-6 space-y-2">
                <label htmlFor="descripcion" className="block text-[#C0C0C0] text-sm font-medium">
                  {t("compositions.description")}
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

              {/* Selector de tipo de contenido */}
              <div className="mt-6 space-y-2">
                <label className="block text-[#C0C0C0] text-sm font-medium">{t("compositions.contentType")}</label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeYoutube"
                      checked={includeYoutube}
                      onChange={() => setIncludeYoutube(!includeYoutube)}
                      className="w-4 h-4 bg-gray-900 border border-gray-700 rounded"
                    />
                    <label htmlFor="includeYoutube" className="text-[#C0C0C0] flex items-center">
                      <Youtube size={18} className="mr-2 text-red-400" />
                      {t("compositions.includeYoutubeVideo")}
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeFiles"
                      checked={includeFiles}
                      onChange={() => setIncludeFiles(!includeFiles)}
                      className="w-4 h-4 bg-gray-900 border border-gray-700 rounded"
                    />
                    <label htmlFor="includeFiles" className="text-[#C0C0C0] flex items-center">
                      <FileMusic size={18} className="mr-2 text-green-400" />
                      {t("compositions.includeFiles")}
                    </label>
                  </div>
                </div>
              </div>

              {/* Formulario de YouTube */}
              {includeYoutube && (
                <div className="mt-4 space-y-2 p-4 border border-red-900/30 bg-red-900/10 rounded-md">
                  <label htmlFor="youtubeUrl" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("compositions.youtubeUrl")}
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
                      <p className="text-sm text-gray-400 mb-2">{t("compositions.preview")}:</p>
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
              )}

              {/* Formulario de archivos */}
              {includeFiles && (
                <div className="mt-4 space-y-2 p-4 border border-green-900/30 bg-green-900/10 rounded-md">
                  <label className="block text-[#C0C0C0] text-sm font-medium">
                    {t("compositions.files")} (MP3 y partituras)
                  </label>
                  <div className="space-y-4">
                    {/* Input de archivo */}
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            id="archivo"
                            type="file"
                            ref={fileInputRef}
                            accept=".mp3,audio/mpeg,.pdf,.jpg,.jpeg,.png, .mp4, .webm"
                            onChange={handleAddFiles}
                            className="hidden"
                            multiple
                          />
                          <label
                            htmlFor="archivo"
                            className="flex items-center justify-center w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] cursor-pointer hover:bg-gray-800/50 transition-colors"
                          >
                            <Upload size={18} className="mr-2" />
                            {t("compositions.selectFiles")}
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{t("compositions.acceptedFiles")}</p>
                      </div>
                    </div>

                    {/* Lista de archivos existentes */}
                    {existingFiles.length > 0 && (
                      <div className="p-3 bg-gray-900/30 border border-gray-800 rounded-md">
                        <p className="text-sm text-gray-400 mb-2">{t("compositions.existingFiles")}:</p>
                        <ul className="space-y-2">
                          {existingFiles.map((filePath, index) => {
                            const fileName = filePath.split("/").pop()

                            return (
                              <li
                                key={`existing-${index}`}
                                className="flex items-center justify-between text-sm text-gray-400 p-2 bg-gray-900/50 rounded"
                              >
                                <div className="flex items-center">
                                  {getFileIcon(fileName)}
                                  <span className="truncate">{fileName}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExistingFile(index)}
                                  className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Lista de archivos nuevos */}
                    {newFiles.length > 0 && (
                      <div className="p-3 bg-gray-900/30 border border-gray-800 rounded-md">
                        <p className="text-sm text-gray-400 mb-2">{t("compositions.newFiles")}:</p>
                        <ul className="space-y-2">
                          {newFiles.map((file, index) => (
                            <li
                              key={`new-${index}`}
                              className="flex items-center justify-between text-sm text-gray-400 p-2 bg-gray-900/50 rounded"
                            >
                              <div className="flex items-center">
                                {getFileIcon(file.name)}
                                <span className="truncate">{file.name}</span>
                                <span className="ml-2 text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewFile(index)}
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

              {/* Barra de progreso para la subida */}
              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-400">{t("compositions.uploadingFiles")}...</p>
                    <p className="text-sm text-gray-400">{uploadProgress}%</p>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mr-4 px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
                  disabled={isUploading}
                >
                  {t("compositions.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors flex items-center gap-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {t("compositions.uploading")}...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {t("compositions.save")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para mostrar archivos */}
      {showFilesModal && selectedComposicion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-4xl m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#C0C0C0]">
                {t("compositions.filesOf")} {selectedComposicion.nombre}
              </h3>
              <button
                onClick={() => setShowFilesModal(false)}
                className="p-2 text-gray-400 hover:text-[#C0C0C0] rounded-full hover:bg-gray-900/50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedComposicion.parsedRuta &&
                selectedComposicion.parsedRuta.files &&
                selectedComposicion.parsedRuta.files.map((fileName, index) => {
                  const fileExtension = fileName.split(".").pop().toLowerCase()
                  const isPDF = fileExtension === "pdf"
                  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)
                  const isVideo = ["mp4", "webm", "mov"].includes(fileExtension)
                  const isAudio = ["mp3", "wav", "ogg"].includes(fileExtension)

                  return (
                    <div
                      key={index}
                      className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden cursor-pointer hover:border-[#C0C0C0] transition-colors"
                      onClick={() => handleOpenFile(fileName)}
                    >
                      <div className="p-4 flex flex-col items-center">
                        {isImage && (
                          <div className="w-full h-32 mb-2 flex items-center justify-center overflow-hidden">
                            <img
                              src={`${IMAGES_URL || "/placeholder.svg"}/${fileName}`}
                              alt={fileName}
                              className="max-h-full object-contain"
                            />
                          </div>
                        )}

                        {isPDF && (
                          <div className="w-full h-32 mb-2 flex items-center justify-center bg-red-900/20 text-red-400">
                            <File size={48} />
                          </div>
                        )}

                        {isVideo && (
                          <div className="w-full h-32 mb-2 flex items-center justify-center bg-blue-900/20 text-blue-400">
                            <File size={48} />
                          </div>
                        )}

                        {isAudio && (
                          <div className="w-full h-32 mb-2 flex items-center justify-center bg-green-900/20 text-green-400">
                            <FileMusic size={48} />
                          </div>
                        )}

                        {!isImage && !isPDF && !isVideo && !isAudio && (
                          <div className="w-full h-32 mb-2 flex items-center justify-center bg-gray-900/50 text-gray-400">
                            <File size={48} />
                          </div>
                        )}

                        <p className="text-sm text-gray-400 truncate w-full text-center">{fileName.split("/").pop()}</p>
                      </div>
                    </div>
                  )
                })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowFilesModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                {t("compositions.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
