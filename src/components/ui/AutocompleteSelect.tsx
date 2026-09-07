import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { CatalogOption } from '../../models/CatalogOption';
import { getOptionLabel } from '../../models/CatalogOption';

type AutocompleteSelectProps = {
	label: string;
	options: CatalogOption[];
	value: number | null;
	onChange: (option: CatalogOption | null) => void;
	placeholder?: string;
	error?: string;
	helpText?: string;
	variant?: 'filter' | 'field';
};

export function AutocompleteSelect({
	label,
	options,
	value,
	onChange,
	placeholder = 'Selecciona una opción',
	error,
	helpText,
	variant = 'field',
}: AutocompleteSelectProps) {
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
			top: rect.bottom + (variant === 'filter' ? 8 : 6),
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
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		updateDropdownPosition();

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (controlRef.current?.contains(target)) {
				return;
			}
			const dropdown = document.querySelector(
				variant === 'filter'
					? '.projects-filter__dropdown--floating'
					: '.project-create__dropdown--floating'
			);
			if (dropdown?.contains(target)) {
				return;
			}
			setIsOpen(false);
		};

		const handleResizeOrScroll = () => updateDropdownPosition();

		window.addEventListener('resize', handleResizeOrScroll);
		window.addEventListener('scroll', handleResizeOrScroll, true);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			window.removeEventListener('resize', handleResizeOrScroll);
			window.removeEventListener('scroll', handleResizeOrScroll, true);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, variant]);

	const filteredOptions = useMemo(
		() => options.filter(option =>
			getOptionLabel(option)
				.toLowerCase()
				.includes(query.toLowerCase())
		),
		[options, query]
	);

	if (variant === 'filter') {
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
						aria-expanded={isOpen}
						aria-haspopup="listbox"
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
							role="listbox"
						>
							<input
								type="text"
								className="projects-filter__search"
								value={query}
								onChange={event => setQuery(event.target.value)}
								placeholder={`Buscar ${label.toLowerCase()}`}
								aria-label={`Buscar ${label}`}
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
											role="option"
											aria-selected={option.id === value}
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
					aria-expanded={isOpen}
					aria-haspopup="listbox"
				>
					<span className="project-create__select-value">
						{selectedOption ? getOptionLabel(selectedOption) : placeholder}
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
						role="listbox"
					>
						<input
							type="text"
							className="project-create__dropdown-search"
							value={query}
							onChange={event => setQuery(event.target.value)}
							placeholder={`Buscar ${label.toLowerCase()}`}
							aria-label={`Buscar ${label}`}
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
									role="option"
									aria-selected={option.id === value}
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