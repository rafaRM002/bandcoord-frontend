"use client"

import { useLanguage } from "../context/LanguageContext"
import { translations } from "../utils/translations"

export const useTranslation = () => {
  const { language } = useLanguage()

  const t = (key) => {
    return translations[language]?.[key] || key
  }

  return { t }
}
