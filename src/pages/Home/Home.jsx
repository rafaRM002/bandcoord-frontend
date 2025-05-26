import { Link } from "react-router-dom"
import { Music, Calendar, MessageSquare, Users, Package, Shield, Award, User, BookOpen } from "lucide-react"

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

// Componente para usuarios no autenticados
function PublicHome() {
  return (
    <div className="w-full bg-black">
      {/* Hero section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-center">
          <img src={`${import.meta.env.BASE_URL}/1-removebg-preview.png`} alt="Logo BandCoord" className="h-40 w-auto" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#C0C0C0] mb-6">
            Bienvenido a
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C0C0C0] to-white"> BandCoord</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 px-4">
            La plataforma integral para gestionar todos los aspectos de tu banda musical
          </p>
          <div className="flex flex-wrap justify-center gap-4 px-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors duration-300"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#C0C0C0] mb-12 text-center">Características principales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          <FeatureCard
            icon={<Calendar className="h-10 w-10 text-[#C0C0C0]" />}
            title="Gestión de Eventos"
            description="Organiza y coordina todos los eventos de tu banda de manera eficiente."
          />
          <FeatureCard
            icon={<Music className="h-10 w-10 text-[#C0C0C0]" />}
            title="Composiciones"
            description="Administra las partituras y composiciones de tu repertorio musical."
          />
          <FeatureCard
            icon={<MessageSquare className="h-10 w-10 text-[#C0C0C0]" />}
            title="Comunicación"
            description="Mantén a todos los miembros informados con nuestro sistema de mensajería."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-[#C0C0C0]" />}
            title="Gestión de Miembros"
            description="Administra los miembros de tu banda y sus roles de manera sencilla."
          />
        </div>
      </section>

      {/* About section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="px-4">
              <h2 className="text-3xl font-bold text-[#C0C0C0] mb-6">Sobre BandCoord</h2>
              <p className="text-gray-400 mb-6">
                BandCoord nació de la necesidad de simplificar la gestión de bandas musicales. Nuestra plataforma ofrece
                herramientas intuitivas para coordinar eventos, gestionar partituras, facilitar la comunicación entre
                miembros y mucho más.
              </p>
              <p className="text-gray-400 mb-6">
                Diseñada por músicos para músicos, BandCoord entiende las necesidades específicas de las bandas y
                proporciona soluciones adaptadas a cada tipo de agrupación musical.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#C0C0C0] flex-shrink-0" />
                  <span className="text-gray-300">Seguro y confiable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#C0C0C0] flex-shrink-0" />
                  <span className="text-gray-300">Calidad profesional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#C0C0C0] flex-shrink-0" />
                  <span className="text-gray-300">Centrado en el usuario</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#C0C0C0] flex-shrink-0" />
                  <span className="text-gray-300">Actualizaciones regulares</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-black p-1 rounded-lg mt-8 lg:mt-0 mx-4">
              <div className="bg-black rounded-lg p-8 h-full">
                <h3 className="text-xl font-semibold text-[#C0C0C0] mb-4">¿Por qué elegir BandCoord?</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="bg-gray-800 rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#C0C0C0] text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="text-[#C0C0C0] font-medium">Todo en un solo lugar</h4>
                      <p className="text-gray-400 text-sm">
                        Gestiona todos los aspectos de tu banda desde una única plataforma.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-gray-800 rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#C0C0C0] text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="text-[#C0C0C0] font-medium">Fácil de usar</h4>
                      <p className="text-gray-400 text-sm">
                        Interfaz intuitiva diseñada para músicos, no para programadores.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-gray-800 rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#C0C0C0] text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="text-[#C0C0C0] font-medium">Colaboración en tiempo real</h4>
                      <p className="text-gray-400 text-sm">Trabaja con tu banda de forma sincronizada y eficiente.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-gray-800 rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#C0C0C0] text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="text-[#C0C0C0] font-medium">Soporte personalizado</h4>
                      <p className="text-gray-400 text-sm">
                        Asistencia dedicada para resolver cualquier duda o problema.
                      </p>
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
        <h2 className="text-2xl md:text-3xl font-bold text-[#C0C0C0] mb-12 text-center">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-black/50 p-8 rounded-lg border border-gray-800 hover:border-[#C0C0C0] transition-colors duration-300">
            <div className="bg-gray-800 rounded-full h-12 w-12 flex items-center justify-center mb-6 mx-auto">
              <span className="text-[#C0C0C0] text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold text-[#C0C0C0] text-center mb-4">Regístrate</h3>
            <p className="text-gray-400 text-center">
              Crea tu cuenta y configura el perfil de tu banda con todos los detalles necesarios.
            </p>
          </div>
          <div className="bg-black/50 p-8 rounded-lg border border-gray-800 hover:border-[#C0C0C0] transition-colors duration-300">
            <div className="bg-gray-800 rounded-full h-12 w-12 flex items-center justify-center mb-6 mx-auto">
              <span className="text-[#C0C0C0] text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold text-[#C0C0C0] text-center mb-4">Invita a tu banda</h3>
            <p className="text-gray-400 text-center">
              Añade a los miembros de tu banda para que puedan acceder a toda la información.
            </p>
          </div>
          <div className="bg-black/50 p-8 rounded-lg border border-gray-800 hover:border-[#C0C0C0] transition-colors duration-300">
            <div className="bg-gray-800 rounded-full h-12 w-12 flex items-center justify-center mb-6 mx-auto">
              <span className="text-[#C0C0C0] text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold text-[#C0C0C0] text-center mb-4">¡Comienza a coordinar!</h3>
            <p className="text-gray-400 text-center">
              Gestiona eventos, composiciones, comunicaciones y más desde un solo lugar.
            </p>
          </div>
        </div>
      </section>

      {/* Invitación a unirse */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-black/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#C0C0C0] mb-6">¿Listo para empezar?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 px-4">
            Únete a BandCoord hoy y lleva la gestión de tu banda al siguiente nivel. Regístrate gratis y descubre todas
            las herramientas que tenemos para ti.
          </p>
          <Link
            to="/register"
            className="px-8 py-4 bg-gradient-to-r from-[#C0C0C0] to-gray-400 text-black font-medium rounded-md hover:from-gray-300 hover:to-[#C0C0C0] transition-all duration-300 inline-block"
          >
            Crear una cuenta
          </Link>
        </div>
      </section>
    </div>
  )
}

// Componente para usuarios autenticados (dashboard)
function UserDashboard({ user }) {
  return (
    <div className="w-full bg-black">
      {/* Bienvenida personalizada */}
      <section className="py-10 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-l from-gray-900 to-black p-6 rounded-lg border border-gray-800">
          <h1 className="text-2xl md:text-3xl font-bold text-[#C0C0C0] mb-2">Bienvenido, {user.nombre || "Usuario"}</h1>
          <p className="text-gray-400">Accede a todas las funcionalidades de BandCoord desde tu panel de control.</p>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold text-[#C0C0C0] mb-6">Accesos rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAccessCard
            icon={<Calendar className="h-8 w-8 text-[#C0C0C0]" />}
            title="Próximos eventos"
            description="Ver todos los eventos programados"
            link="/eventos"
          />
          <QuickAccessCard
            icon={<Music className="h-8 w-8 text-[#C0C0C0]" />}
            title="Composiciones"
            description="Acceder a las partituras y composiciones"
            link="/composiciones"
          />
          <QuickAccessCard
            icon={<MessageSquare className="h-8 w-8 text-[#C0C0C0]" />}
            title="Mensajes"
            description="Revisar mensajes y notificaciones"
            link="/mensajes"
          />
          <QuickAccessCard
            icon={<User className="h-8 w-8 text-[#C0C0C0]" />}
            title="Mi perfil"
            description="Editar información personal"
            link="/perfil"
          />
        </div>
      </section>

      {/* Próximos eventos */}
      <section className="py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#C0C0C0]">Próximos eventos</h2>
          <Link to="/eventos" className="text-sm text-[#C0C0C0] hover:text-white">
            Ver todos →
          </Link>
        </div>
        <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <p className="text-gray-400 text-sm">No hay eventos próximos programados.</p>
          </div>
        </div>
      </section>

      {/* Composiciones recientes */}
      <section className="py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#C0C0C0]">Composiciones recientes</h2>
          <Link to="/composiciones" className="text-sm text-[#C0C0C0] hover:text-white">
            Ver todas →
          </Link>
        </div>
        <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <p className="text-gray-400 text-sm">No hay composiciones recientes.</p>
          </div>
        </div>
      </section>

      {/* Panel de administración (solo para administradores) */}
      {user.role === "admin" && (
        <section className="py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-[#C0C0C0] mb-6">Panel de administración</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminCard
              icon={<Users className="h-8 w-8 text-[#C0C0C0]" />}
              title="Gestión de usuarios"
              link="/admin/usuarios"
            />
            <AdminCard
              icon={<Package className="h-8 w-8 text-[#C0C0C0]" />}
              title="Gestión de instrumentos"
              link="/admin/instrumentos"
            />
            <AdminCard
              icon={<Calendar className="h-8 w-8 text-[#C0C0C0]" />}
              title="Gestión de eventos"
              link="/admin/eventos"
            />
            <AdminCard
              icon={<BookOpen className="h-8 w-8 text-[#C0C0C0]" />}
              title="Gestión de composiciones"
              link="/admin/composiciones"
            />
          </div>
        </section>
      )}
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-black/50 p-6 rounded-lg border border-gray-800 hover:border-[#C0C0C0] transition-colors duration-300 h-full">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-[#C0C0C0] text-center mb-2">{title}</h3>
      <p className="text-gray-400 text-center">{description}</p>
    </div>
  )
}

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
