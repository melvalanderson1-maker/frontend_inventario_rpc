import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/api"; // ya corregido
import { resolveImageUrl } from "../../utils/imageUrl";

// TABLAS CONTABILIDAD
import TablaHistorial from "./tablas/TablaHistorialContabilidad";
import TablaStockEmpresa from "./tablas/TablaStockEmpresaContabilidad";
import TablaAprobadosContabilidad from "./tablas/TablaAprobadosContabilidad";
import TablaPendientesContabilidad from "./tablas/TablaPendientesContabilidad";
import TablaRechazadosContabilidad from "./tablas/TablaRechazadosContabilidad";
import TablaCambiosAlmacenPendientesContabilidad from "./tablas/TablaCambiosAlmacenPendientesContabilidad";



import "./ProductoDetalleContabilidad.css";

export default function ProductoDetalleContabilidad() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [varianteActiva, setVarianteActiva] = useState(null);
  const [tab, setTab] = useState("historial");
  const [filtro, setFiltro] = useState("");

  // Obtener producto desde API contabilidad
  useEffect(() => {
    api
      .get(`/api/contabilidad/productos/${id}`)
      .then((res) => {
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
    <div className="detalle-contabilidad-container">
      <div className="detalle-header">
        <button
          onClick={() => navigate("/contabilidad/productos")}
          className="btn-back"
        >
          ← Volver
        </button>
      </div>

      <div className="detalle-top">
        <div className="detalle-imagen">
          {contexto.imagen ? (
            <img src={resolveImageUrl(contexto.imagen)} alt="" />
          ) : (
            <span>Sin imagen</span>
          )}
        </div>

        <div className="detalle-info">
          <h2>{contexto.codigo || contexto.codigo_modelo}</h2>
          <p className="detalle-descripcion">{producto.descripcion}</p>

          <div className="detalle-stock">
            Stock total: <strong>{contexto.stock_total}</strong>
          </div>

          {producto.variantes?.length > 0 && (
            <select
              className="input"
              value={varianteActiva?.id}
              onChange={(e) =>
                setVarianteActiva(
                  producto.variantes.find(
                    (v) => v.id === Number(e.target.value)
                  )
                )
              }
            >
              {producto.variantes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.codigo_modelo}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="detalle-tabs">
        <div className="tabs-header">
          {[
            "historial",
            "stock_empresa",
            "aprobados",
            "pendientes",
            "rechazados",
            "cambios_almacen",
          ].map((t) => (
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
          onChange={(e) => setFiltro(e.target.value)}
        />

        <div className="tabla-container">
          {tab === "historial" && (
            <TablaHistorial productoId={contexto.id} filtro={filtro} />
          )}
          {tab === "stock_empresa" && (
            <TablaStockEmpresa productoId={contexto.id} filtro={filtro} />
          )}
          {tab === "aprobados" && (
            <TablaAprobadosContabilidad productoId={contexto.id} filtro={filtro} />
          )}
          {tab === "pendientes" && (
            <TablaPendientesContabilidad productoId={contexto.id} filtro={filtro} />
          )}
          {tab === "rechazados" && (
            <TablaRechazadosContabilidad productoId={contexto.id} filtro={filtro} />
          )}
          {tab === "cambios_almacen" && (
            <TablaCambiosAlmacenPendientesContabilidad
              productoId={contexto.id}
              filtro={filtro}
            />
          )}
        </div>
      </div>
    </div>
  );
}
