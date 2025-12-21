import axiosClient from "./axiosClient";

const docentesApi = {
  listarDocentes: () => axiosClient.get("/docentes"),
  listarSeccionesDocente: () =>
  axiosClient.get("/docentes/mis-secciones"),

  listarSesionesSeccion: (seccionId) => axiosClient.get(`/docentes/secciones/${seccionId}/sesiones`),
  listarAlumnosSesion: (sesionId) => axiosClient.get(`/docentes/sesiones/${sesionId}/alumnos`),
  registrarAsistencia: (sesionId, data) => axiosClient.post(`/docentes/sesiones/${sesionId}/asistencia`, data),
};
export default docentesApi;
