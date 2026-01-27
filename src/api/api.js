import axios from "axios";

const api = axios.create({
  baseURL: "https://inventario-quantum-production.up.railway.app"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");

  if (token && !config.url.includes("/auth/login")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
