import React, { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./CursosAdmin.css";

export default function CursosAdmin() {
  const [cursos, setCursos] = useState([]);
  const [secciones, setSecciones] = useState([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCursos();
    cargarSecciones();
  }, []);

  const cargarCursos = async () => {
    const res = await adminApi.listarCursos();
    setCursos(res.data.cursos);
    setLoading(false);
  };

  const cargarSecciones = async () => {
    const res = await adminApi.listarSecciones();
    setSecciones(res.data.secciones);
  };

  const abrirCurso = (curso) => {
    setCursoSeleccionado(curso);
    setSeccionSeleccionada(null);
  };

  const abrirSeccion = (seccion) => {
    setSeccionSeleccionada(seccion);
  };

  return (
    <div className="admin-wrapper">

      {/* PANEL DE CURSOS */}
      <div className="panel-cursos">
        <h2>Cursos</h2>

        {loading && <p>Cargando...</p>}

        <div className="curso-grid">
          {cursos.map((c) => (
            <div
              key={c.id}
              className="curso-card"
              onClick={() => abrirCurso(c)}
            >
              <h3>{c.titulo}</h3>
              <p className="precio">S/ {c.precio}</p>
              <p className="desc">{c.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className={`panel-detalle ${cursoSeleccionado ? "open" : ""}`}>

        {!cursoSeleccionado && (
          <div className="placeholder">
            <p>Selecciona un curso</p>
          </div>
        )}

        {cursoSeleccionado && (
          <>
            <h2>{cursoSeleccionado.titulo}</h2>

            <h3>Secciones</h3>
            <div className="seccion-list">
              {secciones
                .filter((s) => s.curso_id === cursoSeleccionado.id)
                .map((s) => (
                  <div
                    key={s.id}
                    className={`seccion-item ${
                      seccionSeleccionada?.id === s.id ? "active" : ""
                    }`}
                    onClick={() => abrirSeccion(s)}
                  >
                    <strong>Sección {s.id}</strong>
                    <p>Modalidad: {s.modalidad}</p>
                    <p>Inicio: {s.fecha_inicio}</p>
                  </div>
                ))}
            </div>

            {/* CALENDARIO */}
            {seccionSeleccionada && (
              <>
                <h3>Calendario de Sesiones</h3>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  editable={true}
                  selectable={true}
                  events={sesiones}
                  
                  dateClick={(info) => {
                    const titulo = prompt("Título de la sesión:");
                    if (!titulo) return;

                    adminApi.crearSesion({
                      seccion_id: seccionSeleccionada.id,
                      titulo,
                      inicia_en: info.date,
                      termina_en: info.date,
                      tipo_sesion: "PRESENCIAL",
                    }).then(() => cargarSesiones());
                  }}

                  eventDrop={(info) => {
                    adminApi.actualizarSesion(info.event.id, {
                      inicia_en: info.event.start,
                      termina_en: info.event.end
                    }).then(() => cargarSesiones());
                  }}

                  eventClick={(info) => {
                    if (confirm("¿Eliminar sesión?")) {
                      adminApi.eliminarSesion(info.event.id).then(() => cargarSesiones());
                    }
                  }}
                />

              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
