import type { Project } from '../models/Project';

const formatDate = (date: string | Date | null | undefined): string => {
	if (!date) return '';
	return new Date(date).toLocaleDateString('es-ES');
};

const buildRows = (projects: Project[]): string[][] => {
	return projects.map(p => [
		p.name,
		p.codigo ?? '',
		p.type_initiative?.name ?? '',
		p.classification_management_area?.name ?? '',
		p.clasification_meta_population?.name ?? '',
		p.person_in_charge ? `${p.person_in_charge.name} ${p.person_in_charge.lastname}` : '',
		p.university_body?.name ?? '',
		formatDate(p.fecha_inicio),
		formatDate(p.fecha_fin),
		p.projects_commissions_region?.map(item => item.region.name).join(', ') ?? '',
		p.projects_commissions_university?.map(item => item.university.name).join(', ') ?? '',
	]);
};

const COLUMNS = [
	'Nombre',
	'Código',
	'Tipo de iniciativa',
	'Área de gestión',
	'Población meta',
	'Persona a cargo',
	'Unidad universitaria',
	'Fecha inicio',
	'Fecha fin',
	'Regiones',
	'Universidades',
];

export const exportProjectsPdf = async (projects: Project[]) => {
	const { default: jsPDF } = await import('jspdf');
	const { default: autoTable } = await import('jspdf-autotable');

	const doc = new jsPDF({ orientation: 'landscape' });

	doc.setFontSize(16);
	doc.text('Listado de Proyectos', 14, 20);
	doc.setFontSize(10);
	doc.text(`Total: ${projects.length} proyecto(s) — Exportado: ${new Date().toLocaleString('es-ES')}`, 14, 27);

	autoTable(doc, {
		head: [COLUMNS],
		body: buildRows(projects),
		startY: 32,
		styles: { fontSize: 7, cellPadding: 2 },
		headStyles: { fillColor: [37, 99, 235], textColor: 255 },
		columnStyles: { 0: { cellWidth: 50 } },
	});

	doc.save(`proyectos_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportProjectsExcel = async (projects: Project[]) => {
	const ExcelJS = (await import('exceljs')).default;

	const wb = new ExcelJS.Workbook();
	wb.creator = 'CERI';
	wb.created = new Date();

	const ws = wb.addWorksheet('Proyectos', {
		views: [{ state: 'frozen', ySplit: 5 }],
	});

	ws.mergeCells('A1:K1');
	ws.getCell('A1').value = 'Listado de Proyectos';
	ws.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
	ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
	ws.getRow(1).height = 28;

	ws.mergeCells('A2:K2');
	ws.getCell('A2').value = `Total: ${projects.length} proyecto(s)`;
	ws.getCell('A2').font = { size: 11, bold: true, color: { argb: 'FF374151' } };
	ws.getCell('A2').alignment = { horizontal: 'center' };

	ws.mergeCells('A3:K3');
	ws.getCell('A3').value = `Exportado: ${new Date().toLocaleString('es-ES')}`;
	ws.getCell('A3').font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
	ws.getCell('A3').alignment = { horizontal: 'center' };

	ws.getRow(4).height = 6;

	const headerRow = ws.getRow(5);
	COLUMNS.forEach((col, i) => {
		const cell = headerRow.getCell(i + 1);
		cell.value = col;
		cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
		cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
		cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
		cell.border = {
			top: { style: 'thin', color: { argb: 'FF1D4ED8' } },
			left: { style: 'thin', color: { argb: 'FF1D4ED8' } },
			bottom: { style: 'thin', color: { argb: 'FF1D4ED8' } },
			right: { style: 'thin', color: { argb: 'FF1D4ED8' } },
		};
	});
	ws.getRow(5).height = 22;

	const dataRows = buildRows(projects);
	dataRows.forEach((row, rowIdx) => {
		const excelRow = ws.getRow(6 + rowIdx);
		const isEven = rowIdx % 2 === 0;
		row.forEach((val, colIdx) => {
			const cell = excelRow.getCell(colIdx + 1);
			cell.value = val || '';
			cell.font = { size: 10, color: { argb: 'FF1F2937' } };
			cell.alignment = { vertical: 'middle', wrapText: true };
			cell.border = {
				top: { style: 'hair', color: { argb: 'FFE5E7EB' } },
				left: { style: 'hair', color: { argb: 'FFE5E7EB' } },
				bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
				right: { style: 'hair', color: { argb: 'FFE5E7EB' } },
			};
			if (isEven) {
				cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
			}
		});
	});

	ws.columns = [
		{ width: 32 }, { width: 16 }, { width: 22 }, { width: 22 }, { width: 22 },
		{ width: 24 }, { width: 24 }, { width: 14 }, { width: 14 }, { width: 28 }, { width: 28 },
	];

	ws.autoFilter = {
		from: { row: 5, column: 1 },
		to: { row: 5 + dataRows.length, column: COLUMNS.length },
	};

	const buffer = await wb.xlsx.writeBuffer();
	const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `proyectos_${new Date().toISOString().split('T')[0]}.xlsx`;
	link.click();
	URL.revokeObjectURL(url);
};