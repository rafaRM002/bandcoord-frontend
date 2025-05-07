"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import api from "../../api/axios"

export default function TiposInstrumento() {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create") // "create" o "edit"
  const [currentTipo, setCurrentTipo] = useState({ id: null, nombre: "", descripcion: "" })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tipoToDelete, setTipoToDelete] = useState(null)

  useEffect(() => {
    fetchTipos()
  }, [])

  const fetchTipos = async () => {
    try {
      setLoading(true)
      const response = await api.get("/tipo-instrumentos")
      setTipos(response.data)
    } catch (error) {
      console.error("Error al cargar tipos de instrumento:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (mode, tipo = { id: null, nombre: "", descripcion: "" }) => {
    setModalMode(mode)
    setCurrentTipo(tipo)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentTipo({ id: null, nombre: "", descripcion: "" })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentTipo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (modalMode === "create") {
        await api.post("/tipo-instrumentos", currentTipo)
      } else {
        await api.put(`/tipo-instrumentos/${currentTipo.id}`, currentTipo)
      }

      fetchTipos()
      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar tipo de instrumento:", error)
    }
  }

  const confirmDelete = (id) => {
    setTipoToDelete(id)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!tipoToDelete) return

    try {
      await api.delete(`/tipo-instrumentos/${tipoToDelete}`)
      setTipos(tipos.filter((tipo) => tipo.id !== tipoToDelete))
      setShowDeleteModal(false)
      setTipoToDelete(null)
    } catch (error) {
      console.error("Error al eliminar tipo de instrumento:", error)
    }
  }

  const filteredTipos = tipos.filter(
    (tipo) =>
      tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Tipos de Instrumentos</h1>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nuevo Tipo
        </button>
      </div>

      {/* Búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
          />
        </div>
      </div>

      {/* Tabla de tipos de instrumento */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">Cargando tipos de instrumento...</div>
          </div>
        ) : filteredTipos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <p className="text-gray-400 text-center">
              {searchTerm
                ? "No se encontraron tipos de instrumento con la búsqueda aplicada."
                : "No hay tipos de instrumento registrados."}
            </p>
            <button
              onClick={() => handleOpenModal("create")}
              className="mt-4 text-[#C0C0C0] hover:text-white underline"
            >
              Añadir el primer tipo de instrumento
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTipos.map((tipo) => (
                <tr key={tipo.id} className="hover:bg-gray-900/30">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">{tipo.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">{tipo.nombre}</td>
                  <td className="px-4 py-3 text-sm text-[#C0C0C0]">{tipo.descripcion || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal("edit", tipo)}
                        className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                      >
                        <Edit size={18} />
                      </button>
                      <button onClick={() => confirmDelete(tipo.id)} className="p-1 text-gray-400 hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para crear/editar tipo de instrumento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">
              {modalMode === "create" ? "Nuevo Tipo de Instrumento" : "Editar Tipo de Instrumento"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="block text-[#C0C0C0] text-sm font-medium">
                    Nombre *
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    value={currentTipo.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="descripcion" className="block text-[#C0C0C0] text-sm font-medium">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={currentTipo.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors"
                >
                  {modalMode === "create" ? "Crear" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">Confirmar eliminación</h3>
            <p className="text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar este tipo de instrumento? Esta acción no se puede deshacer.
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
