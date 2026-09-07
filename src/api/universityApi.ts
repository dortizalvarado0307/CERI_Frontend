import api from './axios';
import type { CatalogItem } from '../models/CatalogItem';
import type { ApiResponse } from '../models/ApiResponse';

export const getUniversities =
    async (signal?: AbortSignal): Promise<CatalogItem[]> => {

        const response =
            await api.get<ApiResponse<CatalogItem[]>>(
                '/universities',
                { signal }
            );

        return response.data?.data ?? [];
    };

export const getUniversityBodies =
    async (signal?: AbortSignal): Promise<CatalogItem[]> => {

        const response =
            await api.get<ApiResponse<CatalogItem[]>>(
                '/universitiesBody',
                { signal }
            );

        return response.data?.data ?? [];
    };

export const getUniversityById =
    async (id: string): Promise<CatalogItem | null> => {
        const response =
            await api.get<ApiResponse<CatalogItem>>(
                `/universities/${id}`
            );
        return response.data?.data ?? null;
    }