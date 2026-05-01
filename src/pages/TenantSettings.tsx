import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Form, Button, Spinner, Alert, Badge, Table,
} from 'react-bootstrap';
import {
  BsBuilding, BsCreditCard2Front, BsGear, BsTelegram, BsCheckCircle, BsClipboard, BsClipboardCheck,
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
  const [botToken, setBotToken] = useState('');
  const [botLoading, setBotLoading] = useState(false);
  const [botError, setBotError] = useState('');

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

  const handleConnectBot = async () => {
    if (!botToken.trim()) {
      setBotError('Введите токен бота');
      return;
    }
    setBotLoading(true);
    setBotError('');
    try {
      const updated = await tenantApi.connectTelegramBot(botToken.trim());
      setTenant(updated);
      setBotToken('');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setBotError(msg ?? 'Не удалось подключить бота. Проверьте токен.');
    } finally {
      setBotLoading(false);
    }
  };

  const handleDisconnectBot = async () => {
    if (!window.confirm('Отключить Telegram-бота?')) return;
    setBotLoading(true);
    setBotError('');
    try {
      const updated = await tenantApi.disconnectTelegramBot();
      setTenant(updated);
    } catch {
      setBotError('Ошибка отключения бота');
    } finally {
      setBotLoading(false);
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
                      Используется в боте (<code>SOLDO_TENANT_SLUG</code>) и виджете (<code>data-tenant</code>)
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

          {/* ── Telegram Bot ── */}
          <Card className="mt-4">
            <Card.Header className="d-flex align-items-center gap-2">
              <BsTelegram className="text-primary" />
              <strong>Telegram Бот</strong>
              {tenant?.telegramBotEnabled && (
                <Badge bg="success" className="ms-auto fw-normal">
                  <BsCheckCircle className="me-1" />Подключён
                </Badge>
              )}
            </Card.Header>
            <Card.Body>
              {botError && (
                <Alert variant="danger" dismissible onClose={() => setBotError('')}>
                  {botError}
                </Alert>
              )}

              {tenant?.telegramBotEnabled ? (
                <>
                  <p className="text-muted mb-3">
                    Бот <strong>@{tenant.telegramBotUsername}</strong> подключён.
                    Клиенты могут писать ему в Telegram, чтобы посмотреть события и
                    оставить бронирование.
                  </p>
                  <div className="d-flex gap-2">
                    {tenant.telegramBotUsername && (
                      <a
                        href={`https://t.me/${tenant.telegramBotUsername}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary"
                      >
                        <BsTelegram className="me-2" />
                        Открыть бота
                      </a>
                    )}
                    <Button
                      variant="outline-danger"
                      onClick={handleDisconnectBot}
                      disabled={botLoading}
                    >
                      {botLoading
                        ? <><Spinner size="sm" className="me-2" />Отключение...</>
                        : 'Отключить'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted mb-3">
                    Подключите Telegram-бота, чтобы ваши клиенты могли записываться
                    прямо из Telegram — без установки приложений и регистрации на сайте.
                  </p>

                  <Row className="g-3">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Bot Token (от @BotFather)</Form.Label>
                        <Form.Control
                          type="password"
                          value={botToken}
                          onChange={e => setBotToken(e.target.value)}
                          placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                          disabled={botLoading}
                          autoComplete="off"
                        />
                        <Form.Text className="text-muted">
                          Создайте бота через @BotFather в Telegram и вставьте токен сюда.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                      <Button
                        variant="primary"
                        onClick={handleConnectBot}
                        disabled={botLoading || !botToken.trim()}
                        className="w-100"
                      >
                        {botLoading
                          ? <><Spinner size="sm" className="me-2" />Подключение...</>
                          : <><BsTelegram className="me-2" />Подключить</>}
                      </Button>
                    </Col>
                  </Row>

                  <Alert variant="info" className="mt-3 mb-0 py-2">
                    <small>
                      <strong>Как это работает:</strong> создайте бота через @BotFather,
                      вставьте сюда полученный токен. Мы автоматически зарегистрируем webhook,
                      и бот сразу начнёт отвечать. Доступные команды: <code>/start</code>,
                      <code>/book</code>, <code>/mybookings</code>, <code>/help</code>.
                    </small>
                  </Alert>
                  <Alert variant="warning" className="mt-2 mb-0 py-2">
                    <small>
                      <strong>Требование Telegram:</strong> приложение должно быть доступно
                      по публичному HTTPS-адресу. Для локальной разработки используйте
                      ngrok/Cloudflare Tunnel и задайте переменную окружения{' '}
                      <code>APP_PUBLIC_URL=https://ваш-адрес</code> перед запуском бэкенда.
                    </small>
                  </Alert>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
