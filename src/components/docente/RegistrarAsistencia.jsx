import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import docentesApi from "../../api/docentesApi";

import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";
import "./RegistrarAsistencia.css";

const ESTADOS = ["PRESENTE", "TARDANZA", "AUSENTE", "JUSTIFICADO", "REMOTO"];

export default function RegistrarAsistencia() {
  const { sesionId } = useParams();

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sesionId) {
      setError("Sesión inválida");
      setLoading(false);
      return;
    }

    const fetchAlumnos = async () => {
      try {
        const res = await docentesApi.listarAlumnosSesion(sesionId);

        setAlumnos(
          (res.data.alumnos || []).map(a => ({
            ...a,
            estado: a.estado || "PRESENTE",
          }))
        );
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.msg ||
          "No se pudo cargar la lista de alumnos"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnos();
  }, [sesionId]);

  const cambiarEstado = (idx, estado) => {
    const copy = [...alumnos];
    copy[idx].estado = estado;
    setAlumnos(copy);
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await docentesApi.registrarAsistencia(sesionId, {
        asistencias: alumnos.map(a => ({
          usuario_id: a.id,
          estado: a.estado,
        })),
      });
      alert("✅ Asistencia registrada correctamente");
    } catch (err) {
      alert("❌ Error guardando asistencia");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <DashboardHeader />

      <div className="asistencia-container">
        <h2>Registrar Asistencia</h2>

        {loading && <p>Cargando alumnos...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && alumnos.length === 0 && (
          <p className="muted">No hay alumnos matriculados en esta sección</p>
        )}

        {!loading && !error && alumnos.length > 0 && (
          <>
            <div className="alumnos-list">
              {alumnos.map((a, i) => (
                <div className="alumno-card" key={a.id}>
                  <span className="alumno-nombre">
                    {a.apellido_paterno} {a.apellido_materno}, {a.nombre}
                  </span>

                  <div className="estado-selector">
                    {ESTADOS.map(e => (
                      <button
                        key={e}
                        className={a.estado === e ? "active" : ""}
                        onClick={() => cambiarEstado(i, e)}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn primary"
              onClick={guardar}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar asistencia"}
            </button>
          </>
        )}
      </div>

      <DashboardFooter />
    </>
  );
}
