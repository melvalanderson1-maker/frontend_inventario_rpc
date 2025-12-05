import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";

import { obtenerSeccionesPorCurso } from "../api/seccionesApi";

import "./CheckoutCurso.css";

export default function CheckoutCurso() {
  const { cursoId } = useParams();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      if (!cursoId) return console.error("cursoId es undefined");

      setLoading(true);
      try {
        const res = await obtenerSeccionesPorCurso(cursoId);
        setCurso(res.data); // curso con secciones
      } catch (error) {
        console.error("Error al cargar curso:", error);
        alert("Error al cargar curso. Revisa la consola.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [cursoId]);

  if (loading) return <p className="loading">Cargando...</p>;

  return (
    <>
      <PublicHeader />

      <main className="container checkout">
        <h2>{curso?.titulo}</h2>
        <p className="descripcion">{curso?.descripcion}</p>
        <p className="precio">Precio: S/ {curso?.precio}</p>

        <div className="secciones">
          <h3>Secciones disponibles:</h3>
          {curso?.secciones?.length > 0 ? (
            curso.secciones.map((s) => (
              <div key={s.id} className="card seccion-card">
                <p><strong>Código:</strong> {s.codigo || s.id}</p>
                <p><strong>Modalidad:</strong> {s.modalidad}</p>
                <p><strong>Periodo:</strong> {s.periodo}</p>
                <p><strong>Capacidad:</strong> {s.capacidad}</p>
              </div>
            ))
          ) : (
            <p>No hay secciones disponibles</p>
          )}
        </div>

        <div className="whatsapp-button">
          <a
            href="https://wa.me/51971168000"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contactar por WhatsApp para más información
          </a>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
