import client from './client';
import type { User } from '../types';

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await client.get('/users');
    return response.data;
  },

  getById: async (telegramId: number): Promise<User> => {
    const response = await client.get(`/users/${telegramId}`);
    return response.data;
  },

  /** Выдать роль ADMIN пользователю по его внутреннему ID. */
  grantAdminRole: async (id: number): Promise<User> => {
    const response = await client.patch(`/users/${id}/role`);
    return response.data;
  },
};
