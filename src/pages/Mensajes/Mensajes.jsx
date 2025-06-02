"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Trash2, Search, MessageSquare, User, Calendar, CheckSquare, Square } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"
import { useAuth } from "../../context/AuthContext"
import { useTranslation } from "../../hooks/useTranslation"

export default function Mensajes() {
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [mensajeToDelete, setMensajeToDelete] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [, setTotalPages] = useState(1)
  const { user } = useAuth()
  const itemsPerPage = 6
  const [selectedMensajes, setSelectedMensajes] = useState([])
  const [filtroActual,] = useState("enviados") // enviados, archivados
  const [selectAll, setSelectAll] = useState(false)
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false)
  const [mensajeUsuarios, setMensajeUsuarios] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [mensajesRes, usuariosRes, mensajeUsuariosRes] = await Promise.all([
          api.get("/mensajes"),
          api.get("/usuarios"),
          api.get("/mensaje-usuarios"),
        ])

        // Check if response.data is an array or if it has a data property
        const mensajesData = Array.isArray(mensajesRes.data) ? mensajesRes.data : mensajesRes.data.data || []
        const mensajeUsuariosData = Array.isArray(mensajeUsuariosRes.data)
          ? mensajeUsuariosRes.data
          : mensajeUsuariosRes.data.data || []

        setMensajeUsuarios(mensajeUsuariosData)

        // Filtrar solo los mensajes enviados por el usuario actual
        const mensajesEnviados = mensajesData.filter((mensaje) => mensaje.usuario_id_emisor === user?.id)

        setMensajes(mensajesEnviados)
        setTotalPages(Math.ceil(mensajesEnviados.length / itemsPerPage))

        // Check if response.data is an array or if it has a data property
        const usuariosData = Array.isArray(usuariosRes.data) ? usuariosRes.data : usuariosRes.data.data || []
        setUsuarios(usuariosData)
      } catch (error) {
        console.error("Error al cargar mensajes:", error)
        toast.error("Error al cargar los mensajes")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.id) {
      fetchData()
    }
  }, [user])

  const handleDelete = async () => {
    if (!mensajeToDelete) return

    try {
      await api.delete(`/mensajes/${mensajeToDelete}`)
      setMensajes(mensajes.filter((mensaje) => mensaje.id !== mensajeToDelete))
      toast.success("Mensaje eliminado correctamente")
      setShowDeleteModal(false)
      setMensajeToDelete(null)
    } catch (error) {
      console.error("Error al eliminar mensaje:", error)
      toast.error("Error al eliminar el mensaje")
    }
  }

  const handleSelectMensaje = (id) => {
    if (selectedMensajes.includes(id)) {
      setSelectedMensajes(selectedMensajes.filter((mensajeId) => mensajeId !== id))
    } else {
      setSelectedMensajes([...selectedMensajes, id])
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMensajes([])
    } else {
      setSelectedMensajes(paginatedMensajes.map((mensaje) => mensaje.id))
    }
    setSelectAll(!selectAll)
  }

  const handleDeleteSelected = async () => {
    setShowDeleteSelectedModal(true)
  }

  const confirmDeleteSelected = async () => {
    if (selectedMensajes.length === 0) return

    try {
      await Promise.all(selectedMensajes.map((id) => api.delete(`/mensajes/${id}`)))
      setMensajes(mensajes.filter((mensaje) => !selectedMensajes.includes(mensaje.id)))
      toast.success(`${selectedMensajes.length} mensaje(s) eliminado(s) correctamente`)
      setSelectedMensajes([])
      setSelectAll(false)
      setShowDeleteSelectedModal(false)
    } catch (error) {
      console.error("Error al eliminar mensajes:", error)
      toast.error("Error al eliminar los mensajes")
    }
  }

  const filteredMensajes = mensajes.filter((mensaje) => {
    const matchesSearch =
      mensaje.asunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mensaje.contenido?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filtroActual === "enviados") {
      return matchesSearch
    }

    return matchesSearch
  })

  // Paginación
  const paginatedMensajes = filteredMensajes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const getReceptorId = (mensajeId) => {
    const mensajeUsuario = mensajeUsuarios.find((mu) => mu.mensaje_id === mensajeId)
    return mensajeUsuario ? mensajeUsuario.usuario_id_receptor : null
  }

  const getUsuarioNombre = (mensajeId) => {
    const receptorId = getReceptorId(mensajeId)
    if (!receptorId) return "Desconocido"

    const usuario = usuarios.find((u) => u.id === receptorId)
    if (!usuario) {
      return "Desconocido"
    }
    return `${usuario.nombre || ""} ${usuario.apellido1 || ""}`.trim() || `Usuario #${receptorId}`
  }

  const renderPagination = () => {
    const totalFilteredPages = Math.ceil(filteredMensajes.length / itemsPerPage)

    if (totalFilteredPages <= 1) return null

    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-md text-[#C0C0C0] disabled:opacity-50"
        >
          {t("common.previous")}
        </button>

        {Array.from({ length: totalFilteredPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md ${
              currentPage === page ? "bg-[#C0C0C0] text-black" : "bg-gray-900 border border-gray-700 text-[#C0C0C0]"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(Math.min(totalFilteredPages, currentPage + 1))}
          disabled={currentPage === totalFilteredPages}
          className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-md text-[#C0C0C0] disabled:opacity-50"
        >
          {t("common.next")}
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-[#C0C0C0] mr-4">{t("messages.sentMessages")}</h1>
          {/* Filter buttons removed as requested */}
        </div>
        <div className="flex items-center space-x-2">
          {selectedMensajes.length > 0 && (
            <>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1 bg-red-900/80 text-white px-3 py-1 rounded-md hover:bg-red-800"
                title="Eliminar seleccionados"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">{t("common.delete")}</span>
                <span className="bg-red-700 text-xs px-1.5 py-0.5 rounded-full">{selectedMensajes.length}</span>
              </button>
            </>
          )}
          <Link
            to="/mensajes/nuevo"
            className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            <Plus size={18} />
            {t("messages.newMessage")}
          </Link>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder={t("messages.searchBySubjectOrContent")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
          />
        </div>
      </div>

      {/* Lista de mensajes */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">{t("messages.loadingMessages")}</div>
          </div>
        ) : paginatedMensajes.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <MessageSquare size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm ? t("messages.noMessagesWithSearch") : t("messages.noSentMessages")}
            </p>
            <Link to="/mensajes/nuevo" className="mt-4 text-[#C0C0C0] hover:text-white underline">
              {t("messages.createNewMessage")}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            <div className="p-2 bg-gray-900/50 flex items-center">
              <button
                onClick={handleSelectAll}
                className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                title={selectAll ? t("common.deselectAll") : t("common.selectAll")}
              >
                {selectAll ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
              <span className="ml-2 text-sm text-gray-400">
                {selectedMensajes.length > 0
                  ? `${selectedMensajes.length} ${t("common.selected")}`
                  : t("common.select")}
              </span>
            </div>

            {paginatedMensajes.map((mensaje) => (
              <div key={mensaje.id} className="p-4 hover:bg-gray-900/30">
                <div className="flex items-start">
                  <button
                    onClick={() => handleSelectMensaje(mensaje.id)}
                    className="p-1 mr-2 text-gray-400 hover:text-[#C0C0C0] mt-1"
                  >
                    {selectedMensajes.includes(mensaje.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/mensajes/${mensaje.id}`}
                          className="text-lg font-medium text-[#C0C0C0] hover:text-white"
                        >
                          {mensaje.asunto}
                        </Link>
                        <div className="flex items-center mt-1 text-sm text-gray-400">
                          <User size={14} className="mr-1" />
                          <span>
                            {t("messages.to")}: {getUsuarioNombre(mensaje.id)}
                          </span>
                          <span className="mx-2">•</span>
                          <Calendar size={14} className="mr-1" />
                          <span>{formatDate(mensaje.created_at || mensaje.fecha_envio)}</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/mensajes/${mensaje.id}`} className="block">
                      <p className="mt-2 text-gray-400 line-clamp-2">{mensaje.contenido}</p>
                    </Link>
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
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">{t("common.confirmDelete")}</h3>
            <p className="text-gray-400 mb-6">{t("messages.deleteConfirmText")}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                {t("common.cancel")}
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-900/80 text-white rounded-md hover:bg-red-800">
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteSelectedModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">{t("common.confirmDelete")}</h3>
            <p className="text-gray-400 mb-6">
              {t("messages.deleteMultipleConfirmText", { count: selectedMensajes.length })}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteSelectedModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmDeleteSelected}
                className="px-4 py-2 bg-red-900/80 text-white rounded-md hover:bg-red-800"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
