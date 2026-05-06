import client from './client';
import type { AdminBookingRequest, Booking, BookingSummary, Page } from '../types';

export const bookingApi = {
  getByEvent: async (eventId: number, page = 0, size = 20): Promise<Booking[]> => {
    const response = await client.get(`/bookings/event/${eventId}`, {
      params: { page, size },
    });
    return response.data;
  },

  getSummary: async (eventId: number): Promise<BookingSummary> => {
    const response = await client.get(`/bookings/event/${eventId}/summary`);
    return response.data;
  },

  getAllSummaries: async (): Promise<BookingSummary[]> => {
    const response = await client.get('/bookings/summary');
    return response.data;
  },

  confirm: async (id: number): Promise<Booking> => {
    const response = await client.patch(`/bookings/${id}/confirm`);
    return response.data;
  },

  cancel: async (id: number): Promise<Booking> => {
    const response = await client.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  updatePayment: async (id: number, paymentStatus: string, amountPaid?: number): Promise<Booking> => {
    const response = await client.patch(`/bookings/${id}/payment`, {
      paymentStatus,
      amountPaid,
    });
    return response.data;
  },

  getMonthlyRevenue: async (): Promise<number> => {
    const response = await client.get('/bookings/stats/monthly-revenue');
    return response.data;
  },

  /** Администратор создаёт бронирование вручную (гость без аккаунта) */
  adminCreate: async (data: AdminBookingRequest): Promise<Booking> => {
    const response = await client.post('/bookings/admin', data);
    return response.data;
  },

  /** Получить список документов для конкретного бронирования (admin) */
  getBookingDocuments: async (bookingId: number) => {
    const response = await client.get(`/admin/bookings/${bookingId}/documents`);
    return response.data as import('../types').BookingDocument[];
  },

  /** Отправить (или повторно отправить) письмо с документами участнику */
  sendDocuments: async (bookingId: number): Promise<import('../types').Booking> => {
    const response = await client.post(`/bookings/${bookingId}/send-documents`);
    return response.data;
  },
};