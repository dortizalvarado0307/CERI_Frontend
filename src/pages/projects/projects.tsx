import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Layout from '../../components/layout';
import { deleteProject, getProjects } from '../../api/projectApi';
import { exportProjectsPdf, exportProjectsExcel } from '../../utils/projectExport';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import logo from '../../assets/Logo.png';
import type { Project, ProjectFilters } from '../../models/Project';
import type { CatalogOption } from '../../models/CatalogOption';
import ProjectCreateForm from './projectCreateForm';
import { ProjectDetailModal } from './projectDetailModal';
import { useCatalogs } from '../../hooks/useCatalogs';
import { AutocompleteSelect } from '../../components/ui/AutocompleteSelect';

import './projects.css';

const formatDate = (date: string | Date | null | undefined): string => {
	if (!date) return '';
	return new Date(date).toLocaleDateString('es-ES');
};

function Projects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [createOpen, setCreateOpen] = useState(false);
	const [formProject, setFormProject] = useState<Project | null | undefined>(undefined);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [appliedFilters, setAppliedFilters] = useState<ProjectFilters>({});
	const [loadingProjects, setLoadingProjects] = useState(true);
	const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
	const [filtersExpanded, setFiltersExpanded] = useState(true);
	const [exporting, setExporting] = useState(false);
	const itemsPerPage = 6;

	const {
		typeInitiatives,
		managementAreas,
		metaPopulations,
		people,
		universityBodies,
		regions,
		universities,
		loading: loadingCatalogs,
	} = useCatalogs();

	const [selectedTypeInitiative, setSelectedTypeInitiative] = useState<CatalogOption | null>(null);
	const [selectedManagementArea, setSelectedManagementArea] = useState<CatalogOption | null>(null);
	const [selectedMetaPopulation, setSelectedMetaPopulation] = useState<CatalogOption | null>(null);
	const [selectedPerson, setSelectedPerson] = useState<CatalogOption | null>(null);
	const [selectedUniversityBody, setSelectedUniversityBody] = useState<CatalogOption | null>(null);
	const [selectedRegion, setSelectedRegion] = useState<CatalogOption | null>(null);
	const [selectedUniversity, setSelectedUniversity] = useState<CatalogOption | null>(null);

	const filteredProjects = useMemo(() => {
		if (Object.keys(appliedFilters).length === 0) return projects;
		return projects.filter(project => {
			const regionIds = project.projects_commissions_region?.map(item => item.region.id) ?? [];
			const universityIds = project.projects_commissions_university?.map(item => item.university.id) ?? [];
			const matchesRegion = !appliedFilters.id_region?.length || appliedFilters.id_region.some(id => regionIds.includes(id));
			const matchesUniversity = !appliedFilters.id_university?.length || appliedFilters.id_university.some(id => universityIds.includes(id));

			const matchesFilterValues = (projectValue: number | undefined, allowedValues?: number[]) => {
				if (!allowedValues?.length) return true;
				return typeof projectValue === 'number' ? allowedValues.includes(projectValue) : false;
			};

			return matchesFilterValues(project.type_initiative?.id, appliedFilters.id_type_initiative)
				&& matchesFilterValues(project.classification_management_area?.id, appliedFilters.id_classification_management_area)
				&& matchesFilterValues(project.clasification_meta_population?.id, appliedFilters.id_clasification_meta_population)
				&& matchesFilterValues(project.person_in_charge?.id, appliedFilters.id_person_in_charge)
				&& matchesFilterValues(project.university_body?.id, appliedFilters.id_university_body)
				&& matchesRegion
				&& matchesUniversity;
		});
	}, [appliedFilters, projects]);

	const {
		currentPage,
		setCurrentPage,
		totalPages,
		paginatedItems: paginatedProjects,
	} = usePagination(filteredProjects, itemsPerPage);

	useEffect(() => {
		const controller = new AbortController();
		const loadProjects = async () => {
			try {
				setLoadingProjects(true);
				const response = await getProjects(controller.signal);
				if (controller.signal.aborted) return;
				setProjects(Array.isArray(response) ? response : []);
			} catch (error) {
				if (controller.signal.aborted) return;
				console.error(error);
				toast.error('No se pudieron cargar los proyectos');
			} finally {
				if (!controller.signal.aborted) setLoadingProjects(false);
			}
		};
		loadProjects();
		return () => { controller.abort(); };
	}, []);

	const buildFilters = (): ProjectFilters => {
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
		if (!confirmed) return;

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
						onClick={() => { setFormProject(null); setCreateOpen(true); }}
					>
						+ Nuevo Proyecto
					</button>
				</div>

				<section className="projects__filters-card">
					<div className="projects__filters-header">
						<div className="projects__filters-title-wrapper">
							<p className="projects__eyebrow">Filtros</p>
							<h2>Busca proyectos por catálogo</h2>
						</div>

						<div className="projects__filters-actions">
							<button
								type="button"
								className="projects__toggle-filters-btn"
								onClick={() => setFiltersExpanded(!filtersExpanded)}
								aria-expanded={filtersExpanded}
								aria-label={filtersExpanded ? 'Ocultar filtros' : 'Mostrar filtros'}
							>
								<span className="projects__toggle-filters-icon">{filtersExpanded ? '▼' : '▶'}</span>
								<span>{filtersExpanded ? 'Ocultar' : 'Mostrar'} filtros</span>
							</button>

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

					<div
						className={`projects__filters-content ${filtersExpanded ? 'projects__filters-content--expanded' : ''}`}
						style={{ display: filtersExpanded ? 'block' : 'none' }}
					>
						<div className="projects__filters-grid">
							<AutocompleteSelect variant="filter" label="Tipo de iniciativa" placeholder="Todos" options={typeInitiatives} value={selectedTypeInitiative?.id ?? null} onChange={setSelectedTypeInitiative} />
							<AutocompleteSelect variant="filter" label="Área de gestión" placeholder="Todos" options={managementAreas} value={selectedManagementArea?.id ?? null} onChange={setSelectedManagementArea} />
							<AutocompleteSelect variant="filter" label="Población meta" placeholder="Todos" options={metaPopulations} value={selectedMetaPopulation?.id ?? null} onChange={setSelectedMetaPopulation} />
							<AutocompleteSelect variant="filter" label="Persona a cargo" placeholder="Todos" options={people} value={selectedPerson?.id ?? null} onChange={setSelectedPerson} />
							<AutocompleteSelect variant="filter" label="Unidad universitaria" placeholder="Todos" options={universityBodies} value={selectedUniversityBody?.id ?? null} onChange={setSelectedUniversityBody} />
							<AutocompleteSelect variant="filter" label="Región" placeholder="Todos" options={regions} value={selectedRegion?.id ?? null} onChange={setSelectedRegion} />
							<AutocompleteSelect variant="filter" label="Universidad" placeholder="Todos" options={universities} value={selectedUniversity?.id ?? null} onChange={setSelectedUniversity} />
						</div>

						<div className="projects__export-actions">
							<button
								type="button"
								className="projects__export-btn projects__export-btn--pdf"
								onClick={async () => {
									if (filteredProjects.length === 0) {
										toast.error('No hay proyectos para exportar');
										return;
									}
									setExporting(true);
									try {
										await exportProjectsPdf(filteredProjects);
										toast.success('PDF exportado correctamente');
									} catch {
										toast.error('Error al exportar PDF');
									} finally {
										setExporting(false);
									}
								}}
								disabled={loadingProjects || exporting}
							>
								{exporting ? 'Exportando...' : '📄 Exportar PDF'}
							</button>

							<button
								type="button"
								className="projects__export-btn projects__export-btn--csv"
								onClick={async () => {
									if (filteredProjects.length === 0) {
										toast.error('No hay proyectos para exportar');
										return;
									}
									setExporting(true);
									try {
										await exportProjectsExcel(filteredProjects);
										toast.success('Excel exportado correctamente');
									} catch {
										toast.error('Error al exportar Excel');
									} finally {
										setExporting(false);
									}
								}}
								disabled={loadingProjects || exporting}
							>
								{exporting ? 'Exportando...' : '📊 Exportar Excel'}
							</button>
						</div>
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
										<div className="project-card__header">
											<h3>{project.name}</h3>
											<span className="project-card__badge">
												<span className="badge__dot" />
												{project.type_initiative?.name ?? 'Iniciativa'}
											</span>
										</div>

										<div className="project-card__body">
											<p className="project-card__objective">{project.general_objective}</p>

											<div className="project-card__meta">
												<div className="project-card__meta-item">
													👤 {project.person_in_charge ? `${project.person_in_charge.name} ${project.person_in_charge.lastname}` : 'Sin asignar'}
												</div>
												<div className="project-card__meta-item">
													🏛️ {project.university_body?.name ?? 'Sin unidad'}
												</div>
												{project.codigo && (
													<div className="project-card__meta-item">
														🔖 {project.codigo}
													</div>
												)}
												{project.fecha_inicio && (
													<div className="project-card__meta-item">
														📅 Inicio: {formatDate(project.fecha_inicio)}
													</div>
												)}
												{project.fecha_fin && (
													<div className="project-card__meta-item">
														🏁 Fin: {formatDate(project.fecha_fin)}
													</div>
												)}
											</div>

											<div className="project-card__tags">
												<span className="badge badge--primary">{project.classification_management_area?.name ?? 'Sin área'}</span>
												<span className="badge badge--warning">{project.clasification_meta_population?.name ?? 'Sin población meta'}</span>
											</div>

											<div className="project-card__regions">
												<strong>📍 Regiones</strong>
												<ul>
													{project.projects_commissions_region?.map(regionItem => (
														<li key={regionItem.region.id}>{regionItem.region.name}</li>
													)) ?? <li>Sin regiones</li>}
												</ul>
											</div>

											<div className="project-card__universities">
												<strong>🎓 Universidades</strong>
												<ul>
													{project.projects_commissions_university?.map(universityItem => (
														<li key={universityItem.university.id}>{universityItem.university.name}</li>
													)) ?? <li>Sin universidades</li>}
												</ul>
											</div>
										</div>

										<div className="project-card__actions">
											<button type="button" className="project-card__action project-card__action--detail" onClick={() => setSelectedProject(project)}>
												👁 Ver Detalle
											</button>

											<button
												type="button"
												onClick={() => { setFormProject(project); setCreateOpen(true); }}
												className="project-card__action project-card__action--edit"
											>
												✏️ Editar
											</button>

											<button
												type="button"
												onClick={() => handleDeleteProject(project)}
												disabled={deletingProjectId === project.id}
												className="project-card__action project-card__action--delete"
											>
												{deletingProjectId === project.id ? '⏳ Eliminando...' : '🗑️ Eliminar'}
											</button>
										</div>
									</div>
								))}
							</div>

							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={setCurrentPage}
							/>
						</>
					)}
				</section>
			</div>

			{createOpen && (
				<ProjectCreateForm
					project={formProject}
					onClose={() => { setCreateOpen(false); setFormProject(undefined); }}
					onCreated={refreshProjects}
				/>
			)}

			{selectedProject && (
				<ProjectDetailModal
					project={selectedProject}
					onClose={() => setSelectedProject(null)}
				/>
			)}
		</Layout>
	);
}

export default Projects;