import api from './axios';
import type { PersonInCharge, PersonInChargeForm } from '../models/PersonInCharge';
import type { ApiResponse } from '../models/ApiResponse';

export const getPersonInCharge =
    async (signal?: AbortSignal): Promise<PersonInCharge[]> => {
        const response =
            await api.get<ApiResponse<PersonInCharge[]>>(
                '/personInCharge',
                { signal }
            );

        return response.data?.data ?? [];
    };


export const getPersonInChargeById =
    async (id: string): Promise<PersonInCharge | null> => {
        const response =
            await api.get<ApiResponse<PersonInCharge>>(
                `/personInCharge/${id}`
            );

        return response.data?.data ?? null;
    };


export const createPersonInCharge =
    async (personInCharge: PersonInChargeForm): Promise<PersonInCharge | null> => {
        const response =
            await api.post<ApiResponse<PersonInCharge>>(
                '/personInCharge',
                personInCharge
            );

        return response.data?.data ?? null;
}
