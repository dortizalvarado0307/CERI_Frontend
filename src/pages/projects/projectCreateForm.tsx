import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type ChangeEvent,
	type FormEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import { createProject, updateProject } from '../../api/projectApi';
import { gettypeInitiative } from '../../api/typeInitiative';
import { getclassificationManagementArea } from '../../api/clasificationManagementAreaApi';
import { getClassificationMetaPopulation } from '../../api/clasificationMetaPopulationApi';
import { getPersonInCharge } from '../../api/personInChargeApi';
import { getRegion } from '../../api/regionApi';
import { getUniversities, getUniversityBodies } from '../../api/universityApi';
import type { Project, ProjectForm } from '../../models/Project';

import './projectCreateForm.css';

type CatalogOption = {
	id: number;
	name: string;
	lastname?: string;
};

type ProjectCreateFormProps = {
	onClose: () => void;
	onCreated: () => Promise<void> | void;
	project?: Project | null;
};

const initialForm: ProjectForm = {
	name: '',
	general_objective: '',
	regions: [],
	universities: [],
};

type FormErrors = Partial<Record<keyof ProjectForm, string>>;

const getOptionLabel = (option: CatalogOption) =>
	option.lastname
		? `${option.name} ${option.lastname}`
		: option.name;

const decodeUserIdFromToken = () => {
	const token = localStorage.getItem('token');

	if (!token) {
		return null;
	}

	const parts = token.split('.');

	if (parts.length < 2) {
		return null;
	}

	try {
		const payload = JSON.parse(
			atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
		);
		const candidate =
			payload.id_user ??
			payload.userId ??
			payload.id ??
			payload.sub;
		const parsed = Number(candidate);

		return Number.isFinite(parsed)
			? parsed
			: null;
	} catch {
		return null;
	}
};

type AutocompleteFieldProps = {
	label: string;
	options: CatalogOption[];
	value: number | null;
	onChange: (option: CatalogOption | null) => void;
	helpText?: string;
	error?: string;
};

function SelectField({
	label,
	options,
	value,
	onChange,
	helpText,
	error,
	}: AutocompleteFieldProps) {
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
			top: rect.bottom + 6,
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
		() => options.filter(option =>
			getOptionLabel(option)
				.toLowerCase()
				.includes(query.toLowerCase())
		),
		[options, query]
	);

	return (
		<div className={`project-create__field ${error ? 'project-create__field--error' : ''}`}>
			<label className="project-create__label">
				<span>{label}</span>
			</label>

			<div className="project-create__autocomplete" ref={controlRef}>
				<button
					type="button"
					className={`project-create__select ${selectedOption ? 'project-create__select--filled' : ''}`}
					onClick={() => setIsOpen(open => !open)}
					aria-invalid={!!error}
				>
					<span className="project-create__select-value">
						{selectedOption ? getOptionLabel(selectedOption) : 'Selecciona una opción'}
					</span>
					<span className="project-create__select-chevron">⌄</span>
				</button>

					{isOpen && dropdownPosition && createPortal(
						<div
							className="project-create__dropdown project-create__dropdown--select project-create__dropdown--floating"
							style={{
								position: 'fixed',
								top: dropdownPosition.top,
								left: dropdownPosition.left,
								width: dropdownPosition.width,
							}}
						>
							<input
								type="text"
								className="project-create__dropdown-search"
								value={query}
								onChange={event => setQuery(event.target.value)}
								placeholder={`Buscar ${label.toLowerCase()}`}
							/>

							<div className="project-create__dropdown-list">
								{filteredOptions.length === 0 ? (
									<p className="project-create__empty-state">
										No hay resultados para ese filtro.
									</p>
								) : filteredOptions.map(option => (
									<button
										type="button"
										key={option.id}
										onMouseDown={event => event.preventDefault()}
										onClick={() => {
											onChange(option);
											setQuery(getOptionLabel(option));
											setIsOpen(false);
										}}
										className="project-create__option"
									>
											{getOptionLabel(option)}
										</button>
								))}
							</div>
						</div>,
						document.body
					)}
			</div>

			{error && (
				<span className="project-create__error" role="alert">
					⚠ {error}
				</span>
			)}
			{helpText && !error && <p className="project-create__help">{helpText}</p>}
		</div>
	);
}

