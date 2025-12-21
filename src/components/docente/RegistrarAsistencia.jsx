import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import docentesApi from "../../api/docentesApi";
import dayjs from "dayjs";

import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";
import "./RegistrarAsistencia.css";

const ESTADOS = ["PRESENTE", "TARDANZA", "AUSENTE", "JUSTIFICADO", "REMOTO"];

export default function RegistrarAsistencia() {
  const { sesionId } = useParams();

  const [info, setInfo] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // ─────────────────────────────────────────────
  // CARGAR INFO + ALUMNOS
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!sesionId) return;

    const cargarTodo = async () => {
      try {
        const [infoRes, alumnosRes] = await Promise.all([
          docentesApi.obtenerInfoSesion(sesionId),
          docentesApi.listarAlumnosSesion(sesionId),
        ]);

        setInfo(infoRes.data.info);
        setAlumnos(
          (alumnosRes.data.alumnos || []).map(a => ({
            ...a,
            estado: a.estado || "PRESENTE",
          }))
        );
      } catch (err) {
        console.error(err);
        alert("❌ Error cargando información de la sesión");
      } finally {
        setLoading(false);
      }
    };

    cargarTodo();
  }, [sesionId]);

  // ─────────────────────────────────────────────
  // FILTRO BUSCADOR
  // ─────────────────────────────────────────────
  const filtrados = alumnos.filter(a =>
    `${a.nombre} ${a.apellido_paterno} ${a.apellido_materno}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // ─────────────────────────────────────────────
  // CONTADORES
  // ─────────────────────────────────────────────
  const contar = estado =>
    alumnos.filter(a => a.estado === estado).length;

  // ─────────────────────────────────────────────
  // CAMBIAR ESTADO
  // ─────────────────────────────────────────────
  const cambiarEstado = (index, estado) => {
    const copy = [...alumnos];
    copy[index].estado = estado;
    setAlumnos(copy);
  };

  // ─────────────────────────────────────────────
  // GUARDAR ASISTENCIA
  // ─────────────────────────────────────────────
  const guardar = async () => {
    try {
      setGuardando(true);

      await docentesApi.registrarAsistencia(sesionId, {
        asistencias: alumnos.map(a => ({
          usuario_id: a.id,
          estado: a.estado,
        })),
      });

      alert("✅ Asistencia registrada correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error al registrar asistencia");
    } finally {
      setGuardando(false);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <DashboardHeader />
        <p className="loading">Cargando...</p>
        <DashboardFooter />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />

      <div className="asistencia-container">
        {/* HEADER */}
        <div className="info-header">
          <h2>{info.curso_titulo}</h2>
          <p>
            Sección <strong>{info.seccion_codigo}</strong> —{" "}
            {info.sesion_titulo}
          </p>
            {/*<small>
            {dayjs(info.inicia_en, "YYYY-MM-DDTHH:mm:ss").format("DD/MM/YYYY HH:mm")} –{" "}
            {dayjs(info.termina_en, "YYYY-MM-DDTHH:mm:ss").format("HH:mm")}
            </small>*/}

        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">👥 {info.total_alumnos} Matriculados</div>
          <div className="stat-card">✅ {contar("PRESENTE")} Presentes</div>
          <div className="stat-card">❌ {contar("AUSENTE")} Ausentes</div>
        </div>

        {/* BUSCADOR */}
        <input
          className="buscador"
          placeholder="Buscar por nombre o DNI..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        {/* LISTA DE ALUMNOS */}
        <div className="alumnos-list">
          {filtrados.map((a, i) => (
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

        {/* BOTÓN GUARDAR */}
        <div className="acciones-footer">
          <button
            className="btn-guardar"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "💾 Registrar asistencia"}
          </button>
        </div>
      </div>

      <DashboardFooter />
    </>
  );
}
