import api from './axios';


export const getClassificationMetaPopulation = 
    async () => {
        const response = 
            await api.get(
                '/clasificationMetaPopulation'
            );
        return response.data?.data ?? response.data ?? [];
    }


export const getClassificationMetaPopulationById =
    async (id: string) => {
        const response =
            await api.get(
                `/clasificationMetaPopulation/${id}`
            );
        return response.data?.data ?? response.data ?? null;
    }
    
