// backend/controllers/admin.controller.js
const { initDB } = require("../config/db");
let pool;
(async () => {
  pool = await initDB();
})();

module.exports = {
  // ─────────────────────────────────────────────
  // USUARIOS
  // ─────────────────────────────────────────────
  listarUsuarios: async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM usuarios");
      res.json({ ok: true, usuarios: rows });
    } catch (err) {
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  obtenerUsuario: async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM usuarios WHERE id=?",
        [req.params.id]
      );
      res.json({ ok: true, usuario: rows[0] });
    } catch (err) {
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  crearUsuario: async (req, res) => {
    try {
      const data = req.body;
      await pool.query("INSERT INTO usuarios SET ?", data);
      res.json({ ok: true, msg: "Usuario creado" });
    } catch (err) {
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  actualizarUsuario: async (req, res) => {
    try {
      await pool.query("UPDATE usuarios SET ? WHERE id=?", [
        req.body,
        req.params.id,
      ]);
      res.json({ ok: true, msg: "Usuario actualizado" });
    } catch (err) {
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  eliminarUsuario: async (req, res) => {
    try {
      await pool.query("DELETE FROM usuarios WHERE id=?", [req.params.id]);
      res.json({ ok: true, msg: "Usuario eliminado" });
    } catch (err) {
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  // ─────────────────────────────────────────────
  // DOCENTES, SECRETARIAS, ALUMNOS
  // ─────────────────────────────────────────────
  listarDocentes: async (req, res) => {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE rol='DOCENTE'"
    );
    res.json({ ok: true, docentes: rows });
  },

  listarSecretarias: async (req, res) => {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE rol='SECRETARIA'"
    );
    res.json({ ok: true, secretarias: rows });
  },

  listarAlumnos: async (req, res) => {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE rol='ESTUDIANTE'"
    );
    res.json({ ok: true, alumnos: rows });
  },

  // ─────────────────────────────────────────────
  // CURSOS
  // ─────────────────────────────────────────────
  listarCursos: async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM cursos");
    res.json({ ok: true, cursos: rows });
  },

  crearCurso: async (req, res) => {
    await pool.query("INSERT INTO cursos SET ?", [req.body]);
    res.json({ ok: true, msg: "Curso creado" });
  },

  actualizarCurso: async (req, res) => {
    await pool.query("UPDATE cursos SET ? WHERE id=?", [
      req.body,
      req.params.id,
    ]);
    res.json({ ok: true, msg: "Curso actualizado" });
  },

  eliminarCurso: async (req, res) => {
    await pool.query("DELETE FROM cursos WHERE id=?", [req.params.id]);
    res.json({ ok: true, msg: "Curso eliminado" });
  },

  // ─────────────────────────────────────────────
  // SECCIONES
  // ─────────────────────────────────────────────
  listarSecciones: async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM secciones");
    res.json({ ok: true, secciones: rows });
  },

  crearSeccion: async (req, res) => {
    await pool.query("INSERT INTO secciones SET ?", [req.body]);
    res.json({ ok: true, msg: "Sección creada" });
  },

  actualizarSeccion: async (req, res) => {
    await pool.query("UPDATE secciones SET ? WHERE id=?", [
      req.body,
      req.params.id,
    ]);
    res.json({ ok: true, msg: "Sección actualizada" });
  },

  eliminarSeccion: async (req, res) => {
    await pool.query("DELETE FROM secciones WHERE id=?", [req.params.id]);
    res.json({ ok: true, msg: "Sección eliminada" });
  },

  // ─────────────────────────────────────────────
  // PAGOS / FACTURAS / AUDITORIA
  // ─────────────────────────────────────────────
  listarPagos: async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM pagos");
    res.json({ ok: true, pagos: rows });
  },

  listarFacturas: async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM facturas");
    res.json({ ok: true, facturas: rows });
  },

  listarAuditoria: async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM auditoria");
    res.json({ ok: true, auditoria: rows });
  },
};
