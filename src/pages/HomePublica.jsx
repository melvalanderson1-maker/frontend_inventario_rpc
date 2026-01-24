// src/pages/HomePublica.jsx
import React from "react";
import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import { Link } from "react-router-dom";
import "./HomePublica.css";

export default function HomePublica() {
  const cursos = [
    {
      id: 1,
      titulo: "Ingeniería de Software",
      descripcion: "Aprende desarrollo web moderno",
      precio: 250,
    },
    {
      id: 2,
      titulo: "Contabilidad Financiera",
      descripcion: "Domina los estados financieros",
      precio: 180,
    },
    {
      id: 3,
      titulo: "Marketing Digital",
      descripcion: "Aprende a vender online",
      precio: 150,
    },
  ];

  return (
    <>
      <PublicHeader />
      <main className="home container">
        <section className="hero">
          <h1>GRUPO RPC</h1>
          <p>Gestión de Inventarios </p>
        </section>

 
      </main>
      <PublicFooter />
    </>
  );
}
