import api from './axios';
import type { CatalogItem } from '../models/CatalogItem';
import type { ApiResponse } from '../models/ApiResponse';


export const getClassificationMetaPopulation =
    async (signal?: AbortSignal): Promise<CatalogItem[]> => {
        const response =
            await api.get<ApiResponse<CatalogItem[]>>(
                '/clasificationMetaPopulation',
                { signal }
            );
        return response.data?.data ?? [];
    }


export const getClassificationMetaPopulationById =
    async (id: string): Promise<CatalogItem | null> => {
        const response =
            await api.get<ApiResponse<CatalogItem>>(
                `/clasificationMetaPopulation/${id}`
            );
        return response.data?.data ?? null;
    }