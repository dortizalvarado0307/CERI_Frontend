import api from './axios';

export const getUniversities =
    async () => {

        const response =
            await api.get(
                '/universities'
            );

        return response.data?.data ?? response.data ?? [];
    };

export const getUniversityBodies =
    async () => {

        const response =
            await api.get(
                '/universitiesBody'
            );

        return response.data?.data ?? response.data ?? [];
    };

export const getUniversityById =
    async (id: string) => {
        const response =
            await api.get(
                `/universities/${id}`
            );
        return response.data?.data ?? response.data ?? null;
    }
