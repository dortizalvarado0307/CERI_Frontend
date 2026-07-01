import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { login } from '../../api/authApi';

import './login.css';
import logo from '../../assets/Logo.png';

function Login() {

	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = async (
		e: React.FormEvent<HTMLFormElement>
	) => {

		e.preventDefault();

		try {

			const response = await login(
				email,
				password
			);

			localStorage.setItem(
				'token',
				response.token
			);

			toast.success(
				'Bienvenido'
			);

			navigate('/projects');

		} catch {

			toast.error(
				'Credenciales inválidas'
			);

		}

	};

	return (
		<main className="login-page">
			<section className="login-page__panel login-page__panel--info">
				<div className="login-page__info-copy">
					<img
						src={logo}
						alt=""
						aria-hidden="true"
						className="login-page__info-logo-bg"
					/>
					<h1 className="login-page__info-heading">
						Sistema de control de proyectos
					</h1>
				</div>
			</section>

			<section className="login-page__panel login-page__panel--auth">
				<div className="login-shell">
					<form
						className="login-card"
						onSubmit={handleSubmit}
					>
						<div>
							<p className="login-card__eyebrow">
								Iniciar sesión
							</p>

							<h2>
								Ingresa tus datos
							</h2>
						</div>

						<label className="login-field">
							<span>Email</span>

							<input
								type="email"
								name="email"
								placeholder="tu@email.com"
								value={email}
								onChange={(e) =>
									setEmail(
										e.target.value
									)
								}
							/>
						</label>

						<label className="login-field">
							<span>Password</span>

							<input
								type="password"
								name="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) =>
									setPassword(
										e.target.value
									)
								}
							/>
						</label>

						<button
							type="submit"
							className="login-card__button"
						>
							Iniciar Sesión
						</button>
					</form>
				</div>
			</section>
		</main>
	);

}

export default Login;