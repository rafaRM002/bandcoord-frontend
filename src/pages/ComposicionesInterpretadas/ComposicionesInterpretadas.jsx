"use client"

import { useState, useEffect } from "react"
import axios from "../../api/axios"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import {
  Music,
  FileMusic,
  Play,
  Pause,
  Youtube,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Search,
  UserPlus,
  X,
} from "lucide-react"

const ComposicionesInterpretadas = () => {
  const [composiciones, setComposiciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentAudio, setCurrentAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para expansión y paginación
  const [expandedComposiciones, setExpandedComposiciones] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [usuariosPagination, setUsuariosPagination] = useState({})

  // Estados para modal de asignación de usuario
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedComposicionForAssign, setSelectedComposicionForAssign] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [selectedUsuarioId, setSelectedUsuarioId] = useState("")

  // Configuración de paginación
  const composicionesPorPagina = 2
  const usuariosPorPagina = 10

  // Update the fetchComposicionesInterpretadas function to properly handle composition names
  const fetchComposicionesInterpretadas = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/composicion-usuario")
      console.log("Respuesta de composiciones interpretadas:", response.data)

      // Manejar diferentes formatos de respuesta
      const composicionesData = Array.isArray(response.data)
        ? response.data
        : response.data.composiciones || response.data.data || []

      // Agrupar por composición_id
      const composicionesAgrupadas = {}

      composicionesData.forEach((item) => {
        const composicionId = item.composicion_id

        if (!composicionesAgrupadas[composicionId]) {
          // Asegurarse de obtener el nombre correcto de la composición
          const nombreComposicion =
            item.composicion?.nombre ||
            item.titulo_composicion ||
            (item.composicion
              ? `${item.composicion.nombre || item.composicion.titulo || ""}`
              : `Composición ${composicionId}`)

          composicionesAgrupadas[composicionId] = {
            composicion_id: composicionId,
            nombre: nombreComposicion,
            descripcion: item.composicion?.descripcion || "",
            nombre_autor: item.composicion?.nombre_autor || "",
            anio: item.composicion?.anio || "",
            ruta: item.composicion?.ruta || "",
            usuarios: [],
          }
        }

        // Añadir usuario a la composición con información completa
        if (item.usuario) {
          composicionesAgrupadas[composicionId].usuarios.push({
            usuario_id: item.usuario_id,
            nombre: item.usuario.nombre || "",
            apellidos: (item.usuario.apellido1 || "") + " " + (item.usuario.apellido2 || ""),
            email: item.usuario.email || "",
            created_at: item.created_at,
            updated_at: item.updated_at,
          })
        } else {
          composicionesAgrupadas[composicionId].usuarios.push({
            usuario_id: item.usuario_id,
            nombre: "Usuario",
            apellidos: `#${item.usuario_id}`,
            email: "",
            created_at: item.created_at,
            updated_at: item.updated_at,
          })
        }
      })

      // Convertir a array y parsear rutas
      const composicionesArray = Object.values(composicionesAgrupadas).map((comp) => ({
        ...comp,
        parsedRuta: parseRuta(comp.ruta),
      }))

      // Ordenar alfabéticamente por nombre
      composicionesArray.sort((a, b) => a.nombre.localeCompare(b.nombre))

      console.log("Composiciones agrupadas:", composicionesArray)

      // Inicializar estados de expansión y paginación
      const initialExpanded = {}
      const initialPagination = {}

      composicionesArray.forEach((comp) => {
        initialExpanded[comp.composicion_id] = false
        initialPagination[comp.composicion_id] = 1
      })

      setExpandedComposiciones(initialExpanded)
      setUsuariosPagination(initialPagination)
      setComposiciones(composicionesArray)
      setError(null)
    } catch (err) {
      console.error("Error al cargar composiciones interpretadas:", err)
      setError("Error al cargar las composiciones interpretadas. Por favor, inténtelo de nuevo más tarde.")
      toast.error("Error al cargar las composiciones interpretadas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComposicionesInterpretadas()

    // Cargar usuarios para asignación
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("/usuarios")
        setUsuarios(response.data.data || response.data)
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        toast.error("Error al cargar la lista de usuarios")
      }
    }

    fetchUsuarios()

    // Cleanup al desmontar
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }
    }
  }, [audioElement]) // Añadido audioElement como dependencia para corregir el warning

  // Función para parsear la ruta (JSON o string simple)
  const parseRuta = (ruta) => {
    if (!ruta) return { type: "unknown", urls: [] }

    try {
      // Intentar parsear como JSON
      if (typeof ruta === "string" && (ruta.startsWith("[") || ruta.startsWith("{"))) {
        return JSON.parse(ruta)
      }
      // URL de YouTube
      else if (typeof ruta === "string" && (ruta.includes("youtube.com") || ruta.includes("youtu.be"))) {
        return { type: "youtube", urls: [ruta] }
      }
      // Ruta de archivo simple
      else if (ruta) {
        return { type: "file", urls: [ruta] }
      }
    } catch (e) {
      console.warn("Error al parsear ruta:", e)
    }

    // Por defecto, tratar como archivo único
    return { type: "unknown", urls: [ruta] }
  }

  // Función para reproducir/pausar audio o abrir YouTube
  const handlePlayPause = (composicion) => {
    const parsedRuta = composicion.parsedRuta || parseRuta(composicion.ruta)

    // Si es YouTube, abrir en nueva ventana
    if (parsedRuta.type === "youtube" && parsedRuta.urls && parsedRuta.urls.length > 0) {
      window.open(parsedRuta.urls[0], "_blank")
      return
    }

    // Si no hay URLs, no hacer nada
    if (!parsedRuta.urls || parsedRuta.urls.length === 0) {
      toast.error("No hay archivo de audio disponible")
      return
    }

    // Si ya hay un audio reproduciéndose, detenerlo
    if (audioElement) {
      audioElement.pause()
      audioElement.src = ""
    }

    // Si estamos reproduciendo la misma composición, solo pausar
    if (currentAudio === composicion.composicion_id && isPlaying) {
      setIsPlaying(false)
      setCurrentAudio(null)
      return
    }

    // Crear nuevo elemento de audio
    const audioUrl = parsedRuta.urls[0]
    const audio = new Audio(`${axios.defaults.baseURL}${audioUrl}`)
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
        setCurrentAudio(composicion.composicion_id)
        setAudioElement(audio)
      })
      .catch((err) => {
        console.error("Error al reproducir:", err)
        toast.error("No se pudo reproducir el audio")
      })
  }

  // Función para alternar la expansión de una composición
  const toggleExpand = (composicionId) => {
    setExpandedComposiciones((prev) => ({
      ...prev,
      [composicionId]: !prev[composicionId],
    }))
  }

  // Funciones para paginación de composiciones
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredComposiciones.length / composicionesPorPagina)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Funciones para paginación de usuarios
  const nextUsuariosPage = (composicionId) => {
    const composicion = composiciones.find((c) => c.composicion_id === composicionId)
    if (!composicion) return

    const totalPages = Math.ceil(composicion.usuarios.length / usuariosPorPagina)

    if (usuariosPagination[composicionId] < totalPages) {
      setUsuariosPagination((prev) => ({
        ...prev,
        [composicionId]: prev[composicionId] + 1,
      }))
    }
  }

  const prevUsuariosPage = (composicionId) => {
    if (usuariosPagination[composicionId] > 1) {
      setUsuariosPagination((prev) => ({
        ...prev,
        [composicionId]: prev[composicionId] - 1,
      }))
    }
  }

  // Abrir modal de asignación de usuario
  const handleOpenAssignModal = (composicion) => {
    setSelectedComposicionForAssign(composicion)
    setSelectedUsuarioId("")
    setShowAssignModal(true)
  }

  // Asignar composición a usuario
  const handleAssignToUser = async () => {
    if (!selectedComposicionForAssign || !selectedUsuarioId) {
      toast.error("Selecciona un usuario")
      return
    }

    try {
      const response = await axios.post("/composicion-usuario", {
        composicion_id: selectedComposicionForAssign.composicion_id,
        usuario_id: selectedUsuarioId,
      })

      console.log("Respuesta al asignar composición:", response.data)
      toast.success("Composición asignada correctamente al usuario")
      setShowAssignModal(false)

      // Recargar datos para mostrar la nueva asignación
      window.location.reload()
    } catch (error) {
      console.error("Error al asignar composición:", error)

      // Si es un error de duplicado (el mensaje puede variar según tu backend)
      if (
        error.response &&
        error.response.data &&
        (error.response.data.message?.includes("duplicate") || error.response.status === 422)
      ) {
        toast.error("Esta composición ya está asignada a este usuario")
      } else {
        toast.error("Error al asignar composición al usuario")
      }
    }
  }

  // Eliminar asignación de composición a usuario
  const handleDeleteUserComposicion = async (composicionId, usuarioId) => {
    try {
      await axios.delete(`/composicion-usuario/${composicionId}/${usuarioId}`)
      toast.success("Asignación eliminada correctamente")

      // Actualizar composiciones en pantalla eliminando el usuario
      setComposiciones((prevComposiciones) => {
        return prevComposiciones
          .map((comp) => {
            if (comp.composicion_id === composicionId) {
              return {
                ...comp,
                usuarios: comp.usuarios.filter((usuario) => usuario.usuario_id !== usuarioId),
              }
            }
            return comp
          })
          .filter((comp) => comp.usuarios.length > 0) // Eliminar composiciones sin usuarios
      })
    } catch (error) {
      console.error("Error al eliminar asignación:", error)
      toast.error("Error al eliminar la asignación")
    }
  }

  // Filtrar composiciones por término de búsqueda
  const filteredComposiciones = composiciones.filter((composicion) => {
    const matchesSearch =
      (composicion.nombre && composicion.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (composicion.nombre_autor && composicion.nombre_autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (composicion.descripcion && composicion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  // Obtener composiciones para la página actual
  const indexOfLastComposicion = currentPage * composicionesPorPagina
  const indexOfFirstComposicion = indexOfLastComposicion - composicionesPorPagina
  const currentComposiciones = filteredComposiciones.slice(indexOfFirstComposicion, indexOfLastComposicion)

  // Obtener usuarios para una composición específica
  const getCurrentUsuarios = (composicion) => {
    const currentPage = usuariosPagination[composicion.composicion_id] || 1
    const indexOfLastUsuario = currentPage * usuariosPorPagina
    const indexOfFirstUsuario = indexOfLastUsuario - usuariosPorPagina

    return composicion.usuarios.slice(indexOfFirstUsuario, indexOfLastUsuario)
  }

  if (loading)
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64 bg-black/30 border border-gray-800 rounded-lg">
          <div className="text-[#C0C0C0]">Cargando composiciones interpretadas...</div>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    )

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Composiciones Interpretadas</h1>
        <Link
          to="/composiciones"
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Music size={18} />
          Gestionar Composiciones
        </Link>
      </div>

      {/* Buscador */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
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

      {filteredComposiciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-black/30 border border-gray-800 rounded-lg">
          <Music size={48} className="text-gray-600 mb-4" />
          <p className="text-gray-400">
            {searchTerm
              ? "No se encontraron composiciones con los filtros aplicados."
              : "No hay composiciones interpretadas registradas."}
          </p>
        </div>
      ) : (
        <>
          {/* Lista de composiciones */}
          <div className="space-y-4">
            {currentComposiciones.map((composicion) => (
              <div
                key={composicion.composicion_id}
                className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden"
              >
                {/* Cabecera de la composición */}
                <div className="p-4 bg-gray-900/30 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-[#C0C0C0]">{composicion.nombre}</h3>

                      {/* Contador de usuarios */}
                      <div className="ml-3 px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-400">
                        {composicion.usuarios.length} {composicion.usuarios.length === 1 ? "usuario" : "usuarios"}
                      </div>
                    </div>

                    {composicion.nombre_autor && (
                      <p className="text-sm text-gray-400 mt-1">
                        <span className="font-medium">Autor:</span> {composicion.nombre_autor}
                        {composicion.anio && ` (${composicion.anio})`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Botón para asignar usuario */}
                    <button
                      onClick={() => handleOpenAssignModal(composicion)}
                      className="p-2 bg-gray-800 text-gray-400 rounded-full hover:bg-blue-900/50 hover:text-blue-400"
                      title="Asignar a usuario"
                    >
                      <UserPlus size={16} />
                    </button>

                    {/* Botón de reproducción según el tipo */}
                    {composicion.parsedRuta &&
                      composicion.parsedRuta.urls &&
                      composicion.parsedRuta.urls.length > 0 && (
                        <button
                          onClick={() => handlePlayPause(composicion)}
                          className={`p-2 rounded-full ${
                            composicion.parsedRuta.type === "youtube"
                              ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                              : currentAudio === composicion.composicion_id && isPlaying
                                ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                                : "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                          }`}
                        >
                          {composicion.parsedRuta.type === "youtube" ? (
                            <Youtube size={16} />
                          ) : currentAudio === composicion.composicion_id && isPlaying ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                      )}

                    {/* Botón para expandir/colapsar */}
                    <button
                      onClick={() => toggleExpand(composicion.composicion_id)}
                      className="p-2 bg-gray-800 text-gray-400 rounded-full hover:bg-gray-700 hover:text-[#C0C0C0]"
                    >
                      {expandedComposiciones[composicion.composicion_id] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Descripción y tipo de contenido */}
                <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/10">
                  {composicion.descripcion && <p className="text-sm text-gray-400 mb-2">{composicion.descripcion}</p>}

                  {/* Eliminar o modificar esta sección en el componente */}
                  <div className="flex items-center text-xs text-gray-500">
                    {composicion.parsedRuta && composicion.parsedRuta.type === "youtube" ? (
                      <>
                        <Youtube size={14} className="mr-1 text-red-400" />
                        <span>Video de YouTube</span>
                      </>
                    ) : composicion.parsedRuta &&
                      composicion.parsedRuta.urls &&
                      composicion.parsedRuta.urls.length > 0 ? (
                      <>
                        <FileMusic size={14} className="mr-1" />
                        <span>
                          {composicion.parsedRuta.urls.length > 1
                            ? `${composicion.parsedRuta.urls.length} archivos`
                            : "Archivo adjunto"}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Sección expandible con usuarios */}
                {expandedComposiciones[composicion.composicion_id] && (
                  <div className="border-t border-gray-800">
                    <div className="p-3 bg-gray-900/20 border-b border-gray-800 flex justify-between items-center">
                      <h4 className="text-sm font-medium text-[#C0C0C0]">Usuarios que interpretan esta composición</h4>

                      {/* Paginación de usuarios */}
                      {composicion.usuarios.length > usuariosPorPagina && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => prevUsuariosPage(composicion.composicion_id)}
                            disabled={usuariosPagination[composicion.composicion_id] === 1}
                            className="p-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs text-gray-400">
                            {usuariosPagination[composicion.composicion_id] || 1} /
                            {Math.ceil(composicion.usuarios.length / usuariosPorPagina)}
                          </span>
                          <button
                            onClick={() => nextUsuariosPage(composicion.composicion_id)}
                            disabled={
                              (usuariosPagination[composicion.composicion_id] || 1) >=
                              Math.ceil(composicion.usuarios.length / usuariosPorPagina)
                            }
                            className="p-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Lista de usuarios */}
                    <div className="divide-y divide-gray-800">
                      {getCurrentUsuarios(composicion).map((usuario) => (
                        <div
                          key={usuario.usuario_id}
                          className="p-3 flex justify-between items-center hover:bg-gray-900/10"
                        >
                          <div>
                            <div className="flex items-center">
                              <User size={16} className="mr-2 text-gray-500" />
                              <span className="text-[#C0C0C0]">
                                {usuario.nombre} {usuario.apellidos}
                              </span>
                            </div>
                            {usuario.email && <p className="text-xs text-gray-500 mt-1 ml-6">{usuario.email}</p>}
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-500 flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(usuario.created_at).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </div>

                            {/* Botón para eliminar asignación */}
                            <button
                              onClick={() =>
                                handleDeleteUserComposicion(composicion.composicion_id, usuario.usuario_id)
                              }
                              className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                              title="Eliminar asignación"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Paginación de composiciones */}
          {filteredComposiciones.length > composicionesPorPagina && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-800 text-gray-400 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="px-4 py-2 bg-gray-900/30 border border-gray-800 rounded-md">
                  <span className="text-[#C0C0C0]">
                    {currentPage} / {Math.ceil(filteredComposiciones.length / composicionesPorPagina)}
                  </span>
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage >= Math.ceil(filteredComposiciones.length / composicionesPorPagina)}
                  className="p-2 bg-gray-800 text-gray-400 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal para asignar a usuario */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#C0C0C0]">Asignar composición a usuario</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 text-gray-400 hover:text-[#C0C0C0]">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 mb-2">
                Composición: <span className="text-[#C0C0C0] font-medium">{selectedComposicionForAssign?.nombre}</span>
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="usuario" className="block text-[#C0C0C0] text-sm font-medium mb-2">
                Seleccionar usuario
              </label>
              <select
                id="usuario"
                value={selectedUsuarioId}
                onChange={(e) => setSelectedUsuarioId(e.target.value)}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="">Seleccionar usuario...</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos} - {usuario.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignToUser}
                disabled={!selectedUsuarioId}
                className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComposicionesInterpretadas
