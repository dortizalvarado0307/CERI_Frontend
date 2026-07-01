import api from './axios';

export const UniversityBody = 
    async () => {
        const response = 
            await api.get(
                '/universitiesBody'
            );
        return response.data?.data ?? response.data ?? [];
    }


export const getUniversityBodyById =
    async (id: string) => {

        const response =
            await api.get(
                `/universitiesBody/${id}`
            );
        return response.data?.data ?? response.data ?? null;
    }
    
