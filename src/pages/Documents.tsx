import { useState, useEffect, useRef } from 'react';
import {
  Card, Table, Button, Spinner, Alert, Badge, Modal, Form, Row, Col,
} from 'react-bootstrap';
import {
  BsPlusCircle, BsPencil, BsTrash, BsFileEarmark, BsUpload, BsCheckCircle,
} from 'react-icons/bs';
import { documentApi } from '../api/documentApi';
import { eventApi } from '../api/eventApi';
import type { DocumentTemplate, DocumentTemplateRequest, Event } from '../types';
import { formatDateTime } from '../utils/format';

const EMPTY_FORM: DocumentTemplateRequest = {
  name: '',
  description: '',
  fileUrl: '',
  eventId: undefined,
  isRequired: true,
  requiresSignature: true,
};

export default function Documents() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DocumentTemplateRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // file upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  // delete
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [tmpl, evts] = await Promise.all([
        documentApi.getAll(),
        eventApi.getAllList(),
      ]);
      setTemplates(tmpl);
      setEvents(evts);
    } catch {
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const eventMap = new Map(events.map(e => [e.id, e.title]));

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setUploadFile(null);
    setUploadedUrl('');
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (t: DocumentTemplate) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      description: t.description ?? '',
      fileUrl: t.fileUrl ?? '',
      eventId: t.eventId,
      isRequired: t.isRequired ?? true,
      requiresSignature: t.requiresSignature ?? true,
    });
    setUploadFile(null);
    setUploadedUrl(t.fileUrl ?? '');
    setFormError('');
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFile(e.target.files?.[0] ?? null);
    setUploadedUrl('');
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      const resp = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!resp.ok) throw new Error('Upload failed');
      const { url } = await resp.json() as { url: string };
      const filename = url.split('/').pop() ?? url;
      setUploadedUrl(filename);
      setForm(prev => ({ ...prev, fileUrl: filename }));
    } catch {
      setFormError('Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Введите название документа'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      const payload: DocumentTemplateRequest = {
        ...form,
        name: form.name.trim(),
        fileUrl: uploadedUrl || form.fileUrl || undefined,
        eventId: form.eventId || undefined,
      };
      if (editingId != null) {
        await documentApi.update(editingId, payload);
      } else {
        await documentApi.create(payload);
      }
      setShowModal(false);
      await load();
    } catch {
      setFormError('Ошибка сохранения');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить шаблон документа?')) return;
    setDeletingId(id);
    try {
      await documentApi.delete(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Не удалось удалить шаблон');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="mb-0">Шаблоны документов</h4>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <BsPlusCircle className="me-1" /> Добавить документ
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <Card.Body className="p-0">
          {templates.length === 0 ? (
            <div className="text-center text-muted py-5">
              <BsFileEarmark size={40} className="mb-2 opacity-25" />
              <p className="mb-0">Шаблонов документов нет. Добавьте первый.</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Название</th>
                  <th>Событие</th>
                  <th>Файл</th>
                  <th className="text-center">Подпись</th>
                  <th className="text-center">Обязательный</th>
                  <th>Создан</th>
                  <th className="text-center" style={{ width: 90 }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="fw-semibold">{t.name}</div>
                      {t.description && (
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{t.description}</div>
                      )}
                    </td>
                    <td>
                      {t.eventId
                        ? <Badge bg="info" text="dark" style={{ fontSize: '0.78rem' }}>
                            {eventMap.get(t.eventId) ?? `#${t.eventId}`}
                          </Badge>
                        : <span className="text-muted small">—</span>}
                    </td>
                    <td>
                      {t.fileUrl
                        ? <a href={`/files/${t.fileUrl}`} target="_blank" rel="noreferrer"
                            className="small text-truncate d-inline-block" style={{ maxWidth: 180 }}>
                            {t.fileUrl}
                          </a>
                        : <span className="text-muted small">—</span>}
                    </td>
                    <td className="text-center">
                      {t.requiresSignature
                        ? <Badge bg="warning" text="dark">Да</Badge>
                        : <span className="text-muted small">Нет</span>}
                    </td>
                    <td className="text-center">
                      {t.isRequired
                        ? <BsCheckCircle className="text-success" />
                        : <span className="text-muted small">—</span>}
                    </td>
                    <td className="small text-muted">{t.createdAt ? formatDateTime(t.createdAt) : '—'}</td>
                    <td className="text-center">
                      <Button
                        variant="link" size="sm" className="text-secondary p-1"
                        onClick={() => openEdit(t)} title="Редактировать"
                      >
                        <BsPencil />
                      </Button>
                      <Button
                        variant="link" size="sm" className="text-danger p-1"
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        title="Удалить"
                      >
                        {deletingId === t.id ? <Spinner size="sm" /> : <BsTrash />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create / Edit modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId != null ? 'Редактировать документ' : 'Добавить документ'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Название <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Согласие на обработку ПД"
                  autoFocus
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Событие</Form.Label>
                <Form.Select
                  value={form.eventId ?? ''}
                  onChange={e => setForm(p => ({ ...p, eventId: e.target.value ? Number(e.target.value) : undefined }))}
                >
                  <option value="">— без привязки —</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Документ будет отправляться при бронировании этого события
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.description ?? ''}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Краткое описание документа..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Файл шаблона</Form.Label>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Form.Control
                type="file"
                ref={fileRef}
                onChange={handleFileChange}
                style={{ maxWidth: 320 }}
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
              >
                {uploading ? <Spinner size="sm" /> : <><BsUpload className="me-1" />Загрузить</>}
              </Button>
              {uploadedUrl && (
                <Badge bg="success" className="d-flex align-items-center gap-1">
                  <BsCheckCircle /> {uploadedUrl}
                </Badge>
              )}
            </div>
            {!uploadedUrl && form.fileUrl && (
              <Form.Text className="text-muted">Текущий файл: {form.fileUrl}</Form.Text>
            )}
          </Form.Group>

          <Row>
            <Col>
              <Form.Check
                type="checkbox"
                id="requiresSignature"
                label="Требует электронной подписи"
                checked={form.requiresSignature ?? true}
                onChange={e => setForm(p => ({ ...p, requiresSignature: e.target.checked }))}
              />
            </Col>
            <Col>
              <Form.Check
                type="checkbox"
                id="isRequired"
                label="Обязательный документ"
                checked={form.isRequired ?? true}
                onChange={e => setForm(p => ({ ...p, isRequired: e.target.checked }))}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
          <Button variant="primary" onClick={handleSave} disabled={formLoading}>
            {formLoading ? <Spinner size="sm" /> : editingId != null ? 'Сохранить' : 'Создать'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
