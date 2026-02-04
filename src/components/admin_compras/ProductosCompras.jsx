import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { resolveImageUrl } from "../../utils/imageUrl";
import { Link } from "react-router-dom";

import "./ProductosCompras.css";


// =========================
// 🧠 HELPERS DE BÚSQUEDA INTELIGENTE
// =========================
function normalizarTexto(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}





function extraerTokens(texto) {
  const limpio = normalizarTexto(texto);
  const tokens = limpio.split(" ");

  const palabras = tokens.filter(t => isNaN(t));
  const numeros = tokens
    .filter(t => !isNaN(t))
    .map(n => Number(n));

  return { palabras, numeros };
}


// 👉 MAPEO REAL DE TUS CATEGORÍAS (SEGÚN TU BD)
const aliasCategorias = {
  // 🧽 PAÑOS
  paño: [12],
  panos: [12],
  bayeta: [12],
  bayetas: [12],

  // 🧹 RECOGEDORES
  recogedor: [14],
  recogedores: [14],

  // 🗑️ TACHOS
  tacho: [15],
  tachos: [15],
  buzon: [15],
  buzones: [15],

  // 🛍️ BOLSAS
  bolsa: [23],
  bolsas: [23],

  // 🧻 PAPEL
  papel: [10, 11, 25],
  higienico: [10],
  toalla: [11],
  sabanilla: [25],

  // 🧼 ESPONJAS
  esponja: [7],
  esponjas: [7],
  fibra: [7],

  // 🧹 ESCOBAS
  escoba: [5],
  escobas: [5],

  // 🧽 TRAPEADORES
  trapeador: [9],
  mopa: [9],

  // 🚿 DISPENSADORES
  dispensador: [18],
  dispensadores: [18],

  // 🛁 TINAS
  batea: [16],
  tina: [16],
};



function detectarCategoriasDesdeTexto(palabras) {
  const categoriasDetectadas = new Set();

  palabras.forEach(p => {
    if (aliasCategorias[p]) {
      aliasCategorias[p].forEach(id => categoriasDetectadas.add(id));
    }
  });

  return Array.from(categoriasDetectadas);
}


function hayBusquedaPorCategoria(palabras) {
  return palabras.some(p => aliasCategorias[p]);
}



function hablar(texto) {
  if (!window.speechSynthesis) return;

  const msg = new SpeechSynthesisUtterance(texto);
  msg.lang = "es-PE";
  msg.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}



const coloresValidos = [
  "amarillo",
  "azul",
  "rojo",
  "verde",
  "negro",
  "blanco",
  "gris",
  "naranja",
  "celeste",
  "marron",
];


function detectarColoresDesdeTexto(palabras) {
  return palabras.filter(p => coloresValidos.includes(p));
}



function extraerMedidas(texto) {
  const limpio = normalizarTexto(texto);

  // detecta: 78x31 | 78 x 31 | 31.8 x 79
  const match = limpio.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/);

  if (!match) return [];

  return [
    Number(match[1]),
    Number(match[2])
  ];
}


function coincideMedida(valorBuscado, textoProducto) {
  const tolerancia = 1.5; // cm (más flexible)
  const regex = /\d+(?:\.\d+)?/g;
  const nums = textoProducto.match(regex)?.map(Number) || [];

  return nums.some(n => Math.abs(n - valorBuscado) <= tolerancia);
}


function extraerMedidasProducto(texto) {
  const medidas = [];

  const regex = /(ancho|largo|alto|altura|diametro)\s*[:\-]?\s*(\d+(?:\.\d+)?)/g;
  let match;

  while ((match = regex.exec(texto)) !== null) {
    medidas.push({
      tipo: match[1],
      valor: Number(match[2]),
    });
  }

  return medidas;
}


function scoreMedidasFlexible(medidasBuscadas, textoProducto) {
  const regex = /\d+(?:\.\d+)?/g;
  const numsProducto = textoProducto.match(regex)?.map(Number) || [];

  let score = 0;

  for (const buscada of medidasBuscadas) {
    const encontro = numsProducto.some(n => Math.abs(n - buscada) <= 1.5);
    if (!encontro) {
      return { score: 0, valido: false };
    }
    score += 150;
  }

  score += 200; // bonus match completo
  return { score, valido: true };
}





function coincideCodigo(p, textoBusqueda) {
  const busquedaNorm = normalizarTexto(textoBusqueda);

  // 1️⃣ Revisar el producto principal
  if (
    normalizarTexto(p.codigo || "") === busquedaNorm ||
    normalizarTexto(p.codigo_modelo || "") === busquedaNorm
  ) {
    return true;
  }

  // 2️⃣ Revisar variantes si existen
  if (p.es_catalogo === 1 && Array.isArray(p.variantes)) {
    return p.variantes.some(v => normalizarTexto(v.codigo_modelo || "") === busquedaNorm);
  }

  return false;
}




