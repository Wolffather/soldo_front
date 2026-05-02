import client from './client';
import type { AppConfig, AppConfigUpdateRequest } from '../types';

export const appConfigApi = {
  get: async (): Promise<AppConfig> => {
    const res = await client.get<AppConfig>('/admin/config');
    return res.data;
  },

  update: async (data: AppConfigUpdateRequest): Promise<AppConfig> => {
    const res = await client.put<AppConfig>('/admin/config', data);
    return res.data;
  },
};

export const tenantApi = appConfigApi;