type CheckboxMultiFieldProps = {
	label: string;
	placeholder: string;
	options: CatalogOption[];
	selected: CatalogOption[];
	onToggle: (option: CatalogOption, checked: boolean) => void;
	helpText?: string;
	error?: string;
};

function CheckboxMultiField({
	label,
	placeholder,
	options,
	selected,
	onToggle,
	helpText,
	error,
}: CheckboxMultiFieldProps) {
	const [query, setQuery] = useState('');

	const filteredOptions = useMemo(
		() => options.filter(option =>
			getOptionLabel(option)
				.toLowerCase()
				.includes(query.toLowerCase())
		),
		[options, query]
	);

	return (
		<div className={`project-create__field project-create__field--full ${error ? 'project-create__field--error' : ''}`}>
			<label className="project-create__label">
				<span>{label}</span>
				<input
					type="text"
					value={query}
					onChange={event => setQuery(event.target.value)}
					placeholder={placeholder}
				/>
			</label>

			<div className="project-create__checkbox-summary">
				{selected.length === 0
					? 'Sin selecciones'
					: `${selected.length} seleccionadas`}
			</div>

			<div className="project-create__checkbox-list">
				{filteredOptions.length === 0 ? (
					<p className="project-create__empty-state">
						No hay resultados para ese filtro.
					</p>
				) : filteredOptions.map(option => {
					const checked = selected.some(item => item.id === option.id);

					return (
						<label className="project-create__checkbox-item" key={option.id}>
							<input
								type="checkbox"
								checked={checked}
								onChange={event => onToggle(option, event.target.checked)}
							/>
							<span>{getOptionLabel(option)}</span>
						</label>
					);
				})}
			</div>

			{error && (
				<span className="project-create__error" role="alert">
					⚠ {error}
				</span>
			)}
			{helpText && !error && <p className="project-create__help">{helpText}</p>}
		</div>
	);
}

