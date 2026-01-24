import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://inventario-quantum-production.up.railway.app"
});

axiosClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axiosClient;
