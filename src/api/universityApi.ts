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
                '/universityBody'
            );
        return response.data;
};

