"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Building2, ArrowLeft, ArrowRight, Save, Phone, Mail, User } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"

export default function Entidades() {
  const [entidades, setEntidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [entidadToDelete, setEntidadToDelete] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [modalMode, setModalMode] = useState("create") // "create" o "edit"
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    tipo: "hermandad",
    persona_contacto: "",
    telefono: "",
    email_contacto: "",
  })

  useEffect(() => {
    const fetchEntidades = async () => {
      try {
        setLoading(true)
        const response = await api.get("/entidades")

        // Check if response.data is an array or if it has a data property
        const entidadesData = Array.isArray(response.data) ? response.data : response.data.data || []

        // Ordenar entidades alfabéticamente por nombre
        entidadesData.sort((a, b) => a.nombre.localeCompare(b.nombre))

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

  const handleOpenModal = (mode, entidad = null) => {
    setModalMode(mode)
    if (mode === "edit" && entidad) {
      setFormData({
        id: entidad.id,
        nombre: entidad.nombre || "",
        tipo: entidad.tipo || "hermandad",
        persona_contacto: entidad.persona_contacto || "",
        telefono: entidad.telefono || "",
        email_contacto: entidad.email_contacto || "",
      })
    } else {
      setFormData({
        id: null,
        nombre: "",
        tipo: "hermandad",
        persona_contacto: "",
        telefono: "",
        email_contacto: "",
      })
    }
    setShowFormModal(true)
  }

  const handleCloseModal = () => {
    setShowFormModal(false)
    setError("")
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      if (modalMode === "edit") {
        await api.put(`/entidades/${formData.id}`, formData)

        // Actualizar la entidad en el estado local
        setEntidades(entidades.map((entidad) => (entidad.id === formData.id ? { ...entidad, ...formData } : entidad)))

        toast.success("Entidad actualizada correctamente")
      } else {
        const response = await api.post("/entidades", formData)

        // Añadir la nueva entidad al estado local
        const nuevaEntidad = response.data
        setEntidades([...entidades, nuevaEntidad])

        toast.success("Entidad creada correctamente")
      }

      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar entidad:", error)
      setError("Error al guardar los datos. Por favor, verifica la información e inténtalo de nuevo.")
      toast.error("Error al guardar la entidad")
    } finally {
      setSaving(false)
    }
  }

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

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredEntidades.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredEntidades.length / itemsPerPage)

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
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nueva Entidad
        </button>
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
            <button
              onClick={() => handleOpenModal("create")}
              className="mt-4 text-[#C0C0C0] hover:text-white underline"
            >
              Añadir la primera entidad
            </button>
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
                {currentItems.map((entidad) => (
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
                        <button
                          onClick={() => handleOpenModal("edit", entidad)}
                          className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                        >
                          <Edit size={18} />
                        </button>
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

        {/* Paginación */}
        {filteredEntidades.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredEntidades.length)} de{" "}
              {filteredEntidades.length} entidades
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-900/50 text-[#C0C0C0] border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ArrowLeft size={16} className="mr-1" /> Anterior
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-900/50 text-[#C0C0C0] border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Siguiente <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de formulario para crear/editar entidad */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">
              {modalMode === "create" ? "Nueva Entidad" : "Editar Entidad"}
            </h3>

            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Nombre */}
                <div className="space-y-2">
                  <label htmlFor="nombre" className="block text-[#C0C0C0] text-sm font-medium">
                    Nombre *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Building2 size={18} />
                    </div>
                    <input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
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
                    onChange={handleInputChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  >
                    <option value="hermandad">Hermandad</option>
                    <option value="ayuntamiento">Ayuntamiento</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Persona de contacto */}
                <div className="space-y-2">
                  <label htmlFor="persona_contacto" className="block text-[#C0C0C0] text-sm font-medium">
                    Persona de contacto *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <User size={18} />
                    </div>
                    <input
                      id="persona_contacto"
                      name="persona_contacto"
                      value={formData.persona_contacto}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <label htmlFor="telefono" className="block text-[#C0C0C0] text-sm font-medium">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Phone size={18} />
                    </div>
                    <input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                </div>

                {/* Email de contacto */}
                <div className="space-y-2">
                  <label htmlFor="email_contacto" className="block text-[#C0C0C0] text-sm font-medium">
                    Email de contacto *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email_contacto"
                      name="email_contacto"
                      type="email"
                      value={formData.email_contacto}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
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
      )}

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
