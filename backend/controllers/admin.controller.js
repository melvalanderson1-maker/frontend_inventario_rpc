// backend/controllers/admin.controller.js
const { initDB } = require("../config/db");
let pool;
(async () => {
  pool = await initDB();
})();

const bcrypt = require("bcrypt");

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
        const { correo, nombre, apellido_paterno, apellido_materno, numero_documento, telefono, rol, estado, contraseña } = req.body;

        // Validaciones básicas
        if (!correo || !nombre || !apellido_paterno || !contraseña) {
        return res.status(400).json({ ok: false, msg: "Faltan datos obligatorios" });
        }

        // Validar email único
        const [existing] = await pool.query("SELECT id FROM usuarios WHERE correo=?", [correo]);
        if (existing.length > 0) {
        return res.status(400).json({ ok: false, msg: "Correo ya registrado" });
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const contraseña_hash = await bcrypt.hash(contraseña, salt);

        const data = {
        correo,
        nombre,
        apellido_paterno,
        apellido_materno,
        numero_documento,
        telefono,
        rol: rol || "ESTUDIANTE",
        estado: estado || "ACTIVO",
        contraseña_hash,
        };

        await pool.query("INSERT INTO usuarios SET ?", data);
        res.json({ ok: true, msg: "Usuario creado" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: err.message });
    }
    },


    actualizarUsuario: async (req, res) => {
    try {
        const { contraseña, ...resto } = req.body;
        let data = { ...resto };

        if (contraseña) {
        const salt = await bcrypt.genSalt(10);
        const contraseña_hash = await bcrypt.hash(contraseña, salt);
        data.contraseña_hash = contraseña_hash;
        }

        await pool.query("UPDATE usuarios SET ? WHERE id=?", [data, req.params.id]);
        res.json({ ok: true, msg: "Usuario actualizado" });
    } catch (err) {
        res.status(500).json({ ok: false, msg: err.message });
    }
    },


