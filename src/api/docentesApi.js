import axiosClient from "./axiosClient";

const docentesApi = {
  listarDocentes: () => axiosClient.get("/docentes"),

  listarSeccionesDocente: (docenteId) =>
    axiosClient.get(`/docentes/${docenteId}/secciones`),

  listarSesionesDocente: (docenteId) =>
    axiosClient.get(`/docentes/${docenteId}/sesiones`),

  listarAlumnosSesion: (seccionId) =>
    axiosClient.get(`/docentes/secciones/${seccionId}/alumnos`),

  registrarAsistencia: (seccionId, data) =>
    axiosClient.post(`/docentes/secciones/${seccionId}/asistencia`, data),

  registrarNotas: (seccionId, payload) =>
    axiosClient.post(`/docentes/secciones/${seccionId}/notas`, payload),
};

export default docentesApi;
