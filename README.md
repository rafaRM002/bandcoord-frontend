<!--
  @file README.md
  @module readme
  @description Documentación principal del proyecto BandCoord. Incluye descripción general, características, tecnologías, instalación, estructura, funcionalidades por rol, internacionalización, responsive design, seguridad, despliegue, contribución, roadmap, reporte de bugs, licencia y equipo de desarrollo. Proporciona una guía completa para usuarios y desarrolladores sobre el uso y mantenimiento de la aplicación.
  @author Rafael Rodriguez Mengual
-->

# BandCoord 🎵

**Sistema de Gestión Integral para Bandas de Música**

BandCoord es una aplicación web moderna diseñada específicamente para la gestión completa de bandas de música, ofreciendo herramientas profesionales para la organización de eventos, gestión de instrumentos, comunicación interna y mucho más.

![BandCoord Logo](public/1-removebg-preview.png)

## 🌟 Características Principales

### 📅 Gestión de Eventos
- **Calendario Interactivo**: Visualización completa de todos los eventos programados
- **Tipos de Eventos**: Ensayos, procesiones, conciertos, pasacalles
- **Confirmación de Asistencia**: Sistema de confirmación para músicos
- **Mínimos por Evento**: Configuración de requisitos mínimos de participación

### 🎼 Gestión de Composiciones
- **Biblioteca Musical**: Catálogo completo de composiciones
- **Historial de Interpretaciones**: Registro de composiciones interpretadas en eventos
- **Información Detallada**: Autor, género, dificultad y notas adicionales

### 🎺 Gestión de Instrumentos
- **Inventario Completo**: Control total del inventario instrumental
- **Sistema de Préstamos**: Gestión de préstamos a músicos
- **Tipos de Instrumentos**: Categorización y clasificación
- **Estado y Mantenimiento**: Seguimiento del estado de cada instrumento

### 💬 Sistema de Comunicación
- **Mensajería Interna**: Comunicación directa entre miembros
- **Notificaciones**: Alertas automáticas para eventos importantes
- **Mensajes Administrativos**: Comunicados oficiales de la dirección

### 👥 Gestión de Usuarios
- **Roles y Permisos**: Sistema de roles (Admin, Miembro)
- **Perfiles Personalizados**: Información detallada de cada músico
- **Gestión de Estados**: Aprobación y control de nuevos miembros

### 🏢 Gestión de Entidades
- **Organizaciones**: Gestión de entidades colaboradoras
- **Contactos**: Información de contacto y relaciones

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca principal para la interfaz de usuario
- **Vite** - Herramienta de construcción y desarrollo
- **React Router DOM** - Navegación y enrutamiento
- **Tailwind CSS** - Framework de estilos utilitarios
- **Lucide React** - Iconografía moderna

### Backend Integration
- **Laravel API** - Backend RESTful
- **Axios** - Cliente HTTP para comunicación con la API
- **Laravel Sanctum** - Autenticación basada en tokens

### Características Técnicas
- **Responsive Design** - Adaptable a todos los dispositivos
- **Internacionalización** - Soporte para español e inglés
- **Autenticación Segura** - Sistema de tokens 
- **Estado Global** - Context API para gestión de estado

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Servidor Laravel configurado

### Instalación

1. **Clonar el repositorio**
```bash
git clone [https://github.com/rafaRM002/bandcoord-frontend.git]
cd bandcoord
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la URL de la API**
Editar `src/api/axios.js` con la URL correcta del backend:
```javascript
const API_BASE_URL = 'https://www.iestrassierra.net/alumnado/curso2425/DAW/daw2425a16/laravel/public/api'
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
```

## 🏗️ Estructura del Proyecto

```
src/
├── api/                    # Configuración de Axios
├── components/             # Componentes reutilizables
│   ├── Navigation/         # Navbar y Footer
│   ├── HelpButton/         # Sistema de ayuda
│   └── ui/                 # Componentes UI base
├── context/                # Context API
│   ├── AuthContext.jsx     # Autenticación
│   └── LanguageContext.jsx # Internacionalización
├── hooks/                  # Custom hooks
├── pages/                  # Páginas principales
│   ├── Admin/              # Panel administrativo
│   ├── Calendario/         # Gestión de calendario
│   ├── Composiciones/      # Gestión musical
│   ├── Eventos/            # Gestión de eventos
│   ├── Instrumentos/       # Gestión instrumental
│   ├── Mensajes/           # Sistema de mensajería
│   └── ...
├── utils/                  # Utilidades y traducciones
└── assets/                 # Recursos estáticos
```

## 🎯 Funcionalidades por Rol

### 👑 Administrador
- Gestión completa de usuarios
- Configuración de eventos y mínimos
- Administración del inventario
- Acceso a todas las funcionalidades
- Panel de control administrativo

### 🎵 Miembro
- Visualización de eventos y calendario
- Confirmación de asistencia
- Acceso a la biblioteca musical
- Sistema de mensajería
- Gestión de perfil personal

## 🌐 Internacionalización

BandCoord soporta múltiples idiomas:
- **Español** (es) - Idioma por defecto
- **Inglés** (en) - Traducción completa

### Cambiar Idioma
Los usuarios pueden cambiar el idioma desde la barra de navegación utilizando las banderas correspondientes.

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🔐 Seguridad

### Autenticación
- Sistema de tokens
- Protección CSRF
- Rutas protegidas por rol
- Validación de sesiones

### Autorización
- Control de acceso basado en roles
- Protección de rutas administrativas
- Validación de permisos en tiempo real

## 🚀 Despliegue

### Configuración de Producción

1. **Construcción**
```bash
npm run build
```

2. **Configuración del servidor**
- Configurar el `base` en `vite.config.js` según la ruta de despliegue
- Asegurar que el servidor soporte SPA routing

## 🤝 Contribución

### Guías de Desarrollo

1. **Estilo de Código**
   - Usar ESLint y Prettier
   - Seguir convenciones de React
   - Comentar código complejo

2. **Commits**
   - Usar mensajes descriptivos
   - Seguir conventional commits
   - Incluir contexto relevante

3. **Pull Requests**
   - Describir cambios claramente
   - Incluir capturas si hay cambios visuales
   - Asegurar que las pruebas pasen

## 📋 Roadmap

### Próximas Funcionalidades
- [ ] Modo claro/oscuro
- [ ] Recuperación de contraseña
- [ ] Sistema de asistencia
- [ ] Notificaciones en tiempo real
- [ ] Sistema de mapas
- [ ] Aplicación móvil nativa

### Mejoras Técnicas
- [ ] PWA (Progressive Web App)
- [ ] Modo offline básico

## 🐛 Reporte de Bugs

Para reportar bugs o solicitar funcionalidades:

1. Verificar que no exista un issue similar
2. Crear un nuevo issue con:
   - Descripción detallada
   - Pasos para reproducir
   - Capturas de pantalla
   - Información del navegador/dispositivo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [`LICENSE`](./LICENSE) para más detalles.

## 👥 Equipo de Desarrollo

- **Desarrollador Principal**: [Rafael Rodríguez Mengual]
- **Diseño UI/UX**: [Rafael Rodríguez Mengual]
- **Backend**: [Rafael Rodríguez Mengual]

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: soporte@bandcoord.com
---

**BandCoord** - Coordinando la música, simplificando la gestión 🎵