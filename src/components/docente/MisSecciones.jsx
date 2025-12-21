import React, { useEffect, useState, useContext, useRef } from "react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

import { AuthContext } from "../../context/AuthContext";
import docentesApi from "../../api/docentesApi";
import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";

import "./MisSecciones.css";

dayjs.extend(weekday);
dayjs.extend(isoWeek);

export default function MisSecciones() {
  const { usuario } = useContext(AuthContext);
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(false);

  const calendarRef = useRef(null);
  const cacheRef = useRef({ sesiones: {} });

  useEffect(() => {
    if (!usuario) return;
    cargarCursosYSecciones(usuario.id);
  }, [usuario]);

  const cargarCursosYSecciones = async (docenteId) => {
    setLoading(true);
    try {
      const res = await docentesApi.listarSeccionesDocente(docenteId);
      const cursosMap = {};
      res.data.secciones.forEach((s) => {
        if (!cursosMap[s.curso_id])
          cursosMap[s.curso_id] = { id: s.curso_id, titulo: s.curso_titulo, secciones: [] };
        cursosMap[s.curso_id].secciones.push(s);
      });
      setCursos(Object.values(cursosMap));
    } catch (err) {
      console.error(err);
      alert("Error cargando cursos y secciones.");
    } finally {
      setLoading(false);
    }
  };

  const cargarSesiones = async (seccionId) => {
    try {
      if (cacheRef.current.sesiones[seccionId]) {
        setSesiones(cacheRef.current.sesiones[seccionId]);
        return;
      }
      const res = await docentesApi.listarSesionesSeccion(seccionId);
      const eventos = res.data.sesiones.map((s) => ({
        id: s.sesion_id,
        title: s.title,
        start: s.start,
        end: s.end,
        color: "#4a90e2",
      }));
      setSesiones(eventos);
      cacheRef.current.sesiones[seccionId] = eventos;
    } catch (err) {
      console.error(err);
      setSesiones([]);
    }
  };

  const abrirCurso = (curso) => {
    setCursoSeleccionado(curso);
    setSeccionSeleccionada(null);
  };

  const abrirSeccion = (seccion) => {
    setSeccionSeleccionada(seccion);
    cargarSesiones(seccion.seccion_id);
  };

  const onEventClick = (info) => {
    const sesionId = info.event.id;
    alert(`Sesión seleccionada: ${info.event.title} (ID: ${sesionId})`);
  };

  return (
    <>
      <DashboardHeader />
      <div className="mis-secciones">
        <h2>Mis cursos y secciones</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : cursos.length === 0 ? (
          <p>No tienes secciones asignadas</p>
        ) : (
          <div className="cursos-grid">
            {cursos.map((c) => (
              <div key={c.id} className="curso-card">
                <div className="curso-header" onClick={() => abrirCurso(c)}>
                  <h3>{c.titulo}</h3>
                </div>
                {cursoSeleccionado?.id === c.id && (
                  <div className="secciones-list">
                    {c.secciones.map((s) => (
                      <div
                        key={s.seccion_id}
                        className="seccion-card"
                        onClick={() => abrirSeccion(s)}
                      >
                        <div>
                          <strong>{s.seccion_codigo}</strong> • {s.periodo} • {s.modalidad} • Alumnos: {s.alumnos_count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {seccionSeleccionada && (
          <>
            <h3>Calendario de la sección {seccionSeleccionada.seccion_codigo}</h3>
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              locale={esLocale}
              firstDay={1}
              allDaySlot={false}
              slotMinTime="06:00:00"
              slotMaxTime="23:00:00"
              events={sesiones}
              eventClick={onEventClick}
              height="auto"
            />
          </>
        )}
      </div>
      <DashboardFooter />
    </>
  );
}
