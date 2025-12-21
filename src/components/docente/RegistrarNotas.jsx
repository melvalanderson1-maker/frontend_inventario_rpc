import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import docentesApi from "../../api/docentesApi";

import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";
import "./RegistrarNotas.css";

export default function RegistrarNotas() {
  // ✅ SECCIÓN DESDE LA URL
  const { seccionId } = useParams();

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!seccionId) return;

    const fetchAlumnos = async () => {
      setLoading(true);
      try {
        const res = await docentesApi.listarAlumnosSeccion(seccionId);
        setAlumnos(
          (res.data.alumnos || []).map((a) => ({
            ...a,
            nota: a.nota_final ?? "",
          }))
        );
      } catch (err) {
        console.error(err);
        alert("Error cargando alumnos");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnos();
  }, [seccionId]);

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
      alert("Notas guardadas correctamente");
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
          <p className="muted">
            Registro de notas finales de la <strong>sección</strong>.
          </p>
        </header>

        <div className="form-row">
          <label>ID de Sección</label>
          <input value={seccionId} disabled />
        </div>

        {loading ? (
          <p>Cargando alumnos...</p>
        ) : (
          <div className="notas-list">
            {alumnos.map((a, i) => (
              <div key={a.id} className="nota-row">
                <span>
                  {a.nombre} {a.apellido_paterno}
                </span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.01"
                  value={a.nota}
                  onChange={(e) => updateNota(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        <button
          className="btn primary"
          onClick={guardarNotas}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar notas"}
        </button>
      </div>

      <DashboardFooter />
    </>
  );
}
