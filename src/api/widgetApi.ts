import client from './client';
import type { WidgetConfig, WidgetConfigUpdateRequest } from '../types';

export const widgetApi = {
  getConfig: async (): Promise<WidgetConfig> => {
    const res = await client.get<WidgetConfig>('/admin/widget/config');
    return res.data;
  },
  updateConfig: async (data: WidgetConfigUpdateRequest): Promise<WidgetConfig> => {
    const res = await client.put<WidgetConfig>('/admin/widget/config', data);
    return res.data;
  },
};
