import { useEffect, useState } from 'react';
import * as UniversityApi from '../api/universityApi.js';
import Layout from '../components/layout';
import { getProjects } from '../api/projectApi.js';
import logo from '../assets/Logo.png';
import type { Project } from '../models/Project';


import './projects.css';

type University = {
	id: number;
	name: string;
};

function Projects() {


const [projects, setProjects] =
	useState<Project[]>([]);

const [universities, setUniversities] =
	useState<University[]>([]);

const [loading, setLoading] =
	useState(true);

const [loadingUniversities, setLoadingUniversities] =
	useState(true);

useEffect(() => {

	loadProjects();
	loadUniversities();

}, []);

const loadProjects = async () => {

	try {

		const response =
			await getProjects();

		setProjects(
			response.data ?? response
		);

	} catch (error) {

		console.error(error);

	} finally {

		setLoading(false);

	}

};

const loadUniversities = async () => {

	try {
		const response =
			await UniversityApi.getUniversities();

		setUniversities(response);
	} catch (error) {
		console.error(error);
	} finally {
		setLoadingUniversities(false);
	}
};




return (
	<Layout>

		<div className="projects">
			<img
				src={logo}
				alt=""
				aria-hidden="true"
				className="projects__background-logo"
			/>

			<div className="projects__header">

				<h1>
					Proyectos
				</h1>

				<button
					className="projects__new-btn"
				>
					+ Nuevo Proyecto
				</button>

			</div>

			<div className="projects__filters">

				<select>
					<option>
						Tipo de iniciativa
					</option>
				</select>

				<select>
					<option>
						Área de gestión
					</option>
				</select>

				<select>
					<option>
						Meta población
					</option>
				</select>

				<select>
					<option>
						Región
					</option>
				</select>

				<select>
					<option>
						Universidad
					</option>

					{loadingUniversities ? null : universities.map(
						university => (
							<option
								key={university.id}
								value={university.id}
							>
								{university.name}
							</option>
						)
					)}
				</select>

			</div>

			{loading ? (

				<p>Cargando...</p>

			) : (

				<div className="projects__list">

					{projects.map(
						project => (

							<div
								key={project.id}
								className="project-card"
							>

								<h3>
									{project.name}
								</h3>

								<p className="project-card__objective">
									{project.general_objective}
								</p>

								<div className="project-card__meta">

									<span>
										📁 {project.type_initiative?.name}
									</span>

									<span>
										👤 {project.person_in_charge?.name} {project.person_in_charge?.lastname}
									</span>

									<span>
										🏛️ {project.university_body?.name}
									</span>

								</div>

								<div className="project-card__tags">

									<span>
										{project.classification_management_area?.name}
									</span>

									<span>
										{project.clasification_meta_population?.name}
									</span>

								</div>

								<div className="project-card__regions">

									<strong>
										Regiones
									</strong>

									<ul>

										{project.projects_commissions_region?.map(
											r => (
												<li key={r.region.id}>
													{r.region.name}
												</li>
											)
										)}

									</ul>

								</div>

								<div className="project-card__universities">

									<strong>
										Universidades
									</strong>

									<ul>

										{project.projects_commissions_university?.map(
											u => (
												<li key={u.university.id}>
													{u.university.name}
												</li>
											)
										)}

									</ul>

								</div>

								<div className="project-card__actions">

									<button>
										Ver Detalle
									</button>

									<button>
										Editar
									</button>

								</div>

							</div>

						)
					)}

				</div>

			)}

		</div>

	</Layout>
);


}

export default Projects;