function ProjectCreateForm({ onClose, onCreated, project }: ProjectCreateFormProps) {
	const [form, setForm] = useState<ProjectForm>(initialForm);
	const [loadingCatalogs, setLoadingCatalogs] = useState(true);
	const [saving, setSaving] = useState(false);
	const [selectedTypeInitiative, setSelectedTypeInitiative] = useState<CatalogOption | null>(null);
	const [selectedManagementArea, setSelectedManagementArea] = useState<CatalogOption | null>(null);
	const [selectedMetaPopulation, setSelectedMetaPopulation] = useState<CatalogOption | null>(null);
	const [selectedPerson, setSelectedPerson] = useState<CatalogOption | null>(null);
	const [selectedUniversityBody, setSelectedUniversityBody] = useState<CatalogOption | null>(null);
	const [selectedRegions, setSelectedRegions] = useState<CatalogOption[]>([]);
	const [selectedUniversities, setSelectedUniversities] = useState<CatalogOption[]>([]);
	const [typeInitiatives, setTypeInitiatives] = useState<CatalogOption[]>([]);
	const [managementAreas, setManagementAreas] = useState<CatalogOption[]>([]);
	const [metaPopulations, setMetaPopulations] = useState<CatalogOption[]>([]);
	const [people, setPeople] = useState<CatalogOption[]>([]);
	const [universityBodies, setUniversityBodies] = useState<CatalogOption[]>([]);
	const [regions, setRegions] = useState<CatalogOption[]>([]);
	const [universities, setUniversities] = useState<CatalogOption[]>([]);
	const [idUser, setIdUser] = useState<number | null>(null);
	const [formErrors, setFormErrors] = useState<FormErrors>({});
	const isEditMode = Boolean(project);

	useEffect(() => {
		setIdUser(decodeUserIdFromToken());
	}, []);

	useEffect(() => {
		const loadCatalogs = async () => {
			try {
				setLoadingCatalogs(true);

				const [typeInitiativesResponse, managementAreasResponse, metaPopulationsResponse, peopleResponse, universityBodiesResponse, regionsResponse, universitiesResponse] = await Promise.all([
					gettypeInitiative(),
					getclassificationManagementArea(),
					getClassificationMetaPopulation(),
					getPersonInCharge(),
					getUniversityBodies(),
					getRegion(),
					getUniversities(),
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

	useEffect(() => {
		if (loadingCatalogs) {
			return;
		}

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

	// Validaciones
	const validateField = (name: string, value: string): string | null => {
		switch (name) {
			case 'name':
				if (!value.trim()) return 'El nombre del proyecto es requerido';
				if (value.trim().length < 5) return 'El nombre debe tener al menos 5 caracteres';
				if (value.length > 150) return 'El nombre no puede exceder 150 caracteres';
				return null;

			case 'general_objective':
				if (!value.trim()) return 'El objetivo general es requerido';
				if (value.trim().length < 20) return 'El objetivo debe tener al menos 20 caracteres';
				if (value.length > 2000) return 'El objetivo no puede exceder 2000 caracteres';
				return null;

			default:
				return null;
		}
	};

	const handleFieldChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = event.target;
		setForm(current => ({
			...current,
			[name]: value,
		}));
		// No validar mientras se escribe
	};

	const handleFieldBlur = () => {
		// No validar en blur, solo al hacer submit
	};

	const validateForm = (): boolean => {
		const errors: FormErrors = {};
		let isValid = true;

		// Validar campos de texto
		const nameError = validateField('name', form.name);
		if (nameError) {
			errors.name = nameError;
			isValid = false;
		}

		const objectiveError = validateField('general_objective', form.general_objective);
		if (objectiveError) {
			errors.general_objective = objectiveError;
			isValid = false;
		}

		// Validar selects requeridos
		if (!selectedTypeInitiative) {
			errors.id_type_initiative = 'Selecciona el tipo de iniciativa';
			isValid = false;
		}
		if (!selectedManagementArea) {
			errors.id_classification_management_area = 'Selecciona el área de gestión';
			isValid = false;
		}
		if (!selectedMetaPopulation) {
			errors.id_clasification_meta_population = 'Selecciona la meta población';
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

		// Validar formulario completo
		if (!validateForm()) {
			toast.error('Por favor corrige los errores en el formulario');
			// Scroll al inicio del formulario para ver los errores
			const formElement = document.querySelector('.project-create__form');
			formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			return;
		}

		if (!idUser) {
			toast.error('Error de autenticación. Inicia sesión nuevamente.');
			return;
		}

		// Cast seguro porque ya validamos que no son null
		const payload: ProjectForm = {
			name: form.name.trim(),
			general_objective: form.general_objective.trim(),
			id_type_initiative: selectedTypeInitiative!.id,
			id_classification_management_area: selectedManagementArea!.id,
			id_clasification_meta_population: selectedMetaPopulation!.id,
			id_person_in_charge: selectedPerson!.id,
			id_university_body: selectedUniversityBody!.id,
			id_user: idUser,
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

			<div className="project-create__panel" onClick={event => event.stopPropagation()}>
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
									onBlur={handleFieldBlur}
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
									onBlur={handleFieldBlur}
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

						<SelectField
							label="Tipo de iniciativa"
							options={typeInitiatives}
							value={selectedTypeInitiative?.id ?? null}
							onChange={setSelectedTypeInitiative}
							error={formErrors.id_type_initiative}
						/>

						<SelectField
							label="Área de gestión"
							options={managementAreas}
							value={selectedManagementArea?.id ?? null}
							onChange={setSelectedManagementArea}
							error={formErrors.id_classification_management_area}
						/>

						<SelectField
							label="Meta población"
							options={metaPopulations}
							value={selectedMetaPopulation?.id ?? null}
							onChange={setSelectedMetaPopulation}
							error={formErrors.id_clasification_meta_population}
						/>

						<SelectField
							label="Persona a cargo"
							options={people}
							value={selectedPerson?.id ?? null}
							onChange={setSelectedPerson}
							error={formErrors.id_person_in_charge}
						/>

						<SelectField
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