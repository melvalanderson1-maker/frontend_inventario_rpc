// 📌 src/pages/CursosAdmin.jsx (COMPLETO Y LISTO PARA USAR)
import React, { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import "./CursosAdmin.css";

export default function CursosAdmin() {
  const [cursos, setCursos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [docentes, setDocentes] = useState([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);

  const [sesiones, setSesiones] = useState([]);
  const [horariosSeleccionados, setHorariosSeleccionados] = useState([]);

  const [modalEditar, setModalEditar] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formConfig, setFormConfig] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    dias: [],
    horas_por_dia: {},
  });

  // ============================
  // Cargar datos iniciales
  // ============================
  useEffect(() => {
    cargarCursos();
    cargarSecciones();
    cargarDocentes();
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

  const cargarDocentes = async () => {
    const res = await adminApi.listarDocentes();
    setDocentes(res.data.docentes);
  };

  const cargarSesiones = async () => {
    if (!seccionSeleccionada) return;

    const res = await adminApi.listarSesiones(seccionSeleccionada.id);

    const eventos = res.data.sesiones.map((s) => ({
      id: s.id,
      title: `${s.titulo}`,
      start: s.inicia_en,
      end: s.termina_en,
    }));

    setSesiones(eventos);
  };

  useEffect(() => {
    if (seccionSeleccionada) cargarSesiones();
  }, [seccionSeleccionada]);

  // ============================
  // Eventos calendario selección HORARIOS
  // ============================
  const seleccionarBloque = (info) => {
    const fecha = info.dateStr.split("T")[0];
    const hora = info.dateStr.split("T")[1].substring(0, 5);

    setHorariosSeleccionados([...horariosSeleccionados, { fecha, hora }]);
  };

  // ============================
  // Generar sesiones automáticamente
  // ============================
  const generarSesiones = async () => {
    if (!seccionSeleccionada) return alert("Debe seleccionar una sección");

    await adminApi.generarSesiones(seccionSeleccionada.id, {
      fecha_inicio: formConfig.fecha_inicio,
      fecha_fin: formConfig.fecha_fin,
      dias: formConfig.dias,
      bloques: horariosSeleccionados,
    });

    alert("Sesiones generadas correctamente");
    cargarSesiones();
  };

  // ============================
  // Render
  // ============================
  return (
    <div className="admin-wrapper">
      <div className="panel-cursos">
        <h2>Cursos</h2>

        {loading && <p>Cargando...</p>}

        <div className="curso-grid">
          {cursos.map((c) => (
            <div key={c.id} className="curso-card" onClick={() => setCursoSeleccionado(c)}>
              <h3>{c.titulo}</h3>
              <p className="desc">{c.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`panel-detalle ${cursoSeleccionado ? "open" : ""}`}>
        {!cursoSeleccionado && (
          <div className="placeholder"><p>Selecciona un curso</p></div>
        )}

        {cursoSeleccionado && (
          <>
            <h2>{cursoSeleccionado.titulo}</h2>

            {/* ================= SECCIONES ================= */}
            <h3>Secciones</h3>
            <div className="seccion-list">
              {secciones
                .filter((s) => s.curso_id === cursoSeleccionado.id)
                .map((s) => (
                  <div
                    key={s.id}
                    className={`seccion-item ${seccionSeleccionada?.id === s.id ? "active" : ""}`}
                    onClick={() => setSeccionSeleccionada(s)}
                  >
                    <strong>Sección {s.codigo || s.id}</strong>
                    <p>Modalidad: {s.modalidad}</p>
                    <p>Inicio: {s.fecha_inicio}</p>
                  </div>
                ))}
            </div>

            {/* ================= DETALLE CONFIGURACIÓN ================= */}
            {seccionSeleccionada && (
              <>
                <h3>Docente</h3>
                <select
                  value={seccionSeleccionada.docente_id || ""}
                  onChange={(e) => adminApi.actualizarSeccion(seccionSeleccionada.id, { docente_id: e.target.value })}
                  className="select-docente"
                >
                  <option value="">— Seleccionar docente —</option>
                  {docentes.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre} {d.apellido_paterno}</option>
                  ))}
                </select>

                <h3>Configurar Fechas</h3>
                <div className="fechas-box">
                  <label>Fecha Inicio</label>
                  <input
                    type="date"
                    value={formConfig.fecha_inicio}
                    onChange={(e) => setFormConfig({ ...formConfig, fecha_inicio: e.target.value })}
                  />

                  <label>Fecha Fin</label>
                  <input
                    type="date"
                    value={formConfig.fecha_fin}
                    onChange={(e) => setFormConfig({ ...formConfig, fecha_fin: e.target.value })}
                  />
                </div>

                <h3>Días de Estudio</h3>
                <div className="dias-box">
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((dia) => (
                    <label key={dia}>
                      <input
                        type="checkbox"
                        checked={formConfig.dias.includes(dia)}
                        onChange={() => {
                          const nuevo = formConfig.dias.includes(dia)
                            ? formConfig.dias.filter((d) => d !== dia)
                            : [...formConfig.dias, dia];
                          setFormConfig({ ...formConfig, dias: nuevo });
                        }}
                      />
                      {dia}
                    </label>
                  ))}
                </div>

                <h3>Seleccionar bloques de horario</h3>
                <p>Haz clic en la hora dentro del calendario para agregar un bloque.</p>

                <FullCalendar
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  selectable={true}
                  dateClick={seleccionarBloque}
                  events={sesiones}
                />

                <button className="btn-generar" onClick={generarSesiones}>Generar Sesiones</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

