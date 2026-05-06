import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Spinner, Alert, Table } from 'react-bootstrap';
import { BsArrowLeft, BsTrash, BsPlusCircle } from 'react-icons/bs';
import { eventApi } from '../api/eventApi';
import type { EventFormData, EventPriceOption } from '../types';
import { EVENT_STATUSES } from '../constants/eventConstants';

type FieldErrors = Record<string, string>;

const DEFAULT_OPTION: EventPriceOption = { name: '', price: 0 };

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    maxParticipants: 20,
    price: 0,
    status: 'PUBLISHED',
    priceOptions: [{ ...DEFAULT_OPTION }],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isEdit) loadEvent(Number(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadEvent = async (eventId: number) => {
    setLoading(true);
    try {
      const event = await eventApi.getById(eventId);
      setForm({
        title: event.title,
        description: event.description ?? '',
        startDate: event.startDate ?? '',
        endDate: event.endDate ?? '',
        maxParticipants: event.maxParticipants ?? 20,
        price: event.price ?? 0,
        status: event.status ?? 'PUBLISHED',
        priceOptions: event.priceOptions && event.priceOptions.length > 0
          ? event.priceOptions
          : [{ ...DEFAULT_OPTION }],
      });
    } catch {
      setError('Ошибка загрузки события');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof EventFormData, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as string]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[field as string]; return n; });
    }
  };

  const handleOptionChange = (index: number, field: keyof EventPriceOption, value: string | number) => {
    setForm((prev) => {
      const opts = [...(prev.priceOptions ?? [])];
      opts[index] = { ...opts[index], [field]: value };
      return { ...prev, priceOptions: opts };
    });
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      priceOptions: [...(prev.priceOptions ?? []), { ...DEFAULT_OPTION }],
    }));
  };

  const removeOption = (index: number) => {
    setForm((prev) => {
      const opts = (prev.priceOptions ?? []).filter((_, i) => i !== index);
      return { ...prev, priceOptions: opts.length > 0 ? opts : [{ ...DEFAULT_OPTION }] };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    const validOptions = (form.priceOptions ?? []).filter(o => o.name.trim() && o.price > 0);

    const payload: EventFormData = {
      ...form,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      maxParticipants: form.maxParticipants || undefined,
      price: validOptions.length > 0 ? validOptions[0].price : (form.price || undefined),
      priceOptions: validOptions.length > 0 ? validOptions : undefined,
    };

    try {
      if (isEdit) {
        await eventApi.update(Number(id), payload);
      } else {
        await eventApi.create(payload);
      }
      navigate('/admin/events');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { fieldErrors?: Record<string, string>; message?: string } | undefined;
        if (data?.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        } else {
          setError(data?.message ?? 'Ошибка сохранения');
        }
      } else {
        setError('Неизвестная ошибка');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const options = form.priceOptions ?? [];

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" onClick={() => navigate('/admin/events')}>
          <BsArrowLeft />
        </Button>
        <h4 className="mb-0">{isEdit ? 'Редактировать событие' : 'Новое событие'}</h4>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={9}>
                <Form.Group className="mb-3">
                  <Form.Label>Название *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                    isInvalid={!!fieldErrors.title}
                    autoFocus
                  />
                  {fieldErrors.title && (
                    <Form.Control.Feedback type="invalid">{fieldErrors.title}</Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Статус</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    {EVENT_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата начала</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.startDate ?? ''}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    isInvalid={!!fieldErrors.startDate}
                  />
                  {fieldErrors.startDate && (
                    <Form.Control.Feedback type="invalid">{fieldErrors.startDate}</Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата окончания</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.endDate ?? ''}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    isInvalid={!!fieldErrors.endDate}
                  />
                  {fieldErrors.endDate && (
                    <Form.Control.Feedback type="invalid">{fieldErrors.endDate}</Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Макс. участников</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={form.maxParticipants ?? ''}
                    onChange={(e) => handleChange('maxParticipants', Number(e.target.value))}
                    isInvalid={!!fieldErrors.maxParticipants}
                  />
                  {fieldErrors.maxParticipants && (
                    <Form.Control.Feedback type="invalid">{fieldErrors.maxParticipants}</Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Price options */}
            <div className="mb-3">
              <Form.Label className="fw-semibold">Опции оплаты</Form.Label>
              <Form.Text className="text-muted d-block mb-2">
                Добавьте варианты участия с разной стоимостью. Пользователь выберет один из них при бронировании.
              </Form.Text>
              <Table size="sm" bordered className="mb-2" style={{ maxWidth: 520 }}>
                <thead>
                  <tr>
                    <th>Название опции</th>
                    <th style={{ width: 130 }}>Цена (₽)</th>
                    <th style={{ width: 44 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {options.map((opt, i) => (
                    <tr key={i}>
                      <td>
                        <Form.Control
                          size="sm"
                          type="text"
                          placeholder={i === 0 ? 'Например: 1 день' : 'Например: 2 дня'}
                          value={opt.name}
                          onChange={(e) => handleOptionChange(i, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={opt.price || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            handleOptionChange(i, 'price', val ? Number(val) : 0);
                          }}
                        />
                      </td>
                      <td className="text-center">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => removeOption(i)}
                          disabled={options.length === 1}
                          title="Удалить опцию"
                        >
                          <BsTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button variant="outline-secondary" size="sm" onClick={addOption}>
                <BsPlusCircle className="me-1" />
                Добавить вариант
              </Button>
            </div>

            <div className="d-flex gap-2 mt-3">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? <Spinner size="sm" /> : isEdit ? 'Сохранить' : 'Создать'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/events')}>
                Отмена
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
