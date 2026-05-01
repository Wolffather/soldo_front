import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { BsPlus, BsPencil, BsTrash, BsEye } from 'react-icons/bs';
import { eventApi } from '../api/eventApi';
import type { Event, Page } from '../types';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate } from '../utils/format';

export default function Events() {
  const [page, setPage] = useState<Page<Event> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents(currentPage);
  }, [currentPage]);

  const loadEvents = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await eventApi.getAll(pageNum, 10);
      setPage(data);
    } catch {
      setError('Ошибка загрузки событий');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await eventApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadEvents(currentPage);
    } catch {
      setError('Ошибка удаления');
    }
  };

  if (loading && !page) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">События</h4>
        <Button variant="primary" onClick={() => navigate('/admin/events/new')}>
          <BsPlus size={20} /> Создать событие
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Тип</th>
                <th>Дата начала</th>
                <th>Дата окончания</th>
                <th className="text-center">Макс. участников</th>
                <th className="text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {page?.content.map((event) => (
                <tr key={event.id}>
                  <td>{event.id}</td>
                  <td>
                    <Link to={`/admin/events/${event.id}`} className="fw-semibold">
                      {event.title}
                    </Link>
                  </td>
                  <td>
                    <span className="badge bg-secondary">{event.categoryName ?? '—'}</span>
                  </td>
                  <td>{formatDate(event.startDate)}</td>
                  <td>{event.endDate ? formatDate(event.endDate) : '—'}</td>
                  <td className="text-center">{event.maxParticipants}</td>
                  <td className="text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => navigate(`/admin/events/${event.id}`)}
                      title="Просмотр"
                    >
                      <BsEye />
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="me-1"
                      onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                      title="Редактировать"
                    >
                      <BsPencil />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setDeleteTarget(event)}
                      title="Удалить"
                    >
                      <BsTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {page?.content.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Нет событий
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {page && (
        <Pagination
          currentPage={page.number}
          totalPages={page.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmModal
        show={!!deleteTarget}
        title="Удалить событие"
        message={`Вы уверены, что хотите удалить "${deleteTarget?.title}"?`}
        confirmLabel="Удалить"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}