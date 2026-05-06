import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import {
  BsSpeedometer2,
  BsCalendarEvent,
  BsBookmark,
  BsCodeSlash,
} from 'react-icons/bs';

export default function Sidebar() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link text-white d-flex align-items-center gap-2 rounded mb-1 ${isActive ? 'bg-primary' : 'hover-bg-secondary'}`;

  return (
    <div
      className="d-flex flex-column bg-dark text-white p-3"
      style={{ width: '240px', minHeight: '100vh' }}
    >
      <h5 className="text-center mb-4">Сольдо</h5>

      <Nav className="flex-column flex-grow-1">
        <Nav.Item>
          <NavLink to="/admin" end className={navLinkClass}>
            <BsSpeedometer2 />
            Дашборд
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <NavLink to="/admin/events" className={navLinkClass}>
            <BsCalendarEvent />
            События
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <NavLink to="/admin/bookings" className={navLinkClass}>
            <BsBookmark />
            Бронирования
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <NavLink to="/admin/widget" className={navLinkClass}>
            <BsCodeSlash />
            Виджет
          </NavLink>
        </Nav.Item>
      </Nav>
    </div>
  );
}
