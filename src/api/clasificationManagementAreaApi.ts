import api from './axios';

export const getclassificationManagementArea =
    async () => {
        const response =
            await api.get(
                '/clasificationManagementArea'
            );
        return response.data?.data ?? response.data ?? [];
    };

export const getClassificationManagementAreaById =
    async(id: string) => {
        const response =
            await api.get(
                `/clasificationManagementArea/${id}`
            );
        return response.data?.data ?? response.data ?? null;
    }



  

