import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./CrearProducto.css";
import "./SelectOrInput.css";// 🔹 Esto es necesario para que los colores funcionen

import SelectOrInput from "./SelectOrInput";



export default function CrearProducto() {
  const navigate = useNavigate();

  const [tipoProducto, setTipoProducto] = useState("simple");
  const [categorias, setCategorias] = useState([]);
  const [atributos, setAtributos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [crearMovimiento, setCrearMovimiento] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState("saldo_inicial");

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);



  const [codigoExiste, setCodigoExiste] = useState(false);
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);
  const [mostrarModalCodigo, setMostrarModalCodigo] = useState(false);


  const [codigosVariantesError, setCodigosVariantesError] = useState({});
  const [verificandoVariante, setVerificandoVariante] = useState({});
  const [mostrarModalVariante, setMostrarModalVariante] = useState(false);
  const [codigoVarianteDuplicado, setCodigoVarianteDuplicado] = useState("");



  /* PRODUCTO BASE */
  const [producto, setProducto] = useState({
    codigo: "",
    descripcion: "",
    categoria_id: "",
    modelo_id: "",
    modelo_nuevo: "",
    marca_id: "",
    marca_nuevo: "",
    imagen: null
  });


  /* ATRIBUTOS SIMPLE */
  const [atributosValores, setAtributosValores] = useState({});

  /* VARIANTES */
  const [variantes, setVariantes] = useState([]);
  const [varianteActiva, setVarianteActiva] = useState(0);

  const atributosCompletos =
    atributos.length === 0 ||
    atributos.every(a => atributosValores[a.id]?.trim() !== "");

  const productoSimpleValido =
    producto.codigo.trim() !== "" &&
    producto.categoria_id !== "" &&
    (
      producto.descripcion.trim() !== "" ||
      atributosCompletos
    );

  /* =========================
     CARGAS INICIALES
  ==========================*/
  useEffect(() => {
    api.get("/api/categorias")
      .then(res => setCategorias(res.data || []))
      .catch(() => setCategorias([]));

    api.get("/api/compras/modelos")
      .then(res => setModelos(res.data || []))
      .catch(() => setModelos([]));

    api.get("/api/compras/marcas")
      .then(res => setMarcas(res.data || []))
      .catch(() => setMarcas([]));
  }, []);

  useEffect(() => {
    if (!producto.categoria_id) {
      setAtributos([]);
      setAtributosValores({});
      return;
    }

    api.get(`/api/atributos?categoria=${producto.categoria_id}`)
      .then(res => {
        setAtributos(res.data || []);
        setAtributosValores({});
      })
      .catch(() => setAtributos([]));
  }, [producto.categoria_id]);

  /* =========================
     HANDLERS
  ==========================*/
  const onChangeProducto = e => {
    const { name, value } = e.target;
    setProducto(prev => ({ ...prev, [name]: value }));
  };


  const onChangeImagenProducto = e => {
    setProducto(prev => ({ ...prev, imagen: e.target.files[0] }));
  };

  const onChangeAtributo = (id, value) => {
    setAtributosValores(prev => ({ ...prev, [id]: value }));
  };

  const agregarVariante = () => {
    setVariantes(prev => {
      const baseAtributos =
        prev.length > 0 ? { ...prev[0].atributos } : {};

      return [
        ...prev,
        {
          codigo_modelo: producto.codigo || "",
          atributos: baseAtributos,
          imagen: null
        }
      ];
    });

    setVarianteActiva(variantes.length);
  };

  const eliminarVariante = index => {
    setVariantes(prev => {
      const copia = [...prev];
      copia.splice(index, 1);
      return copia;
    });

    setVarianteActiva(prev => {
      if (index === prev) return Math.max(0, prev - 1);
      if (index < prev) return prev - 1;
      return prev;
    });
  };

  const onChangeVariante = (campo, valor) => {
    const copia = [...variantes];
    copia[varianteActiva][campo] = valor;
    setVariantes(copia);
  };

  const onChangeVarianteAtributo = (atributoId, valor) => {
    const copia = [...variantes];
    copia[varianteActiva].atributos[atributoId] = valor;
    setVariantes(copia);
  };

  const varianteCompleta = (v, index) => {
    if (!v.codigo_modelo) return false;
    if (v.codigo_modelo === producto.codigo) return false;

    if (index === 0) {
      for (let a of atributos) {
        if (!v.atributos[a.id]?.trim()) return false;
      }
    }
    return true;
  };

  const todasLasVariantesCompletas =
    tipoProducto === "simple"
      ? productoSimpleValido
      : variantes.length > 0 &&
        variantes.every((v, i) => varianteCompleta(v, i));

  const cambiarTipo = tipo => {
    setTipoProducto(tipo);
    setVariantes([]);
    setAtributosValores({});
    setProducto({
      codigo: "",
      descripcion: "",
      categoria_id: "",
      modelo: "",
      marca: "",
      imagen: null
    });
  };


  const verificarCodigoEnBD = async (codigo) => {
    if (!codigo || !codigo.trim()) {
      setCodigoExiste(false);
      return;
    }

    try {
      setVerificandoCodigo(true);
      const res = await api.get(`/api/compras/productos/existe-codigo/${codigo.trim()}`);

      if (res.data.existe) {
        setCodigoExiste(true);
        setMostrarModalCodigo(true);
      } else {
        setCodigoExiste(false);
      }
    } catch (err) {
      console.error("❌ Error verificando código:", err);
    } finally {
      setVerificandoCodigo(false);
    }
  };


  const verificarCodigoVarianteEnBD = async (codigo, index) => {
    if (!codigo || !codigo.trim()) return;

    try {
      setVerificandoVariante(prev => ({ ...prev, [index]: true }));

      const res = await api.get(`/api/compras/productos/existe-codigo-variante/${codigo.trim()}`);

      if (res.data.existe) {
        setCodigosVariantesError(prev => ({ ...prev, [index]: true }));
        setCodigoVarianteDuplicado(codigo.trim());
        setMostrarModalVariante(true);
      } else {
        setCodigosVariantesError(prev => ({ ...prev, [index]: false }));
      }
    } catch (err) {
      console.error("❌ Error verificando código variante:", err);
    } finally {
      setVerificandoVariante(prev => ({ ...prev, [index]: false }));
    }
  };



  /* =========================
     GUARDAR REAL
  ==========================*/
  const guardarReal = async () => {

    if (
      codigoExiste ||
      Object.values(codigosVariantesError).some(v => v === true) ||
      codigoProductoChocaConVariantesLocales(producto.codigo)
    ) {
      alert("El código del producto no puede ser igual al de ninguna variante");
      return;
    }


    if (codigoExiste) {
      return;
    }

    if (!producto.descripcion || !producto.categoria_id) {
      return alert("Complete los campos obligatorios");
    }

    if (tipoProducto === "simple" && !producto.codigo) {
      return alert("El código es obligatorio");
    }

    if (tipoProducto === "variantes" && variantes.length === 0) {
      return alert("Debe agregar al menos una variante");
    }

    if (tipoProducto === "variantes") {
      const codigos = variantes.map(v => v.codigo_modelo);
      const duplicados = codigos.some((c, i) => codigos.indexOf(c) !== i);
      if (duplicados) return alert("Existen códigos de variantes repetidos");

      for (let v of variantes) {
        if (v.codigo_modelo === producto.codigo) {
          return alert("Cada variante debe tener un código distinto al código base");
        }
      }
    }

    const formData = new FormData();
    formData.append("tipo", tipoProducto);
    formData.append("producto", JSON.stringify(producto));
    formData.append("atributos", JSON.stringify(atributosValores));
    formData.append("variantes", JSON.stringify(variantes));

    if (producto.imagen) {
      formData.append("imagen_producto", producto.imagen);
    }

    variantes.forEach((v, i) => {
      if (v.imagen) {
        formData.append(`imagen_variante_${i}`, v.imagen);
      }
    });

    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const res = await api.post("/api/compras/productos", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (crearMovimiento) {
        navigate(`/compras/movimiento/${tipoMovimiento}/${res.data.productoId}`);
      } else {
        navigate("/compras/productos");
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GUARDAR CON CONFIRMACIÓN
  ==========================*/
  const guardar = () => {
    if (crearMovimiento) {
      setMostrarConfirmacion(true);
    } else {
      guardarReal();
    }
  };

  const confirmarGuardar = () => {
    setMostrarConfirmacion(false);
    guardarReal();
  };

  const codigoVarianteRepetido = (codigo, indexActual) => {
    return variantes.some(
      (v, i) => i !== indexActual && v.codigo_modelo === codigo
    );
  };

  const codigoProductoChocaConVariantesLocales = codigo => {
    return variantes.some(v => v.codigo_modelo === codigo);
  };


  /* =========================
     RENDER
  ==========================*/
  return (
    <div className="erp-form">
      <header className="erp-header">
        <h2>Registro de Producto</h2>
        <button onClick={() => navigate(-1)}>← Volver</button>
      </header>

      <section className="card">
        <label>Tipo de producto</label>
        <select value={tipoProducto} onChange={e => cambiarTipo(e.target.value)}>
          <option value="simple">Producto simple</option>
          <option value="variantes">Producto con variantes</option>
        </select>
      </section>

      <section className="card">
          <input
            name="codigo"
            placeholder={
              tipoProducto === "simple"
                ? "Código del producto"
                : "Código base del producto"
            }
            value={producto.codigo}
            onChange={e => {
              const valor = e.target.value;
              onChangeProducto(e);

              if (valor.trim().length >= 3) {
                verificarCodigoEnBD(valor.trim());
              } else {
                setCodigoExiste(false);
              }
            }}
            onBlur={e => verificarCodigoEnBD(e.target.value.trim())}
            className={
              codigoExiste ||
              codigoProductoChocaConVariantesLocales(producto.codigo)
                ? "input-error"
                : ""
            }
          />

          {codigoProductoChocaConVariantesLocales(producto.codigo) && (
            <div className="error">
              ❌ Este código coincide con una variante del mismo producto
            </div>
          )}



          {verificandoCodigo && (
            <div className="hint">🔎 Verificando código...</div>
          )}


        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={producto.descripcion}
          onChange={onChangeProducto}
        />

        {/* ================= MODELO Y MARCA ================= */}
        <div className="two-cols">
          <SelectOrInput
            label="Modelo"
            nameId="modelo_id"
            nameNuevo="modelo_nuevo"
            options={modelos}
            value={producto.modelo_id}
            valueNuevo={producto.modelo_nuevo}
            onChange={onChangeProducto}
          />

          <SelectOrInput
            label="Marca"
            nameId="marca_id"
            nameNuevo="marca_nuevo"
            options={marcas}
            value={producto.marca_id}
            valueNuevo={producto.marca_nuevo}
            onChange={onChangeProducto}
          />
        </div>
        {/* ================================================== */}



        <select
          name="categoria_id"
          value={producto.categoria_id}
          onChange={onChangeProducto}
        >
          <option value="">Seleccione categoría</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <label>Imagen del producto</label>
        <input type="file" accept="image/*" onChange={onChangeImagenProducto} />
      </section>

      {/* VARIANTES */}
      {tipoProducto === "variantes" && (
        <section className="card">
          <div className="tabs">
            {variantes.map((v, i) => (
              <div key={i} className="tab-wrapper">
                <button
                  className={`tab ${
                    varianteActiva === i ? "activa" : ""
                  } ${varianteCompleta(v, i) ? "completa" : "incompleta"}`}
                  onClick={() => setVarianteActiva(i)}
                >
                  Variante {i + 1}
                </button>

                <button
                  className="tab-remove"
                  title="Eliminar variante"
                  onClick={e => {
                    e.stopPropagation();
                    eliminarVariante(i);
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              className="tab add"
              onClick={agregarVariante}
              disabled={!productoSimpleValido}
              title={
                !productoSimpleValido
                  ? "Complete código y categoría, y descripción o atributos"
                  : ""
              }
            >
              +
            </button>
          </div>

          {variantes[varianteActiva] && (
            <div className="variante-panel">
              <label className="label-campo">Código de la variante</label>

              <input
                value={variantes[varianteActiva].codigo_modelo}
                onChange={e => {
                  const valor = e.target.value;
                  onChangeVariante("codigo_modelo", valor);

                  if (valor.trim().length >= 3) {
                    verificarCodigoVarianteEnBD(valor.trim(), varianteActiva);
                  } else {
                    setCodigosVariantesError(prev => ({ ...prev, [varianteActiva]: false }));
                  }
                }}
                onBlur={e =>
                  verificarCodigoVarianteEnBD(
                    e.target.value.trim(),
                    varianteActiva
                  )
                }
                className={codigosVariantesError[varianteActiva] ? "input-error" : ""}
              />


              {verificandoVariante[varianteActiva] && (

                <div className="hint">🔎 Verificando código…</div>
              )}


              {variantes[varianteActiva].codigo_modelo === producto.codigo && (
                <div className="error">
                  ⚠ Debe agregar algo más para diferenciar esta variante
                </div>
              )}

              {codigoVarianteRepetido(
                variantes[varianteActiva].codigo_modelo,
                varianteActiva
              ) && (
                <div className="error">
                  ❌ Este código de variante ya existe
                </div>
              )}

              <div className="hint">
                Ejemplo: <b>{producto.codigo}-ROJO</b>, <b>{producto.codigo}-M</b>
              </div>

              <div className="atributos-grid">
                {atributos.map(a => (
                  <div className="campo-atributo" key={a.id}>
                    <label className="label-campo">{a.nombre}</label>
                    <input
                      value={variantes[varianteActiva].atributos[a.id] || ""}
                      onChange={e =>
                        onChangeVarianteAtributo(a.id, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              <input
                key={`imagen-${varianteActiva}`}
                type="file"
                accept="image/*"
                onChange={e =>
                  onChangeVariante("imagen", e.target.files[0])
                }
              />

              {variantes[varianteActiva].imagen && (
                <div className="imagen-nombre">
                  📷 {variantes[varianteActiva].imagen.name}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ATRIBUTOS PRODUCTO SIMPLE */}
      {tipoProducto === "simple" && atributos.length > 0 && (
        <section className="card">
          <h4>Atributos del producto</h4>
          <div className="atributos-grid">
            {atributos.map(a => (
              <div className="campo-atributo" key={a.id}>
                <label className="label-campo">{a.nombre}</label>
                <input
                  key={a.id}
                  placeholder={a.nombre}
                  value={atributosValores[a.id] || ""}
                  onChange={e => onChangeAtributo(a.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h4>Movimiento inicial</h4>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={crearMovimiento}
            onChange={e => setCrearMovimiento(e.target.checked)}
          />
          ¿Desea crear un movimiento ahora?
        </label>

        {crearMovimiento && (
          <div className="mov-tipo-row">
            <label>Tipo de movimiento</label>
            <select
              value={tipoMovimiento}
              onChange={e => setTipoMovimiento(e.target.value)}
            >
              <option value="saldo_inicial">Saldo inicial</option>
              <option value="entrada">Entrada</option>
            </select>
          </div>
        )}
      </section>

      <footer className="acciones">
        <button onClick={() => navigate(-1)}>Cancelar</button>
          <button
            onClick={guardar}
            disabled={
              loading ||
              !todasLasVariantesCompletas ||
              codigoExiste ||
              Object.values(codigosVariantesError).some(v => v === true)
            }
          >

          {loading ? "Guardando..." : "Guardar producto"}
        </button>
      </footer>

      {/* ================= MODAL DE CONFIRMACIÓN ================= */}
      {mostrarConfirmacion && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Confirmar acción</h3>
            <p>
              ¿Seguro que desea crear el producto y realizar el movimiento{" "}
              <b>{tipoMovimiento.replace("_", " ")}</b>?
            </p>
            <div className="modal-actions">
              <button onClick={() => setMostrarConfirmacion(false)}>
                Cancelar
              </button>
              <button className="confirmar" onClick={confirmarGuardar}>
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalCodigo && (
        <div className="modal-backdrop">
          <div className="modal-card warning">
            <h3>⚠ Código no disponible</h3>
            <p>
              El código <b>{producto.codigo}</b> ya existe como producto o variante.
              <br />
              Debe usar un código totalmente diferente.
            </p>
            <div className="modal-actions">
              <button
                className="confirmar"
                onClick={() => setMostrarModalCodigo(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}


    {mostrarModalVariante && (
        <div className="modal-backdrop">
          <div className="modal-card warning">
            <h3>⚠ Código de variante duplicado</h3>
            <p>
              El código <b>{codigoVarianteDuplicado}</b> ya existe en el sistema.
              <br />
              Por favor ingrese uno diferente.
            </p>
            <div className="modal-actions">
              <button
                className="confirmar"
                onClick={() => setMostrarModalVariante(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
