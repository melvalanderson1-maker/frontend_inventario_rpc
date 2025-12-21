import React, { useState, useEffect } from "react";
import docentesApi from "../../api/docentesApi";

export default function ListaAlumnos({ seccionId }) {
  const [alumnos, setAlumnos] = useState([]);
  const [showLista, setShowLista] = useState(false);

  useEffect(() => {
    if (!showLista) return;
    fetchAlumnos();
  }, [showLista]);

  const fetchAlumnos = async () => {
    try {
      const res = await docentesApi.listarAlumnosSesion(seccionId);
      setAlumnos(res.data.alumnos || []);
    } catch (err) {
      console.error(err);
    }
  };

  const registrarNota = (usuarioId) => {
    const nota = prompt("Ingrese la nota del alumno:");
    if (!nota) return;
    docentesApi.registrarNotas(seccionId, [{ usuario_id: usuarioId, nota: Number(nota) }])
      .then(() => alert("Nota registrada"))
      .catch(err => alert("Error registrando nota"));
  };

  return (
    <div>
      <button className="btn outline" onClick={() => setShowLista(!showLista)}>
        {showLista ? "Ocultar Alumnos" : "Ver Alumnos"}
      </button>
      {showLista && (
        <table className="alumnos-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>DNI</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((a) => (
              <tr key={a.id}>
                <td>{a.nombre} {a.apellido_paterno} {a.apellido_materno}</td>
                <td>{a.correo}</td>
                <td>{a.numero_documento}</td>
                <td>
                  <button className="btn" onClick={() => registrarNota(a.id)}>Registrar Nota</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
