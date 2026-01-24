// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

import api from "../api/api";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authApi.perfil();
        setUsuario(res.data);
      } catch {
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (credenciales) => {
    const res = await api.post("/auth/login", credenciales);

    // 🔐 guardar token
    localStorage.setItem("token", res.data.token);

    // 👤 guardar usuario REAL
    localStorage.setItem("user", JSON.stringify(res.data.usuario));

    // 🔥 actualizar estado
    setUsuario(res.data.usuario);

    return res.data.usuario;
  };


  const logout = () => {
    localStorage.clear();
    setUsuario(null);
  };



  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUsuario(JSON.parse(storedUser));
  }
  setLoading(false);
}, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setUsuario(JSON.parse(user));
    setLoading(false);
  }, []);



  return (
    <AuthContext.Provider
      value={{ usuario, setUsuario, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
