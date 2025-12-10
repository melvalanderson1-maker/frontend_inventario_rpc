import React, { useState, useEffect, useRef } from "react";
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

  const [sesiones, setSesiones] = useState([]); // eventos reales
  const [horarios, setHorarios] = useState([]); // horarios guardados en backend
  const [plantillaBloques, setPlantillaBloques] = useState([]); // temporal para plantilla semanal

  const [modalEditar, setModalEditar] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modePlantilla, setModePlantilla] = useState(false); // true = plantilla semanal (selección por bloques)
  const calendarRef = useRef(null);

  // -------------------
  // Cargar datos iniciales
  // -------------------
  useEffect(() => {
    cargarCursos();
    cargarSecciones();
    cargarDocentes();
  }, []);

  const cargarCursos = async () => {
    try {
      const res = await adminApi.listarCursos();
      console.log("listarCursos ->", res);
      setCursos(res.data.cursos || []);
    } catch (err) {
      console.error("Error cargar cursos", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarSecciones = async () => {
    try {
      const res = await adminApi.listarSecciones();
      console.log("listarSecciones ->", res);
      setSecciones(res.data.secciones || []);
    } catch (err) {
      console.error("Error cargar secciones", err);
    }
  };

  const cargarDocentes = async () => {
    try {
      const res = await adminApi.listarDocentes();
      console.log("listarDocentes ->", res);
      setDocentes(res.data.docentes || []);
    } catch (err) {
      console.error("Error cargar docentes", err);
    }
  };

  // -------------------
  // Cargar sesiones + horarios de una sección
  // -------------------
  const cargarSesiones = async (seccionId) => {
    try {
      console.log("cargarSesiones seccion:", seccionId);
      const res = await adminApi.listarSesiones(seccionId);
      console.log("listarSesiones ->", res);
      const eventos = (res.data.sesiones || []).map((s) => ({
        id: s.id,
        title: `${s.titulo}`,
        start: s.inicia_en,
        end: s.termina_en,
      }));
      setSesiones(eventos);
    } catch (err) {
      console.error("Error listar sesiones", err);
      setSesiones([]);
    }
  };

  const cargarHorarios = async (seccionId) => {
    try {
      console.log("cargarHorarios seccion:", seccionId);
      const res = await adminApi.listarHorarios(seccionId);
      console.log("listarHorarios ->", res);
      setHorarios(res.data.horarios || []);
    } catch (err) {
      console.error("Error listar horarios", err);
      setHorarios([]);
    }
  };

  useEffect(() => {
    if (seccionSeleccionada) {
      cargarSesiones(seccionSeleccionada.id);
      cargarHorarios(seccionSeleccionada.id);
    }
  }, [seccionSeleccionada]);

  // -------------------
  // Abrir curso / sección
  // -------------------
  const abrirCurso = (curso) => {
    setCursoSeleccionado(curso);
    setSeccionSeleccionada(null);
    setSesiones([]);
    setHorarios([]);
    setModePlantilla(false);
    setPlantillaBloques([]);
  };

  const abrirSeccion = (s) => {
    setSeccionSeleccionada(s);
    setPlantillaBloques([]);
    setModePlantilla(false);
  };

  // -------------------
  // Docente
  // -------------------
  const actualizarDocente = async (docenteId) => {
    try {
      console.log("actualizarDocente ->", docenteId);
      await adminApi.actualizarSeccion(seccionSeleccionada.id, {
        docente_id: docenteId,
      });
      setSeccionSeleccionada({
        ...seccionSeleccionada,
        docente_id: docenteId,
      });
      console.log("Docente actualizado OK");
      alert("Docente actualizado correctamente");
    } catch (err) {
      console.error("Error actualizar docente", err);
      alert("Error al actualizar docente");
    }
  };

  // -------------------
  // Plantilla semanal: selección de bloques repetitivos
  // -------------------
  // Usamos FullCalendar en vista timeGridWeek para que el usuario haga select de bloques.
  // Cuando selecciona, guardamos en plantillaBloques: { id, dia_semana, hora_inicio, hora_fin, label }
  const onSelectPlantilla = (selectInfo) => {
    // selectInfo.start/end are JS Dates
    const start = selectInfo.start;
    const end = selectInfo.end;

    // calcular dia_semana (lunes=1...domingo=0 según JS) -> lo normalizamos: 0=domingo..6=sabado
    const diaSemana = start.getDay(); // 0-6

    // obtener horas en formato HH:MM:SS
    const pad = (n) => (n < 10 ? "0" + n : "" + n);
    const horaInicio = `${pad(start.getHours())}:${pad(start.getMinutes())}:00`;
    const horaFin = `${pad(end.getHours())}:${pad(end.getMinutes())}:00`;

    const newBloque = {
      id: Date.now(),
      dia_semana: diaSemana,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      label: `${["Dom","Lun","Mar","Mie","Jue","Vie","Sab"][diaSemana]} ${horaInicio.slice(0,5)} - ${horaFin.slice(0,5)}`
    };

    console.log("Bloque seleccionado plantilla:", newBloque);
    setPlantillaBloques((b) => [...b, newBloque]);
  };

  const quitarBloquePlantilla = (id) => {
    setPlantillaBloques((b) => b.filter((x) => x.id !== id));
  };

  // Enviar plantilla -> crear horarios y generar sesiones
  const generarSesionesDesdePlantilla = async () => {
    if (!seccionSeleccionada) return alert("Selecciona una sección primero");
    if (plantillaBloques.length === 0) return alert("No hay bloques seleccionados");

    try {
      console.log("Generando horarios (plantilla) ->", plantillaBloques);

      // 1) crear cada horario en backend
      for (const b of plantillaBloques) {
        const payload = {
          seccion_id: seccionSeleccionada.id,
          dia_semana: b.dia_semana,
          hora_inicio: b.hora_inicio,
          hora_fin: b.hora_fin,
          lugar: seccionSeleccionada.aula || null,
        };
        console.log("POST /horarios payload:", payload);
        const r = await adminApi.crearHorario(payload);
        console.log("crearHorario response:", r);
      }

      // 2) recargar horarios
      await cargarHorarios(seccionSeleccionada.id);

      // 3) llamar a generar-sesiones (backend crea todas las sesiones entre fecha_inicio y fecha_fin)
      console.log("POST /secciones/:id/generar-sesiones ->", seccionSeleccionada.id);
      const gen = await adminApi.generarSesionesAutomaticas(seccionSeleccionada.id);
      console.log("generarSesionesAutomaticas response:", gen);

      // 4) recargar sesiones para mostrar en calendario de sesiones
      await cargarSesiones(seccionSeleccionada.id);

      // cambiar a modo calendario de sesiones
      setModePlantilla(false);

      alert(`Sesiones generadas: ${gen.data.cantidad || "?"}`);
    } catch (err) {
      console.error("Error generando sesiones desde plantilla", err);
      alert("Ocurrió un error al generar sesiones. Mira la consola.");
    }
  };

  // -------------------
  // Si la sección ya tiene sesiones, puedes crear sesión con dateClick
  // -------------------
  const onDateClickCrearSesion = async (info) => {
    if (!seccionSeleccionada) return;
    const titulo = prompt("Título de la sesión:");
    if (!titulo) return;

    try {
      console.log("Crear sesión manual ->", info.dateStr);
      // Por defecto dejamos 1 hora; el backend acepta ISO datetime
      const startISO = info.dateStr + "T09:00:00"; // o usar info.dateStr + "T08:00:00"
      const endISO = info.dateStr + "T10:00:00";

      const res = await adminApi.crearSesion({
        seccion_id: seccionSeleccionada.id,
        titulo,
        inicia_en: startISO,
        termina_en: endISO,
      });
      console.log("crearSesion response:", res);
      await cargarSesiones(seccionSeleccionada.id);
    } catch (err) {
      console.error("Error crear sesión", err);
      alert("Error creando sesión. Ver consola.");
    }
  };

  // -------------------
  // Eventos: click -> editar modal
  // -------------------
  const abrirModalEdicion = (evento) => {
    setModalEditar({
      id: evento.id,
      titulo: evento.title,
      inicio: evento.startStr,
      fin: evento.endStr,
    });
  };

  const guardarCambiosSesion = async () => {
    try {
      console.log("guardarCambiosSesion:", modalEditar);
      await adminApi.actualizarSesion(modalEditar.id, {
        titulo: modalEditar.titulo,
        inicia_en: modalEditar.inicio,
        termina_en: modalEditar.fin,
      });
      setModalEditar(null);
      await cargarSesiones(seccionSeleccionada.id);
    } catch (err) {
      console.error("Error actualizar sesión", err);
      alert("Error guardando cambios.");
    }
  };

  // -------------------
  // eventDrop / eventResize -> actualizar backend
  // -------------------
  const onEventDropOrResize = async (info) => {
    try {
      console.log("eventDrop/Resize ->", info.event.id, info.event.startStr, info.event.endStr);
      await adminApi.actualizarSesion(info.event.id, {
        inicia_en: info.event.startStr,
        termina_en: info.event.endStr,
      });
      await cargarSesiones(seccionSeleccionada.id);
    } catch (err) {
      console.error("Error al mover/resize evento", err);
      alert("Error actualizando sesión. Ver consola.");
    }
  };

  // -------------------
  // UI render
  // -------------------
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
                    className={`seccion-item ${seccionSeleccionada?.id === s.id ? "active" : ""}`}
                    onClick={() => abrirSeccion(s)}
                  >
                    <strong>Sección {s.codigo || s.id}</strong>
                    <p>Modalidad: {s.modalidad}</p>
                    <p>Inicio: {s.fecha_inicio} - Fin: {s.fecha_fin}</p>
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

                <div className="seccion-headers">
                  <div>
                    <p><strong>Fechas sección:</strong> {seccionSeleccionada.fecha_inicio} → {seccionSeleccionada.fecha_fin}</p>
                    <p><strong>Horas totales previstas:</strong> {seccionSeleccionada.horas_totales || "—"}</p>
                  </div>

                  <div className="btns-mode">
                    <button
                      className={`btn ${modePlantilla ? "active" : ""}`}
                      onClick={() => {
                        // Si hay sesiones existentes, permitimos cambiar a plantilla solo si usuario quiere reconfigurar
                        if (sesiones.length > 0) {
                          if (!window.confirm("Esta sección ya tiene sesiones creadas. Cambiar a plantilla semanal puede generar duplicados. ¿Continuar?")) return;
                        }
                        setModePlantilla(true);
                        setPlantillaBloques([]);
                      }}
                    >
                      Configurar plantilla semanal
                    </button>

                    <button
                      className={`btn ${!modePlantilla ? "active" : ""}`}
                      onClick={() => setModePlantilla(false)}
                    >
                      Ver calendario de sesiones
                    </button>
                  </div>
                </div>

                <h3>{modePlantilla ? "Plantilla semanal (selección repetitiva)" : "Calendario de sesiones"}</h3>

                {modePlantilla ? (
                  <>
                    <p className="info">
                      Selecciona bloques en la cuadrícula semanal (por ejemplo Lunes 09:00-10:00). Esos bloques se guardarán como <strong>horarios</strong> y luego se generarán sesiones entre la <em>fecha inicio</em> y la <em>fecha fin</em> de la sección.
                    </p>

                    <div className="plantilla-wrapper">
                      <div className="plantilla-left">
                        <FullCalendar
                          ref={calendarRef}
                          plugins={[timeGridPlugin, interactionPlugin]}
                          initialView="timeGridWeek"
                          allDaySlot={false}
                          editable={false}
                          selectable={true}
                          selectMirror={true}
                          slotMinTime="07:00:00"
                          slotMaxTime="22:00:00"
                          slotDuration="01:00:00"
                          hiddenDays={[]}
                          // inicializamos en la semana actual (es simplemente plantilla visual)
                          initialDate={new Date()}
                          select={onSelectPlantilla}
                          headerToolbar={{
                            left: "",
                            center: "title",
                            right: ""
                          }}
                          locale="es"
                        />
                      </div>

                      <aside className="plantilla-right">
                        <h4>Bloques seleccionados</h4>
                        {plantillaBloques.length === 0 && <p>No hay bloques. Haz selección en la cuadrícula.</p>}
                        <ul className="bloques-list">
                          {plantillaBloques.map((b) => (
                            <li key={b.id}>
                              <span>{b.label}</span>
                              <button className="small" onClick={() => quitarBloquePlantilla(b.id)}>Eliminar</button>
                            </li>
                          ))}
                        </ul>

                        <div className="acciones-plantilla">
                          <button onClick={generarSesionesDesdePlantilla} className="btn primary">Generar sesiones</button>
                          <button onClick={() => { setPlantillaBloques([]); }} className="btn">Limpiar</button>
                        </div>

                        <div className="debug">
                          <h5>Debug / logs</h5>
                          <p>Revisa la consola del navegador para ver las respuestas de los endpoints (GET/POST) y errores.</p>
                        </div>
                      </aside>
                    </div>
                  </>
                ) : (
                  <>
                    <FullCalendar
                      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                      initialView="timeGridWeek"
                      editable={true}
                      selectable={true}
                      events={sesiones}
                      dateClick={onDateClickCrearSesion}
                      eventClick={(info) => abrirModalEdicion(info.event)}
                      eventDrop={onEventDropOrResize}
                      eventResize={onEventDropOrResize}
                      headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "timeGridWeek,dayGridMonth"
                      }}
                      slotMinTime="07:00:00"
                      slotMaxTime="22:00:00"
                    />
                    <div className="horarios-listado">
                      <h4>Horarios configurados</h4>
                      {horarios.length === 0 ? (
                        <p>No hay horarios guardados para esta sección.</p>
                      ) : (
                        <ul>
                          {horarios.map((h) => (
                            <li key={h.id}>
                              <strong>{["Dom","Lun","Mar","Mie","Jue","Vie","Sab"][h.dia_semana]}</strong> {h.hora_inicio.slice(0,5)} - {h.hora_fin.slice(0,5)}
                              <button className="small" onClick={async () => {
                                // eliminar horario (si lo deseas)
                                if (!window.confirm("Eliminar horario?")) return;
                                try {
                                  console.log("DELETE horario", h.id);
                                  await adminApi.eliminarHorario(h.id); // necesitarás este endpoint en backend
                                  await cargarHorarios(seccionSeleccionada.id);
                                } catch (err) {
                                  console.error("Error eliminar horario", err);
                                  alert("Error eliminando horario");
                                }
                              }}>Eliminar</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
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
