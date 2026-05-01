import client from './client';
import type { TenantInfo, TenantConfigUpdateRequest } from '../types';

export const tenantApi = {
  /** GET /admin/tenant — текущий тенант + подписка + конфиг */
  getCurrent: async (): Promise<TenantInfo> => {
    const res = await client.get<TenantInfo>('/admin/tenant');
    return res.data;
  },

  /** PUT /admin/tenant/config — обновить лейблы и название */
  updateConfig: async (data: TenantConfigUpdateRequest): Promise<TenantInfo> => {
    const res = await client.put<TenantInfo>('/admin/tenant/config', data);
    return res.data;
  },
};
