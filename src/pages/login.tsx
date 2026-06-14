import './login.css'
import logo from '../assets/Logo.png'

function Login() {
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
					<h1 className="login-page__info-heading">Sistema de control de proyectos</h1>
				</div>
			</section>

			<section className="login-page__panel login-page__panel--auth">
				<div className="login-shell">
					<form className="login-card">
						<div>
							<p className="login-card__eyebrow">Iniciar sesión</p>
							<h2>Ingresa tus datos</h2>
						</div>

						<label className="login-field">
							<span>Email</span>
							<input type="email" name="email" placeholder="tu@email.com" />
						</label>

						<label className="login-field">
							<span>Password</span>
							<input type="password" name="password" placeholder="••••••••" />
						</label>

						<button type="submit" className="login-card__button">
							Iniciar Sesión
						</button>
					</form>
				</div>
			</section>
		</main>
	)
}

export default Login
