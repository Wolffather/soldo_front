import client from './client';
import type { Event, EventFormData, EventCategory, EventItem, Page } from '../types';

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

  getCategories: async (): Promise<EventCategory[]> => {
    const response = await client.get('/categories');
    return response.data;
  },

  getUpcoming: async (): Promise<EventItem[]> => {
    const response = await client.get('/events/upcoming');
    return response.data;
  },
};
