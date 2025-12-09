// src/components/Administrador/AlumnosAdmin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import "./AlumnosAdmin.css";

export default function AlumnosAdmin() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchAlumnos(); }, []);

  const fetchAlumnos = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listarAlumnos();
      setAlumnos(res.data.alumnos || res.data);
    } catch (err) {
      console.error(err); alert("Error al cargar alumnos");
    } finally { setLoading(false); }
  };

  return (
    <div className="alumnos-admin">
      <h2>Alumnos</h2>
      {loading ? <p>Cargando...</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>DNI</th><th>Correo</th></tr>
            </thead>
            <tbody>
              {alumnos.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.nombre} {a.apellido_paterno}</td>
                  <td>{a.numero_documento}</td>
                  <td>{a.correo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
