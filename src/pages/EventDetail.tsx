import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Table, Button, Spinner, Alert, Badge,
  Modal, Form,
} from 'react-bootstrap';
import {
  BsPencil, BsArrowLeft, BsXCircle, BsCashCoin, BsPlusCircle, BsEnvelope, BsTrash, BsUpload,
} from 'react-icons/bs';
import { eventApi } from '../api/eventApi';
import { bookingApi } from '../api/bookingApi';
import { documentApi } from '../api/documentApi';
import type { Event, Booking, BookingSummary, AdminBookingRequest, BookingDocument, DocumentTemplate, DocumentTemplateRequest } from '../types';
import { formatDate, formatDateTime } from '../utils/format';

const paymentBadge: Record<string, { bg: string; label: string }> = {
  NOT_REQUIRED: { bg: 'secondary', label: 'Не требуется' },
  PENDING: { bg: 'warning', label: 'Ожидает оплаты' },
  PARTIALLY_PAID: { bg: 'info', label: 'Частично' },
  PAID: { bg: 'success', label: 'Оплачено' },
  REFUNDED: { bg: 'dark', label: 'Возврат' },
};

const EMPTY_FORM: AdminBookingRequest = {
  eventId: 0,
  guestName: '',
  guestPhone: '',
  guestEmail: '',
  hasCertificate: false,
  status: 'CONFIRMED',
  notes: '',
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // --- Create booking modal ---
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AdminBookingRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // --- Document detail modal ---
  const [docModalBookingId, setDocModalBookingId] = useState<number | null>(null);
  const [docsForBooking, setDocsForBooking] = useState<BookingDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [sendingDocs, setSendingDocs] = useState<number | null>(null);

  // --- Event document templates ---
  const [eventTemplates, setEventTemplates] = useState<DocumentTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState<DocumentTemplateRequest>({ name: '' });
  const [templateFormError, setTemplateFormError] = useState('');
  const [templateFormLoading, setTemplateFormLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    const eventId = Number(id);
    if (id && !isNaN(eventId)) {
      loadData(eventId);
    } else {
      setError('Некорректный ID события');
      setLoading(false);
    }
  }, [id]);

  const loadData = async (eventId: number) => {
    setLoading(true);
    setError('');
    try {
      const eventData = await eventApi.getById(eventId);
      setEvent(eventData);

      try {
        const bookingData = await bookingApi.getByEvent(eventId, 0, 100);
        setBookings(bookingData);
      } catch {
        setBookings([]);
      }

      try {
        const summaryData = await bookingApi.getSummary(eventId);
        setSummary(summaryData);
      } catch {
        setSummary(null);
      }

      try {
        const templates = await documentApi.getByEvent(eventId);
        setEventTemplates(templates);
      } catch {
        setEventTemplates([]);
      }
    } catch {
      setError('Ошибка загрузки события');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDocuments = async (bookingId: number) => {
    setSendingDocs(bookingId);
    try {
      await bookingApi.sendDocuments(bookingId);
      // Refresh docs if modal is open for this booking
      if (docModalBookingId === bookingId) {
        const docs = await bookingApi.getBookingDocuments(bookingId);
        setDocsForBooking(docs);
      }
    } catch {
      setError('Ошибка при отправке документов');
    } finally {
      setSendingDocs(null);
    }
  };

  const loadTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const templates = await documentApi.getByEvent(Number(id));
      setEventTemplates(templates);
    } catch {
      /* ignore */
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await documentApi.delete(templateId);
      setEventTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch {
      setError('Ошибка удаления шаблона');
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name?.trim()) {
      setTemplateFormError('Введите название документа');
      return;
    }
    setTemplateFormLoading(true);
    setTemplateFormError('');
    try {
      let fileUrl = templateForm.fileUrl;
      if (uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        const resp = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        if (resp.ok) {
          const data = await resp.json();
          fileUrl = data.filename ?? data.fileUrl ?? fileUrl;
        }
      }
      await documentApi.create({ ...templateForm, fileUrl, eventId: Number(id) });
      setShowTemplateModal(false);
      setTemplateForm({ name: '' });
      setUploadFile(null);
      loadTemplates();
    } catch {
      setTemplateFormError('Ошибка создания шаблона');
    } finally {
      setTemplateFormLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    setActionLoading(bookingId);
    try {
      await bookingApi.cancel(bookingId);
      loadData(Number(id));
    } catch {
      setError('Ошибка отмены');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayment = async (bookingId: number, status: string) => {
    setActionLoading(bookingId);
    try {
      await bookingApi.updatePayment(bookingId, status);
      loadData(Number(id));
    } catch {
      setError('Ошибка обновления оплаты');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenDocModal = async (bookingId: number) => {
    setDocModalBookingId(bookingId);
    setDocsLoading(true);
    setDocsForBooking([]);
    try {
      const docs = await bookingApi.getBookingDocuments(bookingId);
      setDocsForBooking(docs);
    } catch {
      setDocsForBooking([]);
    } finally {
      setDocsLoading(false);
    }
  };

  const closeDocModal = () => {
    setDocModalBookingId(null);
    setDocsForBooking([]);
  };

  const openModal = () => {
    setForm({ ...EMPTY_FORM, eventId: Number(id) });
    setFormError('');
    setShowModal(true);
  };

  const handleFormChange = (field: keyof AdminBookingRequest, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!form.guestName?.trim()) {
      setFormError('Введите имя участника');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      await bookingApi.adminCreate(form);
      setShowModal(false);
      loadData(Number(id));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? 'Ошибка при создании бронирования');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!event) {
    return <Alert variant="danger">Событие не найдено</Alert>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/admin/events')}
          >
            <BsArrowLeft />
          </Button>
          <h4 className="mb-0">{event.title}</h4>
          {event.price ? (
            <Badge bg="success">{Number(event.price).toLocaleString('ru-RU')} ₽</Badge>
          ) : (
            <Badge bg="secondary">Бесплатно</Badge>
          )}
        </div>
        <Button variant="warning" onClick={() => navigate(`/admin/events/${id}/edit`)}>
          <BsPencil className="me-1" /> Редактировать
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header><strong>Информация</strong></Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Дата начала:</strong> {event.startDate ? formatDate(event.startDate) : '—'}</p>
                  <p><strong>Дата окончания:</strong> {event.endDate ? formatDate(event.endDate) : '—'}</p>
                  <p><strong>Макс. участников:</strong> {event.maxParticipants ?? '—'}</p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Цена:</strong>{' '}
                    {event.price
                      ? `${Number(event.price).toLocaleString('ru-RU')} ₽`
                      : 'Бесплатно'}
                  </p>
                  <p><strong>Создано:</strong> {formatDateTime(event.createdAt)}</p>
                </Col>
              </Row>
              {event.description && (
                <div className="mt-2">
                  <strong>Описание:</strong>
                  <p className="mt-1 text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                    {event.description}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {summary && (
            <Card>
              <Card.Header><strong>Сводка</strong></Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Всего:</span>
                  <strong>{summary.totalBookings}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-success">Подтверждено:</span>
                  <strong className="text-success">{summary.confirmedBookings}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-warning">Ожидает:</span>
                  <strong className="text-warning">{summary.pendingBookings}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-danger">Отменено:</span>
                  <strong className="text-danger">{summary.cancelledBookings}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Свободных мест:</span>
                  <strong className={summary.availableSeats <= 3 ? 'text-danger' : 'text-success'}>
                    {summary.availableSeats}
                  </strong>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Bookings */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Бронирования ({bookings.length})</strong>
          <Button variant="success" size="sm" onClick={openModal}>
            <BsPlusCircle className="me-1" /> Добавить бронирование
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Участник</th>
                <th>Вариант</th>
                <th>Оплата</th>
                <th>Сумма</th>
                <th>Дата</th>
                <th className="text-center">Документы</th>
                <th className="text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const payment = paymentBadge[booking.paymentStatus ?? ''];
                return (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>
                      <div>
                        {booking.guestName ?? '—'}
                        {booking.status === 'CANCELLED' && (
                          <Badge bg="danger" className="ms-1" style={{ fontSize: '0.65rem' }}>Отменено</Badge>
                        )}
                      </div>
                      {(booking.guestPhone || booking.guestEmail) && (
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {booking.guestPhone && <span>{booking.guestPhone}</span>}
                          {booking.guestPhone && booking.guestEmail && ' · '}
                          {booking.guestEmail && <span>{booking.guestEmail}</span>}
                        </div>
                      )}
                      {booking.notes && (
                        <div className="text-muted fst-italic" style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                          💬 {booking.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      {booking.priceOptionName
                        ? <Badge bg="info" text="dark" style={{ fontSize: '0.78rem' }}>{booking.priceOptionName}</Badge>
                        : <span className="text-muted small">—</span>}
                    </td>
                    <td>
                      {payment ? <Badge bg={payment.bg}>{payment.label}</Badge> : '—'}
                    </td>
                    <td>
                      {booking.amountPaid ?? 0} / {booking.amountDue ?? 0} ₽
                      {booking.hasCertificate && (
                        <Badge bg="success" pill className="ms-1" style={{ fontSize: '0.65rem' }} title="Есть сертификат ПФДО">
                          🎫 ПФДО
                        </Badge>
                      )}
                    </td>
                    <td>{formatDateTime(booking.createdAt)}</td>
                    <td className="text-center">
                      {(() => {
                        const total = booking.documentRequireSignature ?? 0;
                        if (total === 0) {
                          return <span className="text-muted small">—</span>;
                        }
                        const signed = booking.documentSigned ?? 0;
                        if (signed >= total) {
                          return (
                            <Button
                              variant="link"
                              className="p-0 text-success fw-semibold"
                              style={{ fontSize: '0.85rem' }}
                              onClick={() => handleOpenDocModal(booking.id)}
                              title="Посмотреть документы"
                            >
                              ✅ {signed}/{total}
                            </Button>
                          );
                        }
                        return (
                          <Button
                            variant="link"
                            className="p-0 text-warning fw-semibold"
                            style={{ fontSize: '0.85rem' }}
                            onClick={() => handleOpenDocModal(booking.id)}
                            title="Посмотреть документы"
                          >
                            ⏳ {signed}/{total}
                          </Button>
                        );
                      })()}
                    </td>
                    <td className="text-center text-nowrap">
                      {booking.status !== 'CANCELLED' && (
                        <Button
                          variant="outline-danger" size="sm" className="me-1"
                          onClick={() => handleCancel(booking.id)}
                          disabled={actionLoading === booking.id}
                          title="Отменить"
                        >
                          {actionLoading === booking.id
                            ? <Spinner size="sm" />
                            : <BsXCircle />}
                        </Button>
                      )}
                      {booking.paymentStatus === 'PENDING' && (
                        <Button
                          variant="outline-success" size="sm" className="me-1"
                          onClick={() => handlePayment(booking.id, 'PAID')}
                          disabled={actionLoading === booking.id}
                          title="Отметить оплату"
                        >
                          {actionLoading === booking.id
                            ? <Spinner size="sm" />
                            : <BsCashCoin />}
                        </Button>
                      )}
                      {eventTemplates.length > 0 && booking.guestEmail && booking.status !== 'CANCELLED' && (
                        <Button
                          variant="outline-primary" size="sm"
                          onClick={() => handleSendDocuments(booking.id)}
                          disabled={sendingDocs === booking.id}
                          title="Отправить документы на email"
                        >
                          {sendingDocs === booking.id ? <Spinner size="sm" /> : <BsEnvelope />}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Нет бронирований
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* ── Modal: документы бронирования ── */}
      <Modal show={docModalBookingId !== null} onHide={closeDocModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Документы бронирования #{docModalBookingId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {docsLoading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
            </div>
          ) : docsForBooking.length === 0 ? (
            <p className="text-muted text-center py-3">Нет документов для этого бронирования</p>
          ) : (
            <Table size="sm" hover responsive>
              <thead className="table-light">
                <tr>
                  <th>Документ</th>
                  <th>Тип</th>
                  <th>Статус</th>
                  <th>Подписант / Дата</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {docsForBooking.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div>{doc.templateName}</div>
                      {doc.templateDescription && (
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {doc.templateDescription}
                        </div>
                      )}
                    </td>
                    <td>
                      {doc.templateRequiresSignature
                        ? <Badge bg="primary">✍ Подпись</Badge>
                        : <Badge bg="secondary">👁 Ознакомление</Badge>}
                    </td>
                    <td>
                      {doc.archived
                        ? <Badge bg="secondary">Архив</Badge>
                        : doc.delivered
                          ? <Badge bg="success">Подписан</Badge>
                          : <Badge bg="warning" text="dark">Ожидает</Badge>}
                    </td>
                    <td>
                      {doc.signerName && (
                        <div style={{ fontSize: '0.85rem' }}>{doc.signerName}</div>
                      )}
                      {doc.signedAt && (
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {formatDateTime(doc.signedAt)}
                        </div>
                      )}
                      {!doc.signerName && !doc.signedAt && (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {doc.emailSentAt ? (
                        <div>
                          <Badge bg="success" style={{ fontSize: '0.7rem' }}>✉ Отправлено</Badge>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {formatDateTime(doc.emailSentAt)}
                          </div>
                        </div>
                      ) : (
                        <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>Не отправлено</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          {docModalBookingId !== null && (
            <Button
              variant="primary"
              onClick={() => handleSendDocuments(docModalBookingId)}
              disabled={sendingDocs === docModalBookingId}
            >
              {sendingDocs === docModalBookingId
                ? <><Spinner size="sm" className="me-1" />Отправка...</>
                : <><BsEnvelope className="me-1" />Отправить документы</>}
            </Button>
          )}
          <Button variant="secondary" onClick={closeDocModal}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: создать бронирование вручную ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Добавить бронирование</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <Alert variant="danger" className="py-2">{formError}</Alert>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Имя участника <span className="text-danger">*</span></Form.Label>
              <Form.Control
                placeholder="Иванов Иван Иванович"
                value={form.guestName ?? ''}
                onChange={(e) => handleFormChange('guestName', e.target.value)}
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Телефон</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={form.guestPhone ?? ''}
                    onChange={(e) => handleFormChange('guestPhone', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="example@mail.ru"
                    value={form.guestEmail ?? ''}
                    onChange={(e) => handleFormChange('guestEmail', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {event?.priceOptions && event.priceOptions.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Вариант участия</Form.Label>
                <Form.Select
                  value={form.priceOptionId ?? ''}
                  onChange={(e) => handleFormChange('priceOptionId', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">— не выбрано —</option>
                  {event.priceOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} — {o.price.toLocaleString('ru-RU')} ₽
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="hasCertificate"
                label="Есть сертификат ПФДО"
                checked={form.hasCertificate ?? false}
                onChange={(e) => handleFormChange('hasCertificate', e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label>Примечание</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Доп. информация для администратора..."
                value={form.notes ?? ''}
                onChange={(e) => handleFormChange('notes', e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Отмена
          </Button>
          <Button variant="success" onClick={handleCreate} disabled={formLoading}>
            {formLoading ? <Spinner size="sm" className="me-1" /> : null}
            Создать бронирование
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Документы события ── */}
      <Card className="mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <strong>Документы события</strong>
            <span className="text-muted ms-2" style={{ fontSize: '0.85rem' }}>
              — отправляются участнику автоматически при бронировании
            </span>
          </div>
          <Button variant="outline-primary" size="sm" onClick={() => {
            setTemplateForm({ name: '' });
            setUploadFile(null);
            setTemplateFormError('');
            setShowTemplateModal(true);
          }}>
            <BsPlusCircle className="me-1" /> Добавить документ
          </Button>
        </Card.Header>
        <Card.Body className={eventTemplates.length === 0 ? '' : 'p-0'}>
          {templatesLoading ? (
            <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
          ) : eventTemplates.length === 0 ? (
            <p className="text-muted mb-0">
              Нет прикреплённых документов. Добавьте шаблон — он будет отправляться на email при каждом новом бронировании.
            </p>
          ) : (
            <Table size="sm" hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Название</th>
                  <th>Файл</th>
                  <th>Тип</th>
                  <th className="text-center">Действия</th>
                </tr>
              </thead>
              <tbody>
                {eventTemplates.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div>{t.name}</div>
                      {t.description && (
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>{t.description}</div>
                      )}
                    </td>
                    <td>
                      {t.fileUrl ? (
                        <a href={`/api/files/${t.fileUrl}`} target="_blank" rel="noreferrer"
                           style={{ fontSize: '0.85rem' }}>
                          <BsUpload className="me-1" />{t.fileUrl}
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {t.requiresSignature
                        ? <Badge bg="primary">✍ Подпись</Badge>
                        : <Badge bg="secondary">👁 Ознакомление</Badge>}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-danger" size="sm"
                        onClick={() => handleDeleteTemplate(t.id)}
                        title="Удалить"
                      >
                        <BsTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* ── Modal: добавить документ ── */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Добавить документ к событию</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {templateFormError && <Alert variant="danger" className="py-2">{templateFormError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Название <span className="text-danger">*</span></Form.Label>
              <Form.Control
                placeholder="Согласие на обработку персональных данных"
                value={templateForm.name}
                onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                placeholder="Краткое описание документа..."
                value={templateForm.description ?? ''}
                onChange={(e) => setTemplateForm((p) => ({ ...p, description: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Файл документа (PDF / Word)</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0] ?? null;
                  setUploadFile(file);
                  if (file) setTemplateForm((p) => ({ ...p, fileUrl: file.name }));
                }}
              />
              <Form.Text className="text-muted">
                Файл загрузится на сервер при сохранении. Ссылка для скачивания включается в письмо участнику.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleCreateTemplate} disabled={templateFormLoading}>
            {templateFormLoading ? <Spinner size="sm" className="me-1" /> : null}
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
