import { useAuth } from '../auth/AuthContext';

export default function Header() {
  const { role } = useAuth();

  return (
    <header className="bg-white border-bottom px-4 py-2 d-flex justify-content-between align-items-center">
      <h5 className="mb-0">Панель управления</h5>
      <span className="badge bg-primary">{role}</span>
    </header>
  );
}