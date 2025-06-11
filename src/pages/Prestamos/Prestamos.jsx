/**
 * @file Prestamos.jsx
 * @module pages/Prestamos/Prestamos
 * @description Página de gestión de préstamos de instrumentos. Permite crear, devolver, eliminar, filtrar y buscar préstamos, así como actualizar el estado de los instrumentos asociados. Incluye paginación, validaciones y mensajes de error/success. Solo los administradores pueden crear, devolver o eliminar préstamos.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState, useEffect } from "react"
import { Plus, ArrowLeft, ArrowRight, Trash2, Search, Filter, Package, Calendar, User, Check } from "lucide-react"
import api from "../../api/axios"
import { toast } from "react-toastify"
import { useTranslation } from "../../hooks/useTranslation"
import { useAuth } from "../../context/AuthContext"

/**
 * Componente principal para la gestión de préstamos de instrumentos.
 * Permite listar, buscar, filtrar, crear, devolver y eliminar préstamos.
 * @component
 * @returns {JSX.Element} Página de préstamos.
 */
export default function Prestamos() {
  /** Hook de traducción */
  const { t } = useTranslation()
  /** Lista de préstamos */
  const [prestamos, setPrestamos] = useState([])
  /** Estado de carga */
  const [loading, setLoading] = useState(true)
  /** Mensaje de error */
  const [error, setError] = useState(null)
  /** Lista de usuarios */
  const [usuarios, setUsuarios] = useState([])
  /** Lista de instrumentos */
  const [instrumentos, setInstrumentos] = useState([])
  /** Término de búsqueda */
  const [searchTerm, setSearchTerm] = useState("")
  /** Filtro por usuario */
  const [usuarioFilter, setUsuarioFilter] = useState("")
  /** Filtro por estado del préstamo */
  const [estadoFilter, setEstadoFilter] = useState("")
  /** Estado del modal de creación */
  const [showModal, setShowModal] = useState(false)
  /** Préstamo actual para crear/editar */
  const [currentPrestamo, setCurrentPrestamo] = useState({
    num_serie: "",
    usuario_id: "",
    fecha_prestamo: new Date().toISOString().split("T")[0],
    fecha_devolucion: "",
  })
  /** Estado del modal de confirmación de borrado */
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  /** Préstamo a eliminar */
  const [prestamoToDelete, setPrestamoToDelete] = useState(null)
  /** Mostrar advertencia si el instrumento ya está prestado */
  const [showInstrumentWarning, setShowInstrumentWarning] = useState(false)

  /** Página actual de la paginación */
  const [currentPage, setCurrentPage] = useState(1)
  /** Préstamos por página */
  const itemsPerPage = 10

  /** Si el usuario es administrador */
  const { isAdmin } = useAuth()

  /**
   * Carga los datos de préstamos, usuarios e instrumentos desde la API.
   * Incluye comprobaciones de consistencia y logs de depuración.
   * @async
   */
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      // console.log("🔄 Loading loans data...")

      const [prestamosRes, usuariosRes, instrumentosRes] = await Promise.all([
        api.get("/prestamos"),
        api.get("/usuarios"),
        api.get("/instrumentos"),
      ])

      // console.log("✅ API responses received:")
      // console.log("- Préstamos:", prestamosRes.data?.length || 0, "records")
      // console.log("- Usuarios:", usuariosRes.data?.length || 0, "records")
      // console.log("- Instrumentos:", instrumentosRes.data?.length || 0, "records")

      // Procesar datos de préstamos
      let prestamosData = []
      if (prestamosRes.data && Array.isArray(prestamosRes.data)) {
        prestamosData = prestamosRes.data
      } else if (prestamosRes.data && prestamosRes.data.data && Array.isArray(prestamosRes.data.data)) {
        prestamosData = prestamosRes.data.data
      } else {
        // console.warn("Formato de respuesta inesperado para préstamos:", prestamosRes.data)
      }
      setPrestamos(prestamosData)

      // Procesar datos de usuarios
      let usuariosData = []
      if (usuariosRes.data && Array.isArray(usuariosRes.data)) {
        usuariosData = usuariosRes.data
      } else if (usuariosRes.data && usuariosRes.data.data && Array.isArray(usuariosRes.data.data)) {
        usuariosData = usuariosRes.data.data
      } else {
        // console.warn("Formato de respuesta inesperado para usuarios:", usuariosRes.data)
      }
      setUsuarios(usuariosData)

      // Procesar datos de instrumentos
      let instrumentosData = []
      if (instrumentosRes.data && Array.isArray(instrumentosRes.data)) {
        instrumentosData = instrumentosRes.data
      } else if (instrumentosRes.data && instrumentosRes.data.data && Array.isArray(instrumentosRes.data.data)) {
        instrumentosData = instrumentosRes.data.data
      } else {
        // console.warn("Formato de respuesta inesperado para instrumentos:", instrumentosRes.data)
      }
      setInstrumentos(instrumentosData)

      // Comprobación de inconsistencias entre préstamos e instrumentos
      // console.log("🔍 Checking for data inconsistencies...")
      prestamosData.forEach((prestamo) => {
        const instrumento = instrumentosData.find((i) => String(i.numero_serie) === String(prestamo.num_serie))
        if (instrumento) {
          const isLoanActive = !prestamo.fecha_devolucion || prestamo.fecha_devolucion === ""
          const isInstrumentLoaned = instrumento.estado === "prestado"

          if (isLoanActive && !isInstrumentLoaned) {
            // console.warn(
            //   `⚠️ Inconsistency: Active loan for instrument ${prestamo.num_serie} but instrument status is '${instrumento.estado}'`,
            // )
          } else if (!isLoanActive && isInstrumentLoaned) {
            // console.warn(
            //   `⚠️ Inconsistency: Returned loan for instrument ${prestamo.num_serie} but instrument status is still 'prestado'`,
            // )
          }
        }
      })

      // console.log("✅ Data loading completed successfully")
    } catch (error) {
      // console.error("❌ Error loading data:", error)
      setError(`Error al cargar datos: ${error.message}`)

      // Intentar determinar el tipo de error
      if (error.response) {
        // console.error("Respuesta del servidor:", error.response.status, error.response.data)
        setError(`Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
      } else if (error.request) {
        // console.error("No se recibió respuesta del servidor")
        setError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.")
      } else {
        // console.error("Error de configuración:", error.message)
        setError(`Error de configuración: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Efecto para cargar los datos al montar el componente.
   */
  useEffect(() => {
    fetchData()
  }, [])

  /**
   * Abre el modal para crear un nuevo préstamo.
   */
  const handleOpenModal = () => {
    setCurrentPrestamo({
      num_serie: "",
      usuario_id: "",
      fecha_prestamo: new Date().toISOString().split("T")[0],
      fecha_devolucion: "",
    })
    setShowInstrumentWarning(false)
    setShowModal(true)
  }

  /**
   * Cierra el modal de creación/edición.
   */
  const handleCloseModal = () => {
    setShowModal(false)
    setShowInstrumentWarning(false)
  }

  /**
   * Maneja el cambio en los campos del formulario de préstamo.
   * @param {Object} e - Evento de cambio.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    const newPrestamo = { ...currentPrestamo, [name]: value }
    setCurrentPrestamo(newPrestamo)

    // Verificar si el instrumento ya está prestado cuando se selecciona
    if (name === "num_serie" && value) {
      const instrumentoYaPrestado = prestamos.some(
        (prestamo) => prestamo.num_serie === value && !prestamo.fecha_devolucion,
      )
      setShowInstrumentWarning(instrumentoYaPrestado)
    } else if (name === "num_serie" && !value) {
      setShowInstrumentWarning(false)
    }
  }

  /**
   * Envía el formulario para crear un nuevo préstamo.
   * @async
   * @param {Object} e - Evento de envío.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Si hay advertencia de instrumento prestado, no permitir envío
      if (showInstrumentWarning) {
        toast.error(t("loans.instrumentAlreadyLoaned"))
        return
      }

      // console.log(`🔄 Creating loan for instrument ${currentPrestamo.num_serie}`)

      // Crear el préstamo con el formato correcto
      const prestamoData = {
        num_serie: currentPrestamo.num_serie,
        usuario_id: Number.parseInt(currentPrestamo.usuario_id),
        fecha_prestamo: currentPrestamo.fecha_prestamo,
        fecha_devolucion: "",
      }

      await api.post("/prestamos", prestamoData)
      // console.log(`✅ Loan created successfully`)

      // Obtener el tipo de instrumento antes de actualizar
      const instrumento = instrumentos.find((i) => i.numero_serie === currentPrestamo.num_serie)
      const instrumento_tipo_id = instrumento ? instrumento.instrumento_tipo_id : null

      // Actualizar estado del instrumento a "prestado"
      try {
        // console.log(`🔄 Updating instrument ${currentPrestamo.num_serie} status to 'prestado'`)

        const updateResponse = await api.put(`/instrumentos/${currentPrestamo.num_serie}`, {
          estado: "prestado",
          instrumento_tipo_id: instrumento_tipo_id,
        })

        // console.log(`✅ Instrument ${currentPrestamo.num_serie} status updated successfully:`, updateResponse.data)
      } catch (instrumentError) {
        // console.error(`❌ Error updating instrument ${currentPrestamo.num_serie} status:`, instrumentError)

        if (instrumentError.response) {
          // console.error("Error response:", instrumentError.response.status, instrumentError.response.data)
          toast.error(`Error ${instrumentError.response.status}: No se pudo actualizar el estado del instrumento`)
        } else {
          toast.error("Error al actualizar el estado del instrumento")
        }
      }

      toast.success(t("loans.loanCreatedSuccessfully"))

      // Recargar los datos
      // console.log("🔄 Reloading data after loan creation...")
      await fetchData()
      handleCloseModal()
      // console.log("✅ Loan creation process completed")
    } catch (error) {
      // console.error("❌ Error creating loan:", error)
      if (error.response) {
        // console.error("Error details:", error.response.data)
        toast.error(`Error al crear préstamo: ${JSON.stringify(error.response.data)}`)
      } else {
        toast.error(t("loans.errorSavingLoan"))
      }
    }
  }

  /**
   * Marca un préstamo como devuelto y actualiza el estado del instrumento.
   * @async
   * @param {Object} prestamo - Préstamo a devolver.
   */
  const handleDevolver = async (prestamo) => {
    try {
      const fechaActual = new Date().toISOString().split("T")[0]

      // console.log(`🔄 Returning loan for instrument ${prestamo.num_serie}`)

      // Actualizar el préstamo con la fecha de devolución
      await api.put(`/prestamos/${prestamo.num_serie}/${prestamo.usuario_id}`, {
        fecha_prestamo: prestamo.fecha_prestamo,
        fecha_devolucion: fechaActual,
      })
      // console.log(`✅ Loan updated with return date: ${fechaActual}`)

      // Obtener el tipo de instrumento antes de actualizar
      const instrumento = instrumentos.find((i) => i.numero_serie === prestamo.num_serie)
      const instrumento_tipo_id = instrumento ? instrumento.instrumento_tipo_id : null

      if (!instrumento_tipo_id) {
        // console.error(`❌ Could not find instrument type for ${prestamo.num_serie}`)
      }

      // Actualizar estado del instrumento a "disponible"
      try {
        // console.log(`🔄 Updating instrument ${prestamo.num_serie} status to 'disponible'`)
        // console.log(`Using instrument_tipo_id: ${instrumento_tipo_id}`)

        if (!instrumento_tipo_id) {
          // console.error(`❌ No se pudo encontrar el tipo de instrumento para ${prestamo.num_serie}`)
          toast.error(`Error: No se pudo determinar el tipo de instrumento para actualizar su estado`)
          return
        }

        const updateResponse = await api.put(`/instrumentos/${prestamo.num_serie}`, {
          estado: "disponible",
          instrumento_tipo_id: instrumento_tipo_id,
        })

        // console.log(`✅ Instrument ${prestamo.num_serie} status updated successfully:`, updateResponse.data)

        // Actualizar estado local de instrumentos inmediatamente
        setInstrumentos((prevInstrumentos) =>
          prevInstrumentos.map((inst) =>
            inst.numero_serie === prestamo.num_serie ? { ...inst, estado: "disponible" } : inst,
          ),
        )
      } catch (instrumentError) {
        // console.error(`❌ Error updating instrument ${prestamo.num_serie} status:`, instrumentError)

        if (instrumentError.response) {
          // console.error("Error response:", instrumentError.response.status, instrumentError.response.data)
          toast.error(
            `Error ${instrumentError.response.status}: No se pudo actualizar el estado del instrumento ${prestamo.num_serie}. Detalles: ${JSON.stringify(instrumentError.response.data)}`,
          )
        } else {
          toast.error(`Error al actualizar el estado del instrumento ${prestamo.num_serie}`)
        }
      }

      toast.success(t("loans.loanReturnedSuccessfully"))

      // Actualizar estado local de préstamos inmediatamente
      setPrestamos((prevPrestamos) =>
        prevPrestamos.map((p) =>
          p.num_serie === prestamo.num_serie && p.usuario_id === prestamo.usuario_id
            ? { ...p, fecha_devolucion: fechaActual }
            : p,
        ),
      )

      // Recargar todos los datos para asegurar consistencia
      // console.log("🔄 Reloading all data to ensure consistency...")
      setTimeout(async () => {
        await fetchData()
        // console.log("✅ Data reloaded successfully")
      }, 1000)
    } catch (error) {
      // console.error("Error al devolver el préstamo:", error)
      if (error.response) {
        // console.error("Error details:", error.response.data)
        toast.error(`Error al devolver préstamo: ${JSON.stringify(error.response.data)}`)
      } else {
        toast.error(t("loans.errorReturningLoan"))
      }
    }
  }

  /**
   * Elimina un préstamo y actualiza el estado del instrumento.
   * @async
   */
  const handleDelete = async () => {
    if (!prestamoToDelete) return

    try {
      // console.log(`🗑️ Deleting loan for instrument ${prestamoToDelete.numSerie}`)

      // Eliminar el préstamo
      await api.delete(`/prestamos/${prestamoToDelete.numSerie}/${prestamoToDelete.usuarioId}`)
      // console.log(`✅ Loan deleted successfully`)

      // Obtener el tipo de instrumento antes de actualizar
      const instrumento = instrumentos.find((i) => i.numero_serie === prestamoToDelete.numSerie)
      const instrumento_tipo_id = instrumento ? instrumento.instrumento_tipo_id : null

      // Actualizar estado del instrumento a "disponible"
      try {
        // console.log(`🔄 Updating instrument ${prestamoToDelete.numSerie} status to 'disponible'`)

        if (!instrumento_tipo_id) {
          // console.error(`❌ No se pudo encontrar el tipo de instrumento para ${prestamoToDelete.numSerie}`)
          toast.error(`Error: No se pudo determinar el tipo de instrumento para actualizar su estado`)
          return
        }

        const updateResponse = await api.put(`/instrumentos/${prestamoToDelete.numSerie}`, {
          estado: "disponible",
          instrumento_tipo_id: instrumento_tipo_id,
        })

        // console.log(`✅ Instrument ${prestamoToDelete.numSerie} status updated successfully:`, updateResponse.data)

        // Actualizar estado local de instrumentos inmediatamente
        setInstrumentos((prevInstrumentos) =>
          prevInstrumentos.map((inst) =>
            inst.numero_serie === prestamoToDelete.numSerie ? { ...inst, estado: "disponible" } : inst,
          ),
        )
      } catch (instrumentError) {
        // console.error(`❌ Error updating instrument ${prestamoToDelete.numSerie} status:`, instrumentError)

        if (instrumentError.response) {
          // console.error("Error response:", instrumentError.response.status, instrumentError.response.data)
          toast.error(
            `Error ${instrumentError.response.status}: No se pudo actualizar el estado del instrumento. Detalles: ${JSON.stringify(instrumentError.response.data)}`,
          )
        } else {
          toast.error("Error al actualizar el estado del instrumento")
        }
      }

      // Actualizar estado local de préstamos inmediatamente
      setPrestamos((prevPrestamos) =>
        prevPrestamos.filter(
          (prestamo) =>
            !(prestamo.num_serie === prestamoToDelete.numSerie && prestamo.usuario_id === prestamoToDelete.usuarioId),
        ),
      )

      setShowDeleteModal(false)
      setPrestamoToDelete(null)
      toast.success(t("loans.loanDeletedSuccessfully"))

      // Recargar datos para asegurar consistencia
      // console.log("🔄 Reloading data after loan deletion...")
      setTimeout(async () => {
        await fetchData()
        // console.log("✅ Data reloaded after loan deletion")
      }, 1000)
    } catch (error) {
      // console.error("❌ Error deleting loan:", error)
      if (error.response) {
        // console.error("Error details:", error.response.data)
        toast.error(`Error al eliminar préstamo: ${JSON.stringify(error.response.data)}`)
      } else {
        toast.error(t("loans.errorDeletingLoan"))
      }
    }
  }

  /**
   * Abre el modal de confirmación de borrado para un préstamo.
   * @param {string|number} numSerie - Número de serie del instrumento.
   * @param {string|number} usuarioId - ID del usuario.
   */
  const confirmDelete = (numSerie, usuarioId) => {
    setPrestamoToDelete({ numSerie, usuarioId })
    setShowDeleteModal(true)
  }

  /**
   * Filtra los préstamos según búsqueda y filtros seleccionados.
   * @type {Array}
   */
  const filteredPrestamos = prestamos.filter((prestamo) => {
    const instrumento = instrumentos.find((i) => i.numero_serie === prestamo.num_serie)
    const usuario = usuarios.find((u) => u.id === prestamo.usuario_id)

    const matchesSearch =
      (instrumento &&
        instrumento.instrumento_tipo_id &&
        instrumento.instrumento_tipo_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario && `${usuario.nombre} ${usuario.apellido1}`.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesUsuario = usuarioFilter === "" || prestamo.usuario_id.toString() === usuarioFilter

    // Determinar el estado del préstamo (activo o devuelto)
    const estado = prestamo.fecha_devolucion ? "devuelto" : "activo"
    const matchesEstado = estadoFilter === "" || estado === estadoFilter

    return matchesSearch && matchesUsuario && matchesEstado
  })

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredPrestamos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPrestamos.length / itemsPerPage)

  /**
   * Devuelve el tipo de instrumento a partir del número de serie.
   * @param {string|number} numSerie - Número de serie del instrumento.
   * @returns {string} Tipo de instrumento o "Desconocido".
   */
  const getInstrumentoInfo = (numSerie) => {
    const instrumento = instrumentos.find((i) => i.numero_serie === numSerie)
    if (!instrumento) return "Desconocido"
    return instrumento.instrumento_tipo_id || "Desconocido"
  }

  /**
   * Devuelve el nombre del usuario a partir de su ID.
   * @param {string|number} usuarioId - ID del usuario.
   * @returns {string} Nombre del usuario o "Desconocido".
   */
  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuarios.find((u) => u.id === usuarioId)
    return usuario ? `${usuario.nombre} ${usuario.apellido1}` : "Desconocido"
  }

  /**
   * Formatea una fecha a DD/MM/YYYY.
   * @param {string} dateString - Fecha en formato ISO.
   * @returns {string} Fecha formateada.
   */
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  // Renderizado principal de la página de préstamos
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">{t("loans.title")}</h1>
        {isAdmin && (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            <Plus size={18} />
            {t("loans.newLoan")}
          </button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder={t("loans.searchByInstrumentOrUser")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <select
              value={usuarioFilter}
              onChange={(e) => setUsuarioFilter(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
            >
              <option value="">{t("loans.allUsers")}</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id.toString()}>
                  {usuario.nombre} {usuario.apellido1}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
            >
              <option value="">{t("loans.allStatuses")}</option>
              <option value="activo">{t("loans.active")}</option>
              <option value="devuelto">{t("loans.returned")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de préstamos */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">{t("loans.loadingLoans")}</div>
          </div>
        ) : filteredPrestamos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Package size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm || usuarioFilter || estadoFilter ? t("loans.noLoansWithFilters") : t("loans.noLoans")}
            </p>
            {isAdmin && (
              <button onClick={handleOpenModal} className="mt-4 text-[#C0C0C0] hover:text-white underline">
                {t("loans.addFirstLoan")}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t("loans.instrument")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t("loans.user")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t("loans.loanDate")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t("loans.returnDate")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {t("common.status")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {isAdmin ? t("common.actions") : ""}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {currentItems.map((prestamo) => {
                  const estado = prestamo.fecha_devolucion ? "devuelto" : "activo"
                  return (
                    <tr key={`${prestamo.num_serie}-${prestamo.usuario_id}`} className="hover:bg-gray-900/30">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                        <div>
                          <div className="font-medium">{getInstrumentoInfo(prestamo.num_serie)}</div>
                          <div className="text-xs text-gray-400">#{prestamo.num_serie}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                        {getUsuarioNombre(prestamo.usuario_id)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                        {formatDate(prestamo.fecha_prestamo)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                        {formatDate(prestamo.fecha_devolucion)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            estado === "activo"
                              ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                              : "bg-green-900/30 text-green-400 border border-green-800"
                          }`}
                        >
                          {estado === "activo" ? t("loans.active") : t("loans.returned")}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                        {isAdmin && (
                          <div className="flex space-x-2">
                            {estado === "activo" && (
                              <button
                                onClick={() => handleDevolver(prestamo)}
                                className="p-1 text-gray-400 hover:text-green-400"
                                title={t("loans.returnLoan")}
                              >
                                <Check size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => confirmDelete(prestamo.num_serie, prestamo.usuario_id)}
                              className="p-1 text-gray-400 hover:text-red-400"
                              title={t("loans.deleteLoan")}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {filteredPrestamos.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
            <div className="text-sm text-gray-400">
              {t("eventConfirmation.showing")} {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredPrestamos.length)} {" "}
              {filteredPrestamos.length} {t("loans.loans")}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-900/50 text-[#C0C0C0] border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ArrowLeft size={16} className="mr-1" /> {t("common.previous")}
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-900/50 text-[#C0C0C0] border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {t("common.next")} <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear préstamo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">{t("loans.newLoan")}</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Mensaje de advertencia para instrumento ya prestado */}
                {showInstrumentWarning && (
                  <div className="bg-yellow-900/20 border border-yellow-800 text-yellow-100 px-4 py-3 rounded-md flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-0.5">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm">{t("loans.instrumentAlreadyLoanedWarning")}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="num_serie" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("loans.instrument")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Package size={18} />
                    </div>
                    <select
                      id="num_serie"
                      name="num_serie"
                      value={currentPrestamo.num_serie}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] max-h-32 overflow-y-auto"
                      size="1"
                    >
                      <option value="">{t("loans.selectInstrument")}</option>
                      {instrumentos
                        .filter((instrumento) => instrumento.estado === "disponible")
                        .map((instrumento) => (
                          <option key={instrumento.numero_serie} value={instrumento.numero_serie}>
                            {instrumento.instrumento_tipo_id} - #{instrumento.numero_serie}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="usuario_id" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("loans.user")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <User size={18} />
                    </div>
                    <select
                      id="usuario_id"
                      name="usuario_id"
                      value={currentPrestamo.usuario_id}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    >
                      <option value="">{t("loans.selectUser")}</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nombre} {usuario.apellido1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="fecha_prestamo" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("loans.loanDate")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      id="fecha_prestamo"
                      name="fecha_prestamo"
                      value={currentPrestamo.fecha_prestamo}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="fecha_devolucion" className="block text-[#C0C0C0] text-sm font-medium">
                    {t("loans.returnDate")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      id="fecha_devolucion"
                      name="fecha_devolucion"
                      value={currentPrestamo.fecha_devolucion}
                      onChange={handleInputChange}
                      className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-md bg-gray-800 text-[#C0C0C0] border border-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-500 transition-colors"
                  >
                    {t("loans.createLoan")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-[#C0C0C0] mb-4">{t("loans.confirmDeleteTitle")}</h3>
            <p className="text-sm text-gray-400 mb-4">
              {t("loans.confirmDeleteMessage")}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-md bg-gray-800 text-[#C0C0C0] border border-gray-700 hover:bg-gray-700 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors"
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