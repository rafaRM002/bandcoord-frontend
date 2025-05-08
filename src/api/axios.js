import axios from "axios"

// Definir una URL base predeterminada en caso de que la variable de entorno no esté definida
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

console.log("API URL configurada:", API_URL)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Añadir timeout para evitar esperas infinitas
  timeout: 15000,
})

// Interceptor para agregar el token de autenticación si existe
api.interceptors.request.use(
  (config) => {
    // Log para depuración
    console.log(`Realizando solicitud a: ${config.baseURL}${config.url}`)

    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error("Error en la solicitud:", error)
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Verificar si la respuesta contiene HTML en lugar de JSON
    if (
      error.response &&
      error.response.data &&
      typeof error.response.data === "string" &&
      error.response.data.includes("<!doctype")
    ) {
      console.error("La API devolvió HTML en lugar de JSON. Posible error de servidor o URL incorrecta.")
      console.error("URL completa de la solicitud:", error.config.baseURL + error.config.url)

      // Crear un error más descriptivo
      return Promise.reject(new Error("Error de conexión con el servidor. Por favor, verifica la URL de la API."))
    }

    // Manejar errores de autenticación
    if (error.response && error.response.status === 401) {
      console.error("Error de autenticación:", error.response.data)
    }

    // Manejar errores de red
    if (error.code === "ECONNABORTED") {
      console.error("Tiempo de espera agotado al conectar con la API")
      return Promise.reject(new Error("No se pudo conectar con el servidor. Por favor, inténtalo de nuevo."))
    }

    if (!error.response) {
      console.error("Error de red:", error)
      return Promise.reject(new Error("Error de conexión. Verifica tu conexión a internet."))
    }

    return Promise.reject(error)
  },
)

// Función para verificar la conexión con la API
export const testApiConnection = async () => {
  try {
    console.log("Probando conexión a la API...")
    const response = await axios.get(`${API_URL}/ping`, { timeout: 5000 })
    console.log("Conexión exitosa:", response.data)
    return true
  } catch (error) {
    console.error("Error al conectar con la API:", error)
    return false
  }
}

// Ejecutar la prueba de conexión al cargar
testApiConnection()

export default api