eliminarUsuario: async (req, res) => {
  try {
    const id = req.params.id;

    // Intentamos eliminar directamente
    await pool.query("DELETE FROM usuarios WHERE id=?", [id]);

    res.json({ ok: true, msg: "Usuario eliminado correctamente" });
  } catch (err) {
    // Si falla por foreign key (código 1451 en MySQL)
    if (err.errno === 1451) {
      try {
        // Marcamos usuario como INACTIVO
        await pool.query("UPDATE usuarios SET estado='INACTIVO' WHERE id=?", [id]);
        res.json({ ok: true, msg: "El usuario no se puede eliminar porque tiene registros asociados, pero ha sido marcado como INACTIVO" });
      } catch (err2) {
        res.status(500).json({ ok: false, msg: err2.message });
      }
    } else {
      res.status(500).json({ ok: false, msg: err.message });
    }
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


  // Listar cursos que dicta un docente
    listarCursosDocente: async (req, res) => {
    try {
        const docenteId = req.params.id;
        const [rows] = await pool.query(
        `SELECT 
            s.id AS seccion_id,
            s.codigo AS seccion_codigo,
            s.periodo,
            s.modalidad,
            s.docente_id,
            c.id AS curso_id,
            c.titulo AS curso_titulo,
            c.codigo AS curso_codigo,
            (SELECT COUNT(*) FROM matriculas m WHERE m.seccion_id = s.id AND m.estado='ACTIVO') AS alumnos_count
        FROM secciones s
        JOIN cursos c ON s.curso_id = c.id
        WHERE s.docente_id = ?`,
        [docenteId]
        );

        res.json({ ok: true, cursos: rows });
    } catch (err) {
        res.status(500).json({ ok: false, msg: err.message });
    }
    },

    // backend/controllers/admin.controller.js
listarAlumnosSeccion: async (req, res) => {
  try {
    const seccionId = req.params.id;
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.numero_documento
       FROM matriculas m
       JOIN usuarios u ON m.usuario_id = u.id
       WHERE m.seccion_id = ? AND m.estado='ACTIVO'`,
      [seccionId]
    );
    res.json({ ok: true, alumnos: rows });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
},


  listarSesiones: async (req, res) => {
    const [rows] = await pool.query(
      "SELECT * FROM sesiones WHERE seccion_id=?",
      [req.params.id]
    );
    res.json({ ok: true, sesiones: rows });
  },






  // ─────────────────────────────────────────────
  // SESIONES (Google Calendar Level)
  // ─────────────────────────────────────────────
  crearSesion : async (req, res) => {
    try {
      const {
        seccion_id,
        titulo,
        descripcion,
        inicia_en,
        termina_en,
        tipo_sesion,
        aula,
        enlace_meet
      } = req.body;

      await pool.query("INSERT INTO sesiones SET ?", {
        seccion_id,
        titulo,
        descripcion,
        inicia_en,
        termina_en,
        tipo_sesion,
        aula,
        enlace_meet
      });

      res.json({ ok: true, msg: "Sesión creada correctamente" });
    } catch (err) {
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  actualizarSesion : async (req, res) => {
    try {
      const data = req.body;

      await pool.query("UPDATE sesiones SET ? WHERE id=?", [
        data,
        req.params.id,
      ]);

      res.json({ ok: true, msg: "Sesión actualizada" });
    } catch (err) {
      res.status(500).json({ ok: false, msg: err.message });
    }
  },

  eliminarSesion : async (req, res) => {
    try {
      await pool.query("DELETE FROM sesiones WHERE id=?", [req.params.id]);
      res.json({ ok: true, msg: "Sesión eliminada" });
    } catch (err) {
      res.status(500).json({ ok: false, msg: err.message });
    }
  },


  // ─────────────────────────────────────────────
// HORARIOS (para generar sesiones)
// ─────────────────────────────────────────────
listarHorarios : async (req, res) => {
  try {
    const seccionId = req.params.id;
    const [rows] = await pool.query(
      "SELECT * FROM horarios WHERE seccion_id=?",
      [seccionId]
    );
    res.json({ ok: true, horarios: rows });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
},

crearHorario : async (req, res) => {
  try {
    const { seccion_id, dia_semana, hora_inicio, hora_fin, lugar } = req.body;

    await pool.query("INSERT INTO horarios SET ?", {
      seccion_id,
      dia_semana,
      hora_inicio,
      hora_fin,
      lugar
    });

    res.json({ ok: true, msg: "Horario creado correctamente" });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
},


eliminarHorario: async (req, res) => {
  try {
    await pool.query("DELETE FROM horarios WHERE id=?", [req.params.id]);
    res.json({ ok: true, msg: "Horario eliminado" });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
},

generarSesionesAutomaticas : async (req, res) => {
  try {
    const seccionId = req.params.id;

    // 1. Obtener sección
    const [[seccion]] = await pool.query(
      "SELECT * FROM secciones WHERE id=?", [seccionId]
    );

    // 2. Obtener horarios
    const [horarios] = await pool.query(
      "SELECT * FROM horarios WHERE seccion_id=?", [seccionId]
    );

    if (horarios.length === 0)
      return res.json({ ok: false, msg: "No hay horarios configurados" });

    const fechaInicio = new Date(seccion.fecha_inicio);
    const fechaFin = new Date(seccion.fecha_fin);

    let sesionesCreadas = 0;

    while (fechaInicio <= fechaFin) {
      const diaSemana = fechaInicio.getDay(); // 0-6

      horarios.forEach((h) => {
        if (h.dia_semana === diaSemana) {
          const fechaISO = fechaInicio.toISOString().split("T")[0];
          const inicia = new Date(`${fechaISO} ${h.hora_inicio}`);
          const termina = new Date(`${fechaISO} ${h.hora_fin}`);

          pool.query("INSERT INTO sesiones SET ?", {
            seccion_id: seccionId,
            titulo: `Clase ${sesionesCreadas + 1}`,
            inicia_en: inicia,
            termina_en: termina,
            tipo_sesion: "PRESENCIAL",
            aula: h.lugar
          });

          sesionesCreadas++;
        }
      });

      fechaInicio.setDate(fechaInicio.getDate() + 1);
    }

    res.json({ ok: true, msg: "Sesiones generadas", cantidad: sesionesCreadas });


  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
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
