// src/pages/DashboardDocente.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./DashboardDocente.css";

import DashboardHeader from "../components/layout/DashboardHeader";
import DashboardFooter from "../components/layout/DashboardFooter";

export default function DashboardDocente() {
  return (
    <>
      <DashboardHeader />

      <div className="docente-container">
        <header className="docente-header">
          <h1>Panel del Docente</h1>
          <p className="subtitle">
            Bienvenido, aquí puedes gestionar tus clases y actividades.
          </p>
        </header>

        <div className="docente-grid">
          <Link to="/docente/sesiones" className="docente-card">
            <div className="icon-container sessions">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h3>Gestión de Sesiones</h3>
            <p>Administra tus sesiones programadas, clases y actividades.</p>
          </Link>

          <Link to="/docente/secciones" className="docente-card">
            <div className="icon-container sections">
              <i className="fas fa-layer-group"></i>
            </div>
            <h3>Mis Secciones</h3>
            <p>Revisa tus cursos asignados, alumnos y detalles académicos.</p>
          </Link>

          <Link to="/docente/asistencia" className="docente-card">
            <div className="icon-container asistencia">
              <i className="fas fa-user-check"></i>
            </div>
            <h3>Registrar Asistencia</h3>
            <p>Pasa la lista de asistencia a tus estudiantes.</p>
          </Link>

          <Link to="/docente/notas" className="docente-card">
            <div className="icon-container notas">
              <i className="fas fa-clipboard-check"></i>
            </div>
            <h3>Registrar Notas</h3>
            <p>Califica actividades y evaluaciones de tus alumnos.</p>
          </Link>
        </div>
      </div>

      <DashboardFooter />
    </>
  );
}
