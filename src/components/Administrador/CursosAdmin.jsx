import React, { useState, useEffect, useRef } from "react";
import adminApi from "../../api/adminApi";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(weekday);
dayjs.extend(isoWeek);

import "./CursosAdmin.css";

export default function CursosAdmin() {
  const [cursos, setCursos] = useState([]);
  const [secciones, setSecciones] = useState([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);

  const [sesiones, setSesiones] = useState([]); // eventos reales
  const [horarios, setHorarios] = useState([]); // horarios guardados en backend
  const [plantillaBloques, setPlantillaBloques] = useState([]); // bloques temporales {dia_semana, hora_inicio, hora_fin}

  const [modalEditar, setModalEditar] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modePlantilla, setModePlantilla] = useState(false);
  const [plantillaEventosState, setPlantillaEventosState] = useState([]);

  const plantillaCalRef = useRef(null);

  // -------------------
  // Cargar datos
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
      setSecciones(res.data.secciones || []);
    } catch (err) {
      console.error("Error cargar secciones", err);
    }
  };

  const cargarDocentes = async () => {
    try {
      const res = await adminApi.listarDocentes();
      setDocentes(res.data.docentes || []);
    } catch (err) {
      console.error("Error cargar docentes", err);
    }
  };

  // -------------------
  // Cargar sesiones + horarios
  // -------------------
  const cargarSesiones = async (seccionId) => {
    try {
      console.log("cargarSesiones seccion:", seccionId);
      const res = await adminApi.listarSesiones(seccionId);
      const eventos = (res.data.sesiones || []).map((s) => ({
        id: s.id,
        title: s.titulo,
        start: s.inicia_en.replace("Z", ""), 
        end: s.termina_en.replace("Z", ""),
      }));

      setSesiones(eventos);


    } catch (err) {
      console.error("Error listar sesiones", err);
      setSesiones([]);
    }
  };

  const cargarHorarios = async (seccionId) => {
    try {
      const res = await adminApi.listarHorarios(seccionId);
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
      setPlantillaBloques([]); // limpiar plantilla al abrir
      setModePlantilla(false);
    }
  }, [seccionSeleccionada]);

  // -------------------
  // Abrir curso / sección
  // -------------------
  const abrirCurso = (curso) => {
    setCursoSeleccionado(curso);
    setSeccionSeleccionada(null);
  };

  const abrirSeccion = (s) => {
    setSeccionSeleccionada(s);
  };

  // -------------------
  // Actualizar docente / fechas / horas
  // -------------------
  const actualizarSeccionField = async (patch) => {
    try {
      await adminApi.actualizarSeccion(seccionSeleccionada.id, patch);
      setSeccionSeleccionada({ ...seccionSeleccionada, ...patch });
      console.log("Sección actualizada:", patch);
      alert("Sección actualizada");
    } catch (err) {
      console.error("Error actualizar sección", err);
      alert("Error actualizando sección. Ver consola.");
    }
  };

  // -------------------
  // Helpers para plantilla
  // -------------------
  const pad = (n) => (n < 10 ? "0" + n : "" + n);

  // Merge intervals on same day: devuelve array de intervalos no solapados ordenados
  const mergeIntervals = (intervals) => {
    if (!intervals.length) return [];
    // intervals: [{start: "09:00:00", end: "11:00:00"}]
    const conv = intervals
      .map((i) => ({ s: toMinutes(i.hora_inicio), e: toMinutes(i.hora_fin) }))
      .sort((a, b) => a.s - b.s);
    const res = [];
    let cur = conv[0];
    for (let i = 1; i < conv.length; i++) {
      const it = conv[i];
      if (it.s <= cur.e) {
        cur.e = Math.max(cur.e, it.e);
      } else {
        res.push(cur);
        cur = it;
      }
    }
    res.push(cur);
    return res.map((r) => ({ hora_inicio: fromMinutes(r.s), hora_fin: fromMinutes(r.e) }));
  };

  const toMinutes = (hhmmss) => {
    const [hh, mm] = hhmmss.split(":").map(Number);
    return hh * 60 + mm;
  };
  const fromMinutes = (m) => {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${pad(hh)}:${pad(mm)}:00`;
  };

  // Añadir bloque a plantilla, pero mergear con existentes en mismo día
  const addBloquePlantilla = (dia_semana, hora_inicio, hora_fin) => {
    setPlantillaBloques((prev) => {
      const byDay = prev.filter((b) => b.dia_semana === dia_semana);
      const others = prev.filter((b) => b.dia_semana !== dia_semana);
      const merged = mergeIntervals([...byDay, { hora_inicio, hora_fin }]);
      const newBlocksDay = merged.map((m) => ({
        id: `${dia_semana}-${m.hora_inicio}-${m.hora_fin}`,
        dia_semana,
        hora_inicio: m.hora_inicio,
        hora_fin: m.hora_fin,
      }));
      return [...others, ...newBlocksDay].sort((a, b) => a.dia_semana - b.dia_semana || a.hora_inicio.localeCompare(b.hora_inicio));
    });
  };

  const quitarBloquePlantilla = (id) => {
    setPlantillaBloques((b) => b.filter((x) => x.id !== id));
  };

  // -------------------
  // Selección en calendario plantilla (FullCalendar select)
  // -------------------
  // convertimos selectInfo.start,end a hora y dia.
  const onSelectPlantilla = (selectInfo) => {
    // FullCalendar selection gives real dates; solo usamos día de la semana + horas
    const start = selectInfo.start;
    const end = selectInfo.end;
    const diaSemana = start.getDay(); // 0 Domingo .. 6 Sabado
    const horaInicio = `${pad(start.getHours())}:${pad(start.getMinutes())}:00`;
    const horaFin = `${pad(end.getHours())}:${pad(end.getMinutes())}:00`;

    addBloquePlantilla(diaSemana, horaInicio, horaFin);
    // prevent selection highlight linger
    if (selectInfo.view) {
      selectInfo.view.calendar.unselect();
    }
  };



  useEffect(() => {
  if (!modePlantilla) return;

  const baseDate = seccionSeleccionada?.fecha_inicio
    ? dayjs(seccionSeleccionada.fecha_inicio)
    : dayjs();

  const monday = baseDate.isoWeekday(1);

  const eventos = plantillaBloques.map((b) => {
    const isoDay = b.dia_semana === 0 ? 7 : b.dia_semana;
    const date = monday.isoWeekday(isoDay);

    return {
      id: b.id,
      start: `${date.format("YYYY-MM-DD")}T${b.hora_inicio}`,
      end: `${date.format("YYYY-MM-DD")}T${b.hora_fin}`,
      display: "auto",

      backgroundColor: "rgba(70, 150, 255, 0.35)",
    };
  });

  setPlantillaEventosState(eventos);
}, [plantillaBloques, modePlantilla, seccionSeleccionada]);


  // -------------------
  // Generar horarios+sesiones (respeta fecha_inicio de la sección)
  // -------------------
 const generarSesionesDesdePlantilla = async () => {
  if (!seccionSeleccionada) {
    alert("Selecciona una sección primero");
    return;
  }

  if (plantillaBloques.length === 0) {
    alert("No hay bloques seleccionados");
    return;
  }

  try {
    console.log("Generando horarios (plantilla) ->", plantillaBloques);

    // 1️⃣ Crear horarios en backend
    for (const b of plantillaBloques) {
      await adminApi.crearHorario({
        seccion_id: seccionSeleccionada.id,
        dia_semana: b.dia_semana,
        hora_inicio: b.hora_inicio,
        hora_fin: b.hora_fin,
        lugar: seccionSeleccionada.aula || null,
      });
    }

    // 2️⃣ Generar sesiones automáticamente (backend)
    const gen = await adminApi.generarSesionesAutomaticas(
      seccionSeleccionada.id
    );

    // 3️⃣ Refrescar frontend (SIN recargar página)
    await cargarHorarios(seccionSeleccionada.id);
    await cargarSesiones(seccionSeleccionada.id);

    // 4️⃣ Volver al calendario normal
    setModePlantilla(false);

    alert(`Sesiones generadas: ${gen.data.cantidad || "?"}`);
  } catch (err) {
    console.error("Error generando sesiones desde plantilla", err);
    alert("Ocurrió un error al generar sesiones. Revisa consola.");
  }
};



  // -------------------
  // Crear sesión manual (calendario de sesiones)
  // -------------------
  const onDateClickCrearSesion = async (info) => {
    if (!seccionSeleccionada) return;
    const titulo = prompt("Título de la sesión:");
    if (!titulo) return;
    try {
      const startISO = info.dateStr + "T09:00:00";
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
  // Edición sesión
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

  const onEventDropOrResize = async (info) => {
    try {
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

  const cargarPlantillaDesdeHorarios = () => {
  const bloques = horarios.map((h) => ({
    id: `h-${h.id}`,
    dia_semana: h.dia_semana,
    hora_inicio: h.hora_inicio,
    hora_fin: h.hora_fin,
  }));
  setPlantillaBloques(bloques);
};

  useEffect(() => {
    if (modePlantilla && horarios.length > 0) {
      cargarPlantillaDesdeHorarios();
    }
  }, [modePlantilla, horarios]);



  // -------------------
  // Render
  // -------------------
  return (
    <div className="admin-wrapper modern">
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
        {!cursoSeleccionado && <div className="placeholder"><p>Selecciona un curso</p></div>}

        {cursoSeleccionado && (
          <>
            <h2>{cursoSeleccionado.titulo}</h2>

            <h3>Secciones</h3>
            <div className="seccion-list">
              {secciones.filter((s) => s.curso_id === cursoSeleccionado.id).map((s) => (
                <div key={s.id}
                  className={`seccion-item ${seccionSeleccionada?.id === s.id ? "active" : ""}`}
                  onClick={() => abrirSeccion(s)}
                >
                  <strong>Sección {s.codigo || s.id}</strong>
                  <p>Modalidad: {s.modalidad}</p>
                  <p>
                    Inicio: {dayjs(s.fecha_inicio).format("DD-MM-YYYY")} • 
                    Fin: {dayjs(s.fecha_fin).format("DD-MM-YYYY")}
                  </p>

                </div>
              ))}
            </div>

            {seccionSeleccionada && (
              <>
                <h3>Configuración de sección</h3>
                <div className="config-row">
                  <div>
                    <label>Docente</label>
                    <select value={seccionSeleccionada.docente_id || ""} onChange={(e) => actualizarSeccionField({ docente_id: e.target.value })}>
                      <option value="">— Seleccionar docente —</option>
                      {docentes.map((d) => (
                        <option key={d.id} value={d.id}>{d.nombre} {d.apellido_paterno}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Fecha inicio</label>
                    <input
                      type="date"
                      value={seccionSeleccionada.fecha_inicio || ""}
                      onChange={(e) => actualizarSeccionField({ fecha_inicio: e.target.value })}
                    />
                  </div>

                  <div>
                    <label>Fecha fin</label>
                    <input
                      type="date"
                      value={seccionSeleccionada.fecha_fin || ""}
                      onChange={(e) => actualizarSeccionField({ fecha_fin: e.target.value })}
                    />
                  </div>

                  <div>
                    <label>Resumen horas</label>
                    <div className="horas-resumen">
                      {sesiones.length === 0
                        ? "—"
                        : sesiones.reduce((total, s) => {
                            const inicio = new Date(s.start);
                            const fin = new Date(s.end);
                            return total + (fin - inicio) / (1000 * 60 * 60); // horas
                          }, 0).toFixed(2) + " horas"
                      }
                    </div>

                  </div>

                </div>

                <div className="seccion-headers">
                  <div className="left-info">
                    <p>
                      <strong>Periodo:</strong>{" "}
                      {dayjs(seccionSeleccionada.fecha_inicio).format("DD-MM-YYYY")} →
                      {dayjs(seccionSeleccionada.fecha_fin).format("DD-MM-YYYY")}
                    </p>
                    <p><strong>Horas previstas:</strong> {seccionSeleccionada.horas_totales || "—"}</p>
                  </div>

                  <div className="btns-mode">
                    <button
                      className={`btn ${modePlantilla ? "active" : ""}`}
                      onClick={() => {
                        setModePlantilla(true);
                        cargarPlantillaDesdeHorarios(); // 🔥 CLAVE
                      }}
                    >
                      Plantilla semanal
                    </button>

                    <button className={`btn ${!modePlantilla ? "active" : ""}`} onClick={() => setModePlantilla(false)}>Calendario de sesiones</button>
                  </div>
                </div>

                <h3>{modePlantilla ? "Plantilla semanal" : "Calendario"}</h3>

                {modePlantilla ? (
                  <>
                    <p className="info">Selecciona los bloques que se repetirán cada semana. Luego pulsa <strong>Generar sesiones</strong>.</p>

                    <div className="plantilla-wrapper">
                      <div className="plantilla-left">
                      <FullCalendar
                        locale={esLocale}
                        timeZone="local"
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        firstDay={1}
                        allDaySlot={false}
                        selectable={true}
                        select={onSelectPlantilla}
                        slotMinTime="06:00:00"
                        slotMaxTime="23:00:00"
                        events={plantillaEventosState}   // 🔥 AHORA SÍ
                        eventOverlap={true}
                        selectOverlap={true}
                        headerToolbar={{ left: "", center: "title", right: "" }}
                      />


                      </div>

                      <aside className="plantilla-right">
                        <h4>Bloques seleccionados</h4>
                        {plantillaBloques.length === 0 && <p>No hay bloques seleccionados.</p>}
                        <ul className="bloques-list">
                          {plantillaBloques.map((b) => (
                            <li key={b.id}>
                              <span>{["Dom","Lun","Mar","Mie","Jue","Vie","Sab"][b.dia_semana]} {b.hora_inicio.slice(0,5)} - {b.hora_fin.slice(0,5)}</span>
                              <div>
                                <button className="small" onClick={() => quitarBloquePlantilla(b.id)}>Eliminar</button>
                              </div>
                            </li>
                          ))}
                        </ul>

                        <p>Total clases posibles: {plantillaBloques.length > 0 ? Math.ceil(
                          ((new Date(seccionSeleccionada.fecha_fin) - new Date(seccionSeleccionada.fecha_inicio)) / (1000*60*60*24) + 1) 
                          * plantillaBloques.length / 7
                        ) : 0}</p>

                        <div className="acciones-plantilla">
                          <button className="btn primary" onClick={generarSesionesDesdePlantilla}>Generar sesiones</button>
                          <button className="btn" onClick={() => setPlantillaBloques([])}>Limpiar</button>
                        </div>

                        <div className="debug">
                          <h5>Logs</h5>
                          <p>Revisa la consola para los POST/GET y errores.</p>
                        </div>
                      </aside>
                    </div>
                  </>
                ) : (
                  <>
                    <FullCalendar
                      locale={esLocale}
                      timeZone="local"
                      plugins={[timeGridPlugin, interactionPlugin]}
                      initialView="timeGridWeek"
                      firstDay={1}
                      editable={false}   // 🔥 IMPORTANTE
                      selectable={true}

                      events={sesiones}

                      dateClick={onDateClickCrearSesion}
                      eventClick={(info) => abrirModalEdicion(info.event)}

                      slotMinTime="06:00:00"
                      slotMaxTime="23:00:00"
                    />



                    <div className="horarios-listado">
                      <h4>Horarios guardados</h4>
                      {horarios.length === 0 ? <p>No hay horarios.</p> : (
                        <ul>
                          {horarios.map((h) => (
                            <li key={h.id}>
                              <strong>{["Dom","Lun","Mar","Mie","Jue","Vie","Sab"][h.dia_semana]}</strong> {h.hora_inicio.slice(0,5)} - {h.hora_fin.slice(0,5)}
                              <button
                                className="small"
                                onClick={async () => {
                                  if (!confirm("¿Eliminar horario? Esto también quitará los bloques del calendario.")) return;

                                  try {
                                    await adminApi.eliminarHorario(h.id);

                                    // 1️⃣ quitar del estado horarios
                                    setHorarios((prev) => prev.filter((x) => x.id !== h.id));

                                    // 2️⃣ quitar del calendario plantilla
                                    setPlantillaBloques((prev) =>
                                      prev.filter(
                                        (b) =>
                                          !(
                                            b.dia_semana === h.dia_semana &&
                                            b.hora_inicio === h.hora_inicio &&
                                            b.hora_fin === h.hora_fin
                                          )
                                      )
                                    );

                                    // ⬇️⬇️⬇️ AQUÍ ES DONDE VA ⬇️⬇️⬇️
                                    await cargarHorarios(seccionSeleccionada.id);
                                    await cargarSesiones(seccionSeleccionada.id);

                                  } catch (err) {
                                    console.error(err);
                                    alert("Error eliminando horario");
                                  }
                                }}
                              >
                                Eliminar
                              </button>


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

      {/* Modal editar sesión */}
      {modalEditar && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar sesión</h2>
            <label>Título</label>
            <input value={modalEditar.titulo} onChange={(e) => setModalEditar({ ...modalEditar, titulo: e.target.value })} />
            <label>Inicio</label>
            <input type="datetime-local" value={modalEditar.inicio} onChange={(e) => setModalEditar({ ...modalEditar, inicio: e.target.value })} />
            <label>Fin</label>
            <input type="datetime-local" value={modalEditar.fin} onChange={(e) => setModalEditar({ ...modalEditar, fin: e.target.value })} />
            <div className="modal-buttons">
              <button onClick={guardarCambiosSesion}>Guardar</button>
              <button className="cancel" onClick={() => setModalEditar(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
