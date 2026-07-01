import api from './axios';
import type { PersonInCharge, PersonInChargeForm } from '../models/PersonInCharge';

export const getPersonInCharge =
    async () => {
        const response =
            await api.get(
                '/personInCharge'
            );  

        return response.data?.data ?? response.data ?? [];
    };


export const getPersonInChargeById =
    async (id: string) => {
        const response =
            await api.get(
                `/personInCharge/${id}`
            );

        return response.data?.data ?? response.data ?? null;
    };


export const createPersonInCharge =
    async (personInCharge: PersonInChargeForm) => {
        const response =
            await api.post(
                '/personInCharge',
                personInCharge
            );

        return response.data?.data ?? response.data ?? null;
}
