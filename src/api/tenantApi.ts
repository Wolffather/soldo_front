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

  /** POST /admin/tenant/telegram-bot — подключить Telegram-бота */
  connectTelegramBot: async (botToken: string): Promise<TenantInfo> => {
    const res = await client.post<TenantInfo>('/admin/tenant/telegram-bot', { botToken });
    return res.data;
  },

  /** DELETE /admin/tenant/telegram-bot — отключить Telegram-бота */
  disconnectTelegramBot: async (): Promise<TenantInfo> => {
    const res = await client.delete<TenantInfo>('/admin/tenant/telegram-bot');
    return res.data;
  },
};
