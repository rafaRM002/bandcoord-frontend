"use client"

import { createContext, useState, useContext, useEffect } from "react"

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Obtener idioma guardado del localStorage o usar español por defecto
    return localStorage.getItem("language") || "es"
  })

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  useEffect(() => {
    // Guardar el idioma en localStorage cuando cambie
    localStorage.setItem("language", language)
  }, [language])

  const value = {
    language,
    changeLanguage,
    isSpanish: language === "es",
    isEnglish: language === "en",
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage debe ser usado dentro de un LanguageProvider")
  }
  return context
}

export { LanguageContext }
