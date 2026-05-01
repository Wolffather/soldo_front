import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { onboardingApi } from '../api/onboardingApi';
import { STORAGE_KEYS } from '../constants/storageKeys';

type SlugStatus = null | 'checking' | 'available' | 'taken';

export default function RegisterPage() {
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [slugStatus, setSlugStatus] = useState<SlugStatus>(null);
  const [suggestedSlug, setSuggestedSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const orgDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();

  const handleOrgNameChange = useCallback((value: string) => {
    setOrgName(value);
    if (orgDebounceRef.current) clearTimeout(orgDebounceRef.current);
    if (!value.trim()) return;
    orgDebounceRef.current = setTimeout(async () => {
      try {
        const res = await onboardingApi.generateSlug(value);
        setSlug(res.slug);
        // Also check availability of generated slug
        setSlugStatus('checking');
        const check = await onboardingApi.checkSlug(res.slug);
        setSlugStatus(check.available ? 'available' : 'taken');
        if (!check.available) setSuggestedSlug(check.suggested);
      } catch {
        // ignore
      }
    }, 400);
  }, []);

  const handleSlugChange = useCallback((value: string) => {
    setSlug(value);
    setSlugStatus(null);
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    if (!value.trim()) return;
    setSlugStatus('checking');
    slugDebounceRef.current = setTimeout(async () => {
      try {
        const res = await onboardingApi.checkSlug(value);
        setSlugStatus(res.available ? 'available' : 'taken');
        if (!res.available) setSuggestedSlug(res.suggested);
      } catch {
        setSlugStatus(null);
      }
    }, 500);
  }, []);

  const isSubmitDisabled =
    loading ||
    !orgName.trim() ||
    !slug.trim() ||
    !adminName.trim() ||
    !email.trim() ||
    !password.trim() ||
    slugStatus !== 'available';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await onboardingApi.register({
        orgName,
        slug,
        adminName,
        email,
        password,
        businessType: 'OTHER',
      });
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, `Bearer ${res.token}`);
      navigate('/onboarding');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr?.response?.data?.message || 'Ошибка регистрации. Попробуйте ещё раз.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSlugStatus = () => {
    if (!slug) return null;
    switch (slugStatus) {
      case 'checking':
        return (
          <Form.Text style={{ color: '#6c757d' }}>
            <Spinner size="sm" style={{ width: '12px', height: '12px', marginRight: 4 }} />
            Проверяем…
          </Form.Text>
        );
      case 'available':
        return (
          <Form.Text style={{ color: '#198754' }}>
            Свободен ✓
          </Form.Text>
        );
      case 'taken':
        return (
          <Form.Text style={{ color: '#dc3545' }}>
            Занят.{' '}
            {suggestedSlug && (
              <>
                Попробуйте:{' '}
                <span
                  style={{ cursor: 'pointer', textDecoration: 'underline', color: '#2d6a9f' }}
                  onClick={() => {
                    setSlug(suggestedSlug);
                    handleSlugChange(suggestedSlug);
                  }}
                >
                  {suggestedSlug}
                </span>
              </>
            )}
          </Form.Text>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '40px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="text-center mb-4">
          <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '4px' }}>Soldo</h2>
          <p style={{ color: '#6c757d', margin: 0 }}>Создайте аккаунт</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Название организации</Form.Label>
            <Form.Control
              type="text"
              value={orgName}
              onChange={(e) => handleOrgNameChange(e.target.value)}
              required
              autoFocus
              placeholder="Лагерь «Берёзка»"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Slug</Form.Label>
            <Form.Control
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              style={{ fontFamily: 'monospace' }}
              placeholder="my-org"
            />
            <Form.Text style={{ color: '#6c757d', display: 'block' }}>
              Только a-z, 0-9 и дефис
            </Form.Text>
            {renderSlugStatus()}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ваше имя</Form.Label>
            <Form.Control
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
              placeholder="Иван Иванов"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Минимум 6 символов"
            />
            <Form.Text style={{ color: '#6c757d' }}>Минимум 6 символов</Form.Text>
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={isSubmitDisabled}
          >
            {loading ? <Spinner size="sm" /> : 'Создать аккаунт'}
          </Button>
        </Form>

        <div className="text-center mt-3">
          <small style={{ color: '#6b7280' }}>
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{ color: '#2d6a9f', textDecoration: 'none' }}>
              Войти →
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
