import api from './axios';

export const getProjects =
	async () => {

		const response =
			await api.get(
				'/projectCommission'
			);

		return response.data;
	};