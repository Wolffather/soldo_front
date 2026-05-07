import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion, Badge, Button, Spinner, Alert, Table, Modal,
} from 'react-bootstrap';
import { BsCashCoin, BsTrash } from 'react-icons/bs';
import { bookingApi } from '../api/bookingApi';
import type { BookingSummary, Booking } from '../types';
import { formatDateTime } from '../utils/format';

const paymentBadge: Record<string, { bg: string; label: string }> = {
  NOT_REQUIRED: { bg: 'secondary', label: 'Не требуется' },
  PENDING: { bg: 'warning', label: 'Ожидает оплаты' },
  PARTIALLY_PAID: { bg: 'info', label: 'Частично' },
  PAID: { bg: 'success', label: 'Оплачено' },
  REFUNDED: { bg: 'dark', label: 'Возврат' },
};

export default function Bookings() {
  const [summaries, setSummaries] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingsMap, setBookingsMap] = useState<Record<number, Booking[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ bookingId: number; eventId: number } | null>(null);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      const data = await bookingApi.getAllSummaries();
      setSummaries(data);
    } catch {
      setError('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (eventId: number) => {
    if (bookingsMap[eventId] !== undefined) return;
    setLoadingMap((prev) => ({ ...prev, [eventId]: true }));
    try {
      const data = await bookingApi.getByEvent(eventId, 0, 200);
      setBookingsMap((prev) => ({ ...prev, [eventId]: data }));
    } catch {
      setBookingsMap((prev) => ({ ...prev, [eventId]: [] }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const { bookingId, eventId } = deleteConfirm;
    setDeleteConfirm(null);
    setActionLoading(bookingId);
    try {
      await bookingApi.delete(bookingId);
      const updated = await bookingApi.getByEvent(eventId, 0, 200);
      setBookingsMap((prev) => ({ ...prev, [eventId]: updated }));
      const updatedSummaries = await bookingApi.getAllSummaries();
      setSummaries(updatedSummaries);
    } catch {
      setError('Ошибка удаления бронирования');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayment = async (bookingId: number, eventId: number) => {
    setActionLoading(bookingId);
    try {
      await bookingApi.updatePayment(bookingId, 'PAID');
      const updated = await bookingApi.getByEvent(eventId, 0, 200);
      setBookingsMap((prev) => ({ ...prev, [eventId]: updated }));
    } catch {
      setError('Ошибка обновления оплаты');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <h4 className="mb-4">Бронирования</h4>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {summaries.length === 0 ? (
        <Alert variant="secondary">Нет событий с бронированиями</Alert>
      ) : (
        <Accordion onSelect={(key) => {
          if (key !== null) loadBookings(Number(key));
        }}>
          {summaries.map((s) => {
            const bookings = bookingsMap[s.eventId];
            const isLoading = loadingMap[s.eventId];
            const active = s.confirmedBookings ?? 0;

            return (
              <Accordion.Item key={s.eventId} eventKey={String(s.eventId)}>
                <Accordion.Header>
                  <div className="d-flex align-items-center gap-2 w-100 me-3">
                    <Link
                      to={`/admin/events/${s.eventId}`}
                      className="fw-semibold text-decoration-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {s.eventTitle}
                    </Link>
                    <Badge bg="primary" pill>{active} бронирований</Badge>
                    <Badge bg={s.availableSeats <= 3 ? 'danger' : 'success'} pill className="ms-auto">
                      Свободно: {s.availableSeats}
                    </Badge>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="p-0">
                  {isLoading ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" size="sm" />
                    </div>
                  ) : !bookings || bookings.length === 0 ? (
                    <div className="text-muted text-center py-3">Нет бронирований</div>
                  ) : (
                    <Table hover responsive className="mb-0" size="sm">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Участник</th>
                          <th>Оплата</th>
                          <th>Сумма</th>
                          <th>Дата</th>
                          <th className="text-center">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => {
                          const payment = paymentBadge[b.paymentStatus ?? ''];
                          return (
                            <tr key={b.id}>
                              <td className="text-muted">{b.id}</td>
                              <td>
                                <div>{b.guestName ?? '—'}</div>
                                {(b.guestPhone || b.guestEmail) && (
                                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                                    {b.guestPhone && <span>{b.guestPhone}</span>}
                                    {b.guestPhone && b.guestEmail && ' · '}
                                    {b.guestEmail && <span>{b.guestEmail}</span>}
                                  </div>
                                )}
                                {b.notes && (
                                  <div className="text-muted fst-italic" style={{ fontSize: '0.75rem' }}>
                                    💬 {b.notes}
                                  </div>
                                )}
                              </td>
                              <td>
                                {payment ? <Badge bg={payment.bg}>{payment.label}</Badge> : '—'}
                              </td>
                              <td>
                                {b.amountPaid ?? 0} / {b.amountDue ?? 0} ₽
                              </td>
                              <td>{formatDateTime(b.createdAt)}</td>
                              <td className="text-center text-nowrap">
                                <Button
                                  variant="outline-danger" size="sm" className="me-1"
                                  onClick={() => setDeleteConfirm({ bookingId: b.id, eventId: s.eventId })}
                                  disabled={actionLoading === b.id}
                                  title="Удалить бронирование"
                                >
                                  {actionLoading === b.id ? <Spinner size="sm" /> : <BsTrash />}
                                </Button>
                                {b.paymentStatus === 'PENDING' && (
                                  <Button
                                    variant="outline-success" size="sm"
                                    onClick={() => handlePayment(b.id, s.eventId)}
                                    disabled={actionLoading === b.id}
                                    title="Отметить оплату"
                                  >
                                    {actionLoading === b.id ? <Spinner size="sm" /> : <BsCashCoin />}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}

      <Modal show={deleteConfirm !== null} onHide={() => setDeleteConfirm(null)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Удалить бронирование</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить бронирование <strong>#{deleteConfirm?.bookingId}</strong>?
          Это действие необратимо.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
