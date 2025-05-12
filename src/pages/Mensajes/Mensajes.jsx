"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Trash2, Search, MessageSquare, User, Calendar } from "lucide-react"
import api from "../../api/axios"

export default function Mensajes() {
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [mensajeToDelete, setMensajeToDelete] = useState(null)
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [mensajesRes, usuariosRes] = await Promise.all([api.get("/mensajes"), api.get("/usuarios")])

        // Check if response.data is an array or if it has a data property
        const mensajesData = Array.isArray(mensajesRes.data) ? mensajesRes.data : mensajesRes.data.data || []
        setMensajes(mensajesData)

        // Check if response.data is an array or if it has a data property
        const usuariosData = Array.isArray(usuariosRes.data) ? usuariosRes.data : usuariosRes.data.data || []
        setUsuarios(usuariosData)
      } catch (error) {
        console.error("Error al cargar mensajes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!mensajeToDelete) return

    try {
      await api.delete(`/mensajes/${mensajeToDelete}`)
      setMensajes(mensajes.filter((mensaje) => mensaje.id !== mensajeToDelete))
      setShowDeleteModal(false)
      setMensajeToDelete(null)
    } catch (error) {
      console.error("Error al eliminar mensaje:", error)
    }
  }

  const confirmDelete = (id) => {
    setMensajeToDelete(id)
    setShowDeleteModal(true)
  }

  const filteredMensajes = mensajes.filter(
    (mensaje) =>
      mensaje.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mensaje.contenido.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuarios.find((u) => u.id === usuarioId)
    return usuario ? `${usuario.nombre} ${usuario.apellido1}` : "Desconocido"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Mensajes</h1>
        <Link
          to="/admin/mensajes/nuevo"
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nuevo Mensaje
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por asunto o contenido..."
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
            <div className="text-[#C0C0C0]">Cargando mensajes...</div>
          </div>
        ) : filteredMensajes.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <MessageSquare size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm ? "No se encontraron mensajes con la búsqueda aplicada." : "No hay mensajes registrados."}
            </p>
            <Link to="/admin/mensajes/nuevo" className="mt-4 text-[#C0C0C0] hover:text-white underline">
              Crear el primer mensaje
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredMensajes.map((mensaje) => (
              <div key={mensaje.id} className="p-4 hover:bg-gray-900/30">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      to={`/admin/mensajes/${mensaje.id}`}
                      className="text-lg font-medium text-[#C0C0C0] hover:text-white"
                    >
                      {mensaje.asunto}
                    </Link>
                    <div className="flex items-center mt-1 text-sm text-gray-400">
                      <User size={14} className="mr-1" />
                      <span>De: {getUsuarioNombre(mensaje.usuario_id_emisor)}</span>
                      <span className="mx-2">•</span>
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(mensaje.fecha_envio)}</span>
                    </div>
                  </div>
                  <button onClick={() => confirmDelete(mensaje.id)} className="p-1 text-gray-400 hover:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="mt-2 text-gray-400 line-clamp-2">{mensaje.contenido}</p>
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
              ¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.
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
    </div>
  )
}
