import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Form, Button, Spinner, Alert, Badge, Table,
} from 'react-bootstrap';
import {
  BsBuilding, BsCreditCard2Front, BsGear, BsCheckCircle, BsClipboard, BsClipboardCheck,
} from 'react-icons/bs';
import { tenantApi } from '../api/tenantApi';
import type { TenantInfo, TenantConfigUpdateRequest } from '../types';

const PLAN_LABELS: Record<string, { label: string; bg: string }> = {
  FREE:       { label: 'Free',       bg: 'secondary' },
  STARTER:    { label: 'Starter',    bg: 'info' },
  PRO:        { label: 'Pro',        bg: 'primary' },
  ENTERPRISE: { label: 'Enterprise', bg: 'success' },
};

const STATUS_LABELS: Record<string, { label: string; bg: string }> = {
  TRIAL:     { label: 'Пробный период', bg: 'warning' },
  ACTIVE:    { label: 'Активен',        bg: 'success' },
  SUSPENDED: { label: 'Приостановлен',  bg: 'danger' },
  CANCELLED: { label: 'Отменён',        bg: 'secondary' },
};

export default function TenantSettings() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [slugCopied, setSlugCopied] = useState(false);

  const [form, setForm] = useState<TenantConfigUpdateRequest>({
    eventLabel: 'Событие',
    participantLabel: 'Участник',
    bookingLabel: 'Бронирование',
    name: '',
    domain: '',
  });

  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tenantApi.getCurrent();
      setTenant(data);
      setForm({
        eventLabel: data.eventLabel,
        participantLabel: data.participantLabel,
        bookingLabel: data.bookingLabel,
        name: data.name,
        domain: data.domain ?? '',
      });
    } catch {
      setError('Ошибка загрузки настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveSuccess(false);
    setError('');
    try {
      const updated = await tenantApi.updateConfig(form);
      setTenant(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError('Ошибка сохранения настроек');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const plan = PLAN_LABELS[tenant?.plan ?? 'FREE'];
  const status = STATUS_LABELS[tenant?.status ?? 'ACTIVE'];

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-4">
        <BsBuilding size={24} className="text-primary" />
        <h4 className="mb-0">Настройки организации</h4>
        {plan && <Badge bg={plan.bg}>{plan.label}</Badge>}
        {status && <Badge bg={status.bg}>{status.label}</Badge>}
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {saveSuccess && (
        <Alert variant="success" className="d-flex align-items-center gap-2">
          <BsCheckCircle /> Настройки сохранены
        </Alert>
      )}

      <Row className="g-4">
        {/* ── Подписка ── */}
        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center gap-2">
              <BsCreditCard2Front />
              <strong>Подписка</strong>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="text-muted small mb-1">Тарифный план</div>
                <h5 className="mb-0">
                  <Badge bg={plan?.bg ?? 'secondary'} className="fs-6">
                    {plan?.label ?? tenant?.plan}
                  </Badge>
                </h5>
              </div>

              <Table size="sm" borderless className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted ps-0">Slug</td>
                    <td><code>{tenant?.slug}</code></td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-0">Событий</td>
                    <td>{tenant?.maxEvents ?? <span className="text-success">∞</span>}</td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-0">Бронирований/мес</td>
                    <td>{tenant?.maxBookingsPerMonth ?? <span className="text-success">∞</span>}</td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-0">Администраторов</td>
                    <td>{tenant?.maxAdminUsers ?? 1}</td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-0">Кастомный домен</td>
                    <td>
                      {tenant?.customDomainEnabled
                        ? <Badge bg="success">Да</Badge>
                        : <Badge bg="secondary">Нет</Badge>}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-0">API доступ</td>
                    <td>
                      {tenant?.apiAccessEnabled
                        ? <Badge bg="success">Да</Badge>
                        : <Badge bg="secondary">Нет</Badge>}
                    </td>
                  </tr>
                </tbody>
              </Table>

              <div className="mt-3 pt-2 border-top">
                <small className="text-muted">
                  Для изменения тарифа обратитесь в поддержку.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ── Конфигурация ── */}
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex align-items-center gap-2">
              <BsGear />
              <strong>Настройки интерфейса</strong>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Slug организации
                      <span className="text-muted fw-normal ms-2" style={{ fontSize: '0.75rem' }}>
                        — только для чтения
                      </span>
                    </Form.Label>
                    <div className="input-group">
                      <Form.Control
                        value={tenant?.slug ?? ''}
                        readOnly
                        style={{ fontFamily: 'monospace', background: '#f8f9fa' }}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => {
                          navigator.clipboard.writeText(tenant?.slug ?? '');
                          setSlugCopied(true);
                          setTimeout(() => setSlugCopied(false), 2000);
                        }}
                        title="Скопировать slug"
                      >
                        {slugCopied ? <BsClipboardCheck className="text-success" /> : <BsClipboard />}
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Используется в виджете (<code>data-tenant</code>)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Название организации</Form.Label>
                    <Form.Control
                      value={form.name ?? ''}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Лагерь Savvy"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Кастомный домен
                      {!tenant?.customDomainEnabled && (
                        <Badge bg="secondary" className="ms-2 fw-normal" style={{ fontSize: '0.7rem' }}>
                          PRO
                        </Badge>
                      )}
                    </Form.Label>
                    <Form.Control
                      value={form.domain ?? ''}
                      onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                      placeholder="camp.example.ru"
                      disabled={!tenant?.customDomainEnabled}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <hr className="my-1" />
                  <div className="text-muted small mb-3">
                    Терминология — как называются сущности в интерфейсе
                  </div>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Событие</Form.Label>
                    <Form.Control
                      value={form.eventLabel}
                      onChange={e => setForm(f => ({ ...f, eventLabel: e.target.value }))}
                      placeholder="Смена / Занятие / Тур"
                    />
                    <Form.Text className="text-muted">
                      Например: «Смена», «Занятие», «Тур», «Сеанс»
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Участник</Form.Label>
                    <Form.Control
                      value={form.participantLabel}
                      onChange={e => setForm(f => ({ ...f, participantLabel: e.target.value }))}
                      placeholder="Участник / Клиент / Гость"
                    />
                    <Form.Text className="text-muted">
                      Например: «Участник», «Клиент», «Студент»
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Бронирование</Form.Label>
                    <Form.Control
                      value={form.bookingLabel}
                      onChange={e => setForm(f => ({ ...f, bookingLabel: e.target.value }))}
                      placeholder="Бронирование / Запись / Заявка"
                    />
                    <Form.Text className="text-muted">
                      Например: «Бронирование», «Запись», «Заявка»
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-4 d-flex justify-content-end">
                <Button variant="primary" onClick={handleSave} disabled={saveLoading}>
                  {saveLoading
                    ? <><Spinner size="sm" className="me-2" />Сохранение...</>
                    : 'Сохранить изменения'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
