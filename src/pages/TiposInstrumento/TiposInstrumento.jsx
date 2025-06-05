"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Music, ChevronLeft, ChevronRight } from "lucide-react"
import api from "../../api/axios"
import { useTranslation } from "../../hooks/useTranslation"
// Importar useAuth
import { useAuth } from "../../context/AuthContext"

export default function TiposInstrumento() {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create") // "create" o "edit"
  const [currentTipo, setCurrentTipo] = useState({ instrumento: "", cantidad: 0 })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tipoToDelete, setTipoToDelete] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const { t } = useTranslation()
  // Dentro del componente:
  const { isAdmin } = useAuth()

  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [quantityAction, setQuantityAction] = useState(null) // 'increase' or 'decrease'
  const [selectedInstruments, setSelectedInstruments] = useState([])
  const [newQuantity, setNewQuantity] = useState(0)
  const [currentTipoForQuantity, setCurrentTipoForQuantity] = useState(null)
  const [instrumentos, setInstrumentos] = useState([]) // Added instrumentos state

  useEffect(() => {
    fetchTipos()
    fetchInstrumentos() // Fetch instrumentos on component mount
  }, [])

  const fetchTipos = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Intentando conectar a:", `${api.defaults.baseURL}/tipo-instrumentos`)

      const response = await api.get("/tipo-instrumentos")
      console.log("Respuesta completa de tipos:", response)

      // Verificar la estructura de la respuesta
      let tiposData = []
      if (response.data && Array.isArray(response.data)) {
        tiposData = response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        tiposData = response.data.data
      } else {
        console.warn("Formato de respuesta inesperado para tipos:", response.data)
        setError("Formato de respuesta inesperado. Verifica la consola para más detalles.")
      }

      setTipos(tiposData)
    } catch (error) {
      console.error("Error al cargar tipos de instrumento:", error)
      setError(`Error al cargar tipos de instrumento: ${error.message}`)

      // Intentar determinar el tipo de error
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

  const fetchInstrumentos = async () => {
    try {
      const response = await api.get("/instrumentos")
      setInstrumentos(response.data)
    } catch (error) {
      console.error("Error al cargar instrumentos:", error)
    }
  }

  const handleOpenModal = (mode, tipo = { instrumento: "", cantidad: 0 }) => {
    setModalMode(mode)
    setCurrentTipo(tipo)
    setCurrentTipoForQuantity(tipo) // Store original data
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentTipo({ instrumento: "", cantidad: 0 })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentTipo((prev) => ({
      ...prev,
      [name]: name === "cantidad" ? Number.parseInt(value, 10) || 0 : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (modalMode === "create") {
        await api.post("/tipo-instrumentos", currentTipo)
      } else {
        const oldQuantity = currentTipoForQuantity?.cantidad || 0
        const newQuantityValue = currentTipo.cantidad

        if (newQuantityValue > oldQuantity) {
          // Increasing quantity - need to create new instruments
          setQuantityAction("increase")
          setNewQuantity(newQuantityValue - oldQuantity)
          setCurrentTipoForQuantity(currentTipo)
          setShowQuantityModal(true)
          return
        } else if (newQuantityValue < oldQuantity) {
          // Decreasing quantity - need to select which instruments to remove
          setQuantityAction("decrease")
          setNewQuantity(oldQuantity - newQuantityValue)
          setCurrentTipoForQuantity(currentTipo)

          // Get instruments of this type
          const instrumentsOfType = instrumentos.filter((i) => i.instrumento_tipo_id === currentTipo.instrumento)
          setSelectedInstruments(instrumentsOfType)
          setShowQuantityModal(true)
          return
        }

        // Same quantity, just update
        await api.put(`/tipo-instrumentos/${encodeURIComponent(currentTipo.instrumento)}`, {
          cantidad: currentTipo.cantidad,
        })
      }

      fetchTipos()
      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar tipo de instrumento:", error)
    }
  }

  const confirmDelete = (instrumento) => {
    setTipoToDelete(instrumento)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!tipoToDelete) return

    try {
      // Usar el nombre del instrumento como identificador para la eliminación
      await api.delete(`/tipo-instrumentos/${encodeURIComponent(tipoToDelete)}`)
      setTipos(tipos.filter((tipo) => tipo.instrumento !== tipoToDelete))
      setShowDeleteModal(false)
      setTipoToDelete(null)
    } catch (error) {
      console.error("Error al eliminar tipo de instrumento:", error)
    }
  }

  const filteredTipos = tipos.filter((tipo) => tipo.instrumento.toLowerCase().includes(searchTerm.toLowerCase()))

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTipos = filteredTipos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{t("instrumentTypes.title")}</h1>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal("create")}
            className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            <Plus size={18} />
            {t("instrumentTypes.newType")}
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">
          <h3 className="font-semibold">Error de conexión</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Verifica que:
            <ul className="list-disc pl-5 mt-1">
              <li>El servidor Laravel esté en ejecución en http://localhost:8000</li>
              <li>La configuración CORS en Laravel permita peticiones desde http://localhost:5173</li>
              <li>Las rutas de la API estén correctamente definidas</li>
              <li>Estés autenticado con un token válido</li>
            </ul>
          </p>
        </div>
      )}

      {/* Búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder={t("common.searchByName")}
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
            <div className="text-[#C0C0C0]">{t("common.loading")}</div>
          </div>
        ) : filteredTipos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Music size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm
                ? "No se encontraron tipos de instrumento con la búsqueda aplicada."
                : t("instrumentTypes.noTypes")}
            </p>
            {isAdmin && (
              <button
                onClick={() => handleOpenModal("create")}
                className="mt-4 text-[#C0C0C0] hover:text-white underline"
              >
                {t("instrumentTypes.addFirstType")}
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("instrumentTypes.instrumentName")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {t("instrumentTypes.quantity")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {isAdmin ? t("common.actions") : ""}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {currentTipos.map((tipo) => (
                <tr key={tipo.instrumento} className="hover:bg-gray-900/30">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">{tipo.instrumento}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">{tipo.cantidad}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal("edit", tipo)}
                          className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(tipo.instrumento)}
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
        )}

        {/* Pagination */}
        {filteredTipos.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredTipos.length)} de{" "}
              {filteredTipos.length} tipos
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
                // Show pages around current page
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

      {/* Modal para crear/editar tipo de instrumento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">
              {modalMode === "create" ? t("instrumentTypes.newType") : t("instrumentTypes.editType")}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="instrumento" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("instrumentTypes.instrumentName")} *
                  </label>
                  <input
                    id="instrumento"
                    name="instrumento"
                    value={currentTipo.instrumento}
                    onChange={handleInputChange}
                    disabled={modalMode === "edit"} // No permitir cambiar el nombre en modo edición
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {modalMode === "edit" && (
                    <p className="text-xs text-gray-500">{t("instrumentTypes.nameCannotBeModified")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="cantidad" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("instrumentTypes.quantity")} *
                  </label>
                  <input
                    id="cantidad"
                    name="cantidad"
                    type="number"
                    min="0"
                    value={currentTipo.cantidad}
                    onChange={handleInputChange}
                    required
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
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors"
                >
                  {modalMode === "create" ? t("common.create") : t("common.save")}
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
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">{t("instrumentTypes.confirmDelete")}</h3>
            <p className="text-gray-400 mb-6">{t("instrumentTypes.deleteConfirmText", { tipoToDelete })}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                {t("common.cancel")}
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-900/80 text-white rounded-md hover:bg-red-800">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for quantity management - FIXED SCROLLBAR ISSUE */}
      {showQuantityModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md flex flex-col max-h-[80vh]">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">
              {quantityAction === "increase" ? "Añadir instrumentos" : "Eliminar instrumentos"}
            </h3>

            {quantityAction === "increase" ? (
              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                <p className="text-gray-400">
                  Se van a añadir {newQuantity} instrumentos de tipo "{currentTipoForQuantity?.instrumento}".
                  Proporciona los números de serie:
                </p>
                {Array.from({ length: newQuantity }, (_, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Número de serie ${i + 1}`}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    onChange={(e) => {
                      const newSerials = [...(currentTipoForQuantity.newSerials || [])]
                      newSerials[i] = e.target.value
                      setCurrentTipoForQuantity({ ...currentTipoForQuantity, newSerials })
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                <p className="text-gray-400">Selecciona {newQuantity} instrumentos para eliminar:</p>
                <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                  {selectedInstruments.map((instrument) => {
                    const currentSelected = currentTipoForQuantity.toDelete || []
                    const isChecked = currentSelected.includes(instrument.numero_serie)
                    const canSelect = currentSelected.length < newQuantity || isChecked

                    return (
                      <label key={instrument.numero_serie} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!canSelect}
                          className="rounded bg-gray-900/50 border-gray-800 text-[#C0C0C0] disabled:opacity-50 disabled:cursor-not-allowed"
                          onChange={(e) => {
                            const selected = currentTipoForQuantity.toDelete || []
                            if (e.target.checked) {
                              if (selected.length < newQuantity) {
                                setCurrentTipoForQuantity({
                                  ...currentTipoForQuantity,
                                  toDelete: [...selected, instrument.numero_serie],
                                })
                              }
                            } else {
                              setCurrentTipoForQuantity({
                                ...currentTipoForQuantity,
                                toDelete: selected.filter((s) => s !== instrument.numero_serie),
                              })
                            }
                          }}
                        />
                        <span className={`text-[#C0C0C0] ${!canSelect ? "opacity-50" : ""}`}>
                          #{instrument.numero_serie}
                        </span>
                      </label>
                    )
                  })}
                </div>
                {currentTipoForQuantity.toDelete && currentTipoForQuantity.toDelete.length > 0 && (
                  <p className="text-sm text-gray-500">
                    Seleccionados: {currentTipoForQuantity.toDelete.length} de {newQuantity}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowQuantityModal(false)
                  setShowModal(false) // También cerrar el modal principal
                  setCurrentTipoForQuantity(null)
                  setCurrentTipo({ instrumento: "", cantidad: 0 }) // Reset del estado
                }}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                disabled={
                  quantityAction === "decrease" &&
                  (!currentTipoForQuantity.toDelete || currentTipoForQuantity.toDelete.length !== newQuantity)
                }
                onClick={async () => {
                  try {
                    if (quantityAction === "increase") {
                      // Create new instruments
                      const serials = currentTipoForQuantity.newSerials || []
                      for (const serial of serials) {
                        if (serial) {
                          await api.post("/instrumentos", {
                            numero_serie: serial,
                            instrumento_tipo_id: currentTipoForQuantity.instrumento,
                            estado: "disponible",
                          })
                        }
                      }
                    } else {
                      // Delete selected instruments
                      const toDelete = currentTipoForQuantity.toDelete || []
                      if (toDelete.length !== newQuantity) {
                        alert(`Debes seleccionar exactamente ${newQuantity} instrumentos para eliminar`)
                        return
                      }
                      for (const serial of toDelete) {
                        await api.delete(`/instrumentos/${serial}`)
                      }
                    }

                    // Update tipo quantity
                    await api.put(`/tipo-instrumentos/${encodeURIComponent(currentTipoForQuantity.instrumento)}`, {
                      cantidad: currentTipo.cantidad,
                    })

                    fetchTipos()
                    setShowQuantityModal(false)
                    setShowModal(false) // Cerrar también el modal principal
                    setCurrentTipoForQuantity(null)
                    setCurrentTipo({ instrumento: "", cantidad: 0 })
                  } catch (error) {
                    console.error("Error al actualizar cantidad:", error)
                  }
                }}
                className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
