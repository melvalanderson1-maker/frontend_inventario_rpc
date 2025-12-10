// src/pages/docente/RegistrarNotas.jsx
import React, { useEffect, useState } from "react";
import docentesApi from "../../api/docentesApi";
import "./RegistrarNotas.css";
import { useSearchParams } from "react-router-dom";

import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";

export default function RegistrarNotas() {
  const [searchParams] = useSearchParams();
  const seccionQuery = searchParams.get("seccion");
  const [seccionId, setSeccionId] = useState(seccionQuery || "");
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (seccionId) fetchAlumnos(seccionId);
  }, [seccionId]);

  const fetchAlumnos = async (id) => {
    setLoading(true);
    try {
      const res = await docentesApi.listarAlumnosSeccion(id);
      setAlumnos((res.data.alumnos || []).map((a) => ({ ...a, nota: "" })));
    } catch (err) {
      console.error(err);
      alert("Error cargando alumnos");
    } finally {
      setLoading(false);
    }
  };

  const updateNota = (idx, value) => {
    const copy = [...alumnos];
    copy[idx].nota = value;
    setAlumnos(copy);
  };

  const guardarNotas = async () => {
    setSaving(true);
    try {
      const payload = {
        notas: alumnos.map((a) => ({
          usuario_id: a.id,
          nota: parseFloat(a.nota || 0),
        })),
      };
      await docentesApi.registrarNotas(seccionId, payload);
      alert("Notas guardadas");
    } catch (err) {
      console.error(err);
      alert("Error guardando notas");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DashboardHeader />

      <div className="registrar-notas">
        <header>
          <h2>Registrar Notas</h2>
          <p className="muted">Ingresa las notas y guarda.</p>
        </header>

        <div className="form-row">
          <label>Sección ID</label>
          <input
            value={seccionId}
            onChange={(e) => setSeccionId(e.target.value)}
            placeholder="Sección ID"
          />
          <button className="btn" onClick={() => seccionId && fetchAlumnos(seccionId)}>
            Cargar
          </button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="notas-list">
            {alumnos.length === 0 ? (
              <div className="empty">No hay alumnos</div>
            ) : (
              alumnos.map((a, i) => (
                <div key={a.id} className="nota-row">
                  <div className="alumno-info">
                    <div className="alumno-name">
                      {a.nombre} {a.apellido_paterno}
                    </div>
                    <div className="alumno-doc">{a.numero_documento}</div>
                  </div>
                  <div className="alumno-input">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={a.nota}
                      onChange={(e) => updateNota(i, e.target.value)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="save-row">
          <button
            className="btn primary"
            onClick={guardarNotas}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar notas"}
          </button>
        </div>
      </div>

      <DashboardFooter />
    </>
  );
}
