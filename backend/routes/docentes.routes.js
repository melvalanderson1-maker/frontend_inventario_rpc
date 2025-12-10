// backend/routes/docentes.routes.js
const express = require("express");
const router = express.Router();
const docentesController = require("../controllers/docentes.controller");

// Listar docentes (opcional para panel)
router.get("/", docentesController.listarDocentes);

// Secciones que dicta un docente
router.get("/:id/secciones", docentesController.listarSeccionesDocente);

// Sesiones programadas del docente
router.get("/:id/sesiones", docentesController.listarSesionesDocente);

// Alumnos de una sección (para modal)
router.get("/secciones/:id/alumnos", docentesController.listarAlumnosSeccion);

// Registrar asistencia (array de { usuario_id, presente })
router.post("/secciones/:id/asistencia", docentesController.registrarAsistencia);

// Registrar notas (array de { usuario_id, actividad_id?, nota })
router.post("/secciones/:id/notas", docentesController.registrarNotas);

module.exports = router;
