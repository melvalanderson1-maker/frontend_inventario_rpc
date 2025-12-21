// src/pages/misSecciones/CalendarioSeccion.jsx
import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import adminApi from "../../api/adminApi";

export default function CalendarioSeccion({ seccionId }) {
  const [sesiones, setSesiones] = useState([]);
  const calendarRef = useRef(null);

  const cargarSesiones = async () => {
    try {
      const res = await adminApi.listarSesiones(seccionId);
      const eventos = (res.data.sesiones || []).map((s) => ({
        id: s.id,
        title: s.titulo,
        start: s.inicia_en,
        end: s.termina_en,
      }));
      setSesiones(eventos);
    } catch (err) {
      console.error("Error cargando sesiones", err);
      setSesiones([]);
    }
  };

  useEffect(() => {
    if (seccionId) cargarSesiones();
  }, [seccionId]);

  // Opcional: permitir click para editar sesión
  const handleEventClick = (info) => {
    const nuevoTitulo = prompt("Editar título de la sesión:", info.event.title);
    if (!nuevoTitulo) return;
    adminApi
      .actualizarSesion(info.event.id, { titulo: nuevoTitulo })
      .then(() => cargarSesiones())
      .catch((err) => {
        console.error("Error actualizando sesión", err);
        alert("No se pudo actualizar la sesión");
      });
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
      />
    </div>
  );
}
