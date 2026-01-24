// src/router/AppRouter.jsx
import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePublica from "../pages/HomePublica";
import Login from "../pages/Login";
import DashboardEstudiante from "../pages/DashboardEstudiante";
import DashboardDocente from "../pages/DashboardDocente";
import DashboardSecretaria from "../pages/DashboardSecretaria";
import DetalleCursoPublico from "../pages/DetalleCursoPublico";
import CheckoutCurso from "../pages/CheckoutCurso";

import MatricularAlumno from "../components/secretaria/MatricularAlumno";
import RegistrarPago from "../components/secretaria/RegistrarPago";
import GestionCursos from "../components/secretaria/CrearCurso";

import PagoExitoso from "../components/pagos/PagoExitoso";
import MpRedirect from "../pages/MpRedirect";


// ADMIN PAGES
import DashboardAdmin from "../pages/DashboardAdmin";

import AdminLayout from "../components/layout/AdminLayout";


// ADMIN MODULES
import UsuariosAdmin from "../components/Administrador/UsuariosAdmin";
import DocentesAdmin from "../components/Administrador/DocentesAdmin";
import SecretariasAdmin from "../components/Administrador/SecretariasAdmin";
import AlumnosAdmin from "../components/Administrador/AlumnosAdmin";
import CursosAdmin from "../components/Administrador/CursosAdmin";
import SeccionesAdmin from "../components/Administrador/SeccionesAdmin";
import PagosAdmin from "../components/Administrador/PagosAdmin";
import FacturasAdmin from "../components/Administrador/FacturasAdmin";
import AuditoriaAdmin from "../components/Administrador/AuditoriaAdmin";



// rutas/docente (ajusta paths según dónde pongas los archivos)

// DOCENTE PAGES
import MisSecciones from "../components/docente/MisSecciones";
import GestionSesiones from "../components/docente/GestionSesiones";
import RegistrarAsistencia from "../components/docente/RegistrarAsistencia";
import RegistrarNotas from "../components/docente/RegistrarNotas"; // ← corregido
import CalendarioSeccion from "../components/docente/CalendarioSeccion";
import ListaAlumnos from "../components/docente/ListaAlumnos";



// ADMIN COMPRAS
import DashboardCompras from "../pages/DashboardCompras";
import MovimientosCompras from "../components/admin_compras/MovimientosCompras";
import CrearProducto from "../components/admin_compras/CrearProducto";

import ProductoDetalle from "../components/admin_compras/ProductoDetalle";
import MovimientoEntrada from "../components/admin_compras/MovimientoEntrada";
import MovimientoSalida from "../components/admin_compras/MovimientoSalida";
import AprobacionesCompras from "../components/admin_compras/AprobacionesCompras";

import ProductosCompras from "../components/admin_compras/ProductosCompras";



import MovimientoSaldoInicial from "../components/admin_compras/MovimientoSaldoInicial";




//ADMIN LOGISTICA
import ProductosLogistica from "../components/admin_logistica/productos/ProductosLogistica";
import ProductoDetalleLogistica from "../components/admin_logistica/productos/ProductoDetalleLogistica";








// ADMIN LOGISTICA
import DashboardLogistica from "../pages/DashboardLogistica";
import MovimientosLogistica from "../components/admin_logistica/MovimientosLogistica";
import ValidarMovimiento from "../components/admin_logistica/ValidarMovimiento";
import RechazarMovimiento from "../components/admin_logistica/RechazarMovimiento";
import CambioAlmacen from "../components/admin_logistica/CambioAlmacen";




//ADMIN CONTABILIDAD
// ADMIN CONTABILIDAD
import DashboardContabilidad from "../pages/DashboardContabilidad";
import ProductosContabilidad from "../components/admin_contabilidad/ProductosContabilidad";
import ProductoDetalleContabilidad from "../components/admin_contabilidad/ProductoDetalleContabilidad";
import MovimientosContabilidad from "../components/admin_contabilidad/MovimientosContabilidad";
import ValidarMovimientoContabilidad from "../components/admin_contabilidad/ValidarMovimientoContabilidad";
import RechazarMovimientoContabilidad from "../components/admin_contabilidad/RechazarMovimientoContabilidad";
import CambioAlmacenContabilidad from "../components/admin_contabilidad/CambioAlmacenContabilidad";

