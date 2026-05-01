import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { BsArrowLeft } from 'react-icons/bs';
import { eventApi } from '../api/eventApi';
import { categoryApi } from '../api/categoryApi';
import type { EventFormData, EventCategory } from '../types';
import { EVENT_STATUSES } from '../constants/eventConstants';

/** Field-level errors from backend */
type FieldErrors = Record<string, string>;

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<EventFormData>({
    title: '',
    description: '',
    categoryName: '',
    startDate: '',
    endDate: '',
    maxParticipants: 20,
    price: 0,
    priceWithCertificate: undefined,
    gameMaster: '',
    status: 'PUBLISHED',
  });

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isOneTime = selectedFormat === 'ONE_TIME';

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadEvent(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // When categories load, resolve format from category name
  useEffect(() => {
    if (form.categoryName && categories.length > 0) {
      const cat = categories.find((c) => c.name === form.categoryName);
      if (cat) setSelectedFormat(cat.format);
    }
  }, [categories]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch {
      console.error('Ошибка загрузки категорий');
    }
  };

  const loadEvent = async (eventId: number) => {
    setLoading(true);
    try {
      const event = await eventApi.getById(eventId);
      setForm({
        title: event.title,
        description: event.description ?? '',
        categoryName: event.categoryName ?? '',
        startDate: event.startDate ?? '',
        endDate: event.endDate ?? '',
        maxParticipants: event.maxParticipants ?? 20,
        price: event.price ?? 0,
        priceWithCertificate: event.priceWithCertificate,
        gameMaster: event.gameMaster ?? '',
        status: event.status ?? 'PUBLISHED',
      });
    } catch {
      setError('Ошибка загрузки события');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catName: string) => {
    handleChange('categoryName', catName);
    const cat = categories.find((c) => c.name === catName);
    const fmt = cat?.format ?? '';
    setSelectedFormat(fmt);
    if (fmt === 'ONE_TIME') {
      handleChange('endDate', '');
    }
    if (fieldErrors.categoryName) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n.categoryName; return n; });
    }
  };

  const handleChange = (field: keyof EventFormData, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as string]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[field as string]; return n; });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    const payload: EventFormData = {
      ...form,
      startDate: form.startDate || undefined,
      endDate: isOneTime ? undefined : (form.endDate || undefined),
      maxParticipants: form.maxParticipants || undefined,
      gameMaster: form.gameMaster || undefined,
      price: form.price || undefined,
      priceWithCertificate: form.priceWithCertificate || undefined,
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

  const handleBack = () => {
    navigate('/admin/events');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const pageTitle = isEdit ? 'Редактировать событие' : 'Новое событие';

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" onClick={handleBack}>
          <BsArrowLeft />
        </Button>
        <h4 className="mb-0">{pageTitle}</h4>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
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
                  <Form.Label>Категория</Form.Label>
                  <Form.Select
                    value={form.categoryName}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    isInvalid={!!fieldErrors.categoryName}
                  >
                    <option value="">— Без категории —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </Form.Select>
                  {fieldErrors.categoryName && (
                    <Form.Control.Feedback type="invalid">{fieldErrors.categoryName}</Form.Control.Feedback>
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
              <Col md={3}>
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

              {!isOneTime && (
                <Col md={3}>
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
              )}

              <Col md={3}>
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

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Цена (₽)</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={form.price || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleChange('price', val ? Number(val) : 0);
                    }}
                    isInvalid={!!fieldErrors.price}
                  />
                  {fieldErrors.price && (
                    <Form.Control.Feedback type="invalid">{fieldErrors.price}</Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ведущий</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.gameMaster ?? ''}
                    onChange={(e) => handleChange('gameMaster', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? <Spinner size="sm" /> : isEdit ? 'Сохранить' : 'Создать'}
              </Button>
              <Button variant="secondary" onClick={handleBack}>
                Отмена
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
