import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import docentesApi from "../../api/docentesApi"; 
import "./CalendarioSeccion.css";

export default function CalendarioSeccion({ seccionId }) {
  const [sesiones, setSesiones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [showAlumnosModal, setShowAlumnosModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef(null);

  // Cargar sesiones + horarios
  const cargarSesiones = async () => {
    try {
      const res = await docentesApi.listarSesionesSeccion(seccionId);
      setSesiones(res.data.sesiones || []);
    } catch (err) {
      console.error("Error cargando sesiones", err);
      setSesiones([]);
    }
  };

  // Cargar alumnos de la sesión
  const cargarAlumnos = async (sesionId) => {
    try {
      setLoading(true);
      const res = await docentesApi.listarAlumnosSesion(sesionId); 
      setAlumnos(res.data.alumnos || []);
      setShowAlumnosModal(true);
    } catch (err) {
      console.error("Error cargando alumnos", err);
      setAlumnos([]);
      alert("No se pudo cargar la lista de alumnos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (seccionId) cargarSesiones();
  }, [seccionId]);

  const handleEventClick = (info) => {
    cargarAlumnos(info.event.extendedProps.sesion_id);
  };

  return (
    <div className="calendario-seccion">
      <FullCalendar
        ref={calendarRef}
        locale={esLocale}
        timeZone="local"
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        firstDay={1}
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
        events={sesiones.map(s => ({
          id: s.sesion_id,
          title: s.title,
          start: s.start,
          end: s.end,
          color: s.color,
          extendedProps: {
            aula: s.aula,
            tipo_sesion: s.tipo_sesion,
            lugar: s.lugar,
            enlace_meet: s.enlace_meet,
            sesion_id: s.sesion_id
          }
        }))}
        eventClick={handleEventClick}
        height="auto"
      />

      {/* Modal de alumnos */}
      {showAlumnosModal && (
        <div className="modal-alumnos">
          <div className="modal-content">
            <h3>Lista de Alumnos</h3>
            <button className="close-btn" onClick={() => setShowAlumnosModal(false)}>X</button>
            {loading ? (
              <p>Cargando alumnos...</p>
            ) : (
              <ul>
                {alumnos.map((a) => (
                  <li key={a.id}>{a.nombre} {a.apellido_paterno} ({a.numero_documento})</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
