const express = require("express");
const router = express.Router();
const docentesController = require("../controllers/docentes.controller");

// Listar docentes
router.get("/", docentesController.listarDocentes);

// Secciones del docente
router.get("/:id/secciones", docentesController.listarSeccionesDocente);

// Sesiones de una sección (para FullCalendar)
router.get("/secciones/:id/sesiones", docentesController.listarSesionesSeccion);

// Alumnos de la sesión
router.get("/sesiones/:id/alumnos", docentesController.listarAlumnosSesion);

// Registrar asistencia
router.post("/sesiones/:id/asistencia", docentesController.registrarAsistencia);

module.exports = router;
