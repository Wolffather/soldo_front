import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Alert,
  Spinner,
  Form,
  ProgressBar,
} from 'react-bootstrap';
import client from '../api/client';
import { categoryApi } from '../api/categoryApi';
import { eventApi } from '../api/eventApi';
import type { BusinessType } from '../api/onboardingApi';

// ── Terminology map ────────────────────────────────────────────────────────

interface TerminologyLabels {
  eventLabel: string;
  participantLabel: string;
  bookingLabel: string;
}

const TERMINOLOGY: Record<BusinessType, TerminologyLabels> = {
  CAMP: {
    eventLabel: 'Смена',
    participantLabel: 'Участник',
    bookingLabel: 'Запись',
  },
  STUDIO: {
    eventLabel: 'Занятие',
    participantLabel: 'Клиент',
    bookingLabel: 'Запись',
  },
  SCHOOL: {
    eventLabel: 'Занятие',
    participantLabel: 'Студент',
    bookingLabel: 'Запись',
  },
  CLINIC: {
    eventLabel: 'Приём',
    participantLabel: 'Пациент',
    bookingLabel: 'Запись',
  },
  TOUR: {
    eventLabel: 'Тур',
    participantLabel: 'Гость',
    bookingLabel: 'Бронирование',
  },
  OTHER: {
    eventLabel: 'Событие',
    participantLabel: 'Участник',
    bookingLabel: 'Бронирование',
  },
};

// ── Business type cards ────────────────────────────────────────────────────

interface BizCard {
  type: BusinessType;
  icon: string;
  title: string;
  hint: string;
}

const BIZ_CARDS: BizCard[] = [
  { type: 'CAMP',   icon: '🏕️', title: 'Лагерь',        hint: 'Смены, участники'  },
  { type: 'STUDIO', icon: '🎨', title: 'Студия/Секция',  hint: 'Занятия, клиенты' },
  { type: 'SCHOOL', icon: '📚', title: 'Школа',          hint: 'Курсы, студенты'  },
  { type: 'CLINIC', icon: '🏥', title: 'Клиника',        hint: 'Приёмы, пациенты' },
  { type: 'TOUR',   icon: '✈️', title: 'Туры',           hint: 'Туры, гости'      },
  { type: 'OTHER',  icon: '⚙️', title: 'Другое',         hint: 'Настроить позже'  },
];

// ── Helper: copy to clipboard with 2 s feedback ───────────────────────────

function useCopy(): [string | null, (key: string, text: string) => void] {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  return [copied, copy];
}

// ── Step indicators ────────────────────────────────────────────────────────

const STEPS = ['Тип бизнеса', 'Идентификаторы', 'Первое событие'];

