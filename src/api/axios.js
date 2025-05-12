import axios from "axios"

// Crear una instancia de axios con la URL base
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log mejorado pero más compacto
    console.log("Request:", {
      method: config.method,
      url: config.url,
      data: config.data,
    })

    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Interceptor para manejar las respuestas
api.interceptors.response.use(
  (response) => {
    console.log("Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    })

    // Normalizar la respuesta para manejar diferentes formatos
    if (response.data && response.data.data) {
      // Si la respuesta tiene un formato Laravel Resource/Collection
      response.originalData = response.data
      response.data = response.data.data
    }

    return response
  },
  (error) => {
    console.error("Response error:", error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    return Promise.reject(error)
  },
)

export default api
