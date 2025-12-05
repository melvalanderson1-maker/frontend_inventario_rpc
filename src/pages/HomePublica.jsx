// src/pages/HomePublica.jsx
import React, { useEffect, useState } from "react";
import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import { cursosApi } from "../api/cursosApi";
import { Link } from "react-router-dom";
import "./HomePublica.css";

export default function HomePublica() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarCursos = async () => {
      try {
        console.log("HomePublica: solicitando cursos a backend...");
        const res = await cursosApi.listarPublicos();
        console.log("HomePublica: respuesta cursos:", res);
        setCursos(res.data || []);
      } catch (err) {
        console.error("HomePublica: error cargando cursos:", err);
        setError("No se pudieron cargar los cursos.");
        setCursos([]);
      } finally {
        setLoading(false);
        console.log("HomePublica: loading false");
      }
    };

    cargarCursos();
  }, []);

  const onClickMatricular = (curso) => {
    console.log("HomePublica: click Matricular — curso.id:", curso.id, "titulo:", curso.titulo);
    // la navegación la hace <Link>, aquí solo registramos el evento.
  };

  if (loading) return <p className="loading">Cargando cursos...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <PublicHeader />
      <main className="home container">
        <section className="hero">
          <h1>Universidad Quantum</h1>
          <p>Aprende con cursos presenciales, virtuales o híbridos.</p>
        </section>

        <section id="cursos" className="cursos-grid">
          {cursos.length === 0 ? (
            <p>No hay cursos disponibles en este momento.</p>
          ) : (
            cursos.map((c) => (
              <div key={c.id} className="curso-card">
                <h3>{c.titulo}</h3>
                <p>{c.descripcion}</p>

                <div className="actions">
                  {/*
                  <Link to={`/curso/${c.id}`} className="ver">
                  </Link>
                  */}

                  <Link to={`/checkout/${c.id}`} className="mat" onClick={() => onClickMatricular(c)}>
                    Ver curso
                  </Link>
                  <p className="precio">S/ {c.precio}</p>
                </div>


              </div>
            ))
          )}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
