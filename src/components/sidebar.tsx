import { useState } from 'react';
import { Link } from 'react-router-dom';

import './sidebar.css';

export default function Sidebar() {
	const [collapsed, setCollapsed] =
		useState(false);

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
				☰
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
			</nav>
		</aside>
	);
}