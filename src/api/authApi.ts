import api from './axios';
import type { ApiResponse } from '../models/ApiResponse';

interface LoginData {
  token: string;
}

export const login = async (
  email: string,
  password: string
): Promise<ApiResponse<LoginData>> => {

  const response = await api.post<ApiResponse<LoginData>>(
    '/auth/login',
    {
      email,
      password
    }
  );

  return response.data;
};