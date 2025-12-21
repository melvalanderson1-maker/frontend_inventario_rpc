const express = require("express");
const router = express.Router();
const docentesController = require("../controllers/docentes.controller");

// Listar docentes
router.get("/", docentesController.listarDocentes);

// Secciones del docente
router.get("/:id/secciones", docentesController.listarSeccionesDocente);

// Sesiones del docente
router.get("/:id/sesiones", docentesController.listarSesionesDocente);

// Alumnos de una sesión
router.get("/sesiones/:id/alumnos", docentesController.listarAlumnosSesion);

// Sesiones de una sección
router.get("/secciones/:id/sesiones", docentesController.listarSesionesSeccion);

// Alumnos de la sesión (ya existe)
router.get("/sesiones/:id/alumnos", docentesController.listarAlumnosSesion);


// Registrar asistencia
router.post("/sesiones/:id/asistencia", docentesController.registrarAsistencia);

// Registrar notas
router.post("/secciones/:id/notas", docentesController.registrarNotas);

module.exports = router;
