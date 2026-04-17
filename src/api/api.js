import axios from "axios";

const api = axios.create({
  baseURL: "https://server.gruecolimp.com"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  const sessionToken = localStorage.getItem("sessionToken");

  // 🔐 token JWT
  if (token && !config.url.includes("/auth/login")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔥 sessionToken (clave para cerrar otras sesiones)
  if (sessionToken) {
    config.headers["x-session-token"] = sessionToken;
  }

  return config;
});



api.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      console.log("🔐 Sesión expirada o inválida");

      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export default api;