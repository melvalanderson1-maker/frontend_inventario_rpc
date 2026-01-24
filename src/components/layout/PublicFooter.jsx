// src/components/layout/PublicFooter.jsx
import React from "react";
import "./PublicFooter.css";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container">
        <div>© {new Date().getFullYear()} GRUPO RPC _ INVENTARIO</div>
        <div>Contacto: 971168000</div>
      </div>
    </footer>
  );
}
