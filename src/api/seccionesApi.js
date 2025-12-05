import axiosClient from "./axiosClient";

export const obtenerSeccionesPorCurso = (cursoId) =>
  // Antes: axiosClient.get(`/cursos/${cursoId}/secciones`);
  axiosClient.get(`/cursos/${cursoId}`);
