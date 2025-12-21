// src/pages/misSecciones/CalendarioSeccion.jsx
import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import adminApi from "../../api/adminApi";
import "./CalendarioSeccion.css";

export default function CalendarioSeccion({ seccionId }) {
  const [sesiones, setSesiones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [showAlumnosModal, setShowAlumnosModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef(null);

const cargarSesiones = async () => {
  try {
    const res = await adminApi.listarSesionesSeccion(seccionId);
    const eventos = (res.data.sesiones || []).map((s) => {
      if (!s.dia_semana || !s.hora_inicio || !s.hora_fin) return null;

      // FullCalendar espera fecha completa
      // Calculamos la fecha de inicio de esta semana para el día de la semana
      const today = new Date();
      const dayOfWeek = parseInt(s.dia_semana); // 1=Lunes, 7=Domingo
      const diff = dayOfWeek - (today.getDay() === 0 ? 7 : today.getDay()); // domingo=0
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + diff);
      const [hStart, mStart] = s.hora_inicio.split(":").map(Number);
      startDate.setHours(hStart, mStart, 0);

      const endDate = new Date(today);
      endDate.setDate(today.getDate() + diff);
      const [hEnd, mEnd] = s.hora_fin.split(":").map(Number);
      endDate.setHours(hEnd, mEnd, 0);

      return {
        id: s.sesion_id,
        title: s.titulo,
        start: startDate,
        end: endDate,
        color: "#4a90e2",
      };
    }).filter(Boolean);

    setSesiones(eventos);
  } catch (err) {
    console.error("Error cargando sesiones", err);
    setSesiones([]);
  }
};


 const cargarAlumnos = async (sesionId) => {
  try {
    setLoading(true);
    const res = await adminApi.listarAlumnosSesion(sesionId); 
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
    // Al dar click en la sesión, cargamos alumnos
    cargarAlumnos(info.event.id);
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
        events={sesiones}
        eventClick={handleEventClick}
        height="auto"
      />

      {/* Modal simple de alumnos */}
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
