import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import './sidebar.css';
import logo from '../assets/Logo.png';



export default function Sidebar() {
	const [collapsed, setCollapsed] =
		useState(false);
	const navigate = useNavigate();

	const logout = () => {
		localStorage.removeItem('token');
		navigate('/', { replace: true });
	};

	return (
		<aside
			className={`sidebar ${
				collapsed
					? 'sidebar--collapsed'
					: ''
			}`}
		>
			<button
				className="sidebar__toggle"
				onClick={() =>
					setCollapsed(!collapsed)
				}
			>
				<img src={logo} alt="Logo" />
			</button>

			<nav className="sidebar__menu">
				<Link
					to="/projects"
					className="sidebar__item"
				>
					<span>📁</span>

					{!collapsed && (
						<span>
							Proyectos
						</span>
					)}
				</Link>

				<Link
					to="/people"
					className="sidebar__item"
				>
					<span>👤</span>

					{!collapsed && (
						<span>
							Personas
						</span>
					)}
				</Link>

					<button
						className="sidebar__item sidebar__logout"
						onClick={logout}
				>
					<span>⏻</span>

					{!collapsed && (
						<span>
							Cerrar sesión
						</span>
					)}
				</button>
			</nav>
		</aside>
	);
}