function StepsBar({ current }: { current: number }) {
  const pct = Math.round(((current + 1) / STEPS.length) * 100);
  return (
    <div className="mb-4">
      <ProgressBar now={pct} style={{ height: 6 }} className="mb-3" />
      <div className="d-flex justify-content-between">
        {STEPS.map((label, i) => (
          <span
            key={label}
            style={{
              fontSize: '0.8rem',
              fontWeight: i === current ? 700 : 400,
              color: i === current ? '#2d6a9f' : i < current ? '#198754' : '#adb5bd',
            }}
          >
            {i < current ? '✓ ' : `${i + 1}. `}{label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Step 1 — Business type
// ══════════════════════════════════════════════════════════════════════════════

interface Step1Props {
  onNext: (type: BusinessType) => void;
}

function Step1({ onNext }: Step1Props) {
  const [selected, setSelected] = useState<BusinessType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await client.put('/admin/tenant/config', TERMINOLOGY[selected]);
      onNext(selected);
    } catch {
      setError('Не удалось сохранить тип бизнеса. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const labels = selected ? TERMINOLOGY[selected] : null;

  return (
    <div>
      <h5 className="mb-1" style={{ fontWeight: 700, color: '#1e3a5f' }}>
        Настройте под ваш бизнес
      </h5>
      <p style={{ color: '#6c757d', fontSize: '0.9rem' }} className="mb-4">
        Выберите тип — мы подберём подходящую терминологию в панели
      </p>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row g-3 mb-3">
        {BIZ_CARDS.map((card) => {
          const isActive = selected === card.type;
          return (
            <div key={card.type} className="col-md-4 col-6">
              <div
                onClick={() => setSelected(card.type)}
                style={{
                  border: `2px solid ${isActive ? '#2d6a9f' : '#dee2e6'}`,
                  borderRadius: 10,
                  padding: '16px 12px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(45,106,159,0.08)' : '#fff',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                  userSelect: 'none',
                }}
              >
                <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{card.icon}</div>
                <div style={{ fontWeight: 600, marginTop: 6, fontSize: '0.9rem' }}>
                  {card.title}
                </div>
                <div style={{ color: '#6c757d', fontSize: '0.75rem', marginTop: 2 }}>
                  {card.hint}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {labels && (
        <div
          className="mb-4 p-3"
          style={{
            background: '#f0f7ff',
            borderRadius: 8,
            fontSize: '0.82rem',
            color: '#495057',
          }}
        >
          <strong>После настройки в панели:</strong>
          <br />
          Событие → «{labels.eventLabel}» · Участник → «
          {labels.participantLabel}» · Бронирование → «{labels.bookingLabel}»
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleNext}
        disabled={!selected || saving}
        className="w-100"
      >
        {saving ? <Spinner size="sm" /> : 'Далее →'}
      </Button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Step 2 — Identifiers
// ══════════════════════════════════════════════════════════════════════════════

interface Step2Props {
  onNext: () => void;
}

function Step2({ onNext }: Step2Props) {
  const [slug, setSlug] = useState<string | null>(null);
  const [loadingSlug, setLoadingSlug] = useState(true);
  const [copied, copy] = useCopy();

  // Fetch slug on mount
  useEffect(() => {
    client
      .get('/admin/tenant')
      .then((r) => setSlug(r.data.slug))
      .catch(() => setSlug('your-org'))
      .finally(() => setLoadingSlug(false));
  }, []);

  const orgSlug = slug ?? 'your-org';

  const widgetContent = `<div id="soldo-widget"></div>
<script src="https://ваш-домен/widget.js"
  data-tenant="${orgSlug}">
</script>`;

  return (
    <div>
      <h5 className="mb-1" style={{ fontWeight: 700, color: '#1e3a5f' }}>
        Ваши идентификаторы
      </h5>
      <p style={{ color: '#6c757d', fontSize: '0.9rem' }} className="mb-4">
        Используйте эти данные при настройке виджета
      </p>

      {loadingSlug ? (
        <div className="text-center mb-4">
          <Spinner size="sm" /> Загружаем данные…
        </div>
      ) : (
        <>
          {/* Card 1 — Slug */}
          <div
            className="mb-3 p-3"
            style={{ border: '1px solid #dee2e6', borderRadius: 8 }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
              Slug организации
            </div>
            <div className="d-flex align-items-center gap-2">
              <code
                style={{
                  flex: 1,
                  background: '#f8f9fa',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #dee2e6',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                }}
              >
                {orgSlug}
              </code>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => copy('slug', orgSlug)}
                style={{ minWidth: 40 }}
              >
                {copied === 'slug' ? '✓' : '📋'}
              </Button>
            </div>
            <small style={{ color: '#6c757d' }}>
              Постоянный идентификатор. Используйте в виджете.
            </small>
          </div>

          {/* Card 2 — Widget */}
          <div
            className="mb-4 p-3"
            style={{ border: '1px solid #dee2e6', borderRadius: 8 }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
              {'</>'} Виджет для сайта
            </div>
            <div style={{ position: 'relative' }}>
              <pre
                style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: 6,
                  border: '1px solid #dee2e6',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {widgetContent}
              </pre>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => copy('widget', widgetContent)}
                style={{ position: 'absolute', bottom: 8, right: 8, minWidth: 40 }}
              >
                {copied === 'widget' ? '✓' : '📋'}
              </Button>
            </div>
          </div>
        </>
      )}

      <Button variant="primary" onClick={onNext} className="w-100">
        Далее →
      </Button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Step 3 — First event
// ══════════════════════════════════════════════════════════════════════════════

interface Step3Props {
  onSkip: () => void;
}

function Step3({ onSkip }: Step3Props) {
  const [categoryName, setCategoryName] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // 1. Create category
      const category = await categoryApi.create({
        name: categoryName,
        format: 'DEFAULT',
      });

      // 2. Create event using categoryId via title/description approach
      await eventApi.create({
        title: eventTitle,
        description: '',
        categoryName: category.name,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        price: price,
      });

      navigate('/admin');
    } catch {
      setError('Не удалось создать событие. Вы можете пропустить этот шаг.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h5 className="mb-1" style={{ fontWeight: 700, color: '#1e3a5f' }}>
        Создайте первое событие
      </h5>
      <p style={{ color: '#6c757d', fontSize: '0.9rem' }} className="mb-4">
        Необязательно — можно добавить позже в разделе «События»
      </p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Название категории</Form.Label>
          <Form.Control
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Основное направление"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Название события</Form.Label>
          <Form.Control
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Первая смена 2026"
            required
          />
        </Form.Group>

        <div className="row">
          <div className="col">
            <Form.Group className="mb-3">
              <Form.Label>Дата начала</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </div>
          <div className="col">
            <Form.Group className="mb-3">
              <Form.Label>Дата окончания</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </div>
        </div>

        <Form.Group className="mb-4">
          <Form.Label>Цена</Form.Label>
          <Form.Control
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="0 = бесплатно"
          />
          <Form.Text style={{ color: '#6c757d' }}>0 = бесплатно</Form.Text>
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="w-100 mb-2"
          disabled={saving || !categoryName.trim() || !eventTitle.trim()}
        >
          {saving ? <Spinner size="sm" /> : 'Создать и открыть панель'}
        </Button>

        <Button
          type="button"
          variant="outline-secondary"
          className="w-100"
          onClick={onSkip}
          disabled={saving}
        >
          Пропустить
        </Button>
      </Form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main OnboardingPage
// ══════════════════════════════════════════════════════════════════════════════

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '40px',
          width: '100%',
          maxWidth: '680px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="text-center mb-4">
          <h4 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>Soldo</h4>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>
            Быстрая настройка
          </p>
        </div>

        <StepsBar current={step} />

        {step === 0 && (
          <Step1 onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <Step2 onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step3 onSkip={() => navigate('/admin')} />
        )}
      </div>
    </div>
  );
}
