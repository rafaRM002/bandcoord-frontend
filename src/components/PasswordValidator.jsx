"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { useTranslation } from "../hooks/useTranslation"

export default function PasswordValidator({ password, onValidationChange }) {
  const { t } = useTranslation()
  const [validations, setValidations] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    const newValidations = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    }

    setValidations(newValidations)

    // Notificar al componente padre si la contraseña es válida
    const isValid = Object.values(newValidations).every(Boolean)
    onValidationChange?.(isValid)
  }, [password, onValidationChange])

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
      <p className="text-xs text-gray-400 mb-2">{t("password.requirements", "Requisitos de la contraseña:")}</p>
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
