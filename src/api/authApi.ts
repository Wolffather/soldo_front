import client from './client';
import type { LoginRequest, TokenResponse } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await client.post<TokenResponse>('/admin/auth/login', data);
    return response.data;
  },
};