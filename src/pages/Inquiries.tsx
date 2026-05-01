import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Spinner, Alert, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsTrash, BsEnvelopeFill } from 'react-icons/bs';
import { inquiryApi } from '../api/inquiryApi';
import type { Inquiry } from '../types';
import Pagination from '../components/Pagination';
import { formatDateTime } from '../utils/format';

const PAGE_SIZE = 20;

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await inquiryApi.getAll(p, PAGE_SIZE);
      setInquiries(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      setError('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить заявку?')) return;
    try {
      await inquiryApi.delete(id);
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      setTotalElements((prev) => prev - 1);
    } catch {
      setError('Ошибка при удалении');
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 d-flex align-items-center gap-2">
          <BsEnvelopeFill className="text-primary" />
          Обратная связь
          {totalElements > 0 && (
            <Badge bg="secondary">{totalElements}</Badge>
          )}
        </h4>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : inquiries.length === 0 ? (
        <p className="text-muted">Заявок пока нет</p>
      ) : (
        <>
          <Card className="shadow-sm">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Имя</th>
                  <th>Контакты</th>
                  <th>Мероприятие</th>
                  <th>Сообщение</th>
                  <th style={{ width: 140 }}>Дата</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td className="fw-semibold align-middle">{inq.name}</td>
                    <td className="align-middle">
                      <small>
                        {inq.email && <div>{inq.email}</div>}
                        {inq.phone && <div className="text-muted">{inq.phone}</div>}
                        {!inq.email && !inq.phone && '—'}
                      </small>
                    </td>
                    <td className="align-middle text-muted small">
                      {inq.eventTitle || '—'}
                    </td>
                    <td className="align-middle" style={{ maxWidth: 340 }}>
                      {inq.message ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip style={{ maxWidth: 400 }}>
                              {inq.message}
                            </Tooltip>
                          }
                        >
                          <span
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              cursor: 'default',
                            } as React.CSSProperties}
                            className="text-muted"
                          >
                            {inq.message}
                          </span>
                        </OverlayTrigger>
                      ) : '—'}
                    </td>
                    <td className="text-muted small align-middle">
                      {inq.createdAt ? formatDateTime(inq.createdAt) : '—'}
                    </td>
                    <td className="align-middle">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        title="Удалить"
                        onClick={() => handleDelete(inq.id)}
                      >
                        <BsTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Card.Footer className="text-muted small">
              Всего заявок: {totalElements}
            </Card.Footer>
          </Card>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </>
  );
}
