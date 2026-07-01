import api from './axios';

export const gettypeInitiative =
    async () => {
        const response =
            await api.get(
                '/typeInitiative'
            );
        return response.data?.data ?? response.data ?? [];
    }


export const getTypeInitiativeById =
    async (id: string) => {

        const response =
            await api.get(
                `/typeInitiative/${id}`
            );
        return response.data?.data ?? response.data ?? null;
    }
