import { useEffect, useRef, useState } from 'react';
import { Bot, RotateCcw, Send, X } from 'lucide-react';
import { getReply, WELCOME_CHIPS } from '../chatbot/engine';
import { advance, startLead, STEP_HINT } from '../chatbot/leadFlow';
import type { Flow, FlowResult, Reply } from '../chatbot/leadFlow';
import { ApiError, createEnquiry } from '../lib/api';

interface Msg extends Reply {
  id: number;
  role: 'user' | 'bot';
  time: string;
}
interface Saved {
  msgs: Msg[];
  flow: Flow | null;
  nextId: number;
}

const KEY = 'dtv-chat-v1';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WELCOME: Reply = {
  text: "Hi, I'm the DroneTV assistant 👋\nAsk me about our services and training, or tap a question below. I can also take your enquiry.",
  chips: WELCOME_CHIPS,
};

function freshState(): Saved {
  return { msgs: [{ id: 1, role: 'bot', time: clock(), ...WELCOME }], flow: null, nextId: 2 };
}

// Conversation history lives in sessionStorage: it survives a refresh but ends with the tab.
function load(): Saved {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Saved;
      if (Array.isArray(parsed.msgs) && parsed.msgs.length) return parsed;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return freshState();
}

async function respond(text: string, flow: Flow | null): Promise<FlowResult> {
  if (flow) {
    const out = advance(flow, text);
    if (out.submit) {
      try {
        await createEnquiry(out.submit);
        return {
          flow: null,
          replies: [
            { text: `Thank you, ${out.submit.name.split(' ')[0]}! ✅ Your enquiry is saved and our team will contact you soon.`, tone: 'success', chips: ['What courses / training are available?', 'What services does DroneTV provide?'] },
          ],
        };
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Something went wrong. Please try again.';
        return { flow, replies: [{ text: `I could not send your enquiry. ${msg}`, tone: 'error', chips: ['Submit enquiry', 'Cancel'] }] };
      }
    }
    return out;
  }

  const reply = getReply(text);
  if (reply.action === 'start-lead') {
    const lead = startLead({ userType: reply.userType, message: reply.presetMessage });
    return { flow: lead.flow, replies: [{ text: reply.text }, ...lead.replies] };
  }
  return { flow: null, replies: [{ text: reply.text, chips: reply.chips }] };
}

export default function ChatBot({ onClose }: { onClose?: () => void }) {
  const [saved] = useState(load);
  const [msgs, setMsgs] = useState<Msg[]>(saved.msgs);
  const [flow, setFlow] = useState<Flow | null>(saved.flow);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');

  const idRef = useRef(saved.nextId);
  const flowRef = useRef<Flow | null>(saved.flow);
  const busy = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ msgs, flow, nextId: idRef.current } satisfies Saved));
    } catch {
      /* storage full or unavailable */
    }
  }, [msgs, flow]);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    endRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' });
  }, [msgs, typing]);

  const push = (role: Msg['role'], reply: Reply) => {
    const id = idRef.current++;
    setMsgs((m) => [...m, { id, role, time: clock(), ...reply }]);
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy.current) return;
    busy.current = true;
    setInput('');
    push('user', { text });
    setTyping(true);
    try {
      const out = await respond(text.slice(0, 2000), flowRef.current);
      flowRef.current = out.flow;
      setFlow(out.flow);
      for (const r of out.replies) {
        await sleep(450);
        push('bot', r);
      }
    } finally {
      setTyping(false);
      busy.current = false;
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    const s = freshState();
    idRef.current = s.nextId;
    flowRef.current = null;
    setFlow(null);
    setMsgs(s.msgs);
    setInput('');
  };

  const last = msgs[msgs.length - 1];
  const showChips = !typing && last?.role === 'bot' && last.chips?.length;
  const hint = flow ? STEP_HINT[flow.step] : { placeholder: 'Type your question…', inputMode: 'text' as const };

  return (
    <section className="chat" aria-label="DroneTV assistant chat">
      <header className="chat-head">
        <span className="bot-avatar" aria-hidden="true">
          <Bot size={20} />
        </span>
        <div className="chat-title">
          <strong>DroneTV Assistant</strong>
          <span>
            <i className="dot" /> Online · replies instantly
          </span>
        </div>
        <button className="icon-btn" onClick={reset} aria-label="Clear conversation" title="Clear conversation">
          <RotateCcw size={18} />
        </button>
        {onClose && (
          <button className="icon-btn" onClick={onClose} aria-label="Close chat">
            <X size={20} />
          </button>
        )}
      </header>

      <div className="chat-body" role="log" aria-live="polite">
        {msgs.map((m) => (
          <div key={m.id} className={`bubble-row ${m.role}`}>
            <div className={`bubble ${m.role} ${m.tone ? `tone-${m.tone}` : ''}`}>
              <p>{m.text}</p>
              <time>{m.time}</time>
            </div>
          </div>
        ))}
        {typing && (
          <div className="bubble-row bot" aria-label="Assistant is typing">
            <div className="bubble bot typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        {showChips ? (
          <div className="chips">
            {last.chips!.map((c) => (
              <button key={c} className="chip" onClick={() => send(c)}>
                {c}
              </button>
            ))}
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="chat-text" className="sr-only">
          Your message
        </label>
        <input
          id="chat-text"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={hint.placeholder}
          inputMode={hint.inputMode}
          maxLength={2000}
          autoComplete="off"
        />
        <button type="submit" className="send" disabled={!input.trim() || typing} aria-label="Send message">
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}
