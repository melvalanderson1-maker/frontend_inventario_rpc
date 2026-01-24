// src/components/common/MovementTable.jsx
import React from 'react';

const MovementTable = ({ movimientos }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Producto</th>
          <th>Almacén</th>
          <th>Cantidad</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {movimientos.map((mov) => (
          <tr key={mov.id}>
            <td>{mov.producto_codigo}</td>
            <td>{mov.producto_descripcion}</td>
            <td>{mov.almacen}</td>
            <td>{mov.cantidad}</td>
            <td>{mov.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MovementTable;
