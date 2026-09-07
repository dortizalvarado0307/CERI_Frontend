import api from './axios';
import type { CatalogItem } from '../models/CatalogItem';
import type { ApiResponse } from '../models/ApiResponse';

export const getRoles =
    async (signal?: AbortSignal): Promise<CatalogItem[]> => {
        const response =
            await api.get<ApiResponse<CatalogItem[]>>(
                '/roles',
                { signal }
            );
        return response.data?.data ?? [];
    };