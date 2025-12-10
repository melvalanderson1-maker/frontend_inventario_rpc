const express = require("express");
const router = express.Router();
const docentesController = require("../controllers/docentes.controller");

// Listar docentes
router.get("/", docentesController.listarDocentes);

// Secciones del docente
router.get("/:id/secciones", docentesController.listarSeccionesDocente);

// Sesiones del docente
router.get("/:id/sesiones", docentesController.listarSesionesDocente);

// Alumnos de una SECCIÓN
router.get("/secciones/:id/alumnos", docentesController.listarAlumnosSeccion);

// Registrar asistencia
router.post("/secciones/:id/asistencia", docentesController.registrarAsistencia);

// Registrar notas
router.post("/secciones/:id/notas", docentesController.registrarNotas);

module.exports = router;
