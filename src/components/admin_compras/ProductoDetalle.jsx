import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { resolveImageUrl } from "../../utils/imageUrl";

import TablaHistorial from "./tablas/TablaHistorial";
import TablaStockEmpresa from "./tablas/TablaStockEmpresa";
import TablaAprobados from "./tablas/TablaAprobados";
import TablaPendientes from "./tablas/TablaPendientes";
import TablaRechazados from "./tablas/TablaRechazados";

import "./ProductoDetalle.css";

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [varianteActiva, setVarianteActiva] = useState(null);
  const [tab, setTab] = useState("historial");

  const [filtro, setFiltro] = useState("");


  useEffect(() => {
    api.get(`/api/compras/productos/${id}`)
      .then(res => {
        setProducto(res.data.producto);

        if (res.data.producto?.variantes?.length > 0) {
          setVarianteActiva(res.data.producto.variantes[0]);
        }
      })
      .catch(() => setProducto(null));
  }, [id]);

  if (!producto) return <div>Cargando producto...</div>;

  const contexto = varianteActiva || producto;

  return (
    <div className="detalle-container">

      {/* HEADER */}
      <div className="detalle-header">
        <button
          onClick={() => navigate("/compras/productos")}
          className="btn-back"
        >
          ← Volver
        </button>

        <div className="detalle-actions">
          <Link
            to={`/compras/movimiento/entrada/${contexto.id}`}
            className="btn-accion"
          >
            + Registrar entrada
          </Link>

          <Link
            to={`/compras/movimiento/salida/${contexto.id}`}
            className="btn-accion outline"
          >
            + Registrar salida
          </Link>
        </div>
      </div>

      {/* ===================== */}
      {/* BLOQUE SUPERIOR */}
      {/* ===================== */}
      <div className="detalle-top">

        {/* IMAGEN */}
        <div className="detalle-imagen">
          {contexto.imagen ? (
            <img src={resolveImageUrl(contexto.imagen)} alt="" />
          ) : (
            <span>Sin imagen</span>
          )}
        </div>

        {/* INFO PRODUCTO */}
        <div className="detalle-info">
          <h2>{contexto.codigo || contexto.codigo_modelo}</h2>
          <p className="detalle-descripcion">{producto.descripcion}</p>

          <div className="detalle-stock">
            Stock total: <strong>{contexto.stock_total}</strong>
          </div>

          {/* SELECTOR VARIANTES */}
          {producto.variantes?.length > 0 && (
            <select
              className="input"
              value={varianteActiva?.id}
              onChange={e =>
                setVarianteActiva(
                  producto.variantes.find(v => v.id === Number(e.target.value))
                )
              }
            >
              {producto.variantes.map(v => (
                <option key={v.id} value={v.id}>
                  {v.codigo_modelo}
                </option>
              ))}
            </select>
          )}
        </div>

      </div>

      {/* ===================== */}
      {/* BLOQUE TABLAS */}
      {/* ===================== */}
      <div className="detalle-tabs">

        <div className="tabs-header">
          {["historial", "stock_empresa", "aprobados", "pendientes", "rechazados"].map(t => (

            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>

        <input
          className="input"
          placeholder="Buscar por empresa, almacén, OP, documento..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />


        <div className="tabla-container">
        {tab === "historial" && (
          <TablaHistorial productoId={contexto.id} filtro={filtro} />
        )}
        {tab === "stock_empresa" && (
          <TablaStockEmpresa productoId={contexto.id} filtro={filtro} />
        )}
        {tab === "aprobados" && (
          <TablaAprobados productoId={contexto.id} filtro={filtro} />
        )}
        {tab === "pendientes" && (
          <TablaPendientes productoId={contexto.id} filtro={filtro} />
        )}

        {tab === "rechazados" && (
          <TablaRechazados productoId={contexto.id} filtro={filtro} />
        )}


        </div>

      </div>

    </div>
  );
}
