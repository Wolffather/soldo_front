// ── Event ──

export interface Event {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  price?: number;
  status?: string;
  createdAt: string;
  availableSpots?: number;
}

export interface EventFormData {
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  price?: number;
  status?: string;
}

// ── Booking ──

export interface Booking {
  id: number;
  eventId: number;
  status: BookingStatus;
  eventTitle?: string;
  paymentStatus?: string;
  amountDue?: number;
  amountPaid?: number;
  paymentDeadline?: string;
  createdAt: string;
  /** Есть ли у участника сертификат ПФДО */
  hasCertificate?: boolean;
  /** Поля гостевых бронирований (без аккаунта) */
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  /** Сводка по документам бронирования */
  documentTotal?: number;
  documentSigned?: number;
  documentRequireSignature?: number;
  notes?: string;
}

export interface AdminBookingRequest {
  eventId: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  hasCertificate?: boolean;
  status?: BookingStatus;
  notes?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

// ── Booking Summary ──

export interface BookingSummary {
  eventId: number;
  eventTitle: string;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  availableSeats: number;
}

// ── Document Template ──

export interface DocumentTemplate {
  id: number;
  name: string;
  description?: string;
  fileUrl?: string;
  categoryFormat: string;
  isRequired: boolean;
  /** true — требует электронной подписи, false — только ознакомление */
  requiresSignature: boolean;
  createdAt?: string;
}

// ── Booking Document (with signature status) ──

export interface BookingDocument {
  id: number;
  bookingId: number;
  eventTitle?: string;
  templateId?: number;
  templateName?: string;
  templateDescription?: string;
  templateFileUrl?: string;
  templateIsRequired?: boolean;
  templateCategoryFormat?: string;
  /** true — требует электронной подписи; false — только ознакомление */
  templateRequiresSignature?: boolean;
  delivered: boolean;
  deliveredAt?: string;
  archived?: boolean;
  signerName?: string;
  signedAt?: string;
  /** Данные договора (паспорт, адрес), зафиксированные при подписании — JSON строка */
  filledData?: string;
}

// ── Pagination ──

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── Widget ──

export interface WidgetConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonTextColor: string;
  borderRadius: string;
  fontFamily: string;
  showCategoryStep: boolean;
  successMessage: string;
  customCss?: string;
  categoryStepTitle: string;
  buttonLabel: string;
}

export interface WidgetConfigUpdateRequest {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonTextColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  showCategoryStep?: boolean;
  successMessage?: string;
  customCss?: string;
  categoryStepTitle?: string;
  buttonLabel?: string;
}
