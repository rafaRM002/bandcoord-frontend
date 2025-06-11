/**
 * @file Instrumentos.jsx
 * @module pages/Instrumentos/Instrumentos
 * @description Página para la gestión de instrumentos musicales. Permite crear, editar, eliminar, buscar, filtrar y paginar instrumentos, así como gestionar préstamos asociados y actualizar cantidades de tipos de instrumento. Solo los administradores pueden modificar datos.
 * @author Rafael Rodriguez Mengual
 */

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Music,
  Filter,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";
import api from "../../api/axios";
import { useTranslation } from "../../hooks/useTranslation";
import { useAuth } from "../../context/AuthContext";

/**
 * Componente principal para la gestión de instrumentos musicales.
 * Permite listar, buscar, filtrar, crear, editar, eliminar y gestionar préstamos de instrumentos.
 * @component
 * @returns {JSX.Element} Página de instrumentos.
 */
export default function Instrumentos() {
  /** Lista de instrumentos */
  const [instrumentos, setInstrumentos] = useState([]);
  /** Estado de carga */
  const [loading, setLoading] = useState(true);
  /** Mensaje de error de conexión */
  const [error, setError] = useState(null);
  /** Término de búsqueda */
  const [searchTerm, setSearchTerm] = useState("");
  /** Filtro por tipo de instrumento */
  const [tipoFilter, setTipoFilter] = useState("");
  /** Lista de tipos de instrumento */
  const [tiposInstrumento, setTiposInstrumento] = useState([]);
  /** Estado del modal de confirmación de borrado */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  /** Número de serie del instrumento a eliminar */
  const [instrumentoToDelete, setInstrumentoToDelete] = useState(null);
  /** Hook de traducción */
  const { t } = useTranslation();
  /** Lista de usuarios */
  const [usuarios, setUsuarios] = useState([]);
  /** Lista de préstamos */
  const [prestamos, setPrestamos] = useState([]);
  /** Mensaje de éxito */
  const [successMessage, setSuccessMessage] = useState(null);
  /** Mensaje de error de operación */
  const [errorMessage, setErrorMessage] = useState(null);

  // Paginación
  /** Página actual */
  const [currentPage, setCurrentPage] = useState(1);
  /** Elementos por página */
  const [itemsPerPage] = useState(10);

  // Modal para crear/editar instrumento
  /** Estado del modal de formulario */
  const [showModal, setShowModal] = useState(false);
  /** Modo del modal: "create" o "edit" */
  const [modalMode, setModalMode] = useState("create");
  /** Instrumento actual para crear/editar */
  const [currentInstrumento, setCurrentInstrumento] = useState({
    numero_serie: "",
    instrumento_tipo_id: "",
    estado: "disponible",
  });

  /** Usuario seleccionado para préstamo */
  const [selectedLoanUser, setSelectedLoanUser] = useState("");

  /** Estado del modal de confirmación de creación */
  const [showCreateConfirmModal, setShowCreateConfirmModal] = useState(false);

  /** Si el usuario es administrador */
  const { isAdmin } = useAuth();

  /**
   * Efecto para cargar datos al montar el componente.
   */
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Carga los datos de instrumentos, tipos, usuarios y préstamos.
   * @async
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // console.log("Intentando conectar a:", `${api.defaults.baseURL}/instrumentos`)

      const [instrumentosRes, tiposRes, usuariosRes, prestamosRes] =
        await Promise.all([
          api.get("/instrumentos"),
          api.get("/tipo-instrumentos"),
          api.get("/usuarios"),
          api.get("/prestamos"),
        ]);

      // console.log("Respuesta de instrumentos:", instrumentosRes)
      // console.log("Respuesta de tipos:", tiposRes)
      // console.log("Respuesta de usuarios:", usuariosRes)
      // console.log("Respuesta de préstamos:", prestamosRes)

      setInstrumentos(instrumentosRes.data);
      setTiposInstrumento(tiposRes.data);

      // console.log("🔍 Estructura de tipos de instrumento:", tiposRes.data)
      // if (tiposRes.data && tiposRes.data.length > 0) {
      //   console.log("🔍 Primer tipo de instrumento:", tiposRes.data[0])
      //   console.log("🔍 Claves disponibles:", Object.keys(tiposRes.data[0]))
      // }

      // Procesar datos de usuarios
      let usuariosData = [];
      if (usuariosRes.data && Array.isArray(usuariosRes.data)) {
        usuariosData = usuariosRes.data;
      } else if (
        usuariosRes.data &&
        usuariosRes.data.data &&
        Array.isArray(usuariosRes.data.data)
      ) {
        usuariosData = usuariosRes.data.data;
      }
      setUsuarios(usuariosData);

      // Procesar datos de préstamos
      let prestamosData = [];
      if (prestamosRes.data && Array.isArray(prestamosRes.data)) {
        prestamosData = prestamosRes.data;
      } else if (
        prestamosRes.data &&
        prestamosRes.data.data &&
        Array.isArray(prestamosRes.data.data)
      ) {
        prestamosData = prestamosRes.data.data;
      }
      setPrestamos(prestamosData);

      // console.log("Préstamos procesados:", prestamosData)
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError(`Error al cargar datos: ${error.message}`);

      if (error.response) {
        console.error(
          "Respuesta del servidor:",
          error.response.status,
          error.response.data
        );
        setError(
          `Error del servidor: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor");
        setError(
          "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución."
        );
      } else {
        console.error("Error de configuración:", error.message);
        setError(`Error de configuración: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un instrumento y sus préstamos asociados, y actualiza la cantidad del tipo.
   * @async
   */
  const handleDelete = async () => {
    if (!instrumentoToDelete) return;

    try {
      // Obtener información del instrumento antes de eliminarlo para decrementar la cantidad
      const instrumentoAEliminar = instrumentos.find(
        (i) => i.numero_serie === instrumentoToDelete
      );
      // console.log("🔍 Instrumento a eliminar:", instrumentoAEliminar)

      // Eliminar préstamos activos asociados
      const prestamosActivos = prestamos.filter(
        (prestamo) =>
          String(prestamo.num_serie) === String(instrumentoToDelete) &&
          (!prestamo.fecha_devolucion || prestamo.fecha_devolucion === "")
      );

      // console.log(`🔄 Eliminando ${prestamosActivos.length} préstamos activos para instrumento ${instrumentoToDelete}`)

      for (const prestamo of prestamosActivos) {
        try {
          await api.delete(
            `/prestamos/${prestamo.num_serie}/${prestamo.usuario_id}`
          );
          // console.log(`✅ Préstamo eliminado: ${prestamo.num_serie}/${prestamo.usuario_id}`)
        } catch (error) {
          console.error(
            `❌ Error al eliminar préstamo ${prestamo.num_serie}/${prestamo.usuario_id}:`,
            error
          );
        }
      }

      // Eliminar el instrumento
      await api.delete(`/instrumentos/${instrumentoToDelete}`);
      // console.log(`✅ Instrumento ${instrumentoToDelete} eliminado`)

      // Decrementar la cantidad del tipo de instrumento
      if (instrumentoAEliminar && instrumentoAEliminar.instrumento_tipo_id) {
        try {
          // console.log(`📊 Decrementando cantidad de tipo ${instrumentoAEliminar.instrumento_tipo_id}`)

          const tipoActual = tiposInstrumento.find(
            (t) => t.instrumento === instrumentoAEliminar.instrumento_tipo_id
          );
          if (tipoActual && tipoActual.cantidad > 0) {
            await api.put(
              `/tipo-instrumentos/${encodeURIComponent(
                instrumentoAEliminar.instrumento_tipo_id
              )}`,
              {
                cantidad: tipoActual.cantidad - 1,
              }
            );
            // console.log(`✅ Cantidad de tipo ${instrumentoAEliminar.instrumento_tipo_id} decrementada`)
          } else {
            // console.warn(`⚠️ No se pudo decrementar la cantidad del tipo ${instrumentoAEliminar.instrumento_tipo_id}`)
          }
        } catch (error) {
          console.error("❌ Error al decrementar cantidad de tipo:", error);
        }
      }

      setInstrumentos(
        instrumentos.filter((item) => item.numero_serie !== instrumentoToDelete)
      );
      setShowDeleteModal(false);
      setInstrumentoToDelete(null);

      setSuccessMessage(t("instruments.deleteConfirmation.successMessage"));
      setTimeout(() => setSuccessMessage(null), 3000);

      await fetchData();
    } catch (error) {
      console.error("Error al eliminar instrumento:", error);
      setErrorMessage(`Error al eliminar instrumento: ${error.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  /**
   * Abre el modal de confirmación de borrado para un instrumento.
   * @param {string} numSerie - Número de serie del instrumento.
   */
  const confirmDelete = (numSerie) => {
    setInstrumentoToDelete(numSerie);
    setShowDeleteModal(true);
  };

  /**
   * Muestra el modal de confirmación antes de crear un instrumento.
   */
  const handleCreateInstrument = () => {
    setShowCreateConfirmModal(true);
  };

  /**
   * Confirma la creación y abre el modal principal.
   */
  const confirmCreateInstrument = () => {
    setShowCreateConfirmModal(false);
    handleOpenModal("create");
  };

  /**
   * Abre el modal para crear o editar un instrumento.
   * @param {"create"|"edit"} mode - Modo del modal.
   * @param {Object|null} instrumento - Instrumento a editar (opcional).
   */
  const handleOpenModal = async (mode, instrumento = null) => {
    setModalMode(mode);
    if (mode === "edit" && instrumento) {
      // console.log("Opening edit modal for instrument:", instrumento)
      let usuarioPrestamo = "";

      // Si el instrumento está prestado, buscar el préstamo activo
      if (instrumento.estado === "prestado") {
        // console.log("Fetching loan info for instrument:", instrumento.numero_serie)
        // console.log("Available loans:", prestamos)
        const prestamoActivo = prestamos.find((prestamo) => {
          // console.log("Comparing loan:", {
          //   prestamoNumSerie: prestamo.num_serie,
          //   instrumentoNumSerie: instrumento.numero_serie,
          //   fechaDevolucion: prestamo.fecha_devolucion,
          //   isActive: !prestamo.fecha_devolucion || prestamo.fecha_devolucion === "",
          // })
          return (
            String(prestamo.num_serie) === String(instrumento.numero_serie) &&
            (!prestamo.fecha_devolucion || prestamo.fecha_devolucion === "")
          );
        });

        // console.log("Active loan found:", prestamoActivo)

        if (prestamoActivo && prestamoActivo.usuario_id) {
          usuarioPrestamo = String(prestamoActivo.usuario_id);
          // console.log("Setting user loan to:", usuarioPrestamo)
          // const usuarioEncontrado = usuarios.find((u) => String(u.id) === usuarioPrestamo)
          // console.log("User found in users list:", usuarioEncontrado)
        } else {
          // console.log("No active loan found for instrument:", instrumento.numero_serie)
        }
      }

      setCurrentInstrumento({
        numero_serie: instrumento.numero_serie,
        instrumento_tipo_id: String(instrumento.instrumento_tipo_id),
        estado: String(instrumento.estado),
      });

      setSelectedLoanUser(usuarioPrestamo);
    } else {
      setCurrentInstrumento({
        numero_serie: "",
        instrumento_tipo_id:
          tiposInstrumento.length > 0 ? tiposInstrumento[0].instrumento : "",
        estado: "disponible",
      });
      setSelectedLoanUser("");
    }
    setShowModal(true);
  };

  /**
   * Cierra el modal de formulario de instrumento.
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentInstrumento({
      numero_serie: "",
      instrumento_tipo_id: "",
      estado: "disponible",
    });
    setSelectedLoanUser("");
  };

  /**
   * Maneja el cambio en los campos del formulario de instrumento.
   * @param {Object} e - Evento de cambio.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(`🔍 Input change: ${name} = ${value} (type: ${typeof value})`)
    setCurrentInstrumento((prev) => ({
      ...prev,
      [name]: String(value),
    }));
  };

  /**
   * Maneja el cambio de usuario para préstamo.
   * @param {Object} e - Evento de cambio.
   */
  const handleLoanUserChange = (e) => {
    setSelectedLoanUser(e.target.value);
  };

  /**
   * Limpia el usuario del préstamo si el estado cambia a distinto de "prestado".
   */
  useEffect(() => {
    if (currentInstrumento.estado !== "prestado") {
      setSelectedLoanUser("");
    }
  }, [currentInstrumento.estado]);

  /**
   * Envía el formulario para crear o editar un instrumento y gestiona préstamos y cantidades.
   * @async
   * @param {Object} e - Evento de envío.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const tipoId = String(
        currentInstrumento.instrumento_tipo_id
      ).toLowerCase();

      if (modalMode === "create") {
        const needsLoan =
          currentInstrumento.estado === "prestado" && selectedLoanUser;

        const instrumentoData = {
          numero_serie: currentInstrumento.numero_serie,
          instrumento_tipo_id: tipoId,
          estado: needsLoan ? "disponible" : currentInstrumento.estado,
        };

        const response = await api.post("/instrumentos", instrumentoData);

        try {
          const tipoActual = tiposInstrumento.find(
            (t) => String(t.instrumento).toLowerCase() === tipoId
          );
          if (tipoActual) {
            await api.put(`/tipo-instrumentos/${encodeURIComponent(tipoId)}`, {
              cantidad: tipoActual.cantidad + 1,
            });
          }
        } catch (error) {
          console.error("❌ Error al actualizar cantidad de tipo:", error);
        }

        if (needsLoan) {
          try {
            const fechaPrestamo = new Date().toISOString().split("T")[0];
            const prestamoData = {
              num_serie: currentInstrumento.numero_serie,
              usuario_id: Number.parseInt(selectedLoanUser),
              fecha_prestamo: fechaPrestamo,
              fecha_devolucion: "",
            };

            await api.post("/prestamos", prestamoData);

            await api.put(`/instrumentos/${currentInstrumento.numero_serie}`, {
              estado: "prestado",
              instrumento_tipo_id: tipoId,
            });
          } catch (error) {
            console.error("❌ Error al crear préstamo:", error);
            if (error.response) {
              console.error("Detalles del error:", error.response.data);
            }
            setErrorMessage(
              `Error al crear préstamo: ${
                error.response?.data
                  ? JSON.stringify(error.response.data)
                  : error.message
              }`
            );
            setTimeout(() => setErrorMessage(null), 5000);
          }
        }

        const finalInstrumento = {
          ...response.data,
          estado: needsLoan ? "prestado" : currentInstrumento.estado,
        };
        setInstrumentos([...instrumentos, finalInstrumento]);

        setSuccessMessage(
          needsLoan
            ? "Instrumento creado y préstamo registrado correctamente"
            : "Instrumento creado exitosamente"
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const originalInstrumento = instrumentos.find(
          (i) => i.numero_serie === currentInstrumento.numero_serie
        );

        const tipoIdNuevo = String(
          currentInstrumento.instrumento_tipo_id
        ).toLowerCase();
        const tipoIdAnterior = String(
          originalInstrumento.instrumento_tipo_id
        ).toLowerCase();

        const instrumentoToUpdate = {
          estado: currentInstrumento.estado,
          instrumento_tipo_id: tipoIdNuevo,
        };

        const updateUrl = `/instrumentos/${currentInstrumento.numero_serie}`;

        if (
          !(
            originalInstrumento.estado !== "prestado" &&
            currentInstrumento.estado === "prestado"
          )
        ) {
          await api.put(updateUrl, instrumentoToUpdate);
        }

        if (tipoIdAnterior !== tipoIdNuevo) {
          try {
            const tipoAnteriorRes = await api.get(
              `/tipo-instrumentos/${encodeURIComponent(tipoIdAnterior)}`
            );
            const tipoNuevoRes = await api.get(
              `/tipo-instrumentos/${encodeURIComponent(tipoIdNuevo)}`
            );

            if (
              tipoAnteriorRes.data.data &&
              tipoAnteriorRes.data.data.cantidad > 0
            ) {
              await api.put(
                `/tipo-instrumentos/${encodeURIComponent(tipoIdAnterior)}`,
                {
                  cantidad: tipoAnteriorRes.data.data.cantidad - 1,
                }
              );
            }

            if (tipoNuevoRes.data.data) {
              await api.put(
                `/tipo-instrumentos/${encodeURIComponent(tipoIdNuevo)}`,
                {
                  cantidad: tipoNuevoRes.data.data.cantidad + 1,
                }
              );
            }
          } catch (error) {
            console.error("❌ Error al actualizar cantidades de tipos:", error);
          }
        }

        if (originalInstrumento.estado !== currentInstrumento.estado) {
          if (
            originalInstrumento.estado === "prestado" &&
            currentInstrumento.estado !== "prestado"
          ) {
            try {
              const prestamoActivo = prestamos.find(
                (prestamo) =>
                  String(prestamo.num_serie) ===
                    String(currentInstrumento.numero_serie) &&
                  (!prestamo.fecha_devolucion ||
                    prestamo.fecha_devolucion === "")
              );

              if (prestamoActivo) {
                await api.put(
                  `/prestamos/${prestamoActivo.num_serie}/${prestamoActivo.usuario_id}`,
                  {
                    fecha_prestamo: prestamoActivo.fecha_prestamo,
                    fecha_devolucion: new Date().toISOString().split("T")[0],
                  }
                );
              }
            } catch (error) {
              console.error("❌ Error al finalizar préstamo:", error);
            }
          } else if (
            originalInstrumento.estado !== "prestado" &&
            currentInstrumento.estado === "prestado"
          ) {
            if (selectedLoanUser) {
              try {
                const fechaPrestamo = new Date().toISOString().split("T")[0];
                const prestamoData = {
                  num_serie: currentInstrumento.numero_serie,
                  usuario_id: Number.parseInt(selectedLoanUser),
                  fecha_prestamo: fechaPrestamo,
                };

                await api.post(`/prestamos`, prestamoData);

                await api.put(updateUrl, instrumentoToUpdate);
              } catch (error) {
                console.error("❌ Error al crear préstamo:", error);
                if (error.response) {
                  console.error("Detalles del error:", error.response.data);
                  setErrorMessage(
                    `Error al crear préstamo: ${JSON.stringify(
                      error.response.data
                    )}`
                  );
                  setTimeout(() => setErrorMessage(null), 5000);
                }
                return;
              }
            } else {
              console.error(
                "❌ Error: Se intentó crear un préstamo sin seleccionar usuario"
              );
              setErrorMessage(
                "Error: Debe seleccionar un usuario para prestar el instrumento"
              );
              setTimeout(() => setErrorMessage(null), 5000);
              return;
            }
          } else if (
            originalInstrumento.estado === "prestado" &&
            currentInstrumento.estado === "prestado"
          ) {
            const prestamoActivo = prestamos.find(
              (prestamo) =>
                String(prestamo.num_serie) ===
                  String(currentInstrumento.numero_serie) &&
                (!prestamo.fecha_devolucion || prestamo.fecha_devolucion === "")
            );

            if (
              prestamoActivo &&
              String(prestamoActivo.usuario_id) !== selectedLoanUser
            ) {
              try {
                await api.put(
                  `/prestamos/${prestamoActivo.num_serie}/${prestamoActivo.usuario_id}`,
                  {
                    fecha_prestamo: prestamoActivo.fecha_prestamo,
                    fecha_devolucion: new Date().toISOString().split("T")[0],
                  }
                );

                const fechaPrestamo = new Date().toISOString().split("T")[0];
                const prestamoData = {
                  num_serie: currentInstrumento.numero_serie,
                  usuario_id: Number.parseInt(selectedLoanUser),
                  fecha_prestamo: fechaPrestamo,
                };

                await api.post("/prestamos", prestamoData);
              } catch (error) {
                console.error("❌ Error al actualizar préstamo:", error);
              }
            } else if (!prestamoActivo) {
              try {
                const fechaPrestamo = new Date().toISOString().split("T")[0];
                const prestamoData = {
                  num_serie: currentInstrumento.numero_serie,
                  usuario_id: Number.parseInt(selectedLoanUser),
                  fecha_prestamo: fechaPrestamo,
                };

                await api.post("/prestamos", prestamoData);
              } catch (error) {
                console.error(
                  "❌ Error al crear préstamo para corregir inconsistencia:",
                  error
                );
              }
            }
          }
        }

        setInstrumentos(
          instrumentos.map((item) =>
            item.numero_serie === currentInstrumento.numero_serie
              ? { ...item, ...instrumentoToUpdate }
              : item
          )
        );

        if (originalInstrumento.estado !== currentInstrumento.estado) {
          if (currentInstrumento.estado === "prestado") {
            setSuccessMessage(
              "Instrumento marcado como prestado y préstamo creado"
            );
          } else if (originalInstrumento.estado === "prestado") {
            setSuccessMessage("Instrumento devuelto y préstamo finalizado");
          } else {
            setSuccessMessage("Estado del instrumento actualizado");
          }
        } else {
          setSuccessMessage("Instrumento actualizado exitosamente");
        }
        setTimeout(() => setSuccessMessage(null), 3000);
      }

      handleCloseModal();
      await fetchData();
    } catch (error) {
      console.error("❌ Error al guardar instrumento:", error);
      if (error.response && error.response.data) {
        console.error("Detalles del error:", error.response.data);
        setErrorMessage(
          `Error al guardar: ${JSON.stringify(error.response.data)}`
        );
      } else {
        setErrorMessage(`Error al guardar: ${error.message}`);
      }
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  /**
   * Filtra los instrumentos según los criterios de búsqueda y filtros seleccionados.
   * @type {Array}
   */
  const filteredInstrumentos = instrumentos.filter((instrumento) => {
    const matchesSearch =
      String(instrumento.numero_serie)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (instrumento.instrumento_tipo_id &&
        instrumento.instrumento_tipo_id
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (instrumento.estado &&
        instrumento.estado.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTipo =
      tipoFilter === "" || instrumento.instrumento_tipo_id === tipoFilter;

    return matchesSearch && matchesTipo;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInstrumentos = filteredInstrumentos.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredInstrumentos.length / itemsPerPage);

  /**
   * Cambia la página actual de la paginación.
   * @param {number} pageNumber - Número de página a mostrar.
   */
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Renderizado de la interfaz y modales
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modificar el botón "Nuevo Instrumento" para que llame a la nueva función: */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">
          {t("instruments.title")}
        </h1>
        {isAdmin && (
          <button
            onClick={handleCreateInstrument}
            className="flex items-center gap-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
          >
            <Plus size={18} />
            {t("instruments.newInstrument")}
          </button>
        )}
      </div>

      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="bg-green-900/20 border border-green-800 text-green-100 px-4 py-3 rounded-md mb-6 flex items-center">
          <span className="mr-2">✅</span>
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6 flex items-center">
          <span className="mr-2">❌</span>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Mensaje de error de conexión */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">
          <h3 className="font-semibold">Error de conexión</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder={t("instruments.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="w-full pl-10 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] appearance-none"
              >
                <option value="">{t("instruments.allTypes")}</option>
                {tiposInstrumento.map((tipo) => (
                  <option key={tipo.instrumento} value={tipo.instrumento}>
                    {tipo.instrumento}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de instrumentos */}
      <div className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#C0C0C0]">{t("common.loading")}</div>
          </div>
        ) : filteredInstrumentos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Music size={48} className="text-gray-600 mb-4" />
            {/* Modificar el mensaje cuando no hay instrumentos para que no muestre el botón de añadir para miembros: */}
            <p className="text-gray-400 text-center">
              {searchTerm || tipoFilter
                ? "No se encontraron instrumentos con los filtros aplicados."
                : t("instruments.noInstruments")}
            </p>
            {isAdmin && (
              <button
                onClick={handleCreateInstrument}
                className="mt-4 text-[#C0C0C0] hover:text-white underline"
              >
                {t("instruments.addFirstInstrument")}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("instruments.serialNumber")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("instruments.type")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t("instruments.status")}
                      </th>
                      {/* Modificar la columna de acciones en la tabla para que solo aparezca para admins: */}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {isAdmin ? t("common.actions") : ""}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {currentInstrumentos.map((instrumento) => (
                      <tr
                        key={instrumento.numero_serie}
                        className="hover:bg-gray-900/30"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          {instrumento.numero_serie}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          {instrumento.instrumento_tipo_id
                            .charAt(0)
                            .toUpperCase() +
                            instrumento.instrumento_tipo_id.slice(1)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              instrumento.estado === "disponible"
                                ? "bg-green-900/30 text-green-400 border border-green-800"
                                : instrumento.estado === "prestado"
                                ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                                : "bg-red-900/30 text-red-400 border border-red-800"
                            }`}
                          >
                            {instrumento.estado === "en reparacion"
                              ? "En Reparación"
                              : instrumento.estado.charAt(0).toUpperCase() +
                                instrumento.estado.slice(1)}
                          </span>
                        </td>
                        {/* Y en el tbody: */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#C0C0C0]">
                          {isAdmin && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleOpenModal("edit", instrumento)
                                }
                                className="p-1 text-gray-400 hover:text-[#C0C0C0]"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  confirmDelete(instrumento.numero_serie)
                                }
                                className="p-1 text-gray-400 hover:text-red-400"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredInstrumentos.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
            <div className="text-sm text-gray-400">
              {t("common.showing")} {indexOfFirstItem + 1} {t("common.to")}{" "}
              {Math.min(indexOfLastItem, filteredInstrumentos.length)}{" "}
              {t("common.of")} {filteredInstrumentos.length} instrumentos
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md bg-gray-900/50 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageNum
                        ? "bg-black border border-[#C0C0C0] text-[#C0C0C0]"
                        : "bg-gray-900/50 text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md bg-gray-900/50 text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para crear instrumento con traducciones */}
      {showCreateConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-blue-400" size={24} />
              <h3 className="text-xl font-semibold text-[#C0C0C0]">
                {t("instruments.createConfirmation.title")}
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2">
                  {t("instruments.createConfirmation.whatWillHappen")}
                </h4>
                <ul className="text-blue-100 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      {t("instruments.createConfirmation.willCreateInstrument")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      {t(
                        "instruments.createConfirmation.willIncrementQuantity"
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      {t("instruments.createConfirmation.willCreateLoan")}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                <h4 className="text-yellow-300 font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {t("instruments.createConfirmation.currentQuantities")}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {tiposInstrumento.map((tipo) => (
                    <div
                      key={tipo.instrumento}
                      className="flex justify-between text-yellow-100"
                    >
                      <span>{tipo.instrumento}:</span>
                      <span className="font-medium">{tipo.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateConfirmModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmCreateInstrument}
                className="px-4 py-2 bg-blue-900/80 text-blue-100 rounded-md hover:bg-blue-800 flex items-center gap-2"
              >
                <Plus size={18} />
                {t("instruments.createConfirmation.continueCreation")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear/editar instrumento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#C0C0C0]">
                {modalMode === "create"
                  ? t("instruments.newInstrument")
                  : t("instruments.editInstrument")}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="numero_serie"
                    className="block text-[#C0C0C0] text-sm font-medium"
                  >
                    {t("instruments.serialNumber")} *
                  </label>
                  <input
                    id="numero_serie"
                    name="numero_serie"
                    value={currentInstrumento.numero_serie}
                    onChange={handleInputChange}
                    disabled={modalMode === "edit"}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {modalMode === "edit" && (
                    <p className="text-xs text-gray-500">
                      {t("instruments.serialNumberCannotBeModified")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="instrumento_tipo_id"
                    className="block text-[#C0C0C0] text-sm font-medium"
                  >
                    {t("instruments.instrumentType")} *
                  </label>
                  <select
                    id="instrumento_tipo_id"
                    name="instrumento_tipo_id"
                    value={currentInstrumento.instrumento_tipo_id}
                    onChange={handleInputChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  >
                    <option value="">Selecciona un tipo</option>
                    {tiposInstrumento.map((tipo) => (
                      <option key={tipo.instrumento} value={tipo.instrumento}>
                        {tipo.instrumento} ({t("instrumentTypes.quantity")}:{" "}
                        {tipo.cantidad})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="estado"
                    className="block text-[#C0C0C0] text-sm font-medium"
                  >
                    {t("instruments.status")} *
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={currentInstrumento.estado}
                    onChange={handleInputChange}
                    required
                    className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                  >
                    <option value="disponible">
                      {t("instruments.available")}
                    </option>
                    <option value="prestado">{t("instruments.loaned")}</option>
                    <option value="en reparacion">
                      {t("instruments.repair")}
                    </option>
                  </select>
                </div>
                {currentInstrumento.estado === "prestado" && (
                  <div className="space-y-2">
                    <label
                      htmlFor="selectedLoanUser"
                      className="block text-[#C0C0C0] text-sm font-medium"
                    >
                      Usuario del préstamo *
                    </label>
                    <select
                      id="selectedLoanUser"
                      name="selectedLoanUser"
                      value={selectedLoanUser}
                      onChange={handleLoanUserChange}
                      required
                      className="w-full py-2 px-3 bg-gray-900/50 border border-gray-800 rounded-md text-[#C0C0C0] focus:outline-none focus:ring-1 focus:ring-[#C0C0C0] focus:border-[#C0C0C0]"
                    >
                      <option value="">Selecciona un usuario</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario.id} value={String(usuario.id)}>
                          {usuario.nombre} {usuario.apellido1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black border border-[#C0C0C0] text-[#C0C0C0] rounded-md hover:bg-gray-900 transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  {modalMode === "create"
                    ? t("instruments.create")
                    : t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación mejorado con traducciones */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-400" size={24} />
              <h3 className="text-xl font-semibold text-[#C0C0C0]">
                {t("instruments.deleteConfirmation.title")}
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                <h4 className="text-yellow-300 font-medium mb-2">
                  {t("instruments.deleteConfirmation.warning")}
                </h4>
                <ul className="text-yellow-100 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      {t("instruments.deleteConfirmation.willDeleteInstrument")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      {t(
                        "instruments.deleteConfirmation.willDecrementQuantity"
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      {t("instruments.deleteConfirmation.willDeleteLoans")}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <p className="text-red-300 font-medium text-sm">
                  <AlertTriangle className="inline mr-2" size={16} />
                  {t("instruments.deleteConfirmation.cannotBeUndone")}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-800 text-[#C0C0C0] rounded-md hover:bg-gray-700"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-900/80 text-white rounded-md hover:bg-red-800 flex items-center gap-2"
              >
                <Trash2 size={18} />
                {t("instruments.deleteConfirmation.confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
