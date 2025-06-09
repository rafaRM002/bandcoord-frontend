/**
 * @file PasswordValidator.jsx
 * @module components/PasswordValidator
 * @description Componente que valida la fortaleza de una contraseña y muestra los requisitos visualmente.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { useTranslation } from "../hooks/useTranslation"

/**
 * Componente que valida la fortaleza de una contraseña y muestra los requisitos.
 * @component
 * @param {Object} props
 * @param {string} props.password - Contraseña a validar.
 * @param {Function} [props.onValidationChange] - Callback opcional que recibe true si la contraseña es válida.
 * @returns {JSX.Element} Lista visual de requisitos de contraseña.
 */
export default function PasswordValidator({ password, onValidationChange }) {
  const { t } = useTranslation()

  /**
   * Estado para guardar el resultado de cada validación.
   * @type {{length: boolean, lowercase: boolean, uppercase: boolean, number: boolean, special: boolean}}
   */
  const [validations, setValidations] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  })

  /**
   * Efecto que valida la contraseña cada vez que cambia.
   */
  useEffect(() => {
    const newValidations = {
      length: password.length >= 8, // Al menos 8 caracteres
      lowercase: /[a-z]/.test(password), // Al menos una minúscula
      uppercase: /[A-Z]/.test(password), // Al menos una mayúscula
      number: /\d/.test(password), // Al menos un número
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password), // Al menos un carácter especial
    }

    setValidations(newValidations)

    // Notifica al componente padre si la contraseña es válida
    const isValid = Object.values(newValidations).every(Boolean)
    onValidationChange?.(isValid)
    // console.log("Validación de contraseña:", newValidations, "¿Válida?", isValid)
  }, [password, onValidationChange])

  /**
   * Lista de requisitos a mostrar.
   * @type {Array<{key: string, text: string, valid: boolean}>}
   */
  const requirements = [
    {
      key: "length",
      text: t("password.minLength", "Al menos 8 caracteres"),
      valid: validations.length,
    },
    {
      key: "lowercase",
      text: t("password.lowercase", "Al menos una letra minúscula (a-z)"),
      valid: validations.lowercase,
    },
    {
      key: "uppercase",
      text: t("password.uppercase", "Al menos una letra mayúscula (A-Z)"),
      valid: validations.uppercase,
    },
    {
      key: "number",
      text: t("password.number", "Al menos un número (0-9)"),
      valid: validations.number,
    },
    {
      key: "special",
      text: t("password.special", "Al menos un carácter especial (!@#$%^&*)"),
      valid: validations.special,
    },
  ]

  return (
    <div className="mt-2">
      {/* Título de requisitos */}
      <p className="text-xs text-gray-400 mb-2">{t("password.requirements", "Requisitos de la contraseña:")}</p>
      {/* Lista de requisitos con iconos de validación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-center text-xs">
            {req.valid ? (
              <Check size={12} className="text-green-500 mr-2 flex-shrink-0" />
            ) : (
              <X size={12} className="text-red-500 mr-2 flex-shrink-0" />
            )}
            <span className={req.valid ? "text-green-500" : "text-red-500"}>{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
