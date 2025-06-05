"use client"

import { X } from "lucide-react"
import { useTranslation } from "../../hooks/useTranslation"

export default function HelpModal({ onClose }) {
  const { t } = useTranslation()

  // Función para cerrar el modal al hacer clic en el fondo
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header fijo */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-black">
          <h2 className="text-2xl font-bold text-[#C0C0C0]">{t("help.helpGuide")}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-[#C0C0C0]">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">{t("help.introduction")}</h3>
            <p className="text-gray-300">{t("help.introductionText")}</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">{t("help.mainFeatures")}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/30 p-4 rounded-lg">
                <h4 className="font-semibold text-[#C0C0C0] mb-2">{t("help.instrumentManagement")}</h4>
                <p className="text-sm text-gray-400">{t("help.instrumentManagementDesc")}</p>
              </div>
              <div className="bg-gray-900/30 p-4 rounded-lg">
                <h4 className="font-semibold text-[#C0C0C0] mb-2">{t("help.eventsCalendar")}</h4>
                <p className="text-sm text-gray-400">{t("help.eventsCalendarDesc")}</p>
              </div>
              <div className="bg-gray-900/30 p-4 rounded-lg">
                <h4 className="font-semibold text-[#C0C0C0] mb-2">{t("help.messageSystem")}</h4>
                <p className="text-sm text-gray-400">{t("help.messageSystemDesc")}</p>
              </div>
              <div className="bg-gray-900/30 p-4 rounded-lg">
                <h4 className="font-semibold text-[#C0C0C0] mb-2">{t("help.compositions")}</h4>
                <p className="text-sm text-gray-400">{t("help.compositionsDesc")}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">{t("help.firstSteps")}</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>{t("help.step1")}</li>
              <li>{t("help.step2")}</li>
              <li>{t("help.step3")}</li>
              <li>{t("help.step4")}</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">{t("help.usefulTips")}</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>{t("help.tip1")}</li>
              <li>{t("help.tip2")}</li>
              <li>{t("help.tip3")}</li>
              <li>{t("help.tip4")}</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">{t("help.userRoles")}</h3>
            <div className="space-y-3">
              <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800">
                <h4 className="font-semibold text-blue-400">{t("help.administrator")}</h4>
                <p className="text-sm text-gray-300">{t("help.administratorDesc")}</p>
              </div>
              <div className="bg-green-900/20 p-3 rounded-lg border border-green-800">
                <h4 className="font-semibold text-green-400">{t("help.member")}</h4>
                <p className="text-sm text-gray-300">{t("help.memberDesc")}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
