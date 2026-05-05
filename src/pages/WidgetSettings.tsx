import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Form, Button, Spinner, Alert,
} from 'react-bootstrap';
import {
  BsCodeSlash, BsPalette, BsGear, BsEyeFill, BsCheckCircle,
} from 'react-icons/bs';
import { widgetApi } from '../api/widgetApi';
import type { WidgetConfig, WidgetConfigUpdateRequest } from '../types';

// ── Color field ───────────────────────────────────────────────────────────────

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

// ── Presets ───────────────────────────────────────────────────────────────────

interface Preset {
  id: string;
  name: string;
  swatches: string[];
  values: Partial<WidgetConfigUpdateRequest>;
}

const PRESETS: Preset[] = [
  {
    id: 'classic',
    name: 'Классика',
    swatches: ['#2563eb', '#ffffff', '#1f2937'],
    values: {
      primaryColor: '#2563eb',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonTextColor: '#ffffff',
      borderRadius: '8px',
      fontFamily: 'inherit',
    },
  },
  {
    id: 'dark',
    name: 'Тёмная',
    swatches: ['#3b82f6', '#1e1e2e', '#e2e8f0'],
    values: {
      primaryColor: '#3b82f6',
      backgroundColor: '#1e1e2e',
      textColor: '#e2e8f0',
      buttonTextColor: '#ffffff',
      borderRadius: '10px',
      fontFamily: 'inherit',
    },
  },
  {
    id: 'nature',
    name: 'Природа',
    swatches: ['#16a34a', '#f0fdf4', '#14532d'],
    values: {
      primaryColor: '#16a34a',
      backgroundColor: '#f0fdf4',
      textColor: '#14532d',
      buttonTextColor: '#ffffff',
      borderRadius: '12px',
      fontFamily: 'inherit',
    },
  },
  {
    id: 'warm',
    name: 'Тёплая',
    swatches: ['#ea580c', '#fffbf5', '#431407'],
    values: {
      primaryColor: '#ea580c',
      backgroundColor: '#fffbf5',
      textColor: '#431407',
      buttonTextColor: '#ffffff',
      borderRadius: '6px',
      fontFamily: 'inherit',
    },
  },
  {
    id: 'purple',
    name: 'Фиолетовая',
    swatches: ['#7c3aed', '#faf5ff', '#2e1065'],
    values: {
      primaryColor: '#7c3aed',
      backgroundColor: '#faf5ff',
      textColor: '#2e1065',
      buttonTextColor: '#ffffff',
      borderRadius: '8px',
      fontFamily: 'inherit',
    },
  },
  {
    id: 'minimal',
    name: 'Минимал',
    swatches: ['#374151', '#f9fafb', '#111827'],
    values: {
      primaryColor: '#374151',
      backgroundColor: '#f9fafb',
      textColor: '#111827',
      buttonTextColor: '#ffffff',
      borderRadius: '4px',
      fontFamily: 'inherit',
    },
  },
];

