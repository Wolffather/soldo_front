import client from './client';
import type { Inquiry, InquiryForm, Page } from '../types';

export const inquiryApi = {
  /** Admin: list all inquiries */
  getAll: async (page = 0, size = 20): Promise<Page<Inquiry>> => {
    const response = await client.get('/inquiries', { params: { page, size } });
    return response.data;
  },

  /** Admin: delete an inquiry */
  delete: async (id: number): Promise<void> => {
    await client.delete(`/inquiries/${id}`);
  },

  /** Public: submit a feedback/contact form */
  submit: async (data: InquiryForm): Promise<void> => {
    await client.post('/public/inquiries', data);
  },
};
