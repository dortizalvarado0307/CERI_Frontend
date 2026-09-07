import api  from './axios';
import type { CatalogItem } from '../models/CatalogItem';
import type { ApiResponse } from '../models/ApiResponse';

export const getRegion =
    async (signal?: AbortSignal): Promise<CatalogItem[]> => {
        const response =
            await api.get<ApiResponse<CatalogItem[]>>(
                '/regions',
                { signal }
            );
        return response.data?.data ?? [];
    };

export const getRegionById =
    async (id: string): Promise<CatalogItem | null> => {
        const response =
            await api.get<ApiResponse<CatalogItem>>(
                `/regions/${id}`
            );
        return response.data?.data ?? null;
    }
