// backend/controllers/docentes.controller.js
const { initDB } = require("../config/db");
let pool;

(async () => {
  pool = await initDB();
})();

module.exports = {

  // ─────────────────────────────────────────────
  // DOCENTE: SUS SECCIONES + CURSOS
  // ─────────────────────────────────────────────
  listarSeccionesDocente: async (req, res) => {
    try {
      const docenteId = req.user.id; // o req.user.id si usas auth real

      const [rows] = await pool.query(
        `
        SELECT 
          s.id AS seccion_id,
          s.codigo AS seccion_codigo,
          s.fecha_inicio,
          s.fecha_fin,
          s.modalidad,
          s.curso_id,
          c.titulo AS curso_titulo,
          c.descripcion AS curso_descripcion
        FROM secciones s
        JOIN cursos c ON s.curso_id = c.id
        WHERE s.docente_id = ?
        ORDER BY s.fecha_inicio DESC
        `,
        [docenteId]
      );

      const secciones = rows.map(r => ({
        ...r,
        fecha_inicio: r.fecha_inicio
          ? r.fecha_inicio.toISOString().slice(0, 10)
          : null,
        fecha_fin: r.fecha_fin
          ? r.fecha_fin.toISOString().slice(0, 10)
          : null,
      }));

      res.json({ ok: true, secciones });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  // ─────────────────────────────────────────────
  // SESIONES DE UNA SECCIÓN (CALENDARIO)
  // ─────────────────────────────────────────────
  listarSesionesSeccion: async (req, res) => {
    try {
      const seccionId = req.params.id;

      const [rows] = await pool.query(
        `
        SELECT *
        FROM sesiones
        WHERE seccion_id = ?
        ORDER BY inicia_en ASC
        `,
        [seccionId]
      );

      res.json({ ok: true, sesiones: rows });
    } catch (err) {
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  // ─────────────────────────────────────────────
  // ALUMNOS DE UNA SESIÓN
  // ─────────────────────────────────────────────
  listarAlumnosSesion: async (req, res) => {
    try {
      const sesionId = req.params.id;

      const [rows] = await pool.query(
        `
        SELECT 
          u.id,
          u.nombre,
          u.apellido_paterno,
          u.apellido_materno,
          a.estado
        FROM asistencias a
        JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.sesion_id = ?
        `,
        [sesionId]
      );

      res.json({ ok: true, alumnos: rows });
    } catch (err) {
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  // ─────────────────────────────────────────────
  // REGISTRAR / ACTUALIZAR ASISTENCIA
  // ─────────────────────────────────────────────
  registrarAsistencia: async (req, res) => {
    try {
      const sesionId = req.params.id;
      const { asistencias } = req.body;
      const docenteId = req.user?.id || null;

      for (const a of asistencias) {
        const [existe] = await pool.query(
          `
          SELECT id FROM asistencias
          WHERE sesion_id=? AND usuario_id=?
          `,
          [sesionId, a.usuario_id]
        );

        if (existe.length === 0) {
          await pool.query(
            `
            INSERT INTO asistencias
            (sesion_id, usuario_id, estado, marcado_por)
            VALUES (?, ?, ?, ?)
            `,
            [sesionId, a.usuario_id, a.estado, docenteId]
          );
        } else {
          await pool.query(
            `
            UPDATE asistencias
            SET estado=?, marcado_por=?
            WHERE sesion_id=? AND usuario_id=?
            `,
            [a.estado, docenteId, sesionId, a.usuario_id]
          );
        }
      }

      res.json({ ok: true, msg: "Asistencia registrada correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

};
