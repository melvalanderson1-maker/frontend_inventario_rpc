const { initDB } = require("../config/db");
let pool;
(async () => { pool = await initDB(); })();

module.exports = {

  listarDocentes: async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, nombre, apellido_paterno, apellido_materno, correo, telefono FROM usuarios WHERE rol='DOCENTE'"
      );
      res.json({ ok: true, docentes: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  listarSeccionesDocente: async (req, res) => {
    try {
      const docenteId = req.params.id;
      const [rows] = await pool.query(
        `SELECT s.id AS seccion_id, s.codigo AS seccion_codigo, s.periodo, s.modalidad, s.capacidad,
                c.id AS curso_id, c.titulo AS curso_titulo, c.codigo AS curso_codigo,
                (SELECT COUNT(*) FROM matriculas m WHERE m.seccion_id = s.id AND m.estado='ACTIVO') AS alumnos_count
         FROM secciones s
         JOIN cursos c ON s.curso_id = c.id
         WHERE s.docente_id = ?`,
        [docenteId]
      );
      res.json({ ok: true, secciones: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

listarSesionesDocente: async (req, res) => {
  try {
    const docenteId = req.params.id;
    const [rows] = await pool.query(
      `SELECT s.id AS sesion_id, s.seccion_id, s.titulo, s.inicia_en, s.termina_en
       FROM sesiones s
       JOIN secciones sec ON s.seccion_id = sec.id
       WHERE sec.docente_id = ?`,
      [docenteId]
    );
    res.json({ ok: true, sesiones: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: err.message });
  }
},


  listarAlumnosSesion: async (req, res) => {
    try {
      const sesionId = req.params.id;
      const [[sesion]] = await pool.query("SELECT seccion_id FROM sesiones WHERE id = ?", [sesionId]);
      if (!sesion) return res.status(404).json({ ok: false, msg: "Sesión no encontrada" });

      const [rows] = await pool.query(
        `SELECT u.id, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.numero_documento
         FROM matriculas m
         JOIN usuarios u ON m.usuario_id = u.id
         WHERE m.seccion_id = ? AND m.estado='ACTIVO'`,
        [sesion.seccion_id]
      );
      res.json({ ok: true, alumnos: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  registrarAsistencia: async (req, res) => {
    try {
      const sesionId = req.params.id;
      const { asistencias } = req.body;
      const docenteId = req.user?.id || null;

      if (!Array.isArray(asistencias)) return res.status(400).json({ ok: false, msg: "Formato inválido" });

      await pool.query("DELETE FROM asistencias WHERE sesion_id = ?", [sesionId]);

      const values = asistencias.map(a => [sesionId, a.usuario_id, a.estado, docenteId]);
      await pool.query(
        `INSERT INTO asistencias (sesion_id, usuario_id, estado, marcado_por) VALUES ?`,
        [values]
      );

      res.json({ ok: true, msg: "Asistencia registrada correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  // Listar sesiones de una sección específica
listarSesionesSeccion: async (req, res) => {
  try {
    const seccionId = req.params.id;

    const [rows] = await pool.query(
      `SELECT 
         s.id AS sesion_id, 
         s.titulo, 
         s.tipo_sesion, 
         s.aula, 
         s.enlace_meet,
         h.dia_semana, 
         h.hora_inicio, 
         h.hora_fin, 
         h.lugar,
         -- combinamos fecha de la sección + hora para FullCalendar
         CONCAT(sec.fecha_inicio, 'T', h.hora_inicio) AS inicia_en,
         CONCAT(sec.fecha_inicio, 'T', h.hora_fin) AS termina_en
       FROM sesiones s
       JOIN secciones sec ON s.seccion_id = sec.id
       LEFT JOIN horarios h ON h.seccion_id = sec.id
       WHERE s.seccion_id = ?
       ORDER BY h.dia_semana, h.hora_inicio ASC`,
      [seccionId]
    );

    res.json({ ok: true, sesiones: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: err.message });
  }
},


  registrarNotas: async (req, res) => {
    try {
      const seccionId = req.params.id;
      const { notas } = req.body;
      if (!Array.isArray(notas)) return res.status(400).json({ ok:false, msg:"Formato inválido" });

      const values = notas.map(n => [seccionId, n.usuario_id, n.actividad_id || null, n.nota]);
      await pool.query(
        "INSERT INTO notas (seccion_id, usuario_id, actividad_id, nota) VALUES ?",
        [values]
      );

      res.json({ ok:true, msg:"Notas registradas correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok:false, msg:err.message });
    }
  }
};
