"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Edit, Trash2, Search, Building2 } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"

export default function Entidades() {
  const [entidades, setEntidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [entidadToDelete, setEntidadToDelete] = useState(null)

  useEffect(() => {
    const fetchEntidades = async () => {
      try {
        setLoading(true)
        const response = await api.get("/entidades")

        // Check if response.data is an array or if it has a data property
        const entidadesData = Array.isArray(response.data) ? response.data : response.data.data || []
        setEntidades(entidadesData)
      } catch (error) {
        console.error("Error al cargar entidades:", error)
        toast.error("Error al cargar las entidades")
      } finally {
        setLoading(false)
      }
    }

    fetchEntidades()
  }, [])

  const handleDelete = async () => {
    if (!entidadToDelete) return

    try {
      await api.delete(`/entidades/${entidadToDelete}`)
      setEntidades(entidades.filter((entidad) => entidad.id !== entidadToDelete))
      setShowDeleteModal(false)
      setEntidadToDelete(null)
      toast.success("Entidad eliminada correctamente")
    } catch (error) {
      console.error("Error al eliminar entidad:", error)
      toast.error("Error al eliminar la entidad")
    }
  }

  const confirmDelete = (id) => {
    setEntidadToDelete(id)
    setShowDeleteModal(true)
  }

  const filteredEntidades = entidades.filter(
    (entidad) =>
      entidad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entidad.tipo && entidad.tipo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entidad.persona_contacto && entidad.persona_contacto.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getTipoEntidad = (tipo) => {
    switch (tipo) {
      case "hermandad":
        return "Hermandad"
      case "ayuntamiento":
        return "Ayuntamiento"
      case "otro":
        return "Otro"
      default:
        return tipo
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Gestión de Entidades</h1>
        <Link
          to="/admin/entidades/nueva"
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nueva Entidad
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, tipo o persona de contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
          />
        </div>
      </div>

      {/* Tabla de entidades */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">Cargando entidades...</div>
          </div>
        ) : filteredEntidades.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Building2 size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm ? "No se encontraron entidades con la búsqueda aplicada." : "No hay entidades registradas."}
            </p>
            <Link to="/admin/entidades/nueva" className="mt-4 text-[#C0C0C0] hover:text-white underline">
              Añadir la primera entidad
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Persona de Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredEntidades.map((entidad) => (
                  <tr key={entidad.id} className="hover:bg-gray-900/30">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">{entidad.nombre}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                      {getTipoEntidad(entidad.tipo)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                      {entidad.persona_contacto || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">{entidad.telefono || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/entidades/editar/${entidad.id}`}
                          className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => confirmDelete(entidad.id)}
                          className="p-1 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">Confirmar eliminación</h3>
            <p className="text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar esta entidad? Esta acción no se puede deshacer.
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
