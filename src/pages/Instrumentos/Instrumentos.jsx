"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Music, Filter, ChevronLeft, ChevronRight, Save, X } from "lucide-react"
import api from "../../api/axios"
import { useTranslation } from "../../hooks/useTranslation"
// Corregir la importación de useAuth
import { useAuth } from "../../context/AuthContext"

export default function Instrumentos() {
  const [instrumentos, setInstrumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [tiposInstrumento, setTiposInstrumento] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [instrumentoToDelete, setInstrumentoToDelete] = useState(null)
  const { t } = useTranslation()

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Modal para crear/editar instrumento
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create")
  const [currentInstrumento, setCurrentInstrumento] = useState({
    numero_serie: "",
    instrumento_tipo_id: "",
    estado: "disponible",
  })

  // Dentro del componente, después de las declaraciones de estado:
  const { isAdmin } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Intentando conectar a:", `${api.defaults.baseURL}/instrumentos`)

      const instrumentosRes = await api.get("/instrumentos")
      console.log("Respuesta de instrumentos:", instrumentosRes)

      setInstrumentos(instrumentosRes.data)

      const tiposRes = await api.get("/tipo-instrumentos")
      console.log("Respuesta de tipos:", tiposRes)

      setTiposInstrumento(tiposRes.data)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      setError(`Error al cargar datos: ${error.message}`)

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

  const handleDelete = async () => {
    if (!instrumentoToDelete) return

    try {
      await api.delete(`/instrumentos/${instrumentoToDelete}`)
      setInstrumentos(instrumentos.filter((item) => item.numero_serie !== instrumentoToDelete))
      setShowDeleteModal(false)
      setInstrumentoToDelete(null)
    } catch (error) {
      console.error("Error al eliminar instrumento:", error)
    }
  }

  const confirmDelete = (numSerie) => {
    setInstrumentoToDelete(numSerie)
    setShowDeleteModal(true)
  }

  const handleOpenModal = (mode, instrumento = null) => {
    setModalMode(mode)
    if (mode === "edit" && instrumento) {
      setCurrentInstrumento({
        numero_serie: instrumento.numero_serie,
        instrumento_tipo_id: instrumento.instrumento_tipo_id,
        estado: instrumento.estado,
      })
    } else {
      setCurrentInstrumento({
        numero_serie: "",
        instrumento_tipo_id: tiposInstrumento.length > 0 ? tiposInstrumento[0].instrumento : "",
        estado: "disponible",
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentInstrumento({
      numero_serie: "",
      instrumento_tipo_id: "",
      estado: "disponible",
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentInstrumento((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (modalMode === "create") {
        const response = await api.post("/instrumentos", currentInstrumento)
        setInstrumentos([...instrumentos, response.data])
      } else {
        await api.put(`/instrumentos/${currentInstrumento.numero_serie}`, currentInstrumento)
        setInstrumentos(
          instrumentos.map((item) =>
            item.numero_serie === currentInstrumento.numero_serie ? currentInstrumento : item,
          ),
        )
      }

      handleCloseModal()
      fetchData()
    } catch (error) {
      console.error("Error al guardar instrumento:", error)
    }
  }

  const filteredInstrumentos = instrumentos.filter((instrumento) => {
    const matchesSearch =
      String(instrumento.numero_serie).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instrumento.instrumento_tipo_id &&
        instrumento.instrumento_tipo_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (instrumento.estado && instrumento.estado.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesTipo = tipoFilter === "" || instrumento.instrumento_tipo_id === tipoFilter

    return matchesSearch && matchesTipo
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentInstrumentos = filteredInstrumentos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInstrumentos.length / itemsPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modificar el botón "Nuevo Instrumento" para que solo aparezca para admins: */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{t("instruments.title")}</h1>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal("create")}
            className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            <Plus size={18} />
            {t("instruments.newInstrument")}
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">
          <h3 className="font-semibold">Error de conexión</h3>
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
                placeholder={t("instruments.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
              >
                <option value="">{t("instruments.allTypes")}</option>
                {tiposInstrumento.map((tipo) => (
                  <option key={tipo.instrumento} value={tipo.instrumento}>
                    {tipo.instrumento}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de instrumentos */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">{t("common.loading")}</div>
          </div>
        ) : filteredInstrumentos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Music size={48} className="text-gray-600 mb-4" />
            {/* Modificar el mensaje cuando no hay instrumentos para que no muestre el botón de añadir para miembros: */}
            <p className="text-gray-400 text-center">
              {searchTerm || tipoFilter
                ? "No se encontraron instrumentos con los filtros aplicados."
                : t("instruments.noInstruments")}
            </p>
            {isAdmin && (
              <button
                onClick={() => handleOpenModal("create")}
                className="mt-4 text-[#C0C0C0] hover:text-white underline"
              >
                {t("instruments.addFirstInstrument")}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("instruments.serialNumber")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("instruments.type")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("instruments.status")}
                      </th>
                      {/* Modificar la columna de acciones en la tabla para que solo aparezca para admins: */}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {isAdmin ? t("common.actions") : ""}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {currentInstrumentos.map((instrumento) => (
                      <tr key={instrumento.numero_serie} className="hover:bg-gray-900/30">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          {instrumento.numero_serie}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          {instrumento.instrumento_tipo_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              instrumento.estado === "disponible"
                                ? "bg-green-900/30 text-green-400 border border-green-800"
                                : instrumento.estado === "prestado"
                                  ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                                  : "bg-red-900/30 text-red-400 border border-red-800"
                            }`}
                          >
                            {instrumento.estado.charAt(0).toUpperCase() + instrumento.estado.slice(1)}
                          </span>
                        </td>
                        {/* Y en el tbody: */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          {isAdmin && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleOpenModal("edit", instrumento)}
                                className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => confirmDelete(instrumento.numero_serie)}
                                className="p-1 text-gray-400 hover:text-red-400"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredInstrumentos.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
            <div className="text-sm text-gray-400">
              {t("common.showing")} {indexOfFirstItem + 1} {t("common.to")}{" "}
              {Math.min(indexOfLastItem, filteredInstrumentos.length)} {t("common.of")} {filteredInstrumentos.length}{" "}
              instrumentos
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md bg-gray-900/50 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageNum
                        ? "bg-black border border-[#C0C0C0] text-[#C0C0C0]"
                        : "bg-gray-900/50 text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md bg-gray-900/50 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar instrumento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#C0C0C0]">
                {modalMode === "create" ? t("instruments.newInstrument") : t("instruments.editInstrument")}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="numero_serie" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("instruments.serialNumber")} *
                  </label>
                  <input
                    id="numero_serie"
                    name="numero_serie"
                    value={currentInstrumento.numero_serie}
                    onChange={handleInputChange}
                    disabled={modalMode === "edit"}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {modalMode === "edit" && (
                    <p className="text-xs text-gray-500">{t("instruments.serialNumberCannotBeModified")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="instrumento_tipo_id" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("instruments.instrumentType")} *
                  </label>
                  <select
                    id="instrumento_tipo_id"
                    name="instrumento_tipo_id"
                    value={currentInstrumento.instrumento_tipo_id}
                    onChange={handleInputChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  >
                    <option value="">Selecciona un tipo</option>
                    {tiposInstrumento.map((tipo) => (
                      <option key={tipo.instrumento} value={tipo.instrumento}>
                        {tipo.instrumento}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="estado" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("instruments.status")} *
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={currentInstrumento.estado}
                    onChange={handleInputChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  >
                    <option value="disponible">{t("instruments.available")}</option>
                    <option value="prestado">{t("instruments.loaned")}</option>
                    <option value="reparacion">{t("instruments.repair")}</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  {modalMode === "create" ? t("instruments.create") : t("common.save")}
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
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">{t("instruments.confirmDelete")}</h3>
            <p className="text-gray-400 mb-6">{t("instruments.deleteConfirmText")}</p>
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
    </div>
  )
}
