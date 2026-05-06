// ── Event ──

export interface EventPriceOption {
  id?: number;
  name: string;
  price: number;
}

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
  priceOptions?: EventPriceOption[];
}

export interface EventFormData {
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  price?: number;
  status?: string;
  priceOptions?: EventPriceOption[];
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
  priceOptionId?: number;
  priceOptionName?: string;
}

export interface AdminBookingRequest {
  eventId: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  hasCertificate?: boolean;
  status?: BookingStatus;
  notes?: string;
  priceOptionId?: number;
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
  eventId?: number;
  categoryFormat?: string;
  isRequired?: boolean;
  /** true — требует электронной подписи, false — только ознакомление */
  requiresSignature?: boolean;
  createdAt?: string;
}

export interface DocumentTemplateRequest {
  name: string;
  description?: string;
  fileUrl?: string;
  eventId?: number;
  isRequired?: boolean;
  requiresSignature?: boolean;
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
  filledData?: string;
  /** null — письмо ещё не отправлялось */
  emailSentAt?: string;
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
