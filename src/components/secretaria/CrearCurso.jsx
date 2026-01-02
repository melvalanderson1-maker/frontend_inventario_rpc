import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CrearCurso.css";
import DashboardHeader from "../layout/DashboardHeader";
import DashboardFooter from "../layout/DashboardFooter";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function EmptyMessage({ children }) {
  return <div className="mensaje info">{children}</div>;
}

export default function CrearCurso() {
  const [cursos, setCursos] = useState([]);
  const [searchCurso, setSearchCurso] = useState("");

  const [selectedCurso, setSelectedCurso] = useState(null);
  const [selectedSeccion, setSelectedSeccion] = useState(null);

  const [searchSeccion, setSearchSeccion] = useState("");
  const [searchMatriculado, setSearchMatriculado] = useState("");
  const [showCrearSeccion, setShowCrearSeccion] = useState(false);

  // Campos del modal de nueva sección
  const [secCodigo, setSecCodigo] = useState("");
  const [secPeriodo, setSecPeriodo] = useState("");
  const [secDocente, setSecDocente] = useState("");
  const [secCapacidad, setSecCapacidad] = useState("");
  const [secModalidad, setSecModalidad] = useState("PRESENCIAL");


  // Form fields
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");
  const [capacidad, setCapacidad] = useState("");

  // No iniciar con secciones vacías
  const [secciones, setSecciones] = useState(() => []);



  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  const [docentes, setDocentes] = useState([]);


  // ======================
  // CARGAR CURSOS
  // ======================

  const soloPositivos = (valor) => {
  // Elimina todo lo que no sea número
  const num = Number(valor);

  // Si no es número o es menor o igual a 0 → devolver vacío
  if (!valor || isNaN(num) || num <= 0) return "";

  return valor;
};



  const fetchCursos = async () => {
    try {
      const res = await axios.get(`${API_URL}/cursos`);
      setCursos(res.data || []);
    } catch (err) {
      console.error(err);
      setMensaje({ type: "error", text: "Error al obtener cursos." });
    }
  };


const fetchDocentes = async () => {
  const token = localStorage.getItem("access_token");

  try {
    const res = await axios.get(`${API_URL}/usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    console.log("USUARIOS OBTENIDOS:", res.data);

    // 🔥 Filtrar SOLO usuarios con rol DOCENTE
    const soloDocentes = (res.data || []).filter(u => u.rol === "DOCENTE");

    setDocentes(soloDocentes);
  } catch (err) {
    console.error(err);
  }
};




    useEffect(() => {
    fetchCursos();
    fetchDocentes();
  }, []);




  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setPrecio("");
    setDuracion("");
    setCapacidad("");
    // NO BORRAR SECCIONES AQUÍ
  };

const validar = () => {
  // VALIDAR PRECIO > 0
  if (Number(precio) <= 0 || isNaN(Number(precio))) {
    setMensaje({
      type: "warning",
      text: "El precio debe ser un número mayor que 0.",
    });
    return false;
  }

  // VALIDAR DURACIÓN > 0
  if (duracion && (Number(duracion) <= 0 || isNaN(Number(duracion)))) {
    setMensaje({
      type: "warning",
      text: "La duración debe ser un número mayor que 0.",
    });
    return false;
  }

  // CAMPOS OBLIGATORIOS
  if (!titulo.trim() || !descripcion.trim() || !precio) {
    setMensaje({
      type: "warning",
      text: "Completa los campos obligatorios (Título, Descripción, Precio).",
    });
    return false;
  }

  // --- VALIDACIÓN DE CÓDIGOS DUPLICADOS INTERNOS ---
  const codigos = secciones.map(s => s.codigo.trim());
  const repetidos = codigos.filter((c, i) => codigos.indexOf(c) !== i);

  if (repetidos.length > 0) {
    setMensaje({
      type: "warning",
      text: `Los códigos de sección no pueden repetirse: ${repetidos.join(", ")}`
    });
    return false;
  }

  // --- VALIDAR CAMPOS DE CADA SECCIÓN ---
  for (const s of secciones) {
    if (!s.codigo.trim()) {
      setMensaje({ type: "warning", text: "Cada sección debe tener un código." });
      return false;
    }
    if (!s.docente_id) {
      setMensaje({
        type: "warning",
        text: `Debes seleccionar un docente para la sección ${s.codigo}.`
      });
      return false;
    }
    if (Number(s.capacidad) <= 0) {
      setMensaje({
        type: "warning",
        text: `La capacidad de la sección ${s.codigo} debe ser mayor que 0.`,
      });
      return false;
    }

    const regexPeriodo = /^\d{4}-(00|10|20)$/;


    if (!regexPeriodo.test(s.periodo.trim())) {
      setMensaje({
        type: "warning",
        text: `El periodo de la sección ${s.codigo} solo puede ser YYYY-00, YYYY-10 o YYYY-20 (Ej: 2026-10).`,
      });
      return false;
    }


  }

  // --- VALIDACIÓN DE CÓDIGOS EXISTENTES EN BD (SOLO UNA VEZ) ---
  const codigosBD = cursos.flatMap(c => c.secciones?.map(sec => sec.codigo) || []);

  const codigosDuplicadosBD = codigos.filter(c => codigosBD.includes(c));

  if (codigosDuplicadosBD.length > 0) {
    setMensaje({
      type: "warning",
      text: `Estos códigos ya existen en otros cursos: ${codigosDuplicadosBD.join(", ")}`
    });
    return false;
  }

  return true;
};



  const crearCurso = async () => {
    if (!validar()) return;
    setLoading(true);
    setMensaje(null);


    // Validar título único
    const titulos = cursos.map(c => c.titulo.trim().toLowerCase());
    if (titulos.includes(titulo.trim().toLowerCase())) {
      setMensaje({ type: "warning", text: "El título del curso ya existe. Usa otro nombre." });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        titulo,
        descripcion,
        precio: parseFloat(precio),
        duracion_horas: duracion ? parseInt(duracion) : 0,
        capacidad: capacidad ? parseInt(capacidad) : 0,
        secciones: secciones.map((s) => ({
          codigo: s.codigo,
          periodo: s.periodo,
          docente_id: s.docente_id ? parseInt(s.docente_id) : null,
          capacidad: s.capacidad ? parseInt(s.capacidad) : null,
          modalidad: s.modalidad,
        })),
      };

      

      const res = await axios.post(`${API_URL}/cursos`, payload);
      setMensaje({ type: "success", text: "🎉 Curso creado correctamente." });

      resetForm();
      await fetchCursos();
      setSecciones([]);

      if (res.data?.id) {
        const detalle = await axios.get(`${API_URL}/cursos/${res.data.id}`);
        setSelectedCurso(detalle.data);
      }
    } catch (err) {
      console.error(err);
      setMensaje({
        type: "error",
        text: err?.response?.data?.message || "Error al crear curso.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // SELECCIONAR CURSO
  // ======================

  const seleccionarCurso = async (curso) => {
    setSelectedSeccion(null);
    setSearchMatriculado("");

    try {
      const res = await axios.get(`${API_URL}/cursos/${curso.id}`);
      setSelectedCurso(res.data);
    } catch (err) {
      console.error(err);
      setMensaje({ type: "error", text: "Error al obtener detalles del curso." });
    }
  };

  // ======================
  // SELECCIONAR SECCIÓN → FILTRAR
  // ======================
  const handleSelectSeccion = (sec) => {
    setSelectedSeccion(sec.id);
    setSearchMatriculado("");
  };

  const mostrarTodos = () => {
    setSelectedSeccion(null);
    setSearchMatriculado("");
  };

  const updateSeccion = (idx, field, value) => {
    setSecciones((s) =>
      s.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  };

const addSeccion = () => {
  if (!titulo.trim()) {
    setMensaje({ type: "warning", text: "Primero escribe el título del curso para generar códigos." });
    return;
  }

  const prefijo = generarPrefijo(titulo);
  const existentes = secciones.map(s => s.codigo);

  const codigoAuto = generarCodigoUnico(prefijo, existentes);

  setSecciones((prev) => [
    ...prev,
    {
      codigo: codigoAuto,
      periodo: "",
      docente_id: "",
      capacidad: "",
      modalidad: "PRESENCIAL"
    }
  ]);
};



  const removeSeccion = (idx) =>
    setSecciones((s) => s.filter((_, i) => i !== idx));

  // ======================
  // FILTROS
  // ======================

  const cursosFiltrados = cursos.filter(
    (c) =>
      c.titulo.toLowerCase().includes(searchCurso.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(searchCurso.toLowerCase())
  );

  const seccionesFiltradas =
    selectedCurso?.secciones?.filter(
      (s) =>
        s.codigo.toLowerCase().includes(searchSeccion.toLowerCase()) ||
        s.periodo.toLowerCase().includes(searchSeccion.toLowerCase()) ||
        s.modalidad.toLowerCase().includes(searchSeccion.toLowerCase())
    ) || [];

  const matriculadosFiltrados =
    selectedCurso?.matriculados
      ?.filter((m) =>
        selectedSeccion
          ? m.seccion_id === selectedSeccion
          : true
      )
      ?.filter(
        (m) =>
          m.usuario?.nombre
            ?.toLowerCase()
            .includes(searchMatriculado.toLowerCase()) ||
          m.usuario?.correo
            ?.toLowerCase()
            .includes(searchMatriculado.toLowerCase())
      ) || [];


const crearSeccion = async () => {
  if (!selectedCurso) {
    setMensaje({ type: "warning", text: "Selecciona un curso primero" });
    return;
  }

  try {
    const payload = {
      curso_id: selectedCurso.id,
      codigo: secCodigo,
      periodo: secPeriodo,
      docente_id: secDocente || null,
      capacidad: secCapacidad || null,
      modalidad: secModalidad
    };


    if (!secDocente) {
      setMensaje({
        type: "warning",
        text: "Debes seleccionar un docente para la sección."
      });
      return;
    }

    if (Number(secCapacidad) <= 0) {
      setMensaje({ type: "warning", text: "La capacidad debe ser mayor que 0." });
      return;
    }

    // Validar formato YYYY-MM
    const regexPeriodo = /^\d{4}-(0[1-9]|1[0-2])$/;

    if (!regexPeriodo.test(secPeriodo.trim())) {
      setMensaje({
        type: "warning",
        text: "El periodo solo puede ser YYYY-00, YYYY-10 o YYYY-20 (Ej: 2025-20).",
      });
      return;
    }




    const token = localStorage.getItem("access_token");
    if (!token) {
      setMensaje({ type: "error", text: "No estás autenticado." });
      return;
    }



    await axios.post(`${API_URL}/secciones`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });


    setMensaje({ type: "success", text: "Sección creada" });

    const res = await axios.get(`${API_URL}/cursos/${selectedCurso.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setSelectedCurso(res.data);
    setShowCrearSeccion(false);

    // limpiar inputs
    setSecCodigo("");
    setSecPeriodo("");
    setSecDocente("");
    setSecCapacidad("");
    setSecModalidad("PRESENCIAL");

  } catch (error) {
    console.error(error);
    setMensaje({ type: "error", text: "Error al crear sección" });
  }
};


// ======================
// GENERAR CÓDIGO AUTOMÁTICO
// ======================
const generarPrefijo = (texto) => {
  if (!texto) return "";
  // eliminar tildes y caracteres raros
  const limpio = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // obtener primera palabra del título
  const primera = limpio.split(" ")[0];
  // si es muy corta, usar las primeras 5 letras del curso completo
  const base = primera.length >= 5 ? primera : limpio.replace(/\s+/g, "");
  return base.substring(0, 5).toUpperCase();
};

const generarCodigoUnico = (prefijo, existentes) => {
  let contador = 1;
  let codigo = `${prefijo}-${String(contador).padStart(3, "0")}`;
  while (existentes.includes(codigo)) {
    contador++;
    codigo = `${prefijo}-${String(contador).padStart(3, "0")}`;
  }
  return codigo;
};


const permitirPeriodoValido = (valor) => {
  // Permite escribir progresivamente (para no bloquear al usuario)
  if (valor === "") return "";

  // Máximo 7 caracteres: YYYY-XX
  if (valor.length > 7) return valor.slice(0, 7);

  // Solo números y guion
  if (!/^[0-9-]*$/.test(valor)) return valor;

  // Formato final permitido
  const regexFinal = /^\d{4}-(00|10|20)$/;

  // Formato parcial permitido mientras escribe
  const regexParcial = /^\d{0,4}$|^\d{4}-?$|^\d{4}-(0|1|2)?$|^\d{4}-(00|10|20)?$/;

  if (!regexParcial.test(valor)) return "";

  return valor;
};


 return (
  <div className="page-wrapper">   {/* ← Contenedor principal */}

    {/* ================= HEADER ================ */}
    <DashboardHeader />

    {/* =============== CONTENIDO =============== */}
    <div className="panel-container">

      {/* ====================== LISTADO CURSOS ====================== */}
      <aside className="side-list">
        <div className="side-header">
          <h3>Cursos</h3>
          <button className="small-btn" onClick={fetchCursos}>
            Actualizar
          </button>
        </div>

        {/* BUSCADOR */}
        <input
          className="search-input"
          placeholder="Buscar curso..."
          value={searchCurso}
          onChange={(e) => setSearchCurso(e.target.value)}
        />

        {cursosFiltrados.length === 0 ? (
          <EmptyMessage>No hay cursos creados.</EmptyMessage>
        ) : (
          <ul className="curso-list">
            {cursosFiltrados.map((c) => (
              <li
                key={c.id}
                className={`curso-item ${
                  selectedCurso?.id === c.id ? "activo" : ""
                }`}
                onClick={() => seleccionarCurso(c)}
              >
                <div>
                  <div className="curso-title">{c.titulo}</div>
                  <div className="curso-meta">
                    <span>S/ {Number(c.precio).toFixed(2)}</span>
                    <span>{c.duracion_horas || 0} h</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* ====================== PANEL PRINCIPAL ====================== */}
      <main className="main-panel">
        {/* CREAR CURSO */}
        <section className="crear-curso-card">
          <h2>🟣 Crear curso</h2>

          <label>Título *</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />

          <label>Descripción *</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

          <div className="two-cols">
            <div>
              <label>Precio *</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>
            <div>
              <label>Duración (horas)</label>
              <input
                type="number"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
              />
            </div>
          </div>

          <label>Capacidad total</label>
          <input
            type="number"
            value={capacidad}
            min="1"
            onChange={(e) => setCapacidad(soloPositivos(e.target.value))}
          />

          {/* SECCIONES */}
          <div className="secciones-block">
            <div className="secciones-header">
              <strong>Secciones</strong>
              <button className="link-btn" onClick={addSeccion}>
                + Añadir sección
              </button>
            </div>

            {secciones.map((s, i) => (
              <div key={i} className="seccion-row">
                <input
                  placeholder="Código"
                  value={s.codigo}
                  readOnly
                  className="input-readonly"
                />

                <input
                  placeholder="Ej: 2026-00"
                  maxLength={7}
                  value={s.periodo}
                  onChange={(e) =>
                    updateSeccion(i, "periodo", permitirPeriodoValido(e.target.value))
                  }
                />



                <select
                  value={s.docente_id}
                  onChange={(e) => updateSeccion(i, "docente_id", e.target.value)}
                >
                  <option value="">Seleccionar docente</option>
                  {docentes.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.nombre} ({d.correo})
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Capacidad"
                  type="number"
                  min="1"
                  value={s.capacidad}
                  onChange={(e) =>
                    updateSeccion(i, "capacidad", soloPositivos(e.target.value))
                  }
                />

                <select
                  value={s.modalidad}
                  onChange={(e) => updateSeccion(i, "modalidad", e.target.value)}
                >
                  <option value="PRESENCIAL">PRESENCIAL</option>
                  <option value="VIRTUAL">VIRTUAL</option>
                  <option value="HIBRIDO">HIBRIDO</option>
                </select>

                <button className="danger small" onClick={() => removeSeccion(i)}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <button className="primary" onClick={crearCurso} disabled={loading}>
            {loading ? "Creando..." : "Crear curso"}
          </button>

          {mensaje && (
            <div className={`mensaje ${mensaje.type || ""}`}>
              {mensaje.text}
            </div>
          )}
        </section>

        {/* ====================== DETALLE CURSO ====================== */}
        <section className="detalle-curso-card">
          {!selectedCurso ? (
            <EmptyMessage>
              Selecciona un curso para ver detalles.
            </EmptyMessage>
          ) : (
            <>
              <h3>{selectedCurso.titulo}</h3>
              <p className="muted">{selectedCurso.descripcion}</p>
              <div className="meta">
                <span>Precio: S/ {Number(selectedCurso.precio).toFixed(2)}</span>
                <span>Duración: {selectedCurso.duracion_horas} h</span>
                <span>Capacidad: {selectedCurso.capacidad}</span>
              </div>

              {/* ==================== SECCIONES ==================== */}
              <h4>Secciones</h4>

              <button
                className="primary small-btn"
                onClick={() => {
                  const pref = generarPrefijo(selectedCurso.titulo);
                  const existentes = selectedCurso.secciones.map(s => s.codigo);
                  const nuevo = generarCodigoUnico(pref, existentes);

                  setSecCodigo(nuevo);
                  setShowCrearSeccion(true);
                }}
              >
                + Nueva sección
              </button>

              {showCrearSeccion && (
                <div className="modal-backdrop">
                  <div className="modal modal-seccion">
                    <h3 className="modal-title">Nueva sección</h3>

                    <div className="grid-seccion">
                      <div className="field">
                        <label>Código</label>
                        <input value={secCodigo} readOnly className="input-readonly" />
                      </div>

                      <div className="field">
                        <label>Periodo</label>
                        <input
                          value={secPeriodo}
                          onChange={(e) =>
                            setSecPeriodo(permitirPeriodoValido(e.target.value))
                          }
                        />

                      </div>

                      <div className="field field-full">
                        <label>Docente</label>
                        <select
                          value={secDocente}
                          onChange={(e) => setSecDocente(e.target.value)}
                        >
                          <option value="">Seleccionar docente</option>
                          {docentes.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.nombre} ({d.correo})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="field">
                        <label>Modalidad</label>
                        <select
                          value={secModalidad}
                          onChange={(e) => setSecModalidad(e.target.value)}
                        >
                          <option value="PRESENCIAL">PRESENCIAL</option>
                          <option value="VIRTUAL">VIRTUAL</option>
                          <option value="HIBRIDO">HIBRIDO</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Capacidad</label>
                        <input
                          type="number"
                          min="1"
                          value={secCapacidad}
                          onChange={(e) => setSecCapacidad(soloPositivos(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="modal-buttons">
                      <button className="btn-primary" onClick={crearSeccion}>Crear</button>
                      <button className="btn-secondary" onClick={() => setShowCrearSeccion(false)}>Cerrar</button>
                    </div>
                  </div>
                </div>
              )}

              <input
                className="search-input"
                placeholder="Buscar sección..."
                value={searchSeccion}
                onChange={(e) => setSearchSeccion(e.target.value)}
              />

              {seccionesFiltradas.length === 0 ? (
                <EmptyMessage>No hay secciones.</EmptyMessage>
              ) : (
                <ul className="secciones-list">
                  {seccionesFiltradas.map((sec) => (
                    <li
                      key={sec.id}
                      className={`seccion-item ${
                        selectedSeccion === sec.id ? "seccion-activa" : ""
                      }`}
                      onClick={() => handleSelectSeccion(sec)}
                    >
                      <strong>{sec.codigo}</strong> — {sec.periodo} — {sec.modalidad}
                      <div>Capacidad: {sec.capacidad || "-"}</div>
                      <div>Matriculados: {sec.matriculados_count}</div>
                    </li>
                  ))}
                </ul>
              )}

              {selectedSeccion && (
                <button className="small-btn" onClick={mostrarTodos}>
                  Mostrar todos los matriculados
                </button>
              )}

              <h4>Alumnos matriculados</h4>

              <input
                className="search-input"
                placeholder="Buscar alumno..."
                value={searchMatriculado}
                onChange={(e) => setSearchMatriculado(e.target.value)}
              />

              {matriculadosFiltrados.length === 0 ? (
                <EmptyMessage>No hay matriculados.</EmptyMessage>
              ) : (
                <table className="matriculados-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Estado</th>
                      <th>Nota</th>
                    </tr>
                  </thead>

                  <tbody>
                    {matriculadosFiltrados.map((m) => (
                      <tr key={m.id}>
                        <td>
                          {m.usuario?.nombre} {m.usuario?.apellido_paterno}
                        </td>

                        <td>{m.usuario?.correo}</td>

                        <td>{m.estado}</td>

                        <td>{m.nota !== null && m.nota !== undefined ? m.nota : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </section>
      </main>
    </div>

    {/* =============== FOOTER =============== */}
    <DashboardFooter />

  </div>
);

}
