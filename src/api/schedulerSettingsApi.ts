import client from './client';

export interface SchedulerSettingsDTO {
  eventReminderCron: string;
  paymentReminderCron: string;
  eventReminderDaysBefore: number;
  paymentReminderDaysBefore: number;
}

export const schedulerSettingsApi = {
  get: () => client.get<SchedulerSettingsDTO>('/admin/scheduler-settings'),
  update: (data: SchedulerSettingsDTO) =>
    client.put<SchedulerSettingsDTO>('/admin/scheduler-settings', data),
};