export default function ProductosCompras() {
  const [productos, setProductos] = useState([]);

  const [search, setSearch] = useState("");
  const [tipoProducto, setTipoProducto] = useState("todos");
  const [stock, setStock] = useState("todos");

  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState("todas");

  const [mensajeResultados, setMensajeResultados] = useState("");




    function activarVoz() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Tu navegador no soporta búsqueda por voz");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "es-PE";
  recognition.interimResults = false;

  recognition.start();

  recognition.onresult = event => {
    const texto = event.results[0][0].transcript;
    setSearch(texto);
  };

  recognition.onerror = e => {
    console.error("Error reconocimiento voz:", e);
  };
}


  useEffect(() => {
    api.get("/api/compras/categorias")
      .then(res => setCategorias(res.data.categorias || []))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    api.get("/api/compras/productos")
      .then(res => setProductos(res.data.productos || []))
      .catch(() => setProductos([]));
  }, []);


  const productosFiltrados = productos
    .map(p => {
      const sinBusqueda = !search.trim();

      // 👉 Si NO hay búsqueda, aplicar SOLO filtros clásicos
      if (sinBusqueda) {
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

        if (!coincideTipo || !coincideCategoria || !coincideStock) {
          return null;
        }

        return { ...p, score: 1 };
      }


      const textoBusqueda = normalizarTexto(search);

      // 🚀 FILTRO POR CÓDIGOS PADRE / HIJO
      if (coincideCodigo(p, search)) {
        return { ...p, score: 1000 }; // Score alto para que aparezca arriba
      }

      const { palabras, numeros } = extraerTokens(search);

      const medidasBuscadas = extraerMedidas(search);

      
      const coloresDetectados = detectarColoresDesdeTexto(palabras);

      

      const descripcion = normalizarTexto(
        `${p.descripcion || ""} ${p.marca || ""} ${p.modelo || ""}`
      );


      let score = 0;

      // TEXTO COMPLETO DEL PRODUCTO
      const textoProducto = normalizarTexto(
        `${p.descripcion || ""} ${p.marca || ""} ${p.modelo || ""}`
      );

      const categoriasDetectadas = detectarCategoriasDesdeTexto(palabras);


      const busquedaEsCategoria = hayBusquedaPorCategoria(palabras);

      // 🔥 FILTRO POR CATEGORÍA (SIN ANULAR MEDIDAS)
      if (busquedaEsCategoria) {
        if (!categoriasDetectadas.includes(Number(p.categoria_id))) {
          return null;
        }

        // solo suma score, NO retorna aún
        score += 300;
      }


      if (medidasBuscadas.length > 0) {
        const { score: scoreMedidas, valido } =
          scoreMedidasFlexible(medidasBuscadas, textoProducto);


        if (!valido) return null; // 🚫 FUERA SIN DISCUSIÓN

        score += scoreMedidas;
      }




     




      // 🚨 FILTRO DURO POR COLOR
      if (coloresDetectados.length > 0) {
        const tieneColor = coloresDetectados.some(color =>
          descripcion.includes(color)
        );

        if (!tieneColor) {
          return null;
        }
      }









      // 🔹 Palabras (orden no importa)
      palabras.forEach(palabra => {
        if (textoProducto.includes(palabra)) {
          score += 40;
        }
      });

      // 🔹 Marca pesa más
      if (p.marca) {
        const marcaNorm = normalizarTexto(p.marca);
        palabras.forEach(palabra => {
          if (marcaNorm.includes(palabra)) score += 80;
        });
      }

      // 🔹 Modelo
      if (p.modelo) {
        const modeloNorm = normalizarTexto(p.modelo);
        palabras.forEach(palabra => {
          if (modeloNorm.includes(palabra)) score += 60;
        });
      }

      // 🔹 NÚMEROS (44 coincide con 44.7)
      numeros.forEach(num => {
        const regex = new RegExp(num.toString());
        if (regex.test(textoProducto)) {
          score += 50;
        }
      });

      // 🔹 Colores (NO filtran, solo ordenan)

      coloresDetectados.forEach(color => {
        if (textoProducto.includes(color)) {
          score += 30;
        }
      });


    // 🔹 Filtros clásicos (los tuyos)
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

    if (!coincideTipo || !coincideCategoria || !coincideStock) {
      return null;
    }


    // 🚫 Si buscó categoría específica y este producto no coincide, descartar
    // 🚫 Solo mostrar si realmente coincide con algo buscado
    if (!search.trim()) return { ...p, score: 1 };

    return score >= 40 ? { ...p, score } : null;




  })
  .filter(Boolean)
  .sort((a, b) => b.score - a.score);


  useEffect(() => {
  if (!search.trim()) return;

  const total = productosFiltrados.length;
  const mensaje = `Se encontraron ${total} resultado${total !== 1 ? "s" : ""}`;

  setMensajeResultados(mensaje);
  hablar(mensaje);

  const timer = setTimeout(() => {
    setMensajeResultados("");
  }, 2500);

  return () => clearTimeout(timer);
}, [productosFiltrados, search]);







  return (
    <div className="productos-container">
      <div className="productos-header">
        <h2>Productos</h2>

        <Link to="nuevo" className="btn-nuevo">
          + Nuevo Producto
        </Link>
      </div>

      <div className="productos-filtros">
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            placeholder="Buscar por texto o voz…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
          />

          <button
            type="button"
            onClick={activarVoz}
            title="Buscar por voz"
            style={{
              padding: "0 12px",
              borderRadius: "6px",
              border: "none",
              background: "#0ea5e9",
              color: "white",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            🎤
          </button>
        </div>


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


      {mensajeResultados && (
        <div className="modal-resultados">
          {mensajeResultados}
        </div>
      )}

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
