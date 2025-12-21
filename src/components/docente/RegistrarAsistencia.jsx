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

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [infoRes, alumnosRes] = await Promise.all([
          docentesApi.obtenerInfoSesion(sesionId),
          docentesApi.listarAlumnosSesion(sesionId),
        ]);

        setInfo(infoRes.data.info);
        setAlumnos(
          alumnosRes.data.alumnos.map(a => ({
            ...a,
            estado: a.estado || "PRESENTE",
          }))
        );
      } catch (err) {
        alert("Error cargando información");
      } finally {
        setLoading(false);
      }
    };

    cargarTodo();
  }, [sesionId]);

  const filtrados = alumnos.filter(a =>
    `${a.nombre} ${a.apellido_paterno} ${a.apellido_materno}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const contar = estado =>
    alumnos.filter(a => a.estado === estado).length;

  if (loading) return <p>Cargando...</p>;

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
          <small>
            {dayjs(info.inicia_en).format("DD/MM/YYYY HH:mm")} -
            {dayjs(info.termina_en).format("HH:mm")}
          </small>
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

        {/* LISTA */}
        <div className="alumnos-list">
          {filtrados.map((a, i) => (
            <div className="alumno-card" key={a.id}>
              <span>{a.apellido_paterno} {a.apellido_materno}, {a.nombre}</span>
              <div className="estado-selector">
                {ESTADOS.map(e => (
                  <button
                    key={e}
                    className={a.estado === e ? "active" : ""}
                    onClick={() => {
                      const copy = [...alumnos];
                      copy[i].estado = e;
                      setAlumnos(copy);
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DashboardFooter />
    </>
  );
}
