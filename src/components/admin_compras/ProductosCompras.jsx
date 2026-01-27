import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { resolveImageUrl } from "../../utils/imageUrl";
import { Link } from "react-router-dom";

import "./ProductosCompras.css";

export default function ProductosCompras() {
  const [productos, setProductos] = useState([]);

  const [search, setSearch] = useState("");
  const [tipoProducto, setTipoProducto] = useState("todos");
  const [stock, setStock] = useState("todos");

  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState("todas");

  useEffect(() => {
    api.get("/api/compras/categorias")
      .then(res => setCategorias(res.data.categorias || []))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    api.get("/api/compras/productos", { params: { search } })
      .then(res => setProductos(res.data.productos || []))
      .catch(() => setProductos([]));
  }, [search]);

  const productosFiltrados = productos.filter(p => {
    const texto = search.toLowerCase();

    const coincideTexto =
      p.codigo?.toLowerCase().includes(texto) ||
      p.codigo_modelo?.toLowerCase().includes(texto) ||
      p.descripcion?.toLowerCase().includes(texto);

    const coincideTipo =
      tipoProducto === "todos" ||
      (tipoProducto === "simples" && p.es_catalogo === 0) ||
      (tipoProducto === "variantes" && p.es_catalogo === 1);

    const coincideCategoria =
      categoria === "todas" ||
      Number(p.categoria_id) === Number(categoria);

    const coincideStock =
      stock === "todos" ||
      (stock === "con" && p.stock_total > 0) ||
      (stock === "sin" && p.stock_total <= 0);

    return coincideTexto && coincideTipo && coincideCategoria && coincideStock;
  });

  return (
    <div className="productos-container">
      <div className="productos-header">
        <h2>Productos</h2>

        <Link to="nuevo" className="btn-nuevo">
          + Nuevo Producto
        </Link>
      </div>

      <div className="productos-filtros">
        <input
          type="text"
          placeholder="Buscar por código, descripción o variante…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
        />

        <select
          value={tipoProducto}
          onChange={e => setTipoProducto(e.target.value)}
          className="select"
        >
          <option value="todos">Todos</option>
          <option value="simples">Solo simples</option>
          <option value="variantes">Con variantes</option>
        </select>

        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className="select"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <select
          value={stock}
          onChange={e => setStock(e.target.value)}
          className="select"
        >
          <option value="todos">Stock (todos)</option>
          <option value="con">Con stock</option>
          <option value="sin">Sin stock</option>
        </select>
      </div>

      <div className="productos-grid">
        {productosFiltrados.map(p => (
          <div key={p.id} className="producto-card">

            {p.es_catalogo === 1 && (
              <div className="badge-variantes">
                Con variantes
              </div>
            )}

            <div className="producto-imagen">
              {p.imagen ? (
                <img
                  src={resolveImageUrl(p.imagen)}
                  alt={p.codigo}
                />
              ) : (
                <span>Sin imagen</span>
              )}
            </div>

            {/* CÓDIGO */}
            <div className="producto-codigo">
              {p.codigo_modelo || p.codigo || "—"}
            </div>

            {/* MODELO + MARCA */}
            {(p.modelo || p.marca) && (
              <div className="producto-modelo-marca">
                {p.modelo && <span>{p.modelo}</span>}
                {p.modelo && p.marca && <span> · </span>}
                {p.marca && <span>{p.marca}</span>}
              </div>
            )}

            {/* DESCRIPCIÓN */}
            <div className="producto-descripcion">
              {p.descripcion}
            </div>

            {/* STOCK TOTAL */}
            <div className="producto-stock-total">
              Stock total: <strong>{p.stock_total}</strong>
            </div>

            {/* VARIANTES */}
            {p.es_catalogo === 1 && Array.isArray(p.variantes) && (
              <div className="producto-variantes">
                {p.variantes
                  .filter(v => v && v.codigo_modelo)
                  .map(v => (
                    <div key={v.id} className="variante-row">
                      <span className="variante-codigo">{v.codigo_modelo}</span>
                      <span className={`variante-stock ${v.stock > 0 ? "ok" : "zero"}`}>
                        {v.stock}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            <Link to={`../producto/${p.id}`} className="producto-link">
              Ver detalle →
            </Link>

          </div>
        ))}
      </div>
    </div>
  );
}
