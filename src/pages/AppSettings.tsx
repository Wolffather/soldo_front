import { useState, useEffect } from 'react';
import {
  Card, Form, Button, Spinner, Alert, Row, Col, Badge,
} from 'react-bootstrap';
import { BsCheckCircle, BsEnvelope, BsGlobe } from 'react-icons/bs';
import { settingsApi } from '../api/settingsApi';

const MAIL_KEYS = ['mail.enabled', 'mail.from', 'mail.host', 'mail.port', 'mail.username', 'mail.password'];
const OTHER_KEYS = ['app.public-url'];
const ALL_KEYS = [...MAIL_KEYS, ...OTHER_KEYS];

const LABELS: Record<string, string> = {
  'mail.enabled':    'Включить отправку email',
  'mail.from':       'Адрес отправителя (From)',
  'mail.host':       'SMTP-сервер (Host)',
  'mail.port':       'Порт',
  'mail.username':   'Логин SMTP',
  'mail.password':   'Пароль / App Password',
  'app.public-url':  'Публичный URL сервера',
};

const HINTS: Record<string, string> = {
  'mail.enabled':   'Если выключено — письма не отправляются, приложение работает без SMTP',
  'mail.from':      'Например: info@mycamp.ru',
  'mail.host':      'Например: smtp.gmail.com или smtp.yandex.ru',
  'mail.port':      '587 — STARTTLS, 465 — SSL',
  'mail.username':  'Обычно совпадает с адресом отправителя',
  'mail.password':  'Для Gmail используйте App Password (не основной пароль)',
  'app.public-url': 'Используется для построения ссылок в письмах. Например: https://soldo.example.com',
};

export default function AppSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    settingsApi.getAll()
      .then(data => {
        const filled: Record<string, string> = {};
        ALL_KEYS.forEach(k => { filled[k] = data[k] ?? ''; });
        setValues(filled);
      })
      .catch(() => setError('Не удалось загрузить настройки'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await settingsApi.saveAll(values);
      setSaved(true);
    } catch {
      setError('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  const mailEnabled = values['mail.enabled'] === 'true';

  return (
    <div>
      <h4 className="mb-4">Настройки</h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {saved && (
        <Alert variant="success" className="d-flex align-items-center gap-2">
          <BsCheckCircle /> Настройки сохранены
        </Alert>
      )}

      {/* Email settings */}
      <Card className="mb-4">
        <Card.Header className="d-flex align-items-center gap-2">
          <BsEnvelope />
          <strong>Настройки email</strong>
          <Badge bg={mailEnabled ? 'success' : 'secondary'} className="ms-auto">
            {mailEnabled ? 'Включено' : 'Выключено'}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-4">
            <Form.Check
              type="switch"
              id="mail-enabled"
              label={LABELS['mail.enabled']}
              checked={mailEnabled}
              onChange={e => handleChange('mail.enabled', e.target.checked ? 'true' : 'false')}
            />
            <Form.Text className="text-muted">{HINTS['mail.enabled']}</Form.Text>
          </Form.Group>

          <Row>
            <Col md={6}>
              {(['mail.host', 'mail.from', 'mail.username'] as const).map(key => (
                <Form.Group className="mb-3" key={key}>
                  <Form.Label>{LABELS[key]}</Form.Label>
                  <Form.Control
                    type="text"
                    value={values[key] ?? ''}
                    onChange={e => handleChange(key, e.target.value)}
                    disabled={!mailEnabled}
                    placeholder={key === 'mail.host' ? 'smtp.gmail.com' : key === 'mail.from' ? 'info@example.com' : ''}
                  />
                  <Form.Text className="text-muted">{HINTS[key]}</Form.Text>
                </Form.Group>
              ))}
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{LABELS['mail.port']}</Form.Label>
                <Form.Control
                  type="number"
                  value={values['mail.port'] ?? '587'}
                  onChange={e => handleChange('mail.port', e.target.value)}
                  disabled={!mailEnabled}
                  style={{ maxWidth: '120px' }}
                />
                <Form.Text className="text-muted">{HINTS['mail.port']}</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>{LABELS['mail.password']}</Form.Label>
                <Form.Control
                  type="password"
                  value={values['mail.password'] ?? ''}
                  onChange={e => handleChange('mail.password', e.target.value)}
                  disabled={!mailEnabled}
                  autoComplete="new-password"
                />
                <Form.Text className="text-muted">{HINTS['mail.password']}</Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* General settings */}
      <Card className="mb-4">
        <Card.Header className="d-flex align-items-center gap-2">
          <BsGlobe />
          <strong>Общие настройки</strong>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>{LABELS['app.public-url']}</Form.Label>
            <Form.Control
              type="text"
              value={values['app.public-url'] ?? ''}
              onChange={e => handleChange('app.public-url', e.target.value)}
              placeholder="https://soldo.example.com"
            />
            <Form.Text className="text-muted">{HINTS['app.public-url']}</Form.Text>
          </Form.Group>
        </Card.Body>
      </Card>

      <Button variant="primary" onClick={handleSave} disabled={saving}>
        {saving ? <><Spinner size="sm" className="me-2" />Сохранение…</> : 'Сохранить настройки'}
      </Button>
    </div>
  );
}
