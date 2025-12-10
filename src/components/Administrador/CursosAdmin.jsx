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

  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);

  const [sesiones, setSesiones] = useState([]);
  const [modalEditar, setModalEditar] = useState(null);
  const [docentes, setDocentes] = useState([]);

  const [loading, setLoading] = useState(true);

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
  // CRUD básico
  // ============================
  const abrirCurso = (curso) => {
    setCursoSeleccionado(curso);
    setSeccionSeleccionada(null);
    setSesiones([]);
  };

  const abrirSeccion = (s) => {
    setSeccionSeleccionada(s);
  };

  /// Guardar docente
  const actualizarDocente = async (docenteId) => {
    await adminApi.actualizarSeccion(seccionSeleccionada.id, {
      docente_id: docenteId,
    });

    setSeccionSeleccionada({
      ...seccionSeleccionada,
      docente_id: docenteId,
    });

    alert("Docente actualizado correctamente");
  };

  // ============================
  // Modal de edición
  // ============================
  const abrirModalEdicion = (evento) => {
    setModalEditar({
      id: evento.id,
      titulo: evento.title,
      inicio: evento.startStr,
      fin: evento.endStr,
    });
  };

  const guardarCambiosSesion = async () => {
    await adminApi.actualizarSesion(modalEditar.id, {
      titulo: modalEditar.titulo,
      inicia_en: modalEditar.inicio,
      termina_en: modalEditar.fin,
    });

    setModalEditar(null);
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
            <div key={c.id} className="curso-card" onClick={() => abrirCurso(c)}>
              <h3>{c.titulo}</h3>
              <p className="desc">{c.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`panel-detalle ${cursoSeleccionado ? "open" : ""}`}>
        {!cursoSeleccionado && (
          <div className="placeholder">
            <p>Selecciona un curso</p>
          </div>
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
                    className={`seccion-item ${
                      seccionSeleccionada?.id === s.id ? "active" : ""
                    }`}
                    onClick={() => abrirSeccion(s)}
                  >
                    <strong>Sección {s.codigo || s.id}</strong>
                    <p>Modalidad: {s.modalidad}</p>
                    <p>Inicio: {s.fecha_inicio}</p>
                  </div>
                ))}
            </div>

            {/* ================= DETALLE DE SECCIÓN ================= */}
            {seccionSeleccionada && (
              <>
                <h3>Docente asignado</h3>

                <select
                  value={seccionSeleccionada.docente_id || ""}
                  onChange={(e) => actualizarDocente(e.target.value)}
                  className="select-docente"
                >
                  <option value="">— Seleccionar docente —</option>
                  {docentes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre} {d.apellido_paterno}
                    </option>
                  ))}
                </select>

                <h3>Calendario de Sesiones</h3>

                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  editable={true}
                  selectable={true}
                  events={sesiones}

                  dateClick={(info) => {
                    const titulo = prompt("Título de la sesión:");
                    if (!titulo) return;

                    adminApi
                      .crearSesion({
                        seccion_id: seccionSeleccionada.id,
                        titulo,
                        inicia_en: info.dateStr + "T08:00:00",
                        termina_en: info.dateStr + "T10:00:00",
                      })
                      .then(() => cargarSesiones());
                  }}

                  eventClick={(info) => {
                    abrirModalEdicion(info.event);
                  }}

                  eventDrop={(info) => {
                    adminApi
                      .actualizarSesion(info.event.id, {
                        inicia_en: info.event.startStr,
                        termina_en: info.event.endStr,
                      })
                      .then(() => cargarSesiones());
                  }}

                  eventResize={(info) => {
                    adminApi
                      .actualizarSesion(info.event.id, {
                        inicia_en: info.event.startStr,
                        termina_en: info.event.endStr,
                      })
                      .then(() => cargarSesiones());
                  }}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* ================= MODAL DE EDICIÓN ================= */}
      {modalEditar && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar sesión</h2>

            <label>Título</label>
            <input
              value={modalEditar.titulo}
              onChange={(e) =>
                setModalEditar({ ...modalEditar, titulo: e.target.value })
              }
            />

            <label>Inicio</label>
            <input
              type="datetime-local"
              value={modalEditar.inicio}
              onChange={(e) =>
                setModalEditar({ ...modalEditar, inicio: e.target.value })
              }
            />

            <label>Fin</label>
            <input
              type="datetime-local"
              value={modalEditar.fin}
              onChange={(e) =>
                setModalEditar({ ...modalEditar, fin: e.target.value })
              }
            />

            <div className="modal-buttons">
              <button onClick={guardarCambiosSesion}>Guardar</button>
              <button className="cancel" onClick={() => setModalEditar(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
