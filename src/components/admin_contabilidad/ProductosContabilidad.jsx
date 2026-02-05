import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { resolveImageUrl } from "../../utils/imageUrl";
import { Link, useSearchParams } from "react-router-dom";


import { useRef } from "react";


import "./ProductosContabilidad.css";

/* =========================
   🧠 HELPERS BÚSQUEDA INTELIGENTE
========================= */
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

  return {
    palabras: tokens.filter(t => isNaN(t)),
    numeros: tokens.filter(t => !isNaN(t)).map(Number),
  };
}

/* 👉 alias categorías (MISMO MAPEO QUE COMPRAS) */
const aliasCategorias = {
  paño: [12], panos: [12], bayeta: [12], bayetas: [12],
  recogedor: [14], recogedores: [14],
  tacho: [15], tachos: [15], buzon: [15], buzones: [15],
  bolsa: [23], bolsas: [23],
  papel: [10, 11, 25], higienico: [10], toall: [11], sabanilla: [25],
  esponja: [7], esponjas: [7], fibra: [7],
  escoba: [5], escobas: [5],
  trapeador: [9], mopa: [9],
  toalla: [26], 
  dispensador: [18], dispensadores: [18],
  batea: [16], tina: [16],
};

function detectarCategoriasDesdeTexto(palabras) {
  const set = new Set();
  palabras.forEach(p => aliasCategorias[p]?.forEach(id => set.add(id)));
  return [...set];
}

function hayBusquedaPorCategoria(palabras) {
  return palabras.some(p => aliasCategorias[p]);
}

function hablar(texto) {
  if (!window.speechSynthesis) return;
  const msg = new SpeechSynthesisUtterance(texto);
  msg.lang = "es-PE";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}

const coloresValidos = [
  "amarillo","azul","rojo","verde","negro",
  "blanco","gris","naranja","celeste","marron",
];

function detectarColoresDesdeTexto(palabras) {
  return palabras.filter(p => coloresValidos.includes(p));
}

function extraerMedidas(texto) {
  const limpio = normalizarTexto(texto);
  const match = limpio.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/);
  return match ? [Number(match[1]), Number(match[2])] : [];
}

function scoreMedidasFlexible(medidas, texto) {
  const nums = texto.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  let score = 0;

  for (const m of medidas) {
    if (!nums.some(n => Math.abs(n - m) <= 1.5)) {
      return { valido: false, score: 0 };
    }
    score += 150;
  }

  return { valido: true, score: score + 200 };
}

function coincideCodigo(p, texto) {
  const b = normalizarTexto(texto);

  if (
    normalizarTexto(p.codigo || "") === b ||
    normalizarTexto(p.codigo_modelo || "") === b
  ) return true;

  if (p.es_catalogo === 1 && Array.isArray(p.variantes)) {
    return p.variantes.some(v =>
      normalizarTexto(v.codigo_modelo || "") === b
    );
  }

  return false;
}

