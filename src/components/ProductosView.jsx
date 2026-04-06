import React, { useEffect, useState } from 'react';
import './ProductosView.css';

const ProductosView = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cantidad, setCantidad] = useState(10);
  const [pagina, setPagina] = useState(1);
  const [formulario, setFormulario] = useState({ cod_dig: '', producto: '', laboratorio: '', stock_actual: '', stock_minimo: '' });
  const [modoEditar, setModoEditar] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [modalEliminar, setModalEliminar] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://hackathon-production-8277.up.railway.app'
    : 'http://localhost:5000';


  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos  = () => {
    fetch(`${API_URL}/api/productos`)
      .then(res => res.json())
      .then(data => setProductos(data));
  };

  const handleNuevo = () => {
    setFormulario({ cod_dig: '', producto: '', laboratorio: '', stock_actual: '', stock_minimo: '' });
    setModoEditar(false);
    setMostrarModal(true);
  };

  const handleEditar = (prod) => {
    setFormulario({ ...prod });
    setModoEditar(true);
    setMostrarModal(true);
  };

  const handleEliminar = (cod_dig) => {
    setProductoAEliminar(cod_dig);
    setModalEliminar(true);
  };

  const confirmarEliminar = () => {
    fetch(`${API_URL}/api/productos/${productoAEliminar}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          cargarProductos();
          mostrarMensaje('Producto eliminado con éxito', 'exito');
        } else {
          mostrarMensaje('No se pudo eliminar el producto', 'error');
        }
      });
    setModalEliminar(false);
    setProductoAEliminar(null);
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { cod_dig, producto, laboratorio, stock_actual, stock_minimo } = formulario;
    if (!cod_dig || !producto || !laboratorio || isNaN(stock_actual) || isNaN(stock_minimo)) {
      return alert('Por favor completa todos los campos correctamente');
    }
    const metodo = modoEditar ? 'PUT' : 'POST';
    const url = modoEditar
      ? `${API_URL}/api/productos/${formulario.cod_dig}`
      : `${API_URL}/api/productos`;

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cod_dig, producto, laboratorio, stock_actual, stock_minimo })
    }).then((res) => {
      if (res.ok) {
        cargarProductos();
        mostrarMensaje(modoEditar ? 'Producto actualizado con éxito' : 'Producto agregado con éxito', 'exito');
        setFormulario({ cod_dig: '', producto: '', laboratorio: '', stock_actual: '', stock_minimo: '' });
        setModoEditar(false);
        setMostrarModal(false);
      } else {
        mostrarMensaje('Error al guardar el producto', 'error');
      }
    });
  };

  const filtrados = productos.filter(p =>
    p.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cod_dig.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(filtrados.length / cantidad);
  const inicio = (pagina - 1) * cantidad;
  const visibles = filtrados.slice(inicio, inicio + cantidad);

  const renderNumerosPagina = () => {
    const paginas = [];
    const maxPaginas = 5;
    let start = Math.max(1, pagina - 2);
    let end = Math.min(totalPaginas, pagina + 2);

    if (pagina <= 3) end = Math.min(5, totalPaginas);
    if (pagina >= totalPaginas - 2) start = Math.max(1, totalPaginas - 4);

    for (let i = start; i <= end; i++) {
      paginas.push(
        <button key={i} onClick={() => setPagina(i)} className={pagina === i ? 'activo' : ''}>
          {i}
        </button>
      );
    }

    return (
      <>
        {start > 1 && <span>...</span>}
        {paginas}
        {end < totalPaginas && <span>...</span>}
        {mensaje.texto && <div className={`mensaje-popup ${mensaje.tipo}`}>{mensaje.texto}</div>}
      </>
    );
  };

  return (
    <div className="contenedor">
      <button className="btn-nuevo" onClick={handleNuevo}>+ Nuevo Producto</button>

      <div className="barra-superior">
        <div className="busqueda-selector">
          <input
            type="text"
            placeholder="Buscar producto o código"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="buscador"
          />
          <select value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="paginacion">
          <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
          {renderNumerosPagina()}
          <button disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
        </div>

        <p className="resumen">Mostrando {visibles.length} de {filtrados.length} productos</p>
      </div>

      <div className="grid-productos">
        {visibles.map((prod) => (
          <div key={prod.cod_dig} className="card-producto">
            <h3>{prod.producto}</h3>
            <p><strong>Código:</strong> {prod.cod_dig}</p>
            <p><strong>Laboratorio:</strong> {prod.laboratorio}</p>
            <p><strong>Stock Actual:</strong> {prod.stock_actual}</p>
            <p><strong>Stock Mínimo:</strong> {prod.stock_minimo}</p>
            <div className="acciones">
              <button onClick={() => handleEditar(prod)}>✏️</button>
              <button onClick={() => handleEliminar(prod.cod_dig)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {modalEliminar && (
        <div className="modal">
          <div className="modal-contenido">
            <h2>Confirmar Eliminación</h2>
            <p>¿Estás seguro de eliminar este producto?</p>
            <div className="modal-acciones">
              <button onClick={confirmarEliminar}>Sí, eliminar</button>
              <button className="btn-cancelar" onClick={() => setModalEliminar(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarModal && (
        <div className="modal">
          <div className="modal-contenido">
            <h2>{modoEditar ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Código" value={formulario.cod_dig} onChange={e => setFormulario({ ...formulario, cod_dig: e.target.value })} required />
              <input type="text" placeholder="Producto" value={formulario.producto} onChange={e => setFormulario({ ...formulario, producto: e.target.value })} required />
              <input type="text" placeholder="Laboratorio" value={formulario.laboratorio} onChange={e => setFormulario({ ...formulario, laboratorio: e.target.value })} required />
              <input type="number" placeholder="Stock Actual" value={formulario.stock_actual} onChange={e => setFormulario({ ...formulario, stock_actual: e.target.value })} required />
              <input type="number" placeholder="Stock Mínimo" value={formulario.stock_minimo} onChange={e => setFormulario({ ...formulario, stock_minimo: e.target.value })} required />
              <div className="modal-acciones">
                <button type="submit">{modoEditar ? 'Actualizar' : 'Agregar'} Producto</button>
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosView;
