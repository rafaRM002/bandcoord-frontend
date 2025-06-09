/**
 * @file axios.js
 * @module api/axios
 * @description Configuración centralizada de la instancia de Axios para la comunicación con la API REST de Laravel. Incluye interceptores para añadir el token JWT, logs de peticiones y respuestas, y normalización de datos.
 * @author Rafael Rodriguez Mengual
 */

import axios from "axios"

// URL base del servidor donde está alojada la API y los archivos
const URL_SERVER = "https://www.iestrassierra.net/alumnado/curso2425/DAW/daw2425a16/laravel/"

// URL de la API REST (Laravel)
const VITE_API_URL = URL_SERVER + "public/api"

// URL para acceder a las imágenes almacenadas en el servidor
export const IMAGES_URL = URL_SERVER + "storage/app/public/files"

/**
 * Instancia de Axios configurada para la API de BandCoord.
 * Incluye configuración de cabeceras, credenciales y baseURL.
 */
const api = axios.create({
  baseURL: VITE_API_URL, // URL base para todas las peticiones
  withCredentials: true, // Permite el envío de cookies en las peticiones
  headers: {
    "Content-Type": "application/json", // Tipo de contenido por defecto
    Accept: "application/json", // Se espera respuesta en JSON
  },
})

/**
 * Interceptor de petición.
 * Añade el token JWT al header Authorization si existe y muestra un log de la petición.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") // Recupera el token del almacenamiento local
    if (token) {
      config.headers.Authorization = `Bearer ${token}` // Añade el token al header Authorization
    }

    // Log compacto de la petición
    // console.log("Request:", {
    //   method: config.method,
    //   url: config.url,
    //   data: config.data,
    // })

    return config
  },
  (error) => {
    // Log de error en la petición
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

/**
 * Interceptor de respuesta.
 * Muestra un log de la respuesta y normaliza el formato si es un recurso Laravel.
 */
api.interceptors.response.use(
  (response) => {
    // Log de la respuesta recibida
    // console.log("Response:", {
    //   status: response.status,
    //   url: response.config.url,
    //   data: response.data,
    // })

    // Si la respuesta sigue el formato Laravel Resource/Collection, se normaliza para acceder directamente a los datos
    if (response.data && response.data.data) {
      response.originalData = response.data // Guarda la respuesta original
      response.data = response.data.data // Sobrescribe data con el contenido útil
    }

    return response
  },
  (error) => {
    // Log de error en la respuesta
    console.error("Response error:", error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    return Promise.reject(error)
  },
)

/**
 * Exporta la instancia de axios configurada para usarla en el resto de la aplicación.
 */
export default api
