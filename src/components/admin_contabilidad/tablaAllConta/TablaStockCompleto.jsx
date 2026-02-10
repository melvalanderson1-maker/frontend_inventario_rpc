import React, { useEffect, useState } from "react";
import api from "../../../api/api";
import "./TablaStockCompleto.css";

export default function TablaStockCompleto() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/contabilidad/stock/completo")
      .then(res => setData(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando stock...</p>;
  if (!data.length) return <p>No hay datos</p>;

  return (
    <table className="tabla-stock">
      <thead>
        <tr>
          <th>Código Base</th>
          <th>Código Producto</th>
          <th>Categoría</th>
          <th>Empresa</th>
          <th>Almacén</th>
          <th>Fabricante</th>
          <th>Stock</th>
          <th>Total Grupo</th>
        </tr>
      </thead>

      <tbody>
        {data.map(grupo =>
          grupo.productos.map((p, i) => (
            <tr key={`${grupo.codigo_base}-${p.producto_id}`}>
              <td>{i === 0 ? grupo.codigo_base || "-" : ""}</td>
              <td>{p.codigo_producto}</td>
              <td>{p.categoria}</td>
              <td>{p.empresa}</td>
              <td>{p.almacen}</td>
              <td>{p.fabricante}</td>
              <td>{p.stock}</td>

              {i === 0 && (
                <td rowSpan={grupo.productos.length} className="total-grupo">
                  {grupo.stock_total}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}