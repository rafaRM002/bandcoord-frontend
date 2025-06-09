/**
 * @file LanguageContext.jsx
 * @module context/LanguageContext
 * @description Contexto y proveedor para la gestión del idioma de la aplicación. Permite cambiar el idioma y acceder al idioma actual desde cualquier componente.
 * @author Rafael Rodriguez Mengual
 */

"use client";

import { createContext, useState, useContext, useEffect } from "react";

/**
 * Contexto de idioma para toda la aplicación.
 * @type {React.Context}
 */
const LanguageContext = createContext();

/**
 * Proveedor de idioma que envuelve la app y gestiona el estado del idioma.
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto.
 * @returns {JSX.Element} Proveedor de idioma.
 */
export const LanguageProvider = ({ children }) => {
  /**
   * Idioma actual (por defecto "es", o el guardado en localStorage).
   * @type {string}
   */
  const [language, setLanguage] = useState(() => {
    // Obtener idioma guardado del localStorage o usar español por defecto
    // console.log("Idioma inicial:", localStorage.getItem("language") || "es")
    return localStorage.getItem("language") || "es";
  });

  /**
   * Cambia el idioma y lo guarda en localStorage.
   * @param {string} newLanguage - Nuevo idioma a establecer.
   */
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    // console.log("Idioma cambiado a:", newLanguage)
  };

  /**
   * Efecto para guardar el idioma en localStorage cada vez que cambie.
   */
  useEffect(() => {
    // Guardar el idioma en localStorage cuando cambie
    localStorage.setItem("language", language);
    // console.log("Idioma guardado en localStorage:", language)
  }, [language]);

  /**
   * Valores y funciones que se exponen a toda la app.
   * @type {Object}
   * @property {string} language - Idioma actual.
   * @property {Function} changeLanguage - Función para cambiar el idioma.
   * @property {boolean} isSpanish - Indica si el idioma es español.
   * @property {boolean} isEnglish - Indica si el idioma es inglés.
   */
  const value = {
    language,
    changeLanguage,
    isSpanish: language === "es",
    isEnglish: language === "en",
  };

  // Renderiza el proveedor de contexto con los valores
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook personalizado para consumir el contexto de idioma.
 * @function
 * @returns {Object} Contexto de idioma con idioma actual y funciones.
 * @throws {Error} Si se usa fuera de un LanguageProvider.
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage debe ser usado dentro de un LanguageProvider");
  }
  return context;
};

export { LanguageContext };
