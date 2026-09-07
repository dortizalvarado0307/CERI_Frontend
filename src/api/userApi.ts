import api from './axios';
import type { User, UserForm, UserUpdateForm } from '../models/User';
import type { ApiResponse } from '../models/ApiResponse';

export const getUsers =
    async (signal?: AbortSignal): Promise<User[]> => {
        const response =
            await api.get<ApiResponse<User[]>>(
                '/users',
                { signal }
            );
        return response.data?.data ?? [];
    };

export const createUser =
    async (userData: UserForm): Promise<User | null> => {
        const response =
            await api.post<ApiResponse<User>>(
                '/users',
                userData
            );
        return response.data?.data ?? null;
    };

export const updateUser =
    async (id: number, userData: UserUpdateForm): Promise<User | null> => {
        const response =
            await api.put<ApiResponse<User>>(
                `/users/${id}`,
                userData
            );
        return response.data?.data ?? null;
    };

export const deleteUser =
    async (id: number): Promise<void> => {
        await api.delete(`/users/${id}`);
    };