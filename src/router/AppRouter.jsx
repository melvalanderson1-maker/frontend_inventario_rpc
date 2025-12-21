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




import { AuthContext } from "../context/AuthContext";



const PrivateRoute = ({ children, roles }) => {
  const { usuario, loading } = useContext(AuthContext);

  if (loading) return <div>Cargando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />;

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

        <Route path="/mp-redirect" element={<MpRedirect />} />


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


        <Route
          path="/dashboard/admin"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/admin/usuarios"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <UsuariosAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/admin/docentes"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <DocentesAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/admin/secretarias"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <SecretariasAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/admin/alumnos"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <AlumnosAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/admin/cursos"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <CursosAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/admin/secciones"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <SeccionesAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/admin/pagos"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <PagosAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/admin/facturas"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <FacturasAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/admin/auditoria"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <AuditoriaAdmin />
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
