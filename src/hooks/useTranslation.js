/**
 * @file useTranslation.js
 * @module hooks/useTranslation
 * @description Hook personalizado para traducciones en la aplicación. Permite obtener la función de traducción `t` y el idioma actual.
 * Soporta claves anidadas e intenta mostrar en español si la traducción no existe en el idioma actual.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useLanguage } from "../context/LanguageContext"
import { translations } from "../utils/translations"

/**
 * Hook para traducción de textos en la app.
 * @function
 * @returns {{ t: function(string): string, language: string }} Retorna la función de traducción y el idioma actual.
 */
export const useTranslation = () => {
  const { language } = useLanguage() // Obtiene el idioma actual del contexto

  /**
   * Traduce una clave usando el idioma actual.
   * Si no existe la clave, intenta buscarla en español.
   * Si tampoco existe en español, devuelve la clave y muestra un warning en consola.
   * @param {string} key - Clave de traducción (puede ser anidada, ej: "footer.contact").
   * @returns {string} Traducción encontrada o la clave si no existe.
   */
  const t = (key) => {
    if (!key) return "" // Si no hay clave, devuelve cadena vacía

    const keys = key.split(".") // Permite claves anidadas tipo "footer.contact"
    let value = translations[language] // Obtiene el objeto de traducciones del idioma actual

    // Busca la traducción navegando por las claves anidadas
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Si no encuentra la traducción, intenta buscarla en español como fallback
        let fallbackValue = translations["es"]
        for (const fallbackKey of keys) {
          if (fallbackValue && typeof fallbackValue === "object" && fallbackKey in fallbackValue) {
            fallbackValue = fallbackValue[fallbackKey]
          } else {
            // Si tampoco existe en español, muestra un warning y devuelve la clave
            // console.warn(`Translation missing for key: ${key} in language: ${language}`)
            return key
          }
        }
        return fallbackValue
      }
    }

    // Devuelve la traducción encontrada o la clave si no existe
    return value || key
  }

  // Devuelve la función de traducción y el idioma actual
  return { t, language }
}
