"use client"

import { useState, useEffect } from "react"
import axios from "../../api/axios"
import { toast } from "react-toastify"

const ComposicionesInterpretadas = () => {
  const [composiciones, setComposiciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchComposicionesInterpretadas = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/composicion-usuario")
        console.log("Respuesta de composiciones interpretadas:", response.data)

        // Manejar diferentes formatos de respuesta
        const composicionesData = Array.isArray(response.data)
          ? response.data
          : response.data.composiciones || response.data.data || []

        setComposiciones(composicionesData)
        setError(null)
      } catch (err) {
        console.error("Error al cargar composiciones interpretadas:", err)
        setError("Error al cargar las composiciones interpretadas. Por favor, inténtelo de nuevo más tarde.")
        toast.error("Error al cargar las composiciones interpretadas")
      } finally {
        setLoading(false)
      }
    }

    fetchComposicionesInterpretadas()
  }, [])

  if (loading) return <div className="container mx-auto p-4">Cargando composiciones interpretadas...</div>
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Composiciones Interpretadas</h1>

      {composiciones.length === 0 ? (
        <p>No hay composiciones interpretadas registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Composición</th>
                <th className="py-2 px-4 border-b">Evento</th>
                <th className="py-2 px-4 border-b">Fecha</th>
                <th className="py-2 px-4 border-b">Comentarios</th>
              </tr>
            </thead>
            <tbody>
              {composiciones.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="py-2 px-4 border-b">
                    {item.composicion?.titulo || item.titulo_composicion || "No disponible"}
                  </td>
                  <td className="py-2 px-4 border-b">{item.evento?.nombre || item.nombre_evento || "No disponible"}</td>
                  <td className="py-2 px-4 border-b">
                    {item.fecha ? new Date(item.fecha).toLocaleDateString("es-ES") : "No disponible"}
                  </td>
                  <td className="py-2 px-4 border-b">{item.comentarios || "Sin comentarios"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ComposicionesInterpretadas
