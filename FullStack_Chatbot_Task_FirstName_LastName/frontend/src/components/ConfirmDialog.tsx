import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  title: string;
  body: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, body, confirmLabel, busy, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="overlay" onMouseDown={onCancel}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-body" onMouseDown={(e) => e.stopPropagation()}>
        <h3 id="dlg-title">{title}</h3>
        <p id="dlg-body">{body}</p>
        <div className="dialog-actions">
          <button ref={cancelRef} className="btn btn-outline" onClick={onCancel} disabled={busy}>Keep it</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 size={16} className="spin" /> : null} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
