  import React, { useEffect, useMemo, useState } from "react";
  import api from "../../../api/api";
  import "./TablaStockCompleto.css";


  import * as XLSX from "xlsx-js-style";
  import { saveAs } from "file-saver";
  import { BrushCleaning, FileSpreadsheet, Download } from "lucide-react";

  export default function TablaStockCompleto() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("");
    const [empresaFiltro, setEmpresaFiltro] = useState("");
    const [almacenFiltro, setAlmacenFiltro] = useState("");
    const [fabricanteFiltro, setFabricanteFiltro] = useState("");


    const [seleccionados, setSeleccionados] = useState({});
    const [formatoExport, setFormatoExport] = useState("xlsx");



    useEffect(() => {
      api.get("/api/logistica/stock/completo")
        .then(res => setData(res.data || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, []);

    /* ================= LIMPIADORES ================= */

    const limpiarTodo = () => {
      setSearch("");
      setCategoriaFiltro("");
      setEmpresaFiltro("");
      setAlmacenFiltro("");
      setFabricanteFiltro("");
    };


    const toggleSeleccion = (id) => {
      setSeleccionados(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    };

    const seleccionarTodoVisible = (checked) => {
      if (!checked) {
        // 🔥 si desmarcan → limpiar todo
        setSeleccionados({});
        return;
      }

      // 🔥 si marcan → seleccionar todos visibles
      const nuevos = {};
      filtrado.forEach(p => {
        const key = `${p.codigo_producto}-${p.empresa}-${p.almacen}`;
        nuevos[key] = true;
      });

      setSeleccionados(nuevos);
    };

    const limpiarSeleccion = () => {
      setSeleccionados({});
    };

    const prepararDataExport = (tipo) => {
      let grupos = [];

      if (tipo === "todo") {
        grupos = data;
      }

      if (tipo === "filtrados") {
        grupos = reagrupado;
      }

      if (tipo === "seleccionados") {
        const seleccionadosFiltrados = filtrado.filter(p => {
          const key = `${p.codigo_producto}-${p.empresa}-${p.almacen}`;
          return seleccionados[key];
        });

        // reagrupamos solo los seleccionados
        const map = {};

        seleccionadosFiltrados.forEach(p => {
          const key = p.codigo_base || p.codigo_producto;

          if (!map[key]) {
            map[key] = {
              codigo_base: p.codigo_base,
              stock_total: 0,
              productos: []
            };
          }

          map[key].productos.push(p);
          map[key].stock_total += Number(p.stock || 0);
        });

        grupos = Object.values(map);
      }

      // 🔥 AQUÍ armamos las filas exactamente como la tabla
      const filas = [];

      grupos.forEach(grupo => {
        grupo.productos.forEach((p, i) => {
          filas.push({
            "Código Base": i === 0 ? grupo.codigo_base || "-" : "",
            "Código Producto": p.codigo_producto,
            "Categoría": p.categoria,
            "Empresa": p.empresa,
            "Almacén": p.almacen,
            "Fabricante": p.fabricante,
            "Stock": p.stock,
            "Total Grupo": i === 0 ? grupo.stock_total : ""
          });
        });
      });

      return filas;
    };


    const exportar = (tipo) => {
      const datos = prepararDataExport(tipo);

      if (!datos.length) {
        alert("No hay datos para exportar");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(datos);

      // 🔥 AQUI VA EL ANCHO
      ws["!cols"] = [
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 14 },
        { wch: 18 },
        { wch: 10 },
        { wch: 12 }
      ];


      const rangeHeader = XLSX.utils.decode_range(ws["!ref"]);

      for (let C = rangeHeader.s.c; C <= rangeHeader.e.c; ++C) {

        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });

        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          fill: { fgColor: { rgb: "0C2557" } },
          font: {
            color: { rgb: "FFFFFF" },
            bold: true
          },
          alignment: {
            horizontal: "center",
            vertical: "center"
          }
        };
      }


      

      let filaActual = 1; // 0 es header

      reagrupado.forEach((grupo, groupIndex) => {

        const color = groupIndex % 2 === 0 ? "FFFFFF" : "EAF1FF";

        grupo.productos.forEach(() => {

          const range = XLSX.utils.decode_range(ws["!ref"]);

          for (let C = range.s.c; C <= range.e.c; ++C) {

            const cellAddress = XLSX.utils.encode_cell({ r: filaActual, c: C });

            if (!ws[cellAddress]) continue;

            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              fill: {
                fgColor: { rgb: color }
              }
            };
          }

          filaActual++;
        });

      });


      /* ===== CENTRAR TODO EL CONTENIDO ===== */

      const rangeFinal = XLSX.utils.decode_range(ws["!ref"]);

      for (let R = rangeFinal.s.r; R <= rangeFinal.e.r; ++R) {
        for (let C = rangeFinal.s.c; C <= rangeFinal.e.c; ++C) {

          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

          if (!ws[cellAddress]) continue;

          ws[cellAddress].s = {
            ...ws[cellAddress].s,
            alignment: {
              horizontal: "center",
              vertical: "center"
            }
          };
        }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stock");

      if (formatoExport === "xlsx") {
        XLSX.writeFile(wb, "stock.xlsx");
      }

      if (formatoExport === "csv") {
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "stock.csv");
      }
    };

    /* ================= FLATTEN ================= */

    const flatProductos = useMemo(() => {
      return data.flatMap(grupo =>
        grupo.productos.map(p => ({
          ...p,
          codigo_base: grupo.codigo_base
        }))
      );
    }, [data]);

    /* ================= OPCIONES ==stock=============== */

    const generarOpciones = (campo) => {
      const map = {};
      flatProductos.forEach(p => {
        if (!p[campo]) return;
        map[p[campo]] = (map[p[campo]] || 0) + 1;
      });
      return map;
    };

    const categorias = useMemo(() => generarOpciones("categoria"), [flatProductos]);
    const empresas = useMemo(() => generarOpciones("empresa"), [flatProductos]);
    const almacenes = useMemo(() => generarOpciones("almacen"), [flatProductos]);
    const fabricantes = useMemo(() => generarOpciones("fabricante"), [flatProductos]);

    /* ================= FILTRO ================= */

    const filtrado = useMemo(() => {
      const texto = search.trim().toLowerCase();

      return flatProductos.filter(p => {

        const coincideBusqueda =
          !texto ||
          p.codigo_producto?.toLowerCase().includes(texto) ||
          p.codigo_base?.toLowerCase().includes(texto);

        return (
          coincideBusqueda &&
          (!categoriaFiltro || p.categoria === categoriaFiltro) &&
          (!empresaFiltro || p.empresa === empresaFiltro) &&
          (!almacenFiltro || p.almacen === almacenFiltro) &&
          (!fabricanteFiltro || p.fabricante === fabricanteFiltro)
        );
      });

    }, [
      flatProductos,
      search,
      categoriaFiltro,
      empresaFiltro,
      almacenFiltro,
      fabricanteFiltro
    ]);

    /* ================= REAGRUPAR ================= */

    const reagrupado = useMemo(() => {

      const filtrosActivos =
        search.trim() ||
        categoriaFiltro ||
        empresaFiltro ||
        almacenFiltro ||
        fabricanteFiltro;

      if (!filtrosActivos) return data;

      const map = {};

      filtrado.forEach(p => {
        const key = p.codigo_base || p.codigo_producto;

        if (!map[key]) {
          map[key] = {
            codigo_base: p.codigo_base,
            stock_total: 0,
            productos: []
          };
        }

        map[key].productos.push(p);
        map[key].stock_total += Number(p.stock || 0);
      });

      return Object.values(map);

    }, [
      data,
      filtrado,
      search,
      categoriaFiltro,
      empresaFiltro,
      almacenFiltro,
      fabricanteFiltro
    ]);

    if (loading) return <p>Cargando stock...</p>;
    if (!data.length) return <p>No hay datos</p>;



    const columnas = [
      "40px",
      "110px",
      "160px",
      "140px",
      "140px",
      "100px",
      "150px",
      "90px",
      "70px"
    ];

    return (
      <div className="tabla-container">

        {/* ===== HEADER SUPERIOR ===== */}
        <div className="tabla-header">

          <div className="tabla-titulo">
            📦 Gestión de Stock Completo
          </div>

          <div className="header-actions">

            <select
              className="export-select-pro"
              value={formatoExport}
              onChange={(e) => setFormatoExport(e.target.value)}
            >
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV</option>
            </select>

            <button
              className="btn-export-pro btn-excel"
              onClick={() => exportar("todo")}
            >
              <FileSpreadsheet size={16} />
              Todo
            </button>

            <button
              className="btn-export-pro btn-outline-pro"
              onClick={() => exportar("filtrados")}
            >
              <Download size={16} />
              Filtrados
            </button>

            <button
              className="btn-export-pro btn-outline-pro"
              onClick={() => exportar("seleccionados")}
            >
              <Download size={16} />
              Seleccionados
            </button>

            <button
              className="btn-limpiar-global"
              onClick={limpiarTodo}
            >
              <BrushCleaning size={16} />
              Limpiar
            </button>

          </div>

        </div>

        {/* ===== FILTROS ===== */}

        <div className="filtros-grid">

          <div className="filtro-item">
            <input
              type="text"
              placeholder="Buscar código..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="btn-clear"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="filtro-item">
            <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
              <option value="">Todas las categorías</option>
              {Object.entries(categorias).map(([k, v]) => (
                <option key={k} value={k}>{k} ({v})</option>
              ))}
            </select>
            {categoriaFiltro && <button onClick={() => setCategoriaFiltro("")}>✕</button>}
          </div>

          <div className="filtro-item">
            <select value={empresaFiltro} onChange={e => setEmpresaFiltro(e.target.value)}>
              <option value="">Todas las empresas</option>
              {Object.entries(empresas).map(([k, v]) => (
                <option key={k} value={k}>{k} ({v})</option>
              ))}
            </select>
            {empresaFiltro && <button onClick={() => setEmpresaFiltro("")}>✕</button>}
          </div>

          <div className="filtro-item">
            <select value={almacenFiltro} onChange={e => setAlmacenFiltro(e.target.value)}>
              <option value="">Todos los almacenes</option>
              {Object.entries(almacenes).map(([k, v]) => (
                <option key={k} value={k}>{k} ({v})</option>
              ))}
            </select>
            {almacenFiltro && <button onClick={() => setAlmacenFiltro("")}>✕</button>}
          </div>

          <div className="filtro-item">
            <select value={fabricanteFiltro} onChange={e => setFabricanteFiltro(e.target.value)}>
              <option value="">Todos los fabricantes</option>
              {Object.entries(fabricantes).map(([k, v]) => (
                <option key={k} value={k}>{k} ({v})</option>
              ))}
            </select>
            {fabricanteFiltro && <button onClick={() => setFabricanteFiltro("")}>✕</button>}
          </div>

        </div>



        <div className="resultados">
          Resultados encontrados: <strong>{filtrado.length}</strong>
        </div>

        {/* ===== TABLA ===== */}

        <table className="tabla-stock">

          {/* 🔥 CONTROL TOTAL DE ANCHO */}
          <colgroup>
            {columnas.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    filtrado.length > 0 &&
                    filtrado.every(p =>
                      seleccionados[`${p.codigo_producto}-${p.empresa}-${p.almacen}`]
                    )
                  }
                  onChange={(e) => seleccionarTodoVisible(e.target.checked)}
                />
              </th>
              <th>CÓDIGO BASE</th>
              <th>CÓDIGO PRODUCTO</th>
              <th>CATEGORÍA</th>
              <th>EMPRESA</th>
              <th>ALMACÉN</th>
              <th>FABRICANTE</th>
              <th>STOCK</th>
              <th>TOTAL GRUPO</th>
            </tr>
          </thead>

          <tbody>
            {reagrupado.map((grupo, groupIndex) =>
              grupo.productos.map((p, i) => (
                <tr
                  key={`${grupo.codigo_base || "sinbase"}-${p.codigo_producto}-${p.empresa}-${p.almacen}-${i}`}
                  className={groupIndex % 2 === 0 ? "grupo-par" : "grupo-impar"}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={
                        seleccionados[`${p.codigo_producto}-${p.empresa}-${p.almacen}`] || false
                      }
                      onChange={() =>
                        toggleSeleccion(`${p.codigo_producto}-${p.empresa}-${p.almacen}`)
                      }
                    />
                  </td>
                  <td>{i === 0 ? grupo.codigo_base || "-" : ""}</td>
                  <td>{p.codigo_producto}</td>
                  <td>{p.categoria}</td>
                  <td>{p.empresa}</td>
                  <td>{p.almacen}</td>
                  <td>{p.fabricante}</td>
                  <td className="col-stock">{p.stock}</td>
                  {i === 0 && (
                    <td
                      rowSpan={grupo.productos.length}
                      className="total-grupo col-total"
                    >
                      {grupo.stock_total}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    );
  }