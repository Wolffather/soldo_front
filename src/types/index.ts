// ── Auth ──

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  token: string;
  role: string;
  userId: number;
}

// ── User ──

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  role: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

// ── Event Category ──

export interface EventCategory {
  id: number;
  name: string;
  format: string;
  description?: string;
  iconUrl?: string;
}

// ── Event ──

export interface Event {
  id: number;
  title: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  price?: number;
  /** Цена при наличии сертификата ПФДО. Только для SESSION_OUTDOOR событий. */
  priceWithCertificate?: number;
  gameMaster?: string;
  status?: string;
  createdAt: string;
  /** Available spots, computed from summary */
  availableSpots?: number;
}

export interface EventFormData {
  title: string;
  description: string;
  categoryName?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  price?: number;
  /** Цена при наличии сертификата ПФДО. Только для SESSION_OUTDOOR событий. */
  priceWithCertificate?: number;
  gameMaster?: string;
  status?: string;
}

// ── Booking ──

export interface Booking {
  id: number;
  userId?: number;
  eventId: number;
  status: BookingStatus;
  userName?: string;
  eventTitle?: string;
  categoryFormat?: string;
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
  /** Telegram chat ID — заполнен, если бронирование создано через бота */
  telegramChatId?: number;
  /** Сводка по документам бронирования */
  documentTotal?: number;
  documentSigned?: number;
  documentRequireSignature?: number;
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

// ── Participant Profile ──

export interface ParticipantProfile {
  id: number;
  userId: number;
  fullName: string;
  birthDate?: string;
  medicalNotes?: string;
  parentFullName: string;
  parentPhone: string;
  parentEmail?: string;
  consentPersonalData: boolean;
  consentPhotoVideo: boolean;
  // ── Паспортные данные родителя ──────────────────────────────────────────
  parentBirthDate?: string;
  parentPassportSeries?: string;
  parentPassportNumber?: string;
  parentPassportIssuedBy?: string;
  parentPassportIssuedDate?: string;
  registrationAddress?: string;
  // ── Документ ребёнка ───────────────────────────────────────────────────
  childDocumentType?: string;   // 'BIRTH_CERTIFICATE' | 'PASSPORT'
  childDocumentSeries?: string;
  childDocumentNumber?: string;
}

// ── Notification ──

export interface Notification {
  id: number;
  userId: number;
  type: string;
  message: string;
  sent: boolean;
  sentAt?: string;
  scheduledAt?: string;
  createdAt: string;
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

// ── Inquiry (Feedback form) ──

export interface Inquiry {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  eventTitle?: string;
  message?: string;
  createdAt?: string;
}

// ── Pagination ──

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── Public Site ──

export interface EventItem {
  id: number;
  title: string;
  description?: string;
  categoryName?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  price?: number;
  status?: string;
  availableSpots?: number;
}

export interface InquiryForm {
  name: string;
  phone: string;
  email: string;
  eventTitle: string;
  message: string;
}

// ── Tenant ──

export interface TenantInfo {
  id: number;
  slug: string;
  name: string;
  domain?: string;
  status: string;
  // Subscription
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  maxEvents?: number;
  maxBookingsPerMonth?: number;
  maxAdminUsers?: number;
  customDomainEnabled: boolean;
  apiAccessEnabled: boolean;
  // Config labels
  eventLabel: string;
  participantLabel: string;
  bookingLabel: string;
  // Telegram bot
  telegramBotEnabled: boolean;
  telegramBotUsername?: string;
}

export interface TenantConfigUpdateRequest {
  eventLabel: string;
  participantLabel: string;
  bookingLabel: string;
  name?: string;
  domain?: string;
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
  tenantSlug: string;
  tenantName: string;
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
