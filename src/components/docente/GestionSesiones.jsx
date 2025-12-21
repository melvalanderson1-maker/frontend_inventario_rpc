import { useParams, useNavigate } from "react-router-dom";

export default function GestionSesiones() {
  const { sesionId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h2>Gestión de sesión</h2>

      <button onClick={() => navigate(`/docente/sesiones/${sesionId}/asistencia`)}>
        Tomar asistencia
      </button>

      <button onClick={() => navigate(`/docente/sesiones/${sesionId}/notas`)}>
        Registrar notas
      </button>
    </div>
  );
}