function PresetPicker({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (preset: Preset) => void;
}) {
  return (
    <div className="mb-4">
      <Form.Label className="d-block mb-2">Готовые темы</Form.Label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {PRESETS.map(preset => {
          const isActive = preset.id === activeId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: `2px solid ${isActive ? '#2563eb' : '#dee2e6'}`,
                borderRadius: '8px',
                background: isActive ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
                minWidth: '72px',
              }}
            >
              <div style={{ display: 'flex', gap: '3px' }}>
                {preset.swatches.map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: color,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#2563eb' : '#374151' }}>
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
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

function detectPreset(form: WidgetConfigUpdateRequest): string | null {
  for (const preset of PRESETS) {
    const match = Object.entries(preset.values).every(
      ([k, v]) => form[k as keyof WidgetConfigUpdateRequest] === v
    );
    if (match) return preset.id;
  }
  return null;
}

// ── Page component ────────────────────────────────────────────────────────────

export default function WidgetSettings() {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<WidgetConfigUpdateRequest>(DEFAULT_FORM);
  const [activePreset, setActivePreset] = useState<string | null>('classic');

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await widgetApi.getConfig();
      setConfig(data);
      const loaded: WidgetConfigUpdateRequest = {
        primaryColor: data.primaryColor,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        buttonTextColor: data.buttonTextColor,
        borderRadius: data.borderRadius,
        fontFamily: data.fontFamily,
        successMessage: data.successMessage,
        customCss: data.customCss ?? '',
        buttonLabel: data.buttonLabel ?? 'Записаться',
      };
      setForm(loaded);
      setActivePreset(detectPreset(loaded));
    } catch {
      setError('Ошибка загрузки настроек виджета');
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (preset: Preset) => {
    setForm(f => ({ ...f, ...preset.values }));
    setActivePreset(preset.id);
  };

  const handleField = (patch: Partial<WidgetConfigUpdateRequest>) => {
    setForm(f => {
      const next = { ...f, ...patch };
      setActivePreset(detectPreset(next));
      return next;
    });
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

  const embedSnippet = `<script src="https://ВАШ_ДОМЕН/widget.js" data-tenant="default"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

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

        {/* ── Appearance ── */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center gap-2">
              <BsPalette />
              <strong>Внешний вид</strong>
            </Card.Header>
            <Card.Body>
              <PresetPicker activeId={activePreset} onSelect={handlePreset} />

              <hr className="my-3" />
              <p className="text-muted small mb-3">Настройте под себя</p>

              <Row className="g-0">
                <Col md={6}>
                  <ColorField
                    label="Основной цвет"
                    value={form.primaryColor ?? '#2563eb'}
                    onChange={v => handleField({ primaryColor: v })}
                  />
                </Col>
                <Col md={6}>
                  <ColorField
                    label="Цвет фона"
                    value={form.backgroundColor ?? '#ffffff'}
                    onChange={v => handleField({ backgroundColor: v })}
                  />
                </Col>
                <Col md={6}>
                  <ColorField
                    label="Цвет текста"
                    value={form.textColor ?? '#1f2937'}
                    onChange={v => handleField({ textColor: v })}
                  />
                </Col>
                <Col md={6}>
                  <ColorField
                    label="Цвет текста кнопки"
                    value={form.buttonTextColor ?? '#ffffff'}
                    onChange={v => handleField({ buttonTextColor: v })}
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
                      onChange={e => handleField({ borderRadius: e.target.value })}
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
                      onChange={e => handleField({ fontFamily: e.target.value })}
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

        {/* ── Preview ── */}
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
                  minHeight: '240px',
                  background: form.backgroundColor ?? '#f9f9f9',
                  borderRadius: form.borderRadius ?? '8px',
                  fontFamily: form.fontFamily ?? 'inherit',
                  color: form.textColor ?? '#1f2937',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  border: `2px solid ${form.primaryColor ?? '#2563eb'}`,
                  borderRadius: form.borderRadius ?? '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  fontSize: '0.875rem',
                }}>
                  <span style={{
                    background: form.primaryColor ?? '#2563eb',
                    color: form.buttonTextColor ?? '#ffffff',
                    borderRadius: '20px',
                    padding: '2px 10px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    display: 'inline-block',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}>Ближайшее</span>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Летний лагерь 2026</div>
                  <div style={{ opacity: 0.7, marginBottom: 8, fontSize: '0.8rem' }}>
                    Незабываемое лето у моря с насыщенной программой
                  </div>
                  <div style={{ fontWeight: 700, color: form.primaryColor ?? '#2563eb', marginBottom: 12 }}>
                    25 000 ₽
                  </div>
                  <button
                    style={{
                      background: form.primaryColor ?? '#2563eb',
                      color: form.buttonTextColor ?? '#ffffff',
                      border: 'none',
                      borderRadius: form.borderRadius ?? '8px',
                      padding: '8px 20px',
                      cursor: 'default',
                      fontWeight: 600,
                      fontFamily: form.fontFamily ?? 'inherit',
                      width: '100%',
                      fontSize: '0.875rem',
                    }}
                  >
                    {form.buttonLabel || 'Записаться'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: i === 0 ? (form.primaryColor ?? '#2563eb') : '#d1d5db',
                    }} />
                  ))}
                </div>
              </div>
              <p className="text-muted small mt-2 mb-0">
                Визуальный макет — отображает выбранные цвета и стили
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* ── Behavior ── */}
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
                  placeholder={`[data-soldo-widget] .sw-event-card {\n  box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n}`}
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
                <Form.Text className="text-muted">
                  Дополнительные CSS-правила для тонкой настройки виджета
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* ── Embed code ── */}
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex align-items-center gap-2">
              <BsCodeSlash />
              <strong>Код для вставки</strong>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small mb-2">
                Вставьте этот тег на страницу сайта там, где должна появиться кнопка виджета.
                Замените <code>ВАШ_ДОМЕН</code> на актуальный домен.
              </p>
              <Form.Control
                as="textarea"
                rows={3}
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

        {/* ── Save ── */}
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
