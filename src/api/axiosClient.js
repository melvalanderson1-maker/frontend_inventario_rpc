import axios from "axios";

// Siempre usar solo la env, sin fallback.
// En desarrollo usarás un archivo .env.development
// En producción, un archivo .env.production
const BASE_URL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Interceptor de token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;