import HistorialContabilidad from "../components/admin_contabilidad/tablas/TablaHistorialContabilidad";



import { AuthContext } from "../context/AuthContext";



const PrivateRoute = ({ children, roles }) => {
  const { usuario, loading } = useContext(AuthContext);

  console.log("✅ PrivateRoute → usuario:", usuario);  // 🔥 agrega esto
  console.log("✅ PrivateRoute → roles permitidos:", roles);

  if (loading) return <div>Cargando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(usuario.rol)) {
    console.log("❌ Rol no permitido:", usuario.rol);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};



export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLICAS */}
        <Route path="/" element={<HomePublica />} />
        <Route path="/login" element={<Login />} />
        <Route path="/curso/:id" element={<DetalleCursoPublico />} />
        <Route path="/checkout/:cursoId" element={<CheckoutCurso />} />


        <Route
          path="/compras"
          element={
            <PrivateRoute roles={["ADMIN_COMPRAS"]}>
              <DashboardCompras />
            </PrivateRoute>
          }
        >
          <Route index element={null} />

          <Route path="productos" element={<ProductosCompras />} />
       


          <Route path="productos/nuevo" element={<CrearProducto />} />
           

          <Route path="producto/:id" element={<ProductoDetalle />} />

          <Route path="movimientos" element={<MovimientosCompras />} />

          <Route
            path="aprobaciones"
            element={<AprobacionesCompras />}
            
          />


          <Route
            path="movimiento/entrada/:productoId"
            element={<MovimientoEntrada />}
          />

          <Route
            path="movimiento/:tipo/:productoId"
            element={<MovimientoSaldoInicial />}
          />



          <Route
            path="movimiento/:tipo/:productoId"
            element={<MovimientoSaldoInicial />}
          />

          <Route
            path="movimiento/salida/:productoId"
            element={<MovimientoSalida />}
          />

        </Route>






        <Route
          path="/logistica"
          element={
            <PrivateRoute roles={["ADMIN_LOGISTICA"]}>
              <DashboardLogistica />
            </PrivateRoute>
          }
        >
          <Route index element={<MovimientosLogistica />} />

          <Route path="movimientos" element={<MovimientosLogistica />} />
          <Route path="aprobaciones" element={<ValidarMovimiento />} />
          <Route path="rechazar/:id" element={<RechazarMovimiento />} />
          <Route path="cambio-almacen/:productoId" element={<CambioAlmacen />} />


          {/* ✅ PRODUCTOS LOGÍSTICA */}
          <Route path="productos" element={<ProductosLogistica />} />
          <Route path="producto/:id" element={<ProductoDetalleLogistica />} />


        </Route>


        <Route
          path="/contabilidad"
          element={
            <PrivateRoute roles={["ADMIN_CONTABILIDAD"]}>
              <DashboardContabilidad />
            </PrivateRoute>
          }
        >
          <Route index element={<MovimientosContabilidad />} />
          <Route path="pendientes" element={<MovimientosContabilidad />} />
          <Route path="productos" element={<ProductosContabilidad />} />
          <Route path="producto/:id" element={<ProductoDetalleContabilidad />} />
          <Route path="aprobaciones" element={<ValidarMovimientoContabilidad />} />
          <Route path="rechazar/:id" element={<RechazarMovimientoContabilidad />} />
          <Route path="cambio-almacen/:productoId" element={<CambioAlmacenContabilidad />} />
          <Route path="historial" element={<HistorialContabilidad />} />
        </Route>








        

        <Route
          path="/dashboard/admin"
          element={
            <PrivateRoute roles={["ADMIN_MAX","ADMIN_LOGISTICA","ADMIN_CONTABILIDAD"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          






          <Route
            path="usuarios"
            element={
              <PrivateRoute roles={["ADMIN_MAX", "ADMIN_LOGISTICA"]}>
                <UsuariosAdmin />
              </PrivateRoute>
            }
          />

          <Route
            path="cursos"
            element={
              <PrivateRoute roles={["ADMIN_MAX","ADMIN_LOGISTICA"]}>
                <CursosAdmin />
              </PrivateRoute>
            }
          />

          <Route
            path="pagos"
            element={
              <PrivateRoute roles={["ADMIN_MAX","ADMIN_CONTABILIDAD"]}>
                <PagosAdmin />
              </PrivateRoute>
            }
          />



        </Route>








        {/* ESTUDIANTE */}
        <Route
          path="/dashboard/estudiante"
          element={
            <PrivateRoute roles={["ESTUDIANTE","DOCENTE","SECRETARIA","ADMIN"]}>

              <DashboardEstudiante />
            </PrivateRoute>
          }
        />

          {/* DOCENTE */}
          <Route
            path="/dashboard/docente"
            element={
              <PrivateRoute roles={["DOCENTE"]}>
                <DashboardDocente />
              </PrivateRoute>
            }
          />



          <Route
            path="/docente/missecciones"
            element={
              <PrivateRoute roles={["DOCENTE"]}>
                <MisSecciones />
              </PrivateRoute>
            }
          />



          <Route
            path="/docente/misecciones"
            element={
              <PrivateRoute roles={["DOCENTE"]}>
                <MisSecciones />
              </PrivateRoute>
            }
          />


          {/* DOCENTE → CALENDARIO DE UNA SECCIÓN */}
          <Route
            path="/docente/secciones/:seccionId/calendario"
            element={
              <PrivateRoute roles={["DOCENTE"]}>
                <CalendarioSeccion />
              </PrivateRoute>
            }
          />

          {/* DOCENTE → LISTA DE ALUMNOS DE UNA SECCIÓN */}
          <Route
            path="/docente/secciones/:seccionId/alumnos"
            element={
              <PrivateRoute roles={["DOCENTE"]}>
                <ListaAlumnos />
              </PrivateRoute>
            }
          />

          <Route
            path="/docente/secciones/:seccionId/notas"
            element={
              <PrivateRoute roles={["DOCENTE"]}>
                <RegistrarNotas />
              </PrivateRoute>
            }
          />


          <Route
            path="/docente/sesiones/:sesionId"
            element={
              <PrivateRoute roles={["DOCENTE"]}>
                <GestionSesiones />
              </PrivateRoute>
            }
          />





          {/* DOCENTE → ASISTENCIA */}
          <Route
            path="/docente/sesiones/:sesionId/asistencia"
            element={
              <PrivateRoute roles={["DOCENTE"]}>
                <RegistrarAsistencia />
              </PrivateRoute>
            }
          />
          



        {/* SECRETARIA MENU */}
        <Route
          path="/dashboard/secretaria"
          element={
            <PrivateRoute roles={["SECRETARIA"]}>
              <DashboardSecretaria />
            </PrivateRoute>
          }
        />

        {/* 🔥 SECRETARIA: SUBRUTAS (FALTABAN) */}
        <Route
          path="/dashboard/secretaria/matriculas"
          element={
            <PrivateRoute roles={["SECRETARIA"]}>
              <MatricularAlumno />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/secretaria/pagos"
          element={
            <PrivateRoute roles={["SECRETARIA"]}>
              <RegistrarPago />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/secretaria/cursos"
          element={
            <PrivateRoute roles={["SECRETARIA"]}>
              <GestionCursos />
            </PrivateRoute>
          }
        />


 



        {/* PAGO */}
        <Route path="/mp-redirect" element={<MpRedirect />} />
        <Route path="/pago-exitoso" element={<PagoExitoso />} />




        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
