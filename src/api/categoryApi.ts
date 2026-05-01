import client from './client';
import type { EventCategory } from '../types';

export interface EventFormatOption {
  value: string;
  label: string;
}

export const categoryApi = {
  getAll: async (): Promise<EventCategory[]> => {
    const response = await client.get('/categories');
    return response.data;
  },

  getById: async (id: number): Promise<EventCategory> => {
    const response = await client.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: Omit<EventCategory, 'id'>): Promise<EventCategory> => {
    const response = await client.post('/categories', data);
    return response.data;
  },

  update: async (id: number, data: Omit<EventCategory, 'id'>): Promise<EventCategory> => {
    const response = await client.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteById: async (id: number): Promise<void> => {
    await client.delete(`/categories/${id}`);
  },

  getFormats: async (): Promise<EventFormatOption[]> => {
    const response = await client.get('/categories/formats');
    return response.data;
  },
};
