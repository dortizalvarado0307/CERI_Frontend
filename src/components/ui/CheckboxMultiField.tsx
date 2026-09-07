import { useMemo, useState } from 'react';
import type { CatalogOption } from '../../models/CatalogOption';
import { getOptionLabel } from '../../models/CatalogOption';

type CheckboxMultiFieldProps = {
	label: string;
	placeholder: string;
	options: CatalogOption[];
	selected: CatalogOption[];
	onToggle: (option: CatalogOption, checked: boolean) => void;
	helpText?: string;
	error?: string;
};

export function CheckboxMultiField({
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