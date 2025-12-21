import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import docentesApi from "../../api/docentesApi";

import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";
import "./RegistrarAsistencia.css";

const ESTADOS = ["PRESENTE", "TARDANZA", "AUSENTE", "JUSTIFICADO", "REMOTO"];

export default function RegistrarAsistencia() {
  // ✅ SESIÓN VIENE POR LA URL
  const { sesionId } = useParams();

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // 🔹 Cargar alumnos de la sesión
  useEffect(() => {
    if (!sesionId) return;

    const fetchAlumnos = async () => {
      setLoading(true);
      try {
        const res = await docentesApi.listarAlumnosSesion(sesionId);

        setAlumnos(
          (res.data.alumnos || []).map((a) => ({
            ...a,
            estado: "PRESENTE",
          }))
        );
      } catch (err) {
        console.error(err);
        alert("Error cargando alumnos de la sesión");
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
      const payload = {
        asistencias: alumnos.map((a) => ({
          usuario_id: a.id,
          estado: a.estado,
        })),
      };

      await docentesApi.registrarAsistencia(sesionId, payload);
      alert("Asistencia registrada correctamente");
    } catch (err) {
      console.error(err);
      alert("Error guardando asistencia");
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
          <p className="muted">
            Registro de asistencia de los estudiantes matriculados
            para esta <strong>sesión</strong>.
          </p>
        </header>

        {/* ID SOLO INFORMATIVO */}
        <div className="form-row">
          <label>ID de Sesión</label>
          <input value={sesionId} disabled />
        </div>

        {loading ? (
          <p>Cargando alumnos...</p>
        ) : (
          <div className="alumnos-list">
            {alumnos.map((a, i) => (
              <div className="alumno-card" key={a.id}>
                <div className="alumno-info">
                  {a.nombre} {a.apellido_paterno} {a.apellido_materno}
                </div>

                <div className="estado-selector">
                  {ESTADOS.map((e) => (
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
        )}

        <button
          className="btn primary"
          onClick={guardar}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar asistencia"}
        </button>
      </div>

      <DashboardFooter />
    </>
  );
}
