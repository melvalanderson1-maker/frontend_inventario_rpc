// src/components/common/ProductCard.jsx
import React from 'react';

const ProductCard = ({ producto }) => {
  return (
    <div className="product-card">
      <img src={producto.imagen} alt={producto.descripcion} />
      <h3>{producto.descripcion}</h3>
      <p>Código: {producto.codigo}</p>
      <p>Stock: {producto.stock}</p>
    </div>
  );
};

export default ProductCard;
