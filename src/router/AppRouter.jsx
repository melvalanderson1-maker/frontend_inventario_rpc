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
            <PrivateRoute roles={["DOCENTE","ADMIN"]}>
              <DashboardDocente />
            </PrivateRoute>
          }
        />

        {/* SECRETARIA MENU */}
        <Route
          path="/dashboard/secretaria"
          element={
            <PrivateRoute roles={["SECRETARIA","ADMIN"]}>
              <DashboardSecretaria />
            </PrivateRoute>
          }
        />

        {/* 🔥 SECRETARIA: SUBRUTAS (FALTABAN) */}
        <Route
          path="/dashboard/secretaria/matriculas"
          element={
            <PrivateRoute roles={["SECRETARIA","ADMIN"]}>
              <MatricularAlumno />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/secretaria/pagos"
          element={
            <PrivateRoute roles={["SECRETARIA","ADMIN"]}>
              <RegistrarPago />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/secretaria/cursos"
          element={
            <PrivateRoute roles={["SECRETARIA","ADMIN"]}>
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
