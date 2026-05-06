import client from './client';

export const settingsApi = {
  getAll: async (): Promise<Record<string, string>> => {
    const response = await client.get('/admin/settings');
    return response.data;
  },

  saveAll: async (settings: Record<string, string>): Promise<Record<string, string>> => {
    const response = await client.put('/admin/settings', settings);
    return response.data;
  },
};
