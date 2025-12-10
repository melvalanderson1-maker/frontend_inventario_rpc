// src/components/Administrador/CursosAdmin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./CursosAdmin.css";

export default function CursosAdmin() {
  const [cursos, setCursos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [docentes, setDocentes] = useState([]);

  const [loading, setLoading] = useState(true);

  // FORMULARIO CURSO
  const [cursoForm, setCursoForm] = useState({ titulo: "", descripcion: "", precio: 0 });

  // FORMULARIO SECCION
  const [seccionForm, setSeccionForm] = useState({
    curso_id: "",
    docente_id: "",
    modalidad: "PRESENCIAL",
    fecha_inicio: "",
    horas_totales: 0,
    horario_semana: []
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [cursosRes, seccionesRes, docentesRes] = await Promise.all([
        adminApi.listarCursos(),
        adminApi.listarSecciones(),
        adminApi.listarDocentes()
      ]);

      setCursos(cursosRes.data.cursos);
      setSecciones(seccionesRes.data.secciones);
      setDocentes(docentesRes.data.docentes);
    } catch (err) {
      console.error(err);
      alert("Error cargando datos.");
    }
    setLoading(false);
  };

  // CREAR CURSO
  const crearCurso = async (e) => {
    e.preventDefault();
    try {
      await adminApi.crearCurso(cursoForm);
      setCursoForm({ titulo: "", descripcion: "", precio: 0 });
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert("Error creando curso");
    }
  };

  // CREAR SECCION
  const crearSeccion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...seccionForm,
        horario_semana: JSON.stringify(seccionForm.horario_semana)
      };

      await adminApi.crearSeccion(payload);
      alert("Sección creada con éxito");
      setSeccionForm({
        curso_id: "",
        docente_id: "",
        modalidad: "PRESENCIAL",
        fecha_inicio: "",
        horas_totales: 0,
        horario_semana: []
      });
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert("Error creando sección");
    }
  };

  // AGREGAR HORARIO
  const agregarHorario = () => {
    const dia = prompt("Día (LUNES/MARTES/MIERCOLES/JUEVES/VIERNES/SABADO/DOMINGO)");
    const inicio = prompt("Hora inicio (HH:MM)");
    const fin = prompt("Hora fin (HH:MM)");

    if (!dia || !inicio || !fin) return;

    setSeccionForm({
      ...seccionForm,
      horario_semana: [...seccionForm.horario_semana, { dia, inicio, fin }]
    });
  };

  return (
    <div className="admin-container">
      <h1 className="panel-title">Gestión de Cursos y Secciones</h1>

      {loading ? <p>Cargando...</p> : (
        <div className="grid">
          {/* ---------------------------------------- */}
          {/* FORMULARIO CURSOS */}
          {/* ---------------------------------------- */}
          <div className="card">
            <h2>Crear Curso</h2>
            <form onSubmit={crearCurso} className="form">
              <input 
                placeholder="Título" 
                required 
                value={cursoForm.titulo}
                onChange={(e)=>setCursoForm({...cursoForm, titulo:e.target.value})}
              />

              <textarea 
                placeholder="Descripción"
                value={cursoForm.descripcion}
                onChange={(e)=>setCursoForm({...cursoForm, descripcion:e.target.value})}
              />

              <input 
                type="number"
                placeholder="Precio"
                value={cursoForm.precio}
                onChange={(e)=>setCursoForm({...cursoForm, precio:Number(e.target.value)})}
              />

              <button className="btn primary">Crear Curso</button>
            </form>
          </div>

          {/* ---------------------------------------- */}
          {/* FORM SECCION */}
          {/* ---------------------------------------- */}
          <div className="card">
            <h2>Crear Sección</h2>

            <form onSubmit={crearSeccion} className="form">

              <select
                required
                value={seccionForm.curso_id}
                onChange={(e)=>setSeccionForm({...seccionForm, curso_id:e.target.value})}
              >
                <option value="">Seleccione Curso</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
              </select>

              <select
                required
                value={seccionForm.docente_id}
                onChange={(e)=>setSeccionForm({...seccionForm, docente_id:e.target.value})}
              >
                <option value="">Seleccione Docente</option>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido_paterno}</option>)}
              </select>

              <select
                value={seccionForm.modalidad}
                onChange={(e)=>setSeccionForm({...seccionForm, modalidad:e.target.value})}
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="VIRTUAL">Virtual</option>
                <option value="HIBRIDO">Híbrido</option>
              </select>

              <label>Fecha Inicio</label>
              <input 
                type="date"
                value={seccionForm.fecha_inicio}
                onChange={(e)=>setSeccionForm({...seccionForm, fecha_inicio:e.target.value})}
              />

              <input 
                type="number"
                placeholder="Horas Totales"
                value={seccionForm.horas_totales}
                onChange={(e)=>setSeccionForm({...seccionForm, horas_totales:Number(e.target.value)})}
              />

              <button type="button" className="btn secondary" onClick={agregarHorario}>
                + Agregar Horario
              </button>

              <div className="horario-list">
                {seccionForm.horario_semana.map((h,i)=>(
                  <div className="horario-item" key={i}>
                    <b>{h.dia}</b>: {h.inicio} - {h.fin}
                  </div>
                ))}
              </div>

              <button className="btn primary">Crear Sección</button>
            </form>
          </div>

          {/* ---------------------------------------- */}
          {/* LISTADO DE CURSOS */}
          {/* ---------------------------------------- */}
          <div className="card full">
            <h2>Cursos Registrados</h2>
            <div className="list">
              {cursos.map(c => (
                <div className="row" key={c.id}>
                  <div>
                    <b>{c.titulo}</b>
                    <p>S/ {c.precio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* LISTADO DE SECCIONES */}
          {/* ---------------------------------------- */}
          <div className="card full">
            <h2>Secciones Registradas</h2>
            <div className="list">
              {secciones.map(s => (
                <div className="row" key={s.id}>
                  <div>
                    <b>Curso ID: {s.curso_id}</b>
                    <p>Modalidad: {s.modalidad}</p>
                    <p>Inicio: {s.fecha_inicio}</p>
                    <p>Horas Totales: {s.horas_totales}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
