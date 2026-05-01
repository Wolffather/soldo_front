import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Spinner, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { bookingApi } from '../api/bookingApi';
import type { BookingSummary } from '../types';

export default function Bookings() {
  const [summaries, setSummaries] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Событие</th>
                <th className="text-center">Всего</th>
                <th className="text-center">✅ Подтв.</th>
                <th className="text-center">⏳ Ожид.</th>
                <th className="text-center">❌ Отмен.</th>
                <th>Заполненность</th>
                <th className="text-center">Свободно</th>
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
                      <Link to={`/admin/events/${s.eventId}`} className="fw-semibold">
                        {s.eventTitle}
                      </Link>
                    </td>
                    <td className="text-center">{s.totalBookings}</td>
                    <td className="text-center text-success">{s.confirmedBookings}</td>
                    <td className="text-center text-warning">{s.pendingBookings}</td>
                    <td className="text-center text-danger">{s.cancelledBookings}</td>
                    <td>
                      <ProgressBar
                        now={fillPercent}
                        variant={fillPercent > 90 ? 'danger' : fillPercent > 70 ? 'warning' : 'success'}
                        label={`${fillPercent}%`}
                        style={{ minWidth: '100px' }}
                      />
                    </td>
                    <td className="text-center">
                      <Badge bg={s.availableSeats <= 3 ? 'danger' : 'success'}>
                        {s.availableSeats}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {summaries.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Нет данных
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}