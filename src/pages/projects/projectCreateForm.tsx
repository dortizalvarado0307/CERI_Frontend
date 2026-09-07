import {
	useEffect,
	useRef,
	useState,
	type ChangeEvent,
	type FormEvent,
} from 'react';
import { toast } from 'sonner';

import { createProject, updateProject } from '../../api/projectApi';
import type { Project, ProjectForm } from '../../models/Project';
import type { CatalogOption } from '../../models/CatalogOption';
import { useModalFocus } from '../../hooks/useModalFocus';
import { useAuth } from '../../context/AuthContext';
import { useCatalogs } from '../../hooks/useCatalogs';
import { AutocompleteSelect } from '../../components/ui/AutocompleteSelect';
import { CheckboxMultiField } from '../../components/ui/CheckboxMultiField';

import './projectCreateForm.css';

type ProjectCreateFormProps = {
	onClose: () => void;
	onCreated: () => Promise<void> | void;
	project?: Project | null;
};

const initialForm: ProjectForm = {
	name: '',
	general_objective: '',
	codigo: '',
	fecha_inicio: '',
	fecha_fin: '',
	regions: [],
	universities: [],
};

type FormErrors = Partial<Record<keyof ProjectForm, string>>;

const toDateInputValue = (date: string | Date | null | undefined): string => {
	if (!date) return '';
	return new Date(date).toISOString().split('T')[0];
};

