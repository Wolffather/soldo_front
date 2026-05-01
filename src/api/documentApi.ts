import client from './client';
import type { DocumentTemplate } from '../types';

export const documentApi = {
  getAll: async (format?: string): Promise<DocumentTemplate[]> => {
    const params = format ? { format } : {};
    const response = await client.get('/document-templates', { params });
    return response.data;
  },

  getById: async (id: number): Promise<DocumentTemplate> => {
    const response = await client.get(`/document-templates/${id}`);
    return response.data;
  },

  create: async (data: Omit<DocumentTemplate, 'id' | 'createdAt'>): Promise<DocumentTemplate> => {
    const response = await client.post('/document-templates', data);
    return response.data;
  },

  update: async (id: number, data: Omit<DocumentTemplate, 'id' | 'createdAt'>): Promise<DocumentTemplate> => {
    const response = await client.put(`/document-templates/${id}`, data);
    return response.data;
  },

  deleteById: async (id: number): Promise<void> => {
    await client.delete(`/document-templates/${id}`);
  },

  uploadFile: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post<{ url: string }>('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
