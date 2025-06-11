"use client"

import { useState, useEffect } from "react"
import axios from "../../api/axios"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import {
  Music,
  FileMusic,
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
import { useTranslation } from "../../hooks/useTranslation"
import { useAuth } from "../../context/AuthContext"

/**
 * Componente principal para la gestión de composiciones interpretadas.
 * Permite listar, buscar, asignar y eliminar asignaciones de composiciones a usuarios.
 * Ahora muestra TODAS las composiciones, incluso las que no tienen usuarios asignados.
 * @component
 * @returns {JSX.Element} Página de composiciones interpretadas.
 */
const ComposicionesInterpretadas = () => {
  /** Estado de composiciones agrupadas */
  const [composiciones, setComposiciones] = useState([])

  /** Estado de carga */
  const [loading, setLoading] = useState(true)

  /** Estado de error */
  const [error, setError] = useState(null)

  /** Término de búsqueda */
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para expansión y paginación
  /** Estado de expansión de composiciones */
  const [expandedComposiciones, setExpandedComposiciones] = useState({})

  /** Página actual de composiciones */
  const [currentPage, setCurrentPage] = useState(1)

  /** Paginación de usuarios por composición */
  const [usuariosPagination, setUsuariosPagination] = useState({})

  // Estados para modal de asignación de usuario
  /** Estado del modal de asignación */
  const [showAssignModal, setShowAssignModal] = useState(false)

  /** Composición seleccionada para asignar */
  const [selectedComposicionForAssign, setSelectedComposicionForAssign] = useState(null)

  /** Lista de usuarios */
  const [usuarios, setUsuarios] = useState([])

  /** ID del usuario seleccionado */
  const [selectedUsuarioId, setSelectedUsuarioId] = useState("")

  /** Estado de advertencia por duplicado */
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)

  /** Hook de traducción */
  const { t } = useTranslation()
  /** Contexto de autenticación */
  const { user, isAdmin } = useAuth()

  // Configuración de paginación
  /** Número de composiciones por página */
  const composicionesPorPagina = 2
  /** Número de usuarios por página */
  const usuariosPorPagina = 10

  /**
   * Obtiene TODAS las composiciones y sus asignaciones de usuarios.
   * Modificado para mostrar todas las composiciones, no solo las que tienen usuarios asignados.
   * @async
   */
  const fetchComposicionesInterpretadas = async () => {
    try {
      setLoading(true)

      // 1. Obtener TODAS las composiciones primero
      const composicionesResponse = await axios.get("/composiciones")
      const todasComposiciones = Array.isArray(composicionesResponse.data)
        ? composicionesResponse.data
        : composicionesResponse.data.data || []

      if (todasComposiciones.length === 0) {
        setComposiciones([])
        setLoading(false)
        return
      }

      // 2. Obtener todas las relaciones composición-usuario
      const composicionUsuarioResponse = await axios.get("/composicion-usuario")
      const relaciones = Array.isArray(composicionUsuarioResponse.data)
        ? composicionUsuarioResponse.data
        : composicionUsuarioResponse.data.data || []

      // 3. Obtener todos los usuarios
      const usuariosResponse = await axios.get("/usuarios")
      const todosUsuarios = Array.isArray(usuariosResponse.data)
        ? usuariosResponse.data
        : usuariosResponse.data.data || []

      // 4. Crear un mapa de usuarios por ID para acceso rápido
      const usuariosMap = {}
      todosUsuarios.forEach((user) => {
        usuariosMap[user.id] = user
      })

      // 5. Crear un mapa de relaciones agrupadas por composicion_id
      const relacionesPorComposicion = {}
      relaciones.forEach((relacion) => {
        const composicionId = relacion.composicion_id
        if (!relacionesPorComposicion[composicionId]) {
          relacionesPorComposicion[composicionId] = []
        }
        relacionesPorComposicion[composicionId].push(relacion)
      })

      // 6. Procesar TODAS las composiciones (con o sin usuarios asignados)
      const composicionesConUsuarios = todasComposiciones.map((composicion) => {
        const relacionesComposicion = relacionesPorComposicion[composicion.id] || []

        // Crear array de usuarios asignados a esta composición
        const usuariosAsignados = relacionesComposicion.map((relacion) => {
          const usuario = usuariosMap[relacion.usuario_id]

          if (usuario) {
            return {
              usuario_id: relacion.usuario_id,
              nombre: usuario.nombre || "Usuario",
              apellidos: `${usuario.apellido1 || ""} ${usuario.apellido2 || ""}`.trim(),
              email: usuario.email || "",
              created_at: relacion.created_at,
              updated_at: relacion.updated_at,
            }
          } else {
            // Si no encontramos el usuario, usar valores por defecto
            return {
              usuario_id: relacion.usuario_id,
              nombre: "Usuario",
              apellidos: `#${relacion.usuario_id}`,
              email: "",
              created_at: relacion.created_at,
              updated_at: relacion.updated_at,
            }
          }
        })

        return {
          composicion_id: composicion.id,
          nombre: composicion.nombre || `Composición ${composicion.id}`,
          descripcion: composicion.descripcion || "",
          nombre_autor: composicion.nombre_autor || "",
          ruta: composicion.ruta || "",
          anio: composicion.anio || "",
          usuarios: usuariosAsignados,
        }
      })

      // 7. Parsear rutas y filtrar según permisos
      const composicionesConRutasParsed = composicionesConUsuarios
        .map((comp) => ({
          ...comp,
          parsedRuta: parseRuta(comp.ruta),
        }))
        .filter((comp) => {
          // Si no es admin, solo mostrar composiciones que interpreta el usuario actual
          // O composiciones sin usuarios asignados (para que pueda asignarse)
          if (!isAdmin) {
            return comp.usuarios.length === 0 || comp.usuarios.some((usuario) => usuario.usuario_id === user.id)
          }
          return true
        })

      // 8. Ordenar alfabéticamente por nombre
      composicionesConRutasParsed.sort((a, b) => a.nombre.localeCompare(b.nombre))

      // 9. Inicializar estados de expansión y paginación
      const initialExpanded = {}
      const initialPagination = {}

      composicionesConRutasParsed.forEach((comp) => {
        initialExpanded[comp.composicion_id] = false
        initialPagination[comp.composicion_id] = 1
      })

      setExpandedComposiciones(initialExpanded)
      setUsuariosPagination(initialPagination)
      setComposiciones(composicionesConRutasParsed)
      setError(null)
    } catch (err) {
      console.error("Error al cargar composiciones:", err)
      setError(t("interpretedCompositions.errorLoadingCompositionsMessage"))
      toast.error(t("interpretedCompositions.errorLoadingCompositions"))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Efecto para cargar composiciones y usuarios al montar el componente.
   */
  useEffect(() => {
    fetchComposicionesInterpretadas()

    // Cargar usuarios para asignación
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("/usuarios")
        setUsuarios(response.data.data || response.data)
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        toast.error(t("interpretedCompositions.errorLoadingUserList"))
      }
    }

    fetchUsuarios()
  }, [])

  /**
   * Parsea la ruta de la composición (JSON, YouTube o archivo simple).
   * @param {string} ruta - Ruta a parsear.
   * @returns {Object} Objeto con tipo y urls.
   */
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
      // console.warn("Error al parsear ruta:", e)
    }

    // Por defecto, tratar como archivo único
    return { type: "unknown", urls: [ruta] }
  }

  /**
   * Alterna la expansión de una composición.
   * @param {number} composicionId - ID de la composición.
   */
  const toggleExpand = (composicionId) => {
    setExpandedComposiciones((prev) => ({
      ...prev,
      [composicionId]: !prev[composicionId],
    }))
  }

  /**
   * Avanza a la siguiente página de composiciones.
   */
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredComposiciones.length / composicionesPorPagina)) {
      setCurrentPage(currentPage + 1)
    }
  }

  /**
   * Retrocede a la página anterior de composiciones.
   */
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  /**
   * Avanza a la siguiente página de usuarios para una composición.
   * @param {number} composicionId - ID de la composición.
   */
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

  /**
   * Retrocede a la página anterior de usuarios para una composición.
   * @param {number} composicionId - ID de la composición.
   */
  const prevUsuariosPage = (composicionId) => {
    if (usuariosPagination[composicionId] > 1) {
      setUsuariosPagination((prev) => ({
        ...prev,
        [composicionId]: prev[composicionId] - 1,
      }))
    }
  }

  /**
   * Abre el modal para asignar un usuario a una composición.
   * @param {Object} composicion - Composición seleccionada.
   */
  const handleOpenAssignModal = (composicion) => {
    setSelectedComposicionForAssign(composicion)
    setSelectedUsuarioId("")
    setShowDuplicateWarning(false)
    setShowAssignModal(true)
  }

  /**
   * Asigna una composición a un usuario seleccionado.
   * @async
   */
  const handleAssignToUser = async () => {
    if (!selectedComposicionForAssign || !selectedUsuarioId) {
      toast.error(t("interpretedCompositions.selectUser"))
      return
    }

    try {
      const response = await axios.post("/composicion-usuario", {
        composicion_id: selectedComposicionForAssign.composicion_id,
        usuario_id: selectedUsuarioId,
      })

      toast.success(t("interpretedCompositions.assignmentCreatedSuccessfully"))
      setShowAssignModal(false)
      setShowDuplicateWarning(false)

      // Recargar datos para mostrar la nueva asignación
      fetchComposicionesInterpretadas()
    } catch (error) {
      console.error("Error al asignar composición:", error)

      // Si es un error de duplicado
      if (
        error.response &&
        error.response.data &&
        (error.response.data.message?.includes("duplicate") || error.response.status === 422)
      ) {
        const usuarioNombre = usuarios.find((u) => u.id === Number.parseInt(selectedUsuarioId))
        const nombreCompleto = usuarioNombre ? `${usuarioNombre.nombre} ${usuarioNombre.apellido1}` : "Este usuario"
        toast.error(`${nombreCompleto} ya está asignado a esta composición.`)
      } else {
        toast.error(t("interpretedCompositions.errorAssigningComposition"))
      }
    }
  }

  /**
   * Elimina la asignación de una composición a un usuario.
   * @async
   * @param {number} composicionId - ID de la composición.
   * @param {number} usuarioId - ID del usuario.
   */
  const handleDeleteUserComposicion = async (composicionId, usuarioId) => {
    try {
      await axios.delete(`/composicion-usuario/${composicionId}/${usuarioId}`)
      toast.success(t("interpretedCompositions.assignmentDeletedSuccessfully"))

      // Actualizar composiciones en pantalla eliminando el usuario
      setComposiciones((prevComposiciones) => {
        return prevComposiciones.map((comp) => {
          if (comp.composicion_id === composicionId) {
            return {
              ...comp,
              usuarios: comp.usuarios.filter((usuario) => usuario.usuario_id !== usuarioId),
            }
          }
          return comp
        })
        // Ya no filtramos composiciones sin usuarios - las mantenemos todas
      })
    } catch (error) {
      console.error("Error al eliminar asignación:", error)
      toast.error(t("interpretedCompositions.errorDeletingAssignment"))
    }
  }

  /**
   * Filtra las composiciones según el término de búsqueda.
   * @type {Array}
   */
  const filteredComposiciones = composiciones.filter((composicion) => {
    const matchesSearch =
      (composicion.nombre && composicion.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (composicion.nombre_autor && composicion.nombre_autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (composicion.descripcion && composicion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  /**
   * Obtiene las composiciones para la página actual.
   * @type {Array}
   */
  const indexOfLastComposicion = currentPage * composicionesPorPagina
  const indexOfFirstComposicion = indexOfLastComposicion - composicionesPorPagina
  const currentComposiciones = filteredComposiciones.slice(indexOfFirstComposicion, indexOfLastComposicion)

  /**
   * Obtiene los usuarios para una composición específica y su página actual.
   * @param {Object} composicion - Composición seleccionada.
   * @returns {Array} Usuarios de la página actual.
   */
  const getCurrentUsuarios = (composicion) => {
    const currentPage = usuariosPagination[composicion.composicion_id] || 1
    const indexOfLastUsuario = currentPage * usuariosPorPagina
    const indexOfFirstUsuario = indexOfLastUsuario - usuariosPorPagina

    return composicion.usuarios.slice(indexOfFirstUsuario, indexOfLastUsuario)
  }

  /**
   * Maneja la selección de usuario y verifica si ya está asignado.
   * @param {string} usuarioId - ID del usuario seleccionado.
   */
  const handleUsuarioSelection = (usuarioId) => {
    setSelectedUsuarioId(usuarioId)

    if (usuarioId && selectedComposicionForAssign) {
      // Verificar si el usuario ya está asignado a esta composición
      const yaAsignado = selectedComposicionForAssign.usuarios.some(
        (usuario) => usuario.usuario_id === Number.parseInt(usuarioId),
      )
      setShowDuplicateWarning(yaAsignado)
    } else {
      setShowDuplicateWarning(false)
    }
  }

  if (loading)
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64 bg-black/30 border border-gray-800 rounded-lg">
          <div className="text-[#C0C0C0]">{t("interpretedCompositions.loadingInterpretedCompositions")}</div>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-md">
          <p className="font-medium">{t("interpretedCompositions.error")}:</p>
          <p>{error}</p>
        </div>
      </div>
    )

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{t("interpretedCompositions.title")}</h1>
        {isAdmin && (
          <Link
            to="/composiciones"
            className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            <Music size={18} />
            {t("interpretedCompositions.manageCompositions")}
          </Link>
        )}
      </div>

      {/* Buscador */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder={t("interpretedCompositions.searchByTitleAuthorDescription")}
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
              ? t("interpretedCompositions.noCompositionsFoundWithFilters")
              : "No hay composiciones registradas"}
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

                      {/* Contador de usuarios - Modificado para mostrar estado */}
                      <div
                        className={`ml-3 px-2 py-0.5 rounded-full text-xs ${
                          composicion.usuarios.length === 0
                            ? "bg-yellow-800/50 text-yellow-400"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {composicion.usuarios.length === 0
                          ? "Sin asignar"
                          : `${composicion.usuarios.length} ${
                              composicion.usuarios.length === 1
                                ? t("interpretedCompositions.user")
                                : t("interpretedCompositions.users")
                            }`}
                      </div>
                    </div>

                    {composicion.nombre_autor && (
                      <p className="text-sm text-gray-400 mt-1">
                        <span className="font-medium">{t("interpretedCompositions.author")}:</span>{" "}
                        {composicion.nombre_autor}
                        {composicion.anio && ` (${composicion.anio})`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Botón para asignar usuario */}
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenAssignModal(composicion)}
                        className="p-2 bg-gray-800 text-gray-400 rounded-full hover:bg-blue-900/50 hover:text-blue-400"
                        title={t("interpretedCompositions.assignToUser")}
                      >
                        <UserPlus size={16} />
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

                  <div className="flex items-center text-xs text-gray-500">
                    {composicion.parsedRuta && composicion.parsedRuta.type === "youtube" ? (
                      <>
                        <Youtube size={14} className="mr-1 text-red-400" />
                        <span>{t("interpretedCompositions.youtubeVideo")}</span>
                      </>
                    ) : composicion.parsedRuta &&
                      composicion.parsedRuta.urls &&
                      composicion.parsedRuta.urls.length > 0 ? (
                      <>
                        <FileMusic size={14} className="mr-1" />
                        <span>
                          {composicion.parsedRuta.urls.length > 1
                            ? `${composicion.parsedRuta.urls.length} ${t("interpretedCompositions.files")}`
                            : t("interpretedCompositions.attachedFile")}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Sección expandible con usuarios */}
                {expandedComposiciones[composicion.composicion_id] && (
                  <div className="border-t border-gray-800">
                    <div className="p-3 bg-gray-900/20 border-b border-gray-800 flex justify-between items-center">
                      <h4 className="text-sm font-medium text-[#C0C0C0]">
                        {composicion.usuarios.length === 0
                          ? "Esta composición no tiene usuarios asignados"
                          : t("interpretedCompositions.usersWhoInterpretThisComposition")}
                      </h4>

                      {/* Paginación de usuarios - Solo mostrar si hay usuarios */}
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

                    {/* Lista de usuarios o mensaje de composición vacía */}
                    {composicion.usuarios.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="text-gray-500 mb-3">
                          <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">{t("interpretedCompositions.noAssign")}</p>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenAssignModal(composicion)}
                            className="px-4 py-2 bg-blue-900/30 border border-blue-700 text-blue-400 rounded-md hover:bg-blue-900/50 transition-colors text-sm"
                          >
                            {t("interpretedCompositions.assignUser")}
                          </button>
                        )}
                      </div>
                    ) : (
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
                              {isAdmin && (
                                <button
                                  onClick={() =>
                                    handleDeleteUserComposicion(composicion.composicion_id, usuario.usuario_id)
                                  }
                                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                                  title={t("interpretedCompositions.deleteAssignment")}
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
              <h3 className="text-xl font-semibold text-[#C0C0C0]">
                {t("interpretedCompositions.assignCompositionToUser")}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 text-gray-400 hover:text-[#C0C0C0]">
                <X size={20} />
              </button>
            </div>

            {/* Warning message for duplicate assignment */}
            {showDuplicateWarning && (
              <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-md flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-yellow-200 text-sm">{t("interpretedCompositions.userAlreadyAssignedWarning")}</div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-gray-400 mb-2">
                {t("interpretedCompositions.composition")}:{" "}
                <span className="text-[#C0C0C0] font-medium">{selectedComposicionForAssign?.nombre}</span>
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="usuario" className="block text-[#C0C0C0] text-sm font-medium mb-2">
                {t("interpretedCompositions.selectUser")}
              </label>
              <select
                id="usuario"
                value={selectedUsuarioId}
                onChange={(e) => handleUsuarioSelection(e.target.value)}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              >
                <option value="">{t("interpretedCompositions.selectUserPlaceholder")}</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellido1} {usuario.apellido2} - {usuario.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                {t("interpretedCompositions.cancel")}
              </button>
              <button
                onClick={handleAssignToUser}
                disabled={!selectedUsuarioId || showDuplicateWarning}
                className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("interpretedCompositions.assign")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComposicionesInterpretadas
