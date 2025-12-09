// src/components/Administrador/CursosAdmin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./CursosAdmin.css";

export default function CursosAdmin() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ titulo: "", descripcion: "", precio: 0 });

  useEffect(() => { fetchCursos(); }, []);

  const fetchCursos = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarCursos();
      setCursos(res.data.cursos || res.data);
    } catch (err) { console.error(err); alert("Error"); }
    finally { setLoading(false); }
  };

  const crear = async (e) => {
    e.preventDefault();
    try {
      await adminApi.crearCurso(form);
      setForm({ titulo: "", descripcion: "", precio: 0 });
      fetchCursos();
    } catch (err) { console.error(err); alert("Error creando curso"); }
  };

  const eliminar = async (id) => {
    if (!confirm("Eliminar curso?")) return;
    try {
      await adminApi.eliminarCurso(id);
      fetchCursos();
    } catch (err) { console.error(err); alert("Error"); }
  };

  return (
    <div className="cursos-admin">
      <h2>Cursos</h2>

      <form className="curso-form" onSubmit={crear}>
        <input placeholder="Título" required value={form.titulo} onChange={(e)=>setForm({...form,titulo:e.target.value})}/>
        <input placeholder="Precio" type="number" value={form.precio} onChange={(e)=>setForm({...form,precio:Number(e.target.value)})}/>
        <button className="btn primary" type="submit">Crear Curso</button>
      </form>

      <div className="list">
        {cursos.map(c => (
          <div className="card" key={c.id}>
            <div>
              <b>{c.titulo}</b>
              <div className="meta">S/ {c.precio}</div>
            </div>
            <div>
              <button className="btn" onClick={()=>window.alert("Editar próximamente")}>Editar</button>
              <button className="btn danger" onClick={()=>eliminar(c.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
