/**
 * @file Home.jsx
 * @module pages/Home/Home
 * @description Página principal de la aplicación. Muestra la home pública para usuarios no autenticados y un dashboard personalizado para usuarios autenticados, incluyendo accesos rápidos, próximos eventos, composiciones recientes y panel de administración para administradores.
 * @author Rafael Rodriguez Mengual
 */

"use client"

import { Link } from "react-router-dom"
import { Music, Calendar, MessageSquare, Users, Package, Shield, Award, User } from "lucide-react"
import { useTranslation } from "../../hooks/useTranslation"
import { useState, useEffect } from "react"
import axios from "../../api/axios"

/**
 * Componente principal de la página Home.
 * Muestra la home pública o el dashboard según el estado de autenticación.
 * @component
 * @param {Object} props
 * @param {Object|null} props.user - Usuario autenticado (si existe).
 * @param {boolean} props.loading - Estado de carga.
 * @returns {JSX.Element} Página principal.
 */
export default function Home({ user, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-xl text-[#C0C0C0]">Cargando...</div>
      </div>
    )
  }

  // Si el usuario está autenticado, mostrar el dashboard
  if (user) {
    return <UserDashboard user={user} />
  }

  // Si no está autenticado, mostrar la página de inicio pública
  return <PublicHome />
}

/**
 * Devuelve la clase de color para el tipo de evento.
 * @param {string} tipo - Tipo de evento.
 * @returns {string} Clases de color.
 */
const getEventTypeColor = (tipo) => {
  switch (tipo?.toLowerCase()) {
    case "ensayo":
      return "bg-blue-900/50 text-blue-300 border-blue-600"
    case "procesion":
      return "bg-green-900/50 text-green-300 border-green-600"
    case "concierto":
      return "bg-purple-900/50 text-purple-300 border-purple-600"
    case "pasacalles":
      return "bg-orange-900/50 text-orange-300 border-orange-600"
    default:
      return "bg-gray-900/50 text-gray-300 border-gray-600"
  }
}

/**
 * Componente de la home pública para usuarios no autenticados.
 * @component
 * @returns {JSX.Element}
 */
