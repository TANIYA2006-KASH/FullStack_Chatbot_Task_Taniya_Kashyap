import { Clock, ListChecks, ShieldCheck } from 'lucide-react';
import ChatBot from '../components/ChatBot';

export default function ChatPage() {
  return (
    <main className="container chat-page">
      <aside className="chat-side">
        <h1>Ask the DroneTV assistant</h1>
        <p>Get quick answers about services, courses and registration. If you want a quote or a callback, the assistant collects your details and sends them to our team.</p>
        <ul>
          <li><ListChecks size={18} /> Tap a suggested question or type your own</li>
          <li><Clock size={18} /> Your conversation stays while this tab is open</li>
          <li><ShieldCheck size={18} /> Your details are checked and stored securely</li>
        </ul>
      </aside>
      <ChatBot />
    </main>
  );
}
