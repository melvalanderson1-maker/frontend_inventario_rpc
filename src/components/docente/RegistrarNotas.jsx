import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import docentesApi from "../../api/docentesApi";

import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";
import "./RegistrarNotas.css";

export default function RegistrarNotas() {
  const { seccionId } = useParams();

  const [infoSeccion, setInfoSeccion] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!seccionId) return;

    const cargarTodo = async () => {
      try {
        const [seccionesRes, alumnosRes] = await Promise.all([
          docentesApi.listarSeccionesDocente(),
          docentesApi.listarAlumnosSeccion(seccionId),
        ]);

        // 🔍 Buscar la sección correcta
        const seccion = (seccionesRes.data.secciones || []).find(
          (s) => String(s.seccion_id) === String(seccionId)
        );

        if (!seccion) {
          alert("Sección no encontrada");
          return;
        }

        setInfoSeccion(seccion);

        setAlumnos(
          (alumnosRes.data.alumnos || []).map((a) => ({
            ...a,
            nota: a.nota_final ?? "",
          }))
        );
      } catch (err) {
        console.error(err);
        alert("Error cargando información");
      } finally {
        setLoading(false);
      }
    };

    cargarTodo();
  }, [seccionId]);

  const updateNota = (idx, value) => {
    const copy = [...alumnos];
    copy[idx].nota = value;
    setAlumnos(copy);
  };

  const guardarNotas = async () => {
    setSaving(true);
    try {
      await docentesApi.registrarNotas(seccionId, {
        notas: alumnos.map((a) => ({
          usuario_id: a.id,
          nota: parseFloat(a.nota || 0),
        })),
      });

      alert("✅ Notas guardadas correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error guardando notas");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <DashboardHeader />
        <p className="loading">Cargando información...</p>
        <DashboardFooter />
      </>
    );
  }

  if (!infoSeccion) return null;

  return (
    <>
      <DashboardHeader />

      <div className="registrar-notas">
        {/* INFO SECCIÓN */}
        <header className="header-seccion">
          <h2>{infoSeccion.curso_titulo}</h2>
          <p className="muted">
            Sección <strong>{infoSeccion.seccion_codigo}</strong>
          </p>
          <small>
            {dayjs(infoSeccion.fecha_inicio).format("DD/MM/YYYY")} →{" "}
            {dayjs(infoSeccion.fecha_fin).format("DD/MM/YYYY")}
          </small>
        </header>

        {/* LISTA DE ALUMNOS */}
        <div className="notas-list">
          {alumnos.map((a, i) => (
            <div key={a.id} className="nota-row">
              <span>
                {a.apellido_paterno} {a.apellido_materno}, {a.nombre}
              </span>
              <input
                type="number"
                min="0"
                max="20"
                step="0.01"
                value={a.nota}
                className={
                  a.nota === ""
                    ? ""
                    : Number(a.nota) < 11
                    ? "nota-desaprobada"
                    : "nota-aprobada"
                }
                onChange={(e) => updateNota(i, e.target.value)}
              />

            </div>
          ))}
        </div>

        <button
          className="btn primary"
          onClick={guardarNotas}
          disabled={saving}
        >
          {saving ? "Guardando..." : "💾 Guardar notas"}
        </button>
      </div>

      <DashboardFooter />
    </>
  );
}
