"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Filter } from "lucide-react"
import api from "../../api/axios"

export default function MinimosEvento() {
  const [minimos, setMinimos] = useState([])
  const [loading, setLoading] = useState(true)
  const [eventos, setEventos] = useState([])
  const [tiposInstrumento, setTiposInstrumento] = useState([])
  const [eventoFilter, setEventoFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create") // "create" o "edit"
  const [currentMinimo, setCurrentMinimo] = useState({
    evento_id: "",
    instrumento_tipo_id: "",
    cantidad_minima: 1,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [minimoToDelete, setMinimoToDelete] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [minimosRes, eventosRes, tiposRes] = await Promise.all([
          api.get("/minimos-evento"),
          api.get("/eventos"),
          api.get("/tipo-instrumentos"),
        ])
        setMinimos(minimosRes.data)
        setEventos(eventosRes.data)
        setTiposInstrumento(tiposRes.data)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleOpenModal = (mode, minimo = { evento_id: "", instrumento_tipo_id: "", cantidad_minima: 1 }) => {
    setModalMode(mode)
    setCurrentMinimo(minimo)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentMinimo({ evento_id: "", instrumento_tipo_id: "", cantidad_minima: 1 })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentMinimo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (modalMode === "create") {
        await api.post("/minimos-evento", currentMinimo)
      } else {
        await api.put(`/minimos-evento/${currentMinimo.evento_id}/${currentMinimo.instrumento_tipo_id}`, currentMinimo)
      }

      // Recargar los datos
      const response = await api.get("/minimos-evento")
      setMinimos(response.data)
      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar mínimo de evento:", error)
    }
  }

  const confirmDelete = (eventoId, instrumentoTipoId) => {
    setMinimoToDelete({ eventoId, instrumentoTipoId })
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!minimoToDelete) return

    try {
      await api.delete(`/minimos-evento/${minimoToDelete.eventoId}/${minimoToDelete.instrumentoTipoId}`)
      setMinimos(
        minimos.filter(
          (minimo) =>
            !(
              minimo.evento_id === minimoToDelete.eventoId &&
              minimo.instrumento_tipo_id === minimoToDelete.instrumentoTipoId
            ),
        ),
      )
      setShowDeleteModal(false)
      setMinimoToDelete(null)
    } catch (error) {
      console.error("Error al eliminar mínimo de evento:", error)
    }
  }

  const filteredMinimos = minimos.filter((minimo) => {
    const matchesEvento = eventoFilter === "" || minimo.evento_id.toString() === eventoFilter
    const matchesTipo = tipoFilter === "" || minimo.instrumento_tipo_id.toString() === tipoFilter

    return matchesEvento && matchesTipo
  })

  const getEventoNombre = (eventoId) => {
    const evento = eventos.find((e) => e.id === eventoId)
    return evento ? evento.nombre : "Desconocido"
  }

  const getTipoNombre = (tipoId) => {
    const tipo = tiposInstrumento.find((t) => t.id === tipoId)
    return tipo ? tipo.nombre : "Desconocido"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">Mínimos en Eventos</h1>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
        >
          <Plus size={18} />
          Nuevo Mínimo
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <select
                value={eventoFilter}
                onChange={(e) => setEventoFilter(e.target.value)}
                className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
              >
                <option value="">Todos los eventos</option>
                {eventos.map((evento) => (
                  <option key={evento.id} value={evento.id.toString()}>
                    {evento.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
              >
                <option value="">Todos los tipos de instrumento</option>
                {tiposInstrumento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de mínimos */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">Cargando datos...</div>
          </div>
        ) : filteredMinimos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <p className="text-gray-400 text-center">
              {eventoFilter || tipoFilter
                ? "No se encontraron mínimos con los filtros aplicados."
                : "No hay mínimos de instrumentos registrados."}
            </p>
            <button
              onClick={() => handleOpenModal("create")}
              className="mt-4 text-[#C0C0C0] hover:text-white underline"
            >
              Añadir el primer mínimo
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tipo de Instrumento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cantidad Mínima
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredMinimos.map((minimo) => (
                <tr key={`${minimo.evento_id}-${minimo.instrumento_tipo_id}`} className="hover:bg-gray-900/30">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                    {getEventoNombre(minimo.evento_id)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                    {getTipoNombre(minimo.instrumento_tipo_id)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">{minimo.cantidad_minima}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal("edit", minimo)}
                        className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(minimo.evento_id, minimo.instrumento_tipo_id)}
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
        )}
      </div>

      {/* Modal para crear/editar mínimo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">
              {modalMode === "create" ? "Nuevo Mínimo de Instrumento" : "Editar Mínimo de Instrumento"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="evento_id" className="block text-[#C0C0C0] text-sm font-medium">
                    Evento *
                  </label>
                  <select
                    id="evento_id"
                    name="evento_id"
                    value={currentMinimo.evento_id}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === "edit"}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-70"
                  >
                    <option value="">Selecciona un evento</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="instrumento_tipo_id" className="block text-[#C0C0C0] text-sm font-medium">
                    Tipo de Instrumento *
                  </label>
                  <select
                    id="instrumento_tipo_id"
                    name="instrumento_tipo_id"
                    value={currentMinimo.instrumento_tipo_id}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === "edit"}
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-70"
                  >
                    <option value="">Selecciona un tipo</option>
                    {tiposInstrumento.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="cantidad_minima" className="block text-[#C0C0C0] text-sm font-medium">
                    Cantidad Mínima *
                  </label>
                  <input
                    id="cantidad_minima"
                    name="cantidad_minima"
                    type="number"
                    min="1"
                    value={currentMinimo.cantidad_minima}
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
              ¿Estás seguro de que deseas eliminar este mínimo de instrumento? Esta acción no se puede deshacer.
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
