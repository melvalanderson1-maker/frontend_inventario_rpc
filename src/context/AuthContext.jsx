import React, { createContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";
import api from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 obtener usuario al cargar
useEffect(() => {
  const init = async () => {
    try {
      const token = localStorage.getItem("token");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        setUsuario(null);
        setLoading(false);
        return;
      }

      const res = await authApi.perfil();
      setUsuario(res.data);

    } catch (error) {
      console.log("Error sesión:", error.response?.data);

      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  init();
}, []);

  // 🔐 LOGIN
  const login = async (credenciales) => {
    const res = await api.post("/auth/login", credenciales);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("sessionToken", res.data.sessionToken); // 🔥 IMPORTANTE
    localStorage.setItem("user", JSON.stringify(res.data.usuario));

    setUsuario(res.data.usuario);

    return res.data.usuario;
  };

  // 🔐 LOGOUT
  const logout = () => {
    localStorage.clear();
    setUsuario(null);
  };


  // 🔥 AUTO LOGOUT POR INACTIVIDAD (20 min)
  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        logout();
        window.location.href = "/login";
      }, 20 * 60 * 1000); // 20 minutos
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};