import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import "./compras.css";


export default function MovimientosCompras() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    axios.get("/compras/productos")
      .then(res => setProductos(res.data || []))
      .catch(() => setProductos([]));
  }, []);

  return (
    <div className="compras-container">
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2>Productos</h2>

        <Link to="nuevo" className="btn-primary">
        ➕ Nuevo Producto
        </Link>



      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Categoría</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td>{p.codigo}</td>
              <td>{p.descripcion}</td>
              <td>{p.categoria_nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
