import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import docentesApi from "../../api/docentesApi";
import dayjs from "dayjs";
import "./GestionSesiones.css";

export default function GestionSesiones() {
  const { sesionId } = useParams();
  const [searchParams] = useSearchParams();
  const seccionId = searchParams.get("seccion");
  const navigate = useNavigate();

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛡️ Validación temprana
  if (!sesionId || !seccionId) {
    return <p className="error">Error: sesión o sección no válida</p>;
  }

  useEffect(() => {
    const cargarInfo = async () => {
      try {
        const res = await docentesApi.obtenerInfoSesion(sesionId);
        setInfo(res.data.info);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    cargarInfo();
  }, [sesionId]);

  if (loading) {
    return <p className="loading">Cargando información...</p>;
  }

  return (
    <div className="gestion-sesion">
      {/* HEADER */}
      <div className="sesion-header">
        <h2>{info.curso_titulo}</h2>
        <p className="subtitulo">
          Sección <strong>{info.seccion_codigo}</strong>
        </p>
        <h3>{info.sesion_titulo}</h3>
        <p className="fecha">
          {dayjs(info.inicia_en).format("DD/MM/YYYY HH:mm")} –{" "}
          {dayjs(info.termina_en).format("HH:mm")}
        </p>
      </div>

      {/* INFO CARDS */}
      <div className="info-cards">
        <div className="card">
          👥
          <span>{info.total_alumnos}</span>
          <small>Alumnos matriculados</small>
        </div>

        <div className="card">
          📚
          <span>{info.seccion_codigo}</span>
          <small>Sección</small>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="acciones">
        <button
          className="btn primary"
          onClick={() =>
            navigate(`/docente/sesiones/${sesionId}/asistencia`)
          }
        >
          📝 Tomar asistencia
        </button>

        <button
          className="btn secondary"
          onClick={() =>
            navigate(`/docente/secciones/${seccionId}/notas`)
          }
        >
          📊 Registrar notas
        </button>
      </div>
    </div>
  );
}
