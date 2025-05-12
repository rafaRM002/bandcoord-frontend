"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Edit, Trash2, Search, Music, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import api from "../../api/axios"

export default function Instrumentos() {
  const [instrumentos, setInstrumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [tiposInstrumento, setTiposInstrumento] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [instrumentoToDelete, setInstrumentoToDelete] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Prueba de conexión básica
        console.log("Intentando conectar a:", `${api.defaults.baseURL}/instrumentos`)

        // Realizar peticiones
        const instrumentosRes = await api.get("/instrumentos")
        console.log("Respuesta de instrumentos:", instrumentosRes)

        // Según las capturas de Postman, la API devuelve directamente el array de instrumentos
        setInstrumentos(instrumentosRes.data)

        const tiposRes = await api.get("/tipo-instrumentos")
        console.log("Respuesta de tipos:", tiposRes)

        // Según la estructura observada, asumimos que la API devuelve directamente el array de tipos
        setTiposInstrumento(tiposRes.data)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError(`Error al cargar datos: ${error.message}`)

        // Intentar determinar el tipo de error
        if (error.response) {
          // El servidor respondió con un código de estado fuera del rango 2xx
          console.error("Respuesta del servidor:", error.response.status, error.response.data)
          setError(`Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`)
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          console.error("No se recibió respuesta del servidor")
          setError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.")
        } else {
          // Algo ocurrió al configurar la petición
          console.error("Error de configuración:", error.message)
          setError(`Error de configuración: ${error.message}`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!instrumentoToDelete) return

    try {
      // Usar la ruta exacta que se muestra en Postman
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

  const filteredInstrumentos = instrumentos.filter((instrumento) => {
    const matchesSearch =
      String(instrumento.numero_serie).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instrumento.instrumento_tipo_id &&
        instrumento.instrumento_tipo_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (instrumento.estado && instrumento.estado.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesTipo = tipoFilter === "" || instrumento.instrumento_tipo_id === tipoFilter

    return matchesSearch && matchesTipo
  })

  // Pagination logic
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Gestión de Instrumentos</h1>
        <Link
          to="/admin/instrumentos/nuevo"
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nuevo Instrumento
        </Link>
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

      {/* Filtros y búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Buscar por número de serie o tipo..."
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
                <option value="">Todos los tipos</option>
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
            <div className="text-[#C0C0C0]">Cargando instrumentos...</div>
          </div>
        ) : filteredInstrumentos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Music size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm || tipoFilter
                ? "No se encontraron instrumentos con los filtros aplicados."
                : "No hay instrumentos registrados."}
            </p>
            <Link to="/admin/instrumentos/nuevo" className="mt-4 text-[#C0C0C0] hover:text-white underline">
              Añadir el primer instrumento
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Nº Serie
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Tipo
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          <div className="flex space-x-2">
                            <Link
                              to={`/admin/instrumentos/editar/${instrumento.numero_serie}`}
                              className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => confirmDelete(instrumento.numero_serie)}
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
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredInstrumentos.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredInstrumentos.length)} de{" "}
              {filteredInstrumentos.length} instrumentos
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

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">Confirmar eliminación</h3>
            <p className="text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar este instrumento? Esta acción no se puede deshacer.
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
