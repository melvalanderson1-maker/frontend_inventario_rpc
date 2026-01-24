// src/components/admin_contabilidad/MovimientosContabilidad.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { Link } from "react-router-dom";

import "./MovimientosContabilidad.css";

export default function MovimientosContabilidad() {
  const [movimientos, setMovimientos] = useState([]);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("todos");
  const [tipo, setTipo] = useState("todos");

  // Traer movimientos desde la API de contabilidad
  useEffect(() => {
    api
      .get("/api/contabilidad/movimientos", { params: { search } })
      .then((res) => setMovimientos(res.data.movimientos || []))
      .catch(() => setMovimientos([]));
  }, [search]);

  const movimientosFiltrados = movimientos.filter((m) => {
    const texto = search.toLowerCase();
    const coincideTexto =
      m.documento?.toLowerCase().includes(texto) ||
      m.empresa?.toLowerCase().includes(texto) ||
      m.almacen?.toLowerCase().includes(texto);

    const coincideEstado =
      estado === "todos" || m.estado === estado;

    const coincideTipo =
      tipo === "todos" || m.tipo === tipo;

    return coincideTexto && coincideEstado && coincideTipo;
  });

  return (
    <div className="movimientos-container">
      <h2>Movimientos de Contabilidad</h2>

      <div className="movimientos-filtros">
        <input
          type="text"
          placeholder="Buscar por documento, empresa o almacén…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="select"
        >
          <option value="todos">Todos los estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="APROBADO">Aprobados</option>
          <option value="RECHAZADO">Rechazados</option>
        </select>

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="select"
        >
          <option value="todos">Todos los tipos</option>
          <option value="ENTRADA">Entrada</option>
          <option value="SALIDA">Salida</option>
          <option value="AJUSTE">Ajuste</option>
        </select>
      </div>

      <div className="movimientos-grid">
        {movimientosFiltrados.map((m) => (
          <div key={m.id} className="movimiento-card">
            <div className="movimiento-info">
              <strong>Documento:</strong> {m.documento || "—"}
            </div>
            <div className="movimiento-info">
              <strong>Empresa:</strong> {m.empresa || "—"}
            </div>
            <div className="movimiento-info">
              <strong>Almacén:</strong> {m.almacen || "—"}
            </div>
            <div className="movimiento-info">
              <strong>Tipo:</strong> {m.tipo}
            </div>
            <div className="movimiento-info">
              <strong>Estado:</strong> {m.estado}
            </div>

            <Link
              to={`/contabilidad/movimiento/${m.tipo.toLowerCase()}/${m.id}`}
              className="btn-detalle"
            >
              Ver detalle →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
