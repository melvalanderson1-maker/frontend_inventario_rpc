// src/components/layout/PublicFooter.jsx
import React from "react";
import "./PublicFooter.css";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container">
        {/* IZQUIERDA */}
        <div className="footer-left">
          <div>© {new Date().getFullYear()} GRUPO RPC - INVENTARIO</div>
          <div> WankoraEP: 971168000 </div>
        </div>

        {/* CENTRO */}
        <div className="footer-center">
          <h4>Horario</h4>
          <p>Lun-Vie: 8:00-18:30, Sáb: 9:00-12:00</p>
        </div>

        {/* DERECHA */}
        <div className="footer-right">
          <div className="social-icons">
            <a href="https://www.facebook.com/gruporpc" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i className="fab fa-whatsapp"></i>
            </a>
            <a href="https://www.instagram.com/gruporpc" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://www.tiktok.com/@gruporpc" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <i className="fab fa-tiktok"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}