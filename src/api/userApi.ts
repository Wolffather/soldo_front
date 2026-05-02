import client from './client';
import type { User } from '../types';

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await client.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await client.get(`/users/${id}`);
    return response.data;
  },
};
