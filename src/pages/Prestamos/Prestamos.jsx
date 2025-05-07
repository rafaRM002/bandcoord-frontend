"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Filter, Package } from "lucide-react"
import api from "../../api/axios"

export default function Prestamos() {
  const [prestamos, setPrestamos] = useState([])
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState([])
  const [instrumentos, setInstrumentos] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [usuarioFilter, setUsuarioFilter] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create") // "create" o "edit"
  const [currentPrestamo, setCurrentPrestamo] = useState({
    num_serie: "",
    usuario_id: "",
    fecha_prestamo: new Date().toISOString().split("T")[0],
    fecha_devolucion: "",
    estado: "activo",
    observaciones: "",
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [prestamoToDelete, setPrestamoToDelete] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [prestamosRes, usuariosRes, instrumentosRes] = await Promise.all([
          api.get("/prestamos"),
          api.get("/usuarios"),
          api.get("/instrumentos"),
        ])
        setPrestamos(prestamosRes.data)
        setUsuarios(usuariosRes.data)
        setInstrumentos(instrumentosRes.data)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleOpenModal = (
    mode,
    prestamo = {
      num_serie: "",
      usuario_id: "",
      fecha_prestamo: new Date().toISOString().split("T")[0],
      fecha_devolucion: "",
      estado: "activo",
      observaciones: "",
    },
  ) => {
    setModalMode(mode)
    setCurrentPrestamo(prestamo)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentPrestamo({
      num_serie: "",
      usuario_id: "",
      fecha_prestamo: new Date().toISOString().split("T")[0],
      fecha_devolucion: "",
      estado: "activo",
      observaciones: "",
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentPrestamo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (modalMode === "create") {
        await api.post("/prestamos", currentPrestamo)
      } else {
        await api.put(`/prestamos/${currentPrestamo.num_serie}/${currentPrestamo.usuario_id}`, currentPrestamo)
      }

      // Recargar los datos
      const response = await api.get("/prestamos")
      setPrestamos(response.data)
      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar préstamo:", error)
    }
  }

  const confirmDelete = (numSerie, usuarioId) => {
    setPrestamoToDelete({ numSerie, usuarioId })
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!prestamoToDelete) return

    try {
      await api.delete(`/prestamos/${prestamoToDelete.numSerie}/${prestamoToDelete.usuarioId}`)
      setPrestamos(
        prestamos.filter(
          (prestamo) =>
            !(prestamo.num_serie === prestamoToDelete.numSerie && prestamo.usuario_id === prestamoToDelete.usuarioId),
        ),
      )
      setShowDeleteModal(false)
      setPrestamoToDelete(null)
    } catch (error) {
      console.error("Error al eliminar préstamo:", error)
    }
  }

  const filteredPrestamos = prestamos.filter((prestamo) => {
    const instrumento = instrumentos.find((i) => i.num_serie === prestamo.num_serie)
    const usuario = usuarios.find((u) => u.id === prestamo.usuario_id)

    const matchesSearch =
      (instrumento && instrumento.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (instrumento && instrumento.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario && `${usuario.nombre} ${usuario.apellido1}`.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesUsuario = usuarioFilter === "" || prestamo.usuario_id.toString() === usuarioFilter
    const matchesEstado = estadoFilter === "" || prestamo.estado === estadoFilter

    return matchesSearch && matchesUsuario && matchesEstado
  })

  const getInstrumentoInfo = (numSerie) => {
    const instrumento = instrumentos.find((i) => i.num_serie === numSerie)
    return instrumento ? `${instrumento.marca} ${instrumento.modelo}` : "Desconocido"
  }

  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuarios.find((u) => u.id === usuarioId)
    return usuario ? `${usuario.nombre} ${usuario.apellido1}` : "Desconocido"
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Gestión de Préstamos</h1>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nuevo Préstamo
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por instrumento o usuario..."
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
              <option value="">Todos los usuarios</option>
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
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="devuelto">Devuelto</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de préstamos */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">Cargando préstamos...</div>
          </div>
        ) : filteredPrestamos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Package size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm || usuarioFilter || estadoFilter
                ? "No se encontraron préstamos con los filtros aplicados."
                : "No hay préstamos registrados."}
            </p>
            <button
              onClick={() => handleOpenModal("create")}
              className="mt-4 text-[#C0C0C0] hover:text-white underline"
            >
              Añadir el primer préstamo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Instrumento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fecha Préstamo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fecha Devolución
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredPrestamos.map((prestamo) => (
                  <tr key={`${prestamo.num_serie}-${prestamo.usuario_id}`} className="hover:bg-gray-900/30">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                      {getInstrumentoInfo(prestamo.num_serie)}
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
                          prestamo.estado === "activo"
                            ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                            : prestamo.estado === "devuelto"
                              ? "bg-green-900/30 text-green-400 border border-green-800"
                              : "bg-red-900/30 text-red-400 border border-red-800"
                        }`}
                      >
                        {prestamo.estado.charAt(0).toUpperCase() + prestamo.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal("edit", prestamo)}
                          className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(prestamo.num_serie, prestamo.usuario_id)}
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

      {/* Modal para crear/editar préstamo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">
              {modalMode === "create" ? "Nuevo Préstamo" : "Editar Préstamo"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="num_serie" className="block text-[#C0C0C0] text-sm font-medium">
                    Instrumento *
                  </label>
                  <select
                    id="num_serie"
                    name="num_serie"
                    value={currentPrestamo.num_serie}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === "edit"}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-70"
                  >
                    <option value="">Selecciona un instrumento</option>
                    {instrumentos
                      .filter(
                        (instrumento) =>
                          instrumento.estado === "disponible" || instrumento.num_serie === currentPrestamo.num_serie,
                      )
                      .map((instrumento) => (
                        <option key={instrumento.num_serie} value={instrumento.num_serie}>
                          {instrumento.marca} {instrumento.modelo} ({instrumento.num_serie})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="usuario_id" className="block text-[#C0C0C0] text-sm font-medium">
                    Usuario *
                  </label>
                  <select
                    id="usuario_id"
                    name="usuario_id"
                    value={currentPrestamo.usuario_id}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === "edit"}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-70"
                  >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.apellido1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="fecha_prestamo" className="block text-[#C0C0C0] text-sm font-medium">
                    Fecha de préstamo *
                  </label>
                  <input
                    id="fecha_prestamo"
                    name="fecha_prestamo"
                    type="date"
                    value={currentPrestamo.fecha_prestamo}
                    onChange={handleInputChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="fecha_devolucion" className="block text-[#C0C0C0] text-sm font-medium">
                    Fecha de devolución
                  </label>
                  <input
                    id="fecha_devolucion"
                    name="fecha_devolucion"
                    type="date"
                    value={currentPrestamo.fecha_devolucion || ""}
                    onChange={handleInputChange}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="estado" className="block text-[#C0C0C0] text-sm font-medium">
                    Estado *
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={currentPrestamo.estado}
                    onChange={handleInputChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  >
                    <option value="activo">Activo</option>
                    <option value="devuelto">Devuelto</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="observaciones" className="block text-[#C0C0C0] text-sm font-medium">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={currentPrestamo.observaciones || ""}
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
              ¿Estás seguro de que deseas eliminar este préstamo? Esta acción no se puede deshacer.
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
