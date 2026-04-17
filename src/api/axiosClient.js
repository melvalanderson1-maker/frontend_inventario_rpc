import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://server.gruecolimp.com"
});

axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  const sessionToken = localStorage.getItem("sessionToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (sessionToken) {
    config.headers["x-session-token"] = sessionToken;
  }

  return config;
});

export default axiosClient;