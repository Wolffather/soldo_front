import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { schedulerSettingsApi } from '../api/schedulerSettingsApi';
import type { SchedulerSettingsDTO } from '../api/schedulerSettingsApi';

function cronToTime(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 3) return '10:00';
  const hours = parts[2].padStart(2, '0');
  const minutes = parts[1].padStart(2, '0');
  return `${hours}:${minutes}`;
}

function timeToCron(time: string): string {
  const [h, m] = time.split(':');
  return `0 ${parseInt(m)} ${parseInt(h)} * * *`;
}

interface FormState {
  eventTime: string;
  eventDaysBefore: number;
  paymentTime: string;
  paymentDaysBefore: number;
}

export default function NotificationSettings() {
  const [form, setForm] = useState<FormState>({
    eventTime: '10:00',
    eventDaysBefore: 1,
    paymentTime: '09:00',
    paymentDaysBefore: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const res = await schedulerSettingsApi.get();
      const s = res.data;
      setForm({
        eventTime: cronToTime(s.eventReminderCron),
        eventDaysBefore: s.eventReminderDaysBefore,
        paymentTime: cronToTime(s.paymentReminderCron),
        paymentDaysBefore: s.paymentReminderDaysBefore,
      });
    } catch {
      setError('Не удалось загрузить настройки');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      const dto: SchedulerSettingsDTO = {
        eventReminderCron: timeToCron(form.eventTime),
        paymentReminderCron: timeToCron(form.paymentTime),
        eventReminderDaysBefore: form.eventDaysBefore,
        paymentReminderDaysBefore: form.paymentDaysBefore,
      };
      await schedulerSettingsApi.update(dto);
      setSuccess(true);
    } catch {
      setError('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <h4 className="mb-1">Настройки уведомлений</h4>
      <p className="text-muted mb-4">Управление временем и расписанием автоматических рассылок</p>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
          Настройки сохранены. Изменения вступят в силу с следующей рассылки.
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Card className="mb-3">
          <Card.Header className="fw-semibold">📅 Напоминание о событии</Card.Header>
          <Card.Body>
            <p className="text-muted small mb-3">
              Участникам с подтверждённым бронированием отправляется уведомление о предстоящем событии.
            </p>
            <Row className="g-3 align-items-end">
              <Col xs="auto">
                <Form.Label>Время отправки</Form.Label>
                <Form.Control
                  type="time"
                  value={form.eventTime}
                  onChange={e => setForm(f => ({ ...f, eventTime: e.target.value }))}
                  style={{ width: 140 }}
                />
              </Col>
              <Col xs="auto">
                <Form.Label>За сколько дней до события</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="number"
                    min={1}
                    max={30}
                    value={form.eventDaysBefore}
                    onChange={e => setForm(f => ({ ...f, eventDaysBefore: Math.max(1, parseInt(e.target.value) || 1) }))}
                    style={{ width: 90 }}
                  />
                  <span className="text-muted">дн.</span>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="fw-semibold">💰 Напоминание об оплате</Card.Header>
          <Card.Body>
            <p className="text-muted small mb-3">
              Пользователям с неоплаченными бронированиями отправляется напоминание, если до дедлайна осталось не больше указанного числа дней.
            </p>
            <Row className="g-3 align-items-end">
              <Col xs="auto">
                <Form.Label>Время отправки</Form.Label>
                <Form.Control
                  type="time"
                  value={form.paymentTime}
                  onChange={e => setForm(f => ({ ...f, paymentTime: e.target.value }))}
                  style={{ width: 140 }}
                />
              </Col>
              <Col xs="auto">
                <Form.Label>Если до дедлайна осталось</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="number"
                    min={1}
                    max={30}
                    value={form.paymentDaysBefore}
                    onChange={e => setForm(f => ({ ...f, paymentDaysBefore: Math.max(1, parseInt(e.target.value) || 1) }))}
                    style={{ width: 90 }}
                  />
                  <span className="text-muted">дн. или меньше</span>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? <><Spinner size="sm" className="me-2" />Сохранение...</> : 'Сохранить настройки'}
        </Button>
      </Form>
    </div>
  );
}
