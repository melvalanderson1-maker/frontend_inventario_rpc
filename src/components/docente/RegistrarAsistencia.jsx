// src/pages/docente/RegistrarAsistencia.jsx
import React, { useEffect, useState } from "react";
import docentesApi from "../../api/docentesApi";
import "./RegistrarAsistencia.css";
import { useSearchParams } from "react-router-dom";

import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";

const ESTADOS = ["PRESENTE", "TARDANZA", "AUSENTE", "JUSTIFICADO", "REMOTO"];

export default function RegistrarAsistencia() {
  const [searchParams] = useSearchParams();
  const seccionIdFromQuery = searchParams.get("seccion");
  const [seccionId, setSeccionId] = useState(seccionIdFromQuery || "");
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (seccionId) fetchAlumnos(seccionId);
  }, [seccionId]);

  const fetchAlumnos = async (id) => {
    setLoading(true);
    try {
      const res = await docentesApi.listarAlumnosSeccion(id);

      // estado inicial: PRESENTE
      setAlumnos(
        (res.data.alumnos || []).map((a) => ({
          ...a,
          estado: "PRESENTE",
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Error cargando alumnos");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = (idx, nuevoEstado) => {
    const copy = [...alumnos];
    copy[idx].estado = nuevoEstado;
    setAlumnos(copy);
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const payload = {
        asistencias: alumnos.map((a) => ({
          usuario_id: a.id,
          estado: a.estado,
        })),
      };

      await docentesApi.registrarAsistencia(seccionId, payload);
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
          <p className="muted">Selecciona el estado de cada estudiante.</p>
        </header>

        <div className="form-row">
          <label>Sección ID</label>
          <input
            value={seccionId}
            onChange={(e) => setSeccionId(e.target.value)}
            placeholder="Ingresa la sección o usa Mis Secciones"
          />
          <button className="btn" onClick={() => seccionId && fetchAlumnos(seccionId)}>
            Cargar alumnos
          </button>
        </div>

        {loading ? (
          <p>Cargando alumnos...</p>
        ) : (
          <div className="alumnos-list">
            {alumnos.length === 0 ? (
              <div className="empty">No hay alumnos</div>
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
                        className={
                          "estado-pill " + (a.estado === e ? "active" : "")
                        }
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

        <div className="save-section">
          <button className="btn primary" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar asistencia"}
          </button>
        </div>
      </div>

      <DashboardFooter />
    </>
  );
}
