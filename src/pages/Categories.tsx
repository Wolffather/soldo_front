import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Alert, Spinner, Badge,
} from 'react-bootstrap';
import { BsPencil, BsTrash, BsPlusLg } from 'react-icons/bs';
import { categoryApi, type EventFormatOption } from '../api/categoryApi';
import type { EventCategory } from '../types';

const FORMAT_COLORS: Record<string, string> = {
  CAMP_CITY: 'success',
  CAMP_OUTDOOR: 'info',
  RECURRING: 'primary',
  ONE_TIME: 'warning',
  TRIP: 'secondary',
};

interface CategoryFormData {
  name: string;
  format: string;
  description?: string;
  iconUrl?: string;
}

const emptyForm: CategoryFormData = {
  name: '',
  format: '',
  description: '',
  iconUrl: '',
};

export default function Categories() {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [formats, setFormats] = useState<EventFormatOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, fmts] = await Promise.all([
        categoryApi.getAll(),
        categoryApi.getFormats(),
      ]);
      setCategories(cats);
      setFormats(fmts);
    } catch {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalError('');
    setShowModal(true);
  };

  const openEdit = (cat: EventCategory) => {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      format: cat.format,
      description: cat.description ?? '',
      iconUrl: cat.iconUrl ?? '',
    });
    setModalError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setModalError('Введите название'); return; }
    if (!form.format) { setModalError('Выберите вид'); return; }

    setSaving(true);
    setModalError('');
    try {
      const payload = {
        name: form.name.trim(),
        format: form.format,
        description: form.description || undefined,
        iconUrl: form.iconUrl || undefined,
      };
      if (editId !== null) {
        await categoryApi.update(editId, payload);
      } else {
        await categoryApi.create(payload);
      }
      setShowModal(false);
      await loadData();
    } catch {
      setModalError('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await categoryApi.deleteById(deleteId);
      setDeleteId(null);
      await loadData();
    } catch {
      setError('Ошибка удаления категории');
      setDeleteId(null);
    }
  };

  const formatLabel = (value: string) =>
    formats.find((f) => f.value === value)?.label ?? value;

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Категории событий</h4>
        <Button variant="primary" onClick={openCreate}>
          <BsPlusLg className="me-1" /> Добавить
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Название</th>
                <th>Вид</th>
                <th>Описание</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Нет категорий
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="fw-semibold">{cat.name}</td>
                    <td>
                      <Badge bg={FORMAT_COLORS[cat.format] ?? 'secondary'}>
                        {formatLabel(cat.format)}
                      </Badge>
                    </td>
                    <td className="text-muted small">
                      {cat.description ? cat.description.slice(0, 60) + (cat.description.length > 60 ? '…' : '') : '—'}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-secondary" onClick={() => openEdit(cat)}>
                          <BsPencil />
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => setDeleteId(cat.id)}>
                          <BsTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Модал создания/редактирования */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editId !== null ? 'Редактировать категорию' : 'Новая категория'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Название *</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Вид *</Form.Label>
              <Form.Select
                value={form.format}
                onChange={(e) => setForm((p) => ({ ...p, format: e.target.value }))}
              >
                <option value="">— Выберите вид —</option>
                {formats.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>URL иконки</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://..."
                value={form.iconUrl}
                onChange={(e) => setForm((p) => ({ ...p, iconUrl: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Сохранить'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модал подтверждения удаления */}
      <Modal show={deleteId !== null} onHide={() => setDeleteId(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Удалить категорию?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Все события этой категории потеряют привязку. Действие нельзя отменить.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button variant="danger" onClick={handleDelete}>Удалить</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
