  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import api from "../../api/api";
  import { resolveImageUrl } from "../../utils/imageUrl";

  import { Link, useSearchParams } from "react-router-dom";

  import EditAndDelete from "./productos/EditAndDelete";
  import DeleteProducto from "./productos/DeleteProducto";
  import PaginationComponent from "./pagination/PaginationComponent";



  import "./ProductosCompras.css";
  import { useRef } from "react";




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
    toall: [11],
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

      // 🧽 TRAPEADORES
    toalla: [26],
    

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

  // Cancelar cualquier síntesis previa
  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance(texto);

  // Configuración de voz
  msg.lang = "es-PE";        // Español peruano
  msg.rate = 0.95;   // ligeramente más lenta → fácil de entender
  msg.pitch = 1.2;   // tono un poco más agudo → sensación amigable           // Ligera entonación más clara
  msg.volume = 1;             // Volumen máximo

  // Seleccionar voz más “profesional” si está disponible
  const voces = window.speechSynthesis.getVoices();
  const vozPreferida = voces.find(v => 
    v.lang.includes("es") && v.name.toLowerCase().includes("female")
  ) || voces[0]; // fallback a la primera voz disponible
  if (vozPreferida) msg.voice = vozPreferida;

  // Hablar
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

    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [tipoProducto, setTipoProducto] = useState(searchParams.get("tipo") || "todos");
    const [stock, setStock] = useState(searchParams.get("stock") || "todos");
    const [categoria, setCategoria] = useState(searchParams.get("categoria") || "todas");
    const [productos, setProductos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get("limit") || "20"));
    const [totalProductos, setTotalProductos] = useState(0);
    const [loading, setLoading] = useState(false);

    const [productoEditar, setProductoEditar] = useState(null);




    const [categorias, setCategorias] = useState([]);
    
    const navigate = useNavigate();

    const [mensajeResultados, setMensajeResultados] = useState("");


    const ultimoTotalHablado = useRef(null);

    const [productoEliminar, setProductoEliminar] = useState(null);





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

      // Actualizar searchParams para que quede guardado en la URL
      setSearchParams({
        search: texto,
        tipo: tipoProducto,
        stock: stock,
        categoria: categoria,
      });
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

    // 🚀 CARGAR PRODUCTOS CON PAGINACIÓN Y FILTROS - API CALL EXPERTO
    useEffect(() => {
      setLoading(true);
      
      // Construir parámetros de query dinámicamente
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      
      if (search.trim()) params.append('search', search);
      if (tipoProducto !== 'todos') params.append('tipo', tipoProducto);
      if (categoria !== 'todas') params.append('categoria', categoria);
      if (stock !== 'todos') params.append('stock', stock);
      
      // GET DINÁMICO: Trae solo los productos de esta página con estos filtros
  // ✅ Traer todos los productos (o un gran límite)
      api.get(`/api/compras/productos?limit=1000`) 
        .then(res => {
          setProductos(res.data.productos || []);
          setTotalProductos(res.data.productos?.length || 0);
        });

        
    }, [currentPage, itemsPerPage, search, tipoProducto, categoria, stock]);


    // ⚠️ YA NO NECESITAMOS CALCULAR FILTRADOS AQUÍ
    // Los productos ya vienen filtrados y paginados del backend
  const productosFiltrados = productos
    .map(p => {
      // ================= FILTROS ESTRUCTURALES SIEMPRE ACTIVOS =================
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

      const sinBusqueda = !search.trim();

      if (sinBusqueda) {
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
      const textoProducto = descripcion;
      const categoriasDetectadas = detectarCategoriasDesdeTexto(palabras);
      const busquedaEsCategoria = hayBusquedaPorCategoria(palabras);

      if (busquedaEsCategoria) {
        if (!categoriasDetectadas.includes(Number(p.categoria_id))) {
          return null;
        }
        score += 300;
      }

      if (medidasBuscadas.length > 0) {
        const { score: scoreMedidas, valido } = scoreMedidasFlexible(medidasBuscadas, textoProducto);
        if (!valido) return null;
        score += scoreMedidas;
      }

      // 🚨 FILTRO DURO POR COLOR
      if (coloresDetectados.length > 0) {
        const textoParaColor = normalizarTexto(
          `${p.descripcion || ""} ${p.marca || ""} ${p.modelo || ""} ${p.color || ""}`
        );

        const tieneColor = coloresDetectados.some(color =>
          textoParaColor.includes(color)
        );

        if (!tieneColor) {
          return null; // descartar producto si no coincide ningún color
        }
      }

      // Palabras
      palabras.forEach(palabra => {
        if (textoProducto.includes(palabra)) score += 40;
      });

      // Marca
      if (p.marca) {
        const marcaNorm = normalizarTexto(p.marca);
        palabras.forEach(palabra => {
          if (marcaNorm.includes(palabra)) score += 80;
        });
      }

      // Modelo
      if (p.modelo) {
        const modeloNorm = normalizarTexto(p.modelo);
        palabras.forEach(palabra => {
          if (modeloNorm.includes(palabra)) score += 60;
        });
      }

      // Números
      numeros.forEach(num => {
        const regex = new RegExp(num.toString());
        if (regex.test(textoProducto)) score += 50;
      });

      // Colores
      coloresDetectados.forEach(color => {
        if (textoProducto.includes(color)) score += 30;
      });

      return score >= 40 ? { ...p, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);


  useEffect(() => {
    if (!search.trim()) {
      setMensajeResultados("");
      ultimoTotalHablado.current = null;
      window.speechSynthesis.cancel();
      return;
    }

    const handler = setTimeout(() => {
      const total = productosFiltrados.length;

      if (ultimoTotalHablado.current === total) return;
      ultimoTotalHablado.current = total;

      const mensaje =
        total === 1
          ? "Se encontró un resultado"
          : `Se encontraron ${total} resultados`;

      setMensajeResultados(mensaje);
      hablar(mensaje);

      // Ocultar mensaje automáticamente
      const timeoutOcultar = setTimeout(() => {
        setMensajeResultados("");
      }, 2000);

      return () => clearTimeout(timeoutOcultar);
    }, 600);

    return () => clearTimeout(handler);
  }, [productosFiltrados.length, search]);

    const productosPaginados = productosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  // 🔹 Función para limpiar filtros y búsqueda
  function limpiarFiltros() {
    setSearch("");
    setTipoProducto("todos");
    setCategoria("todas");
    setStock("todos");
    setCurrentPage(1);

    // Limpiar también en la URL
    setSearchParams({
      search: "",
      tipo: "todos",
      stock: "todos",
      categoria: "todas",
    });
  }












    return (
      <div className="productos-container">
        <div className="productos-header">
          <h2>Productos</h2>


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
              setCurrentPage(1); // Reset a página 1 cuando cambia la búsqueda
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
              setCurrentPage(1); // Reset a página 1 cuando cambia el filtro
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
              setCurrentPage(1); // Reset a página 1 cuando cambia el filtro
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
              setCurrentPage(1); // Reset a página 1 cuando cambia el filtro
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
          <div className="modal-resultados">
            {mensajeResultados}
          </div>
        )}

        {/* 📌 PAGINACIÓN SUPERIOR STICKY */}
        <PaginationComponent
          currentPage={currentPage}
          totalPages={Math.ceil(productosFiltrados.length / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          totalItems={productosFiltrados.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newLimit) => {
            setItemsPerPage(newLimit);
            setCurrentPage(1); // MUY IMPORTANTE resetear página
          }}
          position="top"
          isSticky={true}
        />
        <div className="productos-grid">
          {productosFiltrados
            .slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )
            .map(p => {
            const detailUrl = `../producto/${p.id}?search=${encodeURIComponent(search)}&tipo=${tipoProducto}&stock=${stock}&categoria=${categoria}`;
            return (
              <div
                key={p.id}
                className="producto-card"
                tabIndex={0}
                onClick={() => navigate(detailUrl)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(detailUrl); }}
              >

            <div className="acciones-card">
              <button
                onClick={(e) => { e.stopPropagation(); setProductoEditar(p); }}
                aria-label={`Ver/Editar ${p.codigo}`}
                title="Ver detalles"
              >
                {/* Eye SVG (no emoji) */}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

            </div>


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

              <Link
                to={`../producto/${p.id}?search=${search}&tipo=${tipoProducto}&stock=${stock}&categoria=${categoria}`}
                className="producto-link"
                onClick={(e) => e.stopPropagation()}
              >
                Ver detalle →
              </Link>


              </div>
            );
          })}
        </div>

        <EditAndDelete
          producto={productoEditar}
          categorias={categorias}
          abierto={!!productoEditar}
          onCerrar={() => setProductoEditar(null)}
          onActualizado={() => {
            api.get("/api/compras/productos")
              .then(res => setProductos(res.data.productos || []));
          }}
        />

        <DeleteProducto
          producto={productoEliminar}
          abierto={!!productoEliminar}
          onCerrar={() => setProductoEliminar(null)}
          onEliminado={() => {
            api.get("/api/compras/productos")
              .then(res => setProductos(res.data.productos || []));
          }}
        />

      </div>
    );
  }
