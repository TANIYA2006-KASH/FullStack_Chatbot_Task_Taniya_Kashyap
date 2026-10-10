import { useEffect, useRef } from 'react';
import { Mail, Phone, Trash2, X } from 'lucide-react';
import type { Enquiry, Status } from '../types';
import { STATUSES } from '../types';
import StatusBadge from './StatusBadge';
import { formatDateTime } from '../lib/format';

interface Props {
  enquiry: Enquiry;
  onClose: () => void;
  onStatus: (status: Status) => void;
  onDelete: () => void;
}

export default function EnquiryDrawer({ enquiry: e, onClose, onStatus, onDelete }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (ev: KeyboardEvent) => ev.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay drawer-overlay" onMouseDown={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Enquiry from ${e.name}`} onMouseDown={(ev) => ev.stopPropagation()}>
        <header className="drawer-head">
          <div>
            <h3>{e.name}</h3>
            <span className="muted">Enquiry #{e.id} · {formatDateTime(e.createdAt)}</span>
          </div>
          <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close details"><X size={20} /></button>
        </header>

        <div className="drawer-body">
          <div className="drawer-row"><StatusBadge status={e.status} /> <span className="pill">{e.userType}</span> <span className="pill">via {e.source}</span></div>

          <div className="quick-actions">
            <a className="btn btn-outline" href={`mailto:${e.email}`}><Mail size={16} /> Email</a>
            <a className="btn btn-outline" href={`tel:${e.phone.replace(/[^\d+]/g, '')}`}><Phone size={16} /> Call</a>
          </div>

          <dl className="details">
            <div><dt>Email</dt><dd>{e.email}</dd></div>
            <div><dt>Phone</dt><dd>{e.phone}</dd></div>
            <div><dt>Interested in</dt><dd>{e.interest}</dd></div>
            <div><dt>Message</dt><dd className="msg">{e.message}</dd></div>
            <div><dt>Last updated</dt><dd>{formatDateTime(e.updatedAt)}</dd></div>
          </dl>

          <div className="field">
            <span className="label-like">Change status</span>
            <div className="status-steps">
              {STATUSES.map((s) => (
                <button key={s} className={`step ${e.status === s ? 'active' : ''}`} onClick={() => e.status !== s && onStatus(s)} aria-pressed={e.status === s}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="drawer-foot">
          <button className="btn btn-danger-outline" onClick={onDelete}><Trash2 size={16} /> Delete enquiry</button>
        </footer>
      </aside>
    </div>
  );
}
