import { useState, useEffect, useRef } from 'react';
import {
  Card, Table, Button, Badge, Modal, Form,
  Spinner, Alert, Row, Col,
} from 'react-bootstrap';
import { BsPlus, BsPencil, BsTrash, BsFunnel, BsUpload, BsFileEarmark, BsXCircle } from 'react-icons/bs';
import { documentApi } from '../api/documentApi';
import type { DocumentTemplate } from '../types';

const CAMP_FORMATS = [
  { value: 'SESSION_CITY', label: 'Городской лагерь' },
  { value: 'SESSION_OUTDOOR', label: 'Загородный лагерь' },
];

const FORMAT_LABELS: Record<string, string> = {
  SESSION_CITY: 'Городской лагерь',
  SESSION_OUTDOOR: 'Загородный лагерь',
};

const FORMAT_VARIANTS: Record<string, string> = {
  SESSION_CITY: 'primary',
  SESSION_OUTDOOR: 'success',
};

const emptyForm = (): Omit<DocumentTemplate, 'id' | 'createdAt'> => ({
  name: '',
  description: '',
  fileUrl: '',
  categoryFormat: 'SESSION_CITY',
  isRequired: true,
  requiresSignature: true,
});

export default function DocumentTemplates() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [filterFormat, setFilterFormat] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTemplates();
  }, [filterFormat]);

  const loadTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await documentApi.getAll(filterFormat || undefined);
      setTemplates(data);
    } catch {
      setError('Ошибка загрузки шаблонов документов');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm());
    setEditingId(null);
    setFormError('');
    setUploadError('');
    setShowForm(true);
  };

  const openEdit = (t: DocumentTemplate) => {
    setForm({
      name: t.name,
      description: t.description ?? '',
      fileUrl: t.fileUrl ?? '',
      categoryFormat: t.categoryFormat,
      isRequired: t.isRequired,
      requiresSignature: t.requiresSignature ?? true,
    });
    setEditingId(t.id);
    setFormError('');
    setUploadError('');
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const result = await documentApi.uploadFile(file);
      setForm((p) => ({ ...p, fileUrl: result.url }));
    } catch {
      setUploadError('Ошибка загрузки файла. Проверьте формат и размер (до 20 МБ).');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Название обязательно');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId !== null) {
        await documentApi.update(editingId, form);
      } else {
        await documentApi.create(form);
      }
      setShowForm(false);
      await loadTemplates();
    } catch {
      setFormError('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await documentApi.deleteById(deleteId);
      setDeleteId(null);
      await loadTemplates();
    } catch {
      setError('Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="mb-0">Шаблоны документов</h4>
        <Button variant="primary" onClick={openCreate}>
          <BsPlus className="me-1" />
          Добавить шаблон
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="mb-3">
        <Card.Body className="py-2">
          <Row className="align-items-center g-2">
            <Col xs="auto">
              <BsFunnel className="text-muted me-1" />
              <span className="text-muted small">Фильтр по формату:</span>
            </Col>
            <Col xs="auto">
              <Form.Select
                size="sm"
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                style={{ minWidth: 200 }}
              >
                <option value="">Все форматы</option>
                {CAMP_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-5 text-muted">Шаблоны не найдены</div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Название</th>
                  <th>Формат</th>
                  <th>Описание</th>
                  <th>Ссылка</th>
                  <th>Обязательный</th>
                  <th>Подпись</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id}>
                    <td className="fw-medium">{t.name}</td>
                    <td>
                      <Badge bg={FORMAT_VARIANTS[t.categoryFormat] ?? 'secondary'}>
                        {FORMAT_LABELS[t.categoryFormat] ?? t.categoryFormat}
                      </Badge>
                    </td>
                    <td className="text-muted small">{t.description || '—'}</td>
                    <td>
                      {t.fileUrl ? (
                        <a href={t.fileUrl} target="_blank" rel="noreferrer" className="small">
                          Открыть
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <Badge bg={t.isRequired ? 'danger' : 'secondary'}>
                        {t.isRequired ? 'Да' : 'Нет'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={t.requiresSignature !== false ? 'primary' : 'secondary'}>
                        {t.requiresSignature !== false ? '✍ Подпись' : '👁 Ознакомление'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-1"
                        onClick={() => openEdit(t)}
                      >
                        <BsPencil />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setDeleteId(t.id)}
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

      {/* Create / Edit modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId !== null ? 'Редактировать шаблон' : 'Новый шаблон'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Название *</Form.Label>
            <Form.Control
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              autoFocus
            />
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
          <Form.Group className="mb-3">
            <Form.Label>Файл шаблона</Form.Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            {form.fileUrl ? (
              <div className="d-flex align-items-center gap-2 border rounded p-2 bg-light">
                <BsFileEarmark className="text-primary flex-shrink-0" />
                <span className="text-truncate small flex-grow-1" title={form.fileUrl}>
                  {form.fileUrl.split('/').pop()}
                </span>
                <a
                  href={`http://localhost:8080${form.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="small text-nowrap"
                >
                  Открыть
                </a>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-danger"
                  title="Удалить файл"
                  onClick={() => setForm((p) => ({ ...p, fileUrl: '' }))}
                >
                  <BsXCircle />
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <><Spinner size="sm" className="me-1" />Загрузка...</>
                  ) : (
                    <><BsUpload className="me-1" />Выбрать файл</>
                  )}
                </Button>
                <span className="text-muted small ms-2">PDF, DOC, DOCX, XLS, XLSX · до 20 МБ</span>
              </div>
            )}
            {uploadError && <div className="text-danger small mt-1">{uploadError}</div>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Формат лагеря *</Form.Label>
            <Form.Select
              value={form.categoryFormat}
              onChange={(e) => setForm((p) => ({ ...p, categoryFormat: e.target.value }))}
            >
              {CAMP_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Check
            type="switch"
            id="is-required-switch"
            label="Обязательный документ"
            checked={form.isRequired}
            onChange={(e) => setForm((p) => ({ ...p, isRequired: e.target.checked }))}
            className="mb-2"
          />
          <Form.Check
            type="switch"
            id="requires-signature-switch"
            label="Требует электронной подписи (иначе — только ознакомление)"
            checked={form.requiresSignature}
            onChange={(e) => setForm((p) => ({ ...p, requiresSignature: e.target.checked }))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForm(false)}>Отмена</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : editingId !== null ? 'Сохранить' : 'Создать'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal show={deleteId !== null} onHide={() => setDeleteId(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Удалить шаблон?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Это действие необратимо.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" /> : 'Удалить'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
