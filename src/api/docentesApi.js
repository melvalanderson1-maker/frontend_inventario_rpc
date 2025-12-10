// src/api/docentesApi.js
import axiosClient from "./axiosClient";

const docentesApi = {
  listarDocentes: () => axiosClient.get("/docentes"),
  listarSeccionesDocente: (docenteId) => axiosClient.get(`/docentes/${docenteId}/secciones`),
  listarSesionesDocente: (docenteId) => axiosClient.get(`/docentes/${docenteId}/sesiones`),
  listarAlumnosSeccion: (seccionId) => axiosClient.get(`/docentes/secciones/${seccionId}/alumnos`),
  registrarAsistencia: (seccionId, payload) => axiosClient.post(`/docentes/secciones/${seccionId}/asistencia`, payload),
  registrarNotas: (seccionId, payload) => axiosClient.post(`/docentes/secciones/${seccionId}/notas`, payload),
};

export default docentesApi;
