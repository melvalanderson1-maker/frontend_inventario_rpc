import React, { useEffect, useState } from "react";
import api from "../../../api/api";
import { resolveImageUrl } from "../../../utils/imageUrl";
import { Link, useSearchParams } from "react-router-dom";

import "./ProductosLogistica.css";

/* ======================================================
   🧠 HELPERS DE BÚSQUEDA
====================================================== */
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

/* 👉 Alias categorías */
const aliasCategorias = {
  paño: [12], panos: [12], bayeta: [12], bayetas: [12],
  recogedor: [14], recogedores: [14],
  tacho: [15], tachos: [15], buzon: [15], buzones: [15],
  bolsa: [23], bolsas: [23],
  papel: [10, 11, 25], higienico: [10], toalla: [11], sabanilla: [25],
  esponja: [7], esponjas: [7], fibra: [7],
  escoba: [5], escobas: [5],
  trapeador: [9], mopa: [9],
  toalla: [26], toallas: [26],
  dispensador: [18], dispensadores: [18],
  batea: [16], tina: [16],
};

function detectarCategoriasDesdeTexto(palabras) {
  const set = new Set();
  palabras.forEach(p => aliasCategorias[p]?.forEach(id => set.add(id)));
  return Array.from(set);
}

function hayBusquedaPorCategoria(palabras) {
  return palabras.some(p => aliasCategorias[p]);
}

/* ================= VOZ ================= */
function hablar(texto) {
  if (!window.speechSynthesis) return;
  const msg = new SpeechSynthesisUtterance(texto);
  msg.lang = "es-PE";
  msg.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}

const coloresValidos = [
  "amarillo","azul","rojo","verde","negro",
  "blanco","gris","naranja","celeste","marron"
];

function detectarColoresDesdeTexto(palabras) {
  return palabras.filter(p => coloresValidos.includes(p));
}

function extraerMedidas(texto) {
  const m = normalizarTexto(texto).match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/);
  return m ? [Number(m[1]), Number(m[2])] : [];
}

function scoreMedidasFlexible(medidasBuscadas, textoProducto) {
  const nums = textoProducto.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  let score = 0;
  for (const buscada of medidasBuscadas) {
    const ok = nums.some(n => Math.abs(n - buscada) <= 1.5);
    if (!ok) return { score: 0, valido: false };
    score += 150;
  }
  score += 200;
  return { score, valido: true };
}

function coincideCodigo(p, textoBusqueda) {
  const busq = normalizarTexto(textoBusqueda);
  if (
    normalizarTexto(p.codigo || "") === busq ||
    normalizarTexto(p.codigo_modelo || "") === busq
  ) return true;

  return (
    p.es_catalogo === 1 &&
    Array.isArray(p.variantes) &&
    p.variantes.some(v => normalizarTexto(v.codigo_modelo || "") === busq)
  );
}

/* ======================================================
   📦 COMPONENTE
====================================================== */
export default function ProductosLogistica() {

  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [tipoProducto, setTipoProducto] = useState(searchParams.get("tipo") || "todos");
  const [stock, setStock] = useState(searchParams.get("stock") || "todos");
  const [categoria, setCategoria] = useState(searchParams.get("categoria") || "todas");

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mensajeResultados, setMensajeResultados] = useState("");

  /* ================= VOZ ================= */
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

    recognition.onresult = e => {
      const texto = e.results[0][0].transcript;
      setSearch(texto);
      setSearchParams({ search: texto, tipo: tipoProducto, stock, categoria });
    };
  }

  /* ================= CARGA DATOS ================= */
  useEffect(() => {
    api.get("/api/logistica/categorias")
      .then(r => setCategorias(r.data.categorias || []))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    api.get("/api/logistica/productos")
      .then(r => setProductos(r.data.productos || []))
      .catch(() => setProductos([]));
  }, []);

  /* ================= FILTRO ================= */
  const productosFiltrados = productos
    .map(p => {
      const sinBusqueda = !search.trim();

      if (sinBusqueda) {
        const okTipo =
          tipoProducto === "todos" ||
          (tipoProducto === "simples" && p.es_catalogo === 0) ||
          (tipoProducto === "variantes" && p.es_catalogo === 1);

        const okCat =
          categoria === "todas" ||
          Number(p.categoria_id) === Number(categoria);

        const okStock =
          stock === "todos" ||
          (stock === "con" && p.stock_total > 0) ||
          (stock === "sin" && p.stock_total <= 0);

        return okTipo && okCat && okStock ? { ...p, score: 1 } : null;
      }

      if (coincideCodigo(p, search)) return { ...p, score: 1000 };

      const { palabras, numeros } = extraerTokens(search);
      const textoProducto = normalizarTexto(`${p.descripcion} ${p.marca} ${p.modelo}`);
      let score = 0;

      if (hayBusquedaPorCategoria(palabras)) {
        const cats = detectarCategoriasDesdeTexto(palabras);
        if (!cats.includes(Number(p.categoria_id))) return null;
        score += 300;
      }

      const medidas = extraerMedidas(search);
      if (medidas.length) {
        const r = scoreMedidasFlexible(medidas, textoProducto);
        if (!r.valido) return null;
        score += r.score;
      }

      detectarColoresDesdeTexto(palabras).forEach(c => {
        if (!textoProducto.includes(c)) return null;
      });

      palabras.forEach(pal => textoProducto.includes(pal) && (score += 40));
      numeros.forEach(n => textoProducto.includes(n.toString()) && (score += 50));

      return score >= 40 ? { ...p, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  /* ================= HABLAR RESULTADOS ================= */
  useEffect(() => {
    if (!search.trim()) return;
    const total = productosFiltrados.length;
    const msg = `Se encontraron ${total} resultado${total !== 1 ? "s" : ""}`;
    setMensajeResultados(msg);
    hablar(msg);
    const t = setTimeout(() => setMensajeResultados(""), 2500);
    return () => clearTimeout(t);
  }, [productosFiltrados, search]);

  /* ================= RENDER ================= */
  return (
    <div className="productos-container">
      <div className="productos-header">
        <h2>Productos</h2>
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
  

      {mensajeResultados && (
        <div className="modal-resultados">{mensajeResultados}</div>
      )}

      <div className="productos-grid">
        {productosFiltrados.map(p => (
          <div key={p.id} className="producto-card">
            {p.es_catalogo === 1 && <div className="badge-variantes">Con variantes</div>}
            <div className="producto-imagen">
              {p.imagen ? <img src={resolveImageUrl(p.imagen)} /> : <span>Sin imagen</span>}
            </div>
            <div className="producto-codigo">{p.codigo_modelo || p.codigo}</div>
            <div className="producto-descripcion">{p.descripcion}</div>
            <div className="producto-stock-total">
              Stock total: <strong>{p.stock_total}</strong>
            </div>
            <Link
              to={`../producto/${p.id}?search=${search}&tipo=${tipoProducto}&stock=${stock}&categoria=${categoria}`}
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
