// src/pages/DashboardDocente.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./DashboardDocente.css";

import DashboardHeader from "../components/layout/DashboardHeader";
import DashboardFooter from "../components/layout/DashboardFooter";

// Importa tu API (ajusta según tu estructura real)
import docentesApi from "../api/docentesApi"; // Debe tener funciones como listarSesionesDocente y listarSeccionesDocente

export default function DashboardDocente() {
  const [sesiones, setSesiones] = useState([]);
  const [secciones, setSecciones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Aquí obtienes el ID del docente; puede venir de un token, localStorage o contexto
        const docenteId = localStorage.getItem("docenteId"); // ejemplo
        if (!docenteId) return;

        // Traer sesiones del docente
        const resSesiones = await docentesApi.listarSesionesDocente(docenteId);
        if (resSesiones.data.ok) setSesiones(resSesiones.data.sesiones);

        // Traer secciones del docente
        const resSecciones = await docentesApi.listarSeccionesDocente(docenteId);
        if (resSecciones.data.ok) setSecciones(resSecciones.data.secciones);
      } catch (err) {
        console.error("Error al cargar sesiones/secciones:", err);
      }
    };

    fetchData();
  }, []);

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
          {/* Gestión general de sesiones */}
          <Link to="/docente/gestionsesiones" className="docente-card">
            <div className="icon-container sessions">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h3>Gestión de Sesiones</h3>
            <p>Administra tus sesiones programadas, clases y actividades.</p>
          </Link>

          {/* Mis secciones */}
          <Link to="/docente/missecciones" className="docente-card">
            <div className="icon-container sections">
              <i className="fas fa-layer-group"></i>
            </div>
            <h3>Mis Secciones</h3>
            <p>Revisa tus cursos asignados, alumnos y detalles académicos.</p>
          </Link>

          {/* Registrar Asistencia - dinámico */}
          {sesiones.length > 0 ? (
            sesiones.map((s) => (
              <Link
                key={s.id}
                to={`/docente/sesiones/${s.id}/asistencia`}
                className="docente-card"
              >
                <div className="icon-container asistencia">
                  <i className="fas fa-user-check"></i>
                </div>
                <h3>Registrar Asistencia</h3>
                <p>
                  {s.curso_titulo} • {s.seccion_codigo} • {new Date(s.inicia_en).toLocaleString()}
                </p>
              </Link>
            ))
          ) : (
            <div className="docente-card">
              <div className="icon-container asistencia">
                <i className="fas fa-user-check"></i>
              </div>
              <h3>Registrar Asistencia</h3>
              <p>No hay sesiones programadas.</p>
            </div>
          )}

          {/* Registrar Notas - dinámico */}
          {sesiones.length > 0 ? (
            sesiones.map((s) => (
              <Link
                key={s.id}
                to={`/docente/sesiones/${s.id}/notas`}
                className="docente-card"
              >
                <div className="icon-container notas">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <h3>Registrar Notas</h3>
                <p>
                  {s.curso_titulo} • {s.seccion_codigo} • {new Date(s.inicia_en).toLocaleString()}
                </p>
              </Link>
            ))
          ) : (
            <div className="docente-card">
              <div className="icon-container notas">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <h3>Registrar Notas</h3>
              <p>No hay sesiones programadas.</p>
            </div>
          )}
        </div>
      </div>

      <DashboardFooter />
    </>
  );
}
