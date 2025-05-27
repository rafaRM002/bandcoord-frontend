"use client"

import { useLanguage } from "../context/LanguageContext"
import { translations } from "../utils/translations"

export const useTranslation = () => {
  const { language } = useLanguage()

  const t = (key) => {
    if (!key) return ""

    const keys = key.split(".")
    let value = translations[language]

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Si no encuentra la traducción, intentar con el idioma por defecto (español)
        let fallbackValue = translations["es"]
        for (const fallbackKey of keys) {
          if (fallbackValue && typeof fallbackValue === "object" && fallbackKey in fallbackValue) {
            fallbackValue = fallbackValue[fallbackKey]
          } else {
            console.warn(`Translation missing for key: ${key} in language: ${language}`)
            return key
          }
        }
        return fallbackValue
      }
    }

    return value || key
  }

  return { t, language }
}
