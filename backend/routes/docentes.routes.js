const express = require("express");
const router = express.Router();
const docentesController = require("../controllers/docentes.controller");
const authMiddleware = require("../middlewares/authMiddleware");

// ❌ (opcional) elimina si no lo usas
// router.get("/", docentesController.listarDocentes);

// ✅ SECCIONES DEL DOCENTE (JWT)
router.get(
  "/mis-secciones",
  authMiddleware,
  docentesController.listarSeccionesDocente
);

// Sesiones de una sección
router.get(
  "/secciones/:id/sesiones",
  docentesController.listarSesionesSeccion
);

router.get(
  "/sesiones/:id/alumnos",
  docentesController.listarAlumnosSesion
);

router.post(
  "/sesiones/:id/asistencia",
  docentesController.registrarAsistencia
);

module.exports = router;
