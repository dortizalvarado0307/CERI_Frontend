import type { ProjectFilters, ProjectForm } from '../models/Project';
import api from './axios';

export const getProjects =
	async () => {

		const response =
			await api.get(
				'/projectCommission'
			);

		return response.data?.data ?? response.data ?? [];
	};

export const getProjectById =
	async (id: string) => {
		const response =
			await api.get(
				`/projectCommission/${id}`
			);
		return response.data?.data ?? response.data ?? null;
	}

export const getProjectComissionByFilters =
	async (filters: ProjectFilters) => {
		const queryParams = new URLSearchParams();
		const normalizedFilters = Object.fromEntries(
			Object.entries(filters)
				.filter(([, values]) => Array.isArray(values) && values.length > 0)
				.map(([key, values]) => [key, values.map((value: number) => Number(value))])
		);

		Object.entries(normalizedFilters).forEach(([key, values]) => {
			(values as number[]).forEach((value: number) => {
				queryParams.append(key, String(value));
			});
		});

		const response =
			await api.get(
				`/projectCommission/getByFilters?${queryParams.toString()}`
			);

		return response.data?.data ?? response.data ?? [];
	};


export const createProject =
	async (projectData: ProjectForm) => {
		const response =
			await api.post(
				'/projectCommission',
				projectData
			);
		return response.data;
}

export const updateProject =
	async (projectId: number, projectData: ProjectForm) => {
		const response =
			await api.put(
				`/projectCommission/${projectId}`,
				projectData
			);
		return response.data;
	};


export async function deleteProject(projectId: number) {
	const response = await api.delete(
		`/projectCommission/${projectId}`
	);

	return response.data;
}