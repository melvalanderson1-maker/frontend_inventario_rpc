// src/components/layout/PublicHeader.jsx
import React from "react";
import "./PublicHeader.css";
import { Link } from "react-router-dom";

export default function PublicHeader() {
  return (
    <header className="public-header">
      <div className="container">
        <Link to="/" className="brand">
          <img
            src="/images/logo.png"
            alt="Logo Universidad Quantum"
            className="logo"
          />
        </Link>

        <nav className="nav">
          <Link to="/">Inicio</Link>
          <Link to="/#cursos">Productos</Link>
          <Link to="/login" className="btn">Inicia sesión</Link>
        </nav>
      </div>
    </header>
  );
}
