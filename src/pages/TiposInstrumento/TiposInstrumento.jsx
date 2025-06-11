"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Music, ChevronLeft, ChevronRight } from "lucide-react"
import api from "../../api/axios"
import { useTranslation } from "../../hooks/useTranslation"
import { useAuth } from "../../context/AuthContext"

/**
 * Componente principal para la gestión de tipos de instrumentos.
 * Permite listar, buscar, crear, editar, eliminar y ajustar cantidades de tipos de instrumentos.
 * @component
 * @returns {JSX.Element} Página de tipos de instrumentos.
 */
export default function TiposInstrumento() {
  /** Lista de tipos de instrumentos */
  const [tipos, setTipos] = useState([])
  /** Estado de carga */
  const [loading, setLoading] = useState(true)
  /** Estado de carga para operaciones */
  const [operationLoading, setOperationLoading] = useState(false)
  /** Mensaje de error */
  const [error, setError] = useState(null)
  /** Término de búsqueda */
  const [searchTerm, setSearchTerm] = useState("")
  /** Estado del modal de creación/edición */
  const [showModal, setShowModal] = useState(false)
  /** Modo del modal: "create" o "edit" */
  const [modalMode, setModalMode] = useState("create")
  /** Tipo de instrumento actual para crear/editar */
  const [currentTipo, setCurrentTipo] = useState({ instrumento: "", cantidad: 1 })
  /** Estado del modal de confirmación de borrado */
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  /** Tipo de instrumento a eliminar */
  const [tipoToDelete, setTipoToDelete] = useState(null)
  /** Estado del modal de número de serie */
  const [showSerialModal, setShowSerialModal] = useState(false)
  /** Número de serie para nuevo instrumento */
  const [serialNumber, setSerialNumber] = useState("")
  /** Mensaje de error para validaciones */
  const [validationError, setValidationError] = useState("")

  // Paginación
  /** Página actual */
  const [currentPage, setCurrentPage] = useState(1)
  /** Tipos por página */
  const [itemsPerPage] = useState(5)

  /** Hook de traducción */
  const { t } = useTranslation()
  /** Si el usuario es administrador */
  const { isAdmin } = useAuth()

  /** Estado del modal de gestión de cantidad */
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  /** Acción de cantidad: 'increase' o 'decrease' */
  const [quantityAction, setQuantityAction] = useState(null)
  /** Instrumentos seleccionados para eliminar */
  const [selectedInstruments, setSelectedInstruments] = useState([])
  /** Nueva cantidad a ajustar */
  const [newQuantity, setNewQuantity] = useState(0)
  /** Tipo de instrumento actual para gestión de cantidad */
  const [currentTipoForQuantity, setCurrentTipoForQuantity] = useState(null)
  /** Lista de instrumentos (para gestión de cantidad) */
  const [instrumentos, setInstrumentos] = useState([])

  /**
   * Efecto para cargar tipos e instrumentos al montar el componente.
   */
  useEffect(() => {
    fetchTipos()
    fetchInstrumentos()
  }, [])

  /**
   * Obtiene los tipos de instrumentos desde la API.
   * @async
   */
  const fetchTipos = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get("/tipo-instrumentos")

      // Verificar la estructura de la respuesta
      let tiposData = []
      if (response.data && Array.isArray(response.data)) {
        tiposData = response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        tiposData = response.data.data
      } else {
        setError("Formato de respuesta inesperado. Verifica la consola para más detalles.")
      }

      setTipos(tiposData)
    } catch (error) {
      console.error("Error al cargar tipos de instrumento:", error)
      setError(`Error al cargar tipos de instrumento: ${error.message}`)

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

  /**
   * Obtiene los instrumentos desde la API.
   * @async
   */
  const fetchInstrumentos = async () => {
    try {
      const response = await api.get("/instrumentos")
      setInstrumentos(response.data)
    } catch (error) {
      console.error("Error al cargar instrumentos:", error)
    }
  }

  /**
   * Verifica si un número de serie ya existe
   * @param {string} serial - Número de serie a verificar
   * @returns {boolean} True si ya existe, false si no
   */
  const checkIfSerialExists = (serial) => {
    if (!serial || serial.trim() === "") return false

    return instrumentos.some((instrumento) => {
      // Convertir ambos valores a string para comparar
      const instrumentoSerial = String(instrumento.numero_serie || "")
        .toLowerCase()
        .trim()
      const searchSerial = String(serial).toLowerCase().trim()
      return instrumentoSerial === searchSerial
    })
  }

  /**
   * Verifica si un tipo de instrumento ya existe
   * @param {string} nombreInstrumento - Nombre del instrumento a verificar
   * @returns {boolean} True si ya existe, false si no
   */
  const checkIfTypeExists = (nombreInstrumento) => {
    return tipos.some((tipo) => tipo.instrumento.toLowerCase().trim() === nombreInstrumento.toLowerCase().trim())
  }

  /**
   * Abre el modal para crear o editar un tipo de instrumento.
   * @param {"create"|"edit"} mode - Modo del modal.
   * @param {Object} tipo - Tipo de instrumento a editar (opcional).
   */
  const handleOpenModal = (mode, tipo = { instrumento: "", cantidad: 1 }) => {
    setModalMode(mode)
    setCurrentTipo(mode === "create" ? { instrumento: "", cantidad: 1 } : tipo)
    setCurrentTipoForQuantity(tipo)
    setValidationError("")
    setShowModal(true)
  }

  /**
   * Cierra el modal de creación/edición.
   */
  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentTipo({ instrumento: "", cantidad: 1 })
    setValidationError("")
  }

  /**
   * Maneja el cambio en los campos del formulario del modal.
   * @param {Object} e - Evento de cambio.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Para nuevos tipos, la cantidad siempre es 1 y no se puede cambiar
    if (modalMode === "create" && name === "cantidad") {
      return // No permitir cambios en cantidad para nuevos tipos
    }

    setCurrentTipo((prev) => ({
      ...prev,
      [name]: name === "cantidad" ? Number.parseInt(value, 10) || 0 : value,
    }))

    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationError) {
      setValidationError("")
    }
  }

  /**
   * Envía el formulario para crear o editar un tipo de instrumento.
   * @async
   * @param {Object} e - Evento de envío.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError("")

    try {
      if (modalMode === "create") {
        // Validar que el nombre no esté vacío
        if (!currentTipo.instrumento.trim()) {
          setValidationError("El nombre del instrumento es obligatorio")
          return
        }

        // Verificar si el tipo ya existe
        if (checkIfTypeExists(currentTipo.instrumento)) {
          setValidationError("Ya existe un tipo de instrumento con este nombre")
          return
        }

        // CREAR EL TIPO INMEDIATAMENTE
        setOperationLoading(true)

        try {
          await api.post("/tipo-instrumentos", {
            instrumento: currentTipo.instrumento,
            cantidad: 1,
          })

          // Actualizar la lista de tipos
          await fetchTipos()

          // Cerrar el modal principal y abrir el de número de serie
          setShowModal(false)
          setShowSerialModal(true)
        } catch (error) {
          console.error("Error al crear tipo de instrumento:", error)
          if (error.response?.data?.error) {
            setValidationError("Error al crear el tipo: " + JSON.stringify(error.response.data.error))
          } else {
            setValidationError("Error al crear el tipo de instrumento")
          }
          return
        } finally {
          setOperationLoading(false)
        }

        return
      } else {
        // Resto del código para modo edición permanece igual...
        const oldQuantity = currentTipoForQuantity?.cantidad || 0
        const newQuantityValue = currentTipo.cantidad

        if (newQuantityValue > oldQuantity) {
          setQuantityAction("increase")
          setNewQuantity(newQuantityValue - oldQuantity)
          setCurrentTipoForQuantity(currentTipo)
          setShowQuantityModal(true)
          return
        } else if (newQuantityValue < oldQuantity) {
          setQuantityAction("decrease")
          setNewQuantity(oldQuantity - newQuantityValue)
          setCurrentTipoForQuantity(currentTipo)

          const instrumentsOfType = instrumentos.filter((i) => i.instrumento_tipo_id === currentTipo.instrumento)
          setSelectedInstruments(instrumentsOfType)
          setShowQuantityModal(true)
          return
        }

        setOperationLoading(true)
        await api.put(`/tipo-instrumentos/${encodeURIComponent(currentTipo.instrumento)}`, {
          cantidad: currentTipo.cantidad,
        })
      }

      await fetchTipos()
      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar tipo de instrumento:", error)
      setValidationError("Error al guardar el tipo de instrumento")
    } finally {
      setOperationLoading(false)
    }
  }

  /**
   * Maneja la creación del instrumento con número de serie (el tipo ya existe)
   */
  const handleCreateWithSerial = async () => {
    if (!serialNumber.trim()) {
      setValidationError("El número de serie es obligatorio")
      return
    }

    // Verificar si el número de serie ya existe antes de enviar
    if (checkIfSerialExists(serialNumber)) {
      setValidationError("Este número de serie ya existe")
      return
    }

    try {
      setOperationLoading(true)

      // El tipo ya existe, solo crear el instrumento
      await api.post("/instrumentos", {
        numero_serie: serialNumber.trim(),
        instrumento_tipo_id: currentTipo.instrumento,
        estado: "disponible",
      })

      // Actualizar la lista de instrumentos
      await fetchInstrumentos()

      // Cerrar modales y limpiar estados
      setShowSerialModal(false)
      setSerialNumber("")
      setCurrentTipo({ instrumento: "", cantidad: 1 })
      setValidationError("")

      // Mostrar mensaje de éxito
      console.log("Tipo de instrumento e instrumento creados exitosamente")
    } catch (error) {
      console.error("Error al crear instrumento:", error)

      if (error.response?.data?.error?.numero_serie) {
        setValidationError(error.response.data.error.numero_serie[0])
      } else if (error.response?.data?.error?.instrumento_tipo_id) {
        setValidationError(
          "Error: El tipo de instrumento no existe. " + error.response.data.error.instrumento_tipo_id[0],
        )
      } else {
        setValidationError("Error al crear el instrumento. Por favor, inténtelo de nuevo.")
      }
    } finally {
      setOperationLoading(false)
    }
  }

  /**
   * Abre el modal de confirmación de borrado para un tipo de instrumento.
   * @param {string} instrumento - Nombre del instrumento a eliminar.
   */
  const confirmDelete = (instrumento) => {
    setTipoToDelete(instrumento)
    setShowDeleteModal(true)
  }

  /**
   * Elimina un tipo de instrumento.
   * @async
   */
  const handleDelete = async () => {
    if (!tipoToDelete) return

    try {
      setOperationLoading(true)
      await api.delete(`/tipo-instrumentos/${encodeURIComponent(tipoToDelete)}`)
      await fetchTipos()
      setShowDeleteModal(false)
      setTipoToDelete(null)
    } catch (error) {
      console.error("Error al eliminar tipo de instrumento:", error)
    } finally {
      setOperationLoading(false)
    }
  }

  /** Filtra los tipos de instrumentos según el término de búsqueda */
  const filteredTipos = tipos.filter((tipo) => tipo.instrumento.toLowerCase().includes(searchTerm.toLowerCase()))

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTipos = filteredTipos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage)

  /**
   * Cambia la página actual de la paginación.
   * @param {number} pageNumber - Número de página a mostrar.
   */
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Renderizado principal de la página de tipos de instrumentos
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Overlay de carga para operaciones */}
      {operationLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C0C0C0]"></div>
              <span className="text-[#C0C0C0]">Procesando...</span>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C0C0C0]"></div>
              <span className="text-[#C0C0C0]">{t("common.loading")}</span>
            </div>
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

            {validationError && (
              <div className="bg-red-900/20 border border-red-800 text-red-100 px-3 py-2 rounded-md mb-4 text-sm">
                {validationError}
              </div>
            )}

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
                    disabled={modalMode === "edit"}
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
                    disabled={modalMode === "create"}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {modalMode === "create" && (
                    <p className="text-xs text-gray-500">Los nuevos tipos siempre tienen cantidad 1</p>
                  )}
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

      {/* Modal de número de serie para nuevos tipos */}
      {showSerialModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">Añadir instrumentos</h3>
            <p className="text-gray-400 mb-4">
              Se van a añadir 1 instrumentos de tipo "{currentTipo.instrumento}". Proporciona los números de serie:
            </p>

            {validationError && (
              <div className="bg-red-900/20 border border-red-800 text-red-100 px-3 py-2 rounded-md mb-4 text-sm">
                {validationError}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Número de serie 1"
                value={serialNumber}
                onChange={(e) => {
                  const newValue = e.target.value
                  setSerialNumber(newValue)

                  // Validar en tiempo real si el número de serie ya existe
                  if (checkIfSerialExists(newValue)) {
                    setValidationError("Este número de serie ya existe")
                  } else {
                    setValidationError("")
                  }
                }}
                className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  // Si cancelamos después de crear el tipo, necesitamos eliminar el tipo creado
                  const shouldDeleteType = window.confirm(
                    "¿Estás seguro de cancelar? El tipo de instrumento ya fue creado. Si cancelas, se eliminará el tipo.",
                  )

                  if (shouldDeleteType) {
                    // Eliminar el tipo creado
                    api
                      .delete(`/tipo-instrumentos/${encodeURIComponent(currentTipo.instrumento)}`)
                      .then(() => {
                        fetchTipos()
                      })
                      .catch((error) => {
                        console.error("Error al eliminar tipo:", error)
                      })
                  }

                  setShowSerialModal(false)
                  setSerialNumber("")
                  setValidationError("")
                  setCurrentTipo({ instrumento: "", cantidad: 1 })
                }}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateWithSerial}
                disabled={!serialNumber.trim() || validationError !== ""}
                className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
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
                {Array.from({ length: newQuantity }, (_, i) => {
                  const currentSerials = currentTipoForQuantity.newSerials || []
                  const currentValue = currentSerials[i] || ""
                  const isNumeric = /^\d+$/.test(currentValue.trim()) || currentValue.trim() === ""

                  return (
                    <div key={i} className="space-y-1">
                      <input
                        type="text"
                        placeholder={`Número de serie ${i + 1}`}
                        value={currentValue}
                        className={`w-full py-2 px-3 bg-gray-900/50 border rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] ${
                          !isNumeric ? "border-red-500" : "border-gray-800"
                        }`}
                        onChange={(e) => {
                          const newSerials = [...(currentTipoForQuantity.newSerials || [])]
                          newSerials[i] = e.target.value
                          setCurrentTipoForQuantity({ ...currentTipoForQuantity, newSerials })
                        }}
                      />
                      {!isNumeric && currentValue.trim() !== "" && (
                        <p className="text-xs text-red-400">El número de serie debe ser numérico</p>
                      )}
                    </div>
                  )
                })}
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
                  setShowModal(false)
                  setCurrentTipoForQuantity(null)
                  setCurrentTipo({ instrumento: "", cantidad: 1 })
                }}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                disabled={
                  (quantityAction === "decrease" &&
                    (!currentTipoForQuantity.toDelete || currentTipoForQuantity.toDelete.length !== newQuantity)) ||
                  (quantityAction === "increase" &&
                    (!currentTipoForQuantity.newSerials ||
                      currentTipoForQuantity.newSerials.length < newQuantity ||
                      currentTipoForQuantity.newSerials.some(
                        (serial, index) =>
                          index < newQuantity && (!serial || serial.trim() === "" || !/^\d+$/.test(serial.trim())),
                      )))
                }
                onClick={async () => {
                  try {
                    setOperationLoading(true)

                    if (quantityAction === "increase") {
                      // Validar que todos los números de serie sean numéricos antes de crear
                      const serials = currentTipoForQuantity.newSerials || []
                      for (let i = 0; i < newQuantity; i++) {
                        const serial = serials[i]
                        if (!serial || serial.trim() === "" || !/^\d+$/.test(serial.trim())) {
                          alert(`El número de serie ${i + 1} debe ser numérico y no puede estar vacío`)
                          return
                        }
                      }

                      // Create new instruments
                      for (let i = 0; i < newQuantity; i++) {
                        const serial = serials[i]
                        if (serial) {
                          await api.post("/instrumentos", {
                            numero_serie: serial.trim(),
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

                    await fetchTipos()
                    await fetchInstrumentos()
                    setShowQuantityModal(false)
                    setShowModal(false)
                    setCurrentTipoForQuantity(null)
                    setCurrentTipo({ instrumento: "", cantidad: 1 })
                  } catch (error) {
                    console.error("Error al actualizar cantidad:", error)
                  } finally {
                    setOperationLoading(false)
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
