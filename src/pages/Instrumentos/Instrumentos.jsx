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
  const [usuarios, setUsuarios] = useState([])
  const [prestamos, setPrestamos] = useState([])
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

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

  // Estado separado para el usuario del préstamo (no va en la tabla instrumentos)
  const [selectedLoanUser, setSelectedLoanUser] = useState("")

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

      const [instrumentosRes, tiposRes, usuariosRes, prestamosRes] = await Promise.all([
        api.get("/instrumentos"),
        api.get("/tipo-instrumentos"),
        api.get("/usuarios"),
        api.get("/prestamos"),
      ])

      console.log("Respuesta de instrumentos:", instrumentosRes)
      console.log("Respuesta de tipos:", tiposRes)
      console.log("Respuesta de usuarios:", usuariosRes)
      console.log("Respuesta de préstamos:", prestamosRes)

      setInstrumentos(instrumentosRes.data)
      setTiposInstrumento(tiposRes.data)

      // Debug: Log the structure of tipos de instrumento
      console.log("🔍 Estructura de tipos de instrumento:", tiposRes.data)
      if (tiposRes.data && tiposRes.data.length > 0) {
        console.log("🔍 Primer tipo de instrumento:", tiposRes.data[0])
        console.log("🔍 Claves disponibles:", Object.keys(tiposRes.data[0]))
      }

      // Procesar datos de usuarios igual que en Prestamos.jsx
      let usuariosData = []
      if (usuariosRes.data && Array.isArray(usuariosRes.data)) {
        usuariosData = usuariosRes.data
      } else if (usuariosRes.data && usuariosRes.data.data && Array.isArray(usuariosRes.data.data)) {
        usuariosData = usuariosRes.data.data
      }
      setUsuarios(usuariosData)

      // Procesar datos de préstamos igual que en Prestamos.jsx
      let prestamosData = []
      if (prestamosRes.data && Array.isArray(prestamosRes.data)) {
        prestamosData = prestamosRes.data
      } else if (prestamosRes.data && prestamosRes.data.data && Array.isArray(prestamosRes.data.data)) {
        prestamosData = prestamosRes.data.data
      }
      setPrestamos(prestamosData)

      console.log("Préstamos procesados:", prestamosData)
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
      // First, delete any active loans for this instrument
      const prestamosActivos = prestamos.filter(
        (prestamo) =>
          String(prestamo.num_serie) === String(instrumentoToDelete) &&
          (!prestamo.fecha_devolucion || prestamo.fecha_devolucion === ""),
      )

      console.log(`🔄 Eliminando ${prestamosActivos.length} préstamos activos para instrumento ${instrumentoToDelete}`)

      for (const prestamo of prestamosActivos) {
        try {
          await api.delete(`/prestamos/${prestamo.num_serie}/${prestamo.usuario_id}`)
          console.log(`✅ Préstamo eliminado: ${prestamo.num_serie}/${prestamo.usuario_id}`)
        } catch (error) {
          console.error(`❌ Error al eliminar préstamo ${prestamo.num_serie}/${prestamo.usuario_id}:`, error)
        }
      }

      // Then delete the instrument
      await api.delete(`/instrumentos/${instrumentoToDelete}`)
      setInstrumentos(instrumentos.filter((item) => item.numero_serie !== instrumentoToDelete))
      setShowDeleteModal(false)
      setInstrumentoToDelete(null)

      // Mostrar mensaje de éxito
      setSuccessMessage("Instrumento y préstamos asociados eliminados correctamente")
      setTimeout(() => setSuccessMessage(null), 3000)

      // Reload data to ensure consistency
      await fetchData()
    } catch (error) {
      console.error("Error al eliminar instrumento:", error)
      setErrorMessage(`Error al eliminar instrumento: ${error.message}`)
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  const confirmDelete = (numSerie) => {
    setInstrumentoToDelete(numSerie)
    setShowDeleteModal(true)
  }

  const handleOpenModal = async (mode, instrumento = null) => {
    setModalMode(mode)
    if (mode === "edit" && instrumento) {
      console.log("Opening edit modal for instrument:", instrumento)

      let usuarioPrestamo = ""

      // If the instrument is loaned, find the current loan using the same logic as Prestamos.jsx
      if (instrumento.estado === "prestado") {
        console.log("Fetching loan info for instrument:", instrumento.numero_serie)
        console.log("Available loans:", prestamos)

        // Find active loan for this instrument
        // Note: prestamos uses 'num_serie' while instrumentos uses 'numero_serie'
        const prestamoActivo = prestamos.find((prestamo) => {
          console.log("Comparing loan:", {
            prestamoNumSerie: prestamo.num_serie,
            instrumentoNumSerie: instrumento.numero_serie,
            fechaDevolucion: prestamo.fecha_devolucion,
            isActive: !prestamo.fecha_devolucion || prestamo.fecha_devolucion === "",
          })

          // Check if num_serie matches numero_serie and loan is active (no fecha_devolucion)
          return (
            String(prestamo.num_serie) === String(instrumento.numero_serie) &&
            (!prestamo.fecha_devolucion || prestamo.fecha_devolucion === "")
          )
        })

        console.log("Active loan found:", prestamoActivo)

        if (prestamoActivo && prestamoActivo.usuario_id) {
          usuarioPrestamo = String(prestamoActivo.usuario_id)
          console.log("Setting user loan to:", usuarioPrestamo)

          // Verify the user exists in the users list
          const usuarioEncontrado = usuarios.find((u) => String(u.id) === usuarioPrestamo)
          console.log("User found in users list:", usuarioEncontrado)
        } else {
          console.log("No active loan found for instrument:", instrumento.numero_serie)
        }
      }

      setCurrentInstrumento({
        numero_serie: instrumento.numero_serie,
        instrumento_tipo_id: String(instrumento.instrumento_tipo_id), // Asegurar que sea string
        estado: String(instrumento.estado), // Asegurar que sea string
      })

      // Set the loan user separately
      setSelectedLoanUser(usuarioPrestamo)
    } else {
      setCurrentInstrumento({
        numero_serie: "",
        instrumento_tipo_id: tiposInstrumento.length > 0 ? tiposInstrumento[0].instrumento : "",
        estado: "disponible",
      })
      setSelectedLoanUser("")
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
    setSelectedLoanUser("")
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log(`🔍 Input change: ${name} = ${value} (type: ${typeof value})`) // Debug log
    setCurrentInstrumento((prev) => ({
      ...prev,
      [name]: String(value), // Asegurar que siempre sea string
    }))
  }

  const handleLoanUserChange = (e) => {
    setSelectedLoanUser(e.target.value)
  }

  // Add useEffect to clear user when status changes
  useEffect(() => {
    if (currentInstrumento.estado !== "prestado") {
      setSelectedLoanUser("")
    }
  }, [currentInstrumento.estado])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (modalMode === "create") {
        // Determinar si necesitamos crear un préstamo
        const needsLoan = currentInstrumento.estado === "prestado" && selectedLoanUser

        // Si necesitamos crear un préstamo, primero creamos el instrumento como disponible
        const instrumentoData = {
          numero_serie: currentInstrumento.numero_serie,
          instrumento_tipo_id: currentInstrumento.instrumento_tipo_id,
          estado: needsLoan ? "disponible" : currentInstrumento.estado, // Temporalmente disponible si va a ser prestado
        }

        console.log("📝 Creando nuevo instrumento:", instrumentoData)
        const response = await api.post("/instrumentos", instrumentoData)
        console.log("✅ Instrumento creado:", response.data)

        // Increment quantity in tipo_instrumentos
        try {
          const tipoActual = tiposInstrumento.find((t) => t.instrumento === currentInstrumento.instrumento_tipo_id)
          if (tipoActual) {
            console.log(`📊 Actualizando cantidad de tipo ${currentInstrumento.instrumento_tipo_id}`)
            await api.put(`/tipo-instrumentos/${encodeURIComponent(currentInstrumento.instrumento_tipo_id)}`, {
              cantidad: tipoActual.cantidad + 1,
            })
            console.log(`✅ Cantidad de tipo actualizada`)
          }
        } catch (error) {
          console.error("❌ Error al actualizar cantidad de tipo:", error)
        }

        // Si necesitamos crear un préstamo, lo hacemos ahora que el instrumento está disponible
        if (needsLoan) {
          try {
            const fechaPrestamo = new Date().toISOString().split("T")[0]
            console.log(`🔄 Creando nuevo préstamo para instrumento ${currentInstrumento.numero_serie}`)

            const prestamoData = {
              num_serie: currentInstrumento.numero_serie,
              usuario_id: Number.parseInt(selectedLoanUser),
              fecha_prestamo: fechaPrestamo,
              fecha_devolucion: "",
            }

            console.log("📝 Datos del préstamo:", prestamoData)
            await api.post("/prestamos", prestamoData)
            console.log("✅ Préstamo creado exitosamente")

            // Ahora actualizamos el instrumento a estado prestado
            console.log(`🔄 Actualizando instrumento ${currentInstrumento.numero_serie} a estado prestado`)
            await api.put(`/instrumentos/${currentInstrumento.numero_serie}`, {
              estado: "prestado",
              instrumento_tipo_id: currentInstrumento.instrumento_tipo_id,
            })
            console.log(`✅ Instrumento actualizado a estado prestado`)
          } catch (error) {
            console.error("❌ Error al crear préstamo:", error)
            if (error.response) {
              console.error("Detalles del error:", error.response.data)
            }
            // Mostrar mensaje de error específico para préstamo
            setErrorMessage(
              `Error al crear préstamo: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`,
            )
            setTimeout(() => setErrorMessage(null), 5000)
          }
        }

        // Actualizar el estado local con el nuevo instrumento
        const finalInstrumento = {
          ...response.data,
          estado: needsLoan ? "prestado" : currentInstrumento.estado, // Asegurar que el estado local refleje el estado final
        }
        setInstrumentos([...instrumentos, finalInstrumento])

        // Mostrar mensaje de éxito
        if (needsLoan) {
          setSuccessMessage("Instrumento creado y préstamo registrado correctamente")
        } else {
          setSuccessMessage("Instrumento creado exitosamente")
        }
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        // Handle edit mode with proper database updates
        const originalInstrumento = instrumentos.find((i) => i.numero_serie === currentInstrumento.numero_serie)

        // Incluir TODOS los campos requeridos por el backend
        const instrumentoToUpdate = {
          estado: currentInstrumento.estado,
          instrumento_tipo_id: String(currentInstrumento.instrumento_tipo_id), // Asegurar que sea string
        }

        console.log(`📝 Actualizando instrumento ${currentInstrumento.numero_serie}:`, instrumentoToUpdate)

        // SIEMPRE usar la URL simple sin usuario_id
        const updateUrl = `/instrumentos/${currentInstrumento.numero_serie}`

        // Update instrument first (except when changing to prestado - that's handled in the status change logic)
        if (!(originalInstrumento.estado !== "prestado" && currentInstrumento.estado === "prestado")) {
          await api.put(updateUrl, instrumentoToUpdate)
          console.log(`✅ Instrumento ${currentInstrumento.numero_serie} actualizado`)
        }

        // Handle type change - update quantities in tipo_instrumentos
        if (originalInstrumento.instrumento_tipo_id !== currentInstrumento.instrumento_tipo_id) {
          try {
            console.log(
              `📊 Actualizando cantidades por cambio de tipo: ${originalInstrumento.instrumento_tipo_id} -> ${currentInstrumento.instrumento_tipo_id}`,
            )

            // Get current quantities from API to ensure accuracy
            const tipoAnteriorRes = await api.get(
              `/tipo-instrumentos/${encodeURIComponent(originalInstrumento.instrumento_tipo_id)}`,
            )
            const tipoNuevoRes = await api.get(
              `/tipo-instrumentos/${encodeURIComponent(currentInstrumento.instrumento_tipo_id)}`,
            )

            // Decrease old type quantity
            if (tipoAnteriorRes.data.data && tipoAnteriorRes.data.data.cantidad > 0) {
              await api.put(`/tipo-instrumentos/${encodeURIComponent(originalInstrumento.instrumento_tipo_id)}`, {
                cantidad: tipoAnteriorRes.data.data.cantidad - 1,
              })
              console.log(`✅ Cantidad de tipo ${originalInstrumento.instrumento_tipo_id} decrementada`)
            }

            // Increase new type quantity
            if (tipoNuevoRes.data.data) {
              await api.put(`/tipo-instrumentos/${encodeURIComponent(currentInstrumento.instrumento_tipo_id)}`, {
                cantidad: tipoNuevoRes.data.data.cantidad + 1,
              })
              console.log(`✅ Cantidad de tipo ${currentInstrumento.instrumento_tipo_id} incrementada`)
            }
          } catch (error) {
            console.error("❌ Error al actualizar cantidades de tipos:", error)
          }
        }

        // Handle status change - SEPARATE operations for instrument and loans
        if (originalInstrumento.estado !== currentInstrumento.estado) {
          if (originalInstrumento.estado === "prestado" && currentInstrumento.estado !== "prestado") {
            // Return instrument - end the loan
            try {
              console.log(`🔄 Finalizando préstamo para instrumento ${currentInstrumento.numero_serie}`)

              const prestamoActivo = prestamos.find(
                (prestamo) =>
                  String(prestamo.num_serie) === String(currentInstrumento.numero_serie) &&
                  (!prestamo.fecha_devolucion || prestamo.fecha_devolucion === ""),
              )

              if (prestamoActivo) {
                // End the loan by updating its return date
                await api.put(`/prestamos/${prestamoActivo.num_serie}/${prestamoActivo.usuario_id}`, {
                  fecha_prestamo: prestamoActivo.fecha_prestamo,
                  fecha_devolucion: new Date().toISOString().split("T")[0],
                })
                console.log("✅ Préstamo finalizado automáticamente desde Instrumentos")
              } else {
                console.log("⚠️ No se encontró un préstamo activo para finalizar")
              }
            } catch (error) {
              console.error("❌ Error al finalizar préstamo:", error)
            }
          } else if (originalInstrumento.estado !== "prestado" && currentInstrumento.estado === "prestado") {
            // Create new loan FIRST, then update instrument
            if (selectedLoanUser) {
              try {
                const fechaPrestamo = new Date().toISOString().split("T")[0]
                console.log(`🔄 Creando nuevo préstamo para instrumento ${currentInstrumento.numero_serie}`)

                // Crear préstamo PRIMERO (mientras el instrumento aún está disponible)
                const prestamoData = {
                  num_serie: currentInstrumento.numero_serie,
                  usuario_id: Number.parseInt(selectedLoanUser),
                  fecha_prestamo: fechaPrestamo,
                }

                console.log("📝 Datos del préstamo:", prestamoData)
                console.log("📝 Endpoint del préstamo:", `/prestamos`)

                // POST para crear el préstamo ANTES de actualizar el instrumento
                await api.post(`/prestamos`, prestamoData)
                console.log("✅ Nuevo préstamo creado automáticamente desde Instrumentos")

                // Ahora actualizar el instrumento a prestado
                console.log(
                  `📝 Actualizando instrumento ${currentInstrumento.numero_serie} a prestado después de crear préstamo`,
                )
                await api.put(updateUrl, instrumentoToUpdate)
                console.log(`✅ Instrumento ${currentInstrumento.numero_serie} actualizado a prestado`)
              } catch (error) {
                console.error("❌ Error al crear préstamo:", error)
                if (error.response) {
                  console.error("Detalles del error:", error.response.data)
                  setErrorMessage(`Error al crear préstamo: ${JSON.stringify(error.response.data)}`)
                  setTimeout(() => setErrorMessage(null), 5000)
                }
                return // No continuar si falla la creación del préstamo
              }
            } else {
              console.error("❌ Error: Se intentó crear un préstamo sin seleccionar usuario")
              setErrorMessage("Error: Debe seleccionar un usuario para prestar el instrumento")
              setTimeout(() => setErrorMessage(null), 5000)
              return // Detener la ejecución si no hay usuario seleccionado
            }
          } else if (originalInstrumento.estado === "prestado" && currentInstrumento.estado === "prestado") {
            // Update existing loan with new user (if user changed)
            const prestamoActivo = prestamos.find(
              (prestamo) =>
                String(prestamo.num_serie) === String(currentInstrumento.numero_serie) &&
                (!prestamo.fecha_devolucion || prestamo.fecha_devolucion === ""),
            )

            if (prestamoActivo && String(prestamoActivo.usuario_id) !== selectedLoanUser) {
              try {
                console.log(
                  `🔄 Actualizando préstamo con nuevo usuario: ${prestamoActivo.usuario_id} -> ${selectedLoanUser}`,
                )

                // End current loan
                await api.put(`/prestamos/${prestamoActivo.num_serie}/${prestamoActivo.usuario_id}`, {
                  fecha_prestamo: prestamoActivo.fecha_prestamo,
                  fecha_devolucion: new Date().toISOString().split("T")[0],
                })
                console.log("✅ Préstamo anterior finalizado")

                // Create new loan with new user
                const fechaPrestamo = new Date().toISOString().split("T")[0]
                const prestamoData = {
                  num_serie: currentInstrumento.numero_serie,
                  usuario_id: Number.parseInt(selectedLoanUser),
                  fecha_prestamo: fechaPrestamo,
                }

                await api.post("/prestamos", prestamoData)
                console.log("✅ Nuevo préstamo creado con el nuevo usuario")
              } catch (error) {
                console.error("❌ Error al actualizar préstamo:", error)
              }
            } else if (!prestamoActivo) {
              // No hay préstamo activo pero el estado es "prestado" - crear uno nuevo
              try {
                console.log(
                  `⚠️ Estado inconsistente: instrumento marcado como prestado sin préstamo activo. Creando nuevo préstamo.`,
                )

                const fechaPrestamo = new Date().toISOString().split("T")[0]
                const prestamoData = {
                  num_serie: currentInstrumento.numero_serie,
                  usuario_id: Number.parseInt(selectedLoanUser),
                  fecha_prestamo: fechaPrestamo,
                }

                await api.post("/prestamos", prestamoData)
                console.log("✅ Préstamo creado para corregir inconsistencia")
              } catch (error) {
                console.error("❌ Error al crear préstamo para corregir inconsistencia:", error)
              }
            }
          }
        }

        // Update local state with the new instrument data
        setInstrumentos(
          instrumentos.map((item) =>
            item.numero_serie === currentInstrumento.numero_serie ? { ...item, ...instrumentoToUpdate } : item,
          ),
        )

        // Mostrar mensaje de éxito según el cambio realizado
        if (originalInstrumento.estado !== currentInstrumento.estado) {
          if (currentInstrumento.estado === "prestado") {
            setSuccessMessage("Instrumento marcado como prestado y préstamo creado")
          } else if (originalInstrumento.estado === "prestado") {
            setSuccessMessage("Instrumento devuelto y préstamo finalizado")
          } else {
            setSuccessMessage("Estado del instrumento actualizado")
          }
        } else {
          setSuccessMessage("Instrumento actualizado exitosamente")
        }
        setTimeout(() => setSuccessMessage(null), 3000)
      }

      handleCloseModal()

      // Recargar todos los datos para mantener sincronización entre páginas
      await fetchData()
    } catch (error) {
      console.error("❌ Error al guardar instrumento:", error)
      if (error.response && error.response.data) {
        console.error("Detalles del error:", error.response.data)
        setErrorMessage(`Error al guardar: ${JSON.stringify(error.response.data)}`)
      } else {
        setErrorMessage(`Error al guardar: ${error.message}`)
      }
      setTimeout(() => setErrorMessage(null), 5000)
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

      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="bg-green-900/20 border border-green-800 text-green-100 px-4 py-3 rounded-md mb-6 flex items-center">
          <span className="mr-2">✅</span>
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6 flex items-center">
          <span className="mr-2">❌</span>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Mensaje de error de conexión */}
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
                            {instrumento.estado === "en reparacion"
                              ? "En Reparación"
                              : instrumento.estado.charAt(0).toUpperCase() + instrumento.estado.slice(1)}
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
                    <option value="en reparacion">{t("instruments.repair")}</option>
                  </select>
                </div>
                {currentInstrumento.estado === "prestado" && (
                  <div className="space-y-2">
                    <label htmlFor="selectedLoanUser" className="block text-[#C0C0C0] text-sm font-medium">
                      Usuario del préstamo *
                    </label>
                    <select
                      id="selectedLoanUser"
                      name="selectedLoanUser"
                      value={selectedLoanUser}
                      onChange={handleLoanUserChange}
                      required
                      className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    >
                      <option value="">Selecciona un usuario</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario.id} value={String(usuario.id)}>
                          {usuario.nombre} {usuario.apellido1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
