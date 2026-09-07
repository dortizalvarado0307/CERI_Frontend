import api from './axios';
import type { CatalogItem } from '../models/CatalogItem';
import type { ApiResponse } from '../models/ApiResponse';

export const getClassificationManagementArea =
    async (signal?: AbortSignal): Promise<CatalogItem[]> => {
        const response =
            await api.get<ApiResponse<CatalogItem[]>>(
                '/clasificationManagementArea',
                { signal }
            );
        return response.data?.data ?? [];
    };

export const getClassificationManagementAreaById =
    async(id: string): Promise<CatalogItem | null> => {
        const response =
            await api.get<ApiResponse<CatalogItem>>(
                `/clasificationManagementArea/${id}`
            );
        return response.data?.data ?? null;
    }