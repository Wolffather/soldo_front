import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../site.css';

const NAV_LINKS = [
  { to: '/about',    label: 'О нас'    },
  { to: '/team',     label: 'Команда'  },
  { to: '/reviews',  label: 'Отзывы'   },
  { to: '/contacts', label: 'Контакты' },
];

const CABINET_LINK = { to: '/cabinet', label: 'Кабинет' };

export default function SiteHeader() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="sol-site-header">
        <Link to="/" className="sol-site-header__logo" onClick={closeMenu}>
          <img src="/logo.png" alt="СОЛЬ" className="sol-site-header__logo-img" />
        </Link>

        {/* Desktop navigation */}
        <nav className="sol-site-header__nav">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`sol-site-header__link${pathname === to ? ' active' : ''}`}
            >
              {label}
            </Link>
          ))}
          <Link
            to={CABINET_LINK.to}
            className={`sol-site-header__link sol-site-header__link--cabinet${pathname.startsWith('/cabinet') ? ' active' : ''}`}
          >
            {CABINET_LINK.label}
          </Link>
        </nav>

        {/* Burger button — visible only on mobile */}
        <button
          className={`sol-site-header__burger${menuOpen ? ' sol-site-header__burger--open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Mobile fullscreen menu overlay */}
      {menuOpen && (
        <div className="sol-site-menu-overlay" onClick={closeMenu}>
          <nav className="sol-site-menu" onClick={(e) => e.stopPropagation()}>
            <Link
              to="/"
              className={pathname === '/' ? 'active' : undefined}
              onClick={closeMenu}
            >
              Главная
            </Link>
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={pathname === to ? 'active' : undefined}
                onClick={closeMenu}
              >
                {label}
              </Link>
            ))}
            <Link
              to={CABINET_LINK.to}
              className={`sol-site-menu__cabinet${pathname.startsWith('/cabinet') ? ' active' : ''}`}
              onClick={closeMenu}
            >
              {CABINET_LINK.label}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
