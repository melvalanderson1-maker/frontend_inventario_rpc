// src/pages/docente/RegistrarAsistencia.jsx
import React, { useEffect, useState } from "react";
import docentesApi from "../../api/docentesApi";
import "./RegistrarAsistencia.css";
import { useSearchParams } from "react-router-dom";

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
      setAlumnos((res.data.alumnos || []).map(a => ({ ...a, presente: true })));
    } catch (err) {
      console.error(err);
      alert("Error cargando alumnos");
    } finally {
      setLoading(false);
    }
  };

  const togglePresente = (idx) => {
    const copy = [...alumnos];
    copy[idx].presente = !copy[idx].presente;
    setAlumnos(copy);
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const payload = { asistencias: alumnos.map(a => ({ usuario_id: a.id, presente: a.presente ? 1 : 0 })) };
      await docentesApi.registrarAsistencia(seccionId, payload);
      alert("Asistencias registradas");
    } catch (err) {
      console.error(err);
      alert("Error guardando asistencias");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="registrar-asistencia">
      <header>
        <h2>Registrar Asistencia</h2>
        <p className="muted">Selecciona los estudiantes presentes y guarda.</p>
      </header>

      <div className="form-row">
        <label>Sección ID</label>
        <input value={seccionId} onChange={(e) => setSeccionId(e.target.value)} placeholder="Ingresa la sección o usa desde Mis Secciones" />
        <button className="btn" onClick={() => seccionId && fetchAlumnos(seccionId)}>Cargar alumnos</button>
      </div>

      {loading ? <p>Cargando alumnos...</p> :
        <div className="alumnos-table">
          {alumnos.length === 0 ? <div className="empty">No hay alumnos</div> :
            alumnos.map((a, i) => (
              <div className="alumno-row" key={a.id}>
                <div className="alumno-data">
                  <div className="alumno-name">{a.nombre} {a.apellido_paterno} {a.apellido_materno}</div>
                  <div className="alumno-doc">{a.numero_documento} • {a.correo}</div>
                </div>
                <div className="alumno-action">
                  <label className="toggle">
                    <input type="checkbox" checked={a.presente} onChange={() => togglePresente(i)} />
                    <span>{a.presente ? "Presente" : "Ausente"}</span>
                  </label>
                </div>
              </div>
            ))
          }
        </div>
      }

      <div className="save-row">
        <button className="btn primary" onClick={guardar} disabled={guardando}>{guardando ? "Guardando..." : "Guardar asistencia"}</button>
      </div>
    </div>
  );
}
