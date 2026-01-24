import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/DashboardHeader.css';

const handleLogout = () => {
  // Limpiar datos del localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('usuario');
  localStorage.removeItem('user');

  // Redirigir al login
  window.location.href = '/';
};

function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [userPhoto, setUserPhoto] = useState('');
  const [userName, setUserName] = useState('');
  const location = useLocation();

  // Verifica si estamos en la página principal del dashboard
  const isDashboard = location.pathname === "/dashboard";

  // Obtener la opción actual desde la URL (si existe) y decodificarla
  const opcion = location.pathname.split('/')[2];
  const decodedTitle = opcion ? decodeURIComponent(opcion.replaceAll('-', ' ')) : ''; 

  // Abrir/cerrar menú de usuario
  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState);
  };

  const confirmLogout = () => {
    setShowConfirmLogout(true);
    setIsMenuOpen(false);
  };

  const confirmAndLogout = () => {
    handleLogout();
  };

  const cancelLogout = () => {
    setShowConfirmLogout(false);
  };

  // Animación de título al cambiar de ruta
  useEffect(() => {
    setTitleVisible(false);
    const timer = setTimeout(() => setTitleVisible(true), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Obtener usuario normal desde localStorage
  let user = null;
  try {
    const userData = localStorage.getItem('usuario');
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  // Obtener usuario de Google desde localStorage
  useEffect(() => {
    const googleUser = localStorage.getItem('user');
    if (googleUser) {
      const googleData = JSON.parse(googleUser);
      setUserPhoto(googleData.imagen_perfil || '');
      setUserName(googleData.nombre || '');
    }
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menu = document.querySelector('.menu-options');
      const avatar = document.querySelector('.user-photo-container');
      if (menu && avatar && !menu.contains(event.target) && !avatar.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Definir imagen y nombre del usuario
  const imageUrl = userPhoto || (user && user.imagen_perfil) || 'https://i.imgur.com/6VBx3io.png';
  const displayName = user?.nombre || userName || "Invitado";

  return (
    <header className="dashboard-header">
      <div className="logo-container">
        <Link to="/dashboard" className="logo-link">
          <img src="/images/logo.png" alt="Logo" className={titleVisible ? 'logo-animate' : ''} />
        </Link>
      </div>

      <div className="header-center">
        {decodedTitle ? (
          <h1 className={titleVisible ? 'title-animate' : ''}>
            {decodedTitle.toUpperCase()}
          </h1>
        ) : (
          isDashboard && (
            <div className="navbar-container">
              <nav className="navbar">
                <ul className="header-options">
                  <li><span>Hola, {displayName}</span></li>
                </ul>
              </nav>
            </div>
          )
        )}
      </div>

      {/* Avatar y menú */}
      <div className="user-photo-container">
        <img 
          src={imageUrl}
          alt="Foto de usuario"
          className="user-icon"
          onClick={toggleMenu}
          title="Opciones" 
        />
        {isMenuOpen && (
          <div className="menu-options">
            <ul>
              <li onClick={confirmLogout}>Cerrar sesión</li>
            </ul>
          </div>
        )}
      </div>

      {/* Modal de confirmación de logout */}
      {showConfirmLogout && (
        <div className="logout-modal">
          <div className="modal-content">
            <p>¿Estás seguro de que quieres cerrar sesión?</p>
            <div className="modal-buttons">
              <button onClick={confirmAndLogout}>Sí, cerrar sesión</button>
              <button onClick={cancelLogout}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DashboardHeader;
