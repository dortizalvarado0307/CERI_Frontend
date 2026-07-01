import api  from './axios';

export const getRegion =
    async () => {
        const response =
            await api.get(
                '/regions'
            );
        return response.data?.data ?? response.data ?? [];
    };

export const getRegionById =
    async (id: string) => {
        const response =
            await api.get(
                `/regions/${id}`
            );
        return response.data?.data ?? response.data ?? null;
    }
