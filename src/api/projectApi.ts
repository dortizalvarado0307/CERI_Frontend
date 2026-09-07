import type { Project, ProjectForm } from '../models/Project';
import type { ApiResponse } from '../models/ApiResponse';
import api from './axios';

export const getProjects =
	async (signal?: AbortSignal): Promise<Project[]> => {

		const response =
			await api.get<ApiResponse<Project[]>>(
				'/projectCommission',
				{ signal }
			);

		return response.data?.data ?? [];
	};

export const getProjectById =
	async (id: string): Promise<Project | null> => {
		const response =
			await api.get<ApiResponse<Project>>(
				`/projectCommission/${id}`
			);
		return response.data?.data ?? null;
	}

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