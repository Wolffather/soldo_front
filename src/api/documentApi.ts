import client from './client';
import type { DocumentTemplate, DocumentTemplateRequest } from '../types';

export const documentApi = {
  getByEvent: async (eventId: number): Promise<DocumentTemplate[]> => {
    const response = await client.get('/document-templates', { params: { eventId } });
    return response.data;
  },

  create: async (data: DocumentTemplateRequest): Promise<DocumentTemplate> => {
    const response = await client.post('/document-templates', data);
    return response.data;
  },

  update: async (id: number, data: DocumentTemplateRequest): Promise<DocumentTemplate> => {
    const response = await client.put(`/document-templates/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/document-templates/${id}`);
  },
};
