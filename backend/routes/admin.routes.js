// backend/routes/admin.routes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// 🔐 Middleware opcional si deseas validar rol admin
function soloAdmin(req, res, next) {
  try {
    const usuario = req.user;
    if (!usuario || usuario.rol !== "ADMIN") {
      return res.status(403).json({ ok: false, msg: "Acceso denegado" });
    }
    next();
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Error autenticación" });
  }
}

// ─────────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────────
router.get("/usuarios", adminController.listarUsuarios);
router.get("/usuarios/:id", adminController.obtenerUsuario);
router.post("/usuarios", adminController.crearUsuario);
router.put("/usuarios/:id", adminController.actualizarUsuario);
router.delete("/usuarios/:id", adminController.eliminarUsuario);

// ─────────────────────────────────────────────
// ROLES ESPECÍFICOS
// ─────────────────────────────────────────────
router.get("/docentes", adminController.listarDocentes);
router.get("/secretarias", adminController.listarSecretarias);
router.get("/alumnos", adminController.listarAlumnos);
// Cursos de un docente
router.get("/docentes/:id/cursos", adminController.listarCursosDocente);

// ─────────────────────────────────────────────
// CURSOS
// ─────────────────────────────────────────────
router.get("/cursos", adminController.listarCursos);
router.post("/cursos", adminController.crearCurso);
router.put("/cursos/:id", adminController.actualizarCurso);
router.delete("/cursos/:id", adminController.eliminarCurso);
// backend/routes/admin.routes.js
router.get("/secciones/:id/alumnos", adminController.listarAlumnosSeccion);

// SESIONES

router.get("/secciones/:id/sesiones", adminController.listarSesiones);
router.post("/sesiones", adminController.crearSesion);
router.put("/sesiones/:id", adminController.actualizarSesion);
router.delete("/sesiones/:id", adminController.eliminarSesion);

// HORARIOS
// HORARIOS
router.get("/secciones/:id/horarios", adminController.listarHorarios);
router.post("/horarios", adminController.crearHorario);

// GENERAR SESIONES
router.post("/secciones/:id/generar-sesiones", adminController.generarSesionesAutomaticas);



// ─────────────────────────────────────────────
// SECCIONES
// ─────────────────────────────────────────────
router.get("/secciones", adminController.listarSecciones);
router.post("/secciones", adminController.crearSeccion);
router.put("/secciones/:id", adminController.actualizarSeccion);
router.delete("/secciones/:id", adminController.eliminarSeccion);

// ─────────────────────────────────────────────
// PAGOS / FACTURAS / AUDITORIA
// ─────────────────────────────────────────────
router.get("/pagos", adminController.listarPagos);
router.get("/facturas", adminController.listarFacturas);
router.get("/auditoria", adminController.listarAuditoria);



module.exports = router;
