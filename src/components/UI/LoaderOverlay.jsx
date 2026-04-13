import React from "react";
import "./LoaderOverlay.css";

export default function LoaderOverlay({ text = "Procesando..." }) {
  return (
    <div className="loader-overlay">
      <div className="loader-box">
        <div className="spinner"></div>
        <p>{text}</p>
      </div>
    </div>
  );
}