function PublicHome() {
  const { t } = useTranslation()
  return (
    <div className="w-full bg-black">
      {/* Hero section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-center">
          <img
            src={`${import.meta.env.BASE_URL}/1-removebg-preview.png`}
            alt="Logo BandCoord"
            className="h-40 w-auto"
          />
        </div>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#C0C0C0] mb-6">
            {t("home.welcome")}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C0C0C0] to-white"> BandCoord</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 px-4">{t("home.subtitle")}</p>
          <div className="flex flex-wrap justify-center gap-4 px-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors duration-300"
            >
              {t("home.login")}
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300"
            >
              {t("home.register")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#C0C0C0] mb-12 text-center">{t("home.mainFeatures")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          <FeatureCard
            icon={<Calendar className="h-10 w-10 text-[#C0C0C0]" />}
            title={t("home.eventManagement")}
            description={t("home.eventManagementDesc")}
          />
          <FeatureCard
            icon={<Music className="h-10 w-10 text-[#C0C0C0]" />}
            title={t("home.compositions")}
            description={t("home.compositionsDesc")}
          />
          <FeatureCard
            icon={<MessageSquare className="h-10 w-10 text-[#C0C0C0]" />}
            title={t("home.communication")}
            description={t("home.communicationDesc")}
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-[#C0C0C0]" />}
            title={t("home.memberManagement")}
            description={t("home.memberManagementDesc")}
          />
        </div>
      </section>

      {/* About section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="px-4">
              <h2 className="text-3xl font-bold text-[#C0C0C0] mb-6">{t("home.aboutBandCoord")}</h2>
              <p className="text-gray-400 mb-6">{t("home.aboutDesc1")}</p>
              <p className="text-gray-400 mb-6">{t("home.aboutDesc2")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#C0C0C0] flex-shrink-0" />
                  <span className="text-gray-300">{t("home.secureReliable")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#C0C0C0] flex-shrink-0" />
                  <span className="text-gray-300">{t("home.professionalQuality")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#C0C0C0] flex-shrink-0" />
                  <span className="text-gray-300">{t("home.userCentric")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#C0C0C0] flex-shrink-0" />
                  <span className="text-gray-300">{t("home.regularUpdates")}</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-black p-1 rounded-lg mt-8 lg:mt-0 mx-4">
              <div className="bg-black rounded-lg p-8 h-full">
                <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">{t("home.whyChoose")}</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="bg-gray-800 rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#C0C0C0] text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="text-[#C0C0C0] font-medium">{t("home.allInOne")}</h4>
                      <p className="text-gray-400 text-sm">{t("home.allInOneDesc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-gray-800 rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#C0C0C0] text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="text-[#C0C0C0] font-medium">{t("home.easyToUse")}</h4>
                      <p className="text-gray-400 text-sm">{t("home.easyToUseDesc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-gray-800 rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#C0C0C0] text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="text-[#C0C0C0] font-medium">{t("home.realTimeCollab")}</h4>
                      <p className="text-gray-400 text-sm">{t("home.realTimeCollabDesc")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-gray-800 rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#C0C0C0] text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="text-[#C0C0C0] font-medium">{t("home.personalizedSupport")}</h4>
                      <p className="text-gray-400 text-sm">{t("home.personalizedSupportDesc")}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionamiento */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#C0C0C0] mb-12 text-center">{t("home.howItWorks")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-black/50 p-8 rounded-lg border border-gray-800 hover:border-[#C0C0C0] transition-colors duration-300">
            <div className="bg-gray-800 rounded-full h-12 w-12 flex items-center justify-center mb-6 mx-auto">
              <span className="text-[#C0C0C0] text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold text-[#C0C0C0] text-center mb-4">{t("home.step1")}</h3>
            <p className="text-gray-400 text-center">{t("home.step1Desc")}</p>
          </div>
          <div className="bg-black/50 p-8 rounded-lg border border-gray-800 hover:border-[#C0C0C0] transition-colors duration-300">
            <div className="bg-gray-800 rounded-full h-12 w-12 flex items-center justify-center mb-6 mx-auto">
              <span className="text-[#C0C0C0] text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold text-[#C0C0C0] text-center mb-4">{t("home.step2")}</h3>
            <p className="text-gray-400 text-center">{t("home.step2Desc")}</p>
          </div>
          <div className="bg-black/50 p-8 rounded-lg border border-gray-800 hover:border-[#C0C0C0] transition-colors duration-300">
            <div className="bg-gray-800 rounded-full h-12 w-12 flex items-center justify-center mb-6 mx-auto">
              <span className="text-[#C0C0C0] text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold text-[#C0C0C0] text-center mb-4">{t("home.step3")}</h3>
            <p className="text-gray-400 text-center">{t("home.step3Desc")}</p>
          </div>
        </div>
      </section>

      {/* Invitación a unirse */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-black/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#C0C0C0] mb-6">{t("home.readyToStart")}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 px-4">{t("home.readyToStartDesc")}</p>
          <Link
            to="/register"
            className="px-8 py-4 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300 inline-block"
          >
            {t("home.createAccount")}
          </Link>
        </div>
      </section>
    </div>
  )
}

/**
 * Dashboard para usuarios autenticados.
 * Muestra bienvenida, accesos rápidos, próximos eventos, composiciones recientes y panel de administración si es admin.
 * @component
 * @param {Object} props
 * @param {Object} props.user - Usuario autenticado.
 * @returns {JSX.Element}
 */
function UserDashboard({ user }) {
  const { t } = useTranslation()
  /** Próximos eventos */
  const [upcomingEvents, setUpcomingEvents] = useState([])
  /** Composiciones recientes */
  const [recentCompositions, setRecentCompositions] = useState([])
  /** Estado de carga de eventos */
  const [loadingEvents, setLoadingEvents] = useState(true)
  /** Estado de carga de composiciones */
  const [loadingCompositions, setLoadingCompositions] = useState(true)

  /**
   * Carga los próximos eventos al montar el componente.
   */
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axios.get("/eventos")
        const now = new Date()

        // Verificar si la respuesta tiene datos y es un array
        const eventos = response.data?.eventos || []

        // Filtrar eventos futuros y ordenar por fecha
        const futureEvents = eventos
          .filter((evento) => new Date(evento.fecha) > now)
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          .slice(0, 3) // Tomar solo los 3 primeros

        setUpcomingEvents(futureEvents)
      } catch (error) {
        console.error("Error al cargar eventos:", error)
        setUpcomingEvents([])
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchUpcomingEvents()
  }, [])

  /**
   * Carga las composiciones recientes al montar el componente.
   */
  useEffect(() => {
    const fetchRecentCompositions = async () => {
      try {
        const response = await axios.get("/composiciones")

        // La respuesta directa es el array de composiciones
        const composiciones = Array.isArray(response.data) ? response.data : []

        // console.log("Composiciones recibidas:", composiciones)

        // Ordenar por created_at descendente y tomar las 3 más recientes
        const recentComps = composiciones.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3)

        // console.log("Composiciones ordenadas:", recentComps)
        setRecentCompositions(recentComps)
      } catch (error) {
        console.error("Error al cargar composiciones:", error)
        setRecentCompositions([])
      } finally {
        setLoadingCompositions(false)
      }
    }

    fetchRecentCompositions()
  }, [])

  return (
    <div className="w-full bg-black">
      {/* Bienvenida personalizada */}
      <section className="py-10 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-l from-gray-900 to-black p-6 rounded-lg border border-gray-800">
          <h1 className="text-2xl md:text-3xl font-bold text-[#C0C0C0] mb-2">
            {t("home.welcomeUser")}, {user.nombre || "Usuario"}
          </h1>
          <p className="text-gray-400">{t("home.accessAllFeatures")}</p>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold text-[#C0C0C0] mb-6">{t("home.quickAccess")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAccessCard
            icon={<Calendar className="h-8 w-8 text-[#C0C0C0]" />}
            title={t("navbar.events")}
            description={t("home.viewAllEvents")}
            link="/eventos"
          />
          <QuickAccessCard
            icon={<Music className="h-8 w-8 text-[#C0C0C0]" />}
            title={t("home.compositions")}
            description={t("home.viewAllCompositions")}
            link="/composiciones"
          />
          <QuickAccessCard
            icon={<MessageSquare className="h-8 w-8 text-[#C0C0C0]" />}
            title={t("navbar.messages")}
            description={t("home.checkMessages")}
            link="/mensajes"
          />
          <QuickAccessCard
            icon={<User className="h-8 w-8 text-[#C0C0C0]" />}
            title={t("home.myProfile")}
            description={t("home.myProfile")}
            link="/perfil"
          />
        </div>
      </section>

      {/* Próximos eventos */}
      <section className="py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#C0C0C0]">{t("home.upcomingEvents")}</h2>
          <Link to="/eventos" className="text-sm text-[#C0C0C0] hover:text-white">
            {t("home.seeAll")} →
          </Link>
        </div>
        <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden">
          {loadingEvents ? (
            <div className="p-4 border-b border-gray-800">
              <p className="text-gray-400 text-sm">Cargando eventos...</p>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {upcomingEvents.map((evento) => (
                <div key={evento.id} className="p-4">
                  <div>
                    <h3 className="text-[#C0C0C0] font-medium mb-2">{evento.nombre}</h3>
                    <div className="flex flex-col gap-1 text-sm text-gray-400">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(evento.fecha).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(evento.fecha).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>📍 {evento.lugar}</span>
                      <span
                        className={`px-3 py-1 text-xs rounded-full border capitalize ${getEventTypeColor(evento.tipo)}`}
                      >
                        {evento.tipo}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border-b border-gray-800">
              <p className="text-gray-400 text-sm">{t("home.noUpcomingEvents")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Composiciones recientes */}
      <section className="py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#C0C0C0]">{t("home.recentCompositions")}</h2>
          <Link to="/composiciones" className="text-sm text-[#C0C0C0] hover:text-white">
            {t("home.seeAll")} →
          </Link>
        </div>
        <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden">
          {loadingCompositions ? (
            <div className="p-4 border-b border-gray-800">
              <p className="text-gray-400 text-sm">Cargando composiciones...</p>
            </div>
          ) : recentCompositions.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {recentCompositions.map((composicion) => (
                <div key={composicion.id} className="p-4">
                  <div>
                    <h3 className="text-[#C0C0C0] font-medium mb-1">{composicion.nombre}</h3>
                    <p className="text-gray-400 text-sm mb-2">Autor: {composicion.nombre_autor}</p>
                    <p className="text-gray-500 text-xs">
                      Añadida:{" "}
                      {new Date(composicion.created_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border-b border-gray-800">
              <p className="text-gray-400 text-sm">{t("home.noRecentCompositions")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Panel de administración (solo para administradores) */}
      {user.role === "admin" && (
        <section className="py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-[#C0C0C0] mb-6">{t("home.adminPanel")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminCard
              icon={<Users className="h-8 w-8 text-[#C0C0C0]" />}
              title={t("home.userManagement")}
              link="/usuarios"
            />
            <AdminCard
              icon={<Package className="h-8 w-8 text-[#C0C0C0]" />}
              title={t("home.instrumentManagement")}
              link="/instrumentos"
            />
            <AdminCard
              icon={<Users className="h-8 w-8 text-[#C0C0C0]" />}
              title={t("home.entityManagement")}
              link="/entidades"
            />
            <AdminCard
              icon={<Calendar className="h-8 w-8 text-[#C0C0C0]" />}
              title={t("home.calendarManagement")}
              link="/calendario"
            />
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * Tarjeta de funcionalidad destacada para la home pública.
 * @component
 * @param {Object} props
 * @param {JSX.Element} props.icon - Icono a mostrar.
 * @param {string} props.title - Título de la funcionalidad.
 * @param {string} props.description - Descripción de la funcionalidad.
 * @returns {JSX.Element}
 */
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-black/50 p-6 rounded-lg border border-gray-800 hover:border-[#C0C0C0] transition-colors duration-300 h-full">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-[#C0C0C0] text-center mb-2">{title}</h3>
      <p className="text-gray-400 text-center">{description}</p>
    </div>
  )
}

/**
 * Tarjeta de acceso rápido para el dashboard de usuario.
 * @component
 * @param {Object} props
 * @param {JSX.Element} props.icon - Icono a mostrar.
 * @param {string} props.title - Título del acceso.
 * @param {string} props.description - Descripción del acceso.
 * @param {string} props.link - Ruta de navegación.
 * @returns {JSX.Element}
 */
function QuickAccessCard({ icon, title, description, link }) {
  return (
    <Link to={link} className="block">
      <div className="bg-black/50 p-5 rounded-lg border border-gray-800 hover:border-[#C0C0C0] hover:bg-gray-900/20 transition-all duration-300 h-full">
        <div className="flex items-start">
          <div className="mr-4">{icon}</div>
          <div>
            <h3 className="text-lg font-medium text-[#C0C0C0] mb-1">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

/**
 * Tarjeta de acceso rápido para el panel de administración.
 * @component
 * @param {Object} props
 * @param {JSX.Element} props.icon - Icono a mostrar.
 * @param {string} props.title - Título del acceso.
 * @param {string} props.link - Ruta de navegación.
 * @returns {JSX.Element}
 */
function AdminCard({ icon, title, link }) {
  return (
    <Link to={link} className="block">
      <div className="bg-black/50 p-5 rounded-lg border border-gray-800 hover:border-[#C0C0C0] hover:bg-gray-900/20 transition-all duration-300 h-full">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">{icon}</div>
          <h3 className="text-lg font-medium text-[#C0C0C0]">{title}</h3>
        </div>
      </div>
    </Link>
  )
}
