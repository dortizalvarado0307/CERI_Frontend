import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { DarkModeToggle } from './ui/DarkModeToggle';
import { useAuth } from '../context/AuthContext';
import './sidebar.css';
import logo from '../assets/Logo.png';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          <img src={logo} alt="Logo" />
        </button>
      </div>

      <div className={`sidebar__theme-toggle ${collapsed ? 'sidebar__theme-toggle--collapsed' : ''}`}>
        <DarkModeToggle />
        {!collapsed && <span className="sidebar__theme-label">Modo oscuro</span>}
      </div>

      <nav className="sidebar__menu">
        <Link to="/projects" className="sidebar__item">
          <span aria-hidden="true">📁</span>
          {!collapsed && <span>Proyectos</span>}
        </Link>

        <Link to="/people" className="sidebar__item">
          <span aria-hidden="true">👤</span>
          {!collapsed && <span>Personas</span>}
        </Link>

        {isAdmin && (
          <Link to="/users" className="sidebar__item">
            <span aria-hidden="true">⚙️</span>
            {!collapsed && <span>Usuarios</span>}
          </Link>
        )}

        <div className="sidebar__divider" />

        <button
          className="sidebar__item sidebar__logout"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <span aria-hidden="true">⏻</span>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </nav>
    </aside>
  );
}