/* =========================
   COMPONENTE
========================= */
export default function ProductosContabilidad() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [tipoProducto, setTipoProducto] = useState(searchParams.get("tipo") || "todos");
  const [stock, setStock] = useState(searchParams.get("stock") || "todos");
  const [categoria, setCategoria] = useState(searchParams.get("categoria") || "todas");

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mensajeResultados, setMensajeResultados] = useState("");




  const ultimoTotalHablado = useRef(null);


  /* 🎤 VOZ */
  function activarVoz() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tu navegador no soporta voz");

    const r = new SpeechRecognition();
    r.lang = "es-PE";
    r.start();

    r.onresult = e => {
      const texto = e.results[0][0].transcript;
      setSearch(texto);
      setSearchParams({ search: texto, tipo: tipoProducto, stock, categoria });
    };
  }

  /* APIs CONTABILIDAD */
  useEffect(() => {
    api.get("/api/contabilidad/categorias")
      .then(r => setCategorias(r.data.categorias || []))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    api.get("/api/contabilidad/productos")
      .then(r => setProductos(r.data.productos || []))
      .catch(() => setProductos([]));
  }, []);

  /* 🔍 FILTRADO INTELIGENTE */
  const productosFiltrados = productos
    .map(p => {
      if (!search.trim()) {
        const okTipo =
          tipoProducto === "todos" ||
          (tipoProducto === "simples" && p.es_catalogo === 0) ||
          (tipoProducto === "variantes" && p.es_catalogo === 1);

        const okCat =
          categoria === "todas" || Number(p.categoria_id) === Number(categoria);

        const okStock =
          stock === "todos" ||
          (stock === "con" && p.stock_total > 0) ||
          (stock === "sin" && p.stock_total <= 0);

        return okTipo && okCat && okStock ? { ...p, score: 1 } : null;
      }

      if (coincideCodigo(p, search)) return { ...p, score: 1000 };

      const { palabras, numeros } = extraerTokens(search);
      const medidas = extraerMedidas(search);
      const colores = detectarColoresDesdeTexto(palabras);
      const textoProducto = normalizarTexto(
        `${p.descripcion || ""} ${p.marca || ""} ${p.modelo || ""}`
      );

      let score = 0;

      if (hayBusquedaPorCategoria(palabras)) {
        if (!detectarCategoriasDesdeTexto(palabras).includes(Number(p.categoria_id))) {
          return null;
        }
        score += 300;
      }

      if (medidas.length) {
        const r = scoreMedidasFlexible(medidas, textoProducto);
        if (!r.valido) return null;
        score += r.score;
      }

      if (colores.length && !colores.some(c => textoProducto.includes(c))) {
        return null;
      }

      palabras.forEach(w => textoProducto.includes(w) && (score += 40));
      numeros.forEach(n => textoProducto.includes(n.toString()) && (score += 50));

      const okTipo =
        tipoProducto === "todos" ||
        (tipoProducto === "simples" && p.es_catalogo === 0) ||
        (tipoProducto === "variantes" && p.es_catalogo === 1);

      const okCat =
        categoria === "todas" || Number(p.categoria_id) === Number(categoria);

      const okStock =
        stock === "todos" ||
        (stock === "con" && p.stock_total > 0) ||
        (stock === "sin" && p.stock_total <= 0);

      if (!okTipo || !okCat || !okStock) return null;

      return score >= 40 ? { ...p, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  useEffect(() => {
    // 🛑 Si el buscador está vacío → borrar mensaje y callar
    if (!search.trim()) {
      setMensajeResultados("");
      ultimoTotalHablado.current = null;

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const handler = setTimeout(() => {
      const total = productosFiltrados.length;

      // 🔁 Evitar repetir el mismo mensaje
      if (ultimoTotalHablado.current === total) return;
      ultimoTotalHablado.current = total;

      const mensaje = `Se encontraron ${total} resultado${total !== 1 ? "s" : ""}`;
      setMensajeResultados(mensaje);
      hablar(mensaje);
    }, 600);

    return () => clearTimeout(handler);
  }, [productosFiltrados.length, search]);



  /* ========================= UI ========================= */
  return (
    <div className="productos-contabilidad-container">
      <div className="productos-header">
        <h2>Productos Contabilidad</h2>
        <Link to="nuevo" className="btn-nuevo">+ Nuevo Producto</Link>
      </div>

      <div className="productos-filtros">

      
       

      {/* 🔍 BUSCADOR */}
      <div className="filtro-busqueda">
        <span className="icono-buscar">🔍</span>

        <input
          type="text"
          placeholder="Buscar por texto o voz…"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setSearchParams({
              search: e.target.value,
              tipo: tipoProducto,
              stock: stock,
              categoria: categoria,
            });
          }}
          className="input-busqueda"
        />

        <button
          type="button"
          onClick={activarVoz}
          title="Buscar por voz"
          className="btn-voz"
        >
          🎤
        </button>
      </div>




        {/* SELECT tipoProducto */}
        <select
          value={tipoProducto}
          onChange={e => {
            setTipoProducto(e.target.value);
            setSearchParams({
              search: search,
              tipo: e.target.value,
              stock: stock,
              categoria: categoria,
            });
          }}
          className="select"
        >
          <option value="todos">Todos</option>
          <option value="simples">Solo simples</option>
          <option value="variantes">Con variantes</option>
        </select>

        {/* SELECT categoría */}
        <select
          value={categoria}
          onChange={e => {
            setCategoria(e.target.value);
            setSearchParams({
              search: search,
              tipo: tipoProducto,
              stock: stock,
              categoria: e.target.value,
            });
          }}
          className="select"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        {/* SELECT stock */}
        <select
          value={stock}
          onChange={e => {
            setStock(e.target.value);
            setSearchParams({
              search: search,
              tipo: tipoProducto,
              stock: e.target.value,
              categoria: categoria,
            });
          }}
          className="select"
        >
          <option value="todos">Stock (todos)</option>
          <option value="con">Con stock</option>
          <option value="sin">Sin stock</option>
        </select>

        
      </div>
      

      {mensajeResultados && <div className="modal-resultados">{mensajeResultados}</div>}

      <div className="productos-grid">
        {productosFiltrados.map(p => (
          <div key={p.id} className="producto-card">
            {p.es_catalogo === 1 && <div className="badge-variantes">Con variantes</div>}

            <div className="producto-imagen">
              {p.imagen ? <img src={resolveImageUrl(p.imagen)} /> : <span>Sin imagen</span>}
            </div>

            <div className="producto-codigo">{p.codigo_modelo || p.codigo}</div>
            <div className="producto-descripcion">{p.descripcion}</div>
            <div className="producto-stock-total">Stock: <strong>{p.stock_total}</strong></div>

          <Link
            to={`/contabilidad/producto/${p.id}?search=${search}&tipo=${tipoProducto}&stock=${stock}&categoria=${categoria}`}
            className="producto-link"
          >
            Ver detalle →
          </Link>

          </div>
        ))}
      </div>
    </div>
  );
}