function ProjectCreateForm({ onClose, onCreated, project }: ProjectCreateFormProps) {
	const [form, setForm] = useState<ProjectForm>(initialForm);
	const [saving, setSaving] = useState(false);
	const [selectedTypeInitiative, setSelectedTypeInitiative] = useState<CatalogOption | null>(null);
	const [selectedManagementArea, setSelectedManagementArea] = useState<CatalogOption | null>(null);
	const [selectedMetaPopulation, setSelectedMetaPopulation] = useState<CatalogOption | null>(null);
	const [selectedPerson, setSelectedPerson] = useState<CatalogOption | null>(null);
	const [selectedUniversityBody, setSelectedUniversityBody] = useState<CatalogOption | null>(null);
	const [selectedRegions, setSelectedRegions] = useState<CatalogOption[]>([]);
	const [selectedUniversities, setSelectedUniversities] = useState<CatalogOption[]>([]);
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
	const [formErrors, setFormErrors] = useState<FormErrors>({});
	const isEditMode = Boolean(project);
	const panelRef = useRef<HTMLDivElement>(null);
	const { userId } = useAuth();

	useModalFocus(true, panelRef, onClose);

	useEffect(() => {
		if (loadingCatalogs) return;

		if (!project) {
			setForm(initialForm);
			setSelectedTypeInitiative(null);
			setSelectedManagementArea(null);
			setSelectedMetaPopulation(null);
			setSelectedPerson(null);
			setSelectedUniversityBody(null);
			setSelectedRegions([]);
			setSelectedUniversities([]);
			return;
		}

		setForm({
			name: project.name ?? '',
			general_objective: project.general_objective ?? '',
			codigo: project.codigo ?? '',
			fecha_inicio: toDateInputValue(project.fecha_inicio),
			fecha_fin: toDateInputValue(project.fecha_fin),
			regions: project.projects_commissions_region?.map(item => item.region.id) ?? [],
			universities: project.projects_commissions_university?.map(item => item.university.id) ?? [],
		});

		setSelectedTypeInitiative(
			typeInitiatives.find(option => option.id === project.type_initiative?.id) ?? null
		);
		setSelectedManagementArea(
			managementAreas.find(option => option.id === project.classification_management_area?.id) ?? null
		);
		setSelectedMetaPopulation(
			metaPopulations.find(option => option.id === project.clasification_meta_population?.id) ?? null
		);
		setSelectedPerson(
			people.find(option => option.id === project.person_in_charge?.id) ?? null
		);
		setSelectedUniversityBody(
			universityBodies.find(option => option.id === project.university_body?.id) ?? null
		);
		setSelectedRegions(
			regions.filter(option =>
				project.projects_commissions_region?.some(item => item.region.id === option.id)
			)
		);
		setSelectedUniversities(
			universities.filter(option =>
				project.projects_commissions_university?.some(item => item.university.id === option.id)
			)
		);
	}, [
		project,
		loadingCatalogs,
		typeInitiatives,
		managementAreas,
		metaPopulations,
		people,
		universityBodies,
		regions,
		universities,
	]);

	const handleFieldChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = event.target;
		setForm(current => ({ ...current, [name]: value }));
	};

	const validateForm = (): boolean => {
		const errors: FormErrors = {};
		let isValid = true;

		if (!form.name.trim()) {
			errors.name = 'El nombre del proyecto es requerido';
			isValid = false;
		} else if (form.name.trim().length < 5) {
			errors.name = 'El nombre debe tener al menos 5 caracteres';
			isValid = false;
		} else if (form.name.length > 150) {
			errors.name = 'El nombre no puede exceder 150 caracteres';
			isValid = false;
		}

		if (!form.general_objective.trim()) {
			errors.general_objective = 'El objetivo general es requerido';
			isValid = false;
		} else if (form.general_objective.trim().length < 20) {
			errors.general_objective = 'El objetivo debe tener al menos 20 caracteres';
			isValid = false;
		} else if (form.general_objective.length > 2000) {
			errors.general_objective = 'El objetivo no puede exceder 2000 caracteres';
			isValid = false;
		}

		if (form.codigo && form.codigo.trim().length > 50) {
			errors.codigo = 'El código no puede tener más de 50 caracteres';
			isValid = false;
		}

		if (form.fecha_inicio && form.fecha_fin) {
			const inicio = new Date(form.fecha_inicio);
			const fin = new Date(form.fecha_fin);
			if (fin < inicio) {
				errors.fecha_fin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
				isValid = false;
			}
		}

		if (!selectedTypeInitiative) {
			errors.id_type_initiative = 'Selecciona el tipo de iniciativa';
			isValid = false;
		}
		if (!selectedManagementArea) {
			errors.id_classification_management_area = 'Selecciona el área de gestión';
			isValid = false;
		}
		if (!selectedMetaPopulation) {
			errors.id_clasification_meta_population = 'Selecciona la población meta';
			isValid = false;
		}
		if (!selectedPerson) {
			errors.id_person_in_charge = 'Selecciona la persona a cargo';
			isValid = false;
		}
		if (!selectedUniversityBody) {
			errors.id_university_body = 'Selecciona la unidad universitaria';
			isValid = false;
		}
		if (selectedRegions.length === 0) {
			errors.regions = 'Selecciona al menos una región';
			isValid = false;
		}
		if (selectedUniversities.length === 0) {
			errors.universities = 'Selecciona al menos una universidad';
			isValid = false;
		}

		setFormErrors(errors);
		return isValid;
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!validateForm()) {
			toast.error('Por favor corrige los errores en el formulario');
			panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			return;
		}

		if (!userId) {
			toast.error('Error de autenticación. Inicia sesión nuevamente.');
			return;
		}

		const payload: ProjectForm = {
			name: form.name.trim(),
			general_objective: form.general_objective.trim(),
			id_type_initiative: selectedTypeInitiative!.id,
			id_classification_management_area: selectedManagementArea!.id,
			id_clasification_meta_population: selectedMetaPopulation!.id,
			id_person_in_charge: selectedPerson!.id,
			id_university_body: selectedUniversityBody!.id,
			id_user: userId,
			codigo: form.codigo?.trim() || undefined,
			fecha_inicio: form.fecha_inicio || undefined,
			fecha_fin: form.fecha_fin || undefined,
			regions: selectedRegions.map(region => region.id),
			universities: selectedUniversities.map(university => university.id),
		};

		try {
			setSaving(true);

			if (project) {
				await updateProject(project.id, payload);
				toast.success('Proyecto actualizado correctamente');
			} else {
				await createProject(payload);
				toast.success('Proyecto creado correctamente');
			}

			await onCreated();
			onClose();
		} catch (error) {
			console.error(error);
			toast.error('No se pudo guardar el proyecto');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="project-create" role="dialog" aria-modal="true">
			<div className="project-create__backdrop" onClick={onClose} />

			<div className="project-create__panel" ref={panelRef} tabIndex={-1} onClick={event => event.stopPropagation()}>
				<div className="project-create__header">
					<div>
						<p className="project-create__eyebrow">{isEditMode ? 'Editar proyecto' : 'Nuevo proyecto'}</p>
						<h2>{isEditMode ? 'Formulario de edición' : 'Formulario de creación'}</h2>
					</div>

					<button type="button" className="project-create__close" onClick={onClose}>
						Cerrar
					</button>
				</div>

				{loadingCatalogs ? (
					<p className="project-create__state">Cargando catálogos...</p>
				) : (
					<form className="project-create__form" onSubmit={handleSubmit}>
						<div className="project-create__field">
							<label className="project-create__label">
								<span>Nombre del proyecto</span>
								<input
									type="text"
									name="name"
									value={form.name}
									onChange={handleFieldChange}
									placeholder="Ej: Programa de vinculación con la comunidad"
									minLength={5}
									maxLength={150}
									aria-invalid={!!formErrors.name}
									aria-describedby={formErrors.name ? 'name-error' : undefined}
								/>
								{formErrors.name && (
									<span className="project-create__error" id="name-error" role="alert">
										⚠ {formErrors.name}
									</span>
								)}
							</label>
						</div>

						<div className="project-create__field project-create__field--full">
							<label className="project-create__label">
								<span>Objetivo general</span>
								<textarea
									name="general_objective"
									value={form.general_objective}
									onChange={handleFieldChange}
									placeholder="Describe el objetivo general del proyecto (mínimo 20 caracteres)"
									minLength={20}
									maxLength={2000}
									aria-invalid={!!formErrors.general_objective}
									aria-describedby={formErrors.general_objective ? 'objective-error' : undefined}
								/>
								{formErrors.general_objective && (
									<span className="project-create__error" id="objective-error" role="alert">
										⚠ {formErrors.general_objective}
									</span>
								)}
								<span className="project-create__help">
									{form.general_objective.length}/2000 caracteres
								</span>
							</label>
						</div>

						<div className={`project-create__field${formErrors.codigo ? ' project-create__field--error' : ''}`}>
							<label className="project-create__label">
								<span>Código</span>
								<input
									type="text"
									name="codigo"
									value={form.codigo ?? ''}
									onChange={handleFieldChange}
									placeholder="Ej: PROY-2024-001"
									maxLength={50}
									aria-invalid={!!formErrors.codigo}
									aria-describedby={formErrors.codigo ? 'codigo-error' : undefined}
								/>
								{formErrors.codigo && (
									<span className="project-create__error" id="codigo-error" role="alert">
										⚠ {formErrors.codigo}
									</span>
								)}
							</label>
						</div>

						<div className={`project-create__field${formErrors.fecha_inicio ? ' project-create__field--error' : ''}`}>
							<label className="project-create__label">
								<span>Fecha de inicio</span>
								<input
									type="date"
									name="fecha_inicio"
									value={form.fecha_inicio ?? ''}
									onChange={handleFieldChange}
									aria-invalid={!!formErrors.fecha_inicio}
									aria-describedby={formErrors.fecha_inicio ? 'fecha-inicio-error' : undefined}
								/>
								{formErrors.fecha_inicio && (
									<span className="project-create__error" id="fecha-inicio-error" role="alert">
										⚠ {formErrors.fecha_inicio}
									</span>
								)}
							</label>
						</div>

						<div className={`project-create__field${formErrors.fecha_fin ? ' project-create__field--error' : ''}`}>
							<label className="project-create__label">
								<span>Fecha de fin</span>
								<input
									type="date"
									name="fecha_fin"
									value={form.fecha_fin ?? ''}
									onChange={handleFieldChange}
									aria-invalid={!!formErrors.fecha_fin}
									aria-describedby={formErrors.fecha_fin ? 'fecha-fin-error' : undefined}
								/>
								{formErrors.fecha_fin && (
									<span className="project-create__error" id="fecha-fin-error" role="alert">
										⚠ {formErrors.fecha_fin}
									</span>
								)}
							</label>
						</div>

						<AutocompleteSelect
							label="Tipo de iniciativa"
							options={typeInitiatives}
							value={selectedTypeInitiative?.id ?? null}
							onChange={setSelectedTypeInitiative}
							error={formErrors.id_type_initiative}
						/>

						<AutocompleteSelect
							label="Área de gestión"
							options={managementAreas}
							value={selectedManagementArea?.id ?? null}
							onChange={setSelectedManagementArea}
							error={formErrors.id_classification_management_area}
						/>

						<AutocompleteSelect
							label="Población meta"
							options={metaPopulations}
							value={selectedMetaPopulation?.id ?? null}
							onChange={setSelectedMetaPopulation}
							error={formErrors.id_clasification_meta_population}
						/>

						<AutocompleteSelect
							label="Persona a cargo"
							options={people}
							value={selectedPerson?.id ?? null}
							onChange={setSelectedPerson}
							error={formErrors.id_person_in_charge}
						/>

						<AutocompleteSelect
							label="Unidad universitaria"
							options={universityBodies}
							value={selectedUniversityBody?.id ?? null}
							onChange={setSelectedUniversityBody}
							error={formErrors.id_university_body}
						/>

						<CheckboxMultiField
							label="Regiones"
							placeholder="Filtrar regiones"
							options={regions}
							selected={selectedRegions}
							onToggle={(region, checked) =>
								setSelectedRegions(current => checked
									? [...current.filter(item => item.id !== region.id), region]
									: current.filter(item => item.id !== region.id)
								)
							}
							error={formErrors.regions}
						/>

						<CheckboxMultiField
							label="Universidades"
							placeholder="Filtrar universidades"
							options={universities}
							selected={selectedUniversities}
							onToggle={(university, checked) =>
								setSelectedUniversities(current => checked
									? [...current.filter(item => item.id !== university.id), university]
									: current.filter(item => item.id !== university.id)
								)
							}
							error={formErrors.universities}
						/>

						<div className="project-create__actions">
							<button type="button" className="project-create__secondary" onClick={onClose}>
								Cancelar
							</button>

							<button type="submit" className="project-create__primary" disabled={saving}>
								{saving ? 'Guardando...' : isEditMode ? 'Actualizar proyecto' : 'Guardar proyecto'}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}

export default ProjectCreateForm;