import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../site.css';

export interface TeamSocial {
  label: string;
  href: string;
}

export interface TeamMemberFull {
  name: string;
  role: string;
  initials: string;
  bio: string[];
  quote?: string;
  facts?: string[];
  socials?: TeamSocial[];
}

interface Props {
  members: TeamMemberFull[];
  initialIndex: number;
  onClose: () => void;
}

export default function TeamModal({ members, initialIndex, onClose }: Props) {
  const [idx, setIdx] = useState(initialIndex);
  const member = members[idx];

  const prev = () => setIdx(i => (i - 1 + members.length) % members.length);
  const next = () => setIdx(i => (i + 1) % members.length);

  // keyboard navigation (functional updates — no stale closure)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + members.length) % members.length);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % members.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [members.length, onClose]);

  // lock body scroll while open
  useEffect(() => {
    const saved = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = saved; };
  }, []);

  return createPortal(
    <div className="tm-overlay" onClick={onClose}>
      <div className="tm-box" onClick={e => e.stopPropagation()}>

        {/* top bar */}
        <div className="tm-topbar">
          <span className="tm-counter">{idx + 1} / {members.length}</span>
          <button className="tm-close" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        {/* scrollable content — key triggers re-animation on each navigation */}
        <div key={idx} className="tm-content">
          <div className="tm-profile">
            <div className="tm-avatar">{member.initials}</div>
            <div>
              <h2 className="tm-name">{member.name}</h2>
              <p className="tm-role">{member.role}</p>
            </div>
          </div>

          <div className="tm-divider" />

          <div className="tm-bio">
            {member.bio.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {member.quote && (
            <blockquote className="tm-quote">«{member.quote}»</blockquote>
          )}

          {member.facts && member.facts.length > 0 && (
            <div className="tm-facts">
              <p className="tm-facts-label">Коротко</p>
              <ul>
                {member.facts.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          {member.socials && member.socials.length > 0 && (
            <div className="tm-socials">
              {member.socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tm-social-link"
                >
                  {s.label} →
                </a>
              ))}
            </div>
          )}
        </div>

        {/* navigation footer */}
        <div className="tm-nav">
          <button className="tm-nav-btn" onClick={prev} aria-label="Предыдущий">←</button>
          <div className="tm-dots">
            {members.map((_, i) => (
              <button
                key={i}
                className={`tm-dot${i === idx ? ' active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={members[i].name}
              />
            ))}
          </div>
          <button className="tm-nav-btn" onClick={next} aria-label="Следующий">→</button>
        </div>

      </div>
    </div>,
    document.body
  );
}
