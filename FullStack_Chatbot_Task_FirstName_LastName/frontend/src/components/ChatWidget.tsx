import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatBot from './ChatBot';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = () => {
    setOpen((o) => !o);
    setEverOpened(true);
  };

  return (
    <>
      {everOpened && (
        <div className={`widget-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
          <ChatBot onClose={() => setOpen(false)} />
        </div>
      )}
      {!open && (
        <button className="widget-fab" onClick={toggle} aria-label="Open chat assistant">
          <MessageCircle size={24} />
          <span>Ask us</span>
        </button>
      )}
    </>
  );
}
