// src/components/Administrador/SeccionesAdmin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./SeccionesAdmin.css";

export default function SeccionesAdmin() {
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ curso_id: "", codigo: "", periodo: "", precio: 0 });

  useEffect(()=>{ fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarSecciones();
      setSecciones(res.data.secciones || res.data);
    } catch (err) { console.error(err); alert("Error"); }
    finally { setLoading(false); }
  };

  const crear = async (e) => {
    e.preventDefault();
    try {
      await adminApi.crearSeccion(form);
      setForm({ curso_id: "", codigo: "", periodo: "", precio: 0 });
      fetch();
    } catch (err) { console.error(err); alert("Error creando"); }
  };

  const eliminar = async (id) => {
    if (!confirm("Eliminar sección?")) return;
    try {
      await adminApi.eliminarSeccion(id);
      fetch();
    } catch (err) { console.error(err); alert("Error"); }
  };

  return (
    <div className="secciones-admin">
      <h2>Secciones</h2>

      <form className="seccion-form" onSubmit={crear}>
        <input placeholder="Curso ID" value={form.curso_id} onChange={e=>setForm({...form,curso_id:e.target.value})}/>
        <input placeholder="Código" value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})}/>
        <input placeholder="Periodo" value={form.periodo} onChange={e=>setForm({...form,periodo:e.target.value})}/>
        <button className="btn primary" type="submit">Crear Sección</button>
      </form>

      <div className="list">
        {secciones.map(s=>(
          <div className="card" key={s.id}>
            <div>
              <b>{s.codigo}</b>
              <div className="meta">{s.modalidad} • S/ {s.precio}</div>
            </div>
            <div>
              <button className="btn" onClick={()=>window.alert("Editar próximamente")}>Editar</button>
              <button className="btn danger" onClick={()=>eliminar(s.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
