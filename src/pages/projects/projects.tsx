import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import Layout from '../../components/layout.js';
import { deleteProject, getProjects } from '../../api/projectApi.js';
import * as TypeInitiativeApi from '../../api/typeInitiative.js';
import * as ManagementAreaApi from '../../api/clasificationManagementAreaApi.js';
import * as MetaPopulationApi from '../../api/clasificationMetaPopulationApi.js';
import * as PersonInChargeApi from '../../api/personInChargeApi.js';
import * as RegionApi from '../../api/regionApi.js';
import * as UniversityApi from '../../api/universityApi.js';
import logo from '../../assets/Logo.png';
import type { Project, ProjectFilters } from '../../models/Project.js';
import ProjectCreateForm from './projectCreateForm';

import './projects.css';

type CatalogOption = {
	id: number;
	name: string;
	lastname?: string;
};

type FilterSelectProps = {
	label: string;
	placeholder: string;
	options: CatalogOption[];
	value: number | null;
	onChange: (option: CatalogOption | null) => void;
};

const getOptionLabel = (option: CatalogOption) =>
	option.lastname ? `${option.name} ${option.lastname}` : option.name;

function FilterSelect({ label, placeholder, options, value, onChange }: FilterSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const controlRef = useRef<HTMLDivElement | null>(null);
	const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
	const updateDropdownPosition = () => {
		if (!controlRef.current) {
			return;
		}

		const rect = controlRef.current.getBoundingClientRect();
		setDropdownPosition({
			top: rect.bottom + 8,
			left: rect.left,
			width: rect.width,
		});
	};

	const selectedOption = useMemo(
		() => options.find(option => option.id === value) ?? null,
		[options, value]
	);

	useEffect(() => {
		setQuery(selectedOption ? getOptionLabel(selectedOption) : '');
		setIsOpen(false);
	}, [selectedOption]);

	useEffect(() => {
		if (!isOpen || !controlRef.current) {
			return;
		}

		updateDropdownPosition();

		window.addEventListener('resize', updateDropdownPosition);
		window.addEventListener('scroll', updateDropdownPosition, true);

		return () => {
			window.removeEventListener('resize', updateDropdownPosition);
			window.removeEventListener('scroll', updateDropdownPosition, true);
		};
	}, [isOpen, query]);

	const filteredOptions = useMemo(
		() => options.filter(option => getOptionLabel(option).toLowerCase().includes(query.toLowerCase())),
		[options, query]
	);

	return (
		<div className="projects-filter">
			<label className="projects-filter__label">
				<span>{label}</span>
			</label>

			<div className="projects-filter__control" ref={controlRef}>
				<button
					type="button"
					className={`projects-filter__select ${selectedOption ? 'projects-filter__select--filled' : ''}`}
					onClick={() => setIsOpen(open => !open)}
				>
					<span className="projects-filter__select-value">
						{selectedOption ? getOptionLabel(selectedOption) : placeholder}
					</span>
					<span className="projects-filter__select-chevron">⌄</span>
				</button>

					{isOpen && dropdownPosition && createPortal(
						<div
							className="projects-filter__dropdown projects-filter__dropdown--floating"
							style={{
								position: 'fixed',
								top: dropdownPosition.top,
								left: dropdownPosition.left,
								width: dropdownPosition.width,
							}}
						>
							<input
								type="text"
								className="projects-filter__search"
								value={query}
								onChange={event => setQuery(event.target.value)}
								placeholder={`Buscar ${label.toLowerCase()}`}
							/>

							<div className="projects-filter__options">
								{filteredOptions.length === 0 ? (
									<p className="projects-filter__empty">No hay resultados.</p>
								) : (
									filteredOptions.map(option => (
										<button
											type="button"
											key={option.id}
											onMouseDown={event => event.preventDefault()}
											onClick={() => {
												onChange(option);
												setQuery(getOptionLabel(option));
												setIsOpen(false);
											}}
											className="projects-filter__option"
										>
												{getOptionLabel(option)}
											</button>
									))
								)}
							</div>
						</div>,
						document.body
					)}
			</div>
		</div>
	);
}

