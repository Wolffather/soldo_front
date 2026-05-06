import { useState, useEffect } from 'react';
import {
  Row, Col, Card, Table, Spinner, Alert, ProgressBar,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  BsCalendarEvent, BsBookmark, BsCashCoin, BsExclamationTriangle,
} from 'react-icons/bs';
import { bookingApi } from '../api/bookingApi';
import { eventApi } from '../api/eventApi';
import type { BookingSummary, Event, Page } from '../types';
import { formatDate } from '../utils/format';

export default function Dashboard() {
  const [summaries, setSummaries] = useState<BookingSummary[]>([]);
  const [eventPage, setEventPage] = useState<Page<Event> | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, eventsData, revenue] = await Promise.all([
        bookingApi.getAllSummaries(),
        eventApi.getAll(0, 5),
        bookingApi.getMonthlyRevenue(),
      ]);
      setSummaries(summaryData);
      setEventPage(eventsData);
      setMonthlyRevenue(revenue);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const events = eventPage?.content ?? [];
  const totalBookings = summaries.reduce((sum, s) => sum + s.totalBookings, 0);
  const pendingBookings = summaries.reduce((sum, s) => sum + s.pendingBookings, 0);
  const totalEvents = eventPage?.totalElements ?? 0;

  return (
    <>
      <h4 className="mb-4">Дашборд</h4>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-primary">
            <Card.Body>
              <BsCalendarEvent size={24} className="text-primary mb-2" />
              <h3>{totalEvents}</h3>
              <small className="text-muted">Событий</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body>
              <BsBookmark size={24} className="text-success mb-2" />
              <h3>{totalBookings}</h3>
              <small className="text-muted">Бронирований</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-warning">
            <Card.Body>
              <BsExclamationTriangle size={24} className="text-warning mb-2" />
              <h3>{pendingBookings}</h3>
              <small className="text-muted">Ожидают подтверждения</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-info">
            <Card.Body>
              <BsCashCoin size={24} className="text-info mb-2" />
              <h3>{monthlyRevenue !== null ? `${monthlyRevenue.toLocaleString('ru-RU')} ₽` : '—'}</h3>
              <small className="text-muted">Доход за месяц</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Ближайшие события</strong>
              <Link to="/admin/events" className="btn btn-sm btn-outline-primary">Все</Link>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Дата</th>
                    <th>Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <Link to={`/admin/events/${event.id}`}>{event.title}</Link>
                      </td>
                      <td>{formatDate(event.startDate)}</td>
                      <td>{event.price ? `${event.price} ₽` : 'Бесплатно'}</td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-3">Нет событий</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <strong>Сводка по бронированиям</strong>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Событие</th>
                    <th className="text-center">✅</th>
                    <th className="text-center">⏳</th>
                    <th>Заполненность</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s) => {
                    const total = s.confirmedBookings + s.pendingBookings + s.availableSeats;
                    const fillPercent = total > 0
                      ? Math.round(((s.confirmedBookings + s.pendingBookings) / total) * 100)
                      : 0;
                    return (
                      <tr key={s.eventId}>
                        <td>
                          <Link to={`/admin/events/${s.eventId}`}>{s.eventTitle}</Link>
                        </td>
                        <td className="text-center text-success">{s.confirmedBookings}</td>
                        <td className="text-center text-warning">{s.pendingBookings}</td>
                        <td>
                          <ProgressBar
                            now={fillPercent}
                            variant={fillPercent > 90 ? 'danger' : fillPercent > 70 ? 'warning' : 'success'}
                            label={`${fillPercent}%`}
                            style={{ minWidth: '80px' }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {summaries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3">Нет данных</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
