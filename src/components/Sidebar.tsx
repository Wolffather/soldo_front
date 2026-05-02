import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import {
  BsSpeedometer2,
  BsCalendarEvent,
  BsBookmark,
  BsBoxArrowRight,
  BsTagsFill,
  BsFileEarmarkText,
  BsBell,
  BsCollection,
  BsChevronDown,
  BsChevronUp,
  BsEnvelopeFill,
  BsCodeSlash,
} from 'react-icons/bs';
import { useAuth } from '../auth/AuthContext';
import { appConfigApi } from '../api/tenantApi';

const CATALOG_PATHS = ['/admin/events', '/admin/categories', '/admin/notifications'];

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isCatalogActive = CATALOG_PATHS.some(p => location.pathname.startsWith(p));
  const [catalogOpen, setCatalogOpen] = useState(isCatalogActive);
  const [orgName, setOrgName] = useState<string>('');

  useEffect(() => {
    appConfigApi.get()
      .then(cfg => setOrgName(cfg.name))
      .catch(() => setOrgName(''));
  }, []);

  const headerTitle = orgName ? `${orgName} — Админ` : 'Админ';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const catalogLinks = [
    { to: '/admin/events', icon: <BsCalendarEvent />, label: 'События' },
    { to: '/admin/categories', icon: <BsTagsFill />, label: 'Категории' },
    { to: '/admin/notifications', icon: <BsBell />, label: 'Уведомления' },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link text-white d-flex align-items-center gap-2 rounded mb-1 ${isActive ? 'bg-primary' : 'hover-bg-secondary'}`;

  return (
    <div
      className="d-flex flex-column bg-dark text-white p-3"
      style={{ width: '240px', minHeight: '100vh' }}
    >
      <h5 className="text-center mb-4">
        {headerTitle}
      </h5>

      <Nav className="flex-column flex-grow-1">
        <Nav.Item>
          <NavLink to="/admin" end className={navLinkClass}>
            <BsSpeedometer2 />
            Дашборд
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <NavLink to="/admin/bookings" className={navLinkClass}>
            <BsBookmark />
            Бронирования
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <NavLink to="/admin/inquiries" className={navLinkClass}>
            <BsEnvelopeFill />
            Обратная связь
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <NavLink to="/admin/documents" className={navLinkClass}>
            <BsFileEarmarkText />
            Документы
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <button
            onClick={() => setCatalogOpen(o => !o)}
            className={`nav-link text-white d-flex align-items-center gap-2 rounded mb-1 w-100 border-0 bg-transparent ${
              isCatalogActive && !catalogOpen ? 'bg-primary' : ''
            }`}
            style={{ cursor: 'pointer', textAlign: 'left' }}
          >
            <BsCollection />
            <span className="flex-grow-1">Контент</span>
            {catalogOpen ? <BsChevronUp size={12} /> : <BsChevronDown size={12} />}
          </button>

          {catalogOpen && (
            <div className="ms-3 border-start border-secondary ps-2 mb-1">
              {catalogLinks.map(link => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}
        </Nav.Item>

        <Nav.Item>
          <NavLink to="/admin/widget" className={navLinkClass}>
            <BsCodeSlash />
            Виджет
          </NavLink>
        </Nav.Item>
      </Nav>

      <Nav.Item className="mt-auto">
        <Nav.Link
          onClick={handleLogout}
          className="text-white d-flex align-items-center gap-2"
          role="button"
        >
          <BsBoxArrowRight />
          Выйти
        </Nav.Link>
      </Nav.Item>
    </div>
  );
}
