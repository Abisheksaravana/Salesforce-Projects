import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  ts: number;
}

// ─── Salesforce Cloud Icon ────────────────────────────────────────────────────

function SFCloud({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 46 30" fill="currentColor">
      <path d="M37.5 11.8c.1-.5.2-1 .2-1.5C37.7 6 34.2 2.5 30 2.5c-1.6 0-3 .5-4.2 1.3C24.4 2 22.3 1 20 1
               c-4.2 0-7.6 3.1-8.1 7.1C10 8.2 8 8.5 6.4 9.5 4.6 10.7 3.5 12.7 3.5 15c0 3.6 2.9 6.5 6.5 6.5H36
               c3.6 0 6.5-2.9 6.5-6.5 0-2.5-1.4-4.7-3.5-5.8-.5.2-.9.4-1.5.6z" />
    </svg>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#00A1E0]/60 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ─── Individual message bubble ────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#00A1E0]/20 border border-[#00A1E0]/40 flex items-center justify-center">
          <SFCloud className="w-4 h-3 text-[#00A1E0]" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#00A1E0] text-white rounded-tr-sm'
            : 'bg-white/8 border border-white/10 text-white/90 rounded-tl-sm'
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

// ─── Main chat widget ─────────────────────────────────────────────────────────

export default function AgentforceChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // ── API call helper ──────────────────────────────────────────────────────────
  const callAgentforce = useCallback(async (body: Record<string, string>) => {
    const res = await fetch('/.netlify/functions/agentforce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Agentforce error');
    return data;
  }, []);

  // ── Start session when chat first opens ─────────────────────────────────────
  const startSession = useCallback(async () => {
    setStarting(true);
    setError(null);
    try {
      const { sessionId: sid } = await callAgentforce({ action: 'createSession' });
      setSessionId(sid);
      setMessages([
        {
          id: 'welcome',
          role: 'agent',
          text: "Hi! I'm Abishek's Agentforce assistant. Ask me anything about his skills, projects, or experience!",
          ts: Date.now(),
        },
      ]);
    } catch {
      setError('Could not connect to Agentforce. Please try again.');
    } finally {
      setStarting(false);
    }
  }, [callAgentforce]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    if (!sessionId) startSession();
  }, [sessionId, startSession]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  // ── Send a message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !sessionId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const { reply } = await callAgentforce({
        action: 'sendMessage',
        sessionId,
        message: text,
      });

      const agentMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'agent',
        text: reply,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to get a response.');
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId, callAgentforce]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Chat panel ─────────────────────────────────────────────────────── */}
      <div
        className={`
          fixed bottom-24 right-6 z-50
          w-[360px] max-w-[calc(100vw-2rem)]
          flex flex-col
          rounded-2xl overflow-hidden
          border border-white/10
          shadow-2xl shadow-black/50
          transition-all duration-300 ease-out
          ${open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
        style={{ height: '480px', background: 'rgba(5, 10, 25, 0.92)', backdropFilter: 'blur(20px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#00A1E0]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00A1E0]/20 border border-[#00A1E0]/50 flex items-center justify-center">
              <SFCloud className="w-5 h-3.5 text-[#00A1E0]" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Agentforce</p>
              <p className="text-[#00A1E0] text-xs mt-0.5">Powered by Salesforce AI</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/40 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/5"
            aria-label="Close chat"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
          {starting && (
            <div className="flex items-center justify-center h-full text-white/40 text-sm">
              <span className="animate-pulse">Connecting to Agentforce...</span>
            </div>
          )}

          {!starting && messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {loading && (
            <div className="flex gap-2 flex-row">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#00A1E0]/20 border border-[#00A1E0]/40 flex items-center justify-center">
                <SFCloud className="w-4 h-3 text-[#00A1E0]" />
              </div>
              <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm">
                <TypingDots />
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-3 py-3 border-t border-white/10 bg-white/3">
          <div className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-3 py-2 focus-within:border-[#00A1E0]/50 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Abishek's experience..."
              disabled={loading || starting || !sessionId}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none disabled:opacity-40"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading || starting || !sessionId}
              className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#00A1E0] disabled:opacity-30 hover:bg-[#1798C1] transition-colors flex items-center justify-center"
              aria-label="Send"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M12 7L2 2l2 5-2 5 10-5z" fill="white" />
              </svg>
            </button>
          </div>
          <p className="text-white/20 text-[10px] text-center mt-2">
            Agentforce · Salesforce AI
          </p>
        </div>
      </div>

      {/* ── Floating toggle button ──────────────────────────────────────────── */}
      <button
        onClick={open ? handleClose : handleOpen}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          flex items-center justify-center
          shadow-lg shadow-[#00A1E0]/30
          transition-all duration-300
          ${open
            ? 'bg-white/10 border border-white/20 rotate-0 hover:bg-white/15'
            : 'bg-[#00A1E0] hover:bg-[#1798C1] hover:-translate-y-1 hover:shadow-[#00A1E0]/50'}
        `}
        aria-label={open ? 'Close Agentforce chat' : 'Open Agentforce chat'}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M14 4L4 14M4 4l10 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <SFCloud className="w-7 h-5 text-white" />
        )}
      </button>
    </>
  );
}
