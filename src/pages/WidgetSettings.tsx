import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Form, Button, Spinner, Alert,
} from 'react-bootstrap';
import {
  BsCodeSlash, BsPalette, BsGear, BsEyeFill, BsCheckCircle,
} from 'react-icons/bs';
import { widgetApi } from '../api/widgetApi';
import type { WidgetConfig, WidgetConfigUpdateRequest } from '../types';

// ── Inline ColorField component ──────────────────────────────────────────────

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <div className="d-flex align-items-center gap-2">
        <Form.Control
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '48px', height: '38px', padding: '2px', cursor: 'pointer' }}
        />
        <Form.Control
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ fontFamily: 'monospace', maxWidth: '120px' }}
          placeholder="#2563eb"
        />
      </div>
    </Form.Group>
  );
}

// ── Default form state ────────────────────────────────────────────────────────

const DEFAULT_FORM: WidgetConfigUpdateRequest = {
  primaryColor: '#2563eb',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  buttonTextColor: '#ffffff',
  borderRadius: '8px',
  fontFamily: 'inherit',
  successMessage: 'Спасибо! Мы свяжемся с вами в ближайшее время.',
  customCss: '',
  buttonLabel: 'Записаться',
};

// ── Page component ────────────────────────────────────────────────────────────

export default function WidgetSettings() {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState<WidgetConfigUpdateRequest>(DEFAULT_FORM);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await widgetApi.getConfig();
      setConfig(data);
      setForm({
        primaryColor: data.primaryColor,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        buttonTextColor: data.buttonTextColor,
        borderRadius: data.borderRadius,
        fontFamily: data.fontFamily,
        successMessage: data.successMessage,
        customCss: data.customCss ?? '',
        buttonLabel: data.buttonLabel ?? 'Записаться',
      });
    } catch {
      setError('Ошибка загрузки настроек виджета');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveSuccess(false);
    setError('');
    try {
      const updated = await widgetApi.updateConfig(form);
      setConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError('Ошибка сохранения настроек виджета');
    } finally {
      setSaveLoading(false);
    }
  };

  const embedSnippet = `<div id="soldo-widget"></div>\n<script src="https://ВАШ_ДОМЕН/widget.js"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select textarea
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
      <div className="d-flex align-items-center gap-3 mb-4">
        <BsCodeSlash size={24} className="text-primary" />
        <h4 className="mb-0">Настройки виджета</h4>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {saveSuccess && (
        <Alert variant="success" className="d-flex align-items-center gap-2">
          <BsCheckCircle /> Настройки виджета сохранены
        </Alert>
      )}

      <Row className="g-4">

        {/* ── Section 1: Appearance ── */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center gap-2">
              <BsPalette />
              <strong>Внешний вид</strong>
            </Card.Header>
            <Card.Body>
              <Row className="g-0">
                <Col md={6}>
                  <ColorField
                    label="Основной цвет"
                    value={form.primaryColor ?? '#2563eb'}
                    onChange={v => setForm(f => ({ ...f, primaryColor: v }))}
                  />
                </Col>
                <Col md={6}>
                  <ColorField
                    label="Цвет фона"
                    value={form.backgroundColor ?? '#ffffff'}
                    onChange={v => setForm(f => ({ ...f, backgroundColor: v }))}
                  />
                </Col>
                <Col md={6}>
                  <ColorField
                    label="Цвет текста"
                    value={form.textColor ?? '#1f2937'}
                    onChange={v => setForm(f => ({ ...f, textColor: v }))}
                  />
                </Col>
                <Col md={6}>
                  <ColorField
                    label="Цвет текста кнопки"
                    value={form.buttonTextColor ?? '#ffffff'}
                    onChange={v => setForm(f => ({ ...f, buttonTextColor: v }))}
                  />
                </Col>
              </Row>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Скругление углов</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.borderRadius ?? ''}
                      onChange={e => setForm(f => ({ ...f, borderRadius: e.target.value }))}
                      placeholder="8px"
                      style={{ fontFamily: 'monospace' }}
                    />
                    <Form.Text className="text-muted">Например: 8px, 0, 1rem</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Шрифт</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.fontFamily ?? ''}
                      onChange={e => setForm(f => ({ ...f, fontFamily: e.target.value }))}
                      placeholder="inherit"
                      style={{ fontFamily: 'monospace' }}
                    />
                    <Form.Text className="text-muted">Например: inherit, Roboto, sans-serif</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* ── Section 4: Live Preview ── */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center gap-2">
              <BsEyeFill />
              <strong>Предпросмотр</strong>
            </Card.Header>
            <Card.Body>
              <div
                style={{
                  border: '1px dashed #ccc',
                  padding: '16px',
                  minHeight: '200px',
                  background: form.backgroundColor ?? '#f9f9f9',
                  borderRadius: form.borderRadius ?? '8px',
                  fontFamily: form.fontFamily ?? 'inherit',
                  color: form.textColor ?? '#1f2937',
                }}
              >
                <p className="fw-semibold mb-3" style={{ color: form.textColor ?? '#1f2937' }}>
                  Ближайшее событие
                </p>
                <div style={{
                  border: `2px solid ${form.primaryColor ?? '#2563eb'}`,
                  borderRadius: form.borderRadius ?? '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  fontSize: '0.875rem',
                  color: form.textColor ?? '#1f2937',
                }}>
                  <span style={{
                    background: form.primaryColor ?? '#2563eb',
                    color: form.buttonTextColor ?? '#ffffff',
                    borderRadius: '20px',
                    padding: '2px 10px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    display: 'inline-block',
                    marginBottom: '6px',
                  }}>Ближайшее</span>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Название события</div>
                  <div style={{ opacity: 0.7, marginBottom: 8 }}>Краткое описание события...</div>
                  <div style={{ fontWeight: 700, color: form.primaryColor ?? '#2563eb', marginBottom: 8 }}>5 000 ₽</div>
                </div>
                <button
                  style={{
                    background: form.primaryColor ?? '#2563eb',
                    color: form.buttonTextColor ?? '#ffffff',
                    border: 'none',
                    borderRadius: form.borderRadius ?? '8px',
                    padding: '8px 24px',
                    cursor: 'default',
                    fontWeight: 600,
                    fontFamily: form.fontFamily ?? 'inherit',
                  }}
                >
                  {form.buttonLabel || 'Записаться'}
                </button>
              </div>
              <p className="text-muted small mt-2 mb-0">
                Визуальный макет — отображает выбранные цвета и стили
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* ── Section 2: Behavior ── */}
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex align-items-center gap-2">
              <BsGear />
              <strong>Поведение</strong>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Текст кнопки записи</Form.Label>
                <Form.Control
                  type="text"
                  value={form.buttonLabel ?? ''}
                  onChange={e => setForm(f => ({ ...f, buttonLabel: e.target.value }))}
                  placeholder="Записаться"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Сообщение об успехе</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.successMessage ?? ''}
                  onChange={e => setForm(f => ({ ...f, successMessage: e.target.value }))}
                  placeholder="Спасибо! Мы свяжемся с вами в ближайшее время."
                />
                <Form.Text className="text-muted">
                  Показывается после успешной отправки заявки
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Label>Кастомный CSS</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={form.customCss ?? ''}
                  onChange={e => setForm(f => ({ ...f, customCss: e.target.value }))}
                  placeholder=".soldo-widget { /* ваши стили */ }"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
                <Form.Text className="text-muted">
                  Дополнительные CSS-правила для тонкой настройки виджета
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* ── Section 3: Embed code ── */}
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex align-items-center gap-2">
              <BsCodeSlash />
              <strong>Код для вставки</strong>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small mb-2">
                Вставьте этот код на страницу вашего сайта, где должен появиться виджет.
                Замените <code>ВАШ_ДОМЕН</code> на актуальный домен.
              </p>
              <Form.Control
                as="textarea"
                rows={4}
                readOnly
                value={embedSnippet}
                style={{ fontFamily: 'monospace', fontSize: '0.82rem', background: '#f8f9fa' }}
              />
              <div className="mt-2 d-flex align-items-center gap-2">
                <Button variant="outline-secondary" size="sm" onClick={handleCopy}>
                  <BsCodeSlash className="me-1" />
                  Копировать
                </Button>
                {copied && (
                  <span className="text-success d-flex align-items-center gap-1 small">
                    <BsCheckCircle /> Скопировано!
                  </span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ── Save button row ── */}
        <Col xs={12}>
          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={handleSave} disabled={saveLoading}>
              {saveLoading
                ? <><Spinner size="sm" className="me-2" />Сохранение...</>
                : 'Сохранить изменения'}
            </Button>
          </div>
        </Col>

      </Row>
    </>
  );
}
