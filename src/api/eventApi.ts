import client from './client';
import type { Event, EventFormData, Page } from '../types';

export const eventApi = {
  getAll: async (page = 0, size = 10): Promise<Page<Event>> => {
    const response = await client.get('/events', { params: { page, size } });
    return response.data;
  },

  getById: async (id: number): Promise<Event> => {
    const response = await client.get(`/events/${id}`);
    return response.data;
  },

  create: async (data: EventFormData): Promise<Event> => {
    const response = await client.post('/events', data);
    return response.data;
  },

  update: async (id: number, data: EventFormData): Promise<Event> => {
    const response = await client.put(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/events/${id}`);
  },

  getAllList: async (): Promise<Event[]> => {
    const response = await client.get('/events', { params: { page: 0, size: 200 } });
    return (response.data as Page<Event>).content;
  },
};
