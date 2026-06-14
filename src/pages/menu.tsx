import { useMemo, useState } from 'react';

function Menu() {
	const [version, setVersion] = useState(0);

	const token = useMemo(
		() => localStorage.getItem('token'),
		[version]
	);

	const hasSession = Boolean(token);

	const handleRefresh = () => {
		setVersion((prev) => prev + 1);
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		setVersion((prev) => prev + 1);
	};

	return (
		<main
			style={{
				minHeight: '100vh',
				display: 'grid',
				placeItems: 'center',
				padding: '24px',
				background: '#f5f7fb',
				fontFamily: 'Segoe UI, sans-serif'
			}}
		>
			<section
				style={{
					width: '100%',
					maxWidth: '560px',
					background: '#ffffff',
					borderRadius: '14px',
					padding: '24px',
					boxShadow: '0 12px 30px rgba(28, 39, 60, 0.12)'
				}}
			>
				<h1 style={{ margin: 0, marginBottom: '8px', color: '#14213d' }}>
					Estado de sesión
				</h1>

				<p style={{ marginTop: 0, marginBottom: '18px', color: '#4a5568' }}>
					Vista rápida para validar si iniciaste sesión.
				</p>

				<div
					style={{
						padding: '12px 14px',
						borderRadius: '10px',
						marginBottom: '14px',
						background: hasSession ? '#e8f8ee' : '#fff3f3',
						color: hasSession ? '#146c43' : '#b42318',
						fontWeight: 600
					}}
				>
					{hasSession ? 'Sesion iniciada' : 'No hay sesion iniciada'}
				</div>

				<p
					style={{
						margin: 0,
						padding: '10px 12px',
						borderRadius: '8px',
						background: '#f2f4f8',
						color: '#2d3748',
						wordBreak: 'break-all',
						fontSize: '14px'
					}}
				>
					Token: {token ?? 'Sin token en localStorage'}
				</p>

				<div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
					<button
						type="button"
						onClick={handleRefresh}
						style={{
							padding: '10px 14px',
							borderRadius: '8px',
							border: '1px solid #cbd5e1',
							cursor: 'pointer',
							background: '#ffffff'
						}}
					>
						Refrescar estado
					</button>

					<button
						type="button"
						onClick={handleLogout}
						disabled={!hasSession}
						style={{
							padding: '10px 14px',
							borderRadius: '8px',
							border: '1px solid #ef4444',
							cursor: hasSession ? 'pointer' : 'not-allowed',
							background: hasSession ? '#ef4444' : '#fecaca',
							color: '#ffffff'
						}}
					>
						Cerrar sesion
					</button>
				</div>
			</section>
		</main>
	);
}

export default Menu;
