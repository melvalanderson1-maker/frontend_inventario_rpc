// src/pages/docente/RegistrarAsistencia.jsx
import React, { useEffect, useState } from "react";
import docentesApi from "../../api/docentesApi";
import "./RegistrarAsistencia.css";
import { useSearchParams } from "react-router-dom";

import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";

const ESTADOS = ["PRESENTE", "TARDANZA", "AUSENTE", "JUSTIFICADO", "REMOTO"];

export default function RegistrarAsistencia() {

  // --- Obtener sesion desde la URL (?sesion=15)
  const [searchParams] = useSearchParams();
  const sesionIdFromQuery = searchParams.get("sesion");
  const [sesionId, setSesionId] = useState(sesionIdFromQuery || "");

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // --- Cargar alumnos cuando cambie la sesión
  useEffect(() => {
    if (sesionId) fetchAlumnos(sesionId);
  }, [sesionId]);

  // --- API: Cargar alumnos de la sesión
  const fetchAlumnos = async (id) => {
    setLoading(true);
    try {
      const res = await docentesApi.listarAlumnosSesion(id);

      setAlumnos(
        (res.data.alumnos || []).map((a) => ({
          ...a,
          estado: "PRESENTE", // estado inicial
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Error cargando alumnos");
    } finally {
      setLoading(false);
    }
  };

  // --- Cambiar estado de un alumno
  const cambiarEstado = (idx, nuevoEstado) => {
    const copy = [...alumnos];
    copy[idx].estado = nuevoEstado;
    setAlumnos(copy);
  };

  // --- Guardar asistencia
  const guardar = async () => {
    if (!sesionId) {
      alert("Debes ingresar un ID de sesión");
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        asistencias: alumnos.map((a) => ({
          usuario_id: a.id,
          estado: a.estado,
        })),
      };

      await docentesApi.registrarAsistencia(sesionId, payload);
      alert("Asistencias registradas correctamente");
    } catch (err) {
      console.error(err);
      alert("Error guardando asistencias");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <DashboardHeader />

      <div className="asistencia-container">
        <header>
          <h2>Registrar Asistencia</h2>
          <p className="muted">Selecciona el estado para cada estudiante.</p>
        </header>

        {/* Selección de sesión */}
        <div className="form-row">
          <label>ID de Sesión</label>
          <input
            value={sesionId}
            onChange={(e) => setSesionId(e.target.value)}
            placeholder="Ejemplo: 15"
          />
          <button className="btn" onClick={() => sesionId && fetchAlumnos(sesionId)}>
            Cargar alumnos
          </button>
        </div>

        {/* Lista de alumnos */}
        {loading ? (
          <p>Cargando alumnos...</p>
        ) : (
          <div className="alumnos-list">
            {alumnos.length === 0 ? (
              <div className="empty">No hay alumnos para esta sesión</div>
            ) : (
              alumnos.map((a, i) => (
                <div className="alumno-card" key={a.id}>
                  <div className="alumno-info">
                    <div className="alumno-name">
                      {a.nombre} {a.apellido_paterno} {a.apellido_materno}
                    </div>
                    <div className="alumno-doc">
                      {a.numero_documento} • {a.correo}
                    </div>
                  </div>

                  <div className="estado-selector">
                    {ESTADOS.map((e) => (
                      <button
                        key={e}
                        className={`estado-pill ${a.estado === e ? "active" : ""}`}
                        onClick={() => cambiarEstado(i, e)}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Botón guardar */}
        <div className="save-section">
          <button
            className="btn primary"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar asistencia"}
          </button>
        </div>
      </div>

      <DashboardFooter />
    </>
  );
}