function Projects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [createOpen, setCreateOpen] = useState(false);
	const [formProject, setFormProject] = useState<Project | null | undefined>(undefined);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [appliedFilters, setAppliedFilters] = useState<ProjectFilters>({});
	const [loadingCatalogs, setLoadingCatalogs] = useState(true);
	const [loadingProjects, setLoadingProjects] = useState(true);
	const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;

	const [typeInitiatives, setTypeInitiatives] = useState<CatalogOption[]>([]);
	const [managementAreas, setManagementAreas] = useState<CatalogOption[]>([]);
	const [metaPopulations, setMetaPopulations] = useState<CatalogOption[]>([]);
	const [people, setPeople] = useState<CatalogOption[]>([]);
	const [universityBodies, setUniversityBodies] = useState<CatalogOption[]>([]);
	const [regions, setRegions] = useState<CatalogOption[]>([]);
	const [universities, setUniversities] = useState<CatalogOption[]>([]);

	const [selectedTypeInitiative, setSelectedTypeInitiative] = useState<CatalogOption | null>(null);
	const [selectedManagementArea, setSelectedManagementArea] = useState<CatalogOption | null>(null);
	const [selectedMetaPopulation, setSelectedMetaPopulation] = useState<CatalogOption | null>(null);
	const [selectedPerson, setSelectedPerson] = useState<CatalogOption | null>(null);
	const [selectedUniversityBody, setSelectedUniversityBody] = useState<CatalogOption | null>(null);
	const [selectedRegion, setSelectedRegion] = useState<CatalogOption | null>(null);
	const [selectedUniversity, setSelectedUniversity] = useState<CatalogOption | null>(null);

	useEffect(() => {
		const loadProjects = async () => {
			try {
				setLoadingProjects(true);
				const response = await getProjects();
				setProjects(Array.isArray(response) ? response : []);
			} catch (error) {
				console.error(error);
				toast.error('No se pudieron cargar los proyectos');
			} finally {
				setLoadingProjects(false);
			}
		};

		loadProjects();
	}, []);

	useEffect(() => {
		const loadCatalogs = async () => {
			try {
				setLoadingCatalogs(true);
				const [typeInitiativesResponse, managementAreasResponse, metaPopulationsResponse, peopleResponse, universityBodiesResponse, regionsResponse, universitiesResponse] = await Promise.all([
					TypeInitiativeApi.gettypeInitiative(),
					ManagementAreaApi.getclassificationManagementArea(),
					MetaPopulationApi.getClassificationMetaPopulation(),
					PersonInChargeApi.getPersonInCharge(),
					UniversityApi.getUniversityBodies(),
					RegionApi.getRegion(),
					UniversityApi.getUniversities(),
				]);

				setTypeInitiatives(typeInitiativesResponse);
				setManagementAreas(managementAreasResponse);
				setMetaPopulations(metaPopulationsResponse);
				setPeople(peopleResponse);
				setUniversityBodies(universityBodiesResponse);
				setRegions(regionsResponse);
				setUniversities(universitiesResponse);
			} catch (error) {
				console.error(error);
				toast.error('No se pudieron cargar los catálogos');
			} finally {
				setLoadingCatalogs(false);
			}
		};

		loadCatalogs();
	}, []);

	const buildFilters = () => {
		const filters: ProjectFilters = {};

		if (selectedTypeInitiative) filters.id_type_initiative = [selectedTypeInitiative.id];
		if (selectedManagementArea) filters.id_classification_management_area = [selectedManagementArea.id];
		if (selectedMetaPopulation) filters.id_clasification_meta_population = [selectedMetaPopulation.id];
		if (selectedPerson) filters.id_person_in_charge = [selectedPerson.id];
		if (selectedUniversityBody) filters.id_university_body = [selectedUniversityBody.id];
		if (selectedRegion) filters.id_region = [selectedRegion.id];
		if (selectedUniversity) filters.id_university = [selectedUniversity.id];

		return filters;
	};

	const matchesFilterValues = (projectValue: number | undefined, allowedValues?: number[]) => {
		if (!allowedValues?.length) {
			return true;
		}

		return typeof projectValue === 'number' ? allowedValues.includes(projectValue) : false;
	};

	const filteredProjects = useMemo(() => {
		if (Object.keys(appliedFilters).length === 0) {
			return projects;
		}

		return projects.filter(project => {
			const regionIds = project.projects_commissions_region?.map(item => item.region.id) ?? [];
			const universityIds = project.projects_commissions_university?.map(item => item.university.id) ?? [];

			const matchesRegion = !appliedFilters.id_region?.length || appliedFilters.id_region.some(id => regionIds.includes(id));
			const matchesUniversity = !appliedFilters.id_university?.length || appliedFilters.id_university.some(id => universityIds.includes(id));

			return matchesFilterValues(project.type_initiative?.id, appliedFilters.id_type_initiative)
				&& matchesFilterValues(project.classification_management_area?.id, appliedFilters.id_classification_management_area)
				&& matchesFilterValues(project.clasification_meta_population?.id, appliedFilters.id_clasification_meta_population)
				&& matchesFilterValues(project.person_in_charge?.id, appliedFilters.id_person_in_charge)
				&& matchesFilterValues(project.university_body?.id, appliedFilters.id_university_body)
				&& matchesRegion
				&& matchesUniversity;
		});
	}, [appliedFilters, projects]);

	const searchProjects = () => {
		setAppliedFilters(buildFilters());
		setCurrentPage(1);
	};

	const clearFilters = () => {
		setSelectedTypeInitiative(null);
		setSelectedManagementArea(null);
		setSelectedMetaPopulation(null);
		setSelectedPerson(null);
		setSelectedUniversityBody(null);
		setSelectedRegion(null);
		setSelectedUniversity(null);
		setAppliedFilters({});
		setCurrentPage(1);
	};

	const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
	const paginatedProjects = useMemo(
		() => filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
		[filteredProjects, currentPage]
	);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const refreshProjects = async () => {
		try {
			const response = await getProjects();
			setProjects(Array.isArray(response) ? response : []);
		} catch (error) {
			console.error(error);
			toast.error('No se pudieron refrescar los proyectos');
		}
	};

	const handleDeleteProject = async (project: Project) => {
		const confirmed = window.confirm(`¿Eliminar el proyecto "${project.name}"?`);

		if (!confirmed) {
			return;
		}

		try {
			setDeletingProjectId(project.id);
			await deleteProject(project.id);
			setProjects(currentProjects => currentProjects.filter(item => item.id !== project.id));
			setSelectedProject(currentProject => (currentProject?.id === project.id ? null : currentProject));
			toast.success('Proyecto eliminado correctamente');
		} catch (error) {
			console.error(error);
			toast.error('No se pudo eliminar el proyecto');
		} finally {
			setDeletingProjectId(null);
		}
	};

	return (
		<Layout>
			<div className="projects">
				<img src={logo} alt="" aria-hidden="true" className="projects__background-logo" />

				<div className="projects__header">
					<div>
						<p className="projects__eyebrow">Gestión de proyectos</p>
						<h1>Proyectos</h1>
					</div>

					<button
						type="button"
						className="projects__new-btn"
						onClick={() => {
							setFormProject(null);
							setCreateOpen(true);
						}}
					>
						+ Nuevo Proyecto
					</button>
				</div>

				<section className="projects__filters-card">
					<div className="projects__filters-header">
						<div>
							<p className="projects__eyebrow">Filtros</p>
							<h2>Busca proyectos por catálogo</h2>
						</div>

						<div className="projects__filters-actions">
							<button
								type="button"
								className="projects__secondary-btn"
								onClick={clearFilters}
								disabled={loadingCatalogs || loadingProjects}
							>
								Limpiar
							</button>

							<button
								type="button"
								className="projects__search-btn"
								onClick={searchProjects}
								disabled={loadingCatalogs || loadingProjects}
							>
								Buscar
							</button>
						</div>
					</div>

					<div className="projects__filters-grid">
						<FilterSelect label="Tipo de iniciativa" placeholder="Todos" options={typeInitiatives} value={selectedTypeInitiative?.id ?? null} onChange={setSelectedTypeInitiative} />
						<FilterSelect label="Área de gestión" placeholder="Todos" options={managementAreas} value={selectedManagementArea?.id ?? null} onChange={setSelectedManagementArea} />
						<FilterSelect label="Meta población" placeholder="Todos" options={metaPopulations} value={selectedMetaPopulation?.id ?? null} onChange={setSelectedMetaPopulation} />
						<FilterSelect label="Persona a cargo" placeholder="Todos" options={people} value={selectedPerson?.id ?? null} onChange={setSelectedPerson} />
						<FilterSelect label="Unidad universitaria" placeholder="Todos" options={universityBodies} value={selectedUniversityBody?.id ?? null} onChange={setSelectedUniversityBody} />
						<FilterSelect label="Región" placeholder="Todos" options={regions} value={selectedRegion?.id ?? null} onChange={setSelectedRegion} />
						<FilterSelect label="Universidad" placeholder="Todos" options={universities} value={selectedUniversity?.id ?? null} onChange={setSelectedUniversity} />
					</div>
				</section>

				<section className="projects__results">
					{loadingProjects ? (
						<p className="projects__state">Cargando proyectos...</p>
					) : filteredProjects.length === 0 ? (
						<div className="projects__empty-state">
							<p>No se encontraron proyectos con esos filtros.</p>
						</div>
					) : (
						<>
							<div className="projects__results-meta">
								<span>
									Mostrando {Math.min(filteredProjects.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(currentPage * itemsPerPage, filteredProjects.length)} de {filteredProjects.length}
								</span>
							</div>

							<div className="projects__list">
								{paginatedProjects.map(project => (
									<div key={project.id} className="project-card">
										<h3>{project.name}</h3>
										<p className="project-card__objective">{project.general_objective}</p>
										<div className="project-card__meta">
											<span>📁 {project.type_initiative?.name}</span>
											<span>👤 {project.person_in_charge?.name} {project.person_in_charge?.lastname}</span>
											<span>🏛️ {project.university_body?.name}</span>
										</div>
										<div className="project-card__tags">
											<span>{project.classification_management_area?.name}</span>
											<span>{project.clasification_meta_population?.name}</span>
										</div>
										<div className="project-card__regions">
											<strong>Regiones</strong>
											<ul>
												{project.projects_commissions_region?.map(regionItem => (
													<li key={regionItem.region.id}>{regionItem.region.name}</li>
												))}
											</ul>
										</div>
										<div className="project-card__universities">
											<strong>Universidades</strong>
											<ul>
												{project.projects_commissions_university?.map(universityItem => (
													<li key={universityItem.university.id}>{universityItem.university.name}</li>
												))}
											</ul>
										</div>
										<div className="project-card__actions">
											<button type="button" className="project-card__action project-card__action--detail" onClick={() => setSelectedProject(project)}>
												Ver Detalle
											</button>

											<button
												type="button"
												onClick={() => {
													setFormProject(project);
													setCreateOpen(true);
												}}
												className="project-card__action project-card__action--edit"
											>
												Editar
											</button>

											<button
												type="button"
												onClick={() => handleDeleteProject(project)}
												disabled={deletingProjectId === project.id}
												className="project-card__action project-card__action--delete"
											>
												{deletingProjectId === project.id ? 'Eliminando...' : 'Eliminar'}
											</button>
										</div>
									</div>
								))}
							</div>

							{filteredProjects.length > itemsPerPage && (
								<div className="projects__pagination">
									<button type="button" onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={currentPage === 1}>
										Anterior
									</button>

									<span>Página {currentPage} de {totalPages}</span>

									<button type="button" onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
										Siguiente
									</button>
								</div>
							)}
						</>
					)}
				</section>
			</div>

			{createOpen && (
				<ProjectCreateForm
					project={formProject}
					onClose={() => {
						setCreateOpen(false);
						setFormProject(undefined);
					}}
					onCreated={refreshProjects}
				/>
			)}

			{selectedProject && (
				<div className="project-detail" role="dialog" aria-modal="true">
					<div className="project-detail__backdrop" onClick={() => setSelectedProject(null)} />
					<div className="project-detail__panel" onClick={event => event.stopPropagation()}>
						<div className="project-detail__header">
							<div>
								<p className="project-detail__eyebrow">Detalle del proyecto</p>
								<h2>{selectedProject.name}</h2>
							</div>
							<button type="button" className="project-detail__close" onClick={() => setSelectedProject(null)}>
								Cerrar
							</button>
						</div>

						<div className="project-detail__grid">
							<section className="project-detail__section project-detail__section--wide">
								<h3>Objetivo general</h3>
								<p>{selectedProject.general_objective}</p>
							</section>

							<section className="project-detail__section">
								<h3>Datos principales</h3>
								<ul>
									<li><strong>Tipo de iniciativa:</strong> {selectedProject.type_initiative?.name ?? 'Sin dato'}</li>
									<li><strong>Área de gestión:</strong> {selectedProject.classification_management_area?.name ?? 'Sin dato'}</li>
									<li><strong>Meta población:</strong> {selectedProject.clasification_meta_population?.name ?? 'Sin dato'}</li>
								</ul>
							</section>

							<section className="project-detail__section">
								<h3>Responsables</h3>
								<ul>
									<li><strong>Persona a cargo:</strong> {selectedProject.person_in_charge ? `${selectedProject.person_in_charge.name} ${selectedProject.person_in_charge.lastname}` : 'Sin dato'}</li>
									<li><strong>Unidad universitaria:</strong> {selectedProject.university_body?.name ?? 'Sin dato'}</li>
								</ul>
							</section>

							<section className="project-detail__section">
								<h3>Regiones</h3>
								{selectedProject.projects_commissions_region?.length ? (
									<ul className="project-detail__list">
										{selectedProject.projects_commissions_region.map(item => (
											<li key={item.id}>{item.region.name}</li>
										))}
									</ul>
								) : (
									<p>Sin regiones asociadas.</p>
								)}
							</section>

							<section className="project-detail__section">
								<h3>Universidades</h3>
								{selectedProject.projects_commissions_university?.length ? (
									<ul className="project-detail__list">
										{selectedProject.projects_commissions_university.map(item => (
											<li key={item.id}>{item.university.name}</li>
										))}
									</ul>
								) : (
									<p>Sin universidades asociadas.</p>
								)}
							</section>
						</div>
					</div>
				</div>
			)}
		</Layout>
	);
}

export default Projects;