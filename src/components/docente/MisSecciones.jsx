import React, { useEffect, useState, useRef } from "react";
import docentesApi from "../../api/docentesApi";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

import dayjs from "dayjs";
import "./MisSecciones.css";

export default function MisSecciones({ usuario }) {
  const [secciones, setSecciones] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const calendarRef = useRef(null);

  // ─────────────────────────────────────────────
  // Cargar secciones del docente
  // ─────────────────────────────────────────────
  useEffect(() => {
    docentesApi
      .listarSeccionesDocente()
      .then(res => setSecciones(res.data.secciones || []))
      .catch(err => console.error(err));
  }, []);


  // ─────────────────────────────────────────────
  // Cargar sesiones de sección
  // ─────────────────────────────────────────────
  const cargarSesiones = async (seccionId) => {
    try {
      const res = await docentesApi.listarSesionesSeccion(seccionId);

      const eventos = (res.data.sesiones || []).map(s => ({
        id: s.id,
        title: s.titulo,
        start: s.inicia_en,
        end: s.termina_en,
      }));

      setSesiones(eventos);
    } catch (err) {
      console.error(err);
      setSesiones([]);
    }
  };

  useEffect(() => {
  if (!seccionSeleccionada) return;
  cargarSesiones(seccionSeleccionada.seccion_id);
  }, [seccionSeleccionada]);


  const abrirSeccion = (s) => {
    setSeccionSeleccionada(s);
  };


  return (
    <div className="docente-wrapper">
      <aside className="docente-panel">
        <h2>Mis Secciones</h2>

        {secciones.map(s => (
          <div
            key={s.seccion_id}
            className={`seccion-card ${
              seccionSeleccionada?.seccion_id === s.seccion_id ? "active" : ""
            }`}
            onClick={() => abrirSeccion(s)}
          >
            <h4>{s.curso_titulo}</h4>
            <p>Sección {s.seccion_codigo}</p>
            <p>
              {dayjs(s.fecha_inicio).format("DD/MM/YYYY")} →
              {dayjs(s.fecha_fin).format("DD/MM/YYYY")}
            </p>
          </div>
        ))}
      </aside>

      <main className="docente-calendario">
        {!seccionSeleccionada && (
          <p className="placeholder">
            Selecciona una sección para ver el calendario
          </p>
        )}

        {seccionSeleccionada && (
          <>
            <h3>
              {seccionSeleccionada.curso_titulo} — Sección{" "}
              {seccionSeleccionada.seccion_codigo}
            </h3>

            <FullCalendar
              ref={calendarRef}
              locale={esLocale}
              timeZone="local"
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              firstDay={1}
              allDaySlot={false}
              slotMinTime="06:00:00"
              slotMaxTime="23:00:00"
              events={sesiones}
            />
          </>
        )}
      </main>
    </div>
  );
}
