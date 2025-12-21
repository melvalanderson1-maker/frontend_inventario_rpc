import React, { useState, useEffect } from "react";
import docentesApi from "../../api/docentesApi";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarioSeccion({ seccionId }) {
  const [sesiones, setSesiones] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!showCalendar) return;
    fetchSesiones();
  }, [showCalendar]);

  const fetchSesiones = async () => {
    try {
      const res = await docentesApi.listarSesionesDocente(seccionId);
      setSesiones(res.data.sesiones || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventClick = (info) => {
    const sesionId = info.event.id;
    window.location.href = `/docente/asistencia?sesion=${sesionId}`;
  };

  return (
    <div>
      <button className="btn outline" onClick={() => setShowCalendar(!showCalendar)}>
        {showCalendar ? "Ocultar Horario" : "Ver Horario"}
      </button>
      {showCalendar && (
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={sesiones.map(s => ({
            id: s.id,
            title: s.titulo,
            start: s.inicia_en,
            end: s.termina_en,
          }))}
          eventClick={handleEventClick}
          height="auto"
        />
      )}
    </div>
  );
}
