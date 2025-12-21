import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "./GestionSesiones.css";


export default function GestionSesiones() {
  const { sesionId } = useParams();
  const [searchParams] = useSearchParams();
  const seccionId = searchParams.get("seccion");
  const navigate = useNavigate();

    // ✅ AQUÍ VA EXACTAMENTE
  if (!sesionId || !seccionId) {
    return <p>Error: sesión o sección no válida</p>;
  }


  return (
    <div className="gestion-sesion">
      <h2>Gestión de sesión</h2>

      <p><strong>Sesión ID:</strong> {sesionId}</p>
      <p><strong>Sección ID:</strong> {seccionId}</p>

      <div className="acciones">
        <button
          onClick={() =>
            navigate(`/docente/sesiones/${sesionId}/asistencia`)
          }
        >
          📝 Tomar asistencia
        </button>

        <button
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
