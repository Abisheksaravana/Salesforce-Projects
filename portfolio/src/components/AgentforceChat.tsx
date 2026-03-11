import { useState, useCallback } from 'react';

function SFCloud({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 46 30" fill="currentColor">
      <path d="M37.5 11.8c.1-.5.2-1 .2-1.5C37.7 6 34.2 2.5 30 2.5c-1.6 0-3 .5-4.2 1.3C24.4 2 22.3 1 20 1
               c-4.2 0-7.6 3.1-8.1 7.1C10 8.2 8 8.5 6.4 9.5 4.6 10.7 3.5 12.7 3.5 15c0 3.6 2.9 6.5 6.5 6.5H36
               c3.6 0 6.5-2.9 6.5-6.5 0-2.5-1.4-4.7-3.5-5.8-.5.2-.9.4-1.5.6z" />
    </svg>
  );
}

export default function AgentforceChat() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

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

        {/* Coming soon */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#00A1E0]/10 border border-[#00A1E0]/30 flex items-center justify-center">
            <SFCloud className="w-9 h-6 text-[#00A1E0]" />
          </div>
          <div>
            <p className="text-white font-semibold text-base mb-1">Chat is Coming Soon</p>
            <p className="text-white/50 text-sm leading-relaxed">
              The Agentforce AI assistant is currently being set up.<br />
              Please await — it will be ready shortly!
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#00A1E0]/60 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A1E0]/60 animate-pulse" />
            <span>Agentforce integration in progress</span>
          </div>
        </div>

        {/* Disabled input */}
        <div className="px-3 py-3 border-t border-white/10 bg-white/3">
          <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2 opacity-40 cursor-not-allowed">
            <input
              type="text"
              placeholder="Chat coming soon..."
              disabled
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none cursor-not-allowed"
            />
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M12 7L2 2l2 5-2 5 10-5z" fill="white" />
              </svg>
            </div>
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
            ? 'bg-white/10 border border-white/20 hover:bg-white/15'
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
