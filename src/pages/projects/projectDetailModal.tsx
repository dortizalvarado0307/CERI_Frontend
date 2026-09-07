import { useRef } from 'react';
import type { Project } from '../../models/Project';
import { useModalFocus } from '../../hooks/useModalFocus';

import './projectDetail.css';

type ProjectDetailModalProps = {
	project: Project;
	onClose: () => void;
};

const formatDate = (date: string | Date | null | undefined): string => {
	if (!date) return 'Sin fecha';
	return new Date(date).toLocaleDateString('es-ES');
};

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	useModalFocus(true, panelRef, onClose);

	return (
		<div className="project-detail" role="dialog" aria-modal="true">
			<div className="project-detail__backdrop" onClick={onClose} />
			<div className="project-detail__panel" ref={panelRef} tabIndex={-1} onClick={event => event.stopPropagation()}>
				<div className="project-detail__header">
					<div>
						<p className="project-detail__eyebrow">Detalle del proyecto</p>
						<h2 className="project-detail__title">{project.name}</h2>
					</div>
					<button type="button" className="project-detail__close" onClick={onClose}>
						Cerrar
					</button>
				</div>

				<div className="project-detail__body">
					<div className="project-detail__grid">
						<section className="project-detail__section project-detail__section--wide">
							<h3>Objetivo general</h3>
							<p className="project-detail__objective">{project.general_objective}</p>
						</section>

						<section className="project-detail__section">
							<h3>Datos principales</h3>
							<div className="project-detail__card">
								<div className="project-detail__card-item">
									<span className="project-detail__card-label">Tipo de iniciativa:</span>
									<span className="project-detail__card-value">{project.type_initiative?.name ?? 'Sin dato'}</span>
								</div>
								<div className="project-detail__card-item">
									<span className="project-detail__card-label">Área de gestión:</span>
									<span className="project-detail__card-value">{project.classification_management_area?.name ?? 'Sin dato'}</span>
								</div>
								<div className="project-detail__card-item">
									<span className="project-detail__card-label">Población meta:</span>
									<span className="project-detail__card-value">{project.clasification_meta_population?.name ?? 'Sin dato'}</span>
								</div>
								<div className="project-detail__card-item">
									<span className="project-detail__card-label">Código:</span>
									<span className="project-detail__card-value">{project.codigo ?? 'Sin código'}</span>
								</div>
								<div className="project-detail__card-item">
									<span className="project-detail__card-label">Fecha de inicio:</span>
									<span className="project-detail__card-value">{formatDate(project.fecha_inicio)}</span>
								</div>
								<div className="project-detail__card-item">
									<span className="project-detail__card-label">Fecha de fin:</span>
									<span className="project-detail__card-value">{formatDate(project.fecha_fin)}</span>
								</div>
							</div>
						</section>

						<section className="project-detail__section">
							<h3>Responsables</h3>
							<div className="project-detail__card">
								<div className="project-detail__card-item">
									<span className="project-detail__card-label">Persona a cargo:</span>
									<span className="project-detail__card-value">{project.person_in_charge ? `${project.person_in_charge.name} ${project.person_in_charge.lastname}` : 'Sin dato'}</span>
								</div>
								<div className="project-detail__card-item">
									<span className="project-detail__card-label">Unidad universitaria:</span>
									<span className="project-detail__card-value">{project.university_body?.name ?? 'Sin dato'}</span>
								</div>
							</div>
						</section>

						<section className="project-detail__section project-detail__section--wide">
							<h3>Clasificaciones</h3>
							<div className="project-detail__tags">
								<span className="project-detail__tag">{project.classification_management_area?.name}</span>
								<span className="project-detail__tag">{project.clasification_meta_population?.name}</span>
								<span className="project-detail__tag">{project.type_initiative?.name}</span>
							</div>
						</section>

						<section className="project-detail__section">
							<h3>Regiones</h3>
							{project.projects_commissions_region?.length ? (
								<ul className="project-detail__list">
									{project.projects_commissions_region.map(item => (
										<li key={item.id}>{item.region.name}</li>
									))}
								</ul>
							) : (
								<p className="project-detail__empty">Sin regiones asociadas.</p>
							)}
						</section>

						<section className="project-detail__section">
							<h3>Universidades</h3>
							{project.projects_commissions_university?.length ? (
								<ul className="project-detail__list">
									{project.projects_commissions_university.map(item => (
										<li key={item.id}>{item.university.name}</li>
									))}
								</ul>
							) : (
								<p className="project-detail__empty">Sin universidades asociadas.</p>
							)}
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}